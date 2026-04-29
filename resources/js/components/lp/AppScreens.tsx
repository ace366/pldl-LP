import React from 'react';

/**
 * NPO法人 Playful Learning Design Lab.（PLDL）が運用する学童向け運営システムの
 * 実画面イメージを参考にした「ダミーモックアップ」を表示するセクション。
 * 表示しているデータはすべてダミーで、実在する利用者の情報ではありません。
 */
const AppScreens: React.FC = () => {
    return (
        <section className="lp-section lp-section--soft" id="screens">
            <div className="lp-container">
                <header className="lp-section__head">
                    <p className="lp-section__eyebrow">App Screens</p>
                    <h2 className="lp-section__title">スマホで、現場の動きをそのまま管理。</h2>
                    <p className="lp-section__lead">
                        実際にPLDLが運用しているシステムのイメージです（表示内容はすべてダミーです）。
                    </p>
                </header>

                <div className="lp-screens">
                    <ScreenCard
                        eyebrow="01 / Staff QR"
                        title="スタッフ出勤QR"
                        body="スタッフはマイページのQRをかざすだけで出勤打刻。紙のタイムカードを廃止できます。"
                    >
                        <PhoneFrame label="my-qr">
                            <MyQrScreen />
                        </PhoneFrame>
                    </ScreenCard>

                    <ScreenCard
                        eyebrow="02 / Attendance"
                        title="参加予定・送迎管理"
                        body="拠点ごとに、当日の出席状況・送迎要否・乗車済みかをひと目で把握。タップで状態更新。"
                    >
                        <PhoneFrame label="attendance-intents">
                            <AttendanceIntentsScreen />
                        </PhoneFrame>
                    </ScreenCard>

                    <ScreenCard
                        eyebrow="03 / Chat"
                        title="保護者チャット"
                        body="保護者とのやり取りはスレッド管理。未読数・既読状況・児童ごとの履歴をまとめて確認できます。"
                    >
                        <PhoneFrame label="admin/chats">
                            <ChatsScreen />
                        </PhoneFrame>
                    </ScreenCard>
                </div>

                <p className="lp-screens__note">
                    ※ 表示中の名前・施設名・メッセージはすべてダミーです。実際の運用データではありません。
                </p>
            </div>
        </section>
    );
};

const ScreenCard: React.FC<{
    eyebrow: string;
    title: string;
    body: string;
    children: React.ReactNode;
}> = ({ eyebrow, title, body, children }) => (
    <article className="lp-screen-card">
        <div className="lp-screen-card__phone">{children}</div>
        <div className="lp-screen-card__caption">
            <p className="lp-screen-card__eyebrow">{eyebrow}</p>
            <h3 className="lp-screen-card__title">{title}</h3>
            <p className="lp-screen-card__body">{body}</p>
        </div>
    </article>
);

const PhoneFrame: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
    <div className="lp-phoneframe" aria-hidden="true">
        <div className="lp-phoneframe__notch"></div>
        <div className="lp-phoneframe__screen">
            <div className="lp-phoneframe__statusbar">
                <span>9:41</span>
                <span className="lp-phoneframe__url">app.pldl.or.jp/{label}</span>
                <span>●●●</span>
            </div>
            <div className="lp-phoneframe__content">{children}</div>
        </div>
    </div>
);

/* ===================== Screen 1: MyQR ===================== */

const MyQrScreen: React.FC = () => (
    <div className="lp-mock lp-mock--myqr">
        <div className="lp-mock__app-header">
            <span className="lp-mock__app-back">‹</span>
            <span className="lp-mock__app-title">マイページ</span>
            <span className="lp-mock__app-menu">≡</span>
        </div>

        <div className="lp-mock__card">
            <h4 className="lp-mock__card-title">スタッフQRコード（出勤用）</h4>

            <div className="lp-mock__qr-frame">
                <DummyQr />
            </div>

            <button type="button" className="lp-mock__expand">
                <span className="lp-mock__expand-icon">⤢</span>
                <span className="lp-mock__expand-text">
                    <strong>QRコード</strong>
                    <span>（おおきくする）</span>
                </span>
                <span className="lp-mock__expand-press">👆</span>
            </button>

            <div className="lp-mock__info">
                <div className="lp-mock__info-row">
                    <span>名前</span>
                    <strong>山田 はるな</strong>
                </div>
                <div className="lp-mock__info-row">
                    <span>拠点</span>
                    <strong>サンプル学童 まなびや教室</strong>
                </div>
                <div className="lp-mock__info-id">スタッフID：<code>STAFF-0042</code></div>
            </div>

            <p className="lp-mock__note">※このQRは「出勤打刻」専用です（児童受付では使用しません）</p>
        </div>
    </div>
);

/** Visual-only dummy QR (not scannable). 17x17 grid. */
const DummyQr: React.FC = () => {
    const cells: boolean[] = [];
    let seed = 7;
    for (let i = 0; i < 17 * 17; i++) {
        seed = (seed * 9301 + 49297) % 233280;
        cells.push(seed % 100 < 48);
    }
    const isFinder = (r: number, c: number) => {
        const inBox = (r0: number, c0: number) =>
            r >= r0 && r < r0 + 7 && c >= c0 && c < c0 + 7;
        return inBox(0, 0) || inBox(0, 10) || inBox(10, 0);
    };
    const isFinderInner = (r: number, c: number) => {
        const inBox = (r0: number, c0: number) =>
            r >= r0 + 2 && r < r0 + 5 && c >= c0 + 2 && c < c0 + 5;
        return inBox(0, 0) || inBox(0, 10) || inBox(10, 0);
    };
    const isFinderRing = (r: number, c: number) => isFinder(r, c) && !isFinderInner(r, c);
    const isFinderHole = (r: number, c: number) => {
        const inBox = (r0: number, c0: number) =>
            (r === r0 + 1 || r === r0 + 5) && c >= c0 + 1 && c <= c0 + 5
            || (c === c0 + 1 || c === c0 + 5) && r >= r0 + 1 && r <= r0 + 5;
        return inBox(0, 0) || inBox(0, 10) || inBox(10, 0);
    };

    return (
        <svg viewBox="0 0 17 17" className="lp-mock__qr" role="img" aria-label="QRコード（イメージ）">
            <rect width="17" height="17" fill="#ffffff" />
            {cells.map((on, i) => {
                const r = Math.floor(i / 17);
                const c = i % 17;
                if (isFinder(r, c)) {
                    if (isFinderHole(r, c)) return null;
                    if (isFinderRing(r, c) || isFinderInner(r, c)) {
                        return <rect key={i} x={c} y={r} width="1" height="1" fill="#0f172a" />;
                    }
                    return null;
                }
                if (!on) return null;
                return <rect key={i} x={c} y={r} width="1" height="1" fill="#0f172a" />;
            })}
        </svg>
    );
};

/* ===================== Screen 2: Attendance Intents ===================== */

