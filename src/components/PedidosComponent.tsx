import { useState, useEffect } from "react";
import ListaPedidos from "./pedidos/ListaPedidos";
import api from "../services/api";
import jsPDF from "jspdf";
import "jspdf-autotable"; // Plugin para criação de tabelas no jsPDF
import watermarkImage from "../assets/logoIcon.png";
import { PessoaProps, UserProps, OrdersProps } from "../types/types";
import BulkFinalizeModal from "./popup/BulkFinalizeModal";
import Alert from "./alerts/alertDesktop";

declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: {
      head: string[][];
      body: string[][];
      startY?: number;
      theme?: string;
      styles?: Record<string, unknown>;
      margin?: { top: number; bottom: number };
      didDrawPage?: (data: { settings: { margin: { left: number } } }) => void;
    }) => jsPDF;
  }
}

interface PedidosComponentProps {
  usuario: UserProps;
}

export const PedidosComponent: React.FC<PedidosComponentProps> = ({ usuario }) => {

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertType, setAlertType] = useState<"alerta" | "error" | "info" | "sucesso">("info");
  const [alertText, setAlertText] = useState("");

  // Estados para armazenar pedidos e usuários
  const [orders, setOrders] = useState<OrdersProps[]>([]);
  const [users, setUsers] = useState<PessoaProps[]>([]);

  // Estados dos filtros
  const [selectedService, setSelectedService] = useState("");
  const [selectedSituacao, setSelectedSituacao] = useState("Todos");
  const [selectedLocal, setSelectedLocal] = useState("");

  // Estados de data (mês/ano)
  const currentDate = new Date();
  const currentMonth = (currentDate.getMonth() + 1).toString().padStart(2, "0");
  const currentYear = currentDate.getFullYear().toString();
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);

  // Outros estados
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [localOptions, setLocalOptions] = useState<string[]>([]);
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [isBulkFinalizeModalOpen, setIsBulkFinalizeModalOpen] = useState(false);

  const apiServicos = [
    "Água",
    "Trator",
    "Semente",
    "Retroescavadeira",
    "CAR",
    "CAF",
    "RGP",
    "GTA",
    "Carta de Anuência Ambiental",
    "Serviço de Inspeção Municipal",
    "Declaração de Agricultor/a",
    "Declaração de Pescador/a",
    "Caderneta de Pescador/a",
  ];

  // Busca localidades
  const fetchLocalidades = async () => {
    try {
      const response = await api.get("/localidades");
      const localidades = response.data.map((item: { localidade: string }) => item.localidade);
      setLocalOptions(["Todos", ...localidades]);
    } catch (error) {
      console.error("Erro ao buscar localidades:", error);
    }
  };

  useEffect(() => {
    fetchLocalidades();
  }, []);

  const getMonthName = (month: string) => {
    const months = [
      "Janeiro",
      "Fevereiro",
      "Março",
      "Abril",
      "Maio",
      "Junho",
      "Julho",
      "Agosto",
      "Setembro",
      "Outubro",
      "Novembro",
      "Dezembro",
    ];
    return months[parseInt(month) - 1];
  };

  // Busca pedidos e usuários conforme os filtros selecionados
  useEffect(() => {
    const fetchOrdersAndUsers = async () => {
      try {
        if (selectedService && selectedMonth && selectedYear) {
          const ordersResponse = await api.get("/orders", {
            params: {
              servico: selectedService,
              mes: selectedMonth,
              ano: selectedYear,
            },
          });
          setOrders(ordersResponse.data);

          const userIds = Array.from(new Set(ordersResponse.data.map((order: OrdersProps) => order.userId)));
          const userResponses = await Promise.all(
            userIds.map((userId) => api.get(`/users/${userId}`).then((res) => res.data))
          );
          setUsers(userResponses);
        }
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      }
    };

    fetchOrdersAndUsers();
  }, [selectedService, selectedMonth, selectedYear]);

  const showAlert = (type: "alerta" | "error" | "info" | "sucesso", text: string) => {
    setAlertType(type);
    setAlertText(text);
    setAlertVisible(true);
  };

  const closeAlert = () => {
    setAlertVisible(false);
  };

  // Formata a data para dd/mm/yyyy
  const formatDate = (date: string | null): string => {
    if (!date) return "";
    const parsedDate = new Date(date);
    const day = String(parsedDate.getDate()).padStart(2, "0");
    const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
    const year = parsedDate.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Filtra pedidos conforme local e situação
  const filteredOrders = orders.filter((order) => {
    const user = users.find((u) => u.id === order.userId);
    const matchesLocal = selectedLocal === "Todos" || user?.neighborhood === selectedLocal;
    const matchesSituacao = selectedSituacao === "Todos" || order.situacao === selectedSituacao;
    return matchesLocal && matchesSituacao;
  });

  // Alterna a seleção de um pedido
  const toggleOrderSelection = (orderId: string) => {
    setSelectedOrderIds((prevSelected) =>
      prevSelected.includes(orderId)
        ? prevSelected.filter((id) => id !== orderId)
        : [...prevSelected, orderId]
    );
  };


  const openBulkFinalizeModal = () => {
    if (selectedOrderIds.length === 0) {
      showAlert("alerta", "Nenhum pedido selecionado!");
      return;
    }
    setIsBulkFinalizeModalOpen(true);
  };

  // Atualiza os pedidos após finalização em lote
  const handleBulkFinalize = (updates: { id: string; dataEntregue: string | null }[]) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) => {
        const update = updates.find((upd) => upd.id === order.id);
        return update ? { ...order, situacao: "Finalizado", dataEntregue: update.dataEntregue } : order;
      })
    );
  };

  // Função para gerar o PDF com os pedidos selecionados
  const downloadPDF = async () => {
    if (selectedOrderIds.length === 0) {
      showAlert("alerta", "Nenhum pedido selecionado!");
      return;
    }

    const doc = new jsPDF("l", "pt", "a4"); // Alterado para modo paisagem
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Função para converter imagem para Base64 com opacidade
    const getTransparentImage = async (imgPath: string, opacity: number): Promise<string> => {
      return new Promise((resolve) => {
        const img = new Image();
        img.src = imgPath;
        img.crossOrigin = "Anonymous";
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.globalAlpha = opacity;
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL("image/png"));
          }
        };
      });
    };

    const watermarkBase64 = await getTransparentImage(watermarkImage, 0.1);
    doc.addImage(watermarkBase64, "PNG", 50, 50, pageWidth - 100, pageHeight - 100);

    // Cabeçalho do PDF
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(40, 40, 40);
    doc.text("Lista de Pedidos", pageWidth / 2, 40, { align: "center" });
    doc.setFontSize(12);
    doc.text(`Serviço: ${selectedService} | Local: ${selectedLocal}`, pageWidth / 2, 60, { align: "center" });

    // Filtra os pedidos selecionados
    const ordersToInclude = filteredOrders.filter((order) => selectedOrderIds.includes(order.id));

    // Prepara os dados para a tabela
    const tableColumn = ["Nome", "Apelido", "Localidade", "Contato", "Solicitado", "Entregue", "Assinatura"];
    const tableRows: string[][] = ordersToInclude.map((order) => {
      const user = users.find((u) => u.id === order.userId);
      return [
        user?.name || "N/A",
        user?.apelido || "N/A",
        user?.referencia || "N/A",
        user?.phone || "N/A",
        formatDate(order.data),
        order.dataEntregue ? formatDate(order.dataEntregue) : "",
        "",
      ];
    });

    doc.autoTable({
      startY: 80,
      head: [tableColumn],
      body: tableRows,
      theme: "grid",
      styles: {
        head: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontStyle: "bold",
          halign: "center",
        },
        body: {
          textColor: 50,
          halign: "center",
        },
        alternateRow: { fillColor: [238, 238, 238] },
        font: "helvetica",
        fontSize: 10,
      },
      margin: { top: 80, bottom: 40 },
      didDrawPage: (data) => {
        const pageStr = "Página " + doc.getNumberOfPages();
        doc.setFontSize(10);
        doc.text(pageStr, data.settings.margin.left, pageHeight - 10);
      },
    });

    doc.save("lista-pedidos.pdf");

  };

  return (
    <section className="flex flex-col w-full h-full p-5">
      {/* Modal de seleção de Mês e Ano */}
      {isPopupOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white w-[270px] p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4 text-center">Selecione Mês e Ano</h2>
            <div className="flex gap-4 mb-4 justify-center">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="border w-1/2 rounded px-2 py-1"
              >
                {[...Array(12)].map((_, i) => {
                  const monthValue = (i + 1).toString().padStart(2, "0");
                  return (
                    <option key={i + 1} value={monthValue}>
                      {getMonthName(monthValue)}
                    </option>
                  );
                })}
              </select>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="border w-1/2 rounded px-2 py-1"
              >
                {[...Array(2)].map((_, i) => (
                  <option key={i} value={(currentDate.getFullYear() - i).toString()}>
                    {currentDate.getFullYear() - i}
                  </option>
                ))}
              </select>
            </div>
            <button
              className="bg-gradient-to-r from-[#0E9647] to-[#165C38] w-full font-bold text-white px-4 py-2 rounded hover:opacity-80"
              onClick={() => setIsPopupOpen(false)}
            >
              Confirmar
            </button>
          </div>
        </div>
      )}

      {/* Seção de filtros e botões */}
      <div className="flex flex-wrap gap-10 justify-center mb-4">
        <div className="flex flex-col items-center">
          <h1 className="text-black font-bold text-2xl mb-2">Serviço</h1>
          <select
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
            className="border w-[270px] text-white font-semibold rounded-lg px-2 py-1 text-center bg-gradient-to-b from-[#00324C] to-[#191B23] appearance-none cursor-pointer"
          >
            <option value="" className="bg-[#191B23] text-white">
              Selecione o Serviço
            </option>
            {apiServicos.map((servico) => (
              <option key={servico} value={servico} className="bg-[#191B23] text-white">
                {servico}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col items-center">
          <h1 className="text-black font-bold text-2xl mb-2">Localidade</h1>
          <select
            value={selectedLocal}
            onChange={(e) => setSelectedLocal(e.target.value)}
            className="border w-[250px] text-white font-semibold rounded-lg px-2 py-1 text-center bg-gradient-to-b from-[#00324C] to-[#191B23] appearance-none cursor-pointer"
          >
            <option value="" className="bg-[#191B23] text-white">
              Selecione a Localidade
            </option>
            {localOptions.map((local) => (
              <option key={local} value={local} className="bg-[#191B23] text-white">
                {local}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col items-center">
          <label className="font-bold text-2xl mb-2">Período:</label>
          <div className="flex items-center gap-4">
            <div className="flex justify-center items-center w-[250px] h-[30px] rounded-lg bg-gradient-to-b from-[#00324C] to-[#191B23] text-white"
              onClick={() => setIsPopupOpen(true)}
            >
              <p className="text-lg font-semibold cursor-pointer">
                {getMonthName(selectedMonth)}, {selectedYear}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center">
          <h1 className="text-black font-bold text-2xl mb-2">Situação</h1>
          <select
            value={selectedSituacao}
            onChange={(e) => setSelectedSituacao(e.target.value)}
            className="border w-[250px] text-white font-semibold rounded-lg px-2 py-1 text-center bg-gradient-to-b from-[#00324C] to-[#191B23] appearance-none cursor-pointer"
          >
            <option value="Todos" className="bg-[#191B23] text-white">
              Todos
            </option>
            <option value="Aguardando" className="bg-[#191B23] text-white">
              Aguardando
            </option>
            <option value="Finalizado" className="bg-[#191B23] text-white">
              Finalizado
            </option>
          </select>
        </div>

        <div className="flex flex-col items-center">
          <h1 className="text-black font-bold text-2xl mb-2">Pedidos</h1>
          <div className="flex w-[300px] justify-center items-center gap-3">
            <button
              className="flex justify-center items-center w-1/2 h-[33px] rounded-lg bg-gradient-to-b from-[#0E9647] to-[#165C38] hover:opacity-80 text-white text-base font-semibold"
              onClick={openBulkFinalizeModal}
            >
              Finalizar
            </button>

            <button

              className="flex justify-center items-center w-1/2 h-[33px] rounded-lg bg-gradient-to-b from-[#0E9647] to-[#165C38] hover:opacity-80 text-white text-base font-semibold"
              onClick={downloadPDF}
            >
              Baixar
            </button>
          </div>


        </div>

      </div>


      {/* Modal para finalização em lote */}
      {isBulkFinalizeModalOpen && (
        <BulkFinalizeModal
          selectedOrders={orders.filter((order) => selectedOrderIds.includes(order.id))}
          onClose={() => setIsBulkFinalizeModalOpen(false)}
          onBulkFinalize={handleBulkFinalize}
          usuario={usuario}
        />
      )}

      <div className="border border-black w-full mb-4"></div>

      <div className="w-full h-full">
        <ListaPedidos
          pedidos={filteredOrders}
          local={selectedLocal}
          onUpdate={async (id, situacao) => {
            try {
              const dataEntregue = situacao === "Finalizado" ? new Date().toISOString() : null;
              const response = await api.put(`/orders/${id}`, {
                usuario,
                situacao,
                dataEntregue,
              });
              if (response.status === 200) {
                setOrders((prevOrders) =>
                  prevOrders.map((order) =>
                    order.id === id ? { ...order, usuario, situacao, dataEntregue } : order
                  )
                );
              } else {
                alert("Falha ao atualizar a situação do pedido.");
              }
            } catch (error) {
              console.error("Erro ao atualizar a situação do pedido:", error);
              alert("Erro ao atualizar a situação do pedido. Tente novamente.");
            }
          }}
          selectedOrderIds={selectedOrderIds}
          toggleOrderSelection={toggleOrderSelection}
          isSelectionMode={selectedOrderIds.length > 0}
        />
      </div>
      {alertVisible && <Alert type={alertType} text={alertText} onClose={closeAlert} />}
    </section>
  );
};

export default PedidosComponent;
