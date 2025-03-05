import React, { useEffect, useState, useCallback } from 'react';
import api from '../services/api';

interface Employee {
  id: string;
  user: string;
  email: string;
  status: string; // novo atributo: "ativado" ou "desativado"
  imgUrl?: string;
  token: string;
}

interface EmployeeListProps {
  usuario: Employee;
}

const EmployeeList: React.FC<EmployeeListProps> = ({ usuario }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [search, setSearch] = useState('');
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [employeeToToggle, setEmployeeToToggle] = useState<Employee | null>(null);
  const token = usuario.token;

  const fetchEmployees = useCallback(async () => {
    try {
      const response = await api.get('/employee', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEmployees(response.data);
      setFilteredEmployees(response.data);
    } catch (error) {
      console.error('Erro ao listar funcionários:', error);
    }
  }, [token]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  useEffect(() => {
    if (search.trim() === '') {
      setFilteredEmployees(employees);
    } else {
      const filtered = employees.filter(emp =>
        emp.user.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredEmployees(filtered);
    }
  }, [search, employees]);

  const openToggleModal = (employee: Employee) => {
    setEmployeeToToggle(employee);
    setShowModal(true);
  };

  const confirmToggle = async () => {
    if (!employeeToToggle) return;

    try {
      await api.put(
        `/employee/${employeeToToggle.id}/toggle-status`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowModal(false);
      setEmployeeToToggle(null);
      fetchEmployees();
    } catch (error) {
      console.error('Erro ao alterar status do funcionário:', error);
    }
  };

  return (
    <div className="min-h-full bg-gray-100">
      {/* Exibe informação do usuário logado */}
      <div className="p-4 bg-white shadow mb-4">
        <h2 className="text-4xl text-center font-bold text-gray-800">Lista de Funcionários</h2>
      </div>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Campo de pesquisa */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Pesquisar funcionário..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-blue-300"
          />
        </div>

        {filteredEmployees.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredEmployees.map((employee) => (
              <div
                key={employee.id}
                className="bg-white rounded-lg shadow p-6 flex flex-col items-center transition transform hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="mb-4">
                  {employee.imgUrl ? (
                    <img
                      src={employee.imgUrl}
                      alt={employee.user}
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gray-300 flex items-center justify-center text-2xl">
                      👤
                    </div>
                  )}
                </div>
                <h3 className="text-lg font-medium text-gray-900">{employee.user}</h3>
                <p className="text-sm text-gray-500">{employee.email}</p>
                <button
                  onClick={() => openToggleModal(employee)}
                  className={`mt-2 px-3 w-36 py-1 rounded-full text-sm font-semibold ${
                    employee.status === 'ativado'
                      ? 'bg-green-500 hover:bg-green-600'
                      : 'bg-red-500 hover:bg-red-600'
                  } text-white focus:outline-none`}
                >
                  {employee.status === 'ativado' ? 'Ativado' : 'Desativado'}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-600">Nenhum funcionário encontrado.</div>
        )}
      </div>

      {/* Modal de confirmação */}
      {showModal && employeeToToggle && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="fixed inset-0 bg-black opacity-50"></div>
          <div className="bg-white rounded-lg p-6 z-50 max-w-md mx-auto">
            <p className="mb-4">
              Realmente deseja alterar o status do funcionário <strong>{employeeToToggle.user}</strong>?
            </p>
            <div className="flex justify-end space-x-2">
            <button
                onClick={() => {
                  setShowModal(false);
                  setEmployeeToToggle(null);
                }}
                className="px-4 py-2  text-black rounded "
              >
                Cancelar
              </button>
              <button
                onClick={confirmToggle}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                Confirmar
              </button>
             
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeList;
