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

export type ActiveTab = 'tracks' | 'certs' | 'pomodoro' | 'techniques' | 'notes' | 'reminders';

interface NavbarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  pendingRemindersCount: number;
  notesCount: number;
  theme?: 'light' | 'dark';
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  pendingRemindersCount,
  notesCount,
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
      className={`flex items-center gap-2 overflow-x-auto p-2 rounded-2xl text-xs sm:text-[13px] select-none transition-all duration-200 ${
        isLight
          ? 'bg-gradient-to-r from-[#deedfc] via-[#e8f3fd] to-[#deedfc] border-2 border-[#71a4e8] shadow-md shadow-sky-900/10'
          : 'bg-gradient-to-r from-[#0d1d36] via-[#102444] to-[#0d1d36] border-2 border-[#1d3d6e] shadow-lg shadow-[#050f1d]/40'
      }`}
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;

        return (
          <button
            key={item.id}
            onClick={() => onSelectTab(item.id)}
            className={`px-4 py-2.5 rounded-xl font-semibold flex items-center gap-2 whitespace-nowrap transition-all duration-150 cursor-pointer ${
              isActive
                ? isLight
                  ? 'bg-white text-sky-950 font-extrabold shadow-md shadow-sky-900/15 border-2 border-sky-500 scale-[1.01]'
                  : 'bg-gradient-to-r from-sky-600 to-blue-600 text-white font-bold shadow-md shadow-sky-500/30 border border-sky-300'
                : isLight
                ? 'text-slate-700 hover:text-slate-950 hover:bg-white/70 border border-transparent font-medium'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/80 border border-transparent hover:border-slate-700/60'
            }`}
          >
            <Icon
              className={`w-4 h-4 ${
                isActive
                  ? isLight
                    ? 'text-sky-600'
                    : 'text-white'
                  : isLight
                  ? 'text-sky-700'
                  : 'text-slate-400'
              }`}
            />
            <span>{item.label}</span>
            {item.badge && (
              <span
                className={`text-[10px] px-2 py-0.5 rounded-md font-mono font-bold transition ${
                  isActive
                    ? isLight
                      ? 'bg-sky-100 text-sky-900 border border-sky-300 font-extrabold'
                      : 'bg-white/20 text-white border border-white/30'
                    : isLight
                    ? 'bg-white text-sky-800 border border-sky-300 shadow-2xs'
                    : 'bg-slate-950 text-sky-300 border border-sky-900/50'
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
