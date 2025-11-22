import React, { useState, useEffect } from 'react';
import { Employee } from '../../types';
import { supabase, isSupabaseConfigured } from '../../supabaseClient';
import { useWizard } from '../ConfirmationWizard';

interface StepEmployeeLoginProps {
  onNext: () => void;
  onDuplicateFound: (employee: Employee, existingConfirmation: any) => void;
}

const StepEmployeeLogin: React.FC<StepEmployeeLoginProps> = ({ onNext, onDuplicateFound }) => {
  const { wizardData, updateWizardData } = useWizard();
  const [name, setName] = useState(wizardData.employee?.name || '');
  const [suggestions, setSuggestions] = useState<Employee[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  
  // Duplicate detection states
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [existingConfirmation, setExistingConfirmation] = useState<any>(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    if (name.length >= 2 && isSupabaseConfigured()) {
      setIsSearching(true);
      const searchEmployees = async () => {
        const { data, error } = await supabase
          .from('employees')
          .select('*')
          .ilike('name', `%${name}%`)
          .limit(10);

        if (!error && data) {
          setSuggestions(data);
          setShowSuggestions(true);
        }
        setIsSearching(false);
      };
      
      const debounce = setTimeout(searchEmployees, 300);
      return () => clearTimeout(debounce);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [name]);

  const checkExistingConfirmation = async (employeeId: number) => {
    if (!isSupabaseConfigured()) return null;

    try {
      console.log('🔍 Checking for existing confirmation for employee ID:', employeeId);
      
      const { data, error } = await supabase
        .from('confirmations')
        .select('*')
        .eq('employee_id', employeeId)
        .maybeSingle();

      if (error) {
        console.error('❌ Error checking confirmation:', error);
        return null;
      }

      if (data) {
        console.log('✅ DUPLICATE FOUND! Existing confirmation:', data);
        
        // Load companions separately if confirmation exists
        const { data: companions } = await supabase
          .from('companions')
          .select('*')
          .eq('confirmation_id', data.id);
        
        return {
          ...data,
          companions: companions || [],
        };
      }
      
      console.log('✅ No duplicate - employee can create new confirmation');
      return null;
    } catch (err) {
      console.error('❌ Exception checking confirmation:', err);
      return null;
    }
  };

  const handleSelectEmployee = async (employee: Employee) => {
    setName(employee.name);
    setSuggestions([]);
    setShowSuggestions(false);
    setPasswordError('');
    setPasswordInput('');

    // Update wizard data with selected employee
    updateWizardData({
      employee,
      employeeRG: '',
    });

    // Check for duplicate confirmation
    setIsValidating(true);
    if (employee.id) {
      const existing = await checkExistingConfirmation(employee.id);
      if (existing) {
        // Show duplicate detected UI inline
        setIsDuplicate(true);
        setExistingConfirmation(existing);
        setIsValidating(false);
        return;
      }
    }
    setIsValidating(false);
    setIsDuplicate(false);
    setExistingConfirmation(null);
  };

  const handleContinue = () => {
    const rgValue = wizardData.employeeRG.trim();
    // Require at least 5 characters for RG/CPF
    if (wizardData.employee && rgValue && rgValue.length >= 5) {
      onNext();
    }
  };

  const handleEditMode = () => {
    if (!existingConfirmation || !wizardData.employee) {
      setPasswordError('Erro na validação');
      return;
    }

    const correctPassword = existingConfirmation.employee_rg;
    const enteredPassword = passwordInput.trim();

    if (enteredPassword === correctPassword) {
      // Password correct - load existing data and enter edit mode
      console.log('Password validated, loading existing data:', existingConfirmation);
      
      // Call parent to set edit mode and pass existing data
      onDuplicateFound(wizardData.employee, existingConfirmation);
      
      // Clear states
      setPasswordError('');
      setPasswordInput('');
      setIsDuplicate(false);
      
      // Continue to next step (wizard will be in edit mode)
      onNext();
    } else {
      setPasswordError('RG/CPF incorreto. Verifique e tente novamente.');
    }
  };

  const handleCancelDuplicate = () => {
    // Reset duplicate detection - let user select another employee
    setIsDuplicate(false);
    setExistingConfirmation(null);
    setPasswordInput('');
    setPasswordError('');
    setName('');
    updateWizardData({
      employee: null,
      employeeRG: '',
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full mb-4">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Quem é você?</h3>
        <p className="text-gray-600">Digite seu nome para começar</p>
      </div>

      <div className="relative">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Nome do Colaborador
        </label>
        <div className="relative">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Digite seu nome..."
            disabled={isDuplicate}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          {isSearching && (
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-500"></div>
            </div>
          )}
        </div>

        {/* Suggestions dropdown */}
        {showSuggestions && suggestions.length > 0 && !isDuplicate && (
          <div className="absolute z-10 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-xl max-h-60 overflow-y-auto">
            {suggestions.map((employee) => (
              <button
                key={employee.id}
                onClick={() => handleSelectEmployee(employee)}
                className="w-full px-4 py-3 text-left hover:bg-orange-50 transition-colors border-b border-gray-100 last:border-b-0"
              >
                <div className="font-semibold text-gray-800">{employee.name}</div>
                <div className="text-sm text-gray-500">{employee.department}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Validating state */}
      {isValidating && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
            <p className="text-blue-700 font-medium">Verificando confirmação...</p>
          </div>
        </div>
      )}

      {/* Selected employee display - NO DUPLICATE */}
      {wizardData.employee && !isDuplicate && !isValidating && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-orange-50 to-pink-50 border-2 border-orange-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  {wizardData.employee.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <div className="font-bold text-gray-800">{wizardData.employee.name}</div>
                <div className="text-sm text-gray-600">{wizardData.employee.department}</div>
              </div>
              <div className="text-green-500">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          {/* RG/CPF Input for NEW confirmation */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Seu RG ou CPF (necessário para confirmação)
            </label>
            <input
              type="text"
              value={wizardData.employeeRG}
              onChange={(e) => updateWizardData({ employeeRG: e.target.value.trim() })}
              placeholder="Digite seu RG ou CPF"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all"
            />
            <p className="text-xs text-gray-500 mt-1">
              Será usado como senha para editar sua confirmação futuramente
            </p>
          </div>
        </div>
      )}

      {/* DUPLICATE DETECTED - Show password field inline */}
      {isDuplicate && wizardData.employee && (
        <div className="space-y-4">
          {/* Employee card */}
          <div className="bg-gradient-to-r from-orange-50 to-pink-50 border-2 border-orange-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  {wizardData.employee.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <div className="font-bold text-gray-800">{wizardData.employee.name}</div>
                <div className="text-sm text-gray-600">{wizardData.employee.department}</div>
              </div>
            </div>
          </div>

          {/* Duplicate warning */}
          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-yellow-800 mb-1">Você já possui uma confirmação</h4>
                <p className="text-sm text-yellow-700">
                  Para editar suas informações, digite o RG/CPF que você usou na confirmação anterior.
                </p>
              </div>
            </div>
          </div>

          {/* Password input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Digite seu RG ou CPF para editar
            </label>
            <input
              type="text"
              value={passwordInput}
              onChange={(e) => {
                setPasswordInput(e.target.value);
                setPasswordError('');
              }}
              placeholder="Digite o mesmo RG/CPF da confirmação anterior"
              className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 transition-all ${
                passwordError
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
                  : 'border-gray-300 focus:border-orange-500 focus:ring-orange-100'
              }`}
            />
            {passwordError && (
              <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {passwordError}
              </p>
            )}
          </div>

          {/* Action buttons for duplicate */}
          <div className="flex gap-3">
            <button
              onClick={handleCancelDuplicate}
              className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-100 transition-all"
            >
              Cancelar
            </button>
            <button
              onClick={handleEditMode}
              disabled={!passwordInput.trim() || passwordInput.trim().length < 5}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Carregar e Editar →
            </button>
          </div>
        </div>
      )}

      {/* Continue button - Only show for NEW confirmations */}
      {!isDuplicate && wizardData.employee && (
        <>
          <button
            onClick={handleContinue}
            disabled={!wizardData.employeeRG.trim() || wizardData.employeeRG.trim().length < 5}
            className="w-full py-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all text-lg"
          >
            Continuar →
          </button>
          {wizardData.employeeRG.trim() && wizardData.employeeRG.trim().length < 5 && (
            <p className="text-sm text-red-600 text-center mt-2">
              RG/CPF deve ter pelo menos 5 caracteres
            </p>
          )}
        </>
      )}
    </div>
  );
};

export default StepEmployeeLogin;
