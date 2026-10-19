import React from 'react';
import {
  LayoutGrid,
  Award,
  Calendar,
  Timer,
  Brain,
  FileText,
  CheckSquare
} from 'lucide-react';

export type ActiveTab = 'tracks' | 'planner' | 'certs' | 'pomodoro' | 'techniques' | 'notes' | 'reminders';

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

  const navItems = [
    {
      id: 'tracks' as ActiveTab,
      label: 'Trilhas RACAN',
      icon: LayoutGrid,
      badge: 'Hub',
    },
    {
      id: 'planner' as ActiveTab,
      label: 'Planejamento de Estudos',
      icon: Calendar,
      badge: plannedTasksCount > 0 ? String(plannedTasksCount) : null,
    },
    {
      id: 'certs' as ActiveTab,
      label: 'Certificações de TI',
      icon: Award,
      badge: null,
    },
    {
      id: 'pomodoro' as ActiveTab,
      label: 'Pomodoro',
      icon: Timer,
      badge: null,
    },
    {
      id: 'techniques' as ActiveTab,
      label: 'Técnicas',
      icon: Brain,
      badge: null,
    },
    {
      id: 'notes' as ActiveTab,
      label: 'Notas',
      icon: FileText,
      badge: notesCount > 0 ? String(notesCount) : null,
    },
    {
      id: 'reminders' as ActiveTab,
      label: 'Ações',
      icon: CheckSquare,
      badge: pendingRemindersCount > 0 ? String(pendingRemindersCount) : null,
    },
  ];

  return (
    <nav
      className={`flex items-center gap-2 overflow-x-auto p-2.5 rounded-2xl text-xs sm:text-[13px] select-none transition-all duration-200 border-2 ${
        isLight
          ? 'bg-gradient-to-r from-[#eef2ff] via-[#f5f3ff] to-[#eef2ff] border-indigo-400 shadow-lg shadow-indigo-950/10'
          : 'bg-gradient-to-r from-[#141838] via-[#1b204c] to-[#141838] border-indigo-500/80 shadow-2xl shadow-black/70'
      }`}
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;

        return (
          <button
            key={item.id}
            onClick={() => onSelectTab(item.id)}
            className={`px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 whitespace-nowrap transition-all duration-150 cursor-pointer ${
              isActive
                ? isLight
                  ? 'bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 text-white font-black shadow-lg shadow-indigo-600/30 border-2 border-indigo-300 scale-[1.02]'
                  : 'bg-gradient-to-r from-indigo-500 via-blue-500 to-sky-500 text-white font-black shadow-lg shadow-indigo-500/50 border-2 border-indigo-300 scale-[1.02]'
                : isLight
                ? 'text-slate-800 hover:text-indigo-950 hover:bg-white font-extrabold border border-transparent hover:border-indigo-200/80 shadow-2xs'
                : 'text-indigo-200 hover:text-white hover:bg-indigo-950/80 font-bold border border-transparent hover:border-indigo-500/40'
            }`}
          >
            <Icon
              className={`w-4 h-4 shrink-0 ${
                isActive
                  ? 'text-white'
                  : isLight
                  ? 'text-indigo-600'
                  : 'text-indigo-400'
              }`}
            />
            <span>{item.label}</span>
            {item.badge && (
              <span
                className={`text-[10px] px-2 py-0.5 rounded-md font-mono font-bold transition ${
                  isActive
                    ? 'bg-white/20 text-white border border-white/30'
                    : isLight
                    ? 'bg-indigo-100 text-indigo-900 border border-indigo-300 shadow-2xs font-extrabold'
                    : 'bg-[#0b0f24] text-indigo-300 border border-indigo-800/60'
                }`}
              >
                {item.badge}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
};
