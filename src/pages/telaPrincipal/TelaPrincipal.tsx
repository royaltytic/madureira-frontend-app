// src/pages/telaPrincipal/TelaPrincipal.tsx

import { useState } from 'react'; // Importe o useState
import { Outlet, Navigate } from 'react-router-dom';
import { Sidebar } from './SideBar'; // Importe o componente Sidebar
import { useAuth } from '../../context/AuthContext';

export const TelaPrincipal = () => {
  const { isAuthenticated } = useAuth();
  
  // 1. O ESTADO AGORA VIVE AQUI, NO COMPONENTE PAI.
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex h-screen bg-slate-100">
      {/* 2. PASSAMOS O ESTADO E A FUNÇÃO COMO PROPS PARA A SIDEBAR */}
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      {/* 3. APLICAMOS A MARGEM DINÂMICA AO CONTEÚDO PRINCIPAL */}
      <main 
        className={`flex-1 overflow-y-auto transition-all duration-300 ease-in-out ${isSidebarOpen ? 'pl-64' : 'pl-20'}`}
      >
        <div className="p-0">
          <Outlet />
        </div>
      </main>
    </div>
  );
};