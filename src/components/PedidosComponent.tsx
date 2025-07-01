// import { useState, useEffect } from "react";
// import ListaPedidos from "./pedidos/ListaPedidos";
// import api from "../services/api";
// import jsPDF from "jspdf";
// import "jspdf-autotable"; // Plugin para criação de tabelas no jsPDF
// import watermarkImage from "../assets/logoIcon.png";
// import { PessoaProps, UserProps, OrdersProps } from "../types/types";
// import BulkFinalizeModal from "./popup/BulkFinalizeModal";
// import Alert from "./alerts/alertDesktop";
// import { MagnifyingGlassIcon, CalendarDaysIcon, ListBulletIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';

// declare module "jspdf" {
//   interface jsPDF {
//     autoTable: (options: {
//       head: string[][];
//       body: string[][];
//       startY?: number;
//       theme?: string;
//       styles?: Record<string, unknown>;
//       margin?: { top: number; bottom: number };
//       didDrawPage?: (data: { settings: { margin: { left: number } } }) => void;
//     }) => jsPDF;
//   }
// }

// interface PedidosComponentProps {
//   usuario: UserProps;
// }

// export const PedidosComponent: React.FC<PedidosComponentProps> = ({ usuario }) => {

//   const [alertVisible, setAlertVisible] = useState(false);
//   const [alertType, setAlertType] = useState<"alerta" | "error" | "info" | "sucesso">("info");
//   const [alertText, setAlertText] = useState("");

//   // Estados para armazenar pedidos e usuários
//   const [orders, setOrders] = useState<OrdersProps[]>([]);
//   const [users, setUsers] = useState<PessoaProps[]>([]);

//   // Estados dos filtros
//   const [selectedService, setSelectedService] = useState("");
//   const [selectedSituacao, setSelectedSituacao] = useState("");
//   const [selectedLocal, setSelectedLocal] = useState("");

//   // Estados de data (mês/ano)
//   const currentDate = new Date();
//   const currentMonth = (currentDate.getMonth() + 1).toString().padStart(2, "0");
//   const currentYear = currentDate.getFullYear().toString();
//   const [selectedMonth, setSelectedMonth] = useState(currentMonth);
//   const [selectedYear, setSelectedYear] = useState(currentYear);

//   // Outros estados
//   const [isPopupOpen, setIsPopupOpen] = useState(false);
//   const [localOptions, setLocalOptions] = useState<string[]>([]);
//   const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
//   const [isBulkFinalizeModalOpen, setIsBulkFinalizeModalOpen] = useState(false);

//   const apiServicos = [
//     "Água",
//     "Trator",
//     "Semente",
//     "Retroescavadeira",
//     "CAR",
//     "CAF",
//     "RGP",
//     "GTA",
//     "Mudas",
//     "Carta de Anuência Ambiental",
//     "Serviço de Inspeção Municipal",
//     "Declaração de Agricultor/a",
//     "Declaração de Pescador/a",
//     "Caderneta de Pescador/a",
//   ];

//   useEffect(() => {
//     const fetchLocalidades = async () => {
//       try {
//         const response = await api.get("/localidades");
//         // Mapeamos para obter apenas os nomes das localidades
//         const localidades = response.data.map((item: { localidade: string }) => item.localidade);
//         setLocalOptions(localidades);
//       } catch (error) {
//         console.error("Erro ao buscar localidades:", error);
//       }
//     };

//     fetchLocalidades();
//   }, []); // Array de dependências vazio para executar apenas uma vez

//   const getMonthName = (month: string) => {
//     const months = [
//       "Janeiro",
//       "Fevereiro",
//       "Março",
//       "Abril",
//       "Maio",
//       "Junho",
//       "Julho",
//       "Agosto",
//       "Setembro",
//       "Outubro",
//       "Novembro",
//       "Dezembro",
//     ];
//     return months[parseInt(month) - 1];
//   };

//   // Busca pedidos e usuários conforme os filtros selecionados
//   useEffect(() => {
//     const fetchOrdersAndUsers = async () => {
//       try {
//         if (selectedService && selectedMonth && selectedYear) {
//           const ordersResponse = await api.get("/orders", {
//             params: {
//               servico: selectedService,
//               mes: selectedMonth,
//               ano: selectedYear,
//             },
//           });
//           setOrders(ordersResponse.data);

//           const userIds = Array.from(new Set(ordersResponse.data.map((order: OrdersProps) => order.userId)));
//           const userResponses = await Promise.all(
//             userIds.map((userId) => api.get(`/users/${userId}`).then((res) => res.data))
//           );
//           setUsers(userResponses);
//         }
//       } catch (error) {
//         console.error("Erro ao buscar dados:", error);
//       }
//     };

//     fetchOrdersAndUsers();
//   }, [selectedService, selectedMonth, selectedYear]);

//   const showAlert = (type: "alerta" | "error" | "info" | "sucesso", text: string) => {
//     setAlertType(type);
//     setAlertText(text);
//     setAlertVisible(true);
//   };

//   const closeAlert = () => {
//     setAlertVisible(false);
//   };

//   // Formata a data para dd/mm/yyyy
//   const formatDate = (date: string | null): string => {
//     if (!date) return "";
//     const parsedDate = new Date(date);
//     const day = String(parsedDate.getDate()).padStart(2, "0");
//     const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
//     const year = parsedDate.getFullYear();
//     return `${day}/${month}/${year}`;
//   };

//   // Filtra pedidos conforme local e situação
//   const filteredOrders = orders.filter((order) => {
//     const user = users.find((u) => u.id === order.userId);
//     const matchesLocal = !selectedLocal || 
//     user?.neighborhood?.toLowerCase().includes(selectedLocal.toLowerCase());
//     const matchesSituacao = !selectedSituacao || 
//     order.situacao.toLowerCase().includes(selectedSituacao.toLowerCase());
//     return matchesLocal && matchesSituacao;
//   });

//   // Alterna a seleção de um pedido
//   const toggleOrderSelection = (orderId: string) => {
//     setSelectedOrderIds((prevSelected) =>
//       prevSelected.includes(orderId)
//         ? prevSelected.filter((id) => id !== orderId)
//         : [...prevSelected, orderId]
//     );
//   };


//   const openBulkFinalizeModal = () => {
//     if (selectedOrderIds.length === 0) {
//       showAlert("alerta", "Nenhum pedido selecionado!");
//       return;
//     }
//     setIsBulkFinalizeModalOpen(true);
//   };

//   // Atualiza os pedidos após finalização em lote
//   const handleBulkFinalize = (updates: { id: string; dataEntregue: string | null }[]) => {
//     setOrders((prevOrders) =>
//       prevOrders.map((order) => {
//         const update = updates.find((upd) => upd.id === order.id);
//         return update ? { ...order, situacao: "Finalizado", dataEntregue: update.dataEntregue } : order;
//       })
//     );
//   };

//   // Função para gerar o PDF com os pedidos selecionados
//   const downloadPDF = async () => {
//     if (selectedOrderIds.length === 0) {
//       showAlert("alerta", "Nenhum pedido selecionado!");
//       return;
//     }

//     const doc = new jsPDF("l", "pt", "a4"); // Alterado para modo paisagem
//     const pageWidth = doc.internal.pageSize.getWidth();
//     const pageHeight = doc.internal.pageSize.getHeight();

//     // Função para converter imagem para Base64 com opacidade
//     const getTransparentImage = async (imgPath: string, opacity: number): Promise<string> => {
//       return new Promise((resolve) => {
//         const img = new Image();
//         img.src = imgPath;
//         img.crossOrigin = "Anonymous";
//         img.onload = () => {
//           const canvas = document.createElement("canvas");
//           canvas.width = img.width;
//           canvas.height = img.height;
//           const ctx = canvas.getContext("2d");
//           if (ctx) {
//             ctx.globalAlpha = opacity;
//             ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
//             resolve(canvas.toDataURL("image/png"));
//           }
//         };
//       });
//     };

//     const watermarkBase64 = await getTransparentImage(watermarkImage, 0.1);
//     doc.addImage(watermarkBase64, "PNG", 50, 50, pageWidth - 100, pageHeight - 100);

