import React, { useEffect, useState } from "react";
import api from "../services/api";
import { PessoaProps } from "../types/types";

const AllUsersTable: React.FC = () => {
  const [users, setUsers] = useState<PessoaProps[]>([]);
  const [selectedUser, setSelectedUser] = useState<PessoaProps | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({ name: "", apelido: "", classe: "", neighborhood: "" });

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await api.get("/users/all");
        const sortedUsers = response.data.sort((a: PessoaProps, b: PessoaProps) => a.name.localeCompare(b.name));
        setUsers(sortedUsers);
      } catch {
        setError("Erro ao carregar usuários.");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user) =>
    Object.entries(filters).every(([key, value]) =>
      value.trim() === ""
        ? true
        : key === "classe"
        ? Array.isArray(user.classe) && user.classe.some((cl) => cl.toLowerCase().includes(value.toLowerCase()))
        : typeof user[key as keyof PessoaProps] === 'string' && (user[key as keyof PessoaProps] as string).toLowerCase().includes(value.toLowerCase())
    )
  );

  return (
    <div className="p-6 max-w-full mx-auto">
      <h1 className="text-4xl font-semibold text-center text-gray-800 mb-8">Tabela de Usuários</h1>
      <div className="w-full mb-6 border-t-4 border-gray-300"></div>

      {/* Filtros */}
      <div className="grid grid-cols-4 gap-6 mb-6">
        {Object.keys(filters).map((key) => (
          <input
            key={key}
            type="text"
            placeholder={
              key === "name" ? "Nome" :
              key === "apelido" ? "Apelido" :
              key === "classe" ? "Classe" :
              key === "neighborhood" ? "Localidade" : key
            }
            value={filters[key as keyof typeof filters]}
            onChange={(e) => setFilters({ ...filters, [key]: e.target.value })}
            className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        ))}
      </div>

      {/* Tabela */}
      {loading ? (
        <div className="text-center py-4 text-xl">🔄 Carregando...</div>
      ) : error ? (
        <div className="text-red-500 text-center text-xl">{error}</div>
      ) : (
        <div className="overflow-x-auto shadow-lg rounded-lg border border-gray-200">
          <table className="min-w-full bg-white table-auto">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="px-6 py-4 text-center border-b">Nome</th>
                <th className="px-6 py-4 text-center border-b">CPF</th>
                <th className="px-6 py-4 text-center border-b">Apelido</th>
                <th className="px-6 py-4 text-center border-b">RG</th>
                <th className="px-6 py-4 text-center border-b">Telefone</th>
                <th className="px-6 py-4 text-center border-b">Localidade</th>
                <th className="px-6 py-4 text-center border-b">Classe</th>
                <th className="px-6 py-4 text-center border-b">Pedidos</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr
                    key={user.cpf}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedUser(user)}
                  >
                    <td className="px-6 py-4 border-b text-center">{user.name}</td>
                    <td className="px-6 py-4 border-b text-center">{user.cpf}</td>
                    <td className="px-6 py-4 border-b text-center">{user.apelido || "-"}</td>
                    <td className="px-6 py-4 border-b text-center">{user.rg || "-"}</td>
                    <td className="px-6 py-4 border-b text-center">{user.phone || "-"}</td>
                    <td className="px-6 py-4 border-b text-center">{user.neighborhood || "-"}</td>
                    <td className="px-6 py-4 border-b text-center">{user.classe.join(", ")}</td>
                    <td className="px-6 py-4 border-b text-center">{user.orders.length}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="text-center py-4 text-gray-500">Nenhum usuário encontrado.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Detalhes do Usuário */}
      {selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50 animate-fadeIn">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96 animate-scaleIn">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Detalhes do Usuário</h2>
            <p><strong>Nome:</strong> {selectedUser.name}</p>
            <p><strong>Apelido:</strong> {selectedUser.apelido || "-"}</p>
            <p><strong>Classe:</strong> {selectedUser.classe.join(", ")}</p>
            <p><strong>Localidade:</strong> {selectedUser.neighborhood || "-"}</p>
            <button
              onClick={() => setSelectedUser(null)}
              className="mt-4 w-full bg-gradient-to-r from-[#E03335] to-[#812F2C] text-white font-semibold py-2 rounded-lg hover:transition"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllUsersTable;
