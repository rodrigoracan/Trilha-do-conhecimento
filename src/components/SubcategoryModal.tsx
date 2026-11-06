import React, { useState, useEffect } from 'react';
import { X, FolderPlus, Palette } from 'lucide-react';
import { TrackSubcategory, ColorThemeType, CertStatus } from '../types';
import { Clock, CheckCircle2 } from 'lucide-react';

interface SubcategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<TrackSubcategory>) => void;
  subcategoryToEdit?: TrackSubcategory | null;
  theme?: 'light' | 'dark';
}

export const SubcategoryModal: React.FC<SubcategoryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  subcategoryToEdit,
  theme = 'light',
}) => {
  const isLight = theme === 'light';
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [colorTheme, setColorTheme] = useState<ColorThemeType>('sky');
  const [estimatedHours, setEstimatedHours] = useState<number>(10);
  const [hoursSpent, setHoursSpent] = useState<number>(0);
  const [completedPercent, setCompletedPercent] = useState<number>(0);
  const [status, setStatus] = useState<CertStatus>('Planejada');

  useEffect(() => {
    if (subcategoryToEdit) {
      setTitle(subcategoryToEdit.title || '');
      setDescription(subcategoryToEdit.description || '');
      setColorTheme(subcategoryToEdit.colorTheme || 'sky');
      setEstimatedHours(subcategoryToEdit.estimatedHours || 10);
      setHoursSpent(subcategoryToEdit.hoursSpent || 0);
      setCompletedPercent(subcategoryToEdit.completedPercent || 0);
      setStatus(subcategoryToEdit.status || (subcategoryToEdit.completedPercent && subcategoryToEdit.completedPercent >= 100 ? 'Concluída' : subcategoryToEdit.hoursSpent ? 'Em Andamento' : 'Planejada'));
    } else {
      setTitle('');
      setDescription('');
      setColorTheme('sky');
      setEstimatedHours(10);
      setHoursSpent(0);
      setCompletedPercent(0);
      setStatus('Planejada');
    }
  }, [subcategoryToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({
      title: title.trim(),
      description: description.trim(),
      colorTheme,
      estimatedHours: Math.max(1, Number(estimatedHours) || 10),
      hoursSpent: Math.max(0, Number(hoursSpent) || 0),
      completedPercent: Math.min(100, Math.max(0, Number(completedPercent) || 0)),
      status,
    });
    onClose();
  };

  const colors: { id: ColorThemeType; label: string; bg: string }[] = [
    { id: 'sky', label: 'Azul', bg: 'bg-sky-500' },
    { id: 'purple', label: 'Roxo', bg: 'bg-purple-500' },
    { id: 'rose', label: 'Vermelho/Rosa', bg: 'bg-rose-500' },
    { id: 'emerald', label: 'Verde', bg: 'bg-emerald-500' },
    { id: 'amber', label: 'Âmbar', bg: 'bg-amber-500' },
    { id: 'teal', label: 'Ciano', bg: 'bg-teal-500' },
    { id: 'indigo', label: 'Índigo', bg: 'bg-indigo-500' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div
        className={`w-full max-w-lg rounded-2xl border shadow-2xl flex flex-col overflow-hidden transition-colors ${
          isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-[#0b172d] border-blue-900/60 text-slate-100'
        }`}
      >
        {/* Header */}
        <div
          className={`px-5 py-4 border-b flex items-center justify-between ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0e1d37] border-slate-800'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8.5 h-8.5 rounded-lg bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-500">
              <FolderPlus className="w-4.5 h-4.5" />
            </div>
            <h3 className={`text-base font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {subcategoryToEdit ? 'Editar Módulo' : 'Novo Módulo'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition ${
              isLight ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="space-y-1.5">
            <label className={`text-xs font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
              Nome do Módulo *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Módulo 1 - Machine Learning & Redes Neurais"
              className={`w-full px-3 py-2 rounded-lg text-sm transition focus:outline-none focus:ring-2 focus:ring-sky-500/30 ${
                isLight
                  ? 'bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-sky-500'
                  : 'bg-[#081224] border border-slate-700 text-white placeholder-slate-500 focus:border-sky-500'
              }`}
            />
          </div>

          <div className="space-y-1.5">
            <label className={`text-xs font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
              Descrição / Objetivo do Módulo
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Ex: Domínio de algoritmos supervisionados e não-supervisionados com Scikit-Learn e PyTorch."
              className={`w-full px-3 py-2 rounded-lg text-xs transition focus:outline-none focus:ring-2 focus:ring-sky-500/30 ${
                isLight
                  ? 'bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-sky-500'
                  : 'bg-[#081224] border border-slate-700 text-white placeholder-slate-500 focus:border-sky-500'
              }`}
            />
          </div>

          {/* Workload and Progress Section */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 p-3 rounded-xl border bg-slate-950/40 border-slate-800">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as CertStatus)}
                className={`w-full px-2.5 py-1.5 rounded-lg text-xs font-semibold focus:outline-none border ${
                  isLight ? 'bg-white border-slate-300 text-slate-800' : 'bg-slate-900 border-slate-700 text-slate-200'
                }`}
              >
                <option value="Planejada">Planejada</option>
                <option value="Em Andamento">Em Andamento</option>
                <option value="Concluída">Concluída</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Carga Total (h)
              </label>
              <input
                type="number"
                min={1}
                step={1}
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(Number(e.target.value))}
                className={`w-full px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold focus:outline-none border ${
                  isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-slate-900 border-slate-700 text-white'
                }`}
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Já Estudadas (h)
              </label>
              <input
                type="number"
                min={0}
                step={0.5}
                value={hoursSpent}
                onChange={(e) => setHoursSpent(Number(e.target.value))}
                className={`w-full px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold focus:outline-none border ${
                  isLight ? 'bg-white border-slate-300 text-emerald-700' : 'bg-slate-900 border-slate-700 text-emerald-400'
                }`}
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Concluído (%)
              </label>
              <input
                type="number"
                min={0}
                max={100}
                step={5}
                value={completedPercent}
                onChange={(e) => setCompletedPercent(Number(e.target.value))}
                className={`w-full px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold focus:outline-none border ${
                  isLight ? 'bg-white border-slate-300 text-sky-800' : 'bg-slate-900 border-slate-700 text-sky-400'
                }`}
              />
            </div>
          </div>

          {/* Color theme selection */}
          <div className="space-y-1.5">
            <label className={`text-xs font-semibold flex items-center gap-1.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
              <Palette className="w-3.5 h-3.5 text-sky-500" />
              <span>Cor Temática do Módulo</span>
            </label>
            <div className="flex flex-wrap gap-2 pt-1">
              {colors.map((c) => (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => setColorTheme(c.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition cursor-pointer ${
                    colorTheme === c.id
                      ? isLight
                        ? 'border-sky-600 bg-sky-50 text-sky-900 font-bold shadow-sm'
                        : 'border-sky-400 bg-sky-950/80 text-white font-bold'
                      : isLight
                      ? 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                      : 'border-slate-800 bg-[#081224] text-slate-400 hover:text-white'
                  }`}
                >
                  <span className={`w-2.5 h-2.5 rounded-full ${c.bg}`} />
                  <span>{c.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className={`px-3.5 py-2 rounded-lg text-xs font-medium ${
                isLight ? 'text-slate-600 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-3d-primary px-4 py-2 rounded-lg text-xs font-bold shadow-md cursor-pointer"
            >
              {subcategoryToEdit ? 'Salvar Módulo' : 'Criar Módulo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
