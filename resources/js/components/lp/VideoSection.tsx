import React from 'react';
import type { LpSettings } from './types';

type Props = { settings: LpSettings };

const VideoSection: React.FC<Props> = ({ settings }) => {
    const url = settings.introVideoUrl;

    return (
        <section className="lp-section lp-section--soft" id="video">
            <div className="lp-container">
                <header className="lp-section__head">
                    <p className="lp-section__eyebrow">3 minutes</p>
                    <h2 className="lp-section__title">3分でわかる、現場のための学童DX。</h2>
                    <p className="lp-section__lead">
                        現場の課題と、本システムでどう解決しているかを、3分にまとめました。
                    </p>
                </header>

                <div className="lp-video">
                    {url ? (
                        <a
                            className="lp-video__thumb"
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="3分紹介動画を再生"
                        >
                            <span className="lp-video__play" aria-hidden="true">▶</span>
                            <span className="lp-video__caption">3分紹介を見る</span>
                        </a>
                    ) : (
                        <div className="lp-video__thumb lp-video__thumb--placeholder">
                            <span className="lp-video__play" aria-hidden="true">▶</span>
                            <span className="lp-video__caption">動画は近日公開</span>
                        </div>
                    )}
                </div>

                <p className="lp-video__flow">
                    3分動画 <span aria-hidden="true">→</span> 15分デモ <span aria-hidden="true">→</span> 無料トライアル
                </p>
            </div>
        </section>
    );
};

export default VideoSection;
