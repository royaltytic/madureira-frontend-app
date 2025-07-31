import { useEffect, useState } from "react";
import InputMask from "react-input-mask";
import api from "../services/api";
import { Home } from "../pages/telaHome/TelaHome";
import { PessoaProps } from "../types/types";
import { LoadingSpinner } from "./loading/LoadingSpinner";
import { exportToPDFUsuarios } from "../utils/ExportToPDFUsuarios";
import { UserCard } from "./cards/UserCard";
import {
  XMarkIcon,
  ArrowDownTrayIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';


const removeMask = (value: string) => (value ? value.replace(/\D/g, "") : "");

type FiltersState = {
  // Gerais
  name: string;
  apelido: string;
  cpf: string;
  rg: string;
  genero: "" | "Masculino" | "Feminino" | "Outro";
  classe: "" | "Agricultor" | "Pescador" | "Feirante";
  associacao: string;
  neighborhood: string;
  servico: string;
  // Agricultor / Pescador
  caf: "" | "sim" | "nao";
  car: "" | "sim" | "nao";
  gta: "" | "sim" | "nao";
  adagro: "" | "sim" | "nao";
  chapeuPalha: "" | "sim" | "nao";
  garantiaSafra: "" | "sim" | "nao";
  paa: "" | "sim" | "nao";
  pnae: "" | "sim" | "nao";
  agua: "" | "sim" | "nao";
  // Feirante
  imposto: "" | "sim" | "nao";
  area: string;
  tempo: string;
  carroDeMao: "" | "sim" | "nao";
  produtos: string;
};

const filterLabels: Record<string, string> = {
  name: "Nome", apelido: "Apelido", cpf: "CPF", rg: "RG", genero: "Gênero", classe: "Classe", associacao: "Associação",
  neighborhood: "Localidade", servico: "Serviço", caf: "CAF", car: "CAR", gta: "GTA", adagro: "ADAGRO",
  chapeuPalha: "Chapéu de Palha", garantiaSafra: "Garantia Safra", paa: "PAA", pnae: "PNAE", agua: "Prog. Água",
  imposto: "Paga Imposto", area: "Área Feirante", tempo: "Tempo de Feira", carroDeMao: "Carro de Mão", produtos: "Produto",
};




export const DatabaseComponent = () => {

  // LÓGICA ORIGINAL: Seus estados permanecem os mesmos.
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<PessoaProps[]>([]);
  const [selectedUser, setSelectedUser] = useState<PessoaProps | null>(null);
  const [filters, setFilters] = useState<FiltersState>({
    name: "", apelido: "", cpf: "", rg: "", genero: "", classe: "", associacao: "",
    neighborhood: "", servico: "", car: "", caf: "", gta: "", adagro: "",
    chapeuPalha: "", garantiaSafra: "", paa: "", pnae: "", agua: "",
    imposto: "", area: "", tempo: "", carroDeMao: "", produtos: "",
  });

  const handleFilterChange = (key: keyof FiltersState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };


  const [isModalOpen, setIsModalOpen] = useState(false);

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

  useEffect(() => { fetchUsers(); }, []);
  useEffect(() => { if (selectedUser === null) fetchUsers(); }, [selectedUser]);


  const clearAdvancedFilters = () => {
    setFilters(prev => ({
      name: prev.name, // Mantém os filtros principais
      cpf: prev.cpf,
      classe: prev.classe,
      neighborhood: prev.neighborhood,
      // Reseta todos os outros
      apelido: "", rg: "", genero: "", associacao: "", servico: "", car: "", caf: "", gta: "", adagro: "",
      chapeuPalha: "", garantiaSafra: "", paa: "", pnae: "", agua: "",
      imposto: "", area: "", tempo: "", carroDeMao: "", produtos: "",
    }));
  };


  // ALTERADO: Lógica de filtragem atualizada para incluir a verificação de CAF/CAR
  const filteredUsers = users.filter((user) => {
    const check = (filterValue: string, userValue?: string) =>
      !filterValue || (userValue && userValue.toLowerCase().includes(filterValue.toLowerCase()));

    const checkBoolean = (filterValue: "" | "sim" | "nao", userValue?: string) => {
      if (filterValue === "sim") return !!userValue;
      if (filterValue === "nao") return !userValue;
      return true;
    };

    // --- Filtros Gerais ---
    if (!check(filters.name, user.name)) return false;
    if (!check(filters.apelido, user.apelido)) return false;
    if (!check(filters.associacao, user.associacao)) return false;
    if (!check(filters.neighborhood, user.neighborhood)) return false;
    if (filters.cpf && !removeMask(user.cpf).includes(removeMask(filters.cpf))) return false;
    if (filters.rg && !removeMask(user.rg).includes(removeMask(filters.rg))) return false;
    if (filters.genero && user.genero !== filters.genero) return false;
    if (filters.classe && !user.classe.includes(filters.classe)) return false;
    if (filters.servico && !(user.orders?.some(o => o.servico.toLowerCase().includes(filters.servico.toLowerCase())))) return false;

    // --- Filtros de Agricultor / Pescador ---
    if (filters.classe === 'Agricultor' || filters.classe === 'Pescador') {
      if (!checkBoolean(filters.caf, user.caf)) return false;
      if (!checkBoolean(filters.car, user.car)) return false;
      if (!checkBoolean(filters.gta, user.gta)) return false;
      if (!checkBoolean(filters.adagro, user.adagro)) return false;
      if (!checkBoolean(filters.chapeuPalha, user.chapeuPalha)) return false;
      if (!checkBoolean(filters.garantiaSafra, user.garantiaSafra)) return false;
      if (!checkBoolean(filters.paa, user.paa)) return false;
      if (!checkBoolean(filters.pnae, user.pnae)) return false;
      if (!checkBoolean(filters.agua, user.agua)) return false;
    }

    // --- Filtros de Feirante ---
    if (filters.classe === 'Feirante') {
      if (!check(filters.area, user.area)) return false;
      if (!check(filters.tempo, user.tempo)) return false;
      if (!checkBoolean(filters.imposto, user.imposto)) return false;
      if (!checkBoolean(filters.carroDeMao, user.carroDeMao)) return false;
      if (filters.produtos && !(user.produtos?.some(p => p.toLowerCase().includes(filters.produtos.toLowerCase())))) return false;
    }

    return true;
  });


  if (selectedUser) {
    return <Home {...selectedUser} voltarParaPesquisa={() => setSelectedUser(null)} />;
  }

  // const BooleanFilter = ({ label, filterKey }: { label: string; filterKey: keyof FiltersState }) => (
  //   <div>
  //     <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
  //     <select value={filters[filterKey] as string} onChange={(e) => handleFilterChange(filterKey, e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-lg py-2 px-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
  //       <option value="">Selecionar</option> <option value="sim">Sim</option> <option value="nao">Não</option>
  //     </select>
  //   </div>
  // );

  return (
    <div className="p-4 sm:p-6 bg-slate-50 min-h-screen">
      {error && <p className="text-red-500 text-center mb-5">{error}</p>}

      {/* CABEÇALHO DA PÁGINA */}
      <header className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Banco de Dados de Usuários</h1>
        <p className="text-sm text-slate-500">Busque e gerencie os registros da secretaria.</p>
      </header>

      {/* --- NOVO PAINEL DE FILTROS COMPACTO --- */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Filtros Principais */}
          <input type="text" placeholder="Buscar por nome..." value={filters.name} onChange={(e) => handleFilterChange('name', e.target.value)} className="lg:col-span-2 w-full bg-slate-50 border border-slate-300 rounded-lg py-2 px-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          <InputMask mask="999.999.999-99" placeholder="Buscar por CPF..." value={filters.cpf} onChange={(e) => handleFilterChange('cpf', e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-lg py-2 px-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          <select value={filters.classe} onChange={(e) => handleFilterChange('classe', e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-lg py-2 px-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="">Todas as Classes</option><option value="Agricultor">Agricultor</option><option value="Pescador">Pescador</option><option value="Feirante">Feirante</option><option value="Pecuarista">Pecuarista</option>
          </select>
          {/* Botão para abrir o Modal */}
          <button onClick={() => setIsModalOpen(true)} className="flex items-center justify-center gap-2 bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg shadow-sm hover:bg-indigo-700 transition-colors">
            <FunnelIcon className="h-5 w-5" />
            Mais Filtros
          </button>
        </div>
        {/* Componente para mostrar as tags de filtros ativos */}
        <ActiveFilterTags filters={filters} onClearFilter={handleFilterChange} />
      </div>

      {/* Componente Modal de Filtros Avançados */}
      <FilterModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        filters={filters}
        handleFilterChange={handleFilterChange}
        clearAdvancedFilters={clearAdvancedFilters}
      />


      {/* BARRA DE AÇÕES E TOTALIZADOR */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
        <div className="text-sm font-medium text-slate-700">
          <span className="font-bold text-indigo-600 text-lg">{filteredUsers.length}</span>
          {filteredUsers.length === 1 ? ' usuário encontrado' : ' usuários encontrados'}
        </div>
        <button onClick={() => { exportToPDFUsuarios(filteredUsers) }} className="flex items-center gap-2 bg-white border border-slate-300 text-slate-700 font-semibold px-4 py-2 rounded-lg shadow-sm hover:bg-slate-100 transition-colors mt-4 sm:mt-0">
          <ArrowDownTrayIcon className="h-5 w-5" />
          Exportar para PDF
        </button>
      </div>

      {/* RESULTADOS EM FORMATO DE CARDS */}
      {loading ? (
        <div className="flex items-center justify-center h-60"><LoadingSpinner /> </div>
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

const ActiveFilterTags = ({ filters, onClearFilter }: { filters: FiltersState, onClearFilter: (key: keyof FiltersState, value: string) => void }) => {
  const activeFilters = Object.entries(filters).filter(([key, value]) =>
    value && !['name', 'cpf', 'classe'].includes(key) // Exclui os filtros principais
  );

  if (activeFilters.length === 0) return null;

  return (
    <div className="mt-4 pt-3 border-t border-slate-200 flex flex-wrap gap-2 items-center">
      <span className="text-sm font-medium text-slate-600">Filtros Ativos:</span>
      {activeFilters.map(([key, value]) => {

        const label = filterLabels[key] || key;
        const displayValue = value === 'sim' ? 'Sim' : value === 'nao' ? 'Não' : value;

        return (
          <span key={key} className="flex items-center gap-1 bg-indigo-100 text-indigo-800 text-xs font-semibold px-2 py-1 rounded-full">
            {label}: <span className="font-normal">{displayValue}</span>
            <button onClick={() => onClearFilter(key as keyof FiltersState, "")} className="ml-1">
              <XMarkIcon className="h-4 w-4 text-indigo-600 hover:text-indigo-800" />
            </button>
          </span>
        );
      })}
    </div>
  );
};

type FilterModalProps = {
  isOpen: boolean;
  onClose: () => void;
  filters: FiltersState;
  handleFilterChange: (key: keyof FiltersState, value: string) => void;
  clearAdvancedFilters: () => void;
};


// Componente para o Modal de Filtros Avançados
const FilterModal = ({ isOpen, onClose, filters, handleFilterChange, clearAdvancedFilters }: FilterModalProps) => {
  const [activeTab, setActiveTab] = useState('gerais');

  if (!isOpen) return null;

  const BooleanFilter = ({ label, filterKey }: { label: string; filterKey: keyof FiltersState }) => (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      <select value={filters[filterKey] as string} onChange={(e) => handleFilterChange(filterKey, e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-lg py-2 px-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
        <option value="">Selecione</option><option value="sim">Sim</option><option value="nao">Não</option>
      </select>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* Header do Modal */}
        <header className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800">Filtros Avançados</h2>
          <button onClick={onClose}><XMarkIcon className="h-6 w-6 text-slate-600 hover:text-slate-900" /></button>
        </header>

        {/* Conteúdo com Abas */}
        <div className="p-6 overflow-y-auto">
          {/* Navegação das Abas */}
          <nav className="flex border-b mb-6">
            <button onClick={() => setActiveTab('gerais')} className={`px-4 py-2 font-semibold ${activeTab === 'gerais' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-slate-500'}`}>Gerais</button>
            <button onClick={() => setActiveTab('agricultor')} disabled={!['Agricultor', 'Pescador'].includes(filters.classe)} className={`px-4 py-2 font-semibold ${activeTab === 'agricultor' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-slate-500'} disabled:text-slate-300 disabled:cursor-not-allowed`}>Agricultor/Pescador</button>
            <button onClick={() => setActiveTab('feirante')} disabled={filters.classe !== 'Feirante'} className={`px-4 py-2 font-semibold ${activeTab === 'feirante' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-slate-500'} disabled:text-slate-300 disabled:cursor-not-allowed`}>Feirante</button>
          </nav>

          {/* Painéis das Abas */}
          {activeTab === 'gerais' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <input type="text" placeholder="Apelido..." value={filters.apelido} onChange={(e) => handleFilterChange('apelido', e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-lg py-2 px-3 shadow-sm" />
              <InputMask mask="99.999.999" placeholder="RG..." value={filters.rg} onChange={(e) => handleFilterChange('rg', e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-lg py-2 px-3 shadow-sm" />
              <input type="text" placeholder="Localidade..." value={filters.neighborhood} onChange={(e) => handleFilterChange('neighborhood', e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-lg py-2 px-3 shadow-sm" />
              <input type="text" placeholder="Associação..." value={filters.associacao} onChange={(e) => handleFilterChange('associacao', e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-lg py-2 px-3 shadow-sm" />
              <input type="text" placeholder="Serviço Solicitado..." value={filters.servico} onChange={(e) => handleFilterChange('servico', e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-lg py-2 px-3 shadow-sm" />
              <select value={filters.genero} onChange={(e) => handleFilterChange('genero', e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-lg py-2 px-3 shadow-sm">
                <option value="">Todos os Gêneros</option><option value="Masculino">Masculino</option><option value="Feminino">Feminino</option><option value="Outro">Outro</option>
              </select>
            </div>
          )}
          {activeTab === 'agricultor' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <BooleanFilter label="Possui CAF" filterKey="caf" />
              <BooleanFilter label="Possui CAR" filterKey="car" />
              <BooleanFilter label="GTA" filterKey="gta" />
              <BooleanFilter label="ADAGRO" filterKey="adagro" />
              <BooleanFilter label="Chapéu de Palha" filterKey="chapeuPalha" />
              <BooleanFilter label="Garantia Safra" filterKey="garantiaSafra" />
              <BooleanFilter label="PAA" filterKey="paa" />
              <BooleanFilter label="PNAE" filterKey="pnae" />
              <BooleanFilter label="Programa Água" filterKey="agua" />
            </div>
          )}
          {activeTab === 'feirante' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <input type="text" placeholder="Área de Atuação..." value={filters.area} onChange={(e) => handleFilterChange('area', e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-lg py-2 px-3 shadow-sm" />
              <input type="text" placeholder="Tempo de Feira..." value={filters.tempo} onChange={(e) => handleFilterChange('tempo', e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-lg py-2 px-3 shadow-sm" />
              <input type="text" placeholder="Produto Vendido..." value={filters.produtos} onChange={(e) => handleFilterChange('produtos', e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-lg py-2 px-3 shadow-sm" />
              <BooleanFilter label="Paga Imposto" filterKey="imposto" />
              <BooleanFilter label="Usa Carro de Mão" filterKey="carroDeMao" />
            </div>
          )}
        </div>

        {/* Footer do Modal */}
        <footer className="p-4 border-t bg-slate-50 flex justify-end items-center gap-3">
          <button onClick={clearAdvancedFilters} className="text-sm font-semibold text-slate-600 hover:text-slate-900">Limpar Filtros</button>
          <button onClick={onClose} className="bg-indigo-600 text-white font-bold px-6 py-2 rounded-lg shadow-sm hover:bg-indigo-700">Aplicar</button>
        </footer>
      </div>
    </div>
  );
};

export default DatabaseComponent;