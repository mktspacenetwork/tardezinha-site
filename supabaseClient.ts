import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://neakoxezndartznfxgry.supabase.co'; 
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5lYWtveGV6bmRhcnR6bmZ4Z3J5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxNTczODgsImV4cCI6MjA3ODczMzM4OH0.COwrFAwWFdtUZwHCYdpn7QOmMD18C9PO2STZC2CUgQo';

export const supabase = createClient(supabaseUrl, supabaseKey);

export const isSupabaseConfigured = () => {
    // Agora que as chaves estão hardcoded, a configuração é sempre verdadeira.
    return true;
};