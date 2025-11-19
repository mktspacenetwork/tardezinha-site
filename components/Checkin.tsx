
import React, { useState, useEffect, useRef } from 'react';
import { employees } from '../data/employees';
import { Confirmation } from '../types';
import { supabase, isSupabaseConfigured } from '../supabaseClient';

declare var confetti: any;

// Lista visual estática para o carrossel (apenas estético)
const confirmedAttendees = [
  { initials: 'JS', fullName: 'João Silva', mood: '🎉' },
  { initials: 'AM', fullName: 'Ana Martins', mood: '😎' },
  { initials: 'CV', fullName: 'Carlos Vieira', mood: '🤩' },
  { initials: 'LP', fullName: 'Luiza Pereira', mood: '🥳' },
  { initials: 'RG', fullName: 'Ricardo Gomes', mood: '🚀' },
  { initials: 'MS', fullName: 'Mariana Santos', mood: '🔥' },
  { initials: 'TS', fullName: 'Thiago Souza', mood: '🕺' },
  { initials: 'BC', fullName: 'Beatriz Costa', mood: '🎶' },
  { initials: 'FG', fullName: 'Felipe Garcia', mood: '🌴' },
  { initials: 'NA', fullName: 'Natália Alves', mood: '☀️' },
];

interface CheckinProps {
  onConfirm: () => void;
  onOpenRules: () => void;
}

