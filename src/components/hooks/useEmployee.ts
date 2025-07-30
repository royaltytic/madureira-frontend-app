import { useState, useCallback, useEffect } from 'react';
import api from '../../services/api';
import { UserProps } from '../../types/types';

export const useEmployees = (token: string) => {
  const [employees, setEmployees] = useState<UserProps[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEmployees = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get('/employee', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEmployees(response.data);
    } catch (err) {
      console.error('Erro ao listar funcionários:', err);
      setError('Não foi possível carregar a lista de servidores.');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    // Garante que a busca só ocorra se houver um token
    if (token) {
      fetchEmployees();
    }
  }, [fetchEmployees, token]);

  const createEmployee = async (data: Omit<UserProps, 'id'>) => {
    await api.post('/employee/create', data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    await fetchEmployees(); // Re-busca a lista para incluir o novo
  };

  const deleteEmployee = async (employeeId: string) => {
    await api.delete(`/employee/${employeeId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    await fetchEmployees(); // Re-busca a lista para remover o deletado
  };

  const toggleEmployeeStatus = async (employeeId: string) => {
    await api.put(`/employee/${employeeId}/toggle-status`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    await fetchEmployees(); // Atualiza a lista após a alteração
  };

  // NOVO: Função para atualizar o cargo do funcionário
  const updateRole = async (employeeId: string, newRole: string) => {
    await api.put(`/employee/${employeeId}`, { tipo: newRole }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    await fetchEmployees(); // Atualiza a lista após a alteração do cargo
  };

  // ATUALIZADO: Exportando as novas funções
  return { 
    employees, 
    isLoading, 
    error, 
    toggleEmployeeStatus, 
    createEmployee, 
    deleteEmployee,
    updateRole, // <-- NOVO
    fetchEmployees // <-- Adicionado para re-carregar a lista
  };
};
