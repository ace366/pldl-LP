import React from 'react';
import { asset } from '../../lib/asset';

const points = [
    {
        icon: '/images/school.png',
        title: '現場の運営実態に合わせた仕組み',
        body: 'Gakudoorは「電話ラッシュ」「紙の出席簿」「お迎え変更の共有漏れ」など、学童の現場で実際に起きている業務をそのまま起点に設計しています。日々の運営に馴染む形でご利用いただけます。',
    },
    {
        icon: '/images/parents.png',
        title: 'やさしいUIで、現場の誰もが迷わない',
        body: '紙と電話に慣れた支援員、保護者、お子さままで、誰もが迷わず操作できることを最優先に設計。ITの専門知識は不要です。',
    },
    {
        icon: '/images/save.png',
        title: '小さく始めて、段階的に拡張できる',
        body: '欠席連絡だけ・出欠管理だけ、といった部分導入から開始可能。施設の体制やタイミングに合わせて、必要な機能を順番に拡張していけます。',
    },
    {
        icon: '/images/info.png',
        title: '採用団体の運用実績をもとに改善',
        body: 'NPO法人 Playful Learning Design Lab.（PLDL）様での実運用を通じて、現場の声を反映しながら継続的に改善を重ねています。実際の業務に合う形へ整えています。',
    },
];

const WhyGakudoor: React.FC = () => {
    return (
        <section className="lp-section" id="why">
            <div className="lp-container">
                <header className="lp-section__head">
                    <p className="lp-section__eyebrow">Why Gakudoor</p>
                    <h2 className="lp-section__title">
                        紙と電話の学童運営から、<br />
                        スマホでつながる新しい入り口へ。
                    </h2>
                    <p className="lp-section__lead">
                        Gakudoor（ガクドア）は、保護者・施設・自治体をつなぐ「学童への入り口」として、
                        現場の運営に寄り添う仕組みづくりを目指しています。
                    </p>
                </header>

                <div className="lp-grid lp-grid--2">
                    {points.map((p) => (
                        <article key={p.title} className="lp-card lp-card--with-icon">
                            <img className="lp-card__icon" src={asset(p.icon)} alt="" width="64" height="64" />
                            <div>
                                <h3 className="lp-card__title">{p.title}</h3>
                                <p className="lp-card__body">{p.body}</p>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default WhyGakudoor;
