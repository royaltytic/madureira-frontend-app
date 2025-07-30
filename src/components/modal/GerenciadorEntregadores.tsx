import React, { useState, useEffect } from 'react';
import { DeliveryProps } from '../../types/types'; 
import api from '../../services/api';
import {
  Cog6ToothIcon,
  UserCircleIcon,
  PencilSquareIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/solid';

interface GerenciadorEntregadoresProps {
  onDelivererSelect: (id: string) => void;
  onDeliverersChange: (deliverers: DeliveryProps[]) => void;
}

export const GerenciadorEntregadores: React.FC<GerenciadorEntregadoresProps> = ({
  onDelivererSelect,
  onDeliverersChange,
}) => {
  // Toda a lógica e estado do CRUD de entregadores agora vivem aqui
  const [deliveryPeople, setDeliveryPeople] = useState<DeliveryProps[]>([]);
  const [selectedDelivererId, setSelectedDelivererId] = useState<string>('');
  const [isManaging, setIsManaging] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Começa como true para a busca inicial
  const [isCrudLoading, setIsCrudLoading] = useState<boolean>(false);
  const [editingDeliverer, setEditingDeliverer] = useState<DeliveryProps | null>(null);
  const [delivererName, setDelivererName] = useState<string>('');

  // Busca os entregadores assim que o componente é montado
  useEffect(() => {
    const fetchDeliveryPeople = async () => {
      setIsLoading(true);
      try {
        const response = await api.get<DeliveryProps[]>('/delivery');
        const deliverers = response.data;
        setDeliveryPeople(deliverers);
        onDeliverersChange(deliverers); // Informa a lista completa para o componente pai

        if (deliverers.length > 0) {
          const firstDelivererId = deliverers[0].idDelivery;
          setSelectedDelivererId(firstDelivererId);
          onDelivererSelect(firstDelivererId); // Informa o ID selecionado para o pai
        }
      } catch (error) {
        console.error('Erro ao buscar entregadores:', error);
        alert('Não foi possível carregar a lista de entregadores.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchDeliveryPeople();
  }, [onDelivererSelect, onDeliverersChange]); 

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!delivererName.trim()) return;
    setIsCrudLoading(true);
    try {
      if (editingDeliverer) {
        const { data: updated } = await api.put<DeliveryProps>(`/delivery/${editingDeliverer.idDelivery}`, { name: delivererName, tipo: "Entregador" });
        const updatedList = deliveryPeople.map(d => d.idDelivery === editingDeliverer.idDelivery ? updated : d);
        setDeliveryPeople(updatedList);
        onDeliverersChange(updatedList);
      } else {
        const { data: newDeliverer } = await api.post<DeliveryProps>('/delivery', { name: delivererName, tipo: "Entregador" });
        const updatedList = [...deliveryPeople, newDeliverer];
        setDeliveryPeople(updatedList);
        onDeliverersChange(updatedList);
        setSelectedDelivererId(newDeliverer.idDelivery);
        onDelivererSelect(newDeliverer.idDelivery);
      }
      setDelivererName('');
      setEditingDeliverer(null);
    } catch (error) {
      console.error('Erro ao salvar entregador:', error);
    } finally {
      setIsCrudLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Tem certeza?")) return;
    setIsCrudLoading(true);
    try {
      await api.delete(`/delivery/${id}`);
      const remaining = deliveryPeople.filter(d => d.idDelivery !== id);
      setDeliveryPeople(remaining);
      onDeliverersChange(remaining);

      if (selectedDelivererId === id) {
        const newSelectedId = remaining.length > 0 ? remaining[0].idDelivery : '';
        setSelectedDelivererId(newSelectedId);
        onDelivererSelect(newSelectedId);
      }
    } catch (error) {
      console.error('Erro ao excluir:', error);
    } finally {
      setIsCrudLoading(false);
    }
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSelectedId = e.target.value;
    setSelectedDelivererId(newSelectedId);
    onDelivererSelect(newSelectedId); 
  };

  return (
    <div className="mt-4">
      <div className="flex items-end gap-3">
        <div className="flex-grow">
          <label htmlFor="deliverer-select" className="block text-sm font-medium text-slate-600 mb-1">
            Atribuir ao Entregador
          </label>
          <select
            id="deliverer-select"
            value={selectedDelivererId}
            onChange={handleSelectChange}
            disabled={isLoading || deliveryPeople.length === 0}
            className="w-full p-2.5 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
          >
            {isLoading ? <option>Carregando...</option> :
              deliveryPeople.length > 0 ? (
                deliveryPeople.map(d => <option key={d.idDelivery} value={d.idDelivery}>{d.name}</option>)
              ) : (
                <option>Nenhum entregador cadastrado</option>
              )}
          </select>
        </div>
        <button
          onClick={() => setIsManaging(!isManaging)}
          title="Gerenciar Entregadores"
          className="flex-shrink-0 h-[42px] w-[42px] flex items-center justify-center bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <Cog6ToothIcon className="h-6 w-6" />
        </button>
      </div>

      <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isManaging ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="mt-6 pt-6 border-t border-slate-200">
          <form onSubmit={handleCreateOrUpdate} className="p-4 bg-slate-50 rounded-xl border mb-6">
            <h3 className="font-semibold text-base mb-3 text-slate-800">
              {editingDeliverer ? 'Editando Entregador' : 'Adicionar Novo'}
            </h3>
            <div className="flex items-center gap-3">
              <input type="text" placeholder="Nome do entregador" value={delivererName} onChange={(e) => setDelivererName(e.target.value)} className="flex-grow border rounded-lg px-3 py-2" required />
              <button type="submit" title="Salvar" disabled={isCrudLoading} className="h-9 w-9 flex items-center justify-center bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300">
                {isCrudLoading ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : <CheckIcon className="h-5 w-5" />}
              </button>
              {editingDeliverer && (
                <button type="button" title="Cancelar" onClick={() => { setEditingDeliverer(null); setDelivererName(''); }} className="h-9 w-9 flex items-center justify-center bg-slate-500 text-white rounded-lg hover:bg-slate-600">
                  <XMarkIcon className="h-5 w-5" />
                </button>
              )}
            </div>
          </form>

          <div>
            <h4 className="font-semibold text-base mb-3 text-slate-700">Entregadores Cadastrados</h4>
            <ul className="max-h-52 overflow-y-auto space-y-2">
              {deliveryPeople.length > 0 ? deliveryPeople.map(d => (
                <li key={d.idDelivery} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                  <div className="flex items-center gap-3"><UserCircleIcon className="h-8 w-8 text-slate-400" /><span className="text-slate-800 font-medium">{d.name}</span></div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => { setEditingDeliverer(d); setDelivererName(d.name); }} title="Editar" disabled={isCrudLoading} className="p-2 text-slate-500 hover:text-blue-600 rounded-full disabled:text-slate-300"><PencilSquareIcon className="h-5 w-5" /></button>
                    <button onClick={() => handleDelete(d.idDelivery)} title="Excluir" disabled={isCrudLoading} className="p-2 text-slate-500 hover:text-red-600 rounded-full disabled:text-slate-300"><TrashIcon className="h-5 w-5" /></button>
                  </div>
                </li>
              )) : <div className="text-center py-6"><p className="text-sm text-slate-500">Nenhum entregador encontrado.</p></div>}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};