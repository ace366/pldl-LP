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
    const FILTERS_KEY = 'pldl_sales_filters_v1';

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

    function loadFilters() {
        try {
            const raw = localStorage.getItem(FILTERS_KEY);
            if (!raw) return null;
            const parsed = JSON.parse(raw);
            if (!parsed || typeof parsed !== 'object') return null;
            return parsed;
        } catch {
            return null;
        }
    }

    function saveFilters() {
        localStorage.setItem(FILTERS_KEY, JSON.stringify({
            q: filters.q,
            priority: filters.priority,
            status: filters.status,
        }));
    }

    // --------------------------------------------------------------
    // City suggestions (都道府県 → 市区町村)
    //
    // HeartRails Express API (free, no auth, CORS). Cached per
    // prefecture in localStorage for 30 days to avoid repeat calls.
    // --------------------------------------------------------------
    const CITIES_CACHE_KEY = 'pldl_sales_cities_cache_v1';
    const CITIES_TTL_MS = 30 * 24 * 60 * 60 * 1000;
    const HEARTRAILS_URL = 'https://geoapi.heartrails.com/api/json?method=getCities&prefecture=';
    const cityCacheMem = {};

    function loadCityCacheStore() {
        try {
            const raw = localStorage.getItem(CITIES_CACHE_KEY);
            return raw ? (JSON.parse(raw) || {}) : {};
        } catch { return {}; }
    }
    function persistCityCache(store) {
        try { localStorage.setItem(CITIES_CACHE_KEY, JSON.stringify(store)); } catch {}
    }

    /**
     * @param {string} prefecture
     * @returns {Promise<string[]>}
     */
    async function fetchCities(prefecture) {
        if (!prefecture) return [];
        if (cityCacheMem[prefecture]) return cityCacheMem[prefecture];

        const store = loadCityCacheStore();
        const cached = store[prefecture];
        if (cached && cached.expiry > Date.now() && Array.isArray(cached.cities)) {
            cityCacheMem[prefecture] = cached.cities;
            return cached.cities;
        }

        try {
            const res = await fetch(HEARTRAILS_URL + encodeURIComponent(prefecture));
            if (!res.ok) throw new Error('HTTP ' + res.status);
            const json = await res.json();
            const locs = (json && json.response && Array.isArray(json.response.location))
                ? json.response.location : [];
            const cities = Array.from(new Set(locs.map((l) => l.city).filter(Boolean)));
            cities.sort((a, b) => a.localeCompare(b, 'ja'));

            cityCacheMem[prefecture] = cities;
            store[prefecture] = { cities, expiry: Date.now() + CITIES_TTL_MS };
            persistCityCache(store);
            return cities;
        } catch (err) {
            console.warn('city fetch failed for', prefecture, err);
            return [];
        }
    }

    function setCityDatalist(cities) {
        const dl = el('cities-datalist');
        if (!dl) return;
        dl.innerHTML = cities.map((c) => `<option value="${escape(c)}"></option>`).join('');
    }

    // --------------------------------------------------------------
    // Website analyzer
    //
    // Fetch the site through allorigins.win (free CORS proxy), parse
    // the HTML, and pull out:
    //   - concept   : meta description / og:description / first <h1>
    //   - lastUpdate: any modified_time meta or visible date pattern
    //   - platform  : WordPress / Wix / Jimdo / BASE / Squarespace /
    //                 Shopify / Movable Type / custom
    //   - skillScore: 0..10 based on tech-quality signals
    //   - skillLevel: high / mid / low
    // --------------------------------------------------------------
    // First entry is same-origin (Laravel-side proxy.php). When the tool
    // is opened via file:// or another origin, that endpoint is missing,
    // so allorigins.win is kept as a public fallback.
    const PROXY_ENDPOINTS = [
        'proxy.php?url=',
        'https://api.allorigins.win/get?url=',
    ];

    function detectPlatform(html, doc) {
        const generator = (doc.querySelector('meta[name="generator"]')?.content || '').toLowerCase();
        const lower = html.toLowerCase();
        if (/wp-content|wp-includes/.test(lower) || generator.includes('wordpress')) return 'WordPress';
        if (lower.includes('static.parastorage.com') || generator.includes('wix')) return 'Wix';
        if (generator.includes('jimdo') || lower.includes('jimdo.com')) return 'Jimdo';
        if (lower.includes('cdn.shopify.com')) return 'Shopify';
        if (lower.includes('squarespace')) return 'Squarespace';
        if (generator.includes('movable type')) return 'Movable Type';
        if (lower.includes('thebase.in') || lower.includes('static-base.in')) return 'BASE';
        if (lower.includes('peraichi')) return 'ペライチ';
        if (lower.includes('studio.design') || lower.includes('cdn.studio.design')) return 'STUDIO';
        if (generator) return generator.split(' ')[0];
        return 'カスタム / 不明';
    }

    function computeSkillScore(html, doc, finalUrl) {
        let score = 0;
        const lower = html.toLowerCase();

        // HTTPS
        if (/^https:\/\//i.test(finalUrl || '')) score += 2;

        // Doctype html5
        if (/<!doctype html>/i.test(html.slice(0, 200))) score += 1;

        // viewport meta (responsive)
        if (doc.querySelector('meta[name="viewport"]')) score += 1;

        // og: tags
        if (doc.querySelector('meta[property^="og:"]')) score += 1;

        // semantic tags
        const semantic = ['header', 'main', 'article', 'section', 'nav', 'footer']
            .filter((t) => doc.querySelector(t)).length;
        if (semantic >= 3) score += 1;

        // structured data
        if (doc.querySelector('script[type="application/ld+json"]')) score += 1;

        // favicon
        if (doc.querySelector('link[rel*="icon"]')) score += 0.5;

        // hreflang / multilang
        if (doc.querySelector('link[rel="alternate"][hreflang]')) score += 0.5;

        // modern framework markers
        if (/react|next\.js|vue|nuxt|svelte|astro/.test(lower)) score += 1;

        // CDN markers
        if (/cdn\.|cloudfront|akamai|fastly|jsdelivr/.test(lower)) score += 0.5;

        // CSS framework
        if (/bootstrap|tailwind|bulma|foundation/.test(lower)) score += 0.5;

        return Math.min(10, Math.round(score * 10) / 10);
    }

    function platformSkillHint(platform) {
        // Map platform → expected build origin (業者 vs 自作 vs ノーコード)
        if (platform === 'Wix' || platform === 'Jimdo' || platform === 'ペライチ' ||
            platform === 'BASE' || platform === 'STUDIO' || platform === 'Squarespace') {
            return { origin: 'ノーコード（自作）', selfBuilt: true };
        }
        if (platform === 'WordPress' || platform === 'Movable Type' || platform === 'Shopify') {
            return { origin: '業者または自作（CMS）', selfBuilt: null };
        }
        if (platform === 'カスタム / 不明') {
            return { origin: '業者制作の可能性が高い', selfBuilt: false };
        }
        return { origin: '不明', selfBuilt: null };
    }

    function scoreToLevel(score) {
        if (score >= 7) return 'high';
        if (score >= 4) return 'mid';
        return 'low';
    }

    function levelLabel(level) {
        return { high: '高（しっかり制作）', mid: '中（標準）', low: '低（簡易）' }[level] || level;
    }

    function extractConcept(doc) {
        const desc = (doc.querySelector('meta[name="description"]')?.content
                  || doc.querySelector('meta[property="og:description"]')?.content
                  || '').trim();
        const h1 = (doc.querySelector('h1')?.textContent || '').trim().replace(/\s+/g, ' ');
        const title = (doc.querySelector('title')?.textContent || '').trim().replace(/\s+/g, ' ');
        return {
            description: desc.slice(0, 240),
            h1: h1.slice(0, 120),
            title: title.slice(0, 120),
        };
    }

    function extractLastUpdate(html, doc) {
        // 1. meta tags
        const metaCandidates = [
            'meta[property="article:modified_time"]',
            'meta[name="last-modified"]',
            'meta[itemprop="dateModified"]',
            'meta[name="date"]',
            'meta[property="og:updated_time"]',
        ];
        for (const sel of metaCandidates) {
            const v = doc.querySelector(sel)?.content;
            if (v) return { source: sel.split('[')[1].split('=')[0], value: v.slice(0, 60) };
        }

        // 2. visible date patterns (find newest)
        const patterns = [
            /(\d{4})[年\-\/.](\d{1,2})[月\-\/.](\d{1,2})日?/g,
        ];
        const text = doc.body ? doc.body.textContent : '';
        const dates = [];
        for (const re of patterns) {
            let m;
            while ((m = re.exec(text)) !== null) {
                const y = parseInt(m[1], 10);
                const mm = parseInt(m[2], 10);
                const d = parseInt(m[3], 10);
                if (y >= 2000 && y <= 2099 && mm >= 1 && mm <= 12 && d >= 1 && d <= 31) {
                    dates.push({ y, m: mm, d });
                }
            }
        }
        if (dates.length === 0) return null;
        dates.sort((a, b) => (b.y - a.y) || (b.m - a.m) || (b.d - a.d));
        const latest = dates[0];
        return {
            source: 'page text',
            value: `${latest.y}-${String(latest.m).padStart(2,'0')}-${String(latest.d).padStart(2,'0')}`,
        };
    }

    async function fetchViaProxies(url) {
        const errors = [];
        for (const ep of PROXY_ENDPOINTS) {
            try {
                const res = await fetch(ep + encodeURIComponent(url), { cache: 'no-store' });
                if (!res.ok) {
                    errors.push(`${ep.split('?')[0]} → HTTP ${res.status}`);
                    continue;
                }
                const data = await res.json();
                if (data && typeof data.contents === 'string' && data.contents.length > 0) {
                    return {
                        html: data.contents,
                        finalUrl: (data.status && data.status.url) || url,
                        via: ep.split('?')[0],
                    };
                }
                errors.push(`${ep.split('?')[0]} → 空レスポンス`);
            } catch (e) {
                errors.push(`${ep.split('?')[0]} → ${e.message}`);
            }
        }
        throw new Error('すべてのプロキシで取得失敗\n' + errors.map(s => '  - ' + s).join('\n'));
    }

    async function fetchAndParse(url) {
        if (!isUrl(url)) throw new Error('有効な URL ではありません。');
        const fetched = await fetchViaProxies(url);
        const html = fetched.html;
        const finalUrl = fetched.finalUrl;
        if (!html || typeof html !== 'string') throw new Error('HTML を取得できませんでした。');
        const doc = new DOMParser().parseFromString(html, 'text/html');
        return { html, doc, finalUrl };
    }

    function computeAnalysisFromDoc(html, doc, finalUrl) {
        const platform = detectPlatform(html, doc);
        const skillScore = computeSkillScore(html, doc, finalUrl);
        const skillLevel = scoreToLevel(skillScore);
        const concept = extractConcept(doc);
        const lastUpdate = extractLastUpdate(html, doc);
        const origin = platformSkillHint(platform);

        return {
            fetchedAt: nowIso(),
            url: finalUrl,
            platform,
            skillScore,
            skillLevel,
            origin: origin.origin,
            selfBuilt: origin.selfBuilt,
            concept,
            lastUpdate,
        };
    }

    async function analyzeWebsite(url) {
        const { html, doc, finalUrl } = await fetchAndParse(url);
        return computeAnalysisFromDoc(html, doc, finalUrl);
    }

    /**
     * Fetch URL once, return both the field extraction and the analysis.
     */
    async function importFromUrl(url) {
        const { html, doc, finalUrl } = await fetchAndParse(url);
        const fields = extractFieldsFromDoc(html, doc, finalUrl);
        const analysis = computeAnalysisFromDoc(html, doc, finalUrl);
        return { fields, analysis };
    }

    // --------------------------------------------------------------
    // Field extraction from a fetched HTML document
    // --------------------------------------------------------------
    const PREFECTURE_LIST = [
        '北海道','青森県','岩手県','宮城県','秋田県','山形県','福島県',
        '茨城県','栃木県','群馬県','埼玉県','千葉県','東京都','神奈川県',
        '新潟県','富山県','石川県','福井県','山梨県','長野県','岐阜県',
        '静岡県','愛知県','三重県','滋賀県','京都府','大阪府','兵庫県',
        '奈良県','和歌山県','鳥取県','島根県','岡山県','広島県','山口県',
        '徳島県','香川県','愛媛県','高知県','福岡県','佐賀県','長崎県',
        '熊本県','大分県','宮崎県','鹿児島県','沖縄県',
    ];

    function extractJsonLd(doc) {
        const out = [];
        doc.querySelectorAll('script[type="application/ld+json"]').forEach((s) => {
            try {
                const parsed = JSON.parse(s.textContent);
                const arr = Array.isArray(parsed) ? parsed
                          : (parsed && parsed['@graph']) ? parsed['@graph']
                          : [parsed];
                arr.forEach((it) => { if (it && typeof it === 'object') out.push(it); });
            } catch {}
        });
        return out;
    }

    function findOrgInJsonLd(items) {
        const wanted = ['Organization','LocalBusiness','EducationalOrganization','School',
                        'NGO','Place','ChildCare'];
        return items.find((it) => {
            const t = it['@type'];
            const types = Array.isArray(t) ? t : [t];
            return types.some((x) => wanted.includes(x));
        });
    }

    function pickFacility(doc, jsonLd) {
        const org = findOrgInJsonLd(jsonLd);
        if (org?.name) return String(org.name).trim();

        const ogSiteName = doc.querySelector('meta[property="og:site_name"]')?.content;
        if (ogSiteName) return ogSiteName.trim();

        const ogTitle = doc.querySelector('meta[property="og:title"]')?.content;
        const title = doc.querySelector('title')?.textContent?.trim();
        const candidate = (ogTitle || title || '').trim();
        if (candidate) {
            // Often "施設名 ｜ キャッチ" — take the first segment if reasonable
            const parts = candidate.split(/[|｜｜\-—–]/).map((s) => s.trim()).filter(Boolean);
            if (parts.length > 1 && parts[0].length <= 60) return parts[0];
            return candidate;
        }

        const h1 = doc.querySelector('h1')?.textContent?.trim().replace(/\s+/g, ' ');
        return h1 ? h1.slice(0, 100) : '';
    }

    function pickAddress(doc, jsonLd) {
        const org = findOrgInJsonLd(jsonLd);
        if (org?.address) {
            const a = org.address;
            if (typeof a === 'string') return a.trim();
            if (a && typeof a === 'object') {
                const parts = [
                    a.postalCode ? '〒' + String(a.postalCode).replace(/-?(\d{3})(\d{4})/, '$1-$2') : '',
                    a.addressRegion,
                    a.addressLocality,
                    a.streetAddress,
                ].filter(Boolean).map(String);
                if (parts.length > 0) return parts.join(' ').trim();
            }
        }

        // Try <address> element
        const addrEl = doc.querySelector('address');
        if (addrEl) {
            const t = addrEl.textContent.replace(/\s+/g, ' ').trim();
            if (t.length >= 6 && t.length <= 200) return t;
        }

        // Body text scan: 〒XXX-XXXX 都道府県... 市区町村...
        const text = (doc.body?.textContent || '').replace(/\s+/g, ' ');
        const re = /〒\s*\d{3}\s*[-‐ー－]\s*\d{4}[\s　]*([^\s　]{1,100})/;
        const m = text.match(re);
        if (m) return m[0].replace(/\s+/g, ' ').trim().slice(0, 200);
        return '';
    }

    function pickPhone(doc, jsonLd) {
        const org = findOrgInJsonLd(jsonLd);
        if (org?.telephone) return String(org.telephone).trim();

        const tel = doc.querySelector('a[href^="tel:"]')?.getAttribute('href');
        if (tel) return tel.replace(/^tel:/, '').replace(/\s+/g, '').trim();

        const text = (doc.body?.textContent || '').replace(/\s+/g, ' ');
        const m = text.match(/(?:0\d{1,4}[-‐ー－(]?\d{1,4}[)\-‐ー－]?\d{4}|\(0\d{1,4}\)\s*\d{1,4}[-\s]?\d{4})/);
        return m ? m[0].replace(/\s/g, '') : '';
    }

    function pickEmail(doc, jsonLd) {
        const org = findOrgInJsonLd(jsonLd);
        if (org?.email) return String(org.email).trim();

        const mailto = doc.querySelector('a[href^="mailto:"]')?.getAttribute('href');
        if (mailto) return mailto.replace(/^mailto:/, '').split('?')[0].trim();

        const text = doc.body?.textContent || '';
        // skip noreply / @example.com style placeholders later if desired
        const m = text.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/);
        return m ? m[0] : '';
    }

    function pickPrefecture(addr) {
        if (!addr) return '';
        return PREFECTURES.includes ? '' : '';
    }

    function pickPrefectureFromAddress(addr) {
        if (!addr) return '';
        return PREFECTURE_LIST.find((p) => addr.includes(p)) || '';
    }

    function pickCityFromAddress(addr, prefecture) {
        if (!addr || !prefecture) return '';
        const idx = addr.indexOf(prefecture);
        if (idx < 0) return '';
        const rest = addr.slice(idx + prefecture.length);
        const m = rest.match(/^[\s　]*([^\s　0-9０-９]{1,15}?[市区町村郡])/);
        return m ? m[1] : '';
    }

    function pickType(doc) {
        const head = (doc.querySelector('title')?.textContent || '') + ' ' +
                     (doc.querySelector('meta[name="description"]')?.content || '') + ' ' +
                     (doc.querySelector('h1')?.textContent || '');
        if (/NPO|特定非営利|社団法人|社会福祉法人/.test(head)) return 'NPO';
        if (/放課後児童クラブ/.test(head)) return '放課後児童クラブ';
        if (/学童|アフタースクール|after\s*school/i.test(head)) return '民間学童';
        return '';
    }

    function pickContactFormUrl(doc, finalUrl) {
        // First, look for anchor tags whose text suggests a contact form
        const anchors = Array.from(doc.querySelectorAll('a[href]'));
        const re = /(お?問い?合わせ|お問合せ|問合せ|コンタクト|^Contact$|^contact us$|inquiry)/i;
        for (const a of anchors) {
            const text = (a.textContent || '').trim();
            if (re.test(text)) {
                const href = a.getAttribute('href');
                if (!href || href.startsWith('mailto:') || href.startsWith('tel:')) continue;
                try { return new URL(href, finalUrl).href; } catch {}
            }
        }
        return '';
    }

    /**
     * Pull as many fields as we can from a fetched HTML document.
     * Returns { facility, prefecture, city, address, phone, email,
     *           contactFormUrl, type, found:[] }
     */
    function extractFieldsFromDoc(html, doc, finalUrl) {
        const jsonLd = extractJsonLd(doc);
        const facility = pickFacility(doc, jsonLd);
        const address  = pickAddress(doc, jsonLd);
        const phone    = pickPhone(doc, jsonLd);
        const email    = pickEmail(doc, jsonLd);
        const prefecture = pickPrefectureFromAddress(address);
        const city = pickCityFromAddress(address, prefecture);
        const type = pickType(doc);
        const contactFormUrl = pickContactFormUrl(doc, finalUrl);

        return { facility, prefecture, city, address, phone, email, contactFormUrl, type };
    }

    function renderAnalysis(analysis, container) {
        if (!container) return;
        if (!analysis) {
            container.dataset.empty = '1';
            container.removeAttribute('data-loading');
            container.removeAttribute('data-error');
            container.innerHTML = 'WebサイトURL を入れて「解析する」を押すと、コンセプト・最新更新・制作レベルを推定します。';
            return;
        }
        const stars = '★'.repeat(Math.round(analysis.skillScore / 2)) + '☆'.repeat(5 - Math.round(analysis.skillScore / 2));
        const fetchedDate = new Date(analysis.fetchedAt);
        const fetchedStr = `${fetchedDate.getFullYear()}-${String(fetchedDate.getMonth()+1).padStart(2,'0')}-${String(fetchedDate.getDate()).padStart(2,'0')} ${String(fetchedDate.getHours()).padStart(2,'0')}:${String(fetchedDate.getMinutes()).padStart(2,'0')}`;

        container.removeAttribute('data-empty');
        container.removeAttribute('data-loading');
        container.removeAttribute('data-error');
        container.innerHTML = `
            <div class="analysis-row">
                <div class="analysis-row__label">制作プラットフォーム</div>
                <div class="analysis-row__value">
                    <span class="analysis-tag">${escape(analysis.platform)}</span>
                    <span style="color:var(--c-soft); margin-left:8px; font-size:11px;">${escape(analysis.origin)}</span>
                </div>
            </div>
            <div class="analysis-row">
                <div class="analysis-row__label">スキル評価</div>
                <div class="analysis-row__value">
                    <span class="analysis-tag analysis-tag--${analysis.skillLevel}">${escape(levelLabel(analysis.skillLevel))}</span>
                    <span class="analysis-stars">${stars}</span>
                    <span style="color:var(--c-soft);font-size:11px; margin-left:6px;">${analysis.skillScore} / 10</span>
                </div>
            </div>
            <div class="analysis-row">
                <div class="analysis-row__label">コンセプト</div>
                <div class="analysis-row__value">
                    ${analysis.concept.title ? `<div><strong>${escape(analysis.concept.title)}</strong></div>` : ''}
                    ${analysis.concept.description ? `<div style="margin-top:4px;">${escape(analysis.concept.description)}</div>` : ''}
                    ${analysis.concept.h1 && analysis.concept.h1 !== analysis.concept.title ? `<div style="margin-top:4px; color:var(--c-muted); font-size:12px;">H1: ${escape(analysis.concept.h1)}</div>` : ''}
                    ${!analysis.concept.title && !analysis.concept.description && !analysis.concept.h1 ? '<em style="color:var(--c-soft);">（取得できませんでした）</em>' : ''}
                </div>
            </div>
            <div class="analysis-row">
                <div class="analysis-row__label">最新更新</div>
                <div class="analysis-row__value">
                    ${analysis.lastUpdate
                        ? `${escape(analysis.lastUpdate.value)} <span style="color:var(--c-soft); font-size:11px;">(${escape(analysis.lastUpdate.source)})</span>`
                        : '<em style="color:var(--c-soft);">不明</em>'}
                </div>
            </div>
            <div class="analysis-meta">
                <span>解析日時: ${escape(fetchedStr)}</span>
                <span>取得元: <a href="${escape(analysis.url)}" target="_blank" rel="noopener">${escape(analysis.url)}</a></span>
            </div>
        `;
    }

    let cityFetchToken = 0;
    function refreshCityDatalist(prefecture) {
        const hint = el('city-hint');
        const myToken = ++cityFetchToken;
        if (!prefecture) {
            setCityDatalist([]);
            if (hint) hint.hidden = true;
            return;
        }
        if (hint && !cityCacheMem[prefecture]) {
            hint.hidden = false;
            hint.textContent = '読み込み中…';
        }
        fetchCities(prefecture).then((cities) => {
            if (myToken !== cityFetchToken) return; // outdated request
            setCityDatalist(cities);
            if (hint) {
                if (cities.length > 0) {
                    hint.hidden = false;
                    hint.textContent = `${cities.length}件`;
                } else {
                    hint.hidden = false;
                    hint.textContent = '候補なし（自由入力可）';
                }
            }
        });
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
        '15分ほどのオンラインデモでご紹介可能です。',
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
     *
     * Base rule (種別 + URL の有無):
     *   - 民間学童 + Web + フォーム → S
     *   - 民間学童 + Web のみ      → A
     *   - NPO / 法人運営 + Web     → A
     *   - 公立/自治体系             → C
     *   - 電話のみ                  → B
     *   - その他                    → C
     *
     * Skill 補正 (analysis があれば):
     *   - level=high (業者の立派なサイト)  → 1段階下げる（決裁が重そう）
     *   - level=low  (簡易自作)            → 1段階上げる（小規模・直接決裁）
     *   - level=mid                        → そのまま
     *   ただし最終結果は S..C の範囲に丸める
     *
     * @param {Item} item
     * @returns {'S'|'A'|'B'|'C'|''}
     */
    function suggestPriority(item) {
        const t = (item.type || '').trim();
        const hasSite = isUrl(item.websiteUrl);
        const hasForm = isUrl(item.contactFormUrl);

        let base;
        if (t === '民間学童' && hasSite && hasForm) base = 'S';
        else if (t === '民間学童' && hasSite) base = 'A';
        else if ((t === 'NPO' || t === '法人運営') && hasSite) base = 'A';
        else if (t === '公立/自治体系') base = 'C';
        else if (!hasSite && !hasForm && item.phone) base = 'B';
        else if (hasSite || hasForm) base = 'B';
        else base = 'C';

        const level = item.analysis?.skillLevel;
        if (!level) return base;

        const order = ['S', 'A', 'B', 'C'];
        let idx = order.indexOf(base);
        if (level === 'high') idx = Math.min(order.length - 1, idx + 1); // demote
        else if (level === 'low') idx = Math.max(0, idx - 1);            // promote
        return order[idx];
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
                    it.phone, it.email, it.memo, it.type,
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
        if (it.email && /@/.test(it.email))
            parts.push(`<a class="link-icon link-icon--mail" href="mailto:${escape(it.email)}" title="メール送信: ${escape(it.email)}">@</a>`);
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
                    <div class="facility-name">
                        ${escape(it.facility || '(無題)')}
                        ${it.analysis ? `<span class="analyzed-badge" title="解析済 (${escape(it.analysis.platform)} / ${it.analysis.skillScore}/10)">解析★${it.analysis.skillScore}</span>` : ''}
                    </div>
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
                        <button class="btn btn--danger btn--xs" data-action="delete" data-id="${it.id}" title="削除">削除</button>
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
                    <h3 class="card__title">
                        ${escape(it.facility || '(無題)')}
                        ${it.analysis ? `<span class="analyzed-badge" title="${escape(it.analysis.platform)} / ${it.analysis.skillScore}/10">解析★${it.analysis.skillScore}</span>` : ''}
                    </h3>
                    <div class="card__pills">
                        ${priorityPill(it.priority)}
                        ${statusPill(it.status)}
                    </div>
                </header>
                <dl class="card__meta">
                    ${it.prefecture || it.city ? `<dt>エリア</dt><dd>${escape([it.prefecture, it.city].filter(Boolean).join(' '))}</dd>` : ''}
                    ${it.address ? `<dt>住所</dt><dd>${escape(it.address)}</dd>` : ''}
                    ${it.phone ? `<dt>電話</dt><dd>${escape(it.phone)}</dd>` : ''}
                    ${it.email ? `<dt>メール</dt><dd><a href="mailto:${escape(it.email)}">${escape(it.email)}</a></dd>` : ''}
                    ${it.type ? `<dt>種別</dt><dd>${escape(it.type)}</dd>` : ''}
                    ${it.nextActionAt ? `<dt>次回</dt><dd>${nextDateCell(it.nextActionAt)}</dd>` : ''}
                    ${it.memo ? `<dt>メモ</dt><dd>${escape(it.memo)}</dd>` : ''}
                </dl>
                <div class="card__links">${linkIcons(it)}</div>
                <div class="card__actions">
                    <button class="btn btn--secondary btn--sm" data-action="copy" data-id="${it.id}">営業文コピー</button>
                    <button class="btn btn--ghost-light btn--sm" data-action="edit" data-id="${it.id}">編集</button>
                    <button class="btn btn--danger btn--sm" data-action="delete" data-id="${it.id}">削除</button>
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
    /** Holds the analysis being edited / displayed in the modal. */
    let modalAnalysis = null;

    function openModal(item) {
        form.reset();
        const editing = !!(item && item.id);
        el('modal-title').textContent = editing ? '施設を編集' : '施設を追加';
        el('btn-delete').hidden = !editing;

        const fields = ['id','facility','prefecture','city','address','phone','email',
                        'websiteUrl','contactFormUrl','gmapUrl','type',
                        'priority','status','firstSentAt','nextActionAt','memo'];
        const data = item || { status: '未送信' };
        fields.forEach((k) => {
            const elField = form.elements[k];
            if (!elField) return;
            elField.value = data[k] ?? '';
        });

        // Pre-load city candidates for the existing prefecture (edit case)
        refreshCityDatalist(data.prefecture || '');

        // Render existing analysis (or empty placeholder) into the modal
        modalAnalysis = data.analysis ? Object.assign({}, data.analysis) : null;
        renderAnalysis(modalAnalysis, el('analysis-result'));
        const importHint = el('import-hint');
        if (importHint) { importHint.hidden = true; importHint.textContent = ''; }
        const analysisHint = el('analysis-hint');
        if (analysisHint) { analysisHint.hidden = true; analysisHint.textContent = ''; }

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
        ['id','facility','prefecture','city','address','phone','email',
         'websiteUrl','contactFormUrl','gmapUrl','type',
         'priority','status','firstSentAt','nextActionAt','memo'].forEach((k) => {
            const elField = form.elements[k];
            data[k] = elField ? elField.value.trim() : '';
        });
        if (!data.status) data.status = '未送信';
        if (modalAnalysis) data.analysis = modalAnalysis;
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
            ['email','メールアドレス'],
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
        saveFilters();
        render();
    });
    el('filter-priority').addEventListener('change', (e) => {
        filters.priority = e.target.value;
        saveFilters();
        render();
    });
    el('filter-status').addEventListener('change', (e) => {
        filters.status = e.target.value;
        saveFilters();
        render();
    });

    // Modal close handlers — combine event delegation (closest) and direct
    // listeners on each [data-close] element. Belt-and-suspenders.
    modal.addEventListener('click', (e) => {
        if (e.target.closest('[data-close]')) {
            closeModal();
        }
    });
    $$('[data-close]', modal).forEach((node) => {
        node.addEventListener('click', (e) => {
            e.stopPropagation();
            closeModal();
        });
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

    // Prefecture changed → refetch city candidates
    let prefDebounce;
    form.elements['prefecture'].addEventListener('input', (e) => {
        const v = e.target.value.trim();
        clearTimeout(prefDebounce);
        prefDebounce = setTimeout(() => refreshCityDatalist(v), 250);
    });
    form.elements['prefecture'].addEventListener('change', (e) => {
        refreshCityDatalist(e.target.value.trim());
    });

    // Import facility data from website
    el('btn-import').addEventListener('click', async () => {
        const url = (form.elements['websiteUrl'].value || '').trim();
        const hint = el('import-hint');
        const analysisResult = el('analysis-result');
        if (!isUrl(url)) {
            alert('まず WebサイトURL を入力してください（http:// または https:// で始まる形式）');
            return;
        }

        // Show loading on both the import hint and the analysis card
        if (hint) { hint.hidden = false; hint.textContent = '取り込み中…'; }
        analysisResult.removeAttribute('data-empty');
        analysisResult.removeAttribute('data-error');
        analysisResult.dataset.loading = '1';
        analysisResult.innerHTML = 'サイトを取得しています…';

        try {
            const { fields, analysis } = await importFromUrl(url);

            // Smart-fill: only populate empty fields, never clobber user input
            const filledKeys = [];
            const order = ['facility','prefecture','city','address','phone','email',
                           'contactFormUrl','type'];
            order.forEach((k) => {
                const elField = form.elements[k];
                if (!elField) return;
                const current = (elField.value || '').trim();
                const found = (fields[k] || '').trim();
                if (current === '' && found !== '') {
                    elField.value = found;
                    filledKeys.push(k);
                    if (k === 'prefecture') refreshCityDatalist(found);
                }
            });

            // Save analysis to the record's draft and render it
            modalAnalysis = analysis;
            renderAnalysis(analysis, analysisResult);

            // Auto-suggest priority if currently empty
            if (!form.elements['priority'].value) {
                const draft = readForm();
                const sug = suggestPriority(draft);
                if (sug) form.elements['priority'].value = sug;
            }

            if (hint) {
                if (filledKeys.length === 0) {
                    hint.textContent = '埋まる項目は見つかりませんでした（解析のみ完了）';
                } else {
                    hint.textContent = `${filledKeys.length}項目埋めました: ${filledKeys.join(', ')}`;
                }
            }
            showToast(`取り込み完了 (${filledKeys.length}項目 + 解析)`);
        } catch (err) {
            console.error(err);
            analysisResult.removeAttribute('data-empty');
            analysisResult.removeAttribute('data-loading');
            analysisResult.dataset.error = '1';
            analysisResult.textContent = '取り込みに失敗しました: ' + err.message;
            if (hint) { hint.hidden = false; hint.textContent = '失敗'; }
        }
    });

    // Site analyze
    el('btn-analyze').addEventListener('click', async () => {
        const url = (form.elements['websiteUrl'].value || '').trim();
        const result = el('analysis-result');
        const hint = el('analysis-hint');
        if (!isUrl(url)) {
            alert('まず WebサイトURL を入力してください（http:// または https:// で始まる形式）');
            return;
        }
        result.removeAttribute('data-empty');
        result.removeAttribute('data-error');
        result.dataset.loading = '1';
        result.innerHTML = '解析中… サイトを読み込んでいます';
        if (hint) { hint.hidden = false; hint.textContent = '取得中…'; }

        try {
            const analysis = await analyzeWebsite(url);
            modalAnalysis = analysis;
            renderAnalysis(analysis, result);
            if (hint) hint.hidden = true;
            showToast(`解析完了: ${analysis.platform} / スキル ${analysis.skillScore}`);
        } catch (err) {
            console.error(err);
            result.removeAttribute('data-empty');
            result.removeAttribute('data-loading');
            result.dataset.error = '1';
            result.textContent = '解析に失敗しました: ' + err.message;
            if (hint) hint.hidden = true;
        }
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

    // Edit / copy / delete via delegation
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-action]');
        if (!btn) return;
        const id = btn.dataset.id;
        const action = btn.dataset.action;
        const item = findById(id);
        if (!item) return;
        if (action === 'edit') openModal(item);
        else if (action === 'copy') copyTemplate(item);
        else if (action === 'delete') {
            const label = item.facility || '(無題)';
            if (window.confirm(`「${label}」を削除します。よろしいですか？\n\n※ この操作は取り消せません。`)) {
                deleteItem(id);
                showToast('削除しました');
            }
        }
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

    // Restore previously saved filters and reflect them in the inputs.
    (function restoreFilters() {
        const saved = loadFilters();
        if (!saved) return;
        if (typeof saved.q === 'string') {
            filters.q = saved.q;
            el('filter-q').value = saved.q;
        }
        if (PRIORITIES.includes(saved.priority)) {
            filters.priority = saved.priority;
            el('filter-priority').value = saved.priority;
        }
        if (STATUSES.includes(saved.status)) {
            filters.status = saved.status;
            el('filter-status').value = saved.status;
        }
    })();

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
 * @property {string} [email]
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
