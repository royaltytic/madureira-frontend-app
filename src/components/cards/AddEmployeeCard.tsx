import React from 'react';
import { PlusIcon } from '@heroicons/react/24/solid';

interface AddEmployeeCardProps {
  onClick: () => void;
}

export const AddEmployeeCard: React.FC<AddEmployeeCardProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="w-full h-full bg-slate-50 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-500 hover:border-indigo-500 hover:text-indigo-500 transition-all"
    >
      <PlusIcon className="h-12 w-12" />
      <span className="mt-2 font-semibold">Adicionar Novo Servidor</span>
    </button>
  );
};