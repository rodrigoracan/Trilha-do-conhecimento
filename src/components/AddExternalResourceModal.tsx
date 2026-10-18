import React, { useState, useRef } from 'react';
import { ExternalResource } from '../types';
import { saveFileToIndexedDB } from '../utils/indexedDB';
import { X, Plus, Link as LinkIcon, FileUp, UploadCloud, Check } from 'lucide-react';

interface AddExternalResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (resource: ExternalResource) => void;
  certId: string;
  certTitle: string;
}

export const AddExternalResourceModal: React.FC<AddExternalResourceModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  certId,
  certTitle,
}) => {
  const [activeTab, setActiveTab] = useState<'file' | 'link'>('file');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      if (activeTab === 'file' && selectedFile) {
        const resource = await saveFileToIndexedDB(
          selectedFile,
          certId,
          description.trim() || undefined
        );
        onAdd(resource);
      } else if (activeTab === 'link') {
        if (!title.trim() || !url.trim()) return;
        const newLinkResource: ExternalResource = {
          id: `link-${Date.now()}`,
          title: title.trim(),
          url: url.trim(),
          type: 'link',
          description: description.trim() || undefined,
          addedAt: new Date().toISOString().split('T')[0],
        };
        onAdd(newLinkResource);
      }

      // Reset form
      setSelectedFile(null);
      setTitle('');
      setUrl('');
      setDescription('');
      onClose();
    } catch (err) {
      console.error('Erro ao salvar no banco:', err);
      alert('Não foi possível salvar o arquivo no banco de dados local.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-[#0f1b33] border border-[#1e2f54] rounded-xl p-5 text-slate-100 text-xs shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white">Salvar Material no Banco</h3>
            <span className="text-[11px] text-sky-400 truncate max-w-[240px] block font-mono">
              {certTitle}
            </span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switcher: Arquivo vs Link */}
        <div className="flex gap-1.5 p-1 bg-slate-950 rounded-lg border border-slate-800 my-3">
          <button
            type="button"
            onClick={() => setActiveTab('file')}
            className={`flex-1 py-1.5 rounded text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
              activeTab === 'file'
                ? 'bg-sky-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileUp className="w-3.5 h-3.5" />
            Salvar Arquivo (PDF/Doc)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('link')}
            className={`flex-1 py-1.5 rounded text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
              activeTab === 'link'
                ? 'bg-sky-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5" />
            Salvar Link Web
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {activeTab === 'file' && (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.zip"
                onChange={handleFileChange}
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className={`p-4 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition text-center ${
                  selectedFile
                    ? 'bg-sky-950/40 border-sky-500/70 text-sky-300'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-400'
                }`}
              >
                {selectedFile ? (
                  <>
                    <Check className="w-6 h-6 text-emerald-400 mb-1" />
                    <span className="font-semibold text-white truncate max-w-[260px]">
                      {selectedFile.name}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB · Clique para trocar
                    </span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-7 h-7 text-sky-400 mb-1" />
                    <span className="font-semibold text-slate-200">
                      Clique para selecionar arquivo do computador
                    </span>
                    <span className="text-[10px] text-slate-400 mt-1">
                      PDF, Word, Apostila, Slides ou Imagem (Salvo no Banco Local)
                    </span>
                  </>
                )}
              </div>
            </div>
          )}

          <div>
            <label className="block text-slate-400 mb-1">Título do Material:</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Apostila Oficial EU AI Act ou Resumo ISO 42001..."
              className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-sky-500"
            />
          </div>

          {activeTab === 'link' && (
            <div>
              <label className="block text-slate-400 mb-1">URL / Link:</label>
              <input
                type="url"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://drive.google.com/... ou https://..."
                className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-sky-500"
              />
            </div>
          )}

          <div>
            <label className="block text-slate-400 mb-1">Observações (opcional):</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Focar no capítulo 3; material para simulado..."
              className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-3 py-1.5 rounded bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving || (activeTab === 'file' && !selectedFile)}
              className="btn-3d-primary px-4 py-1.5 rounded-lg font-semibold flex items-center gap-1 cursor-pointer disabled:opacity-50"
            >
              <Plus className="w-3.5 h-3.5" />
              {isSaving ? 'Salvando...' : 'Salvar no Banco'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
