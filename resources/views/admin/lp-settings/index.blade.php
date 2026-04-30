@extends('admin.layout', ['title' => 'LP設定'])

@section('extra-style')
    .admin-group {
        background: #fff;
        border: 1px solid var(--c-border);
        border-radius: 14px;
        padding: 20px;
        margin-bottom: 16px;
        box-shadow: 0 1px 2px rgba(15,23,42,.04);
    }
    .admin-group__title {
        margin: 0 0 14px;
        font-size: 15px;
        font-weight: 800;
        color: var(--c-primary-strong);
    }
    .admin-row {
        display: grid;
        grid-template-columns: 1fr;
        gap: 6px;
        margin-bottom: 14px;
    }
    .admin-row:last-child { margin-bottom: 0; }
    .admin-row__label {
        font-size: 13px;
        font-weight: 700;
        color: var(--c-fg);
    }
    .admin-row__hint {
        font-size: 11px;
        color: var(--c-muted);
    }
    .admin-row input[type="text"],
    .admin-row input[type="email"],
    .admin-row input[type="url"],
    .admin-row textarea {
        width: 100%;
        padding: 10px 12px;
        font: inherit;
        border: 1px solid var(--c-border);
        border-radius: 8px;
        background: #fff;
    }
    .admin-row input:focus, .admin-row textarea:focus {
        outline: none;
        border-color: var(--c-primary);
        box-shadow: 0 0 0 3px var(--c-primary-soft);
    }
    .admin-row textarea { min-height: 80px; resize: vertical; }
    .admin-row__check {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 8px 0;
    }
    .admin-row__check input { width: 18px; height: 18px; }

    .admin-actions {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        margin-top: 8px;
    }
@endsection

@section('content')
    @php
        $groupLabels = [
            'notification' => '通知',
            'cta'          => 'CTA / 外部リンク',
            'analytics'    => 'アクセス解析',
            'fv'           => 'ファーストビュー',
            'campaign'     => 'キャンペーン表示',
            'reception'    => '受付状況',
            'seo'          => 'SEO / 検索エンジン',
            'legal'        => '法務 / プライバシーポリシー',
        ];
        $groups = $settings->groupBy(fn ($s) => $s->group ?: 'other');
    @endphp

    <h1 class="admin-title">LP設定</h1>
    <p class="admin-lead">LP表示・通知・キャンペーン文言などの裏側設定を変更できます。</p>

    <form method="POST" action="{{ route('admin.lp-settings.update') }}">
        @csrf
        @method('PUT')

        @foreach($groups as $groupKey => $items)
            <section class="admin-group">
                <h2 class="admin-group__title">{{ $groupLabels[$groupKey] ?? $groupKey }}</h2>

                @foreach($items as $row)
                    <div class="admin-row">
                        <label class="admin-row__label" for="settings_{{ $row->key }}">
                            {{ $row->label ?? $row->key }}
                        </label>

                        @if($row->type === 'bool')
                            <label class="admin-row__check">
                                <input type="hidden" name="settings[{{ $row->key }}]" value="0">
                                <input
                                    type="checkbox"
                                    id="settings_{{ $row->key }}"
                                    name="settings[{{ $row->key }}]"
                                    value="1"
                                    @checked($row->value === '1')>
                                <span>ON にする</span>
                            </label>
                        @elseif($row->type === 'textarea')
                            <textarea
                                id="settings_{{ $row->key }}"
                                name="settings[{{ $row->key }}]"
                                rows="3">{{ old("settings.$row->key", $row->value) }}</textarea>
                        @elseif($row->type === 'email')
                            <input
                                type="email"
                                id="settings_{{ $row->key }}"
                                name="settings[{{ $row->key }}]"
                                value="{{ old("settings.$row->key", $row->value) }}"
                                autocomplete="off">
                        @elseif($row->type === 'url')
                            <input
                                type="url"
                                id="settings_{{ $row->key }}"
                                name="settings[{{ $row->key }}]"
                                value="{{ old("settings.$row->key", $row->value) }}"
                                autocomplete="off">
                        @else
                            <input
                                type="text"
                                id="settings_{{ $row->key }}"
                                name="settings[{{ $row->key }}]"
                                value="{{ old("settings.$row->key", $row->value) }}"
                                autocomplete="off">
                        @endif

                        <span class="admin-row__hint">key: {{ $row->key }}</span>
                    </div>
                @endforeach
            </section>
        @endforeach

        <div class="admin-actions">
            <a class="admin-btn admin-btn--ghost" href="{{ route('gakudo-lp.index') }}" target="_blank" rel="noopener">プレビュー</a>
            <button type="submit" class="admin-btn admin-btn--primary">保存する</button>
        </div>
    </form>
@endsection
