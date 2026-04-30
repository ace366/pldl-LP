import React from 'react';
import { asset } from '../../lib/asset';

const points = [
    {
        icon: '/images/school.png',
        title: '教育現場で実運営している法人',
        body: 'NPO法人 Playful Learning Design Lab.（PLDL）は、子どもたちの学びのワクワクを育み、安心して過ごせる居場所づくり・学びの場づくりに取り組む団体です。',
    },
    {
        icon: '/images/press.png',
        title: '現場課題から作ったDX',
        body: '実際の運営の中で見えてきた「電話ラッシュ」「紙の出席簿」「お迎え変更の共有漏れ」を解決するために設計しました。営業会社ではなく、現場のための仕組みです。',
    },
    {
        icon: '/images/guardian.png',
        title: '子どもと保護者の目線を理解',
        body: '子どもたちのサードプレイスとして、保護者の不安に寄り添う運営をしてきたからこそ、双方にとってやさしい体験設計を意識しています。',
    },
    {
        icon: '/images/info.png',
        title: '開発者本人と直接相談できる',
        body: '導入相談は営業任せにせず、開発者本人が現場の言葉で対応します。改善要望もそのまま現場に届きます。',
    },
];

const WhyPldl: React.FC = () => {
    return (
        <section className="lp-section" id="why">
            <div className="lp-container">
                <header className="lp-section__head">
                    <p className="lp-section__eyebrow">Why PLDL</p>
                    <h2 className="lp-section__title">
                        現場を知らないIT会社ではなく、<br />
                        教育現場を運営しているPLDLが作っています。
                    </h2>
                    <p className="lp-section__lead">
                        NPO法人 Playful Learning Design Lab.（PLDL）は、子どもたちの学びの場・居場所づくりに取り組む団体です。
                        実運営の中で見えてきた現場の課題を、そのままシステムに落とし込んでいます。
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

                <aside className="lp-org-card" aria-label="運営団体">
                    <div className="lp-org-card__inner">
                        <p className="lp-org-card__eyebrow">運営団体</p>
                        <h3 className="lp-org-card__title">
                            NPO法人 Playful Learning Design Lab.（PLDL）
                        </h3>
                        <p className="lp-org-card__body">
                            子どもたちの学びのワクワクを育み、安心して過ごせる居場所づくり・学びの場づくりに取り組む法人です。
                            現場で実際に運営・活動する中で見えてきた課題をもとに、本システムを開発しています。
                        </p>
                        <a
                            className="lp-btn lp-btn--ghost lp-btn--sm"
                            href="https://pldl.or.jp/"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            PLDLの活動を見る →
                        </a>
                    </div>
                </aside>
            </div>
        </section>
    );
};

export default WhyPldl;
