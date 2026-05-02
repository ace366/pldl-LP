import React from 'react';

const YOUTUBE_ID = 'RIZlv2AMvcw';

const VideoSection: React.FC = () => {
    return (
        <section className="lp-section lp-section--soft" id="video">
            <div className="lp-container">
                <header className="lp-section__head">
                    <p className="lp-section__eyebrow">Movie</p>
                    <h2 className="lp-section__title">
                        動画でわかる、現場のための学童DX。
                    </h2>
                    <p className="lp-section__lead">
                        現場の課題と、本システムでどう解決しているかを、短い動画にまとめました。
                    </p>
                </header>

                <div className="lp-video">
                    <div className="lp-video__frame">
                        <iframe
                            src={`https://www.youtube-nocookie.com/embed/${YOUTUBE_ID}?rel=0`}
                            title="学童管理システム 紹介動画"
                            loading="lazy"
                            referrerPolicy="strict-origin-when-cross-origin"
                            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                        />
                    </div>
                </div>

                <p className="lp-video__flow">
                    紹介動画 <span aria-hidden="true">→</span> 15分デモ <span aria-hidden="true">→</span> 無料トライアル
                </p>
            </div>
        </section>
    );
};

export default VideoSection;
