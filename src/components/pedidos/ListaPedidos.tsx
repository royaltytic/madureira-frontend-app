import { useState, useMemo, useEffect } from "react";
import api from "../../services/api";
import React from "react";
import { UploadFileModal } from "../../pages/telaHome/UploadFileModal";

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

const ListaPedidos: React.FC<ListaPedidosProps> = ({
  pedidos,
  local,
  onUpdate,
  selectedOrderIds,
  toggleOrderSelection,
}) => {
  // Mapeamentos para armazenar dados de usuários e funcionários
  const [userMap, setUserMap] = useState<{ [key: string]: PessoaProps }>({});
  const [employeeMap, setEmployeeMap] = useState<{ [key: string]: EmployeeProps }>({});
  const [entreguePorMap, setEntreguePorMap] = useState<{ [key: string]: EmployeeProps }>({});
  const [tooltipPedidoId, setTooltipPedidoId] = useState<string | null>(null);

  // Estados para modais (atualização e visualização de imagem)
  const [isUpdatePopupOpen, setIsUpdatePopupOpen] = useState<boolean>(false);
  const [selectedPedidoForUpdate, setSelectedPedidoForUpdate] = useState<OrdersProps | null>(null);
  const [selectedPedidoForImage, setSelectedPedidoForImage] = useState<OrdersProps | null>(null);

  // Estado para upload e finalização
  const [orderImageFile, setOrderImageFile] = useState<File | null>(null);
  const [isFinalizing, setIsFinalizing] = useState<boolean>(false);
  const [dataEntregue, setDataEntregue] = useState<string>(new Date().toISOString().split("T")[0]);

  // Busca os dados de usuários e funcionários para cada pedido
  useEffect(() => {
    const fetchData = async () => {
      const userMapTemp: { [key: string]: PessoaProps } = {};
      const employeeMapTemp: { [key: string]: EmployeeProps } = {};
      const entreguePorMapTemp: { [key: string]: EmployeeProps } = {};

      await Promise.all(
        pedidos.map(async (pedido) => {
          try {
            if (pedido.userId && !userMapTemp[pedido.userId]) {
              const userResponse = await api.get(`/users/${pedido.userId}`);
              userMapTemp[pedido.userId] = userResponse.data;
            }
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

      setUserMap(userMapTemp);
      setEmployeeMap(employeeMapTemp);
      setEntreguePorMap(entreguePorMapTemp);
    };

    fetchData();
  }, [pedidos]);

  // Agrupa os pedidos por localidade e ordena-os pela data
  const sortedAndGroupedPedidos = useMemo(() => {
    const grouped = pedidos.reduce<{ [key: string]: OrdersProps[] }>((acc, pedido) => {
      const neighborhood = userMap[pedido.userId]?.neighborhood || "Outros";
      if (!acc[neighborhood]) acc[neighborhood] = [];
      acc[neighborhood].push(pedido);
      return acc;
    }, {});

    return Object.values(grouped).flatMap((group) =>
      group.sort((a, b) => {
        if (a.situacao === "Aguardando" && b.situacao !== "Aguardando") return -1;
        if (a.situacao !== "Aguardando" && b.situacao === "Aguardando") return 1;
        return new Date(a.data).getTime() - new Date(b.data).getTime();
      })
    );
  }, [pedidos, userMap]);

  // Formata a data para o padrão dd/mm/yyyy
  const formatDate = (dateString: string | null): string =>
    dateString
      ? new Date(dateString).toLocaleDateString("pt-BR", { timeZone: "UTC" })
      : "---";

  // Abre o modal de visualização da imagem
  const openImagePopup = (pedido: OrdersProps) => {
    setSelectedPedidoForImage(pedido);
  };

  // Finaliza o pedido após upload (se houver)
  const finalizeOrder = async () => {
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

    console.log()

    try {
      await api.put(`/orders/${selectedPedidoForUpdate?.id}`, {
        situacao: "Finalizado",
        dataEntregue,
        imageUrl,
      });

      onUpdate(selectedPedidoForUpdate!.id, "Finalizado", dataEntregue);

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

  // Função para "select all" nos pedidos visíveis
  const toggleSelectAll = () => {
    const visibleIds = sortedAndGroupedPedidos.map((pedido) => pedido.id);
    const allSelected = visibleIds.every((id) => selectedOrderIds.includes(id));
    if (allSelected) {
      visibleIds.forEach((id) => {
        if (selectedOrderIds.includes(id)) toggleOrderSelection(id);
      });
    } else {
      visibleIds.forEach((id) => {
        if (!selectedOrderIds.includes(id)) toggleOrderSelection(id);
      });
    }
  };

  const visibleCount = 120;

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
              <button className="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded" onClick={cancelUpdate}>
                Cancelar
              </button>
              <button
                disabled={isFinalizing}
                className={`bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-2 rounded ${isFinalizing ? "opacity-50 cursor-not-allowed" : ""}`}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40" onClick={() => setSelectedPedidoForImage(null)}>
          <div className="bg-white p-6 rounded shadow-md max-w-lg max-h-[80vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            {selectedPedidoForImage.imageUrl ? (
              <>
                <img
                  src={selectedPedidoForImage.imageUrl}
                  alt={`Anexo do pedido de ${selectedPedidoForImage.servico}`}
                  className="max-w-full max-h-[60vh] object-contain mb-4"
                />
                <div className="flex gap-4">
                  <button className="bg-gradient-to-r from-[#E03335] to-[#812F2C] hover:bg-red-600 text-white font-semibold px-4 py-2 rounded w-1/2" onClick={() => setSelectedPedidoForImage(null)}>
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
        <p className="text-center text-gray-600 text-xl my-4">Nenhum pedido disponível no momento.</p>
      ) : (<div className="w-full rounded-lg shadow border border-gray-200">
      <table className="w-full table-auto">
        <thead className="bg-gray-100 sticky top-0 z-10">
          <tr>
            <th className="px-4 py-2 text-center">
              <input
                type="checkbox"
                className="form-checkbox h-5 w-5 text-blue-500 cursor-pointer"
                checked={
                  sortedAndGroupedPedidos.every((pedido) =>
                    selectedOrderIds.includes(pedido.id)
                  )
                }
                onChange={toggleSelectAll}
              />
            </th>
            <th className="px-4 py-2">Nome</th>
            <th className="px-4 py-2">Localidade</th>
            <th className="px-4 py-2">Descrição</th>
            <th className="px-4 py-2">Solicitado</th>
            <th className="px-4 py-2">Entregue</th>
            <th className="px-4 py-2">Situação</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedAndGroupedPedidos.slice(0, visibleCount).map((pedido) => {
            const user = userMap[pedido.userId];
            return (
              <tr key={pedido.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 text-center">
                  <input
                    type="checkbox"
                    className="form-checkbox h-5 w-5 text-blue-500 cursor-pointer"
                    checked={selectedOrderIds.includes(pedido.id)}
                    onChange={() => toggleOrderSelection(pedido.id)}
                  />
                </td>
                <td
                  className="px-4 py-2 text-lg cursor-pointer"
                  onClick={() => openImagePopup(pedido)}
                >
                  {user ? `${user.name}, ${user.apelido}` : "Carregando..."}
                </td>
                <td className="px-4 py-2 text-lg">
                  {local === "Todos"
                    ? `${user?.neighborhood}, ${user?.referencia}`
                    : user?.referencia || "Carregando..."}
                </td>
                <td className="px-4 py-2 text-lg text-center">
                  {pedido.descricao || "---"}
                </td>
                <td
                  className="px-4 py-2 text-lg text-center relative"
                  onMouseEnter={() => setTooltipPedidoId(`solicitado-${pedido.id}`)}
                  onMouseLeave={() => setTooltipPedidoId(null)}
                >
                  {formatDate(pedido.data)}
                  {tooltipPedidoId === `solicitado-${pedido.id}` && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 bg-gray-800 text-white text-xs rounded shadow-lg z-50">
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
                  className="px-4 py-2 text-lg text-center relative"
                  onMouseEnter={() => setTooltipPedidoId(`entregue-${pedido.id}`)}
                  onMouseLeave={() => setTooltipPedidoId(null)}
                >
                  {formatDate(pedido.dataEntregue)}
                  {tooltipPedidoId === `entregue-${pedido.id}` && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 bg-gray-800 text-white text-xs rounded shadow-lg z-50">
                      <p>
                        Entregue:{" "}
                        {pedido.entreguePorId
                          ? entreguePorMap[pedido.entreguePorId]?.user || "Não informado"
                          : "Aguardando entrega"}
                      </p>
                    </div>
                  )}
                </td>
                <td className="px-4 py-2 text-center">
                  <button
                    disabled={pedido.situacao === "Finalizado"}
                    className={`px-4 py-1 w-40 rounded text-white font-semibold transition-colors ${
                      pedido.situacao === "Aguardando"
                        ? "bg-gradient-to-r from-[#E03335] to-[#812F2C] hover:from-red-600 hover:to-red-700"
                        : "bg-gradient-to-r from-[#0E9647] to-[#165C38] hover:from-green-600 hover:to-green-700"
                    } ${pedido.situacao === "Finalizado" ? "cursor-default" : "cursor-default"}`}
                  >
                    {pedido.situacao}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
    
      )}
    </div>
  );
};

export default ListaPedidos;
