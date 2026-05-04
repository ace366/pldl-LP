import React, { useEffect, useState } from 'react';
import type { LpSettings } from './types';
import { asset } from '../../lib/asset';

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
        { href: '#why', label: 'Gakudoorとは' },
        { href: '#issues', label: '現場課題' },
        { href: '#features', label: '機能' },
        { href: '#adoption', label: '導入実績' },
        { href: '#contact', label: '相談する' },
    ];

    return (
        <header className={`lp-header${scrolled ? ' is-scrolled' : ''}`}>
            <div className="lp-header__inner">
                <a href="#top" className="lp-header__brand" aria-label="Gakudoor（ガクドア）トップへ">
                    <img
                        className="lp-header__brand-logo"
                        src={asset('/images/gakudoor-logo-horizontal.png')}
                        alt="Gakudoor（ガクドア）"
                        width="180"
                        height="40"
                    />
                    <span className="lp-header__brand-sub">学童運営支援システム</span>
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
                        無料相談する
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
