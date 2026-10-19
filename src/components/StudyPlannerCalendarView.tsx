import React, { useState, useMemo } from 'react';
import {
  PlannedStudyTask,
  KnowledgeTrack,
  Certification
} from '../types';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  CheckCircle2,
  Circle,
  Trash2,
  BookOpen,
  X,
  Target,
  Sparkles,
  CalendarCheck
} from 'lucide-react';

interface StudyPlannerCalendarViewProps {
  plannedTasks: PlannedStudyTask[];
  tracks: KnowledgeTrack[];
  certifications?: Certification[];
  onAddPlannedTask: (task: Omit<PlannedStudyTask, 'id' | 'createdAt'>) => void;
  onUpdatePlannedTask: (task: PlannedStudyTask) => void;
  onDeletePlannedTask: (taskId: string) => void;
  onTogglePlannedTask: (taskId: string) => void;
  theme?: 'light' | 'dark';
}

export const StudyPlannerCalendarView: React.FC<StudyPlannerCalendarViewProps> = ({
  plannedTasks,
  tracks,
  certifications = [],
  onAddPlannedTask,
  onUpdatePlannedTask,
  onDeletePlannedTask,
  onTogglePlannedTask,
  theme = 'light',
}) => {
  const isLight = theme === 'light';

  // Current view month & year
  const today = new Date();
  const [currentDate, setCurrentDate] = useState<Date>(new Date(today.getFullYear(), today.getMonth(), 1));

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDateStr, setSelectedDateStr] = useState<string>(
    today.toISOString().split('T')[0]
  );

  // New task form state
  const [taskTitle, setTaskTitle] = useState('');
  const [durationMinutes, setDurationMinutes] = useState<number>(60);
  const [selectedTrackId, setSelectedTrackId] = useState<string>('');
  const [taskNotes, setTaskNotes] = useState('');

  // Calendar calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const weekDayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  // Days in current month
  const firstDayOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday

  // Days in previous month
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDateStr(today.toISOString().split('T')[0]);
  };

  // Group tasks by date string (YYYY-MM-DD)
  const tasksByDate = useMemo(() => {
    const map = new Map<string, PlannedStudyTask[]>();
    plannedTasks.forEach((t) => {
      const list = map.get(t.date) || [];
      list.push(t);
      map.set(t.date, list);
    });
    return map;
  }, [plannedTasks]);

  // Monthly stats
  const monthStats = useMemo(() => {
    const monthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`;
    const thisMonthTasks = plannedTasks.filter((t) => t.date.startsWith(monthPrefix));
    const totalMinutes = thisMonthTasks.reduce((acc, t) => acc + t.durationMinutes, 0);
    const completedMinutes = thisMonthTasks.filter((t) => t.completed).reduce((acc, t) => acc + t.durationMinutes, 0);
    const completedTasks = thisMonthTasks.filter((t) => t.completed).length;

    return {
      totalTasks: thisMonthTasks.length,
      completedTasks,
      totalHours: (totalMinutes / 60).toFixed(1),
      completedHours: (completedMinutes / 60).toFixed(1),
      progress: thisMonthTasks.length > 0 ? Math.round((completedTasks / thisMonthTasks.length) * 100) : 0,
    };
  }, [plannedTasks, year, month]);

  const handleOpenDayModal = (dateStr: string) => {
    setSelectedDateStr(dateStr);
    setTaskTitle('');
    setDurationMinutes(60);
    setSelectedTrackId(tracks[0]?.id || '');
    setTaskNotes('');
    setIsModalOpen(true);
  };

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    const matchedTrack = tracks.find((t) => t.id === selectedTrackId);

    const timeStr = durationMinutes >= 60
      ? `${Math.floor(durationMinutes / 60)}h${durationMinutes % 60 > 0 ? ` ${durationMinutes % 60}m` : ''}`
      : `${durationMinutes}m`;

    onAddPlannedTask({
      title: taskTitle.trim(),
      date: selectedDateStr,
      durationMinutes,
      timeString: timeStr,
      trackId: matchedTrack?.id,
      trackTitle: matchedTrack?.title,
      completed: false,
      notes: taskNotes.trim() || undefined,
    });

    setTaskTitle('');
    setTaskNotes('');
  };

  // Build calendar matrix (42 cells: 6 rows of 7)
  const calendarCells = useMemo(() => {
    const cells: {
      dateStr: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      isToday: boolean;
      tasks: PlannedStudyTask[];
      totalMinutes: number;
    }[] = [];

    const todayStr = today.toISOString().split('T')[0];

    // Previous month filler days
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const prevDate = new Date(year, month - 1, d);
      const dateStr = prevDate.toISOString().split('T')[0];
      const tasks = tasksByDate.get(dateStr) || [];
      const totalMinutes = tasks.reduce((acc, t) => acc + t.durationMinutes, 0);

      cells.push({
        dateStr,
        dayNumber: d,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
        tasks,
        totalMinutes,
      });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const thisDate = new Date(year, month, d);
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const tasks = tasksByDate.get(dateStr) || [];
      const totalMinutes = tasks.reduce((acc, t) => acc + t.durationMinutes, 0);

      cells.push({
        dateStr,
        dayNumber: d,
        isCurrentMonth: true,
        isToday: dateStr === todayStr,
        tasks,
        totalMinutes,
      });
    }

    // Next month filler days to complete weeks
    const remaining = 42 - cells.length;
    for (let d = 1; d <= remaining; d++) {
      const nextDate = new Date(year, month + 1, d);
      const dateStr = nextDate.toISOString().split('T')[0];
      const tasks = tasksByDate.get(dateStr) || [];
      const totalMinutes = tasks.reduce((acc, t) => acc + t.durationMinutes, 0);

      cells.push({
        dateStr,
        dayNumber: d,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
        tasks,
        totalMinutes,
      });
    }

    return cells;
  }, [year, month, startDayOfWeek, daysInMonth, daysInPrevMonth, tasksByDate, today]);

  // Tasks for the currently open day in modal
  const selectedDayTasks = tasksByDate.get(selectedDateStr) || [];

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Top Banner: Month Selector & Study Statistics */}
      <div
        className={`p-4 sm:p-5 rounded-2xl border-2 transition-all duration-200 ${
          isLight
            ? 'bg-gradient-to-r from-blue-50 via-indigo-50/60 to-purple-50 border-indigo-400 shadow-xl shadow-indigo-950/10'
            : 'bg-gradient-to-r from-[#141b3d] via-[#1b2352] to-[#141b3d] border-indigo-500/80 shadow-2xl shadow-black/80'
        }`}
      >
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Month Title & Nav Buttons */}
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-xl border-2 flex items-center justify-center shrink-0 shadow-md ${
                isLight
                  ? 'bg-indigo-600 border-indigo-400 text-white shadow-indigo-600/30'
                  : 'bg-indigo-500 border-indigo-300 text-white shadow-indigo-500/40'
              }`}
            >
              <CalendarIcon className="w-5 h-5" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className={`text-xl sm:text-2xl font-black tracking-tight ${isLight ? 'text-indigo-950' : 'text-white'}`}>
                  {monthNames[month]} {year}
                </h2>
                <button
                  onClick={handleToday}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition border cursor-pointer ${
                    isLight
                      ? 'bg-white hover:bg-indigo-50 text-indigo-700 border-indigo-300 shadow-2xs'
                      : 'bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 border-indigo-700'
                  }`}
                  title="Ir para o dia de hoje"
                >
                  Hoje
                </button>
              </div>
              <p className={`text-xs font-medium ${isLight ? 'text-indigo-800' : 'text-indigo-300'}`}>
                Clique em qualquer dia do calendário para agendar uma tarefa e definir o tempo estimado
              </p>
            </div>
          </div>

          {/* Month Stats and Month Navigation */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Quick Stats Badges */}
            <div
              className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl border-2 text-xs font-bold shadow-xs ${
                isLight
                  ? 'bg-white border-indigo-300 text-slate-800'
                  : 'bg-[#0d132e] border-indigo-500/60 text-slate-200'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Target className="w-4 h-4 text-indigo-500" />
                <span>
                  {monthStats.completedTasks}/{monthStats.totalTasks} tarefas
                </span>
              </div>
              <span className={isLight ? 'text-slate-300' : 'text-slate-700'}>|</span>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-emerald-500" />
                <span>
                  {monthStats.completedHours}h de {monthStats.totalHours}h planejadas
                </span>
              </div>
            </div>

            {/* Previous / Next Month Arrows */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={handlePrevMonth}
                className={`p-2 rounded-xl border-2 transition cursor-pointer font-bold ${
                  isLight
                    ? 'bg-white hover:bg-indigo-50 border-indigo-300 text-indigo-950 shadow-2xs'
                    : 'bg-[#0d132e] hover:bg-indigo-950 border-indigo-500/60 text-indigo-200'
                }`}
                title="Mês anterior"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNextMonth}
                className={`p-2 rounded-xl border-2 transition cursor-pointer font-bold ${
                  isLight
                    ? 'bg-white hover:bg-indigo-50 border-indigo-300 text-indigo-950 shadow-2xs'
                    : 'bg-[#0d132e] hover:bg-indigo-950 border-indigo-500/60 text-indigo-200'
                }`}
                title="Próximo mês"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Add Task Button */}
            <button
              onClick={() => handleOpenDayModal(selectedDateStr)}
              className="btn-3d-primary px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar Tarefa</span>
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid Container */}
      <div
        className={`rounded-2xl border-2 overflow-hidden shadow-xl transition-all duration-200 ${
          isLight
            ? 'bg-white border-indigo-300 shadow-indigo-950/5'
            : 'bg-[#0e142e] border-indigo-500/60 shadow-black/60'
        }`}
      >
        {/* Days of Week Header */}
        <div
          className={`grid grid-cols-7 text-center font-black text-xs py-3 border-b-2 ${
            isLight
              ? 'bg-indigo-100/60 border-indigo-200 text-indigo-950'
              : 'bg-[#151c3d] border-indigo-800/80 text-indigo-200'
          }`}
        >
          {weekDayNames.map((name, idx) => (
            <div key={idx} className={idx === 0 || idx === 6 ? (isLight ? 'text-indigo-600' : 'text-indigo-400') : ''}>
              {name}
            </div>
          ))}
        </div>

        {/* 6-Week Calendar Grid */}
        <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-indigo-200/50 dark:divide-indigo-900/40">
          {calendarCells.map((cell, idx) => {
            const hasTasks = cell.tasks.length > 0;
            const completedTasks = cell.tasks.filter((t) => t.completed).length;
            const allDone = hasTasks && completedTasks === cell.tasks.length;

            const totalHoursStr = cell.totalMinutes >= 60
              ? `${Math.floor(cell.totalMinutes / 60)}h${cell.totalMinutes % 60 > 0 ? ` ${cell.totalMinutes % 60}m` : ''}`
              : `${cell.totalMinutes}m`;

            return (
              <div
                key={idx}
                onClick={() => handleOpenDayModal(cell.dateStr)}
                className={`min-h-[115px] sm:min-h-[135px] p-1.5 sm:p-2 transition-all cursor-pointer relative group flex flex-col justify-between ${
                  !cell.isCurrentMonth
                    ? isLight
                      ? 'bg-slate-50/60 text-slate-400'
                      : 'bg-[#0a0f24]/60 text-slate-600'
                    : isLight
                    ? 'bg-white hover:bg-indigo-50/50 text-slate-800'
                    : 'bg-[#0e142e] hover:bg-[#151d42] text-slate-200'
                } ${cell.isToday ? (isLight ? 'ring-2 ring-indigo-500 ring-inset bg-indigo-50/30' : 'ring-2 ring-indigo-400 ring-inset bg-indigo-950/30') : ''}`}
              >
                {/* Cell Header: Day Number and Total Planned Time */}
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span
                    className={`inline-flex items-center justify-center text-xs font-black w-6 h-6 rounded-lg ${
                      cell.isToday
                        ? 'bg-indigo-600 text-white shadow-xs font-extrabold'
                        : cell.isCurrentMonth
                        ? isLight
                          ? 'text-slate-900'
                          : 'text-white'
                        : 'text-slate-400'
                    }`}
                  >
                    {cell.dayNumber}
                  </span>

                  {hasTasks && (
                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 ${
                        allDone
                          ? isLight
                            ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                            : 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/60'
                          : isLight
                          ? 'bg-indigo-100 text-indigo-900 border border-indigo-200'
                          : 'bg-indigo-950 text-indigo-300 border border-indigo-800/60'
                      }`}
                      title={`${totalHoursStr} planejados para este dia`}
                    >
                      <Clock className="w-2.5 h-2.5" />
                      <span>{totalHoursStr}</span>
                    </span>
                  )}
                </div>

                {/* Scheduled Tasks List inside cell */}
                <div className="space-y-1 flex-1 overflow-hidden">
                  {cell.tasks.slice(0, 3).map((task) => (
                    <div
                      key={task.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onTogglePlannedTask(task.id);
                      }}
                      className={`px-1.5 py-0.5 rounded text-[11px] font-semibold flex items-center justify-between gap-1 transition truncate border ${
                        task.completed
                          ? isLight
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-800 line-through opacity-80'
                            : 'bg-emerald-950/40 border-emerald-800/40 text-emerald-400 line-through opacity-70'
                          : isLight
                          ? 'bg-white hover:bg-sky-50 border-indigo-200 text-indigo-950 shadow-2xs'
                          : 'bg-[#151c3d] hover:bg-[#1a2550] border-indigo-700/60 text-slate-100'
                      }`}
                      title={`${task.title} (${task.timeString || `${task.durationMinutes}m`}) - Clique para alternar conclusão`}
                    >
                      <div className="flex items-center gap-1 truncate flex-1">
                        {task.completed ? (
                          <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                        ) : (
                          <Circle className="w-3 h-3 text-indigo-400 shrink-0" />
                        )}
                        <span className="truncate">{task.title}</span>
                      </div>
                      <span className="text-[9px] font-mono shrink-0 opacity-80">
                        {task.timeString || `${task.durationMinutes}m`}
                      </span>
                    </div>
                  ))}

                  {cell.tasks.length > 3 && (
                    <div className={`text-[10px] font-bold font-mono text-center pt-0.5 ${isLight ? 'text-indigo-600' : 'text-indigo-400'}`}>
                      +{cell.tasks.length - 3} mais
                    </div>
                  )}
                </div>

                {/* Subtle Hover Action: "+ Adicionar" */}
                <div className="pt-1 opacity-0 group-hover:opacity-100 transition-opacity flex justify-end">
                  <span className={`text-[10px] font-black flex items-center gap-0.5 ${isLight ? 'text-indigo-700' : 'text-indigo-300'}`}>
                    <Plus className="w-3 h-3" /> Tarefa
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal: Add & Manage Tasks for the Selected Day */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div
            className={`w-full max-w-xl rounded-2xl border-2 p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto ${
              isLight
                ? 'bg-white border-indigo-400 text-slate-900'
                : 'bg-[#0f1738] border-indigo-500/80 text-white'
            }`}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b pb-3 border-indigo-200 dark:border-indigo-800">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    isLight ? 'bg-indigo-100 text-indigo-700 border border-indigo-300' : 'bg-indigo-900/60 text-indigo-300'
                  }`}
                >
                  <CalendarCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black tracking-tight">
                    Planejamento de Estudos do Dia
                  </h3>
                  <div className={`text-xs font-semibold ${isLight ? 'text-indigo-800' : 'text-indigo-300'}`}>
                    Data: <span className="font-mono font-bold">{selectedDateStr}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className={`p-1.5 rounded-lg transition cursor-pointer ${
                  isLight ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Existing Tasks on this Day */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-extrabold uppercase tracking-wider ${isLight ? 'text-indigo-950' : 'text-indigo-300'}`}>
                  Tarefas Agendadas ({selectedDayTasks.length})
                </span>
                {selectedDayTasks.length > 0 && (
                  <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    Total: {selectedDayTasks.reduce((acc, t) => acc + t.durationMinutes, 0)} min (
                    {(selectedDayTasks.reduce((acc, t) => acc + t.durationMinutes, 0) / 60).toFixed(1)}h)
                  </span>
                )}
              </div>

              {selectedDayTasks.length === 0 ? (
                <div
                  className={`p-3.5 rounded-xl border-2 border-dashed text-center text-xs font-medium ${
                    isLight ? 'bg-slate-50 border-slate-300 text-slate-500' : 'bg-slate-900/60 border-slate-700 text-slate-400'
                  }`}
                >
                  Nenhuma tarefa agendada para este dia ainda. Preencha o formulário abaixo para adicionar!
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {selectedDayTasks.map((task) => (
                    <div
                      key={task.id}
                      className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 text-xs transition ${
                        task.completed
                          ? isLight
                            ? 'bg-emerald-50/70 border-emerald-300 text-emerald-900'
                            : 'bg-emerald-950/40 border-emerald-800/60 text-emerald-200'
                          : isLight
                          ? 'bg-indigo-50/40 border-indigo-200 text-slate-900'
                          : 'bg-[#151d45] border-indigo-700/60 text-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 flex-1 min-w-0">
                        <button
                          type="button"
                          onClick={() => onTogglePlannedTask(task.id)}
                          className="cursor-pointer shrink-0"
                          title="Alternar conclusão da tarefa"
                        >
                          {task.completed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <Circle className="w-4 h-4 text-indigo-400 hover:text-indigo-600" />
                          )}
                        </button>
                        <div className="truncate flex-1">
                          <div className={`font-bold truncate ${task.completed ? 'line-through opacity-75' : ''}`}>
                            {task.title}
                          </div>
                          {task.trackTitle && (
                            <div className={`text-[10px] font-semibold truncate ${isLight ? 'text-indigo-700' : 'text-indigo-300'}`}>
                              Trilha: {task.trackTitle}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`px-2 py-0.5 rounded font-mono font-bold text-[11px] ${
                            isLight ? 'bg-white border border-indigo-200 text-indigo-950' : 'bg-[#0c122b] border border-indigo-800 text-indigo-200'
                          }`}
                        >
                          {task.timeString || `${task.durationMinutes}m`}
                        </span>
                        <button
                          onClick={() => onDeletePlannedTask(task.id)}
                          className="text-slate-400 hover:text-rose-500 p-1 cursor-pointer transition"
                          title="Excluir tarefa"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Form to Add New Task */}
            <form onSubmit={handleSaveTask} className={`pt-3 border-t border-indigo-200 dark:border-indigo-800 space-y-3`}>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${isLight ? 'text-indigo-950' : 'text-indigo-200'}`}>
                  <Plus className="w-3.5 h-3.5 text-indigo-500" />
                  Nova Tarefa para este Dia
                </span>
                <input
                  type="date"
                  value={selectedDateStr}
                  onChange={(e) => setSelectedDateStr(e.target.value)}
                  className={`text-xs font-mono font-bold px-2 py-1 rounded-lg border ${
                    isLight ? 'bg-white border-indigo-300 text-slate-800' : 'bg-[#0d132e] border-indigo-700 text-white'
                  }`}
                />
              </div>

              {/* Task Title */}
              <div>
                <label className={`block text-xs font-bold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  O que você vai estudar? *
                </label>
                <input
                  type="text"
                  required
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="Ex: Cláusula 6 ISO 42001, Exercícios de Python, Simulado 1..."
                  className={`w-full px-3 py-2 rounded-xl text-xs sm:text-sm font-medium border-2 transition focus:outline-none ${
                    isLight
                      ? 'bg-white border-indigo-300 text-slate-900 focus:border-indigo-600'
                      : 'bg-[#0d132e] border-indigo-600/80 text-white focus:border-indigo-400'
                  }`}
                />
              </div>

              {/* Duration: Quick Chips & Custom Input */}
              <div>
                <label className={`block text-xs font-bold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  Tempo que você vai demorar nesta tarefa:
                </label>
                <div className="flex flex-wrap items-center gap-1.5 mb-2">
                  {[
                    { label: '30 min', min: 30 },
                    { label: '45 min', min: 45 },
                    { label: '1 hora', min: 60 },
                    { label: '1h 30m', min: 90 },
                    { label: '2 horas', min: 120 },
                    { label: '3 horas', min: 180 },
                  ].map((chip) => (
                    <button
                      key={chip.min}
                      type="button"
                      onClick={() => setDurationMinutes(chip.min)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition border ${
                        durationMinutes === chip.min
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                          : isLight
                          ? 'bg-slate-100 hover:bg-indigo-50 text-slate-700 border-slate-300'
                          : 'bg-slate-800 hover:bg-indigo-950 text-slate-300 border-slate-700'
                      }`}
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="5"
                    max="600"
                    step="5"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Math.max(5, parseInt(e.target.value) || 5))}
                    className={`w-28 px-3 py-1.5 rounded-xl text-xs font-mono font-bold border-2 ${
                      isLight
                        ? 'bg-white border-indigo-300 text-slate-900'
                        : 'bg-[#0d132e] border-indigo-700 text-white'
                    }`}
                  />
                  <span className={`text-xs font-bold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                    minutos ({durationMinutes >= 60 ? `${(durationMinutes / 60).toFixed(1)}h` : `${durationMinutes}m`})
                  </span>
                </div>
              </div>

              {/* Link to Track */}
              <div>
                <label className={`block text-xs font-bold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  Vincular a uma Trilha RACAN (opcional):
                </label>
                <select
                  value={selectedTrackId}
                  onChange={(e) => setSelectedTrackId(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl text-xs font-semibold border-2 ${
                    isLight
                      ? 'bg-white border-indigo-300 text-slate-900'
                      : 'bg-[#0d132e] border-indigo-700 text-white'
                  }`}
                >
                  <option value="">Geral / Sem vínculo específico</option>
                  {tracks.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title} ({t.category})
                    </option>
                  ))}
                  {certifications.map((c) => (
                    <option key={c.id} value={c.id}>
                      Certificação: {c.code} - {c.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className={`block text-xs font-bold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  Anotações / Detalhes (opcional):
                </label>
                <textarea
                  rows={2}
                  value={taskNotes}
                  onChange={(e) => setTaskNotes(e.target.value)}
                  placeholder="Links de artigos, capítulos de livros, metas específicas..."
                  className={`w-full px-3 py-1.5 rounded-xl text-xs font-medium border-2 resize-none ${
                    isLight
                      ? 'bg-white border-indigo-300 text-slate-900 placeholder-slate-400'
                      : 'bg-[#0d132e] border-indigo-700 text-white placeholder-slate-400'
                  }`}
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer border ${
                    isLight
                      ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                  }`}
                >
                  Fechar
                </button>
                <button
                  type="submit"
                  className="btn-3d-primary px-5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>Salvar Tarefa no Calendário</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
