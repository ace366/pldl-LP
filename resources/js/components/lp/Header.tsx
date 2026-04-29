import React, { useEffect, useState } from 'react';
import type { LpSettings } from './types';

type Props = { settings: LpSettings };

const Header: React.FC<Props> = ({ settings }) => {
    const [scrolled, setScrolled] = useState(false);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 8);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const navLinks = [
        { href: '#why', label: 'なぜPLDLか' },
        { href: '#issues', label: '現場課題' },
        { href: '#features', label: '解決できること' },
        { href: '#pricing', label: '料金' },
        { href: '#contact', label: 'お問い合わせ' },
    ];

    return (
        <header className={`lp-header${scrolled ? ' is-scrolled' : ''}`}>
            <div className="lp-header__inner">
                <a href="#top" className="lp-header__brand" aria-label="NPO法人 Playful Learning Design Lab.">
                    <img
                        src="/images/ver2.png"
                        alt="NPO法人 Playful Learning Design Lab."
                        className="lp-header__brand-logo"
                        width="160"
                        height="84"
                    />
                </a>

                <nav className={`lp-header__nav${open ? ' is-open' : ''}`}>
                    <ul>
                        {navLinks.map((l) => (
                            <li key={l.href}>
                                <a href={l.href} onClick={() => setOpen(false)}>
                                    {l.label}
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className="lp-header__cta">
                    {settings.lineConsultUrl && (
                        <a
                            className="lp-btn lp-btn--ghost lp-btn--sm"
                            href={settings.lineConsultUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            LINE相談
                        </a>
                    )}
                    <a className="lp-btn lp-btn--primary lp-btn--sm" href="#contact">
                        無料デモを予約
                    </a>
                </div>

                <button
                    type="button"
                    className={`lp-header__burger${open ? ' is-open' : ''}`}
                    aria-label="メニュー"
                    aria-expanded={open}
                    onClick={() => setOpen((v) => !v)}
                >
                    <span /><span /><span />
                </button>
            </div>
        </header>
    );
};

export default Header;
