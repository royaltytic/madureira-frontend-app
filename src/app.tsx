// import { BrowserRouter } from 'react-router-dom';
// import { MainRouter } from './routers/MainRouters';
// import { Toaster } from 'react-hot-toast';
// // import { AuthProvider } from './context/AuthContext';

// function App() {
//   return (
//     <>
//       <BrowserRouter>
//         {/* <AuthProvider> */}
//           <MainRouter />
//         {/* </AuthProvider> */}
//       </BrowserRouter>
//       <Toaster
//         position="top-right"
//         toastOptions={{
//           duration: 5000,
//           style: { background: '#333', color: '#fff' },
//         }}
//       />
//     </>
//   );
// }

// export default App;

import { useState } from "react";

import Cadastro from "./components/Cadastro";
import { Alunos } from "./components/Alunos";
import { LoginPage } from "./components/Login";

const App = () => {
  const [page, setPage] = useState('cadastro');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Estado para o menu mobile

  const handleLogin = (success: boolean) => {
    if (success) {
      setIsLoggedIn(true);
      setPage('alunos');
    }
  };
  
  const handleLogout = () => {
    setIsLoggedIn(false);
    setPage('login');
    setIsMenuOpen(false); // Fecha o menu ao sair
  };

  const navigate = (targetPage: string) => {
    setPage(targetPage);
    setIsMenuOpen(false); // Fecha o menu ao navegar
  };

  const renderPage = () => {
    switch (page) {
      case 'cadastro':
        return <Cadastro />;
      case 'login':
        return <LoginPage onLogin={handleLogin} />;
      case 'alunos':
        return isLoggedIn ? <Alunos /> : <LoginPage onLogin={handleLogin} initialError="Você precisa fazer login para ver esta página." />;
      default:
        return <Cadastro />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans">
      <nav className="bg-white shadow-md relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex-shrink-0">
              <span className="font-bold text-xl text-indigo-600">Escolinha Madureira</span>
            </div>
            {/* Menu para Desktop */}
            <div className="hidden md:flex items-center space-x-4">
              <button onClick={() => navigate('cadastro')} className={`px-3 py-2 rounded-md text-sm font-medium ${page === 'cadastro' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-700 hover:bg-slate-100'}`}>
                Cadastro
              </button>
              {isLoggedIn ? (
                <>
                  <button onClick={() => navigate('alunos')} className={`px-3 py-2 rounded-md text-sm font-medium ${page === 'alunos' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-700 hover:bg-slate-100'}`}>
                    Alunos
                  </button>
                  <button onClick={handleLogout} className="px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-100">
                    Sair
                  </button>
                </>
              ) : (
                <button onClick={() => navigate('login')} className={`px-3 py-2 rounded-md text-sm font-medium ${page === 'login' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-700 hover:bg-slate-100'}`}>
                  Login
                </button>
              )}
            </div>
            {/* Botão do Menu Mobile */}
            <div className="md:hidden flex items-center">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="inline-flex items-center justify-center p-2 rounded-md text-slate-600 hover:bg-slate-100 focus:outline-none">
                <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                  {isMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>
        {/* Painel do Menu Mobile */}
        {isMenuOpen && (
          <div className="md:hidden bg-white shadow-lg absolute w-full z-10">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <button onClick={() => navigate('cadastro')} className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium ${page === 'cadastro' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-700 hover:bg-slate-100'}`}>
                Cadastro
              </button>
              {isLoggedIn ? (
                <>
                  <button onClick={() => navigate('alunos')} className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium ${page === 'alunos' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-700 hover:bg-slate-100'}`}>
                    Alunos
                  </button>
                  <button onClick={handleLogout} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-100">
                    Sair
                  </button>
                </>
              ) : (
                <button onClick={() => navigate('login')} className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium ${page === 'login' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-700 hover:bg-slate-100'}`}>
                  Login
                </button>
              )}
            </div>
          </div>
        )}
      </nav>
      <main>
        {renderPage()}
      </main>
    </div>
  );
};

export default App;
