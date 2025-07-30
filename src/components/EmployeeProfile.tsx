import React, { useState, useEffect } from 'react';
import { useParams} from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { UserProps as Employee } from '../types/types'; // Renomeando o tipo para clareza
import { LoadingSpinner } from '../components/loading/LoadingSpinner';
import { BriefcaseIcon, UserPlusIcon, PencilIcon } from '@heroicons/react/24/solid';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type StatCardProps = {
  Icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
};

// Um card para exibir estatísticas rápidas
const StatCard = ({ Icon, label, value } : StatCardProps) => (
  <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
    <div className="flex items-center gap-4">
      <div className="bg-indigo-100 p-3 rounded-xl"><Icon className="h-6 w-6 text-indigo-600"/></div>
      <div>
        <p className="text-3xl font-bold text-slate-800">{value}</p>
        <p className="text-sm font-medium text-slate-500">{label}</p>
      </div>
    </div>
  </div>
);

export const EmployeeProfile = () => {
  const { id } = useParams<{ id: string }>(); // Pega o ID da URL
  const { usuario: loggedInUser } = useAuth();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEmployeeDetails = async () => {
      if (!id || !loggedInUser?.token) return;
      setIsLoading(true);
      try {
        const response = await api.get(`/employee/${id}`, {
          headers: { Authorization: `Bearer ${loggedInUser.token}` }
        });
        setEmployee(response.data);
      } catch (error) {
        console.error("Erro ao buscar detalhes do servidor:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEmployeeDetails();
  }, [id, loggedInUser]);

  if (isLoading) return <LoadingSpinner />;
  if (!employee) return <div className="text-center p-8">Servidor não encontrado.</div>;

  return (
    <div className="w-full max-w-7xl mx-auto p-4">
      <header className="flex items-center gap-6 mb-8">
        <img
          src={employee.imgUrl || `https://ui-avatars.com/api/?name=${employee.user}`}
          alt={employee.user}
          className="w-24 h-24 rounded-full object-cover shadow-lg"
        />
        <div>
          <h1 className="text-4xl font-bold text-slate-900">{employee.user}</h1>
          <p className="text-slate-500 text-lg">{employee.email}</p>
          <p className="mt-1 text-sm font-semibold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full capitalize self-start inline-block">
            {employee.tipo}
          </p>
        </div>
      </header>

      {/* Cards de Estatísticas */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard Icon={BriefcaseIcon} label="Pedidos Criados" value={employee.orders?.length || 0} />
        <StatCard Icon={UserPlusIcon} label="Usuários Cadastrados" value={employee.usersCreated?.length || 0} />
        <StatCard Icon={PencilIcon} label="Últimas Atualizações" value={employee.usersUpdated?.length || 0} />
      </section>

      {/* Seção de Atividades Recentes (Exemplo com Usuários Criados) */}
      <section className="mt-8 bg-white p-6 rounded-2xl shadow-lg border border-slate-200">
        <h3 className="text-xl font-semibold text-slate-800 mb-4">Atividade Recente: Usuários Cadastrados</h3>
        <ul className="divide-y divide-slate-200">
          {employee.usersCreated && employee.usersCreated.length > 0 ? (
            employee.usersCreated.map(u => (
              <li key={u.id} className="py-3 flex justify-between items-center">
                <span className="font-medium text-slate-700">{u.name}</span>
                <span className="text-sm text-slate-500">
                  {format(new Date(u.createdAt), 'dd/MM/yyyy', { locale: ptBR })}
                </span>
              </li>
            ))
          ) : (
            <p className="text-slate-500 text-center py-4">Nenhuma atividade encontrada.</p>
          )}
        </ul>
      </section>
      {/* Você pode criar seções similares para 'orders' e 'usersUpdated' */}
    </div>
  );
};