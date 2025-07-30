// src/components/dashboards/DashboardOperacional.tsx

import React, { useState, useEffect, useMemo } from 'react';
import { PieChart, Pie, Cell, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CheckCircle, Clock, BarChart2, TrendingUp, Grid, CalendarClock, AlertTriangle, ChevronDown, } from 'lucide-react';
import { useServicosList } from '../../constants/Servicos';
import api from '../../services/api';
// Adicionado subDays e DateRange
import { format, eachMonthOfInterval, startOfMonth, endOfMonth, subMonths, startOfDay, endOfDay, startOfYear,  eachDayOfInterval, eachWeekOfInterval,  eachHourOfInterval, differenceInDays, parseISO, subDays, getWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';
import { OrdersProps } from '../../types/types';
import { DateRange } from 'react-day-picker';

// ===================================================================
// TIPOS E INTERFACES (ATUALIZADO)
// ===================================================================

type Periodo = string | DateRange;

// [MUDANÇA] Tipos de stats simplificados conforme o design original
export interface ServicoStats {
    nome: string;
    stats: { 
        aguardando: number; 
        finalizado: number; 
    };
    total: number; // Este será o total válido (não inclui cancelados)
}

export interface TrendData {
    name: string;
    Total: number;
}

// [MUDANÇA] KPIs simplificados conforme o design original
interface DashboardData {
    kpis: { 
        totalPedidos: number; 
        pedidosFinalizados: number; 
        pedidosAguardando: number; 
    };
    trendData: TrendData[];
    servicesBreakdown: ServicoStats[];
    chartPeriodLabel: string;
}

interface DashboardOperacionalProps {
    service: string;
    period: Periodo;
}

// ===================================================================
// FUNÇÃO AUXILIAR DE DATA
// ===================================================================

const calculateDateRange = (period: Periodo) => {
    const today = new Date();
    let startDate: Date;
    let endDate: Date = endOfDay(today);

    if (typeof period === 'object' && period.from) {
        return {
            startDate: format(startOfDay(period.from), "yyyy-MM-dd"),
            endDate: format(endOfDay(period.to || period.from), "yyyy-MM-dd"),
        };
    }
    
    const periodStr = period as string;
    switch (periodStr) {
        case 'today':
             startDate = startOfDay(today);
             break;
        case 'last_7_days':
            startDate = startOfDay(subDays(today, 6));
            break;
        case 'last_3_months':
            startDate = startOfMonth(subMonths(today, 2));
            break;
        case 'last_6_months':
            startDate = startOfMonth(subMonths(today, 5));
            break;
        case 'this_month':
            startDate = startOfMonth(today);
            break;
        case 'this_year':
            startDate = startOfYear(today);
            break;
        case 'all_time':
        default:
            startDate = new Date('2000-01-01');
            endDate = new Date('2100-01-01');
            break;
    }

    return {
        startDate: format(startDate, "yyyy-MM-dd"),
        endDate: format(endDate, "yyyy-MM-dd"),
    };
};


// ===================================================================
// COMPONENTES DE UI E GRÁFICOS
// ===================================================================

interface KpiCardProps {
    title: string;
    value: string | number;
    icon: React.ElementType;
    color: string;
}
const KpiCard: React.FC<KpiCardProps> = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white p-4 rounded-xl shadow-md flex items-center gap-4 transition-transform hover:scale-105">
        <div className={`p-3 rounded-full`} style={{ backgroundColor: `${color}20` }}>
            <Icon size={24} style={{ color }} />
        </div>
        <div>
            <p className="text-sm text-gray-500 font-medium">{title}</p>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
    </div>
);

