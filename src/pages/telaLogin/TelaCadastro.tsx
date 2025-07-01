import Logo from "./assets/logo_nova.png";
import { useState } from "react";
import api from "../../services/api";
import fundo from "./assets/fundo.jpeg";

interface TelaCadastroProps {
  onChangeMode: (mode: string) => void;
}

export const TelaCadastro: React.FC<TelaCadastroProps> = ({ onChangeMode }) => {
  const [user, setUser] = useState("");
  const [senha, setSenha] = useState("");
  const [email, setEmail] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const onSubmit = async () => {
    try {
      const response = await api.post("/employee/create", {
        user,
        password: senha,
        email,
        birthDate,
      });

      if (response.status === 201) {
        onChangeMode("login");
      }
    } catch {
      setErrorMessage("Erro ao criar conta. Tente novamente.");
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
          {/* Coluna do formulário de cadastro */}
          <div className="w-full md:w-1/2 flex flex-col justify-center p-10">
            <div className="bg-white bg-opacity-20 backdrop-blur-md rounded-3xl p-10 shadow-xl animate-fadeIn">
              <h1 className="text-5xl font-extrabold text-white text-center mb-8">
                Criar Conta
              </h1>
              <div className="space-y-6">
                <div>
                  <label className="block text-2xl text-white mb-2">
                    Usuário
                  </label>
                  <input
                    className="w-full h-16 px-4 rounded-2xl bg-white text-2xl font-bold shadow-lg outline-none"
                    type="text"
                    value={user}
                    onChange={(e) => setUser(e.target.value)}
                    onKeyDown={handleKeyPress}
                  />
                </div>
                <div>
                  <label className="block text-2xl text-white mb-2">
                    Email
                  </label>
                  <input
                    className="w-full h-16 px-4 rounded-2xl bg-white text-2xl font-bold shadow-lg outline-none"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={handleKeyPress}
                  />
                </div>
                <div>
                  <label className="block text-2xl text-white mb-2">
                    Senha
                  </label>
                  <input
                    className="w-full h-16 px-4 rounded-2xl bg-white text-2xl font-bold shadow-lg outline-none"
                    type="password"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    onKeyDown={handleKeyPress}
                  />
                </div>
                <div>
                  <label className="block text-2xl text-white mb-2">
                    Data de Nascimento
                  </label>
                  <input
                    className="w-full h-16 px-4 rounded-2xl bg-white text-2xl font-bold shadow-lg outline-none"
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                  />
                </div>
                {errorMessage && (
                  <p className="text-red-400 text-xl text-center">{errorMessage}</p>
                )}
                <button
                  className="w-full h-16 bg-gradient-to-r from-[#0E9647] to-[#165C38] text-white font-bold text-3xl rounded-2xl shadow-xl hover:opacity-90 transition-all"
                  onClick={onSubmit}
                >
                  Criar Conta
                </button>
              </div>
              <div className="mt-6 text-center">
                <span
                  onClick={() => onChangeMode("login")}
                  className="text-white underline text-xl cursor-pointer mr-4"
                >
                  Já possui conta? Login
                </span>
                <span
                  onClick={() => onChangeMode("recuperar")}
                  className="text-white underline text-xl cursor-pointer"
                >
                  Recuperar Senha
                </span>
              </div>
            </div>
          </div>
          {/* Coluna da imagem/Logo */}
          <div className="hidden md:flex w-1/2 items-center justify-center">
            <img src={Logo} alt="Logo" className="w-[500px] h-auto" />
          </div>
        </div>
      </div>
    </div>
  );
};
