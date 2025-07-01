import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { UploadFileModal } from "../../pages/telaHome/UploadFileModal";
import { DocumentMagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { 
  PhoneIcon, 
  MapPinIcon, 
  CalendarDaysIcon,
  CheckBadgeIcon,
  PencilSquareIcon,
  TrashIcon,
} from '@heroicons/react/24/solid';

interface EmployeeProps {
  id: string;
  user: string;
}

interface OrdersProps {
  servico: string;
  data: string;
  dataEntregue: string | null;
  situacao: string;
  descricao: string;
  id: string;
  userId: string;
  employeeId: string;
  entreguePorId: string;
  imageUrl?: string;
}

interface PessoaProps {
  id: string;
  name: string;
  cpf: string;
  phone: string;
  apelido: string;
  referencia: string;
  neighborhood: string;
}

interface ListaPedidosProps {
  pedidos: OrdersProps[];
  local: string;
  onUpdate: (id: string, situacao: string, dataEntregue?: string) => Promise<void>;
  selectedOrderIds: string[];
  toggleOrderSelection: (orderId: string) => void;
  isSelectionMode: boolean;
}

const getStatusClass = (situacao: string): string => {
  // Classes base para todas as etiquetas, com cantos arredondados
  const baseClasses = "px-3 py-1 text-xs font-bold rounded-full inline-block";

  if (situacao.startsWith("Lista")) {
    // Azul suave
    return `${baseClasses} bg-blue-100 text-blue-800`;
  }

  switch (situacao) {
    case "Aguardando":
      // Vermelho suave
      return `${baseClasses} bg-red-100 text-red-800`;
    case "Finalizado":
      // Verde suave
      return `${baseClasses} bg-green-100 text-green-800`;
    case "Cancelado":
      // Laranja suave
      return `${baseClasses} bg-orange-100 text-orange-800`;
    default:
      // Cinza suave para outros casos
      return `${baseClasses} bg-gray-100 text-gray-800`;
  }
};

interface PedidoCardProps {
  pedido: OrdersProps;
  user: PessoaProps | undefined;
  employeeMap: { [key: string]: EmployeeProps };
  toggleOrderSelection: (orderId: string) => void;
  selectedOrderIds: string[];
  handleEditPedido: (pedido: OrdersProps) => void;
  deleteOrder: (id: string) => Promise<void>;
  openImagePopup: (pedido: OrdersProps) => void;
  isSelectionMode: boolean;
}

const PedidoCard: React.FC<PedidoCardProps> = React.memo(({ pedido, user, employeeMap, toggleOrderSelection, selectedOrderIds, handleEditPedido, deleteOrder, openImagePopup, isSelectionMode }) => {
  const [openMenu, setOpenMenu] = useState(false);
  const formatDate = (dateString: string | null): string => dateString ? new Date(dateString).toLocaleDateString("pt-BR", { timeZone: "UTC" }) : "---";

  return (
    <div className="group relative bg-white rounded-lg shadow-sm border border-slate-200 flex flex-col transition-all duration-200 hover:shadow-md hover:border-indigo-200">
      <div className={`absolute top-2 left-2 transition-opacity duration-200 ${isSelectionMode ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
        <input type="checkbox" className="form-checkbox h-5 w-5 text-indigo-600 cursor-pointer rounded focus:ring-indigo-500 border-slate-300" checked={selectedOrderIds.includes(pedido.id)} onChange={() => toggleOrderSelection(pedido.id)} />
      </div>
      <div className="p-3 flex flex-col flex-grow">
        <div className="flex justify-between items-start gap-2 mb-3">
          <div className="pr-5">
            <p className="font-semibold text-xs text-slate-800 cursor-pointer" onClick={() => openImagePopup(pedido)}>{user ? `${user.name}, ${user.apelido}` : "..."}</p>
            {/* <p className="text-xs text-slate-500">{user?.cpf}</p> */}
          </div>
          <div className="flex-shrink-0 flex items-center gap-1">
            <div className={getStatusClass(pedido.situacao)}>{pedido.situacao}</div>
            <div className="relative">
              <button onClick={() => setOpenMenu(!openMenu)} className="p-1 rounded-full hover:bg-slate-200 focus:outline-none"><span className="text-lg font-bold leading-none">&#8942;</span></button>
              {openMenu && (
                <div className="absolute right-0 mt-2 w-36 bg-white border rounded-md shadow-lg z-50">
                  <button onClick={() => { handleEditPedido(pedido); setOpenMenu(false); }} className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 flex items-center gap-2"><PencilSquareIcon className="h-4 w-4"/>Editar</button>
                  <button onClick={() => { deleteOrder(pedido.id); setOpenMenu(false); }} className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 flex items-center gap-2"><TrashIcon className="h-4 w-4"/>Deletar</button>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="space-y-1.5 text-xs text-slate-600 flex-grow">
          <p className="flex items-center gap-1.5"><MapPinIcon className="h-4 w-4 text-slate-400" /> {user?.neighborhood || "Sem localidade"}{user?.referencia ? `, ${user.referencia}` : ''}</p>
          {user?.phone && <p className="flex items-center gap-1.5"><PhoneIcon className="h-4 w-4 text-slate-400" /> {user.phone}</p>}
        </div>
        <div className="mt-3 pt-2 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500">
           <div className="flex items-center gap-1.5" title={`Solicitado por: ${pedido.employeeId ? employeeMap[pedido.employeeId]?.user || 'N/A' : 'N/A'}`}><CalendarDaysIcon className="h-4 w-4" /> <span>{formatDate(pedido.data)}</span></div>
           <div className="flex items-center gap-1.5" title={`Entregue por: ${pedido.entreguePorId ? employeeMap[pedido.entreguePorId]?.user || 'N/A' : 'N/A'}`}><CheckBadgeIcon className="h-4 w-4 text-green-500" /> <span>{formatDate(pedido.dataEntregue)}</span></div>
        </div>
      </div>
    </div>
  );
});



const ListaPedidos: React.FC<ListaPedidosProps> = ({
  pedidos,
  onUpdate,
  selectedOrderIds,
  toggleOrderSelection,
}) => {
  // Mapas de dados de usuários e funcionários
  const [userMap, setUserMap] = useState<{ [key: string]: PessoaProps }>({});
  const [employeeMap, setEmployeeMap] = useState<{ [key: string]: EmployeeProps }>({});
  // const [tooltipPedidoId, setTooltipPedidoId] = useState<string | null>(null);

  // Estados para modais e upload
  const [isUpdatePopupOpen, setIsUpdatePopupOpen] = useState<boolean>(false);
  const [selectedPedidoForUpdate, setSelectedPedidoForUpdate] = useState<OrdersProps | null>(null);
  const [selectedPedidoForImage, setSelectedPedidoForImage] = useState<OrdersProps | null>(null);
  const [orderImageFile, setOrderImageFile] = useState<File | null>(null);
  const [isFinalizing, setIsFinalizing] = useState<boolean>(false);
  const [dataEntregue, setDataEntregue] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  // Estados para edição
  const [editingPedido, setEditingPedido] = useState<OrdersProps | null>(null);
  const [editForm, setEditForm] = useState({ servico: "", situacao: "", descricao: "", data: "" });
  // const [openMenu, setOpenMenu] = useState<string | null>(null);

  // Não usamos estado interno para a lista de pedidos. Utilizamos diretamente a prop "pedidos".

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

  // Agrupa e ordena os pedidos conforme os dados provenientes da prop "pedidos"
  // const sortedAndGroupedPedidos = useMemo(() => {
  //   const grouped = pedidos.reduce<{ [key: string]: OrdersProps[] }>((acc, pedido) => {
  //     const neighborhood = userMap[pedido.userId]?.neighborhood || "Outros";
  //     if (!acc[neighborhood]) acc[neighborhood] = [];
  //     acc[neighborhood].push(pedido);
  //     return acc;
  //   }, {});

  //   return Object.values(grouped).flatMap((group) =>
  //     group.sort((a, b) => {
  //       if (a.situacao === "Aguardando" && b.situacao !== "Aguardando") return -1;
  //       if (a.situacao !== "Aguardando" && b.situacao === "Aguardando") return 1;
  //       return new Date(a.data).getTime() - new Date(b.data).getTime();
  //     })
  //   );
  // }, [pedidos, userMap]);

  // // Função para formatar data
  // const formatDate = (dateString: string | null): string =>
  //   dateString
  //     ? new Date(dateString).toLocaleDateString("pt-BR", { timeZone: "UTC" })
  //     : "---";

  // Abre modal para visualização da imagem
  const openImagePopup = (pedido: OrdersProps) => {
    setSelectedPedidoForImage(pedido);
  };

  // Finaliza o pedido com possível upload de imagem
  const finalizeOrder = async () => {
    if (!selectedPedidoForUpdate) return;
    setIsFinalizing(true);

    let imageUrl: string | null = null;

    if (orderImageFile) {
      const formData = new FormData();
      formData.append("file", orderImageFile);

      try {
        const response = await api.post(`/upload/order`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        imageUrl = response.data.imageUrl;
      } catch (error) {
        console.error("Erro ao enviar imagem:", error);
        alert("Erro ao enviar a imagem. Tente novamente.");
        setIsFinalizing(false);
        return;
      }
    }

    try {
      await api.put(`/orders/${selectedPedidoForUpdate.id}`, {
        situacao: "Finalizado",
        dataEntregue,
        imageUrl,
      });

      // Chamamos onUpdate para que o componente pai atualize sua lista de pedidos
      await onUpdate(selectedPedidoForUpdate.id, "Finalizado", dataEntregue);

      setIsUpdatePopupOpen(false);
      setSelectedPedidoForUpdate(null);
      setOrderImageFile(null);
    } catch (error) {
      console.error("Erro ao atualizar pedido:", error);
      alert("Erro ao atualizar pedido. Tente novamente.");
    }

    setIsFinalizing(false);
  };

  const cancelUpdate = () => {
    setIsUpdatePopupOpen(false);
    setSelectedPedidoForUpdate(null);
    setOrderImageFile(null);
  };

  // // Seleciona ou deseleciona todos os pedidos visíveis
  // const toggleSelectAll = () => {
  //   const visibleIds = sortedAndGroupedPedidos.map((pedido) => pedido.id);
  //   const allSelected = visibleIds.every((id) => selectedOrderIds.includes(id));
  //   if (allSelected) {
  //     visibleIds.forEach((id) => {
  //       if (selectedOrderIds.includes(id)) toggleOrderSelection(id);
  //     });
  //   } else {
  //     visibleIds.forEach((id) => {
  //       if (!selectedOrderIds.includes(id)) toggleOrderSelection(id);
  //     });
  //   }
  // };

  // Inicia a edição do pedido
  const handleEditPedido = (pedido: OrdersProps) => {
    setEditingPedido(pedido);
    setEditForm({
      servico: pedido.servico,
      situacao: pedido.situacao,
      descricao: pedido.descricao,
      data: pedido.data.split("T")[0] || new Date().toISOString().split("T")[0],
    });
    // setOpenMenu(null);
  };

  const handleEditInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const finalizeEdit = async () => {
    if (editingPedido) {
      // Formata a data no padrão pt-BR antes de enviar
      const formattedDate = new Date(editForm.data).toLocaleDateString("pt-BR", {
        timeZone: "UTC",
      });

      const updatedPedido: OrdersProps = {
        ...editingPedido,
        servico: editForm.servico,
        situacao: editForm.situacao,
        descricao: editForm.descricao,
        data: formattedDate, // Usa a data formatada
      };

      try {
        await api.put(`/orders/edit/${editingPedido.id}`, updatedPedido);
        // Aqui também chamamos onUpdate para que o pai atualize os dados com as alterações feitas
        await onUpdate(
          updatedPedido.id,
          updatedPedido.situacao,
          updatedPedido.dataEntregue || undefined
        );
        setEditingPedido(null);
      } catch (error) {
        console.error("Erro ao editar o pedido:", error);
        alert("Erro ao editar o pedido. Tente novamente.");
      }
    }
  };

  const deleteOrder = async (id: string) => {
    if (window.confirm("Tem certeza que deseja deletar este pedido?")) {
      try {
        await api.delete(`/orders/${id}`);
        // Após a deleção, espera-se que o componente pai atualize a prop "pedidos"
        alert("Pedido deletado com sucesso!");
      } catch (error) {
        console.error("Erro ao deletar o pedido:", error);
        alert("Erro ao deletar o pedido. Tente novamente.");
      }
    }
  };

  return (
    <div className="flex flex-col items-center py-4 px-2">
      {/* Modal de atualização com upload */}
      {isUpdatePopupOpen && selectedPedidoForUpdate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white p-6 rounded-lg shadow-md w-80 text-center">
            <UploadFileModal onFileSelected={setOrderImageFile} />
            <div className="mt-4">
              <label className="font-semibold">Data de Entrega:</label>
              <input
                type="date"
                value={dataEntregue}
                onChange={(e) => setDataEntregue(e.target.value)}
                className="border rounded-md p-2 w-full mt-2"
              />
            </div>
            <div className="flex justify-center gap-4 mt-4">
              <button
                className="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded"
                onClick={cancelUpdate}
              >
                Cancelar
              </button>
              <button
                disabled={isFinalizing}
                className={`bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-2 rounded ${isFinalizing ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                onClick={finalizeOrder}
              >
                Finalizar
              </button>
            </div>
          </div>
        </div>
      )}

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
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
          {pedidos.map((pedido) => (
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
            />
          ))}
        </div>
      )}
      {editingPedido && (
  // FUNDO DO MODAL COM EFEITO DE DESFOQUE
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
    
    {/* CARD DO MODAL COM LAYOUT FLEXÍVEL */}
    <div className="bg-slate-50 rounded-xl w-full max-w-md h-auto max-h-[90vh] flex flex-col shadow-2xl">
      
      {/* 1. CABEÇALHO FIXO */}
      <header className="flex-shrink-0 p-4 sm:p-5 border-b border-slate-200 flex justify-between items-center">
        <h2 className="text-lg font-bold text-slate-800">
          Editar Pedido
        </h2>
        <button 
          onClick={() => setEditingPedido(null)} 
          className="p-1.5 rounded-full text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-colors"
          title="Fechar"
        >
          {/* Ícone de "X" para fechar */}
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
            <input type="text" id="servico" name="servico" value={editForm.servico} onChange={handleEditInputChange} className="mt-1 w-full py-1 px-2 border-slate-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"/>
          </div>
          <div>
            <label htmlFor="situacao" className="block text-sm font-medium text-slate-700">Situação</label>
            <input type="text" id="situacao" name="situacao" value={editForm.situacao} onChange={handleEditInputChange} className="mt-1 w-full py-1 px-2 border-slate-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"/>
          </div>
          <div>
            <label htmlFor="descricao" className="block text-sm font-medium text-slate-700">Descrição</label>
            <textarea id="descricao" name="descricao" value={editForm.descricao} onChange={handleEditInputChange} className="mt-1 w-full py-1 px-2 border-slate-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500" rows={3}/>
          </div>
          <div>
            <label htmlFor="data" className="block text-sm font-medium text-slate-700">Data</label>
            <input type="date" id="data" name="data" value={editForm.data} onChange={handleEditInputChange} className="mt-1 w-full py-1 px-2 border-slate-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"/>
          </div>
        </form>
      </main>
      
      {/* 3. RODAPÉ FIXO COM BOTÕES DE AÇÃO */}
      <footer className="flex-shrink-0 p-4 sm:p-5 bg-white border-t border-slate-200 flex justify-end items-center gap-4">
        <button
          className="px-5 py-2 rounded-lg border border-slate-300 bg-white text-slate-800 font-semibold hover:bg-slate-50 transition-colors"
          onClick={() => setEditingPedido(null)}
        >
          Cancelar
        </button>
        <button
          className="px-5 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors disabled:bg-indigo-300"
          onClick={finalizeEdit}
          disabled={isFinalizing} // Assumindo que você tenha um estado de loading
        >
          {isFinalizing ? "Salvando..." : "Salvar Alterações"}
        </button>
      </footer>
      
    </div>
  </div>
)}
    </div>
  );
};

export default ListaPedidos;
