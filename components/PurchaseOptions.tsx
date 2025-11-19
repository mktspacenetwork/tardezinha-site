import React, { useState, useEffect, useRef } from 'react';

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

  const handlePurchaseClick = () => {
    setIsModalOpen(true);
    setTimeout(() => {
      window.location.href = 'https://useingresso.com/evento/691b30d3dc465aca63b2bbef';
    }, 5000); // Wait 5 seconds before redirecting
  };

  return (
    <>
      <section id="purchase-options" ref={sectionRef} className="bg-white py-20 px-4">
        <div className="max-w-4xl mx-auto">
          {showIntro && (
              <div className="text-center mb-12 animate-fadeInUp">
                  <h3 className="text-2xl font-bold text-dark-navy">Presença confirmada!</h3>
                  <p className="text-gray-600 mt-2">Melhore sua experiência levando um acompanhante ou garantindo seu transporte.</p>
              </div>
          )}
          <h2 className="text-4xl md:text-6xl font-black text-center mb-12 uppercase bg-gradient-to-r from-solar-orange to-solar-pink bg-clip-text text-transparent">Opcionais de Compra</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Guest Ticket Card */}
            <div
              className={`bg-gray-50 border border-gray-200 rounded-2xl p-8 text-left flex flex-col shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 ease-out transform ${
                isVisible
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-10'
              }`}
            >
              <h3 className="text-2xl font-bold text-dark-navy mb-4">Diária Acompanhante</h3>
              <div className="mb-6">
                  <p className="text-4xl font-black text-solar-orange">12x R$10,56</p>
                  <p className="text-sm text-gray-500">(taxas inclusas)</p>
                  <p className="text-base font-semibold text-gray-600 mt-2">Ou R$ 103,78 à vista.</p>
              </div>
              <ul className="text-gray-600 space-y-3 mb-6 flex-grow">
                <li className="flex items-center"><CheckIcon /> Diária do sítio</li>
                <li className="flex items-center"><CheckIcon /> Open Chopp + Bebidas</li>
                <li className="flex items-center"><CheckIcon /> Almoço a vontade</li>
              </ul>
              <button 
                onClick={handlePurchaseClick}
                className="mt-auto w-full bg-solar-pink hover:bg-solar-orange text-white font-bold py-3 px-6 rounded-lg transition duration-300 transform hover:scale-105"
              >
                Comprar Diária
              </button>
            </div>

            {/* Bus Transfer Card */}
            <div
              className={`bg-gray-50 border border-gray-200 rounded-2xl p-8 text-left flex flex-col shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 ease-out transform ${
                isVisible
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-10'
              }`}
              style={{ transitionDelay: '150ms' }}
            >
              <h3 className="text-2xl font-bold text-dark-navy mb-4">Transfer de Ônibus</h3>
               <div className="mb-6">
                  <p className="text-4xl font-black text-solar-orange">12x R$6,53</p>
                  <p className="text-sm text-gray-500">(Taxas inclusas)</p>
                  <p className="text-base font-semibold text-gray-600 mt-2">ou R$ 64,19 à vista</p>
              </div>
              <div className="text-gray-600 mb-6 flex-grow">
                 <p className="flex items-start"><CheckIcon /> Ida e volta até o local do evento em ônibus moderno e confortável a partir das Sedes da Space.</p>
              </div>
              <button 
                onClick={handlePurchaseClick}
                className="mt-auto w-full bg-solar-pink hover:bg-solar-orange text-white font-bold py-3 px-6 rounded-lg transition duration-300 transform hover:scale-105"
              >
                Reservar Transfer
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