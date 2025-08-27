import React, { useMemo} from 'react';
import { Aluno } from '../types';
import { UsersGroupIcon, DashboardIcon, UserIcon } from '../shared/Icons';

export const DashboardOverview: React.FC<{ alunos: Aluno[]; onSelectModalidade: (modalidade: string) => void; }> = ({ alunos, onSelectModalidade }) => {
    const totalAlunos = alunos.length;
    const modalidadesUnicas = useMemo(() => [...new Set(alunos.flatMap(a => a.modalidades))], [alunos]);
    const totalModalidades = modalidadesUnicas.length;
    const mediaIdade = useMemo(() => {
        if (alunos.length === 0) return 0;
        const somaIdades = alunos.reduce((acc, aluno) => acc + aluno.idade, 0);
        return Math.round(somaIdades / alunos.length);
    }, [alunos]);
    

    const alunosPorModalidade = useMemo(() => {
        const contagem: { [key: string]: number } = {};
        alunos.forEach(aluno => {
            aluno.modalidades.forEach(m => {
                contagem[m] = (contagem[m] || 0) + 1;
            });
        });
        return Object.entries(contagem).sort((a, b) => b[1] - a[1]);
    }, [alunos]);

    const alunosPorTurno = useMemo(() => {
        const contagem: { [key: string]: number } = {};
        alunos.forEach(aluno => {
            const turno = aluno.turno || 'N/A';
            contagem[turno] = (contagem[turno] || 0) + 1;
        });
        return Object.entries(contagem);
    }, [alunos]);
    
    const proximosAniversariantes = useMemo(() => {
        const hoje = new Date();
        const em30Dias = new Date();
        em30Dias.setDate(hoje.getDate() + 30);
        
        return alunos.filter(aluno => {
            const aniversario = new Date(aluno.nascimento);
            aniversario.setFullYear(hoje.getFullYear());
            if (aniversario < hoje) {
                aniversario.setFullYear(hoje.getFullYear() + 1);
            }
            return aniversario <= em30Dias;
        }).sort((a,b) => new Date(a.nascimento).getTime() - new Date(b.nascimento).getTime()).slice(0, 5);
    }, [alunos]);


    const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; colorClass: string }> = ({ title, value, icon, colorClass }) => (
        <div className="bg-white p-6 rounded-xl shadow-sm flex items-center">
            <div className={`p-3 ${colorClass} rounded-lg mr-4`}>{icon}</div>
            <div>
                <p className="text-sm text-slate-500 font-medium">{title}</p>
                <p className="text-2xl font-bold text-slate-800">{value}</p>
            </div>
        </div>
    );

    return (
        <div className="space-y-8">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total de Alunos" value={totalAlunos} icon={<UsersGroupIcon />} colorClass="bg-indigo-100 text-indigo-600" />
                <StatCard title="Modalidades" value={totalModalidades} icon={<DashboardIcon />} colorClass="bg-sky-100 text-sky-600" />
                <StatCard title="Média de Idade" value={`${mediaIdade} anos`} icon={<UserIcon />} colorClass="bg-emerald-100 text-emerald-600" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Gráfico de Modalidades */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Alunos por Modalidade</h3>
                    <div className="space-y-2">
                        {alunosPorModalidade.map(([modalidade, count]) => (
                            <button key={modalidade} onClick={() => onSelectModalidade(modalidade)} className="w-full text-left group">
                                <div className="flex justify-between items-center mb-1">
                                    <p className="text-sm font-medium text-slate-600 group-hover:text-indigo-600">{modalidade}</p>
                                    <p className="text-sm font-bold text-indigo-600">{count}</p>
                                </div>
                                <div className="w-full bg-slate-200 rounded-full h-2.5">
                                    <div className="bg-indigo-500 h-2.5 rounded-full group-hover:bg-indigo-700" style={{ width: `${(count / Math.max(1, ...alunosPorModalidade.map(m => m[1]))) * 100}%` }}></div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-8">
                    {/* Próximos Aniversariantes */}
                    <div className="bg-white p-6 rounded-xl shadow-sm">
                         <h3 className="text-lg font-bold text-slate-800 mb-4">Próximos Aniversariantes</h3>
                         <ul className="divide-y divide-slate-200">
                            {proximosAniversariantes.length > 0 ? proximosAniversariantes.map(aluno => (
                                <li key={aluno.id} className="py-3 flex items-center">
                                    <img src={aluno.imgUrl || `https://placehold.co/80x80/E2E8F0/475569?text=${aluno.nomeAluno.charAt(0)}`} alt={aluno.nomeAluno} className="w-10 h-10 rounded-full mr-3" />
                                    <div>
                                        <p className="text-sm font-semibold text-slate-800">{aluno.nomeAluno}</p>
                                        <p className="text-xs text-slate-500">{new Date(aluno.nascimento).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}</p>
                                    </div>
                                </li>
                            )) : <p className="text-sm text-slate-500">Nenhum aniversário nos próximos 30 dias.</p>}
                         </ul>
                    </div>
                    {/* Alunos por Turno */}
                    <div className="bg-white p-6 rounded-xl shadow-sm">
                         <h3 className="text-lg font-bold text-slate-800 mb-4">Alunos por Turno</h3>
                         <div className="space-y-2">
                            {alunosPorTurno.map(([turno, count]) => (
                                <div key={turno} className="flex justify-between items-center text-sm">
                                    <p className="font-medium text-slate-600">{turno}</p>
                                    <p className="font-bold text-sky-600">{count}</p>
                                </div>
                            ))}
                         </div>
                    </div>
                </div>
            </div>
        </div>
    );
};