import React, { useState } from 'react';
import { X, Link2, Youtube, BookOpen, FileText, Globe } from 'lucide-react';
import { TrackResource } from '../types';

interface TrackResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (resource: Omit<TrackResource, 'id' | 'addedAt'>) => void;
  itemTitle?: string;
}

export const TrackResourceModal: React.FC<TrackResourceModalProps> = ({
  isOpen,
  onClose,
  onSave,
  itemTitle,
}) => {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [type, setType] = useState<TrackResource['type']>('video');
  const [platform, setPlatform] = useState('');
  const [duration, setDuration] = useState('');

  if (!isOpen) return null;

  // Auto-detect platform from URL
  const handleUrlChange = (newUrl: string) => {
    setUrl(newUrl);
    if (!platform) {
      if (newUrl.includes('youtube.com') || newUrl.includes('youtu.be')) {
        setPlatform('YouTube');
        setType('video');
      } else if (newUrl.includes('coursera.org')) {
        setPlatform('Coursera');
        setType('course');
      } else if (newUrl.includes('udemy.com')) {
        setPlatform('Udemy');
        setType('course');
      } else if (newUrl.includes('github.com')) {
        setPlatform('GitHub');
        setType('github');
      } else if (newUrl.includes('drive.google.com') || newUrl.includes('docs.google.com')) {
        setPlatform('Google Drive');
        setType('drive');
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) return;

    onSave({
      title: title.trim(),
      url: url.trim(),
      type,
      platform: platform.trim() || undefined,
      duration: duration.trim() || undefined,
      completed: false,
    });

    setTitle('');
    setUrl('');
    setPlatform('');
    setDuration('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg bg-[#0b172d] border border-blue-900/60 rounded-xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 bg-[#0e1d37] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-400">
              <Link2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-tight">
                Adicionar Link de Curso ou Vídeo
              </h3>
              {itemTitle && (
                <div className="text-[11px] text-sky-400 font-mono truncate max-w-sm">
                  {itemTitle}
                </div>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Link / URL (YouTube, Coursera, Udemy, Drive, GitHub...) *
            </label>
            <input
              type="url"
              required
              value={url}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full px-3 py-2 bg-[#081224] border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Título do Material ou Aula *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Aula 03 - Vetores de Embeddings e Atenção"
              className="w-full px-3 py-2 bg-[#081224] border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Type */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Tipo</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full px-3 py-2 bg-[#081224] border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-sky-500"
              >
                <option value="video">Vídeo</option>
                <option value="course">Curso Completo</option>
                <option value="doc">Documentação / PDF</option>
                <option value="drive">Google Drive</option>
                <option value="github">Repositório GitHub</option>
                <option value="link">Link Web</option>
              </select>
            </div>

            {/* Platform */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Plataforma</label>
              <input
                type="text"
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                placeholder="Ex: YouTube, Udemy"
                className="w-full px-3 py-2 bg-[#081224] border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>

            {/* Duration */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Duração / Tamanho</label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="Ex: 45 min, 12 aulas"
                className="w-full px-3 py-2 bg-[#081224] border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="p-3 rounded-lg bg-[#071120] border border-slate-800 text-[11px] text-slate-400 space-y-1.5">
            <span className="font-semibold text-slate-300 block">Dica de Produtividade:</span>
            <p>
              Ao colar links do YouTube, o sistema permite abrir o player integrado com bloco de notas simultâneo, mantendo o foco total nos seus estudos sem distrações do algoritmo.
            </p>
          </div>

          {/* Actions */}
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
              disabled={!title.trim() || !url.trim()}
              className="btn-3d-primary px-4 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-50"
            >
              Adicionar Link
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
