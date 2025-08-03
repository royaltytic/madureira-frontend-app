// src/pages/telaLogin/TelaLogin.tsx

import { useState, FormEvent } from 'react';
import { useAuth } from '../../context/AuthContext'; // 2. Importar o hook de autenticação
import { toast } from 'react-hot-toast'; // Para um feedback mais moderno

import Logo from "./assets/logo_nova.png";
import fundo from "./assets/fundo.jpeg";
import { EyeIcon, EyeSlashIcon, UserIcon } from "@heroicons/react/24/solid";

interface TelaLoginProps {
  onChangeMode: (mode: string) => void;
}

// CORREÇÃO: A prop 'onChangeMode' agora é desestruturada do objeto de props.
export const TelaLogin = ({ onChangeMode }: TelaLoginProps) => {
  const { login } = useAuth(); // 3. Pegar a função de login do contexto
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // A função de submit agora é mais limpa e centralizada
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault(); // 4. Prevenir o recarregamento da página (essencial!)
    setIsLoading(true);
    
    try {
      // 5. Apenas chama a função do contexto. A lógica complexa está lá.
      await login(user, password);
      // A navegação agora é tratada dentro do próprio `login` no AuthContext
    }  catch (error: unknown) {
      // A mesma lógica do if/else, mas em uma única linha!
      const message = error instanceof Error 
        ? error.message 
        : "Usuário ou senha incorretos.";
        
      toast.error(message);

    } finally {
      setIsLoading(false);
    }
  };

  // A função handleKeyPress não é mais necessária com o <form>

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-[#00324C] to-[#191B23] opacity-75 z-0"></div>
      <div className="absolute inset-0 bg-cover bg-center z-[-1]" style={{ backgroundImage: `url(${fundo})` }} ></div>
      
      <div className="relative z-10 flex items-center justify-center h-full">
        <div className="flex w-full max-w-6xl">
          <div className="w-full md:w-1/2 flex flex-col justify-center p-10">
            {/* 6. Usar a tag <form> com o handler onSubmit */}
            <form onSubmit={handleSubmit} className="bg-white bg-opacity-20 backdrop-blur-md rounded-3xl p-10 shadow-xl animate-fadeIn">
              <h1 className="text-5xl font-extrabold text-white text-center mb-8">
                Faça seu Login
              </h1>
              {/* Desabilitamos o fieldset inteiro durante o carregamento */}
              <fieldset disabled={isLoading} className="space-y-6">
                <div>
                  <label className="block text-2xl text-white mb-2">Usuário</label>
                  <div className="relative">
                    <input
                      className="w-full h-16 pl-4 pr-16 rounded-2xl bg-white text-2xl font-bold shadow-lg outline-none normal-case"
                      type="text"
                      value={user}
                      onChange={(e) => setUser(e.target.value)}
                      autoComplete="username"
                      required
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-5 pointer-events-none">
                      <UserIcon className="h-7 w-7 text-gray-400" />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-2xl text-white mb-2">Senha</label>
                  <div className="relative">
                    <input
                      className="w-full h-16 pl-4 pr-16 rounded-2xl bg-white text-2xl font-bold shadow-lg outline-none normal-case"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      required
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
                
                {/* 7. Usar <Link> para navegação sem recarregar a página */}
                <a onClick={() => onChangeMode("recuperar")} className="block text-right text-white underline text-xl cursor-pointer">
                  Esqueci minha Senha
                </a>

                <button
                  type="submit" // O botão principal deve ser do tipo submit
                  className="w-full h-16 bg-gradient-to-r from-[#0E9647] to-[#165C38] text-white font-bold text-3xl rounded-2xl shadow-xl hover:opacity-90 transition-all flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" viewBox="0 0 24 24">...</svg>
                      Entrando...
                    </>
                  ) : (
                    'Entrar'
                  )}
                </button>
              </fieldset>

              <div className="mt-6 text-center">
                {/* <div onClick={() => onChangeMode("cadastro")} className="text-white underline text-xl cursor-pointer">
                  Ainda não tenho uma conta
                </div> */}
              </div>
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
