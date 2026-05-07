{{--
    Label sheet — A4 12面 (2 cols x 6 rows), 86.4mm x 42.3mm per label.
    A-One 28379 互換。
    変数: $entries (App\Models\SalesEntry コレクション)
    ページ余白: 上下 21.5mm / 左右 18.6mm
--}}
<style>
    @page {
        size: A4 portrait;
        margin: 0;
    }
    body {
        font-family: sun-exta, sans-serif;
        margin: 0;
        padding: 0;
    }
    .sheet {
        position: relative;
        width: 210mm;
        height: 297mm;
        padding: 21.6mm 18.6mm 21.6mm 18.6mm;
        box-sizing: border-box;
        page-break-after: always;
    }
    .sheet:last-child {
        page-break-after: auto;
    }
    table.labels {
        width: 100%;
        border-collapse: collapse;
        table-layout: fixed;
    }
    table.labels td {
        width: 86.4mm;
        height: 42.3mm;
        padding: 4mm 4mm 3mm 4mm;
        vertical-align: top;
        font-size: 10pt;
        line-height: 1.45;
        overflow: hidden;
        word-break: break-all;
    }
    .lbl-postal {
        font-size: 9.5pt;
        color: #475569;
        margin-bottom: 1.5mm;
    }
    .lbl-address {
        font-size: 9.5pt;
        color: #1f2937;
        margin-bottom: 2.5mm;
        line-height: 1.4;
    }
    .lbl-facility {
        font-size: 11pt;
        font-weight: bold;
        line-height: 1.35;
    }
    .lbl-honorific {
        font-size: 10pt;
        font-weight: normal;
        margin-left: 0.5em;
    }
    .lbl-empty {
        background: #ffffff;
    }
</style>

@php
    $perPage = 12;
    $pages = $entries->chunk($perPage)->values();
@endphp

@foreach($pages as $pageEntries)
<div class="sheet">
    <table class="labels">
        @for($row = 0; $row < 6; $row++)
            <tr>
                @for($col = 0; $col < 2; $col++)
                    @php
                        $idx = $row * 2 + $col;
                        $e = $pageEntries[$idx] ?? null;
                    @endphp
                    @if($e)
                        <td>
                            @php
                                // 「〒xxx-xxxx」を住所先頭から抽出してラベル先頭に置く（あれば）
                                $address = (string) ($e->address ?? '');
                                $postal = '';
                                if (preg_match('/^(〒\d{3}[-－]\d{4})\s*(.*)$/u', $address, $m)) {
                                    $postal = $m[1];
                                    $address = trim($m[2]);
                                }
                            @endphp
                            @if($postal)
                                <div class="lbl-postal">{{ $postal }}</div>
                            @endif
                            <div class="lbl-address">{{ $address }}</div>
                            <div class="lbl-facility">
                                {{ $e->facility ?? '' }}<span class="lbl-honorific">御中</span>
                            </div>
                        </td>
                    @else
                        <td class="lbl-empty">&nbsp;</td>
                    @endif
                @endfor
            </tr>
        @endfor
    </table>
</div>
@endforeach
