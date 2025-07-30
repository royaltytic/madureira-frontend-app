// export const SERVICOS = [
//   "Água",
//   "Trator",
//   "Semente",
//   "Retroescavadeira",
//   "CAR",
//   "CAF",
//   "RGP",
//   "GTA",
//   "Mudas",
//   "Carta de Anuência Ambiental",
//   "Serviço de Inspeção Municipal",
//   "Declaração de Agricultor/a",
//   "Declaração de Pescador/a",
//   "Caderneta de Pescador/a",
// ];

import { useMemo } from 'react';
import { useCrud } from '../components/hooks/useCrud';

interface ServicoItem {
  id: string;
  servico: string;
}

export const useServicosList = () => {
  const { items: servicosItems, isLoading } = useCrud<ServicoItem>('/servicos');

  const servicosNomes = useMemo(() => {
    if (!servicosItems) return [];
    return servicosItems.map(item => item.servico);
  }, [servicosItems]);

  return { servicosNomes, isLoading };
};