import React from 'react';
import type { LpSettings } from './types';

type Props = { settings: LpSettings };

const Pricing: React.FC<Props> = ({ settings }) => {
    const plans = [
        {
            key: 'light',
            name: 'ライト',
            price: '9,800',
            unit: '円 / 月〜',
            target: '小規模・1施設向け',
            features: [
                '欠席・遅刻連絡',
                'お迎え変更管理',
                '基本通知',
                '月次CSV',
            ],
            recommended: false,
        },
        {
            key: 'standard',
            name: 'スタンダード',
            price: '29,800',
            unit: '円 / 月〜',
            target: '中規模・標準的な学童向け',
            features: [
                'ライトの全機能',
                'QR出席確認',
                '保護者通知強化',
                '履歴保存',
                'メール / LINE 通知',
            ],
            recommended: true,
        },
        {
            key: 'enterprise',
            name: '法人・複数施設',
            price: '49,800',
            unit: '円 / 月〜',
            target: '法人運営・複数拠点向け',
            features: [
                'スタンダードの全機能',
                '複数施設管理',
                '権限管理',
                '個別カスタマイズ相談',
            ],
            recommended: false,
        },
    ];

    return (
        <section className="lp-section" id="pricing">
            <div className="lp-container">
                <header className="lp-section__head">
                    <p className="lp-section__eyebrow">Pricing</p>
                    <h2 className="lp-section__title">スモールスタートできる、わかりやすい料金。</h2>
                    {(settings.showInitialFeeZero || settings.showSupportFree) && (
                        <p className="lp-section__lead">
                            {settings.showInitialFeeZero && (
                                <span className="lp-pill lp-pill--accent">先着5施設：初期費用 0円</span>
                            )}
                            {settings.showSupportFree && (
                                <span className="lp-pill lp-pill--accent">導入サポート 無料</span>
                            )}
                        </p>
                    )}
                </header>

                <div className="lp-grid lp-grid--3 lp-pricing">
                    {plans.map((p) => (
                        <article
                            key={p.key}
                            className={`lp-plan${p.recommended ? ' lp-plan--recommended' : ''}`}
                        >
                            {p.recommended && <span className="lp-plan__ribbon">おすすめ</span>}
                            <h3 className="lp-plan__name">{p.name}</h3>
                            <p className="lp-plan__target">{p.target}</p>
                            <p className="lp-plan__price">
                                <span className="lp-plan__price-num">{p.price}</span>
                                <span className="lp-plan__price-unit">{p.unit}</span>
                            </p>
                            <ul className="lp-plan__features">
                                {p.features.map((f) => (
                                    <li key={f}>{f}</li>
                                ))}
                            </ul>
                            <a
                                className="lp-btn lp-btn--primary lp-btn--block"
                                href="#contact"
                                onClick={() => {
                                    window.dispatchEvent(
                                        new CustomEvent('lp:select-plan', { detail: p.key })
                                    );
                                }}
                            >
                                このプランで相談する
                            </a>
                        </article>
                    ))}
                </div>

                <p className="lp-pricing__note">
                    ※ 表示価格は税抜きです。施設規模・要件により最適なプランをご提案します。
                </p>
            </div>
        </section>
    );
};

export default Pricing;
