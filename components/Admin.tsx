import React, { useState, useEffect } from 'react';
import { Confirmation } from '../types';

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

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordInput === 'space2025') {
            setIsAuthenticated(true);
            setLoginError('');
        } else {
            setLoginError('Senha incorreta. Tente novamente.');
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            try {
                const data = localStorage.getItem('tardezinhaConfirmations');
                const parsedData: Confirmation[] = data ? JSON.parse(data) : [];
                
                // Sort by most recent first
                parsedData.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

                setConfirmations(parsedData);

                const totalConfirmed = parsedData.length;
                const totalGuests = parsedData.reduce((sum, item) => sum + item.guests, 0);
                const totalTransport = parsedData.filter(item => item.transport).length;

                setStats({ totalConfirmed, totalGuests, totalTransport });

            } catch (error) {
                console.error("Erro ao carregar dados de confirmação:", error);
                alert("Não foi possível carregar os dados de confirmação.");
            }
        }
    }, [isAuthenticated]);

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
                        <p className="text-gray-600">Tardezinha da Space 2025</p>
                    </div>
                     <button onClick={onExitAdmin} className="text-sm font-semibold text-solar-pink hover:underline bg-white px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all">
                        &larr; Voltar para o site
                     </button>
                </header>

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

                {/* Confirmations List */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-dark-navy">Lista de Presença</h2>
                        <span className="bg-gray-100 text-gray-600 text-xs font-bold px-3 py-1 rounded-full">{confirmations.length} registros</span>
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
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {confirmations.length > 0 ? (
                                    confirmations.map((conf, index) => (
                                        <tr key={index} className="hover:bg-blue-50 transition-colors">
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
                                                {new Date(conf.timestamp).toLocaleDateString('pt-BR')} <span className="text-gray-300">|</span> {new Date(conf.timestamp).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="p-12 text-center text-gray-500">
                                            <p className="text-lg">Nenhuma confirmação recebida ainda.</p>
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