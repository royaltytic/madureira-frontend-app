import React, { useState, useEffect, useCallback } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import api from "../../services/api";
import { format, eachMonthOfInterval } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";


const Spinner: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
};

// Lista de serviços disponíveis
const SERVICOS = [
  "Todos",
  "Água",
  "Trator",
  "Semente",
  "Retroescavadeira",
  "CAR",
  "CAF",
  "RGP",
  "GTA",
  "Carta de Anuência Ambiental",
  "Serviço de Inspeção Municipal",
  "Declaração de Agricultor/a",
  "Declaração de Pescador/a",
  "Caderneta de Pescador/a",
];

const GraficoTotais: React.FC = () => {
  const [data, setData] = useState<{ name: string; Total: number }[]>([]);
  const [servicoSelecionado, setServicoSelecionado] = useState("Todos");
  const [loading, setLoading] = useState(false);

  // Inicializa as datas utilizando date-fns para garantir o formato "YYYY-MM-DD"
  const [periodoInicio, setPeriodoInicio] = useState(() => {
    const today = new Date();
    const threeMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 2, 1);
    return format(threeMonthsAgo, "yyyy-MM-dd");
  });
  const [periodoFim, setPeriodoFim] = useState(() => {
    const today = new Date();
    return format(today, "yyyy-MM-dd");
  });

  // Função auxiliar para atualizar datas
  const handleDateChange = (setter: React.Dispatch<React.SetStateAction<string>>) => 
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.value) {
        setter(e.target.value);
      }
  };

  // Função para buscar os dados (memorizada para evitar recriação)
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Cria um array com todos os meses do intervalo utilizando eachMonthOfInterval
      const startDate = new Date(periodoInicio);
      const endDate = new Date(periodoFim);
      const monthsInterval = eachMonthOfInterval({ start: startDate, end: endDate });
      const months = monthsInterval.map((date) => ({
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        name: format(date, "MMMM", { locale: ptBR }),
      }));

      const promises = months.map(async ({ year, month, name }) => {
        // Define data de início e fim para o mês
        const dataInicio = format(new Date(year, month - 1, 1), "yyyy-MM-dd");
        // O último dia do mês: criar uma data no próximo mês com dia 0
        const dataFim = format(new Date(year, month, 0), "yyyy-MM-dd");

        let totalMes = 0;
        if (servicoSelecionado === "Todos") {
          const totalPorServico = await Promise.all(
            SERVICOS.filter((s) => s !== "Todos").map(async (servico) => {
              const response = await api.get("/orders/filter", {
                params: { servico, dataInicio, dataFim },
              });
              return Array.isArray(response.data) ? response.data.length : 0;
            })
          );
          totalMes = totalPorServico.reduce((sum, count) => sum + count, 0);
        } else {
          const response = await api.get("/orders/filter", {
            params: { servico: servicoSelecionado, dataInicio, dataFim },
          });
          totalMes = Array.isArray(response.data) ? response.data.length : 0;
        }
        return { name, Total: totalMes };
      });

      const results = await Promise.all(promises);
      setData(results);
    } catch (error) {
      console.error("Erro ao buscar os dados:", error);
    } finally {
      setLoading(false);
    }
  }, [servicoSelecionado, periodoInicio, periodoFim]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="flex flex-wrap justify-between gap-6 mb-2">
        <div className="flex flex-col">
          <label className="mb-1 text-base font-semibold text-gray-700">
            Serviço
          </label>
          <select
            value={servicoSelecionado}
            onChange={(e) => setServicoSelecionado(e.target.value)}
            className="w-64 p-1 border border-gray-300 font-semibold rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            {SERVICOS.map((servico) => (
              <option key={servico} value={servico}>
                {servico}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col">
          <label className="mb-1 text-base font-semibold text-gray-700">
            Período Início
          </label>
          <input
            type="date"
            value={periodoInicio}
            onChange={handleDateChange(setPeriodoInicio)}
            className="w-64 p-1 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <div className="flex flex-col">
          <label className="mb-1 text-base font-semibold text-gray-700">
            Período Fim
          </label>
          <input
            type="date"
            value={periodoFim}
            onChange={handleDateChange(setPeriodoFim)}
            className="w-64 p-1 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
      </div>
      <div className="w-full h-[500px] bg-white rounded-lg shadow p-4">
        {loading ? (
          <Spinner />
        ) : (
          <ResponsiveContainer>
            <LineChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="name" stroke="#555" />
              <YAxis stroke="#555" />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="Total"
                stroke="#191B23"
                activeDot={{ r: 8 }}
                name="Total de Pedidos"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default GraficoTotais;