//     // Cabeçalho do PDF
//     doc.setFont("helvetica", "bold");
//     doc.setFontSize(16);
//     doc.setTextColor(40, 40, 40);
//     doc.text("Lista de Pedidos", pageWidth / 2, 40, { align: "center" });
//     doc.setFontSize(12);
//     doc.text(`Serviço: ${selectedService} | Local: ${selectedLocal}`, pageWidth / 2, 60, { align: "center" });

//     // Filtra os pedidos selecionados
//     const ordersToInclude = filteredOrders.filter((order) => selectedOrderIds.includes(order.id));

//     // Prepara os dados para a tabela
//     const tableColumn = ["Nome", "Apelido", "Localidade", "Contato", "Solicitado", "Entregue", "Assinatura"];
//     const tableRows: string[][] = ordersToInclude.map((order) => {
//       const user = users.find((u) => u.id === order.userId);
//       return [
//         user?.name || "N/A",
//         user?.apelido || "N/A",
//         user?.referencia || "N/A",
//         user?.phone || "N/A",
//         formatDate(order.data),
//         order.dataEntregue ? formatDate(order.dataEntregue) : "",
//         "",
//       ];
//     });

//     doc.autoTable({
//       startY: 80,
//       head: [tableColumn],
//       body: tableRows,
//       theme: "grid",
//       styles: {
//         head: {
//           fillColor: [41, 128, 185],
//           textColor: 255,
//           fontStyle: "bold",
//           halign: "center",
//         },
//         body: {
//           textColor: 50,
//           halign: "center",
//         },
//         alternateRow: { fillColor: [238, 238, 238] },
//         font: "helvetica",
//         fontSize: 10,
//       },
//       margin: { top: 80, bottom: 40 },
//       didDrawPage: (data) => {
//         const pageStr = "Página " + doc.getNumberOfPages();
//         doc.setFontSize(10);
//         doc.text(pageStr, data.settings.margin.left, pageHeight - 10);
//       },
//     });

//     doc.save("lista-pedidos.pdf");

//   };

//   return (
//     <section className="flex flex-col w-full h-full p-5">
//       {/* Modal de seleção de Mês e Ano */}
//       {isPopupOpen && (
//         <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center">
//           <div className="bg-white w-[300px] p-6 rounded-lg shadow-lg">
//             <h2 className="text-xl font-bold mb-4 text-center">Selecione Mês e Ano</h2>
//             <div className="flex gap-4 mb-4 justify-center">
//               <select
//                 value={selectedMonth}
//                 onChange={(e) => setSelectedMonth(e.target.value)}
//                 className="border w-1/2 rounded px-2 py-1"
//               >
//                 {[...Array(12)].map((_, i) => {
//                   const monthValue = (i + 1).toString().padStart(2, "0");
//                   return (
//                     <option key={i + 1} value={monthValue}>
//                       {getMonthName(monthValue)}
//                     </option>
//                   );
//                 })}
//               </select>
//               <select
//                 value={selectedYear}
//                 onChange={(e) => setSelectedYear(e.target.value)}
//                 className="border w-1/2 rounded px-2 py-1"
//               >
//                 {[...Array(2)].map((_, i) => (
//                   <option key={i} value={(currentDate.getFullYear() - i).toString()}>
//                     {currentDate.getFullYear() - i}
//                   </option>
//                 ))}
//               </select>
//             </div>
//             <button
//               className="bg-gradient-to-r from-[#0E9647] to-[#165C38] w-full font-bold text-white px-4 py-2 rounded hover:opacity-80"
//               onClick={() => setIsPopupOpen(false)}
//             >
//               Confirmar
//             </button>
//           </div>
//         </div>
//       )}

//       {/* ================================================================ */}
// {/* INÍCIO DA NOVA SEÇÃO DE FILTROS E AÇÕES             */}
// {/* ================================================================ */}
// <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6 shadow-sm">
//   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
//   <div>
//   <label htmlFor="service-filter" className="block text-sm font-medium text-slate-700 mb-1">Serviço</label>
//   <input
//     type="text"
//     id="service-filter"
//     value={selectedService}
//     onChange={(e) => setSelectedService(e.target.value)}
//     placeholder="Digite ou selecione o serviço..."
//     className="w-full bg-white border border-slate-300 rounded-lg py-2 px-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
//     list="service-list" // <-- Conecta o input com o datalist
//   />
//   {/* O datalist fornece as opções de autocomplete */}
//   <datalist id="service-list">
//     {apiServicos.map((servico) => (
//       <option key={servico} value={servico} />
//     ))}
//   </datalist>
// </div>

//     {/* Substitua o filtro de Localidade por este */}
// <div>
//   <label htmlFor="local-filter" className="block text-sm font-medium text-slate-700 mb-1">Localidade</label>
//   <div className="relative">
//     <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
//       <MagnifyingGlassIcon className="h-5 w-5 text-slate-400" aria-hidden="true" />
//     </div>
//     <input
//       type="text"
//       id="local-filter"
//       value={selectedLocal}
//       onChange={(e) => setSelectedLocal(e.target.value)}
//       placeholder="Buscar por localidade..."
//       className="w-full bg-white border border-slate-300 rounded-lg py-2 pl-10 pr-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
//       list="local-list" // <-- Conecta o input com o datalist
//     />
//     {/* O datalist fornece as opções de autocomplete */}
//     <datalist id="local-list">
//       {localOptions.map((local) => (
//         <option key={local} value={local} />
//       ))}
//     </datalist>
//   </div>
// </div>

//     {/* --- Filtro de Situação (Busca) --- */}
//     <div>
//       <label htmlFor="situacao-filter" className="block text-sm font-medium text-slate-700 mb-1">Situação</label>
//       <div className="relative">
//         <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
//           <MagnifyingGlassIcon className="h-5 w-5 text-slate-400" aria-hidden="true" />
//         </div>
//         <input
//           type="text"
//           id="situacao-filter"
//           value={selectedSituacao}
//           onChange={(e) => setSelectedSituacao(e.target.value)}
//           placeholder="Buscar por situação..."
//           className="w-full bg-white border border-slate-300 rounded-lg py-2 pl-10 pr-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
//         />
//       </div>
//     </div>

//     {/* --- Filtro de Período --- */}
//     <div>
//       <label htmlFor="period-filter" className="block text-sm font-medium text-slate-700 mb-1">Período</label>
//       <button
//         id="period-filter"
//         onClick={() => setIsPopupOpen(true)}
//         className="w-full flex items-center justify-between bg-white border border-slate-300 rounded-lg py-2 px-3 shadow-sm text-slate-800 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//       >
//         <span>{getMonthName(selectedMonth)}, {selectedYear}</span>
//         <CalendarDaysIcon className="h-5 w-5 text-slate-400" />
//       </button>
//     </div>

//   </div>
// </div>

// {/* --- BARRA DE AÇÕES E RESULTADOS --- */}
// <div className="flex flex-col md:flex-row items-center justify-between mb-4 px-1">
//   <div className="text-sm font-medium text-slate-700">
//     <span className="font-bold text-indigo-600 text-lg">{filteredOrders.length}</span>
//     {filteredOrders.length === 1 ? ' pedido encontrado' : ' pedidos encontrados'}
//   </div>
//   <div className="flex items-center gap-3 mt-4 md:mt-0">
//     <button
//       onClick={openBulkFinalizeModal}
//       className="flex items-center gap-2 bg-white border border-slate-300 text-slate-700 font-semibold px-4 py-2 rounded-lg shadow-sm hover:bg-slate-100 transition-colors"
//     >
//       <ListBulletIcon className="h-5 w-5" />
//       Alterar Situação
//     </button>
//     <button
//       onClick={downloadPDF}
//       className="flex items-center gap-2 bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg shadow-sm hover:bg-indigo-700 transition-colors"
//     >
//       <ArrowDownTrayIcon className="h-5 w-5" />
//       Baixar PDF
//     </button>
//   </div>
// </div>


