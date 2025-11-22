import React, { useState, useEffect } from 'react';
import { useWizard } from '../ConfirmationWizard';
import { supabase, isSupabaseConfigured } from '../../supabaseClient';

interface StepTransportProps {
  onNext: () => void;
}

const StepTransport: React.FC<StepTransportProps> = ({ onNext }) => {
  const { wizardData, updateWizardData } = useWizard();
  const [childrenOnLap, setChildrenOnLap] = useState<number[]>(wizardData.childrenOnLap || []);
  const [remainingSeats, setRemainingSeats] = useState(90);
  const TOTAL_SEATS = 90;

  useEffect(() => {
    if (isSupabaseConfigured()) {
      const fetchSeats = async () => {
        const { data, error } = await supabase
          .from('confirmations')
          .select('total_transport');

        if (!error && data) {
          const totalUsed = data.reduce((sum, conf) => sum + (conf.total_transport || 0), 0);
          setRemainingSeats(Math.max(0, TOTAL_SEATS - totalUsed));
        }
      };
      fetchSeats();
    }
  }, []);

  const handleYes = () => {
    updateWizardData({ 
      wantsTransport: true,
      childrenOnLap,
    });
    onNext();
  };

  const handleNo = () => {
    updateWizardData({ 
      wantsTransport: false,
      childrenOnLap: [],
    });
    onNext();
  };

  // Toggle lap option using global companion index - immediately propagates to wizard
  const toggleLapOption = (globalCompanionIndex: number) => {
    const newChildrenOnLap = childrenOnLap.includes(globalCompanionIndex)
      ? childrenOnLap.filter(i => i !== globalCompanionIndex)
      : [...childrenOnLap, globalCompanionIndex];
    
    setChildrenOnLap(newChildrenOnLap);
    
    // Immediately propagate to wizard data for cost recalculation
    updateWizardData({
      childrenOnLap: newChildrenOnLap,
    });
  };

  // Calculate seats needed
  const calculateSeatsNeeded = () => {
    let seats = 1; // Employee always counts
    wizardData.companions.forEach((companion, globalIndex) => {
      // Check if this specific companion (by global index) is on lap
      const isOnLap = companion.age <= 5 && childrenOnLap.includes(globalIndex);
      if (!isOnLap) {
        seats += 1;
      }
    });
    return seats;
  };

  const seatsNeeded = calculateSeatsNeeded();
  const transportCost = seatsNeeded * 64.19;

  // Find children under 5 with their GLOBAL companion indices
  const childrenUnder5 = wizardData.companions
    .map((c, globalIndex) => ({ ...c, globalIndex }))
    .filter(c => c.age <= 5);

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full mb-4">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Transporte</h3>
        <p className="text-gray-600">Você precisa de ônibus para o evento?</p>
      </div>

      {/* Transport info boxes - Elegant cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Transfer +6 years */}
        <div className="bg-white border-2 border-orange-200 rounded-xl p-5 text-center shadow-sm hover:shadow-md transition-shadow">
          <svg className="w-10 h-10 mx-auto mb-3 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          <div className="text-sm font-semibold text-gray-600 mb-2">Transfer (+6 anos)</div>
          <div className="text-xl font-bold text-orange-600 mb-1">12x R$ 6,53</div>
          <div className="text-sm text-gray-600">ou R$ 64,19</div>
        </div>

        {/* Transfer ≤5 years */}
        <div className="bg-white border-2 border-green-200 rounded-xl p-5 text-center shadow-sm hover:shadow-md transition-shadow">
          <svg className="w-10 h-10 mx-auto mb-3 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm font-semibold text-gray-600 mb-2">Transfer (até 5 anos)</div>
          <div className="text-3xl font-bold text-green-600 mb-1">R$ 0,00</div>
          <div className="text-xs text-gray-500 font-medium">(Deve ir no colo)</div>
        </div>

        {/* Available seats */}
        <div className="bg-white border-2 border-blue-200 rounded-xl p-5 text-center shadow-sm hover:shadow-md transition-shadow">
          <svg className="w-10 h-10 mx-auto mb-3 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-.5a1.5 1.5 0 000 3h.5a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-.5a1.5 1.5 0 00-3 0v.5a1 1 0 01-1 1H6a1 1 0 01-1-1v-3a1 1 0 00-1-1h-.5a1.5 1.5 0 010-3H4a1 1 0 001-1V6a1 1 0 011-1h3a1 1 0 001-1v-.5z" />
          </svg>
          <div className="text-sm font-semibold text-gray-600 mb-2">Vagas Disponíveis</div>
          <div className="text-3xl font-bold text-blue-600 mb-1">{remainingSeats}</div>
          <div className="text-xs text-gray-500">de {TOTAL_SEATS} assentos</div>
        </div>
      </div>

      {/* Lap option for children under 5 */}
      {childrenUnder5.length > 0 && (
        <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4">
          <h4 className="font-bold text-gray-800 mb-3">Crianças até 5 anos</h4>
          <p className="text-sm text-gray-600 mb-3">
            As crianças abaixo podem ir no colo gratuitamente. Marque se deseja comprar assento:
          </p>
          {childrenUnder5.map((child) => (
            <div key={child.globalIndex} className="flex items-center justify-between bg-white rounded-lg p-3 mb-2">
              <div>
                <div className="font-semibold text-gray-800">{child.name}</div>
                <div className="text-sm text-gray-500">{child.age} {child.age === 1 ? 'ano' : 'anos'}</div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <span className="text-sm text-gray-600">Comprar assento?</span>
                <input
                  type="checkbox"
                  checked={!childrenOnLap.includes(child.globalIndex)}
                  onChange={() => toggleLapOption(child.globalIndex)}
                  className="w-5 h-5 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                />
              </label>
            </div>
          ))}
        </div>
      )}

      {/* Choice buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Yes Button */}
        <button
          onClick={handleYes}
          disabled={seatsNeeded > remainingSeats}
          className="group p-8 bg-white border-3 border-gray-200 rounded-2xl hover:border-green-500 hover:bg-green-50 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-green-100 group-hover:bg-green-500 rounded-full flex items-center justify-center transition-colors">
              <svg className="w-8 h-8 text-green-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800 mb-1">SIM</div>
              <div className="text-sm text-gray-600">Quero transporte</div>
              <div className="text-lg font-bold text-orange-600 mt-2">
                R$ {transportCost.toFixed(2)}
              </div>
              <div className="text-xs text-gray-500">
                {seatsNeeded} {seatsNeeded === 1 ? 'assento' : 'assentos'}
              </div>
            </div>
          </div>
          {seatsNeeded > remainingSeats && (
            <div className="mt-3 text-xs text-red-600 font-semibold">
              ⚠️ Não há vagas suficientes
            </div>
          )}
        </button>

        {/* No Button */}
        <button
          onClick={handleNo}
          className="group p-8 bg-white border-3 border-gray-200 rounded-2xl hover:border-gray-400 hover:bg-gray-50 transition-all transform hover:scale-105"
        >
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-gray-100 group-hover:bg-gray-300 rounded-full flex items-center justify-center transition-colors">
              <svg className="w-8 h-8 text-gray-600 group-hover:text-gray-700 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800 mb-1">NÃO</div>
              <div className="text-sm text-gray-600">Irei por conta própria</div>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};

export default StepTransport;
