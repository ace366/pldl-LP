import React from 'react';

const items = [
    {
        before: '朝の電話対応に追われ、子どもを見る時間が削られる',
        after: '欠席連絡はスマホで受信。朝の現場運営に集中できる',
    },
    {
        before: 'お迎え変更が口頭だけで、共有漏れが発生',
        after: '変更は全スタッフに自動共有。引継ぎミスが減る',
    },
    {
        before: '紙の出席簿を毎日記入し、月末に転記集計',
        after: 'QRで出席記録 → CSVでワンクリック集計',
    },
    {
        before: '保護者対応がベテラン頼みで属人化',
        after: '履歴が残り、誰でも経緯を把握して対応できる',
    },
];

const AfterEffects: React.FC = () => {
    return (
        <section className="lp-section" id="after">
            <div className="lp-container">
                <header className="lp-section__head" data-reveal="">
                    <p className="lp-section__eyebrow">After</p>
                    <h2 className="lp-section__title">導入後、現場はこう変わります。</h2>
                </header>

                <ul className="lp-effects">
                    {items.map((it, i) => (
                        <li
                            key={i}
                            className="lp-effect"
                            data-reveal=""
                            data-reveal-delay={i * 80}
                        >
                            <div className="lp-effect__before">
                                <span className="lp-effect__label">Before</span>
                                <p>{it.before}</p>
                            </div>
                            <div className="lp-effect__arrow" aria-hidden="true">→</div>
                            <div className="lp-effect__after">
                                <span className="lp-effect__label lp-effect__label--after">After</span>
                                <p>{it.after}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
};

export default AfterEffects;
