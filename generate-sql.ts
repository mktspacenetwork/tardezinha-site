import { employees } from './data/employees';
import * as fs from 'fs';

const values = employees.map(emp => 
  `  ('${emp.name.replace(/'/g, "''")}', '${emp.department}', '${emp.role}')`
).join(',\n');

const sql = `-- Inserir todos os colaboradores
INSERT INTO employees (name, department, role) VALUES
${values}
ON CONFLICT (name) DO NOTHING;`;

fs.writeFileSync('/tmp/insert-all-employees.sql', sql);
console.log(`✅ SQL gerado com ${employees.length} colaboradores em /tmp/insert-all-employees.sql`);
console.log(sql);