//       {/* Modal para finalização em lote */}
//       {isBulkFinalizeModalOpen && (
//         <BulkFinalizeModal
//           selectedOrders={orders.filter((order) => selectedOrderIds.includes(order.id))}
//           onClose={() => setIsBulkFinalizeModalOpen(false)}
//           onBulkFinalize={handleBulkFinalize}
//           usuario={usuario}
//         />
//       )}

//       <div className="border border-black w-full mb-4"></div>

//       <div className="w-full h-full">
//         <ListaPedidos
//           pedidos={filteredOrders}
//           local={selectedLocal}
//           onUpdate={async (id, situacao) => {
//             try {
//               const dataEntregue = situacao === "Finalizado" ? new Date().toISOString() : null;
//               const response = await api.put(`/orders/${id}`, {
//                 usuario,
//                 situacao,
//                 dataEntregue,
//               });
//               if (response.status === 200) {
//                 setOrders((prevOrders) =>
//                   prevOrders.map((order) =>
//                     order.id === id ? { ...order, usuario, situacao, dataEntregue } : order
//                   )
//                 );
//               } else {
//                 alert("Falha ao atualizar a situação do pedido.");
//               }
//             } catch (error) {
//               console.error("Erro ao atualizar a situação do pedido:", error);
//               alert("Erro ao atualizar a situação do pedido. Tente novamente.");
//             }
//           }}
//           selectedOrderIds={selectedOrderIds}
//           toggleOrderSelection={toggleOrderSelection}
//           isSelectionMode={selectedOrderIds.length > 0}
//         />
//       </div>
//       {alertVisible && <Alert type={alertType} text={alertText} onClose={closeAlert} />}
//     </section>
//   );
// };

// export default PedidosComponent;


// import { useState, useEffect } from "react";
// import ListaPedidos from "./pedidos/ListaPedidos";
// import api from "../services/api";
// import jsPDF from "jspdf";
// import "jspdf-autotable"; // Plugin para criação de tabelas no jsPDF
// import watermarkImage from "../assets/logoIcon.png";
// import { PessoaProps, UserProps, OrdersProps } from "../types/types";
// import BulkFinalizeModal from "./popup/BulkFinalizeModal";
// import Alert from "./alerts/alertDesktop";
// import { MagnifyingGlassIcon, CalendarDaysIcon, ListBulletIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';

// declare module "jspdf" {
//   interface jsPDF {
//     autoTable: (options: {
//       head: string[][];
//       body: string[][];
//       startY?: number;
//       theme?: string;
//       styles?: Record<string, unknown>;
//       margin?: { top: number; bottom: number };
//       didDrawPage?: (data: { settings: { margin: { left: number } } }) => void;
//     }) => jsPDF;
//   }
// }

// interface PedidosComponentProps {
//   usuario: UserProps;
// }

// export const PedidosComponent: React.FC<PedidosComponentProps> = ({ usuario }) => {

//   const [alertVisible, setAlertVisible] = useState(false);
//   const [alertType, setAlertType] = useState<"alerta" | "error" | "info" | "sucesso">("info");
//   const [alertText, setAlertText] = useState("");

//   // Estados para armazenar pedidos e usuários
//   const [orders, setOrders] = useState<OrdersProps[]>([]);
//   const [users, setUsers] = useState<PessoaProps[]>([]);

//   // Estados dos filtros
//   const [selectedService, setSelectedService] = useState("");
//   const [selectedSituacao, setSelectedSituacao] = useState("");
//   const [selectedLocal, setSelectedLocal] = useState("");

//   // Estados de data (mês/ano)
//   const currentDate = new Date();
//   const currentMonth = (currentDate.getMonth() + 1).toString().padStart(2, "0");
//   const currentYear = currentDate.getFullYear().toString();
//   const [selectedMonth, setSelectedMonth] = useState(currentMonth);
//   const [selectedYear, setSelectedYear] = useState(currentYear);

//   // Outros estados
//   const [isPopupOpen, setIsPopupOpen] = useState(false);
//   const [localOptions, setLocalOptions] = useState<string[]>([]);
//   const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
//   const [isBulkFinalizeModalOpen, setIsBulkFinalizeModalOpen] = useState(false);

//   const apiServicos = [
//     "Água",
//     "Trator",
//     "Semente",
//     "Retroescavadeira",
//     "CAR",
//     "CAF",
//     "RGP",
//     "GTA",
//     "Mudas",
//     "Carta de Anuência Ambiental",
//     "Serviço de Inspeção Municipal",
//     "Declaração de Agricultor/a",
//     "Declaração de Pescador/a",
//     "Caderneta de Pescador/a",
//   ];

//   useEffect(() => {
//     const fetchLocalidades = async () => {
//       try {
//         const response = await api.get("/localidades");
//         // Mapeamos para obter apenas os nomes das localidades
//         const localidades = response.data.map((item: { localidade: string }) => item.localidade);
//         setLocalOptions(localidades);
//       } catch (error) {
//         console.error("Erro ao buscar localidades:", error);
//       }
//     };

//     fetchLocalidades();
//   }, []); // Array de dependências vazio para executar apenas uma vez

//   const getMonthName = (month: string) => {
//     const months = [
//       "Janeiro",
//       "Fevereiro",
//       "Março",
//       "Abril",
//       "Maio",
//       "Junho",
//       "Julho",
//       "Agosto",
//       "Setembro",
//       "Outubro",
//       "Novembro",
//       "Dezembro",
//     ];
//     return months[parseInt(month) - 1];
//   };

//   // Busca pedidos e usuários conforme os filtros selecionados
//   useEffect(() => {
//     const fetchOrdersAndUsers = async () => {
//       try {
//         if (selectedService && selectedMonth && selectedYear) {
//           const ordersResponse = await api.get("/orders", {
//             params: {
//               servico: selectedService,
//               mes: selectedMonth,
//               ano: selectedYear,
//             },
//           });
//           setOrders(ordersResponse.data);

//           const userIds = Array.from(new Set(ordersResponse.data.map((order: OrdersProps) => order.userId)));
//           const userResponses = await Promise.all(
//             userIds.map((userId) => api.get(`/users/${userId}`).then((res) => res.data))
//           );
//           setUsers(userResponses);
//         }
//       } catch (error) {
//         console.error("Erro ao buscar dados:", error);
//       }
//     };

//     fetchOrdersAndUsers();
//   }, [selectedService, selectedMonth, selectedYear]);

//   const showAlert = (type: "alerta" | "error" | "info" | "sucesso", text: string) => {
//     setAlertType(type);
//     setAlertText(text);
//     setAlertVisible(true);
//   };

//   const closeAlert = () => {
//     setAlertVisible(false);
//   };

//   // Formata a data para dd/mm/yyyy
//   const formatDate = (date: string | null): string => {
//     if (!date) return "";
//     const parsedDate = new Date(date);
//     const day = String(parsedDate.getDate()).padStart(2, "0");
//     const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
//     const year = parsedDate.getFullYear();
//     return `${day}/${month}/${year}`;
//   };

//   // Filtra pedidos conforme local e situação
//   const filteredOrders = orders.filter((order) => {
//     const user = users.find((u) => u.id === order.userId);
//     const matchesLocal = !selectedLocal || 
//     user?.neighborhood?.toLowerCase().includes(selectedLocal.toLowerCase());
//     const matchesSituacao = !selectedSituacao || 
//     order.situacao.toLowerCase().includes(selectedSituacao.toLowerCase());
//     return matchesLocal && matchesSituacao;
//   });

//   // Alterna a seleção de um pedido
//   const toggleOrderSelection = (orderId: string) => {
//     setSelectedOrderIds((prevSelected) =>
//       prevSelected.includes(orderId)
//         ? prevSelected.filter((id) => id !== orderId)
//         : [...prevSelected, orderId]
//     );
//   };


//   const openBulkFinalizeModal = () => {
//     if (selectedOrderIds.length === 0) {
//       showAlert("alerta", "Nenhum pedido selecionado!");
//       return;
//     }
//     setIsBulkFinalizeModalOpen(true);
//   };

//   // Atualiza os pedidos após finalização em lote
//   const handleBulkFinalize = (updates: { id: string; dataEntregue: string | null }[]) => {
//     setOrders((prevOrders) =>
//       prevOrders.map((order) => {
//         const update = updates.find((upd) => upd.id === order.id);
//         return update ? { ...order, situacao: "Finalizado", dataEntregue: update.dataEntregue } : order;
//       })
//     );
//   };

