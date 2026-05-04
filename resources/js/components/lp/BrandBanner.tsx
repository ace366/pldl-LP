import React from 'react';
import { asset } from '../../lib/asset';

const BrandBanner: React.FC = () => {
    return (
        <section className="lp-brand-banner" aria-label="Gakudoor ブランド">
            <div className="lp-brand-banner__inner">
                <img
                    className="lp-brand-banner__img"
                    src={asset('/images/gakudoor-banner.png')}
                    alt="Gakudoor（ガクドア）"
                    loading="lazy"
                    data-reveal=""
                    data-reveal-from="scale"
                />
                <p className="lp-brand-banner__caption" data-reveal="" data-reveal-delay="160">
                    <strong>Gakudoor（ガクドア）</strong>で、保護者・施設・自治体をつなぐ新しい学童運営の入り口へ。
                </p>
            </div>
        </section>
    );
};

export default BrandBanner;
