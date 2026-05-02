<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GakudoLpContact extends Model
{
    public const STATUS_NEW = 'new';
    public const STATUS_CONTACTED = 'contacted';
    public const STATUS_DEMO = 'demo';
    public const STATUS_CONTRACTED = 'contracted';
    public const STATUS_LOST = 'lost';

    protected $fillable = [
        'facility',
        'name',
        'email',
        'tel',
        'children_count',
        'purpose',
        'plan',
        'message',
        'status',
        'internal_memo',
        'contacted_at',
        'demo_scheduled_at',
        'contracted_at',
        'source',
        'utm_source',
        'utm_medium',
        'utm_campaign',
        'ip_address',
        'user_agent',
    ];

    protected $casts = [
        'children_count' => 'integer',
        'contacted_at' => 'datetime',
        'demo_scheduled_at' => 'datetime',
        'contracted_at' => 'datetime',
    ];

    public static function statusLabels(): array
    {
        return [
            self::STATUS_NEW        => '新規',
            self::STATUS_CONTACTED  => '連絡済み',
            self::STATUS_DEMO       => 'デモ予定/実施',
            self::STATUS_CONTRACTED => '契約',
            self::STATUS_LOST       => '失注',
        ];
    }

    public function statusLabel(): string
    {
        return self::statusLabels()[$this->status] ?? $this->status;
    }

    public static function planLabels(): array
    {
        return [
            'light'      => 'ライト（9,800円 / 月〜）',
            'standard'   => 'スタンダード（29,800円 / 月〜）',
            'enterprise' => '法人・複数施設（49,800円 / 月〜）',
        ];
    }

    public function planLabel(): ?string
    {
        if (!$this->plan) return null;
        return self::planLabels()[$this->plan] ?? $this->plan;
    }
}
