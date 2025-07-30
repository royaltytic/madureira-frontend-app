import { useState, useEffect, useMemo, ChangeEvent } from "react";
import api from "../../services/api";
import BulkFinalizeModal from "../popup/BulkFinalizeModal";
import { OrdersProps } from "../../types/types";
import { getStatusClass } from "../../utils/GetStatus";
import Alert from "../alerts/alertDesktop";
import { EditPedidoModal } from "../modal/EditPedidoModal";
import {
  PencilSquareIcon,
  TrashIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";

interface EmployeeProps {
  id: string;
  user: string;
}

interface UltimosPedidosProps {
  pedidos: OrdersProps[];
  onUpdate: (id: string, situacao: string, dataEntregue?: string) => void;
  onEdit: (pedido: OrdersProps) => void;
}


const UltimosPedidos: React.FC<UltimosPedidosProps> = ({ pedidos, onUpdate, onEdit }) => {
  const [employeeMap, setEmployeeMap] = useState<{ [key: string]: EmployeeProps }>({});
  const [selectedPedido, setSelectedPedido] = useState<OrdersProps | null>(null);
  const [editingPedido, setEditingPedido] = useState<OrdersProps | null>(null);
  const [editForm, setEditForm] = useState({ servico: "", situacao: "", descricao: "", data: "" });
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState<boolean>(false);
  const [selectedOrderForBulk, setSelectedOrderForBulk] = useState<OrdersProps[]>([]);
  const [filterText, setFilterText] = useState<string>("");

  useEffect(() => {
    const fetchMissingData = async () => {
      // Unifica os IDs de quem solicitou e quem entregou
      const employeeIdsToFetch = new Set(
        [...pedidos.map(p => p.employeeId), ...pedidos.map(p => p.entreguePorId)]
          .filter(id => id && !employeeMap[id]) // Filtra apenas os que não existem no cache
      );

      if (employeeIdsToFetch.size > 0) {
        const requests = Array.from(employeeIdsToFetch).map(id =>
          api.get(`/employee/${id}`).catch(() => null)
        );
        const responses = await Promise.all(requests);
        const newEmployeeMap = responses.filter(Boolean).reduce((acc, response) => {
          acc[response?.data.id] = response?.data;
          return acc;
        }, {} as { [key: string]: EmployeeProps });
        setEmployeeMap(prev => ({ ...prev, ...newEmployeeMap }));
      }
    };

    if (pedidos.length > 0) {
      fetchMissingData();
    }
  }, [pedidos, employeeMap]);

  const handleOpenBulkModal = (pedido: OrdersProps) => {
    setSelectedOrderForBulk([pedido]);
    setIsBulkModalOpen(true);
    setOpenMenu(null);
  };

  const handleBulkUpdate = (updates: { id: string; situacao: string; dataEntregue?: string }[]) => {
    // O modal retorna um array de atualizações, processamos cada uma
    updates.forEach(update => {
      onUpdate(update.id, update.situacao, update.dataEntregue);
    });
    setIsBulkModalOpen(false); // Fecha o modal após a confirmação
  };

  // Ordena os pedidos conforme a situação e a data
  const sortedPedidos = useMemo(() => {
    return [...pedidos].sort((a, b) => {
      if (a.situacao === "Aguardando" && b.situacao !== "Aguardando") return -1;
      if (a.situacao !== "Aguardando" && b.situacao === "Aguardando") return 1;

      const dateA = new Date(a.data);
      const dateB = new Date(b.data);
      return dateA.getTime() - dateB.getTime();
    });
  }, [pedidos]);

  // Filtra os pedidos conforme o texto digitado
  const filteredPedidos = useMemo(() => {
    if (!filterText.trim()) return sortedPedidos;
    const lowerCaseFilter = filterText.toLowerCase();
    return sortedPedidos.filter((pedido) =>
      pedido.servico.toLowerCase().includes(lowerCaseFilter) ||
      pedido.descricao.toLowerCase().includes(lowerCaseFilter)
    );
  }, [filterText, sortedPedidos]);

  const formatDate = (dateString: string): string => {
    if (!dateString) return "---";
    const dateObject = new Date(dateString);
    // Ajusta a data para o horário local
    const localDate = new Date(dateObject.getTime() + dateObject.getTimezoneOffset() * 60000);
    const day = localDate.getDate().toString().padStart(2, "0");
    const month = (localDate.getMonth() + 1).toString().padStart(2, "0");
    const year = localDate.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatDataEntregue = (dataEntregue: string | null): string => {
    return dataEntregue ? formatDate(dataEntregue) : "---";
  };

  const deleteOrder = async (id: string) => {
    if (window.confirm("Tem certeza que deseja deletar este pedido?")) {
      try {
        await api.delete(`/orders/${id}`);
        <Alert
          type="sucesso"
          text="Pedido deletado com sucesso!"
          onClose={() => console.log("Alert closed")}
        />

      } catch (error) {
        console.error("Erro ao deletar o pedido:", error);
        <Alert
          type="error"
          text="Erro ao deletar o pedido. Tente novamente."
          onClose={() => console.log("Alert closed")}
        />
      }
    }
  };

  const handleEditPedido = (pedido: OrdersProps) => {
    const localDate = new Date(pedido.data);

    // Converte a data para o formato yyyy-MM-dd
    const formattedDate = localDate.toISOString().split("T")[0];

    setEditingPedido(pedido);
    setEditForm({
      servico: pedido.servico,
      descricao: pedido.descricao,
      situacao: pedido.situacao,
      data: formattedDate, // Usa a data formatada corretamente
    });
    setOpenMenu(null);
  };


  const finalizeEdit = async () => {
    if (editingPedido) {
      // Converte a data para o formato yyyy-MM-dd antes de enviar
      const formattedDate = editForm.data;

      const updatedPedido: OrdersProps = {
        ...editingPedido,
        servico: editForm.servico,
        descricao: editForm.descricao,
        situacao: editForm.situacao,
        data: formattedDate, // Envia a data no formato yyyy-MM-dd
      };

      try {
        await api.put(`/orders/edit/${editingPedido.id}`, updatedPedido);
        onEdit(updatedPedido);
        setEditingPedido(null);
      } catch (error) {
        console.error("Erro ao editar o pedido:", error);
        alert("Erro ao editar o pedido. Tente novamente.");
      }
    }
  };

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm h-full flex flex-col">
      {/* Cabeçalho do Componente */}
      <div className="flex justify-between items-center border-b border-slate-200 pb-3 mb-3">
        <h2 className="text-lg font-semibold text-slate-800">Últimos Pedidos</h2>
        <div className="w-full max-w-xs">
          <input
            type="text"
            placeholder="Filtrar por serviço/descrição..."
            value={filterText}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setFilterText(e.target.value)}
            className="w-full border-slate-300 rounded-lg p-2 text-sm shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Lista de Pedidos com Scroll */}
      <div className="flex-grow overflow-y-auto pr-2">
        {filteredPedidos.length > 0 ? (
          <ul className="space-y-3">
            {filteredPedidos.map((pedido) => (
              <li key={pedido.id} className="p-3 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200">
                <div className="flex items-center justify-between gap-4">
                  {/* Informações Principais */}
                  <div className="flex-grow">
                    <p className="font-semibold text-slate-800 text-sm cursor-pointer hover:text-indigo-600" onClick={() => setSelectedPedido(pedido)}>
                      {pedido.servico}
                    </p>
                    <p className="text-xs text-slate-500">{pedido.descricao || "Sem descrição"}</p>
                  </div>

                  {/* Datas */}
                  <div className="text-right text-xs text-slate-500 hidden md:block">
                    <p title={`Solicitado por: ${pedido.employeeId ? employeeMap[pedido.employeeId]?.user : 'N/A'}`}>
                      Solicitado em: <span className="font-medium text-slate-700">{formatDate(pedido.data)}</span>
                    </p>
                    <p title={`Alterado por: ${pedido.entreguePorId ? employeeMap[pedido.entreguePorId]?.user : 'N/A'}`}>
                      Alterado em: <span className="font-medium text-slate-700">{formatDataEntregue(pedido.dataEntregue)}</span>
                    </p>
                  </div>

                  {/* Status e Ações */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className={getStatusClass(pedido.situacao)}>{pedido.situacao}</div>
                    <div className="relative">
                      <button onClick={() => setOpenMenu(openMenu === pedido.id ? null : pedido.id)} className="p-2 rounded-full hover:bg-slate-200 focus:outline-none">
                        <span className="text-xl font-bold">&#8942;</span>
                      </button>
                      {openMenu === pedido.id && (
                        <div className="absolute right-0 mt-2 w-48 bg-white border rounded-md shadow-lg z-50 p-1">
                          {/* Botão Editar */}
                          <button
                            onClick={() => handleEditPedido(pedido)}
                            className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 hover:text-slate-900 rounded-md flex items-center gap-2"
                          >
                            <PencilSquareIcon className="h-4 w-4" />
                            Editar Pedido
                          </button>

                          {/* NOVA OPÇÃO: Alterar Situação */}
                          <button
                            onClick={() => handleOpenBulkModal(pedido)}
                            className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 hover:text-slate-900 rounded-md flex items-center gap-2"
                          >
                            <Cog6ToothIcon className="h-4 w-4" />
                            Alterar Situação
                          </button>

                          <div className="border-t my-1 border-slate-200"></div> {/* Divisor visual */}

                          {/* Botão Deletar */}
                          <button
                            onClick={() => deleteOrder(pedido.id)}
                            className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-800 rounded-md flex items-center gap-2"
                          >
                            <TrashIcon className="h-4 w-4" />
                            Deletar Pedido
                          </button>
                        </div>
                      )}

                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-10">
            <p className="text-slate-500">Nenhum pedido encontrado.</p>
          </div>
        )}
      </div>


      {/* Modal de Visualização do Comprovante */}
      {selectedPedido && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
          onClick={() => setSelectedPedido(null)}
        >
          <div
            className="bg-white p-6 rounded shadow-lg max-w-lg max-h-[80vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h1 className="text-xl mb-4 font-semibold">
              Comprovante do pedido <span className="text-blue-600">{selectedPedido.servico}</span>
            </h1>
            {selectedPedido.imageUrl ? (
              <>
                <img
                  src={selectedPedido.imageUrl}
                  alt={`Anexo do pedido de ${selectedPedido.servico}`}
                  className="max-w-full max-h-[60vh] object-contain"
                />
                <div className="flex gap-4 mt-4">
                  <button
                    className="bg-red-500 hover:bg-red-600 text-white font-bold px-4 py-2 rounded w-1/2"
                    onClick={() => setSelectedPedido(null)}
                  >
                    Fechar
                  </button>
                  <a
                    href={selectedPedido.imageUrl}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-2 rounded w-1/2 text-center"
                  >
                    Baixar
                  </a>
                </div>
              </>
            ) : (
              <p>Comprovante não disponível</p>
            )}
          </div>
        </div>
      )}

      {/* Modal de Edição do Pedido */}
      {editingPedido && (
        <EditPedidoModal
          pedido={editingPedido}
          isOpen={!!editingPedido}
          onClose={() => setEditingPedido(null)}
          onSave={finalizeEdit}
          isSaving={false} // Adjust this based on your saving state logic
        />
      )}

      {isBulkModalOpen && (
        <BulkFinalizeModal
          selectedOrders={selectedOrderForBulk}
          onClose={() => setIsBulkModalOpen(false)}
          onBulkFinalize={handleBulkUpdate}
        />
      )}
    </div>
  );
};

export default UltimosPedidos;
