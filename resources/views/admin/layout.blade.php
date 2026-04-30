<!doctype html>
<html lang="ja">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>{{ $title ?? '管理画面' }} | PLDL</title>
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
            --c-accent: #b45309;
            --c-error: #b91c1c;
            --c-success: #15803d;
            --c-warning: #b45309;
            --c-info: #2563eb;
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
        a { color: var(--c-info); text-underline-offset: 3px; }

        .admin-header {
            background: #fff;
            border-bottom: 1px solid var(--c-border);
            padding: 14px 20px;
            display: flex;
            align-items: center;
            gap: 16px;
            flex-wrap: wrap;
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
        .admin-header__nav { display: flex; gap: 6px; align-items: center; }
        .admin-header__nav a {
            font-size: 13px;
            color: var(--c-muted);
            text-decoration: none;
            padding: 6px 12px;
            border-radius: 999px;
        }
        .admin-header__nav a:hover { background: var(--c-bg); color: var(--c-fg); }
        .admin-header__nav a.is-active {
            background: var(--c-primary-soft);
            color: var(--c-primary-strong);
            font-weight: 700;
        }
        .admin-header__util { margin-left: auto; display: flex; gap: 8px; align-items: center; }
        .admin-header__util a, .admin-header__util button {
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
        .admin-header__util a:hover, .admin-header__util button:hover { background: var(--c-bg); color: var(--c-fg); }

        .admin-main {
            max-width: 1080px;
            margin: 0 auto;
            padding: 24px 20px 80px;
        }
        .admin-title {
            margin: 0 0 4px;
            font-size: 20px;
            font-weight: 800;
        }
        .admin-lead {
            margin: 0 0 20px;
            color: var(--c-muted);
            font-size: 13px;
        }

        .admin-flash {
            background: var(--c-primary-soft);
            color: var(--c-success);
            padding: 10px 14px;
            border-radius: 10px;
            font-size: 14px;
            margin-bottom: 16px;
        }
        .admin-error {
            background: #fee2e2;
            color: var(--c-error);
            padding: 10px 14px;
            border-radius: 10px;
            font-size: 14px;
            margin-bottom: 16px;
        }

        .admin-card {
            background: #fff;
            border: 1px solid var(--c-border);
            border-radius: 14px;
            padding: 16px 20px;
            margin-bottom: 16px;
            box-shadow: 0 1px 2px rgba(15,23,42,.04);
        }

        .admin-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 10px 18px;
            border-radius: 999px;
            font-weight: 700;
            font-size: 13px;
            text-decoration: none;
            border: 1px solid transparent;
            cursor: pointer;
            font-family: inherit;
            white-space: nowrap;
        }
        .admin-btn--primary { background: var(--c-primary); color: #fff; }
        .admin-btn--primary:hover { background: var(--c-primary-strong); }
        .admin-btn--ghost { background: #fff; color: var(--c-fg); border-color: var(--c-border); }
        .admin-btn--ghost:hover { background: var(--c-bg); }
        .admin-btn--sm { padding: 6px 12px; font-size: 12px; }

        /* Status pill */
        .pill {
            display: inline-flex;
            align-items: center;
            padding: 2px 10px;
            border-radius: 999px;
            font-size: 12px;
            font-weight: 700;
            border: 1px solid transparent;
            white-space: nowrap;
        }
        .pill--new        { background: #dbeafe; color: #1d4ed8; }
        .pill--contacted  { background: #fef9c3; color: #854d0e; }
        .pill--demo       { background: #fde68a; color: #92400e; }
        .pill--contracted { background: #dcfce7; color: #15803d; }
        .pill--lost       { background: #f1f5f9; color: #64748b; }

        @yield('extra-style')
    </style>
</head>
<body>
    @php
        $current = request()->routeIs('admin.contacts.*') ? 'contacts'
                : (request()->routeIs('admin.lp-settings.*') ? 'settings' : '');
    @endphp
    <header class="admin-header">
        <a class="admin-header__brand" href="{{ route('admin.lp-settings.index') }}">
            <span class="admin-header__brand-mark">PLDL</span>
            <span>LP管理画面</span>
        </a>
        <nav class="admin-header__nav">
            <a href="{{ route('admin.contacts.index') }}"
               class="{{ $current === 'contacts' ? 'is-active' : '' }}">問い合わせ一覧</a>
            <a href="{{ route('admin.lp-settings.index') }}"
               class="{{ $current === 'settings' ? 'is-active' : '' }}">LP設定</a>
        </nav>
        <div class="admin-header__util">
            <a href="{{ route('gakudo-lp.index') }}" target="_blank" rel="noopener">LPを見る</a>
            <form method="POST" action="{{ route('logout') }}">
                @csrf
                <button type="submit">ログアウト</button>
            </form>
        </div>
    </header>

    <main class="admin-main">
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

        @yield('content')
    </main>
</body>
</html>
