import React, { useState, useRef, useEffect } from 'react';
import { StudyNote, Certification, ExternalResource } from '../types';
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
  Sparkles
} from 'lucide-react';

interface NotesViewProps {
  notes: StudyNote[];
  certifications: Certification[];
  onSaveNote: (note: StudyNote) => void;
  onDeleteNote: (id: string) => void;
  selectedCertId?: string;
}

export const NotesView: React.FC<NotesViewProps> = ({
  notes,
  certifications,
  onSaveNote,
  onDeleteNote,
  selectedCertId,
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [certId, setCertId] = useState(selectedCertId || '');
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
    }
  }, [selectedCertId]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingFile(true);
    try {
      const resource = await saveFileToIndexedDB(
        file,
        certId || 'geral',
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

    const now = new Date().toISOString();
    const noteToSave: StudyNote = {
      id: editingNoteId || `note-${Date.now()}`,
      title: title.trim(),
      content: content.trim(),
      certificationId: certId || undefined,
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
      const certName = certifications.find((c) => c.id === n.certificationId)?.code || 'Geral';
      md += `## ${n.title} [${certName}]\n*Criado em: ${new Date(n.createdAt).toLocaleDateString('pt-BR')}*\n\n${n.content}\n\n`;
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

  return (
    <div className="space-y-4">
      {/* Top Header with Database Sync Badge */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80 text-xs">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <FileText className="w-4 h-4 text-sky-400" />
            Bloco de Notas & Anotações
          </h2>
          <span className="text-xs text-slate-400 font-mono">({filteredNotes.length})</span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-600/50 text-[10px] text-emerald-300 font-mono">
            <Database className="w-2.5 h-2.5 text-emerald-400" /> Banco Ativo
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-slate-400 mb-1 font-semibold">Título da Anotação *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Análise da Cláusula 6.1 (ISO 42001) ou Pipeline MLOps..."
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-sky-500 font-semibold"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Trilha Associada:</label>
              <select
                value={certId}
                onChange={(e) => setCertId(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-sky-500 font-medium"
              >
                <option value="">Geral / Conceitos</option>
                {certifications.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} · {c.title.split('-')[0].trim()}
                  </option>
                ))}
              </select>
            </div>
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
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
                      <span className="font-mono text-sky-400 font-bold px-2 py-0.5 rounded bg-sky-950/60 border border-sky-800/40">
                        {cert?.code || 'Geral'}
                      </span>
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
