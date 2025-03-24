import { useState, useEffect } from "react";
import api from "../../services/api";
import GraficoPorServicos from "./Rechart";
import GraficoPedidosUltimos3Meses from "./LineChart";

interface Beneficios {
  aguaSim: number;
  garantidaSafraSim: number;
  adagroSim: number;
  chapeuPalhaSim: number;
  paaSim: number;
  pnaeSim: number;
}

interface Estatisticas {
  totalPessoas: number;
  totalAgricultores: number;
  totalPescadores: number;
  totalFeirantes: number;
  totalOutros: number;
  totalReparticaoPublica: number;
  beneficios: Beneficios;
}

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="w-28 h-28 border-4 border-[#191B23] border-t-transparent border-solid rounded-full animate-spin"></div>
    </div>
  );
};

export const DashboardComponent: React.FC = () => {
  const [estatisticas, setEstatisticas] = useState<Estatisticas | null>(null);

  useEffect(() => {
    api
      .get("/users/estatisticas")
      .then((response) => {
        setEstatisticas(response.data);
      })
      .catch((error) => {
        console.error("Erro ao carregar as estatísticas", error);
      });
  }, []);

  if (!estatisticas) {
    return (
      <div className="min-h-screen flex items-center justify-center overflow-hidden">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="w-full h-full p-4 md:p-7 overflow-hidden">
      <div className="flex flex-col lg:flex-row gap-6 h-full">
        {/* Dados das Pessoas e Benefícios */}
        <div className="w-full lg:w-3/5 flex flex-col">
          <h1 className="font-bold text-xl md:text-2xl mb-7">
            Dados das Pessoas e Benefícios
          </h1>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              { label: "Cadastradas", value: estatisticas.totalPessoas },
              { label: "Agricultores", value: estatisticas.totalAgricultores },
              { label: "Pescadores", value: estatisticas.totalPescadores },
              { label: "Feirantes", value: estatisticas.totalFeirantes },
              { label: "Rep. Pública", value: estatisticas.totalReparticaoPublica },
              { label: "Outros", value: estatisticas.totalOutros },
              { label: "SSA Água", value: estatisticas.beneficios.aguaSim },
              { label: "Garantia Safra", value: estatisticas.beneficios.garantidaSafraSim },
              { label: "Adagro", value: estatisticas.beneficios.adagroSim },
              { label: "Chapéu Palha", value: estatisticas.beneficios.chapeuPalhaSim },
              { label: "PAA", value: estatisticas.beneficios.paaSim },
              { label: "PNAE", value: estatisticas.beneficios.pnaeSim },
            ].map((item, index) => (
              <div
                key={index}
                className="w-full text-center border rounded-lg p-2 shadow-lg"
              >
                <p className="font-bold text-sm md:text-base">{item.label}</p>
                <p className="font-bold text-lg">{item.value}</p>
              </div>
            ))}
          </div>

          <div className="w-full border-b border-gray-300 my-4"></div>
          <GraficoPedidosUltimos3Meses />
        </div>

        {/* Gráficos de Serviços */}
        <div className="w-full lg:w-2/5">
          <GraficoPorServicos />
        </div>
      </div>
    </div>
  );
};
