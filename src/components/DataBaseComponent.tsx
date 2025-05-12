import React, { useEffect, useState } from "react";
import InputMask from "react-input-mask";
import api from "../services/api";
import { Home } from "../pages/telaHome/TelaHome";
import { PessoaProps, UserProps } from "../types/types";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Props do componente
interface DataBaseComponentProps {
  usuario: UserProps;
}

// Utilitários
const removeCpfMask = (cpf: string) => cpf.replace(/\D/g, "");
const formatCpf = (cpf: string) =>
  cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4");

// Spinner de carregamento
const Spinner: React.FC = () => (
  <div className="flex items-center justify-center h-full">
    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

export const DatabaseComponent: React.FC<DataBaseComponentProps> = ({ usuario }) => {
  // Estados
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<PessoaProps[]>([]);
  const [selectedUser, setSelectedUser] = useState<PessoaProps | null>(null);
  const [pedidoFiltro, setPedidoFiltro] = useState("");

  const [filters, setFilters] = useState({
    name: "",
    cpf: "",
    apelido: "",
    classe: "",
    neighborhood: "",
  });

  // Buscar todos os usuários
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get("/users/all");
      const sorted = response.data.sort((a: PessoaProps, b: PessoaProps) =>
        a.name.localeCompare(b.name)
      );
      setUsers(sorted);
    } catch {
      setError("Erro ao carregar usuários.");
    } finally {
      setLoading(false);
    }
  };

  // Efeitos
  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedUser === null) fetchUsers();
  }, [selectedUser]);

  // Filtragem dos usuários
  const filteredUsers = users.filter((user) => {
    const matchesCampos = Object.entries(filters).every(([key, value]) => {
      if (!value.trim()) return true;

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
      return typeof userValue === "string"
        ? userValue.toLowerCase().includes(value.toLowerCase())
        : false;
    });

    const matchesPedido =
      !pedidoFiltro.trim() ||
      user.orders.some((order) =>
        order.servico.toLowerCase().includes(pedidoFiltro.toLowerCase())
      );

    return matchesCampos && matchesPedido;
  });

  // Exportação para PDF
  const exportToPDF = () => {
    const doc = new jsPDF({ orientation: "landscape" });
    doc.setFontSize(16);
    doc.text("Lista de Usuários", 14, 10);

    autoTable(doc, {
      startY: 20,
      head: [
        [
          "Nome",
          "CPF",
          "Apelido",
          "RG",
          "Telefone",
          "Localidade",
          "Classe",
          "Pedidos",
        ],
      ],
      body: filteredUsers.map((user) => [
        user.name,
        Array.isArray(user.classe) && user.classe.includes("Repartição Pública")
          ? "-"
          : formatCpf(user.cpf),
        user.apelido || "-",
        user.rg || "-",
        user.phone || "-",
        user.neighborhood || "-",
        Array.isArray(user.classe) ? user.classe.join(", ") : "-",
        [...new Set(user.orders.map((order) => order.servico))].join(", "),
      ]),
      styles: {
        fontSize: 10,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [52, 152, 219],
        textColor: 255,
        halign: "center",
      },
      bodyStyles: {
        halign: "left",
      },
    });

    doc.save("usuarios.pdf");
  };

  // Se um usuário foi selecionado, renderizar tela de detalhes
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
      {error && <p className="text-red-600 text-center mb-5">{error}</p>}

      <h1 className="text-4xl font-semibold text-center text-gray-800">
        Tabela de Usuários
      </h1>

      <div className="flex w-full gap-4 justify-end items-center mt-4">
        <span>
          Total de pessoas: <b>{filteredUsers.length}</b>
        </span>
        <button
          onClick={exportToPDF}
          className="bg-gradient-to-r from-[#0E9647] to-[#165C38] text-white px-8 py-2 rounded-lg hover:opacity-90 transition"
        >
          Baixar PDF
        </button>
      </div>

      <div className="border-t-2 border-gray-200 my-3" />

      {/* Filtros */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-5">
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
        ].map((field) => (
          <input
            key={field.key}
            type="text"
            placeholder={field.placeholder}
            value={filters[field.key as keyof typeof filters]}
            onChange={(e) =>
              setFilters({ ...filters, [field.key]: e.target.value })
            }
            className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        ))}
        <input
          type="text"
          placeholder="Filtrar por Pedido"
          value={pedidoFiltro}
          onChange={(e) => setPedidoFiltro(e.target.value)}
          className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {/* Tabela */}
      {loading ? (
        <div className="flex items-center justify-center h-60">
          <Spinner />
        </div>
      ) : (
        <div className="overflow-x-auto shadow-lg rounded-lg border border-gray-200">
          <table className="min-w-full bg-white border border-gray-300">
            <thead className="bg-gray-100 text-black">
              <tr>
                {[
                  "Nome",
                  "CPF",
                  "Apelido",
                  "RG",
                  "Telefone",
                  "Localidade",
                  "Classe",
                  "Pedidos",
                ].map((title) => (
                  <th key={title} className="px-4 py-3 text-left">
                    {title}
                  </th>
                ))}
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
                      {Array.isArray(user.classe) &&
                      user.classe.includes("Repartição Pública")
                        ? "-"
                        : formatCpf(user.cpf)}
                    </td>
                    <td className="px-4 py-3">{user.apelido || "-"}</td>
                    <td className="px-4 py-3">{user.rg || "-"}</td>
                    <td className="px-4 py-3">{user.phone || "-"}</td>
                    <td className="px-4 py-3">{user.neighborhood || "-"}</td>
                    <td className="px-4 py-3">
                      {Array.isArray(user.classe)
                        ? user.classe.join(", ")
                        : "-"}
                    </td>
                    <td className="px-4 py-3 text-justify">
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
