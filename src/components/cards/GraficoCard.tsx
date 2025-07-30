import { PieChart, Pie, Cell } from 'recharts';
import { CheckCircle2, Clock, Package } from 'lucide-react';

// Tipagem para os dados que o card vai receber
export interface CardData {
  total: number;
  percentageF: number;
  finalizadoValue: number;
  aguardandoValue: number;
}

interface GraficoCardProps {
  servico: string;
  data?: CardData;
  isLoading: boolean;
  error?: string | null;
}

// Cores ajustadas para tema claro
const SUCCESS_COLOR = '#22C55E'; // Green-500
const PENDING_COLOR = '#F97316'; // Orange-500


export function GraficoCard({ servico, data, isLoading, error }: GraficoCardProps) {
  const hasOrders = !isLoading && !error && data && data.total > 0;

  const renderContent = () => {
    if (isLoading) return <div className="h-[180px] flex items-center justify-center text-gray-400">Analisando...</div>;
    if (error) return <div className="h-[180px] flex items-center justify-center text-red-500 font-semibold">{error}</div>;
    if (!data || !hasOrders) return <div className="h-[180px] flex items-center justify-center text-gray-500">Sem pedidos</div>;
    
    const { total, percentageF, finalizadoValue, aguardandoValue } = data;

    return (
      <div className="flex flex-col items-center w-full">
        {/* Gráfico com Sombra */}
        <div className="relative w-[120px] h-[120px] filter drop-shadow-[0_5px_8px_rgba(34,197,94,0.3)]">
          <PieChart width={120} height={120}>
            <Pie
              data={[{v: percentageF}, {v: 100-percentageF}]}
              cx="50%" cy="50%"
              innerRadius={45} outerRadius={55}
              dataKey="v" startAngle={90} endAngle={450}
              stroke="none"
              animationDuration={800}
            >
                <Cell fill={SUCCESS_COLOR} />
                <Cell fill={PENDING_COLOR} />
            </Pie>
          </PieChart>
          <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
            <span className="text-3xl font-bold text-gray-800">{percentageF}%</span>
          </div>
        </div>
        
        {/* Métricas */}
        <div className="mt-6 w-full space-y-3 text-sm">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-green-600"><CheckCircle2 size={16} /> <span>Finalizados</span></div>
                <span className="font-semibold text-gray-700">{finalizadoValue}</span>
            </div>
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-orange-600"><Clock size={16} /> <span>Aguardando</span></div>
                <span className="font-semibold text-gray-700">{aguardandoValue}</span>
            </div>
             <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                <div className="flex items-center gap-2 text-gray-500"><Package size={16} /> <span>Total</span></div>
                <span className="font-bold text-gray-800">{total}</span>
            </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-xs bg-white rounded-2xl p-5
                   border border-gray-200/80 shadow-md
                   transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <h2 className="font-semibold text-base text-gray-800 text-left truncate w-full mb-4">{servico}</h2>
      {renderContent()}
    </div>
  );
}