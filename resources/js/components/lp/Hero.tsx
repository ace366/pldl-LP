import React from 'react';
import type { LpSettings } from './types';
import { asset } from '../../lib/asset';

type Props = { settings: LpSettings };

const Hero: React.FC<Props> = ({ settings }) => {
    return (
        <section className="lp-hero" id="top">
            <div className="lp-container">
                <div className="lp-hero__badges">
                    <span className="lp-badge">教育現場で実運営</span>
                    <span className="lp-badge lp-badge--alt">現場課題から開発</span>
                </div>

                <h1 className="lp-hero__title">
                    学童の電話・紙管理を、<br />
                    <span className="lp-hero__title-em">スマホでやさしく</span>効率化。
                </h1>

                <p className="lp-hero__sub">
                    欠席連絡、お迎え変更、出席確認、保護者通知を一元管理。<br />
                    教育現場で実際に子どもたちの学びの場を運営する
                    <strong>NPO法人 Playful Learning Design Lab.（PLDL）</strong>
                    の知見をもとに、現場で本当に使いやすい形へ整えました。
                </p>

                {!!settings.campaignText && (
                    <p className="lp-hero__campaign">
                        <span aria-hidden="true">★</span> {settings.campaignText}
                    </p>
                )}

                <div className="lp-hero__ctas">
                    <a className="lp-btn lp-btn--primary lp-btn--lg" href="#contact">
                        {settings.fvCtaText || '無料デモを予約する'}
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
                    押し売りはしません。15分デモ → 無料トライアル の順でご案内します。
                </p>

                <div className="lp-hero__visual">
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
