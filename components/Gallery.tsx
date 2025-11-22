import React, { useState, useEffect, useCallback, useRef } from 'react';

// Using more relevant images for the event theme
const images = [
    { src: 'https://raw.githubusercontent.com/mktspacenetwork/tardezinha/main/isa.jpg', alt: 'Convidada sorrindo na Tardezinha da Space' },
    { src: 'https://raw.githubusercontent.com/mktspacenetwork/tardezinha/main/gemeos.jpg', alt: 'Convidados posando para foto na festa' },
    { src: 'https://raw.githubusercontent.com/mktspacenetwork/tardezinha/main/trio.jpg', alt: 'Grupo de amigos se divertindo no evento' },
    { src: 'https://raw.githubusercontent.com/mktspacenetwork/tardezinha/main/guil.jpg', alt: 'Convidado aproveitando a Tardezinha' },
    { src: 'https://raw.githubusercontent.com/mktspacenetwork/tardezinha/main/carol.jpg', alt: 'Convidada posando para foto' },
    { src: 'https://raw.githubusercontent.com/mktspacenetwork/tardezinha/main/donazefa.jpg', alt: 'Convidada sorrindo durante o evento' },
    { src: 'https://raw.githubusercontent.com/mktspacenetwork/tardezinha/main/daniel.jpg', alt: 'Convidado na Tardezinha da Space' },
    { src: '/piscina_tardezina.jpeg', alt: 'Piscina da Tardezinha da Space' },
];

// Classes for the mosaic layout
const imageSpans = [
  'md:col-span-2 md:row-span-1', // Image 1 (wide)
  'md:col-span-2 md:row-span-2', // Image 2 (large square)
  'md:col-span-1 md:row-span-1', // Image 3 (small)
  'md:col-span-1 md:row-span-1', // Image 4 (small)
  'md:col-span-2 md:row-span-1', // Image 5 (wide)
  'md:col-span-1 md:row-span-2', // Image 6 (tall)
  'md:col-span-1 md:row-span-1', // Image 7 (small)
  'md:col-span-2 md:row-span-1', // Image 8 (wide - new)
];

const Gallery: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const gridRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.unobserve(entry.target);
      }
    }, { threshold: 0.1 });
    
    const currentRef = gridRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  const openModal = (index: number) => {
    setCurrentImageIndex(index);
    setIsModalOpen(true);
  };

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const showNextImage = useCallback(() => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
  }, []);

  const showPrevImage = useCallback(() => {
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isModalOpen) return;
      if (e.key === 'Escape') {
        closeModal();
      }
      if (e.key === 'ArrowRight') {
        showNextImage();
      }
      if (e.key === 'ArrowLeft') {
        showPrevImage();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);

    if (isModalOpen) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = 'auto';
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [isModalOpen, closeModal, showNextImage, showPrevImage]);


  return (
    <section id="gallery" className="bg-gradient-to-br from-solar-purple to-solar-pink py-20">
      <div className="max-w-7xl mx-auto text-center px-4">
        <h2 className="text-4xl md:text-6xl font-black text-white text-center mb-4 uppercase">Veja como foi incrível!</h2>
        <p className="text-lg md:text-xl mb-12 text-gray-200 max-w-3xl mx-auto">
          Relembre os melhores momentos dos eventos anteriores da Space Network. Cada foto conta uma história de união, diversão e celebração.
        </p>
        <div 
            ref={gridRef}
            className={`grid grid-cols-2 md:grid-cols-4 grid-flow-dense auto-rows-[250px] gap-4 ${isVisible ? 'animate-fadeInUp' : 'opacity-0'}`}
        >
          {images.map(({src, alt}, index) => (
            <div 
              key={index} 
              className={`relative overflow-hidden group cursor-pointer rounded-xl ${imageSpans[index % imageSpans.length]}`}
              onClick={() => openModal(index)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && openModal(index)}
              aria-label={`View image ${index + 1}: ${alt}`}
            >
              <img 
                src={src} 
                alt={alt} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
              </div>
            </div>
          ))}
        </div>
      </div>

      {isModalOpen && (
        <div 
            className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 animate-fadeIn"
            onClick={closeModal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="gallery-modal-title"
        >
          <div 
            className="relative bg-white p-4 rounded-lg max-w-4xl max-h-[90vh] shadow-2xl flex flex-col w-full" 
            onClick={(e) => e.stopPropagation()}
          >
             <div className="relative flex-grow flex items-center justify-center overflow-hidden">
                <img 
                    src={images[currentImageIndex].src} 
                    alt={images[currentImageIndex].alt} 
                    className="max-w-full max-h-[85vh] object-contain"
                />
            </div>
          </div>
          
          <button 
            onClick={closeModal}
            className="absolute top-4 right-4 text-white hover:text-solar-yellow transition-colors z-10"
            aria-label="Close gallery"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <button 
            onClick={(e) => { e.stopPropagation(); showPrevImage(); }}
            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 p-2 rounded-full text-white transition-colors"
            aria-label="Previous image"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button 
            onClick={(e) => { e.stopPropagation(); showNextImage(); }}
            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 p-2 rounded-full text-white transition-colors"
            aria-label="Next image"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </section>
  );
};

export default Gallery;