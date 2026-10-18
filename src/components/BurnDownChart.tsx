import React, { useState, useMemo } from 'react';
import { Certification, StudySession, ScheduleGate } from '../types';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Area,
  AreaChart,
  ReferenceLine,
} from 'recharts';
import {
  TrendingDown,
  BarChart3,
  Calendar,
  Flame,
  CheckCircle2,
  Clock,
  Target,
  Zap,
  Info,
  Layers,
} from 'lucide-react';

interface BurnDownChartProps {
  certifications: Certification[];
  studySessions: StudySession[];
  gates: ScheduleGate[];
  targetHoursWeekly: number;
}

type ChartMode = 'burndown' | 'comparison' | 'gates';

export const BurnDownChart: React.FC<BurnDownChartProps> = ({
  certifications,
  studySessions,
  gates,
  targetHoursWeekly,
}) => {
  const [selectedCertId, setSelectedCertId] = useState<string>('all');
  const [chartMode, setChartMode] = useState<ChartMode>('burndown');

  // Overall totals
  const totalGoalHours = useMemo(() => {
    return certifications.reduce((acc, c) => acc + (c.estimatedHours || 0), 0);
  }, [certifications]);

  const totalStudiedHours = useMemo(() => {
    return certifications.reduce((acc, c) => acc + (c.hoursSpent || 0), 0);
  }, [certifications]);

  const totalRemainingHours = Math.max(0, totalGoalHours - totalStudiedHours);
  const overallProgressPercent = totalGoalHours > 0 ? Math.round((totalStudiedHours / totalGoalHours) * 100) : 0;

  // Selected certification stats (if single cert is chosen)
  const selectedCert = useMemo(() => {
    return certifications.find((c) => c.id === selectedCertId);
  }, [certifications, selectedCertId]);

  // Velocity calculation: past 4 weeks (or all sessions if recent)
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const recentMinutes = useMemo(() => {
    return studySessions
      .filter((s) => new Date(s.date) >= thirtyDaysAgo && s.mode === 'focus')
      .reduce((acc, curr) => acc + curr.minutes, 0);
  }, [studySessions]);

  const weeklyVelocityHours = Number(((recentMinutes / 60) * (7 / 30)).toFixed(1)) || 0;
  // Fallback to weekly target if no sessions recorded yet for projection baseline
  const activeVelocity = weeklyVelocityHours > 0 ? weeklyVelocityHours : targetHoursWeekly;

  // Weeks remaining in 18-month plan (~78 weeks total in 18 months)
  const totalWeeks = 78;
  // Estimate current month position based on completed hours or default to month 1
  const completedWeeksEquivalent = activeVelocity > 0 ? totalStudiedHours / activeVelocity : 0;
  const currentMonthEstimated = Math.min(18, Math.max(1, Math.round((completedWeeksEquivalent / totalWeeks) * 18) || 1));
  const remainingWeeksEstimated = Math.max(1, totalWeeks - completedWeeksEquivalent);
  const idealWeeklyPaceNeeded = Number((totalRemainingHours / remainingWeeksEstimated).toFixed(1));

  // 1. Data for 18-Month Burn-down Timeline
  const burndownData = useMemo(() => {
    const months = Array.from({ length: 18 }, (_, i) => i + 1);

    // If single cert selected
    if (selectedCert) {
      const certGoal = selectedCert.estimatedHours || 60;
      const certSpent = selectedCert.hoursSpent || 0;

      // Extract target start/end months from string like 'Meses 2 a 4' or 'Mês 1'
      const matchRange = selectedCert.targetMonths.match(/(\d+)\s*(?:a|-|to)\s*(\d+)/i);
      const matchSingle = selectedCert.targetMonths.match(/(\d+)/);
      const startMonth = matchRange ? parseInt(matchRange[1], 10) : matchSingle ? parseInt(matchSingle[1], 10) : 1;
      const endMonth = matchRange ? parseInt(matchRange[2], 10) : startMonth + 3;

      return months.map((month) => {
        // Ideal burn-down curve for this cert
        let idealRemaining = certGoal;
        if (month < startMonth) {
          idealRemaining = certGoal;
        } else if (month >= endMonth) {
          idealRemaining = 0;
        } else {
          const duration = Math.max(1, endMonth - startMonth);
          const elapsed = month - startMonth;
          idealRemaining = Math.max(0, Math.round(certGoal - (certGoal * elapsed) / duration));
        }

        // Actual / Projected remaining
        let actualRemaining: number | null = null;
        let projectedRemaining: number | null = null;

        if (month <= currentMonthEstimated) {
          // Proportionate actual remaining up to current month
          const progressRatio = currentMonthEstimated > 0 ? month / currentMonthEstimated : 1;
          const currentSpentSoFar = certSpent * progressRatio;
          actualRemaining = Math.max(0, Math.round(certGoal - currentSpentSoFar));
        } else {
          // Project forward from current actual
          const monthsAhead = month - currentMonthEstimated;
          const currentActual = Math.max(0, certGoal - certSpent);
          projectedRemaining = Math.max(0, Math.round(currentActual - (certGoal / Math.max(1, endMonth - startMonth)) * monthsAhead));
        }

        return {
          month: `Mês ${month}`,
          monthNum: month,
          ideal: idealRemaining,
          realizadoRestante: actualRemaining,
          projecao: projectedRemaining ?? (month === currentMonthEstimated ? actualRemaining : null),
          horasEstudadasAcumuladas: month <= currentMonthEstimated ? Math.round((certSpent * month) / currentMonthEstimated) : null,
        };
      });
    }

    // Consolidated 18-month burn-down for ALL certifications
    // We map scheduled hours drop off as gates/months progress
    return months.map((month) => {
      // Ideal burn-down linear slope from totalGoalHours to 0
      const idealRemaining = Math.max(0, Math.round(totalGoalHours - (totalGoalHours * month) / 18));

      // Actual remaining hours (reported for months up to current)
      let actualRemaining: number | null = null;
      let projectedRemaining: number | null = null;

      if (month <= currentMonthEstimated) {
        const spentUpToMonth = currentMonthEstimated > 0 ? (totalStudiedHours * month) / currentMonthEstimated : 0;
        actualRemaining = Math.max(0, Math.round(totalGoalHours - spentUpToMonth));
      } else {
        // Project forward using current weekly velocity
        const weeksAhead = (month - currentMonthEstimated) * 4.33;
        const currentActual = Math.max(0, totalGoalHours - totalStudiedHours);
        projectedRemaining = Math.max(0, Math.round(currentActual - activeVelocity * weeksAhead));
      }

      // Burn-up: cumulative hours studied
      const cumulativeStudied =
        month <= currentMonthEstimated
          ? Math.round((totalStudiedHours * month) / currentMonthEstimated)
          : null;

      return {
        month: `Mês ${month}`,
        monthNum: month,
        ideal: idealRemaining,
        realizadoRestante: actualRemaining,
        projecao: projectedRemaining ?? (month === currentMonthEstimated ? actualRemaining : null),
        horasEstudadasAcumuladas: cumulativeStudied,
      };
    });
  }, [selectedCert, totalGoalHours, totalStudiedHours, currentMonthEstimated, activeVelocity]);

  // 2. Data for Certifications Comparison Bar Chart
  const comparisonData = useMemo(() => {
    return certifications.map((c) => {
      const goal = c.estimatedHours || 0;
      const studied = c.hoursSpent || 0;
      const remaining = Math.max(0, goal - studied);
      const percent = goal > 0 ? Math.round((studied / goal) * 100) : 0;

      return {
        name: c.code,
        fullName: c.title,
        meta: goal,
        estudadas: studied,
        restantes: remaining,
        progresso: percent,
        gate: c.targetGate,
        meses: c.targetMonths,
      };
    });
  }, [certifications]);

  // 3. Data for Gate Comparison
  const gateData = useMemo(() => {
    return gates.map((g) => {
      // Find certs assigned to this gate
      const certsInGate = certifications.filter((c) => c.targetGate.includes(`Gate ${g.gateNumber}`) || c.targetGate.includes(`G${g.gateNumber}`));
      const gateGoal = certsInGate.reduce((acc, c) => acc + (c.estimatedHours || 0), 0);
      const gateStudied = certsInGate.reduce((acc, c) => acc + (c.hoursSpent || 0), 0);
      const gateRemaining = Math.max(0, gateGoal - gateStudied);

      return {
        gate: `G${g.gateNumber}`,
        title: g.title,
        period: g.period,
        status: g.status,
        meta: gateGoal,
        estudadas: gateStudied,
        restantes: gateRemaining,
        numCerts: certsInGate.length,
      };
    });
  }, [gates, certifications]);

  // Custom Recharts Tooltip Component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    return (
      <div className="bg-slate-950/95 border border-slate-700/80 rounded-xl p-3 shadow-2xl backdrop-blur-md text-xs min-w-[200px]">
        <div className="font-bold text-white border-b border-slate-800 pb-1.5 mb-2 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-sky-400" />
            {label}
          </span>
          {selectedCert && (
            <span className="text-[10px] text-sky-300 font-mono bg-sky-950/60 px-1.5 py-0.5 rounded border border-sky-800/60">
              {selectedCert.code}
            </span>
          )}
        </div>
        <div className="space-y-1.5">
          {payload.map((item: any, idx: number) => {
            if (item.value === null || item.value === undefined) return null;
            return (
              <div key={idx} className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: item.color || item.fill }}
                  />
                  {item.name}:
                </span>
                <span className="font-bold text-white font-mono">{item.value}h</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800/90 shadow-xl space-y-4">
      {/* Top Header & Mode Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-400">
              <TrendingDown className="w-4 h-4" />
            </span>
            <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
              Burn-Down de Horas & Progresso (18 Meses)
            </h2>
            <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Recharts Visualizer
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Acompanhe a queima de horas restantes rumo à meta de cada certificação do plano executivo.
          </p>
        </div>

        {/* View Mode Toggle Buttons */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0 self-start md:self-auto">
          <button
            type="button"
            onClick={() => setChartMode('burndown')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              chartMode === 'burndown'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingDown className="w-3.5 h-3.5" />
            Curva 18M
          </button>
          <button
            type="button"
            onClick={() => setChartMode('comparison')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              chartMode === 'comparison'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Por Certificação
          </button>
          <button
            type="button"
            onClick={() => setChartMode('gates')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              chartMode === 'gates'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Por Gates
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        {/* Meta Total */}
        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span>Meta Total</span>
            <Target className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div className="text-lg font-bold text-white font-mono">
            {selectedCert ? selectedCert.estimatedHours : totalGoalHours}h
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5 truncate">
            {selectedCert ? selectedCert.code : `${certifications.length} certificações`}
          </div>
        </div>

        {/* Horas Estudadas */}
        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span>Horas Estudadas</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <div className="text-lg font-bold text-sky-400 font-mono">
            {selectedCert ? selectedCert.hoursSpent : totalStudiedHours}h
          </div>
          <div className="text-[10px] text-sky-500/80 mt-0.5 font-medium">
            {overallProgressPercent}% concluído
          </div>
        </div>

        {/* Horas a Queimar (Restantes) */}
        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span>Horas Restantes</span>
            <Flame className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-lg font-bold text-amber-400 font-mono">
            {selectedCert ? Math.max(0, selectedCert.estimatedHours - selectedCert.hoursSpent) : totalRemainingHours}h
          </div>
          <div className="text-[10px] text-amber-500/80 mt-0.5">
            A queimar no cronograma
          </div>
        </div>

        {/* Ritmo Semanal Ideal */}
        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span>Ritmo Necessário</span>
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-lg font-bold text-emerald-400 font-mono">
            {idealWeeklyPaceNeeded}h<span className="text-xs font-normal text-slate-400">/sem</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            Meta ativa: {targetHoursWeekly}h/sem
          </div>
        </div>
      </div>

      {/* Filter / Selector Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2 text-xs">
          <label className="text-slate-400 font-medium shrink-0">Foco de Análise:</label>
          <select
            value={selectedCertId}
            onChange={(e) => setSelectedCertId(e.target.value)}
            className="w-full sm:w-auto px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 text-xs font-medium cursor-pointer focus:outline-none focus:border-sky-500 transition"
          >
            <option value="all">Todas as Certificações (Consolidado 18 Meses)</option>
            {certifications.map((cert) => (
              <option key={cert.id} value={cert.id}>
                {cert.code} — {cert.targetMonths} ({cert.hoursSpent}h / {cert.estimatedHours}h)
              </option>
            ))}
          </select>
        </div>

        <div className="text-[11px] text-slate-400 flex items-center gap-1.5 self-end sm:self-auto">
          <Info className="w-3 h-3 text-sky-400" />
          <span>Linha ideal queima de <strong>{selectedCert ? selectedCert.estimatedHours : totalGoalHours}h</strong> até <strong>0h</strong></span>
        </div>
      </div>

      {/* CHART CANVAS AREA */}
      <div className="w-full h-[320px] bg-slate-950/60 rounded-xl p-3 border border-slate-800/80">
        <ResponsiveContainer width="100%" height="100%">
          {chartMode === 'burndown' ? (
            <LineChart data={burndownData} margin={{ top: 15, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis
                dataKey="month"
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
              />
              <YAxis
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
                unit="h"
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: '10px', fontSize: '11px' }}
                iconType="circle"
              />

              {/* Reference line at 0h target */}
              <ReferenceLine y={0} stroke="#334155" strokeDasharray="3 3" label={{ value: 'Meta Concluída', fill: '#10b981', fontSize: 10 }} />

              {/* Ideal Burn-down curve */}
              <Line
                type="monotone"
                dataKey="ideal"
                name="Meta Ideal (Restante)"
                stroke="#818cf8"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ r: 3, fill: '#818cf8' }}
                activeDot={{ r: 6, fill: '#c7d2fe' }}
              />

              {/* Actual Remaining curve */}
              <Line
                type="monotone"
                dataKey="realizadoRestante"
                name="Realizado (Restante)"
                stroke="#38bdf8"
                strokeWidth={3}
                dot={{ r: 4, fill: '#0284c7' }}
                activeDot={{ r: 7, fill: '#38bdf8' }}
                connectNulls={false}
              />

              {/* Projection based on current velocity */}
              <Line
                type="monotone"
                dataKey="projecao"
                name="Projeção no Ritmo Atual"
                stroke="#34d399"
                strokeWidth={2}
                strokeDasharray="3 3"
                dot={{ r: 3, fill: '#34d399' }}
                activeDot={{ r: 5, fill: '#6ee7b7' }}
                connectNulls={true}
              />

              {/* Cumulative hours studied (Burn-up line) */}
              <Line
                type="monotone"
                dataKey="horasEstudadasAcumuladas"
                name="Horas Acumuladas Estudadas"
                stroke="#f59e0b"
                strokeWidth={1.5}
                dot={{ r: 2, fill: '#f59e0b' }}
                connectNulls={false}
              />
            </LineChart>
          ) : chartMode === 'comparison' ? (
            <BarChart data={comparisonData} margin={{ top: 15, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis
                dataKey="name"
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
              />
              <YAxis
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
                unit="h"
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: '10px', fontSize: '11px' }}
                iconType="circle"
              />

              <Bar dataKey="meta" name="Meta (Estimada)" fill="#475569" radius={[4, 4, 0, 0]} />
              <Bar dataKey="estudadas" name="Horas Estudadas" fill="#0284c7" radius={[4, 4, 0, 0]} />
              <Bar dataKey="restantes" name="Horas Restantes" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          ) : (
            <BarChart data={gateData} margin={{ top: 15, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis
                dataKey="gate"
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
              />
              <YAxis
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
                unit="h"
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: '10px', fontSize: '11px' }}
                iconType="circle"
              />

              <Bar dataKey="meta" name="Carga Horária Planejada" fill="#64748b" radius={[4, 4, 0, 0]} />
              <Bar dataKey="estudadas" name="Horas Concluídas" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="restantes" name="Horas Pendentes" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Breakdown Cards for each certification */}
      <div className="space-y-2 pt-2">
        <div className="flex items-center justify-between text-xs text-slate-400 font-semibold px-1">
          <span>Progresso Individual por Certificação</span>
          <span>Meta vs Queimado</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {certifications.map((cert) => {
            const goal = cert.estimatedHours || 0;
            const spent = cert.hoursSpent || 0;
            const remaining = Math.max(0, goal - spent);
            const pct = goal > 0 ? Math.min(100, Math.round((spent / goal) * 100)) : 0;
            const isSelected = selectedCertId === cert.id;

            return (
              <div
                key={cert.id}
                onClick={() => setSelectedCertId(cert.id === selectedCertId ? 'all' : cert.id)}
                className={`p-3 rounded-xl border transition cursor-pointer text-xs ${
                  isSelected
                    ? 'bg-sky-950/40 border-sky-500/80 shadow-md ring-1 ring-sky-500/30'
                    : 'bg-slate-950/50 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="font-bold text-white font-mono">{cert.code}</span>
                    <span className="text-[10px] text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                      {cert.targetGate}
                    </span>
                  </div>
                  <span className="font-mono text-xs font-bold text-sky-400 shrink-0">
                    {spent}h / {goal}h ({pct}%)
                  </span>
                </div>

                <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800 mb-2">
                  <div
                    className="h-full bg-gradient-to-r from-sky-500 to-emerald-400 rounded-full transition-all duration-300"
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="truncate">{cert.targetMonths}</span>
                  <span className="font-mono text-amber-400/90 font-medium">
                    {remaining}h restantes
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
