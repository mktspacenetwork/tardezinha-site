import React, { useState, useEffect, useRef } from 'react';
import { supabase, isSupabaseConfigured } from '../supabaseClient';
import ConfirmationWizard from './ConfirmationWizard';

const MOOD_EMOJIS = ['🎉', '😎', '🤩', '🥳', '🚀', '🔥', '🕺', '💃', '🎶', '🌴', '☀️', '⭐', '✨', '🎊', '🌟'];
const GRADIENT_COLORS = [
  'from-orange-400 to-orange-600',
  'from-pink-400 to-pink-600',
  'from-rose-400 to-rose-600',
  'from-orange-500 to-pink-500',
  'from-pink-500 to-pink-700',
  'from-orange-600 to-red-500',
  'from-pink-300 to-pink-500',
  'from-orange-400 to-pink-400',
  'from-rose-500 to-pink-600',
  'from-orange-500 to-orange-700',
];

interface ConfirmedAttendee {
  initials: string;
  fullName: string;
  mood: string;
  color: string;
}

interface CheckinProps {
  onConfirm: () => void;
  onOpenRules: () => void;
}

const Checkin: React.FC<CheckinProps> = ({ onConfirm, onOpenRules }) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [remainingDays, setRemainingDays] = useState(0);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [confirmedAttendees, setConfirmedAttendees] = useState<ConfirmedAttendee[]>([]);
  const [remainingSeats, setRemainingSeats] = useState(90);
  const TOTAL_BUS_SEATS = 90;

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
    const deadline = new Date('2025-12-21T12:00:00');
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

  useEffect(() => {
    if (isSupabaseConfigured()) {
      fetchConfirmedAttendees();
    }
  }, []);

  const fetchConfirmedAttendees = async () => {
    const { data, error } = await supabase
      .from('confirmations')
      .select('employee_name')
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      const attendees: ConfirmedAttendee[] = data.map((conf) => {
        const nameParts = conf.employee_name.trim().split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts[nameParts.length - 1] || '';
        const initials = (firstName[0] || '') + (nameParts.length > 1 ? lastName[0] || '' : '');
        
        const randomMood = MOOD_EMOJIS[Math.floor(Math.random() * MOOD_EMOJIS.length)];
        const randomColor = GRADIENT_COLORS[Math.floor(Math.random() * GRADIENT_COLORS.length)];
        
        return {
          initials: initials.toUpperCase(),
          fullName: conf.employee_name,
          mood: randomMood,
          color: randomColor,
        };
      });
      
      setConfirmedAttendees(attendees);
    }
  };

  const handleOpenWizard = () => {
    setIsWizardOpen(true);
  };

  const handleCloseWizard = () => {
    setIsWizardOpen(false);
  };

  const handleWizardSuccess = () => {
    fetchConfirmedAttendees(); // Refresh attendees list
    onConfirm(); // Call parent callback
  };

  return (
    <section
      id="checkin"
      ref={sectionRef}
      className={`min-h-screen bg-gradient-to-b from-white via-orange-50/30 to-pink-50/30 py-16 md:py-24 px-4 transition-opacity duration-1000 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block mb-4">
            <span className="bg-gradient-to-r from-orange-500 to-pink-500 text-white px-6 py-2 rounded-full text-sm font-bold uppercase tracking-wider shadow-lg">
              100% GRÁTIS
            </span>
          </div>
          <h2 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
            <span className="bg-gradient-to-r from-orange-600 via-pink-500 to-orange-500 bg-clip-text text-transparent">
              Confirme Sua Presença
            </span>
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Não perca a melhor festa do ano! Sua entrada é <strong>100% gratuita</strong>.
            Você só paga se levar acompanhantes ou quiser transporte.
          </p>
        </div>

        {/* Countdown Timer */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 mb-12 border-4 border-orange-200">
          <div className="text-center">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
              Faltam apenas
            </h3>
            <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full mb-6">
              <span className="text-6xl font-black text-white">{remainingDays}</span>
            </div>
            <p className="text-xl md:text-2xl font-semibold text-gray-700">
              {remainingDays === 1 ? 'dia' : 'dias'} para a Tardezinha da Space!
            </p>
            <p className="text-gray-600 mt-4">
              <strong>21 de Dezembro de 2025</strong> (Domingo) · 14h00
            </p>
          </div>
        </div>

        {/* CTA Button */}
        <div className="text-center mb-12">
          <button
            onClick={handleOpenWizard}
            className="group bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-12 py-6 rounded-2xl text-2xl md:text-3xl font-black shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 uppercase"
          >
            <span className="flex items-center gap-3">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
              Quero Participar!
              <svg className="w-8 h-8 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </button>
        </div>

        {/* Warning about transport */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6 mb-12">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-gray-800 text-lg mb-2">
                Transporte disponível
              </h4>
              <p className="text-gray-700 mb-2">
                Temos <strong className="text-blue-600">{remainingSeats} vagas</strong> disponíveis no ônibus!
              </p>
              <p className="text-sm text-gray-600">
                💰 Valor: R$ 64,19 à vista ou 12x R$ 6,53 por pessoa
              </p>
            </div>
          </div>
        </div>

        {/* Confirmed Attendees Carousel */}
        {confirmedAttendees.length > 0 && (
          <div className="bg-white rounded-3xl shadow-xl p-8 mb-12">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 text-center">
              Quem já confirmou presença
            </h3>
            <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide">
              {confirmedAttendees.map((attendee, index) => (
                <div
                  key={index}
                  className="flex-shrink-0 group"
                  title={attendee.fullName}
                >
                  <div className={`w-16 h-16 bg-gradient-to-r ${attendee.color} rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-110 transition-transform cursor-pointer`}>
                    {attendee.initials}
                  </div>
                  <div className="text-center mt-2 text-2xl">{attendee.mood}</div>
                </div>
              ))}
            </div>
            <p className="text-center text-gray-600 mt-4 font-semibold">
              {confirmedAttendees.length} {confirmedAttendees.length === 1 ? 'pessoa confirmada' : 'pessoas confirmadas'}
            </p>
          </div>
        )}
      </div>

      {/* Wizard Modal */}
      {isWizardOpen && (
        <ConfirmationWizard
          onClose={handleCloseWizard}
          onSuccess={handleWizardSuccess}
        />
      )}
    </section>
  );
};

export default Checkin;
