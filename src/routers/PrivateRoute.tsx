import { Route, Navigate } from "react-router-dom";

interface PrivateRouteProps {
  element: React.ReactNode;
  path: string;
}

const PrivateRoute = ({ element, ...rest }: PrivateRouteProps) => {
  const userData = localStorage.getItem("userData");

  // Verifica se o usuário está autenticado
  if (!userData) {
    return <Navigate to="/login" />;
  }

  return <Route {...rest} element={element} />;
};

export default PrivateRoute;
