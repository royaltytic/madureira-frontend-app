import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import api from "../../services/api";
import { useServicosList} from "../../constants/Servicos"; // Certifique-se de que este caminho esteja correto


const GraficoPedidosAnoPorServico: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const [startYear, setStartYear] = useState<number>(currentYear - 2);
  const [endYear, setEndYear] = useState<number>(currentYear);
  const [data, setData] = useState<Array<Record<string, number | string>>>([]);
  const [loading, setLoading] = useState<boolean>(false);


  const { servicosNomes } = useServicosList();


  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const years: number[] = [];
        for (let y = startYear; y <= endYear; y++) {
          years.push(y);
        }

        const results: Array<Record<string, number | string>> = [];

        for (const year of years) {
          const yearData: Record<string, number | string> = { year };

          for (const service of servicosNomes ) {
            // Define o intervalo do ano: de 1º de janeiro a 31 de dezembro
            const startDate = new Date(year, 0, 1);
            const endDate = new Date(year, 11, 31);
            const dataInicio = startDate.toISOString().split("T")[0];
            const dataFim = endDate.toISOString().split("T")[0];

            // Faz a requisição para cada serviço e ano
            const response = await api.get("/orders/filter", {
              params: { servico: service, dataInicio, dataFim },
            });

            // Conta os pedidos e adiciona ao objeto do ano
            const count = Array.isArray(response.data) ? response.data.length : 0;
            yearData[service] = count;
          }

          results.push(yearData);
        }

        setData(results);
      } catch (error) {
        console.error("Erro ao buscar dados de pedidos por serviço:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [startYear, endYear, servicosNomes]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-full mx-auto">
      <h2 className="text-lg font-bold text-gray-700 mb-4 text-center">
        Total de Pedidos por Serviço e Ano
      </h2>

      {/* Filtros para definir o intervalo de anos */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <label className="text-gray-700 font-semibold">Ano Início:</label>
          <input
            type="number"
            value={startYear}
            onChange={(e) => setStartYear(Number(e.target.value))}
            min="2000"
            max={currentYear + 5}
            className="border rounded px-2 py-1 w-20"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-gray-700 font-semibold">Ano Fim:</label>
          <input
            type="number"
            value={endYear}
            onChange={(e) => setEndYear(Number(e.target.value))}
            min="2000"
            max={currentYear + 5}
            className="border rounded px-2 py-1 w-20"
          />
        </div>
      </div>

      {loading ? (
        <p className="text-center text-gray-700">Carregando...</p>
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis />
            <Tooltip />
            <Legend />
            {servicosNomes.map((service, index) => (
              <Bar key={service} dataKey={service} name={service} fill={`hsl(${index * 30}, 70%, 50%)`} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default GraficoPedidosAnoPorServico;