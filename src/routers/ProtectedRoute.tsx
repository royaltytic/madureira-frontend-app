import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
    const { isAuthenticated, isLoading } = useAuth();
  
    if (isLoading) {
      return <div className="flex justify-center items-center h-screen">Carregando...</div>;
    }
  
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }
  
    return children;
  };