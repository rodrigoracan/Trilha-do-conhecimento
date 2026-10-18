import React, { useState } from 'react';
import { Certification, Simulado } from '../types';
import {
  X,
  Plus,
  Trash2,
  Edit2,
  FileCheck,
  Award,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Save,
  BookOpen,
  Calendar,
  Clock,
  Sparkles
} from 'lucide-react';

interface SimuladosModalProps {
  isOpen: boolean;
  onClose: () => void;
  cert: Certification | null;
  onUpdateCert: (cert: Certification) => void;
  onSendToNotes?: (title: string, content: string) => void;
}

export const SimuladosModal: React.FC<SimuladosModalProps> = ({
  isOpen,
  onClose,
  cert,
  onUpdateCert,
  onSendToNotes,
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSimuladoId, setEditingSimuladoId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [totalQuestions, setTotalQuestions] = useState<number>(50);
  const [correctAnswers, setCorrectAnswers] = useState<number>(40);
  const [passingScorePercentage, setPassingScorePercentage] = useState<number>(75);
  const [timeSpentMinutes, setTimeSpentMinutes] = useState<number>(60);
  const [difficulty, setDifficulty] = useState<'Fácil' | 'Médio' | 'Difícil' | 'Oficial'>('Oficial');
  const [notes, setNotes] = useState('');
  const [url, setUrl] = useState('');

  if (!isOpen || !cert) return null;

  const simuladosList = cert.simulados || [];

  // Metrics
  const totalCount = simuladosList.length;
  const passedCount = simuladosList.filter((s) => s.passed).length;
  const avgScore = totalCount > 0
    ? Math.round(simuladosList.reduce((acc, s) => acc + s.scorePercentage, 0) / totalCount)
    : 0;
  const bestScore = totalCount > 0
    ? Math.max(...simuladosList.map((s) => s.scorePercentage))
    : 0;

  const resetForm = () => {
    setTitle('');
    setDate(new Date().toISOString().split('T')[0]);
    setTotalQuestions(50);
    setCorrectAnswers(40);
    setPassingScorePercentage(75);
    setTimeSpentMinutes(60);
    setDifficulty('Oficial');
    setNotes('');
    setUrl('');
    setEditingSimuladoId(null);
    setIsFormOpen(false);
  };

  const handleEdit = (sim: Simulado) => {
    setEditingSimuladoId(sim.id);
    setTitle(sim.title);
    setDate(sim.date);
    setTotalQuestions(sim.totalQuestions);
    setCorrectAnswers(sim.correctAnswers);
    setPassingScorePercentage(sim.passingScorePercentage);
    setTimeSpentMinutes(sim.timeSpentMinutes || 60);
    setDifficulty(sim.difficulty || 'Oficial');
    setNotes(sim.notes || '');
    setUrl(sim.url || '');
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Excluir este simulado do histórico?')) {
      const updated = simuladosList.filter((s) => s.id !== id);
      onUpdateCert({ ...cert, simulados: updated });
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || totalQuestions <= 0) return;

    const validatedCorrect = Math.min(Math.max(0, correctAnswers), totalQuestions);
    const scorePercentage = Math.round((validatedCorrect / totalQuestions) * 100);
    const passed = scorePercentage >= passingScorePercentage;

    const newSimulado: Simulado = {
      id: editingSimuladoId || `sim-${Date.now()}`,
      certificationId: cert.id,
      title: title.trim(),
      date,
      totalQuestions,
      correctAnswers: validatedCorrect,
      scorePercentage,
      passingScorePercentage,
      passed,
      timeSpentMinutes: Number(timeSpentMinutes) || undefined,
      difficulty,
      notes: notes.trim() || undefined,
      url: url.trim() || undefined,
    };

    let updatedList: Simulado[];
    if (editingSimuladoId) {
      updatedList = simuladosList.map((s) => (s.id === editingSimuladoId ? newSimulado : s));
    } else {
      updatedList = [newSimulado, ...simuladosList];
    }

    onUpdateCert({ ...cert, simulados: updatedList });
    resetForm();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-[#0f1b33] border border-[#1e2f54] rounded-2xl p-5 text-slate-100 text-xs max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <FileCheck className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white tracking-tight">
                    Simulados & Testes Práticos
                  </h3>
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-amber-950/80 border border-amber-600/50 text-amber-300 font-bold">
                    {cert.code}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  {cert.title}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Metrics bar */}
          <div className="grid grid-cols-4 gap-2 my-4 text-center font-mono">
            <div className="p-2.5 rounded-xl bg-slate-950/90 border border-slate-800/80">
              <div className="text-base font-bold text-amber-400">{totalCount}</div>
              <div className="text-[10px] text-slate-400 font-sans">Simulados</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950/90 border border-slate-800/80">
              <div className="text-base font-bold text-sky-400">{avgScore}%</div>
              <div className="text-[10px] text-slate-400 font-sans">Média Acertos</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950/90 border border-slate-800/80">
              <div className="text-base font-bold text-emerald-400">{bestScore}%</div>
              <div className="text-[10px] text-slate-400 font-sans">Melhor Nota</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950/90 border border-slate-800/80">
              <div className="text-base font-bold text-purple-400">
                {passedCount}/{totalCount}
              </div>
              <div className="text-[10px] text-slate-400 font-sans">Aprovações</div>
            </div>
          </div>

          {/* Action button */}
          {!isFormOpen && (
            <div className="flex justify-end mb-4">
              <button
                onClick={() => setIsFormOpen(true)}
                className="btn-3d-amber px-3.5 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 cursor-pointer text-xs"
              >
                <Plus className="w-3.5 h-3.5" /> Adicionar Simulado Realizado
              </button>
            </div>
          )}

          {/* Form */}
          {isFormOpen && (
            <form onSubmit={handleSave} className="mb-4 p-4 rounded-xl bg-slate-950/90 border border-amber-500/30 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-semibold text-amber-300">
                <span>{editingSimuladoId ? 'Editar Simulado' : 'Novo Resultado de Simulado'}</span>
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="sm:col-span-2">
                  <label className="block text-slate-400 mb-1 font-semibold">Título / Fonte do Simulado *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: Simulado Oficial Cláusulas 4-10 ou ExamTopics 60Q"
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700/80 rounded-lg text-slate-200 focus:outline-none focus:border-amber-400 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Data:</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700/80 rounded-lg text-slate-200 focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Total Questões:</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={totalQuestions}
                    onChange={(e) => setTotalQuestions(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700/80 rounded-lg text-slate-200 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Questões Acertadas:</label>
                  <input
                    type="number"
                    min={0}
                    max={totalQuestions}
                    required
                    value={correctAnswers}
                    onChange={(e) => setCorrectAnswers(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700/80 rounded-lg text-slate-200 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Corte Aprovação (%):</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={passingScorePercentage}
                    onChange={(e) => setPassingScorePercentage(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700/80 rounded-lg text-slate-200 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Tempo (minutos):</label>
                  <input
                    type="number"
                    min={1}
                    value={timeSpentMinutes}
                    onChange={(e) => setTimeSpentMinutes(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700/80 rounded-lg text-slate-200 focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Instant Score Preview */}
              <div className="p-2 rounded bg-slate-900/90 border border-slate-800 flex items-center justify-between font-mono text-xs">
                <span>
                  Resultado Prévia:{' '}
                  <strong className="text-white">
                    {correctAnswers} de {totalQuestions}
                  </strong>{' '}
                  =
                  <strong
                    className={`ml-1 text-sm ${
                      Math.round((correctAnswers / (totalQuestions || 1)) * 100) >= passingScorePercentage
                        ? 'text-emerald-400'
                        : 'text-rose-400'
                    }`}
                  >
                    {Math.round((correctAnswers / (totalQuestions || 1)) * 100)}%
                  </strong>
                </span>

                <span
                  className={`px-2 py-0.5 rounded text-[11px] font-sans font-bold ${
                    Math.round((correctAnswers / (totalQuestions || 1)) * 100) >= passingScorePercentage
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-600/40'
                      : 'bg-rose-950 text-rose-300 border border-rose-600/40'
                  }`}
                >
                  {Math.round((correctAnswers / (totalQuestions || 1)) * 100) >= passingScorePercentage
                    ? '✓ APROVADO'
                    : '✗ REPROVADO'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Nível / Tipo:</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700/80 rounded-lg text-slate-200 focus:outline-none"
                  >
                    <option value="Oficial">Oficial / Padrão da Banca</option>
                    <option value="Difícil">Difícil (Avançado)</option>
                    <option value="Médio">Médio (Intermediário)</option>
                    <option value="Fácil">Fácil (Diagnóstico)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Link / Material (opcional):</label>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700/80 rounded-lg text-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">
                  Pontos Fracos / Questões que Errou para Revisão:
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Errei a questão sobre Artigo 6 do EU AI Act e Cláusula 6.1.3 da ISO 42001..."
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700/80 rounded-lg text-slate-200 focus:outline-none font-mono text-xs resize-y"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-3d-amber px-4 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 cursor-pointer text-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  {editingSimuladoId ? 'Atualizar Simulado' : 'Salvar no Histórico'}
                </button>
              </div>
            </form>
          )}

          {/* List of Simulados */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-slate-300 flex items-center justify-between">
              <span>Histórico de Simulados ({simuladosList.length})</span>
              <span className="text-[11px] text-slate-500 font-mono">
                Nota de corte média: ~{cert.code === 'CompTIA Security+' ? '83%' : '70-75%'}
              </span>
            </h4>

            {simuladosList.length === 0 ? (
              <div className="p-8 text-center rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
                <FileCheck className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-slate-400 text-xs font-semibold">
                  Nenhum simulado registrado para esta trilha ainda.
                </p>
                <p className="text-slate-500 text-[11px] max-w-sm mx-auto">
                  Clique em "+ Adicionar Simulado Realizado" para cadastrar seu primeiro teste prático e medir sua taxa de acerto contra a nota de corte da certificação.
                </p>
              </div>
            ) : (
              simuladosList.map((sim) => (
                <div
                  key={sim.id}
                  className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/90 hover:border-slate-700 transition space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                            sim.passed
                              ? 'bg-emerald-950/90 text-emerald-300 border-emerald-600/50'
                              : 'bg-rose-950/90 text-rose-300 border-rose-600/50'
                          }`}
                        >
                          {sim.passed ? 'APROVADO' : 'NÃO APROVADO'}
                        </span>
                        <span className="font-mono text-[11px] text-slate-400">
                          {new Date(sim.date).toLocaleDateString('pt-BR')}
                        </span>
                        {sim.difficulty && (
                          <span className="text-[10px] text-slate-400 px-1.5 py-0.2 rounded bg-slate-900 border border-slate-800">
                            {sim.difficulty}
                          </span>
                        )}
                      </div>

                      <h5 className="text-sm font-bold text-white mt-1">
                        {sim.title}
                      </h5>
                    </div>

                    {/* Big Score Gauge */}
                    <div className="text-right shrink-0">
                      <div
                        className={`text-lg font-black font-mono leading-none ${
                          sim.passed ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {sim.scorePercentage}%
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                        {sim.correctAnswers}/{sim.totalQuestions} acertos
                      </div>
                    </div>
                  </div>

                  {/* Details bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/60 text-[11px] text-slate-400">
                    <div className="flex items-center gap-3">
                      {sim.timeSpentMinutes && (
                        <span className="flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3 text-slate-500" /> {sim.timeSpentMinutes} min
                        </span>
                      )}
                      <span>
                        Corte: <strong className="text-slate-300 font-mono">{sim.passingScorePercentage}%</strong>
                      </span>
                      {sim.url && (
                        <a
                          href={sim.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sky-400 hover:underline flex items-center gap-0.5"
                        >
                          Link externo <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      {sim.notes && onSendToNotes && (
                        <button
                          onClick={() => {
                            onSendToNotes(
                              `Revisão Simulado: ${sim.title} (${cert.code})`,
                              `Resultado: ${sim.scorePercentage}% (${sim.correctAnswers}/${sim.totalQuestions})\nStatus: ${sim.passed ? 'Aprovado' : 'Não Aprovado'}\nData: ${sim.date}\n\n[PONTOS FRACOS & ITENS PARA REVISÃO]\n${sim.notes}`
                            );
                            alert('Revisão copiada para o Bloco de Notas!');
                          }}
                          className="px-2 py-0.5 rounded text-[11px] text-sky-400 hover:text-sky-300 hover:bg-sky-950/40 flex items-center gap-1 cursor-pointer font-medium"
                          title="Salvar revisão no Bloco de Notas"
                        >
                          <BookOpen className="w-3 h-3" /> Salvar no Bloco
                        </button>
                      )}
                      <button
                        onClick={() => handleEdit(sim)}
                        className="p-1 rounded text-slate-400 hover:text-white cursor-pointer"
                        title="Editar"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleDelete(sim.id)}
                        className="p-1 rounded text-slate-400 hover:text-rose-400 cursor-pointer"
                        title="Excluir"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Notes / Weak points */}
                  {sim.notes && (
                    <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800 text-xs text-amber-200/90 leading-relaxed font-sans">
                      <strong className="text-amber-400 text-[10px] block font-mono uppercase tracking-wider mb-0.5">
                        Pontos para Revisão:
                      </strong>
                      {sim.notes}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="pt-3 border-t border-slate-800 flex justify-end mt-4">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white cursor-pointer font-medium text-xs"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
