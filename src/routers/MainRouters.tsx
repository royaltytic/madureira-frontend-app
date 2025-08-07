// routers/MainRouters.tsx

import { useRoutes, Navigate } from "react-router-dom";
import Cadastro from "../components/Cadastro";
import { Alunos } from "../components/Alunos";

// Componente de proteção de rota

export const MainRouter = () => {
  const routes = useRoutes([
    // Rota de login (pública)
    { path: "/", element: <Cadastro /> },
    { path: "/", element: <Alunos /> },

    // // Rota de layout protegida. Todas as rotas aqui dentro exigem login.
    // {
    //   path: "/app", // Usar "/app" ou "/painel" é uma convenção comum
    //   element: <ProtectedRoute />,
    //   children: [
    //     // Rota "index" é a padrão quando se acessa /app
    //     { index: true, element: <Navigate to="/app/dashboard" replace /> },
        
    //     { path: "dashboard", element: <DashboardComponent /> },
    //     { path: "pedidos", element: <PedidosComponent /> },
    //     { path: "usuarios", element: <DataBaseComponent /> },
    //     { path: "cadastrar", element: <CadastroComponent /> },
    //     { path: "perfil", element: <ConfiguracaoComponent /> },
    //     { path: "servidores", element: <EmployeeList /> }, 
    //     { path: "configuracoes", element: <GerenciamentoGeral /> },
    //   ],
    // },

    // Rota para qualquer outro caminho não encontrado
    { path: "*", element: <Navigate to="/" replace /> },
  ]);

  return routes;
};