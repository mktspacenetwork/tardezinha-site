import React, { useState, useEffect, useRef } from 'react';
import { Employee, Confirmation, Companion } from '../types';
import { supabase, isSupabaseConfigured } from '../supabaseClient';

declare var confetti: any;

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
    <section id="checkin" ref={sectionRef} className="py-20 px-4 bg-gradient-to-br from-solar-yellow via-solar-orange to-solar-pink text-white">
      <div className="max-w-6xl mx-auto">
        <div className={`text-center mb-12 ${isVisible ? 'animate-fadeInUp' : 'opacity-0'}`}>
          <h2 className="text-4xl md:text-5xl font-black mb-4">Confirmação de Presença</h2>
          <p className="text-xl text-gray-100">
            Confirme sua presença e garanta sua vaga na Tardezinha da Space!
          </p>
          {remainingDays > 0 && (
            <div className="mt-6 inline-block bg-white bg-opacity-20 backdrop-blur-sm px-6 py-3 rounded-full">
              <p className="text-lg font-semibold">
                ⏰ Faltam <span className="text-3xl font-black">{remainingDays}</span> dias para o prazo final!
              </p>
            </div>
          )}
        </div>

        {/* Carrossel de Confirmados */}
        <div className="mb-12 overflow-hidden relative">
          <div className="flex gap-4 animate-marquee">
            {[...confirmedAttendees, ...confirmedAttendees].map((person, idx) => (
              <div
                key={idx}
                className="flex-shrink-0 bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-4 flex items-center gap-3 shadow-lg"
              >
                <div className="w-12 h-12 rounded-full bg-solar-purple text-white font-bold flex items-center justify-center text-lg">
                  {person.initials}
                </div>
                <div className="text-left">
                  <div className="font-semibold">{person.fullName}</div>
                  <div className="text-2xl">{person.mood}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Formulário */}
        <div className="bg-white text-gray-800 rounded-2xl shadow-2xl p-8 max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                {error}
              </div>
            )}

            {/* Nome do Colaborador com Autocomplete */}
            <div className="relative">
              <label className="block text-sm font-bold mb-2">
                Nome do Colaborador <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={handleNameChange}
                onFocus={() => name.length > 1 && setShowSuggestions(true)}
                placeholder="Digite seu nome para buscar..."
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-solar-orange focus:outline-none"
                required
              />
              
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border-2 border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {suggestions.map((emp, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleSuggestionClick(emp)}
                      className="px-4 py-3 hover:bg-solar-yellow hover:bg-opacity-20 cursor-pointer border-b last:border-b-0"
                    >
                      <div className="font-semibold">{emp.name}</div>
                      <div className="text-sm text-gray-600">{emp.department}</div>
                    </div>
                  ))}
                </div>
              )}

              {selectedEmployee && (
                <div className="mt-2 p-3 bg-green-100 border border-green-400 rounded-lg flex items-center gap-2">
                  <span className="text-2xl">✓</span>
                  <div>
                    <div className="font-bold text-green-800">{selectedEmployee.name}</div>
                    <div className="text-sm text-green-700">Colaborador confirmado - {selectedEmployee.department}</div>
                  </div>
                </div>
              )}
            </div>

            {/* RG do Colaborador */}
            {selectedEmployee && (
              <div>
                <label className="block text-sm font-bold mb-2">
                  RG do Colaborador <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={employeeRG}
                  onChange={(e) => setEmployeeRG(e.target.value)}
                  placeholder="Ex: 12.345.678-9"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-solar-orange focus:outline-none"
                  required
                />
              </div>
            )}

            {/* Acompanhantes? */}
            {selectedEmployee && employeeRG && (
              <div>
                <label className="block text-sm font-bold mb-3">
                  Vai levar acompanhantes? <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setHasCompanions(true);
                      if (adults.length === 0 && children.length === 0) {
                        addAdult();
                      }
                    }}
                    className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
                      hasCompanions === true
                        ? 'bg-solar-orange text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
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
                    className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
                      hasCompanions === false
                        ? 'bg-solar-orange text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Não
                  </button>
                </div>
              </div>
            )}

            {/* Formulário de Acompanhantes */}
            {hasCompanions && (
              <div className="space-y-6 bg-gray-50 p-6 rounded-lg">
                <div className="text-center pb-4 border-b">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Dados dos Acompanhantes</h3>
                  <p className="text-sm text-gray-600">Até 2 adultos e 5 crianças</p>
                </div>

                {/* Adultos */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-lg">Acompanhantes Adultos ({adults.length}/2)</h4>
                    {adults.length < 2 && (
                      <button
                        type="button"
                        onClick={addAdult}
                        className="bg-solar-purple text-white px-4 py-2 rounded-lg font-semibold hover:bg-opacity-90 transition-all"
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
                <label className="block text-sm font-bold mb-3">
                  Deseja utilizar o transporte (ônibus)? <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setWantsTransport(true)}
                    className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
                      wantsTransport === true
                        ? 'bg-solar-orange text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Sim
                  </button>
                  <button
                    type="button"
                    onClick={() => setWantsTransport(false)}
                    className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
                      wantsTransport === false
                        ? 'bg-solar-orange text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Não
                  </button>
                </div>
                {wantsTransport && (
                  <p className="text-sm text-gray-600 mt-2">
                    Vagas restantes no ônibus: <span className="font-bold">{remainingSeats}</span>
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
                  className="mt-1 w-5 h-5"
                />
                <label htmlFor="terms" className="text-sm">
                  Concordo com os{' '}
                  <button
                    type="button"
                    onClick={handleRulesClick}
                    className="text-solar-purple font-bold underline hover:text-solar-pink"
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
              className="w-full bg-gradient-solar text-white font-black py-4 px-8 rounded-full text-lg hover:shadow-2xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isSubmitting ? 'Confirmando...' : 'Confirmar Presença 🎉'}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Checkin;
