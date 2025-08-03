import React, { useState, useEffect, useRef } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, Leaf, Ship, ShoppingCart, Building, User, Droplets, ShieldCheck, Sun, Sprout, Wheat, CheckSquare, Briefcase, FileText, Calendar as CalendarIcon } from 'lucide-react';
import api from '../../services/api';
import { LoadingSpinner } from '../loading/LoadingSpinner';
import { handleExportCSV } from '../../utils/ExportToCSV';
import DashboardOperacional from './DashboardOperacional';

// --- Dependências para o seletor de data ---
import { DayPicker, DateRange } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { PessoaProps } from '../../types/types';


// ===================================================================
// 1. TIPOS
// ===================================================================
type Periodo = string | DateRange;

interface Pessoa extends PessoaProps {
    id: string;
    name: string;
    cpf: string;
    user: PessoaProps
}

interface Genero {
    totalHomens: number;
    totalMulheres: number;
    agricultores: { homens: number; mulheres: number };
    feirantes: { homens: number; mulheres: number };
    pescadores: { homens: number; mulheres: number };
    outros: { homens: number; mulheres: number };
}

interface BeneficioDetalhes {
    homens: number;
    mulheres: number;
    agricultores: number;
    pescadores: number;
}

interface DetalhesBeneficios {
    paa: BeneficioDetalhes;
    chapeuPalha: BeneficioDetalhes;
    garantiaSafra: BeneficioDetalhes;
}

interface ListasBeneficios {
    garantidaSafraSim: Pessoa[];
    adagroSim: Pessoa[];
    chapeuPalhaSim: Pessoa[];
    paaSim: Pessoa[];
    pnaeSim: Pessoa[];
    aguaSim: Pessoa[];
}

interface EstatisticasPessoas {
    totalPessoas: Pessoa[];
    totalAgricultores: Pessoa[];
    totalPescadores: Pessoa[];
    totalFeirantes: Pessoa[];
    totalOutros: Pessoa[];
    totalReparticaoPublica: Pessoa[];
    totalPecuaristas: Pessoa[];
    beneficios: ListasBeneficios & { detalhes: DetalhesBeneficios };
    genero: Genero;
}

// ===================================================================
// 2. MODAL E SUBCOMPONENTES
// ===================================================================

// --- Componente ModalPessoas ---
interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    people: Pessoa[];
    isLoading: boolean;
}

const EmptyState: React.FC = () => (
    <div className="text-center py-10 px-6 bg-slate-50 rounded-lg">
        <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="mt-2 text-sm font-semibold text-slate-800">Nenhum resultado</h3>
        <p className="mt-1 text-sm text-slate-500">Nenhuma pessoa foi encontrada para este critério.</p>
    </div>
);

