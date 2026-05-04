import React from 'react';
import { asset } from '../../lib/asset';

const Footer: React.FC = () => {
    return (
        <footer className="lp-footer">
            <div className="lp-container">
                <div className="lp-footer__brand">
                    <p className="lp-footer__org-eyebrow">サービス名</p>
                    <h3 className="lp-footer__org-title">
                        <img
                            src={asset('/images/gakudoor-logo.png')}
                            alt=""
                            width="36"
                            height="36"
                            style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: 10 }}
                        />
                        Gakudoor（ガクドア）
                    </h3>
                    <p className="lp-footer__org-body">
                        Gakudoor（ガクドア）は、学童クラブ・放課後児童クラブ向けの運営支援システムです。
                        欠席連絡、出欠確認、お迎え予定、保護者連絡、施設側の管理業務をスマホ・PCからまとめて扱えるようにし、
                        電話対応や紙の管理にかかる負担を減らします。
                    </p>
                    <div className="lp-footer__meta">
                        <p className="lp-footer__meta-row">
                            <span className="lp-footer__meta-label">開発・提供</span>
                            <span className="lp-footer__meta-value">株式会社Rezon</span>
                        </p>
                        <p className="lp-footer__meta-row">
                            <span className="lp-footer__meta-label">導入実績</span>
                            <span className="lp-footer__meta-value">
                                NPO法人 Playful Learning Design Lab.（PLDL）様
                            </span>
                        </p>
                    </div>
                </div>

                <div className="lp-footer__bottom">
                    <p>© {new Date().getFullYear()} 株式会社Rezon</p>
                    <ul className="lp-footer__links">
                        <li><a href="#adoption">導入実績</a></li>
                        <li><a href="#contact">お問い合わせ</a></li>
                    </ul>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
