import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_KEY;

console.log('🔍 Testando conexão com Supabase...\n');
console.log('URL:', supabaseUrl ? '✅ Configurada' : '❌ Não configurada');
console.log('Key:', supabaseKey ? '✅ Configurada' : '❌ Não configurada');
console.log('');

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('📋 Buscando colaboradores...\n');

const { data, error } = await supabase
  .from('employees')
  .select('*')
  .limit(5);

if (error) {
  console.error('❌ ERRO:', error);
  console.error('\nDetalhes:', JSON.stringify(error, null, 2));
} else {
  console.log('✅ SUCESSO! Encontrados', data?.length || 0, 'colaboradores');
  console.log('\nPrimeiros resultados:');
  data?.forEach((emp, i) => {
    console.log(`${i + 1}. ${emp.name} - ${emp.department}`);
  });
}

console.log('\n🔍 Testando busca por nome (Ana)...\n');

const { data: searchData, error: searchError } = await supabase
  .from('employees')
  .select('*')
  .ilike('name', '%Ana%')
  .limit(5);

if (searchError) {
  console.error('❌ ERRO na busca:', searchError);
} else {
  console.log('✅ Busca funcionou! Encontrados', searchData?.length || 0, 'resultados');
  searchData?.forEach((emp, i) => {
    console.log(`${i + 1}. ${emp.name}`);
  });
}
