import { useState, useEffect } from "react";
import ListaPedidos from "./pedidos/ListaPedidos";
import api from "../services/api";
import jsPDF from "jspdf";
import "jspdf-autotable"; // Importa o plugin para extensão do jsPDF
import watermarkImage from "../assets/logoIcon.png";
import { PessoaProps } from "../types/types";
import { UserProps } from "../types/types";
import { OrdersProps } from "../types/types";

declare module "jspdf" {
  interface jsPDF {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    autoTable: (options: any) => jsPDF; // Declaração do método autoTable
  }
}

interface PedidosComponentProps {
  usuario: UserProps
}

export const PedidosComponent: React.FC<PedidosComponentProps> = ({ usuario }) => {
  const [orders, setOrders] = useState<OrdersProps[]>([]);
  const [users, setUsers] = useState<PessoaProps[]>([]);
  const [selectedService, setSelectedService] = useState("");
  const [selectedSituacao, setSelectedSituacao] = useState("Todos"); // Estado para situação
  const currentDate = new Date();
  const currentMonth = (currentDate.getMonth() + 1).toString().padStart(2, "0");
  const currentYear = currentDate.getFullYear().toString();

  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedLocal, setSelectedLocal] = useState("");
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [, setIsConfirmationPopupOpen] = useState(false);

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

  const localOptions = [
    "Todos",
    "Açudinho",
    "Cachoeira do Catolé",
    "Cachoeira do cumbe",
    "Cachoeira do Salobro",
    "Cachoeira do Sebo/Barragem",
    "Cachoeira dos Alves",
    "Gameleira",
    "Lagoa do Sapo",
    "Lagoa dos Cavalos",
    "Lameiro",
    "Manteiga",
    "Mocós",
    "Monjolo",
    "Pau Santo",
    "Pitombeira",
    "Poças de Baixo",
    "Poças de cima",
    "Quatis",
    "Queimados",
    "Quatro contas",
    "Serrote",
    "Sítio Campestre",
    "Sítio Folha Larga",
    "Sítio Novo",
    "Tanque Verde",
    "Taquaris",
    "Terra Nova",
    "Varzea da Passira",
    "Centro",
    "Outros"

  ];

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

          const userIds = [
            ...new Set(ordersResponse.data.map((order: OrdersProps) => order.userId)),
          ];
          const userResponses = await Promise.all(
            userIds.map((userId) =>
              api.get(`/users/${userId}`).then((res) => res.data)
            )
          );
          setUsers(userResponses);
        }
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      }
    };

    fetchOrdersAndUsers();
  }, [selectedService, selectedMonth, selectedYear]);

  const formatDate = (date: string | null): string => {
    if (!date) return ""; // Tratamento para datas nulas
    const parsedDate = new Date(date);
    const day = String(parsedDate.getDate()).padStart(2, "0");
    const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
    const year = parsedDate.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Aplica o filtro por localidade e situação
  const filteredOrders = orders.filter((order) => {
    const user = users.find((u) => u.id === order.userId);
    const matchesLocal = selectedLocal === "Todos" || user?.neighborhood === selectedLocal;
    const matchesSituacao = selectedSituacao === "Todos" || order.situacao === selectedSituacao;
    return matchesLocal && matchesSituacao;
  });

  const handleDownloadPDF = async () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
  
    // Converter imagem para Base64 e ajustar a opacidade
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
            ctx.globalAlpha = opacity; // Define a transparência
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL("image/png")); // Retorna imagem Base64
          }
        };
      });
    };
  
    // Obtem a marca d'água com opacidade ajustada
    const watermarkBase64 = await getTransparentImage(watermarkImage, 0.1);
  
    // Adiciona a imagem como marca d'água ocupando toda a folha
    doc.addImage(watermarkBase64, "PNG", 0, 0, pageWidth, pageHeight);
  
    // Configuração do título
    doc.setFontSize(12);
    doc.text(`Lista Pedidos de ${selectedService} em ${selectedLocal}`, 14, 20);
  
    // Configuração da tabela
    const tableColumn = ["Nome", "Localidade", "Solicitado", "Entregue", "Situação", "Assinatura"];
    const tableRows: string[][] = [];
  
    filteredOrders.forEach((order) => {
      const user = users.find((u) => u.id === order.userId);
      const orderData = [
        user?.name || "N/A",
        `${user?.referencia || "N/A"}`,
        formatDate(order.data),
        formatDate(order.dataEntregue) || "",
        order.situacao,
      ];
      tableRows.push(orderData);
    });
  
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 30,
    });
  
    // Salva o PDF
    doc.save("lista-pedidos.pdf");
  };


  const updatePedidoSituacao = async (id: string, situacao: string) => {
    try {
      const dataEntregue = situacao === "Finalizado" ? new Date().toISOString() : null;
      const response = await api.put(`/orders/${id}`, { 
        usuario,
        situacao, 
        dataEntregue 
      });
  
      if (response.status === 200) {
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.id === id ? { ...order, usuario, situacao, dataEntregue } : order
          )
        );
        console.log("Situação do pedido e dataEntregue atualizadas com sucesso!");
      } else {
        alert("Falha ao atualizar a situação do pedido.");
      }
    } catch (error) {
      console.error("Erro ao atualizar a situação do pedido:", error);
      alert("Erro ao atualizar a situação do pedido. Tente novamente.");
    }
  };
  

  const handleConfirmSelection = () => {
    setIsPopupOpen(false);
    setIsConfirmationPopupOpen(true);
  };

  return (
    <section className="flex flex-col w-full h-full p-5">
      {/* Popup de confirmação de seleção */}
      {isPopupOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white w-[270px] mb-60 p-6 rounded-lg shadow-lg">
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
              onClick={handleConfirmSelection}
            >
              Confirmar
            </button>
          </div>
        </div>
      )}


      <div className="flex gap-10 justify-center mb-4">
        <div className="flex flex-col items-center">
          <h1 className="text-black font-bold text-2xl mb-2">Serviço</h1>
          <select
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
            className="border w-[270px] text-white font-semibold rounded-lg px-2 py-1 text-center bg-gradient-to-b from-[#00324C] to-[#191B23] appearance-none cursor-pointer"
          >
            <option value="" className="bg-[#191B23] text-white">Selecione o Serviço</option>
            {apiServicos.map((servico) => (
              <option className="bg-[#191B23] text-white" key={servico} value={servico}>
                {servico}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-4 items-center">
          <div className="flex flex-col">
            <h1 className="text-black font-bold text-2xl mb-2 text-center">Localidade</h1>
            <select
              value={selectedLocal}
              onChange={(e) => setSelectedLocal(e.target.value)}
              className="border w-[250px] text-white font-semibold rounded-lg px-2 py-1 text-center bg-gradient-to-b from-[#00324C] to-[#191B23] appearance-none cursor-pointer"
            >
              <option value="" className="bg-[#191B23] text-white">Selecione a Localidade</option>
              {localOptions.map((local) => (
                <option className="bg-[#191B23] text-white" key={local} value={local}>
                  {local}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col">
          <div className="flex">
            <label htmlFor="periodo" className="font-bold text-2xl mb-2">
              Período:
            </label>
            <svg
              className="w-7 h-7 ml-4 cursor-pointer"
              viewBox="0 0 34 34"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              onClick={() => setIsPopupOpen(true)}
            >
              <path
                d="M22.6667 2.83334V8.50001M11.3333 2.83334V8.50001M4.25 14.1667H29.75M7.08333 5.66668H26.9167C28.4815 5.66668 29.75 6.9352 29.75 8.50001V28.3333C29.75 29.8982 28.4815 31.1667 26.9167 31.1667H7.08333C5.51853 31.1667 4.25 29.8982 4.25 28.3333V8.50001C4.25 6.9352 5.51853 5.66668 7.08333 5.66668H7.08333Z"
                stroke="#000"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="flex justify-center w-[250px] h-[30px] rounded-lg items-center border-lg bg-gradient-to-b from-[#00324C] to-[#191B23] text-white">
            <p className="text-lg font-semibold cursor-pointer">{getMonthName(selectedMonth)},  {selectedYear}</p>
          </div>
        </div>

        {/* Filtro de Situação */}
        <div className="flex flex-col items-center">
          <h1 className="text-black font-bold text-2xl mb-2">Situação</h1>
          <select
            value={selectedSituacao}
            onChange={(e) => setSelectedSituacao(e.target.value)}
            className="border w-[250px] text-white font-semibold rounded-lg px-2 py-1 text-center bg-gradient-to-b from-[#00324C] to-[#191B23] appearance-none cursor-pointer"
          >
            <option value="Todos" className="bg-[#191B23] text-white">Todos</option>
            <option value="Aguardando" className="bg-[#191B23] text-white">Aguardando</option>
            <option value="Finalizado" className="bg-[#191B23] text-white">Finalizado</option>
          </select>
        </div>
        <div className="flex flex-col items-center">
          <h1 className="text-black font-bold text-2xl mb-2">Pedidos</h1>
          <button
            className="border w-[250px] text-white font-semibold rounded-lg px-2 py-1 text-center bg-gradient-to-b from-[#0E9647] to-[#165C38] hover:opacity-80"
            onClick={handleDownloadPDF}
          >
            Baixar PDF
          </button>
        </div>


      </div>

      <div className="border border-black w-full mb-4"></div>

      <div className="w-full h-full bg-white text-black border border-white rounded-2xl shadow-2xl py-3 px-4">
        <ListaPedidos pedidos={filteredOrders} local={selectedLocal} onUpdate={updatePedidoSituacao} />
      </div>
    </section>
  );
};

