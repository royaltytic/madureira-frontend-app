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

const UltimosPedidos: React.FC<UltimosPedidosProps> = ({ pedidos, onUpdate, onEdit }) => {
  const [employeeMap, setEmployeeMap] = useState<{ [key: string]: EmployeeProps }>({});
  const [entreguePorMap, setEntreguePorMap] = useState<{ [key: string]: EmployeeProps }>({});
  const [tooltipPedidoId, setTooltipPedidoId] = useState<string | null>(null);
  const [confirmData, setConfirmData] = useState<{ id: string; newSituacao: string } | null>(null);
  const [orderImageFile, setOrderImageFile] = useState<File | null>(null);
  const [selectedPedido, setSelectedPedido] = useState<PedidoProps | null>(null);
  const [isFinalizing, setIsFinalizing] = useState<boolean>(false);
  const [dataEntregue, setDataEntregue] = useState<string>(new Date().toISOString().split("T")[0]);
  const [editingPedido, setEditingPedido] = useState<PedidoProps | null>(null);
  const [editForm, setEditForm] = useState({ servico: "", descricao: "", data: "" });
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [isEditingDeliveryDate, setIsEditingDeliveryDate] = useState<boolean>(false);

  // Novo estado para o filtro
  const [filterText, setFilterText] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      const employeeMapTemp: { [key: string]: EmployeeProps } = {};
      const entreguePorMapTemp: { [key: string]: EmployeeProps } = {};

      await Promise.all(
        pedidos.map(async (pedido) => {
          try {
            if (pedido.employeeId && !employeeMapTemp[pedido.employeeId]) {
              const employeeResponse = await api.get(`/employee/${pedido.employeeId}`);
              employeeMapTemp[pedido.employeeId] = employeeResponse.data;
            }
            if (pedido.entreguePorId && !entreguePorMapTemp[pedido.entreguePorId]) {
              const entreguePorResponse = await api.get(`/employee/${pedido.entreguePorId}`);
              entreguePorMapTemp[pedido.entreguePorId] = entreguePorResponse.data;
            }
          } catch (error) {
            console.error("Erro ao buscar dados:", error);
          }
        })
      );
      setEmployeeMap(employeeMapTemp);
      setEntreguePorMap(entreguePorMapTemp);
    };

    fetchData();
  }, [pedidos]);

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

  const handleConfirm = (id: string, newSituacao: string) => {
    setConfirmData({ id, newSituacao });
  };

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
    <div className="flex flex-col items-center">
      {/* Campo de filtro */}


      <div className="w-full h-[calc(100vh-150px)] overflow-y-auto shadow-md px-4">
        <table className="w-full border-collapse">
          <thead>
            <tr className="">
              <th className="pl-2 text-left flex items-center">
                <h2 className="text-2xl font-semibold">Últimos Pedidos</h2>      
                <div className="max-w-2xl my-1 ml-3 flex justify-end">
        <input
          type="text"
          placeholder="Filtre por serviço/descrição"
          value={filterText}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setFilterText(e.target.value)}
          className="border rounded-md p-2 text-sm w-full"
        />
      </div>
              </th>
              <th className="px-4 text-center">
                <h2 className="text-2xl font-semibold">Descrição</h2>
              </th>
              <th className="px-4 text-center">
                <h2 className="text-2xl font-semibold">Solicitado</h2>
              </th>
              <th className="px-4 text-center">
                <h2 className="text-2xl font-semibold">Entregue</h2>
              </th>
              <th className="">
                <h2 className="text-2xl font-semibold">Ações</h2>
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredPedidos.map((pedido) => (
              <tr key={pedido.id} className="border-b hover:bg-gray-50">
                <td
                  className="py-2 px-4 text-lg cursor-pointer text-blue-600 hover:underline"
                  onClick={() => setSelectedPedido(pedido)}
                >
                  Pedido de {pedido.servico}
                </td>
                <td className="py-2 px-2 text-lg text-center">{pedido.descricao || "---"}</td>
                <td
                  className="py-2 px-2 text-lg text-center relative cursor-default"
                  onMouseEnter={() => setTooltipPedidoId(`solicitado-${pedido.id}`)}
                  onMouseLeave={() => setTooltipPedidoId(null)}
                >
                  {formatDate(pedido.data)}
                  {tooltipPedidoId === `solicitado-${pedido.id}` && (
                    <div className="absolute top-0 left-0 mt-8 p-1 bg-gray-800 text-white text-xs rounded shadow-lg z-50">
                      <p>
                        Solicitado:{" "}
                        {pedido.employeeId
                          ? employeeMap[pedido.employeeId]?.user || "Não informado"
                          : "Não informado"}
                      </p>
                    </div>
                  )}
                </td>
                <td
                  className="py-2 px-2 text-lg text-center relative cursor-default"
                  onMouseEnter={() => setTooltipPedidoId(`entregue-${pedido.id}`)}
                  onMouseLeave={() => setTooltipPedidoId(null)}
                >
                  {formatDataEntregue(pedido.dataEntregue)}
                  {tooltipPedidoId === `entregue-${pedido.id}` && (
                    <div className="absolute top-0 left-0 mt-8 p-1 bg-gray-800 text-white text-xs rounded shadow-lg z-50">
                      <p>
                        Entregue:{" "}
                        {pedido.entreguePorId
                          ? entreguePorMap[pedido.entreguePorId]?.user || "Não informado"
                          : "Aguardando entrega"}
                      </p>
                    </div>
                  )}
                </td>
                <td className="py-2 flex gap-2 justify-center items-center relative">
                  <button
                    onClick={() => {
                      if (pedido.situacao === "Aguardando") {
                        handleConfirm(pedido.id, "Finalizado");
                        setIsEditingDeliveryDate(false);
                      } else {
                        // Pedido já finalizado: permite editar a data de entrega
                        setConfirmData({ id: pedido.id, newSituacao: "Finalizado" });
                        setIsEditingDeliveryDate(true);
                      }
                    }}
                    className={`border rounded-lg h-8 w-32 text-base font-medium text-white ${
                      pedido.situacao === "Aguardando"
                        ? "bg-gradient-to-r from-red-500 to-red-700"
                        : "bg-gradient-to-r from-green-500 to-green-700"
                    }`}
                  >
                    {pedido.situacao}
                  </button>

                  <button
                    onClick={() => setOpenMenu(openMenu === pedido.id ? null : pedido.id)}
                    className="p-2 rounded-full hover:bg-gray-200 focus:outline-none"
                  >
                    <span className="text-2xl">&#8942;</span>
                  </button>

                  {openMenu === pedido.id && (
                    <div className="absolute right-0 mt-10 w-32 bg-white border rounded shadow-lg z-50">
                      <button
                        onClick={() => handleEditPedido(pedido)}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => {
                          deleteOrder(pedido.id);
                          setOpenMenu(null);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100"
                      >
                        Deletar
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h2 className="text-xl font-semibold mb-4">Editar Pedido</h2>
            <div className="mb-4">
              <label className="block font-medium">Serviço:</label>
              <input
                type="text"
                name="servico"
                value={editForm.servico}
                onChange={handleEditInputChange}
                className="w-full border rounded-md p-2 mt-1"
              />
            </div>
            <div className="mb-4">
              <label className="block font-medium">Descrição:</label>
              <textarea
                name="descricao"
                value={editForm.descricao}
                onChange={handleEditInputChange}
                className="w-full border rounded-md p-2 mt-1"
                rows={3}
              />
            </div>
            <div className="mb-4">
              <label className="block font-medium">Data:</label>
              <input
                type="date"
                name="data"
                value={editForm.data}
                onChange={handleEditInputChange}
                className="w-full border rounded-md p-2 mt-1"
              />
            </div>
            <div className="flex gap-4">
              <button
                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 rounded-lg w-1/2"
                onClick={() => setEditingPedido(null)}
              >
                Cancelar
              </button>
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 rounded-lg w-1/2"
                onClick={finalizeEdit}
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UltimosPedidos;