//   // Função para gerar o PDF com os pedidos selecionados
//   const downloadPDF = async () => {
//     if (selectedOrderIds.length === 0) {
//       showAlert("alerta", "Nenhum pedido selecionado!");
//       return;
//     }

//     const doc = new jsPDF("l", "pt", "a4"); // Alterado para modo paisagem
//     const pageWidth = doc.internal.pageSize.getWidth();
//     const pageHeight = doc.internal.pageSize.getHeight();

//     // Função para converter imagem para Base64 com opacidade
//     const getTransparentImage = async (imgPath: string, opacity: number): Promise<string> => {
//       return new Promise((resolve) => {
//         const img = new Image();
//         img.src = imgPath;
//         img.crossOrigin = "Anonymous";
//         img.onload = () => {
//           const canvas = document.createElement("canvas");
//           canvas.width = img.width;
//           canvas.height = img.height;
//           const ctx = canvas.getContext("2d");
//           if (ctx) {
//             ctx.globalAlpha = opacity;
//             ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
//             resolve(canvas.toDataURL("image/png"));
//           }
//         };
//       });
//     };

//     const watermarkBase64 = await getTransparentImage(watermarkImage, 0.1);
//     doc.addImage(watermarkBase64, "PNG", 50, 50, pageWidth - 100, pageHeight - 100);

//     // Cabeçalho do PDF
//     doc.setFont("helvetica", "bold");
//     doc.setFontSize(16);
//     doc.setTextColor(40, 40, 40);
//     doc.text("Lista de Pedidos", pageWidth / 2, 40, { align: "center" });
//     doc.setFontSize(12);
//     doc.text(`Serviço: ${selectedService} | Local: ${selectedLocal}`, pageWidth / 2, 60, { align: "center" });

//     // Filtra os pedidos selecionados
//     const ordersToInclude = filteredOrders.filter((order) => selectedOrderIds.includes(order.id));

//     // Prepara os dados para a tabela
//     const tableColumn = ["Nome", "Apelido", "Localidade", "Contato", "Solicitado", "Entregue", "Assinatura"];
//     const tableRows: string[][] = ordersToInclude.map((order) => {
//       const user = users.find((u) => u.id === order.userId);
//       return [
//         user?.name || "N/A",
//         user?.apelido || "N/A",
//         user?.referencia || "N/A",
//         user?.phone || "N/A",
//         formatDate(order.data),
//         order.dataEntregue ? formatDate(order.dataEntregue) : "",
//         "",
//       ];
//     });

//     doc.autoTable({
//       startY: 80,
//       head: [tableColumn],
//       body: tableRows,
//       theme: "grid",
//       styles: {
//         head: {
//           fillColor: [41, 128, 185],
//           textColor: 255,
//           fontStyle: "bold",
//           halign: "center",
//         },
//         body: {
//           textColor: 50,
//           halign: "center",
//         },
//         alternateRow: { fillColor: [238, 238, 238] },
//         font: "helvetica",
//         fontSize: 10,
//       },
//       margin: { top: 80, bottom: 40 },
//       didDrawPage: (data) => {
//         const pageStr = "Página " + doc.getNumberOfPages();
//         doc.setFontSize(10);
//         doc.text(pageStr, data.settings.margin.left, pageHeight - 10);
//       },
//     });

//     doc.save("lista-pedidos.pdf");

//   };

//   return (
//     <section className="flex flex-col w-full h-full p-5">
//       {/* Modal de seleção de Mês e Ano */}
//       {isPopupOpen && (
//         <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center">
//           <div className="bg-white w-[300px] p-6 rounded-lg shadow-lg">
//             <h2 className="text-xl font-bold mb-4 text-center">Selecione Mês e Ano</h2>
//             <div className="flex gap-4 mb-4 justify-center">
//               <select
//                 value={selectedMonth}
//                 onChange={(e) => setSelectedMonth(e.target.value)}
//                 className="border w-1/2 rounded px-2 py-1"
//               >
//                 {[...Array(12)].map((_, i) => {
//                   const monthValue = (i + 1).toString().padStart(2, "0");
//                   return (
//                     <option key={i + 1} value={monthValue}>
//                       {getMonthName(monthValue)}
//                     </option>
//                   );
//                 })}
//               </select>
//               <select
//                 value={selectedYear}
//                 onChange={(e) => setSelectedYear(e.target.value)}
//                 className="border w-1/2 rounded px-2 py-1"
//               >
//                 {[...Array(2)].map((_, i) => (
//                   <option key={i} value={(currentDate.getFullYear() - i).toString()}>
//                     {currentDate.getFullYear() - i}
//                   </option>
//                 ))}
//               </select>
//             </div>
//             <button
//               className="bg-gradient-to-r from-[#0E9647] to-[#165C38] w-full font-bold text-white px-4 py-2 rounded hover:opacity-80"
//               onClick={() => setIsPopupOpen(false)}
//             >
//               Confirmar
//             </button>
//           </div>
//         </div>
//       )}

//       {/* ================================================================ */}
// {/* INÍCIO DA NOVA SEÇÃO DE FILTROS E AÇÕES             */}
// {/* ================================================================ */}
// <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6 shadow-sm">
//   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
//   <div>
//   <label htmlFor="service-filter" className="block text-sm font-medium text-slate-700 mb-1">Serviço</label>
//   <input
//     type="text"
//     id="service-filter"
//     value={selectedService}
//     onChange={(e) => setSelectedService(e.target.value)}
//     placeholder="Digite ou selecione o serviço..."
//     className="w-full bg-white border border-slate-300 rounded-lg py-2 px-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
//     list="service-list" // <-- Conecta o input com o datalist
//   />
//   {/* O datalist fornece as opções de autocomplete */}
//   <datalist id="service-list">
//     {apiServicos.map((servico) => (
//       <option key={servico} value={servico} />
//     ))}
//   </datalist>
// </div>

//     {/* Substitua o filtro de Localidade por este */}
// <div>
//   <label htmlFor="local-filter" className="block text-sm font-medium text-slate-700 mb-1">Localidade</label>
//   <div className="relative">
//     <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
//       <MagnifyingGlassIcon className="h-5 w-5 text-slate-400" aria-hidden="true" />
//     </div>
//     <input
//       type="text"
//       id="local-filter"
//       value={selectedLocal}
//       onChange={(e) => setSelectedLocal(e.target.value)}
//       placeholder="Buscar por localidade..."
//       className="w-full bg-white border border-slate-300 rounded-lg py-2 pl-10 pr-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
//       list="local-list" // <-- Conecta o input com o datalist
//     />
//     {/* O datalist fornece as opções de autocomplete */}
//     <datalist id="local-list">
//       {localOptions.map((local) => (
//         <option key={local} value={local} />
//       ))}
//     </datalist>
//   </div>
// </div>

//     {/* --- Filtro de Situação (Busca) --- */}
//     <div>
//       <label htmlFor="situacao-filter" className="block text-sm font-medium text-slate-700 mb-1">Situação</label>
//       <div className="relative">
//         <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
//           <MagnifyingGlassIcon className="h-5 w-5 text-slate-400" aria-hidden="true" />
//         </div>
//         <input
//           type="text"
//           id="situacao-filter"
//           value={selectedSituacao}
//           onChange={(e) => setSelectedSituacao(e.target.value)}
//           placeholder="Buscar por situação..."
//           className="w-full bg-white border border-slate-300 rounded-lg py-2 pl-10 pr-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
//         />
//       </div>
//     </div>

//     {/* --- Filtro de Período --- */}
//     <div>
//       <label htmlFor="period-filter" className="block text-sm font-medium text-slate-700 mb-1">Período</label>
//       <button
//         id="period-filter"
//         onClick={() => setIsPopupOpen(true)}
//         className="w-full flex items-center justify-between bg-white border border-slate-300 rounded-lg py-2 px-3 shadow-sm text-slate-800 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//       >
//         <span>{getMonthName(selectedMonth)}, {selectedYear}</span>
//         <CalendarDaysIcon className="h-5 w-5 text-slate-400" />
//       </button>
//     </div>

