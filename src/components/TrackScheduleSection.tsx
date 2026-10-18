import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Timer,
  AlertCircle,
  CalendarCheck,
  CalendarDays,
  Sparkles,
  Save,
  Check,
  BookOpen
} from 'lucide-react';
import {
  KnowledgeTrack,
  TrackSchedule,
  TrackScheduleSession,
  WeekDay
} from '../types';

interface TrackScheduleSectionProps {
  track: KnowledgeTrack;
  onUpdateTrack: (updatedTrack: KnowledgeTrack) => void;
  onStartPomodoro?: (trackTitle: string, sessionTitle?: string) => void;
  theme?: 'light' | 'dark';
}

const ALL_WEEK_DAYS: WeekDay[] = [
  'Segunda',
  'Terça',
  'Quarta',
  'Quinta',
  'Sexta',
  'Sábado',
  'Domingo'
];

export const TrackScheduleSection: React.FC<TrackScheduleSectionProps> = ({
  track,
  onUpdateTrack,
  onStartPomodoro,
  theme = 'light',
}) => {
  const isLight = theme === 'light';

  // Initialize schedule if empty
  const schedule: TrackSchedule = track.schedule || {
    daysOfWeek: ['Segunda', 'Quarta', 'Sexta'],
    weeklyTargetHours: 3,
    preferredTimeSlot: '19:30 - 20:30',
    sessions: [],
  };

  // Editing Global Schedule Settings state
  const [isEditingSettings, setIsEditingSettings] = useState(false);
  const [selectedDays, setSelectedDays] = useState<WeekDay[]>(schedule.daysOfWeek || []);
  const [targetHours, setTargetHours] = useState<number>(schedule.weeklyTargetHours || 3);
  const [timeSlot, setTimeSlot] = useState<string>(schedule.preferredTimeSlot || '19:30 - 20:30');
  const [startDate, setStartDate] = useState<string>(schedule.startDate || '');
  const [targetEndDate, setTargetEndDate] = useState<string>(schedule.targetEndDate || '');
  const [settingsSavedToast, setSettingsSavedToast] = useState(false);

  // New / Edit Session Form state
  const [isSessionFormOpen, setIsSessionFormOpen] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [sessionDay, setSessionDay] = useState<WeekDay>('Segunda');
  const [sessionTime, setSessionTime] = useState('19:30');
  const [sessionDuration, setSessionDuration] = useState<number>(60);
  const [sessionModule, setSessionModule] = useState('');
  const [sessionNotes, setSessionNotes] = useState('');

  // Toggle day in week
  const handleToggleDay = (day: WeekDay) => {
    if (selectedDays.includes(day)) {
      if (selectedDays.length === 1) return; // keep at least 1 day
      setSelectedDays(selectedDays.filter((d) => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  // Save Settings
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedSchedule: TrackSchedule = {
      ...schedule,
      daysOfWeek: selectedDays,
      weeklyTargetHours: Number(targetHours) || 1,
      preferredTimeSlot: timeSlot.trim(),
      startDate: startDate || undefined,
      targetEndDate: targetEndDate || undefined,
    };

    onUpdateTrack({
      ...track,
      schedule: updatedSchedule,
      updatedAt: new Date().toISOString(),
    });

    setIsEditingSettings(false);
    setSettingsSavedToast(true);
    setTimeout(() => setSettingsSavedToast(false), 2500);
  };

  // Save Session
  const handleSaveSession = (e: React.FormEvent) => {
    e.preventDefault();
    const currentSessions = schedule.sessions || [];

    if (editingSessionId) {
      const updatedSessions = currentSessions.map((s) => {
        if (s.id !== editingSessionId) return s;
        return {
          ...s,
          dayOfWeek: sessionDay,
          startTime: sessionTime,
          durationMinutes: Number(sessionDuration),
          targetModuleTitle: sessionModule.trim() || undefined,
          notes: sessionNotes.trim() || undefined,
        };
      });

      onUpdateTrack({
        ...track,
        schedule: { ...schedule, sessions: updatedSessions },
        updatedAt: new Date().toISOString(),
      });
    } else {
      const newSession: TrackScheduleSession = {
        id: `sess-${Date.now()}`,
        dayOfWeek: sessionDay,
        startTime: sessionTime,
        durationMinutes: Number(sessionDuration),
        targetModuleTitle: sessionModule.trim() || undefined,
        notes: sessionNotes.trim() || undefined,
        completed: false,
      };

      onUpdateTrack({
        ...track,
        schedule: { ...schedule, sessions: [...currentSessions, newSession] },
        updatedAt: new Date().toISOString(),
      });
    }

    // Reset Form
    setIsSessionFormOpen(false);
    setEditingSessionId(null);
    setSessionNotes('');
    setSessionModule('');
  };

  // Toggle Session Completed
  const handleToggleSessionCompleted = (sessionId: string) => {
    const updatedSessions = (schedule.sessions || []).map((s) => {
      if (s.id !== sessionId) return s;
      return { ...s, completed: !s.completed };
    });

    onUpdateTrack({
      ...track,
      schedule: { ...schedule, sessions: updatedSessions },
      updatedAt: new Date().toISOString(),
    });
  };

  // Delete Session
  const handleDeleteSession = (sessionId: string) => {
    const updatedSessions = (schedule.sessions || []).filter((s) => s.id !== sessionId);
    onUpdateTrack({
      ...track,
      schedule: { ...schedule, sessions: updatedSessions },
      updatedAt: new Date().toISOString(),
    });
  };

  // Open Edit Session Form
  const handleOpenEditSession = (s: TrackScheduleSession) => {
    setEditingSessionId(s.id);
    setSessionDay(s.dayOfWeek);
    setSessionTime(s.startTime);
    setSessionDuration(s.durationMinutes);
    setSessionModule(s.targetModuleTitle || '');
    setSessionNotes(s.notes || '');
    setIsSessionFormOpen(true);
  };

  // Total scheduled minutes and completion
  const totalScheduledMinutes = (schedule.sessions || []).reduce((acc, s) => acc + s.durationMinutes, 0);
  const totalScheduledHours = (totalScheduledMinutes / 60).toFixed(1);
  const completedSessionsCount = (schedule.sessions || []).filter((s) => s.completed).length;

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Settings Saved Notification */}
      {settingsSavedToast && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border-2 border-emerald-500 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Configurações do cronograma salvas com sucesso para esta trilha!</span>
        </div>
      )}

      {/* Main Settings & Days Card */}
      <div
        className={`p-5 sm:p-6 rounded-2xl border-2 shadow-md transition-all ${
          isLight
            ? 'bg-white border-[#76a7e8]'
            : 'bg-[#0b172d] border-slate-800 text-slate-100'
        }`}
      >
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-sky-500/10 text-sky-600 border border-sky-300">
                <CalendarDays className="w-5 h-5" />
              </span>
              <h3 className={`text-base sm:text-lg font-extrabold ${isLight ? 'text-sky-950' : 'text-white'}`}>
                Cronograma de Estudos · {track.title}
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Organize os dias da semana, horários preferenciais e carga horária dedicados a esta trilha
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditingSettings((prev) => !prev)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold border transition cursor-pointer flex items-center gap-1.5 ${
                isEditingSettings
                  ? 'bg-slate-200 text-slate-800 border-slate-300'
                  : isLight
                  ? 'bg-sky-50 hover:bg-sky-100 text-sky-800 border-sky-300'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>{isEditingSettings ? 'Fechar Ajustes' : 'Configurar Dias & Horários'}</span>
            </button>
          </div>
        </div>

        {/* Configuration Form / Viewer */}
        {isEditingSettings ? (
          <form onSubmit={handleSaveSettings} className="pt-4 space-y-4 animate-fadeIn">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
                1. Selecione os Dias da Semana que você estuda esta Trilha:
              </label>
              <div className="flex flex-wrap gap-2">
                {ALL_WEEK_DAYS.map((day) => {
                  const isSelected = selectedDays.includes(day);
                  return (
                    <button
                      type="button"
                      key={day}
                      onClick={() => handleToggleDay(day)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer border ${
                        isSelected
                          ? isLight
                            ? 'bg-sky-600 text-white border-sky-700 shadow-sm'
                            : 'bg-sky-500 text-white border-sky-400 shadow-sm'
                          : isLight
                          ? 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-300'
                          : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border-slate-800'
                      }`}
                    >
                      {day} {isSelected && '✓'}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Meta Semanal (Horas):
                </label>
                <input
                  type="number"
                  min="1"
                  max="40"
                  value={targetHours}
                  onChange={(e) => setTargetHours(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-lg border bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Faixa de Horário Preferencial:
                </label>
                <input
                  type="text"
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  placeholder="Ex: 19:30 - 21:00 ou Manhã"
                  className="w-full px-3 py-2 text-xs rounded-lg border bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Meta de Conclusão da Trilha:
                </label>
                <input
                  type="date"
                  value={targetEndDate}
                  onChange={(e) => setTargetEndDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-700 focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsEditingSettings(false)}
                className="px-3 py-1.5 rounded-lg text-xs text-slate-500 hover:text-slate-700"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn-3d-primary px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Salvar Cronograma da Trilha</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Days active summary */}
            <div className={`p-3 rounded-xl border ${isLight ? 'bg-sky-50/70 border-sky-200' : 'bg-slate-900/80 border-slate-800'}`}>
              <span className="text-[10px] font-bold uppercase tracking-wider text-sky-800 dark:text-sky-300">
                Dias de Estudo
              </span>
              <div className="flex flex-wrap gap-1 mt-1.5">
                {(schedule.daysOfWeek && schedule.daysOfWeek.length > 0 ? schedule.daysOfWeek : ['Não definido']).map((d) => (
                  <span
                    key={d}
                    className="px-2 py-0.5 rounded text-[11px] font-bold bg-white dark:bg-slate-800 text-sky-900 dark:text-sky-200 border border-sky-300 dark:border-slate-700"
                  >
                    {d}
                  </span>
                ))}
              </div>
            </div>

            {/* Target hours summary */}
            <div className={`p-3 rounded-xl border ${isLight ? 'bg-emerald-50/70 border-emerald-200' : 'bg-slate-900/80 border-slate-800'}`}>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                Carga Horária Semanal
              </span>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-xl font-extrabold font-mono text-emerald-900 dark:text-emerald-200">
                  {schedule.weeklyTargetHours || 3}h
                </span>
                <span className="text-xs text-slate-500">
                  / semana ({totalScheduledHours}h agendadas)
                </span>
              </div>
            </div>

            {/* Time slot summary */}
            <div className={`p-3 rounded-xl border ${isLight ? 'bg-purple-50/70 border-purple-200' : 'bg-slate-900/80 border-slate-800'}`}>
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-800 dark:text-purple-300">
                Horário Preferencial
              </span>
              <div className="mt-1 text-sm font-bold text-purple-900 dark:text-purple-200 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-purple-600" />
                <span>{schedule.preferredTimeSlot || 'Flexível'}</span>
              </div>
            </div>

            {/* Target date */}
            <div className={`p-3 rounded-xl border ${isLight ? 'bg-amber-50/70 border-amber-200' : 'bg-slate-900/80 border-slate-800'}`}>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                Meta de Prazo
              </span>
              <div className="mt-1 text-sm font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                <CalendarCheck className="w-3.5 h-3.5 text-amber-600" />
                <span>
                  {schedule.targetEndDate
                    ? new Date(schedule.targetEndDate).toLocaleDateString('pt-BR')
                    : 'Em definição'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sessions Management & Weekly Agenda */}
      <div
        className={`p-5 sm:p-6 rounded-2xl border-2 shadow-md space-y-4 ${
          isLight ? 'bg-white border-[#76a7e8]' : 'bg-[#0b172d] border-slate-800'
        }`}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-sky-600" />
              <h4 className="text-sm font-extrabold tracking-tight">
                Sessões Agendadas na Semana ({(schedule.sessions || []).length})
              </h4>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Defina os blocos específicos de estudo, duração e tópicos para os dias da sua trilha
            </p>
          </div>

          <button
            onClick={() => {
              setEditingSessionId(null);
              setSessionDay(schedule.daysOfWeek?.[0] || 'Segunda');
              setSessionTime('19:30');
              setSessionDuration(60);
              setSessionModule('');
              setSessionNotes('');
              setIsSessionFormOpen(true);
            }}
            className="btn-3d-primary px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Agendar Nova Sessão</span>
          </button>
        </div>

        {/* Add / Edit Session Modal Form */}
        {isSessionFormOpen && (
          <form
            onSubmit={handleSaveSession}
            className={`p-4 rounded-xl border-2 space-y-3 animate-fadeIn ${
              isLight ? 'bg-sky-50/70 border-sky-300' : 'bg-slate-900 border-sky-700'
            }`}
          >
            <div className="text-xs font-bold text-sky-900 dark:text-sky-300 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-sky-600" />
              <span>{editingSessionId ? 'Editar Sessão Agendada' : 'Nova Sessão de Estudo:'}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Dia da Semana:
                </label>
                <select
                  value={sessionDay}
                  onChange={(e) => setSessionDay(e.target.value as WeekDay)}
                  className="w-full px-2.5 py-1.5 text-xs rounded border bg-white dark:bg-slate-950 border-sky-300 dark:border-slate-700"
                >
                  {ALL_WEEK_DAYS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Horário de Início:
                </label>
                <input
                  type="time"
                  required
                  value={sessionTime}
                  onChange={(e) => setSessionTime(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded border bg-white dark:bg-slate-950 border-sky-300 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Duração:
                </label>
                <select
                  value={sessionDuration}
                  onChange={(e) => setSessionDuration(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 text-xs rounded border bg-white dark:bg-slate-950 border-sky-300 dark:border-slate-700"
                >
                  <option value={25}>25 minutos (1 Pomodoro)</option>
                  <option value={45}>45 minutos</option>
                  <option value={60}>60 minutos (1 hora)</option>
                  <option value={90}>90 minutos (1h30)</option>
                  <option value={120}>120 minutos (2 horas)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Módulo ou Conteúdo a Estudar:
              </label>
              {track.subcategories && track.subcategories.length > 0 ? (
                <div className="space-y-1.5">
                  <select
                    value={sessionModule}
                    onChange={(e) => setSessionModule(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded border bg-white dark:bg-slate-950 border-sky-300 dark:border-slate-700"
                  >
                    <option value="">Selecione um módulo desta trilha ou digite abaixo</option>
                    {track.subcategories.map((sub) => (
                      <option key={sub.id} value={sub.title}>
                        {sub.title}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={sessionModule}
                    onChange={(e) => setSessionModule(e.target.value)}
                    placeholder="Ou digite o nome específico da aula/capítulo..."
                    className="w-full px-2.5 py-1 text-xs rounded border bg-white dark:bg-slate-950 border-sky-300 dark:border-slate-700"
                  />
                </div>
              ) : (
                <input
                  type="text"
                  required
                  value={sessionModule}
                  onChange={(e) => setSessionModule(e.target.value)}
                  placeholder="Ex: Introdução ao Módulo 1, Leitura do capítulo..."
                  className="w-full px-2.5 py-1.5 text-xs rounded border bg-white dark:bg-slate-950 border-sky-300 dark:border-slate-700"
                />
              )}
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Anotações ou Metas do Dia (Opcional):
              </label>
              <input
                type="text"
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
                placeholder="Ex: Resolver 5 exercícios práticos e revisar flashcards"
                className="w-full px-2.5 py-1.5 text-xs rounded border bg-white dark:bg-slate-950 border-sky-300 dark:border-slate-700"
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setIsSessionFormOpen(false);
                  setEditingSessionId(null);
                }}
                className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-700"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn-3d-primary px-3.5 py-1 text-xs font-bold cursor-pointer"
              >
                {editingSessionId ? 'Atualizar Sessão' : 'Confirmar Sessão'}
              </button>
            </div>
          </form>
        )}

        {/* Sessions List */}
        {(!schedule.sessions || schedule.sessions.length === 0) ? (
          <div className="py-10 text-center space-y-2 border border-dashed border-slate-300 dark:border-slate-800 rounded-xl">
            <Clock className="w-8 h-8 mx-auto text-slate-400" />
            <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Nenhuma sessão de estudo cadastrada nesta trilha
            </h5>
            <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
              Clique no botão "+ Agendar Nova Sessão" acima para fixar os dias e horários que você vai estudar cada módulo.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {schedule.sessions.map((session) => (
              <div
                key={session.id}
                className={`p-3.5 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition ${
                  session.completed
                    ? isLight
                      ? 'bg-emerald-50/60 border-emerald-300 text-slate-800'
                      : 'bg-emerald-950/20 border-emerald-900 text-slate-200'
                    : isLight
                    ? 'bg-white hover:bg-slate-50 border-slate-200'
                    : 'bg-slate-900/90 hover:bg-slate-800/90 border-slate-800'
                }`}
              >
                <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                  <button
                    onClick={() => handleToggleSessionCompleted(session.id)}
                    className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 cursor-pointer transition ${
                      session.completed
                        ? 'bg-emerald-600 border-emerald-700 text-white'
                        : isLight
                        ? 'border-slate-300 hover:border-emerald-500 bg-white'
                        : 'border-slate-700 hover:border-emerald-500 bg-slate-950'
                    }`}
                    title={session.completed ? 'Marcar como pendente' : 'Marcar como concluída'}
                  >
                    {session.completed && <Check className="w-4 h-4" />}
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 border border-sky-300 dark:border-sky-800">
                        {session.dayOfWeek}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-sky-500" />
                        {session.startTime} ({session.durationMinutes} min)
                      </span>
                      {session.completed && (
                        <span className="text-[10px] font-bold text-emerald-600 uppercase">
                          Sessão Realizada
                        </span>
                      )}
                    </div>

                    <p className={`text-xs font-bold mt-1 truncate ${session.completed ? 'line-through text-slate-500' : 'text-slate-900 dark:text-white'}`}>
                      {session.targetModuleTitle || 'Estudo Geral da Trilha'}
                    </p>

                    {session.notes && (
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {session.notes}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
                  {onStartPomodoro && (
                    <button
                      onClick={() => onStartPomodoro(track.title, session.targetModuleTitle || session.dayOfWeek)}
                      className="btn-3d-amber px-2.5 py-1 rounded text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                      title="Iniciar Pomodoro para esta sessão de estudo"
                    >
                      <Timer className="w-3 h-3" />
                      <span>Pomodoro</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleOpenEditSession(session)}
                    className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-white"
                    title="Editar sessão"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDeleteSession(session.id)}
                    className="p-1 rounded text-slate-400 hover:text-rose-500"
                    title="Excluir sessão"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
