import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { User } from '../types';

interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (token: string, newToken: string, user: User) => void;
    logout: () => void;
    updateUser: (updetedUserData: User) => void;
  }
  
  export const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
    children: ReactNode;
}
  
  export const AuthProvider = ({ children }: AuthProviderProps) => {

    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);

    // !! trasnforma um objeto em booleano

    const isAuthenticated = !!user;
    const [isLoading, setIsLoading] = useState(true);


  
    useEffect(() => {
      const storagedToken = localStorage.getItem('@app:token');
      const storagedUser = localStorage.getItem('@app:user');
    
      if (storagedToken && storagedUser) {
        try {
          // Tenta fazer o parse do usuário
          const userObject = JSON.parse(storagedUser);
    
          // Atualiza o estado APENAS se o parse for bem-sucedido
          setUser(userObject);
          setToken(storagedToken);
        } catch (error) {
          // Se o parse falhar, os dados no localStorage estão corrompidos.
          console.error("Falha ao parsear dados do usuário do localStorage:", error);
          // Opcional: limpe o storage corrompido para evitar erros futuros.
          localStorage.removeItem('@app:user');
          localStorage.removeItem('@app:token');
        }
      }
      
      setIsLoading(false);
    }, []);
  
    const login = (token: string, newToken: string, userData: User) => {
      localStorage.setItem('authToken', token);
      localStorage.setItem('@app:token', newToken);
      localStorage.setItem('@app:user', JSON.stringify(userData));

      
      setUser(userData);
      setToken(newToken);

      console.log('Login bem-sucedido:', { userData, newToken });
    };
  
    const logout = () => {
      localStorage.removeItem('authToken');
      localStorage.removeItem('@app:token');
      localStorage.removeItem('@app:user');


      setUser(null);
      setToken(null);
    };

    const updateUser = (updatedUserData: User) => {
      setUser(updatedUserData);
      localStorage.setItem('@app:user', JSON.stringify(updatedUserData));
      console.log('Contexto do usuário atualizado!');
  };

    if (isLoading) {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <h1>Carregando...</h1>
        </div>
      );
    }
  
    return (
      <AuthContext.Provider value={{ user, token, isAuthenticated, isLoading, login, logout, updateUser }}>
        {children}
      </AuthContext.Provider>
    );
  };
  
  // Hook customizado para facilitar o uso do contexto
  export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
      throw new Error('useAuth deve ser usado dentro de um AuthProvider');
    }
    return context;
  };
  