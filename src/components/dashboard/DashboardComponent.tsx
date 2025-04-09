import { useState, useEffect } from "react";
import api from "../../services/api";
import GraficoPorServicos from "./Rechart";
import GraficoPedidosUltimos3Meses from "./LineChart";
import GraficoGeneroTotal from "./GraficoGeneroTotal";
import TotalPedidosAno from "./TotalPedidosAno";

interface Beneficios {
  aguaSim: number;
  garantidaSafraSim: number;
  adagroSim: number;
  chapeuPalhaSim: number;
  paaSim: number;
  pnaeSim: number;
  detalhes: Detalhes;
}

interface Genero {
  totalHomens: number;
  totalMulheres: number;
  agricultores: { homens: number; mulheres: number };
  feirantes: { homens: number; mulheres: number };
  pescadores: { homens: number; mulheres: number };
  outros: { homens: number; mulheres: number };
}

interface Detalhes {
  paa: {
    homens: number,
    mulheres: number,
    agricultores: number,
    pescadores: number,
  },
  chapeuPalha: {
    homens: number,
    mulheres: number,
    agricultores: number,
    pescadores: number,
  },
  garantiaSafra: {
    homens: number,
    mulheres: number,
    agricultores: number,
    pescadores: number,
  }
}

interface Estatisticas {
  totalPessoas: number;
  totalAgricultores: number;
  totalPescadores: number;
  totalFeirantes: number;
  totalOutros: number;
  totalReparticaoPublica: number;
  beneficios: Beneficios;
  genero: Genero;
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
  const [abaSelecionada, setAbaSelecionada] = useState<"pessoas" | "pedidos" | "dados">("pedidos");
  
  // Novo estado para alternar entre os gráficos dentro da aba de Pedidos
  const [abaPedidos, setAbaPedidos] = useState<"ultimos3meses" | "totalpedidosano">("ultimos3meses");

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
    <div className="w-full h-full p-4 md:p-7">
      {/* Título com abas */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-bold text-xl md:text-2xl text-gray-700">
          {abaSelecionada === "pessoas"
            ? "Dados das Pessoas"
            : abaSelecionada === "pedidos"
            ? "Dados dos Pedidos"
            : "Dados de..."}
        </h1>
        <div className="inline-flex space-x-6 border-b border-gray-200">
          <button
            onClick={() => setAbaSelecionada("pedidos")}
            className={`pb-2 text-sm font-semibold transition-colors duration-200 ${
              abaSelecionada === "pedidos"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-blue-500"
            }`}
          >
            Pedidos
          </button>
          <button
            onClick={() => setAbaSelecionada("pessoas")}
            className={`pb-2 text-sm font-semibold transition-colors duration-200 ${
              abaSelecionada === "pessoas"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-blue-500"
            }`}
          >
            Pessoas
          </button>
        </div>
      </div>

      {abaSelecionada === "pessoas" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna 1: Cartões de estatísticas */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-4">
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
                className="w-full text-center border rounded-xl p-3 bg-white shadow-sm hover:shadow-md transition-shadow"
              >
                <p className="text-gray-500 text-sm md:text-base">{item.label}</p>
                <p className="font-semibold text-xl text-gray-800">{item.value}</p>
              </div>
            ))}
          </div>

          {/* Coluna 2 e 3: Gráficos */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="w-full">
              <GraficoGeneroTotal genero={estatisticas.genero} detalhes={estatisticas.beneficios.detalhes} />
            </div>
          </div>
        </div>
      ) : abaSelecionada === "pedidos" ? (
        <div className="flex flex-col gap-6">
          {/* Divisão lado a lado */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Esquerda: Gráficos com aba para alternar entre Ultimos3Meses e TotalPedidosAno */}
            <div className="w-full lg:w-1/2 bg-white shadow rounded p-4">
              <div className="flex mb-4 border-b border-gray-200">
                <button
                  onClick={() => setAbaPedidos("ultimos3meses")}
                  className={`pb-2 mr-4 text-sm font-semibold transition-colors duration-200 ${
                    abaPedidos === "ultimos3meses"
                      ? "border-b-2 border-blue-500 text-blue-600"
                      : "text-gray-500 hover:text-blue-500"
                  }`}
                >
                  Meses
                </button>
                <button
                  onClick={() => setAbaPedidos("totalpedidosano")}
                  className={`pb-2 text-sm font-semibold transition-colors duration-200 ${
                    abaPedidos === "totalpedidosano"
                      ? "border-b-2 border-blue-500 text-blue-600"
                      : "text-gray-500 hover:text-blue-500"
                  }`}
                >
                  Ano
                </button>
              </div>
              <div>
                {abaPedidos === "ultimos3meses" ? (
                  <GraficoPedidosUltimos3Meses />
                ) : (
                  <TotalPedidosAno />
                )}
              </div>
            </div>
            {/* Direita: Gráfico Por Serviços */}
            <div className="w-full lg:w-1/2 bg-white shadow rounded p-4">
              <GraficoPorServicos />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {/* Conteúdo futuro aqui */}
        </div>
      )}
    </div>
  );
};