interface GraficoTendenciaProps {
    data: TrendData[];
    periodLabel: string;
}
const GraficoTendencia: React.FC<GraficoTendenciaProps> = ({ data, periodLabel }) => {
    const [tipoGrafico, setTipoGrafico] = useState<'linha' | 'coluna'>('linha');
    const ChartComponent = tipoGrafico === 'linha' ? LineChart : BarChart;

    return (
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg h-[400px] flex flex-col">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-lg font-bold text-gray-800">Tendência de Pedidos</h3>
                    <p className="text-sm text-gray-500">Volume total de pedidos ({periodLabel})</p>
                </div>
                <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                    <button onClick={() => setTipoGrafico('linha')} className={`px-2 py-1 rounded-md transition-colors ${tipoGrafico === 'linha' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}>
                        <TrendingUp size={20} className="text-gray-600"/>
                    </button>
                    <button onClick={() => setTipoGrafico('coluna')} className={`px-2 py-1 rounded-md transition-colors ${tipoGrafico === 'coluna' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}>
                        <BarChart2 size={20} className="text-gray-600"/>
                    </button>
                </div>
            </div>
            <ResponsiveContainer width="100%" height="100%">
                <ChartComponent data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis dataKey="name" stroke="#555" fontSize={12}/>
                    <YAxis stroke="#555" fontSize={12}/>
                    <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '8px' }} />
                    <Legend/>
                    {tipoGrafico === 'linha' ? (
                        <Line type="monotone" dataKey="Total" name="Total de Pedidos" stroke="#3b82f6" strokeWidth={2} activeDot={{ r: 6 }}/>
                    ) : (
                        <Bar dataKey="Total" name="Total de Pedidos" fill="#3b82f6" />
                    )}
                </ChartComponent>
            </ResponsiveContainer>
        </div>
    );
};

