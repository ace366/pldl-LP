<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\BulkImportSalesRequest;
use App\Http\Requests\Admin\StoreSalesEntryRequest;
use App\Http\Requests\Admin\UpdateSalesEntryRequest;
use App\Models\SalesEntry;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SalesEntriesController extends Controller
{
    /**
     * 営業ツール本体（HTML 画面）。
     */
    public function showApp()
    {
        return view('admin.sales.index');
    }

    /**
     * GET /api/admin/sales — 一覧。
     * 並びは「未送信を上に」「次回対応日が近い順」「更新が新しい順」。
     */
    public function index(): JsonResponse
    {
        $items = SalesEntry::query()
            ->orderByRaw("CASE WHEN status IS NULL OR status = '未送信' THEN 0 ELSE 1 END")
            ->orderByRaw('CASE WHEN next_action_at IS NULL THEN 1 ELSE 0 END')
            ->orderBy('next_action_at', 'asc')
            ->orderBy('updated_at', 'desc')
            ->get()
            ->map(fn (SalesEntry $e) => $e->toApi())
            ->all();

        return response()->json(['items' => $items]);
    }

    /**
     * POST /api/admin/sales — 1件作成。
     */
    public function store(StoreSalesEntryRequest $request): JsonResponse
    {
        $data = SalesEntry::normalizeInput($request->validated());

        $entry = SalesEntry::create($data);

        return response()->json(['item' => $entry->toApi()], 201);
    }

    /**
     * PUT /api/admin/sales/{salesEntry} — 1件更新。
     */
    public function update(UpdateSalesEntryRequest $request, SalesEntry $salesEntry): JsonResponse
    {
        $data = SalesEntry::normalizeInput($request->validated());

        $salesEntry->update($data);

        return response()->json(['item' => $salesEntry->fresh()->toApi()]);
    }

    /**
     * DELETE /api/admin/sales/{salesEntry} — soft delete。
     */
    public function destroy(SalesEntry $salesEntry): JsonResponse
    {
        $salesEntry->delete();

        return response()->json(['deleted' => true]);
    }

    /**
     * POST /api/admin/sales/bulk-import
     *   body: { mode: "overwrite"|"append", items: [...] }
     *
     * - overwrite: 既存全件 soft-delete してから挿入（取り込みデータ内の重複は中で dedupe）。
     * - append:    既存と「施設名+住所」一致のものは取り込みエラー。1件でも被ったら全体 422 で件数報告。
     */
    public function bulkImport(BulkImportSalesRequest $request): JsonResponse
    {
        $payload = $request->validated();
        $mode = $payload['mode'];
        $rawItems = $payload['items'];

        // 取り込みデータ内の重複（同 facility+address）も拒否対象とする。
        $seenInPayload = [];
        $payloadDuplicates = [];
        foreach ($rawItems as $idx => $row) {
            $key = SalesEntry::dedupKey($row['facility'] ?? '', $row['address'] ?? '');
            if (isset($seenInPayload[$key])) {
                $payloadDuplicates[] = [
                    'index'    => $idx,
                    'facility' => $row['facility'] ?? '',
                    'address'  => $row['address'] ?? '',
                    'reason'   => 'CSV/JSON 内の重複',
                ];
            } else {
                $seenInPayload[$key] = $idx;
            }
        }

        if ($mode === 'append') {
            // 既存と被るかチェック
            $existingKeys = SalesEntry::query()
                ->select(['facility', 'address'])
                ->get()
                ->mapWithKeys(fn ($e) => [SalesEntry::dedupKey($e->facility, $e->address) => true])
                ->all();

            $serverDuplicates = [];
            foreach ($rawItems as $idx => $row) {
                $key = SalesEntry::dedupKey($row['facility'] ?? '', $row['address'] ?? '');
                if (isset($existingKeys[$key])) {
                    $serverDuplicates[] = [
                        'index'    => $idx,
                        'facility' => $row['facility'] ?? '',
                        'address'  => $row['address'] ?? '',
                        'reason'   => '既存データと重複（施設名+住所）',
                    ];
                }
            }

            if (! empty($payloadDuplicates) || ! empty($serverDuplicates)) {
                return response()->json([
                    'message'             => '重複が見つかったため取り込みを中断しました。',
                    'errors'              => [
                        'payload_duplicates' => $payloadDuplicates,
                        'server_duplicates'  => $serverDuplicates,
                    ],
                    'total'               => count($rawItems),
                    'payload_duplicates_count' => count($payloadDuplicates),
                    'server_duplicates_count'  => count($serverDuplicates),
                ], 422);
            }
        } elseif ($mode === 'overwrite') {
            // overwrite モードでも payload 内重複は拒否（誤った CSV を防ぐ）
            if (! empty($payloadDuplicates)) {
                return response()->json([
                    'message' => '取り込みデータ内に重複があります。',
                    'errors'  => [
                        'payload_duplicates' => $payloadDuplicates,
                    ],
                    'total'                    => count($rawItems),
                    'payload_duplicates_count' => count($payloadDuplicates),
                ], 422);
            }
        }

        // ここまで来たら検証 OK。挿入実行。
        DB::transaction(function () use ($mode, $rawItems) {
            if ($mode === 'overwrite') {
                SalesEntry::query()->delete();
            }

            foreach ($rawItems as $row) {
                $data = SalesEntry::normalizeInput($row);
                // 不正な date_format で来た場合に備えて軽くサニタイズ（空文字は normalize で null 化済み）
                SalesEntry::create($data);
            }
        });

        return response()->json([
            'imported' => count($rawItems),
            'mode'     => $mode,
        ], 201);
    }

    /**
     * GET /admin/api/sales/dm-letters.pdf
     * status="DM対応" 全件をまとめた連結 PDF を返す（1件1ページ A4縦）。
     */
    public function dmLetters()
    {
        $entries = SalesEntry::query()
            ->whereNull('deleted_at')
            ->where('status', 'DM対応')
            ->orderBy('id')
            ->get();

        if ($entries->isEmpty()) {
            return response()->json(['message' => 'DM対応の施設がありません。'], 404);
        }

        $tempDir = storage_path('app/mpdf');
        if (! is_dir($tempDir)) {
            mkdir($tempDir, 0775, true);
        }

        $mpdf = new \Mpdf\Mpdf([
            'mode'          => 'ja',
            'format'        => 'A4',
            'margin_top'    => 22,
            'margin_bottom' => 18,
            'margin_left'   => 22,
            'margin_right'  => 22,
            'tempDir'       => $tempDir,
            'default_font'  => 'sun-exta',
        ]);
        $mpdf->SetTitle('Gakudoor DM 案内文');
        $mpdf->SetCreator('Gakudoor Sales Tool');

        $today = now()->format('Y年n月j日');

        foreach ($entries as $i => $entry) {
            if ($i > 0) {
                $mpdf->AddPage();
            }
            $html = view('admin.sales.pdf.dm-letter', [
                'entry' => $entry,
                'today' => $today,
            ])->render();
            $mpdf->WriteHTML($html);
        }

        $stamp = now()->format('Ymd_His');
        $filename = "dm-letters-{$stamp}.pdf";

        return response($mpdf->Output($filename, \Mpdf\Output\Destination::STRING_RETURN), 200, [
            'Content-Type'        => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ]);
    }

    /**
     * GET /admin/api/sales/labels.pdf
     * status="DM対応" 全件のラベルシート (A-One 28379 互換 / A4×12面) を PDF 化。
     */
    public function labels()
    {
        $entries = SalesEntry::query()
            ->whereNull('deleted_at')
            ->where('status', 'DM対応')
            ->orderBy('id')
            ->get();

        if ($entries->isEmpty()) {
            return response()->json(['message' => 'DM対応の施設がありません。'], 404);
        }

        $tempDir = storage_path('app/mpdf');
        if (! is_dir($tempDir)) {
            mkdir($tempDir, 0775, true);
        }

        // ラベルシートは @page { margin: 0 } を Blade 側で出すので mpdf 側余白は 0 にする
        $mpdf = new \Mpdf\Mpdf([
            'mode'          => 'ja',
            'format'        => 'A4',
            'margin_top'    => 0,
            'margin_bottom' => 0,
            'margin_left'   => 0,
            'margin_right'  => 0,
            'tempDir'       => $tempDir,
            'default_font'  => 'sun-exta',
        ]);
        $mpdf->SetTitle('Gakudoor DM ラベルシート');
        $mpdf->SetCreator('Gakudoor Sales Tool');

        $html = view('admin.sales.pdf.labels', [
            'entries' => $entries,
        ])->render();
        $mpdf->WriteHTML($html);

        $stamp = now()->format('Ymd_His');
        $filename = "labels-{$stamp}.pdf";

        return response($mpdf->Output($filename, \Mpdf\Output\Destination::STRING_RETURN), 200, [
            'Content-Type'        => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ]);
    }

    /**
     * GET /admin/api/sales/export.json
     */
    public function exportJson()
    {
        $items = SalesEntry::query()
            ->orderBy('id')
            ->get()
            ->map(fn (SalesEntry $e) => $e->toApi())
            ->all();

        $stamp = now()->format('Y-m-d');

        return response()->json($items)
            ->header('Content-Disposition', 'attachment; filename="pldl-sales-list-' . $stamp . '.json"');
    }

    /**
     * GET /api/admin/sales/export.csv
     */
    public function exportCsv()
    {
        $cols = [
            ['facility', '施設名'],
            ['prefecture', '都道府県'],
            ['city', '市区町村'],
            ['address', '住所'],
            ['phone', '電話番号'],
            ['email', 'メールアドレス'],
            ['website_url', 'Webサイト'],
            ['contact_form_url', '問い合わせフォーム'],
            ['gmap_url', 'GoogleマップURL'],
            ['type', '種別'],
            ['priority', '優先度'],
            ['status', 'ステータス'],
            ['first_sent_at', '初回送信日'],
            ['next_action_at', '次回対応日'],
            ['memo', 'メモ'],
        ];

        $escape = function ($v) {
            $s = (string) ($v ?? '');
            if (preg_match('/[",\r\n]/', $s)) {
                $s = '"' . str_replace('"', '""', $s) . '"';
            }
            return $s;
        };

        $lines = [];
        $lines[] = implode(',', array_map(fn ($c) => $escape($c[1]), $cols));

        SalesEntry::query()
            ->orderBy('id')
            ->get()
            ->each(function (SalesEntry $e) use (&$lines, $cols, $escape) {
                $row = array_map(function ($c) use ($e, $escape) {
                    $val = $e->getAttribute($c[0]);
                    if ($val instanceof \DateTimeInterface) {
                        $val = $val->format('Y-m-d');
                    }
                    return $escape($val);
                }, $cols);
                $lines[] = implode(',', $row);
            });

        // BOM 付き UTF-8（Excel 互換）
        $body = "\xEF\xBB\xBF" . implode("\r\n", $lines);
        $stamp = now()->format('Y-m-d');

        return response($body, 200, [
            'Content-Type'        => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="pldl-sales-list-' . $stamp . '.csv"',
        ]);
    }
}
