import React from 'react';
import { Professor } from '../../types';
import { EditIcon, DeleteIcon } from '../../shared/Icons';

export const ProfessorCard: React.FC<{ professor: Professor; onEdit: () => void; onDelete: () => void; }> = ({ professor, onEdit, onDelete }) => {
    return (
        <div className="bg-white rounded-2xl shadow-md p-6 group">
            <div className="flex items-start">
                <img src={professor.imgUrl || `https://placehold.co/80x80/E2E8F0/475569?text=${professor.nome.charAt(0)}`} alt={professor.nome} className="w-20 h-20 rounded-full object-cover mr-5 border-2 border-slate-200"/>
                <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-800">{professor.nome}</h3>
                    {/* <p className="text-sm text-indigo-600 font-semibold">{professor.especialidade}</p> */}
                    <p className="text-sm text-slate-500 mt-1">Turma: {professor.turmas}</p>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={onEdit} className="p-2 text-slate-500 hover:text-blue-600"><EditIcon className="w-4 h-4" /></button>
                    <button onClick={onDelete} className="p-2 text-slate-500 hover:text-red-600"><DeleteIcon className="w-4 h-4" /></button>
                </div>
            </div>
        </div>
    );
};