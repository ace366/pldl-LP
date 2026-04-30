<!doctype html>
<html lang="ja">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>LP設定 | 管理画面</title>
    <link href="https://fonts.bunny.net/css?family=noto-sans-jp:400,500,700&display=swap" rel="stylesheet">
    <style>
        :root {
            --c-bg: #f6f9fc;
            --c-fg: #1f2a37;
            --c-muted: #6b7280;
            --c-border: #e5e7eb;
            --c-primary: #1f7a4d;
            --c-primary-strong: #155e3a;
            --c-primary-soft: #e6f4ec;
            --c-error: #b91c1c;
            --c-success: #15803d;
        }
        * { box-sizing: border-box; }
        body {
            margin: 0;
            font-family: 'Noto Sans JP', system-ui, sans-serif;
            background: var(--c-bg);
            color: var(--c-fg);
            line-height: 1.7;
            -webkit-font-smoothing: antialiased;
        }
        .admin-header {
            background: #fff;
            border-bottom: 1px solid var(--c-border);
            padding: 14px 20px;
            display: flex;
            align-items: center;
            gap: 16px;
        }
        .admin-header__brand {
            font-weight: 800;
            font-size: 14px;
            display: flex;
            gap: 10px;
            align-items: center;
            text-decoration: none;
            color: var(--c-fg);
        }
        .admin-header__brand-mark {
            display: inline-flex;
            align-items: center; justify-content: center;
            width: 32px; height: 32px;
            border-radius: 8px;
            background: var(--c-primary);
            color: #fff;
            font-size: 11px;
            letter-spacing: .04em;
        }
        .admin-header__nav { margin-left: auto; display: flex; gap: 8px; align-items: center; }
        .admin-header__nav a, .admin-header__nav button {
            font-size: 13px;
            color: var(--c-muted);
            text-decoration: none;
            background: transparent;
            border: 1px solid var(--c-border);
            padding: 6px 12px;
            border-radius: 999px;
            cursor: pointer;
            font-family: inherit;
        }
        .admin-header__nav a:hover, .admin-header__nav button:hover { background: var(--c-bg); color: var(--c-fg); }

        .admin-main {
            max-width: 880px;
            margin: 0 auto;
            padding: 32px 20px 80px;
        }
        .admin-title {
            margin: 0 0 4px;
            font-size: 22px;
            font-weight: 800;
        }
        .admin-lead {
            margin: 0 0 24px;
            color: var(--c-muted);
            font-size: 13px;
        }

        .admin-flash {
            background: var(--c-primary-soft);
            color: var(--c-success);
            padding: 12px 14px;
            border-radius: 10px;
            font-size: 14px;
            margin-bottom: 16px;
        }
        .admin-error {
            background: #fee2e2;
            color: var(--c-error);
            padding: 12px 14px;
            border-radius: 10px;
            font-size: 14px;
            margin-bottom: 16px;
        }

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
        .admin-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 12px 24px;
            border-radius: 999px;
            font-weight: 700;
            font-size: 14px;
            text-decoration: none;
            border: 1px solid transparent;
            cursor: pointer;
            font-family: inherit;
        }
        .admin-btn--primary { background: var(--c-primary); color: #fff; }
        .admin-btn--primary:hover { background: var(--c-primary-strong); }
        .admin-btn--ghost { background: #fff; color: var(--c-fg); border-color: var(--c-border); }
        .admin-btn--ghost:hover { background: var(--c-bg); }
    </style>
</head>
<body>
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

    <header class="admin-header">
        <a class="admin-header__brand" href="{{ route('admin.lp-settings.index') }}">
            <span class="admin-header__brand-mark">PLDL</span>
            <span>LP管理画面</span>
        </a>
        <nav class="admin-header__nav">
            <a href="{{ route('gakudo-lp.index') }}" target="_blank" rel="noopener">LPを見る</a>
            <form method="POST" action="{{ route('logout') }}">
                @csrf
                <button type="submit">ログアウト</button>
            </form>
        </nav>
    </header>

    <main class="admin-main">
        <h1 class="admin-title">LP設定</h1>
        <p class="admin-lead">LP表示・通知・キャンペーン文言などの裏側設定を変更できます。</p>

        @if(session('status'))
            <div class="admin-flash" role="status">{{ session('status') }}</div>
        @endif

        @if($errors->any())
            <div class="admin-error" role="alert">
                入力内容に問題があります。<br>
                @foreach($errors->all() as $e)
                    ・{{ $e }}<br>
                @endforeach
            </div>
        @endif

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
                                    <input
                                        type="hidden"
                                        name="settings[{{ $row->key }}]"
                                        value="0">
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
    </main>
</body>
</html>
