import React from 'react';
import { asset } from '../../lib/asset';

const VIDEO_SRC = '/videos/gakudoor-intro.mp4';

const VideoSection: React.FC = () => {
    return (
        <section className="lp-section lp-section--soft" id="video">
            <div className="lp-container">
                <header className="lp-section__head" data-reveal="">
                    <p className="lp-section__eyebrow">Movie</p>
                    <h2 className="lp-section__title">
                        動画でわかる、Gakudoorの全体像。
                    </h2>
                    <p className="lp-section__lead">
                        現場の課題と、Gakudoorでどう解決しているかを、短い動画にまとめました。
                    </p>
                </header>

                <div className="lp-video" data-reveal="" data-reveal-from="scale" data-reveal-delay="120">
                    <div className="lp-video__frame">
                        <video
                            controls
                            preload="metadata"
                            playsInline
                            controlsList="nodownload"
                        >
                            <source src={asset(VIDEO_SRC)} type="video/mp4" />
                            お使いのブラウザは動画再生に対応していません。
                        </video>
                    </div>
                </div>

                <p className="lp-video__flow" data-reveal="" data-reveal-delay="240">
                    紹介動画 <span aria-hidden="true">→</span> 15分デモ <span aria-hidden="true">→</span> 無料相談
                </p>
            </div>
        </section>
    );
};

export default VideoSection;
