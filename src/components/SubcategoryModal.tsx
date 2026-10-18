import React, { useState, useEffect } from 'react';
import { X, FolderPlus, Palette } from 'lucide-react';
import { TrackSubcategory, ColorThemeType } from '../types';

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
  const [colorTheme, setColorTheme] = useState<ColorThemeType>('purple');

  useEffect(() => {
    if (subcategoryToEdit) {
      setTitle(subcategoryToEdit.title || '');
      setDescription(subcategoryToEdit.description || '');
      setColorTheme(subcategoryToEdit.colorTheme || 'purple');
    } else {
      setTitle('');
      setDescription('');
      setColorTheme('purple');
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
              rows={3}
              placeholder="Ex: Domínio de algoritmos supervisionados e não-supervisionados com Scikit-Learn e PyTorch."
              className={`w-full px-3 py-2 rounded-lg text-xs transition focus:outline-none focus:ring-2 focus:ring-sky-500/30 ${
                isLight
                  ? 'bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-sky-500'
                  : 'bg-[#081224] border border-slate-700 text-white placeholder-slate-500 focus:border-sky-500'
              }`}
            />
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
