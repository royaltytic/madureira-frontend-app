import { useState, useEffect, useMemo } from "react";
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
  imageUrl?: string; // URL da imagem, se existir
}

interface EmployeeProps {
  id: string;
  user: string;
}

interface UltimosPedidosProps {
  pedidos: PedidoProps[];
  onUpdate: (id: string, situacao: string, dataEntregue?: string) => void;
}

const UltimosPedidos: React.FC<UltimosPedidosProps> = ({ pedidos, onUpdate }) => {
  const [employeeMap, setEmployeeMap] = useState<{ [key: string]: EmployeeProps }>({});
  const [entreguePorMap, setEntreguePorMap] = useState<{ [key: string]: EmployeeProps }>({});
  const [tooltipPedidoId, setTooltipPedidoId] = useState<string | null>(null);
  const [confirmData, setConfirmData] = useState<{ id: string; newSituacao: string } | null>(null);
  const [orderImageFile, setOrderImageFile] = useState<File | null>(null);
  const [selectedPedido, setSelectedPedido] = useState<PedidoProps | null>(null);
  const [isFinalizing, setIsFinalizing] = useState<boolean>(false);
  const [dataEntregue, setDataEntregue] = useState<string>(new Date().toISOString().split("T")[0]);

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

  const sortedPedidos = useMemo(() => {
    return [...pedidos].sort((a, b) => {
      if (a.situacao === "Aguardando" && b.situacao !== "Aguardando") return -1;
      if (a.situacao !== "Aguardando" && b.situacao === "Aguardando") return 1;

      const dateA = new Date(a.data);
      const dateB = new Date(b.data);
      return dateA.getTime() - dateB.getTime();
    });
  }, [pedidos]);

  const formatDate = (dateString: string): string => {
    const dateObject = new Date(dateString);
    const day = dateObject.getDate().toString().padStart(2, "0");
    const month = (dateObject.getMonth() + 1).toString().padStart(2, "0");
    const year = dateObject.getFullYear();
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

    if (orderImageFile) {
      const formData = new FormData();
      formData.append("file", orderImageFile);

      try {
        await api.post(`/upload/order/${confirmData?.id}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
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
  };

  const cancelChange = () => {
    setConfirmData(null);
    setOrderImageFile(null);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="w-full h-[calc(100vh-150px)] overflow-y-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="p-2 px-4 text-left">
                <h2 className="text-2xl">Últimos Pedidos</h2>
              </th>
              <th className="p-2 px-4 text-center">
                <h2 className="text-2xl">Descrição</h2>
              </th>
              <th className="p-2 px-4 text-center">
                <h2 className="text-2xl">Solicitado</h2>
              </th>
              <th className="p-2 px-4 text-center">
                <h2 className="text-2xl">Entregue</h2>
              </th>
              <th className="p-2">
                <h2 className="text-2xl">Situação</h2>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedPedidos.map((pedido) => (
              <tr key={pedido.id}>
                <td
                  className="h-7 py-1 px-4 text-lg cursor-pointer"
                  onClick={() => setSelectedPedido(pedido)}
                >
                  Pedido de {pedido.servico}
                </td>
                <td className="h-7 py-1 px-2 text-lg text-center relative">
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
                <td className="h-7 flex justify-center text-white font-semibold">
                  <button
                    onClick={() =>
                      handleConfirm(
                        pedido.id,
                        pedido.situacao === "Aguardando" ? "Finalizado" : "Aguardando"
                      )
                    }
                    disabled={pedido.situacao === "Finalizado"}
                    className={`flex justify-center items-center border w-36 rounded-lg h-8 text-base ${pedido.situacao === "Aguardando"
                      ? "bg-gradient-to-r from-[#E03335] to-[#812F2C]"
                      : "bg-gradient-to-r from-[#0E9647] to-[#165C38]"
                      } ${pedido.situacao === "Finalizado" ? "cursor-not-allowed" : ""}`}
                  >
                    {pedido.situacao}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {confirmData && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg">
            <div className="flex gap-4 items-center  w-full mb-3">
            <label className="font-semibold">Data de Entrega:</label>
              <input
                type="date"
                value={dataEntregue}
                onChange={(e) => setDataEntregue(e.target.value)}
                className="border rounded-md p-0.5"
              />
            </div>
            <UploadFileModal onFileSelected={setOrderImageFile} />
            <div className="mt-4 flex flex-col gap-4 items-center justify-center w-full">
              
              <div className="flex gap-4 items-center justify-center w-full mt-4">
                <button
                  className="bg-gradient-to-r from-[#E03335] to-[#812F2C] w-1/2 text-white font-bold py-2 rounded-lg"
                  onClick={cancelChange}
                >
                  Cancelar
                </button>
                <button
                  disabled={isFinalizing}
                  className={`bg-gradient-to-r from-[#0E9647] to-[#165C38] w-1/2 text-white font-bold py-2 rounded-lg ${isFinalizing ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  onClick={finalizeOrder}
                >
                  Finalizar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedPedido && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
          onClick={() => setSelectedPedido(null)}
        >
          <div
            className="bg-white p-6 rounded shadow-lg flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            {selectedPedido.imageUrl ? (
              <>
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <div className="bg-white p-4 rounded max-w-lg max-h-[80vh] overflow-auto">
                    <h1 className="text-xl mb-4">Comprovante do pedido <b>{selectedPedido.servico}</b></h1>
                    <img
                      src={selectedPedido.imageUrl}
                      alt={`Anexo do pedido de ${selectedPedido.servico}`}
                      className="max-w-full max-h-[60vh] object-contain"
                    />
                    <div className="flex w-full gap-4 mt-4">
                      <button
                        className="bg-gradient-to-r from-[#E03335] to-[#812F2C] text-white text-center font-bold px-4 py-2 rounded w-1/2"
                        onClick={() => setSelectedPedido(null)}
                      >
                        Fechar
                      </button>
                      <a
                        href={selectedPedido.imageUrl}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-gradient-to-r from-[#0E9647] to-[#165C38] text-white text-center font-bold px-4 py-2 rounded w-1/2"
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
    </div>
  );
};

export default UltimosPedidos;
