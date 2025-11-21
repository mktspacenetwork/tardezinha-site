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

    const { data, error } = await supabase
      .from('confirmations')
      .select('*, companions(*)')
      .eq('employee_id', employeeId)
      .single();

    if (!error && data) {
      return data;
    }
    return null;
  };

  const handleSelectEmployee = async (employee: Employee) => {
    setName(employee.name);
    setSuggestions([]);
    setShowSuggestions(false);

    // ALWAYS update wizard data first, even if duplicate exists
    updateWizardData({
      employee,
      employeeRG: '', // Reset RG for new selection
    });

    // Check for duplicate confirmation
    if (employee.id) {
      const existing = await checkExistingConfirmation(employee.id);
      if (existing) {
        onDuplicateFound(employee, existing);
        return;
      }
    }
  };

  const handleContinue = () => {
    const rgValue = wizardData.employeeRG.trim();
    // Require at least 5 characters for RG/CPF
    if (wizardData.employee && rgValue && rgValue.length >= 5) {
      onNext();
    }
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
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all"
          />
          {isSearching && (
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-500"></div>
            </div>
          )}
        </div>

        {/* Suggestions dropdown */}
        {showSuggestions && suggestions.length > 0 && (
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

      {/* Selected employee display with RG input */}
      {wizardData.employee && (
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

          {/* RG/CPF Input */}
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

      {/* Continue button */}
      <button
        onClick={handleContinue}
        disabled={!wizardData.employee || !wizardData.employeeRG.trim() || wizardData.employeeRG.trim().length < 5}
        className="w-full py-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all text-lg"
      >
        Continuar →
      </button>
      {wizardData.employee && wizardData.employeeRG.trim() && wizardData.employeeRG.trim().length < 5 && (
        <p className="text-sm text-red-600 text-center mt-2">
          RG/CPF deve ter pelo menos 5 caracteres
        </p>
      )}
    </div>
  );
};

export default StepEmployeeLogin;
