import React, { useState, useEffect } from 'react';
import { Confirmation, Companion, Employee } from '../types';
import { supabase, isSupabaseConfigured } from '../supabaseClient';

interface AdminProps {
  onExitAdmin: () => void;
}

type TabType = 'dashboard' | 'confirmations' | 'bus' | 'employees';

const Admin: React.FC<AdminProps> = ({ onExitAdmin }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  const [confirmations, setConfirmations] = useState<(Confirmation & { companions?: Companion[] })[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [stats, setStats] = useState({
    totalConfirmed: 0,
    totalAdults: 0,
    totalChildren: 0,
    totalTransport: 0,
    totalDailyPasses: 0,
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterTransport, setFilterTransport] = useState<boolean | null>(null);
  const [dbError, setDbError] = useState('');

  // Modal states
  const [editingConfirmation, setEditingConfirmation] = useState<(Confirmation & { companions?: Companion[] }) | null>(null);
  const [showNewEmployeeForm, setShowNewEmployeeForm] = useState(false);
  
  const [newEmployee, setNewEmployee] = useState({ name: '', department: '', role: '' });
  const [useCustomDepartment, setUseCustomDepartment] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === 'space2025') {
      setIsAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError('Senha incorreta. Tente novamente.');
    }
  };

  const fetchData = async () => {
    if (!isSupabaseConfigured()) {
      setDbError('ERRO: O Supabase não está configurado.');
      return;
    }

    try {
      // Buscar confirmações
      const { data: confirmationsData, error: confirmationsError } = await supabase
        .from('confirmations')
        .select('*')
        .order('id', { ascending: false });

      if (confirmationsError) throw confirmationsError;

      const parsed: Confirmation[] = confirmationsData || [];

      // Buscar acompanhantes para cada confirmação
      const confirmationsWithCompanions = await Promise.all(
        parsed.map(async (conf) => {
          const { data: companionsData } = await supabase
            .from('companions')
            .select('*')
            .eq('confirmation_id', conf.id);

          return {
            ...conf,
            companions: companionsData || [],
          };
        })
      );

      setConfirmations(confirmationsWithCompanions);

      const totalConfirmed = parsed.length;
      const totalAdults = parsed.reduce((sum, item) => sum + (item.total_adults || 0), 0);
      const totalChildren = parsed.reduce((sum, item) => sum + (item.total_children || 0), 0);
      const totalTransport = parsed.reduce((sum, item) => sum + (item.total_transport || 0), 0);
      const totalDailyPasses = parsed.reduce((sum, item) => sum + (item.total_daily_passes || 0), 0);

      setStats({ totalConfirmed, totalAdults, totalChildren, totalTransport, totalDailyPasses });

      // Buscar colaboradores
      const { data: employeesData, error: employeesError } = await supabase
        .from('employees')
        .select('*')
        .order('name');

      if (employeesError) throw employeesError;
      setEmployees(employeesData || []);
    } catch (error: any) {
      console.error('Erro ao carregar dados:', error);
      setDbError(`Erro de conexão: ${error.message}`);
    }
  };

  const handleAddEmployee = async () => {
    if (!newEmployee.name.trim() || !newEmployee.department.trim()) {
      alert('Por favor, preencha nome e departamento do colaborador.');
      return;
    }

    try {
      const { error } = await supabase
        .from('employees')
        .insert({
          name: newEmployee.name,
          department: newEmployee.department,
          role: newEmployee.role,
        });

      if (error) throw error;

      alert('Colaborador adicionado com sucesso!');
      setShowNewEmployeeForm(false);
      setNewEmployee({ name: '', department: '', role: '' });
      fetchData();
    } catch (error: any) {
      console.error('Erro ao adicionar colaborador:', error);
      alert(`Erro ao adicionar colaborador: ${error.message}`);
    }
  };

  const handleEditEmployee = async (employee: Employee) => {
    if (!employee.name.trim() || !employee.department.trim()) {
      alert('Por favor, preencha nome e departamento.');
      return;
    }

    try {
      const { error } = await supabase
        .from('employees')
        .update({
          name: employee.name,
          department: employee.department,
          role: employee.role,
        })
        .eq('id', employee.id);

      if (error) throw error;

      alert('Colaborador atualizado com sucesso!');
      setEditingEmployee(null);
      fetchData();
    } catch (error: any) {
      console.error('Erro ao atualizar colaborador:', error);
      alert(`Erro ao atualizar: ${error.message}`);
    }
  };

  const handleDeleteEmployee = async (id: number, name: string) => {
    if (window.confirm(`Tem certeza que deseja excluir o colaborador ${name}?\n\nATENÇÃO: Se este colaborador já fez confirmações de presença, elas NÃO serão excluídas.`)) {
      try {
        const { error } = await supabase
          .from('employees')
          .delete()
          .eq('id', id);

        if (error) throw error;

        alert('Colaborador excluído com sucesso!');
        fetchData();
      } catch (error: any) {
        console.error('Erro ao excluir colaborador:', error);
        alert(`Erro ao excluir: ${error.message}`);
      }
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (window.confirm(`Tem certeza que deseja excluir a confirmação de ${name}?`)) {
      try {
        const { error } = await supabase
          .from('confirmations')
          .delete()
          .eq('id', id);

        if (error) throw error;
        fetchData();
      } catch (error: any) {
        console.error('Erro ao excluir:', error);
        alert(`Erro ao excluir: ${error.message}`);
      }
    }
  };

  const handleToggleEmbarked = async (id: number, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('confirmations')
        .update({ embarked: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      fetchData();
    } catch (error: any) {
      console.error('Erro ao atualizar embarque:', error);
      alert(`Erro ao atualizar: ${error.message}`);
    }
  };

  const handleSaveEdit = async (confirmation: Confirmation) => {
    try {
      const { error } = await supabase
        .from('confirmations')
        .update({
          employee_name: confirmation.employee_name,
          employee_rg: confirmation.employee_rg,
          department: confirmation.department,
          wants_transport: confirmation.wants_transport,
        })
        .eq('id', confirmation.id);

      if (error) throw error;
      setEditingConfirmation(null);
      fetchData();
    } catch (error: any) {
      console.error('Erro ao salvar:', error);
      alert(`Erro ao salvar: ${error.message}`);
    }
  };

  const handleExport = () => {
    if (confirmations.length === 0) {
      alert('Sem dados para exportar.');
      return;
    }

    const headers = 'Colaborador,RG,Departamento,Acompanhantes Adultos,Crianças,Diárias,Transporte,Data\n';
    const csvContent = confirmations
      .map((c) => {
        const date = c.created_at ? new Date(c.created_at).toLocaleDateString('pt-BR') : '-';
        return `"${c.employee_name}","${c.employee_rg}","${c.department}",${c.total_adults},${c.total_children},${c.total_daily_passes},${c.total_transport},${date}`;
      })
      .join('\n');

    const blob = new Blob([headers + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'confirmacoes_tardezinha.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  const departments = Array.from(new Set(employees.map((e) => e.department))).sort();

  const filteredConfirmations = confirmations.filter((conf) => {
    const matchesSearch =
      conf.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conf.employee_rg.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = filterDepartment ? conf.department === filterDepartment : true;
    const matchesTransport = filterTransport !== null ? conf.wants_transport === filterTransport : true;
    return matchesSearch && matchesDepartment && matchesTransport;
  });

  const busConfirmations = confirmations.filter((c) => c.wants_transport && c.total_transport > 0);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-solar flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <h2 className="text-3xl font-black text-gray-800 mb-6 text-center">Admin - Tardezinha da Space</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Senha de Acesso</label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-solar-orange focus:outline-none"
                placeholder="Digite a senha"
              />
            </div>
            {loginError && <p className="text-red-500 text-sm">{loginError}</p>}
            <button
              type="submit"
              className="w-full bg-gradient-solar text-white font-bold py-3 rounded-lg hover:shadow-lg transition-all"
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={onExitAdmin}
              className="w-full bg-gray-200 text-gray-700 font-bold py-3 rounded-lg hover:bg-gray-300 transition-all"
            >
              Voltar ao Site
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 via-pink-500 to-pink-600 text-white px-4 md:px-6 py-4 md:py-6 shadow-xl">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard Admin</h1>
            <p className="text-sm text-white/90 mt-1">Tardezinha da Space</p>
          </div>
          <button
            onClick={onExitAdmin}
            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-semibold px-4 md:px-6 py-2 rounded-lg transition-all border border-white/30"
          >
            Sair
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto scrollbar-hide">
            {[
              { 
                id: 'dashboard', 
                label: 'Dashboard',
                icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              },
              { 
                id: 'confirmations', 
                label: 'Confirmações',
                icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
              },
              { 
                id: 'bus', 
                label: 'Gestão de Ônibus',
                icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg>
              },
              { 
                id: 'employees', 
                label: 'Colaboradores',
                icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-2 px-4 md:px-6 py-3 md:py-4 font-semibold border-b-2 transition-all whitespace-nowrap text-sm md:text-base ${
                  activeTab === tab.id
                    ? 'border-pink-500 text-pink-600 bg-pink-50'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50/50'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {dbError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{dbError}</div>
        )}

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="text-3xl font-bold text-slate-800">{stats.totalConfirmed}</div>
                <div className="text-sm text-slate-500 mt-1">Confirmações</div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>
                <div className="text-3xl font-bold text-slate-800">{stats.totalAdults}</div>
                <div className="text-sm text-slate-500 mt-1">Acompanhantes Adultos</div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="text-3xl font-bold text-slate-800">{stats.totalChildren}</div>
                <div className="text-sm text-slate-500 mt-1">Crianças</div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                    </svg>
                  </div>
                </div>
                <div className="text-3xl font-bold text-slate-800">{stats.totalDailyPasses}</div>
                <div className="text-sm text-slate-500 mt-1">Diárias Necessárias</div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-rose-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                  </div>
                </div>
                <div className="text-3xl font-bold text-slate-800">{stats.totalTransport}</div>
                <div className="text-sm text-slate-500 mt-1">Vagas de Ônibus</div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold mb-4">Links Rápidos</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <a
                  href="https://useingresso.com/evento/691b30d3dc465aca63b2bbef"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 bg-solar-purple text-white px-4 py-3 rounded-lg hover:bg-opacity-90 transition-all"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                  </svg>
                  <span className="font-semibold">Site de Ingressos</span>
                </a>
                <button
                  onClick={handleExport}
                  className="flex items-center gap-3 bg-green-500 text-white px-4 py-3 rounded-lg hover:bg-green-600 transition-all"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="font-semibold">Exportar CSV</span>
                </button>
                <button
                  onClick={fetchData}
                  className="flex items-center gap-3 bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 transition-all"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span className="font-semibold">Atualizar Dados</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Confirmations Tab */}
        {activeTab === 'confirmations' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <input
                  type="text"
                  placeholder="Buscar por nome ou RG..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-solar-orange focus:outline-none"
                />
                <select
                  value={filterDepartment}
                  onChange={(e) => setFilterDepartment(e.target.value)}
                  className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-solar-orange focus:outline-none"
                >
                  <option value="">Todos os Departamentos</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
                <select
                  value={filterTransport === null ? '' : String(filterTransport)}
                  onChange={(e) =>
                    setFilterTransport(e.target.value === '' ? null : e.target.value === 'true')
                  }
                  className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-solar-orange focus:outline-none"
                >
                  <option value="">Transporte: Todos</option>
                  <option value="true">Com Transporte</option>
                  <option value="false">Sem Transporte</option>
                </select>
              </div>
              <div className="text-sm text-gray-600 mb-4">
                Mostrando {filteredConfirmations.length} de {confirmations.length} confirmações
              </div>
            </div>

            <div className="space-y-4">
              {filteredConfirmations.map((conf) => (
                <div key={conf.id} className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800">{conf.employee_name}</h3>
                      <p className="text-gray-600">
                        {conf.department} | RG: {conf.employee_rg}
                      </p>
                      <p className="text-sm text-gray-500">
                        Confirmado em: {conf.created_at ? new Date(conf.created_at).toLocaleString('pt-BR') : '-'}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingConfirmation(conf)}
                        className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-all"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(conf.id!, conf.employee_name)}
                        className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Excluir
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-gray-50 rounded-lg p-4">
                    <div>
                      <div className="text-sm text-gray-600">Acompanhantes Adultos</div>
                      <div className="text-xl font-bold">{conf.total_adults}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Crianças</div>
                      <div className="text-xl font-bold">{conf.total_children}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Diárias Necessárias</div>
                      <div className="text-xl font-bold">{conf.total_daily_passes}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Transporte</div>
                      <div className="text-xl font-bold">{conf.total_transport}</div>
                    </div>
                  </div>

                  {conf.companions && conf.companions.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-bold mb-2">Acompanhantes:</h4>
                      <div className="space-y-2">
                        {conf.companions.map((comp, idx) => (
                          <div key={idx} className="bg-gray-100 p-3 rounded-lg flex items-center justify-between">
                            <div>
                              <span className="font-semibold">{comp.name}</span>
                              <span className="text-gray-600 ml-2">
                                ({comp.type === 'adult' ? 'Adulto' : 'Criança'}, {comp.age} anos)
                              </span>
                            </div>
                            <div className="text-sm text-gray-600">Doc: {comp.document}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {filteredConfirmations.length === 0 && (
                <div className="bg-white rounded-xl shadow-lg p-12 text-center text-gray-500">
                  Nenhuma confirmação encontrada.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bus Management Tab */}
        {activeTab === 'bus' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold mb-4">Controle de Embarque - Ônibus</h3>
              <div className="text-lg mb-4">
                Total de passageiros: <span className="font-bold">{stats.totalTransport}</span>
              </div>
            </div>

            <div className="space-y-4">
              {busConfirmations.map((conf) => (
                <div
                  key={conf.id}
                  className={`bg-white rounded-xl shadow-lg p-6 border-l-4 ${
                    conf.embarked ? 'border-green-500' : 'border-yellow-500'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold">{conf.employee_name}</h3>
                        {conf.embarked && <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">EMBARCADO</span>}
                      </div>
                      <p className="text-gray-600 mb-2">
                        {conf.department} | RG: {conf.employee_rg}
                      </p>
                      <div className="flex gap-6 text-sm">
                        <div>
                          <span className="text-gray-600">Passageiros:</span>{' '}
                          <span className="font-semibold">{conf.total_transport}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Adultos:</span>{' '}
                          <span className="font-semibold">{conf.total_adults + 1}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Crianças:</span>{' '}
                          <span className="font-semibold">{conf.total_children}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleToggleEmbarked(conf.id!, conf.embarked || false)}
                      className={`px-6 py-3 rounded-lg font-bold transition-all ${
                        conf.embarked
                          ? 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                          : 'bg-green-500 text-white hover:bg-green-600'
                      }`}
                    >
                      {conf.embarked ? 'Desmarcar Embarque' : 'Marcar como Embarcado'}
                    </button>
                  </div>

                  {conf.companions && conf.companions.length > 0 && (
                    <div className="mt-4 border-t pt-4">
                      <h4 className="font-semibold mb-2 text-gray-700">Acompanhantes:</h4>
                      <div className="flex flex-wrap gap-2">
                        {conf.companions.map((comp, idx) => (
                          <div key={idx} className="bg-gray-100 px-3 py-1 rounded-lg text-sm">
                            {comp.name} ({comp.age} anos)
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {busConfirmations.length === 0 && (
                <div className="bg-white rounded-xl shadow-lg p-12 text-center text-gray-500">
                  Nenhum passageiro confirmado para o ônibus.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Employees Tab */}
        {activeTab === 'employees' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Lista de Colaboradores ({employees.length})</h3>
                <button
                  onClick={() => setShowNewEmployeeForm(!showNewEmployeeForm)}
                  className="flex items-center gap-2 bg-solar-purple text-white px-6 py-2 rounded-lg hover:bg-opacity-90 transition-all font-semibold"
                >
                  {showNewEmployeeForm ? (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Cancelar
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Adicionar Colaborador
                    </>
                  )}
                </button>
              </div>

              {showNewEmployeeForm && (
                <div className="bg-gray-50 p-6 rounded-lg mb-4">
                  <h4 className="font-bold mb-4">Novo Colaborador</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <input
                      type="text"
                      placeholder="Nome completo"
                      value={newEmployee.name}
                      onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                      className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-solar-orange focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Cargo"
                      value={newEmployee.role}
                      onChange={(e) => setNewEmployee({ ...newEmployee, role: e.target.value })}
                      className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-solar-orange focus:outline-none"
                    />
                    {useCustomDepartment ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Novo departamento"
                          value={newEmployee.department}
                          onChange={(e) => setNewEmployee({ ...newEmployee, department: e.target.value })}
                          className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-solar-orange focus:outline-none"
                        />
                        <button
                          onClick={() => {
                            setUseCustomDepartment(false);
                            setNewEmployee({ ...newEmployee, department: '' });
                          }}
                          className="px-3 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <select
                          value={newEmployee.department}
                          onChange={(e) => setNewEmployee({ ...newEmployee, department: e.target.value })}
                          className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-solar-orange focus:outline-none"
                        >
                          <option value="">Selecione o Departamento</option>
                          {departments.map((dept) => (
                            <option key={dept} value={dept}>
                              {dept}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => setUseCustomDepartment(true)}
                          className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
                          title="Criar novo departamento"
                        >
                          +
                        </button>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={handleAddEmployee}
                    className="flex items-center gap-2 bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-all font-semibold"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Salvar Colaborador
                  </button>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left font-bold">Nome</th>
                      <th className="px-4 py-3 text-left font-bold">Departamento</th>
                      <th className="px-4 py-3 text-left font-bold">Cargo</th>
                      <th className="px-4 py-3 text-right font-bold">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map((emp) => (
                      <tr key={emp.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3">{emp.name}</td>
                        <td className="px-4 py-3">{emp.department}</td>
                        <td className="px-4 py-3">{emp.role || '-'}</td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => setEditingEmployee(emp)}
                            className="inline-flex items-center gap-1 bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 mr-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Editar
                          </button>
                          <button
                            onClick={() => handleDeleteEmployee(emp.id!, emp.name)}
                            className="inline-flex items-center gap-1 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Excluir
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold mb-6">Editar Confirmação</h3>
            <div className="space-y-4">
              <div>
                <label className="block font-semibold mb-2">Nome do Colaborador</label>
                <input
                  type="text"
                  value={editingConfirmation.employee_name}
                  onChange={(e) =>
                    setEditingConfirmation({ ...editingConfirmation, employee_name: e.target.value })
                  }
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-solar-orange focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold mb-2">RG</label>
                <input
                  type="text"
                  value={editingConfirmation.employee_rg}
                  onChange={(e) => setEditingConfirmation({ ...editingConfirmation, employee_rg: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-solar-orange focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold mb-2">Departamento</label>
                <select
                  value={editingConfirmation.department}
                  onChange={(e) => setEditingConfirmation({ ...editingConfirmation, department: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-solar-orange focus:outline-none"
                >
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editingConfirmation.wants_transport}
                    onChange={(e) =>
                      setEditingConfirmation({ ...editingConfirmation, wants_transport: e.target.checked })
                    }
                    className="w-5 h-5"
                  />
                  <span className="font-semibold">Deseja transporte</span>
                </label>
              </div>
              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => handleSaveEdit(editingConfirmation)}
                  className="flex-1 flex items-center justify-center gap-2 bg-green-500 text-white font-bold py-3 rounded-lg hover:bg-green-600 transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Salvar Alterações
                </button>
                <button
                  onClick={() => setEditingConfirmation(null)}
                  className="flex-1 flex items-center justify-center gap-2 bg-gray-300 text-gray-700 font-bold py-3 rounded-lg hover:bg-gray-400 transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Employee Modal */}
      {editingEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full">
            <h3 className="text-2xl font-bold mb-6">Editar Colaborador</h3>
            <div className="space-y-4">
              <div>
                <label className="block font-semibold mb-2">Nome Completo</label>
                <input
                  type="text"
                  value={editingEmployee.name}
                  onChange={(e) => setEditingEmployee({ ...editingEmployee, name: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-solar-orange focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold mb-2">Departamento</label>
                <input
                  type="text"
                  value={editingEmployee.department}
                  onChange={(e) => setEditingEmployee({ ...editingEmployee, department: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-solar-orange focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold mb-2">Cargo</label>
                <input
                  type="text"
                  value={editingEmployee.role || ''}
                  onChange={(e) => setEditingEmployee({ ...editingEmployee, role: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-solar-orange focus:outline-none"
                />
              </div>
              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => handleEditEmployee(editingEmployee)}
                  className="flex-1 flex items-center justify-center gap-2 bg-green-500 text-white font-bold py-3 rounded-lg hover:bg-green-600 transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Salvar Alterações
                </button>
                <button
                  onClick={() => setEditingEmployee(null)}
                  className="flex-1 flex items-center justify-center gap-2 bg-gray-300 text-gray-700 font-bold py-3 rounded-lg hover:bg-gray-400 transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
