import React from 'react';
import {
  Sparkles,
  LayoutGrid,
  FolderTree,
  Sun,
  Moon,
  LogOut,
  User as UserIcon,
  Loader2
} from 'lucide-react';
import { User } from 'firebase/auth';
import { GoogleGLogo } from './Logos';

interface HeaderBannerProps {
  tracksCount?: number;
  modulesCount?: number;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
  onGoHome?: () => void;
  user?: User | null;
  onLogin?: () => void;
  onLogout?: () => void;
  isLoggingIn?: boolean;
}

export const HeaderBanner: React.FC<HeaderBannerProps> = ({
  tracksCount = 6,
  modulesCount = 19,
  theme = 'light',
  onToggleTheme,
  onGoHome,
  user,
  onLogin,
  onLogout,
  isLoggingIn = false,
}) => {
  const isLight = theme === 'light';

  return (
    <header className="w-full">
      {/* Top Main Menu Bar: Distinct, High Contrast Header */}
      <div
        className={`w-full flex flex-wrap items-center justify-between gap-3 px-4 sm:px-7 py-3 sm:py-3.5 rounded-2xl transition-all duration-200 ${
          isLight
            ? 'bg-gradient-to-r from-[#d5e5f8] via-[#e2effc] to-[#d5e5f8] border-2 border-blue-400 shadow-md shadow-blue-900/10'
            : 'bg-gradient-to-r from-[#112242] via-[#162d54] to-[#112242] border-2 border-blue-400/80 shadow-2xl shadow-black/70'
        }`}
      >
        {/* Title & Hub Counters */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 shrink-0">
          <button
            onClick={onGoHome}
            className="flex items-center gap-2.5 sm:gap-3 text-left cursor-pointer group focus:outline-none"
            title="Ir para a página inicial das Trilhas RACAN"
          >
            <div
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl border-2 flex items-center justify-center shrink-0 shadow-md transition group-hover:scale-105 ${
                isLight
                  ? 'bg-blue-600 border-blue-400 text-white shadow-blue-500/30'
                  : 'bg-blue-500 border-blue-300 text-white shadow-blue-500/40'
              }`}
            >
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1
                className={`text-sm sm:text-lg font-black tracking-tight leading-tight flex items-center gap-2 transition group-hover:text-blue-600 dark:group-hover:text-blue-400 ${
                  isLight ? 'text-blue-950' : 'text-white'
                }`}
              >
                <span>Trilha de Estudos RACAN</span>
              </h1>
            </div>
          </button>

          {/* Integrated Numbers of Trilhas & Módulos with high contrast */}
          <div className={`flex items-center gap-2 pl-2 sm:pl-3 border-l-2 ${isLight ? 'border-blue-200' : 'border-blue-700/60'}`}>
            <div
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border-2 text-xs font-semibold shadow-xs ${
                isLight
                  ? 'bg-white border-sky-400 text-sky-950 font-bold'
                  : 'bg-[#081830] border-sky-400 text-sky-200 font-bold'
              }`}
              title="Total de Trilhas de Conhecimento ativas"
            >
              <LayoutGrid className={`w-3.5 h-3.5 ${isLight ? 'text-sky-600' : 'text-sky-400'}`} />
              <span className={`font-black text-xs sm:text-sm font-mono ${isLight ? 'text-sky-950' : 'text-white'}`}>
                {tracksCount}
              </span>
              <span className={`text-[10px] sm:text-[11px] uppercase tracking-wider font-extrabold ${isLight ? 'text-sky-800' : 'text-sky-300'}`}>
                Trilhas
              </span>
            </div>

            <div
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border-2 text-xs font-semibold shadow-xs ${
                isLight
                  ? 'bg-white border-emerald-500 text-emerald-950 font-bold'
                  : 'bg-[#062018] border-emerald-400 text-emerald-200 font-bold'
              }`}
              title="Total de Módulos cadastrados nas trilhas"
            >
              <FolderTree className={`w-3.5 h-3.5 ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`} />
              <span className={`font-black text-xs sm:text-sm font-mono ${isLight ? 'text-emerald-950' : 'text-white'}`}>
                {modulesCount}
              </span>
              <span className={`text-[10px] sm:text-[11px] uppercase tracking-wider font-extrabold ${isLight ? 'text-emerald-800' : 'text-emerald-300'}`}>
                Módulos
              </span>
            </div>
          </div>
        </div>

        {/* Right side: Google Account Login & Light/Dark Theme Switcher */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-auto">
          {/* Google Auth Button or User Badge */}
          {user ? (
            <div
              className={`flex items-center gap-2 px-2.5 py-1 rounded-xl border transition-all ${
                isLight
                  ? 'bg-white/95 border-emerald-400 text-slate-800 shadow-xs'
                  : 'bg-[#0b1c36] border-emerald-500/70 text-slate-100 shadow-md'
              }`}
            >
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'Avatar'}
                  className="w-6 h-6 rounded-full border border-emerald-400 object-cover"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px]">
                  {(user.displayName || user.email || 'U')[0].toUpperCase()}
                </div>
              )}
              <div className="flex flex-col text-left max-w-[120px] sm:max-w-[180px]">
                <span className="text-xs font-bold leading-tight truncate">
                  {user.displayName || user.email?.split('@')[0] || 'Conectado'}
                </span>
                <span className="text-[9px] text-emerald-500 font-mono font-medium leading-none">
                  Sincronizado
                </span>
              </div>
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="p-1 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition cursor-pointer ml-1"
                  title="Sair da conta Google"
                  aria-label="Sair da conta Google"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ) : (
            onLogin && (
              <button
                onClick={onLogin}
                disabled={isLoggingIn}
                className={`flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer border ${
                  isLight
                    ? 'bg-white hover:bg-slate-50 text-slate-800 border-blue-400 shadow-blue-500/10 hover:border-blue-500'
                    : 'bg-blue-600 hover:bg-blue-500 text-white border-blue-400 shadow-blue-900/40'
                }`}
                title="Entrar com a sua conta Google para sincronizar suas anotações e progresso entre computadores"
              >
                {isLoggingIn ? (
                  <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                ) : (
                  <GoogleGLogo className="w-4 h-4 shrink-0" />
                )}
                <span className="font-extrabold whitespace-nowrap">
                  {isLoggingIn ? 'Conectando...' : 'Entrar com o Google'}
                </span>
              </button>
            )
          )}

          {/* Theme Switcher Button */}
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              className={`p-2 rounded-xl flex items-center justify-center cursor-pointer shrink-0 transition-all border-2 shadow-sm ${
                isLight
                  ? 'bg-white hover:bg-amber-50 border-amber-500 text-amber-500 hover:text-amber-600 hover:scale-105'
                  : 'bg-[#182344] hover:bg-[#202e5a] border-amber-400 text-amber-400 hover:scale-105 shadow-md shadow-amber-500/20'
              }`}
              title={isLight ? 'Mudar para Modo Escuro' : 'Mudar para Versão Clara'}
              aria-label={isLight ? 'Mudar para Modo Escuro' : 'Mudar para Versão Clara'}
            >
              {isLight ? (
                <Sun className="w-4 h-4 text-amber-500 shrink-0" />
              ) : (
                <Moon className="w-4 h-4 text-amber-300 shrink-0" />
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
