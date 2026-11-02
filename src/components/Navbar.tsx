import React, { useState } from 'react';
import {
  Award,
  Calendar,
  Timer,
  Brain,
  FileText,
  CheckSquare,
  Compass,
  ChevronDown,
  Pin,
  PinOff,
  ArrowLeft,
  LayoutDashboard,
} from 'lucide-react';

export type ActiveTab = 'tracks' | 'dashboard' | 'planner' | 'certs' | 'pomodoro' | 'techniques' | 'notes' | 'reminders';

interface NavbarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  pendingRemindersCount: number;
  notesCount: number;
  plannedTasksCount?: number;
  theme?: 'light' | 'dark';
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  pendingRemindersCount,
  notesCount,
  plannedTasksCount = 0,
  theme = 'light',
}) => {
  const isLight = theme === 'light';
  const [isHovered, setIsHovered] = useState(false);
  const [isPinned, setIsPinned] = useState(false);

  const isOpen = isPinned || isHovered;

  // Notice: 'tracks' (Trilhas RACAN) is accessible via home/back buttons
  const navItems = [
    {
      id: 'dashboard' as ActiveTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
      desc: 'Horas, Tendências & Marcos',
    },
    {
      id: 'planner' as ActiveTab,
      label: 'Planejamento de Estudos',
      icon: Calendar,
      badge: plannedTasksCount > 0 ? String(plannedTasksCount) : null,
      desc: 'Calendário & Metas Diárias',
    },
    {
      id: 'certs' as ActiveTab,
      label: 'Certificações de TI',
      icon: Award,
      badge: null,
      desc: 'Módulos, Horas & D3',
    },
    {
      id: 'pomodoro' as ActiveTab,
      label: 'Pomodoro',
      icon: Timer,
      badge: null,
      desc: 'Temporizador & Foco',
    },
    {
      id: 'techniques' as ActiveTab,
      label: 'Técnicas',
      icon: Brain,
      badge: null,
      desc: 'Métodos de Aprendizado',
    },
    {
      id: 'notes' as ActiveTab,
      label: 'Notas',
      icon: FileText,
      badge: notesCount > 0 ? String(notesCount) : null,
      desc: 'Caderno de Anotações',
    },
    {
      id: 'reminders' as ActiveTab,
      label: 'Ações',
      icon: CheckSquare,
      badge: pendingRemindersCount > 0 ? String(pendingRemindersCount) : null,
      desc: 'Checklist & Pendências',
    },
  ];

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative z-20 transition-all duration-300"
    >
      {/* Collapsed Strip / Responsive Trigger */}
      <div
        className={`w-full rounded-2xl transition-all duration-200 select-none ${
          isLight
            ? 'bg-[#dce9f8] backdrop-blur-md shadow-xs hover:bg-[#d5e5f8] text-slate-800 border border-blue-300/80'
            : 'bg-[#122444]/95 backdrop-blur-md shadow-md hover:bg-[#152a50] text-slate-200 border border-blue-500/30'
        } ${isOpen ? 'rounded-b-none' : ''}`}
      >
        <div className="flex items-center justify-between px-3.5 py-2 text-xs">
          {/* Left: Compass / Menu Recursos & Active Section Indicator */}
          <div className="flex items-center gap-2.5">
            <div
              className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                isLight ? 'bg-indigo-100 text-indigo-700' : 'bg-indigo-500/20 text-indigo-300'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
            </div>

            <div className="flex items-center gap-2">
              <span className={`font-bold text-xs sm:text-sm tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Menu Recursos
              </span>

              {/* Active Tab indicator badge only shown when inside a specific section */}
              {activeTab !== 'tracks' && (
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-md font-semibold transition ${
                    isLight
                      ? 'bg-indigo-100 text-indigo-800'
                      : 'bg-indigo-950/70 text-indigo-300'
                  }`}
                >
                  {navItems.find((n) => n.id === activeTab)?.label}
                </span>
              )}

              {/* Quick back to tracks if on another tab */}
              {activeTab !== 'tracks' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectTab('tracks');
                  }}
                  className={`hidden sm:inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md transition cursor-pointer ${
                    isLight
                      ? 'bg-slate-100 hover:bg-purple-100 text-purple-800 hover:text-purple-900'
                      : 'bg-slate-800 hover:bg-purple-950 text-purple-300 hover:text-white'
                  }`}
                  title="Voltar para a tela inicial"
                >
                  <ArrowLeft className="w-3 h-3" />
                  <span>Voltar</span>
                </button>
              )}
            </div>
          </div>

          {/* Right: Toggle + Pin */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPinned((prev) => !prev)}
              className={`p-1 rounded-lg transition cursor-pointer text-xs flex items-center gap-1 ${
                isPinned
                  ? isLight
                    ? 'bg-indigo-100 text-indigo-800'
                    : 'bg-indigo-900/60 text-indigo-200'
                  : isLight
                  ? 'hover:bg-slate-100 text-slate-500 hover:text-slate-800'
                  : 'hover:bg-slate-800 text-slate-400 hover:text-white'
              }`}
              title={isPinned ? 'Desafixar menu (fechar automático)' : 'Fixar menu aberto'}
            >
              {isPinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
              <span className="hidden md:inline text-[10px] font-bold">
                {isPinned ? 'Fixado' : 'Fixar'}
              </span>
            </button>

            <button
              onClick={() => setIsHovered((prev) => !prev)}
              className="p-1 rounded-lg cursor-pointer hover:opacity-80 transition"
              title="Abrir/Fechar Menu Recursos"
            >
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${
                  isOpen ? 'rotate-180 text-indigo-600 dark:text-indigo-400' : 'text-slate-400'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Menu: Revealed on Hover or when Pinned */}
      {isOpen && (
        <div
          className={`w-full p-2.5 rounded-b-2xl shadow-xl transition-all duration-200 animate-fadeIn ${
            isLight
              ? 'bg-[#dce9f8]/98 backdrop-blur-md shadow-slate-300/60 border-x border-b border-blue-300/80'
              : 'bg-[#122444]/98 backdrop-blur-md shadow-2xl border-x border-b border-blue-500/30'
          }`}
        >
          <div className="flex flex-wrap items-center gap-1.5">
            {/* Quick return button if user is currently inside another module */}
            {activeTab !== 'tracks' && (
              <button
                onClick={() => {
                  onSelectTab('tracks');
                  if (!isPinned) setIsHovered(false);
                }}
                className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition cursor-pointer ${
                  isLight
                    ? 'bg-purple-50 text-purple-800 hover:bg-purple-100'
                    : 'bg-purple-950/60 text-purple-200 hover:bg-purple-900'
                }`}
              >
                <ArrowLeft className="w-3.5 h-3.5 text-purple-500" />
                <span>Voltar</span>
              </button>
            )}

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    if (!isPinned) setIsHovered(false);
                  }}
                  className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white font-extrabold shadow-xs'
                      : isLight
                      ? 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                  }`}
                  title={item.desc}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-white' : isLight ? 'text-slate-500' : 'text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-md font-mono font-bold transition ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : isLight
                          ? 'bg-slate-200 text-slate-700'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
