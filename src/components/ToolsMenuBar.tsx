import React from 'react';
import {
  GoogleDriveLogo,
  GoogleGeminiLogo,
  NotebookLMLogo,
  GoogleClassroomLogo
} from './Logos';
import {
  ExternalLink,
  Timer,
  Award,
  Database,
  Sparkles
} from 'lucide-react';

interface ToolsMenuBarProps {
  onOpenGoogleDriveModal: () => void;
  onOpenGoogleClassroomModal: () => void;
  onOpenGeminiChat: () => void;
  onOpenNotebookGemini: () => void;
  onTogglePomodoro: () => void;
  isPomodoroOpen: boolean;
  weeklyHoursLogged?: number;
  onOpenSimuladosModal?: () => void;
  onOpenDatabaseModal?: () => void;
  theme?: 'light' | 'dark';
}

export const ToolsMenuBar: React.FC<ToolsMenuBarProps> = ({
  onOpenGoogleDriveModal,
  onOpenGoogleClassroomModal,
  onOpenGeminiChat,
  onOpenNotebookGemini,
  onTogglePomodoro,
  isPomodoroOpen,
  weeklyHoursLogged = 0,
  onOpenSimuladosModal,
  onOpenDatabaseModal,
  theme = 'light',
}) => {
  const isLight = theme === 'light';

  return (
    <div
      className={`w-full px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl transition-all duration-200 ${
        isLight
          ? 'bg-gradient-to-r from-sky-100/60 via-sky-50/50 to-blue-100/60 border border-sky-300/70 shadow-xs'
          : 'bg-gradient-to-r from-[#091629] via-[#0b1c34] to-[#091629] border border-sky-900/40 shadow-xs'
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-1.5 sm:gap-2">
        {/* Left Side: Compact Category Indicator */}
        <div className="flex items-center gap-1.5 shrink-0 py-0.5 pr-1">
          <div
            className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${
              isLight
                ? 'bg-white text-sky-700 shadow-2xs border border-sky-200'
                : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
            }`}
          >
            <Sparkles className="w-3 h-3" />
          </div>
          <span className={`text-xs font-black tracking-tight ${isLight ? 'text-sky-950' : 'text-white'}`}>
            Ferramentas & Integrações
          </span>
        </div>

        {/* Right Side: Compact, Frameless, Flexible Tools Strip - Never cut off */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 flex-1 justify-start sm:justify-end">
          {/* 1. Google Classroom */}
          <div
            className={`inline-flex items-center rounded-lg text-xs transition cursor-pointer border shadow-2xs group ${
              isLight
                ? 'bg-white hover:bg-emerald-50 text-slate-800 border-emerald-300 hover:border-emerald-400'
                : 'bg-[#09172c] hover:bg-[#0d2342] text-slate-100 border-emerald-500/40 hover:border-emerald-400'
            }`}
            title="Google Classroom: Turmas, Atividades e Exercícios"
          >
            <button
              onClick={onOpenGoogleClassroomModal}
              className="px-2.5 py-1.5 font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <GoogleClassroomLogo className="w-4 h-4 shrink-0" />
              <span className="font-extrabold">Classroom</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </button>
            <a
              href="https://classroom.google.com"
              target="_blank"
              rel="noreferrer"
              className={`p-1.5 pr-2 transition opacity-70 hover:opacity-100 ${
                isLight ? 'text-slate-500 hover:text-emerald-700' : 'text-slate-400 hover:text-white'
              }`}
              title="Abrir classroom.google.com em nova aba"
            >
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* 2. Google Drive */}
          <button
            onClick={onOpenGoogleDriveModal}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer border shadow-2xs group ${
              isLight
                ? 'bg-white hover:bg-sky-50 text-slate-800 border-sky-300 hover:border-sky-400'
                : 'bg-[#09172c] hover:bg-[#0d2342] text-slate-100 border-sky-500/40 hover:border-sky-400'
            }`}
            title="Abrir Central de Materiais e Arquivos do Google Drive"
          >
            <GoogleDriveLogo className="w-4 h-4 shrink-0" />
            <span className="font-extrabold">Drive</span>
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
          </button>

          {/* 3. Gemini AI */}
          <div
            className={`inline-flex items-center rounded-lg text-xs transition cursor-pointer border shadow-2xs group ${
              isLight
                ? 'bg-white hover:bg-blue-50 text-slate-800 border-blue-300 hover:border-blue-400'
                : 'bg-[#09172c] hover:bg-[#0d2342] text-slate-100 border-blue-500/40 hover:border-blue-400'
            }`}
            title="Gemini AI: Dúvidas, Roteiros e Perguntas"
          >
            <button
              onClick={onOpenGeminiChat}
              className="px-2.5 py-1.5 font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <GoogleGeminiLogo className="w-4 h-4 shrink-0 text-sky-500" />
              <span className="font-extrabold">Gemini AI</span>
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            </button>
            <a
              href="https://gemini.google.com"
              target="_blank"
              rel="noreferrer"
              className={`p-1.5 pr-2 transition opacity-70 hover:opacity-100 ${
                isLight ? 'text-slate-500 hover:text-blue-700' : 'text-slate-400 hover:text-white'
              }`}
              title="Abrir gemini.google.com em nova aba"
            >
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* 4. NotebookLM with Official Logo */}
          <div
            className={`inline-flex items-center rounded-lg text-xs transition cursor-pointer border shadow-2xs group ${
              isLight
                ? 'bg-white hover:bg-purple-50 text-slate-800 border-purple-300 hover:border-purple-400'
                : 'bg-[#09172c] hover:bg-[#0d2342] text-slate-100 border-purple-500/40 hover:border-purple-400'
            }`}
            title="NotebookLM: Caderno de Livros, Fontes e Scripts"
          >
            <button
              onClick={onOpenNotebookGemini}
              className="px-2.5 py-1.5 font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <NotebookLMLogo className="w-4 h-4 shrink-0" />
              <span className="font-extrabold">NotebookLM</span>
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
            </button>
            <a
              href="https://notebooklm.google.com"
              target="_blank"
              rel="noreferrer"
              className={`p-1.5 pr-2 transition opacity-70 hover:opacity-100 ${
                isLight ? 'text-slate-500 hover:text-purple-700' : 'text-slate-400 hover:text-white'
              }`}
              title="Abrir notebooklm.google.com em nova aba"
            >
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* 5. Pomodoro Focus Clock */}
          <button
            onClick={onTogglePomodoro}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer border shadow-2xs ${
              isPomodoroOpen
                ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-sm font-black'
                : isLight
                ? 'bg-white hover:bg-amber-50 text-slate-800 border-amber-300 hover:border-amber-400'
                : 'bg-[#09172c] hover:bg-[#0d2342] text-slate-100 border-amber-500/40 hover:border-amber-400'
            }`}
            title="Ativar / Desativar Relógio Pomodoro de Foco"
          >
            <Timer className={`w-4 h-4 shrink-0 ${isPomodoroOpen ? 'text-slate-950 animate-spin-slow' : 'text-amber-500'}`} />
            <span className="font-extrabold">Pomodoro</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold leading-none ${
                isPomodoroOpen
                  ? 'bg-slate-950 text-amber-300'
                  : isLight
                  ? 'bg-amber-100 text-amber-900 border border-amber-200'
                  : 'bg-amber-950/60 text-amber-300 border border-amber-800/40'
              }`}
            >
              {isPomodoroOpen ? 'Ativo' : `${weeklyHoursLogged}h`}
            </span>
          </button>

          {/* 6. Simulados */}
          {onOpenSimuladosModal && (
            <button
              onClick={onOpenSimuladosModal}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer border shadow-2xs ${
                isLight
                  ? 'bg-white hover:bg-teal-50 text-slate-800 border-teal-300 hover:border-teal-400'
                  : 'bg-[#09172c] hover:bg-[#0d2342] text-slate-100 border-teal-500/40 hover:border-teal-400'
              }`}
              title="Abrir Simulados e Questões de Certificação"
            >
              <Award className="w-4 h-4 text-teal-500 shrink-0" />
              <span className="font-extrabold">Simulados</span>
            </button>
          )}

          {/* 7. Backup & Database */}
          {onOpenDatabaseModal && (
            <button
              onClick={onOpenDatabaseModal}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer border shadow-2xs ${
                isLight
                  ? 'bg-white hover:bg-indigo-50 text-slate-800 border-indigo-300 hover:border-indigo-400'
                  : 'bg-[#09172c] hover:bg-[#0d2342] text-slate-100 border-indigo-500/40 hover:border-indigo-400'
              }`}
              title="Abrir Backup e Exportação do Banco de Dados"
            >
              <Database className="w-4 h-4 text-indigo-500 shrink-0" />
              <span className="font-extrabold">Backup</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
