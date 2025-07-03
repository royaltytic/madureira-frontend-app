import Logo from "./assets/logo_nova.png";
import { useState } from "react";
import api from "../../services/api";
import fundo from "./assets/fundo.jpeg";

interface TelaRecuperarSenhaProps {
  onChangeMode: (mode: string) => void; // Função para alternar entre os modos de tela
}

export const TelaRecuperarSenha: React.FC<TelaRecuperarSenhaProps> = ({ onChangeMode }) => {
  const [email, setEmail] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const onSubmit = async () => {
    try {
      const response = await api.post("/recover-password", {
        email,
        birthDate,
        newPassword,
      });

      if (response.status === 200) {
        setInfoMessage("Senha redefinida com sucesso! Faça login.");
        setErrorMessage("");
        // Após o sucesso, redireciona para a tela de login após 2 segundos
        setTimeout(() => {
          onChangeMode("login");
        }, 2000);
      }
    } catch {
      setErrorMessage("Erro ao recuperar senha. Verifique os dados.");
      setInfoMessage("");
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* Background: gradiente e imagem */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#00324C] to-[#191B23] opacity-75 z-0"></div>
      <div
        className="absolute inset-0 bg-cover bg-center z-[-1]"
        style={{ backgroundImage: `url(${fundo})` }}
      ></div>

      {/* Conteúdo principal */}
      <div className="relative z-10 flex items-center justify-center h-full">
        <div className="flex w-full max-w-6xl">
          {/* Coluna do formulário */}
          <div className="w-full md:w-1/2 flex flex-col justify-center p-10">
            <div className="bg-white bg-opacity-20 backdrop-blur-md rounded-3xl p-10 shadow-xl animate-fadeIn">
              <h1 className="text-5xl font-extrabold text-white text-center mb-8">
                Recuperar Senha
              </h1>
              <div className="space-y-6">
                <div>
                  <label className="block text-2xl text-white mb-2">
                    E-mail
                  </label>
                  <input
                    type="email"
                    placeholder="Digite seu e-mail"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-16 px-4 rounded-2xl bg-white text-2xl font-bold shadow-lg outline-none"
                  />
                </div>
                <div>
                  <label className="block text-2xl text-white mb-2">
                    Data de Nascimento
                  </label>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full h-16 px-4 rounded-2xl bg-white text-2xl font-bold shadow-lg outline-none"
                  />
                </div>
                <div>
                  <label className="block text-2xl text-white mb-2">
                    Nova Senha
                  </label>
                  <input
                    type="password"
                    placeholder="Digite sua nova senha"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full h-16 px-4 rounded-2xl bg-white text-2xl font-bold shadow-lg outline-none"
                  />
                </div>
                {infoMessage && (
                  <p className="text-green-400 text-xl text-center">{infoMessage}</p>
                )}
                {errorMessage && (
                  <p className="text-red-400 text-xl text-center">{errorMessage}</p>
                )}
                <button
                  onClick={onSubmit}
                  className="w-full h-16 bg-gradient-to-r from-[#0E9647] to-[#165C38] text-white font-bold text-3xl rounded-2xl shadow-xl hover:opacity-90 transition-all"
                >
                  Redefinir Senha
                </button>
              </div>
            </div>
          </div>
          {/* Coluna da imagem/Logo (apenas para telas maiores) */}
          <div className="hidden md:flex w-1/2 items-center justify-center">
            <img src={Logo} alt="Logo" className="w-[500px] h-auto" />
          </div>
        </div>
      </div>
    </div>
  );
};
