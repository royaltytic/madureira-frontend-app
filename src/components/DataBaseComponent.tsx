import React, { useEffect, useState } from "react";
import InputMask from "react-input-mask";
import api from "../services/api";
import { Home } from "../pages/telaHome/TelaHome";
import { PessoaProps, UserProps } from "../types/types";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { 
  UserCircleIcon, 
  MapPinIcon, 
  DevicePhoneMobileIcon, 
  UserGroupIcon,
  ChevronDownIcon,
   ChevronUpIcon,
  ClipboardDocumentListIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';

// --- SUAS INTERFACES E PROPS ---
interface DataBaseComponentProps {
  usuario: UserProps;
}

// --- SUAS FUNÇÕES UTILITÁRIAS ---
const removeCpfMask = (cpf: string) => cpf.replace(/\D/g, "");
const formatCpf = (cpf: string) => cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4");

// --- SEU COMPONENTE DE SPINNER ---
const Spinner: React.FC = () => (
  <div className="flex items-center justify-center h-full">
    <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

// --- NOVO COMPONENTE DE CARTÃO (PARA A NOVA INTERFACE) ---
const UserCard = React.memo(({ user, onSelectUser }: { user: PessoaProps, onSelectUser: (user: PessoaProps) => void }) => {
  return (
    <div 
      className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col justify-between cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-indigo-300 hover:-translate-y-1"
      onClick={() => onSelectUser(user)}
    >
      <div>
        <div className="flex items-center gap-4 mb-3">
          <UserCircleIcon className="h-12 w-12 text-slate-300 flex-shrink-0" />
          <div className="overflow-hidden">
            <p className="font-bold text-base text-slate-800 truncate" title={user.name}>{user.name}</p>
            <p className="text-sm text-slate-500 truncate" title={user.apelido}>{user.apelido || "Sem apelido"}</p>
            <p className="text-xs text-slate-400">{formatCpf(user.cpf)}</p>
          </div>
        </div>
        <div className="space-y-1.5 text-sm text-slate-600 border-t border-slate-100 pt-3">
          <p className="flex items-center gap-2"><MapPinIcon className="h-4 w-4 text-slate-400" /> <span className="truncate">{user.neighborhood || "Sem localidade"}</span></p>
          <p className="flex items-center gap-2"><UserGroupIcon className="h-4 w-4 text-slate-400" /> <span className="truncate">{Array.isArray(user.classe) ? user.classe.join(', ') : 'Sem classe'}</span></p>
          <p className="flex items-center gap-2"><DevicePhoneMobileIcon className="h-4 w-4 text-slate-400" /> <span>{user.phone || "Sem telefone"}</span></p>
        </div>
      </div>
      <div className="mt-4 pt-3 border-t border-slate-100 text-center">
        <p className="text-xs text-indigo-600 font-semibold flex items-center justify-center gap-1">
          <ClipboardDocumentListIcon className="h-4 w-4" />
          {user.orders.length} {user.orders.length === 1 ? 'Pedido Registrado' : 'Pedidos Registrados'}
        </p>
      </div>
    </div>
  );
});


// --- SEU COMPONENTE PRINCIPAL ---
export const DatabaseComponent: React.FC<DataBaseComponentProps> = ({ usuario }) => {
  // LÓGICA ORIGINAL: Seus estados permanecem os mesmos.
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<PessoaProps[]>([]);
  const [selectedUser, setSelectedUser] = useState<PessoaProps | null>(null);
  const [pedidoFiltro, setPedidoFiltro] = useState("");
  const [filters, setFilters] = useState({
    name: "",
    cpf: "",
    apelido: "",
    classe: "",
    neighborhood: "",
  });

  // Adicione este novo estado para controlar a visibilidade dos filtros
const [isFiltersOpen, setIsFiltersOpen] = useState(false); // Começa aberto por padrão

  // LÓGICA ORIGINAL: Buscando todos os usuários no início.
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get("/users/all");
      const sorted = response.data.sort((a: PessoaProps, b: PessoaProps) => a.name.localeCompare(b.name));
      setUsers(sorted);
    } catch {
      setError("Erro ao carregar usuários.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedUser === null) fetchUsers();
  }, [selectedUser]);

  

  // LÓGICA ORIGINAL: Filtragem feita no frontend (no navegador).
  const filteredUsers = users.filter((user) => {
    const matchesCampos = Object.entries(filters).every(([key, value]) => {
      if (!value.trim()) return true;
      if (key === "cpf") { return removeCpfMask(user.cpf).includes(removeCpfMask(value)); }
      if (key === "classe") { return Array.isArray(user.classe) && user.classe.some((cl) => cl.toLowerCase().includes(value.toLowerCase())); }
      const userValue = user[key as keyof PessoaProps] as string;
      return typeof userValue === "string" ? userValue.toLowerCase().includes(value.toLowerCase()) : false;
    });
    const matchesPedido = !pedidoFiltro.trim() || (user.orders && user.orders.some((order) => order.servico.toLowerCase().includes(pedidoFiltro.toLowerCase())));
    return matchesCampos && matchesPedido;
  });

  // Dentro do seu componente DatabaseComponent...


// SUBSTITUA sua função exportToPDF por esta versão aprimorada
const exportToPDF = async () => {
  if (filteredUsers.length === 0) {
    alert("Nenhum usuário para exportar.");
    return;
  }

  const doc = new jsPDF({ orientation: "landscape" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 30; // Define uma margem padrão

  // --- NOVO CABEÇALHO PROFISSIONAL ---

  // 2. Adiciona o bloco de título à direita do logo
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(45, 55, 72); // Cor: slate-700
  doc.text("Relatório de Usuários", margin + 60, 45);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139); // Cor: slate-500
  doc.text("Lista de registros conforme filtros aplicados.", margin + 60, 60);

  // 3. Adiciona o bloco de metadados na direita da página
  const generationDate = new Date().toLocaleString("pt-BR", {
    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
  });
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("DATA DE EMISSÃO:", pageWidth - margin, 35, { align: 'right' });
  doc.text("TOTAL DE REGISTROS:", pageWidth - margin, 50, { align: 'right' });

  doc.setFont("helvetica", "normal");
  doc.text(generationDate, pageWidth - margin, 42, { align: 'right' });
  doc.text(`${filteredUsers.length}`, pageWidth - margin, 57, { align: 'right' });


  // 4. Desenha uma linha separadora
  doc.setDrawColor(226, 232, 240); // Cor: slate-200
  doc.setLineWidth(1);
  doc.line(margin, 80, pageWidth - margin, 80);

  // --- FIM DO NOVO CABEÇALHO ---


  // Definição da tabela (mesma lógica de antes)
  const tableColumn = ["Nome", "Apelido", "CPF", "Telefone", "Localidade", "Classe(s)"];
  const tableRows: string[][] = filteredUsers.map((user) => [
    user.name || "Sem nome",
    user.apelido || "Sem apelido",
    formatCpf(user.cpf),
    user.phone || "Sem telefone",
    user.neighborhood || "Sem localidade",
    Array.isArray(user.classe) ? user.classe.join(", ") : "Sem classe"
  ]);

  // Geração da tabela com o autoTable
  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 95, // AJUSTE: A tabela começa mais para baixo para dar espaço ao cabeçalho
    theme: 'striped',
    headStyles: {
      fillColor: [30, 41, 59], // Cor: slate-800
      textColor: 255,
      fontStyle: 'bold',
    },
    styles: {
      cellPadding: 4,
      fontSize: 8,
    },
    didDrawPage: (data) => {
      // Rodapé com número da página
      const pageCount = doc.getNumberOfPages();
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(`Página ${data.pageNumber} de ${pageCount}`, data.settings.margin.left, pageHeight - 15);
    }
  });

  doc.save("relatorio_usuarios.pdf");
};

  // LÓGICA ORIGINAL: Sua lógica para mostrar a tela de detalhes.
  if (selectedUser) {
    return <Home usuario={usuario} {...selectedUser} voltarParaPesquisa={() => setSelectedUser(null)} />;
  }

  // ================================================================ //
  // |||||||||||||||||| NOVA INTERFACE PROFISSIONAL |||||||||||||||||| //
  // ================================================================ //
  return (
    <div className="p-4 sm:p-6 bg-slate-50 min-h-screen">
      {error && <p className="text-red-500 text-center mb-5">{error}</p>}
      
      {/* CABEÇALHO DA PÁGINA */}
      <header className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Banco de Dados de Usuários</h1>
        <p className="text-sm text-slate-500">Busque e gerencie os registros da secretaria.</p>
      </header>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6">
  {/* CABEÇALHO CLICÁVEL DO PAINEL */}
  <button 
    onClick={() => setIsFiltersOpen(!isFiltersOpen)}
    className="w-full flex justify-between items-center"
  >
    <h2 className="text-lg font-semibold text-slate-800">Filtros de Busca</h2>
    {/* O ícone muda dependendo se o painel está aberto ou fechado */}
    {isFiltersOpen 
      ? <ChevronUpIcon className="h-6 w-6 text-slate-600" /> 
      : <ChevronDownIcon className="h-6 w-6 text-slate-600" />
    }
  </button>
  
  {/* CONTEÚDO SANFONA (COLAPSÁVEL) */}
  <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isFiltersOpen ? 'max-h-[500px] mt-4' : 'max-h-0'}`}>
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 border-t border-slate-200 pt-4">
      {/* Seus campos de input permanecem os mesmos aqui dentro */}
      <div>
        <label htmlFor="name-filter" className="block text-sm font-medium text-slate-700 mb-1">Nome do Usuário</label>
        <input id="name-filter" type="text" placeholder="Buscar por nome..." value={filters.name} onChange={(e) => setFilters({ ...filters, name: e.target.value })} className="w-full bg-white border border-slate-300 rounded-lg py-2 px-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
      </div>
      <div>
        <label htmlFor="apelido-filter" className="block text-sm font-medium text-slate-700 mb-1">Apelido</label>
        <input id="apelido-filter" type="text" placeholder="Buscar por apelido..." value={filters.apelido} onChange={(e) => setFilters({ ...filters, apelido: e.target.value })} className="w-full bg-white border border-slate-300 rounded-lg py-2 px-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
      </div>
      <div>
        <label htmlFor="cpf-filter" className="block text-sm font-medium text-slate-700 mb-1">CPF</label>
        <InputMask id="cpf-filter" mask="999.999.999-99" placeholder="___.___.___-__" value={filters.cpf} onChange={(e) => setFilters({ ...filters, cpf: e.target.value })} className="w-full bg-white border border-slate-300 rounded-lg py-2 px-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
      </div>
      <div>
        <label htmlFor="classe-filter" className="block text-sm font-medium text-slate-700 mb-1">Classe</label>
        <input id="classe-filter" type="text" placeholder="Ex: Agricultor" value={filters.classe} onChange={(e) => setFilters({ ...filters, classe: e.target.value })} className="w-full bg-white border border-slate-300 rounded-lg py-2 px-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
      </div>
      <div>
        <label htmlFor="local-filter" className="block text-sm font-medium text-slate-700 mb-1">Localidade</label>
        <input id="local-filter" type="text" placeholder="Buscar por localidade..." value={filters.neighborhood} onChange={(e) => setFilters({ ...filters, neighborhood: e.target.value })} className="w-full bg-white border border-slate-300 rounded-lg py-2 px-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
      </div>
      <div>
        <label htmlFor="pedido-filter" className="block text-sm font-medium text-slate-700 mb-1">Serviço Solicitado</label>
        <input id="pedido-filter" type="text" placeholder="Ex: Água, Trator..." value={pedidoFiltro} onChange={(e) => setPedidoFiltro(e.target.value)} className="w-full bg-white border border-slate-300 rounded-lg py-2 px-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
      </div>
    </div>
  </div>
</div>

      
      {/* BARRA DE AÇÕES E TOTALIZADOR */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
        <div className="text-sm font-medium text-slate-700">
          <span className="font-bold text-indigo-600 text-lg">{filteredUsers.length}</span>
          {filteredUsers.length === 1 ? ' usuário encontrado' : ' usuários encontrados'}
        </div>
        <button onClick={exportToPDF} className="flex items-center gap-2 bg-white border border-slate-300 text-slate-700 font-semibold px-4 py-2 rounded-lg shadow-sm hover:bg-slate-100 transition-colors mt-4 sm:mt-0">
          <ArrowDownTrayIcon className="h-5 w-5" />
          Exportar para PDF
        </button>
      </div>

      {/* RESULTADOS EM FORMATO DE CARDS */}
      {loading ? (
        <div className="flex items-center justify-center h-60"><Spinner /></div>
      ) : (
        <div>
          {filteredUsers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredUsers.map((user) => (
                <UserCard key={user.id} user={user} onSelectUser={setSelectedUser} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 px-6 bg-white rounded-lg border-2 border-dashed border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800">Nenhum Usuário Encontrado</h3>
              <p className="mt-1 text-sm text-slate-600">Tente ajustar os termos da sua busca ou limpar os filtros.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DatabaseComponent;