//   </div>
// </div>

// {/* --- BARRA DE AÇÕES E RESULTADOS --- */}
// <div className="flex flex-col md:flex-row items-center justify-between mb-4 px-1">
//   <div className="text-sm font-medium text-slate-700">
//     <span className="font-bold text-indigo-600 text-lg">{filteredOrders.length}</span>
//     {filteredOrders.length === 1 ? ' pedido encontrado' : ' pedidos encontrados'}
//   </div>
//   <div className="flex items-center gap-3 mt-4 md:mt-0">
//     <button
//       onClick={openBulkFinalizeModal}
//       className="flex items-center gap-2 bg-white border border-slate-300 text-slate-700 font-semibold px-4 py-2 rounded-lg shadow-sm hover:bg-slate-100 transition-colors"
//     >
//       <ListBulletIcon className="h-5 w-5" />
//       Alterar Situação
//     </button>
//     <button
//       onClick={downloadPDF}
//       className="flex items-center gap-2 bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg shadow-sm hover:bg-indigo-700 transition-colors"
//     >
//       <ArrowDownTrayIcon className="h-5 w-5" />
//       Baixar PDF
//     </button>
//   </div>
// </div>


//       {/* Modal para finalização em lote */}
//       {isBulkFinalizeModalOpen && (
//         <BulkFinalizeModal
//           selectedOrders={orders.filter((order) => selectedOrderIds.includes(order.id))}
//           onClose={() => setIsBulkFinalizeModalOpen(false)}
//           onBulkFinalize={handleBulkFinalize}
//           usuario={usuario}
//         />
//       )}

//       <div className="border border-black w-full mb-4"></div>

//       <div className="w-full h-full">
//         <ListaPedidos
//           pedidos={filteredOrders}
//           local={selectedLocal}
//           onUpdate={async (id, situacao) => {
//             try {
//               const dataEntregue = situacao === "Finalizado" ? new Date().toISOString() : null;
//               const response = await api.put(`/orders/${id}`, {
//                 usuario,
//                 situacao,
//                 dataEntregue,
//               });
//               if (response.status === 200) {
//                 setOrders((prevOrders) =>
//                   prevOrders.map((order) =>
//                     order.id === id ? { ...order, usuario, situacao, dataEntregue } : order
//                   )
//                 );
//               } else {
//                 alert("Falha ao atualizar a situação do pedido.");
//               }
//             } catch (error) {
//               console.error("Erro ao atualizar a situação do pedido:", error);
//               alert("Erro ao atualizar a situação do pedido. Tente novamente.");
//             }
//           }}
//           selectedOrderIds={selectedOrderIds}
//           toggleOrderSelection={toggleOrderSelection}
//           isSelectionMode={selectedOrderIds.length > 0}
//         />
//       </div>
//       {alertVisible && <Alert type={alertType} text={alertText} onClose={closeAlert} />}
//     </section>
//   );
// };

// export default PedidosComponent;


// import { useState, useEffect } from "react";
// import ListaPedidos from "./pedidos/ListaPedidos";
// import api from "../services/api";
// import jsPDF from "jspdf";
// import "jspdf-autotable"; // Plugin para criação de tabelas no jsPDF
// import watermarkImage from "../assets/logoIcon.png";
// import { PessoaProps, UserProps, OrdersProps } from "../types/types";
// import BulkFinalizeModal from "./popup/BulkFinalizeModal";
// import Alert from "./alerts/alertDesktop";
// import { MagnifyingGlassIcon, CalendarDaysIcon, ListBulletIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';

// declare module "jspdf" {
//   interface jsPDF {
//     autoTable: (options: {
//       head: string[][];
//       body: string[][];
//       startY?: number;
//       theme?: string;
//       styles?: Record<string, unknown>;
//       margin?: { top: number; bottom: number };
//       didDrawPage?: (data: { settings: { margin: { left: number } } }) => void;
//     }) => jsPDF;
//   }
// }

// interface PedidosComponentProps {
//   usuario: UserProps;
// }

// export const PedidosComponent: React.FC<PedidosComponentProps> = ({ usuario }) => {

//   const [alertVisible, setAlertVisible] = useState(false);
//   const [alertType, setAlertType] = useState<"alerta" | "error" | "info" | "sucesso">("info");
//   const [alertText, setAlertText] = useState("");

//   // Estados para armazenar pedidos e usuários
//   const [orders, setOrders] = useState<OrdersProps[]>([]);
//   const [users, setUsers] = useState<PessoaProps[]>([]);

//   // Estados dos filtros
//   const [selectedService, setSelectedService] = useState("");
//   const [selectedSituacao, setSelectedSituacao] = useState("");
//   const [selectedLocal, setSelectedLocal] = useState("");

//   // Estados de data (mês/ano)
//   const currentDate = new Date();
//   const currentMonth = (currentDate.getMonth() + 1).toString().padStart(2, "0");
//   const currentYear = currentDate.getFullYear().toString();
//   const [selectedMonth, setSelectedMonth] = useState(currentMonth);
//   const [selectedYear, setSelectedYear] = useState(currentYear);

//   // Outros estados
//   const [isPopupOpen, setIsPopupOpen] = useState(false);
//   const [localOptions, setLocalOptions] = useState<string[]>([]);
//   const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
//   const [isBulkFinalizeModalOpen, setIsBulkFinalizeModalOpen] = useState(false);

//   const apiServicos = [
//     "Água",
//     "Trator",
//     "Semente",
//     "Retroescavadeira",
//     "CAR",
//     "CAF",
//     "RGP",
//     "GTA",
//     "Mudas",
//     "Carta de Anuência Ambiental",
//     "Serviço de Inspeção Municipal",
//     "Declaração de Agricultor/a",
//     "Declaração de Pescador/a",
//     "Caderneta de Pescador/a",
//   ];

//   useEffect(() => {
//     const fetchLocalidades = async () => {
//       try {
//         const response = await api.get("/localidades");
//         // Mapeamos para obter apenas os nomes das localidades
//         const localidades = response.data.map((item: { localidade: string }) => item.localidade);
//         setLocalOptions(localidades);
//       } catch (error) {
//         console.error("Erro ao buscar localidades:", error);
//       }
//     };

//     fetchLocalidades();
//   }, []); // Array de dependências vazio para executar apenas uma vez

//   const getMonthName = (month: string) => {
//     const months = [
//       "Janeiro",
//       "Fevereiro",
//       "Março",
//       "Abril",
//       "Maio",
//       "Junho",
//       "Julho",
//       "Agosto",
//       "Setembro",
//       "Outubro",
//       "Novembro",
//       "Dezembro",
//     ];
//     return months[parseInt(month) - 1];
//   };

//   // Busca pedidos e usuários conforme os filtros selecionados
//   useEffect(() => {
//     const fetchOrdersAndUsers = async () => {
//       try {
//         if (selectedService && selectedMonth && selectedYear) {
//           const ordersResponse = await api.get("/orders", {
//             params: {
//               servico: selectedService,
//               mes: selectedMonth,
//               ano: selectedYear,
//             },
//           });
//           setOrders(ordersResponse.data);

//           const userIds = Array.from(new Set(ordersResponse.data.map((order: OrdersProps) => order.userId)));
//           const userResponses = await Promise.all(
//             userIds.map((userId) => api.get(`/users/${userId}`).then((res) => res.data))
//           );
//           setUsers(userResponses);
//         }
//       } catch (error) {
//         console.error("Erro ao buscar dados:", error);
//       }
//     };

//     fetchOrdersAndUsers();
//   }, [selectedService, selectedMonth, selectedYear]);

//   const showAlert = (type: "alerta" | "error" | "info" | "sucesso", text: string) => {
//     setAlertType(type);
//     setAlertText(text);
//     setAlertVisible(true);
//   };



//   const closeAlert = () => {
//     setAlertVisible(false);
//   };

//   // Formata a data para dd/mm/yyyy
//   const formatDate = (date: string | null): string => {
//     if (!date) return "";
//     const parsedDate = new Date(date);
//     const day = String(parsedDate.getDate()).padStart(2, "0");
//     const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
//     const year = parsedDate.getFullYear();
//     return `${day}/${month}/${year}`;
//   };

