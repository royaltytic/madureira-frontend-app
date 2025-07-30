import React, { useState, useEffect } from 'react';
import { OrdersProps } from '../../types/types'; 

interface EditPedidoModalProps {
  pedido: OrdersProps; 
  isOpen: boolean; 
  onClose: () => void; 
  onSave: (updatedData: Partial<OrdersProps>) => void;
  isSaving: boolean; 
}

export const EditPedidoModal: React.FC<EditPedidoModalProps> = ({
  pedido,
  isOpen,
  onClose,
  onSave,
  isSaving,
}) => {
  // Estado interno para gerenciar os campos do formulário
  const [editForm, setEditForm] = useState({
    descricao: '',
    data: '',
  });

  // useEffect para popular o formulário quando o pedido a ser editado mudar
  useEffect(() => {
    if (pedido) {
      setEditForm({
        descricao: pedido.descricao,
        data: pedido.data.split('T')[0] || new Date().toISOString().split('T')[0],
      });
    }
  }, [pedido]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleSaveClick = () => {
    // Formata a data no padrão pt-BR antes de enviar para o componente pai
    const formattedDate = new Date(editForm.data).toLocaleDateString('pt-BR', {
      timeZone: 'UTC',
    });

    onSave({
      ...editForm,
      data: formattedDate,
    });
  };

  if (!isOpen) {
    return null;
  }

  return (
    // FUNDO DO MODAL COM EFEITO DE DESFOQUE
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      {/* CARD DO MODAL COM LAYOUT FLEXÍVEL */}
      <div className="bg-slate-50 rounded-xl w-full max-w-md h-auto max-h-[90vh] flex flex-col shadow-2xl">
        {/* 1. CABEÇALHO FIXO */}
        <header className="flex-shrink-0 p-4 sm:p-5 border-b border-slate-200 flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-800">Editar Pedido</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-colors"
            title="Fechar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        {/* 2. ÁREA DE CONTEÚDO COM ROLAGEM */}
        <main className="flex-grow p-4 sm:p-5 overflow-y-auto">
          <form className="space-y-4">
            <div>
              <label htmlFor="servico" className="block text-sm font-medium text-slate-700">Serviço</label>
              <input type="text" id="servico" name="servico" value={pedido.servico} disabled  className="mt-1 w-full py-1 px-2 border-slate-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            <div>
              <label htmlFor="situacao" className="block text-sm font-medium text-slate-700">Situação</label>
              <input type="text" id="situacao" name="situacao" value={pedido.situacao} disabled  className="mt-1 w-full py-1 px-2 border-slate-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            <div>
              <label htmlFor="descricao" className="block text-sm font-medium text-slate-700">Descrição</label>
              <textarea id="descricao" name="descricao" value={editForm.descricao} onChange={handleInputChange} className="mt-1 w-full py-1 px-2 border-slate-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500" rows={3} />
            </div>
            <div>
              <label htmlFor="data" className="block text-sm font-medium text-slate-700">Data</label>
              <input type="date" id="data" name="data" value={editForm.data} onChange={handleInputChange} className="mt-1 w-full py-1 px-2 border-slate-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
          </form>
        </main>

        {/* 3. RODAPÉ FIXO COM BOTÕES DE AÇÃO */}
        <footer className="flex-shrink-0 p-4 sm:p-5 bg-white border-t border-slate-200 flex justify-end items-center gap-4">
          <button
            className="px-5 py-2 rounded-lg border border-slate-300 bg-white text-slate-800 font-semibold hover:bg-slate-50 transition-colors"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            className="px-5 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors disabled:bg-indigo-300"
            onClick={handleSaveClick}
            disabled={isSaving}
          >
            {isSaving ? "Salvando..." : "Salvar Alterações"}
          </button>
        </footer>
      </div>
    </div>
  );
};