import React from 'react';
import { GoogleDriveLogo, GoogleGeminiLogo, NotebookLMLogo } from './Logos';
import {
  Sparkles,
  ExternalLink,
  Timer,
  LayoutGrid,
  FolderTree,
  Sun,
  Moon
} from 'lucide-react';

interface HeaderBannerProps {
  onOpenDatabaseModal?: () => void;
  googleDriveUrl: string;
  weeklyHoursLogged: number;
  targetHoursWeekly: number;
  onTogglePomodoro: () => void;
  isPomodoroOpen: boolean;
  onOpenGoogleDriveModal: () => void;
  tracksCount?: number;
  modulesCount?: number;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
  onOpenGeminiChat: () => void;
  onOpenNotebookGemini: () => void;
}

export const HeaderBanner: React.FC<HeaderBannerProps> = ({
  onOpenDatabaseModal: _onOpenDatabaseModal,
  googleDriveUrl: _googleDriveUrl,
  weeklyHoursLogged: _weeklyHoursLogged,
  targetHoursWeekly: _targetHoursWeekly,
  onTogglePomodoro,
  isPomodoroOpen,
  onOpenGoogleDriveModal,
  tracksCount = 6,
  modulesCount = 19,
  theme = 'light',
  onToggleTheme,
  onOpenGeminiChat,
  onOpenNotebookGemini,
}) => {
  const isLight = theme === 'light';

  return (
    <header className="w-full">
      {/* Expansive, Thicker Top Bar with Distinct Shade of Light Blue in Light Mode and Clear Outline Contour */}
      <div
        className={`w-full flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3.5 sm:gap-4 px-6 sm:px-7 py-4.5 sm:py-5 rounded-2xl transition-all duration-200 ${
          isLight
            ? 'bg-gradient-to-r from-[#d6e7fa] via-[#deecfb] to-[#d3e5f9] border-2 border-[#76a7e8] shadow-lg shadow-sky-900/10'
            : 'bg-gradient-to-r from-[#0b2244] via-[#10305d] to-[#0d284f] border-2 border-[#1d4780] shadow-xl shadow-[#040e1d]/40'
        }`}
      >
        {/* Title & Hub Counters */}
        <div className="flex flex-wrap items-center gap-3.5 sm:gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl border flex items-center justify-center shrink-0 shadow-md ${
                isLight
                  ? 'bg-white border-sky-400 text-sky-600'
                  : 'bg-sky-500/20 border-sky-400/40 text-sky-400'
              }`}
            >
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1
                className={`text-base sm:text-xl font-extrabold tracking-tight leading-tight flex items-center gap-2 ${
                  isLight ? 'text-[#092244]' : 'text-white'
                }`}
              >
                <span>Trilha de Estudos RACAN</span>
              </h1>
            </div>
          </div>

          {/* Integrated Numbers of Trilhas & Módulos with high contrast contour */}
          <div className={`flex items-center gap-2 pl-1 sm:pl-3 border-l ${isLight ? 'border-sky-300' : 'border-sky-700/50'}`}>
            <div
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold shadow-xs ${
                isLight
                  ? 'bg-white/95 border-sky-400/80 text-sky-900'
                  : 'bg-sky-950/80 border-sky-500/40 text-sky-200'
              }`}
              title="Total de Trilhas de Conhecimento ativas"
            >
              <LayoutGrid className={`w-3.5 h-3.5 ${isLight ? 'text-sky-600' : 'text-sky-400'}`} />
              <span className={`font-extrabold text-sm font-mono ${isLight ? 'text-sky-950' : 'text-white'}`}>
                {tracksCount}
              </span>
              <span className={`text-[11px] uppercase tracking-wider font-bold ${isLight ? 'text-sky-800' : 'text-sky-300'}`}>
                Trilhas
              </span>
            </div>

            <div
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold shadow-xs ${
                isLight
                  ? 'bg-white/95 border-emerald-400/80 text-emerald-900'
                  : 'bg-emerald-950/80 border-emerald-500/40 text-emerald-200'
              }`}
              title="Total de Módulos cadastrados nas trilhas"
            >
              <FolderTree className={`w-3.5 h-3.5 ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`} />
              <span className={`font-extrabold text-sm font-mono ${isLight ? 'text-emerald-950' : 'text-white'}`}>
                {modulesCount}
              </span>
              <span className={`text-[11px] uppercase tracking-wider font-bold ${isLight ? 'text-emerald-800' : 'text-emerald-300'}`}>
                Módulos
              </span>
            </div>
          </div>
        </div>

        {/* Shortcuts Buttons + Theme Toggle (Native Database button removed as requested) */}
        <div className="flex items-center gap-2 overflow-x-auto text-xs py-0.5 scrollbar-none">
          {/* Light / Dark Theme Toggle (Only symbol, text removed) */}
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              className={`p-2 rounded-lg flex items-center justify-center cursor-pointer shrink-0 transition border shadow-xs ${
                isLight
                  ? 'bg-white hover:bg-slate-50 border-amber-400 text-amber-500 hover:text-amber-600'
                  : 'btn-3d-dark border-slate-600 text-sky-300 hover:text-white'
              }`}
              title={isLight ? 'Mudar para Modo Escuro' : 'Mudar para Versão Clara'}
              aria-label={isLight ? 'Mudar para Modo Escuro' : 'Mudar para Versão Clara'}
            >
              {isLight ? (
                <Sun className="w-4 h-4 text-amber-500 shrink-0" />
              ) : (
                <Moon className="w-4 h-4 text-sky-300 shrink-0" />
              )}
            </button>
          )}

          {/* Google Drive button with official logo */}
          <button
            onClick={onOpenGoogleDriveModal}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-2 cursor-pointer shrink-0 transition border shadow-xs ${
              isLight
                ? 'bg-white hover:bg-slate-50 text-slate-800 border-sky-400/80'
                : 'btn-3d-dark text-slate-200 hover:text-white border-sky-500/30'
            }`}
            title="Abrir Central de Materiais e Arquivos do Google Drive"
          >
            <GoogleDriveLogo className="w-3.5 h-3.5 shrink-0" />
            <span>Google Drive</span>
            <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
          </button>

          {/* Google Gemini - Opens in-app Q&A and script box directly, with web link icon */}
          <div className="flex items-center shrink-0">
            <button
              onClick={onOpenGeminiChat}
              className={`px-3 py-1.5 rounded-l-lg font-semibold flex items-center gap-1.5 transition cursor-pointer border-y border-l shadow-xs ${
                isLight
                  ? 'bg-white hover:bg-sky-50 text-sky-950 border-sky-400/80 hover:border-sky-500'
                  : 'btn-3d-dark text-slate-100 hover:text-white border-sky-500/40'
              }`}
              title="Abrir Gemini AI: Perguntas, Respostas e Roteiros diretamente no programa"
            >
              <GoogleGeminiLogo className="w-3.5 h-3.5 shrink-0 text-sky-500" />
              <span>Gemini AI</span>
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
            </button>
            <a
              href="https://gemini.google.com"
              target="_blank"
              rel="noreferrer"
              className={`px-1.5 py-1.5 rounded-r-lg border transition ${
                isLight
                  ? 'bg-white hover:bg-slate-100 text-slate-500 hover:text-sky-600 border-y border-r border-sky-400/80'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border-y border-r border-sky-500/40'
              }`}
              title="Abrir gemini.google.com em nova aba"
            >
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Google NotebookLM / Gemini Notebook - Opens in-app Books & Script box directly */}
          <div className="flex items-center shrink-0">
            <button
              onClick={onOpenNotebookGemini}
              className={`px-3 py-1.5 rounded-l-lg font-semibold flex items-center gap-1.5 transition cursor-pointer border-y border-l shadow-xs ${
                isLight
                  ? 'bg-white hover:bg-purple-50 text-purple-950 border-purple-400/80 hover:border-purple-500'
                  : 'btn-3d-dark text-slate-100 hover:text-white border-purple-500/40'
              }`}
              title="Abrir Notebook Gemini: Vincular Livros, Fontes e Caixas de Scripts direto no programa"
            >
              <NotebookLMLogo className="w-3.5 h-3.5 shrink-0" />
              <span>Notebook Gemini</span>
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
            </button>
            <a
              href="https://notebooklm.google.com"
              target="_blank"
              rel="noreferrer"
              className={`px-1.5 py-1.5 rounded-r-lg border transition ${
                isLight
                  ? 'bg-white hover:bg-slate-100 text-slate-500 hover:text-purple-600 border-y border-r border-purple-400/80'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border-y border-r border-purple-500/40'
              }`}
              title="Abrir notebooklm.google.com oficial em nova aba"
            >
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Pomodoro Focus Clock */}
          <button
            onClick={onTogglePomodoro}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 cursor-pointer transition shrink-0 border shadow-xs ${
              isLight
                ? isPomodoroOpen
                  ? 'bg-amber-100 border-amber-500 text-amber-900 shadow-amber-200'
                  : 'bg-white hover:bg-slate-50 text-slate-800 border-sky-300'
                : isPomodoroOpen
                ? 'btn-3d-dark border-amber-400 text-amber-300 shadow-md shadow-amber-500/20'
                : 'btn-3d-dark text-slate-200 hover:text-white'
            }`}
            title="Ativar / Desativar Relógio de Foco Pomodoro na página"
          >
            <Timer className={`w-3.5 h-3.5 shrink-0 ${isPomodoroOpen ? 'text-amber-500 animate-spin-slow' : 'text-amber-500'}`} />
            <span>{isPomodoroOpen ? 'Pomodoro Ativo' : 'Pomodoro'}</span>
            <span className={`w-2 h-2 rounded-full ${isPomodoroOpen ? 'bg-amber-500 animate-pulse' : 'bg-slate-400'}`} />
          </button>
        </div>
      </div>
    </header>
  );
};
