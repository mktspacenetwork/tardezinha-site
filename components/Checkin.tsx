import React, { useState, useEffect, useRef } from 'react';
import { Employee, Confirmation, Companion } from '../types';
import { supabase, isSupabaseConfigured } from '../supabaseClient';

declare var confetti: any;

const confirmedAttendees = [
  { initials: 'JS', fullName: 'João Silva', mood: '🎉', color: 'from-orange-400 to-orange-600' },
  { initials: 'AM', fullName: 'Ana Martins', mood: '😎', color: 'from-pink-400 to-pink-600' },
  { initials: 'CV', fullName: 'Carlos Vieira', mood: '🤩', color: 'from-rose-400 to-rose-600' },
  { initials: 'LP', fullName: 'Luiza Pereira', mood: '🥳', color: 'from-orange-500 to-pink-500' },
  { initials: 'RG', fullName: 'Ricardo Gomes', mood: '🚀', color: 'from-pink-500 to-pink-700' },
  { initials: 'MS', fullName: 'Mariana Santos', mood: '🔥', color: 'from-orange-600 to-red-500' },
  { initials: 'TS', fullName: 'Thiago Souza', mood: '🕺', color: 'from-pink-300 to-pink-500' },
  { initials: 'BC', fullName: 'Beatriz Costa', mood: '🎶', color: 'from-orange-400 to-pink-400' },
  { initials: 'FG', fullName: 'Felipe Garcia', mood: '🌴', color: 'from-rose-500 to-pink-600' },
  { initials: 'NA', fullName: 'Natália Alves', mood: '☀️', color: 'from-orange-500 to-orange-700' },
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
  const [step, setStep] = useState<'form' | 'success'>('form');

  // Form state
  const [name, setName] = useState('');
  const [employeeRG, setEmployeeRG] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [suggestions, setSuggestions] = useState<Employee[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const [hasCompanions, setHasCompanions] = useState<boolean | null>(null);
  const [wantsTransport, setWantsTransport] = useState<boolean | null>(null);
  const [agreedToRules, setAgreedToRules] = useState(false);
  
  // Companions state
  const [adults, setAdults] = useState<Companion[]>([]);
  const [children, setChildren] = useState<Companion[]>([]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // Calculation results
  const [totalDailyPasses, setTotalDailyPasses] = useState(0);
  const [totalTransport, setTotalTransport] = useState(0);

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
    if (currentRef) observer.observe(currentRef);
    return () => { if (currentRef) observer.unobserve(currentRef); };
  }, []);
  
  useEffect(() => {
    const deadline = new Date('2025-12-15T23:59:59');
    const today = new Date();
    const diffTime = Math.max(0, deadline.getTime() - today.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    setRemainingDays(diffDays);
    
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
  }, []);

  // Recalcular diárias e transporte quando acompanhantes mudarem
  useEffect(() => {
    const totalAdults = adults.length;
    const totalChildren = children.length;
    
    // Colaborador não paga diária, apenas acompanhantes
    const dailyPasses = totalAdults + totalChildren;
    setTotalDailyPasses(dailyPasses);
    
    // Transporte: colaborador + acompanhantes (se quiser transporte)
    if (wantsTransport) {
      setTotalTransport(1 + totalAdults + totalChildren);
    } else {
      setTotalTransport(0);
    }
  }, [adults, children, wantsTransport]);

  const handleNameChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setName(value);
    setSelectedEmployee(null);
    
    if (value.length > 1 && isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('employees')
          .select('*')
          .ilike('name', `%${value}%`)
          .order('name')
          .limit(8);
        
        if (!error && data) {
          setSuggestions(data as Employee[]);
          setShowSuggestions(true);
        }
      } catch (err) {
        console.error('Erro ao buscar colaboradores:', err);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (employee: Employee) => {
    setName(employee.name);
    setSelectedEmployee(employee);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleRulesClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsModalOpen(false);
    onOpenRules();
  };

  const addAdult = () => {
    if (adults.length < 2) {
      setAdults([...adults, { name: '', age: 18, document: '', type: 'adult' }]);
    }
  };

  const addChild = () => {
    if (children.length < 5) {
      setChildren([...children, { name: '', age: 0, document: '', type: 'child' }]);
    }
  };

  const removeAdult = (index: number) => {
    setAdults(adults.filter((_, i) => i !== index));
  };

  const removeChild = (index: number) => {
    setChildren(children.filter((_, i) => i !== index));
  };

  const updateAdult = (index: number, field: keyof Companion, value: any) => {
    const updated = [...adults];
    updated[index] = { ...updated[index], [field]: value };
    setAdults(updated);
  };

  const updateChild = (index: number, field: keyof Companion, value: any) => {
    const updated = [...children];
    updated[index] = { ...updated[index], [field]: value };
    setChildren(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validações
    if (!selectedEmployee) {
      setError('Por favor, selecione um colaborador da lista.');
      return;
    }

    if (!employeeRG.trim()) {
      setError('Por favor, informe o RG do colaborador.');
      return;
    }

    if (hasCompanions === null) {
      setError('Por favor, informe se levará acompanhantes.');
      return;
    }

    if (hasCompanions && adults.length === 0 && children.length === 0) {
      setError('Por favor, adicione pelo menos um acompanhante ou selecione "Não" para acompanhantes.');
      return;
    }

    // Validar dados dos acompanhantes
    if (hasCompanions) {
      for (const adult of adults) {
        if (!adult.name.trim() || adult.age < 18 || !adult.document.trim()) {
          setError('Por favor, preencha todos os dados dos acompanhantes adultos (nome, idade ≥ 18, RG/CPF).');
          return;
        }
      }
      for (const child of children) {
        if (!child.name.trim() || child.age < 0 || child.age >= 18 || !child.document.trim()) {
          setError('Por favor, preencha todos os dados das crianças (nome, idade < 18, RG/CPF).');
          return;
        }
      }
    }

    if (wantsTransport === null) {
      setError('Por favor, informe se deseja transporte.');
      return;
    }

    if (!agreedToRules) {
      setError('Por favor, aceite os termos e condições.');
      return;
    }

    if (!isSupabaseConfigured()) {
      setError('ERRO: O banco de dados não está conectado. Avise o administrador.');
      return;
    }

    setIsSubmitting(true);

    let confirmationId: number | null = null;

    try {
      // Inserir confirmação
      const confirmation: Partial<Confirmation> = {
        employee_name: selectedEmployee.name,
        employee_rg: employeeRG,
        department: selectedEmployee.department,
        has_companions: hasCompanions,
        wants_transport: wantsTransport || false,
        total_adults: adults.length,
        total_children: children.length,
        total_daily_passes: totalDailyPasses,
        total_transport: totalTransport,
      };

      const { data: confirmationData, error: confirmationError } = await supabase
        .from('confirmations')
        .insert(confirmation)
        .select()
        .single();

      if (confirmationError) {
        throw confirmationError;
      }

      confirmationId = confirmationData.id;

      // Inserir acompanhantes
      if (hasCompanions && confirmationData) {
        const allCompanions = [...adults, ...children].map(comp => ({
          confirmation_id: confirmationData.id,
          name: comp.name,
          age: comp.age,
          document: comp.document,
          type: comp.type,
        }));

        if (allCompanions.length > 0) {
          const { error: companionsError } = await supabase
            .from('companions')
            .insert(allCompanions);

          if (companionsError) {
            // ROLLBACK: Excluir confirmação se inserção de acompanhantes falhou
            const { error: deleteError } = await supabase
              .from('confirmations')
              .delete()
              .eq('id', confirmationData.id);
            
            if (deleteError) {
              console.error('ERRO CRÍTICO: Falha no rollback!', deleteError);
              throw new Error('Erro crítico: Dados podem estar inconsistentes. Contate o administrador.');
            }
            
            throw new Error('Erro ao salvar acompanhantes. A confirmação foi revertida.');
          }
        }
      }

      // Sucesso!
      if (typeof confetti !== 'undefined') {
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 }
        });
      }

      setStep('success');
      onConfirm();
    } catch (err: any) {
      console.error('Erro ao salvar confirmação:', err);
      setError(err.message || 'Erro ao salvar confirmação. Por favor, tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setName('');
    setEmployeeRG('');
    setSelectedEmployee(null);
    setHasCompanions(null);
    setWantsTransport(null);
    setAgreedToRules(false);
    setAdults([]);
    setChildren([]);
    setError('');
    setStep('form');
  };

  if (step === 'success') {
    return (
      <section id="checkin" ref={sectionRef} className="py-20 px-4 bg-gradient-solar text-white">
        <div className="max-w-3xl mx-auto text-center">
          <div className="animate-fadeInUp">
            <div className="text-8xl mb-6">🎉</div>
            <h2 className="text-4xl md:text-5xl font-black mb-6">Presença Confirmada!</h2>
            <p className="text-xl mb-8">
              Sua confirmação foi registrada com sucesso!
            </p>

            {(totalDailyPasses > 0 || totalTransport > 0) && (
              <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-8 mb-8">
                <h3 className="text-2xl font-bold mb-4">Para aproveitar o evento, adquira:</h3>
                <div className="space-y-3 text-lg mb-6">
                  {totalDailyPasses > 0 && (
                    <div className="flex items-center justify-center gap-3">
                      <span className="text-3xl">🏖️</span>
                      <span className="font-semibold">{totalDailyPasses}</span>
                      <span>Diária{totalDailyPasses > 1 ? 's' : ''} de Acompanhante</span>
                    </div>
                  )}
                  {totalTransport > 0 && (
                    <div className="flex items-center justify-center gap-3">
                      <span className="text-3xl">🚌</span>
                      <span className="font-semibold">{totalTransport}</span>
                      <span>Transfer{totalTransport > 1 ? 's' : ''} de Ônibus</span>
                    </div>
                  )}
                </div>
                <a
                  href="https://useingresso.com/evento/691b30d3dc465aca63b2bbef"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-solar-purple hover:bg-opacity-90 text-white font-bold py-4 px-8 rounded-full text-lg transition-all transform hover:scale-105 shadow-lg"
                >
                  Seguir para Compra →
                </a>
              </div>
            )}

            {totalTransport === 0 && (
              <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-6 mb-8">
                <p className="text-lg">
                  ✓ Você optou por não utilizar o transporte. Nos vemos lá!
                </p>
              </div>
            )}

            <button
              onClick={resetForm}
              className="bg-white text-solar-purple font-bold py-3 px-6 rounded-full hover:bg-opacity-90 transition-all"
            >
              Fazer Nova Confirmação
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="checkin" ref={sectionRef} className="py-12 md:py-20 px-4 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        {/* Cabeçalho da Seção */}
        <div className={`text-center mb-8 md:mb-12 relative ${isVisible ? 'animate-fadeInUp' : 'opacity-0'}`}>
          {/* Badge 100% Grátis */}
          <div className="absolute -top-4 md:-top-6 right-0 md:right-12 bg-gradient-to-br from-green-400 to-green-600 text-white rounded-full px-4 md:px-6 py-2 md:py-3 font-black text-sm md:text-base shadow-lg transform rotate-12 animate-pulse z-10">
            100% GRÁTIS
          </div>

          {/* Título com Gradiente */}
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-4 md:mb-6 bg-gradient-to-r from-orange-400 via-pink-500 to-pink-600 bg-clip-text text-transparent leading-tight px-2 tracking-tight">
            CONFIRME SUA PRESENÇA
          </h2>

          {/* Subtítulo */}
          <p className="text-gray-700 text-lg md:text-xl font-medium mb-6 md:mb-8 px-4">
            Garanta a sua entrada e não fique de fora.
          </p>

          {/* Botão Quero Participar */}
          <div className="flex justify-center mb-6">
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-black text-xl md:text-2xl py-4 md:py-5 px-8 md:px-12 rounded-2xl shadow-2xl transition-all transform hover:scale-105 uppercase"
            >
              QUERO PARTICIPAR!
            </button>
          </div>

          {/* Aviso de Vagas */}
          {remainingSeats < 20 && (
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-400 text-red-700 px-4 md:px-6 py-3 rounded-lg mb-6 font-semibold text-sm md:text-base">
              <span className="text-xl">⚠️</span>
              <span>Restam apenas {remainingSeats} vagas no transporte!</span>
            </div>
          )}

          {/* Countdown */}
          {remainingDays > 0 && (
            <p className="text-gray-800 text-base md:text-lg font-bold mb-4">
              Você tem apenas <span className="text-2xl md:text-3xl text-pink-600">{remainingDays}</span> dias para confirmar sua presença.
            </p>
          )}

          {/* Cortesia */}
          <p className="text-gray-600 text-sm md:text-base mb-8 px-4">
            Cortesia exclusiva para colaborador da Space Network, Now, Sampa.
          </p>

          {/* Separador */}
          <div className="w-full max-w-3xl mx-auto h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent mb-8 md:mb-12"></div>

          {/* Veja quem já confirmou */}
          <h3 className="text-2xl md:text-3xl font-black text-gray-800 mb-6 md:mb-8">
            Veja quem já confirmou
          </h3>

          {/* Carousel de Confirmados com Animação */}
          <style>{`
            @keyframes scroll-carousel {
              0% {
                transform: translateX(0);
              }
              100% {
                transform: translateX(-50%);
              }
            }
            .carousel-scroll {
              animation: scroll-carousel 30s linear infinite;
            }
            .carousel-scroll:hover {
              animation-play-state: paused;
            }
          `}</style>
          
          <div className="relative overflow-hidden mb-8">
            <div className="flex carousel-scroll">
              {[...confirmedAttendees, ...confirmedAttendees].map((person, idx) => (
                <div
                  key={idx}
                  className="flex-shrink-0 flex flex-col items-center mx-3 md:mx-4"
                >
                  <div className={`w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br ${person.color} text-white font-black flex items-center justify-center text-4xl md:text-5xl shadow-lg transform transition-all hover:scale-110`}>
                    {person.mood}
                  </div>
                  <p className="mt-3 text-sm md:text-base font-bold text-gray-800 text-center max-w-[100px]">
                    {person.fullName}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal de Formulário */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white text-gray-800 rounded-3xl shadow-2xl p-6 md:p-8 max-w-2xl w-full my-8 max-h-[90vh] overflow-y-auto">
              {/* Cabeçalho do Modal */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl md:text-3xl font-black text-gray-800">Formulário de Confirmação</h3>
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setError('');
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors text-3xl font-bold leading-none"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-red-50 border-2 border-red-400 text-red-700 px-4 py-3 rounded-lg text-sm md:text-base">
                    {error}
                  </div>
                )}

                {/* Nome do Colaborador com Autocomplete */}
                <div className="relative">
                  <label className="block text-sm md:text-base font-bold mb-2 text-gray-700">
                    Nome do Colaborador <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={handleNameChange}
                    onFocus={() => name.length > 1 && setShowSuggestions(true)}
                    placeholder="Digite seu nome para buscar..."
                    className="w-full px-4 py-3 md:py-4 border-2 border-gray-300 rounded-xl focus:border-pink-500 focus:ring-2 focus:ring-pink-200 focus:outline-none text-base transition-all"
                    required
                  />
                  
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute z-20 w-full mt-2 bg-white border-2 border-gray-300 rounded-xl shadow-2xl max-h-60 overflow-y-auto">
                      {suggestions.map((emp, idx) => (
                        <div
                          key={idx}
                          onClick={() => handleSuggestionClick(emp)}
                          className="px-4 py-3 hover:bg-pink-50 cursor-pointer border-b last:border-b-0 transition-colors"
                        >
                          <div className="font-semibold text-gray-800">{emp.name}</div>
                          <div className="text-sm text-gray-500">{emp.department}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {selectedEmployee && (
                    <div className="mt-3 p-3 md:p-4 bg-green-50 border-2 border-green-400 rounded-xl flex items-center gap-3">
                      <span className="text-2xl md:text-3xl">✓</span>
                      <div>
                        <div className="font-bold text-green-800 text-base md:text-lg">{selectedEmployee.name}</div>
                        <div className="text-sm text-green-600">Colaborador confirmado - {selectedEmployee.department}</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* RG do Colaborador */}
                {selectedEmployee && (
                  <div>
                    <label className="block text-sm md:text-base font-bold mb-2 text-gray-700">
                      RG do Colaborador <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={employeeRG}
                      onChange={(e) => setEmployeeRG(e.target.value)}
                      placeholder="Ex: 12.345.678-9"
                      className="w-full px-4 py-3 md:py-4 border-2 border-gray-300 rounded-xl focus:border-pink-500 focus:ring-2 focus:ring-pink-200 focus:outline-none text-base transition-all"
                      required
                    />
                  </div>
                )}

                {/* Acompanhantes? */}
                {selectedEmployee && employeeRG && (
                  <div>
                    <label className="block text-sm md:text-base font-bold mb-3 text-gray-700">
                      Vai levar acompanhantes? <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-3 md:gap-4">
                      <button
                        type="button"
                        onClick={() => {
                          setHasCompanions(true);
                          if (adults.length === 0 && children.length === 0) {
                            addAdult();
                          }
                        }}
                        className={`py-3 md:py-4 px-6 rounded-xl font-bold transition-all text-base md:text-lg ${
                          hasCompanions === true
                            ? 'bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-lg'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Sim
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setHasCompanions(false);
                          setAdults([]);
                          setChildren([]);
                        }}
                        className={`py-3 md:py-4 px-6 rounded-xl font-bold transition-all text-base md:text-lg ${
                          hasCompanions === false
                            ? 'bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-lg'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Não
                      </button>
                    </div>
                  </div>
                )}

                {/* Formulário de Acompanhantes */}
                {hasCompanions && (
                  <div className="space-y-6 bg-gray-50 p-4 md:p-6 rounded-xl">
                    <div className="text-center pb-4 border-b border-gray-300">
                      <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-2">Dados dos Acompanhantes</h3>
                      <p className="text-sm text-gray-600">Até 2 adultos e 5 crianças</p>
                    </div>

                    {/* Adultos */}
                    <div>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                        <h4 className="font-bold text-base md:text-lg text-gray-800">Acompanhantes Adultos ({adults.length}/2)</h4>
                        {adults.length < 2 && (
                          <button
                            type="button"
                            onClick={addAdult}
                            className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:shadow-md transition-all text-sm md:text-base whitespace-nowrap"
                          >
                            + Adicionar Adulto
                          </button>
                        )}
                      </div>

                  {adults.map((adult, idx) => (
                    <div key={idx} className="bg-white p-4 rounded-lg mb-4 border-2 border-gray-200">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="font-semibold">Adulto #{idx + 1}</h5>
                        <button
                          type="button"
                          onClick={() => removeAdult(idx)}
                          className="text-red-500 hover:text-red-700 font-bold"
                        >
                          Remover
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="md:col-span-1">
                          <label className="block text-xs font-semibold mb-1">Nome</label>
                          <input
                            type="text"
                            value={adult.name}
                            onChange={(e) => updateAdult(idx, 'name', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:border-solar-orange focus:outline-none"
                            placeholder="Nome completo"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold mb-1">Idade</label>
                          <input
                            type="number"
                            value={adult.age}
                            onChange={(e) => updateAdult(idx, 'age', parseInt(e.target.value) || 18)}
                            min="18"
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:border-solar-orange focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold mb-1">RG ou CPF</label>
                          <input
                            type="text"
                            value={adult.document}
                            onChange={(e) => updateAdult(idx, 'document', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:border-solar-orange focus:outline-none"
                            placeholder="12.345.678-9"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Crianças */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-lg">Crianças ({children.length}/5)</h4>
                    {children.length < 5 && (
                      <button
                        type="button"
                        onClick={addChild}
                        className="bg-solar-purple text-white px-4 py-2 rounded-lg font-semibold hover:bg-opacity-90 transition-all"
                      >
                        + Adicionar Criança
                      </button>
                    )}
                  </div>

                  {children.map((child, idx) => (
                    <div key={idx} className="bg-white p-4 rounded-lg mb-4 border-2 border-gray-200">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="font-semibold">Criança #{idx + 1}</h5>
                        <button
                          type="button"
                          onClick={() => removeChild(idx)}
                          className="text-red-500 hover:text-red-700 font-bold"
                        >
                          Remover
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="md:col-span-1">
                          <label className="block text-xs font-semibold mb-1">Nome</label>
                          <input
                            type="text"
                            value={child.name}
                            onChange={(e) => updateChild(idx, 'name', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:border-solar-orange focus:outline-none"
                            placeholder="Nome completo"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold mb-1">Idade</label>
                          <input
                            type="number"
                            value={child.age}
                            onChange={(e) => updateChild(idx, 'age', parseInt(e.target.value) || 0)}
                            min="0"
                            max="17"
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:border-solar-orange focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold mb-1">RG ou CPF</label>
                          <input
                            type="text"
                            value={child.document}
                            onChange={(e) => updateChild(idx, 'document', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:border-solar-orange focus:outline-none"
                            placeholder="12.345.678-9"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Resumo de Compras */}
                {(adults.length > 0 || children.length > 0) && (
                  <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4">
                    <h4 className="font-bold text-lg mb-3 text-yellow-800">📋 Resumo de Ingressos</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Diárias de Acompanhante:</span>
                        <span className="font-bold">{totalDailyPasses}</span>
                      </div>
                      {wantsTransport && (
                        <div className="flex justify-between">
                          <span>Transfers de Ônibus:</span>
                          <span className="font-bold">{totalTransport}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

                {/* Transporte */}
                {selectedEmployee && hasCompanions !== null && (
                  <div>
                    <label className="block text-sm md:text-base font-bold mb-3 text-gray-700">
                      Deseja utilizar o transporte (ônibus)? <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-3 md:gap-4">
                      <button
                        type="button"
                        onClick={() => setWantsTransport(true)}
                        className={`py-3 md:py-4 px-6 rounded-xl font-bold transition-all text-base md:text-lg ${
                          wantsTransport === true
                            ? 'bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-lg'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Sim
                      </button>
                      <button
                        type="button"
                        onClick={() => setWantsTransport(false)}
                        className={`py-3 md:py-4 px-6 rounded-xl font-bold transition-all text-base md:text-lg ${
                          wantsTransport === false
                            ? 'bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-lg'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Não
                      </button>
                    </div>
                    {wantsTransport && (
                      <p className="text-sm text-gray-600 mt-3 text-center">
                        Vagas restantes no ônibus: <span className="font-bold text-pink-600">{remainingSeats}</span>
                      </p>
                    )}
                  </div>
                )}

                {/* Termos e Condições */}
                {wantsTransport !== null && (
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={agreedToRules}
                      onChange={(e) => setAgreedToRules(e.target.checked)}
                      className="mt-1 w-5 h-5 accent-pink-600"
                    />
                    <label htmlFor="terms" className="text-sm md:text-base text-gray-700">
                      Concordo com os{' '}
                      <button
                        type="button"
                        onClick={handleRulesClick}
                        className="text-pink-600 font-bold underline hover:text-pink-700"
                      >
                        termos e condições do evento
                      </button>
                      {' '}e confirmo que as informações fornecidas estão corretas.
                    </label>
                  </div>
                )}

                {/* Botão de Enviar */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-pink-500 via-pink-600 to-orange-500 text-white font-black py-4 md:py-5 px-8 rounded-2xl text-lg md:text-xl hover:shadow-2xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none uppercase"
                >
                  {isSubmitting ? 'Confirmando...' : 'Confirmar Presença 🎉'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Checkin;
