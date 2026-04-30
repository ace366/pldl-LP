@extends('admin.layout', ['title' => '問い合わせ一覧'])

@section('extra-style')
    .filter-bar {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        align-items: center;
        margin-bottom: 16px;
    }
    .filter-bar form {
        display: flex;
        gap: 8px;
        align-items: center;
        flex-wrap: wrap;
    }
    .filter-bar input[type="text"] {
        padding: 8px 12px;
        font: inherit;
        border: 1px solid var(--c-border);
        border-radius: 8px;
        background: #fff;
        min-width: 220px;
    }
    .status-tabs {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin-bottom: 16px;
    }
    .status-tab {
        padding: 6px 14px;
        border-radius: 999px;
        background: #fff;
        border: 1px solid var(--c-border);
        font-size: 13px;
        color: var(--c-muted);
        text-decoration: none;
    }
    .status-tab.is-active {
        background: var(--c-primary-soft);
        color: var(--c-primary-strong);
        border-color: var(--c-primary-soft);
        font-weight: 700;
    }
    .status-tab__count {
        margin-left: 6px;
        font-size: 11px;
        opacity: .8;
    }

    .contacts-table {
        width: 100%;
        border-collapse: collapse;
        background: #fff;
        border: 1px solid var(--c-border);
        border-radius: 14px;
        overflow: hidden;
        font-size: 13px;
    }
    .contacts-table th, .contacts-table td {
        padding: 10px 12px;
        text-align: left;
        border-bottom: 1px solid var(--c-border);
        vertical-align: top;
    }
    .contacts-table thead th {
        background: var(--c-bg);
        font-size: 12px;
        color: var(--c-muted);
        font-weight: 700;
    }
    .contacts-table tbody tr:last-child td { border-bottom: 0; }
    .contacts-table tbody tr:hover { background: var(--c-bg); }
    .contacts-table .col-date { white-space: nowrap; color: var(--c-muted); font-size: 12px; }
    .contacts-table .col-status { white-space: nowrap; }
    .contacts-table .col-actions { text-align: right; white-space: nowrap; }
    .contacts-table .truncate {
        max-width: 220px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .empty {
        text-align: center;
        padding: 40px 20px;
        color: var(--c-muted);
        background: #fff;
        border: 1px dashed var(--c-border);
        border-radius: 14px;
    }

    .pagination {
        margin-top: 16px;
        display: flex;
        justify-content: center;
        gap: 6px;
        flex-wrap: wrap;
    }
    .pagination .page-link, .pagination .page-link span {
        padding: 6px 12px;
        border: 1px solid var(--c-border);
        border-radius: 999px;
        font-size: 13px;
        text-decoration: none;
        color: var(--c-fg);
        background: #fff;
    }
    .pagination .active span {
        background: var(--c-primary);
        color: #fff;
        border-color: var(--c-primary);
        font-weight: 700;
    }
    .pagination .disabled span {
        color: var(--c-muted);
        background: var(--c-bg);
        cursor: default;
    }
@endsection

@section('content')
    <h1 class="admin-title">問い合わせ一覧</h1>
    <p class="admin-lead">LPフォームから受け付けた相談を一覧・絞り込み・編集できます。</p>

    <div class="filter-bar">
        <form method="GET" action="{{ route('admin.contacts.index') }}">
            @if($currentStatus !== '')
                <input type="hidden" name="status" value="{{ $currentStatus }}">
            @endif
            <input type="text" name="q" value="{{ $q }}" placeholder="施設名・担当者名・メール・電話で検索">
            <button type="submit" class="admin-btn admin-btn--primary admin-btn--sm">検索</button>
            @if($q !== '')
                <a class="admin-btn admin-btn--ghost admin-btn--sm"
                   href="{{ route('admin.contacts.index', ['status' => $currentStatus]) }}">クリア</a>
            @endif
        </form>
    </div>

    <div class="status-tabs">
        @php
            $tabs = array_merge(['' => 'すべて'], $statusLabels);
            $countOf = fn($k) => $k === '' ? ($counts['__all__'] ?? 0) : ($counts[$k] ?? 0);
        @endphp
        @foreach($tabs as $key => $label)
            <a class="status-tab {{ $currentStatus === $key ? 'is-active' : '' }}"
               href="{{ route('admin.contacts.index', array_filter(['status' => $key, 'q' => $q ?: null])) }}">
                {{ $label }}<span class="status-tab__count">{{ $countOf($key) }}</span>
            </a>
        @endforeach
    </div>

    @if($contacts->isEmpty())
        <div class="empty">
            該当する問い合わせはありません。
        </div>
    @else
        <table class="contacts-table">
            <thead>
                <tr>
                    <th class="col-date">受付日時</th>
                    <th>施設名</th>
                    <th>担当者</th>
                    <th>メール</th>
                    <th>電話</th>
                    <th class="col-status">ステータス</th>
                    <th class="col-actions"></th>
                </tr>
            </thead>
            <tbody>
                @foreach($contacts as $c)
                    <tr>
                        <td class="col-date">{{ $c->created_at?->format('Y-m-d H:i') }}</td>
                        <td class="truncate" title="{{ $c->facility }}">{{ $c->facility }}</td>
                        <td class="truncate" title="{{ $c->name }}">{{ $c->name }}</td>
                        <td class="truncate" title="{{ $c->email }}">{{ $c->email }}</td>
                        <td>{{ $c->tel ?: '—' }}</td>
                        <td class="col-status">
                            <span class="pill pill--{{ $c->status }}">{{ $statusLabels[$c->status] ?? $c->status }}</span>
                        </td>
                        <td class="col-actions">
                            <a class="admin-btn admin-btn--ghost admin-btn--sm"
                               href="{{ route('admin.contacts.show', $c) }}">詳細</a>
                        </td>
                    </tr>
                @endforeach
            </tbody>
        </table>

        <div class="pagination">
            {{ $contacts->links() }}
        </div>
    @endif
@endsection
