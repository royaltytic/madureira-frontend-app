import { BrowserRouter } from 'react-router-dom';
import { MainRouter } from './routers/MainRouters';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';

export function App() {
  return (
    <>
      <BrowserRouter>
        <AuthProvider>
          <MainRouter />
        </AuthProvider>
      </BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 5000,
          style: { background: '#333', color: '#fff' },
        }}
      />
    </>
  );
}