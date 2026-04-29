import React from 'react';

const Footer: React.FC = () => {
    return (
        <footer className="lp-footer">
            <div className="lp-container">
                <div className="lp-footer__brand">
                    <p className="lp-footer__org-eyebrow">運営団体</p>
                    <h3 className="lp-footer__org-title">
                        NPO法人 Playful Learning Design Lab.
                    </h3>
                    <p className="lp-footer__org-body">
                        子どもたちの学びのワクワクを育み、安心して過ごせる居場所づくり・学びの場づくりに取り組む団体です。
                        現場での実運営から得た知見をもとに、本システムを開発しています。
                    </p>
                    <a
                        className="lp-footer__org-link"
                        href="https://pldl.or.jp/"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        NPO法人 Playful Learning Design Lab. 公式サイト →
                    </a>
                </div>

                <div className="lp-footer__bottom">
                    <p>© {new Date().getFullYear()} NPO法人 Playful Learning Design Lab.（PLDL）</p>
                    <ul className="lp-footer__links">
                        <li>
                            <a href="https://pldl.or.jp/" target="_blank" rel="noopener noreferrer">
                                運営団体について
                            </a>
                        </li>
                        <li><a href="#contact">お問い合わせ</a></li>
                    </ul>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
