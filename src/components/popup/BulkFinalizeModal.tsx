// BulkFinalizeModal.tsx
import React, { useState, useEffect } from "react";
import { OrdersProps, UserProps } from "../../types/types";
import api from "../../services/api";
import { UploadFileModal } from "../../pages/telaHome/UploadFileModal";
import { PessoaProps } from "../../types/types";

interface BulkFinalizeModalProps {
  selectedOrders: OrdersProps[];
  onClose: () => void;
  onBulkFinalize: (updates: { id: string; dataEntregue: string | null }[]) => void;
  usuario: UserProps;
}

const BulkFinalizeModal: React.FC<BulkFinalizeModalProps> = ({
  selectedOrders,
  onClose,
  onBulkFinalize,
  usuario,
}) => {
  const [orderImageFile, setOrderImageFile] = useState<File | null>(null);
  const [deliveryDates, setDeliveryDates] = useState<{ [orderId: string]: string }>(() => {
    const initialDates: { [orderId: string]: string } = {};
    selectedOrders.forEach((order) => {
      const today = new Date().toISOString().split("T")[0];
      initialDates[order.id] = today;
    });

    return initialDates;
  });
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [userMap, setUserMap] = useState<{ [key: string]: PessoaProps }>({});

  useEffect(() => {
    const fetchUsers = async () => {
      const userMapTemp: { [key: string]: PessoaProps } = {};
      await Promise.all(
        selectedOrders.map(async (order) => {
          if (!userMapTemp[order.userId]) {
            try {
              const response = await api.get(`/users/${order.userId}`);
              userMapTemp[order.userId] = response.data;
            } catch (error) {
              console.error("Erro ao buscar dados do usuário:", error);
            }
          }
        })
      );
      setUserMap(userMapTemp);
    };

    fetchUsers();
  }, [selectedOrders]);

  const handleDateChange = (orderId: string, newDate: string) => {
    setDeliveryDates((prev) => ({ ...prev, [orderId]: newDate }));
  };

  const handleFinalize = async () => {
    setIsFinalizing(true);
    let uploadedFileUrl: string | null = null;
  
    if (orderImageFile) {
      const formData = new FormData();
      formData.append("file", orderImageFile);
      try {
        const response = await api.post(
          `/upload/order/${selectedOrders[0].id}`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        uploadedFileUrl = response.data.imageUrl;
        console.log("Imagem enviada com sucesso:", uploadedFileUrl);
      } catch (error) {
        console.error("Erro ao enviar imagem:", error);
        alert("Erro ao enviar a imagem. Tente novamente.");
        setIsFinalizing(false);
        return;
      }
    }
  
    try {
      const updates = await Promise.all(
        selectedOrders.map(async (order) => {
          // Criando a data sem deslocamento de fuso horário
          const [year, month, day] = deliveryDates[order.id].split("-").map(Number);
          const localDate = new Date(year, month - 1, day); // Usa apenas a data local
  
          console.log("Data de entrega (Local):", localDate);
  
          await api.put(`/orders/${order.id}`, {
            usuario,
            situacao: "Finalizado",
            dataEntregue: localDate, // Salva no formato local sem alterar o fuso horário
            imageUrl: uploadedFileUrl,
          });
  
          return { id: order.id, dataEntregue: localDate.toISOString() };
        })
      );
  
      onBulkFinalize(updates);
      onClose();
    } catch (error) {
      console.error("Erro ao finalizar pedidos:", error);
      alert("Erro ao finalizar os pedidos. Tente novamente.");
    } finally {
      setIsFinalizing(false);
    }
  };
  


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-4 text-center">Finalizar Pedidos</h2>

        <div className="mt-4 max-h-60 overflow-auto">
          {selectedOrders.map((order, index) => (
            <div key={order.id} className="mb-3 border-b pb-2">
              <p className="font-semibold">Pedido: {index + 1}</p>
              <p className="font-medium text-sm">
                {userMap[order.userId]?.name || "Carregando..."},{userMap[order.userId]?.apelido || "Carregando..."}
              </p>
              <div className="flex gap-4 items-center mt-1">
  <label className="block text-sm font-medium mb-1">Data de Entrega:</label>
  <input
    type="date"
    value={deliveryDates[order.id]}
    onChange={(e) => handleDateChange(order.id, e.target.value)}
    className="border rounded px-2"
  />
</div>


            </div>
          ))}

        </div>
        <UploadFileModal onFileSelected={setOrderImageFile} />
        <div className="flex gap-4 justify-center mt-4 w-full">
          <button
            onClick={onClose}
            className="bg-gradient-to-r from-[#E03335] to-[#812F2C] w-1/2 text-white font-semibold px-4 py-2 rounded"
          >
            Cancelar
          </button>
          <button
            onClick={handleFinalize}
            disabled={isFinalizing}
            className={`bg-gradient-to-r from-[#0E9647] to-[#165C38] w-1/2 text-white font-semibold px-4 py-2 rounded ${isFinalizing ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            Finalizar
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkFinalizeModal;
