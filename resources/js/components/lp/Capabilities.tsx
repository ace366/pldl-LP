import React from 'react';

type Cap = { tag: string; title: string; body: string };

const groups: { eyebrow: string; title: string; items: Cap[] }[] = [
    {
        eyebrow: 'For Office',
        title: '事務・運営をやさしく',
        items: [
            { tag: '締め', title: '月次締め処理', body: '対象月の出席・延長・欠席をまとめて確定。請求やシフト計算の元データを安定させます。' },
            { tag: 'CSV', title: 'CSV / PDF 一括出力', body: '請求や行政提出に使える形式で出力。月次・施設別・児童別など切り口を選べます。' },
            { tag: '権限', title: 'ロール別権限管理', body: '管理者・主任・現場スタッフごとに「閲覧のみ／編集可」を細かく分けられます。' },
            { tag: 'お知らせ', title: 'お知らせ編集・画像添付', body: '献立や行事のお知らせを画像付きで配信。スマホでも崩れずに読めます。' },
        ],
    },
    {
        eyebrow: 'For Field Staff',
        title: '現場スタッフをやさしく',
        items: [
            { tag: 'QR', title: 'スタッフ出勤QR', body: 'マイページのQRをかざすだけで打刻。紙のタイムカードを廃止できます。' },
            { tag: 'シフト', title: 'シフト管理（カレンダー）', body: '月ごとのシフトを画面上で作成・編集。スタッフ画面からも自分の予定を確認できます。' },
            { tag: '勤怠', title: '勤怠ログ・修正履歴', body: '打刻ログ・修正履歴を残し、後追いの確認もしやすい形で保管します。' },
            { tag: '給与', title: '給与・源泉インポート', body: '時給・通勤手当・源泉徴収のCSV取り込みに対応。月末作業を圧縮します。' },
        ],
    },
    {
        eyebrow: 'For Families',
        title: '保護者をやさしく',
        items: [
            { tag: 'LINE', title: 'LINE連携・通知', body: '専用アプリ不要。LINEから通知が届き、お迎え変更や欠席連絡もスマホ完結。' },
            { tag: '兄弟', title: 'きょうだい・複数保護者', body: 'きょうだいの紐付け・続柄を保ったまま、保護者を複数登録できます。' },
            { tag: 'プロフィール', title: 'プロフィール／アバター', body: '保護者・児童のプロフィールやアイコン画像を保護者自身で更新できます。' },
            { tag: '利用予定', title: '日別の利用予定登録', body: '「この日だけ来る」「連休中はお休み」など、日別の利用予定をまとめて登録。' },
        ],
    },
    {
        eyebrow: 'For Children',
        title: '子どもにやさしく',
        items: [
            { tag: 'QR', title: '児童QRカード', body: '受付QRをかざすだけ。文字入力に頼らず、低学年でも自分で受付ができます。' },
            { tag: '音声', title: '受付音声案内（TTS）', body: '受付時に名前を音声で読み上げ。視認性が落ちる時間帯でも安心です。' },
            { tag: 'なぞなぞ', title: 'なぞなぞ表示', body: '受付後に小さな「なぞなぞ」を表示。義務的な打刻を、ささやかなワクワクへ。' },
            { tag: 'やさしいUI', title: '大きなタップ領域', body: '片手で操作できるよう、ボタンや余白を大きく・指で押しやすく設計しています。' },
        ],
    },
];

const Capabilities: React.FC = () => {
    return (
        <section className="lp-section lp-section--soft" id="capabilities">
            <div className="lp-container">
                <header className="lp-section__head" data-reveal="">
                    <p className="lp-section__eyebrow">More Capabilities</p>
                    <h2 className="lp-section__title">
                        運営に必要なものを、ひと通り。
                    </h2>
                    <p className="lp-section__lead">
                        基本機能のほかにも、現場で「あって良かった」と感じる細部を揃えています。
                        必要なものから段階的にご導入いただけます。
                    </p>
                </header>

                <div className="lp-cap">
                    {groups.map((g, i) => (
                        <article
                            key={g.title}
                            className="lp-cap__group"
                            data-reveal=""
                            data-reveal-delay={i * 100}
                        >
                            <p className="lp-cap__eyebrow">{g.eyebrow}</p>
                            <h3 className="lp-cap__title">{g.title}</h3>
                            <ul className="lp-cap__list">
                                {g.items.map((it) => (
                                    <li key={it.title} className="lp-cap__item">
                                        <span className="lp-cap__tag">{it.tag}</span>
                                        <div>
                                            <h4 className="lp-cap__item-title">{it.title}</h4>
                                            <p className="lp-cap__item-body">{it.body}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Capabilities;
