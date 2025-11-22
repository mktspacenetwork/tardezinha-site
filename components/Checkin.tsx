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
            <span className="bg-green-500 text-white px-6 py-3 rounded-lg text-base font-black uppercase tracking-wider shadow-lg transform -rotate-2 inline-block animate-pulse-zoom">
              COLABORADOR<br />100% GRÁTIS
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

        {/* Confirmed Attendees Carousel */}
        {confirmedAttendees.length > 0 && (
          <div className="bg-white rounded-3xl shadow-xl p-8 mb-12 overflow-hidden">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 text-center">
              Quem já confirmou presença
            </h3>
            <div className="relative">
              <div className="flex gap-6 animate-scroll-infinite">
                {[...confirmedAttendees, ...confirmedAttendees].map((attendee, index) => {
                  const nameParts = attendee.fullName.split(' ');
                  const firstName = nameParts[0];
                  return (
                    <div
                      key={index}
                      className="flex-shrink-0 flex flex-col items-center"
                      style={{ minWidth: '80px' }}
                    >
                      <div className={`w-16 h-16 bg-gradient-to-r ${attendee.color} rounded-full flex items-center justify-center shadow-lg`}>
                        <span className="text-3xl">😎</span>
                      </div>
                      <p className="text-center mt-2 text-sm font-semibold text-gray-700 max-w-[80px] truncate">
                        {firstName}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
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
