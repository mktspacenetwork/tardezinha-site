import React, { useState, useEffect } from 'react';
import { Companion } from '../../types';
import { useWizard } from '../ConfirmationWizard';

interface StepCompanionsProps {
  onNext: () => void;
}

const StepCompanions: React.FC<StepCompanionsProps> = ({ onNext }) => {
  const { wizardData, updateWizardData } = useWizard();
  const [adults, setAdults] = useState<Companion[]>(
    wizardData.companions.filter(c => c.type === 'adult')
  );
  const [children, setChildren] = useState<Companion[]>(
    wizardData.companions.filter(c => c.type === 'child')
  );

  useEffect(() => {
    // Update wizard data when companions change
    updateWizardData({
      companions: [...adults, ...children],
    });
  }, [adults, children]);

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

  const handleContinue = () => {
    // Validate all fields are filled
    const allValid = [...adults, ...children].every(
      c => c.name.trim() && c.document.trim() && (c.type === 'child' ? c.age >= 0 : true)
    );
    
    if (allValid || (adults.length === 0 && children.length === 0)) {
      onNext();
    }
  };

  const calculateCost = () => {
    let cost = 0;
    adults.forEach(() => cost += 103.78); // Full price for adults (13+)
    children.forEach(child => {
      if (child.age <= 12) {
        cost += 51.89; // Half price for children 0-12
      } else {
        cost += 103.78; // Full price for 13+
      }
    });
    return cost;
  };

  const totalCompanions = adults.length + children.length;
  const estimatedCost = calculateCost();

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full mb-4">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Acompanhantes</h3>
        <p className="text-gray-600">Você vai levar alguém com você?</p>
      </div>

      {/* Price info */}
      <div className="bg-gradient-to-r from-orange-50 to-pink-50 border-2 border-orange-200 rounded-xl p-4">
        <div className="text-sm text-gray-700 space-y-1">
          <p>💰 <strong>Diárias:</strong> R$ 103,78 (13+ anos) | R$ 51,89 (até 12 anos - meia)</p>
          <p>✅ <strong>Você (colaborador):</strong> GRÁTIS!</p>
        </div>
      </div>

      {/* Adults Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-lg font-bold text-gray-800">Adultos (máximo 2)</h4>
          <button
            onClick={addAdult}
            disabled={adults.length >= 2}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-semibold"
          >
            + Adicionar Adulto
          </button>
        </div>

        {adults.map((adult, index) => (
          <div key={index} className="bg-white border-2 border-gray-200 rounded-xl p-4 mb-3">
            <div className="flex justify-between items-start mb-3">
              <span className="text-sm font-semibold text-gray-600">Adulto {index + 1}</span>
              <button
                onClick={() => removeAdult(index)}
                className="text-red-500 hover:text-red-700"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Nome completo"
                value={adult.name}
                onChange={(e) => updateAdult(index, 'name', e.target.value)}
                className="px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              />
              <input
                type="text"
                placeholder="RG ou CPF"
                value={adult.document}
                onChange={(e) => updateAdult(index, 'document', e.target.value)}
                className="px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              />
            </div>
            <div className="mt-2 text-xs text-gray-500">Preço: R$ 103,78 à vista ou 12x R$ 10,56</div>
          </div>
        ))}
      </div>

      {/* Children Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-lg font-bold text-gray-800">Crianças (máximo 5)</h4>
          <button
            onClick={addChild}
            disabled={children.length >= 5}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm font-semibold"
          >
            + Adicionar Criança
          </button>
        </div>

        {children.map((child, index) => (
          <div key={index} className="bg-white border-2 border-gray-200 rounded-xl p-4 mb-3">
            <div className="flex justify-between items-start mb-3">
              <span className="text-sm font-semibold text-gray-600">Criança {index + 1}</span>
              <button
                onClick={() => removeChild(index)}
                className="text-red-500 hover:text-red-700"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Nome completo"
                value={child.name}
                onChange={(e) => updateChild(index, 'name', e.target.value)}
                className="px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              />
              <input
                type="number"
                placeholder="Idade"
                value={child.age || ''}
                onChange={(e) => updateChild(index, 'age', parseInt(e.target.value) || 0)}
                className="px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              />
              <input
                type="text"
                placeholder="RG ou CPF"
                value={child.document}
                onChange={(e) => updateChild(index, 'document', e.target.value)}
                className="px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              />
            </div>
            <div className="mt-2 text-xs text-gray-500">
              {child.age <= 12 ? (
                <span className="text-green-600 font-semibold">🎉 Meia entrada: R$ 51,89 à vista ou 12x R$ 5,28</span>
              ) : (
                <span>Preço: R$ 103,78 à vista ou 12x R$ 10,56</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Skip option */}
      {totalCompanions === 0 && (
        <div className="text-center py-4">
          <button
            onClick={onNext}
            className="text-gray-600 hover:text-gray-800 font-semibold underline"
          >
            Não vou levar acompanhantes →
          </button>
        </div>
      )}

      {/* Cost summary */}
      {totalCompanions > 0 && (
        <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-sm text-gray-600">Total de acompanhantes</div>
              <div className="text-2xl font-bold text-gray-800">{totalCompanions}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Custo estimado (diárias)</div>
              <div className="text-2xl font-bold text-orange-600">
                R$ {estimatedCost.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Continue button */}
      {totalCompanions > 0 && (
        <button
          onClick={handleContinue}
          className="w-full py-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold rounded-xl hover:shadow-lg transition-all text-lg"
        >
          Continuar →
        </button>
      )}
    </div>
  );
};

export default StepCompanions;
