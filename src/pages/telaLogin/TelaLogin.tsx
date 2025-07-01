import Logo from "./assets/logo_nova.png";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "../../services/api";
import fundo from "./assets/fundo.jpeg";
import { EyeIcon, EyeSlashIcon, UserIcon } from "@heroicons/react/24/solid";

interface TelaLoginProps {
  onChangeMode: (mode: string) => void;
}

export const TelaLogin: React.FC<TelaLoginProps> = ({ onChangeMode }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState("");
  const [senha, setSenha] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async () => {
    try {
      const response = await api.post("/employee", { user, password: senha });
      if (response.status === 200) {
        const { employee, token } = response.data;
        if (employee.status !== "ativado") {
          setErrorMessage("Sua conta está desativada. Contate o suporte.");
          return;
        }
        localStorage.setItem("userData", JSON.stringify({ employee, token }));
        navigate("/principal", { state: { userData: { employee, token } } });
      }
    } catch {
      setErrorMessage("Usuário ou senha incorretos. Tente novamente.");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      onSubmit();
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* Background overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#00324C] to-[#191B23] opacity-75 z-0"></div>
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center z-[-1]"
        style={{ backgroundImage: `url(${fundo})` }}
      ></div>
      {/* Main content */}
      <div className="relative z-10 flex items-center justify-center h-full">
        <div className="flex w-full max-w-6xl">
          {/* Coluna do formulário de login */}
          <div className="w-full md:w-1/2 flex flex-col justify-center p-10">
            <div className="bg-white bg-opacity-20 backdrop-blur-md rounded-3xl p-10 shadow-xl animate-fadeIn">
              <h1 className="text-5xl font-extrabold text-white text-center mb-8">
                Faça seu Login.
              </h1>
              <div className="space-y-6">
                <div>
                  <label className="block text-2xl text-white mb-2">
                    Usuário
                  </label>
                  <div className="relative">
                    <input
                      // Trocamos o padding: pequeno na esquerda, grande na direita
                      className="w-full h-16 pl-4 pr-16 rounded-2xl bg-white text-2xl font-bold shadow-lg outline-none normal-case"
                      type="text"
                      value={user}
                      onChange={(e) => setUser(e.target.value)}
                      onKeyDown={handleKeyPress}
                    />
                    {/* Ícone agora posicionado à direita */}
                    <div className="absolute inset-y-0 right-0 flex items-center pr-5 pointer-events-none">
                      <UserIcon className="h-7 w-7 text-gray-400" />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-2xl text-white mb-2">
                    Senha
                  </label>
                  {/* O `div` agora é 'relative' para posicionarmos o ícone dentro dele */}
                  <div className="relative">
                    <input
                      className="w-full h-16 pl-4 pr-16 rounded-2xl bg-white text-2xl font-bold shadow-lg outline-none normal-case"
                      type={showPassword ? "text" : "password"} // O tipo do input agora é dinâmico
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
                      onKeyDown={handleKeyPress}
                    />
                    {/* Botão com o ícone posicionado absolutamente à direita */}
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)} // Alterna o estado de visibilidade
                      className="absolute inset-y-0 right-0 flex items-center pr-5 text-gray-500 hover:text-gray-800"
                      title={showPassword ? "Ocultar senha" : "Mostrar senha"}
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="h-7 w-7" /> // Ícone para ocultar
                      ) : (
                        <EyeIcon className="h-7 w-7" /> // Ícone para mostrar
                      )}
                    </button>
                  </div>
                </div>
                <span
                  onClick={() => onChangeMode("recuperar")}
                  className="block text-right text-white underline text-xl cursor-pointer"
                >
                  Esqueci minha Senha
                </span>
                {errorMessage && (
                  <p className="text-red-400 text-xl text-center">
                    {errorMessage}
                  </p>
                )}
                <button
                  className="w-full h-16 bg-gradient-to-r from-[#0E9647] to-[#165C38] text-white font-bold text-3xl rounded-2xl shadow-xl hover:opacity-90 transition-all"
                  onClick={onSubmit}
                >
                  Entrar
                </button>
              </div>
              <div className="mt-6 text-center">
                <span
                  onClick={() => onChangeMode("cadastro")}
                  className="text-white underline text-xl cursor-pointer"
                >
                  Ainda não tenho uma conta
                </span>
              </div>
            </div>
          </div>
          {/* Coluna da imagem/Logo */}
          <div className="hidden md:flex w-1/2 items-center justify-center">
            <img src={Logo} alt="Logo" className="w-[700px] h-auto" />
          </div>
        </div>
      </div>
    </div>
  );
};
