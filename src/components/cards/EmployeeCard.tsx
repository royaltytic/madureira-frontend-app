import React from 'react';
import { TrashIcon, PencilSquareIcon, ClockIcon } from '@heroicons/react/24/solid';

// Definindo a interface de props para clareza
export interface UserProps {
  id: string;
  user: string;
  imgUrl?: string | null;
  tipo: string;
  status: string;
  lastLogin?: string | null; // A data virá como string do banco
}

interface EmployeeCardProps {
  employee: UserProps;
  onToggleStatus: () => void;
  onDelete: () => void;
  onChangeRole: () => void;
}

export const EmployeeCard: React.FC<EmployeeCardProps> = ({ employee, onToggleStatus, onDelete, onChangeRole }) => {
  const isActivated = employee.status === 'ativado';

  // Função para formatar a data do último login
  const formatLastLogin = (dateString?: string | null) => {
    if (!dateString) {
      return 'Nunca logou';
    }
    try {
      // Formata a data para o padrão local (ex: dd/mm/aaaa, hh:mm)
      return new Date(dateString).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (_error) {
      console.error("Data de login inválida:", dateString + _error);
      return 'Data inválida';
    }
  };

  return (
    <div className="relative group bg-white rounded-xl shadow-md p-5 flex flex-col items-center text-center transition-all duration-300 border border-slate-200 hover:shadow-xl hover:border-indigo-300">
      
      {/* Botões de Ação no Hover */}
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 z-10">
        <button onClick={onChangeRole} title="Alterar Cargo" className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-100 rounded-full">
          <PencilSquareIcon className="h-5 w-5" />
        </button>
        <button onClick={onDelete} title="Deletar" className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-100 rounded-full">
          <TrashIcon className="h-5 w-5" />
        </button>
      </div>

      {/* --- Seção do Avatar --- */}
      <div className="relative mb-3">
        <img
          src={employee.imgUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(employee.user)}&background=0D8ABC&color=fff`}
          alt={employee.user}
          className="w-24 h-24 rounded-full object-cover ring-4 ring-slate-100"
        />
      </div>

      {/* --- Seção de Informações --- */}
      <div className="flex-grow flex flex-col items-center w-full">
        
        {/* Nome do funcionário com Tooltip para último login */}
        <div className="relative">
          <h3 className="text-base font-bold text-slate-800">{employee.user}</h3>
          
          {/* Tooltip que aparece no hover do card (group-hover) */}
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-3 py-1.5 bg-slate-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
            <div className="flex items-center gap-1.5">
                <ClockIcon className="h-4 w-4" />
                <span>Último Acesso: {formatLastLogin(employee.lastLogin)}</span>
            </div>
            {/* Seta do tooltip */}
            <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-[4px] border-t-slate-800"></div>
          </div>
        </div>
        
        {/* Cargo do funcionário */}
        <p className="mt-2 text-xs font-semibold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full capitalize">
          {employee.tipo}
        </p>

      </div>
      
      <hr className="w-full border-t border-slate-200 my-4" />

      {/* --- Botão de Status --- */}
      <button
        onClick={onToggleStatus}
        className={`w-full py-2 rounded-lg text-sm font-bold transition-colors ${
          isActivated
            ? 'bg-green-100 text-green-800 hover:bg-green-200'
            : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
        }`}
      >
        {isActivated ? 'Ativo' : 'Inativo'}
      </button>
    </div>
  );
};
