import { useState, useEffect } from "react";
import api from "../../services/api";
import GraficoPorServicos from "./Rechart";
import GraficoPedidosUltimos3Meses from "./LineChart";
import GraficoGeneroTotal from "./GraficoGeneroTotal";
import TotalPedidosAno from "./TotalPedidosAno";
import {ModalPessoas} from "./ModalPessoa";
import { PessoaProps } from "../../types/types";

// interface Beneficios {
//   aguaSim: number;
//   garantidaSafraSim: number;
//   adagroSim: number;
//   chapeuPalhaSim: number;
//   paaSim: number;
//   pnaeSim: number;
//   detalhes: Detalhes;
// }

interface Genero {
  totalHomens: number;
  totalMulheres: number;
  agricultores: { homens: number; mulheres: number };
  feirantes: { homens: number; mulheres: number };
  pescadores: { homens: number; mulheres: number };
  outros: { homens: number; mulheres: number };
}

interface ListasDePessoas {
  totalPessoas: Pessoa[];
  totalAgricultores: Pessoa[];
  totalPescadores: Pessoa[];
  totalFeirantes: Pessoa[];
  totalOutros: Pessoa[];
  totalReparticaoPublica: Pessoa[];
  aguaSim: Pessoa[];
  garantidaSafraSim: Pessoa[];
  adagroSim: Pessoa[];
  chapeuPalhaSim: Pessoa[];
  paaSim: Pessoa[];
  pnaeSim: Pessoa[];
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

interface BeneficiosListas {
  garantidaSafraSim: Pessoa[];
  adagroSim: Pessoa[];
  chapeuPalhaSim: Pessoa[];
  paaSim: Pessoa[];
  pnaeSim: Pessoa[];
  aguaSim: Pessoa[];
}

interface Estatisticas {
  // Listas no nível principal
  totalPessoas: Pessoa[];
  totalAgricultores: Pessoa[];
  totalPescadores: Pessoa[];
  totalFeirantes: Pessoa[];
  totalOutros: Pessoa[];
  totalReparticaoPublica: Pessoa[];
  totalPecuaristas: Pessoa[];

  // Objeto aninhado para os benefícios
  beneficios: BeneficiosListas & { detalhes: Detalhes };

  genero: Genero;
}

interface Pessoa {
  id: string;
  name: string;
  cpf?: string;
  user: PessoaProps
  // Adicione outros campos que desejar exibir
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
  const [abaSelecionada, setAbaSelecionada] = useState<"pessoas" | "pedidos">("pedidos");
  const [abaPedidos, setAbaPedidos] = useState<"ultimos3meses" | "totalpedidosano">("ultimos3meses");

  const [modalAberto, setModalAberto] = useState(false);
  const [pessoasNoModal, setPessoasNoModal] = useState<Pessoa[]>([]); // Lista a ser mostrada no modal
  const [tituloModal, setTituloModal] = useState("");

  useEffect(() => {
    api
      .get("/users/estatisticas")
      .then((response) => {
        console.log("DADOS RECEBIDOS DA API:", response.data); // <-- Adicione esta linha
        setEstatisticas(response.data);
      })
      .catch((error) => {
        console.error("Erro ao carregar as estatísticas", error);
      });
  }, []);

  const handleCardClick = (filtroKey: string, titulo: string) => {
        if (!estatisticas) return;

        let lista: Pessoa[] = [];

        // Verifica se a chave existe no nível principal
        if (filtroKey in estatisticas) {
            lista = estatisticas[filtroKey as keyof Estatisticas] as Pessoa[];
        // Senão, verifica se existe dentro de 'beneficios'
        } else if (filtroKey in estatisticas.beneficios) {
            lista = estatisticas.beneficios[filtroKey as keyof BeneficiosListas];
        }
        
        setTituloModal(titulo);
        setPessoasNoModal(lista || []);
        setModalAberto(true);
    };

  if (!estatisticas) {
    return (
      <div className="min-h-screen flex items-center justify-center overflow-hidden">
        <LoadingSpinner />
      </div>
    );
  }

  const cardsPessoas = [
    { label: "Cadastradas", key: 'totalPessoas' as keyof ListasDePessoas },
    { label: "Agricultores", key: 'totalAgricultores' as keyof ListasDePessoas },
    { label: "Pescadores", key: 'totalPescadores' as keyof ListasDePessoas },
    { label: "Feirantes", key: 'totalFeirantes' as keyof ListasDePessoas },
    { label: "Rep. Pública", key: 'totalReparticaoPublica' as keyof ListasDePessoas },
    { label: "Outros", key: 'totalOutros' as keyof ListasDePessoas },
    { label: "SSA Água", key: 'aguaSim' as keyof ListasDePessoas },
    { label: "Garantia Safra", key: 'garantidaSafraSim' as keyof ListasDePessoas },
    { label: "Adagro", key: 'adagroSim' as keyof ListasDePessoas },
    { label: "Chapéu Palha", key: 'chapeuPalhaSim' as keyof ListasDePessoas },
    { label: "PAA", key: 'paaSim' as keyof ListasDePessoas },
    { label: "PNAE", key: 'pnaeSim' as keyof ListasDePessoas },
  ];

  return (
    <div className="w-full h-full p-4 md:p-7">
<ModalPessoas
            isOpen={modalAberto}
            onClose={() => setModalAberto(false)}
            title={tituloModal}
            people={pessoasNoModal}
            isLoading={false} // O carregamento agora é instantâneo!
        />

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
          {cardsPessoas.map((item) => {
                // Lógica para encontrar a contagem correta
                let count = 0;
                if (item.key in estatisticas) {
                    const list = estatisticas[item.key as keyof Estatisticas];
                    if(Array.isArray(list)) count = list.length;
                } else if (item.key in estatisticas.beneficios) {
                    const list = estatisticas.beneficios[item.key as keyof BeneficiosListas];
                    if(Array.isArray(list)) count = list.length;
                }

                return (
                    <button
                        key={item.key}
                        onClick={() => handleCardClick(item.key, item.label)}
                        disabled={count === 0}
                        className="w-full text-center border rounded-xl p-3 bg-white shadow-sm hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <p className="text-gray-500 text-sm md:text-base">{item.label}</p>
                        <p className="font-semibold text-xl text-gray-800">{count}</p>
                    </button>
                );
            })}
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
