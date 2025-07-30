import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useServicosList } from '../../constants/Servicos';
import { CardData } from '../cards/GraficoCard'; // Reutilizando a tipagem

interface OrderProps {
  situacao: string;
}

interface ServiceData extends CardData {
  nome: string;
}

interface PedidosData {
  kpis: {
    totalPedidos: number;
    finalizados: number;
    aguardando: number;
    servicoPrincipal: string;
  };
  // trendData: any[]; // Dados para o gráfico de tendência (simplificado por agora)
  topServicos: ServiceData[];
  allServicesData: ServiceData[];
}

export const usePedidosData = (periodo: { startDate: string; endDate: string }) => {
  const [data, setData] = useState<PedidosData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { servicosNomes } = useServicosList();

  useEffect(() => {
    if (!periodo.startDate || !periodo.endDate || servicosNomes.length === 0) return;

    const fetchData = async () => {
      setIsLoading(true);

      const promises = servicosNomes
        .filter(nome => nome !== 'Todos')
        .map(async (nome) => {
          try {
            const response = await api.get('/orders/filter', {
              params: { servico: nome, dataInicio: periodo.startDate, dataFim: periodo.endDate },
            });
            const orders = Array.isArray(response.data) ? response.data : [];
            const initialCounts = { finalizado: 0, aguardando: 0 };
            const counts = orders.reduce((acc, order: OrderProps) => {
              if (order.situacao === 'Finalizado') acc.finalizado++;
              else if (order.situacao === 'Aguardando' || order.situacao.startsWith('Lista')) acc.aguardando++;
              return acc;
            }, initialCounts);

            const total = counts.finalizado + counts.aguardando;
            const percentageF = total > 0 ? Math.round((counts.finalizado / total) * 100) : 0;
            
            return {
              nome,
              total,
              percentageF,
              finalizadoValue: counts.finalizado,
              aguardandoValue: counts.aguardando,
            };
          } catch (error) {
            console.error(`Falha ao buscar dados para ${nome}:`, error);
            return { nome, total: 0, percentageF: 0, finalizadoValue: 0, aguardandoValue: 0 };
          }
        });

      const results = await Promise.all(promises);
      
      // Ordena para o grid principal (opcional, mas mantém a lógica anterior)
      const allServicesData = [...results].sort((a, b) => b.total - a.total);
      
      // Calcula KPIs globais
      const kpis = allServicesData.reduce((acc, service) => {
        acc.totalPedidos += service.total;
        acc.finalizados += service.finalizadoValue;
        acc.aguardando += service.aguardandoValue;
        return acc;
      }, { totalPedidos: 0, finalizados: 0, aguardando: 0, servicoPrincipal: '' });

      const topServico = allServicesData[0]?.nome || 'N/A';
      kpis.servicoPrincipal = topServico;

      // Pega os 5 primeiros para a lista de Top Serviços
      const topServicos = allServicesData.slice(0, 5);

      setData({ kpis, topServicos, allServicesData });
      setIsLoading(false);
    };

    fetchData();
  }, [servicosNomes, periodo]);

  return { data, isLoading };
};