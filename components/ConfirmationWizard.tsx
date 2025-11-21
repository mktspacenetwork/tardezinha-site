import React, { useState, createContext, useContext } from 'react';
import { WizardData, Employee, Companion } from '../types';
import { calculateCosts } from '../utils/costCalculator';
import StepEmployeeLogin from './wizard/StepEmployeeLogin';
import StepAttendance from './wizard/StepAttendance';
import StepCompanions from './wizard/StepCompanions';
import StepTransport from './wizard/StepTransport';
import StepSummary from './wizard/StepSummary';
import StepSuccess from './wizard/StepSuccess';

// Context for sharing wizard data across steps
interface WizardContextType {
  wizardData: WizardData;
  updateWizardData: (updates: Partial<WizardData>) => void;
  isEditMode: boolean;
  editingConfirmationId: number | null;
}

const WizardContext = createContext<WizardContextType | undefined>(undefined);

export const useWizard = () => {
  const context = useContext(WizardContext);
  if (!context) {
    throw new Error('useWizard must be used within WizardProvider');
  }
  return context;
};

interface ConfirmationWizardProps {
  onClose: () => void;
  onSuccess: () => void;
  isEditMode?: boolean;
  editingConfirmationId?: number | null;
  existingData?: Partial<WizardData>;
}

const ConfirmationWizard: React.FC<ConfirmationWizardProps> = ({
  onClose,
  onSuccess,
  isEditMode = false,
  editingConfirmationId = null,
  existingData,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [wizardData, setWizardData] = useState<WizardData>({
    employee: existingData?.employee || null,
    employeeRG: existingData?.employeeRG || '',
    attending: existingData?.attending || null,
    companions: existingData?.companions || [],
    wantsTransport: existingData?.wantsTransport || null,
    transportSeatsNeeded: 0,
    childrenOnLap: existingData?.childrenOnLap || [],
    costs: existingData?.costs || {
      dailyPasses: 0,
      transport: 0,
      total: 0,
      breakdown: {
        adultPasses: 0,
        childPasses: 0,
        halfPricePasses: 0,
        transportSeats: 0,
      },
    },
  });

  // Duplicate detection modals
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [existingConfirmation, setExistingConfirmation] = useState<any>(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const updateWizardData = (updates: Partial<WizardData>) => {
    setWizardData(prev => {
      const updated = { ...prev, ...updates };
      
      // Recalculate costs when companions or transport changes
      if (updates.companions || updates.wantsTransport !== undefined || updates.childrenOnLap) {
        const costs = calculateCosts(
          updated.companions,
          updated.wantsTransport || false,
          updated.childrenOnLap
        );
        updated.costs = costs;
        updated.transportSeatsNeeded = costs.breakdown.transportSeats;
      }
      
      return updated;
    });
  };

  const nextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, 6));
  };

  const previousStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const goToStep = (step: number) => {
    setCurrentStep(step);
  };

  const handleDuplicateFound = (employee: Employee, existing: any) => {
    setExistingConfirmation(existing);
    setShowDuplicateModal(true);
  };

  const handleRequestEdit = () => {
    setShowDuplicateModal(false);
    setShowPasswordModal(true);
  };

  const handleCancelDuplicate = () => {
    setShowDuplicateModal(false);
    setExistingConfirmation(null);
  };

  const handlePasswordValidation = () => {
    if (!existingConfirmation || !wizardData.employee) {
      setPasswordError('Erro na validação');
      return;
    }

    // Validate using FULL RG
    const correctPassword = existingConfirmation.employee_rg;
    if (passwordInput.trim() === correctPassword.trim()) {
      // Load existing data and enter edit mode
      const existingWizardData: Partial<WizardData> = {
        employee: wizardData.employee,
        employeeRG: existingConfirmation.employee_rg,
        attending: true,
        companions: existingConfirmation.companions || [],
        wantsTransport: existingConfirmation.wants_transport,
        childrenOnLap: [],
      };

      setWizardData(prev => ({
        ...prev,
        ...existingWizardData,
      }));

      // Close password modal and continue wizard in edit mode
      setShowPasswordModal(false);
      setPasswordInput('');
      setPasswordError('');
      
      // Continue to next step
      nextStep();
    } else {
      setPasswordError('RG incorreto. Tente novamente.');
    }
  };

  const handleCancelPassword = () => {
    setShowPasswordModal(false);
    setPasswordInput('');
    setPasswordError('');
    setExistingConfirmation(null);
  };

  const handleDeclineAttendance = () => {
    // Jump to success step (6) with farewell message
    setCurrentStep(6);
  };

  const handleSuccessSubmit = () => {
    setCurrentStep(6);
    onSuccess();
  };

  // Calculate progress percentage
  const progress = (currentStep / 6) * 100;

  return (
    <WizardContext.Provider
      value={{
        wizardData,
        updateWizardData,
        isEditMode,
        editingConfirmationId,
      }}
    >
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Progress Bar */}
          <div className="sticky top-0 bg-white z-10 px-6 pt-6 pb-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-2xl font-bold text-gray-800">
                {isEditMode ? 'Editar Confirmação' : 'Confirmar Presença'}
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Progress indicator */}
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-orange-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-sm font-semibold text-gray-600 min-w-[60px]">
                Passo {currentStep}/6
              </span>
            </div>
          </div>

          {/* Step Content */}
          <div className="p-6">
            {currentStep === 1 && (
              <StepEmployeeLogin 
                onNext={nextStep}
                onDuplicateFound={handleDuplicateFound}
              />
            )}
            {currentStep === 2 && (
              <StepAttendance 
                onNext={nextStep}
                onDecline={handleDeclineAttendance}
              />
            )}
            {currentStep === 3 && (
              <StepCompanions onNext={nextStep} />
            )}
            {currentStep === 4 && (
              <StepTransport onNext={nextStep} />
            )}
            {currentStep === 5 && (
              <StepSummary onSubmit={handleSuccessSubmit} />
            )}
            {currentStep === 6 && (
              <StepSuccess onClose={onClose} />
            )}
          </div>

          {/* Navigation Buttons - Only show for steps 2-4 */}
          {currentStep >= 2 && currentStep <= 4 && (
            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-between gap-4">
              <button
                onClick={previousStep}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-100 transition-all"
              >
                ← Voltar
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Duplicate Confirmation Modal */}
      {showDuplicateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Confirmação Existente
              </h3>
              <p className="text-gray-600">
                Você já realizou suas confirmações. Deseja editar?
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCancelDuplicate}
                className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-100 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleRequestEdit}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold rounded-xl hover:shadow-lg transition-all"
              >
                Editar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Validação de Segurança
              </h3>
              <p className="text-gray-600 text-sm">
                Digite seu RG completo para editar sua confirmação
              </p>
            </div>

            <div className="mb-4">
              <input
                type="text"
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  setPasswordError('');
                }}
                placeholder="Digite seu RG"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all"
              />
              {passwordError && (
                <p className="text-red-600 text-sm mt-2">{passwordError}</p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCancelPassword}
                className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-100 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handlePasswordValidation}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold rounded-xl hover:shadow-lg transition-all"
              >
                Validar
              </button>
            </div>
          </div>
        </div>
      )}
    </WizardContext.Provider>
  );
};

export default ConfirmationWizard;
