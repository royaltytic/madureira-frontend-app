import { useRoutes, Navigate } from "react-router-dom";
import Cadastro from "../pages/CadastroPage";
import { AuthPage } from "../pages/AuthPage";
// import { DashboardPage } from "../pages/DashboardPage";
import { ProtectedRoute } from "./ProtectedRoute";
import { MainPage } from "../pages/MainPage";

// Componente de proteção de rota

export const MainRouter = () => {
  const routes = useRoutes([
    
    // Rota de login e formulario (pública)
    { path: "/formulario", element: <Cadastro /> },
    { path: "/login", element: <AuthPage/> },

    // --- Rotas Privadas ---
    {
      path: "/painel",
      element: (
        <ProtectedRoute>
          <MainPage/>
        </ProtectedRoute>
      ),
    },

    // Rota de layout protegida. Todas as rotas aqui dentro exigem login.
    // {
    //   path: "/app", // Usar "/app" ou "/painel" é uma convenção comum
    //   element: <ProtectedRoute />,
    //   children: [
    //     // Rota "index" é a padrão quando se acessa /app
    //     { index: true, element: <Navigate to="/app/dashboard" replace /> },
        
    //     // { path: "dashboard", element: <DashboardComponent /> },
    //     // { path: "pedidos", element: <PedidosComponent /> },
    //     // { path: "usuarios", element: <DataBaseComponent /> },
    //     // { path: "cadastrar", element: <CadastroComponent /> },
    //     // { path: "perfil", element: <ConfiguracaoComponent /> },
    //     // { path: "servidores", element: <EmployeeList /> }, 
    //     // { path: "configuracoes", element: <GerenciamentoGeral /> },
    //   ],
    // },

    // --- Redirecionamentos ---
    // Redireciona a rota raiz para o painel se logado, ou para o login se não.
    { path: "/", element: <Navigate to="/painel" /> }, 
    // Rota para qualquer outro caminho não encontrado
    { path: "*", element: <Navigate to="/" replace /> },
  ]);

  return routes;
};