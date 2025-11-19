
import { createClient } from '@supabase/supabase-js';

// ------------------------------------------------------------------
// 🔴 PASSO FINAL: COLE SUAS CHAVES AQUI
// ------------------------------------------------------------------

// 1. Volte no Supabase -> Project Settings -> API
// 2. Copie "Project URL" e cole dentro das aspas abaixo
const supabaseUrl = 'https://SEU_PROJETO.supabase.co'; 

// 3. Copie "anon public" key e cole dentro das aspas abaixo
const supabaseKey = 'SUA_CHAVE_ANON_PUBLICA_AQUI';

// ------------------------------------------------------------------

export const supabase = createClient(supabaseUrl, supabaseKey);

export const isSupabaseConfigured = () => {
    // Verifica se o usuário alterou os valores padrão
    return (supabaseUrl as string) !== 'https://SEU_PROJETO.supabase.co' && !supabaseUrl.includes('seu-projeto');
};
