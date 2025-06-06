
import React, { useState } from 'react';

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
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 dark:bg-[#1B1B1F] p-4">
      <div className="w-full max-w-md p-8 bg-white dark:bg-[#2A2A2E] dark:border dark:border-[#3C3C43] rounded-2xl shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 mb-2">
            Planejamento Semanal
          </h1>
          <p className="text-gray-600 dark:text-[#9CA3AF]">Faça login para continuar</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label 
              htmlFor="username" 
              className="block text-sm font-medium text-gray-700 dark:text-[#E5E7EB] mb-1"
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
              className="w-full p-3 bg-slate-50 border border-gray-300 rounded-lg text-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none placeholder-gray-400 dark:bg-[#26262B] dark:border-[#3C3C43] dark:text-white dark:placeholder-[#9CA3AF] dark:focus:ring-indigo-500 dark:focus:border-indigo-500"
              placeholder="Digite seu usuário"
            />
          </div>

          <div>
            <label 
              htmlFor="password" 
              className="block text-sm font-medium text-gray-700 dark:text-[#E5E7EB] mb-1"
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
              className="w-full p-3 bg-slate-50 border border-gray-300 rounded-lg text-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none placeholder-gray-400 dark:bg-[#26262B] dark:border-[#3C3C43] dark:text-white dark:placeholder-[#9CA3AF] dark:focus:ring-indigo-500 dark:focus:border-indigo-500"
              placeholder="Digite sua senha"
            />
          </div>

          {loginError && (
            <div className="p-3 bg-red-50 border border-red-300 text-red-700 rounded-md text-sm dark:bg-red-800/30 dark:border-red-700/50 dark:text-red-400">
              {loginError}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-indigo-500 transition-opacity dark:focus:ring-offset-[#2A2A2E] dark:filter dark:brightness-110 dark:hover:brightness-125 ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:opacity-90'}`}
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </button>
          </div>
        </form>
      </div>
       <footer className="text-center text-xs text-slate-500 dark:text-[#9CA3AF] mt-12 py-4">
        Dados armazenados com <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline dark:text-indigo-400 dark:hover:underline">Supabase</a>.
      </footer>
    </div>
  );
};

export default LoginScreen;
