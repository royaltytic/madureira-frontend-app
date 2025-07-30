import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell } from 'recharts';
import api from '../../services/api';
import { useServicosList } from '../../constants/Servicos';
import { CalendarDays } from 'lucide-react';
import { LoadingSpinner } from '../loading/LoadingSpinner';

// ===================================================================
// COMPONENTE PeriodoModal (Opcional: mover para seu próprio arquivo)
// ===================================================================
const getMonthName = (month: number) => {
    const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    return months[month - 1];
};

type PeriodoMode = 'mes' | 'periodo';

interface PeriodoModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (dates: { startDate: string, endDate: string, display: string }) => void;
}

function PeriodoModal({ isOpen, onClose, onConfirm }: PeriodoModalProps) {
    const [mode, setMode] = useState<PeriodoMode>('mes');
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    const today = new Date().toISOString().split('T')[0];
    const [startDate, setStartDate] = useState(today);
    const [endDate, setEndDate] = useState(today);

    if (!isOpen) return null;

    const handleConfirm = () => {
        if (mode === 'mes') {
            const firstDay = new Date(year, month - 1, 1).toISOString().split('T')[0];
            const lastDay = new Date(year, month, 0).toISOString().split('T')[0];
            onConfirm({
                startDate: firstDay,
                endDate: lastDay,
                display: `${getMonthName(month)} de ${year}`
            });
        } else {
             onConfirm({
                startDate,
                endDate,
                display: `${new Date(startDate+'T00:00:00').toLocaleDateString('pt-BR')} - ${new Date(endDate+'T00:00:00').toLocaleDateString('pt-BR')}`
            });
        }
        onClose();
    };
    
    const TabButton = ({ currentMode, targetMode, children }: { currentMode: PeriodoMode, targetMode: PeriodoMode, children: React.ReactNode }) => (
        <button onClick={() => setMode(targetMode)}
            className={`w-full p-2 text-sm font-semibold rounded-md transition-colors ${
                currentMode === targetMode ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}>
            {children}
        </button>
    );

    return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center" onClick={onClose}>
            <div className="bg-white w-96 p-6 rounded-lg shadow-xl" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-xl font-bold mb-4 text-center text-gray-800">Selecione o Período</h2>
                <div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-lg">
                    <TabButton currentMode={mode} targetMode="mes">Por Mês</TabButton>
                    <TabButton currentMode={mode} targetMode="periodo">Por Período</TabButton>
                </div>
                {mode === 'mes' ? (
                    <div className="flex gap-4 mb-6">
                        <select value={month} onChange={(e) => setMonth(Number(e.target.value))} className="w-1/2 p-2 border rounded-md focus:ring-2 focus:ring-blue-500">
                            {Array.from({ length: 12 }, (_, i) => <option key={i + 1} value={i + 1}>{getMonthName(i + 1)}</option>)}
                        </select>
                        <select value={year} onChange={(e) => setYear(Number(e.target.value))} className="w-1/2 p-2 border rounded-md focus:ring-2 focus:ring-blue-500">
                            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Data Início</label>
                            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Data Fim</label>
                            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500" />
                        </div>
                    </div>
                )}
                <button className="bg-blue-600 hover:bg-blue-700 w-full font-bold text-white px-4 py-2 rounded-md transition-colors" onClick={handleConfirm}>
                    Confirmar
                </button>
            </div>
        </div>
    );
}


// ===================================================================
// COMPONENTE DO CARD COM O VISUAL ORIGINAL
// ===================================================================
const ORIGINAL_COLORS = ['#812F2C', '#165C38'];

interface GraficoCardProps {
    servico: string;
    // O `data` agora é um objeto para facilitar o acesso aos valores
    stats: { aguardando: number; finalizado: number }; 
    total: number;
    percentageF: string;
    
}

const GraficoCard: React.FC<GraficoCardProps> = ({ servico, stats, total, percentageF }) => {
    const [showText, setShowText] = useState(false);
    const hasOrders = total > 0;
    
    // Formata os dados para o gráfico PieChart
    const pieChartData = [
        { name: 'Aguardando', value: stats.aguardando },
        { name: 'Finalizado', value: stats.finalizado },
    ];

    return (
        <div className="w-full max-w-[200px] border rounded-lg flex flex-col p-2 mt-3 shadow-lg bg-white">
            <h1 className="font-bold text-xs text-gray-800">{servico}</h1>
            {hasOrders ? (
                <>
                    <div className="flex justify-center items-center">
                        <PieChart width={150} height={130}>
                            <Pie
                                data={pieChartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={30}
                                outerRadius={45}
                                paddingAngle={1}
                                dataKey="value"
                                animationDuration={1500}
                                onAnimationEnd={() => setShowText(true)}
                            >
                                {pieChartData.map((_entry, index) => (
                                    <Cell key={`cell-${index}`} fill={ORIGINAL_COLORS[index % ORIGINAL_COLORS.length]} />
                                ))}
                            </Pie>
                            {showText && (
                                <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="text-black text-lg font-bold">
                                    {`${percentageF}%`}
                                </text>
                            )}
                        </PieChart>
                    </div>
                    {/* Legenda com o estilo original */}
                    <div className="flex justify-between mt-2 text-center text-xs px-2">
                        <div>
                            <div className="w-8 h-2 bg-gradient-to-b from-[#00324C] to-[#191B23] rounded-sm mx-auto"></div>
                            <p className="font-bold mt-1 text-gray-700">{total}</p>
                        </div>
                        <div>
                            <div className="w-8 h-2 bg-gradient-to-r from-[#0E9647] to-[#165C38] rounded-sm mx-auto"></div>
                            <p className="font-bold mt-1 text-gray-700">{stats.finalizado}</p>
                        </div>
                        <div>
                            <div className="w-8 h-2 bg-gradient-to-r from-[#E03335] to-[#812F2C] rounded-sm mx-auto"></div>
                            <p className="font-bold mt-1 text-gray-700">{stats.aguardando}</p>
                        </div>
                    </div>
                </>
            ) : (
                <div className="text-center text-gray-500 h-[170px] flex items-center justify-center">
                    <p>Sem pedidos</p>
                </div>
            )}
        </div>
    );
};

// ===================================================================
// COMPONENTE PRINCIPAL (ORQUESTRADOR OTIMIZADO)
// ===================================================================
interface OrderProps { situacao: string; }
interface ServiceData { nome: string; stats: { aguardando: number; finalizado: number }; total: number; percentageF: string; }

export default function GraficoPorServicos() {
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [servicesData, setServicesData] = useState<ServiceData[]>([]);
    
    const [period, setPeriod] = useState(() => {
        const today = new Date();
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
        const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
        const display = today.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
        return { startDate: firstDay, endDate: lastDay, display: display.charAt(0).toUpperCase() + display.slice(1) };
    });

    const { servicosNomes } = useServicosList();

    useEffect(() => {
        if (servicosNomes.length === 0) return;

        const fetchAllServices = async () => {
            setIsLoading(true);
            const promises = servicosNomes
                .filter(nome => nome !== 'Todos')
                .map(async nome => {
                    try {
                        const response = await api.get('/orders/filter', {
                            params: { servico: nome, dataInicio: period.startDate, dataFim: period.endDate },
                        });
                        const orders = Array.isArray(response.data) ? response.data : [];
                        const finalizado = orders.filter((order: OrderProps) => order.situacao === 'Finalizado').length;
                        const aguardando = orders.filter((order: OrderProps) => order.situacao === 'Aguardando' || order.situacao.startsWith('Lista')).length;
                        const total = finalizado + aguardando;
                        const percentageF = total > 0 ? ((finalizado / total) * 100).toFixed(0) : "0";
                        return { nome, stats: { aguardando, finalizado }, total, percentageF };
                    } catch (error) {
                        console.error(`Erro ao buscar dados para ${nome}:`, error);
                        return { nome, stats: { aguardando: 0, finalizado: 0 }, total: 0, percentageF: "0" };
                    }
                });

            const results = await Promise.all(promises);

            results.sort((a, b) => b.total - a.total);
            setServicesData(results);
            setIsLoading(false);
            setCurrentPage(0);
        };

        fetchAllServices();
    }, [servicosNomes, period]);

    const CARDS_PER_PAGE = 12;
    const totalPages = Math.ceil(servicesData.length / CARDS_PER_PAGE);
    const paginatedServices = servicesData.slice(currentPage * CARDS_PER_PAGE, (currentPage + 1) * CARDS_PER_PAGE);

    return (
        <div className="flex flex-col gap-6 p-4 bg-gray-50 min-h-screen">
            <div className="flex items-center justify-between">
                <h1 className="font-bold text-2xl text-gray-800">Análise de Serviços</h1>
                <button 
                    className="flex items-center gap-2 justify-center w-auto min-w-[200px] p-2 rounded-lg bg-white text-blue-600 border border-gray-300 shadow-sm hover:bg-gray-100 transition-all" 
                    onClick={() => setIsPopupOpen(true)}>
                    <CalendarDays size={16} />
                    <p className="text-md font-semibold capitalize">{period.display}</p>
                </button>
            </div>

            <PeriodoModal 
                isOpen={isPopupOpen} 
                onClose={() => setIsPopupOpen(false)} 
                onConfirm={setPeriod} 
            />

            {isLoading ? (
                <div className="min-h-[50vh] flex items-center justify-center"><LoadingSpinner /></div>
            ) : (
                <div className="flex flex-col items-center">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-4 gap-4">
                        {paginatedServices.map(service => (
                            <GraficoCard key={service.nome} servico={service.nome} stats={service.stats} total={service.total} percentageF={service.percentageF} />
                        ))}
                    </div>

                    {totalPages > 1 && ( 
                        <div className="flex justify-center mt-8 space-x-2">
                            {Array.from({ length: totalPages }, (_, index) => (
                                <button key={index} onClick={() => setCurrentPage(index)}
                                    className={`w-3 h-3 rounded-full transition-colors ${currentPage === index ? 'bg-blue-600' : 'bg-gray-400 hover:bg-gray-500'}`} />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}