//   // Filtra pedidos conforme local e situação
//   const filteredOrders = orders.filter((order) => {
//     const user = users.find((u) => u.id === order.userId);
//     const matchesLocal = !selectedLocal || 
//     user?.neighborhood?.toLowerCase().includes(selectedLocal.toLowerCase());
//     const matchesSituacao = !selectedSituacao || 
//     order.situacao.toLowerCase().includes(selectedSituacao.toLowerCase());
//     return matchesLocal && matchesSituacao;
//   });

//   // Alterna a seleção de um pedido
//   const toggleOrderSelection = (orderId: string) => {
//     setSelectedOrderIds((prevSelected) =>
//       prevSelected.includes(orderId)
//         ? prevSelected.filter((id) => id !== orderId)
//         : [...prevSelected, orderId]
//     );
//   };


//   const openBulkFinalizeModal = () => {
//     if (selectedOrderIds.length === 0) {
//       showAlert("alerta", "Nenhum pedido selecionado!");
//       return;
//     }
//     setIsBulkFinalizeModalOpen(true);
//   };

//   // Atualiza os pedidos após finalização em lote
//   const handleBulkFinalize = (updates: { id: string; dataEntregue: string | null }[]) => {
//     setOrders((prevOrders) =>
//       prevOrders.map((order) => {
//         const update = updates.find((upd) => upd.id === order.id);
//         return update ? { ...order, situacao: "Finalizado", dataEntregue: update.dataEntregue } : order;
//       })
//     );
//   };

//   // Função para gerar o PDF com os pedidos selecionados
//   const downloadPDF = async () => {
//     if (selectedOrderIds.length === 0) {
//       showAlert("alerta", "Nenhum pedido selecionado!");
//       return;
//     }

//     const doc = new jsPDF("l", "pt", "a4"); // Alterado para modo paisagem
//     const pageWidth = doc.internal.pageSize.getWidth();
//     const pageHeight = doc.internal.pageSize.getHeight();

//     // Função para converter imagem para Base64 com opacidade
//     const getTransparentImage = async (imgPath: string, opacity: number): Promise<string> => {
//       return new Promise((resolve) => {
//         const img = new Image();
//         img.src = imgPath;
//         img.crossOrigin = "Anonymous";
//         img.onload = () => {
//           const canvas = document.createElement("canvas");
//           canvas.width = img.width;
//           canvas.height = img.height;
//           const ctx = canvas.getContext("2d");
//           if (ctx) {
//             ctx.globalAlpha = opacity;
//             ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
//             resolve(canvas.toDataURL("image/png"));
//           }
//         };
//       });
//     };

//     const watermarkBase64 = await getTransparentImage(watermarkImage, 0.1);
//     doc.addImage(watermarkBase64, "PNG", 50, 50, pageWidth - 100, pageHeight - 100);

//     // Cabeçalho do PDF
//     doc.setFont("helvetica", "bold");
//     doc.setFontSize(16);
//     doc.setTextColor(40, 40, 40);
//     doc.text("Lista de Pedidos", pageWidth / 2, 40, { align: "center" });
//     doc.setFontSize(12);
//     doc.text(`Serviço: ${selectedService} | Local: ${selectedLocal}`, pageWidth / 2, 60, { align: "center" });

//     // Filtra os pedidos selecionados
//     const ordersToInclude = filteredOrders.filter((order) => selectedOrderIds.includes(order.id));

//     // Prepara os dados para a tabela
//     const tableColumn = ["Nome", "Apelido", "Localidade", "Contato", "Solicitado", "Entregue", "Assinatura"];
//     const tableRows: string[][] = ordersToInclude.map((order) => {
//       const user = users.find((u) => u.id === order.userId);
//       return [
//         user?.name || "N/A",
//         user?.apelido || "N/A",
//         user?.referencia || "N/A",
//         user?.phone || "N/A",
//         formatDate(order.data),
//         order.dataEntregue ? formatDate(order.dataEntregue) : "",
//         "",
//       ];
//     });

//     doc.autoTable({
//       startY: 80,
//       head: [tableColumn],
//       body: tableRows,
//       theme: "grid",
//       styles: {
//         head: {
//           fillColor: [41, 128, 185],
//           textColor: 255,
//           fontStyle: "bold",
//           halign: "center",
//         },
//         body: {
//           textColor: 50,
//           halign: "center",
//         },
//         alternateRow: { fillColor: [238, 238, 238] },
//         font: "helvetica",
//         fontSize: 10,
//       },
//       margin: { top: 80, bottom: 40 },
//       didDrawPage: (data) => {
//         const pageStr = "Página " + doc.getNumberOfPages();
//         doc.setFontSize(10);
//         doc.text(pageStr, data.settings.margin.left, pageHeight - 10);
//       },
//     });

//     doc.save("lista-pedidos.pdf");

//   };

//   return (
//     <section className="flex flex-col w-full h-full p-5">
//       {/* Modal de seleção de Mês e Ano */}
//       {isPopupOpen && (
//         <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center">
//           <div className="bg-white w-[300px] p-6 rounded-lg shadow-lg">
//             <h2 className="text-xl font-bold mb-4 text-center">Selecione Mês e Ano</h2>
//             <div className="flex gap-4 mb-4 justify-center">
//               <select
//                 value={selectedMonth}
//                 onChange={(e) => setSelectedMonth(e.target.value)}
//                 className="border w-1/2 rounded px-2 py-1"
//               >
//                 {[...Array(12)].map((_, i) => {
//                   const monthValue = (i + 1).toString().padStart(2, "0");
//                   return (
//                     <option key={i + 1} value={monthValue}>
//                       {getMonthName(monthValue)}
//                     </option>
//                   );
//                 })}
//               </select>
//               <select
//                 value={selectedYear}
//                 onChange={(e) => setSelectedYear(e.target.value)}
//                 className="border w-1/2 rounded px-2 py-1"
//               >
//                 {[...Array(2)].map((_, i) => (
//                   <option key={i} value={(currentDate.getFullYear() - i).toString()}>
//                     {currentDate.getFullYear() - i}
//                   </option>
//                 ))}
//               </select>
//             </div>
//             <button
//               className="bg-gradient-to-r from-[#0E9647] to-[#165C38] w-full font-bold text-white px-4 py-2 rounded hover:opacity-80"
//               onClick={() => setIsPopupOpen(false)}
//             >
//               Confirmar
//             </button>
//           </div>
//         </div>
//       )}

//       {/* ================================================================ */}
// {/* INÍCIO DA NOVA SEÇÃO DE FILTROS E AÇÕES             */}
// {/* ================================================================ */}
// <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6 shadow-sm">
//   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
//   <div>
//   <label htmlFor="service-filter" className="block text-sm font-medium text-slate-700 mb-1">Serviço</label>
//   <input
//     type="text"
//     id="service-filter"
//     value={selectedService}
//     onChange={(e) => setSelectedService(e.target.value)}
//     placeholder="Digite ou selecione o serviço..."
//     className="w-full bg-white border border-slate-300 rounded-lg py-2 px-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
//     list="service-list" // <-- Conecta o input com o datalist
//   />
//   {/* O datalist fornece as opções de autocomplete */}
//   <datalist id="service-list">
//     {apiServicos.map((servico) => (
//       <option key={servico} value={servico} />
//     ))}
//   </datalist>
// </div>

//     {/* Substitua o filtro de Localidade por este */}
// <div>
//   <label htmlFor="local-filter" className="block text-sm font-medium text-slate-700 mb-1">Localidade</label>
//   <div className="relative">
//     <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
//       <MagnifyingGlassIcon className="h-5 w-5 text-slate-400" aria-hidden="true" />
//     </div>
//     <input
//       type="text"
//       id="local-filter"
//       value={selectedLocal}
//       onChange={(e) => setSelectedLocal(e.target.value)}
//       placeholder="Buscar por localidade..."
//       className="w-full bg-white border border-slate-300 rounded-lg py-2 pl-10 pr-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
//       list="local-list" // <-- Conecta o input com o datalist
//     />
//     {/* O datalist fornece as opções de autocomplete */}
//     <datalist id="local-list">
//       {localOptions.map((local) => (
//         <option key={local} value={local} />
//       ))}
//     </datalist>
//   </div>
// </div>

