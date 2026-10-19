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
      {/* Top Main Menu Bar: Distinct, High Contrast Header */}
      <div
        className={`w-full flex items-center justify-between gap-4 px-5 sm:px-7 py-3.5 sm:py-4 rounded-2xl transition-all duration-200 ${
          isLight
            ? 'bg-gradient-to-r from-white via-[#f2f7ff] to-white border-2 border-blue-500 shadow-xl shadow-blue-950/10'
            : 'bg-gradient-to-r from-[#111c3b] via-[#16254f] to-[#111c3b] border-2 border-blue-500/90 shadow-2xl shadow-black/70'
        }`}
      >
        {/* Title & Hub Counters */}
        <div className="flex flex-wrap items-center gap-3.5 sm:gap-5 shrink-0">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center shrink-0 shadow-md ${
                isLight
                  ? 'bg-blue-600 border-blue-400 text-white shadow-blue-500/30'
                  : 'bg-blue-500 border-blue-300 text-white shadow-blue-500/40'
              }`}
            >
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1
                className={`text-base sm:text-xl font-black tracking-tight leading-tight flex items-center gap-2 ${
                  isLight ? 'text-blue-950' : 'text-white'
                }`}
              >
                <span>Trilha de Estudos RACAN</span>
              </h1>
            </div>
          </div>

          {/* Integrated Numbers of Trilhas & Módulos with high contrast */}
          <div className={`flex items-center gap-2.5 pl-2 sm:pl-4 border-l-2 ${isLight ? 'border-blue-200' : 'border-blue-700/60'}`}>
            <div
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 text-xs font-semibold shadow-xs ${
                isLight
                  ? 'bg-white border-sky-400 text-sky-950 font-bold'
                  : 'bg-[#081830] border-sky-400 text-sky-200 font-bold'
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
                  ? 'bg-white border-emerald-500 text-emerald-950 font-bold'
                  : 'bg-[#062018] border-emerald-400 text-emerald-200 font-bold'
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

        {/* Right side: Light/Dark Theme Switcher */}
        {onToggleTheme && (
          <button
            onClick={onToggleTheme}
            className={`p-2.5 rounded-xl flex items-center justify-center cursor-pointer shrink-0 transition-all border-2 shadow-sm ${
              isLight
                ? 'bg-white hover:bg-amber-50 border-amber-500 text-amber-500 hover:text-amber-600 hover:scale-105'
                : 'bg-[#182344] hover:bg-[#202e5a] border-amber-400 text-amber-400 hover:scale-105 shadow-md shadow-amber-500/20'
            }`}
            title={isLight ? 'Mudar para Modo Escuro' : 'Mudar para Versão Clara'}
            aria-label={isLight ? 'Mudar para Modo Escuro' : 'Mudar para Versão Clara'}
          >
            {isLight ? (
              <Sun className="w-5 h-5 text-amber-500 shrink-0" />
            ) : (
              <Moon className="w-5 h-5 text-amber-300 shrink-0" />
            )}
          </button>
        )}
      </div>
    </header>
  );
};
