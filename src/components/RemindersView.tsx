import React, { useState } from 'react';
import { ActionReminder, Certification } from '../types';
import {
  Plus,
  Trash2,
  Calendar
} from 'lucide-react';

interface RemindersViewProps {
  reminders: ActionReminder[];
  certifications: Certification[];
  onToggleReminder: (id: string) => void;
  onAddReminder: (reminder: Omit<ActionReminder, 'id' | 'createdAt'>) => void;
  onDeleteReminder: (id: string) => void;
}

export const RemindersView: React.FC<RemindersViewProps> = ({
  reminders,
  certifications,
  onToggleReminder,
  onAddReminder,
  onDeleteReminder,
}) => {
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<ActionReminder['priority']>('Alta');
  const [certId, setCertId] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddReminder({
      title: title.trim(),
      dueDate: dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      priority,
      completed: false,
      certificationId: certId || undefined,
    });

    setTitle('');
    setDueDate('');
    setPriority('Alta');
    setCertId('');
  };

  const filteredReminders = reminders.filter((r) => {
    if (filter === 'pending') return !r.completed;
    if (filter === 'completed') return r.completed;
    return true;
  });

  const pendingCount = reminders.filter((r) => !r.completed).length;

  return (
    <div className="space-y-4">
      {/* Header & Filter */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-white tracking-tight">Ações & Lembretes</h2>
          <span className="text-slate-400 font-mono">({pendingCount} pendentes)</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setFilter('all')}
            className={`px-2.5 py-1 rounded text-xs transition cursor-pointer ${
              filter === 'all' ? 'bg-slate-800 text-sky-400 font-medium' : 'text-slate-400 hover:text-white'
            }`}
          >
            Todas ({reminders.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-2.5 py-1 rounded text-xs transition cursor-pointer ${
              filter === 'pending' ? 'bg-slate-800 text-sky-400 font-medium' : 'text-slate-400 hover:text-white'
            }`}
          >
            Pendentes ({pendingCount})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-2.5 py-1 rounded text-xs transition cursor-pointer ${
              filter === 'completed' ? 'bg-slate-800 text-sky-400 font-medium' : 'text-slate-400 hover:text-white'
            }`}
          >
            Concluídas
          </button>
        </div>
      </div>

      {/* Add Action Form */}
      <div className="box-3d p-4">
        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-slate-400 mb-1">Ação / Meta:</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Fazer simulado de 50 questões ou Ler Cláusula 6.1..."
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Prazo:</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Prioridade:</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as ActionReminder['priority'])}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none"
              >
                <option value="Alta">Alta</option>
                <option value="Média">Média</option>
                <option value="Baixa">Baixa</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="w-1/2">
              <select
                value={certId}
                onChange={(e) => setCertId(e.target.value)}
                className="w-full px-2.5 py-1 bg-slate-950 border border-slate-800 rounded text-slate-300 focus:outline-none text-[11px]"
              >
                <option value="">Geral</option>
                {certifications.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="btn-3d-primary px-4 py-1.5 rounded-lg font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Adicionar
            </button>
          </div>
        </form>
      </div>

      {/* Checklist */}
      <div className="space-y-1.5">
        {filteredReminders.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-500">
            Nenhuma ação pendente.
          </div>
        ) : (
          filteredReminders.map((rem) => {
            const cert = certifications.find((c) => c.id === rem.certificationId);

            return (
              <div
                key={rem.id}
                className={`p-3 rounded-lg border flex items-center justify-between gap-3 text-xs transition ${
                  rem.completed
                    ? 'bg-slate-950/40 border-slate-800/60 text-slate-500'
                    : 'bg-slate-900 border-slate-800 text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <input
                    type="checkbox"
                    checked={rem.completed}
                    onChange={() => onToggleReminder(rem.id)}
                    className="w-3.5 h-3.5 rounded text-sky-500 bg-slate-950 border-slate-700 cursor-pointer"
                  />

                  <div className="truncate">
                    <span className={rem.completed ? 'line-through text-slate-500' : 'font-medium'}>
                      {rem.title}
                    </span>
                    <span className="text-slate-500 mx-1.5">·</span>
                    {cert && (
                      <span className="font-mono text-sky-400 mr-1.5">{cert.code}</span>
                    )}
                    <span className="text-slate-400 text-[11px]">
                      Prazo: {rem.dueDate}
                    </span>
                    <span className="text-slate-500 mx-1">·</span>
                    <span
                      className={`text-[10px] font-semibold ${
                        rem.priority === 'Alta'
                          ? 'text-rose-400'
                          : rem.priority === 'Média'
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {rem.priority}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (confirm(`Remover "${rem.title}"?`)) onDeleteReminder(rem.id);
                  }}
                  className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer shrink-0"
                  title="Excluir"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
