// routers/MainRouters.tsx

import { useRoutes, Navigate } from "react-router-dom";
import { AuthContainer } from "../pages/telaLogin/AuthContainer";
import { TelaPrincipal } from "../pages/telaPrincipal/TelaPrincipal";

// Descomente os componentes que você irá usar
import DashboardComponent from "../components/dashboard/DashboardComponent";
import { PedidosComponent } from "../components/PedidosComponent";
import DataBaseComponent from "../components/DataBaseComponent";
import { CadastroComponent } from "../components/CadastroComponent";
import { ConfiguracaoComponent } from "../components/ConfiguraçãoComponent";
import EmployeeList from "../components/FuncionariosComponent";
import { GerenciamentoGeral } from "../components/GerenciamentoGeralComponent";

// Componente de proteção de rota
const ProtectedRoute = () => {
  const isAuthenticated = !!localStorage.getItem("userData"); // Checagem simples
  
  // Se estiver autenticado, renderiza a TelaPrincipal que contém o <Outlet />
  // Se não, redireciona para a página de login
  return isAuthenticated ? <TelaPrincipal /> : <Navigate to="/" replace />;
};

export const MainRouter = () => {
  const routes = useRoutes([
    // Rota de login (pública)
    { path: "/", element: <AuthContainer /> },

    // Rota de layout protegida. Todas as rotas aqui dentro exigem login.
    {
      path: "/app", // Usar "/app" ou "/painel" é uma convenção comum
      element: <ProtectedRoute />,
      children: [
        // Rota "index" é a padrão quando se acessa /app
        { index: true, element: <Navigate to="/app/dashboard" replace /> },
        
        { path: "dashboard", element: <DashboardComponent /> },
        { path: "pedidos", element: <PedidosComponent /> },
        { path: "usuarios", element: <DataBaseComponent /> },
        { path: "cadastrar", element: <CadastroComponent /> },
        { path: "perfil", element: <ConfiguracaoComponent /> },
        { path: "servidores", element: <EmployeeList /> }, 
        { path: "configuracoes", element: <GerenciamentoGeral /> },
      ],
    },

    // Rota para qualquer outro caminho não encontrado
    { path: "*", element: <Navigate to="/" replace /> },
  ]);

  return routes;
};