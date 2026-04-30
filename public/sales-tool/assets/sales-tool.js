/* =====================================================================
   PLDL 営業リスト管理ツール
   - 完全フロントエンド・localStorage 保管・Laravel 本体に依存しない
   ===================================================================== */
(function () {
    'use strict';

    // --------------------------------------------------------------
    // Storage
    // --------------------------------------------------------------
    const STORAGE_KEY = 'pldl_sales_list_v1';

    /** @returns {Array<Item>} */
    function loadAll() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return [];
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            console.warn('localStorage 読み込み失敗', e);
            return [];
        }
    }

    /** @param {Array<Item>} items */
    function saveAll(items) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }

    function uid() {
        return 'i' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    }

    function nowIso() {
        return new Date().toISOString();
    }

    // --------------------------------------------------------------
    // State
    // --------------------------------------------------------------
    /** @type {Array<Item>} */
    let items = loadAll();

    const filters = {
        q: '',
        priority: '',
        status: '',
    };

    const PRIORITIES = ['S', 'A', 'B', 'C'];
    const STATUSES = ['未送信', '送信済み', '返信あり', '商談', '契約', '見送り', '対象外'];

    const SALES_TEMPLATE = [
        '突然のご連絡失礼いたします。',
        '',
        '{{施設名}} ご担当者様',
        '',
        '学童施設様向けに、',
        '欠席連絡・お迎え変更・出席確認・保護者通知をスマホで一元管理できる仕組みをご提供しております。',
        '',
        'NPO法人 Playful Learning Design Lab.（PLDL）は、',
        '教育現場での実運用を通じて見えてきた課題をもとに、',
        '現場に合う学童向け運営支援システムを開発しています。',
        '',
        'もし現在、',
        '朝の電話対応、紙の出席管理、お迎え変更の共有、月末集計などにご負担がありましたら、',
        '3分の紹介動画または15分ほどのオンラインデモでご紹介可能です。',
        '',
        '現在、先着5施設限定で初期費用0円・導入サポート無料でご案内しております。',
        '',
        'ご興味がございましたら、ご返信いただけますと幸いです。',
        'どうぞよろしくお願いいたします。',
    ].join('\n');

    // --------------------------------------------------------------
    // Utilities
    // --------------------------------------------------------------
    function el(id) { return document.getElementById(id); }
    function $$(sel, root) { return Array.from((root || document).querySelectorAll(sel)); }

    function escape(str) {
        return String(str ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function isUrl(str) {
        return /^https?:\/\//i.test((str || '').trim());
    }

    function todayStr() {
        const d = new Date();
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    }

    function diffDays(targetIsoDate) {
        if (!targetIsoDate) return null;
        const t = new Date(targetIsoDate + 'T00:00:00');
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return Math.floor((t.getTime() - today.getTime()) / 86400000);
    }

    function showToast(msg) {
        const t = el('toast');
        t.textContent = msg;
        t.hidden = false;
        t.dataset.show = '1';
        clearTimeout(showToast._timer);
        showToast._timer = setTimeout(() => {
            t.dataset.show = '0';
            setTimeout(() => { t.hidden = true; }, 200);
        }, 2200);
    }

    /**
     * Auto priority suggestion.
     * @param {Item} item
     * @returns {'S'|'A'|'B'|'C'|''}
     */
    function suggestPriority(item) {
        const t = (item.type || '').trim();
        const hasSite = isUrl(item.websiteUrl);
        const hasForm = isUrl(item.contactFormUrl);

        if (t === '民間学童' && hasSite && hasForm) return 'S';
        if (t === '民間学童' && hasSite) return 'A';
        if ((t === 'NPO' || t === '法人運営') && hasSite) return 'A';
        if (t === '公立/自治体系') return 'C';
        if (!hasSite && !hasForm && item.phone) return 'B';
        if (hasSite || hasForm) return 'B';
        return 'C';
    }

    // --------------------------------------------------------------
    // Filtering
    // --------------------------------------------------------------
    function applyFilters() {
        const q = filters.q.trim().toLowerCase();
        return items.filter((it) => {
            if (filters.priority && it.priority !== filters.priority) return false;
            if (filters.status && it.status !== filters.status) return false;
            if (q) {
                const blob = [
                    it.facility, it.prefecture, it.city, it.address,
                    it.phone, it.memo, it.type,
                ].join(' ').toLowerCase();
                if (!blob.includes(q)) return false;
            }
            return true;
        });
    }

    // --------------------------------------------------------------
    // Rendering
    // --------------------------------------------------------------
    function renderKpis() {
        const total = items.length;
        const sCount = items.filter((it) => it.priority === 'S').length;
        const untouched = items.filter((it) => !it.status || it.status === '未送信').length;
        const replied = items.filter((it) => it.status === '返信あり').length;
        const contracted = items.filter((it) => it.status === '契約').length;

        el('kpi-total').textContent = total;
        el('kpi-s').textContent = sCount;
        el('kpi-untouched').textContent = untouched;
        el('kpi-replied').textContent = replied;
        el('kpi-contracted').textContent = contracted;

        const pct = Math.min(100, Math.round((total / 100) * 100));
        el('kpi-progress').style.width = pct + '%';
    }

    function priorityPill(p) {
        const k = p && PRIORITIES.includes(p) ? p : '_';
        const label = p || '—';
        return `<span class="pill pill--prio-${k}">${escape(label)}</span>`;
    }

    function statusPill(s) {
        const safe = s && STATUSES.includes(s) ? s : '未送信';
        return `<span class="pill pill--st-${safe}">${escape(safe)}</span>`;
    }

    function linkIcons(it) {
        const parts = [];
        if (isUrl(it.websiteUrl))     parts.push(`<a class="link-icon" href="${escape(it.websiteUrl)}"     target="_blank" rel="noopener" title="Webサイト">🌐</a>`);
        if (isUrl(it.contactFormUrl)) parts.push(`<a class="link-icon" href="${escape(it.contactFormUrl)}" target="_blank" rel="noopener" title="問い合わせフォーム">✉</a>`);
        if (isUrl(it.gmapUrl))        parts.push(`<a class="link-icon" href="${escape(it.gmapUrl)}"        target="_blank" rel="noopener" title="Googleマップ">📍</a>`);
        if (parts.length === 0) return '<span style="color:var(--c-soft);font-size:11px;">—</span>';
        return `<span class="link-icons">${parts.join('')}</span>`;
    }

    function nextDateCell(iso) {
        if (!iso) return '<span style="color:var(--c-soft);font-size:11px;">—</span>';
        const d = diffDays(iso);
        let cls = 'next-date';
        if (d !== null) {
            if (d < 0) cls += ' next-date--past';
            else if (d <= 3) cls += ' next-date--soon';
        }
        return `<span class="${cls}">${escape(iso)}</span>`;
    }

    function renderTable() {
        const rows = applyFilters();
        const tbody = el('data-tbody');
        tbody.innerHTML = rows.map((it) => `
            <tr>
                <td>${priorityPill(it.priority)}</td>
                <td>${statusPill(it.status)}</td>
                <td>
                    <div class="facility-name">${escape(it.facility || '(無題)')}</div>
                    ${it.address ? `<div class="address-line">${escape(it.address)}</div>` : ''}
                </td>
                <td>${escape([it.prefecture, it.city].filter(Boolean).join(' '))}</td>
                <td>${escape(it.type || '')}</td>
                <td>${linkIcons(it)}</td>
                <td>${nextDateCell(it.nextActionAt)}</td>
                <td class="col-actions">
                    <div class="row-actions">
                        <button class="btn btn--secondary btn--xs" data-action="copy" data-id="${it.id}">営業文</button>
                        <button class="btn btn--ghost-light btn--xs" data-action="edit" data-id="${it.id}">編集</button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    function renderCards() {
        const rows = applyFilters();
        const list = el('card-list');
        list.innerHTML = rows.map((it) => `
            <article class="card">
                <header class="card__head">
                    <h3 class="card__title">${escape(it.facility || '(無題)')}</h3>
                    <div class="card__pills">
                        ${priorityPill(it.priority)}
                        ${statusPill(it.status)}
                    </div>
                </header>
                <dl class="card__meta">
                    ${it.prefecture || it.city ? `<dt>エリア</dt><dd>${escape([it.prefecture, it.city].filter(Boolean).join(' '))}</dd>` : ''}
                    ${it.address ? `<dt>住所</dt><dd>${escape(it.address)}</dd>` : ''}
                    ${it.phone ? `<dt>電話</dt><dd>${escape(it.phone)}</dd>` : ''}
                    ${it.type ? `<dt>種別</dt><dd>${escape(it.type)}</dd>` : ''}
                    ${it.nextActionAt ? `<dt>次回</dt><dd>${nextDateCell(it.nextActionAt)}</dd>` : ''}
                    ${it.memo ? `<dt>メモ</dt><dd>${escape(it.memo)}</dd>` : ''}
                </dl>
                <div class="card__links">${linkIcons(it)}</div>
                <div class="card__actions">
                    <button class="btn btn--secondary btn--sm" data-action="copy" data-id="${it.id}">営業文コピー</button>
                    <button class="btn btn--ghost-light btn--sm" data-action="edit" data-id="${it.id}">編集</button>
                </div>
            </article>
        `).join('');
    }

    function render() {
        renderKpis();

        const filtered = applyFilters();
        const empty = el('list-empty');
        const table = el('data-table');
        const cards = el('card-list');

        if (filtered.length === 0) {
            empty.hidden = false;
            table.hidden = true;
            cards.hidden = true;
        } else {
            empty.hidden = true;
            table.hidden = false;
            cards.hidden = false;
            renderTable();
            renderCards();
        }
    }

    // --------------------------------------------------------------
    // CRUD
    // --------------------------------------------------------------
    function findById(id) {
        return items.find((it) => it.id === id) || null;
    }

    function addItem(data) {
        const item = Object.assign({
            id: uid(),
            createdAt: nowIso(),
        }, data, { updatedAt: nowIso() });
        items.unshift(item);
        saveAll(items);
        render();
    }

    function updateItem(id, patch) {
        const idx = items.findIndex((it) => it.id === id);
        if (idx < 0) return;
        items[idx] = Object.assign({}, items[idx], patch, { updatedAt: nowIso() });
        saveAll(items);
        render();
    }

    function deleteItem(id) {
        items = items.filter((it) => it.id !== id);
        saveAll(items);
        render();
    }

    // --------------------------------------------------------------
    // Modal
    // --------------------------------------------------------------
    const modal = el('modal');
    const form = el('form');

    function openModal(item) {
        form.reset();
        const editing = !!(item && item.id);
        el('modal-title').textContent = editing ? '施設を編集' : '施設を追加';
        el('btn-delete').hidden = !editing;

        const fields = ['id','facility','prefecture','city','address','phone',
                        'websiteUrl','contactFormUrl','gmapUrl','type',
                        'priority','status','firstSentAt','nextActionAt','memo'];
        const data = item || { status: '未送信' };
        fields.forEach((k) => {
            const elField = form.elements[k];
            if (!elField) return;
            elField.value = data[k] ?? '';
        });

        modal.hidden = false;
        document.body.style.overflow = 'hidden';
        setTimeout(() => {
            const f = form.elements['facility'];
            if (f) f.focus();
        }, 50);
    }

    function closeModal() {
        modal.hidden = true;
        document.body.style.overflow = '';
    }

    function readForm() {
        const data = {};
        ['id','facility','prefecture','city','address','phone',
         'websiteUrl','contactFormUrl','gmapUrl','type',
         'priority','status','firstSentAt','nextActionAt','memo'].forEach((k) => {
            const elField = form.elements[k];
            data[k] = elField ? elField.value.trim() : '';
        });
        if (!data.status) data.status = '未送信';
        return data;
    }

    // --------------------------------------------------------------
    // Export / Import
    // --------------------------------------------------------------
    function exportJson() {
        const blob = new Blob([JSON.stringify(items, null, 2)], { type: 'application/json' });
        const stamp = todayStr();
        triggerDownload(blob, `pldl-sales-list-${stamp}.json`);
        showToast('JSON を書き出しました');
    }

    function exportCsv() {
        const cols = [
            ['facility','施設名'],
            ['prefecture','都道府県'],
            ['city','市区町村'],
            ['address','住所'],
            ['phone','電話番号'],
            ['websiteUrl','Webサイト'],
            ['contactFormUrl','問い合わせフォーム'],
            ['gmapUrl','GoogleMap'],
            ['type','種別'],
            ['priority','優先度'],
            ['status','ステータス'],
            ['memo','メモ'],
            ['firstSentAt','初回送信日'],
            ['nextActionAt','次回対応日'],
            ['createdAt','作成日'],
            ['updatedAt','更新日'],
        ];
        const csvEscape = (v) => {
            const s = String(v == null ? '' : v).replace(/\r?\n/g, ' ');
            if (/[",]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
            return s;
        };
        const lines = [];
        lines.push(cols.map((c) => csvEscape(c[1])).join(','));
        items.forEach((it) => {
            lines.push(cols.map((c) => csvEscape(it[c[0]])).join(','));
        });
        // BOM 付きで Excel が文字化けしないように
        const blob = new Blob(['﻿' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
        const stamp = todayStr();
        triggerDownload(blob, `pldl-sales-list-${stamp}.csv`);
        showToast('CSV を書き出しました');
    }

    function triggerDownload(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 500);
    }

    function importJson(file) {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function (e) {
            try {
                const parsed = JSON.parse(String(e.target.result));
                if (!Array.isArray(parsed)) throw new Error('JSON ルートが配列ではありません');

                if (items.length > 0) {
                    const choice = window.prompt(
                        '取り込み方法を選んでください。\n  1: 上書き（既存を全削除）\n  2: 追加（id 重複は新IDで追加）\n  キャンセルで中止',
                        '2'
                    );
                    if (choice == null) return;
                    if (choice.trim() === '1') {
                        items = [];
                    }
                }

                const existingIds = new Set(items.map((i) => i.id));
                let added = 0;
                parsed.forEach((row) => {
                    if (!row || typeof row !== 'object') return;
                    const newRow = Object.assign({}, row);
                    if (!newRow.id || existingIds.has(newRow.id)) {
                        newRow.id = uid();
                    }
                    if (!newRow.facility) return; // skip empty
                    newRow.createdAt = newRow.createdAt || nowIso();
                    newRow.updatedAt = nowIso();
                    items.unshift(newRow);
                    existingIds.add(newRow.id);
                    added++;
                });
                saveAll(items);
                render();
                showToast(`${added} 件取り込みました`);
            } catch (err) {
                console.error(err);
                alert('JSON の取り込みに失敗しました: ' + err.message);
            }
        };
        reader.readAsText(file, 'utf-8');
    }

    // --------------------------------------------------------------
    // Sales template copy
    // --------------------------------------------------------------
    function copyTemplate(item) {
        const text = SALES_TEMPLATE.replace(/{{施設名}}/g, item.facility || '貴施設');
        const ok = (str) => navigator.clipboard
            ? navigator.clipboard.writeText(str)
            : Promise.reject(new Error('clipboard API unavailable'));

        ok(text).then(
            () => showToast('営業文をクリップボードにコピーしました'),
            () => fallbackCopy(text)
        );
    }

    function fallbackCopy(text) {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); showToast('営業文をコピーしました'); }
        catch { alert('コピーに失敗しました。手動で選択してください:\n\n' + text); }
        finally { ta.remove(); }
    }

    // --------------------------------------------------------------
    // Event wiring
    // --------------------------------------------------------------
    el('btn-add').addEventListener('click', () => openModal(null));

    el('filter-q').addEventListener('input', (e) => {
        filters.q = e.target.value;
        render();
    });
    el('filter-priority').addEventListener('change', (e) => {
        filters.priority = e.target.value;
        render();
    });
    el('filter-status').addEventListener('change', (e) => {
        filters.status = e.target.value;
        render();
    });

    // Modal close handlers — use closest() so a click on the inner content
    // of a [data-close] element (the × glyph, etc.) still triggers close.
    modal.addEventListener('click', (e) => {
        if (e.target.closest('[data-close]')) {
            closeModal();
        }
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !modal.hidden) closeModal();
    });

    // Form submit
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const data = readForm();
        if (!data.facility) {
            alert('施設名は必須です');
            return;
        }
        if (data.id) {
            const { id, ...patch } = data;
            updateItem(id, patch);
            showToast('更新しました');
        } else {
            const { id, ...payload } = data;
            addItem(payload);
            showToast('追加しました');
        }
        closeModal();
    });

    // Delete in modal
    el('btn-delete').addEventListener('click', () => {
        const id = form.elements['id'].value;
        if (!id) return;
        if (!window.confirm('この施設を削除します。よろしいですか？')) return;
        deleteItem(id);
        closeModal();
        showToast('削除しました');
    });

    // Suggest priority
    el('btn-suggest-priority').addEventListener('click', () => {
        const data = readForm();
        const sug = suggestPriority(data);
        if (sug) {
            form.elements['priority'].value = sug;
            showToast(`優先度を ${sug} と推定しました`);
        } else {
            showToast('判定材料が足りません');
        }
    });

    // Edit / copy via delegation
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-action]');
        if (!btn) return;
        const id = btn.dataset.id;
        const action = btn.dataset.action;
        const item = findById(id);
        if (!item) return;
        if (action === 'edit') openModal(item);
        else if (action === 'copy') copyTemplate(item);
    });

    // Export / import buttons
    el('btn-export-json').addEventListener('click', exportJson);
    el('btn-export-csv').addEventListener('click', exportCsv);
    el('btn-import-json').addEventListener('click', () => el('import-json-file').click());
    el('import-json-file').addEventListener('change', (e) => {
        const f = e.target.files && e.target.files[0];
        if (f) importJson(f);
        e.target.value = '';
    });

    // Initial render
    render();
})();

/**
 * @typedef {Object} Item
 * @property {string} id
 * @property {string} facility
 * @property {string} [prefecture]
 * @property {string} [city]
 * @property {string} [address]
 * @property {string} [phone]
 * @property {string} [websiteUrl]
 * @property {string} [contactFormUrl]
 * @property {string} [gmapUrl]
 * @property {string} [type]
 * @property {string} [priority]
 * @property {string} [status]
 * @property {string} [memo]
 * @property {string} [firstSentAt]
 * @property {string} [nextActionAt]
 * @property {string} createdAt
 * @property {string} updatedAt
 */
