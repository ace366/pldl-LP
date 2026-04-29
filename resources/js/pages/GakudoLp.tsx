import React from 'react';
import Header from '../components/lp/Header';
import Hero from '../components/lp/Hero';
import WhyPldl from '../components/lp/WhyPldl';
import FieldIssues from '../components/lp/FieldIssues';
import Solutions from '../components/lp/Solutions';
import AppScreens from '../components/lp/AppScreens';
import VideoSection from '../components/lp/VideoSection';
import AfterEffects from '../components/lp/AfterEffects';
import Differentiation from '../components/lp/Differentiation';
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
                <WhyPldl />
                <FieldIssues />
                <Solutions />
                <AppScreens />
                <VideoSection settings={settings} />
                <AfterEffects />
                <Differentiation />
                <Pricing settings={settings} />
                <ContactForm settings={settings} />
            </main>
            <Footer />
        </div>
    );
};

export default GakudoLp;
