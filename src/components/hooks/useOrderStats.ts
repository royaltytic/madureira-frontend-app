// src/hooks/useOrderStats.ts
import { useState, useEffect } from 'react';
import api from '../../services/api';

// Tipagem para os dados de retorno do hook
interface OrderStats {
  name: string;
  value: number;
}

interface UseOrderStatsReturn {
  stats: OrderStats[];
  total: number;
  percentageF: number;
  loading: boolean;
  error: string | null;
}

// Interface das props dos pedidos vindo da API
interface OrderProps {
  situacao: string;
}

export function useOrderStats(servico: string, dataInicio: string, dataFim: string): UseOrderStatsReturn {
  const [stats, setStats] = useState<OrderStats[]>([]);
  const [total, setTotal] = useState(0);
  const [percentageF, setPercentageF] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get('/orders/filter', {
          params: { servico, dataInicio, dataFim },
        });

        // Otimizado: Use 'reduce' para processar os dados em uma única passagem
        const initialCounts = { finalizado: 0, aguardando: 0 };
        const counts = response.data.reduce((acc: typeof initialCounts, order: OrderProps) => {
          if (order.situacao === 'Finalizado') {
            acc.finalizado++;
          } else if (order.situacao === 'Aguardando' || order.situacao.startsWith('Lista')) {
            acc.aguardando++;
          }
          return acc;
        }, initialCounts);

        const newTotal = counts.finalizado + counts.aguardando;
        const newPercentageF = newTotal > 0 ? Math.round((counts.finalizado / newTotal) * 100) : 0;
        
        setStats([
          { name: 'Aguardando', value: counts.aguardando },
          { name: 'Finalizado', value: counts.finalizado },
        ]);
        setTotal(newTotal);
        setPercentageF(newPercentageF);

      } catch (err) {
        console.error(`Erro ao buscar os dados para ${servico}:`, err);
        setError('Falha ao carregar dados.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // A dependência garante que o hook re-execute quando uma das props mudar
  }, [servico, dataInicio, dataFim]);

  return { stats, total, percentageF, loading, error };
}