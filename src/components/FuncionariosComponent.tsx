import { useState, useMemo, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useEmployees } from './hooks/useEmployee';
import { EmployeeCard } from '../components/cards/EmployeeCard';
import { ConfirmationModal } from './modal/ConfimationModal';
import { EmployeeModal } from '../components/modal/EmployeeModal';
import { useAuth } from '../context/AuthContext';
import { AddEmployeeCard } from '../components/cards/AddEmployeeCard';
import { EmployeeFormData } from '../utils/EmployeeSchema';
import { UserProps } from '../types/types';
import api from '../services/api';
import { LoadingSpinner } from './loading/LoadingSpinner';


// Componente para o Modal de Mudança de Cargo
const ChangeRoleModal = ({ isOpen, onClose, onConfirm, employee }: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (newRole: string) => void;
  employee: UserProps | null;
}) => {
  const [selectedRole, setSelectedRole] = useState(employee?.tipo || '');

  useEffect(() => {
    if (employee) {
      setSelectedRole(employee.tipo);
    }
  }, [employee]);

  if (!isOpen || !employee) return null;

  // CORRIGIDO: Lógica de validação agora está aqui, no lugar certo.
  const handleConfirm = () => {
    // Verificação 1: Garante que um cargo foi selecionado.
    if (!selectedRole) {
      toast.error('Por favor, selecione um cargo da lista.');
      return;
    }
    // Verificação 2: Garante que o cargo selecionado é diferente do atual.
    if (selectedRole === employee.tipo) {
      toast.error('O novo cargo deve ser diferente do atual.');
      return;
    }
    // Se tudo estiver certo, chama a função para salvar.
    onConfirm(selectedRole);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="p-6">
          <h3 className="text-xl font-bold text-slate-800">Alterar Cargo</h3>
          <p className="mt-2 text-sm text-slate-600">
            Selecione o novo cargo para <strong>{employee.user}</strong>.
          </p>
          <div className="mt-4">
            <label htmlFor="role-select" className="block text-sm font-medium text-slate-700 mb-1">
              Cargo
            </label>
            <input
              id="role-input"
              type="text"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              placeholder="Ex: ADMIN, SECRETARIA"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
        <footer className="px-6 py-4 bg-slate-50 flex justify-end items-center gap-3 rounded-b-xl">
          <button onClick={onClose} className="text-sm font-semibold text-slate-600 hover:text-slate-900">
            Cancelar
          </button>
          <button onClick={handleConfirm} className="bg-indigo-600 text-white font-bold px-5 py-2 rounded-lg shadow-sm hover:bg-indigo-700">
            Salvar Alteração
          </button>
        </footer>
      </div>
    </div>
  );
};


const EmployeeList = () => {
  // Ajustado para 'user'
  const { usuario } = useAuth();

  const {
    employees,
    isLoading,
    error,
    deleteEmployee,
    toggleEmployeeStatus,
    updateRole,
    fetchEmployees,
  } = useEmployees(usuario ? usuario.token : '');

  const [search, setSearch] = useState('');
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<UserProps | null>(null);
  const [employeeToToggle, setEmployeeToToggle] = useState<UserProps | null>(null);
  const [employeeToChangeRole, setEmployeeToChangeRole] = useState<UserProps | null>(null);

  const filteredEmployees = useMemo(() => {
    if (!search) return employees;
    return employees.filter(emp =>
      emp.user.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, employees]);

  const handleOpenCreateModal = () => setIsFormModalOpen(true);

  const handleSave = async (data: EmployeeFormData) => {
    const promise = api.post('/employee/create', data, {
      headers: { Authorization: `Bearer ${usuario ? usuario.token : ''}` }
    });

    toast.promise(promise, {
      loading: 'Criando servidor...',
      success: () => {
        fetchEmployees();
        setIsFormModalOpen(false);
        return 'Servidor criado com sucesso!';
      },
      error: 'Erro ao criar servidor.'
    });
  };

  const handleDelete = async () => {
    if (!employeeToDelete) return;
    const promise = deleteEmployee(employeeToDelete.id);
    toast.promise(promise, {
      loading: 'Excluindo...',
      success: () => {
        setEmployeeToDelete(null);
        return 'Servidor excluído com sucesso!';
      },
      error: (err) => err.message || 'Ocorreu um erro.',
    });
  };

  const handleConfirmToggle = async () => {
    if (!employeeToToggle) return;
    const promise = toggleEmployeeStatus(employeeToToggle.id);
    toast.promise(promise, {
      loading: 'Alterando status...',
      success: 'Status alterado com sucesso!',
      error: (err) => err.message || 'Ocorreu um erro.',
    });
    setEmployeeToToggle(null);
  };

  // CORRIGIDO: Esta função agora tem a responsabilidade certa: chamar a API.
  const handleConfirmRoleChange = async (newRole: string) => {
    if (!employeeToChangeRole) return;

    const promise = updateRole(employeeToChangeRole.id, newRole);

    toast.promise(promise, {
      loading: 'Alterando cargo...',
      success: () => {
        setEmployeeToChangeRole(null);
        return 'Cargo alterado com sucesso!';
      },
      error: (err) => err.message || 'Ocorreu um erro ao alterar o cargo.'
    });
  };

  return (
    <div className="min-h-full bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl text-center font-bold text-slate-800 mb-6">Gerenciamento de Servidores</h2>
        <div className="mb-6">
          <input
            type="text"
            placeholder="Pesquisar servidor pelo nome..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {isLoading && <div className="text-center text-slate-500"><LoadingSpinner /></div>}
        {error && <div className="text-center text-red-500 p-3 rounded-lg">{error}</div>}

        {!isLoading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredEmployees.map((employee) => (
              <EmployeeCard
                key={employee.id}
                employee={employee}
                onToggleStatus={() => setEmployeeToToggle(employee)}
                onDelete={() => setEmployeeToDelete(employee)}
                onChangeRole={() => setEmployeeToChangeRole(employee)}
              />
            ))}
            <AddEmployeeCard onClick={handleOpenCreateModal} />
          </div>
        )}
      </div>

      <EmployeeModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSave={handleSave}
      />

      <ConfirmationModal
        isOpen={!!employeeToToggle}
        onClose={() => setEmployeeToToggle(null)}
        onConfirm={handleConfirmToggle}
        title="Alterar Status"
      >
        Deseja realmente alterar o status do servidor <strong>{employeeToToggle?.user}</strong>?
      </ConfirmationModal>

      <ConfirmationModal
        isOpen={!!employeeToDelete}
        onClose={() => setEmployeeToDelete(null)}
        onConfirm={handleDelete}
        title="Confirmar Exclusão"
      >
        Deseja realmente excluir o servidor <strong>{employeeToDelete?.user}</strong>? Esta ação não pode ser desfeita.
      </ConfirmationModal>

      <ChangeRoleModal
        isOpen={!!employeeToChangeRole}
        onClose={() => setEmployeeToChangeRole(null)}
        onConfirm={handleConfirmRoleChange}
        employee={employeeToChangeRole}
      />
    </div>
  );
};

export default EmployeeList;
