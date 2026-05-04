import React from 'react';
import type { LpSettings } from './types';
import { asset } from '../../lib/asset';

type Props = { settings: LpSettings };

const Hero: React.FC<Props> = ({ settings }) => {
    return (
        <section className="lp-hero" id="top">
            <div className="lp-container">
                <div>
                    <img
                        className="lp-hero__brand"
                        src={asset('/images/gakudoor-brand-stack.png')}
                        alt="Gakudoor（ガクドア）"
                        width="320"
                        height="180"
                        data-reveal=""
                    />
                    <p className="lp-hero__brand-sub" data-reveal="" data-reveal-delay="80">ガクドア｜学童運営支援システム</p>

                    <div className="lp-hero__badges" data-reveal="" data-reveal-delay="160">
                        <span className="lp-badge">スマホで完結</span>
                        <span className="lp-badge lp-badge--alt">自治体・NPO・施設向け</span>
                    </div>

                    <h1 className="lp-hero__title" data-reveal="" data-reveal-delay="220">
                        学童の連絡・出欠・お迎え管理を、<br />
                        <span className="lp-hero__title-em">スマホでやさしく</span>一本化。
                    </h1>

                    <p className="lp-hero__sub" data-reveal="" data-reveal-delay="320">
                        <strong>Gakudoor（ガクドア）</strong>は、電話・紙・口頭連絡に頼りがちな学童運営を、
                        保護者・施設・自治体がつながる安心の仕組みに変える学童運営支援システムです。
                    </p>

                    <p className="lp-hero__adoption" aria-label="導入実績" data-reveal="" data-reveal-delay="400">
                        <span className="lp-hero__adoption-pill">導入実績</span>
                        <span>
                            <strong>NPO法人 Playful Learning Design Lab.（PLDL）</strong>様
                        </span>
                    </p>

                    {!!settings.campaignText && (
                        <p className="lp-hero__campaign" data-reveal="" data-reveal-delay="460">
                            <span aria-hidden="true">★</span> {settings.campaignText}
                        </p>
                    )}

                    <div className="lp-hero__ctas" data-reveal="" data-reveal-delay="520">
                        <a className="lp-btn lp-btn--primary lp-btn--lg" href="#contact">
                            {settings.fvCtaText || '無料相談する'}
                        </a>
                        {settings.pamphletUrl && (
                            <a
                                className="lp-btn lp-btn--ghost lp-btn--lg"
                                href={asset(settings.pamphletUrl)}
                                target="_blank"
                                rel="noopener noreferrer"
                                download
                            >
                                <span aria-hidden="true">📄</span> 資料をダウンロード（PDF）
                            </a>
                        )}
                        {settings.lineConsultUrl && (
                            <a
                                className="lp-btn lp-btn--ghost lp-btn--lg"
                                href={settings.lineConsultUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                LINE相談
                            </a>
                        )}
                    </div>

                    <p className="lp-hero__note">
                        押し売りはしません。15分のオンラインデモから、お気軽にどうぞ。
                    </p>
                </div>

                <div className="lp-hero__visual" data-reveal="" data-reveal-from="right" data-reveal-delay="200">
                    <div className="lp-hero__phone" aria-hidden="true">
                        <div className="lp-hero__phone-screen">
                            <div className="lp-hero__phone-row lp-hero__phone-row--head">
                                <img src={asset('/images/attendance.png')} alt="" width="20" height="20" />
                                <span>本日の出席</span>
                                <span className="lp-hero__phone-pill">38 / 42</span>
                            </div>
                            <div className="lp-hero__phone-row">
                                <img src={asset('/images/press.png')} alt="" width="20" height="20" />
                                <span>欠席連絡</span>
                                <span>4件 受信</span>
                            </div>
                            <div className="lp-hero__phone-row">
                                <img src={asset('/images/car.png')} alt="" width="20" height="20" />
                                <span>お迎え変更</span>
                                <span>2件</span>
                            </div>
                            <div className="lp-hero__phone-row lp-hero__phone-row--ok">
                                <img src={asset('/images/send.png')} alt="" width="20" height="20" />
                                <span>保護者通知</span>
                                <span>送信済み</span>
                            </div>
                            <div className="lp-hero__phone-row lp-hero__phone-row--soft">
                                <img src={asset('/images/QR.png')} alt="" width="20" height="20" />
                                <span>QR出席</span>
                                <span>稼働中</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
