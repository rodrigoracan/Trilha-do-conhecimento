import React, { useState, useMemo } from 'react';
import {
  Certification,
  StudySession,
  ScheduleGate,
  PlannedStudyTask,
  ActionReminder,
  KnowledgeTrack,
} from '../types';
import { ActiveTab } from './Navbar';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Clock,
  Target,
  TrendingUp,
  Calendar,
  CheckCircle2,
  Award,
  Layers,
  ArrowRight,
  Flame,
  Timer,
  BookOpen,
  Filter,
  CheckSquare,
  Sparkles,
} from 'lucide-react';

interface DashboardViewProps {
  certifications: Certification[];
  studySessions: StudySession[];
  gates: ScheduleGate[];
  plannedTasks?: PlannedStudyTask[];
  reminders?: ActionReminder[];
  knowledgeTracks?: KnowledgeTrack[];
  targetHoursWeekly?: number;
  onNavigateToTab: (tab: ActiveTab) => void;
  onStartPomodoro?: (target?: string) => void;
  onLogManualHours?: (hours: number, target?: string) => void;
  theme?: 'light' | 'dark';
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  certifications = [],
  studySessions = [],
  gates = [],
  plannedTasks = [],
  reminders = [],
  knowledgeTracks = [],
  targetHoursWeekly = 11,
  onNavigateToTab,
  onStartPomodoro,
  onLogManualHours,
  theme = 'light',
}) => {
  const isLight = theme === 'light';
  const [chartTimeframe, setChartTimeframe] = useState<'7days' | '14days' | '30days'>('7days');
  const [chartMode, setChartMode] = useState<'area' | 'bar'>('area');
  const [milestoneFilter, setMilestoneFilter] = useState<'all' | 'in_progress' | 'upcoming'>('all');
  const [quickHours, setQuickHours] = useState<number>(1);
  const [quickTarget, setQuickTarget] = useState<string>('');
  const [isQuickLogOpen, setIsQuickLogOpen] = useState(false);

  // 1. STATISTIC: Total Hours Studied
  const totalHoursFromSessions = useMemo(() => {
    const focusMinutes = studySessions
      .filter((s) => s.mode === 'focus')
      .reduce((acc, curr) => acc + (curr.minutes || 0), 0);
    return Number((focusMinutes / 60).toFixed(1));
  }, [studySessions]);

  const totalHoursFromCerts = useMemo(() => {
    return Number(
      certifications
        .reduce((acc, c) => acc + (c.hoursSpent || 0), 0)
        .toFixed(1)
    );
  }, [certifications]);

  const totalHoursFromTracks = useMemo(() => {
    return Number(
      (knowledgeTracks || [])
        .flatMap((t) => t.subcategories || [])
        .reduce((acc, s) => acc + (s.hoursSpent || 0), 0)
        .toFixed(1)
    );
  }, [knowledgeTracks]);

  // Aggregate total (taking max of session focus minutes or sum of tracked module/cert hours)
  const totalHoursStudied = useMemo(() => {
    const totalConfigured = Number((totalHoursFromCerts + totalHoursFromTracks).toFixed(1));
    return Math.max(totalHoursFromSessions, totalConfigured);
  }, [totalHoursFromSessions, totalHoursFromCerts, totalHoursFromTracks]);

  // 2. STATISTIC: Weekly Productivity & Current Week Hours
  const { currentWeekHours, lastWeekHours, weeklyPercentage, streakDays, dailyAverageMinutes } = useMemo(() => {
    const now = new Date();
    // Monday of current week
    const dayOfWeek = (now.getDay() + 6) % 7; // Monday = 0
    const startOfCurrentWeek = new Date(now);
    startOfCurrentWeek.setDate(now.getDate() - dayOfWeek);
    startOfCurrentWeek.setHours(0, 0, 0, 0);

    const startOfLastWeek = new Date(startOfCurrentWeek);
    startOfLastWeek.setDate(startOfCurrentWeek.getDate() - 7);

    const endOfLastWeek = new Date(startOfCurrentWeek);

    let curWeekMinutes = 0;
    let lstWeekMinutes = 0;
    const activeDatesSet = new Set<string>();

    studySessions.forEach((s) => {
      const sDate = new Date(s.date);
      if (s.mode === 'focus') {
        if (sDate >= startOfCurrentWeek) {
          curWeekMinutes += s.minutes || 0;
        } else if (sDate >= startOfLastWeek && sDate < endOfLastWeek) {
          lstWeekMinutes += s.minutes || 0;
        }
        activeDatesSet.add(s.date.split('T')[0]);
      }
    });

    const curHours = Number((curWeekMinutes / 60).toFixed(1));
    const lstHours = Number((lstWeekMinutes / 60).toFixed(1));
    const pct = targetHoursWeekly > 0 ? Math.min(100, Math.round((curHours / targetHoursWeekly) * 100)) : 0;

    // Calculate active streak (days studied recently)
    let streak = 0;
    const checkDate = new Date();
    for (let i = 0; i < 30; i++) {
      const dateStr = checkDate.toISOString().split('T')[0];
      if (activeDatesSet.has(dateStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (i === 0) {
        // Today might not have a session yet; check yesterday
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    const past7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const past7DaysMinutes = studySessions
      .filter((s) => new Date(s.date) >= past7Days && s.mode === 'focus')
      .reduce((acc, curr) => acc + (curr.minutes || 0), 0);
    const avgDailyMin = Math.round(past7DaysMinutes / 7);

    return {
      currentWeekHours: curHours,
      lastWeekHours: lstHours,
      weeklyPercentage: pct,
      streakDays: streak,
      dailyAverageMinutes: avgDailyMin,
    };
  }, [studySessions, targetHoursWeekly]);

  // 3. STATISTIC: Upcoming Milestones (Gates + Certifications Progress + Planned Tasks + Deadlines)
  const sortedGates = useMemo(() => {
    return [...gates].sort((a, b) => a.gateNumber - b.gateNumber);
  }, [gates]);

  const gatesWithProgress = useMemo(() => {
    return sortedGates.map((gate) => {
      // Find certifications assigned to this gate (via targetGate or focusCertifications)
      const matched = certifications.filter((c) => {
        const targetGateStr = (c.targetGate || '').toLowerCase();
        const gateKey = `gate ${gate.gateNumber}`;
        const isTargetMatch =
          targetGateStr === gateKey ||
          targetGateStr.includes(gateKey) ||
          targetGateStr === `${gate.gateNumber}`;

        const isFocusMatch = gate.focusCertifications?.some((fc) => {
          const fcLower = fc.toLowerCase();
          const titleLower = c.title.toLowerCase();
          const codeLower = c.code.toLowerCase();
          return (
            titleLower.includes(fcLower) ||
            codeLower.includes(fcLower) ||
            fcLower.includes(codeLower)
          );
        });

        return isTargetMatch || isFocusMatch;
      });

      const certsList = matched.map((c) => {
        const totalMods = c.modules?.length || 0;
        const doneMods = c.modules?.filter((m) => m.completed).length || 0;
        const modPct = totalMods > 0 ? Math.round((doneMods / totalMods) * 100) : 0;
        const hrsSpent = c.hoursSpent || 0;
        const estHrs = c.estimatedHours || 60;
        const hrsPct = estHrs > 0 ? Math.min(100, Math.round((hrsSpent / estHrs) * 100)) : 0;

        let compPct = 0;
        if (c.status === 'Concluída') {
          compPct = 100;
        } else if (totalMods > 0 && hrsSpent > 0) {
          compPct = Math.round(modPct * 0.65 + hrsPct * 0.35);
        } else if (totalMods > 0) {
          compPct = modPct;
        } else {
          compPct = hrsPct;
        }

        return {
          id: c.id,
          code: c.code || c.title,
          title: c.title,
          category: c.category || 'Governança',
          colorTheme: c.colorTheme || 'sky',
          status: c.status || 'Planejada',
          hoursSpent: hrsSpent,
          estimatedHours: estHrs,
          totalModules: totalMods,
          completedModules: doneMods,
          modulesPercentage: modPct,
          hoursPercentage: hrsPct,
          completionPercentage: compPct,
          isPlaceholder: false,
        };
      });

      // Add any focusCertifications from gate that are not in database yet (as strategic roadmap targets)
      if (gate.focusCertifications) {
        gate.focusCertifications.forEach((fc) => {
          const exists = certsList.some(
            (cp) =>
              cp.title.toLowerCase().includes(fc.toLowerCase()) ||
              cp.code.toLowerCase().includes(fc.toLowerCase()) ||
              fc.toLowerCase().includes(cp.code.toLowerCase())
          );
          if (!exists) {
            certsList.push({
              id: `gate-focus-${gate.gateNumber}-${fc.toLowerCase().replace(/\s+/g, '-')}`,
              code: fc,
              title: fc,
              category: 'Estratégia',
              colorTheme: 'sky',
              status: gate.status === 'Concluído' ? 'Concluída' : 'Planejada',
              hoursSpent: 0,
              estimatedHours: 60,
              totalModules: 0,
              completedModules: 0,
              modulesPercentage: 0,
              hoursPercentage: 0,
              completionPercentage: gate.status === 'Concluído' ? 100 : 0,
              isPlaceholder: true,
            });
          }
        });
      }

      const totSpent = certsList.reduce((acc, c) => acc + c.hoursSpent, 0);
      const totEst = certsList.reduce((acc, c) => acc + c.estimatedHours, 0);
      let avgComp = 0;
      if (gate.status === 'Concluído') {
        avgComp = 100;
      } else if (certsList.length > 0) {
        avgComp = Math.round(
          certsList.reduce((acc, c) => acc + c.completionPercentage, 0) / certsList.length
        );
      }

      return {
        ...gate,
        certifications: certsList,
        averageCompletion: avgComp,
        totalHoursSpent: Number(totSpent.toFixed(1)),
        totalEstimatedHours: totEst,
      };
    });
  }, [sortedGates, certifications]);

  const activeGate = useMemo(() => {
    return (
      gatesWithProgress.find((g) => g.status === 'Em Andamento') ||
      gatesWithProgress.find((g) => g.status === 'Futuro') ||
      gatesWithProgress[0]
    );
  }, [gatesWithProgress]);

  const upcomingPlannedTasks = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return plannedTasks
      .filter((t) => !t.completed && t.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 5);
  }, [plannedTasks]);

  const upcomingDeadlines = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return reminders
      .filter((r) => !r.completed && r.dueDate >= today)
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
      .slice(0, 5);
  }, [reminders]);

  const filteredGates = useMemo(() => {
    if (milestoneFilter === 'in_progress') {
      return gatesWithProgress.filter((g) => g.status === 'Em Andamento');
    }
    if (milestoneFilter === 'upcoming') {
      return gatesWithProgress.filter((g) => g.status === 'Futuro');
    }
    return gatesWithProgress;
  }, [gatesWithProgress, milestoneFilter]);

  // 4. CHART DATA: Weekly Productivity Trend
  const productivityTrendData = useMemo(() => {
    const numDays = chartTimeframe === '7days' ? 7 : chartTimeframe === '14days' ? 14 : 30;
    const result = [];
    const now = new Date();

    for (let i = numDays - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];

      // Format label (e.g. "Seg, 26" or "26/10")
      const dayName = d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
      const dayNum = d.getDate();
      const monthNum = d.getMonth() + 1;
      const label = numDays <= 7 ? `${dayName}, ${dayNum}` : `${dayNum}/${monthNum}`;

      // Sum minutes for this date
      const daySessions = studySessions.filter((s) => s.date.startsWith(dateStr));
      const focusMin = daySessions
        .filter((s) => s.mode === 'focus')
        .reduce((sum, s) => sum + (s.minutes || 0), 0);
      const breakMin = daySessions
        .filter((s) => s.mode === 'short_break' || s.mode === 'long_break')
        .reduce((sum, s) => sum + (s.minutes || 0), 0);

      const hours = Number((focusMin / 60).toFixed(2));
      const targetDailyHours = Number((targetHoursWeekly / 6).toFixed(1)); // 6 study days

      result.push({
        date: dateStr,
        label,
        horas: hours,
        minutos: focusMin,
        pausas: breakMin,
        sessoes: daySessions.length,
        metaDiaria: targetDailyHours,
      });
    }
    return result;
  }, [chartTimeframe, studySessions, targetHoursWeekly]);

  // 5. Category / Track Distribution
  const categoryDistribution = useMemo(() => {
    const categoryMap = new Map<string, { name: string; hours: number; count: number; color: string }>();

    const colors: Record<string, string> = {
      Governança: '#38bdf8', // sky
      Segurança: '#f43f5e', // rose
      Técnica: '#818cf8', // indigo
      MLOps: '#10b981', // emerald
      Auditoria: '#fbbf24', // amber
      Estratégia: '#c084fc', // purple
      Geral: '#94a3b8',
    };

    certifications.forEach((c) => {
      const cat = c.category || 'Governança';
      const existing = categoryMap.get(cat) || {
        name: cat,
        hours: 0,
        count: 0,
        color: colors[cat] || '#60a5fa',
      };
      existing.hours += c.hoursSpent || 0;
      existing.count += 1;
      categoryMap.set(cat, existing);
    });

    (knowledgeTracks || []).forEach((t) => {
      const cat = t.category || 'Governança';
      const existing = categoryMap.get(cat) || {
        name: cat,
        hours: 0,
        count: 0,
        color: colors[cat] || '#60a5fa',
      };
      const trackHours = (t.subcategories || []).reduce((acc, s) => acc + (s.hoursSpent || 0), 0);
      existing.hours += trackHours;
      existing.count += t.subcategories?.length || 1;
      categoryMap.set(cat, existing);
    });

    const list = Array.from(categoryMap.values()).map((item) => ({
      ...item,
      hours: Number(item.hours.toFixed(1)),
    }));

    return list.sort((a, b) => b.hours - a.hours);
  }, [certifications, knowledgeTracks]);

  // Overall modules & progress stats across certifications and knowledge tracks
  const totalModules = useMemo(() => {
    const certMods = certifications.reduce((acc, c) => acc + (c.modules?.length || 0), 0);
    const trackMods = (knowledgeTracks || []).reduce((acc, t) => acc + (t.subcategories?.length || 0), 0);
    return certMods + trackMods;
  }, [certifications, knowledgeTracks]);

  const completedModules = useMemo(() => {
    const certDone = certifications.reduce((acc, c) => {
      return acc + (c.modules?.filter((m) => m.completed)?.length || 0);
    }, 0);
    const trackDone = (knowledgeTracks || []).reduce((acc, t) => {
      return acc + (t.subcategories?.filter((s) => s.status === 'Concluída' || (s.completedPercent && s.completedPercent >= 100))?.length || 0);
    }, 0);
    return certDone + trackDone;
  }, [certifications, knowledgeTracks]);

  const moduleCompletionPercent = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;

  const handleQuickLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickHours <= 0) return;
    if (onLogManualHours) {
      onLogManualHours(quickHours, quickTarget || undefined);
    }
    setIsQuickLogOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* View Header with Context & Quick Action Button */}
      <div
        className={`p-5 rounded-2xl border transition-all ${
          isLight
            ? 'bg-[#dce9f8]/80 backdrop-blur-md border-blue-300/80 shadow-xs'
            : 'bg-[#122444]/95 backdrop-blur-md border-blue-500/30 shadow-md'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sky-600 dark:text-sky-400">
              <Sparkles className="w-4 h-4" />
              <span>Painel Executivo de Estudos RACAN</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight mt-1">
              Dashboard Geral de Produtividade & Marcos
            </h1>
            <p className="text-xs sm:text-sm mt-1 text-slate-600 dark:text-slate-300 max-w-3xl">
              Consolidação de horas líquidas estudadas, curva de produtividade semanal, cumprimento dos Gates do plano estratégico e acompanhamento de metas.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setIsQuickLogOpen((prev) => !prev)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                isLight
                  ? 'bg-white hover:bg-slate-100 text-slate-800 border border-slate-300/80 shadow-xs'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-sky-500" />
              <span>Registrar Horas</span>
            </button>

            <button
              onClick={() => onNavigateToTab('pomodoro')}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <Timer className="w-3.5 h-3.5" />
              <span>Iniciar Pomodoro</span>
            </button>

            <button
              onClick={() => onNavigateToTab('planner')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                isLight
                  ? 'bg-sky-100 text-sky-800 hover:bg-sky-200'
                  : 'bg-sky-950/70 text-sky-300 hover:bg-sky-900 border border-sky-800/60'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Ver Planejador</span>
            </button>
          </div>
        </div>

        {/* Quick Log Inline Form */}
        {isQuickLogOpen && (
          <form
            onSubmit={handleQuickLog}
            className={`mt-4 pt-4 border-t flex flex-wrap items-center gap-3 animate-fadeIn ${
              isLight ? 'border-blue-200/80 text-slate-800' : 'border-blue-500/20 text-slate-200'
            }`}
          >
            <span className="text-xs font-semibold">Registro Rápido de Horas:</span>
            <div className="flex items-center gap-2">
              <label htmlFor="quick-hours-input" className="text-xs text-slate-500">Horas:</label>
              <input
                id="quick-hours-input"
                type="number"
                step="0.5"
                min="0.5"
                max="12"
                value={quickHours}
                onChange={(e) => setQuickHours(parseFloat(e.target.value) || 1)}
                className={`w-20 px-2 py-1 text-xs rounded-lg border font-mono tabular-nums ${
                  isLight
                    ? 'bg-white border-slate-300 text-slate-900'
                    : 'bg-slate-900 border-slate-700 text-white'
                }`}
              />
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="quick-target-select" className="text-xs text-slate-500">Destino:</label>
              <select
                id="quick-target-select"
                value={quickTarget}
                onChange={(e) => setQuickTarget(e.target.value)}
                className={`px-2.5 py-1 text-xs rounded-lg border ${
                  isLight
                    ? 'bg-white border-slate-300 text-slate-900'
                    : 'bg-slate-900 border-slate-700 text-white'
                }`}
              >
                <option value="">Estudo Geral / Foco Livre</option>
                {certifications.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} - {c.title}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition cursor-pointer"
            >
              Salvar Registro
            </button>

            <button
              type="button"
              onClick={() => setIsQuickLogOpen(false)}
              className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer"
            >
              Cancelar
            </button>
          </form>
        )}
      </div>

      {/* TOP AGGREGATED METRICS CARDS (Zero-Pill discipline, Tabular figures) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Hours Studied */}
        <div
          className={`p-5 rounded-2xl border transition-all ${
            isLight
              ? 'bg-[#dce9f8] border-blue-300/80 shadow-xs'
              : 'bg-[#122444]/95 border-blue-500/30 shadow-md'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="font-semibold uppercase tracking-wider">Total de Horas Estudadas</span>
            <Clock className="w-4 h-4 text-sky-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono tabular-nums tracking-tight text-slate-900 dark:text-white">
              {totalHoursStudied}h
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">acumuladas</span>
          </div>
          <div className="mt-3 pt-3 border-t text-xs flex items-center justify-between text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800">
            <span>Sessões de Foco: {studySessions.filter((s) => s.mode === 'focus').length}</span>
            <span aria-hidden="true">·</span>
            <span>Trilhas: {totalHoursFromCerts}h</span>
          </div>
        </div>

        {/* Metric 2: Weekly Productivity & Target */}
        <div
          className={`p-5 rounded-2xl border transition-all ${
            isLight
              ? 'bg-[#dce9f8] border-blue-300/80 shadow-xs'
              : 'bg-[#122444]/95 border-blue-500/30 shadow-md'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="font-semibold uppercase tracking-wider">Produtividade Semanal</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono tabular-nums tracking-tight text-slate-900 dark:text-white">
              {currentWeekHours}h
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              / {targetHoursWeekly}h meta
            </span>
          </div>
          {/* Subtle Progress Track */}
          <div className="mt-2 w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${weeklyPercentage}%` }}
            />
          </div>
          <div className="mt-2 text-xs flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span>{weeklyPercentage}% da meta</span>
            <span aria-hidden="true">·</span>
            <span>Semana anterior: {lastWeekHours}h</span>
          </div>
        </div>

        {/* Metric 3: Upcoming Milestones (Active Gate) */}
        <div
          className={`p-5 rounded-2xl border transition-all ${
            isLight
              ? 'bg-[#dce9f8] border-blue-300/80 shadow-xs'
              : 'bg-[#122444]/95 border-blue-500/30 shadow-md'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="font-semibold uppercase tracking-wider">Marco Atual (Gate)</span>
            <Target className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2">
            <div className="text-base font-bold text-slate-900 dark:text-white truncate">
              {activeGate ? activeGate.title : 'Gate 0: Diagnóstico'}
            </div>
            <div className="text-xs text-amber-600 dark:text-amber-400 font-medium mt-0.5">
              {activeGate?.period || 'Em execução'} · {activeGate?.status || 'Em Andamento'}
            </div>
          </div>
          {/* Active Gate Progress Bar */}
          <div className="mt-2 w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-amber-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${activeGate?.averageCompletion || 0}%` }}
            />
          </div>
          <div className="mt-2 text-xs flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="font-mono tabular-nums font-semibold text-slate-700 dark:text-slate-300">
              {activeGate?.averageCompletion || 0}% concluído
            </span>
            <span aria-hidden="true">·</span>
            <span>{activeGate?.certifications?.length || 0} certificações</span>
          </div>
        </div>

        {/* Metric 4: Consistency & Modules Mastered */}
        <div
          className={`p-5 rounded-2xl border transition-all ${
            isLight
              ? 'bg-[#dce9f8] border-blue-300/80 shadow-xs'
              : 'bg-[#122444]/95 border-blue-500/30 shadow-md'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="font-semibold uppercase tracking-wider">Consistência & Módulos</span>
            <Flame className="w-4 h-4 text-rose-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono tabular-nums tracking-tight text-slate-900 dark:text-white">
              {streakDays} {streakDays === 1 ? 'dia' : 'dias'}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">sequência ativa</span>
          </div>
          <div className="mt-3 pt-3 border-t text-xs flex items-center justify-between text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800">
            <span>Módulos: {completedModules}/{totalModules} ({moduleCompletionPercent}%)</span>
            <span aria-hidden="true">·</span>
            <span>Média: {dailyAverageMinutes} min/dia</span>
          </div>
        </div>
      </div>

      {/* MAIN SECTION: WEEKLY PRODUCTIVITY TREND (Interactive Chart) */}
      <div
        className={`p-5 rounded-2xl border transition-all ${
          isLight
            ? 'bg-[#dce9f8] border-blue-300/80 shadow-xs'
            : 'bg-[#122444]/95 border-blue-500/30 shadow-md'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-500" />
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Tendência de Produtividade Semanal (Weekly Productivity Trend)
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Horas líquidas de foco dedicadas por dia comparadas com a meta diária planejada.
            </p>
          </div>

          {/* Controls: Timeframe & Chart Style */}
          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            {/* Timeframe Switcher */}
            <div
              className={`p-1 rounded-xl flex items-center text-xs font-semibold ${
                isLight ? 'bg-white/80 border border-slate-200' : 'bg-slate-900/90 border border-slate-800'
              }`}
            >
              <button
                onClick={() => setChartTimeframe('7days')}
                className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                  chartTimeframe === '7days'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                7 Dias
              </button>
              <button
                onClick={() => setChartTimeframe('14days')}
                className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                  chartTimeframe === '14days'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                14 Dias
              </button>
              <button
                onClick={() => setChartTimeframe('30days')}
                className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                  chartTimeframe === '30days'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                30 Dias
              </button>
            </div>

            {/* Mode Switcher */}
            <div
              className={`p-1 rounded-xl flex items-center text-xs font-semibold ${
                isLight ? 'bg-white/80 border border-slate-200' : 'bg-slate-900/90 border border-slate-800'
              }`}
            >
              <button
                onClick={() => setChartMode('area')}
                className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                  chartMode === 'area'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Área
              </button>
              <button
                onClick={() => setChartMode('bar')}
                className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                  chartMode === 'bar'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Barras
              </button>
            </div>
          </div>
        </div>

        {/* Recharts Container */}
        <div className="w-full h-72 sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            {chartMode === 'area' ? (
              <AreaChart data={productivityTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="productivityGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={isLight ? '#cbd5e1' : '#1e293b'} vertical={false} />
                <XAxis
                  dataKey="label"
                  stroke={isLight ? '#64748b' : '#94a3b8'}
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                />
                <YAxis
                  stroke={isLight ? '#64748b' : '#94a3b8'}
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  unit="h"
                  domain={[0, 'auto']}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div
                          className={`p-3 rounded-xl shadow-lg border text-xs ${
                            isLight
                              ? 'bg-white border-slate-200 text-slate-800'
                              : 'bg-slate-900 border-slate-700 text-white'
                          }`}
                        >
                          <div className="font-bold text-sm">{data.label}</div>
                          <div className="mt-1.5 space-y-1 font-mono">
                            <div className="text-indigo-600 dark:text-indigo-400 font-bold">
                              Estudo: {data.horas}h ({data.minutos} min)
                            </div>
                            <div className="text-slate-500">Sessões: {data.sessoes}</div>
                            {data.pausas > 0 && <div className="text-amber-500">Pausas: {data.pausas} min</div>}
                            <div className="text-slate-400 text-[11px] pt-1 border-t border-slate-200 dark:border-slate-800">
                              Meta sugerida: {data.metaDiaria}h/dia
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="horas"
                  name="Horas Estudadas"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#productivityGradient)"
                />
              </AreaChart>
            ) : (
              <BarChart data={productivityTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isLight ? '#cbd5e1' : '#1e293b'} vertical={false} />
                <XAxis
                  dataKey="label"
                  stroke={isLight ? '#64748b' : '#94a3b8'}
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                />
                <YAxis
                  stroke={isLight ? '#64748b' : '#94a3b8'}
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  unit="h"
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div
                          className={`p-3 rounded-xl shadow-lg border text-xs ${
                            isLight
                              ? 'bg-white border-slate-200 text-slate-800'
                              : 'bg-slate-900 border-slate-700 text-white'
                          }`}
                        >
                          <div className="font-bold">{data.label}</div>
                          <div className="mt-1 font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                            {data.horas} horas ({data.minutos} minutos)
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="horas" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Chart Summary Stats Footer */}
        <div className="mt-4 pt-3 border-t grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs border-slate-200 dark:border-slate-800/80">
          <div>
            <span className="text-slate-500">Média Diária (Período):</span>
            <div className="font-bold font-mono text-sm mt-0.5">
              {(
                productivityTrendData.reduce((acc, d) => acc + d.horas, 0) /
                productivityTrendData.length
              ).toFixed(1)}
              h/dia
            </div>
          </div>
          <div>
            <span className="text-slate-500">Dia de Maior Foco:</span>
            <div className="font-bold text-sm mt-0.5">
              {(() => {
                const max = [...productivityTrendData].sort((a, b) => b.horas - a.horas)[0];
                return max && max.horas > 0 ? `${max.label} (${max.horas}h)` : 'Sem registro';
              })()}
            </div>
          </div>
          <div>
            <span className="text-slate-500">Total no Período:</span>
            <div className="font-bold font-mono text-sm mt-0.5">
              {productivityTrendData.reduce((acc, d) => acc + d.horas, 0).toFixed(1)} horas
            </div>
          </div>
          <div>
            <span className="text-slate-500">Meta Semanal Estimada:</span>
            <div className="font-bold font-mono text-sm text-sky-600 dark:text-sky-400 mt-0.5">
              {targetHoursWeekly}h / semana
            </div>
          </div>
        </div>
      </div>

      {/* TWO-COLUMN GRID: UPCOMING MILESTONES & CATEGORY DISTRIBUTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: UPCOMING MILESTONES (7 COLS) */}
        <div
          className={`lg:col-span-7 p-5 rounded-2xl border transition-all ${
            isLight
              ? 'bg-[#dce9f8] border-blue-300/80 shadow-xs'
              : 'bg-[#122444]/95 border-blue-500/30 shadow-md'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-amber-500" />
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  Próximos Marcos & Gates (Upcoming Milestones)
                </h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Fases estratégicas do plano de 18 meses com metas e entregáveis auditáveis.
              </p>
            </div>

            {/* Filter buttons */}
            <div
              className={`p-1 rounded-xl flex items-center text-xs font-semibold self-start sm:self-auto ${
                isLight ? 'bg-white/80 border border-slate-200' : 'bg-slate-900/90 border border-slate-800'
              }`}
            >
              <button
                onClick={() => setMilestoneFilter('all')}
                className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                  milestoneFilter === 'all'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setMilestoneFilter('in_progress')}
                className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                  milestoneFilter === 'in_progress'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Em Andamento
              </button>
              <button
                onClick={() => setMilestoneFilter('upcoming')}
                className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                  milestoneFilter === 'upcoming'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Futuros
              </button>
            </div>
          </div>

          {/* Gates List with Certification Progress Visualization */}
          <div className="space-y-4">
            {filteredGates.map((gate) => {
              const isCurrent = gate.status === 'Em Andamento';
              const isDone = gate.status === 'Concluído';

              return (
                <div
                  key={gate.gateNumber}
                  className={`p-4 sm:p-5 rounded-xl border transition-all ${
                    isCurrent
                      ? isLight
                        ? 'bg-white border-amber-400 shadow-sm ring-1 ring-amber-400/30'
                        : 'bg-slate-900/95 border-amber-500/60 shadow-lg ring-1 ring-amber-500/20'
                      : isLight
                      ? 'bg-white/85 border-slate-200 hover:border-slate-300'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Gate Top Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 shadow-xs ${
                          isDone
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300'
                            : isCurrent
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        {isDone ? <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /> : `G${gate.gateNumber}`}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                            {gate.title}
                          </h3>
                          <span
                            className={`text-[11px] font-semibold ${
                              isCurrent
                                ? 'text-amber-600 dark:text-amber-400'
                                : isDone
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-slate-500'
                            }`}
                          >
                            · {gate.period} · {gate.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                          {gate.description}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 block">
                        Progresso Geral
                      </span>
                      <span className="text-base font-black font-mono tabular-nums text-slate-900 dark:text-white">
                        {gate.averageCompletion}%
                      </span>
                    </div>
                  </div>

                  {/* Gate Overall Progress Bar */}
                  <div className="mt-3 w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isDone
                          ? 'bg-emerald-500'
                          : isCurrent
                          ? 'bg-gradient-to-r from-amber-500 via-sky-500 to-indigo-500'
                          : 'bg-indigo-500'
                      }`}
                      style={{ width: `${gate.averageCompletion}%` }}
                    />
                  </div>

                  {/* CERTIFICATION PROGRESS BARS (Progresso por Certificação do Marco) */}
                  {gate.certifications && gate.certifications.length > 0 && (
                    <div className="mt-4 pt-3.5 border-t border-slate-150 dark:border-slate-800 space-y-3">
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
                        <span className="uppercase tracking-wider text-[11px] flex items-center gap-1.5 font-bold">
                          <Award className="w-3.5 h-3.5 text-sky-500" />
                          Progresso das Certificações do Marco:
                        </span>
                        <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                          {gate.totalHoursSpent}h de {gate.totalEstimatedHours}h estimadas
                        </span>
                      </div>

                      <div className="space-y-2.5">
                        {gate.certifications.map((cert) => {
                          const isCertDone = cert.status === 'Concluída' || cert.completionPercentage === 100;

                          return (
                            <div
                              key={cert.id}
                              className={`p-3 rounded-xl border transition-all ${
                                isLight
                                  ? 'bg-slate-50/90 border-slate-200/90 hover:border-slate-300'
                                  : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2 mb-1.5">
                                <div className="flex items-center gap-2 truncate">
                                  <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                                    {cert.code}
                                  </span>
                                  {cert.title !== cert.code && (
                                    <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate hidden md:inline">
                                      · {cert.title}
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                  <span
                                    className={`text-xs sm:text-sm font-mono tabular-nums font-black ${
                                      isCertDone
                                        ? 'text-emerald-600 dark:text-emerald-400'
                                        : cert.completionPercentage > 0
                                        ? 'text-indigo-600 dark:text-sky-400'
                                        : 'text-slate-400 dark:text-slate-500'
                                    }`}
                                  >
                                    {cert.completionPercentage}%
                                  </span>

                                  {!cert.isPlaceholder && (
                                    <button
                                      onClick={() => onNavigateToTab('certs')}
                                      className="text-[11px] px-2 py-0.5 rounded font-bold transition cursor-pointer text-sky-600 dark:text-sky-400 hover:bg-sky-100 dark:hover:bg-sky-950/60"
                                      title="Abrir certificação"
                                    >
                                      Ver →
                                    </button>
                                  )}
                                </div>
                              </div>

                              {/* Certification Completion Percentage Bar */}
                              <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-500 ${
                                    isCertDone
                                      ? 'bg-emerald-500'
                                      : cert.completionPercentage > 0
                                      ? 'bg-gradient-to-r from-sky-500 to-indigo-600'
                                      : 'bg-slate-300 dark:bg-slate-700'
                                  }`}
                                  style={{ width: `${cert.completionPercentage}%` }}
                                />
                              </div>

                              {/* Unboxed Metadata (Zero-Pill discipline) */}
                              <div className="mt-1.5 flex flex-wrap items-center justify-between gap-1 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  {cert.totalModules > 0 ? (
                                    <span>
                                      {cert.completedModules}/{cert.totalModules} módulos ({cert.modulesPercentage}%)
                                    </span>
                                  ) : (
                                    <span>Módulos: Conforme plano</span>
                                  )}
                                  <span aria-hidden="true">·</span>
                                  <span>
                                    {cert.hoursSpent}h de {cert.estimatedHours}h ({cert.hoursPercentage}%)
                                  </span>
                                </div>

                                <span
                                  className={`font-sans font-semibold text-[10px] sm:text-[11px] ${
                                    isCertDone
                                      ? 'text-emerald-600 dark:text-emerald-400'
                                      : cert.status === 'Em Andamento'
                                      ? 'text-amber-600 dark:text-amber-400'
                                      : 'text-slate-400 dark:text-slate-500'
                                  }`}
                                >
                                  {cert.status}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Deliverables snippet */}
                  {gate.deliverables && gate.deliverables.length > 0 && (
                    <div className="mt-3.5 pt-3 border-t border-slate-150 dark:border-slate-800/80 text-xs">
                      <span className="font-semibold text-slate-500 dark:text-slate-400 text-[11px] uppercase tracking-wider block mb-1">
                        Entregáveis do Marco ({gate.deliverables.length}):
                      </span>
                      <ul className="space-y-1">
                        {gate.deliverables.slice(0, 3).map((del, idx) => (
                          <li key={idx} className="flex items-start gap-1.5 text-slate-600 dark:text-slate-300">
                            <span className="text-amber-500 font-bold shrink-0">✓</span>
                            <span className="truncate">{del}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Quick link to study planner & certifications */}
          <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500">Quer revisar detalhes de cada certificação do Gate?</span>
            <button
              onClick={() => onNavigateToTab('certs')}
              className="font-bold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Ver Certificações</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: DISTRIBUTION & UPCOMING TASKS (5 COLS) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Study Distribution Card */}
          <div
            className={`p-5 rounded-2xl border transition-all ${
              isLight
                ? 'bg-[#dce9f8] border-blue-300/80 shadow-xs'
                : 'bg-[#122444]/95 border-blue-500/30 shadow-md'
            }`}
          >
            <div className="flex items-center gap-2 mb-3">
              <Layers className="w-5 h-5 text-sky-500" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Distribuição de Estudos por Área
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Investimento de tempo por categorias e certificações ativas.
            </p>

            <div className="space-y-3">
              {categoryDistribution.map((cat) => {
                const totalHours = Math.max(1, totalHoursStudied);
                const percent = Math.min(100, Math.round((cat.hours / totalHours) * 100));

                return (
                  <div key={cat.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {cat.name}
                      </span>
                      <span className="font-mono tabular-nums text-slate-500 dark:text-slate-400">
                        {cat.hours}h ({percent}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${percent}%`,
                          backgroundColor: cat.color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Upcoming Planned Tasks Card */}
          <div
            className={`p-5 rounded-2xl border transition-all ${
              isLight
                ? 'bg-[#dce9f8] border-blue-300/80 shadow-xs'
                : 'bg-[#122444]/95 border-blue-500/30 shadow-md'
            }`}
          >
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-sky-500" />
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Próximas Sessões Agendadas
                </h2>
              </div>
              <button
                onClick={() => onNavigateToTab('planner')}
                className="text-xs text-sky-600 dark:text-sky-400 hover:underline font-bold cursor-pointer"
              >
                Abrir Agenda →
              </button>
            </div>

            {upcomingPlannedTasks.length > 0 ? (
              <div className="space-y-2.5">
                {upcomingPlannedTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`p-2.5 rounded-xl border text-xs flex items-center justify-between gap-3 ${
                      isLight
                        ? 'bg-white border-slate-200 text-slate-800'
                        : 'bg-slate-900/80 border-slate-800 text-slate-200'
                    }`}
                  >
                    <div className="truncate">
                      <div className="font-bold truncate">{task.title}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        {task.date} · {task.durationMinutes} min
                        {task.trackTitle ? ` · ${task.trackTitle}` : ''}
                      </div>
                    </div>
                    <button
                      onClick={() => onNavigateToTab('pomodoro')}
                      className="px-2 py-1 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] shrink-0 cursor-pointer"
                    >
                      Estudar
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div
                className={`p-4 rounded-xl text-center text-xs border border-dashed ${
                  isLight ? 'border-slate-300 text-slate-500' : 'border-slate-700 text-slate-400'
                }`}
              >
                Nenhuma sessão agendada para os próximos dias.
                <div className="mt-2">
                  <button
                    onClick={() => onNavigateToTab('planner')}
                    className="font-bold text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
                  >
                    + Agendar bloco de estudo no Calendário
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
