import { createContext, useState, useContext, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserProps } from '../types/types'; // Importe seus tipos
import api from '../services/api';
import { isAxiosError } from 'axios';

// A interface do que o nosso contexto vai fornecer para a aplicação
interface AuthContextType {
  usuario: UserProps | null; // O usuário pode ser nulo se não estiver logado
  isAuthenticated: boolean; // Um atalho útil para checar se o usuário está logado
  login: (user: string, pass: string) => Promise<void>;
  logout: () => void;
  updateUser: (updatedData: Partial<UserProps>) => void;
}

// Criamos o contexto com um valor inicial undefined para segurança de tipos
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// O Provedor (Provider) que irá envolver nossa aplicação
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  
  // O estado principal agora é <UserProps | null>, começando como null.
  const [usuario, setUsuario] = useState<UserProps | null>(() => {
    try {
      const storedData = localStorage.getItem("userData");
      // Se não houver dados no localStorage, o estado inicial é null.
      if (!storedData) {
        return null;
      }
      
      const parsedData = JSON.parse(storedData);
      
      // Converte a string de data de volta para um objeto Date
      if (parsedData.birthDate) {
        parsedData.birthDate = new Date(parsedData.birthDate);
      }
      
      return parsedData as UserProps;
    } catch (error) {
      console.error("Falha ao carregar dados do usuário do localStorage", error);
      // Em caso de erro, o estado também é null.
      return null;
    }
  });
  
  // A flag de autenticação agora tem um significado claro:
  // ela só é 'true' se o objeto 'user' não for nulo.
  const isAuthenticated = usuario !== null;

  const login = async (username: string, pass: string) => {
    try {
      const response = await api.post('/employee', { user: username, password: pass }); 
      const { employee, token } = response.data;
      
      if (employee.status !== "ativado") {
        throw new Error("Sua conta está desativada. Contate o suporte.");
      }

      const userData: UserProps = { ...employee, token };

      if (userData.birthDate) {
        userData.birthDate = new Date(userData.birthDate);
      }
      
      localStorage.setItem('userData', JSON.stringify(userData));
      setUsuario(userData); // Define o estado com os dados do usuário
      
      navigate('/app/dashboard', { replace: true });

    } catch (error: unknown) {
        console.error("Erro no login:", error);
        if (isAxiosError(error) && error.response && error.response.status !== 404) {
            const serverMessage = error.response.data?.message; 
            throw new Error(serverMessage || 'Ocorreu um erro no servidor.');
        }
        throw new Error('Usuário ou senha inválidos.');
    }
  };

  // Ao fazer logout, o estado do usuário volta a ser null.
  const logout = () => {
    localStorage.removeItem("userData");
    setUsuario(null);
    navigate("/", { replace: true });
  };
  
  const updateUser = (updatedData: Partial<UserProps>) => {
    // Só atualiza se houver um usuário logado.
    if (usuario) {
      const newUser: UserProps = { ...usuario, ...updatedData };
      setUsuario(newUser);
      localStorage.setItem("userData", JSON.stringify(newUser));
    }
  };

  const value = { usuario, isAuthenticated, logout, updateUser, login };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook customizado (sem alterações)
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};