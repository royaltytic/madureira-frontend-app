import { useState, FormEvent } from "react";
import { toast } from "react-hot-toast";
import api from "../../services/api";

import Logo from "./assets/logo_nova.png";
import fundo from "./assets/fundo.jpeg";
import { EyeIcon, EyeSlashIcon, EnvelopeIcon, CalendarDaysIcon, ArrowLeftIcon } from "@heroicons/react/24/solid";

interface TelaRecuperarSenhaProps {
  onChangeMode: (mode: string) => void;
}

export const TelaRecuperarSenha: React.FC<TelaRecuperarSenhaProps> = ({ onChangeMode }) => {
  const [email, setEmail] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await api.post("/recover-password", {
        email,
        birthDate,
        newPassword,
      });

      toast.success("Senha redefinida com sucesso! Redirecionando para o login...");
      
      setTimeout(() => {
        onChangeMode("login");
      }, 2000);

    } catch (error: unknown) {
      // CORREÇÃO: Substituído o uso de 'any' por uma abordagem type-safe.
      // 1. Define um tipo para a estrutura de erro esperada da API.
      type ApiError = {
        response?: {
          data?: {
            message?: string;
          };
        };
      };

      // 2. Acessa a mensagem de erro de forma segura com optional chaining
      //    e fornece uma mensagem padrão caso a propriedade não exista.
      const message =
        (error as ApiError)?.response?.data?.message ||
        "Não foi possível redefinir a senha. Verifique os dados e tente novamente.";
        
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-[#00324C] to-[#191B23] opacity-75 z-0"></div>
      <div
        className="absolute inset-0 bg-cover bg-center z-[-1]"
        style={{ backgroundImage: `url(${fundo})` }}
      ></div>

      <div className="relative z-10 flex items-center justify-center h-full">
        <div className="flex w-full max-w-6xl">
          <div className="w-full md:w-1/2 flex flex-col justify-center p-10">
            <form onSubmit={handleSubmit} className="bg-white bg-opacity-20 backdrop-blur-md rounded-3xl p-10 shadow-xl animate-fadeIn">
              <h1 className="text-5xl font-extrabold text-white text-center mb-8">
                Recuperar Senha
              </h1>
              <fieldset disabled={isLoading} className="space-y-6">
                <div>
                  <label className="block text-2xl text-white mb-2">E-mail</label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-16 pl-4 pr-16 rounded-2xl bg-white text-2xl font-bold shadow-lg outline-none"
                      required
                      autoComplete="email"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-5 pointer-events-none">
                      <EnvelopeIcon className="h-7 w-7 text-gray-400" />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-2xl text-white mb-2">Data de Nascimento</label>
                   <div className="relative">
                    <input
                      type="date"
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      className="w-full h-16 px-4 rounded-2xl bg-white text-2xl font-bold shadow-lg outline-none"
                      required
                    />
                     <div className="absolute inset-y-0 right-0 flex items-center pr-5 pointer-events-none">
                      <CalendarDaysIcon className="h-7 w-7 text-gray-400" />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-2xl text-white mb-2">Nova Senha</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full h-16 pl-4 pr-16 rounded-2xl bg-white text-2xl font-bold shadow-lg outline-none"
                      required
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-5 text-gray-500 hover:text-gray-800"
                    >
                      {showPassword ? <EyeSlashIcon className="h-7 w-7" /> : <EyeIcon className="h-7 w-7" />}
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full h-16 bg-gradient-to-r from-[#0E9647] to-[#165C38] text-white font-bold text-3xl rounded-2xl shadow-xl hover:opacity-90 transition-all flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Redefinindo...
                    </>
                  ) : (
                    'Redefinir Senha'
                  )}
                </button>
                 <a onClick={() => onChangeMode("login")} className="flex items-center justify-center gap-2 text-white underline text-xl cursor-pointer mt-4">
                  <ArrowLeftIcon className="h-5 w-5" />
                  Voltar para o Login
                </a>
              </fieldset>
            </form>
          </div>
          <div className="hidden md:flex w-1/2 items-center justify-center">
            <img src={Logo} alt="Logo" className="w-[700px] h-auto" />
          </div>
        </div>
      </div>
    </div>
  );
};
