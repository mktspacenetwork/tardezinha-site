import React, { useState, useLayoutEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import Header from './components/Header';
import Countdown from './components/Countdown';
import EventDetails from './components/EventDetails';
import Gallery from './components/Gallery';
import Checkin from './components/Checkin';
import PurchaseOptions from './components/PurchaseOptions';
import PromoSection from './components/PromoSection';
import FAQ from './components/FAQ';
import Footer from './components/Footer';
import Admin from './components/Admin';
import Rules from './components/Rules';

const App: React.FC = () => {
  const [showPurchaseIntro, setShowPurchaseIntro] = useState(false);
  const [isAdminView, setIsAdminView] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const scrollPositionRef = useRef(0);

  const handleAdminEnter = () => {
    // Save the current scroll position before switching views
    scrollPositionRef.current = window.scrollY;
    // Scroll to top for the admin view
    window.scrollTo(0, 0);
    setIsAdminView(true);
  };

  const handleAdminExit = () => {
    setIsAdminView(false);
  };

  const handleOpenRules = () => {
    scrollPositionRef.current = window.scrollY;
    window.scrollTo(0, 0);
    setShowRules(true);
  };

  const handleCloseRules = () => {
    setShowRules(false);
  };

  // This effect restores the scroll position after exiting the admin/rules view
  useLayoutEffect(() => {
    if (!isAdminView && !showRules) {
      // When the main site is re-rendered, scroll back to where the user was
      window.scrollTo(0, scrollPositionRef.current);
    }
  }, [isAdminView, showRules]);

  if (isAdminView) {
    return <Admin onExitAdmin={handleAdminExit} />;
  }

  if (showRules) {
    return <Rules onBack={handleCloseRules} />;
  }

  return (
    <div className="bg-brand-background text-gray-800 font-sans overflow-x-hidden">
      <Navbar />
      <Header />
      <main>
        <div className="bg-dark-navy">
            <img 
                src="https://raw.githubusercontent.com/mktspacenetwork/tardezinha/main/2025.jpeg" 
                alt="Faixa decorativa do ano 2025"
                className="w-full h-auto"
            />
        </div>
        <div className="bg-gradient-solar text-white py-20 px-4">
            <div className="max-w-4xl mx-auto text-center">
                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-wider mb-4">A melhor tarde do ano está chegando!</h2>
                <p className="text-lg md:text-xl text-gray-200 mb-8">
                    Prepare-se para um dia inesquecível! A Tardezinha da Space é o nosso momento de celebrar um ano de conquistas, com muita música, diversão e a energia contagiante que só a nossa equipe tem.
                </p>
                <Countdown />
            </div>
        </div>
        <EventDetails />
        <Gallery />
        <Checkin onConfirm={() => setShowPurchaseIntro(true)} onOpenRules={handleOpenRules} />
        <PurchaseOptions showIntro={showPurchaseIntro} />
        <PromoSection />
        <FAQ />
      </main>
      <Footer onAdminClick={handleAdminEnter} onOpenRules={handleOpenRules} />
    </div>
  );
};

export default App;