import { useState, useEffect, useMemo, ChangeEvent } from "react";
import api from "../../services/api";
import { UploadFileModal } from "../../pages/telaHome/UploadFileModal";

interface PedidoProps {
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

interface EmployeeProps {
  id: string;
  user: string;
}

interface UltimosPedidosProps {
  pedidos: PedidoProps[];
  onUpdate: (id: string, situacao: string, dataEntregue?: string) => void;
  onEdit: (pedido: PedidoProps) => void;
}

// Adicione esta função antes do seu componente
const getStatusClass = (situacao: string): string => {
  const baseClasses = "px-3 py-1 text-xs font-bold rounded-full inline-flex items-center gap-1.5";

  if (situacao.startsWith("Lista")) {
    return `${baseClasses} bg-blue-100 text-blue-800`; // Azul
  }
  switch (situacao) {
    case "Aguardando":
      return `${baseClasses} bg-red-100 text-red-800`; // Vermelho
    case "Finalizado":
      return `${baseClasses} bg-green-100 text-green-800`; // Verde
    case "Cancelado":
      return `${baseClasses} bg-orange-100 text-orange-800`; // Laranja
    default:
      return `${baseClasses} bg-gray-100 text-gray-800`; // Padrão
  }
};

const UltimosPedidos: React.FC<UltimosPedidosProps> = ({ pedidos, onUpdate, onEdit }) => {
  const [employeeMap, setEmployeeMap] = useState<{ [key: string]: EmployeeProps }>({});
  // const [tooltipPedidoId, setTooltipPedidoId] = useState<string | null>(null);
  const [confirmData, setConfirmData] = useState<{ id: string; newSituacao: string } | null>(null);
  const [orderImageFile, setOrderImageFile] = useState<File | null>(null);
  const [selectedPedido, setSelectedPedido] = useState<PedidoProps | null>(null);
  const [isFinalizing, setIsFinalizing] = useState<boolean>(false);
  const [dataEntregue, setDataEntregue] = useState<string>(new Date().toISOString().split("T")[0]);
  const [editingPedido, setEditingPedido] = useState<PedidoProps | null>(null);
  const [editForm, setEditForm] = useState({ servico: "", situacao: "", descricao: "", data: "" });
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [isEditingDeliveryDate, setIsEditingDeliveryDate] = useState<boolean>(false);

  // Novo estado para o filtro
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

  // const handleConfirm = (id: string, newSituacao: string) => {
  //   setConfirmData({ id, newSituacao });
  // };

  const finalizeOrder = async () => {
    setIsFinalizing(true);

    // Se não estivermos editando apenas a data de entrega, realiza o upload da imagem
    if (!isEditingDeliveryDate && orderImageFile) {
      const formData = new FormData();
      formData.append("file", orderImageFile);

      try {
        await api.post(`/upload/order/${confirmData?.id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } catch (error) {
        console.error("Erro ao enviar imagem:", error);
        alert("Erro ao enviar a imagem. Tente novamente.");
        setIsFinalizing(false);
        return;
      }
    }
    onUpdate(confirmData!.id, confirmData!.newSituacao, dataEntregue);
    setConfirmData(null);
    setOrderImageFile(null);
    setIsFinalizing(false);
    setIsEditingDeliveryDate(false);
  };

  const deleteOrder = async (id: string) => {
    if (window.confirm("Tem certeza que deseja deletar este pedido?")) {
      try {
        await api.delete(`/orders/${id}`);
        alert("Pedido deletado com sucesso!");
      } catch (error) {
        console.error("Erro ao deletar o pedido:", error);
        alert("Erro ao deletar o pedido. Tente novamente.");
      }
    }
  };

  const cancelChange = () => {
    setConfirmData(null);
    setOrderImageFile(null);
    setIsEditingDeliveryDate(false);
  };

  const handleEditPedido = (pedido: PedidoProps) => {
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

  const handleEditInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const finalizeEdit = async () => {
    if (editingPedido) {
      // Converte a data para o formato yyyy-MM-dd antes de enviar
      const formattedDate = editForm.data;

      const updatedPedido: PedidoProps = {
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
                  <p title={`Entregue por: ${pedido.entreguePorId ? employeeMap[pedido.entreguePorId]?.user : 'N/A'}`}>
                    Entregue em: <span className="font-medium text-slate-700">{formatDataEntregue(pedido.dataEntregue)}</span>
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
                      <div className="absolute right-0 mt-2 w-32 bg-white border rounded-md shadow-lg z-50">
                        <button onClick={() => handleEditPedido(pedido)} className="w-full text-left px-4 py-2 hover:bg-slate-100 text-sm">Editar</button>
                        <button onClick={() => deleteOrder(pedido.id)} className="w-full text-left px-4 py-2 hover:bg-slate-100 text-sm">Deletar</button>
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

      {/* Modal de Finalização / Edição da Data de Entrega */}
      {confirmData && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h2 className="text-xl font-semibold mb-4">
              {isEditingDeliveryDate ? "Editar Data de Entrega" : "Finalizar Pedido"}
            </h2>
            <div className="flex gap-4 items-center mb-3">
              <label className="font-semibold">Data de Entrega:</label>
              <input
                type="date"
                value={dataEntregue}
                onChange={(e) => setDataEntregue(e.target.value)}
                className="border rounded-md p-1"
              />
            </div>
            {!isEditingDeliveryDate && <UploadFileModal onFileSelected={setOrderImageFile} />}
            <div className="mt-4 flex gap-4">
              <button
                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 rounded-lg w-1/2"
                onClick={cancelChange}
              >
                Cancelar
              </button>
              <button
                disabled={isFinalizing}
                className={`bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-lg w-1/2 ${
                  isFinalizing ? "opacity-50 cursor-not-allowed" : ""
                }`}
                onClick={finalizeOrder}
              >
                {isEditingDeliveryDate ? "Salvar" : "Finalizar"}
              </button>
            </div>
          </div>
        </div>
      )}

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

export default UltimosPedidos;
