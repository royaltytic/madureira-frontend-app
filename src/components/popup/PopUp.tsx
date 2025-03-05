import { useState} from "react";
import { PedidoItem } from "./PedidoItem";
interface PedidoProps {
  servico: string;
  data: string;
  dataEntregue: string | null;
  situacao: string;
  descricao: string;
  id: string;
  userId: string;
  employeeId: string;
  entreguePorId: string;
}

interface PopupProps {
  onClose: () => void;
  onAddPedido: (novosPedidos: PedidoProps[]) => void;
}

export const PopUp = ({ onClose, onAddPedido }: PopupProps) => {
  const [pedidosSelecionados, setPedidosSelecionados] = useState<
    { servico: string; descricao: string }[]
  >([]);
  const [situacao] = useState("Aguardando");

  const handlePedidoSelect = (servico: string, selected: boolean) => {
    setPedidosSelecionados((prev) => {
      if (selected) {
        if (!prev.some((pedido) => pedido.servico === servico)) {
          return [...prev, { servico, descricao: "" }];
        }
      } else {
        return prev.filter((pedido) => pedido.servico !== servico);
      }
      return prev;
    });
  };

  const handleDescricaoChange = (servico: string, descricao: string) => {
    setPedidosSelecionados((prev) =>
      prev.map((pedido) =>
        pedido.servico === servico ? { ...pedido, descricao } : pedido
      )
    );
  };

  const handleAddPedidos = () => {
    const novosPedidos: PedidoProps[] = pedidosSelecionados.map((pedido) => ({
      servico: pedido.servico,
      situacao: situacao,
      descricao: pedido.descricao,
      dataEntregue: null,
      data: new Date().toISOString(),
      id: "",
      userId: "",
      employeeId: "",
      entreguePorId: "",
    }));

    onAddPedido(novosPedidos);
    onClose();
  };

  const pedidos = [
    "Água",
    "Semente",
    "Trator",
    "Retroescavadeira",
    "CAR",
    "CAF",
    "GTA",
    "RGP",
    "Carta de Anuência Ambiental",
    "Serviço de Inspeção Municipal",
    "Declaração de Agricultor/a",
    "Declaração de Pescador/a",
    "Caderneta de Pescador/a",
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-85 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-[550px] max-h-min transform transition-transform duration-300 scale-100 opacity-100">
        <div className="flex items-center justify-center p-5 rounded-t-lg">
          <h1 className="text-black font-bold text-2xl">Novo Pedido</h1>
        </div>

        <div className="overflow-y-auto px-5">
          {pedidos.map((pedido, index) => {
            const pedidoSelecionado = pedidosSelecionados.find((p) => p.servico === pedido);
            return (
              <PedidoItem
                key={`${pedido}-${index}`}
                name={pedido}
                onSelect={(selected) => handlePedidoSelect(pedido, selected)}
              >
                {pedidoSelecionado && (
                  <textarea
                    value={pedidoSelecionado.descricao}
                    onChange={(e) => handleDescricaoChange(pedido, e.target.value)}
                    placeholder="Digite a descrição..."
                    className="w-full h-10 text-sm mt-2 p-2 border rounded-md"
                  />
                )}
              </PedidoItem>
            );
          })}
        </div>

        <div className="flex items-center justify-center mt-1">
          <p
            onClick={onClose}
            className="text-black font-bold flex items-center justify-center m-6 hover:cursor-pointer"
          >
            Cancelar
          </p>

          <button
            onClick={handleAddPedidos}
            disabled={pedidosSelecionados.length === 0}
            className={`text-white font-bold rounded-lg w-40 h-9 my-2 ${
              pedidosSelecionados.length === 0
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-[#0E9647] to-[#165C38]"
            }`}
          >
            Pedir
          </button>
        </div>
      </div>
    </div>
  );
};
