import React from 'react';
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
import ContactForm from '../components/lp/ContactForm';
import Footer from '../components/lp/Footer';
import type { LpSettings } from '../components/lp/types';

export type { LpSettings };

type Props = {
    settings: LpSettings;
};

const GakudoLp: React.FC<Props> = ({ settings }) => {
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
                <ContactForm settings={settings} />
            </main>
            <Footer />
        </div>
    );
};

export default GakudoLp;
