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
  Sparkles,
  Scale
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
  onOpenMcpModal?: () => void;
  theme?: 'light' | 'dark';
}

export const ToolsMenuBar: React.FC<ToolsMenuBarProps> = ({
  onOpenGoogleDriveModal,
  onOpenGoogleClassroomModal,
  onOpenGeminiChat,
  onOpenNotebookGemini,
  onOpenSimuladosModal,
  onOpenDatabaseModal,
  onOpenMcpModal,
  theme = 'light',
}) => {
  const isLight = theme === 'light';

  return (
    <div
      className={`w-full px-3 py-2 rounded-2xl transition-all duration-200 ${
        isLight
          ? 'bg-[#dce9f8] shadow-xs border border-blue-300/80'
          : 'bg-[#122444]/95 shadow-md border border-blue-500/30'
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        {/* Left Side: Category Indicator (Borderless) */}
        <div className="flex items-center gap-2 shrink-0 py-0.5 pr-2">
          <div
            className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
              isLight
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-emerald-500/20 text-emerald-300'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className={`text-xs font-black tracking-tight block leading-none ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Ferramentas & Integrações
            </span>
          </div>
        </div>

        {/* Right Side: Sleek Borderless Website Menu Buttons */}
        <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 flex-1 justify-start sm:justify-end">
          {/* 1. Google Classroom */}
          <div
            className={`inline-flex items-center rounded-xl text-xs transition cursor-pointer group ${
              isLight
                ? 'hover:bg-emerald-50 text-slate-700 hover:text-emerald-800'
                : 'hover:bg-emerald-950/50 text-slate-200 hover:text-emerald-300'
            }`}
            title="Google Classroom: Turmas, Atividades e Exercícios"
          >
            <button
              onClick={onOpenGoogleClassroomModal}
              className="px-2.5 py-1.5 font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <GoogleClassroomLogo className="w-4 h-4 shrink-0" />
              <span>Classroom</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </button>
            <a
              href="https://classroom.google.com"
              target="_blank"
              rel="noreferrer"
              className={`p-1.5 pr-2 transition opacity-60 hover:opacity-100 ${
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
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer group ${
              isLight
                ? 'hover:bg-sky-50 text-slate-700 hover:text-sky-800'
                : 'hover:bg-sky-950/50 text-slate-200 hover:text-sky-300'
            }`}
            title="Abrir Central de Materiais e Arquivos do Google Drive"
          >
            <GoogleDriveLogo className="w-4 h-4 shrink-0" />
            <span>Drive</span>
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
          </button>

          {/* 3. Gemini AI */}
          <div
            className={`inline-flex items-center rounded-xl text-xs transition cursor-pointer group ${
              isLight
                ? 'hover:bg-blue-50 text-slate-700 hover:text-blue-800'
                : 'hover:bg-blue-950/50 text-slate-200 hover:text-blue-300'
            }`}
            title="Gemini AI: Dúvidas, Roteiros e Perguntas"
          >
            <button
              onClick={onOpenGeminiChat}
              className="px-2.5 py-1.5 font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <GoogleGeminiLogo className="w-4 h-4 shrink-0 text-blue-500" />
              <span>Gemini AI</span>
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            </button>
            <a
              href="https://gemini.google.com"
              target="_blank"
              rel="noreferrer"
              className={`p-1.5 pr-2 transition opacity-60 hover:opacity-100 ${
                isLight ? 'text-slate-500 hover:text-blue-700' : 'text-slate-400 hover:text-white'
              }`}
              title="Abrir gemini.google.com em nova aba"
            >
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* 4. NotebookLM with Official Arch Logo */}
          <div
            className={`inline-flex items-center rounded-xl text-xs transition cursor-pointer group ${
              isLight
                ? 'hover:bg-purple-50 text-slate-700 hover:text-purple-800'
                : 'hover:bg-purple-950/50 text-slate-200 hover:text-purple-300'
            }`}
            title="NotebookLM / Gemini Notebook: Caderno de Livros, Fontes e Scripts"
          >
            <button
              onClick={onOpenNotebookGemini}
              className="px-2.5 py-1.5 font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <NotebookLMLogo className="w-4 h-4 shrink-0" />
              <span>NotebookLM</span>
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
            </button>
            <a
              href="https://notebooklm.google.com"
              target="_blank"
              rel="noreferrer"
              className={`p-1.5 pr-2 transition opacity-60 hover:opacity-100 ${
                isLight ? 'text-slate-500 hover:text-purple-700' : 'text-slate-400 hover:text-white'
              }`}
              title="Abrir notebooklm.google.com em nova aba"
            >
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* 5. Legislações & MCP */}
          {onOpenMcpModal && (
            <button
              onClick={onOpenMcpModal}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                isLight
                  ? 'hover:bg-amber-50 text-slate-700 hover:text-amber-800'
                  : 'hover:bg-amber-950/50 text-slate-200 hover:text-amber-300'
              }`}
              title="Portais Oficiais de Legislação e Conexões Model Context Protocol (MCP)"
            >
              <Scale className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Legislações & MCP</span>
              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                0 Tokens
              </span>
            </button>
          )}

          {/* 5. Simulados */}
          {onOpenSimuladosModal && (
            <button
              onClick={onOpenSimuladosModal}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                isLight
                  ? 'hover:bg-teal-50 text-slate-700 hover:text-teal-800'
                  : 'hover:bg-teal-950/50 text-slate-200 hover:text-teal-300'
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
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                isLight
                  ? 'hover:bg-indigo-50 text-slate-700 hover:text-indigo-800'
                  : 'hover:bg-indigo-950/50 text-slate-200 hover:text-indigo-300'
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
