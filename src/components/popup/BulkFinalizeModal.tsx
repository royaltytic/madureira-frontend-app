import React, { useState, useEffect } from "react";
import { OrdersProps, UserProps, PessoaProps, DeliveryProps } from "../../types/types";
import api from "../../services/api";
import { UploadFileModal } from "../../pages/telaHome/UploadFileModal";
import { GerenciadorEntregadores } from "../modal/GerenciadorEntregadores";
import Alert from "../alerts/alertDesktop";
import { useAuth } from "../../context/AuthContext";

type ActionType = "Finalizar" | "Inserir na Lista" | "Cancelar";

interface BulkFinalizeModalProps {
  selectedOrders: OrdersProps[];
  onClose: () => void;
  onBulkFinalize: (updates: { id: string; situacao: string; dataEntregue: string; imageUrl: string }[]) => void;
}

const BulkFinalizeModal: React.FC<BulkFinalizeModalProps> = ({
  selectedOrders,
  onClose,
  onBulkFinalize,
}) => {
  const [selectedAction, setSelectedAction] = useState<ActionType>("Finalizar");

  const {usuario} = useAuth();

  const [orderImageFile, setOrderImageFile] = useState<File | null>(null);
  const [deliveryDates, setDeliveryDates] = useState<{ [orderId: string]: string }>(() => {
    const initialDates: { [orderId: string]: string } = {};
    const today = new Date().toISOString().split("T")[0];
    selectedOrders.forEach((order) => {
      initialDates[order.id] = today;
    });
    return initialDates;
  });

  const [isLoading, setIsLoading] = useState(false);
  const [userMap, setUserMap] = useState<{ [key: string]: PessoaProps }>({});

  const [deliveryPeople, setDeliveryPeople] = useState<DeliveryProps[]>([]);
  const [selectedDelivererId, setSelectedDelivererId] = useState<string>("");

  useEffect(() => {
    const fetchUsers = async () => {
      const userMapTemp: { [key: string]: PessoaProps } = {};
      const userPromises = selectedOrders.map(async (order) => {
        if (!userMapTemp[order.userId]) {
          try {
            const response = await api.get(`/users/${order.userId}`);
            userMapTemp[order.userId] = response.data;
          } catch (error) {
            console.error("Erro ao buscar dados do usuário:", error);
          }
        }
      });
      await Promise.all(userPromises);
      setUserMap(userMapTemp);
    };
    fetchUsers();
  }, [selectedOrders]);


  const handleDateChange = (orderId: string, newDate: string) => {
    setDeliveryDates((prev) => ({ ...prev, [orderId]: newDate }));
  };

  const handleConfirmAction = async () => {
    setIsLoading(true);
    if (selectedAction === "Inserir na Lista" && !selectedDelivererId) { 
      <Alert
        type="alerta"
        text="Por favor, selecione um entregador antes de prosseguir."
        onClose={() => setIsLoading(false)}
      />;
      return;
    }

    let uploadedFileUrl: string | null = null;
    // Faz upload da imagem apenas se a ação for "Finalizar"
    if (selectedAction === "Finalizar" && orderImageFile) {
      const formData = new FormData();
      formData.append("file", orderImageFile);
      try {
        const response = await api.post(`/upload/order/${selectedOrders[0].id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        uploadedFileUrl = response.data.imageUrl;
      } catch (error) {
        console.error("Erro ao enviar imagem:", error);
        <Alert
          type="error"
          text="Erro ao enviar imagem. Tente novamente."
          onClose={() => setIsLoading(false)}
        />;
        return;
      }
    }

    try {
      const updates = await Promise.all(
        selectedOrders.map(async (order) => {
          let payload: { usuario: UserProps | null, situacao?: string; dataEntregue?: string; imageUrl?: string | null } = { usuario};

          switch (selectedAction) {
            case "Finalizar": {
              const [year, month, day] = deliveryDates[order.id].split("-").map(Number);
              const localDate = new Date(year, month - 1, day);

              payload = {
                ...payload,
                situacao: "Finalizado",
                dataEntregue: localDate.toISOString(),
                imageUrl: uploadedFileUrl,
              };
              break;
            }

            case "Inserir na Lista": {
              const [year, month, day] = deliveryDates[order.id].split("-").map(Number);
              const localDate = new Date(year, month - 1, day);
              const deliverer = deliveryPeople.find(d => d.idDelivery === selectedDelivererId);
              payload = {
                ...payload,
                situacao: `Lista ${deliverer?.name || "Indefinido"}`,
                dataEntregue: localDate.toISOString(),
              };
              break;
            }

            case "Cancelar": {
              const [year, month, day] = deliveryDates[order.id].split("-").map(Number);
              const localDate = new Date(year, month - 1, day);
              payload = {
                ...payload,
                situacao: "Cancelado",
                dataEntregue: localDate.toISOString(),
              };
              break;
            }
          }

          await api.put(`/orders/${order.id}`, payload);

          // Retorna um objeto consistente para a atualização do estado no frontend
          return {
            id: order.id,
            situacao: payload.situacao,
            dataEntregue: payload.dataEntregue || order.dataEntregue,
            imageUrl: payload.imageUrl || order.imageUrl,
          };
        })
      );

      onBulkFinalize(
        updates.map((update) => ({
          id: update.id,
          situacao: update.situacao || "",
          dataEntregue: update.dataEntregue || "",
          imageUrl: update.imageUrl,
        }))
      );
      onClose();
    } catch (error) {
      console.error(`Erro ao executar a ação "${selectedAction}":`, error);
      alert(`Erro ao processar os pedidos. Tente novamente.`);
    } finally {
      setIsLoading(false);
    }
  };

  const renderActionSpecificFields = () => {
    switch (selectedAction) {
      case "Finalizar":
        return (
          <>
            <div className="mt-4 max-h-60 overflow-auto">
              {selectedOrders.map((order, index) => (
                <div key={order.id} className="mb-3 border-b pb-2">
                  <p className="font-semibold">Pedido: {index + 1} - {userMap[order.userId]?.name || "Carregando..."}</p>
                  <div className="flex gap-4 items-center mt-1">
                    <label className="block text-sm font-medium mb-1">Data de Entrega:</label>
                    <input
                      type="date"
                      value={deliveryDates[order.id]}
                      onChange={(e) => handleDateChange(order.id, e.target.value)}
                      className="border rounded px-2 py-1"
                    />
                  </div>
                </div>
              ))}
            </div>
            <UploadFileModal onFileSelected={setOrderImageFile} />
          </>
        );

      case "Inserir na Lista":
        return (
          <div className="mt-4">
             <GerenciadorEntregadores
              onDeliverersChange={setDeliveryPeople}
              onDelivererSelect={setSelectedDelivererId}
            />
            <p className="text-sm mt-4 text-slate-600 text-center">
              Os <span className="font-bold text-slate-700">{selectedOrders.length}</span> pedidos selecionados serão atribuídos.
            </p>
          </div>
        );

      case "Cancelar":
        return (
          <div className="mt-4 text-center">
            <p>Tem certeza que deseja cancelar os {selectedOrders.length} pedidos selecionados?</p>
            <p className="text-sm text-red-600 mt-2">Esta ação não poderá ser desfeita.</p>
          </div>
        );
      default:
        return null;
    }
  }

  return (
    // Fundo com efeito de vidro e animação de entrada
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl w-full max-w-lg transform transition-all animate-fade-in-scale">

        <h2 className="text-xl font-semibold mb-4 text-center text-slate-800">
          Alterar Situação em Lote
        </h2>

        {/* --- NOVO COMPONENTE DE ABAS (TABS) --- */}
        <div className="border-b border-slate-200 mb-6">
          <nav className="-mb-px flex justify-center gap-x-6" aria-label="Tabs">
            {[
              { id: "Finalizar", label: "Finalizar" },
              { id: "Inserir na Lista", label: "Inserir na Lista" },
              { id: "Cancelar", label: "Cancelar" },
            ].map((action) => (
              <button
                key={action.id}
                onClick={() => setSelectedAction(action.id as ActionType)}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 focus:outline-none
                  ${selectedAction === action.id
                    ? 'border-indigo-500 text-indigo-600' // Estilo da aba ATIVA
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300' // Estilo da aba INATIVA
                  }
                `}
              >
                {action.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Área de conteúdo renderizada dinamicamente */}
        <div className="min-h-[120px]">
          {renderActionSpecificFields()}
        </div>

        {/* Botões de Ação (mesmo estilo moderno anterior) */}
        <div className="flex flex-col sm:flex-row-reverse gap-3 mt-8 w-full">
          <button
            onClick={handleConfirmAction}
            disabled={isLoading}
            className="w-full sm:w-1/2 flex items-center justify-center bg-indigo-600 text-white font-semibold px-4 py-2.5 rounded-lg shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all disabled:bg-indigo-300 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processando...
              </>
            ) : "Confirmar"}
          </button>
          <button
            onClick={onClose}
            className="w-full sm:w-1/2 bg-white text-slate-700 border border-slate-300 font-semibold px-4 py-2.5 rounded-lg shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 transition-colors disabled:opacity-50"
            disabled={isLoading}
          >
            Voltar
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkFinalizeModal;