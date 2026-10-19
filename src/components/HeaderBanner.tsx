import React from 'react';
import {
  Sparkles,
  LayoutGrid,
  FolderTree,
  Sun,
  Moon
} from 'lucide-react';

interface HeaderBannerProps {
  tracksCount?: number;
  modulesCount?: number;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

export const HeaderBanner: React.FC<HeaderBannerProps> = ({
  tracksCount = 6,
  modulesCount = 19,
  theme = 'light',
  onToggleTheme,
}) => {
  const isLight = theme === 'light';

  return (
    <header className="w-full">
      {/* Top Main Menu Bar: Name, Numbers and Theme Toggle ONLY */}
      <div
        className={`w-full flex items-center justify-between gap-4 px-5 sm:px-7 py-3.5 sm:py-4 rounded-2xl transition-all duration-200 ${
          isLight
            ? 'bg-gradient-to-r from-[#d9ebfa] via-[#e5f1fc] to-[#d9ebfa] border-2 border-[#6fa4e6] shadow-lg shadow-sky-900/10'
            : 'bg-gradient-to-r from-[#0b2244] via-[#10305d] to-[#0d284f] border-2 border-[#1d4780] shadow-xl shadow-[#040e1d]/40'
        }`}
      >
        {/* Title & Hub Counters */}
        <div className="flex flex-wrap items-center gap-3.5 sm:gap-5 shrink-0">
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl border-2 flex items-center justify-center shrink-0 shadow-md ${
                isLight
                  ? 'bg-white border-sky-400 text-sky-600'
                  : 'bg-sky-500/20 border-sky-400/40 text-sky-400'
              }`}
            >
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1
                className={`text-base sm:text-xl font-black tracking-tight leading-tight flex items-center gap-2 ${
                  isLight ? 'text-[#071f3f]' : 'text-white'
                }`}
              >
                <span>Trilha de Estudos RACAN</span>
              </h1>
            </div>
          </div>

          {/* Integrated Numbers of Trilhas & Módulos with high contrast contour */}
          <div className={`flex items-center gap-2.5 pl-2 sm:pl-4 border-l-2 ${isLight ? 'border-sky-300' : 'border-sky-700/60'}`}>
            <div
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 text-xs font-semibold shadow-xs ${
                isLight
                  ? 'bg-white border-sky-400 text-sky-950 font-bold'
                  : 'bg-sky-950/80 border-sky-500/40 text-sky-200'
              }`}
              title="Total de Trilhas de Conhecimento ativas"
            >
              <LayoutGrid className={`w-3.5 h-3.5 ${isLight ? 'text-sky-600' : 'text-sky-400'}`} />
              <span className={`font-black text-sm font-mono ${isLight ? 'text-sky-950' : 'text-white'}`}>
                {tracksCount}
              </span>
              <span className={`text-[11px] uppercase tracking-wider font-extrabold ${isLight ? 'text-sky-800' : 'text-sky-300'}`}>
                Trilhas
              </span>
            </div>

            <div
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 text-xs font-semibold shadow-xs ${
                isLight
                  ? 'bg-white border-emerald-400 text-emerald-950 font-bold'
                  : 'bg-emerald-950/80 border-emerald-500/40 text-emerald-200'
              }`}
              title="Total de Módulos cadastrados nas trilhas"
            >
              <FolderTree className={`w-3.5 h-3.5 ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`} />
              <span className={`font-black text-sm font-mono ${isLight ? 'text-emerald-950' : 'text-white'}`}>
                {modulesCount}
              </span>
              <span className={`text-[11px] uppercase tracking-wider font-extrabold ${isLight ? 'text-emerald-800' : 'text-emerald-300'}`}>
                Módulos
              </span>
            </div>
          </div>
        </div>

        {/* Right side: SOMENTE o botão de tema Light/Dark com ícone, sem texto */}
        {onToggleTheme && (
          <button
            onClick={onToggleTheme}
            className={`p-2.5 rounded-xl flex items-center justify-center cursor-pointer shrink-0 transition-all border-2 shadow-sm ${
              isLight
                ? 'bg-white hover:bg-slate-50 border-amber-400 text-amber-500 hover:text-amber-600 hover:scale-105'
                : 'btn-3d-dark border-slate-600 text-sky-300 hover:text-white hover:scale-105'
            }`}
            title={isLight ? 'Mudar para Modo Escuro' : 'Mudar para Versão Clara'}
            aria-label={isLight ? 'Mudar para Modo Escuro' : 'Mudar para Versão Clara'}
          >
            {isLight ? (
              <Sun className="w-5 h-5 text-amber-500 shrink-0" />
            ) : (
              <Moon className="w-5 h-5 text-sky-300 shrink-0" />
            )}
          </button>
        )}
      </div>
    </header>
  );
};
