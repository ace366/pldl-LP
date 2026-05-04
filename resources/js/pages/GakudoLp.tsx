import React, { useEffect } from 'react';
import { initScrollReveal } from '../lib/scrollReveal';
import Header from '../components/lp/Header';
import Hero from '../components/lp/Hero';
import VideoSection from '../components/lp/VideoSection';
import WhyGakudoor from '../components/lp/WhyGakudoor';
import FieldIssues from '../components/lp/FieldIssues';
import Solutions from '../components/lp/Solutions';
import AppScreens from '../components/lp/AppScreens';
import Capabilities from '../components/lp/Capabilities';
import AfterEffects from '../components/lp/AfterEffects';
import Differentiation from '../components/lp/Differentiation';
import AdoptionRecord from '../components/lp/AdoptionRecord';
import Pricing from '../components/lp/Pricing';
import BrandBanner from '../components/lp/BrandBanner';
import ContactForm from '../components/lp/ContactForm';
import Footer from '../components/lp/Footer';
import type { LpSettings } from '../components/lp/types';

export type { LpSettings };

type Props = {
    settings: LpSettings;
};

const GakudoLp: React.FC<Props> = ({ settings }) => {
    useEffect(() => {
        // 初回ペイント直後に observe 開始。すでにビューポート内の要素は
        // すぐに is-inview が付き、初期描画と同時にトランジションが走る。
        const dispose = initScrollReveal();
        return dispose;
    }, []);

    return (
        <div className="lp-root">
            <Header settings={settings} />
            <main>
                <Hero settings={settings} />
                <VideoSection />
                <WhyGakudoor />
                <FieldIssues />
                <Solutions />
                <AppScreens />
                <Capabilities />
                <AfterEffects />
                <Differentiation />
                <AdoptionRecord />
                <Pricing settings={settings} />
                <BrandBanner />
                <ContactForm settings={settings} />
            </main>
            <Footer />
        </div>
    );
};

export default GakudoLp;
