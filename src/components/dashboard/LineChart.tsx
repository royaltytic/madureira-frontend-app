import React, { useState, useEffect } from "react";
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
import { format } from "date-fns";

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

  useEffect(() => {
    const fetchData = async () => {
      const startDate = new Date(periodoInicio);
      const endDate = new Date(periodoFim);
      const months = [];
      const current = new Date(startDate);
      while (current <= endDate) {
        months.push({
          year: current.getFullYear(),
          month: current.getMonth() + 1,
          name: current.toLocaleString("default", { month: "long" }),
        });
        current.setMonth(current.getMonth() + 1);
      }

      try {
        const promises = months.map(async ({ year, month, name }) => {
          const dataInicio = new Date(year, month - 1, 1)
            .toISOString()
            .split("T")[0];
          const dataFim = new Date(year, month, 0)
            .toISOString()
            .split("T")[0];
          let totalMes = 0;
          if (servicoSelecionado === "Todos") {
            const totalPorServico = await Promise.all(
              SERVICOS.filter((s) => s !== "Todos").map(async (servico) => {
                const response = await api.get("/orders/filter", {
                  params: { servico, dataInicio, dataFim },
                });
                return response.data.length;
              })
            );
            totalMes = totalPorServico.reduce((sum, count) => sum + count, 0);
          } else {
            const response = await api.get("/orders/filter", {
              params: { servico: servicoSelecionado, dataInicio, dataFim },
            });
            totalMes = response.data.length;
          }
          return { name, Total: totalMes };
        });

        const results = await Promise.all(promises);
        setData(results);
      } catch (error) {
        console.error("Erro ao buscar os dados:", error);
      }
    };

    fetchData();
  }, [servicoSelecionado, periodoInicio, periodoFim]);

  return (
    <div className="w-full max-w-6xl mx-auto ">
      <div className="flex flex-wrap justify-between gap-6 mb-2">
        <div className="flex flex-col">
          <label className="mb-1 text-base font-semibold text-gray-700">
            Serviço
          </label>
          <select
            value={servicoSelecionado}
            onChange={(e) => setServicoSelecionado(e.target.value)}
            className="w-64 p-1 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
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
            onChange={(e) => setPeriodoInicio(e.target.value)}
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
            onChange={(e) => setPeriodoFim(e.target.value)}
            className="w-64 p-1 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
      </div>
      <div className="w-full h-[500px] bg-white rounded-lg shadow p-4">
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
      </div>
    </div>
  );
};

export default GraficoTotais;
