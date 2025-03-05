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
  imageUrl?: string; // URL do anexo, se existir
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
  onUpdate: (id: string, situacao: string) => void;
}

const ListaPedidos: React.FC<ListaPedidosProps> = ({ pedidos, local, onUpdate }) => {
  // Estados para mapeamento de usuários e funcionários
  const [userMap, setUserMap] = useState<{ [key: string]: PessoaProps }>({});
  const [employeeMap, setEmployeeMap] = useState<{ [key: string]: EmployeeProps }>({});
  const [entreguePorMap, setEntreguePorMap] = useState<{ [key: string]: EmployeeProps }>({});

  // Estado para tooltips (opcional)
  const [tooltipPedidoId, setTooltipPedidoId] = useState<string | null>(null);

  // Estados para modais
  // Modal de atualização (status + upload)
  const [isUpdatePopupOpen, setIsUpdatePopupOpen] = useState<boolean>(false);
  // Pedido selecionado para atualização (status e upload)
  const [selectedPedidoForUpdate, setSelectedPedidoForUpdate] = useState<OrdersProps | null>(null);
  // Modal de exibição da imagem (download/fechar)
  const [selectedPedidoForImage, setSelectedPedidoForImage] = useState<OrdersProps | null>(null);

  // Estado para armazenar o arquivo selecionado no upload (para atualização)
  const [orderImageFile, setOrderImageFile] = useState<File | null>(null);
  // Estado para controlar o botão de finalização enquanto o upload está ocorrendo
  const [isFinalizing, setIsFinalizing] = useState<boolean>(false);

  // Buscar dados de usuário, funcionário e entreguePor
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

  // Ordena e agrupa os pedidos (exemplo: por bairro)
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

  // Função para formatar datas
  const formatDate = (dateString: string | null): string =>
    dateString
      ? new Date(dateString).toLocaleDateString("pt-BR", { timeZone: "UTC" })
      : "---";

  // Abre o modal de atualização (status + upload)
  const openUpdatePopup = (pedido: OrdersProps) => {
    setSelectedPedidoForUpdate(pedido);
    setIsUpdatePopupOpen(true);
  };

  // Abre o modal para exibir o anexo (imagem)
  const openImagePopup = (pedido: OrdersProps) => {
    setSelectedPedidoForImage(pedido);
  };

  // Finaliza a atualização (upload de arquivo e mudança de status)
  const finalizeOrder = async () => {
    setIsFinalizing(true);

    // Se houver um arquivo anexado, tenta fazer o upload
    if (orderImageFile) {
      const formData = new FormData();
      formData.append("file", orderImageFile);

      try {
        // Exemplo de endpoint: /upload/order/:id
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

    // Determina a nova situação com base na situação atual
    const newSituacao =
      selectedPedidoForUpdate?.situacao === "Aguardando" ? "Finalizado" : "Aguardando";

    // Atualiza o pedido (status e, possivelmente, a URL do anexo se o backend retornar essa info)
    onUpdate(selectedPedidoForUpdate!.id, newSituacao);

    // Limpa os estados
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

  // Número de pedidos visíveis
  const visibleCount = 12;

  return (
    <div className="flex flex-col items-center py-1 px-2">
      {/* Modal de atualização com upload */}
      {isUpdatePopupOpen && selectedPedidoForUpdate && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            {/* Componente de upload: ao selecionar o arquivo, atualiza o estado orderImageFile */}
            <UploadFileModal onFileSelected={setOrderImageFile} />
            <div className="flex justify-center gap-4 mt-4">
              <button
                className="bg-gradient-to-r from-[#E03335] to-[#812F2C] text-white font-bold px-4 py-2 rounded"
                onClick={cancelUpdate}
              >
                Cancelar
              </button>
              <button
                disabled={isFinalizing}
                className={`bg-gradient-to-r from-[#0E9647] to-[#165C38] text-white font-bold px-4 py-2 rounded ${
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={() => setSelectedPedidoForImage(null)}
        >
          <div
            className="bg-white p-6 rounded shadow-lg flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            {selectedPedidoForImage.imageUrl ? (
              <>
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <div className="bg-white p-4 rounded max-w-lg max-h-[80vh] overflow-auto">
                    <img
                      src={selectedPedidoForImage.imageUrl}
                      alt={`Anexo do pedido de ${selectedPedidoForImage.servico}`}
                      className="max-w-full max-h-[60vh] object-contain"
                    />
                    <div className="flex w-full gap-4 mt-4">
                      <button
                        className="bg-gradient-to-r from-[#E03335] to-[#812F2C] text-white font-bold px-4 py-2 rounded w-1/2"
                        onClick={() => setSelectedPedidoForImage(null)}
                      >
                        Fechar
                      </button>
                      <a
                        href={selectedPedidoForImage.imageUrl}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-gradient-to-r from-[#0E9647] to-[#165C38] text-center text-white font-bold px-4 py-2 rounded w-1/2"
                      >
                        Baixar
                      </a>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <p>Comprovante não disponível</p>
            )}
          </div>
        </div>
      )}

      {pedidos.length === 0 ? (
        <p className="text-center text-gray-600 text-xl my-4">
          Nenhum pedido disponível no momento.
        </p>
      ) : (
        <>
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {/* Colunas: Nome, Localidade, Solicitado, Entregue e Situação */}
                <th className="text-2xl pb-4 text-left px-2 pl-4">Nome</th>
                <th className="text-2xl pb-4 text-left px-2">Localidade</th>
                <th className="text-2xl pb-4">Descrição</th>
                <th className="text-2xl pb-4">Solicitado</th>
                <th className="text-2xl pb-4">Entregue</th>
                <th className="text-2xl pb-4">Situação</th>
              </tr>
            </thead>
            <tbody>
              {sortedAndGroupedPedidos.slice(0, visibleCount).map((pedido) => {
                const user = userMap[pedido.userId];
                return (
                  <tr key={pedido.id} className="relative">
                    <td
                      className="h-7 py-1 px-2 pl-4 text-lg cursor-pointer "
                      onClick={() => openImagePopup(pedido)}
                    >
                      {user ? `${user.name}, ${user.apelido}` : "Carregando..."}
                    </td>
                    <td className="h-7 py-1 px-2 text-lg">
                      {local === "Todos"
                        ? `${user?.neighborhood}, ${user?.referencia}`
                        : user?.referencia || "Carregando..."}
                    </td>
                    <td className="h-7 py-1 px-2 text-lg text-center">
                        {pedido.descricao ? pedido.descricao : "---"}
                    </td>
                    <td
                      className="h-7 py-1 px-2 text-lg text-center relative"
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
                      className="h-7 py-1 px-2 text-lg text-center relative"
                      onMouseEnter={() => setTooltipPedidoId(`entregue-${pedido.id}`)}
                      onMouseLeave={() => setTooltipPedidoId(null)}
                    >
                      {formatDate(pedido.dataEntregue)}
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
                    <td className="h-7 flex justify-center">
                      <button
                        onClick={() => openUpdatePopup(pedido)}
                        disabled={pedido.situacao === "Finalizado"}
                        className={`flex justify-center items-center border w-36 rounded-lg h-8 text-base text-white font-semibold ${
                          pedido.situacao === "Aguardando"
                            ? "bg-gradient-to-r from-[#E03335] to-[#812F2C]"
                            : "bg-gradient-to-r from-[#0E9647] to-[#165C38]"
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
        </>
      )}
    </div>
  );
};

export default ListaPedidos;
