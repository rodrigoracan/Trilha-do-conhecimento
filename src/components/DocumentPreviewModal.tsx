import React from 'react';
import {
  X,
  Download,
  ExternalLink,
  FileText,
  Calendar,
  HardDrive,
  Copy,
  Check
} from 'lucide-react';
import { TrackAttachment } from '../types';

interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  attachment: TrackAttachment | null;
  moduleTitle?: string;
  theme?: 'light' | 'dark';
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  isOpen,
  onClose,
  attachment,
  moduleTitle,
  theme = 'light',
}) => {
  const [copied, setCopied] = React.useState(false);
  const isLight = theme === 'light';

  if (!isOpen || !attachment) return null;

  const handleCopy = () => {
    const textToCopy = attachment.externalUrl || attachment.dataUrl || attachment.name;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (attachment.dataUrl) {
      const a = document.createElement('a');
      a.href = attachment.dataUrl;
      a.download = attachment.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else if (attachment.externalUrl) {
      window.open(attachment.externalUrl, '_blank', 'noreferrer');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return 'Link Externo';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const isImage = attachment.type.startsWith('image/') || /\.(png|jpe?g|gif|webp|svg)$/i.test(attachment.name);
  const isPdf = attachment.type === 'application/pdf' || /\.pdf$/i.test(attachment.name);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div
        className={`w-full max-w-3xl max-h-[90vh] rounded-2xl border shadow-2xl flex flex-col overflow-hidden transition-colors ${
          isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-[#0b172d] border-blue-900/60 text-slate-100'
        }`}
      >
        {/* Header */}
        <div
          className={`px-5 py-4 border-b flex items-center justify-between ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0e1d37] border-slate-800'
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-500 shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className={`text-base font-bold ${isLight ? 'text-slate-900' : 'text-white'} truncate`}>
                {attachment.name}
              </h3>
              <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
                {moduleTitle && <span>Módulo: {moduleTitle} •</span>}
                <span>{formatFileSize(attachment.size)}</span>
                <span>• {new Date(attachment.uploadedAt).toLocaleDateString('pt-BR')}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {attachment.dataUrl && (
              <button
                onClick={handleDownload}
                className="btn-3d-primary px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                title="Baixar arquivo no computador"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Baixar</span>
              </button>
            )}

            {attachment.externalUrl && (
              <a
                href={attachment.externalUrl}
                target="_blank"
                rel="noreferrer"
                className="btn-3d-primary px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Abrir Link</span>
              </a>
            )}

            <button
              onClick={handleCopy}
              className={`p-2 rounded-lg border transition ${
                isLight ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700' : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
              }`}
              title="Copiar dados / link"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition ${
                isLight ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {attachment.notes && (
            <div className={`p-3.5 rounded-xl border text-xs ${isLight ? 'bg-amber-50/80 border-amber-200 text-amber-900' : 'bg-amber-950/20 border-amber-800/40 text-amber-200'}`}>
              <div className="font-semibold mb-1 flex items-center gap-1.5">
                <span>📝 Observação do Módulo:</span>
              </div>
              <p className="whitespace-pre-wrap">{attachment.notes}</p>
            </div>
          )}

          {/* Image Preview */}
          {isImage && attachment.dataUrl && (
            <div className="flex items-center justify-center bg-slate-950/10 dark:bg-slate-950/40 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
              <img
                src={attachment.dataUrl}
                alt={attachment.name}
                className="max-h-[60vh] max-w-full rounded-lg object-contain shadow-md"
              />
            </div>
          )}

          {/* PDF Preview Frame */}
          {isPdf && attachment.dataUrl && (
            <div className="w-full h-[65vh] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900">
              <iframe
                src={attachment.dataUrl}
                title={attachment.name}
                className="w-full h-full border-none"
              />
            </div>
          )}

          {/* Generic Document File Info */}
          {!isImage && !isPdf && (
            <div className={`p-8 text-center rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#071120] border-slate-800'} space-y-3`}>
              <div className="w-16 h-16 rounded-2xl bg-sky-500/15 text-sky-500 flex items-center justify-center mx-auto">
                <FileText className="w-8 h-8" />
              </div>
              <div>
                <h4 className={`text-base font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{attachment.name}</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Tipo: {attachment.type} • Tamanho: {formatFileSize(attachment.size)}
                </p>
              </div>

              {attachment.externalUrl ? (
                <div className="pt-2">
                  <a
                    href={attachment.externalUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-3d-primary px-4 py-2 rounded-lg text-xs font-bold inline-flex items-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Acessar Documento no Google Drive / Nuvem</span>
                  </a>
                </div>
              ) : (
                <div className="pt-2">
                  <button
                    onClick={handleDownload}
                    className="btn-3d-primary px-4 py-2 rounded-lg text-xs font-bold inline-flex items-center gap-2 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Baixar Arquivo no Computador</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
