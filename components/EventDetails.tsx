
import React, { useState, useEffect, useRef } from 'react';

const attractionsData = [
  {
    title: "Infraestrutura de sítio completa!",
    description: "Piscina, campo e muito espaço verde para você relaxar e se divertir o dia todo.",
    imageUrl: "https://raw.githubusercontent.com/mktspacenetwork/tardezinha/main/piscina_2023.jpg"
  },
  {
    title: "Almoço Incluído",
    description: "Um churrasco delicioso com acompanhamentos incríveis para recarregar as energias.",
    imageUrl: "https://raw.githubusercontent.com/mktspacenetwork/tardezinha/main/churrasco.jpg"
  },
  {
    title: "OPEN CHOPP + BEBIDAS",
    description: "Chopp gelado e uma variedade de bebidas para refrescar e animar a festa o dia todo.",
    imageUrl: "https://raw.githubusercontent.com/mktspacenetwork/tardezinha/main/chopp.jpg"
  },
  {
    title: "Roda de Samba ao vivo",
    description: "O melhor do samba e pagode pra cantar junto e não deixar ninguém parado.",
    imageUrl: "https://raw.githubusercontent.com/mktspacenetwork/tardezinha/main/grupo_pagode.jpg"
  },
  {
    title: "Space Awards",
    description: "Hora de saber quem brilhou em 2025 e celebrar as conquistas do ano!",
    imageUrl: "https://raw.githubusercontent.com/mktspacenetwork/tardezinha/main/awards.jpg"
  }
];

const attractionSpans = [
  'lg:col-span-2', // Item 1
  'lg:col-span-2', // Item 2
  'lg:col-span-2', // Item 3
  'lg:col-span-3', // Item 4
  'lg:col-span-3', // Item 5
];

const AttractionCard: React.FC<{ title: string; description: string; imageUrl: string }> = ({ title, description, imageUrl }) => (
    <div className="relative group rounded-2xl overflow-hidden shadow-lg h-full min-h-[350px]">
        <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-500 ease-in-out group-hover:scale-110"
            style={{ backgroundImage: `url(${imageUrl})` }}
            aria-hidden="true"
        ></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10 transition-all duration-300"></div>
        <div className="relative h-full flex flex-col justify-end p-6 text-white">
            <h3 className="text-2xl font-bold mb-2 uppercase tracking-wide transform transition-transform duration-300 group-hover:-translate-y-2">{title}</h3>
            <div className="overflow-hidden max-h-0 group-hover:max-h-40 transition-all duration-500 ease-in-out">
                <p className="text-gray-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">{description}</p>
            </div>
        </div>
    </div>
);


const EventDetails: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  // State initialized with data, will be shuffled on mount
  const [attractions, setAttractions] = useState(attractionsData);

  useEffect(() => {
    // Randomize the order of attractions only once when the component mounts
    setAttractions((prev) => [...prev].sort(() => Math.random() - 0.5));
  }, []);

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
    <section id="details" ref={sectionRef} className="bg-brand-background py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl md:text-6xl font-black text-center mb-12 uppercase bg-gradient-to-r from-solar-orange to-solar-pink bg-clip-text text-transparent">O que te espera</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-8">
          {attractions.map((attraction, index) => (
            <div
              key={index}
              className={`transition-all duration-700 ease-out transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} ${attractionSpans[index]}`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <AttractionCard 
                title={attraction.title}
                description={attraction.description}
                imageUrl={attraction.imageUrl}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default EventDetails;