const COLORS = ['#16a34a', '#ef4444'];
const GraficoCard: React.FC<{ servico: ServicoStats }> = ({ servico }) => {
    const pieData = [
        { name: 'Finalizado', value: servico.stats.finalizado },
        { name: 'Aguardando', value: servico.stats.aguardando },
    ];
    const percentageF = servico.total > 0 ? ((servico.stats.finalizado / servico.total) * 100).toFixed(0) : "0";

    return (
        <div className="bg-white p-4 rounded-xl shadow-lg flex flex-col gap-4 transition-transform hover:-translate-y-1 min-h-[280px]">
            <h3 className="font-bold text-base text-gray-800 truncate text-center" title={servico.nome}>{servico.nome}</h3>
            {servico.total > 0 ? (
                <>
                    <div className="mx-auto w-[150px] h-[150px] relative flex items-center justify-center">
                        <PieChart width={150} height={150}>
                            <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={65} dataKey="value" paddingAngle={3}>
                                {pieData.map((_entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                            </Pie>
                        </PieChart>
                         <span className="absolute inset-0 flex items-center justify-center text-3xl font-bold text-gray-800">{percentageF}%</span>
                    </div>
                    <div className="w-full text-sm font-medium border-t border-gray-200 pt-3 mt-auto">
                        <div className="flex justify-between items-center mb-2">
                            <p className="flex items-center gap-2 text-gray-600"><span className="w-3 h-3 rounded-full bg-green-500"></span> Finalizados</p>
                            <span className="font-bold text-base text-gray-800">{servico.stats.finalizado}</span>
                        </div>
                        <div className="flex justify-between items-center mb-3">
                            <p className="flex items-center gap-2 text-gray-600"><span className="w-3 h-3 rounded-full bg-red-500"></span> Aguardando</p>
                            <span className="font-bold text-base text-gray-800">{servico.stats.aguardando}</span>
                        </div>
                        <div className="flex justify-between items-center border-t border-gray-200 pt-2 mt-2">
                            <p className="font-semibold text-gray-700">Total de Pedidos</p>
                            <span className="font-bold text-lg text-blue-600">{servico.total}</span>
                        </div>
                    </div>
                </>
            ) : (
                 <div className="flex-grow flex items-center justify-center">
                    <p className="text-center text-gray-500">Sem pedidos no período</p>
                 </div>
            )}
        </div>
    );
};

interface AnaliseDetalhadaProps {
  servico: ServicoStats;
  trendData: TrendData[];
  periodLabel: string;
}
const AnaliseServicoDetalhado: React.FC<AnaliseDetalhadaProps> = ({ servico, trendData, periodLabel }) => {
  const pieData = [
    { name: 'Finalizado', value: servico.stats.finalizado },
    { name: 'Aguardando', value: servico.stats.aguardando },
  ];
  const percentageF = servico.total > 0 ? ((servico.stats.finalizado / servico.total) * 100).toFixed(0) : "0";

  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-1">Análise Detalhada do Serviço</h2>
      <p className="text-lg text-blue-600 font-semibold mb-6">{servico.nome}</p>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="flex-1 bg-gray-50 p-4 rounded-lg text-center">
            <p className="text-sm text-gray-500">Total de Pedidos ({periodLabel})</p>
            <p className="text-4xl font-bold text-gray-800">{servico.total}</p>
          </div>
          <div className="flex-1 bg-gray-50 p-4 rounded-lg flex items-center justify-around">
            <div className="text-center">
                <p className="text-sm text-green-600">Finalizados</p>
                <p className="text-2xl font-bold text-green-600">{servico.stats.finalizado}</p>
            </div>
             <div className="text-center">
                <p className="text-sm text-red-600">Aguardando</p>
                <p className="text-2xl font-bold text-red-600">{servico.stats.aguardando}</p>
            </div>
          </div>
          <div className="flex-1 bg-gray-50 p-4 rounded-lg flex flex-col items-center justify-center">
             <h3 className="font-semibold text-gray-700 mb-2">Taxa de Conclusão</h3>
             <div className="w-[120px] h-[120px] relative">
                <PieChart width={120} height={120}>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={35} outerRadius={50} dataKey="value" paddingAngle={3}>
                        {pieData.map((_entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                </PieChart>
                <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-gray-800">{percentageF}%</span>
             </div>
          </div>
        </div>
        <div className="lg:col-span-2 bg-gray-50 p-4 rounded-lg h-[400px] flex flex-col">
           <h3 className="font-semibold text-gray-700 mb-2">Histórico de Pedidos ({periodLabel})</h3>
            <ResponsiveContainer width="100%" height="90%">
                <BarChart data={trendData} margin={{ top: 5, right: 20, left: -10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis dataKey="name" stroke="#555" fontSize={12} />
                    <YAxis stroke="#555" fontSize={12} />
                    <Tooltip cursor={{fill: 'rgba(59, 130, 246, 0.1)'}} contentStyle={{ backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '8px' }} />
                    <Bar dataKey="Total" name="Total de Pedidos" fill="#3b82f6" />
                </BarChart>
            </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};


// ===================================================================
// COMPONENTE PRINCIPAL DO DASHBOARD (LÓGICA DE DADOS ATUALIZADA)
// ===================================================================
export default function DashboardOperacional({ service, period }: DashboardOperacionalProps) {
    const [data, setData] = useState<DashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showSemPedidos, setShowSemPedidos] = useState(false);
    const { servicosNomes, isLoading: isLoadingServicos } = useServicosList();
    
    useEffect(() => {
        if (isLoadingServicos) return;

        const fetchData = async () => {
            setIsLoading(true);
            setError(null);

            const { startDate, endDate } = calculateDateRange(period);
            
            let chartPeriodLabel = 'Período Personalizado';
            if (typeof period === 'string') {
                const periodLabels: { [key: string]: string } = {
                    'today': 'Hoje',
                    'last_7_days': 'Últimos 7 Dias',
                    'this_month': 'Este Mês',
                    'last_3_months': 'Últimos 3 Meses',
                    'last_6_months': 'Últimos 6 meses', 
                    'this_year': 'Este Ano', 
                    'all_time': 'Todo o Período',
                };
                chartPeriodLabel = periodLabels[period] || 'Período Personalizado';
            } else if (period.from) {
                const startStr = format(period.from, 'dd/MM/yy');
                const endStr = period.to ? format(period.to, 'dd/MM/yy') : startStr;
                chartPeriodLabel = `De ${startStr} a ${endStr}`;
            }

            try {
                const servicosParaBuscar = service === 'todos' 
                    ? servicosNomes.filter(s => s !== 'Todos') 
                    : [service];

                const orderPromises = servicosParaBuscar.map(nome =>
                    api.get('/orders/filter', {
                        params: { servico: nome, dataInicio: startDate, dataFim: endDate },
                    }).then(response => (Array.isArray(response.data) ? response.data : []))
                      .catch(error => {
                          console.error(`Erro ao buscar pedidos para ${nome}:`, error);
                          return [];
                      })
                );

                const results = await Promise.all(orderPromises);
                const allOrders: OrdersProps[] = results.flat();

                // [MUDANÇA] Filtra os pedidos cancelados para calcular o total válido
                const validOrders = allOrders.filter(o => o.situacao !== 'Cancelado');

                // [MUDANÇA] Calcula KPIs a partir dos pedidos válidos e totais
                const kpis = {
                    totalPedidos: validOrders.length,
                    pedidosFinalizados: validOrders.filter(o => o.situacao === 'Finalizado').length,
                    pedidosAguardando: validOrders.filter(o => o.situacao === 'Aguardando' || o.situacao.startsWith('Lista')).length,
                };

                // [MUDANÇA] Calcula o breakdown por serviço com a nova lógica
                const servicesBreakdown = servicosParaBuscar.map(nome => {
                    const serviceOrders = allOrders.filter(o => o.servico === nome);
                    const validServiceOrders = serviceOrders.filter(o => o.situacao !== 'Cancelado');
                    return {
                        nome,
                        stats: {
                            finalizado: validServiceOrders.filter(o => o.situacao === 'Finalizado').length,
                            aguardando: validServiceOrders.filter(o => o.situacao === 'Aguardando' || o.situacao.startsWith('Lista')).length,
                        },
                        total: validServiceOrders.length,
                    };
                });
                
                // [MUDANÇA] Calcula a tendência com base nos pedidos válidos
                let trendData: TrendData[] = [];
                const today = new Date();

                if (typeof period === 'object' && period.from) {
                    const customStartDate = period.from;
                    const customEndDate = period.to || period.from;
                    const diffDays = differenceInDays(customEndDate, customStartDate);

                    if (diffDays < 1) {
                        const grouped = validOrders.reduce((acc, order) => {
                            const key = format(parseISO(order.data), 'HH:00');
                            acc[key] = (acc[key] || 0) + 1;
                            return acc;
                        }, {} as Record<string, number>);
                        const interval = { start: startOfDay(customStartDate), end: endOfDay(customEndDate) };
                        trendData = eachHourOfInterval(interval).map(hour => ({
                            name: format(hour, 'HH:00'),
                            Total: grouped[format(hour, 'HH:00')] || 0,
                        }));
                    } else if (diffDays <= 31) {
                        const grouped = validOrders.reduce((acc, order) => {
                            const key = format(parseISO(order.data), 'dd/MM');
                            acc[key] = (acc[key] || 0) + 1;
                            return acc;
                        }, {} as Record<string, number>);
                        const interval = { start: customStartDate, end: customEndDate };
                        trendData = eachDayOfInterval(interval).map(day => ({
                            name: format(day, 'dd/MM'),
                            Total: grouped[format(day, 'dd/MM')] || 0,
                        }));
                    } else {
                        const grouped = validOrders.reduce((acc, order) => {
                            const key = format(parseISO(order.data), 'MMM/yy', { locale: ptBR });
                            acc[key] = (acc[key] || 0) + 1;
                            return acc;
                        }, {} as Record<string, number>);
                        const interval = { start: startOfMonth(customStartDate), end: endOfMonth(customEndDate) };
                        trendData = eachMonthOfInterval(interval).map(month => ({
                            name: format(month, 'MMM/yy', { locale: ptBR }).replace('.', '').toUpperCase(),
                            Total: grouped[format(month, 'MMM/yy', { locale: ptBR })] || 0,
                        }));
                    }
                } else {
                     switch (period) {
                        case 'today': {
                            const grouped = validOrders.reduce((acc, order) => {
                                const key = format(parseISO(order.data), 'HH:00');
                                acc[key] = (acc[key] || 0) + 1;
                                return acc;
                            }, {} as Record<string, number>);
                            const interval = { start: startOfDay(today), end: endOfDay(today) };
                            trendData = eachHourOfInterval(interval).map(hour => ({
                                name: format(hour, 'HH:00'),
                                Total: grouped[format(hour, 'HH:00')] || 0,
                            }));
                            break;
                        }
                        case 'last_7_days': {
                            const grouped = validOrders.reduce((acc, order) => {
                                const key = format(parseISO(order.data), 'dd/MM');
                                acc[key] = (acc[key] || 0) + 1;
                                return acc;
                            }, {} as Record<string, number>);
                            const interval = { start: subDays(today, 6), end: today };
                            trendData = eachDayOfInterval(interval).map(day => ({
                                name: format(day, 'dd/MM'),
                                Total: grouped[format(day, 'dd/MM')] || 0,
                            }));
                            break;
                        }
                        case 'this_month': {
                            const grouped = validOrders.reduce((acc, order) => {
                                const orderDate = parseISO(order.data);
                                const key = `${format(orderDate, 'yyyy')}-${getWeek(orderDate, { weekStartsOn: 1 })}`;
                                acc[key] = (acc[key] || 0) + 1;
                                return acc;
                            }, {} as Record<string, number>);
                            
                            const interval = { start: startOfMonth(today), end: today };
                            const weeksInInterval = eachWeekOfInterval(interval, { weekStartsOn: 1 });

                            trendData = weeksInInterval.map((weekStart, index) => {
                                const key = `${format(weekStart, 'yyyy')}-${getWeek(weekStart, { weekStartsOn: 1 })}`;
                                return {
                                    name: `Sem ${index + 1}`,
                                    Total: grouped[key] || 0,
                                };
                            });
                            break;
                        }
                        default: {
                            const grouped = validOrders.reduce((acc, order) => {
                                const key = format(parseISO(order.data), 'MMM/yy', { locale: ptBR });
                                acc[key] = (acc[key] || 0) + 1;
                                return acc;
                            }, {} as Record<string, number>);

                            let tendencyStart: Date;
                            const tendencyEnd: Date = new Date();
                             switch (period) {
                                case 'last_3_months': tendencyStart = startOfMonth(subMonths(today, 2)); break;
                                case 'last_6_months': tendencyStart = startOfMonth(subMonths(today, 5)); break;
                                case 'this_year': tendencyStart = startOfYear(today); break;
                                case 'all_time': tendencyStart = startOfMonth(subMonths(today, 11)); break;
                                default: tendencyStart = startOfMonth(subMonths(today, 5)); break;
                            }
                            const tendencyInterval = eachMonthOfInterval({ start: tendencyStart, end: tendencyEnd });
                            trendData = tendencyInterval.map(month => ({
                                name: format(month, 'MMM/yy', { locale: ptBR }).replace('.', '').toUpperCase(),
                                Total: grouped[format(month, 'MMM/yy', { locale: ptBR })] || 0,
                            }));
                            break;
                        }
                    }
                }

                setData({ kpis, servicesBreakdown, trendData, chartPeriodLabel });

            } catch (err) {
                console.error("Erro ao orquestrar a busca de dados do dashboard:", err);
                setError("Não foi possível carregar os dados. Tente novamente mais tarde.");
                setData(null);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [period, service, isLoadingServicos, servicosNomes]);

    const kpis = useMemo(() => {
        const defaultKpis = { totalPedidos: 0, pedidosFinalizados: 0, pedidosAguardando: 0, taxaConclusao: '0%', mediaMensal: 0 };
        if (!data) return defaultKpis;
        const { totalPedidos, pedidosFinalizados } = data.kpis;
        const taxa = totalPedidos > 0 ? `${((pedidosFinalizados / totalPedidos) * 100).toFixed(1)}%` : '0%';
        
        let media = 0;
        if (data.trendData.length > 0) {
            media = totalPedidos / data.trendData.length;
        }

        return { ...data.kpis, taxaConclusao: taxa, mediaMensal: media };
    }, [data]);

    const renderContent = () => {
        if (isLoading) {
            return <div className="min-h-[400px] flex items-center justify-center"><p>Carregando dados...</p></div>;
        }
        if (error) {
            return (
                <div className="bg-red-50 text-red-700 p-6 rounded-lg flex items-center gap-4">
                    <AlertTriangle size={40} />
                    <div><h3 className="font-bold">Ocorreu um erro</h3><p>{error}</p></div>
                </div>
            );
        }
        if (!data) return null;

        const servicosComPedidos = data.servicesBreakdown.filter(s => s.total > 0);
        const servicosSemPedidos = data.servicesBreakdown.filter(s => s.total === 0);

        return (
            <div className="flex flex-col gap-8">
                {service !== 'todos' && data.servicesBreakdown.length > 0 ? (
                    <AnaliseServicoDetalhado 
                        servico={data.servicesBreakdown[0]}
                        trendData={data.trendData} 
                        periodLabel={data.chartPeriodLabel}
                    />
                ) : (
                    <>
                        <GraficoTendencia data={data.trendData} periodLabel={data.chartPeriodLabel} />
                        <div>
                            <h2 className="text-xl font-bold text-gray-800 mb-4">Análise por Serviço</h2>
                            {servicosComPedidos.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {servicosComPedidos.sort((a,b) => b.total - a.total).map(service => (
                                        <GraficoCard key={service.nome} servico={service} />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-10 bg-white rounded-lg shadow-md text-gray-500">
                                    Nenhum serviço com pedidos foi encontrado para o filtro selecionado.
                                </div>
                            )}

                            {servicosSemPedidos.length > 0 && (
                                <div className="mt-8">
                                    <button
                                        onClick={() => setShowSemPedidos(!showSemPedidos)}
                                        className="flex items-center gap-2 text-gray-600 font-semibold py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors w-full text-left"
                                    >
                                        <ChevronDown className={`w-5 h-5 transition-transform ${showSemPedidos ? 'rotate-180' : ''}`} />
                                        <span>Serviços sem pedidos no período</span>
                                        <span className="ml-auto bg-gray-200 text-gray-700 text-xs font-bold py-1 px-2 rounded-full">{servicosSemPedidos.length}</span>
                                    </button>
                                    {showSemPedidos && (
                                        <div className="mt-2 p-4 bg-white rounded-lg shadow-sm border">
                                            <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-4 gap-y-2 text-sm text-gray-700">
                                                {servicosSemPedidos.map(s => <li key={s.nome} className="truncate">{s.nome}</li>)}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        );
    };

    return (
        <div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                    <KpiCard title="Total de Pedidos" value={kpis.totalPedidos} icon={Grid} color="#3b82f6" />
                    <KpiCard title="Pedidos Finalizados" value={kpis.pedidosFinalizados} icon={CheckCircle} color="#16a34a" />
                    <KpiCard title="Pedidos Aguardando" value={kpis.pedidosAguardando} icon={Clock} color="#ef4444" />
                    <KpiCard title="Média por Período" value={kpis.mediaMensal.toFixed(1)} icon={CalendarClock} color="#f97316" />
                    <KpiCard title="Taxa de Conclusão" value={kpis.taxaConclusao} icon={TrendingUp} color="#8b5cf6" />
                </div>
                
                {renderContent()}
            </div>
        </div>
    );
}
