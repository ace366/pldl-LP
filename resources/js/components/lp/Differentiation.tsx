import React from 'react';

const rows = [
    { label: '開発元', us: '教育現場を運営する NPO（PLDL）', them: 'IT企業・営業会社' },
    { label: '相談相手', us: '開発者本人と直接相談できる', them: '営業窓口経由・担当者交代あり' },
    { label: '現場知見', us: '実際の運営から仕様を設計', them: '一般的なヒアリングベース' },
    { label: 'QRカード忘れ対応', us: '手入力フォールバック標準搭載', them: 'スキャン不可のままになりがち' },
    { label: '受付の体験', us: '音声案内・なぞなぞ表示で子どもにやさしく', them: '事務的な打刻のみ' },
    { label: 'きょうだい管理', us: 'きょうだい紐付け・1タップで往復', them: '別々の児童として個別管理' },
    { label: '保護者通知', us: 'LINE連携・既読確認・画像添付対応', them: 'メール通知中心・確認状況不明' },
    { label: '送迎対応', us: '送迎要否・乗車済みを画面で共有', them: '紙やホワイトボードで管理' },
    { label: 'TEL票・履歴', us: '電話／面談／メールを履歴で保存', them: '個人ノート任せで属人化' },
    { label: '出力', us: 'CSV / PDF を月次・施設別に出力', them: 'CSVのみ・固定フォーマット' },
    { label: 'スタッフ運用', us: '出勤QR・シフト・給与まで一体運用', them: '別システムを併用しがち' },
    { label: '権限管理', us: 'ロール別の閲覧／編集を細かく制御', them: '管理者・一般の2段階のみ' },
    { label: '改善方針', us: '現場の声を継続的に反映（NPO自身が利用）', them: '機能要望はチケット待ち' },
    { label: 'スタンス', us: '相談型・押し売りなし', them: '商談クロージング型' },
];

const Differentiation: React.FC = () => {
    return (
        <section className="lp-section lp-section--soft" id="diff">
            <div className="lp-container">
                <header className="lp-section__head">
                    <p className="lp-section__eyebrow">Difference</p>
                    <h2 className="lp-section__title">他社サービスと、ここが違います。</h2>
                    <p className="lp-section__lead">
                        現場で実運営しているからこそ気づいた細部に、確かな差があります。
                    </p>
                </header>

                <div className="lp-compare">
                    <div className="lp-compare__head">
                        <div></div>
                        <div className="lp-compare__head-us">PLDLの学童DX</div>
                        <div className="lp-compare__head-them">一般的なITサービス</div>
                    </div>
                    {rows.map((r) => (
                        <div className="lp-compare__row" key={r.label}>
                            <div className="lp-compare__label">{r.label}</div>
                            <div className="lp-compare__us">{r.us}</div>
                            <div className="lp-compare__them">{r.them}</div>
                        </div>
                    ))}
                </div>

                <p className="lp-compare__note">
                    ※ 比較対象は一般的に学童・教育施設で見かけるITサービスの傾向をまとめたものです。個別の他社サービスを指すものではありません。
                </p>
            </div>
        </section>
    );
};

export default Differentiation;
