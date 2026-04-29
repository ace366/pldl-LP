import React from 'react';

const rows = [
    { label: '開発元', us: '教育現場を運営する NPO（PLDL）', them: 'IT企業・営業会社' },
    { label: '相談相手', us: '開発者本人と直接相談できる', them: '営業窓口経由' },
    { label: '現場知見', us: '実際の運営経験から仕様を設計', them: 'ヒアリングベース' },
    { label: '改善方針', us: '現場の声を継続的に反映', them: '機能要望はチケット待ち' },
    { label: 'スタンス', us: '相談型・押し売りなし', them: '商談クロージング型' },
];

const Differentiation: React.FC = () => {
    return (
        <section className="lp-section lp-section--soft" id="diff">
            <div className="lp-container">
                <header className="lp-section__head">
                    <p className="lp-section__eyebrow">Difference</p>
                    <h2 className="lp-section__title">他社サービスと、ここが違います。</h2>
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
            </div>
        </section>
    );
};

export default Differentiation;
