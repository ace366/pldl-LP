<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class LpSetting extends Model
{
    protected $fillable = [
        'key',
        'value',
        'type',
        'group',
        'label',
        'sort_order',
    ];

    protected const CACHE_KEY = 'lp_settings.all';

    public static function getValue(string $key, mixed $default = null): mixed
    {
        $all = static::allCached();

        if (!array_key_exists($key, $all)) {
            return $default;
        }

        return $all[$key]['value'] ?? $default;
    }

    public static function setValue(string $key, mixed $value): void
    {
        $row = static::firstOrNew(['key' => $key]);
        $row->value = is_bool($value) ? ($value ? '1' : '0') : (string) $value;
        $row->save();

        static::flushCache();
    }

    public static function allForAdmin(): \Illuminate\Support\Collection
    {
        return static::query()
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();
    }

    public static function allCached(): array
    {
        return Cache::remember(static::CACHE_KEY, 600, function () {
            return static::query()
                ->get()
                ->keyBy('key')
                ->map(fn ($row) => [
                    'value' => $row->value,
                    'type'  => $row->type,
                    'label' => $row->label,
                ])
                ->toArray();
        });
    }

    public static function flushCache(): void
    {
        Cache::forget(static::CACHE_KEY);
    }

    protected static function booted(): void
    {
        static::saved(fn () => static::flushCache());
        static::deleted(fn () => static::flushCache());
    }

    public function isBool(): bool
    {
        return $this->type === 'bool';
    }

    public function boolValue(): bool
    {
        return $this->value === '1' || $this->value === 1 || $this->value === true;
    }
}
