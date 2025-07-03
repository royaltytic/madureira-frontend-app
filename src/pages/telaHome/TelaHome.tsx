import { useState, useEffect } from "react";
import { PopUp } from "../../components/popup/PopUp";
import UltimosPedidos from "../../components/pedidos/UltimosPedidos";
import api from "../../services/api";
import { PopUpEdit } from "./PopUpEdit";
import { PessoaProps } from "../../types/types";
import { OrdersProps } from "../../types/types";
import { UserProps } from "../../types/types";
import Alert from "../../components/alerts/alertDesktop";

import {
  UserCircleIcon,
  HashtagIcon,
  DevicePhoneMobileIcon,
  MapPinIcon,
  PencilSquareIcon,
  ArrowUturnLeftIcon,
  PlusCircleIcon,
  DocumentTextIcon,
  SunIcon,
  ShieldCheckIcon,
  ShoppingBagIcon,
  UserGroupIcon,
  ScaleIcon,
  CurrencyDollarIcon,
  ClockIcon,
  WrenchScrewdriverIcon,
  SquaresPlusIcon,
  TrashIcon,
  
} from '@heroicons/react/24/solid';

interface BeneficioConfig {
  key: keyof PessoaProps; // A chave DEVE ser um nome de propriedade de PessoaProps
  label: string;
  icon: React.ReactNode; // Tipo adequado para componentes React
  styles: string;
}


interface HomeProps extends PessoaProps {
  voltarParaPesquisa: () => void;
  usuario: UserProps;
}

