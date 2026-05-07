<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class SalesEntry extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $fillable = [
        'facility',
        'prefecture',
        'city',
        'address',
        'phone',
        'email',
        'website_url',
        'contact_form_url',
        'gmap_url',
        'type',
        'priority',
        'status',
        'memo',
        'first_sent_at',
        'next_action_at',
        'analysis',
    ];

    protected $casts = [
        'first_sent_at'  => 'date:Y-m-d',
        'next_action_at' => 'date:Y-m-d',
        'analysis'       => 'array',
    ];

    /**
     * DB 行 → JS 営業ツールが期待する camelCase 形式の連想配列。
     */
    public function toApi(): array
    {
        return [
            'id'             => (string) $this->id,
            'facility'       => $this->facility ?? '',
            'prefecture'     => $this->prefecture ?? '',
            'city'           => $this->city ?? '',
            'address'        => $this->address ?? '',
            'phone'          => $this->phone ?? '',
            'email'          => $this->email ?? '',
            'websiteUrl'     => $this->website_url ?? '',
            'contactFormUrl' => $this->contact_form_url ?? '',
            'gmapUrl'        => $this->gmap_url ?? '',
            'type'           => $this->type ?? '',
            'priority'       => $this->priority ?? '',
            'status'         => $this->status ?? '',
            'memo'           => $this->memo ?? '',
            'firstSentAt'    => optional($this->first_sent_at)->format('Y-m-d') ?? '',
            'nextActionAt'   => optional($this->next_action_at)->format('Y-m-d') ?? '',
            'analysis'       => $this->analysis,
            'createdAt'      => optional($this->created_at)->toIso8601String(),
            'updatedAt'      => optional($this->updated_at)->toIso8601String(),
        ];
    }

    /**
     * 営業ツール側の camelCase 入力 → DB カラム名への正規化。
     * Controller / FormRequest から validated() を渡される想定。
     * 重複検知のためのキー生成にも同じ正規化結果を使う。
     */
    public static function normalizeInput(array $input): array
    {
        $map = [
            'websiteUrl'     => 'website_url',
            'contactFormUrl' => 'contact_form_url',
            'gmapUrl'        => 'gmap_url',
            'firstSentAt'    => 'first_sent_at',
            'nextActionAt'   => 'next_action_at',
        ];

        $out = [];
        foreach ($input as $k => $v) {
            $col = $map[$k] ?? $k;
            // 空文字は null に揃える（date / nullable カラムが空文字を嫌うため）
            $out[$col] = ($v === '' || $v === null) ? null : $v;
        }

        return $out;
    }

    /**
     * 重複検知用キー（施設名 + 住所、null/空白を吸収）。
     */
    public static function dedupKey(?string $facility, ?string $address): string
    {
        return mb_strtolower(trim((string) $facility))
            . '|'
            . mb_strtolower(trim((string) $address));
    }
}
