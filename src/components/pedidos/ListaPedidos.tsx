import React, { useState, useEffect, useMemo } from "react";
import api from "../../services/api";

import { DocumentMagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { PessoaProps, OrdersProps } from "../../types/types";
import { PedidoCard } from "../cards/PedidoCard";
import Alert from "../alerts/alertDesktop";
import { EditPedidoModal } from "../modal/EditPedidoModal";

export interface EmployeeProps {
  id: string;
  user: string;
}

interface ListaPedidosProps {
  pedidos: OrdersProps[];
  local: string;
  onUpdate: (id: string, situacao: string, dataEntregue?: string) => Promise<void>;
  selectedOrderIds: string[];
  toggleOrderSelection: (orderId: string) => void;
  isSelectionMode: boolean;
  onCardClick: (user: PessoaProps) => void; // 1. A prop já estava aqui, o que é ótimo.
}

const ListaPedidos: React.FC<ListaPedidosProps> = ({
  pedidos,
  onUpdate,
  selectedOrderIds,
  toggleOrderSelection,
  onCardClick,
}) => {
  // Mapas de dados de usuários e funcionários
  const [userMap, setUserMap] = useState<{ [key: string]: PessoaProps }>({});
  const [employeeMap, setEmployeeMap] = useState<{ [key: string]: EmployeeProps }>({});
  const [selectedPedidoForImage, setSelectedPedidoForImage] = useState<OrdersProps | null>(null);
  const [isFinalizing, setIsFinalizing] = useState<boolean>(false);
  const [editingPedido, setEditingPedido] = useState<OrdersProps | null>(null);

  // Busca dados de usuários e funcionários para cada pedido
  useEffect(() => {
    const fetchMissingData = async () => {
      // Cria um conjunto de IDs únicos que ainda não estão no cache
      const userIdsToFetch = new Set(
        pedidos
          .map(p => p.userId)
          .filter(id => id && !userMap[id]) // Filtra apenas os que não existem
      );

      const employeeIdsToFetch = new Set(
        [...pedidos.map(p => p.employeeId), ...pedidos.map(p => p.entreguePorId)]
          .filter(id => id && !employeeMap[id]) // Filtra apenas os que não existem
      );

      // Busca dados de usuários que faltam
      if (userIdsToFetch.size > 0) {
        const requests = Array.from(userIdsToFetch).map(id =>
          api.get(`/users/${id}`).catch(() => null) // .catch para não quebrar o Promise.all
        );
        const responses = await Promise.all(requests);
        const newUserMap = responses.filter(Boolean).reduce((acc, response) => {
          acc[response?.data.id] = response?.data;
          return acc;
        }, {} as { [key: string]: PessoaProps });
        setUserMap(prev => ({ ...prev, ...newUserMap })); // Adiciona ao cache existente
      }

      // Busca dados de funcionários que faltam
      if (employeeIdsToFetch.size > 0) {
        const requests = Array.from(employeeIdsToFetch).map(id =>
          api.get(`/employee/${id}`).catch(() => null)
        );
        const responses = await Promise.all(requests);
        const newEmployeeMap = responses.filter(Boolean).reduce((acc, response) => {
          acc[response?.data.id] = response?.data;
          return acc;
        }, {} as { [key: string]: EmployeeProps });
        setEmployeeMap(prev => ({ ...prev, ...newEmployeeMap })); // Adiciona ao cache existente
      }
    };

    if (pedidos.length > 0) {
      fetchMissingData();
    }
  }, [pedidos, userMap, employeeMap]);

  const isSelectionMode = selectedOrderIds.length > 0;

  // Renomeamos a constante para maior clareza
  const groupedAndSortedPedidos = useMemo(() => {
    // 1. Agrupa os pedidos por bairro
    const grouped = pedidos.reduce<{ [key: string]: OrdersProps[] }>((acc, pedido) => {
      const neighborhood = userMap[pedido.userId]?.neighborhood || "Sem Localidade";
      if (!acc[neighborhood]) {
        acc[neighborhood] = [];
      }
      acc[neighborhood].push(pedido);
      return acc;
    }, {});

    // 2. Ordena os pedidos DENTRO de cada grupo
    for (const neighborhood in grouped) {
      grouped[neighborhood].sort((a, b) => {
        // Prioriza "Aguardando" no topo
        if (a.situacao === "Aguardando" && b.situacao !== "Aguardando") return -1;
        if (a.situacao !== "Aguardando" && b.situacao === "Aguardando") return 1;

        // Ordena do mais antigo para o mais recente
        return new Date(a.data).getTime() - new Date(b.data).getTime();
      });
    }

    return grouped;
  }, [pedidos, userMap]);

  // Abre modal para visualização da imagem
  const openImagePopup = (pedido: OrdersProps) => {
    setSelectedPedidoForImage(pedido);
  };

  // Inicia a edição do pedido
  const handleEditPedido = (pedido: OrdersProps) => {
    setEditingPedido(pedido);
  };

  const handleSaveEdit = async (updatedData: Partial<OrdersProps>) => {
    if (editingPedido) {
      setIsFinalizing(true); // Reutilizamos o estado de 'loading'
      try {
        await api.put(`/orders/edit/${editingPedido.id}`, updatedData);
        
        await onUpdate(
          editingPedido.id,
          updatedData.situacao || editingPedido.situacao,
          
        );
        
        setEditingPedido(null); 
      } catch (error) {
        console.error("Erro ao editar o pedido:", error);
        <Alert 
          type="error" 
          text="Erro ao editar o pedido. Por favor, tente novamente." 
          onClose={() => console.log("Alert closed")}
        />
      } finally {
        setIsFinalizing(false);
      }
    }
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
          text="Erro ao deletar o pedido. Por favor, tente novamente." 
          onClose={() => console.log("Alert closed")}
        />
      }
    }
  };

  return (
    <div className="flex flex-col items-center py-4 px-2">
      

      {/* Modal para exibir o anexo (imagem do pedido) */}
      {selectedPedidoForImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
          onClick={() => setSelectedPedidoForImage(null)}
        >
          <div
            className="bg-white p-6 rounded shadow-md max-w-lg max-h-[80vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {selectedPedidoForImage.imageUrl ? (
              <>
                <img
                  src={selectedPedidoForImage.imageUrl}
                  alt={`Anexo do pedido de ${selectedPedidoForImage.servico}`}
                  className="max-w-full max-h-[60vh] object-contain mb-4"
                />
                <div className="flex gap-4">
                  <button
                    className="bg-gradient-to-r from-[#E03335] to-[#812F2C] hover:bg-red-600 text-white font-semibold px-4 py-2 rounded w-1/2"
                    onClick={() => setSelectedPedidoForImage(null)}
                  >
                    Fechar
                  </button>
                  <a
                    href={selectedPedidoForImage.imageUrl}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gradient-to-r from-[#0E9647] to-[#165C38] hover:bg-green-600 text-center text-white font-semibold px-4 py-2 rounded w-1/2"
                  >
                    Baixar
                  </a>
                </div>
              </>
            ) : (
              <p className="text-gray-700">Comprovante não disponível</p>
            )}
          </div>
        </div>
      )}

      {pedidos.length === 0 ? (
        <div className="text-center py-16 px-6 bg-slate-50 rounded-lg">
          <DocumentMagnifyingGlassIcon className="mx-auto h-12 w-12 text-slate-400" />
          <h3 className="mt-2 text-lg font-semibold text-slate-800">Nenhum Pedido Encontrado</h3>
          <p className="mt-1 text-sm text-slate-600">Ajuste os filtros ou aguarde novas solicitações.</p>
        </div>
      ) : (
        <div className="space-y-6"> {/* Usamos space-y para espaçar os grupos */}
          {/* Loop externo para cada BAIRRO */}
          {Object.keys(groupedAndSortedPedidos).sort().map(neighborhood => (
            <div key={neighborhood}>
              {/* Cabeçalho do Grupo (Nome do Bairro) */}
              <h2 className="text-base font-bold text-slate-600 mb-3 border-b-2 border-slate-200 pb-2">
                {neighborhood}
              </h2>

              {/* Grid para os cartões DENTRO do grupo */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                {/* Loop interno para cada PEDIDO dentro do bairro */}
                {groupedAndSortedPedidos[neighborhood].map((pedido) => (
                 <PedidoCard
                 key={pedido.id}
                 pedido={pedido}
                 user={userMap[pedido.userId]}
                 employeeMap={employeeMap}
                 selectedOrderIds={selectedOrderIds}
                 toggleOrderSelection={toggleOrderSelection}
                 handleEditPedido={handleEditPedido}
                 deleteOrder={deleteOrder}
                 openImagePopup={openImagePopup}
                 isSelectionMode={isSelectionMode}
                 onCardClick={onCardClick} 
               />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      {editingPedido && (
        <EditPedidoModal
        isOpen={!!editingPedido}
        pedido={editingPedido}
        onClose={() => setEditingPedido(null)}
        onSave={handleSaveEdit}
        isSaving={isFinalizing}
      />
      )}
    </div>
  );
};

export default ListaPedidos;
