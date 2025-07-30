import { useState } from "react";
import { PedidoItem } from "./PedidoItem";
import { OrdersProps } from "../../types/types";
import { useServicosList } from "../../constants/Servicos";

interface PopupProps {
  onClose: () => void;
  onAddPedido: (novosPedidos: OrdersProps[]) => void;
}

export const PopUp = ({ onClose, onAddPedido }: PopupProps) => {
  const [pedidosSelecionados, setPedidosSelecionados] = useState<{ servico: string; descricao: string }[]>([]);
  const [situacao] = useState("Aguardando");
  const [dataPedido, setDataPedido] = useState(
    new Date().toISOString().split("T")[0]
  );

  const { servicosNomes } = useServicosList();

  const handlePedidoSelect = (servico: string, selected: boolean) => {
    setPedidosSelecionados((prev) => {
      if (selected) {
        if (!prev.some((pedido) => pedido.servico === servico)) {
          return [...prev, { servico, descricao: "" }];
        }
      } else {
        return prev.filter((pedido) => pedido.servico !== servico);
      }
      return prev;
    });
  };

  const handleDescricaoChange = (servico: string, descricao: string) => {
    setPedidosSelecionados((prev) =>
      prev.map((pedido) =>
        pedido.servico === servico ? { ...pedido, descricao } : pedido
      )
    );
  };

  const handleAddPedidos = (e: React.FormEvent) => {

    e.preventDefault(); 
    
    const novosPedidos: OrdersProps[] = pedidosSelecionados.map((pedido) => ({
      servico: pedido.servico,
      situacao: situacao,
      descricao: pedido.descricao,
      dataEntregue: null,
      data: dataPedido.split("-").reverse().join("/"),
      id: "",
      userId: "",
      employeeId: "",
      entreguePorId: "",
      imageUrl: "",
    }));

    onAddPedido(novosPedidos);
    onClose();
  };


  return (
    // Fundo com desfoque e transição suave
    <div 
      className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose} // Fecha ao clicar no fundo
    >
      {/* Container do Modal com layout flexível e animação de entrada */}
      <div 
        className="bg-slate-50 rounded-xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()} // Previne o fechamento ao clicar dentro do modal
      >
        {/* 1. CABEÇALHO */}
        <header className="flex-shrink-0 p-4 sm:p-5 border-b border-slate-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-slate-800">
            Adicionar Novo Pedido
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-colors"
            title="Fechar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-6 w-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        {/* 2. CORPO COM FORMULÁRIO E ROLAGEM */}
        <main className="flex-grow p-4 sm:p-5 overflow-y-auto">
          <form onSubmit={handleAddPedidos} className="space-y-6">
            <div>
              <label htmlFor="dataPedido" className="block text-sm font-medium text-slate-700 mb-1">
                Data do Pedido
              </label>
              <input
                type="date"
                id="dataPedido"
                value={dataPedido}
                onChange={(e) => setDataPedido(e.target.value)}
                className="w-full py-2 px-3 border border-slate-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              />
            </div>
            
            <div className="space-y-3">
              <label className="block text-sm font-medium text-slate-700">
                Selecione os serviços
              </label>
              {servicosNomes.map((servico) => {
                const pedidoSelecionado = pedidosSelecionados.find((p) => p.servico === servico);
                return (
                  <PedidoItem
                    key={servico}
                    name={servico}
                    isSelected={!!pedidoSelecionado}
                    onSelect={(selected) => handlePedidoSelect(servico, selected)}
                  >
                    <textarea
                      value={pedidoSelecionado?.descricao || ''}
                      onChange={(e) => handleDescricaoChange(servico, e.target.value)}
                      placeholder="Adicionar uma observação (opcional)..."
                      className="w-full text-sm p-2 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      rows={2}
                    />
                  </PedidoItem>
                );
              })}
            </div>
          </form>
        </main>

        {/* 3. RODAPÉ COM AÇÕES */}
        <footer className="flex-shrink-0 p-4 sm:p-5 bg-white border-t border-slate-200 flex justify-end items-center gap-4">
          <button
            type="button"
            className="px-5 py-2 rounded-lg border border-slate-300 bg-white text-slate-800 font-semibold hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            type="submit"
            onClick={handleAddPedidos} 
            disabled={pedidosSelecionados.length === 0}
            className="px-6 py-2 rounded-lg text-white font-semibold transition-all duration-200 bg-gradient-to-r from-[#0E9647] to-[#165C38] hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-slate-400 disabled:from-slate-400 disabled:to-slate-400 disabled:cursor-not-allowed"
          >
            Adicionar Pedido
          </button>
        </footer>
      </div>
    </div>

  );
};
