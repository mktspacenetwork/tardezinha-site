import React, { useState } from 'react';
import { useWizard } from '../ConfirmationWizard';
import { supabase, isSupabaseConfigured } from '../../supabaseClient';

interface StepSummaryProps {
  onSubmit: () => void;
}

const StepSummary: React.FC<StepSummaryProps> = ({ onSubmit }) => {
  const { wizardData, isEditMode, editingConfirmationId } = useWizard();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleConfirm = async () => {
    if (!isSupabaseConfigured() || !wizardData.employee) {
      setError('Configuração inválida');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const confirmationData = {
        employee_id: wizardData.employee.id,
        employee_name: wizardData.employee.name,
        employee_rg: wizardData.employeeRG.trim(), // Use collected RG
        department: wizardData.employee.department,
        has_companions: wizardData.companions.length > 0,
        wants_transport: wizardData.wantsTransport || false,
        total_adults: wizardData.companions.filter(c => c.age >= 13).length,
        total_children: wizardData.companions.filter(c => c.age < 13).length,
        total_daily_passes: wizardData.costs.breakdown.adultPasses + wizardData.costs.breakdown.childPasses,
        total_transport: wizardData.costs.breakdown.transportSeats,
      };

      if (isEditMode && editingConfirmationId) {
        // Update existing confirmation
        const { error: updateError } = await supabase
          .from('confirmations')
          .update(confirmationData)
          .eq('id', editingConfirmationId);

        if (updateError) throw updateError;

        // Upsert companions using atomic RPC transaction (avoids schema cache issues)
        const companionsData = wizardData.companions.map(c => ({
          name: c.name,
          age: c.age,
          document: c.document,
          type: c.type,
        }));

        const { error: upsertError } = await supabase
          .rpc('upsert_companions', {
            conf_id: editingConfirmationId,
            companions_json: companionsData,
          });

        if (upsertError) {
          console.error('Error upserting companions:', upsertError);
          throw upsertError;
        }
      } else {
        // Create new confirmation
        const { data: confirmation, error: insertError } = await supabase
          .from('confirmations')
          .insert(confirmationData)
          .select()
          .single();

        if (insertError) {
          if (insertError.code === '23505') {
            setError('Você já possui uma confirmação. Use o modo de edição.');
            setIsSubmitting(false);
            return;
          }
          throw insertError;
        }

        // Insert companions using atomic RPC transaction (avoids schema cache issues)
        if (wizardData.companions.length > 0 && confirmation) {
          const companionsData = wizardData.companions.map(c => ({
            name: c.name,
            age: c.age,
            document: c.document,
            type: c.type,
          }));

          const { error: insertError } = await supabase
            .rpc('upsert_companions', {
              conf_id: confirmation.id,
              companions_json: companionsData,
            });

          if (insertError) {
            console.error('Error inserting companions:', insertError);
            throw insertError;
          }
        }
      }

      onSubmit();
    } catch (err: any) {
      console.error('Error saving confirmation:', err);
      setError(err.message || 'Erro ao salvar confirmação');
      setIsSubmitting(false);
    }
  };

  const { costs } = wizardData;
  const hasCompanions = wizardData.companions.length > 0;
  const hasTransport = wizardData.wantsTransport;

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full mb-4">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Resumo da Confirmação</h3>
        <p className="text-gray-600">Confira os detalhes antes de confirmar</p>
      </div>

      {/* Event details */}
      <div className="bg-gradient-to-r from-orange-50 to-pink-50 border-2 border-orange-200 rounded-xl p-6">
        <h4 className="font-bold text-gray-800 mb-3">📅 Informações do Evento</h4>
        <div className="space-y-2 text-sm text-gray-700">
          <p><strong>Data:</strong> 21 de Dezembro de 2025 (Domingo)</p>
          <p><strong>Horário:</strong> 14h00</p>
          <p><strong>Local:</strong> Tardezinha da Space</p>
        </div>
      </div>

      {/* Participant info */}
      <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
        <h4 className="font-bold text-gray-800 mb-3">👤 Participante</h4>
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-lg">
              {wizardData.employee?.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <div className="font-bold text-gray-800">{wizardData.employee?.name}</div>
            <div className="text-sm text-gray-600">{wizardData.employee?.department}</div>
          </div>
        </div>
      </div>

      {/* Companions */}
      {hasCompanions && (
        <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
          <h4 className="font-bold text-gray-800 mb-3">
            👥 Acompanhantes ({wizardData.companions.length})
          </h4>
          <div className="space-y-2">
            {wizardData.companions.map((companion, index) => (
              <div key={index} className="flex justify-between items-center bg-gray-50 rounded-lg p-3">
                <div>
                  <div className="font-semibold text-gray-800">{companion.name}</div>
                  <div className="text-sm text-gray-500">
                    {companion.age} {companion.age === 1 ? 'ano' : 'anos'} · {companion.document}
                  </div>
                </div>
                <div className="text-sm font-semibold text-gray-600">
                  {companion.age <= 12 ? 'Meia' : 'Inteira'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transport */}
      <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
        <h4 className="font-bold text-gray-800 mb-3">🚌 Transporte</h4>
        <div className="flex items-center justify-between">
          <span className="text-gray-700">
            {hasTransport ? '✅ Sim, quero transporte' : '❌ Não preciso de transporte'}
          </span>
          {hasTransport && (
            <span className="font-bold text-orange-600">
              {costs.breakdown.transportSeats} {costs.breakdown.transportSeats === 1 ? 'assento' : 'assentos'}
            </span>
          )}
        </div>
        {hasTransport && wizardData.childrenOnLap.length > 0 && (
          <div className="mt-2 text-sm text-gray-600">
            👶 {wizardData.childrenOnLap.length} criança(s) no colo (grátis)
          </div>
        )}
      </div>

      {/* Cost breakdown */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6">
        <h4 className="font-bold text-gray-800 mb-4">💰 Resumo Financeiro</h4>
        
        {costs.dailyPasses > 0 && (
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-gray-700">
              <span>Diárias ({costs.breakdown.adultPasses} inteira + {costs.breakdown.childPasses} meia):</span>
              <span className="font-semibold">R$ {costs.dailyPasses.toFixed(2)}</span>
            </div>
          </div>
        )}
        
        {costs.transport > 0 && (
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-gray-700">
              <span>Transporte ({costs.breakdown.transportSeats} {costs.breakdown.transportSeats === 1 ? 'assento' : 'assentos'}):</span>
              <span className="font-semibold">R$ {costs.transport.toFixed(2)}</span>
            </div>
          </div>
        )}
        
        <div className="border-t-2 border-green-300 pt-3 mt-3">
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-gray-800">Total:</span>
            <span className="text-2xl font-bold text-green-600">
              R$ {costs.total.toFixed(2)}
            </span>
          </div>
          {costs.total > 0 && (
            <div className="text-sm text-gray-600 mt-2 text-right">
              ou 12x de R$ {(costs.total / 12).toFixed(2)}
            </div>
          )}
        </div>

        {costs.total === 0 && (
          <div className="text-center py-2">
            <span className="text-2xl font-bold text-green-600">100% GRÁTIS! 🎉</span>
          </div>
        )}
      </div>

      {/* Payment info */}
      {costs.total > 0 && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-5">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <div>
              <h5 className="font-bold text-blue-800 mb-1">Formas de Pagamento</h5>
              <p className="text-sm text-blue-700">
                Você poderá realizar seu pagamento via <strong>Pix</strong> ou parcelado em <strong>todos os cartões de crédito</strong>.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 text-red-700">
          ⚠️ {error}
        </div>
      )}

      {/* Confirm button */}
      <button
        onClick={handleConfirm}
        disabled={isSubmitting}
        className="w-full py-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all text-lg"
      >
        {isSubmitting ? 'Confirmando...' : (isEditMode ? 'Atualizar Confirmação ✏️' : 'Confirmar Presença 🎉')}
      </button>
    </div>
  );
};

export default StepSummary;
