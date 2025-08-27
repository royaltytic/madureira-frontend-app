import React, { useMemo } from 'react';
import { Aluno } from '../types';

export const ModalidadeDetailPage: React.FC<{ modalidade: string; alunos: Aluno[]; }> = ({ modalidade, alunos }) => {
    const alunosNaModalidade = useMemo(() => alunos.filter(a => a.modalidades.includes(modalidade)), [alunos, modalidade]);

    const getCategory = (age: number) => {
        if (age <= 7) return 'Sub-07'; if (age <= 9) return 'Sub-09';
        if (age <= 11) return 'Sub-11'; if (age <= 13) return 'Sub-13';
        if (age <= 15) return 'Sub-15'; if (age <= 17) return 'Sub-17';
        if (age >= 18) return 'Master'; if (age >= 30) return 'Veterano';
        return 'Outros';
    };

    const porCategoriaEGenero = useMemo(() => {
        return alunosNaModalidade.reduce((acc, aluno) => {
            const categoria = getCategory(aluno.idade);
            const genero = aluno.genero || 'N/A';

            if (!acc[categoria]) {
                acc[categoria] = { 'Masculino': 0, 'Feminino': 0, total: 0 };
            }
            acc[categoria][genero] = (acc[categoria][genero] || 0) + 1;
            acc[categoria].total++;
            return acc;
        }, {} as { [key: string]: { [key: string]: number; total: number } });
    }, [alunosNaModalidade]);

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(porCategoriaEGenero).sort().map(([categoria, dados]) => (
                    <div key={categoria} className="bg-white p-6 rounded-xl shadow-sm">
                        <div className="flex justify-between items-baseline">
                             <h3 className="text-lg font-bold text-slate-800">{categoria}</h3>
                             <span className="text-xl font-bold text-indigo-600">{dados.total} <span className="text-sm font-medium text-slate-500">alunos</span></span>
                        </div>
                        <div className="mt-4 space-y-3">
                            {Object.entries(dados).filter(([key]) => key !== 'total').map(([genero, count]) => (
                                <div key={genero}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="font-medium text-slate-600">{genero}</span>
                                        <span>{count}</span>
                                    </div>
                                    <div className="w-full bg-slate-200 rounded-full h-2">
                                        <div className={`h-2 rounded-full ${genero === 'Masculino' ? 'bg-blue-500' : 'bg-pink-500'}`} style={{ width: `${(count / dados.total) * 100}%`}}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};