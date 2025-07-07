// src/components/Dashboard/ModalPessoas.tsx

import React from 'react';
import { PessoaProps } from '../../types/types';
// Interfaces para tipagem das props
interface Pessoa {
    id: string;
    name: string;
    cpf?: string;
    user: PessoaProps
    // Você pode adicionar outros campos aqui, como 'email' ou 'telefone'
}

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    people: Pessoa[];
    isLoading: boolean;
}

// Componente de Spinner para o estado de carregamento
const LoadingSpinner: React.FC = () => (
    <div className="flex justify-center items-center py-10">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
    </div>
);


// Componente para o estado vazio
const EmptyState: React.FC = () => (
    <div className="text-center py-10 px-6 bg-slate-50 rounded-lg">
        <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="mt-2 text-sm font-semibold text-slate-800">Nenhum resultado</h3>
        <p className="mt-1 text-sm text-slate-500">Nenhuma pessoa foi encontrada para este critério.</p>
    </div>
);


export const ModalPessoas: React.FC<ModalProps> = ({ isOpen, onClose, title, people, isLoading }) => {
    // Não renderiza nada se o modal não estiver aberto
    if (!isOpen) {
        return null;
    }

      // --- FUNÇÃO PARA EXPORTAR COMO TEXTO (CSV) ---
      const handleExportCSV = () => {
        if (people.length === 0) {
            alert("Não há dados para exportar.");
            return;
        }

        // 1. Define o cabeçalho do arquivo
        const headers = ['Nome', 'CPF'];

        // 2. Mapeia os dados para o formato de linha do CSV
        const rows = people.map(person => {
            const nome = person.name || person.user?.name || 'Não informado';
            const cpf = person.cpf || person.user?.cpf || 'Não informado';
            
            // Garante que valores com vírgulas ou aspas sejam tratados corretamente
            const safeNome = `"${nome.replace(/"/g, '""')}"`;
            const safeCpf = `"${cpf.replace(/"/g, '""')}"`;
            
            return [safeNome, safeCpf].join(',');
        });

        // 3. Junta o cabeçalho e as linhas
        const csvContent = [headers.join(','), ...rows].join('\n');

        // 4. Cria um Blob e aciona o download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        const safeTitle = title.replace(/\s+/g, '_').toLowerCase(); // Cria um nome de arquivo seguro
        
        link.setAttribute("href", url);
        link.setAttribute("download", `lista_${safeTitle}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        // Backdrop: Camada escura semi-transparente que cobre a tela inteira
        <div
            className="fixed inset-0 bg-slate-900/75 z-50 flex justify-center items-center p-4 transition-opacity duration-300 ease-in-out"
            onClick={onClose} // Fecha o modal ao clicar fora dele
        >
            {/* Painel do Modal */}
            <div
                className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col transform transition-all duration-300 ease-in-out scale-95 opacity-0 animate-fade-in-scale"
                onClick={e => e.stopPropagation()} // Impede que o clique DENTRO do modal o feche
            >
                {/* Cabeçalho do Modal */}
                <header className="flex justify-between items-center p-5 border-b border-slate-200">
                    <h2 className="text-lg font-bold text-slate-800">{title}</h2>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors"
                        aria-label="Fechar modal"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </header>

                {/* Corpo do Modal (com scroll) */}
                <main className="p-6 overflow-y-auto">
                    {isLoading ? (
                        <LoadingSpinner />
                    ) : people.length > 0 ? (
                        <ul className="space-y-3">
                            {people.map(person => {
                                // Lógica para obter os dados de forma segura
                                const nome = person.name || person.user?.name;
                                const cpf = person.cpf || person.user?.cpf;
                                const inicial = nome ? nome.charAt(0).toUpperCase() : '?';

                                return (
                                    <li key={person.id} className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex items-center space-x-4 hover:border-blue-400 hover:bg-blue-50 transition-all">
                                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center">
                                            <span className="text-slate-500 font-semibold">{inicial}</span>
                                        </div>
                                        <div className="flex-grow">
                                            <p className="font-semibold text-slate-900">{nome || 'Nome não disponível'}</p>
                                            {cpf && <p className="text-sm text-slate-500">CPF: {cpf}</p>}
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    ) : (
                        <EmptyState />
                    )}
                </main>

                {/* Rodapé do Modal */}
                <footer className="p-4 bg-slate-50 border-t border-slate-200 rounded-b-xl flex justify-end items-center gap-3">
                    <button
                        onClick={onClose}
                        className="px-5 py-2 bg-slate-200 text-slate-800 text-sm font-semibold rounded-lg hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400 transition-colors"
                    >
                        Fechar
                    </button>
                    {/* Botão de Exportar */}
                    <button
                        onClick={handleExportCSV}
                        disabled={people.length === 0 || isLoading}
                        className="px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed"
                    >
                        Exportar como Texto (CSV)
                    </button>
                </footer>
            </div>

            {/* Animação CSS-in-JS para o fade-in e scale-up */}
            <style>{`
                @keyframes fadeInScale {
                    from {
                        opacity: 0;
                        transform: scale(.95);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
                .animate-fade-in-scale {
                    animation: fadeInScale 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    );
};