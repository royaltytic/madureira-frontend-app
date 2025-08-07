import { useState, FormEvent } from "react";

export const LoginPage = ({ onLogin, initialError }: { onLogin: (success: boolean) => void; initialError?: string }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(initialError || '');
  
    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (username === 'usuario' && password === '123') {
        onLogin(true);
      } else {
        setError('Usuário ou senha inválidos.');
        onLogin(false);
      }
    };
  
    return (
      <div className="flex items-center justify-center bg-slate-100" style={{ height: 'calc(100vh - 64px)'}}>
        <div className="w-full max-w-sm p-8 space-y-6 bg-white rounded-2xl shadow-lg">
          <h1 className="text-2xl font-bold text-center text-slate-800">Login</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-slate-600">Usuário</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 mt-1 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                required
              />
            </div>
            <div>
              <label htmlFor="password"  className="block text-sm font-medium text-slate-600">Senha</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 mt-1 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                required
              />
            </div>
            {error && <p className="text-sm text-center text-red-600">{error}</p>}
            <button type="submit" className="w-full px-8 py-3 font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
              Entrar
            </button>
          </form>
        </div>
      </div>
    );
  };