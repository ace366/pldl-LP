<?php

namespace App\Http\Requests\Admin;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Log;

class StoreSalesEntryRequest extends FormRequest
{
    public function authorize(): bool
    {
        // /admin/* は auth ミドルウェアで保護済み。ここまで来ているなら認証OK。
        return $this->user() !== null;
    }

    /**
     * 一時診断用 (2026-05-07): 検索取り込みで原因不明の 422 が大量発生しているため、
     * 失敗時のフィールド名とサニタイズ済み入力を laravel.log に記録する。
     * メール・電話など PII は伏字 + 長さ表示。原因特定後に削除予定。
     */
    protected function failedValidation(Validator $validator)
    {
        $input = $this->all();
        Log::warning('SalesEntry.store validation failed', [
            'errors'        => $validator->errors()->toArray(),
            'sent_keys'     => array_keys($input),
            'facility'      => mb_substr((string) ($input['facility'] ?? ''), 0, 80),
            'prefecture'    => $input['prefecture'] ?? null,
            'city'          => $input['city'] ?? null,
            'address_len'   => mb_strlen((string) ($input['address'] ?? '')),
            'phone_masked'  => $this->mask((string) ($input['phone'] ?? '')),
            'phone_len'     => mb_strlen((string) ($input['phone'] ?? '')),
            'email_masked'  => $this->mask((string) ($input['email'] ?? '')),
            'website_len'   => mb_strlen((string) ($input['websiteUrl'] ?? '')),
            'contactform_len' => mb_strlen((string) ($input['contactFormUrl'] ?? '')),
            'gmap_len'      => mb_strlen((string) ($input['gmapUrl'] ?? '')),
            'type'          => $input['type'] ?? null,
            'priority'      => $input['priority'] ?? null,
            'status'        => $input['status'] ?? null,
            'memo_len'      => mb_strlen((string) ($input['memo'] ?? '')),
            'has_analysis'  => isset($input['analysis']),
            'first_sent_at' => $input['firstSentAt'] ?? null,
            'next_at'       => $input['nextActionAt'] ?? null,
        ]);

        parent::failedValidation($validator);
    }

    /** 文字列を伏字化（先頭 2 文字 + アスタリスク + 末尾 2 文字 + 長さ）。 */
    private function mask(string $s): string
    {
        if ($s === '') return '';
        $len = mb_strlen($s);
        if ($len <= 4) return str_repeat('*', $len);
        return mb_substr($s, 0, 2) . str_repeat('*', max(1, $len - 4)) . mb_substr($s, -2);
    }

    public function rules(): array
    {
        return [
            'facility'       => ['required', 'string', 'max:100'],
            'prefecture'     => ['nullable', 'string', 'max:20'],
            'city'           => ['nullable', 'string', 'max:50'],
            'address'        => ['nullable', 'string', 'max:200'],
            'phone'          => ['nullable', 'string', 'max:30'],
            'email'          => ['nullable', 'email', 'max:255'],
            // BulkImport と揃えて string のみ。Google Places から渡される URL や旧 localStorage
            // データに `url` validation で落ちるパターン (例: gmapUrl がプロトコル無し) があり、
            // 個別 POST で 422 silent fail → リスト未反映の事象を引き起こしていたため緩和。
            // 表示側は isUrl() で http(s)// を都度チェックしているので保存できても害なし。
            'websiteUrl'     => ['nullable', 'string', 'max:500'],
            'contactFormUrl' => ['nullable', 'string', 'max:500'],
            'gmapUrl'        => ['nullable', 'string', 'max:500'],
            'type'           => ['nullable', 'string', 'max:30'],
            'priority'       => ['nullable', 'in:S,A,B,C'],
            'status'         => ['nullable', 'string', 'max:20'],
            'memo'           => ['nullable', 'string', 'max:2000'],
            'firstSentAt'    => ['nullable', 'date_format:Y-m-d'],
            'nextActionAt'   => ['nullable', 'date_format:Y-m-d'],
            'analysis'       => ['nullable', 'array'],
        ];
    }

    public function messages(): array
    {
        return [
            'facility.required' => '施設名は必須です。',
            'priority.in'       => '優先度は S/A/B/C のいずれかです。',
        ];
    }
}
