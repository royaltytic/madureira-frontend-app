import { useState } from 'react';
import { useCrud } from './hooks/useCrud';
import { toast } from 'react-hot-toast';
import { CrudItemModal } from '../components/modal/CrudItemModal';
import { ConfirmationModal } from './modal/ConfimationModal'; // Reutilizando o modal de confirmação

type ManagedEntity = 'servicos' | 'localidades' | 'delivery';

// Interface para os itens que estamos gerenciando
interface CrudItem {
  id: string;
  [key: string]: string; // Permite outras propriedades como 'name', 'localidade', etc.
}

const CrudManager = ({ title, endpoint, nameKey }: { title: string, endpoint: string, nameKey: string }) => {
  const { items, isLoading, addItem, updateItem, deleteItem } = useCrud<CrudItem>(endpoint);
  
  // Estados para controlar os modais
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<CrudItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<CrudItem | null>(null);
  
  // Handlers para abrir os modais
  const handleOpenCreate = () => {
    setItemToEdit(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (item: CrudItem) => {
    setItemToEdit({ id: item.id, name: item[nameKey] });
    setIsFormModalOpen(true);
  };
  
  const handleSave = async (data: { name: string }) => {
    const payload = { [nameKey]: data.name };
    const promise = itemToEdit
      ? updateItem(itemToEdit.id, payload)
      : addItem(payload);
      
    toast.promise(promise, {
      loading: 'Salvando...',
      success: () => {
        setIsFormModalOpen(false);
        return `Item ${itemToEdit ? 'atualizado' : 'criado'} com sucesso!`;
      },
      error: 'Falha ao salvar o item.',
    });
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    const promise = deleteItem(itemToDelete.id);
    
    toast.promise(promise, {
      loading: 'Excluindo...',
      success: () => {
        setItemToDelete(null);
        return 'Item excluído com sucesso!';
      },
      error: 'Falha ao excluir o item.',
    });
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-200">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
        <button onClick={handleOpenCreate} className="px-4 py-2 bg-indigo-600 text-white font-semibold text-sm rounded-lg hover:bg-indigo-700">
          Adicionar Novo
        </button>
      </div>
      
      {isLoading ? <p>Carregando...</p> : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b-2 border-slate-200">
                <th className="p-3 font-bold text-slate-600">Nome</th>
                <th className="p-3 text-right font-bold text-slate-600">Ações</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id} className="border-b hover:bg-slate-50">
                  <td className="p-3 text-slate-800">{item[nameKey]}</td>
                  <td className="p-3 flex justify-end gap-4">
                    <button onClick={() => handleOpenEdit(item)} className="text-sm font-semibold text-indigo-600 hover:underline">Editar</button>
                    <button onClick={() => setItemToDelete(item)} className="text-sm font-semibold text-red-600 hover:underline">Excluir</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <CrudItemModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSave={handleSave}
        itemToEdit={itemToEdit ? { id: itemToEdit.id, name: itemToEdit.name } : null}
        entityName={title.replace('Gerenciar ', '')}
      />

      <ConfirmationModal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleDelete}
        title={`Excluir ${title.replace('Gerenciar ', '')}`}
      >
        Tem certeza que deseja excluir "<strong>{itemToDelete ? itemToDelete[nameKey] : ''}</strong>"? Esta ação não pode ser desfeita.
      </ConfirmationModal>
    </div>
  );
};

export const GerenciamentoGeral = () => {
  const [activeTab, setActiveTab] = useState<ManagedEntity>('servicos');

  const tabs: { key: ManagedEntity, label: string, nameKey: string }[] = [
    { key: 'servicos', label: 'Serviços', nameKey: 'servico' },
    { key: 'localidades', label: 'Localidades', nameKey: 'localidade' },
    { key: 'delivery', label: 'Entregadores', nameKey: 'name' },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Gerenciamento Geral</h1>
        <p className="text-slate-500 mt-1">Adicione, edite ou remova serviços, localidades e entregadores.</p>
      </header>
      
      <div className="flex border-b border-slate-200 mb-6">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`py-3 px-5 font-semibold transition-colors ${activeTab === tab.key ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      <div>
        {tabs.map(tab => activeTab === tab.key && (
          <CrudManager
            key={tab.key}
            title={`${tab.label}`}
            endpoint={`/${tab.key}`}
            nameKey={tab.nameKey}
          />
        ))}
      </div>
    </div>
  );
};