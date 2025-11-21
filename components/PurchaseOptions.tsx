import React, { useState, useEffect, useRef } from 'react';
import { supabase, isSupabaseConfigured } from '../supabaseClient';

const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
);

interface PurchaseOptionsProps {
  showIntro: boolean;
}

const PurchaseOptions: React.FC<PurchaseOptionsProps> = ({ showIntro }) => {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const TOTAL_BUS_SEATS = 46;
  const [remainingSeats, setRemainingSeats] = useState(12);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.unobserve(entry.target);
      }
    }, { threshold: 0.1 });

    const currentRef = sectionRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  useEffect(() => {
    if (isSupabaseConfigured()) {
      const fetchSeats = async () => {
        const { data, error } = await supabase
          .from('confirmations')
          .select('total_transport');
        
        if (!error && data) {
          const totalTransportCount = data.reduce((sum, conf) => sum + (conf.total_transport || 0), 0);
          setRemainingSeats(Math.max(0, TOTAL_BUS_SEATS - totalTransportCount));
        }
      };
      fetchSeats();
    }
  }, [TOTAL_BUS_SEATS]);

  const handlePurchaseClick = (confirmed: boolean) => {
    if (!confirmed) {
      alert('⚠️ Você precisa confirmar sua presença antes de comprar opcionais!\n\nRole a página para cima e clique em "QUERO PARTICIPAR!" para fazer sua confirmação primeiro.');
      const checkinSection = document.getElementById('checkin');
      if (checkinSection) {
        checkinSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      return;
    }
    
    setIsModalOpen(true);
    setTimeout(() => {
      window.location.href = 'https://useingresso.com/evento/691b30d3dc465aca63b2bbef';
    }, 5000);
  };

  return (
    <>
      <section id="purchase-options" ref={sectionRef} className="bg-white py-12 md:py-20 px-4">
        <div className="max-w-4xl mx-auto">
          {showIntro && (
              <div className="text-center mb-8 md:mb-12 animate-fadeInUp">
                  <div className="inline-flex items-center gap-2 bg-green-50 border-2 border-green-400 text-green-800 px-4 md:px-6 py-3 rounded-xl mb-4">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-bold text-base md:text-lg">Presença confirmada!</span>
                  </div>
                  <p className="text-gray-600 text-base md:text-lg">Agora você pode adquirir opcionais para melhorar sua experiência.</p>
              </div>
          )}
          {!showIntro && (
              <div className="text-center mb-8 md:mb-12 animate-fadeInUp">
              </div>
          )}
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-center mb-8 md:mb-12 uppercase bg-gradient-to-r from-orange-400 via-pink-500 to-pink-600 bg-clip-text text-transparent">Opcionais de Compra</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Guest Ticket Card */}
            <div
              className={`bg-gradient-to-br from-white to-gray-50 border-2 ${showIntro ? 'border-pink-200' : 'border-gray-200'} rounded-2xl p-6 md:p-8 text-left flex flex-col shadow-lg hover:shadow-2xl transition-all duration-300 ease-out ${
                isVisible
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-10'
              }`}
            >
              <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">Diária Acompanhante</h3>
              <div className="mb-6">
                  <p className="text-3xl md:text-4xl font-black bg-gradient-to-r from-orange-500 to-pink-600 bg-clip-text text-transparent">12x R$10,56</p>
                  <p className="text-xs md:text-sm text-gray-500">(taxas inclusas)</p>
                  <p className="text-sm md:text-base font-semibold text-gray-600 mt-2">Ou R$ 103,78 à vista.</p>
              </div>
              <ul className="text-gray-600 space-y-2 md:space-y-3 mb-6 flex-grow text-sm md:text-base">
                <li className="flex items-center"><CheckIcon /> Diária do sítio</li>
                <li className="flex items-center"><CheckIcon /> Open Chopp + Bebidas</li>
                <li className="flex items-center"><CheckIcon /> Almoço a vontade</li>
              </ul>
              <button 
                onClick={() => handlePurchaseClick(showIntro)}
                aria-disabled={!showIntro}
                className={`mt-auto w-full font-bold py-3 md:py-4 px-6 rounded-xl transition-all duration-300 text-base md:text-lg ${
                  showIntro
                    ? 'bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                    : 'bg-gray-300 text-gray-500 cursor-pointer opacity-60 hover:opacity-80'
                }`}
              >
                {showIntro ? 'Comprar Diária' : 'Confirme sua presença para liberar'}
              </button>
            </div>

            {/* Bus Transfer Card */}
            <div
              className={`bg-gradient-to-br from-white to-gray-50 border-2 ${showIntro ? 'border-pink-200' : 'border-gray-200'} rounded-2xl p-6 md:p-8 text-left flex flex-col shadow-lg hover:shadow-2xl transition-all duration-300 ease-out ${
                isVisible
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-10'
              }`}
              style={{ transitionDelay: '150ms' }}
            >
              {remainingSeats <= 20 && (
                <div className="mb-4 inline-flex items-center gap-2 bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-400 text-red-700 px-3 md:px-4 py-2 rounded-lg font-semibold text-xs md:text-sm animate-pulse">
                  <span className="text-base md:text-lg">⚠️</span>
                  <span>Restam apenas {remainingSeats} vagas no transporte</span>
                </div>
              )}
              <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">Transfer de Ônibus</h3>
               <div className="mb-6">
                  <p className="text-3xl md:text-4xl font-black bg-gradient-to-r from-orange-500 to-pink-600 bg-clip-text text-transparent">12x R$6,53</p>
                  <p className="text-xs md:text-sm text-gray-500">(Taxas inclusas)</p>
                  <p className="text-sm md:text-base font-semibold text-gray-600 mt-2">ou R$ 64,19 à vista</p>
              </div>
              <div className="text-gray-600 mb-6 flex-grow text-sm md:text-base">
                 <p className="flex items-start"><CheckIcon /> Ida e volta até o local do evento em ônibus moderno e confortável a partir das Sedes da Space.</p>
              </div>
              <button 
                onClick={() => handlePurchaseClick(showIntro)}
                aria-disabled={!showIntro}
                className={`mt-auto w-full font-bold py-3 md:py-4 px-6 rounded-xl transition-all duration-300 text-base md:text-lg ${
                  showIntro
                    ? 'bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                    : 'bg-gray-300 text-gray-500 cursor-pointer opacity-60 hover:opacity-80'
                }`}
              >
                {showIntro ? 'Reservar Transfer' : 'Confirme sua presença para liberar'}
              </button>
            </div>

          </div>
        </div>
      </section>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fadeIn" role="dialog" aria-modal="true">
          <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 text-center max-w-md w-full">
            <video
              src="https://cdn-icons-mp4.flaticon.com/512/7994/7994364.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="w-32 h-32 mx-auto mb-6"
              aria-label="Animação de carregamento"
            />
            <h3 className="text-2xl font-bold text-dark-navy mb-2">Redirecionando...</h3>
            <p className="text-gray-600">
              Você está sendo direcionado para sua tela de pagamento!
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default PurchaseOptions;