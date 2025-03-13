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
  onUpdate: (id: string, situacao: string) => Promise<void>;
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
  isSelectionMode,
}) => {
  const [userMap, setUserMap] = useState<{ [key: string]: PessoaProps }>({});
  const [employeeMap, setEmployeeMap] = useState<{ [key: string]: EmployeeProps }>({});
  const [entreguePorMap, setEntreguePorMap] = useState<{ [key: string]: EmployeeProps }>({});
  const [tooltipPedidoId, setTooltipPedidoId] = useState<string | null>(null);

  // Estados para modais
  const [isUpdatePopupOpen, setIsUpdatePopupOpen] = useState<boolean>(false);
  const [selectedPedidoForUpdate, setSelectedPedidoForUpdate] = useState<OrdersProps | null>(null);
  const [selectedPedidoForImage, setSelectedPedidoForImage] = useState<OrdersProps | null>(null);

  const [orderImageFile, setOrderImageFile] = useState<File | null>(null);
  const [isFinalizing, setIsFinalizing] = useState<boolean>(false);

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

  const formatDate = (dateString: string | null): string =>
    dateString
      ? new Date(dateString).toLocaleDateString("pt-BR", { timeZone: "UTC" })
      : "---";

  const openUpdatePopup = (pedido: OrdersProps) => {
    setSelectedPedidoForUpdate(pedido);
    setIsUpdatePopupOpen(true);
  };

  const openImagePopup = (pedido: OrdersProps) => {
    setSelectedPedidoForImage(pedido);
  };

  const finalizeOrder = async () => {
    setIsFinalizing(true);

    if (orderImageFile) {
      const formData = new FormData();
      formData.append("file", orderImageFile);

      try {
        await api.post(`/upload/order/${selectedPedidoForUpdate?.id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } catch (error) {
        console.error("Erro ao enviar imagem:", error);
        alert("Erro ao enviar a imagem. Tente novamente.");
        setIsFinalizing(false);
        return;
      }
    }

    const newSituacao =
      selectedPedidoForUpdate?.situacao === "Aguardando" ? "Finalizado" : "Aguardando";

    onUpdate(selectedPedidoForUpdate!.id, newSituacao);

    setIsUpdatePopupOpen(false);
    setSelectedPedidoForUpdate(null);
    setOrderImageFile(null);
    setIsFinalizing(false);
  };

  const cancelUpdate = () => {
    setIsUpdatePopupOpen(false);
    setSelectedPedidoForUpdate(null);
    setOrderImageFile(null);
  };

  const visibleCount = 12;

  return (
    <div className="flex flex-col items-center py-4 px-2">
      {/* Modal de atualização com upload */}
      {isUpdatePopupOpen && selectedPedidoForUpdate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white p-6 rounded-lg shadow-md w-80 text-center">
            <UploadFileModal onFileSelected={setOrderImageFile} />
            <div className="flex justify-center gap-4 mt-4">
              <button
                className="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded"
                onClick={cancelUpdate}
              >
                Cancelar
              </button>
              <button
                disabled={isFinalizing}
                className={`bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-2 rounded ${
                  isFinalizing ? "opacity-50 cursor-not-allowed" : ""
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
                    className="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded w-1/2"
                    onClick={() => setSelectedPedidoForImage(null)}
                  >
                    Fechar
                  </button>
                  <a
                    href={selectedPedidoForImage.imageUrl}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-green-500 hover:bg-green-600 text-center text-white font-semibold px-4 py-2 rounded w-1/2"
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
        <p className="text-center text-gray-600 text-xl my-4">
          Nenhum pedido disponível no momento.
        </p>
      ) : (
        <div className="w-full overflow-x-auto rounded-lg">
          <table className="min-w-full border border-gray-200 rounded-lg">
            <thead className="bg-gray-200">
              <tr>
                {isSelectionMode && <th className="px-4 py-2 border">Selecionar</th>}
                <th className="px-4 py-2 border">Nome</th>
                <th className="px-4 py-2 border">Localidade</th>
                <th className="px-4 py-2 border">Descrição</th>
                <th className="px-4 py-2 border">Solicitado</th>
                <th className="px-4 py-2 border">Entregue</th>
                <th className="px-4 py-2 border">Situação</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedAndGroupedPedidos.slice(0, visibleCount).map((pedido) => {
                const user = userMap[pedido.userId];
                return (
                  <tr key={pedido.id} className="hover:bg-gray-50">
                    {isSelectionMode && (
                      <td className="px-4 py-2 border text-center">
                        <input
                          type="checkbox"
                          className="form-checkbox h-5 w-5 text-blue-500"
                          checked={selectedOrderIds.includes(pedido.id)}
                          onChange={() => toggleOrderSelection(pedido.id)}
                        />
                      </td>
                    )}
                    <td className="px-4 py-2 border text-lg cursor-pointer" onClick={() => openImagePopup(pedido)}>
                      {user ? `${user.name}, ${user.apelido}` : "Carregando..."}
                    </td>
                    <td className="px-4 py-2 border text-lg">
                      {local === "Todos"
                        ? `${user?.neighborhood}, ${user?.referencia}`
                        : user?.referencia || "Carregando..."}
                    </td>
                    <td className="px-4 py-2 border text-lg text-center">
                      {pedido.descricao ? pedido.descricao : "---"}
                    </td>
                    <td
                      className="px-4 py-2 border text-lg text-center relative"
                      onMouseEnter={() => setTooltipPedidoId(`solicitado-${pedido.id}`)}
                      onMouseLeave={() => setTooltipPedidoId(null)}
                    >
                      {formatDate(pedido.data)}
                      {tooltipPedidoId === `solicitado-${pedido.id}` && (
                        <div className="absolute top-full left-0 mt-1 p-1 bg-gray-800 text-white text-xs rounded shadow">
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
                      className="px-4 py-2 border text-lg text-center relative"
                      onMouseEnter={() => setTooltipPedidoId(`entregue-${pedido.id}`)}
                      onMouseLeave={() => setTooltipPedidoId(null)}
                    >
                      {formatDate(pedido.dataEntregue)}
                      {tooltipPedidoId === `entregue-${pedido.id}` && (
                        <div className="absolute top-full left-0 mt-1 p-1 bg-gray-800 text-white text-xs rounded shadow">
                          <p>
                            Entregue:{" "}
                            {pedido.entreguePorId
                              ? entreguePorMap[pedido.entreguePorId]?.user || "Não informado"
                              : "Aguardando entrega"}
                          </p>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-2 border text-center">
                      <button
                        onClick={() => openUpdatePopup(pedido)}
                        disabled={pedido.situacao === "Finalizado"}
                        className={`px-4 py-1 w-40 rounded text-white font-semibold transition-colors ${
                          pedido.situacao === "Aguardando"
                            ? "bg-gradient-to-r from-[#E03335] to-[#812F2C] hover:bg-red-600"
                            : "bg-gradient-to-r from-[#0E9647] to-[#165C38] hover:bg-green-600"
                        } ${pedido.situacao === "Finalizado" ? "cursor-not-allowed" : ""}`}
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
