import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface GenderStats {
  totalHomens: number;
  totalMulheres: number;
  agricultores: { homens: number; mulheres: number };
  feirantes: { homens: number; mulheres: number };
  pescadores: { homens: number; mulheres: number };
  outros: { homens: number; mulheres: number };
}

interface BeneficioDetalhes {
  homens: number;
  mulheres: number;
  agricultores: number;
  pescadores: number;
}

interface Detalhes {
  paa?: BeneficioDetalhes;
  chapeuPalha?: BeneficioDetalhes;
  garantiaSafra?: BeneficioDetalhes;
}

interface Props {
  genero: GenderStats;
  detalhes?: Detalhes; // Tornar opcional para evitar erros
}

const COLORS = ["#36A2EB", "#FF6384"];

const GraficoGeneroTotal: React.FC<Props> = ({ genero, detalhes }) => {
  const dadosTotais = [
    { name: "Homens", total: genero.totalHomens },
    { name: "Mulheres", total: genero.totalMulheres },
  ];

  const dadosPorCategoria = [
    {
      name: "Agricultores",
      Homens: genero.agricultores.homens,
      Mulheres: genero.agricultores.mulheres,
    },
    {
      name: "Feirantes",
      Homens: genero.feirantes.homens,
      Mulheres: genero.feirantes.mulheres,
    },
    {
      name: "Pescadores",
      Homens: genero.pescadores.homens,
      Mulheres: genero.pescadores.mulheres,
    },
    {
      name: "Outros",
      Homens: genero.outros.homens,
      Mulheres: genero.outros.mulheres,
    },
  ];

  const dadosBeneficiosGenero = detalhes
    ? [
        {
          name: "PAA",
          Homens: detalhes.paa?.homens || 0,
          Mulheres: detalhes.paa?.mulheres || 0,
          Agricultores: detalhes.paa?.agricultores || 0,
          Pescadores: detalhes.paa?.pescadores || 0,
        },
        {
          name: "Chapéu de Palha",
          Homens: detalhes.chapeuPalha?.homens || 0,
          Mulheres: detalhes.chapeuPalha?.mulheres || 0,
          Agricultores: detalhes.chapeuPalha?.agricultores || 0,
          Pescadores: detalhes.chapeuPalha?.pescadores || 0,
        },
        {
          name: "Garantia Safra",
          Homens: detalhes.garantiaSafra?.homens || 0,
          Mulheres: detalhes.garantiaSafra?.mulheres || 0,
          Agricultores: detalhes.garantiaSafra?.agricultores || 0,
          Pescadores: detalhes.garantiaSafra?.pescadores || 0,
        },
      ]
    : [];

  return (
    <div className="w-full max-w-screen-xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Gráfico de Pizza */}
      <div className="bg-white shadow-lg p-4 rounded-lg">
        <h2 className="text-lg font-bold mb-4 text-gray-800">Distribuição por Gênero</h2>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={dadosTotais}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="total"
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            >
              {dadosTotais.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Gráfico de Barras - Gênero por Categoria */}
      <div className="bg-white shadow-lg p-4 rounded-lg">
        <h2 className="text-lg font-bold mb-4 text-gray-800">Gênero por Categoria</h2>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={dadosPorCategoria}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="Homens" fill="#36A2EB" />
            <Bar dataKey="Mulheres" fill="#ED64A6" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Gráfico de Barras - Benefícios por Gênero */}
      {detalhes && (
        <div className="bg-white shadow-lg p-4 rounded-lg lg:col-span-2">
          <h2 className="text-lg font-bold mb-4 text-gray-800">Benefícios por Gênero e Categoria</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dadosBeneficiosGenero}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Homens" fill="#36A2EB" />
              <Bar dataKey="Mulheres" fill="#D53F8C" />
              <Bar dataKey="Agricultores" fill="#38A169" />
              <Bar dataKey="Pescadores" fill="#ECC94B" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default GraficoGeneroTotal;