import React, { useState, useRef, useEffect } from 'react';
import { StudyNote, Certification, ExternalResource, KnowledgeTrack } from '../types';
import { saveFileToIndexedDB, downloadFile } from '../utils/indexedDB';
import {
  FileText,
  Search,
  Trash2,
  Copy,
  Download,
  Check,
  Edit3,
  Paperclip,
  Link as LinkIcon,
  Database,
  ExternalLink,
  Plus,
  X,
  Sparkles,
  Clock
} from 'lucide-react';

interface NotesViewProps {
  notes: StudyNote[];
  certifications: Certification[];
  tracks?: KnowledgeTrack[];
  onSaveNote: (note: StudyNote) => void;
  onDeleteNote: (id: string) => void;
  selectedCertId?: string;
  selectedTrackId?: string;
  selectedSubcategoryId?: string;
  theme?: 'light' | 'dark';
}

export const NotesView: React.FC<NotesViewProps> = ({
  notes,
  certifications,
  tracks = [],
  onSaveNote,
  onDeleteNote,
  selectedCertId,
  selectedTrackId,
  selectedSubcategoryId,
  theme = 'light',
}) => {
  const isLight = theme === 'light';
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [certId, setCertId] = useState(selectedCertId || '');
  const [trackId, setTrackId] = useState(selectedTrackId || '');
  const [subcategoryId, setSubcategoryId] = useState(selectedSubcategoryId || '');
  const [studyHours, setStudyHours] = useState<number | ''>('');
  const [studyPercent, setStudyPercent] = useState<number | ''>('');
  const [tagsInput, setTagsInput] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);

  // File and Link attachments for current note
  const [attachedFiles, setAttachedFiles] = useState<ExternalResource[]>([]);
  const [attachedLinks, setAttachedLinks] = useState<{ title: string; url: string }[]>([]);
  const [isAddingLink, setIsAddingLink] = useState(false);
  const [newLinkTitle, setNewLinkTitle] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCert, setFilterCert] = useState(selectedCertId || 'all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (selectedCertId) {
      setCertId(selectedCertId);
      setFilterCert(selectedCertId);
      setTrackId('');
    }
  }, [selectedCertId]);

  useEffect(() => {
    if (selectedTrackId) {
      setTrackId(selectedTrackId);
      setCertId('');
    }
    if (selectedSubcategoryId) {
      setSubcategoryId(selectedSubcategoryId);
    }
  }, [selectedTrackId, selectedSubcategoryId]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingFile(true);
    try {
      const resource = await saveFileToIndexedDB(
        file,
        certId || trackId || 'geral',
        `Anexo do Bloco de Notas: ${file.name}`
      );
      setAttachedFiles((prev) => [...prev, resource]);
    } catch (err) {
      console.error('Erro ao anexar arquivo no banco:', err);
      alert('Não foi possível salvar o arquivo no banco de dados.');
    } finally {
      setIsUploadingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAddLink = () => {
    if (!newLinkTitle.trim() || !newLinkUrl.trim()) return;
    setAttachedLinks((prev) => [
      ...prev,
      { title: newLinkTitle.trim(), url: newLinkUrl.trim() },
    ]);
    setNewLinkTitle('');
    setNewLinkUrl('');
    setIsAddingLink(false);
  };

  const handleRemoveFile = (id: string) => {
    setAttachedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleRemoveLink = (index: number) => {
    setAttachedLinks((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const parsedHours =
      typeof studyHours === 'number' && !isNaN(studyHours) && studyHours > 0
        ? Number(studyHours.toFixed(1))
        : undefined;

    const parsedPercent =
      typeof studyPercent === 'number' && !isNaN(studyPercent) && studyPercent > 0
        ? Math.min(100, Number(studyPercent))
        : undefined;

    const matchedTrack = tracks.find((t) => t.id === trackId);
    const matchedSub = matchedTrack?.subcategories?.find((s) => s.id === subcategoryId);
    const now = new Date().toISOString();

    const noteToSave: StudyNote = {
      id: editingNoteId || `note-${Date.now()}`,
      title: title.trim(),
      content: content.trim(),
      certificationId: certId || undefined,
      trackId: trackId || undefined,
      trackTitle: matchedTrack?.title || undefined,
      subcategoryId: subcategoryId || undefined,
      subcategoryTitle: matchedSub?.title || undefined,
      studyHours: parsedHours,
      studyPercent: parsedPercent,
      attachments: attachedFiles.length > 0 ? attachedFiles : undefined,
      links: attachedLinks.length > 0 ? attachedLinks : undefined,
      tags: tags.length > 0 ? tags : ['Estudos'],
      createdAt: editingNoteId
        ? notes.find((n) => n.id === editingNoteId)?.createdAt || now
        : now,
      updatedAt: now,
    };

    onSaveNote(noteToSave);
    resetForm();
  };

  const resetForm = () => {
    setTitle('');
    setContent('');
    setStudyHours('');
    setStudyPercent('');
    setTrackId('');
    setSubcategoryId('');
    setTagsInput('');
    setAttachedFiles([]);
    setAttachedLinks([]);
    setIsAddingLink(false);
    setEditingNoteId(null);
  };

  const handleEdit = (note: StudyNote) => {
    setEditingNoteId(note.id);
    setTitle(note.title);
    setContent(note.content);
    setCertId(note.certificationId || '');
    setTrackId(note.trackId || '');
    setSubcategoryId(note.subcategoryId || '');
    setStudyHours(typeof note.studyHours === 'number' ? note.studyHours : '');
    setStudyPercent(typeof note.studyPercent === 'number' ? note.studyPercent : '');
    setTagsInput(note.tags.join(', '));
    setAttachedFiles(note.attachments || []);
    setAttachedLinks(note.links || []);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCopy = (note: StudyNote) => {
    let textToCopy = `# ${note.title}\n\n${note.content}`;
    if (note.links && note.links.length > 0) {
      textToCopy += `\n\n### Links Úteis:\n` + note.links.map((l) => `- [${l.title}](${l.url})`).join('\n');
    }
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(note.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportAllMarkdown = () => {
    let md = `# Anotações de Estudo - Trilha de Certificações de IA\n\n`;
    notes.forEach((n) => {
      const certName = certifications.find((c) => c.id === n.certificationId)?.code || n.trackTitle || 'Geral';
      const hoursStr = n.studyHours ? ` (${n.studyHours}h dedicadas)` : '';
      md += `## ${n.title} [${certName}]${hoursStr}\n*Criado em: ${new Date(n.createdAt).toLocaleDateString('pt-BR')}*\n\n${n.content}\n\n`;
      if (n.links && n.links.length > 0) {
        md += `**Links:**\n` + n.links.map((l) => `- ${l.title}: ${l.url}`).join('\n') + `\n\n`;
      }
      if (n.attachments && n.attachments.length > 0) {
        md += `**Arquivos anexados:** ` + n.attachments.map((a) => a.fileName || a.title).join(', ') + `\n\n`;
      }
      md += `---\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bloco-de-notas-banco-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const filteredNotes = notes.filter((n) => {
    const matchesSearch =
      n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCert = filterCert === 'all' || n.certificationId === filterCert;
    return matchesSearch && matchesCert;
  });

  const selectedCert = certifications.find((c) => c.id === certId);
  const selectedTrackObj = tracks.find((t) => t.id === trackId);
  const selectedSubObj = selectedTrackObj?.subcategories?.find((s) => s.id === subcategoryId);

  return (
    <div className="space-y-4">
      {/* Top Header with Database Sync Badge */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80 text-xs">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <FileText className="w-4 h-4 text-sky-400" />
            Bloco de Notas & Anotações de Estudo
          </h2>
          <span className="text-xs text-slate-400 font-mono">({filteredNotes.length})</span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-600/50 text-[10px] text-emerald-300 font-mono">
            <Database className="w-2.5 h-2.5 text-emerald-400" /> Carga Horária & Percentual Integrados
          </span>
        </div>

        {notes.length > 0 && (
          <button
            onClick={handleExportAllMarkdown}
            className="btn-3d-dark px-3 py-1.5 rounded-lg text-slate-300 hover:text-white flex items-center gap-1.5 cursor-pointer font-medium text-xs"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" /> Exportar Markdown (.md)
          </button>
        )}
      </div>

      {/* 3D Editor Box Connected to Database */}
      <div className="box-3d p-4">
        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            {/* Title */}
            <div className="sm:col-span-5">
              <label className="block text-slate-400 mb-1 font-semibold">Título da Anotação *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Análise de Riscos, Legislações ou Resumo da Aula..."
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-sky-500 font-semibold"
              />
            </div>

            {/* Certification / Track Association */}
            <div className={selectedTrackObj?.subcategories && selectedTrackObj.subcategories.length > 0 ? "sm:col-span-4" : "sm:col-span-4"}>
              <label className="block text-slate-400 mb-1 font-semibold">Trilha / Certificação:</label>
              <select
                value={certId || (trackId ? `track:${trackId}` : '')}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val.startsWith('track:')) {
                    const tId = val.replace('track:', '');
                    setTrackId(tId);
                    setCertId('');
                    // Auto-select first subcategory if available
                    const tObj = tracks.find((t) => t.id === tId);
                    if (tObj?.subcategories && tObj.subcategories.length > 0) {
                      setSubcategoryId(tObj.subcategories[0].id);
                    } else {
                      setSubcategoryId('');
                    }
                  } else {
                    setCertId(val);
                    setTrackId('');
                    setSubcategoryId('');
                  }
                }}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-sky-500 font-medium"
              >
                <option value="">Geral / Conceitos Universais</option>
                <optgroup label="Certificações de TI & IA (Carga Horária & Gates)">
                  {certifications.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code} · {c.title.split('-')[0].trim()} ({c.hoursSpent}h / {c.estimatedHours}h)
                    </option>
                  ))}
                </optgroup>
                {tracks && tracks.length > 0 && (
                  <optgroup label="Trilhas de Conhecimento RACAN">
                    {tracks.map((t) => (
                      <option key={t.id} value={`track:${t.id}`}>
                        {t.title}
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
            </div>

            {/* Study Hours */}
            <div className="sm:col-span-1.5">
              <label className="block text-slate-400 mb-1 font-semibold flex items-center justify-between">
                <span>Horas:</span>
                <Clock className="w-3 h-3 text-emerald-400" />
              </label>
              <input
                type="number"
                min={0}
                max={50}
                step={0.5}
                value={studyHours}
                onChange={(e) =>
                  setStudyHours(e.target.value === '' ? '' : Math.max(0, parseFloat(e.target.value)))
                }
                placeholder="1.5h"
                className="w-full px-2 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-emerald-400 focus:outline-none focus:border-emerald-500 font-mono font-bold"
              />
            </div>

            {/* Study Percent of Module */}
            <div className="sm:col-span-1.5">
              <label className="block text-slate-400 mb-1 font-semibold flex items-center justify-between">
                <span>% Módulo:</span>
                <span className="text-[10px] text-sky-400 font-mono">%</span>
              </label>
              <input
                type="number"
                min={0}
                max={100}
                step={5}
                value={studyPercent}
                onChange={(e) =>
                  setStudyPercent(e.target.value === '' ? '' : Math.min(100, Math.max(0, parseFloat(e.target.value))))
                }
                placeholder="Ex: 25%"
                className="w-full px-2 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-sky-400 focus:outline-none focus:border-sky-500 font-mono font-bold"
              />
            </div>
          </div>

          {/* Module Selector (when Track is chosen) */}
          {selectedTrackObj?.subcategories && selectedTrackObj.subcategories.length > 0 && (
            <div className="p-2.5 rounded-lg bg-sky-950/30 border border-sky-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2 flex-1">
                <span className="text-[11px] font-bold text-sky-300 whitespace-nowrap">
                  Módulo Específico da Trilha:
                </span>
                <select
                  value={subcategoryId}
                  onChange={(e) => setSubcategoryId(e.target.value)}
                  className="w-full sm:max-w-md px-2.5 py-1 bg-slate-900 border border-sky-600/50 rounded text-slate-200 text-xs focus:outline-none font-medium"
                >
                  <option value="">Selecione o módulo para abater o percentual</option>
                  {selectedTrackObj.subcategories.map((sub, sIdx) => (
                    <option key={sub.id} value={sub.id}>
                      {sIdx + 1}. {sub.title} ({sub.completedPercent || 0}% · {sub.hoursSpent || 0}h / {sub.estimatedHours || 10}h)
                    </option>
                  ))}
                </select>
              </div>

              {selectedSubObj && (
                <div className="text-[11px] font-mono text-slate-300 shrink-0">
                  Total Módulo: <strong className="text-white">{selectedSubObj.estimatedHours || 10}h</strong> · Concluído: <strong className="text-emerald-400">{selectedSubObj.completedPercent || 0}%</strong>
                </div>
              )}
            </div>
          )}

          {/* Quick Preset Chips & Live Calculation Callout */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-2 rounded-lg bg-slate-950/70 border border-slate-800/80">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1">
                Atalhos:
              </span>
              <span className="text-[10px] text-slate-500 font-bold uppercase">Horas:</span>
              {[0.5, 1, 1.5, 2, 3].map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => setStudyHours(h)}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold cursor-pointer transition ${
                    studyHours === h
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-emerald-500/50 hover:text-emerald-300'
                  }`}
                >
                  +{h}h
                </button>
              ))}

              <span className="text-[10px] text-slate-500 font-bold uppercase ml-2">% Módulo:</span>
              {[10, 20, 25, 50, 100].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setStudyPercent(p)}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold cursor-pointer transition ${
                    studyPercent === p
                      ? 'bg-sky-600 text-white'
                      : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-sky-500/50 hover:text-sky-300'
                  }`}
                >
                  +{p}%
                </button>
              ))}
            </div>

            {/* Live calculation info pill for Module */}
            {selectedSubObj && (typeof studyPercent === 'number' || typeof studyHours === 'number') && (
              <div className="text-[11px] font-mono text-emerald-300 flex items-center gap-1">
                <span>
                  💡 Abate no módulo "{selectedSubObj.title.split(':')[0]}":{' '}
                  <strong className="text-white">
                    +{typeof studyPercent === 'number' ? studyPercent : Math.round(((Number(studyHours) || 0) / (selectedSubObj.estimatedHours || 10)) * 100)}%
                  </strong>{' '}
                  (Novo progresso: {Math.min(100, (selectedSubObj.completedPercent || 0) + (typeof studyPercent === 'number' ? studyPercent : Math.round(((Number(studyHours) || 0) / (selectedSubObj.estimatedHours || 10)) * 100)))}%)
                </span>
              </div>
            )}

            {/* Live calculation info pill for Certification */}
            {selectedCert && typeof studyHours === 'number' && studyHours > 0 && (
              <div className="text-[11px] font-mono text-emerald-300 flex items-center gap-1">
                <span>
                  💡 Abate na meta de {selectedCert.code}: {selectedCert.hoursSpent}h + {studyHours}h ={' '}
                  <strong className="text-white">
                    {Number(((selectedCert.hoursSpent || 0) + studyHours).toFixed(1))}h
                  </strong>{' '}
                  / {selectedCert.estimatedHours}h (
                  {Math.min(
                    100,
                    Math.round((((selectedCert.hoursSpent || 0) + studyHours) / selectedCert.estimatedHours) * 100)
                  )}
                  %)
                </span>
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-slate-400 font-semibold">Conteúdo & Síntese:</label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setContent(
                      `[CONCEITO CHAVE]\nDefinição direta do requisito ou mecanismo.\n\n[EXPLICAÇÃO SIMPLES - TÉCNICA FEYNMAN]\nComo explicaria isso para alguém sem jargões.\n\n[APLICAÇÃO PRÁTICA NA GOVERNANÇA]\nComo esse ponto é avaliado em auditoria ou implantação corporativa.\n\n[PONTOS DE ATENÇÃO DA PROVA]\nPegadinhas e palavras-chave de certificação.`
                    )
                  }
                  className="text-sky-400 hover:text-sky-300 cursor-pointer text-[11px] font-medium flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" /> Inserir Template de Fixação
                </button>
              </div>
            </div>
            <textarea
              rows={6}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Escreva suas anotações, sínteses conceituais, fórmulas ou checklists para fixar..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-sky-500 resize-y font-mono text-xs leading-relaxed"
            />
          </div>

          {/* Attachments & Links Section (Connected to DB) */}
          <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-slate-400 font-semibold text-[11px] flex items-center gap-1.5">
                <Database className="w-3 h-3 text-emerald-400" />
                Anexos Salvos no Banco Local ({attachedFiles.length} arquivos, {attachedLinks.length} links)
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={isUploadingFile}
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-3d-dark px-2.5 py-1 rounded text-[11px] font-medium flex items-center gap-1 text-slate-300 hover:text-white cursor-pointer"
                >
                  <Paperclip className="w-3 h-3 text-emerald-400" />
                  {isUploadingFile ? 'Gravando...' : '+ Anexar Arquivo'}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleFileUpload}
                />

                <button
                  type="button"
                  onClick={() => setIsAddingLink(!isAddingLink)}
                  className="btn-3d-dark px-2.5 py-1 rounded text-[11px] font-medium flex items-center gap-1 text-slate-300 hover:text-white cursor-pointer"
                >
                  <LinkIcon className="w-3 h-3 text-sky-400" />
                  + Inserir Link
                </button>
              </div>
            </div>

            {/* Quick Link Input */}
            {isAddingLink && (
              <div className="flex flex-col sm:flex-row gap-1.5 p-2 rounded bg-slate-900 border border-slate-700/60 animate-in fade-in">
                <input
                  type="text"
                  value={newLinkTitle}
                  onChange={(e) => setNewLinkTitle(e.target.value)}
                  placeholder="Nome do link (ex: Documento NIST AI RMF)"
                  className="flex-1 px-2 py-1 bg-slate-950 border border-slate-800 rounded text-slate-200 text-xs focus:outline-none"
                />
                <input
                  type="url"
                  value={newLinkUrl}
                  onChange={(e) => setNewLinkUrl(e.target.value)}
                  placeholder="https://..."
                  className="flex-1 px-2 py-1 bg-slate-950 border border-slate-800 rounded text-slate-200 text-xs focus:outline-none"
                />
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={handleAddLink}
                    className="btn-3d-primary px-3 py-1 rounded font-semibold text-xs cursor-pointer"
                  >
                    Salvar Link
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddingLink(false)}
                    className="px-2 py-1 rounded bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Display Attached Files & Links */}
            {(attachedFiles.length > 0 || attachedLinks.length > 0) && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {attachedFiles.map((file) => (
                  <span
                    key={file.id}
                    className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-slate-900 border border-emerald-500/30 text-emerald-300 text-[11px]"
                  >
                    <Paperclip className="w-3 h-3 shrink-0" />
                    <span className="truncate max-w-[150px]">{file.fileName || file.title}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(file.id)}
                      className="text-slate-500 hover:text-rose-400 cursor-pointer ml-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}

                {attachedLinks.map((link, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-slate-900 border border-sky-500/30 text-sky-300 text-[11px]"
                  >
                    <LinkIcon className="w-3 h-3 shrink-0" />
                    <span className="truncate max-w-[150px]">{link.title}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveLink(idx)}
                      className="text-slate-500 hover:text-rose-400 cursor-pointer ml-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-2">
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="Tags separadas por vírgula (ex: ISO, Risco, MLOps)..."
              className="w-1/2 px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 focus:outline-none text-xs"
            />

            <div className="flex items-center gap-2">
              {editingNoteId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white cursor-pointer font-medium"
                >
                  Cancelar Edição
                </button>
              )}
              <button
                type="submit"
                className="btn-3d-primary px-4 py-1.5 rounded-lg font-semibold cursor-pointer text-xs flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                {editingNoteId ? 'Atualizar no Banco' : 'Salvar no Banco'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* History Search & List */}
      <div className="space-y-3 pt-2">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Pesquisar por título, conteúdo ou tags..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-slate-400 whitespace-nowrap">Filtrar por Trilha:</label>
            <select
              value={filterCert}
              onChange={(e) => setFilterCert(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 focus:outline-none font-medium"
            >
              <option value="all">Todas as Trilhas</option>
              {certifications.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code}
                </option>
              ))}
            </select>
          </div>
        </div>

        {filteredNotes.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500 box-3d p-6">
            Nenhuma anotação encontrada. Crie sua primeira nota acima para salvar no histórico do banco local.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredNotes.map((note) => {
              const cert = certifications.find((c) => c.id === note.certificationId);

              return (
                <div key={note.id} className="box-3d p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5 flex-wrap gap-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-mono text-sky-400 font-bold px-2 py-0.5 rounded bg-sky-950/60 border border-sky-800/40">
                          {cert?.code || note.trackTitle || 'Geral'}
                        </span>
                        {note.subcategoryTitle && (
                          <span
                            className="font-mono text-purple-300 font-medium px-2 py-0.5 rounded bg-purple-950/60 border border-purple-800/40 text-[10px] truncate max-w-[170px]"
                            title={note.subcategoryTitle}
                          >
                            {note.subcategoryTitle.split(':')[0]}
                          </span>
                        )}
                        {note.studyHours && note.studyHours > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-950/70 border border-emerald-600/40 text-emerald-300 font-mono text-[10px] font-bold">
                            <Clock className="w-2.5 h-2.5 text-emerald-400" />
                            {note.studyHours}h
                          </span>
                        ) : null}
                        {note.studyPercent && note.studyPercent > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-sky-950/70 border border-sky-600/40 text-sky-300 font-mono text-[10px] font-bold">
                            +{note.studyPercent}% módulo
                          </span>
                        ) : null}
                      </div>
                      <span className="font-mono text-slate-500">
                        {new Date(note.createdAt).toLocaleDateString('pt-BR')}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white mb-2 leading-snug">
                      {note.title}
                    </h4>

                    <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed font-sans line-clamp-6">
                      {note.content}
                    </p>

                    {/* Attached Resources in Note Card */}
                    {((note.attachments && note.attachments.length > 0) ||
                      (note.links && note.links.length > 0)) && (
                      <div className="mt-3 pt-2 border-t border-slate-800/80 space-y-1">
                        {note.attachments?.map((att) => (
                          <button
                            key={att.id}
                            type="button"
                            onClick={() => downloadFile(att)}
                            className="w-full text-left p-1 rounded bg-slate-950/80 border border-slate-800 hover:border-emerald-500/40 flex items-center justify-between text-[11px] text-emerald-400 hover:text-emerald-300 transition cursor-pointer"
                            title="Baixar arquivo do banco local"
                          >
                            <span className="flex items-center gap-1.5 truncate">
                              <Download className="w-3 h-3 shrink-0" />
                              <span className="truncate">{att.fileName || att.title}</span>
                            </span>
                            {att.fileSize && (
                              <span className="text-[10px] text-slate-500 font-mono shrink-0 ml-1">
                                {att.fileSize}
                              </span>
                            )}
                          </button>
                        ))}

                        {note.links?.map((lnk, lIdx) => (
                          <a
                            key={lIdx}
                            href={lnk.url}
                            target="_blank"
                            rel="noreferrer"
                            className="block p-1 rounded bg-slate-950/80 border border-slate-800 hover:border-sky-500/40 text-[11px] text-sky-400 hover:text-sky-300 transition truncate"
                          >
                            <span className="flex items-center gap-1.5 truncate">
                              <ExternalLink className="w-3 h-3 shrink-0" />
                              <span className="truncate">{lnk.title}</span>
                            </span>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <div className="flex flex-wrap items-center gap-1 text-[10px] text-slate-400">
                      {note.tags.map((t, idx) => (
                        <span key={idx} className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 font-mono">
                          #{t}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-1 shrink-0 ml-2">
                      <button
                        onClick={() => handleCopy(note)}
                        className="p-1 rounded text-slate-400 hover:text-white cursor-pointer"
                        title="Copiar texto e links"
                      >
                        {copiedId === note.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <button
                        onClick={() => handleEdit(note)}
                        className="p-1 rounded text-slate-400 hover:text-sky-400 cursor-pointer"
                        title="Editar anotação"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Excluir "${note.title}" do banco de dados?`)) {
                            onDeleteNote(note.id);
                          }
                        }}
                        className="p-1 rounded text-slate-400 hover:text-rose-400 cursor-pointer"
                        title="Excluir do banco"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
