import React, { useState, useEffect } from 'react';
import { X, Layers, Palette } from 'lucide-react';
import { KnowledgeTrack, ColorThemeType } from '../types';

interface TrackEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<KnowledgeTrack>) => void;
  trackToEdit?: KnowledgeTrack | null;
}

export const TrackEditModal: React.FC<TrackEditModalProps> = ({
  isOpen,
  onClose,
  onSave,
  trackToEdit,
}) => {
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Geral');
  const [colorTheme, setColorTheme] = useState<ColorThemeType>('sky');
  const [tagsInput, setTagsInput] = useState('');

  useEffect(() => {
    if (trackToEdit) {
      setTitle(trackToEdit.title || '');
      setSubtitle(trackToEdit.subtitle || '');
      setDescription(trackToEdit.description || '');
      setCategory(trackToEdit.category || 'Geral');
      setColorTheme(trackToEdit.colorTheme || 'sky');
      setTagsInput(trackToEdit.tags?.join(', ') || '');
    } else {
      setTitle('');
      setSubtitle('');
      setDescription('');
      setCategory('Geral');
      setColorTheme('sky');
      setTagsInput('');
    }
  }, [trackToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    onSave({
      title: title.trim(),
      subtitle: subtitle.trim(),
      description: description.trim(),
      category: category.trim(),
      colorTheme,
      tags,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg bg-[#0b172d] border border-blue-900/60 rounded-xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 bg-[#0e1d37] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-400">
              <Layers className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-white">
              {trackToEdit ? 'Editar Trilha de Estudo' : 'Nova Trilha de Estudo RACAN'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Nome da Trilha *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Cloud Security & DevSecOps"
              className="w-full px-3 py-2 bg-[#081224] border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Subtítulo / Especialidades
            </label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="Ex: AWS, Kubernetes, Terraform e CI/CD Seguro"
              className="w-full px-3 py-2 bg-[#081224] border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Categoria</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Ex: Segurança, Negócios, IA"
                className="w-full px-3 py-2 bg-[#081224] border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Tags (separadas por vírgula)</label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="Ex: AWS, K8s, Docker"
                className="w-full px-3 py-2 bg-[#081224] border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Descrição Detalhada
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva os objetivos, o foco e o resultado esperado desta trilha de estudo..."
              rows={3}
              className="w-full p-3 bg-[#081224] border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-slate-400" />
              Tema de Cor
            </label>
            <div className="flex flex-wrap gap-2">
              {colors.map((c) => (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => setColorTheme(c.id)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 border transition cursor-pointer ${
                    colorTheme === c.id
                      ? 'border-white text-white shadow-sm ring-1 ring-white/50 bg-slate-800'
                      : 'border-slate-800 text-slate-400 hover:border-slate-700 bg-[#081224]'
                  }`}
                >
                  <span className={`w-2.5 h-2.5 rounded-full ${c.bg}`} />
                  <span>{c.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="btn-3d-dark px-3.5 py-1.5 rounded-lg text-xs"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="btn-3d-primary px-4 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-50"
            >
              {trackToEdit ? 'Salvar Trilha' : 'Criar Trilha'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
