import React, { useEffect, useState } from 'react';
import { useWizard } from '../ConfirmationWizard';

declare var confetti: any;

interface StepSuccessProps {
  onClose: () => void;
}

const StepSuccess: React.FC<StepSuccessProps> = ({ onClose }) => {
  const { wizardData } = useWizard();
  const [redirectCountdown, setRedirectCountdown] = useState<number | null>(null);

  const hasPurchases = wizardData.costs.total > 0;

  useEffect(() => {
    // Trigger confetti only for no-purchase confirmations
    if (!hasPurchases && typeof confetti !== 'undefined') {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }

    // Start countdown for purchases
    if (hasPurchases) {
      setRedirectCountdown(6);
    }
  }, [hasPurchases]);

  useEffect(() => {
    if (redirectCountdown === null) return;

    if (redirectCountdown === 0) {
      window.open('https://useingresso.com/evento/691b30d3dc465aca63b2bbef', '_blank');
      setRedirectCountdown(null);
      return;
    }

    const timer = setTimeout(() => {
      setRedirectCountdown(redirectCountdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [redirectCountdown]);

  const firstName = wizardData.employee?.name.split(' ')[0] || 'Colaborador';

  // No purchases - simple success message
  if (!hasPurchases) {
    return (
      <div className="space-y-6 text-center py-8">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full mb-4">
          <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <div>
          <h3 className="text-3xl font-black text-gray-800 mb-3">
            Parabéns, {firstName}! 🎉
          </h3>
          <p className="text-xl text-gray-700 mb-2">
            Sua presença está confirmada!
          </p>
          <p className="text-lg text-gray-600">
            Nos vemos lá na Tardezinha da Space!
          </p>
        </div>

        <div className="bg-gradient-to-r from-orange-50 to-pink-50 border-2 border-orange-200 rounded-xl p-6 max-w-md mx-auto">
          <h4 className="font-bold text-gray-800 mb-2">📅 Lembre-se:</h4>
          <div className="text-sm text-gray-700 space-y-1">
            <p><strong>Data:</strong> 21 de Dezembro de 2025 (Domingo)</p>
            <p><strong>Horário:</strong> 14h00</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="px-8 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold rounded-xl hover:shadow-lg transition-all"
        >
          Fechar
        </button>
      </div>
    );
  }

  // With purchases - redirect flow
  return (
    <div className="space-y-6 text-center py-8">
      <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full mb-4 animate-pulse">
        <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      </div>

      <div>
        <h3 className="text-3xl font-black text-gray-800 mb-3">
          {firstName}, você será redirecionado!
        </h3>
        <p className="text-lg text-gray-600 mb-6">
          Para sua segurança, você deverá realizar a compra de:
        </p>
      </div>

      {/* Purchase details */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6 max-w-md mx-auto">
        <h4 className="font-bold text-gray-800 mb-4">🎫 Seus Ingressos:</h4>
        
        {wizardData.costs.dailyPasses > 0 && (
          <div className="bg-white rounded-lg p-4 mb-3">
            <div className="flex justify-between items-center">
              <div className="text-left">
                <div className="font-semibold text-gray-800">Diárias</div>
                <div className="text-sm text-gray-600">
                  {wizardData.costs.breakdown.adultPasses} inteira(s) + {wizardData.costs.breakdown.childPasses} meia(s)
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-orange-600">
                  R$ {wizardData.costs.dailyPasses.toFixed(2)}
                </div>
                <div className="text-xs text-gray-500">
                  12x R$ {(wizardData.costs.dailyPasses / 12).toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        )}

        {wizardData.costs.transport > 0 && (
          <div className="bg-white rounded-lg p-4 mb-3">
            <div className="flex justify-between items-center">
              <div className="text-left">
                <div className="font-semibold text-gray-800">Transporte</div>
                <div className="text-sm text-gray-600">
                  {wizardData.costs.breakdown.transportSeats} {wizardData.costs.breakdown.transportSeats === 1 ? 'assento' : 'assentos'}
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-orange-600">
                  R$ {wizardData.costs.transport.toFixed(2)}
                </div>
                <div className="text-xs text-gray-500">
                  12x R$ {(wizardData.costs.transport / 12).toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="border-t-2 border-blue-300 pt-3 mt-3">
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-gray-800">Total:</span>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">
                R$ {wizardData.costs.total.toFixed(2)}
              </div>
              <div className="text-sm text-gray-600">
                ou 12x R$ {(wizardData.costs.total / 12).toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Important warning */}
      <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-4 max-w-md mx-auto">
        <p className="text-sm text-yellow-800 font-semibold">
          ⚠️ <strong>Importante:</strong> Sua reserva só será confirmada após o pagamento dos seus ingressos.
        </p>
      </div>

      {/* Countdown */}
      {redirectCountdown !== null && (
        <div className="text-gray-600">
          <p className="text-lg font-semibold mb-2">
            Redirecionando em {redirectCountdown} segundo{redirectCountdown !== 1 ? 's' : ''}...
          </p>
          <div className="w-full max-w-md mx-auto bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-orange-500 to-pink-500 h-2 rounded-full transition-all duration-1000"
              style={{ width: `${((6 - redirectCountdown) / 6) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Manual redirect button */}
      <button
        onClick={() => window.open('https://useingresso.com/evento/691b30d3dc465aca63b2bbef', '_blank')}
        className="px-8 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold rounded-xl hover:shadow-lg transition-all"
      >
        Ir agora →
      </button>
    </div>
  );
};

export default StepSuccess;
