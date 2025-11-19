import React, { useState, useEffect } from 'react';

const images = [
  'https://raw.githubusercontent.com/mktspacenetwork/tardezinha/main/isa.jpg',
  'https://raw.githubusercontent.com/mktspacenetwork/tardezinha/main/gemeos.jpg',
  'https://raw.githubusercontent.com/mktspacenetwork/tardezinha/main/trio.jpg',
];

const Header: React.FC = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(interval);
  }, []);
  
  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.pageYOffset);
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const parallaxStyle = {
    transform: `translateY(${scrollPosition * 0.4}px)`,
    opacity: 1 - scrollPosition / 500,
  };
  
  const kenburnsAnimations = ['animate-kenburns-1', 'animate-kenburns-2', 'animate-kenburns-3'];

  return (
    <header id="home" className="relative h-screen flex items-center justify-center text-white text-center overflow-hidden">
      {/* Background Image Slideshow */}
      <div className="absolute inset-0 z-0">
        {images.map((src, index) => (
          <div
            key={src}
            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out ${index === currentImageIndex ? 'opacity-100' : 'opacity-0'}`}
          >
            <div 
              className={`w-full h-full bg-cover bg-center ${kenburnsAnimations[index % kenburnsAnimations.length]}`}
              style={{ backgroundImage: `url(${src})` }}
            />
          </div>
        ))}
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/50"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 p-4 flex flex-col items-center" style={parallaxStyle}>
        <img 
            src="https://raw.githubusercontent.com/mktspacenetwork/tardezinha/main/tardezinhadaSpace.png" 
            alt="Tardezinha da Space Logo" 
            className="w-full max-w-md md:max-w-lg lg:max-w-2xl drop-shadow-lg"
        />
        <p className="mt-6 text-2xl md:text-3xl font-bold uppercase tracking-widest text-white drop-shadow-md" style={{textShadow: '1px 1px 4px rgba(0,0,0,0.5)'}}>
          21 DE DEZEMBRO <span className="lowercase">de</span> 2025
        </p>
      </div>
    </header>
  );
};

export default Header;