const AttendanceIntentsScreen: React.FC = () => {
    const children = [
        { name: 'さとう だいち',   kana: 'サトウ ダイチ',   status: 'absent', pickup: 'unconfirmed' as const, ride: '未', tag: '送迎' },
        { name: 'たかはし みゆ',   kana: 'タカハシ ミユ',   status: 'arrived', pickup: 'confirmed' as const,   ride: '済 16:42', tag: '送迎' },
        { name: 'やまもと そう',   kana: 'ヤマモト ソウ',   status: 'arrived', pickup: 'none' as const,        ride: '',          tag: '' },
        { name: 'なかがわ あおい', kana: 'ナカガワ アオイ', status: 'arrived', pickup: 'unconfirmed' as const, ride: '未',        tag: '送迎' },
    ];

    const statusClass = (s: string, p: string) => {
        if (s === 'absent') return 'lp-mock__child--absent';
        if (s === 'arrived' && p === 'unconfirmed') return 'lp-mock__child--pickup';
        return 'lp-mock__child--ok';
    };

    return (
        <div className="lp-mock lp-mock--attendance">
            <div className="lp-mock__app-header">
                <span className="lp-mock__app-back">‹</span>
                <span className="lp-mock__app-title">参加予定・送迎管理</span>
                <span className="lp-mock__app-menu">≡</span>
            </div>

            <div className="lp-mock__date">
                <span>📅 2026/04/30 (火)</span>
                <span className="lp-mock__chip lp-mock__chip--soft">本日</span>
            </div>

            <div className="lp-mock__base">
                <div className="lp-mock__base-head">
                    <strong>サンプル学童 まなびや教室</strong>
                    <span className="lp-mock__chev">▾</span>
                </div>
                <div className="lp-mock__chips">
                    <span className="lp-mock__chip">予定 12</span>
                    <span className="lp-mock__chip lp-mock__chip--accent">送迎 4</span>
                    <span className="lp-mock__chip">車 2台</span>
                </div>
            </div>

            <div className="lp-mock__children">
                {children.map((c) => (
                    <div key={c.name} className={`lp-mock__child ${statusClass(c.status, c.pickup)}`}>
                        <div className="lp-mock__child-head">
                            <div>
                                <div className="lp-mock__child-name">{c.name}</div>
                                <div className="lp-mock__child-kana">{c.kana}</div>
                            </div>
                            {c.tag && <span className="lp-mock__child-tag">{c.tag}</span>}
                        </div>
                        <div className="lp-mock__child-status">
                            <span className={`lp-mock__pill ${c.status === 'absent' ? 'lp-mock__pill--red' : 'lp-mock__pill--ok'}`}>
                                {c.status === 'absent' ? '未到着' : '出席済'}
                            </span>
                            {c.ride && <span className="lp-mock__time">{c.ride}</span>}
                        </div>
                        {c.pickup !== 'none' && (
                            <button
                                type="button"
                                className={`lp-mock__pickup ${c.pickup === 'confirmed' ? 'is-on' : ''}`}
                                disabled
                            >
                                <span aria-hidden="true">🚐</span>
                                <span>乗車：{c.pickup === 'confirmed' ? '済' : '未'}</span>
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

/* ===================== Screen 3: Chats ===================== */

const ChatsScreen: React.FC = () => {
    const threads = [
        { name: 'さとう ご両親', child: 'さとう だいち', last: '本日お迎えが17:30になります。', time: '15:42', unread: 2 },
        { name: 'たかはし ご両親', child: 'たかはし みゆ', last: '熱が下がったので明日は出席します。', time: '13:08', unread: 0 },
        { name: 'やまもと ご両親', child: 'やまもと そう', last: 'おやつのアレルギー確認お願いします。', time: '11:51', unread: 1 },
        { name: 'なかがわ ご両親', child: 'なかがわ あおい', last: '送迎の集合場所を変更したいです。', time: '昨日', unread: 0 },
    ];
    return (
        <div className="lp-mock lp-mock--chats">
            <div className="lp-mock__app-header">
                <span className="lp-mock__app-back">‹</span>
                <span className="lp-mock__app-title">保護者チャット</span>
                <span className="lp-mock__app-menu">≡</span>
            </div>

            <div className="lp-mock__filter">
                <input className="lp-mock__search" placeholder="🔎 保護者名 / 児童名" disabled />
                <button className="lp-mock__chip lp-mock__chip--filter is-on" type="button" disabled>未読のみ</button>
            </div>

            <div className="lp-mock__unread">
                <div className="lp-mock__unread-head">
                    <strong>未読あり</strong><span>3件</span>
                </div>
            </div>

            <ul className="lp-mock__threads">
                {threads.map((t) => (
                    <li key={t.name} className="lp-mock__thread">
                        <div className="lp-mock__avatar">{t.name[0]}</div>
                        <div className="lp-mock__thread-body">
                            <div className="lp-mock__thread-top">
                                <strong>{t.name}</strong>
                                <span>{t.time}</span>
                            </div>
                            <div className="lp-mock__thread-child">児童：{t.child}</div>
                            <div className="lp-mock__thread-last">{t.last}</div>
                        </div>
                        {t.unread > 0 && (
                            <span className="lp-mock__badge">{t.unread}</span>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default AppScreens;
