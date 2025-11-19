
import React, { useState, useEffect, useRef } from 'react';

const PromoSection: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

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
  
  return (
    <section id="promo" className="bg-gradient-solar py-20 px-4 text-white">
      <div className="max-w-5xl mx-auto text-center">
        <h2 className="text-4xl md:text-6xl font-black mb-12 uppercase">Por que você não pode perder?</h2>
        
        <div 
          ref={sectionRef}
          className={`max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-2xl border border-white/20 mb-12 bg-black ${isVisible ? 'animate-fadeInUp' : 'opacity-0'}`}
        >
          {/* Container responsivo para garantir 16:9 (padding-bottom: 56.25%) */}
          <div className="relative w-full h-0 pb-[56.25%]">
            <iframe 
              className="absolute top-0 left-0 w-full h-full"
              src="https://www.youtube.com/embed/zbH0OMGULKw?rel=0" 
              title="Vídeo Tardezinha da Space" 
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen>
            </iframe>
          </div>
        </div>
        
        <p className="text-lg mb-8 max-w-3xl mx-auto">
            Última chamada pra quem quer fazer história com a gente. Depois não adianta dizer que ninguém avisou!
        </p>

        <a href="#checkin" className="inline-block bg-white text-solar-pink font-bold py-4 px-10 rounded-full text-xl transition duration-300 transform hover:scale-105 shadow-lg hover:bg-gray-200">
            Garantir Minha Vaga Agora!
        </a>
      </div>
    </section>
  );
};

export default PromoSection;
