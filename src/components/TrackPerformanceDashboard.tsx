import React, { useState, useMemo } from 'react';
import {
  KnowledgeTrack,
  StudySession,
  TrackSubcategory,
  WeekDay
} from '../types';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ReferenceLine,
  ComposedChart
} from 'recharts';
import {
  TrendingUp,
  Target,
  Clock,
  Layers,
  Award,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Timer,
  Plus,
  Compass,
  Zap,
  ArrowUpRight,
  ShieldCheck,
  ChevronRight,
  Info
} from 'lucide-react';

interface TrackPerformanceDashboardProps {
  track: KnowledgeTrack;
  studySessions?: StudySession[];
  onUpdateTrack: (updatedTrack: KnowledgeTrack) => void;
  onStartPomodoro?: (trackTitle: string, itemTitle?: string) => void;
  onLogStudyHours?: (hours: number, trackTitle: string) => void;
  onCreateModule?: () => void;
  theme?: 'light' | 'dark';
}

type PeriodFilter = '7d' | '14d' | '30d' | '90d';
type DensityChartType = 'radar' | 'bar';

export const TrackPerformanceDashboard: React.FC<TrackPerformanceDashboardProps> = ({
  track,
  studySessions = [],
  onUpdateTrack,
  onStartPomodoro,
  onLogStudyHours,
  onCreateModule,
  theme = 'light',
}) => {
  const isLight = theme === 'light';

  // Filters & Tabs state
  const [period, setPeriod] = useState<PeriodFilter>('14d');
  const [densityChartType, setDensityChartType] = useState<DensityChartType>('radar');
  const [selectedMonthOffset, setSelectedMonthOffset] = useState<number | null>(null);

  // Manual quick logging modal/state
  const [isQuickLogOpen, setIsQuickLogOpen] = useState(false);
  const [quickHours, setQuickHours] = useState('1');
  const [quickToast, setQuickToast] = useState(false);

  // --- 1. SESSIONS FILTERED FOR THIS TRACK ---
  const trackSessions = useMemo(() => {
    const trackTitleLower = (track.title || '').toLowerCase();
    const trackSlugLower = (track.slug || '').toLowerCase();
    const trackIdLower = (track.id || '').toLowerCase();

    return studySessions.filter((s) => {
      const title = (s.certificationTitle || '').toLowerCase();
      const certId = (s.certificationId || '').toLowerCase();
      return (
        title.includes(trackTitleLower) ||
        certId.includes(trackSlugLower) ||
        certId === trackIdLower ||
        (track.category && title.includes(track.category.toLowerCase()))
      );
    });
  }, [studySessions, track.title, track.slug, track.id, track.category]);

  const totalStudiedMinutes = useMemo(() => {
    return trackSessions.reduce((acc, curr) => acc + (curr.minutes || 0), 0);
  }, [trackSessions]);

  const totalStudiedHours = Number((totalStudiedMinutes / 60).toFixed(1));

  // --- 2. SUB-CATEGORIES & COMPLETION STATS ---
  const subcategories = track.subcategories || [];
  const hasSubcategories = subcategories.length > 0;

  const totalItemsCount = useMemo(() => {
    return subcategories.reduce((acc, sub) => acc + (sub.items?.length || 0), 0);
  }, [subcategories]);

  const completedItemsCount = useMemo(() => {
    return subcategories.reduce(
      (acc, sub) => acc + (sub.items?.filter((it) => it.status === 'Concluído').length || 0),
      0
    );
  }, [subcategories]);

  const inProgressItemsCount = useMemo(() => {
    return subcategories.reduce(
      (acc, sub) => acc + (sub.items?.filter((it) => it.status === 'Em Andamento').length || 0),
      0
    );
  }, [subcategories]);

  const progressPercentage =
    totalItemsCount > 0 ? Math.round((completedItemsCount / totalItemsCount) * 100) : 0;

  // --- 3. KNOWLEDGE DENSITY BY SUBCATEGORY ---
  // Knowledge density calculation:
  // - Completed items weight: 50%
  // - In-progress items weight: 20%
  // - Checklist completion: 15%
  // - Resources & Attachments weight: 15%
  const subcategoryDensityData = useMemo(() => {
    if (!hasSubcategories) return [];

    return subcategories.map((sub, idx) => {
      const items = sub.items || [];
      const totalIt = items.length;
      const doneIt = items.filter((it) => it.status === 'Concluído').length;
      const progIt = items.filter((it) => it.status === 'Em Andamento').length;

      let totalChecklists = 0;
      let doneChecklists = 0;
      let totalResources = 0;
      let doneResources = 0;

      items.forEach((it) => {
        if (it.checklist && it.checklist.length > 0) {
          totalChecklists += it.checklist.length;
          doneChecklists += it.checklist.filter((c) => c.done).length;
        }
        if (it.resources && it.resources.length > 0) {
          totalResources += it.resources.length;
          doneResources += it.resources.filter((r) => r.completed).length;
        }
      });

      const attachmentsCount = sub.attachments?.length || 0;

      let density = 0;
      if (totalIt > 0) {
        const itemScore = (doneIt / totalIt) * 50 + (progIt / totalIt) * 20;
        const checkScore = totalChecklists > 0 ? (doneChecklists / totalChecklists) * 15 : (doneIt / totalIt) * 15;
        const resourceScore = Math.min(15, (totalResources * 3 + attachmentsCount * 4));
        density = Math.min(100, Math.round(itemScore + checkScore + resourceScore));
      } else {
        density = 0;
      }

      // Classification
      let maturityLevel: 'Iniciante' | 'Intermediário' | 'Avançado' = 'Iniciante';
      if (density >= 70) maturityLevel = 'Avançado';
      else if (density >= 30) maturityLevel = 'Intermediário';

      // Truncate long title for radar chart
      const shortTitle = sub.title.length > 18 ? `${sub.title.slice(0, 16)}...` : sub.title;

      return {
        id: sub.id,
        moduleNumber: `M${idx + 1}`,
        title: sub.title,
        shortTitle,
        density,
        idealDensity: 100,
        totalItems: totalIt,
        completedItems: doneIt,
        inProgressItems: progIt,
        attachmentsCount,
        totalResources,
        maturityLevel,
      };
    });
  }, [subcategories, hasSubcategories]);

  const averageDensity = useMemo(() => {
    if (subcategoryDensityData.length === 0) return 0;
    const sum = subcategoryDensityData.reduce((acc, curr) => acc + curr.density, 0);
    return Math.round(sum / subcategoryDensityData.length);
  }, [subcategoryDensityData]);

  // --- 4. DAILY STUDY EVOLUTION DATA (LAST X DAYS) ---
  const dailyEvolutionData = useMemo(() => {
    const dayCount = period === '7d' ? 7 : period === '14d' ? 14 : period === '30d' ? 30 : 90;
    const result = [];
    const now = new Date();

    // Map scheduled days of week to calculate planned daily minutes
    const scheduledDays = track.schedule?.daysOfWeek || ['Segunda', 'Quarta', 'Sexta'];
    const targetWeeklyHours = track.schedule?.weeklyTargetHours || 3;
    const dailyTargetMinutes = scheduledDays.length > 0 ? Math.round((targetWeeklyHours * 60) / scheduledDays.length) : 60;

    const weekdayMap: Record<number, WeekDay> = {
      0: 'Domingo',
      1: 'Segunda',
      2: 'Terça',
      3: 'Quarta',
      4: 'Quinta',
      5: 'Sexta',
      6: 'Sábado'
    };

    for (let i = dayCount - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayOfWeekName = weekdayMap[d.getDay()];
      const isScheduledDay = scheduledDays.includes(dayOfWeekName);

      // Find sessions on this date
      const daySessions = trackSessions.filter((s) => s.date.startsWith(dateStr));
      const studiedMins = daySessions.reduce((acc, curr) => acc + (curr.minutes || 0), 0);

      const dayLabel = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;

      result.push({
        date: dateStr,
        dayLabel,
        dayOfWeek: dayOfWeekName,
        minutosEstudados: studiedMins,
        horasEstudadas: Number((studiedMins / 60).toFixed(2)),
        metaMinutos: isScheduledDay ? dailyTargetMinutes : 0,
        metaHoras: isScheduledDay ? Number((dailyTargetMinutes / 60).toFixed(2)) : 0,
        sessoesCount: daySessions.length,
      });
    }

    return result;
  }, [period, trackSessions, track.schedule]);

  // Recent 7-day velocity
  const recentWeekMinutes = useMemo(() => {
    const last7 = dailyEvolutionData.slice(-7);
    return last7.reduce((acc, curr) => acc + curr.minutosEstudados, 0);
  }, [dailyEvolutionData]);

  // --- 5. 18-MONTH TIMELINE & PACE COMPARISON ---
  // Total months: 18
  // Total weeks: ~78
  // Expected progress per month: 100 / 18 = 5.55%
  const currentMonthCalculated = useMemo(() => {
    if (selectedMonthOffset !== null) return selectedMonthOffset;

    // Calculate month based on startDate if present
    if (track.schedule?.startDate) {
      const start = new Date(track.schedule.startDate);
      const now = new Date();
      const diffMonths = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth()) + 1;
      return Math.min(18, Math.max(1, diffMonths));
    }

    // Default to month 1 or proportion based on progress
    if (progressPercentage > 0) {
      const estimatedMonth = Math.min(18, Math.max(1, Math.round((progressPercentage / 100) * 18)));
      return estimatedMonth;
    }

    return 1;
  }, [selectedMonthOffset, track.schedule?.startDate, progressPercentage]);

  const targetProgressCurrentMonth = Math.min(100, Math.round((currentMonthCalculated / 18) * 100));
  const progressGap = progressPercentage - targetProgressCurrentMonth;

  // Projected completion month at current velocity
  const projectedFinishMonth = useMemo(() => {
    if (progressPercentage >= 100) return currentMonthCalculated;
    if (progressPercentage <= 0) return 18; // Default 18-month pace
    const ratePerMonth = progressPercentage / currentMonthCalculated;
    if (ratePerMonth <= 0) return 18;
    const est = Math.round(100 / ratePerMonth);
    return Math.min(36, Math.max(1, est));
  }, [progressPercentage, currentMonthCalculated]);

  // 18-Month Curve Data (Month 1 to 18)
  const eighteenMonthData = useMemo(() => {
    const months = Array.from({ length: 18 }, (_, i) => i + 1);

    return months.map((month) => {
      // Linear Ideal Pace (Target 18M)
      const metaIdeal = Number(((month / 18) * 100).toFixed(1));

      // Actual progress curve up to currentMonthCalculated
      let progressoReal: number | null = null;
      let projecaoRitmo: number | null = null;

      if (month <= currentMonthCalculated) {
        // Smoothly interpolate up to actual progressPercentage
        if (progressPercentage === 0) {
          progressoReal = 0;
        } else {
          progressoReal = Number(((month / currentMonthCalculated) * progressPercentage).toFixed(1));
        }
      } else {
        // Project forward from currentMonthCalculated
        if (progressPercentage > 0) {
          const monthlyRate = progressPercentage / currentMonthCalculated;
          const monthsAhead = month - currentMonthCalculated;
          const proj = Math.min(100, progressPercentage + monthlyRate * monthsAhead);
          projecaoRitmo = Number(proj.toFixed(1));
        } else {
          // If 0, projection starts when user starts
          projecaoRitmo = null;
        }
      }

      return {
        month: `Mês ${month}`,
        monthNum: month,
        metaIdeal,
        progressoReal,
        projecaoRitmo: month === currentMonthCalculated ? progressoReal : projecaoRitmo,
      };
    });
  }, [currentMonthCalculated, progressPercentage]);

  // Pace status badge
  const paceStatus = useMemo(() => {
    if (progressPercentage === 0) {
      return {
        label: 'Pronta para Início',
        color: 'text-sky-400 bg-sky-950/40 border-sky-600/40',
        lightColor: 'text-sky-800 bg-sky-50 border-sky-300',
        desc: 'Ciclo de 18 meses pronto para decolar no Mês 1',
      };
    }
    if (progressGap >= 5) {
      return {
        label: `Adiantado (+${progressGap}%)`,
        color: 'text-emerald-400 bg-emerald-950/40 border-emerald-600/40',
        lightColor: 'text-emerald-800 bg-emerald-50 border-emerald-300',
        desc: 'Ritmo superior à curva planejada de 18 meses',
      };
    }
    if (progressGap >= -5) {
      return {
        label: 'No Ritmo (On Track)',
        color: 'text-blue-400 bg-blue-950/40 border-blue-600/40',
        lightColor: 'text-blue-800 bg-blue-50 border-blue-300',
        desc: 'Progresso em linha com a meta inicial de 18 meses',
      };
    }
    return {
      label: `Abaixo da Meta (${progressGap}%)`,
      color: 'text-amber-400 bg-amber-950/40 border-amber-600/40',
      lightColor: 'text-amber-800 bg-amber-50 border-amber-300',
      desc: 'Requer ajuste no cronograma semanal para cumprir os 18 meses',
    };
  }, [progressPercentage, progressGap]);

  // Handle Quick Hours Log
  const handleQuickLog = (e: React.FormEvent) => {
    e.preventDefault();
    const hours = parseFloat(quickHours);
    if (!isNaN(hours) && hours > 0 && onLogStudyHours) {
      onLogStudyHours(hours, track.title);
      setQuickToast(true);
      setIsQuickLogOpen(false);
      setTimeout(() => setQuickToast(false), 3000);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header Card of the Performance Dashboard */}
      <div
        className={`p-5 rounded-2xl border-2 transition-all ${
          isLight
            ? 'bg-gradient-to-r from-[#e8f2fc] via-[#edf5fd] to-[#e4f0fc] border-[#8cb7ea] shadow-md shadow-sky-900/5'
            : 'bg-gradient-to-r from-[#09152a] via-[#0c1b35] to-[#09152a] border-blue-900/50 shadow-md'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span
                className={`px-2.5 py-0.5 rounded-md text-[11px] font-extrabold uppercase tracking-wider border ${
                  isLight ? paceStatus.lightColor : paceStatus.color
                }`}
              >
                {paceStatus.label}
              </span>
              <span className={`text-xs font-semibold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                Meta Estratégica: 18 Meses (Mês {currentMonthCalculated} de 18)
              </span>
            </div>
            <h2 className={`text-xl sm:text-2xl font-black tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Dashboard de Desempenho Individual · {track.title}
            </h2>
            <p className={`text-xs sm:text-sm ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
              Evolução diária dos estudos, densidade de domínio por módulo e comparação em tempo real com a meta de 18 meses.
            </p>
          </div>

          {/* Quick Actions in Dashboard */}
          <div className="flex flex-wrap items-center gap-2">
            {onStartPomodoro && (
              <button
                onClick={() => onStartPomodoro(track.title)}
                className="btn-3d-amber px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
                title="Iniciar sessão Pomodoro nesta trilha"
              >
                <Timer className="w-4 h-4" />
                <span>Pomodoro na Trilha</span>
              </button>
            )}

            {onLogStudyHours && (
              <button
                onClick={() => setIsQuickLogOpen(true)}
                className="btn-3d-primary px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
                title="Registrar horas de estudo avulsas nesta trilha"
              >
                <Clock className="w-4 h-4" />
                <span>+ Registrar Estudo</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Log Success Toast */}
        {quickToast && (
          <div className="mt-3 p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Horas de estudo registradas com sucesso e computadas no dashboard!</span>
          </div>
        )}
      </div>

      {/* 4 KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: 18-Month Target Milestone */}
        <div
          className={`p-4 rounded-2xl border-2 transition-all ${
            isLight
              ? 'bg-white border-[#9fc1ee] shadow-sm hover:shadow-md'
              : 'bg-[#0b172d] border-blue-900/40 hover:border-blue-700/60 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold mb-2">
            <span className={isLight ? 'text-sky-900' : 'text-sky-300'}>Meta 18 Meses</span>
            <Target className="w-4 h-4 text-purple-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-black font-mono ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {progressPercentage}%
            </span>
            <span className={`text-xs font-bold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              / {targetProgressCurrentMonth}% esperado
            </span>
          </div>
          <div className="mt-2 text-[11px] font-medium flex items-center gap-1">
            <span
              className={`font-bold ${
                progressGap >= 0
                  ? isLight
                    ? 'text-emerald-700'
                    : 'text-emerald-400'
                  : isLight
                  ? 'text-amber-700'
                  : 'text-amber-400'
              }`}
            >
              {progressGap >= 0 ? `+${progressGap}%` : `${progressGap}%`}
            </span>
            <span className={isLight ? 'text-slate-500' : 'text-slate-400'}>no Mês {currentMonthCalculated} de 18</span>
          </div>
        </div>

        {/* Card 2: Tempo Total Estudado */}
        <div
          className={`p-4 rounded-2xl border-2 transition-all ${
            isLight
              ? 'bg-white border-[#9fc1ee] shadow-sm hover:shadow-md'
              : 'bg-[#0b172d] border-blue-900/40 hover:border-blue-700/60 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold mb-2">
            <span className={isLight ? 'text-sky-900' : 'text-sky-300'}>Tempo Dedicado</span>
            <Clock className="w-4 h-4 text-sky-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-black font-mono ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {totalStudiedHours}h
            </span>
            <span className={`text-xs font-bold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              ({totalStudiedMinutes} min)
            </span>
          </div>
          <div className="mt-2 text-[11px] font-medium text-slate-500 dark:text-slate-400">
            {recentWeekMinutes > 0 ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                +{Number((recentWeekMinutes / 60).toFixed(1))}h nos últimos 7 dias
              </span>
            ) : (
              <span>Ritmo planejado: {track.schedule?.weeklyTargetHours || 3}h/sem</span>
            )}
          </div>
        </div>

        {/* Card 3: Densidade de Conhecimento */}
        <div
          className={`p-4 rounded-2xl border-2 transition-all ${
            isLight
              ? 'bg-white border-[#9fc1ee] shadow-sm hover:shadow-md'
              : 'bg-[#0b172d] border-blue-900/40 hover:border-blue-700/60 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold mb-2">
            <span className={isLight ? 'text-sky-900' : 'text-sky-300'}>Densidade Média</span>
            <Layers className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-black font-mono ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {averageDensity}%
            </span>
            <span className={`text-xs font-bold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              em {subcategories.length} módulos
            </span>
          </div>
          <div className="mt-2 text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate">
            {hasSubcategories ? (
              <span>
                {completedItemsCount}/{totalItemsCount} tópicos dominados
              </span>
            ) : (
              <span className="text-amber-600 dark:text-amber-400 font-bold">Trilha zerada (sem módulos)</span>
            )}
          </div>
        </div>

        {/* Card 4: Projeção de Conclusão */}
        <div
          className={`p-4 rounded-2xl border-2 transition-all ${
            isLight
              ? 'bg-white border-[#9fc1ee] shadow-sm hover:shadow-md'
              : 'bg-[#0b172d] border-blue-900/40 hover:border-blue-700/60 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold mb-2">
            <span className={isLight ? 'text-sky-900' : 'text-sky-300'}>Projeção de Conclusão</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-black font-mono ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Mês {projectedFinishMonth}
            </span>
            <span className={`text-xs font-bold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              de 18
            </span>
          </div>
          <div className="mt-2 text-[11px] font-medium">
            {projectedFinishMonth <= 18 ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                {18 - projectedFinishMonth === 0 ? 'Conclusão no prazo de 18M' : `${18 - projectedFinishMonth} meses antes da meta!`}
              </span>
            ) : (
              <span className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                + {projectedFinishMonth - 18} meses para prazo limite
              </span>
            )}
          </div>
        </div>
      </div>

      {/* CHART 1: EVOLUÇÃO DIÁRIA DOS ESTUDOS */}
      <div
        className={`p-5 rounded-2xl border-2 space-y-4 ${
          isLight ? 'bg-white border-[#8cb7ea] shadow-sm' : 'bg-[#0a1528] border-slate-800 shadow-sm'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-sky-500" />
              <h3 className={`text-base font-extrabold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Evolução Diária dos Estudos
              </h3>
            </div>
            <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Tempo real estudado por dia (horas/minutos) e comparação com a meta diária planejada.
            </p>
          </div>

          {/* Period selector */}
          <div
            className={`p-1 rounded-xl border flex items-center gap-1 shrink-0 ${
              isLight ? 'bg-slate-100 border-slate-200' : 'bg-[#060e1d] border-slate-700'
            }`}
          >
            {(['7d', '14d', '30d', '90d'] as PeriodFilter[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition ${
                  period === p
                    ? 'bg-sky-600 text-white shadow-xs'
                    : isLight
                    ? 'text-slate-600 hover:text-slate-900'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {p === '7d' ? '7 Dias' : p === '14d' ? '14 Dias' : p === '30d' ? '30 Dias' : '90 Dias'}
              </button>
            ))}
          </div>
        </div>

        {/* Recharts Area/Bar Chart for Daily Evolution */}
        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={dailyEvolutionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorEstudo" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={isLight ? '#e2e8f0' : '#1e293b'} vertical={false} />
              <XAxis
                dataKey="dayLabel"
                stroke={isLight ? '#64748b' : '#94a3b8'}
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: isLight ? '#cbd5e1' : '#334155' }}
              />
              <YAxis
                stroke={isLight ? '#64748b' : '#94a3b8'}
                fontSize={11}
                tickLine={false}
                axisLine={false}
                unit="h"
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div
                        className={`p-3 rounded-xl border text-xs shadow-xl space-y-1 ${
                          isLight
                            ? 'bg-white border-slate-200 text-slate-800'
                            : 'bg-[#071120] border-slate-700 text-white'
                        }`}
                      >
                        <div className="font-extrabold flex items-center justify-between gap-4">
                          <span>{label} ({data.dayOfWeek})</span>
                          <span className="text-[10px] text-slate-400 font-mono">{data.date}</span>
                        </div>
                        <div className="text-sky-500 font-bold flex items-center justify-between gap-4">
                          <span>Estudado:</span>
                          <span className="font-mono">{data.horasEstudadas}h ({data.minutosEstudados} min)</span>
                        </div>
                        {data.metaHoras > 0 && (
                          <div className="text-purple-400 flex items-center justify-between gap-4">
                            <span>Meta do Dia:</span>
                            <span className="font-mono">{data.metaHoras}h ({data.metaMinutos} min)</span>
                          </div>
                        )}
                        <div className="text-slate-400 text-[10px] pt-1 border-t border-slate-700/40">
                          {data.sessoesCount} sessão(ões) registrada(s)
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                wrapperStyle={{ paddingBottom: '12px', fontSize: '11px' }}
              />
              <Area
                type="monotone"
                dataKey="horasEstudadas"
                name="Horas Estudadas"
                stroke="#0ea5e9"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorEstudo)"
              />
              <Line
                type="stepAfter"
                dataKey="metaHoras"
                name="Meta Diária (h)"
                stroke="#a855f7"
                strokeWidth={1.8}
                strokeDasharray="4 4"
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Tip or Quick Insight on daily evolution */}
        <div
          className={`p-3 rounded-xl border text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 ${
            isLight ? 'bg-sky-50/70 border-sky-200 text-sky-950' : 'bg-sky-950/20 border-sky-800/40 text-sky-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-sky-500 shrink-0" />
            <span>
              <strong>Dica de Consistência:</strong> Dias agendados no cronograma desta trilha têm meta diária calculada automaticamente ({track.schedule?.weeklyTargetHours ? Math.round((track.schedule.weeklyTargetHours * 60) / Math.max(1, track.schedule.daysOfWeek?.length || 3)) : 60} min/sessão).
            </span>
          </div>
          {onStartPomodoro && (
            <button
              onClick={() => onStartPomodoro(track.title)}
              className="text-xs font-bold text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300 underline shrink-0 cursor-pointer"
            >
              Iniciar 25 min agora →
            </button>
          )}
        </div>
      </div>

      {/* TWO-COLUMN SECTION: DENSIDADE DE CONHECIMENTO & COMPARAÇÃO COM META DE 18 MESES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CHART 2: DENSIDADE DE CONHECIMENTO POR SUBCATEGORIA */}
        <div
          className={`p-5 rounded-2xl border-2 space-y-4 ${
            isLight ? 'bg-white border-[#8cb7ea] shadow-sm' : 'bg-[#0a1528] border-slate-800 shadow-sm'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-500" />
                <h3 className={`text-base font-extrabold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  Densidade de Conhecimento por Subcategoria
                </h3>
              </div>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Profundidade adquirida em cada módulo (tópicos, leituras e documentos).
              </p>
            </div>

            {hasSubcategories && (
              <div
                className={`p-1 rounded-xl border flex items-center gap-1 shrink-0 ${
                  isLight ? 'bg-slate-100 border-slate-200' : 'bg-[#060e1d] border-slate-700'
                }`}
              >
                <button
                  onClick={() => setDensityChartType('radar')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition ${
                    densityChartType === 'radar'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : isLight
                      ? 'text-slate-600 hover:text-slate-900'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Radar
                </button>
                <button
                  onClick={() => setDensityChartType('bar')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition ${
                    densityChartType === 'bar'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : isLight
                      ? 'text-slate-600 hover:text-slate-900'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Barras
                </button>
              </div>
            )}
          </div>

          {/* If track has zero subcategories, show pristine empty state */}
          {!hasSubcategories ? (
            <div
              className={`p-8 rounded-xl border-2 border-dashed text-center space-y-3 ${
                isLight ? 'border-slate-300 bg-slate-50/50' : 'border-slate-800 bg-[#060e1d]/40'
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 flex items-center justify-center mx-auto">
                <Compass className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className={`text-sm font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  Trilha Zerada (Pronta para Iniciar)
                </h4>
                <p className={`text-xs max-w-md mx-auto ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  Esta trilha ainda não possui módulos ou subcategorias computadas. Crie seus módulos de estudo para acompanhar a densidade de conhecimento!
                </p>
              </div>
              {onCreateModule && (
                <button
                  onClick={onCreateModule}
                  className="btn-3d-primary px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Adicionar Primeiro Módulo</span>
                </button>
              )}
            </div>
          ) : densityChartType === 'radar' && subcategoryDensityData.length >= 3 ? (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={subcategoryDensityData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
                  <PolarGrid stroke={isLight ? '#e2e8f0' : '#1e293b'} />
                  <PolarAngleAxis
                    dataKey="shortTitle"
                    tick={{ fill: isLight ? '#475569' : '#94a3b8', fontSize: 10, fontWeight: 600 }}
                  />
                  <PolarRadiusAxis
                    angle={30}
                    domain={[0, 100]}
                    stroke={isLight ? '#94a3b8' : '#475569'}
                    fontSize={10}
                  />
                  <Radar
                    name="Densidade Adquirida (%)"
                    dataKey="density"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.4}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div
                            className={`p-3 rounded-xl border text-xs shadow-xl space-y-1 ${
                              isLight
                                ? 'bg-white border-slate-200 text-slate-800'
                                : 'bg-[#071120] border-slate-700 text-white'
                            }`}
                          >
                            <div className="font-extrabold text-emerald-500">{data.title}</div>
                            <div className="flex items-center justify-between gap-4 font-bold">
                              <span>Densidade de Domínio:</span>
                              <span className="font-mono">{data.density}%</span>
                            </div>
                            <div className="flex items-center justify-between gap-4 text-slate-400 text-[10px]">
                              <span>Nível de Maturidade:</span>
                              <span className="font-semibold text-slate-200">{data.maturityLevel}</span>
                            </div>
                            <div className="flex items-center justify-between gap-4 text-slate-400 text-[10px]">
                              <span>Tópicos Concluídos:</span>
                              <span className="font-mono">{data.completedItems}/{data.totalItems}</span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            /* Bar Chart view of density or fallback if less than 3 modules */
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={subcategoryDensityData}
                  layout="vertical"
                  margin={{ top: 5, right: 20, left: 35, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={isLight ? '#e2e8f0' : '#1e293b'} horizontal={false} />
                  <XAxis
                    type="number"
                    domain={[0, 100]}
                    stroke={isLight ? '#64748b' : '#94a3b8'}
                    fontSize={11}
                    unit="%"
                  />
                  <YAxis
                    type="category"
                    dataKey="moduleNumber"
                    stroke={isLight ? '#64748b' : '#94a3b8'}
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div
                            className={`p-3 rounded-xl border text-xs shadow-xl space-y-1 ${
                              isLight
                                ? 'bg-white border-slate-200 text-slate-800'
                                : 'bg-[#071120] border-slate-700 text-white'
                            }`}
                          >
                            <div className="font-extrabold text-emerald-500">{data.title}</div>
                            <div className="flex items-center justify-between gap-4 font-bold">
                              <span>Densidade:</span>
                              <span className="font-mono">{data.density}%</span>
                            </div>
                            <div className="text-slate-400 text-[10px]">
                              {data.completedItems} de {data.totalItems} tópicos concluídos
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="density" name="Densidade (%)" fill="#10b981" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Module Density Badges Summary */}
          {hasSubcategories && (
            <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
              {subcategoryDensityData.map((m) => (
                <div
                  key={m.id}
                  className={`p-2 rounded-xl border flex items-center justify-between gap-3 text-xs ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#060e1d] border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10 shrink-0">
                      {m.moduleNumber}
                    </span>
                    <span className={`font-semibold truncate ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                      {m.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                        m.maturityLevel === 'Avançado'
                          ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                          : m.maturityLevel === 'Intermediário'
                          ? 'bg-sky-500/10 text-sky-500 border-sky-500/30'
                          : 'bg-amber-500/10 text-amber-500 border-amber-500/30'
                      }`}
                    >
                      {m.maturityLevel}
                    </span>
                    <span className="font-mono font-bold text-xs w-9 text-right">{m.density}%</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CHART 3: COMPARAÇÃO COM A META DE 18 MESES */}
        <div
          className={`p-5 rounded-2xl border-2 space-y-4 ${
            isLight ? 'bg-white border-[#8cb7ea] shadow-sm' : 'bg-[#0a1528] border-slate-800 shadow-sm'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-purple-500" />
                <h3 className={`text-base font-extrabold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  Comparação com a Meta Inicial de 18 Meses
                </h3>
              </div>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Curva linear planejada (5.5%/mês) vs progresso real conquistado e projeção de ritmo.
              </p>
            </div>

            {/* Change Current Month selector */}
            <div className="flex items-center gap-1.5 shrink-0">
              <span className={`text-[11px] font-semibold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Posição:
              </span>
              <select
                value={currentMonthCalculated}
                onChange={(e) => setSelectedMonthOffset(parseInt(e.target.value, 10))}
                className={`text-xs font-bold rounded-lg px-2 py-1 border transition cursor-pointer ${
                  isLight
                    ? 'bg-slate-100 border-slate-300 text-slate-800'
                    : 'bg-[#060e1d] border-slate-700 text-white'
                }`}
                title="Ajustar o mês atual da régua de 18 meses"
              >
                {Array.from({ length: 18 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>
                    Mês {m} de 18
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Recharts Line/Area Chart for 18-Month Pace */}
          <div className="h-72 w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={eighteenMonthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isLight ? '#e2e8f0' : '#1e293b'} vertical={false} />
                <XAxis
                  dataKey="month"
                  stroke={isLight ? '#64748b' : '#94a3b8'}
                  fontSize={10}
                  tickLine={false}
                  interval={2}
                  axisLine={{ stroke: isLight ? '#cbd5e1' : '#334155' }}
                />
                <YAxis
                  stroke={isLight ? '#64748b' : '#94a3b8'}
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  domain={[0, 100]}
                  unit="%"
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div
                          className={`p-3 rounded-xl border text-xs shadow-xl space-y-1.5 ${
                            isLight
                              ? 'bg-white border-slate-200 text-slate-800'
                              : 'bg-[#071120] border-slate-700 text-white'
                          }`}
                        >
                          <div className="font-extrabold flex items-center justify-between gap-4">
                            <span>{label}</span>
                            <span className="text-[10px] text-purple-400 font-mono">Ciclo 18M</span>
                          </div>
                          <div className="text-purple-400 flex items-center justify-between gap-4">
                            <span>Meta Planejada:</span>
                            <span className="font-mono font-bold">{data.metaIdeal}%</span>
                          </div>
                          {data.progressoReal !== null && (
                            <div className="text-sky-400 flex items-center justify-between gap-4">
                              <span>Progresso Real:</span>
                              <span className="font-mono font-bold">{data.progressoReal}%</span>
                            </div>
                          )}
                          {data.projecaoRitmo !== null && data.monthNum > currentMonthCalculated && (
                            <div className="text-emerald-400 flex items-center justify-between gap-4">
                              <span>Projeção de Ritmo:</span>
                              <span className="font-mono font-bold">{data.projecaoRitmo}%</span>
                            </div>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="circle"
                  wrapperStyle={{ paddingBottom: '12px', fontSize: '11px' }}
                />
                {/* 18-Month Ideal Reference Line */}
                <Line
                  type="monotone"
                  dataKey="metaIdeal"
                  name="Meta Ideal 18M"
                  stroke="#a855f7"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                />
                {/* Actual Realized Progress */}
                <Line
                  type="monotone"
                  dataKey="progressoReal"
                  name="Progresso Real"
                  stroke="#0ea5e9"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#0ea5e9', strokeWidth: 1, stroke: '#fff' }}
                  connectNulls={false}
                />
                {/* Projected pace based on current performance */}
                <Line
                  type="monotone"
                  dataKey="projecaoRitmo"
                  name="Projeção Futura"
                  stroke="#10b981"
                  strokeWidth={2}
                  strokeDasharray="3 3"
                  dot={false}
                  connectNulls={true}
                />
                {/* Reference line marking the current month */}
                <ReferenceLine
                  x={`Mês ${currentMonthCalculated}`}
                  stroke="#f59e0b"
                  strokeDasharray="3 3"
                  label={{
                    value: `Mês Atual (${currentMonthCalculated})`,
                    fill: '#f59e0b',
                    fontSize: 10,
                    position: 'top',
                  }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Strategic Analysis & Insights Card */}
          <div
            className={`p-3.5 rounded-xl border space-y-2 text-xs ${
              isLight ? 'bg-purple-50/60 border-purple-200 text-purple-950' : 'bg-purple-950/20 border-purple-800/40 text-purple-200'
            }`}
          >
            <div className="flex items-center justify-between font-bold">
              <span className="flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-purple-500" />
                Diagnóstico Estratégico do Ciclo de 18 Meses:
              </span>
              <span className="font-mono text-purple-600 dark:text-purple-300">
                {18 - currentMonthCalculated} meses restantes
              </span>
            </div>

            <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">
              {progressPercentage === 0 ? (
                <>Esta trilha está no ponto inicial. Mantendo um ritmo de <strong>~5.5% de avanço por mês</strong> (~1 a 2 tópicos/semana), você completará todos os módulos dentro do plano inicial de 18 meses com folga.</>
              ) : progressGap >= 0 ? (
                <>Excelente desempenho! Você alcançou <strong>{progressPercentage}%</strong> da trilha no Mês {currentMonthCalculated}, ficando <strong>{progressGap}% acima</strong> do planejado ({targetProgressCurrentMonth}%). No ritmo atual, a estimativa de conclusão é no <strong>Mês {projectedFinishMonth}</strong>.</>
              ) : (
                <>Atenção ao ritmo: você está com <strong>{progressPercentage}%</strong> contra a meta esperada de <strong>{targetProgressCurrentMonth}%</strong> para o Mês {currentMonthCalculated} ({Math.abs(progressGap)}% de defasagem). Recomenda-se adicionar 1 sessão de estudo semanal no cronograma da trilha.</>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* QUICK LOG STUDY HOURS MODAL */}
      {isQuickLogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div
            className={`w-full max-w-md p-6 rounded-2xl border-2 space-y-4 shadow-2xl ${
              isLight ? 'bg-white border-[#8cb7ea]' : 'bg-[#09152a] border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-sky-500" />
                <h3 className={`text-base font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  Registrar Estudo na Trilha
                </h3>
              </div>
              <button
                onClick={() => setIsQuickLogOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
              Computa o tempo dedicado especificamente à trilha <strong>{track.title}</strong>, atualizando o gráfico de evolução diária e o ritmo de 18 meses.
            </p>

            <form onSubmit={handleQuickLog} className="space-y-4">
              <div>
                <label className={`block text-xs font-bold mb-1.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  Tempo Estudado (em horas):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.25"
                    min="0.25"
                    max="12"
                    value={quickHours}
                    onChange={(e) => setQuickHours(e.target.value)}
                    className={`flex-1 p-2.5 rounded-xl border text-sm font-bold font-mono focus:outline-none ${
                      isLight
                        ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-sky-500'
                        : 'bg-[#050c18] border-slate-700 text-white focus:border-sky-500'
                    }`}
                  />
                  <div className="flex gap-1">
                    {['0.5', '1', '1.5', '2'].map((val) => (
                      <button
                        type="button"
                        key={val}
                        onClick={() => setQuickHours(val)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-bold font-mono border cursor-pointer transition ${
                          quickHours === val
                            ? 'bg-sky-600 text-white border-sky-600'
                            : isLight
                            ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
                            : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
                        }`}
                      >
                        {val}h
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsQuickLogOpen(false)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer ${
                    isLight ? 'text-slate-600 hover:bg-slate-100' : 'text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-3d-primary px-4 py-2 rounded-xl text-xs font-bold cursor-pointer shadow-md"
                >
                  Confirmar Registro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
