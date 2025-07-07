import React, { useState, useEffect } from "react";
import { OrdersProps, UserProps, PessoaProps, DeliveryProps } from "../../types/types";
import api from "../../services/api";
import { UploadFileModal } from "../../pages/telaHome/UploadFileModal";

import {
  Cog6ToothIcon,
  UserCircleIcon,
  PencilSquareIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";

// Define os tipos de ação possíveis
type ActionType = "Finalizar" | "Inserir na Lista" | "Cancelar";

interface BulkFinalizeModalProps {
  selectedOrders: OrdersProps[];
  onClose: () => void;
  // A prop foi atualizada para ser mais flexível
  onBulkFinalize: (updates: { id: string; situacao: string; dataEntregue: string; imageUrl: string }[]) => void;
  usuario: UserProps;
}

const BulkFinalizeModal: React.FC<BulkFinalizeModalProps> = ({
  selectedOrders,
  onClose,
  onBulkFinalize,
  usuario,
}) => {
  // Estado para a ação selecionada (Finalizar, Inserir na Lista, Cancelar)
  const [selectedAction, setSelectedAction] = useState<ActionType>("Finalizar");
  
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

  // açteiruei aquiii

  // no componente BulkFinalizeModal...

// ...outros estados como selectedAction, isLoading, etc.

// --- ESTADOS PARA O CRUD DE ENTREGADORES ---
const [deliveryPeople, setDeliveryPeople] = useState<DeliveryProps[]>([]);
const [selectedDelivererId, setSelectedDelivererId] = useState<string>("");
const [isManaging, setIsManaging] = useState<boolean>(false);
const [isCrudLoading, setIsCrudLoading] = useState<boolean>(false);
const [editingDeliverer, setEditingDeliverer] = useState<DeliveryProps | null>(null);
const [delivererName, setDelivererName] = useState<string>("");

// Adicione um novo estado para controlar se a busca já foi feita
const [hasFetchedDeliverers, setHasFetchedDeliverers] = useState(false);

// --- EFEITO PARA BUSCAR OS ENTREGADORES (VERSÃO CORRIGIDA E ÚNICA) ---
useEffect(() => {
  // Só busca se a aba for a correta E se a busca ainda não tiver sido feita
  if (selectedAction === "Inserir na Lista" && !hasFetchedDeliverers) {
    const fetchDeliveryPeople = async () => {
      setIsLoading(true);
      try {
        const response = await api.get<DeliveryProps[]>("/delivery");
        setDeliveryPeople(response.data);
        if (response.data.length > 0) {
          setSelectedDelivererId(response.data[0].idDelivery);
        }
        // Marca que a busca foi concluída com sucesso
        setHasFetchedDeliverers(true); 
      } catch (error) {
        console.error("Erro ao buscar entregadores:", error);
        alert("Não foi possível carregar a lista de entregadores.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDeliveryPeople();
  }
}, [selectedAction, hasFetchedDeliverers]); // Executa quando a aba "Inserir na Lista" é selecionada

// --- FUNÇÕES DE MANIPULAÇÃO (HANDLERS) DO CRUD ---

const handleCreateOrUpdateDeliverer = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!delivererName.trim()) {
    alert("O nome do entregador não pode ser vazio.");
    return;
  }
  setIsCrudLoading(true);
  try {
    if (editingDeliverer) { // Lógica de ATUALIZAÇÃO (UPDATE)
      const { data: updatedDeliverer } = await api.put<DeliveryProps>(`/delivery/${editingDeliverer.idDelivery}`, { name: delivererName, tipo: "Entregador" });
      setDeliveryPeople(prev => prev.map(d => d.idDelivery === editingDeliverer.idDelivery ? updatedDeliverer : d));
    } else { // Lógica de CRIAÇÃO (CREATE)
      const { data: newDeliverer } = await api.post<DeliveryProps>('/delivery', { name: delivererName, tipo: "Entregador" });
      setDeliveryPeople(prev => [...prev, newDeliverer]);
      setSelectedDelivererId(newDeliverer.idDelivery); // Seleciona o novo entregador
    }
    // Limpa o formulário
    setDelivererName("");
    setEditingDeliverer(null);
  } catch (error) {
    console.error("Erro ao salvar entregador:", error);
    alert("Não foi possível salvar o entregador. Tente novamente.");
  } finally {
    setIsCrudLoading(false);
  }
};

const handleDeleteDeliverer = async (idToDelete: string) => {
  if (window.confirm("Tem certeza que deseja excluir este entregador? Esta ação não pode ser desfeita.")) {
    setIsCrudLoading(true);
    try {
      await api.delete(`/delivery/${idToDelete}`);
      const remainingDeliverers = deliveryPeople.filter(d => d.idDelivery !== idToDelete);
      setDeliveryPeople(remainingDeliverers);
      
      // Se o entregador excluído era o que estava selecionado...
      if (selectedDelivererId === idToDelete) {
        // ...seleciona o primeiro da lista restante ou limpa a seleção.
        setSelectedDelivererId(remainingDeliverers.length > 0 ? remainingDeliverers[0].idDelivery : "");
      }
    } catch (error) {
      console.error("Erro ao excluir entregador:", error);
      alert("Não foi possível excluir. Verifique se o entregador não possui entregas pendentes.");
    } finally {
      setIsCrudLoading(false);
    }
  }
};

const handleStartEdit = (deliverer: DeliveryProps) => {
  setEditingDeliverer(deliverer);
  setDelivererName(deliverer.name);
};

const handleCancelEdit = () => {
  setEditingDeliverer(null);
  setDelivererName("");
};

// ... resto do seu componente, incluindo a função renderActionSpecificFields ...

  // Busca os dados dos clientes dos pedidos
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

  // Busca os entregadores se a ação for "Inserir na Lista"
  useEffect(() => {
    const fetchDeliveryPeople = async () => {
      try {
        const response = await api.get("/delivery");
        setDeliveryPeople(response.data);
        // Define um valor padrão para o select
        if (response.data.length > 0) {
          setSelectedDelivererId(response.data[0].idDelivery);
        }
      } catch (error) {
        console.error("Erro ao buscar entregadores:", error);
        alert("Não foi possível carregar a lista de entregadores.");
      }
    };

    if (selectedAction === "Inserir na Lista") {
      fetchDeliveryPeople();
    }
  }, [selectedAction]);

  const handleDateChange = (orderId: string, newDate: string) => {
    setDeliveryDates((prev) => ({ ...prev, [orderId]: newDate }));
  };

  // Função unificada para confirmar a ação selecionada
  const handleConfirmAction = async () => {
    setIsLoading(true);

    // Validação para "Inserir na Lista"
    if (selectedAction === "Inserir na Lista" && !selectedDelivererId) { // <-- Use selectedDelivererId
      alert("Por favor, selecione um entregador.");
      setIsLoading(false);
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
        alert("Erro ao enviar a imagem. Tente novamente.");
        setIsLoading(false);
        return;
      }
    }

    try {
      const updates = await Promise.all(
        selectedOrders.map(async (order) => {
          // CORREÇÃO: Começamos com um payload base e montamos o resto dinamicamente.
          let payload: { usuario: UserProps; situacao?: string; dataEntregue?: string; imageUrl?: string | null } = { usuario };

          switch (selectedAction) {
            case "Finalizar": {
              const [year, month, day] = deliveryDates[order.id].split("-").map(Number);
              const localDate = new Date(year, month - 1, day);
              
              // Monta o payload específico para "Finalizar"
              payload = {
                ...payload,
                situacao: "Finalizado",
                dataEntregue: localDate.toISOString(),
                imageUrl: uploadedFileUrl,
              };
              break;
            }

            case "Inserir na Lista": {
              const deliverer = deliveryPeople.find(d => d.idDelivery === selectedDelivererId); 
  
              
              // Monta o payload específico para "Inserir na Lista", sem chaves extras
              payload = { 
                ...payload, 
                situacao: `Lista ${deliverer?.name || "Indefinido"}`,
              };
              break;
            }

            case "Cancelar": {
              // Monta o payload específico para "Cancelar"
              payload = { 
                ...payload, 
                situacao: "Cancelado" 
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
    switch(selectedAction) {
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
                  {/* --- SELEÇÃO PRINCIPAL DO ENTREGADOR --- */}
                  <div className="flex items-end gap-3">
                    <div className="flex-grow">
                      <label htmlFor="deliverer-select" className="block text-sm font-medium text-slate-600 mb-1">
                        Atribuir ao Entregador
                      </label>
                      <select
                        id="deliverer-select"
                        value={selectedDelivererId}
                        onChange={(e) => setSelectedDelivererId(e.target.value)}
                        disabled={isLoading || deliveryPeople.length === 0}
                        className="w-full p-2.5 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      >
                        {deliveryPeople.length > 0 ? (
                          deliveryPeople.map(d => <option key={d.idDelivery} value={d.idDelivery}>{d.name}</option>)
                        ) : (
                          <option>Nenhum entregador cadastrado</option>
                        )}
                      </select>
                    </div>
                    {/* Botão de gerenciar com ícone */}
                    <button
                      onClick={() => setIsManaging(!isManaging)}
                      title="Gerenciar Entregadores"
                      className="flex-shrink-0 h-[42px] w-[42px] flex items-center justify-center bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 hover:text-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <Cog6ToothIcon className="h-6 w-6" />
                    </button>
                  </div>
            
                  {/* --- PAINEL DE GERENCIAMENTO COM ANIMAÇÃO --- */}
                  <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isManaging ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="mt-6 pt-6 border-t border-slate-200">
                      {/* --- FORMULÁRIO DE CRIAR/EDITAR --- */}
                      <form onSubmit={handleCreateOrUpdateDeliverer} className="p-4 bg-slate-50 rounded-xl border border-slate-200 mb-6">
                          <h3 className="font-semibold text-base mb-3 text-slate-800">
                              {editingDeliverer ? "Editando Entregador" : "Adicionar Novo Entregador"}
                          </h3>
                          <div className="flex items-center gap-3">
                              <input
                                  type="text"
                                  placeholder="Nome do entregador"
                                  value={delivererName}
                                  onChange={(e) => setDelivererName(e.target.value)}
                                  className="flex-grow border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                  required
                              />
                              <button type="submit" title="Salvar" disabled={isCrudLoading} className="flex-shrink-0 h-9 w-9 flex items-center justify-center bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300 transition-colors">
                                  {isCrudLoading ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : <CheckIcon className="h-5 w-5" />}
                              </button>
                              {editingDeliverer && (
                                  <button type="button" title="Cancelar Edição" onClick={handleCancelEdit} className="flex-shrink-0 h-9 w-9 flex items-center justify-center bg-slate-500 text-white rounded-lg hover:bg-slate-600 transition-colors">
                                      <XMarkIcon className="h-5 w-5" />
                                  </button>
                              )}
                          </div>
                      </form>
            
                      {/* --- LISTA DE ENTREGADORES EM FORMATO DE CARTÃO --- */}
                      <div>
                        <h4 className="font-semibold text-base mb-3 text-slate-700">Entregadores Cadastrados</h4>
                        <ul className="max-h-52 overflow-y-auto space-y-2 pr-2 -mr-2">
                          {deliveryPeople.length > 0 ? (
                            deliveryPeople.map(d => (
                              <li key={d.idDelivery} className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all">
                                <div className="flex items-center gap-3">
                                  <UserCircleIcon className="h-8 w-8 text-slate-400" /> {/* Ícone de Usuário */}
                                  <span className="text-slate-800 font-medium">{d.name}</span>
                                </div>
                                {/* Botões de Ação com Ícones */}
                                <div className="flex items-center gap-2">
                                  <button onClick={() => handleStartEdit(d)} title="Editar" disabled={isCrudLoading} className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-100 rounded-full disabled:text-slate-300 transition-colors">
                                    <PencilSquareIcon className="h-5 w-5" />
                                  </button>
                                  <button onClick={() => handleDeleteDeliverer(d.idDelivery)} title="Excluir" disabled={isCrudLoading} className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-100 rounded-full disabled:text-slate-300 transition-colors">
                                    <TrashIcon className="h-5 w-5" />
                                  </button>
                                </div>
                              </li>
                            ))
                          ) : (
                            <div className="text-center py-6">
                              <UserCircleIcon className="mx-auto h-12 w-12 text-slate-300" />
                              <p className="text-sm text-slate-500 mt-2">Nenhum entregador encontrado.</p>
                              <p className="text-xs text-slate-400">Use o formulário acima para adicionar o primeiro.</p>
                            </div>
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
            
                  {!isManaging && (
                    <p className="text-sm mt-4 text-slate-600">
                        Os <span className="font-bold text-slate-700">{selectedOrders.length}</span> pedidos selecionados serão atribuídos ao entregador escolhido.
                    </p>
                  )}
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