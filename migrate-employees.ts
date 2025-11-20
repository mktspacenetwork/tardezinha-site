import { supabase } from './supabaseClient';
import { employees } from './data/employees';

async function migrateEmployees() {
  console.log(`Migrando ${employees.length} colaboradores para o banco de dados...`);

  try {
    const { data, error } = await supabase
      .from('employees')
      .insert(
        employees.map((emp) => ({
          name: emp.name,
          department: emp.department,
          role: emp.role,
        }))
      )
      .select();

    if (error) {
      console.error('Erro ao migrar colaboradores:', error);
      return;
    }

    console.log(`✅ ${data?.length || 0} colaboradores migrados com sucesso!`);
  } catch (err) {
    console.error('Erro ao conectar com Supabase:', err);
  }
}

migrateEmployees();
