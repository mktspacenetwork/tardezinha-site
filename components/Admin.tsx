
import React, { useState, useEffect } from 'react';
import { Confirmation } from '../types';
import { supabase, isSupabaseConfigured } from '../supabaseClient';

interface AdminProps {
    onExitAdmin: () => void;
}

const Admin: React.FC<AdminProps> = ({ onExitAdmin }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [passwordInput, setPasswordInput] = useState('');
    const [loginError, setLoginError] = useState('');
    
    const [confirmations, setConfirmations] = useState<Confirmation[]>([]);
    const [stats, setStats] = useState({
        totalConfirmed: 0,
        totalGuests: 0,
        totalTransport: 0,
    });

    // Search and Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [filterTransport, setFilterTransport] = useState(false);
    const [filterGuests, setFilterGuests] = useState(false);
    const [dbError, setDbError] = useState('');

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
            setDbError('ERRO: O Supabase não está configurado. Edite o arquivo supabaseClient.ts com suas chaves.');
            return;
        }
        
        try {
            const { data, error } = await supabase
                .from('confirmations')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            const parsedData: Confirmation[] = data || [];
            setConfirmations(parsedData);

            const totalConfirmed = parsedData.length;
            const totalGuests = parsedData.reduce((sum, item) => sum + item.guests, 0);
            const totalTransport = parsedData.filter(item => item.transport).length;

            setStats({ totalConfirmed, totalGuests, totalTransport });

        } catch (error: any) {
            console.error("Erro ao carregar dados do Supabase:", error);
            setDbError(`Erro de conexão: ${error.message}. Verifique se a tabela 'confirmations' foi criada.`);
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
                
                // Refresh data
                fetchData();
            } catch (error: any) {
                console.error("Erro ao excluir:", error);
                alert(`Erro ao excluir: ${error.message}`);
            }
        }
    };

    const handleExport = () => {
        if (confirmations.length === 0) {
            alert("Sem dados para exportar.");
            return;
        }
        
        // Create CSV content
        const headers = "Nome,Telefone,Acompanhantes,Transporte,Data\n";
        const csvContent = confirmations.map(c => {
            const date = c.created_at ? new Date(c.created_at).toLocaleDateString('pt-BR') : '-';
            return `"${c.name}","${c.phone}",${c.guests},${c.transport ? 'Sim' : 'Não'},${date}`;
        }).join("\n");

        const blob = new Blob([headers + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "confirmados_tardezinha.csv");
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

    // Filtered Data Calculation
    const filteredConfirmations = confirmations.filter(conf => {
        const matchesSearch = conf.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesTransport = filterTransport ? conf.transport === true : true;
        const matchesGuests = filterGuests ? conf.guests > 0 : true;
        return matchesSearch && matchesTransport && matchesGuests;
    });

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-dark-navy flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-black text-dark-navy mb-2">Área Restrita</h1>
                        <p className="text-gray-600">Digite a senha de administrador para acessar o dashboard.</p>
                    </div>
                    
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
                            <input 
                                type="password" 
                                id="password" 
                                value={passwordInput}
                                onChange={(e) => setPasswordInput(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-solar-pink focus:border-transparent outline-none transition-all"
                                placeholder="••••••••"
                                autoFocus
                            />
                        </div>
                        
                        {loginError && (
                            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">
                                {loginError}
                            </div>
                        )}

                        <div className="flex flex-col gap-3">
                            <button 
                                type="submit" 
                                className="w-full bg-solar-pink hover:bg-solar-orange text-white font-bold py-3 rounded-lg transition duration-300 shadow-md"
                            >
                                Acessar Dashboard
                            </button>
                            <button 
                                type="button" 
                                onClick={onExitAdmin}
                                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-lg transition duration-300"
                            >
                                Voltar para o site
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 font-sans p-4 sm:p-6 md:p-8">
            <div className="max-w-7xl mx-auto">
                <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-dark-navy">Dashboard do Evento</h1>
                        <p className="text-gray-600">Tardezinha da Space 2025 (Online via Supabase)</p>
                    </div>
                    <div className="flex gap-3">
                         <button onClick={handleExport} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg shadow-sm font-semibold transition-colors flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Exportar Excel/CSV
                         </button>
                         <button onClick={onExitAdmin} className="text-sm font-semibold text-solar-pink hover:underline bg-white px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all">
                            &larr; Voltar para o site
                         </button>
                    </div>
                </header>

                {dbError && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md shadow-sm">
                        <p className="font-bold">Atenção:</p>
                        <p>{dbError}</p>
                    </div>
                )}

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-solar-orange">
                        <h2 className="text-sm font-bold text-gray-500 uppercase mb-1">Confirmados</h2>
                        <p className="text-4xl font-black text-solar-orange">{stats.totalConfirmed}</p>
                        <p className="text-xs text-gray-400 mt-2">Colaboradores na lista</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-solar-pink">
                        <h2 className="text-sm font-bold text-gray-500 uppercase mb-1">Acompanhantes</h2>
                        <p className="text-4xl font-black text-solar-pink">{stats.totalGuests}</p>
                        <p className="text-xs text-gray-400 mt-2">Total de convidados extras</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-solar-purple">
                        <h2 className="text-sm font-bold text-gray-500 uppercase mb-1">Interesse em Transporte</h2>
                        <p className="text-4xl font-black text-solar-purple">{stats.totalTransport}</p>
                         <p className="text-xs text-gray-400 mt-2">Pessoas que querem o ônibus</p>
                    </div>
                </div>

                {/* Filters and Search */}
                <div className="bg-white p-4 rounded-xl shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:w-1/3">
                        <input 
                            type="text" 
                            placeholder="Buscar por nome..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-solar-orange focus:border-solar-orange"
                        />
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                         <button 
                            onClick={() => setFilterTransport(!filterTransport)}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${filterTransport ? 'bg-purple-100 text-purple-800 border border-purple-300' : 'bg-gray-100 text-gray-600 border border-transparent hover:bg-gray-200'}`}
                         >
                             🚌 Só Transporte
                         </button>
                         <button 
                            onClick={() => setFilterGuests(!filterGuests)}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${filterGuests ? 'bg-pink-100 text-pink-800 border border-pink-300' : 'bg-gray-100 text-gray-600 border border-transparent hover:bg-gray-200'}`}
                         >
                             👥 Com Convidados
                         </button>
                    </div>
                </div>

                {/* Confirmations List */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-dark-navy">Lista de Presença</h2>
                        <span className="bg-gray-100 text-gray-600 text-xs font-bold px-3 py-1 rounded-full">{filteredConfirmations.length} registros</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Nome</th>
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Telefone</th>
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Acomp.</th>
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Transporte</th>
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Data Conf.</th>
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredConfirmations.length > 0 ? (
                                    filteredConfirmations.map((conf) => (
                                        <tr key={conf.id} className="hover:bg-blue-50 transition-colors">
                                            <td className="p-4 font-semibold text-gray-800">{conf.name}</td>
                                            <td className="p-4 text-gray-600 font-mono text-sm">{conf.phone}</td>
                                            <td className="p-4 text-gray-700 text-center">
                                                {conf.guests > 0 ? (
                                                    <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-800">
                                                        +{conf.guests}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400">-</span>
                                                )}
                                            </td>
                                            <td className="p-4 text-gray-700 text-center">
                                                {conf.transport ? (
                                                    <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                                        Sim
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400">Não</span>
                                                )}
                                            </td>
                                            <td className="p-4 text-gray-500 text-sm text-right whitespace-nowrap">
                                                {conf.created_at ? new Date(conf.created_at).toLocaleDateString('pt-BR') : '-'}
                                            </td>
                                            <td className="p-4 text-center">
                                                <button 
                                                    onClick={() => conf.id && handleDelete(conf.id, conf.name)}
                                                    className="text-red-400 hover:text-red-600 transition-colors p-1"
                                                    title="Excluir registro"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="p-12 text-center text-gray-500">
                                            <p className="text-lg">Nenhum registro encontrado com estes filtros.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Admin;
