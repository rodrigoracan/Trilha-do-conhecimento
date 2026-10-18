import React, { useState } from 'react';
import { X, ExternalLink, Play, Copy, Check, Sparkles } from 'lucide-react';
import { TrackResource } from '../types';

interface VideoPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  resource: TrackResource | null;
  trackTitle: string;
  itemTitle?: string;
  onSaveQuickNote?: (noteText: string) => void;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  isOpen,
  onClose,
  resource,
  trackTitle,
  itemTitle,
  onSaveQuickNote,
}) => {
  const [quickNote, setQuickNote] = useState('');
  const [copied, setCopied] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen || !resource) return null;

  // Extract YouTube video ID if applicable
  const getYouTubeEmbedUrl = (url: string) => {
    try {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = url.match(regExp);
      if (match && match[2].length === 11) {
        return `https://www.youtube.com/embed/${match[2]}?autoplay=1`;
      }
      return null;
    } catch {
      return null;
    }
  };

  const embedUrl = resource.url ? getYouTubeEmbedUrl(resource.url) : null;

  const handleCopyLink = () => {
    if (resource.url) {
      navigator.clipboard.writeText(resource.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSaveNote = () => {
    if (quickNote.trim() && onSaveQuickNote) {
      onSaveQuickNote(quickNote);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-5xl bg-[#09152a] border border-blue-900/60 rounded-2xl shadow-2xl shadow-black/80 flex flex-col overflow-hidden max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-800 bg-gradient-to-r from-[#0d223f] via-[#102b52] to-[#0d203b] flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-400 shrink-0">
              <Play className="w-4 h-4" />
            </div>
            <div className="truncate">
              <div className="text-[11px] font-mono text-sky-300 uppercase tracking-wider truncate">
                {trackTitle} {itemTitle ? `· ${itemTitle}` : ''}
              </div>
              <h3 className="text-sm sm:text-base font-bold text-white truncate">
                {resource.title}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleCopyLink}
              className="btn-3d-dark p-2 rounded-lg text-slate-300 hover:text-white text-xs flex items-center gap-1.5"
              title="Copiar Link"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copied ? 'Copiado!' : 'Copiar Link'}</span>
            </button>

            {resource.url && (
              <a
                href={resource.url}
                target="_blank"
                rel="noreferrer"
                className="btn-3d-dark p-2 rounded-lg text-slate-300 hover:text-white text-xs flex items-center gap-1.5"
                title="Abrir em Nova Aba"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Abrir no YouTube</span>
              </a>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body: Split View (Player + Side Note Taker) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 flex-1 overflow-hidden">
          {/* Main Video Area */}
          <div className="lg:col-span-2 bg-black flex items-center justify-center min-h-[280px] sm:min-h-[420px] relative border-b lg:border-b-0 lg:border-r border-slate-800">
            {embedUrl ? (
              <iframe
                src={embedUrl}
                title={resource.title}
                className="w-full h-full min-h-[300px] sm:min-h-[440px] border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="p-8 text-center space-y-4 max-w-md">
                <div className="w-14 h-14 mx-auto rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400">
                  <Play className="w-6 h-6 ml-0.5" />
                </div>
                <div className="text-sm font-semibold text-white">Visualização Externa</div>
                <p className="text-xs text-slate-400">
                  Este link direciona para uma plataforma externa ({resource.platform || 'Link web'}). Clique abaixo para abrir no navegador:
                </p>
                {resource.url && (
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-3d-primary inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold"
                  >
                    <span>Acessar {resource.platform || 'Recurso'}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Quick Study Notes Panel */}
          <div className="p-4 sm:p-5 flex flex-col justify-between bg-[#081224] space-y-3 overflow-y-auto">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Bloco de Notas da Aula
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Salvamento rápido</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Anote pontos-chave, timestamps ou insights desta aula sem sair da tela.
              </p>
              <textarea
                value={quickNote}
                onChange={(e) => setQuickNote(e.target.value)}
                placeholder="Exemplo: Em 14:30 o professor explica como calcular embeddings de texto e fazer busca vetorial..."
                rows={9}
                className="w-full p-3 rounded-lg bg-[#050c18] border border-slate-700/80 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition resize-none leading-relaxed"
              />
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-800">
              {savedSuccess && (
                <div className="p-2 rounded bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-[11px] text-center font-medium">
                  ✓ Anotação adicionada ao tópico com sucesso!
                </div>
              )}
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-3d-dark px-3 py-1.5 rounded-lg text-xs"
                >
                  Fechar
                </button>
                {onSaveQuickNote && (
                  <button
                    type="button"
                    onClick={handleSaveNote}
                    disabled={!quickNote.trim()}
                    className="btn-3d-emerald px-4 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Salvar na Trilha
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