const Checkin: React.FC<CheckinProps> = ({ onConfirm, onOpenRules }) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [remainingDays, setRemainingDays] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [wantsGuests, setWantsGuests] = useState<boolean | null>(null);
  const [guestCount, setGuestCount] = useState(1);
  const [wantsTransport, setWantsTransport] = useState<boolean | null>(null);
  const [agreedToRules, setAgreedToRules] = useState(false);
  const [suggestions, setSuggestions] = useState<typeof employees>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Bus seats logic
  const TOTAL_BUS_SEATS = 46; 
  const [remainingSeats, setRemainingSeats] = useState(12); // Valor inicial placeholder

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.unobserve(entry.target);
      }
    }, { threshold: 0.1 });
    
    const currentRef = sectionRef.current;
    if (currentRef) observer.observe(currentRef);
    return () => { if (currentRef) observer.unobserve(currentRef); };
  }, []);
  
  useEffect(() => {
    const deadline = new Date('2025-12-15T23:59:59');
    const today = new Date();
    const diffTime = Math.max(0, deadline.getTime() - today.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    setRemainingDays(diffDays);
    
    // Buscar vagas reais do banco de dados
    if (isSupabaseConfigured()) {
        const fetchSeats = async () => {
            // Conta quantas pessoas marcaram transport = true
            const { count, error } = await supabase
                .from('confirmations')
                .select('*', { count: 'exact', head: true })
                .eq('transport', true);
            
            if (!error && count !== null) {
                setRemainingSeats(Math.max(0, TOTAL_BUS_SEATS - count));
            }
        };
        fetchSeats();
    }
  }, []);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setName(value);
    if (value.length > 1) {
      const filtered = employees.filter(emp => 
        emp.name.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 5));
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (employeeName: string) => {
    setName(employeeName);
    setSuggestions([]);
  };

  const handleRulesClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsModalOpen(false);
    onOpenRules();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !phone || wantsGuests === null || wantsTransport === null || !agreedToRules) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (!isSupabaseConfigured()) {
        setError('ERRO: O banco de dados não está conectado. Avise o administrador para configurar o supabaseClient.ts');
        return;
    }

    setIsSubmitting(true);

    try {
        // 1. Verificar duplicidade
        const { data: existing } = await supabase
            .from('confirmations')
            .select('id')
            .ilike('name', name) // Case insensitive check
            .maybeSingle();

        if (existing) {
             setError('Este nome já consta na lista de confirmados.');
             setIsSubmitting(false);
             return;
        }

        // 2. Inserir no Banco de Dados
        const { error: insertError } = await supabase
            .from('confirmations')
            .insert([
                {
                    name,
                    phone,
                    guests: wantsGuests ? guestCount : 0,
                    transport: wantsTransport ?? false,
                }
            ]);

        if (insertError) throw insertError;
        
        // 3. Efeito Confetti
        if (typeof confetti === 'function') {
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#FFB74D', '#FF8A65', '#FF4081', '#8E24AA'],
                zIndex: 10000
            });
        }

        // 4. Atualizar UI
        if (wantsTransport) {
            setRemainingSeats(prev => Math.max(0, prev - 1));
        }

        setSuccessMessage(`Presença confirmada, ${name.split(' ')[0]}! Nos vemos na festa.`);
        setIsSubmitting(false);
        setIsModalOpen(false);
        onConfirm();

        setTimeout(() => {
            document.getElementById('purchase-options')?.scrollIntoView({ behavior: 'smooth' });
        }, 500);

        setTimeout(() => setSuccessMessage(''), 5000);

    } catch (err: any) {
        console.error(err);
        setError(`Erro ao salvar: ${err.message || 'Tente novamente.'}`);
        setIsSubmitting(false);
    }
  };

  return (
    <>
      <section id="checkin" className="bg-white py-20 px-4 text-dark-navy">
        <div className="max-w-4xl mx-auto text-center">
        {successMessage && (
            <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-8 rounded-md shadow-md animate-fadeIn" role="alert">
                <p className="font-bold">Sucesso!</p>
                <p>{successMessage}</p>
            </div>
        )}
          <div 
            ref={sectionRef}
            className={`bg-gray-100 p-8 md:p-12 rounded-2xl shadow-xl relative ${isVisible ? 'animate-fadeInUp' : 'opacity-0'}`}
          >
              <div className="absolute -top-2 -right-2 md:top-0 md:right-0">
                  <div className="w-28 h-28 md:w-32 md:h-32 bg-green-500 rounded-full flex items-center justify-center text-white font-black uppercase text-center leading-tight shadow-lg transform rotate-12 animate-pulse">
                      <span className="text-xl md:text-2xl">100%<br/>Grátis</span>
                  </div>
              </div>
  
              <h2 className="text-4xl md:text-6xl font-black mb-4 uppercase bg-gradient-to-r from-solar-orange to-solar-pink bg-clip-text text-transparent">Confirme sua presença</h2>
              
              <p className="text-lg text-gray-700 mb-8">
                Garanta a sua entrada e não fique de fora.
              </p>
  
              <div className="my-8">
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="inline-block w-full max-w-lg mx-auto bg-green-500 hover:bg-green-600 text-white font-bold py-5 px-10 rounded-lg text-2xl transition duration-300 transform hover:scale-105 shadow-lg"
                >
                    QUERO PARTICIPAR!
                </button>
                {remainingSeats < 15 && (
                    <p className="text-red-500 font-bold mt-3 text-sm animate-pulse">
                        ⚠️ Restam apenas {remainingSeats} vagas no transporte!
                    </p>
                )}
              </div>
  
              <p className="font-semibold text-gray-800">
                Você tem apenas {remainingDays > 0 ? `${remainingDays} dias` : 'poucas horas'} para confirmar sua presença.
              </p>
  
              <p className="text-sm text-gray-600 mt-4 max-w-lg mx-auto">
                Cortesia exclusiva para colaborador da Space Network, Now, Sampa.
              </p>
  
              <hr className="my-12 border-gray-300" />
  
              <div>
                  <h3 className="text-2xl font-bold text-dark-navy mb-8">Veja quem já confirmou</h3>
                  <div className="relative w-full overflow-hidden group pt-20">
                      <div className="flex animate-marquee group-hover:[animation-play-state:paused] whitespace-nowrap">
                          {[...confirmedAttendees, ...confirmedAttendees].map((attendee, index) => (
                              <div key={index} className="relative flex flex-col items-center flex-shrink-0 mx-4 w-20 group/attendee">
                                  <div className="absolute bottom-[130%] left-1/2 w-max -translate-x-1/2 px-3 py-1 bg-dark-navy text-white text-sm rounded-md shadow-lg opacity-0 scale-95 group-hover/attendee:opacity-100 group-hover/attendee:scale-100 group-hover/attendee:-translate-y-2 transform transition-all duration-300 ease-out pointer-events-none z-10">
                                      {attendee.fullName.split(' ')[0]}
                                      <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-dark-navy"></div>
                                  </div>
                                  <div className="absolute -top-7 bg-white px-2 py-1 text-2xl rounded-full shadow-md transition-transform hover:scale-110 z-0">
                                      {attendee.mood}
                                  </div>
                                  <div className="w-16 h-16 bg-gradient-to-br from-solar-orange to-solar-pink rounded-full flex items-center justify-center text-white font-bold text-xl shadow-inner cursor-default">
                                      {attendee.initials}
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              </div>
          </div>
        </div>
      </section>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fadeIn" role="dialog" aria-modal="true">
          <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 text-left max-w-lg w-full max-h-[90vh] overflow-y-auto relative">
             <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
             </button>
             <h3 className="text-2xl font-bold text-dark-navy mb-6">Formulário de Confirmação</h3>
             <form onSubmit={handleSubmit} className="space-y-5">
               
               <div className="relative">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nome Completo *</label>
                  <input type="text" id="name" value={name} onChange={handleNameChange} className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-solar-orange focus:border-solar-orange" required />
                  {suggestions.length > 0 && (
                    <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 shadow-lg max-h-48 overflow-y-auto">
                      {suggestions.map(emp => (
                        <li key={emp.name} onClick={() => handleSuggestionClick(emp.name)} className="px-4 py-2 cursor-pointer hover:bg-gray-100">
                          <p className="font-semibold">{emp.name}</p>
                          <p className="text-sm text-gray-500">{emp.role}</p>
                        </li>
                      ))}
                    </ul>
                  )}
               </div>
               
               <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Telefone com DDD *</label>
                  <input type="tel" id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-solar-orange focus:border-solar-orange" required placeholder="(XX) XXXXX-XXXX"/>
               </div>

               <div className="space-y-2">
                 <p className="text-sm font-medium text-gray-700">Tem interesse em levar acompanhante? *</p>
                 <div className="flex items-center gap-4">
                    <button type="button" onClick={() => setWantsGuests(true)} className={`px-4 py-2 rounded-md text-sm font-semibold border ${wantsGuests === true ? 'bg-solar-orange text-white border-solar-orange' : 'bg-white text-gray-700 border-gray-300'}`}>Sim</button>
                    <button type="button" onClick={() => setWantsGuests(false)} className={`px-4 py-2 rounded-md text-sm font-semibold border ${wantsGuests === false ? 'bg-solar-orange text-white border-solar-orange' : 'bg-white text-gray-700 border-gray-300'}`}>Não</button>
                 </div>
                 {wantsGuests && (
                    <div className="mt-2 animate-fadeIn">
                      <label htmlFor="guestCount" className="block text-sm font-medium text-gray-700 mb-1">Quantos?</label>
                      <input type="number" id="guestCount" value={guestCount} onChange={(e) => setGuestCount(Number(e.target.value))} min="1" max="5" className="w-24 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-solar-orange focus:border-solar-orange" />
                    </div>
                 )}
               </div>

               <div className="space-y-2">
                 <p className="text-sm font-medium text-gray-700">Tem interesse em contratar transporte? *</p>
                 <div className="flex items-center gap-4">
                    <button type="button" onClick={() => setWantsTransport(true)} className={`px-4 py-2 rounded-md text-sm font-semibold border ${wantsTransport === true ? 'bg-solar-orange text-white border-solar-orange' : 'bg-white text-gray-700 border-gray-300'}`}>Sim</button>
                    <button type="button" onClick={() => setWantsTransport(false)} className={`px-4 py-2 rounded-md text-sm font-semibold border ${wantsTransport === false ? 'bg-solar-orange text-white border-solar-orange' : 'bg-white text-gray-700 border-gray-300'}`}>Não</button>
                 </div>
               </div>
               
               <div className="flex items-start">
                  <input type="checkbox" id="rules" checked={agreedToRules} onChange={(e) => setAgreedToRules(e.target.checked)} className="h-4 w-4 text-solar-orange border-gray-300 rounded focus:ring-solar-orange mt-1" required/>
                  <label htmlFor="rules" className="ml-2 block text-sm text-gray-900">
                    Li e concordo com as <a href="#" onClick={handleRulesClick} className="font-medium text-solar-pink hover:underline">regras da festa</a>. *
                  </label>
               </div>

               {error && <p className="text-red-600 text-sm">{error}</p>}
               
               <div className="pt-4">
                  <button type="submit" disabled={isSubmitting} className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition duration-300 disabled:bg-gray-400">
                    {isSubmitting ? 'Confirmando...' : 'Confirmar Presença'}
                  </button>
               </div>
             </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Checkin;
