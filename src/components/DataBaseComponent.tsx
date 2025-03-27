import React, { useEffect, useState } from "react";
import InputMask from "react-input-mask";
import api from "../services/api";
import { Home } from "../pages/telaHome/TelaHome";
import { PessoaProps, UserProps } from "../types/types";

interface DataBaseComponentProps {
  usuario: UserProps;
}

// Função para remover a máscara do CPF (deixa só os números)
const removeCpfMask = (cpf: string) => cpf.replace(/\D/g, "");

// Função para formatar o CPF corretamente
const formatCpf = (cpf: string) =>
  cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4");

// Componente de loading (Spinner)
const Spinner: React.FC = () => (
  <div className="flex items-center justify-center h-full">
    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

export const DatabaseComponent: React.FC<DataBaseComponentProps> = ({ usuario }) => {
  // Estados
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<PessoaProps[]>([]);
  const [selectedUser, setSelectedUser] = useState<PessoaProps | null>(null);

  // Filtros
  const [filters, setFilters] = useState({
    name: "",
    cpf: "",
    apelido: "",
    classe: "",
    neighborhood: "",
  });

  // Buscar usuários
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

  // Buscar usuários ao carregar
  useEffect(() => {
    fetchUsers();
  }, []);

  // Atualizar quando o selectedUser mudar
  useEffect(() => {
    if (selectedUser === null) {
      fetchUsers();
    }
  }, [selectedUser]);

  // Filtragem de usuários
  const filteredUsers = users.filter((user) =>
    Object.entries(filters).every(([key, value]) => {
      if (value.trim() === "") return true;

      if (key === "cpf") {
        return removeCpfMask(user.cpf).includes(removeCpfMask(value));
      }

      if (key === "classe") {
        return (
          Array.isArray(user.classe) &&
          user.classe.some((cl) => cl.toLowerCase().includes(value.toLowerCase()))
        );
      }

      const userValue = user[key as keyof PessoaProps];
      if (typeof userValue === "string") {
        return userValue.toLowerCase().includes(value.toLowerCase());
      }
      return false;
    })
  );

  if (selectedUser) {
    return (
      <Home usuario={usuario} {...selectedUser} voltarParaPesquisa={() => setSelectedUser(null)} />
    );
  }

  return (
    <div className="p-5 w-full mx-auto">
      {error && <p className="text-red-600 text-center mb-5">{error}</p>}

      <h1 className="text-4xl font-semibold text-center text-gray-800 mb-8">
        Tabela de Usuários
      </h1>

      <div className="border-t-2 border-gray-200 my-5"></div>

      {/* Campos de filtro */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-5">
        <InputMask
          mask="999.999.999-99"
          placeholder="CPF"
          value={filters.cpf}
          onChange={(e) => setFilters({ ...filters, cpf: e.target.value })}
          className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        {[
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
          <table className="min-w-full bg-white border border-gray-300 rounded-lg">
            <thead className="bg-gray-100 text-black">
              <tr>
                <th className="px-4 py-3 text-left">Nome</th>
                <th className="px-4 py-3 text-left">CPF</th>
                <th className="px-4 py-3 text-left">Apelido</th>
                <th className="px-4 py-3 text-left">RG</th>
                <th className="px-4 py-3 text-left">Telefone</th>
                <th className="px-4 py-3 text-left">Localidade</th>
                <th className="px-4 py-3 text-left">Classe</th>
                <th className="px-4 py-3 text-left">Pedidos</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr
                    key={user.cpf}
                    className="border-t hover:bg-gray-100 cursor-pointer transition-colors"
                    onClick={() => setSelectedUser(user)}
                  >
                    <td className="px-4 py-3">{user.name}</td>
                    <td className="px-4 py-3">
                      {Array.isArray(user.classe) && user.classe.includes("Repartição Pública") ? "-" : formatCpf(user.cpf)}
                    </td>

                    <td className="px-4 py-3">{user.apelido || "-"}</td>
                    <td className="px-4 py-3">{user.rg || "-"}</td>
                    <td className="px-4 py-3">{user.phone || "-"}</td>
                    <td className="px-4 py-3">{user.neighborhood || "-"}</td>
                    <td className="px-4 py-3">
                      {Array.isArray(user.classe) ? user.classe.join(", ") : "-"}
                    </td>
                    <td className="px-4 py-3 text-justify">{user.orders.length}</td>
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
