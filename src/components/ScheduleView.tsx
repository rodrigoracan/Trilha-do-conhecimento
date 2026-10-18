import React, { useState } from 'react';
import { ScheduleGate, Certification, StudySession } from '../types';
import { BurnDownChart } from './BurnDownChart';
import {
  Calendar,
  Clock,
  CheckCircle2,
  Plus,
  Flame,
  Award,
  Target
} from 'lucide-react';

interface ScheduleViewProps {
  gates: ScheduleGate[];
  certifications: Certification[];
  studySessions: StudySession[];
  targetHoursWeekly: number;
  onUpdateGates: (gates: ScheduleGate[]) => void;
  onLogManualHours: (hours: number, certId?: string) => void;
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({
  gates,
  certifications,
  studySessions,
  targetHoursWeekly,
  onUpdateGates,
  onLogManualHours,
}) => {
  const [manualHours, setManualHours] = useState<number>(1);
  const [selectedCertId, setSelectedCertId] = useState<string>('');
  const [showLogModal, setShowLogModal] = useState(false);

  // Weekly hours calculation (past 7 days)
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  const currentWeekMinutes = studySessions
    .filter((s) => new Date(s.date) >= oneWeekAgo && s.mode === 'focus')
    .reduce((acc, curr) => acc + curr.minutes, 0);

  const totalHoursSpentInCerts = certifications.reduce((acc, c) => acc + c.hoursSpent, 0);
  const currentWeekHours = Number((currentWeekMinutes / 60).toFixed(1));
  const weekProgressPercent = Math.min(
    100,
    Math.round((currentWeekHours / targetHoursWeekly) * 100)
  );

  const toggleGateDeliverable = (gateNumber: number, deliverableIdx: number) => {
    const updated = gates.map((g) => {
      if (g.gateNumber !== gateNumber) return g;
      const newDeliverables = [...g.deliverables];
      const item = newDeliverables[deliverableIdx];
      if (item.startsWith('[x] ')) {
        newDeliverables[deliverableIdx] = item.replace('[x] ', '');
      } else {
        newDeliverables[deliverableIdx] = `[x] ${item}`;
      }
      return { ...g, deliverables: newDeliverables };
    });
    onUpdateGates(updated);
  };

  const handleGateStatusChange = (gateNumber: number, newStatus: ScheduleGate['status']) => {
    const updated = gates.map((g) =>
      g.gateNumber === gateNumber ? { ...g, status: newStatus } : g
    );
    onUpdateGates(updated);
  };

  const submitManualHours = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualHours <= 0) return;
    onLogManualHours(manualHours, selectedCertId || undefined);
    setShowLogModal(false);
  };

  return (
    <div className="space-y-4">
      {/* Minimalist Goal Header */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1 w-full sm:w-auto">
          <div className="flex items-center justify-between mb-1.5 text-xs">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-sky-400" />
              Meta Semanal: {currentWeekHours}h de {targetHoursWeekly}h ({weekProgressPercent}%)
            </span>
            <span className="text-slate-400">
              Total acumulado: <strong className="text-slate-200">{totalHoursSpentInCerts}h</strong>
            </span>
          </div>

          <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-sky-500 rounded-full transition-all duration-300"
              style={{ width: `${weekProgressPercent}%` }}
            />
          </div>
        </div>

        <button
          onClick={() => setShowLogModal(true)}
          className="btn-3d-emerald px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer shrink-0 self-end sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          Registrar Horas
        </button>
      </div>

      {/* 18-Month Burn-Down Chart (Recharts) */}
      <BurnDownChart
        certifications={certifications}
        studySessions={studySessions}
        gates={gates}
        targetHoursWeekly={targetHoursWeekly}
      />

      {/* Minimal Gaps Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
          <span className="font-bold text-sky-400 font-mono">G1 · Políticas</span>
          <p className="text-slate-400 mt-0.5">Política de IA e matrizes de impacto corporativo.</p>
        </div>
        <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
          <span className="font-bold text-emerald-400 font-mono">G2 · Certificações</span>
          <p className="text-slate-400 mt-0.5">ISO 42001, IAPP AIGP, ISACA AAIA e Security+.</p>
        </div>
        <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
          <span className="font-bold text-purple-400 font-mono">G3 · Liderança</span>
          <p className="text-slate-400 mt-0.5">Comunicação executiva com o conselho e ROI de IA.</p>
        </div>
      </div>

      {/* The 5 Gates List */}
      <div className="space-y-3">
        {gates.map((gate) => {
          const isCurrent = gate.status === 'Em Andamento';

          return (
            <div
              key={gate.gateNumber}
              className={`box-3d p-4 transition ${
                isCurrent ? 'border-sky-500/60' : ''
              }`}
            >
              <div className="flex items-center justify-between gap-3 pb-2.5 border-b border-slate-800 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white font-mono bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                    G{gate.gateNumber}
                  </span>
                  <span className="font-semibold text-slate-200">{gate.title}</span>
                  <span className="text-slate-500">·</span>
                  <span className="text-slate-400">{gate.period}</span>
                </div>

                <select
                  value={gate.status}
                  onChange={(e) =>
                    handleGateStatusChange(gate.gateNumber, e.target.value as ScheduleGate['status'])
                  }
                  className="px-2 py-0.5 rounded text-xs bg-slate-950 border border-slate-800 text-slate-300 cursor-pointer focus:outline-none"
                >
                  <option value="Em Andamento">Em Andamento</option>
                  <option value="Concluído">Concluído</option>
                  <option value="Futuro">Futuro</option>
                </select>
              </div>

              <p className="text-xs text-slate-300 mt-2">
                {gate.description}
              </p>

              {/* Deliverables Checklist */}
              <div className="mt-2.5 pt-2 border-t border-slate-800/80 space-y-1">
                {gate.deliverables.map((item, idx) => {
                  const done = item.startsWith('[x] ');
                  const text = done ? item.replace('[x] ', '') : item;

                  return (
                    <div
                      key={idx}
                      onClick={() => toggleGateDeliverable(gate.gateNumber, idx)}
                      className={`text-xs cursor-pointer flex items-center gap-2 p-1.5 rounded transition ${
                        done ? 'text-slate-500 line-through' : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={done}
                        onChange={() => {}}
                        className="rounded text-sky-500 bg-slate-950 border-slate-700 cursor-pointer w-3.5 h-3.5"
                      />
                      <span>{text}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Manual Hour Logging Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-xl p-5 text-slate-100">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-emerald-400" />
              Registrar Horas de Estudo
            </h3>

            <form onSubmit={submitManualHours} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Horas:</label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="12"
                  value={manualHours}
                  onChange={(e) => setManualHours(Number(e.target.value))}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Certificação (opcional):</label>
                <select
                  value={selectedCertId}
                  onChange={(e) => setSelectedCertId(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded text-white focus:outline-none"
                >
                  <option value="">Geral</option>
                  {certifications.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="px-3 py-1 rounded bg-slate-800 text-slate-300 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-3d-emerald px-3 py-1 rounded font-semibold cursor-pointer"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
