import React from 'react';
import { createRoot } from 'react-dom/client';
import GakudoLp, { type LpSettings } from './pages/GakudoLp';

const mount = document.getElementById('gakudo-lp-root');

if (mount) {
    let settings: LpSettings = {
        lineConsultUrl: '',
        introVideoUrl: '',
        documentRequestUrl: '',
        fvCtaText: '無料デモを予約する',
        campaignText: '',
        showInitialFeeZero: false,
        showSupportFree: false,
        receptionClosed: false,
        receptionClosedMsg: '',
        gaMeasurementId: '',
        gscVerification: '',
        contactEndpoint: '/gakudo/contact',
    };

    const raw = mount.getAttribute('data-settings');
    if (raw) {
        try {
            settings = { ...settings, ...JSON.parse(raw) } as LpSettings;
        } catch {
            // ignore JSON parse errors and fall back to defaults
        }
    }

    createRoot(mount).render(
        <React.StrictMode>
            <GakudoLp settings={settings} />
        </React.StrictMode>,
    );
}
