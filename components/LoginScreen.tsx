import React, { useState } from 'react';
import { ACCENT_COLOR_CLASS } from '../constants';

interface LoginScreenProps {
  onLogin: (username: string, password: string) => Promise<void>;
  loginError: string | null;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, loginError }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await onLogin(username, password);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 p-4 font-['Zain']">
      <div className="w-full max-w-md p-8 bg-neutral-800 rounded-xl shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-['Sigmar_One'] text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-rose-400 mb-2">
            Planejamento Semanal
          </h1>
          <p className="text-neutral-400">Faça login para continuar</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label 
              htmlFor="username" 
              className="block text-sm font-medium text-neutral-300 mb-1"
            >
              Usuário
            </label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 bg-neutral-700 border border-neutral-600 rounded-md text-neutral-100 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none placeholder-neutral-500"
              placeholder="Digite seu usuário"
            />
          </div>

          <div>
            <label 
              htmlFor="password" 
              className="block text-sm font-medium text-neutral-300 mb-1"
            >
              Senha
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 bg-neutral-700 border border-neutral-600 rounded-md text-neutral-100 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none placeholder-neutral-500"
              placeholder="Digite sua senha"
            />
          </div>

          {loginError && (
            <div className="p-3 bg-red-800 border border-red-700 text-red-200 rounded-md text-sm">
              {loginError}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${ACCENT_COLOR_CLASS} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-800 focus:ring-purple-500 transition-opacity ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:opacity-90'}`}
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </button>
          </div>
        </form>
      </div>
       <footer className="text-center text-sm text-neutral-600 mt-12 py-4">
        Dados armazenados com <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">Supabase</a>.
      </footer>
    </div>
  );
};

export default LoginScreen;