export const Home: React.FC<HomeProps> = ({
  id,
  name,
  apelido,
  genero,
  cpf,
  rg,
  caf,
  car,
  rgp,
  gta,
  phone,
  neighborhood,
  referencia,
  adagro,
  classe,
  associacao,
  chapeuPalha,
  garantiaSafra,
  paa,
  pnae,
  agua,
  imposto,
  area,
  tempo,
  carroDeMao,
  produtos,
  orders,
  rgImageUrl,
  cafImageUrl,
  carImageUrl,
  rgpImageUrl,
  voltarParaPesquisa,
  usuario,
}) => {
  const [userData, setUserData] = useState<PessoaProps>({
    id,
    name,
    apelido,
    genero,
    cpf,
    rg,
    caf,
    car,
    rgp,
    gta,
    phone,
    neighborhood,
    referencia,
    adagro,
    classe,
    associacao,
    chapeuPalha,
    garantiaSafra,
    paa,
    pnae,
    agua,
    imposto,
    area,
    tempo,
    carroDeMao,
    produtos,
    orders,
    rgImageUrl: rgImageUrl ?? "",
    cafImageUrl: cafImageUrl ?? "",
    carImageUrl: carImageUrl ?? "",
    rgpImageUrl: rgpImageUrl ?? "",
  });

  const [order, setOrder] = useState<OrdersProps[]>(orders);
  const [isPopUpOpen, setIsPopUpOpen] = useState(false);
  const [isPopUpEditOpen, setIsPopUpEditOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);

  // Função para buscar pedidos atualizados
  const fetchOrders = async () => {
    try {
      const response = await api.get(`/users/${id}`); // ajuste a rota conforme sua API
      setOrder(response.data.orders);
    } catch (error) {
      console.error("Erro ao buscar pedidos:", error);
    }
  };

  useEffect(() => {
    const intervalId = setInterval(fetchOrders, 5000); // A cada 5 segundos
    return () => clearInterval(intervalId); // Limpa o intervalo ao desmontar
  },);


  // Estado para exibir alerta personalizado
  const [alert, setAlert] = useState<{
    type: "alerta" | "error" | "info" | "sucesso";
    text: string;
  } | null>(null);

  const showAlert = (
    type: "alerta" | "error" | "info" | "sucesso",
    text: string
  ) => {
    setAlert({ type, text });
  };

  const closeAlert = () => {
    setAlert(null);
  };

  const openPopUp = () => {
    setIsPopUpOpen(true);
  };

  const closePopUp = () => {
    setIsPopUpOpen(false);
  };

  const openPopUpEdit = () => {
    setIsPopUpEditOpen(true);
  };

  const closePopUpEdit = () => {
    setIsPopUpEditOpen(false);
  };

  const openImageModal = (imageUrl: string) => {
    setCurrentImageUrl(imageUrl);
    setIsImageModalOpen(true);
  };

  const closeImageModal = () => {
    setIsImageModalOpen(false);
    setCurrentImageUrl(null);
  };

  // Adicione esta nova função dentro do seu componente Home
  const handleDeleteUser = async () => {
    // 1. VERIFICAÇÃO: Checa se o usuário tem pedidos
    if (order && order.length > 0) {
      showAlert("error", "Não é possível excluir: este usuário possui pedidos registrados.");
      return;
    }

    // 2. CONFIRMAÇÃO: Pede a confirmação final do usuário
    if (window.confirm(`Tem certeza que deseja excluir permanentemente o usuário ${userData.name}? Esta ação não pode ser desfeita.`)) {
      try {
        // 3. EXECUÇÃO: Chama a API para deletar o usuário pelo ID
        await api.delete(`/users/${userData.id}`);

        // 4. FEEDBACK E AÇÃO FINAL: Mostra um alerta de sucesso e volta para a tela de pesquisa
        showAlert("sucesso", "Usuário excluído com sucesso!");
        voltarParaPesquisa(); // Retorna para a tela anterior

      } catch (error) {
        console.error("Erro ao excluir usuário:", error);
        showAlert("error", "Ocorreu um erro ao tentar excluir o usuário. Tente novamente.");
      }
    }
  };

  const salvarPedido = async (novosPedidos: OrdersProps[]) => {

    try {
      const response = await api.put("/users", {
        usuario,
        id,
        orders: novosPedidos,
      });

      // Atualiza o estado local com os pedidos retornados pela API (incluindo o novo pedido)
      setOrder(response.data.orders);
    } catch (error) {
      console.error("Erro ao salvar pedidos:", error);
      showAlert("error", "Erro ao salvar pedidos. Tente novamente.");
    }
  };


  const updatePedidoSituacao = async (

    id: string,
    situacao: string,
    dataEntregue?: string
  ) => {

    try {
      // Se a situação for "Finalizado", utilize a data passada ou, se não houver, a data atual.
      const finalData =
        situacao === "Finalizado" ? dataEntregue || new Date().toISOString() : null;

      const response = await api.put(`/orders/${id}`, {
        usuario,
        situacao,
        dataEntregue: finalData,
      });

      if (response.status === 200) {
        setOrder((prevOrder) =>
          prevOrder.map((order) =>
            order.id === id ? { ...order, usuario, situacao, dataEntregue: finalData } : order
          )
        );
      } else {
        showAlert("error", "Falha ao atualizar a situação do pedido.");
      }
    } catch (error) {
      console.error("Erro ao atualizar a situação do pedido:", error);
      showAlert("error", "Erro ao atualizar a situação do pedido. Tente novamente.");
    }
  };


  const atualizarDadosUsuario = (updatedData: Partial<PessoaProps>) => {
    setUserData((prevUserData) => ({
      ...prevUserData,
      ...updatedData,
    }));
  };

  const beneficiosConfig: BeneficioConfig[]  = [
    { key: 'garantiaSafra', label: 'Garantia Safra', icon: <ShieldCheckIcon className="h-4 w-4" />, styles: 'bg-green-100 text-green-800' },
    { key: 'chapeuPalha', label: 'Chapéu de Palha', icon: <SunIcon className="h-4 w-4" />, styles: 'bg-yellow-100 text-yellow-800' },
    { key: 'paa', label: 'PAA', icon: <ShoppingBagIcon className="h-4 w-4" />, styles: 'bg-sky-100 text-sky-800' },
    { key: 'pnae', label: 'PNAE', icon: <ShoppingBagIcon className="h-4 w-4" />, styles: 'bg-purple-100 text-purple-800' }
  ];

  const beneficiosDoUsuario = beneficiosConfig.filter(
    (beneficio) => userData[beneficio.key] // A verificação é apenas esta!
  );

  return (

    <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-4 sm:p-6 bg-slate-100 min-h-screen">

      {/* ================================================================ */}
      {/* COLUNA DA ESQUERDA (SIDEBAR DE INFORMAÇÕES E AÇÕES)            */}
      {/* ================================================================ */}
      <aside className="lg:col-span-1">
        <div className="lg:sticky lg:top-6 space-y-6">

          {/* --- CARD DE DADOS PESSOAIS --- */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-4 border-b border-slate-200 pb-3">
              <div className="flex items-center gap-3">
                <UserCircleIcon className="h-10 w-10 text-indigo-500" />
                <div>
                  <h2 className="text-lg font-bold text-slate-800">{userData.name}</h2>
                  <p className="text-sm text-slate-500">{userData.apelido}</p>
                </div>
              </div>
              <button onClick={openPopUpEdit} title="Editar Usuário" className="p-2 rounded-full hover:bg-slate-100 text-slate-500 hover:text-indigo-600 transition-colors">
                <PencilSquareIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-slate-600"><HashtagIcon className="h-4 w-4 text-slate-400" /><strong>CPF:</strong> <span>{userData.cpf}</span></div>
              <div className="flex items-center gap-2 text-slate-600"><DevicePhoneMobileIcon className="h-4 w-4 text-slate-400" /><strong>Telefone:</strong> <span>{userData.phone}</span></div>
              <div className="flex items-center gap-2 text-slate-600"><MapPinIcon className="h-4 w-4 text-slate-400" /><strong>Localidade:</strong> <span>{userData.neighborhood}</span></div>
              <div className="flex items-center gap-2 text-slate-600"><UserGroupIcon className="h-4 w-4 text-slate-400" /><strong>Classe:</strong> <span className="font-medium text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full">{Array.isArray(userData.classe) ? userData.classe.join(', ') : userData.classe}</span></div>
            </div>
          </div>

         {/* --- CARD DE DOCUMENTOS (DINÂMICO E OTIMIZADO) --- */}
{(() => {
  // 1. Define a lista de possíveis documentos
  const documents = [
    { label: 'RG', url: userData.rgImageUrl },
    { label: 'CAF', url: userData.cafImageUrl },
    { label: 'CAR', url: userData.carImageUrl },
    { label: 'RGP', url: userData.rgpImageUrl }
  ];

  // 2. Filtra apenas os documentos que realmente existem (têm uma URL)
  const availableDocuments = documents.filter(doc => doc.url);

  // 3. Se não houver nenhum documento disponível, não renderiza nada
  if (availableDocuments.length === 0) {
    return null;
  }

  // 4. Se houver documentos, renderiza o card com os botões
  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
      <h3 className="font-semibold text-slate-800 mb-3">Documentos</h3>
      <div className="grid grid-cols-2 gap-3">
        {availableDocuments.map(doc => (
          <button 
            key={doc.label} 
            onClick={() => openImageModal(doc.url!)} // A exclamação (!) garante ao TS que a url existe
            className="flex items-center justify-center gap-2 text-sm text-slate-700 bg-slate-100 p-2 rounded-lg hover:bg-indigo-100 hover:text-indigo-700 transition-colors"
          >
            <DocumentTextIcon className="h-5 w-5 flex-shrink-0" />
            <span>{doc.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
})()}
          {/* --- NOVO CARD: INFORMAÇÕES RURAIS / PESCA (CONDICIONAL) --- */}
          {(userData.classe.includes("Agricultor") || userData.classe.includes("Pescador")) && (
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="font-semibold text-slate-800 mb-3">Informações Rurais / Pesca</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-slate-600"><DocumentTextIcon className="h-4 w-4 text-slate-400" /><strong>GTA:</strong> <span>{userData.gta || "Não possui"}</span></div>
                <div className="flex items-center gap-2 text-slate-600"><DocumentTextIcon className="h-4 w-4 text-slate-400" /><strong>RGP:</strong> <span>{userData.rgp || "Não possui"}</span></div>
                <div className="flex items-center gap-2 text-slate-600"><DocumentTextIcon className="h-4 w-4 text-slate-400" /><strong>CAF:</strong> <span>{userData.caf || "Não possui"}</span></div>
                <div className="flex items-center gap-2 text-slate-600"><DocumentTextIcon className="h-4 w-4 text-slate-400" /><strong>CAR:</strong> <span>{userData.car || "Não possui"}</span></div>
                <div className="flex items-center gap-2 text-slate-600"><DocumentTextIcon className="h-4 w-4 text-slate-400" /><strong>Associação:</strong> <span>{userData.associacao || "Não possui"}</span></div>
              </div>
            </div>
          )}

          {/* --- NOVO CARD: INFORMAÇÕES DE FEIRANTE (CONDICIONAL) --- */}
          {userData.classe.includes("Feirante") && (
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="font-semibold text-slate-800 mb-3">Informações de Feirante</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-slate-600"><CurrencyDollarIcon className="h-4 w-4 text-slate-400" /><strong>Imposto:</strong> <span>R$ {userData.imposto || "0,00"}</span></div>
                <div className="flex items-center gap-2 text-slate-600"><ScaleIcon className="h-4 w-4 text-slate-400" /><strong>Área (m²):</strong> <span>{userData.area || "Não informado"}</span></div>
                <div className="flex items-center gap-2 text-slate-600"><ClockIcon className="h-4 w-4 text-slate-400" /><strong>Tempo de Feira:</strong> <span>{userData.tempo ? `${userData.tempo} anos` : "Não informado"}</span></div>
                <div className="flex items-center gap-2 text-slate-600"><WrenchScrewdriverIcon className="h-4 w-4 text-slate-400" /><strong>Carro de Mão:</strong> <span>{userData.carroDeMao || "Não possui"}</span></div>
                <div className="flex items-start gap-2 text-slate-600"><SquaresPlusIcon className="h-4 w-4 text-slate-400 mt-0.5" /><strong>Produtos:</strong> <span className="flex-1">{Array.isArray(userData.produtos) && userData.produtos.length > 0 ? userData.produtos.join(', ') : 'Não informado'}</span></div>
              </div>
            </div>
          )}

          {/* --- CARD DE BENEFÍCIOS (CONDICIONAL) --- */}
          {beneficiosDoUsuario.length > 0 && (
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="font-semibold text-slate-800 mb-3">Benefícios Sociais</h3>
        <div className="flex flex-wrap gap-2">
          
          {beneficiosDoUsuario.map((beneficio) => (
            <span 
              key={beneficio.key} 
              className={`text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1 ${beneficio.styles}`}
            >
              {beneficio.icon}
              {beneficio.label} ({String(userData[beneficio.key])}) {/* Converte o valor para string */}
            </span>
          ))}

        </div>
      </div>
    )}

          {/* --- BOTÕES DE AÇÃO --- */}
          <div className="flex items-center gap-4">
            <button onClick={voltarParaPesquisa} className="w-full flex items-center justify-center gap-2 bg-white border border-slate-300 text-slate-700 font-semibold px-4 py-2 rounded-lg shadow-sm hover:bg-slate-100 transition-colors">
              <ArrowUturnLeftIcon className="h-5 w-5" />
              Voltar
            </button>
            <button onClick={openPopUp} className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg shadow-sm hover:bg-indigo-700 transition-colors">
              <PlusCircleIcon className="h-5 w-5" />
              Novo Pedido
            </button>
          </div>
          <div className="mt-4 pt-4 border-t border-dashed border-slate-300">
            <button
              onClick={handleDeleteUser}
              className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-700 font-semibold px-4 py-2 rounded-lg shadow-sm hover:bg-red-100 border border-red-200 transition-colors"
            >
              <TrashIcon className="h-5 w-5" />
              Excluir Usuário
            </button>
          </div>
        </div>
      </aside>

      {/* ================================================================ */}
      {/* COLUNA DA DIREITA (CONTEÚDO PRINCIPAL)                         */}
      {/* ================================================================ */}
      <main className="lg:col-span-2">
        <UltimosPedidos
          pedidos={order || []}
          onUpdate={updatePedidoSituacao}
          onEdit={(pedido) => {

            console.log("Edit pedido:", pedido);
          }}
          usuario={usuario}
        />
      </main>

      {isPopUpEditOpen && (
        <PopUpEdit
          id={userData.id}
          name={userData.name}
          apelido={userData.apelido}
          genero={userData.genero}
          cpf={userData.cpf}
          rg={userData.rg}
          caf={userData.caf}
          car={userData.car}
          rgp={userData.rgp}
          gta={userData.gta}
          phone={userData.phone}
          neighborhood={userData.neighborhood}
          referencia={userData.referencia}
          adagro={userData.adagro}
          classe={userData.classe}
          associacao={userData.associacao}
          chapeuPalha={userData.chapeuPalha}
          garantiaSafra={userData.garantiaSafra}
          paa={userData.paa}
          pnae={userData.pnae}
          agua={userData.agua}
          imposto={userData.imposto}
          area={userData.area}
          tempo={userData.tempo}
          carroDeMao={userData.carroDeMao}
          produtos={userData.produtos}
          onClose={closePopUpEdit}
          onUpdate={atualizarDadosUsuario}
        />
      )}

      {isPopUpOpen && (
        <PopUp onClose={closePopUp} onAddPedido={salvarPedido} />
      )}

      {isImageModalOpen && currentImageUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded max-w-lg max-h-[80vh] o4verflow-auto">
            <img src={currentImageUrl} alt="Imagem do Documento" className="max-w-full max-h-[60vh] object-contain" />
            <div className="flex w-full justify-between mt-2 gap-4">
              <button onClick={closeImageModal} className="bg-gradient-to-r from-[#E03335] to-[#812F2C] rounded w-1/2 h-8 text-center flex items-center justify-center font-semibold font-lg text-white">
                Fechar
              </button>
              <a href={currentImageUrl} download className="bg-gradient-to-r from-[#0E9647] to-[#165C38] rounded w-1/2 h-8 text-center flex items-center justify-center font-semibold font-lg text-white">
                Baixar
              </a>
            </div>
          </div>
        </div>
      )}

      {alert && (
        <Alert type={alert.type} text={alert.text} onClose={closeAlert} />
      )}
    </section>
  );
};