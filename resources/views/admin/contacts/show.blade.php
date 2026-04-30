@extends('admin.layout', ['title' => '問い合わせ詳細 #'.$contact->id])

@section('extra-style')
    .breadcrumb {
        font-size: 13px;
        margin-bottom: 12px;
    }
    .breadcrumb a { color: var(--c-muted); }
    .breadcrumb__sep { color: var(--c-muted); margin: 0 6px; }

    .layout {
        display: grid;
        grid-template-columns: 1fr;
        gap: 16px;
    }
    @media (min-width: 880px) {
        .layout { grid-template-columns: 2fr 1fr; }
    }

    .field {
        display: grid;
        grid-template-columns: 110px 1fr;
        gap: 12px;
        padding: 8px 0;
        font-size: 14px;
        border-bottom: 1px solid var(--c-border);
    }
    .field:last-child { border-bottom: 0; }
    .field__label {
        font-size: 12px;
        color: var(--c-muted);
        font-weight: 700;
        padding-top: 2px;
    }
    .field__value { word-break: break-word; }
    .field__value pre {
        white-space: pre-wrap;
        word-break: break-word;
        font-family: inherit;
        margin: 0;
    }
    .field__value--mono { font-family: ui-monospace, Menlo, Consolas, monospace; font-size: 12px; color: var(--c-muted); }

    .form-row {
        display: grid;
        gap: 6px;
        margin-bottom: 14px;
    }
    .form-row label {
        font-size: 12px;
        font-weight: 700;
        color: var(--c-fg);
    }
    .form-row select,
    .form-row textarea,
    .form-row input[type="datetime-local"] {
        width: 100%;
        padding: 10px 12px;
        font: inherit;
        border: 1px solid var(--c-border);
        border-radius: 8px;
        background: #fff;
    }
    .form-row textarea { min-height: 100px; resize: vertical; }
    .form-row input:focus, .form-row textarea:focus, .form-row select:focus {
        outline: none;
        border-color: var(--c-primary);
        box-shadow: 0 0 0 3px var(--c-primary-soft);
    }
    .form-actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        margin-top: 4px;
    }
@endsection

@section('content')
    <div class="breadcrumb">
        <a href="{{ route('admin.contacts.index') }}">問い合わせ一覧</a>
        <span class="breadcrumb__sep">›</span>
        <span>#{{ $contact->id }}</span>
    </div>

    <h1 class="admin-title">{{ $contact->facility }}</h1>
    <p class="admin-lead">
        受付日時: {{ $contact->created_at?->format('Y-m-d H:i') }}
        ／ 現在のステータス:
        <span class="pill pill--{{ $contact->status }}">{{ $statusLabels[$contact->status] ?? $contact->status }}</span>
    </p>

    <div class="layout">
        {{-- 左: 受信内容 --}}
        <section class="admin-card">
            <h2 style="margin: 0 0 8px; font-size: 14px; color: var(--c-primary-strong);">受信内容</h2>

            <div class="field">
                <div class="field__label">施設名</div>
                <div class="field__value">{{ $contact->facility }}</div>
            </div>
            <div class="field">
                <div class="field__label">担当者名</div>
                <div class="field__value">{{ $contact->name }}</div>
            </div>
            <div class="field">
                <div class="field__label">メール</div>
                <div class="field__value">
                    <a href="mailto:{{ $contact->email }}">{{ $contact->email }}</a>
                </div>
            </div>
            <div class="field">
                <div class="field__label">電話</div>
                <div class="field__value">{{ $contact->tel ?: '—' }}</div>
            </div>
            <div class="field">
                <div class="field__label">児童数</div>
                <div class="field__value">{{ $contact->children_count !== null ? $contact->children_count.'名' : '—' }}</div>
            </div>
            <div class="field">
                <div class="field__label">希望内容</div>
                <div class="field__value">{{ $purposeMap[$contact->purpose] ?? ($contact->purpose ?: '—') }}</div>
            </div>
            <div class="field">
                <div class="field__label">相談内容</div>
                <div class="field__value">
                    @if($contact->message)
                        <pre>{{ $contact->message }}</pre>
                    @else
                        —
                    @endif
                </div>
            </div>

            <h3 style="margin: 18px 0 4px; font-size: 12px; color: var(--c-muted); font-weight: 700;">流入元 / メタ情報</h3>
            <div class="field">
                <div class="field__label">UTM</div>
                <div class="field__value field__value--mono">
                    {{ trim(($contact->utm_source ?? '').' / '.($contact->utm_medium ?? '').' / '.($contact->utm_campaign ?? ''), ' /') ?: '—' }}
                </div>
            </div>
            <div class="field">
                <div class="field__label">IPアドレス</div>
                <div class="field__value field__value--mono">{{ $contact->ip_address ?: '—' }}</div>
            </div>
            <div class="field">
                <div class="field__label">User Agent</div>
                <div class="field__value field__value--mono">{{ $contact->user_agent ?: '—' }}</div>
            </div>
        </section>

        {{-- 右: ステータス更新 --}}
        <aside>
            <section class="admin-card">
                <h2 style="margin: 0 0 12px; font-size: 14px; color: var(--c-primary-strong);">ステータスとメモ</h2>

                <form method="POST" action="{{ route('admin.contacts.update', $contact) }}">
                    @csrf
                    @method('PUT')

                    <div class="form-row">
                        <label for="f-status">ステータス</label>
                        <select id="f-status" name="status">
                            @foreach($statusLabels as $key => $label)
                                <option value="{{ $key }}" @selected(old('status', $contact->status) === $key)>
                                    {{ $label }}
                                </option>
                            @endforeach
                        </select>
                    </div>

                    <div class="form-row">
                        <label for="f-memo">社内メモ</label>
                        <textarea id="f-memo" name="internal_memo" placeholder="対応履歴・所感など">{{ old('internal_memo', $contact->internal_memo) }}</textarea>
                    </div>

                    @php
                        $fmt = fn ($v) => $v ? \Carbon\Carbon::parse($v)->format('Y-m-d\TH:i') : '';
                    @endphp

                    <div class="form-row">
                        <label for="f-contacted">連絡日時</label>
                        <input type="datetime-local" id="f-contacted" name="contacted_at"
                               value="{{ old('contacted_at', $fmt($contact->contacted_at)) }}">
                    </div>
                    <div class="form-row">
                        <label for="f-demo">デモ予定日時</label>
                        <input type="datetime-local" id="f-demo" name="demo_scheduled_at"
                               value="{{ old('demo_scheduled_at', $fmt($contact->demo_scheduled_at)) }}">
                    </div>
                    <div class="form-row">
                        <label for="f-contracted">契約日時</label>
                        <input type="datetime-local" id="f-contracted" name="contracted_at"
                               value="{{ old('contracted_at', $fmt($contact->contracted_at)) }}">
                    </div>

                    <div class="form-actions">
                        <a class="admin-btn admin-btn--ghost" href="{{ route('admin.contacts.index') }}">一覧に戻る</a>
                        <button type="submit" class="admin-btn admin-btn--primary">保存する</button>
                    </div>
                </form>
            </section>
        </aside>
    </div>
@endsection
