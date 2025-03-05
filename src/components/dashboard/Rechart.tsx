import { PureComponent, useState } from 'react';
import { PieChart, Pie, Cell } from 'recharts';
import api from '../../services/api';

interface OrdersProps {
  servico: string;
  data: string;
  dataEntregue: string | null;
  situacao: string;
  id: string;
  userId: string;
  employeeId: string;
  entreguePorId: string;
}

const COLORS = ['#812F2C', '#165C38'];

const SERVICOS = [
  'Água',
  'Trator',
  'Semente',
  'Retroescavadeira',
  'CAR',
  'CAF',
  'RGP',
  'GTA',
  'Carta de Anuência Ambiental',
  'Serviço de Inspeção Municipal',
  'Declaração de Agricultor/a',
  'Declaração de Pescador/a',
];

class Grafico extends PureComponent<{ servico: string; dataInicio: string; dataFim: string }> {
  state = {
    data: [
      { name: 'Aguardando', value: 0 },
      { name: 'Finalizado', value: 0 },
    ],
    total: 0,
    percentageF: 0,
    showText: false,
  };

  async componentDidMount() {
    await this.fetchData();
  }

  async componentDidUpdate(prevProps: { dataInicio: string; dataFim: string }) {
    if (prevProps.dataInicio !== this.props.dataInicio || prevProps.dataFim !== this.props.dataFim) {
      await this.fetchData();
    }
  }

  fetchData = async () => {
    const { servico, dataInicio, dataFim } = this.props;

    try {
      const response = await api.get('/orders/filter', {
        params: { servico, dataInicio, dataFim },
      });

      const finalizado = response.data.filter((order: OrdersProps) => order.situacao === 'Finalizado').length;
      const aguardando = response.data.filter((order: OrdersProps) => order.situacao === 'Aguardando').length;
      const total = finalizado + aguardando;
      const percentageF = total > 0 ? ((finalizado / total) * 100).toFixed(0) : 0;

      this.setState({
        data: [
          { name: 'Aguardando', value: aguardando },
          { name: 'Finalizado', value: finalizado },
        ],
        total,
        percentageF,
      });
    } catch (error) {
      console.error(`Erro ao buscar os dados para ${servico}:`, error);
    }
  };

  handleAnimationEnd = () => {
    this.setState({ showText: true });
  };

  render() {
    const { data, percentageF, showText, total } = this.state;
    const hasOrders = total > 0;

    return (
      <div className="w-full max-w-[200px] border rounded-lg flex flex-col p-2 mt-3 shadow-lg">
        <h1 className="font-bold text-xs text">{this.props.servico}</h1>
        {hasOrders ? (
          <>
            <div className="flex justify-center items-center">
              <PieChart width={150} height={130}>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={45}
                  paddingAngle={1}
                  dataKey="value"
                  animationDuration={1500}
                  onAnimationEnd={this.handleAnimationEnd}
                >
                  {data.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                {showText && (
                  <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="text-black text-lg font-bold">
                    {`${percentageF}%`}
                  </text>
                )}
              </PieChart>
            </div>
            <div className="flex justify-between mt-2 text-center text-xs">
              <div>
                <div className="w-8 h-2 bg-gradient-to-b from-[#00324C] to-[#191B23] rounded-sm"></div>
                <p className="font-bold mt-1">{total}</p>
              </div>
              <div>
                <div className="w-8 h-2 bg-gradient-to-r from-[#0E9647] to-[#165C38] rounded-sm"></div>
                <p className="font-bold mt-1">{this.state.data[1].value}</p>
              </div>
              <div>
                <div className="w-8 h-2 bg-gradient-to-r from-[#E03335] to-[#812F2C] rounded-sm"></div>
                <p className="font-bold mt-1">{this.state.data[0].value}</p>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center text-gray-500 h-[130px] flex items-center justify-center">
            <p>Sem pedidos</p>
          </div>
        )}
      </div>
    );
  }
}

export default function GraficoPorServicos() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const dataInicio = new Date(selectedYear, selectedMonth - 1, 1).toISOString().split('T')[0];
  const dataFim = new Date(selectedYear, selectedMonth, 0).toISOString().split('T')[0];

  const getMonthName = (month: number) => {
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return months[month - 1];
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <label htmlFor="periodo" className="font-bold text-2xl">Período:</label>
        <div className="flex justify-center w-48 p-0.5 rounded-lg bg-gradient-to-b from-[#00324C] to-[#191B23] text-white cursor-pointer" onClick={() => setIsPopupOpen(true)}>
          <p className="text-lg font-semibold">{getMonthName(selectedMonth)}, {selectedYear}</p>
        </div>
      </div>

      {isPopupOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white w-72 p-6 rounded-lg shadow-lg" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4 text-center">Selecione Mês e Ano</h2>
            <div className="flex gap-4 mb-4 justify-center">
              <select value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))} className="border w-1/2 rounded px-2 py-1">
                {Array.from({ length: 12 }, (_, i) => <option key={i + 1} value={i + 1}>{getMonthName(i + 1)}</option>)}
              </select>
              <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))} className="border w-1/2 rounded px-2 py-1">
                {[new Date().getFullYear(), new Date().getFullYear() - 1].map((year) => <option key={year} value={year}>{year}</option>)}
              </select>
            </div>
            <button className="bg-green-700 w-full font-bold text-white px-4 py-2 rounded" onClick={() => setIsPopupOpen(false)}>Confirmar</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {SERVICOS.map(servico => <Grafico key={servico} servico={servico} dataInicio={dataInicio} dataFim={dataFim} />)}
      </div>
    </div>
  );
}