const ModalPessoas: React.FC<ModalProps> = ({ isOpen, onClose, title, people, isLoading }) => {
    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-slate-900/75 z-50 flex justify-center items-center p-4 transition-opacity duration-300 ease-in-out" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col transform transition-all duration-300 ease-in-out scale-95 opacity-0 animate-fade-in-scale" onClick={e => e.stopPropagation()}>
                <header className="flex justify-between items-center p-5 border-b border-slate-200">
                    <h2 className="text-lg font-bold text-slate-800">{title}</h2>
                    <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors" aria-label="Fechar modal">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </header>
                <main className="p-6 overflow-y-auto">
                    {isLoading ? (
                        <LoadingSpinner />
                    ) : people.length > 0 ? (
                        <ul className="space-y-3">
                            {people.map(person => {
                                // CORREÇÃO: Acessar os dados diretamente do objeto 'person'.
                                // A estrutura de dados da API não possui um objeto 'user' aninhado.
                                const nome = person.name || person.user.name;
                                const cpf = person.cpf;
                                const inicial = nome ? nome.charAt(0).toUpperCase() : '?';

                                return (
                                    <li key={person.id} className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex items-center space-x-4 hover:border-blue-400 hover:bg-blue-50 transition-all">
                                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center">
                                            <span className="text-slate-500 font-semibold">{inicial}</span>
                                        </div>
                                        <div className="flex-grow">
                                            <p className="font-semibold text-slate-900">{nome || 'Nome não disponível'}</p>
                                            {cpf && <p className="text-sm text-slate-500">CPF: {cpf}</p>}
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    ) : (
                        <EmptyState />
                    )}
                </main>
                <footer className="p-4 bg-slate-50 border-t border-slate-200 rounded-b-xl flex justify-end items-center gap-3">
                    <button onClick={onClose} className="px-5 py-2 bg-slate-200 text-slate-800 text-sm font-semibold rounded-lg hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400 transition-colors">
                        Fechar
                    </button>
                    <button onClick={() => handleExportCSV(people, title)} disabled={people.length === 0 || isLoading} className="px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed">
                        Exportar como CSV
                    </button>
                </footer>
            </div>
            <style>{`
                @keyframes fadeInScale {
                    from { opacity: 0; transform: scale(.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                .animate-fade-in-scale { animation: fadeInScale 0.3s ease-out forwards; }
            `}</style>
        </div>
    );
};

// --- Componente de Item da Lista de KPIs ---
interface KpiListItemProps {
    label: string;
    value: number;
    icon: React.ElementType;
    onClick: () => void;
    disabled: boolean;
}
const KpiListItem: React.FC<KpiListItemProps> = ({ label, value, icon: Icon, onClick, disabled }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className="flex items-center w-full p-3 rounded-lg transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
    >
        <div className="p-2 bg-gray-100 text-gray-600 rounded-md">
            <Icon size={20} />
        </div>
        <span className="ml-4 text-sm font-semibold text-gray-700">{label}</span>
        <span className="ml-auto text-sm font-bold text-gray-800 bg-gray-200 px-2 py-1 rounded-md">{value}</span>
    </button>
);

// --- Componente de Análise de Gênero ---
const COLORS_GENERO = ["#3b82f6", "#ec4899"]; // Azul e Rosa

interface AnaliseDeGeneroProps {
    genero: Genero;
    detalhes: DetalhesBeneficios;
}
const AnaliseDeGenero: React.FC<AnaliseDeGeneroProps> = ({ genero, detalhes }) => {
    const dadosTotais = [
        { name: "Homens", value: genero.totalHomens },
        { name: "Mulheres", value: genero.totalMulheres },
    ];

    const dadosPorCategoria = [
        { name: "Agricultores", Homens: genero.agricultores.homens, Mulheres: genero.agricultores.mulheres },
        { name: "Feirantes", Homens: genero.feirantes.homens, Mulheres: genero.feirantes.mulheres },
        { name: "Pescadores", Homens: genero.pescadores.homens, Mulheres: genero.pescadores.mulheres },
        { name: "Outros", Homens: genero.outros.homens, Mulheres: genero.outros.mulheres },
    ];
    
    const dadosBeneficios = [
        { name: "PAA", Homens: detalhes.paa?.homens || 0, Mulheres: detalhes.paa?.mulheres || 0 },
        { name: "Chapéu Palha", Homens: detalhes.chapeuPalha?.homens || 0, Mulheres: detalhes.chapeuPalha?.mulheres || 0 },
        { name: "Garantia Safra", Homens: detalhes.garantiaSafra?.homens || 0, Mulheres: detalhes.garantiaSafra?.mulheres || 0 },
    ];

    return (
        <div className="flex flex-col gap-6">
            <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Distribuição por Gênero</h3>
                <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                        <Pie data={dadosTotais} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                            {dadosTotais.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS_GENERO[index % COLORS_GENERO.length]} />)}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Gênero por Categoria</h3>
                <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={dadosPorCategoria} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="Homens" stackId="a" fill="#3b82f6" />
                        <Bar dataKey="Mulheres" stackId="a" fill="#ec4899" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
             <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Gênero por Benefício</h3>
                <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={dadosBeneficios} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="Homens" fill="#3b82f6" />
                        <Bar dataKey="Mulheres" fill="#ec4899" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};


// ===================================================================
// 3. COMPONENTE DA ABA PESSOAS
// ===================================================================

interface DashboardPessoasProps {
    estatisticas: EstatisticasPessoas;
}

type KpiConfigItem = {
    label: string;
    key: keyof EstatisticasPessoas | keyof ListasBeneficios;
    icon: React.ElementType;
};

const DashboardPessoas: React.FC<DashboardPessoasProps> = ({ estatisticas }) => {
    const [modalAberto, setModalAberto] = useState(false);
    const [pessoasNoModal, setPessoasNoModal] = useState<Pessoa[]>([]);
    const [tituloModal, setTituloModal] = useState("");

    const categoriasConfig: KpiConfigItem[] = [
        { label: "Cadastrados", key: 'totalPessoas', icon: Users },
        { label: "Agricultores", key: 'totalAgricultores', icon: Leaf },
        { label: "Pescadores", key: 'totalPescadores', icon: Ship },
        { label: "Feirantes", key: 'totalFeirantes', icon: ShoppingCart },
        { label: "Pecuaristas", key: 'totalPecuaristas', icon: Briefcase },
        { label: "Rep. Pública", key: 'totalReparticaoPublica', icon: Building },
        { label: "Outros", key: 'totalOutros', icon: User },
    ];

    const beneficiosConfig: KpiConfigItem[] = [
        { label: "SSA Água", key: 'aguaSim', icon: Droplets },
        { label: "Garantia Safra", key: 'garantidaSafraSim', icon: ShieldCheck },
        { label: "Adagro", key: 'adagroSim', icon: CheckSquare },
        { label: "Chapéu Palha", key: 'chapeuPalhaSim', icon: Sun },
        { label: "PAA", key: 'paaSim', icon: Sprout },
        { label: "PNAE", key: 'pnaeSim', icon: Wheat },
    ];

    const getCount = (key: keyof EstatisticasPessoas | keyof ListasBeneficios): number => {
        if (key in estatisticas) {
            const list = estatisticas[key as keyof EstatisticasPessoas];
            return Array.isArray(list) ? list.length : 0;
        }
        if (key in estatisticas.beneficios) {
            const list = estatisticas.beneficios[key as keyof ListasBeneficios];
            return Array.isArray(list) ? list.length : 0;
        }
        return 0;
    };

    const handleCardClick = (filtroKey: keyof EstatisticasPessoas | keyof ListasBeneficios, titulo: string) => {
        let lista: Pessoa[] = [];
        if (filtroKey in estatisticas) {
            lista = estatisticas[filtroKey as keyof EstatisticasPessoas] as Pessoa[];
        } else if (filtroKey in estatisticas.beneficios) {
            lista = estatisticas.beneficios[filtroKey as keyof ListasBeneficios];
        }
        setTituloModal(titulo);
        setPessoasNoModal(lista || []);
        setModalAberto(true);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <ModalPessoas isOpen={modalAberto} onClose={() => setModalAberto(false)} title={tituloModal} people={pessoasNoModal} isLoading={false} />
            
            <div className="lg:col-span-1 flex flex-col gap-8">
                <div className="bg-white p-4 rounded-xl shadow-lg">
                    <h3 className="text-lg font-bold text-gray-800 mb-2 px-2">Categorias de Pessoas</h3>
                    <div className="flex flex-col gap-1">
                        {categoriasConfig.map((item) => {
                            const count = getCount(item.key);
                            return <KpiListItem key={item.key} label={item.label} value={count} icon={item.icon} onClick={() => handleCardClick(item.key, item.label)} disabled={count === 0} />;
                        })}
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-lg">
                    <h3 className="text-lg font-bold text-gray-800 mb-2 px-2">Benefícios Sociais</h3>
                    <div className="flex flex-col gap-1">
                        {beneficiosConfig.map((item) => {
                            const count = getCount(item.key);
                            return <KpiListItem key={item.key} label={item.label} value={count} icon={item.icon} onClick={() => handleCardClick(item.key, item.label)} disabled={count === 0} />;
                        })}
                    </div>
                </div>
            </div>

            <div className="lg:col-span-2">
                <AnaliseDeGenero genero={estatisticas.genero} detalhes={estatisticas.beneficios.detalhes} />
            </div>
        </div>
    );
};

// ===================================================================
// 4. COMPONENTE PRINCIPAL DA PÁGINA (ESTRUTURA COM FILTROS)
// ===================================================================

// --- Botão de Aba ---
const TabButton: React.FC<{ label: string; icon: React.ElementType; isActive: boolean; onClick: () => void; }> = ({ label, icon: Icon, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-t-lg border-b-2 transition-all duration-300 ${
            isActive
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-blue-600"
        }`}
    >
        <Icon size={16} />
        {label}
    </button>
);

// --- Componente de Filtro de Período com Date Picker ---
interface PeriodSelectorProps {
    period: Periodo;
    onPeriodChange: (period: Periodo) => void;
}

const PeriodSelector: React.FC<PeriodSelectorProps> = ({ period, onPeriodChange }) => {
    const [showDatePicker, setShowDatePicker] = useState(false);
    const datePickerRef = useRef<HTMLDivElement>(null);

    const periodOptions = [
        { key: 'this_month', label: 'Este Mês' },
        { key: 'last_6_months', label: '6 meses' }, // CORREÇÃO: "mouths" para "months"
        { key: 'this_year', label: 'Este Ano' },
        { key: 'all_time', label: 'Todo' },
    ];

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
                setShowDatePicker(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleDateChange = (range: DateRange | undefined) => {
        if (range) {
            onPeriodChange(range);
        }
    };

    const isCustomDate = typeof period === 'object';

    return (
        <div className="flex items-center bg-gray-100 rounded-lg p-1 text-sm">
            {periodOptions.map(option => (
                <button
                    key={option.key}
                    onClick={() => onPeriodChange(option.key)}
                    className={`px-3 py-1 rounded-md transition-colors ${
                        period === option.key ? 'bg-white text-blue-600 shadow-sm font-semibold' : 'text-gray-600 hover:bg-gray-200'
                    }`}
                >
                    {option.label}
                </button>
            ))}
            <div className="relative" ref={datePickerRef}>
                <button
                    onClick={() => setShowDatePicker(!showDatePicker)}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors ${
                        isCustomDate ? 'bg-white text-blue-600 shadow-sm font-semibold' : 'text-gray-600 hover:bg-gray-200'
                    }`}
                >
                    <CalendarIcon size={14} />
                    {isCustomDate && period.from ? 
                        `${format(period.from, 'dd/MM')} - ${period.to ? format(period.to, 'dd/MM') : ''}` 
                        : 'Personal.'
                    }
                </button>
                {showDatePicker && (
                    <div className="absolute top-full right-0 mt-2 z-10 bg-white border border-gray-200 rounded-lg shadow-xl animate-fade-in-down">
                        <DayPicker
                            mode="range"
                            selected={isCustomDate ? period : undefined}
                            onSelect={handleDateChange}
                            locale={ptBR}
                            numberOfMonths={2}
                            showOutsideDays
                            fixedWeeks
                        />
                    </div>
                )}
            </div>
        </div>
    );
};


// --- Componente de Controles de Filtro ---
interface FilterControlsProps {
    services: string[];
    selectedService: string;
    onServiceChange: (value: string) => void;
    selectedPeriod: Periodo;
    onPeriodChange: (value: Periodo) => void;
}

const FilterControls: React.FC<FilterControlsProps> = ({ services, selectedService, onServiceChange, selectedPeriod, onPeriodChange }) => {
    const selectClassName = "w-full sm:w-auto text-sm bg-gray-50 border border-gray-200 text-gray-800 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all appearance-none";
    
    return (
        <div className="flex flex-col sm:flex-row items-center gap-3 animate-fade-in">
            <select
                id="service-filter"
                value={selectedService}
                onChange={(e) => onServiceChange(e.target.value)}
                className={selectClassName}
            >
                <option value="todos">Todos os Serviços</option>
                {services.map(service => (
                    <option key={service} value={service}>{service}</option>
                ))}
            </select>
            
            <PeriodSelector period={selectedPeriod} onPeriodChange={onPeriodChange} />
        </div>
    );
};

export default function DashboardComponent() {
    const [estatisticas, setEstatisticas] = useState<EstatisticasPessoas | null>(null);
    const [abaSelecionada, setAbaSelecionada] = useState<"pedidos" | "pessoas">("pedidos");
    const [isLoading, setIsLoading] = useState(false);

    const [services, setServices] = useState<string[]>([]);
    const [selectedService, setSelectedService] = useState<string>('todos');
    const [selectedPeriod, setSelectedPeriod] = useState<Periodo>('this_month');

    useEffect(() => {
        if (abaSelecionada === 'pessoas' && !estatisticas) {
            setIsLoading(true);
            api.get("/users/estatisticas")
                .then(response => setEstatisticas(response.data))
                .catch(error => console.error("Erro ao carregar as estatísticas", error))
                .finally(() => setIsLoading(false));
        }
    }, [abaSelecionada, estatisticas]);

    useEffect(() => {
        if (abaSelecionada === 'pedidos') {
            api.get("/servicos")
                .then(response => {
                    if (response.data && Array.isArray(response.data)) {
                       setServices(response.data.map((s: { servico: string }) => s.servico));
                    }
                })
                .catch(error => console.error("Erro ao carregar os serviços para o filtro", error));
        }
    }, [abaSelecionada]);
    
    const renderContent = () => {
        if (isLoading) {
            return <div className="min-h-[60vh] flex items-center justify-center"><LoadingSpinner /></div>;
        }

       
        
        switch(abaSelecionada) {
            case 'pedidos':
                return <DashboardOperacional service={selectedService} period={selectedPeriod} />;
            case 'pessoas':
                return estatisticas ? <DashboardPessoas estatisticas={estatisticas} /> : <div className="text-center text-gray-500 py-10">Não foi possível carregar os dados.</div>;
            default:
                return null;
        }
    }

    return (
        <div className="w-full min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
            <header className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Dashboard Geral</h1>
                <p className="text-md text-gray-500">Visão completa dos dados da plataforma.</p>
            </header>

            <div className="border-b border-gray-200">
                <nav className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 -mb-px">
                    <div className="flex space-x-6">
                        <TabButton label="Análise de Pedidos" icon={FileText} isActive={abaSelecionada === 'pedidos'} onClick={() => setAbaSelecionada('pedidos')} />
                        <TabButton label="Análise de Pessoas" icon={Users} isActive={abaSelecionada === 'pessoas'} onClick={() => setAbaSelecionada('pessoas')} />
                    </div>

                    {abaSelecionada === 'pedidos' && (
                        <FilterControls
                            services={services}
                            selectedService={selectedService}
                            onServiceChange={setSelectedService}
                            selectedPeriod={selectedPeriod}
                            onPeriodChange={setSelectedPeriod}
                        />
                    )}
                </nav>
            </div>

            <main className="mt-6">
                {renderContent()}
            </main>
        </div>
    );
};
