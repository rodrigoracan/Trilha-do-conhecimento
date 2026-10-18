import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  FileText,
  FileSpreadsheet,
  Link as LinkIcon,
  HardDrive,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { TrackAttachment } from '../types';

interface AttachDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  moduleTitle: string;
  onSaveAttachment: (attachment: TrackAttachment) => void;
  theme?: 'light' | 'dark';
}

export const AttachDocumentModal: React.FC<AttachDocumentModalProps> = ({
  isOpen,
  onClose,
  moduleTitle,
  onSaveAttachment,
  theme = 'light',
}) => {
  const isLight = theme === 'light';
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [mode, setMode] = useState<'upload' | 'link'>('upload');
  const [docName, setDocName] = useState('');
  const [docUrl, setDocUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedFile, setSelectedFile] = useState<{
    file: File;
    name: string;
    size: number;
    type: string;
    dataUrl?: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Limit to reasonable in-browser size (e.g. 15MB)
    if (file.size > 15 * 1024 * 1024) {
      setErrorMessage('O arquivo excede o limite de 15MB para armazenamento no navegador.');
      return;
    }

    setErrorMessage('');
    const reader = new FileReader();
    setIsLoading(true);

    reader.onload = () => {
      setSelectedFile({
        file,
        name: file.name,
        size: file.size,
        type: file.type || file.name.split('.').pop() || 'file',
        dataUrl: reader.result as string,
      });
      if (!docName) {
        setDocName(file.name);
      }
      setIsLoading(false);
    };

    reader.onerror = () => {
      setErrorMessage('Erro ao ler o arquivo selecionado.');
      setIsLoading(false);
    };

    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === 'upload') {
      if (!selectedFile) {
        setErrorMessage('Por favor, selecione um arquivo para anexar.');
        return;
      }

      const attachment: TrackAttachment = {
        id: `att-${Date.now()}`,
        name: docName.trim() || selectedFile.name,
        size: selectedFile.size,
        type: selectedFile.type,
        dataUrl: selectedFile.dataUrl,
        uploadedAt: new Date().toISOString(),
        notes: notes.trim() || undefined,
      };

      onSaveAttachment(attachment);
      handleClose();
    } else {
      if (!docUrl.trim()) {
        setErrorMessage('Por favor, insira a URL ou link do Google Drive.');
        return;
      }

      const attachment: TrackAttachment = {
        id: `att-${Date.now()}`,
        name: docName.trim() || 'Documento Vinculado',
        size: 0,
        type: docUrl.includes('drive.google.com') ? 'google-drive' : 'url',
        externalUrl: docUrl.trim(),
        uploadedAt: new Date().toISOString(),
        notes: notes.trim() || undefined,
      };

      onSaveAttachment(attachment);
      handleClose();
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setDocName('');
    setDocUrl('');
    setNotes('');
    setErrorMessage('');
    setIsLoading(false);
    onClose();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return 'Link Externo';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

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
              <Upload className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className={`text-base font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Anexar Documento ao Módulo
              </h3>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'} truncate max-w-xs sm:max-w-sm`}>
                {moduleTitle}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className={`p-1.5 rounded-lg transition ${
              isLight ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Toggle: File Upload vs Web/Drive Link */}
        <div className={`flex border-b text-xs font-semibold ${isLight ? 'border-slate-200 bg-slate-50/50' : 'border-slate-800 bg-[#081224]'}`}>
          <button
            type="button"
            onClick={() => {
              setMode('upload');
              setErrorMessage('');
            }}
            className={`flex-1 py-2.5 text-center flex items-center justify-center gap-2 border-b-2 transition ${
              mode === 'upload'
                ? 'border-sky-500 text-sky-600 font-bold bg-sky-500/10'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <HardDrive className="w-4 h-4" />
            <span>Upload de Arquivo (PDF, Doc, Planilha)</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('link');
              setErrorMessage('');
            }}
            className={`flex-1 py-2.5 text-center flex items-center justify-center gap-2 border-b-2 transition ${
              mode === 'link'
                ? 'border-sky-500 text-sky-600 font-bold bg-sky-500/10'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <LinkIcon className="w-4 h-4" />
            <span>Link do Google Drive / Web</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-lg bg-red-500/15 border border-red-500/40 text-red-600 dark:text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {mode === 'upload' ? (
            <div className="space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.md,.png,.jpg,.jpeg,.zip"
                className="hidden"
              />

              {/* Upload Drop Area */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`p-6 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition ${
                  selectedFile
                    ? 'border-emerald-500/70 bg-emerald-500/10'
                    : isLight
                    ? 'border-slate-300 hover:border-sky-500 bg-slate-50/70 hover:bg-sky-50/50'
                    : 'border-slate-700 hover:border-sky-500 bg-[#071120] hover:bg-sky-950/20'
                }`}
              >
                {selectedFile ? (
                  <div className="space-y-1.5 flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div className={`font-bold text-sm ${isLight ? 'text-slate-900' : 'text-white'} break-all max-w-sm`}>
                      {selectedFile.name}
                    </div>
                    <div className="text-xs text-slate-500 font-mono">
                      {formatFileSize(selectedFile.size)} • Clique para trocar arquivo
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1.5 flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-sky-500/15 text-sky-500 flex items-center justify-center mb-1">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div className={`font-semibold text-sm ${isLight ? 'text-slate-800' : 'text-white'}`}>
                      Clique para escolher o arquivo
                    </div>
                    <p className="text-xs text-slate-500">
                      PDF, Word (.docx), Excel (.xlsx), PowerPoint (.pptx), TXT ou Imagens (máx. 15MB)
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-1.5">
              <label className={`text-xs font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                URL do Documento ou Google Drive *
              </label>
              <input
                type="url"
                required
                value={docUrl}
                onChange={(e) => setDocUrl(e.target.value)}
                placeholder="https://drive.google.com/file/d/... ou https://..."
                className={`w-full px-3 py-2 rounded-lg text-sm transition focus:outline-none focus:ring-2 focus:ring-sky-500/30 ${
                  isLight
                    ? 'bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:border-sky-500'
                    : 'bg-[#081224] border border-slate-700 text-white focus:border-sky-500'
                }`}
              />
            </div>
          )}

          {/* Document Title / Label */}
          <div className="space-y-1.5">
            <label className={`text-xs font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
              Título / Nome de Exibição do Documento
            </label>
            <input
              type="text"
              value={docName}
              onChange={(e) => setDocName(e.target.value)}
              placeholder="Ex: Apostila Oficial do Módulo, Slides da Aula, Exercícios Resolvidos"
              className={`w-full px-3 py-2 rounded-lg text-sm transition focus:outline-none focus:ring-2 focus:ring-sky-500/30 ${
                isLight
                  ? 'bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:border-sky-500'
                  : 'bg-[#081224] border border-slate-700 text-white focus:border-sky-500'
              }`}
            />
          </div>

          {/* Optional notes */}
          <div className="space-y-1.5">
            <label className={`text-xs font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
              Observação ou Dica sobre este Anexo (Opcional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Focar na página 24 e nas tabelas comparativas do capítulo 3."
              className={`w-full px-3 py-2 rounded-lg text-xs transition focus:outline-none focus:ring-2 focus:ring-sky-500/30 ${
                isLight
                  ? 'bg-slate-50 border border-slate-300 text-slate-900 focus:bg-white focus:border-sky-500'
                  : 'bg-[#081224] border border-slate-700 text-white focus:border-sky-500'
              }`}
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={handleClose}
              className={`px-3.5 py-2 rounded-lg text-xs font-medium ${
                isLight ? 'text-slate-600 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading || (mode === 'upload' && !selectedFile)}
              className="btn-3d-primary px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{isLoading ? 'Carregando...' : 'Anexar Documento'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
