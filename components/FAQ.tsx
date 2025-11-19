
import React, { useState, useEffect, useRef } from 'react';
import { FAQItem } from '../types';

const faqData: FAQItem[] = [
  {
    question: "Qual é a data, o horário e onde será o evento?",
    answer: "O evento acontecerá no dia 21 de dezembro de 2025. Será realizado no Sítio do Barba, localizado na Estr. Capuavinha, 1049-1143, em Mairiporã/SP."
  },
  {
    question: "Haverá transporte oficial? (Ponto de encontro e horários)",
    answer: "Sim, teremos 2 ônibus fretados (46 lugares cada). O Ponto de Encontro é na Rua Antônio Napolli, 229. O ônibus estará disponível às 08h30, com saída às 09h00 (tolerância máxima até 09h30). O retorno está marcado para as 17h00."
  },
  {
    question: "Quanto custa o transporte e a diária de acompanhante?",
    answer: (
      <span>
        Transfer de Ônibus: <strong>R$ 64,19 à vista</strong> ou 12x R$ 6,53. Crianças de até 5 anos podem ir no colo (sem custo de transferência).
        <br /><br />
        Diária Acompanhante (Adulto): <strong>R$ 103,78 à vista</strong> ou 12x R$ 10,56. Inclui Diária do sítio, Open Chopp + Bebidas e Almoço à vontade.
      </span>
    )
  },
  {
    question: "Quantas pessoas posso levar no evento (adultos e crianças)?",
    answer: "Você pode levar até 1 acompanhante adulto (pago) e até 5 crianças (pagando meia), utilizando a opção de Diária Acompanhante. O embarque no transporte é somente para quem estiver na lista (nome + documento)."
  },
  {
    question: "O que vou comer e beber no evento?",
    answer: "A alimentação será um Churrasco (Contra filé, Frango, Linguiça, Coração, Pão de alho), com guarnições (Arroz, Vinagrete, Farofa, Saladas) e salgadinhos de entrada. As bebidas incluídas são: Coca-Cola, Guaraná Antártica, Soda Antártica e Água mineral."
  },
  {
    question: "Posso entrar na piscina? (Regras de uso)",
    answer: "Sim, a piscina estará liberada! Apenas roupas apropriadas são permitidas na água (maiô, biquíni, sunga, shorts, camiseta UV). É proibido o uso de roupa íntima ou peças transparentes. Por segurança, é proibido correr ou empurrar, e crianças devem estar sempre acompanhadas dos responsáveis."
  },
  {
    question: "O que é proibido levar ou fazer no evento?",
    answer: "É proibido levar: Bebidas (alcoólicas ou não) de fora, e Narguilé. É proibido fazer: Correr ou empurrar na piscina, e brincadeiras que sejam constrangedoras. Em caso de excesso de consumo ou comportamento, o colaborador poderá ser orientado a se retirar."
  },
];


const FAQAccordionItem: React.FC<{ item: FAQItem, isOpen: boolean, onClick: () => void }> = ({ item, isOpen, onClick }) => {
    return (
        <div className="bg-orange-100/40 rounded-xl transition-all duration-300">
            <button onClick={onClick} className="w-full flex justify-between items-center text-left p-5 md:p-6">
                <span className="text-lg font-semibold text-dark-navy pr-4">{item.question}</span>
                <span className="text-solar-orange text-2xl font-bold flex-shrink-0 ml-4">
                  {isOpen ? '−' : '+'}
                </span>
            </button>
            <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="text-gray-600 pb-5 px-5 md:px-6">
                    {item.answer}
                </div>
            </div>
        </div>
    );
}

const FAQ: React.FC = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);
    const listRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
        }
        }, { threshold: 0.1 });
        
        const currentRef = listRef.current;
        if (currentRef) {
        observer.observe(currentRef);
        }

        return () => {
        if (currentRef) {
            observer.unobserve(currentRef);
        }
        };
    }, []);


    const handleToggle = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

  return (
    <section id="faq" className="bg-white text-dark-navy py-20 px-4">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-4xl md:text-6xl font-black mb-4 uppercase bg-gradient-to-r from-solar-orange to-solar-pink bg-clip-text text-transparent">Perguntas Frequentes</h2>
        <p className="text-lg md:text-xl mb-12 text-gray-600 max-w-2xl mx-auto">
            Tire todas as suas dúvidas sobre a Tardezinha da Space 2025. Se não encontrar a resposta, entre em contato conosco!
        </p>
        <div ref={listRef} className="space-y-4 text-left">
            {faqData.map((item, index) => (
                <div
                    key={index}
                    className={`transition-all duration-700 ease-out transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                    style={{ transitionDelay: `${index * 100}ms` }}
                >
                    <FAQAccordionItem 
                        item={item}
                        isOpen={openIndex === index}
                        onClick={() => handleToggle(index)}
                    />
                </div>
            ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