//     {/* --- Filtro de Situação (Busca) --- */}
//     <div>
//       <label htmlFor="situacao-filter" className="block text-sm font-medium text-slate-700 mb-1">Situação</label>
//       <div className="relative">
//         <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
//           <MagnifyingGlassIcon className="h-5 w-5 text-slate-400" aria-hidden="true" />
//         </div>
//         <input
//           type="text"
//           id="situacao-filter"
//           value={selectedSituacao}
//           onChange={(e) => setSelectedSituacao(e.target.value)}
//           placeholder="Buscar por situação..."
//           className="w-full bg-white border border-slate-300 rounded-lg py-2 pl-10 pr-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
//         />
//       </div>
//     </div>

//     {/* --- Filtro de Período --- */}
//     <div>
//       <label htmlFor="period-filter" className="block text-sm font-medium text-slate-700 mb-1">Período</label>
//       <button
//         id="period-filter"
//         onClick={() => setIsPopupOpen(true)}
//         className="w-full flex items-center justify-between bg-white border border-slate-300 rounded-lg py-2 px-3 shadow-sm text-slate-800 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//       >
//         <span>{getMonthName(selectedMonth)}, {selectedYear}</span>
//         <CalendarDaysIcon className="h-5 w-5 text-slate-400" />
//       </button>
//     </div>

//   </div>
// </div>

// {/* --- BARRA DE AÇÕES E RESULTADOS --- */}
// <div className="flex flex-col md:flex-row items-center justify-between mb-4 px-1">
//   <div className="text-sm font-medium text-slate-700">
//     <span className="font-bold text-indigo-600 text-lg">{filteredOrders.length}</span>
//     {filteredOrders.length === 1 ? ' pedido encontrado' : ' pedidos encontrados'}
//   </div>
//   <div className="flex items-center gap-3 mt-4 md:mt-0">
//     <button
//       onClick={openBulkFinalizeModal}
//       className="flex items-center gap-2 bg-white border border-slate-300 text-slate-700 font-semibold px-4 py-2 rounded-lg shadow-sm hover:bg-slate-100 transition-colors"
//     >
//       <ListBulletIcon className="h-5 w-5" />
//       Alterar Situação
//     </button>
//     <button
//       onClick={downloadPDF}
//       className="flex items-center gap-2 bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg shadow-sm hover:bg-indigo-700 transition-colors"
//     >
//       <ArrowDownTrayIcon className="h-5 w-5" />
//       Baixar PDF
//     </button>
//   </div>
// </div>


//       {/* Modal para finalização em lote */}
//       {isBulkFinalizeModalOpen && (
//         <BulkFinalizeModal
//           selectedOrders={orders.filter((order) => selectedOrderIds.includes(order.id))}
//           onClose={() => setIsBulkFinalizeModalOpen(false)}
//           onBulkFinalize={handleBulkFinalize}
//           usuario={usuario}
//         />
//       )}

//       <div className="border border-black w-full mb-4"></div>

//       <div className="w-full h-full">
//         <ListaPedidos
//           pedidos={filteredOrders}
//           local={selectedLocal}
//           onUpdate={async (id, situacao) => {
//             try {
//               const dataEntregue = situacao === "Finalizado" ? new Date().toISOString() : null;
//               const response = await api.put(`/orders/${id}`, {
//                 usuario,
//                 situacao,
//                 dataEntregue,
//               });
//               if (response.status === 200) {
//                 setOrders((prevOrders) =>
//                   prevOrders.map((order) =>
//                     order.id === id ? { ...order, usuario, situacao, dataEntregue } : order
//                   )
//                 );
//               } else {
//                 alert("Falha ao atualizar a situação do pedido.");
//               }
//             } catch (error) {
//               console.error("Erro ao atualizar a situação do pedido:", error);
//               alert("Erro ao atualizar a situação do pedido. Tente novamente.");
//             }
//           }}
//           selectedOrderIds={selectedOrderIds}
//           toggleOrderSelection={toggleOrderSelection}
//           isSelectionMode={selectedOrderIds.length > 0}
//         />
//       </div>
//       {alertVisible && <Alert type={alertType} text={alertText} onClose={closeAlert} />}
//     </section>
//   );
// };

// export default PedidosComponent;


