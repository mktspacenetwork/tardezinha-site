import React from 'react';
import { useWizard } from '../ConfirmationWizard';

interface StepAttendanceProps {
  onNext: () => void;
  onDecline: () => void;
}

const StepAttendance: React.FC<StepAttendanceProps> = ({ onNext, onDecline }) => {
  const { wizardData, updateWizardData } = useWizard();

  const handleYes = () => {
    updateWizardData({ attending: true });
    onNext();
  };

  const handleNo = () => {
    updateWizardData({ attending: false });
    onDecline();
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full mb-4">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-gray-800 mb-2">
          Olá, {wizardData.employee?.name?.split(' ')[0]}!
        </h3>
        <p className="text-gray-600 text-lg">Você vai participar da Tardezinha da Space?</p>
        <p className="text-sm text-gray-500 mt-2">21 de Dezembro de 2025 às 14h</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Yes Button */}
        <button
          onClick={handleYes}
          className="group p-8 bg-white border-3 border-gray-200 rounded-2xl hover:border-green-500 hover:bg-green-50 transition-all transform hover:scale-105"
        >
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-green-100 group-hover:bg-green-500 rounded-full flex items-center justify-center transition-colors">
              <svg className="w-8 h-8 text-green-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800 mb-1">SIM</div>
              <div className="text-sm text-gray-600">Vou participar! 🎉</div>
            </div>
          </div>
        </button>

        {/* No Button */}
        <button
          onClick={handleNo}
          className="group p-8 bg-white border-3 border-gray-200 rounded-2xl hover:border-red-500 hover:bg-red-50 transition-all transform hover:scale-105"
        >
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-red-100 group-hover:bg-red-500 rounded-full flex items-center justify-center transition-colors">
              <svg className="w-8 h-8 text-red-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800 mb-1">NÃO</div>
              <div className="text-sm text-gray-600">Não poderei ir</div>
            </div>
          </div>
        </button>
      </div>

      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 text-center">
        <p className="text-sm text-blue-800">
          💡 Sua participação é <strong>100% GRATUITA</strong>! Você só paga se levar acompanhantes ou quiser transporte.
        </p>
      </div>
    </div>
  );
};

export default StepAttendance;
