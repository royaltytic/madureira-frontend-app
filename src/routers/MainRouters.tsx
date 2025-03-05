import { useRoutes, Navigate } from "react-router-dom";
import { AuthContainer } from "../pages/telaLogin/AuthContainer";
import { TelaPrincipal } from "../pages/telaPrincipal/TelaPrincipal";

// Função para verificar se o usuário está autenticado
const isAuthenticated = () => {
  const userData = localStorage.getItem("userData");
  return userData ? true : false;
};

export const MainRouter = () => {
  const routes = useRoutes([
    // Rota de login, sem proteção
    { path: "/", element: <AuthContainer /> },

    // Rota principal com proteção
    {
      path: "/principal",
      element: isAuthenticated() ? <TelaPrincipal /> : <Navigate to="/" />, // Redireciona para login se não autenticado
    },

  ]);

  return routes;
};