import { useState, useEffect } from "react";
import ListaPedidos from "./pedidos/ListaPedidos";
import api from "../services/api";
import jsPDF from "jspdf";
import "jspdf-autotable"; // Plugin para criação de tabelas no jsPDF
import logo from "../assets/logoIcon.jpeg";
import { PessoaProps, UserProps, OrdersProps } from "../types/types";
import BulkFinalizeModal from "./popup/BulkFinalizeModal";
import Alert from "./alerts/alertDesktop";
import { MagnifyingGlassIcon, CalendarDaysIcon, ListBulletIcon, ArrowDownTrayIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline';
import autoTable from "jspdf-autotable";

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
  const [selectedSituacao, setSelectedSituacao] = useState("");
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
    "Mudas",
    "Carta de Anuência Ambiental",
    "Serviço de Inspeção Municipal",
    "Declaração de Agricultor/a",
    "Declaração de Pescador/a",
    "Caderneta de Pescador/a",
  ];

  useEffect(() => {
    const fetchLocalidades = async () => {
      try {
        const response = await api.get("/localidades");
        // Mapeamos para obter apenas os nomes das localidades
        const localidades = response.data.map((item: { localidade: string }) => item.localidade);
        setLocalOptions(localidades);
      } catch (error) {
        console.error("Erro ao buscar localidades:", error);
      }
    };

    fetchLocalidades();
  }, []); // Array de dependências vazio para executar apenas uma vez

  // Adicione esta nova função dentro do seu componente PedidosComponent
  const exportAsText = () => {
    // 1. Filtra apenas os pedidos que foram selecionados
    const ordersToExport = filteredOrders.filter((order) =>
      selectedOrderIds.includes(order.id)
    );

    if (ordersToExport.length === 0) {
      showAlert("alerta", "Nenhum pedido selecionado para exportar!");
      return;
    }

    // 2. Formata a lista de texto
    const textList = ordersToExport
      .map((order, index) => {
        const user = users.find((u) => u.id === order.userId);
        if (!user) return ""; // Retorna string vazia se o usuário não for encontrado

        // Constrói o bloco de texto para cada usuário no formato solicitado
        const nameLine = `${index + 1}) ${user.name?.toUpperCase() || ''}, ${user.apelido?.toUpperCase() || ''}`;
        const neighborhoodLine = user.neighborhood || '';
        const referenceLine = user.referencia || '';
        const phoneLine = user.phone || '';

        // Junta as linhas, garantindo que linhas vazias não criem espaços extras
        return [nameLine, neighborhoodLine, referenceLine, phoneLine]
          .filter(line => line) // Remove linhas vazias
          .join('\n');
      })
      .filter(block => block) // Remove blocos de usuário vazios
      .join('\n\n'); // Adiciona uma linha em branco entre cada bloco de usuário

    // 3. Usa a API do Navegador para copiar o texto para a área de transferência
    navigator.clipboard.writeText(textList).then(() => {
      // 4. Mostra um alerta de sucesso
      showAlert("sucesso", "Lista de pedidos copiada para a área de transferência!");
    }).catch(err => {
      console.error("Erro ao copiar texto: ", err);
      showAlert("error", "Não foi possível copiar o texto.");
    });
  };

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
    const matchesLocal = !selectedLocal ||
      user?.neighborhood?.toLowerCase().includes(selectedLocal.toLowerCase());
    const matchesSituacao = !selectedSituacao ||
      order.situacao.toLowerCase().includes(selectedSituacao.toLowerCase());
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

  const drawHeader = (doc: jsPDF, service: string, total: number) => {
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 30;

    // Logo (um pouco menor e mais para cima)
    doc.addImage(logo, 'PNG', margin, 20, 35, 35);

    // Título Principal (fonte menor e mais para cima)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(45, 55, 72);
    doc.text("Relatório de Pedidos Selecionados", margin + 45, 35);

    // Subtítulo
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(`Serviço: ${service || "Todos"}`, margin + 45, 48);

    // Metadados (data e total em uma única linha para economizar espaço)
    const generationDate = new Date().toLocaleDateString("pt-BR");
    doc.setFontSize(8);
    doc.text(
      `Gerado em: ${generationDate} | Total de Pedidos: ${total}`,
      pageWidth - margin,
      35,
      { align: 'right' }
    );

    // Linha Separadora (mais para cima)
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(1);
    doc.line(margin, 65, pageWidth - margin, 65);
  };

  // 3. Helper para desenhar o rodapé com o número da página
  const drawFooter = (doc: jsPDF, pageNumber: number, pageCount: number) => {
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Página ${pageNumber} de ${pageCount}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 20,
      { align: 'center' }
    );
  };
  // SUBSTITUA sua função downloadPDF por esta versão refatorada
  const downloadPDF = async () => {
    const ordersToInclude = orders.filter((order) => selectedOrderIds.includes(order.id));

    if (ordersToInclude.length === 0) {
      showAlert("alerta", "Nenhum pedido selecionado para gerar o PDF!");
      return;
    }

    try {
      const doc = new jsPDF({ orientation: "landscape" });

      // Usa o helper para desenhar o cabeçalho
      drawHeader(doc, selectedService, ordersToInclude.length);


      // Prepara os dados para a tabela
      const tableColumn = ["Nome", "Apelido", "Localidade", "Referência", "Contato", "Data da Entrega", "Assinatura"];
      const tableRows = ordersToInclude.map((order) => {
        const user = users.find((u) => u.id === order.userId);
        return [
          user?.name || "N/A",
          user?.apelido || "N/A",
          user?.neighborhood || "N/A",
          user?.referencia || "N/A",
          user?.phone || "N/A",
          order.dataEntregue ? formatDate(order.dataEntregue) : "Pendente",
          "",
        ];
      });

      // Gera a tabela com o autoTable
      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 70,
        theme: 'grid',
        headStyles: { fillColor: [30, 41, 59], textColor: 255, fontStyle: 'bold' },
        styles: { fontSize: 8, cellPadding: 4, valign: 'middle' },
        columnStyles: { /* ... seus estilos de coluna ... */ },
        didDrawPage: (data) => {
          // Usa o helper para desenhar o rodapé em cada página
          drawFooter(doc, data.pageNumber, doc.getNumberOfPages());
        }
      });

      doc.save(`relatorio_pedidos_${selectedService.toLowerCase().replace(/ /g, '_')}.pdf`);

    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      showAlert("error", "Não foi possível gerar o PDF. Verifique o logo e tente novamente.");
    }
  };

  return (
    // Substitua a estrutura do seu `return` por esta base:
    // ESTRUTURA PRINCIPAL: GRID DE 2 COLUNAS (LG) E 1 COLUNA (PADRÃO)
    <section className="grid grid-cols-1 lg:grid-cols-4 gap-6 p-4 sm:p-6 bg-slate-100 min-h-screen">

      {/* ================================================================ */}
      {/* COLUNA DA ESQUERDA (SIDEBAR DE CONTROLES)                      */}
      {/* ================================================================ */}
      <aside className="lg:col-span-1">
        <div className="lg:sticky lg:top-6 space-y-6">
          {/* PAINEL DE FILTROS */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-800 mb-4 border-b pb-3">Filtros</h2>
            <div className="space-y-4">
              {/* Filtro de Serviço */}
              <div>
                <label htmlFor="service-filter" className="block text-sm font-medium text-slate-700 mb-1">Serviço</label>
                <input type="text" id="service-filter" value={selectedService} onChange={(e) => setSelectedService(e.target.value)} placeholder="Digite ou selecione..." className="w-full bg-white border border-slate-300 rounded-lg py-2 px-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" list="service-list" />
                <datalist id="service-list">{apiServicos.map((s) => (<option key={s} value={s} />))}</datalist>
              </div>
              {/* Filtro de Localidade */}
              <div>
                <label htmlFor="local-filter" className="block text-sm font-medium text-slate-700 mb-1">Localidade</label>
                <div className="relative"><div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><MagnifyingGlassIcon className="h-5 w-5 text-slate-400" /></div><input type="text" id="local-filter" value={selectedLocal} onChange={(e) => setSelectedLocal(e.target.value)} placeholder="Buscar por localidade..." className="w-full bg-white border border-slate-300 rounded-lg py-2 pl-10 pr-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" list="local-list" /><datalist id="local-list">{localOptions.map((l) => (<option key={l} value={l} />))}</datalist></div>
              </div>
              {/* Filtro de Situação */}
              <div>
                <label htmlFor="situacao-filter" className="block text-sm font-medium text-slate-700 mb-1">Situação</label>
                <div className="relative"><div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><MagnifyingGlassIcon className="h-5 w-5 text-slate-400" /></div><input type="text" id="situacao-filter" value={selectedSituacao} onChange={(e) => setSelectedSituacao(e.target.value)} placeholder="Buscar por situação..." className="w-full bg-white border border-slate-300 rounded-lg py-2 pl-10 pr-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" /></div>
              </div>
              {/* Filtro de Período */}
              <div>
                <label htmlFor="period-filter" className="block text-sm font-medium text-slate-700 mb-1">Período</label>
                <button id="period-filter" onClick={() => setIsPopupOpen(true)} className="w-full flex items-center justify-between bg-white border border-slate-300 rounded-lg py-2 px-3 shadow-sm text-slate-800 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"><span>{getMonthName(selectedMonth)}, {selectedYear}</span><CalendarDaysIcon className="h-5 w-5 text-slate-400" /></button>
              </div>
            </div>
          </div>
          {/* PAINEL DE AÇÕES */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-800 mb-4 border-b pb-3">Ações e Resultados</h2>
            <div className="text-center mb-4">
              <span className="font-bold text-indigo-600 text-3xl">{filteredOrders.length}</span>
              <p className="text-sm font-medium text-slate-600">{filteredOrders.length === 1 ? ' pedido encontrado' : ' pedidos encontrados'}</p>
            </div>
            <div className="space-y-3">
              <button onClick={openBulkFinalizeModal} className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg shadow-sm hover:bg-indigo-700 transition-colors"><ListBulletIcon className="h-5 w-5" />Alterar Situação</button>
              <div className="grid grid-cols-2 gap-3">
                {/* ADICIONE O NOVO BOTÃO DE COPIAR TEXTO */}
                <button
                  onClick={exportAsText}
                  className="w-full flex items-center justify-center gap-2 bg-white border border-slate-300 text-slate-700 font-semibold px-4 py-2 rounded-lg shadow-sm hover:bg-slate-100 transition-colors"
                >
                  <ClipboardDocumentIcon className="h-5 w-5" />
                  Copiar Texto
                </button>

                {/* Botão de Baixar PDF (existente) */}
                <button
                  onClick={downloadPDF}
                  className="w-full flex items-center justify-center gap-2 bg-slate-600 text-white font-semibold px-4 py-2 rounded-lg shadow-sm hover:bg-slate-700 transition-colors"
                >
                  <ArrowDownTrayIcon className="h-5 w-5" />
                  Baixar PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* ================================================================ */}
      {/* COLUNA DA DIREITA (CONTEÚDO PRINCIPAL)                         */}
      {/* ================================================================ */}
      <main className="lg:col-span-3">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
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
      </main>

      {/* Seus modais e alertas podem continuar aqui no final */}
      {isPopupOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white w-[300px] p-6 rounded-lg shadow-lg">
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
      {isBulkFinalizeModalOpen && (
        <BulkFinalizeModal
          selectedOrders={orders.filter((order) => selectedOrderIds.includes(order.id))}
          onClose={() => setIsBulkFinalizeModalOpen(false)}
          onBulkFinalize={handleBulkFinalize}
          usuario={usuario}
        />
      )}
      {alertVisible && <Alert type={alertType} text={alertText} onClose={closeAlert} />}
    </section>
  );

};

export default PedidosComponent;
