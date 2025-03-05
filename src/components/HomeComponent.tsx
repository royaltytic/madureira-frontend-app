import React, { useState } from "react";
import api from "../services/api";
import { AxiosError } from "axios";
import { Home } from "../pages/telaHome/TelaHome";
import { PessoaProps } from "../types/types";
import { DashboardComponent } from "./dashboard/DashboardComponent";
import { UserProps } from "../types/types";

interface HomeComponentProps {
  usuario: UserProps;
}

const formatCPF = (value: string): string =>
  value.replace(/\D/g, "")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{2})$/, "$1-$2");

export const HomeComponent: React.FC<HomeComponentProps> = ({ usuario }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [pessoaData, setPessoaData] = useState<PessoaProps | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d+$/.test(value.replace(/\D/g, ""))) {
      setSearchTerm(formatCPF(value));
    } else {
      setSearchTerm(value);
    }
  };

  const onSubmit = async () => {
    voltarParaPesquisa();
    setLoading(true);
    setError(null);
  
    try {
      const cpfTerm = searchTerm.replace(/\D/g, "");
      const nameTerm = searchTerm.trim();
      if (!nameTerm) throw new Error("Digite um CPF ou Rep. Pública");
  
      const response = cpfTerm.length === 11
        ? await api.get(`/users?cpf=${cpfTerm}`)
        : await api.get(`/users/nome?nome=${encodeURIComponent(nameTerm)}`);
  
        if (response.status === 200) {
        
          const pessoaBase = response.data;
          const agricultorPescador = pessoaBase.agricultorPescador || {};
          const feirante = pessoaBase.feirante || {};
        
          // Criando um novo objeto garantindo que o ID principal fique fixo
          const pessoaFinal = {
            id: pessoaBase.id, // Garante que o ID principal nunca seja sobrescrito
            ...pessoaBase, // Espalha os dados principais da pessoa
            ...agricultorPescador, // Adiciona os campos de agricultorPescador, sem sobrescrever o ID
            ...feirante, // Adiciona os campos de feirante, sem sobrescrever o ID
          };
        
          // Removendo propriedades aninhadas para evitar redundância
          delete pessoaFinal.agricultorPescador;
          delete pessoaFinal.feirante;
          delete pessoaFinal.id; // Isso garante que o id da pessoaBase fique no início
        
          // Criando um novo objeto com a chave id primeiro
          const pessoaFinalOrdenada = {
            id: pessoaBase.id, // Coloca o id no início novamente
            ...pessoaFinal, // Agora, o restante das propriedades vêm depois
          };
        
          setPessoaData(pessoaFinalOrdenada);
        }
        
        
         else {
        throw new Error("Erro ao buscar dados.");
      }
    } catch (error) {
      setError((error as AxiosError).response ? "CPF ou Rep. Pública inválido ou pessoa não cadastrada." : "Erro de conexão com o servidor.");
    } finally {
      setLoading(false);
    }
  };
  

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") onSubmit();
  };

  const voltarParaPesquisa = () => {
    setPessoaData(null);
    setSearchTerm("");
    setError(null);
  };

  return (
    <div className="p-5">
      <div className="flex gap-5">
        <input
          type="text"
          value={searchTerm}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Digite um CPF ou Rep. Pública"
          className="border border-gray-300 bg-transparent p-2 rounded-lg h-9 w-[300px]"
        />
        <button
          className="w-[200px] h-[35px] bg-gradient-to-r from-[#0E9647] to-[#165C38] font-bold text-base text-white hover:opacity-90 rounded-lg"
          onClick={onSubmit}
          disabled={loading}
        >
          {loading ? "Pesquisando..." : "Pesquisar"}
        </button>
      </div>
      {error && <p className="text-red-600 mt-2">{error}</p>}
      <div className="w-full border border-black my-2"></div>
      {pessoaData ? (
        <Home usuario={usuario} {...pessoaData} voltarParaPesquisa={voltarParaPesquisa} />
      ) : (
        <DashboardComponent />
      )}
    </div>
  );
};

export default HomeComponent;
