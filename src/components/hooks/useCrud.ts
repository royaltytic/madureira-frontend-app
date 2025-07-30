import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import api from '../../services/api';

export const useCrud = <T extends { id: string }>(endpoint: string) => {
  const [items, setItems] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get<T[]>(endpoint);
      setItems(response.data);
    } catch (_error) {
      toast.error(`Falha ao carregar itens de ${endpoint} error: ${_error}`);
    } finally {
      setIsLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const addItem = async (data: Record<string, unknown>) => {
    await api.post(endpoint, data);
    await fetchItems();
  };

  // CORREÇÃO AQUI: Mesma lógica para o update.
  const updateItem = async (id: string, data: Record<string, unknown>) => {
    await api.put(`${endpoint}/${id}`, data);
    await fetchItems();
  };

  const deleteItem = async (id: string) => {
    await api.delete(`${endpoint}/${id}`);
    await fetchItems();
  };
  
  return { items, isLoading, addItem, updateItem, deleteItem };
};