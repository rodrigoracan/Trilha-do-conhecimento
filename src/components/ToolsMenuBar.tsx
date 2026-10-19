import React from 'react';
import {
  GoogleDriveLogo,
  GoogleGeminiLogo,
  NotebookLMLogo,
  GoogleClassroomLogo
} from './Logos';
import {
  ExternalLink,
  Award,
  Database,
  Sparkles
} from 'lucide-react';

interface ToolsMenuBarProps {
  onOpenGoogleDriveModal: () => void;
  onOpenGoogleClassroomModal: () => void;
  onOpenGeminiChat: () => void;
  onOpenNotebookGemini: () => void;
  onTogglePomodoro?: () => void;
  isPomodoroOpen?: boolean;
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
  onOpenSimuladosModal,
  onOpenDatabaseModal,
  theme = 'light',
}) => {
  const isLight = theme === 'light';

  return (
    <div
      className={`w-full px-3.5 py-2.5 rounded-2xl border-2 transition-all duration-200 ${
        isLight
          ? 'bg-gradient-to-r from-[#e2f7f1] via-[#e5f5fb] to-[#e4eefe] border-[#34d399] shadow-lg shadow-teal-900/10'
          : 'bg-gradient-to-r from-[#0d2825] via-[#0f312e] to-[#0d272d] border-[#10b981]/70 shadow-2xl shadow-black/60'
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        {/* Left Side: Prominent Category Indicator */}
        <div className="flex items-center gap-2 shrink-0 py-0.5 pr-2">
          <div
            className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border shadow-xs ${
              isLight
                ? 'bg-emerald-600 border-emerald-500 text-white'
                : 'bg-emerald-500/20 border-emerald-400/50 text-emerald-300'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className={`text-xs font-black tracking-tight block leading-none ${isLight ? 'text-emerald-950' : 'text-emerald-100'}`}>
              Ferramentas & Integrações
            </span>
            <span className={`text-[10px] font-semibold leading-none ${isLight ? 'text-emerald-800' : 'text-emerald-400/80'}`}>
              Acesso rápido e integrado
            </span>
          </div>
        </div>

        {/* Right Side: Compact, Unframed, Never-Cut-Off Tools Strip (Pomodoro removed) */}
        <div className="flex flex-wrap items-center gap-2 flex-1 justify-start sm:justify-end">
          {/* 1. Google Classroom */}
          <div
            className={`inline-flex items-center rounded-xl text-xs transition cursor-pointer border-2 shadow-sm group ${
              isLight
                ? 'bg-white hover:bg-emerald-50 text-slate-900 border-emerald-400 hover:border-emerald-600'
                : 'bg-[#091b22] hover:bg-[#0d2833] text-emerald-100 border-emerald-500/60 hover:border-emerald-400'
            }`}
            title="Google Classroom: Turmas, Atividades e Exercícios"
          >
            <button
              onClick={onOpenGoogleClassroomModal}
              className="px-3 py-1.5 font-extrabold flex items-center gap-1.5 cursor-pointer"
            >
              <GoogleClassroomLogo className="w-4 h-4 shrink-0" />
              <span>Classroom</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </button>
            <a
              href="https://classroom.google.com"
              target="_blank"
              rel="noreferrer"
              className={`p-1.5 pr-2.5 transition opacity-70 hover:opacity-100 ${
                isLight ? 'text-slate-500 hover:text-emerald-700' : 'text-emerald-400 hover:text-white'
              }`}
              title="Abrir classroom.google.com em nova aba"
            >
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* 2. Google Drive */}
          <button
            onClick={onOpenGoogleDriveModal}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition cursor-pointer border-2 shadow-sm group ${
              isLight
                ? 'bg-white hover:bg-sky-50 text-slate-900 border-sky-400 hover:border-sky-600'
                : 'bg-[#09172c] hover:bg-[#0d2342] text-sky-100 border-sky-500/60 hover:border-sky-400'
            }`}
            title="Abrir Central de Materiais e Arquivos do Google Drive"
          >
            <GoogleDriveLogo className="w-4 h-4 shrink-0" />
            <span>Drive</span>
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
          </button>

          {/* 3. Gemini AI */}
          <div
            className={`inline-flex items-center rounded-xl text-xs transition cursor-pointer border-2 shadow-sm group ${
              isLight
                ? 'bg-white hover:bg-blue-50 text-slate-900 border-blue-400 hover:border-blue-600'
                : 'bg-[#0b1b36] hover:bg-[#10274e] text-blue-100 border-blue-500/60 hover:border-blue-400'
            }`}
            title="Gemini AI: Dúvidas, Roteiros e Perguntas"
          >
            <button
              onClick={onOpenGeminiChat}
              className="px-3 py-1.5 font-extrabold flex items-center gap-1.5 cursor-pointer"
            >
              <GoogleGeminiLogo className="w-4 h-4 shrink-0 text-blue-500" />
              <span>Gemini AI</span>
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            </button>
            <a
              href="https://gemini.google.com"
              target="_blank"
              rel="noreferrer"
              className={`p-1.5 pr-2.5 transition opacity-70 hover:opacity-100 ${
                isLight ? 'text-slate-500 hover:text-blue-700' : 'text-blue-300 hover:text-white'
              }`}
              title="Abrir gemini.google.com em nova aba"
            >
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* 4. NotebookLM with Official Arch Logo */}
          <div
            className={`inline-flex items-center rounded-xl text-xs transition cursor-pointer border-2 shadow-sm group ${
              isLight
                ? 'bg-white hover:bg-purple-50 text-slate-900 border-purple-400 hover:border-purple-600'
                : 'bg-[#18102e] hover:bg-[#231742] text-purple-100 border-purple-500/60 hover:border-purple-400'
            }`}
            title="NotebookLM / Gemini Notebook: Caderno de Livros, Fontes e Scripts"
          >
            <button
              onClick={onOpenNotebookGemini}
              className="px-3 py-1.5 font-extrabold flex items-center gap-1.5 cursor-pointer"
            >
              <NotebookLMLogo className="w-4 h-4 shrink-0" />
              <span>NotebookLM</span>
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
            </button>
            <a
              href="https://notebooklm.google.com"
              target="_blank"
              rel="noreferrer"
              className={`p-1.5 pr-2.5 transition opacity-70 hover:opacity-100 ${
                isLight ? 'text-slate-500 hover:text-purple-700' : 'text-purple-300 hover:text-white'
              }`}
              title="Abrir notebooklm.google.com em nova aba"
            >
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* 5. Simulados */}
          {onOpenSimuladosModal && (
            <button
              onClick={onOpenSimuladosModal}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition cursor-pointer border-2 shadow-sm ${
                isLight
                  ? 'bg-white hover:bg-teal-50 text-slate-900 border-teal-400 hover:border-teal-600'
                  : 'bg-[#082020] hover:bg-[#0c2f2f] text-teal-100 border-teal-500/60 hover:border-teal-400'
              }`}
              title="Abrir Simulados e Questões de Certificação"
            >
              <Award className="w-4 h-4 text-teal-500 shrink-0" />
              <span>Simulados</span>
            </button>
          )}

          {/* 6. Backup & Database */}
          {onOpenDatabaseModal && (
            <button
              onClick={onOpenDatabaseModal}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition cursor-pointer border-2 shadow-sm ${
                isLight
                  ? 'bg-white hover:bg-indigo-50 text-slate-900 border-indigo-400 hover:border-indigo-600'
                  : 'bg-[#121330] hover:bg-[#1a1c44] text-indigo-100 border-indigo-500/60 hover:border-indigo-400'
              }`}
              title="Abrir Backup e Exportação do Banco de Dados"
            >
              <Database className="w-4 h-4 text-indigo-500 shrink-0" />
              <span>Backup</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
