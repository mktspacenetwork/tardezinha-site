
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://SEU_PROJETO.supabase.co'; 
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY || 'SUA_CHAVE_ANON_PUBLICA_AQUI';

export const supabase = createClient(supabaseUrl, supabaseKey);

export const isSupabaseConfigured = () => {
    return (supabaseUrl as string) !== 'https://SEU_PROJETO.supabase.co' && !supabaseUrl.includes('seu-projeto');
};
