import React from 'react';
import { asset } from '../../lib/asset';

const AdoptionRecord: React.FC = () => {
    return (
        <section className="lp-section" id="adoption">
            <div className="lp-container lp-container--narrow">
                <header className="lp-section__head" data-reveal="">
                    <p className="lp-section__eyebrow">Adoption</p>
                    <h2 className="lp-section__title">導入実績</h2>
                    <p className="lp-section__lead">
                        Gakudoorは、以下の団体に採用いただいています。
                    </p>
                </header>

                <article className="lp-adoption" data-reveal="" data-reveal-delay="120">
                    <figure className="lp-adoption__scene">
                        <img
                            src={asset('/images/gakudoor-scene.png')}
                            alt="学童の現場で Gakudoor が活用されているイメージ"
                            loading="lazy"
                        />
                    </figure>

                    <div className="lp-adoption__body-wrap">
                        <div className="lp-adoption__head">
                            <span className="lp-adoption__pill">採用団体</span>
                            <h3 className="lp-adoption__name">
                                NPO法人 Playful Learning Design Lab.（PLDL）様
                            </h3>
                        </div>
                        <p className="lp-adoption__body">
                            Gakudoorは、NPO法人 Playful Learning Design Lab.（PLDL）様に採用いただき、
                            実際の学童運営の現場で活用されています。
                            現場での運用を通じて、保護者連絡・出欠確認・お迎え管理など、
                            日々の業務に合う形で改善を重ねています。
                        </p>
                        <a
                            className="lp-adoption__link"
                            href="https://pldl.or.jp/"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            NPO法人 Playful Learning Design Lab. 公式サイト →
                        </a>
                    </div>
                </article>

                <p className="lp-adoption__caution">
                    ※ 採用団体ロゴ・名称の掲載については、各団体の許諾範囲内で行っています。
                </p>
            </div>
        </section>
    );
};

export default AdoptionRecord;
