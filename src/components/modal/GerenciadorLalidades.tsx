import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  Cog6ToothIcon,
  MapPinIcon,
  PencilSquareIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/solid';

interface LocalidadeProps {
  id: number;
  localidade: string;
}

interface GerenciadorLocalidadesProps {
  initialValue: string;
  onLocalidadeChange: (localidade: string) => void;
}

export const GerenciadorLocalidades: React.FC<GerenciadorLocalidadesProps> = ({
  initialValue,
  onLocalidadeChange,
}) => {
  // Todo o estado relacionado a localidades agora vive aqui
  const [localidades, setLocalidades] = useState<LocalidadeProps[]>([]);
  const [selectedValue, setSelectedValue] = useState<string>(initialValue);
  const [isManaging, setIsManaging] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isCrudLoading, setIsCrudLoading] = useState<boolean>(false);
  const [editingLocalidade, setEditingLocalidade] = useState<LocalidadeProps | null>(null);
  const [formName, setFormName] = useState<string>('');

  // Busca as localidades ao montar o componente
  useEffect(() => {
    const fetchLocalidades = async () => {
      setIsLoading(true);
      try {
        const response = await api.get<LocalidadeProps[]>('/localidades');
        setLocalidades(response.data);
      } catch (error) {
        console.error('Erro ao buscar localidades:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLocalidades();
  }, []);

  // --- Funções CRUD ---

  const handleCreateOrUpdate = async () => {
    // e.preventDefault() não é mais necessário
    if (!formName.trim()) return;
    setIsCrudLoading(true);

    try {
      if (editingLocalidade) {
        const { data: updated } = await api.put<LocalidadeProps>(`/localidades/${editingLocalidade.id}`, { localidade: formName });
        setLocalidades(prev => prev.map(l => l.id === editingLocalidade.id ? updated : l));
      } else {
        const { data: newItem } = await api.post<LocalidadeProps>('/localidades', { localidade: formName });
        setLocalidades(prev => [...prev, newItem]);
      }
      setFormName('');
      setEditingLocalidade(null);
    } catch (error) {
      console.error("Erro ao salvar localidade:", error);
    } finally {
      setIsCrudLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Tem certeza que deseja excluir esta localidade?")) return;
    setIsCrudLoading(true);
    try {
      await api.delete(`/localidades/${id}`);
      setLocalidades(prev => prev.filter(l => l.id !== id));
    } catch (error) {
      console.error("Erro ao excluir localidade:", error);
    } finally {
      setIsCrudLoading(false);
    }
  };
  
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value;
    setSelectedValue(newValue);
    onLocalidadeChange(newValue);
  };
  
  return (
    <div className="w-full">
      <div className="flex items-end gap-3">
        <div className="flex-grow">
          <label htmlFor="localidade-select" className="block text-sm font-medium text-slate-600">Localidade</label>
          <select
            id="localidade-select"
            name="neighborhood"
            value={selectedValue}
            onChange={handleSelectChange}
            className="mt-1 w-full border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          >
            {isLoading ? <option>Carregando...</option> : localidades.map(l => <option key={l.id} value={l.localidade}>{l.localidade}</option>)}
          </select>
        </div>
        <button
          type="button"
          onClick={() => setIsManaging(!isManaging)}
          className="flex-shrink-0 p-2.5 bg-slate-100 text-slate-600 rounded-md hover:bg-slate-200 transition-colors"
        >
          <Cog6ToothIcon className="h-5 w-5" />
        </button>
      </div>

      {/* PAINEL DE GERENCIAMENTO */}
      <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isManaging ? 'max-h-[1000px] mt-4' : 'max-h-0'}`}>
        <div className="p-4 border-t border-slate-200 space-y-4">
           {/* Formulário de Adicionar/Editar */}
           <div className="p-3 bg-slate-100 rounded-lg">
             <h4 className="font-semibold text-sm text-slate-700 mb-2">{editingLocalidade ? 'Editando Localidade' : 'Adicionar Nova Localidade'}</h4>
             <div className="flex gap-2">
                <input value={formName} onChange={e => setFormName(e.target.value)} placeholder="Nome da localidade" className="flex-grow border-slate-300 rounded-md text-sm" required/>
                
                {/* 3. ALTERAÇÃO: Trocamos type="submit" por type="button" e adicionamos onClick */}
                <button 
                  type="button" 
                  onClick={handleCreateOrUpdate}
                  disabled={isCrudLoading} 
                  className="p-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-300"
                >
                  <CheckIcon className="h-4 w-4"/>
                </button>
                
                {editingLocalidade && <button type="button" onClick={() => { setEditingLocalidade(null); setFormName('')}} className="p-2 bg-slate-500 text-white rounded-md"><XMarkIcon className="h-4 w-4"/></button>}
             </div>
           </div>

           {/* Lista de Localidades */}
           <ul className="space-y-2 pr-2 max-h-48 overflow-y-auto">
             {localidades.map(l => (
               <li key={l.id} className="flex items-center justify-between p-2 bg-white rounded-md border">
                 <div className="flex items-center gap-2"><MapPinIcon className="h-5 w-5 text-slate-400"/><span className="text-sm">{l.localidade}</span></div>
                 <div className="flex gap-1">
                   <button type="button" onClick={() => { setEditingLocalidade(l); setFormName(l.localidade); }} disabled={isCrudLoading} className="p-1 text-slate-500 hover:text-blue-600 rounded-full"><PencilSquareIcon className="h-4 w-4"/></button>
                   <button type="button" onClick={() => handleDelete(l.id)} disabled={isCrudLoading} className="p-1 text-slate-500 hover:text-red-600 rounded-full"><TrashIcon className="h-4 w-4"/></button>
                 </div>
               </li>
             ))}
           </ul>
        </div>
      </div>
    </div>
  );
};