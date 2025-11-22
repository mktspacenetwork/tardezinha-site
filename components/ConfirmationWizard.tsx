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
  isEditMode: initialEditMode = false,
  editingConfirmationId: initialEditingId = null,
  existingData,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isEditMode, setIsEditMode] = useState(initialEditMode);
  const [editingConfirmationId, setEditingConfirmationId] = useState<number | null>(initialEditingId);
  
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

  const updateWizardData = (updates: Partial<WizardData>) => {
    setWizardData(prev => {
      const updated = { ...prev, ...updates };
      
      // Recalculate costs when companions or transport changes
      if (updates.companions !== undefined || updates.wantsTransport !== undefined || updates.childrenOnLap !== undefined) {
        const costs = calculateCosts(
          updated.companions,
          updated.wantsTransport || false,
          updated.childrenOnLap || []
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
    console.log('Loading existing confirmation for edit mode:', existing);
    
    // Enter edit mode
    setIsEditMode(true);
    setEditingConfirmationId(existing.id);
    
    // Load existing data into wizard
    const companions = existing.companions || [];
    const wantsTransport = existing.wants_transport || false;
    
    // Update wizard data with existing confirmation
    const loadedData: Partial<WizardData> = {
      employee: employee,
      employeeRG: existing.employee_rg || '',
      attending: true,
      companions: companions,
      wantsTransport: wantsTransport,
      childrenOnLap: [], // Reset lap selections for edit mode
    };
    
    // Use updateWizardData to trigger cost recalculation
    setWizardData(prev => {
      const updated = { ...prev, ...loadedData };
      
      // Recalculate costs with loaded data
      const costs = calculateCosts(
        updated.companions,
        updated.wantsTransport || false,
        updated.childrenOnLap || []
      );
      updated.costs = costs;
      updated.transportSeatsNeeded = costs.breakdown.transportSeats;
      
      return updated;
    });
    
    console.log('Edit mode activated with loaded data');
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
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full my-8">
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
            
            {/* Edit mode indicator */}
            {isEditMode && (
              <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                <p className="text-sm text-blue-700 font-medium flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                  Modo de Edição - Atualizando sua confirmação existente
                </p>
              </div>
            )}
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
    </WizardContext.Provider>
  );
};

export default ConfirmationWizard;
