import React, { useEffect, useState } from "react";
import api from "../services/api";
import { Home } from "../pages/telaHome/TelaHome";
import { PessoaProps, UserProps } from "../types/types";

interface DataBaseComponentProps {
  usuario: UserProps;
}

// Spinner utilizando Tailwind
const Spinner: React.FC = () => (
  <div className="flex items-center justify-center h-full">
    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

export const DatabaseComponent: React.FC<DataBaseComponentProps> = ({ usuario }) => {
  // Estados para os dados e erros
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<PessoaProps[]>([]);
  const [selectedUser, setSelectedUser] = useState<PessoaProps | null>(null);

  // Estados para os filtros (incluindo CPF)
  const [filters, setFilters] = useState({
    name: "",
    cpf: "",
    apelido: "",
    classe: "",
    neighborhood: "",
  });

  // Busca todos os usuários ao montar o componente
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await api.get("/users/all");
        const sortedUsers = response.data.sort((a: PessoaProps, b: PessoaProps) =>
          a.name.localeCompare(b.name)
        );
        setUsers(sortedUsers);
      } catch {
        setError("Erro ao carregar usuários.");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // Filtra os usuários carregados com base nos filtros
  const filteredUsers = users.filter((user) =>
    Object.entries(filters).every(([key, value]) => {
      if (value.trim() === "") return true;
      // Para 'classe', que é um array, fazemos a busca em cada item
      if (key === "classe") {
        return Array.isArray(user.classe) &&
          user.classe.some((cl) =>
            cl.toLowerCase().includes(value.toLowerCase())
          );
      }
      // Para os outros campos, fazemos a busca diretamente
      const userValue = user[key as keyof PessoaProps];
      if (typeof userValue === "string") {
        return userValue.toLowerCase().includes(value.toLowerCase());
      }
      return false;
    })
  );

  // Se um usuário for selecionado na tabela, renderiza a telaHome
  if (selectedUser) {
    return (
      <Home
        usuario={usuario}
        {...selectedUser}
        voltarParaPesquisa={() => setSelectedUser(null)}
      />
    );
  }

  return (
    <div className="p-5 w-full mx-auto">
      {/* Se houver erro, exibe a mensagem */}
      {error && <p className="text-red-600 text-center mb-5">{error}</p>}
      <h1 className="text-4xl font-semibold text-center text-gray-800 mb-8">Tabela de Usuários</h1>

      <div className="border-t-2 border-gray-200 my-5"></div>

      {/* Filtros adicionais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-5">
        {[
          { key: "cpf", placeholder: "CPF" },
          { key: "name", placeholder: "Nome" },
          { key: "apelido", placeholder: "Apelido" },
          { key: "classe", placeholder: "Classe" },
          { key: "neighborhood", placeholder: "Localidade" },
        ].map((filter) => (
          <input
            key={filter.key}
            type="text"
            placeholder={filter.placeholder}
            value={filters[filter.key as keyof typeof filters]}
            onChange={(e) =>
              setFilters({ ...filters, [filter.key]: e.target.value })
            }
            className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        ))}
      </div>

      {/* Tabela de usuários */}
      {loading ? (
        <div className="flex items-center justify-center h-60">
          <Spinner />
        </div>
      ) : (
        <div className="overflow-x-auto shadow-lg rounded-lg border border-gray-200">
          <table className="min-w-full bg-white table-auto">
            <thead className="bg-gray-100 text-gray-700">
              <tr className="text-center">
                <th className="px-6 py-4 border-b">Nome</th>
                <th className="px-6 py-4 border-b">CPF</th>
                <th className="px-6 py-4 border-b">Apelido</th>
                <th className="px-6 py-4 border-b">RG</th>
                <th className="px-6 py-4 border-b">Telefone</th>
                <th className="px-6 py-4 border-b">Localidade</th>
                <th className="px-6 py-4 border-b">Classe</th>
                <th className="px-6 py-4 border-b">Pedidos</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr
                    key={user.cpf}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => setSelectedUser(user)}
                  >
                    <td className="px-6 py-4 border-b text-center">{user.name}</td>
                    <td className="px-6 py-4 border-b text-center">{user.cpf}</td>
                    <td className="px-6 py-4 border-b text-center">
                      {user.apelido || "-"}
                    </td>
                    <td className="px-6 py-4 border-b text-center">
                      {user.rg || "-"}
                    </td>
                    <td className="px-6 py-4 border-b text-center">
                      {user.phone || "-"}
                    </td>
                    <td className="px-6 py-4 border-b text-center">
                      {user.neighborhood || "-"}
                    </td>
                    <td className="px-6 py-4 border-b text-center">
                      {Array.isArray(user.classe) ? user.classe.join(", ") : "-"}
                    </td>
                    <td className="px-6 py-4 border-b text-center">
                      {user.orders.length}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="text-center py-4 text-gray-500">
                    Nenhum usuário encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
};

export default DatabaseComponent;
