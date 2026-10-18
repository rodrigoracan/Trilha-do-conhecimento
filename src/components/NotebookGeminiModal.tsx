import React, { useState } from 'react';
import {
  X,
  BookOpen,
  Sparkles,
  ExternalLink,
  Plus,
  Trash2,
  Copy,
  Check,
  BookmarkPlus,
  Send,
  RefreshCw,
  FileText,
  Link as LinkIcon,
  BookMarked,
  Layers,
  HelpCircle,
  Download,
  Key,
  FolderPlus,
  ChevronRight,
  Library
} from 'lucide-react';
import { NotebookBook, NotebookSource, NotebookScript } from '../types';
import { NotebookLMLogo, GoogleGeminiLogo } from './Logos';

interface NotebookGeminiModalProps {
  isOpen: boolean;
  onClose: () => void;
  books: NotebookBook[];
  onUpdateBooks: (updatedBooks: NotebookBook[]) => void;
  onSaveAsNote?: (noteContent: string, title?: string) => void;
  userApiKey?: string;
  onSaveApiKey?: (key: string) => void;
  theme?: 'light' | 'dark';
  initialBookId?: string;
}

export const NotebookGeminiModal: React.FC<NotebookGeminiModalProps> = ({
  isOpen,
  onClose,
  books,
  onUpdateBooks,
  onSaveAsNote,
  userApiKey = '',
  onSaveApiKey,
  theme = 'light',
  initialBookId,
}) => {
  const isLight = theme === 'light';

  // Active book selection
  const [selectedBookId, setSelectedBookId] = useState<string>(() => {
    if (initialBookId && books.some((b) => b.id === initialBookId)) return initialBookId;
    return books[0]?.id || '';
  });

  // Current active book object
  const activeBook = books.find((b) => b.id === selectedBookId) || books[0];

  // Script Generator Mode
  const [scriptMode, setScriptMode] = useState<'script' | 'qa' | 'summary' | 'feynman' | 'faq'>('script');
  const [userQuery, setUserQuery] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState('');
  const [currentOutput, setCurrentOutput] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [savedNoteId, setSavedNoteId] = useState<string | null>(null);

  // Form states for adding new Book
  const [isCreatingBook, setIsCreatingBook] = useState(false);
  const [newBookTitle, setNewBookTitle] = useState('');
  const [newBookCategory, setNewBookCategory] = useState('Geral');
  const [newBookDesc, setNewBookDesc] = useState('');

  // Form states for linking new Source to current Book
  const [isLinkingSource, setIsLinkingSource] = useState(false);
  const [newSourceTitle, setNewSourceTitle] = useState('');
  const [newSourceAuthor, setNewSourceAuthor] = useState('');
  const [newSourceType, setNewSourceType] = useState<NotebookSource['type']>('book');
  const [newSourceUrl, setNewSourceUrl] = useState('');
  const [newSourceSummary, setNewSourceSummary] = useState('');
  const [newSourceSnippet, setNewSourceSnippet] = useState('');

  // Custom API key box toggle
  const [showKeyConfig, setShowKeyConfig] = useState(false);
  const [tempApiKey, setTempApiKey] = useState(userApiKey);

  if (!isOpen) return null;

  // Handler: Add New Book
  const handleCreateBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBookTitle.trim()) return;

    const newBook: NotebookBook = {
      id: `book-${Date.now()}`,
      title: newBookTitle.trim(),
      category: newBookCategory.trim() || 'Estudos',
      description: newBookDesc.trim(),
      sources: [],
      generatedScripts: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = [newBook, ...books];
    onUpdateBooks(updated);
    setSelectedBookId(newBook.id);
    setIsCreatingBook(false);
    setNewBookTitle('');
    setNewBookDesc('');
  };

  // Handler: Delete current Book
  const handleDeleteBook = (bookId: string) => {
    if (confirm('Tem certeza de que deseja excluir este Caderno de Livros?')) {
      const updated = books.filter((b) => b.id !== bookId);
      onUpdateBooks(updated);
      if (selectedBookId === bookId && updated.length > 0) {
        setSelectedBookId(updated[0].id);
      }
    }
  };

  // Handler: Link new Source to active Book
  const handleLinkSource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBook || !newSourceTitle.trim()) return;

    const newSource: NotebookSource = {
      id: `src-${Date.now()}`,
      title: newSourceTitle.trim(),
      type: newSourceType,
      author: newSourceAuthor.trim() || undefined,
      url: newSourceUrl.trim() || undefined,
      summary: newSourceSummary.trim() || undefined,
      contentSnippet: newSourceSnippet.trim() || undefined,
      addedAt: new Date().toISOString(),
    };

    const updatedBook: NotebookBook = {
      ...activeBook,
      sources: [...activeBook.sources, newSource],
      updatedAt: new Date().toISOString(),
    };

    const updatedBooks = books.map((b) => (b.id === activeBook.id ? updatedBook : b));
    onUpdateBooks(updatedBooks);

    // Reset form
    setIsLinkingSource(false);
    setNewSourceTitle('');
    setNewSourceAuthor('');
    setNewSourceUrl('');
    setNewSourceSummary('');
    setNewSourceSnippet('');
  };

  // Handler: Remove a Source
  const handleRemoveSource = (sourceId: string) => {
    if (!activeBook) return;
    const updatedBook: NotebookBook = {
      ...activeBook,
      sources: activeBook.sources.filter((s) => s.id !== sourceId),
      updatedAt: new Date().toISOString(),
    };
    const updatedBooks = books.map((b) => (b.id === activeBook.id ? updatedBook : b));
    onUpdateBooks(updatedBooks);
  };

  // Handler: Execute Gemini Script Synthesis via API
  const handleGenerateScript = async () => {
    if (!activeBook) return;
    setIsGenerating(true);
    setGenerationError('');
    setCurrentOutput('');

    try {
      const res = await fetch('/api/gemini/notebook-synthesis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookTitle: activeBook.title,
          sources: activeBook.sources,
          query: userQuery.trim(),
          mode: scriptMode,
          apiKey: userApiKey || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Erro ao gerar síntese no Notebook Gemini.');
      }

      const generatedText: string = data.text;
      setCurrentOutput(generatedText);

      // Save to book history
      const newScript: NotebookScript = {
        id: `script-${Date.now()}`,
        title: userQuery.trim()
          ? `[${scriptMode.toUpperCase()}] ${userQuery.slice(0, 40)}...`
          : `Síntese ${scriptMode.toUpperCase()} - ${activeBook.title}`,
        type: scriptMode,
        content: generatedText,
        createdAt: new Date().toISOString(),
      };

      const updatedBook: NotebookBook = {
        ...activeBook,
        generatedScripts: [newScript, ...(activeBook.generatedScripts || [])],
        updatedAt: new Date().toISOString(),
      };
      const updatedBooks = books.map((b) => (b.id === activeBook.id ? updatedBook : b));
      onUpdateBooks(updatedBooks);
    } catch (err: any) {
      console.error('Notebook error:', err);
      setGenerationError(err.message || 'Falha ao conectar com o Gemini.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Handler: Copy text
  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Handler: Save to Notes
  const handleSaveToStudyNotes = (text: string, title?: string) => {
    if (onSaveAsNote) {
      const scriptTitle = title || `[Notebook] ${activeBook?.title || 'Script Gemini'}`;
      onSaveAsNote(text, scriptTitle);
      setSavedNoteId('active-output');
      setTimeout(() => setSavedNoteId(null), 2500);
    }
  };

  // Handler: Download Markdown
  const handleDownloadMarkdown = (text: string, title: string) => {
    const blob = new Blob([text], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const modeDescriptions: Record<string, { label: string; desc: string; placeholder: string }> = {
    script: {
      label: '🎬 Roteiro de Vídeo / Aula',
      desc: 'Gera um roteiro completo de gravação (gancho, blocos didáticos, reflexões e CTA) ancorado nos livros.',
      placeholder: 'Ex: Roteiro de 5 minutos explicando como aplicar a ISO 42001 na prática...',
    },
    qa: {
      label: '❓ Perguntas & Respostas Fundamentadas',
      desc: 'Responde dúvidas específicas fundamentadas estritamente nas fontes e livros deste caderno.',
      placeholder: 'Ex: Qual é a diferença entre os requisitos de liderança e gestão de riscos nas fontes cadastradas?',
    },
    summary: {
      label: '📑 Síntese Executiva',
      desc: 'Cria um resumo analítico abrangente com termos normativos, definições e lições-chave.',
      placeholder: 'Ex: Focar especialmente nas cláusulas de governança e auditoria...',
    },
    feynman: {
      label: '🧠 Técnica Feynman',
      desc: 'Explica conceitos densos dos livros em 3 níveis: analogia intuitiva, rigor técnico e armadilhas.',
      placeholder: 'Ex: Explicar o conceito de Sistema de Gestão de IA como se eu fosse um leigo inteligente...',
    },
    faq: {
      label: '📋 FAQ & Simulado de Estudo',
      desc: 'Elabora uma lista de 5 a 8 perguntas avançadas com respostas detalhadas baseadas nas fontes.',
      placeholder: 'Ex: Focar em pegadinhas e critérios de certificação...',
    },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div
        className={`w-full max-w-6xl h-[94vh] rounded-2xl border-2 shadow-2xl flex flex-col overflow-hidden transition-all ${
          isLight
            ? 'bg-[#ebf3fc] border-[#76a7e8] text-slate-900'
            : 'bg-[#09152a] border-sky-600/50 text-slate-100'
        }`}
      >
        {/* Top Header Bar */}
        <div
          className={`px-5 py-3.5 border-b-2 flex items-center justify-between shrink-0 ${
            isLight
              ? 'bg-[#d8e8fa] border-[#8cb7ea]'
              : 'bg-[#0d1d36] border-slate-800'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white border border-sky-300 flex items-center justify-center shadow-sm shrink-0">
              <NotebookLMLogo className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className={`text-base sm:text-lg font-extrabold tracking-tight ${isLight ? 'text-sky-950' : 'text-white'}`}>
                  Notebook Gemini · Books & Caixas de Scripts
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-400/30">
                  NotebookLM Engine
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Vincule livros e apostilas de referência • Gere roteiros e perguntas fundamentadas direto no programa
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Custom API Key Button */}
            <button
              onClick={() => setShowKeyConfig((prev) => !prev)}
              className={`p-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition ${
                userApiKey
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : isLight
                  ? 'bg-white hover:bg-slate-50 border-sky-300 text-slate-700'
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
              }`}
              title="Configurar chave pessoal de API do Gemini"
            >
              <Key className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden sm:inline">{userApiKey ? 'API Ativa' : 'Minha API'}</span>
            </button>

            {/* Official Web Link */}
            <a
              href="https://notebooklm.google.com"
              target="_blank"
              rel="noreferrer"
              className={`p-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 transition ${
                isLight
                  ? 'bg-white hover:bg-slate-50 border-sky-300 text-slate-700'
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
              }`}
              title="Abrir notebooklm.google.com oficial"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">NotebookLM Web</span>
            </a>

            {/* Close Button */}
            <button
              onClick={onClose}
              className={`p-1.5 rounded-lg transition ${
                isLight ? 'text-slate-500 hover:text-slate-800 hover:bg-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Optional Custom API Key Config Box */}
        {showKeyConfig && (
          <div
            className={`p-4 border-b-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 transition-colors ${
              isLight ? 'bg-sky-50 border-sky-200' : 'bg-slate-900 border-slate-800'
            }`}
          >
            <div className="flex-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Chave de API do Gemini para o Notebook (usa a do servidor por padrão):
              </label>
              <input
                type="password"
                value={tempApiKey}
                onChange={(e) => setTempApiKey(e.target.value)}
                placeholder="Insira sua GEMINI_API_KEY pessoal (AIza...)"
                className="w-full px-3 py-1.5 text-xs rounded-lg border bg-white dark:bg-slate-950 border-sky-300 dark:border-slate-700 focus:outline-none focus:border-sky-500 font-mono"
              />
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto pt-1 sm:pt-4">
              <button
                type="button"
                onClick={() => {
                  if (onSaveApiKey) onSaveApiKey(tempApiKey.trim());
                  setShowKeyConfig(false);
                }}
                className="btn-3d-primary px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer"
              >
                Salvar Chave
              </button>
              {userApiKey && (
                <button
                  type="button"
                  onClick={() => {
                    setTempApiKey('');
                    if (onSaveApiKey) onSaveApiKey('');
                  }}
                  className="px-2.5 py-1.5 rounded-lg text-xs text-rose-600 hover:bg-rose-50"
                >
                  Limpar
                </button>
              )}
            </div>
          </div>
        )}

        {/* Main Workspace: 2 Columns */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* LEFT COLUMN: Books & Sources Manager */}
          <div
            className={`w-full lg:w-96 border-b lg:border-b-0 lg:border-r-2 flex flex-col overflow-hidden shrink-0 ${
              isLight ? 'bg-white/80 border-[#8cb7ea]' : 'bg-[#0b172d] border-slate-800'
            }`}
          >
            {/* Book Selector Header */}
            <div className={`p-3.5 border-b flex items-center justify-between ${isLight ? 'bg-[#e5f0fc] border-sky-200' : 'bg-[#081224] border-slate-800'}`}>
              <div className="flex items-center gap-2">
                <Library className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span className="text-xs font-bold tracking-tight uppercase">Meus Cadernos / Books ({books.length})</span>
              </div>
              <button
                onClick={() => setIsCreatingBook((prev) => !prev)}
                className={`p-1.5 rounded-lg border text-[11px] font-bold flex items-center gap-1 cursor-pointer transition ${
                  isLight
                    ? 'bg-white hover:bg-purple-50 text-purple-800 border-purple-300'
                    : 'bg-purple-950/60 hover:bg-purple-900 text-purple-300 border-purple-800'
                }`}
                title="Criar novo Caderno de Livros"
              >
                <Plus className="w-3 h-3" />
                <span>Novo Book</span>
              </button>
            </div>

            {/* Create Book Inline Form */}
            {isCreatingBook && (
              <form onSubmit={handleCreateBook} className={`p-3 border-b space-y-2 ${isLight ? 'bg-purple-50 border-purple-200' : 'bg-purple-950/30 border-purple-800'}`}>
                <div className="text-xs font-bold text-purple-900 dark:text-purple-300">Novo Caderno de Livros:</div>
                <input
                  type="text"
                  required
                  value={newBookTitle}
                  onChange={(e) => setNewBookTitle(e.target.value)}
                  placeholder="Título (ex: Livro de Python & PyTorch)"
                  className="w-full px-2.5 py-1.5 text-xs rounded border bg-white dark:bg-slate-900 border-purple-300 dark:border-purple-700"
                />
                <input
                  type="text"
                  value={newBookCategory}
                  onChange={(e) => setNewBookCategory(e.target.value)}
                  placeholder="Categoria (ex: Data Science, Pentest)"
                  className="w-full px-2.5 py-1.5 text-xs rounded border bg-white dark:bg-slate-900 border-purple-300 dark:border-purple-700"
                />
                <textarea
                  value={newBookDesc}
                  onChange={(e) => setNewBookDesc(e.target.value)}
                  placeholder="Descrição ou objetivos de estudo..."
                  rows={2}
                  className="w-full px-2.5 py-1 text-xs rounded border bg-white dark:bg-slate-900 border-purple-300 dark:border-purple-700"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCreatingBook(false)}
                    className="px-2 py-1 text-xs text-slate-500 hover:text-slate-700"
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="btn-3d-primary px-3 py-1 rounded text-xs font-bold cursor-pointer">
                    Salvar Book
                  </button>
                </div>
              </form>
            )}

            {/* Books Pills / Selector List */}
            <div className="p-2 border-b flex gap-1.5 overflow-x-auto scrollbar-none">
              {books.map((b) => (
                <button
                  key={b.id}
                  onClick={() => setSelectedBookId(b.id)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition cursor-pointer border ${
                    b.id === activeBook?.id
                      ? isLight
                        ? 'bg-purple-600 text-white border-purple-700 shadow-sm'
                        : 'bg-purple-600 text-white border-purple-500 shadow-sm'
                      : isLight
                      ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                  }`}
                >
                  {b.title.length > 24 ? b.title.slice(0, 24) + '...' : b.title}
                  <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] bg-black/20">
                    {b.sources.length}
                  </span>
                </button>
              ))}
            </div>

            {/* Active Book Details & Sources Area */}
            {activeBook ? (
              <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
                <div className={`p-3 rounded-xl border ${isLight ? 'bg-white border-[#8cb7ea]' : 'bg-slate-900 border-slate-800'}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-800">
                        {activeBook.category}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1.5 leading-snug">
                        {activeBook.title}
                      </h4>
                      {activeBook.description && (
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                          {activeBook.description}
                        </p>
                      )}
                    </div>
                    {books.length > 1 && (
                      <button
                        onClick={() => handleDeleteBook(activeBook.id)}
                        className="text-slate-400 hover:text-rose-500 p-1 rounded"
                        title="Excluir este caderno"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Sources Section */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide flex items-center gap-1.5">
                      <BookMarked className="w-3.5 h-3.5 text-purple-600" />
                      <span>Livros & Fontes Vinculadas ({activeBook.sources.length})</span>
                    </span>

                    <button
                      onClick={() => setIsLinkingSource((prev) => !prev)}
                      className={`px-2 py-1 rounded-md text-[11px] font-bold border flex items-center gap-1 cursor-pointer transition ${
                        isLight
                          ? 'bg-sky-50 hover:bg-sky-100 text-sky-800 border-sky-300'
                          : 'bg-sky-950/60 hover:bg-sky-900 text-sky-300 border-sky-800'
                      }`}
                    >
                      <Plus className="w-3 h-3" />
                      <span>Vincular Livro / Fonte</span>
                    </button>
                  </div>

                  {/* Add Source Form */}
                  {isLinkingSource && (
                    <form
                      onSubmit={handleLinkSource}
                      className={`p-3 rounded-xl border-2 space-y-2.5 animate-fadeIn ${
                        isLight ? 'bg-sky-50/70 border-sky-300' : 'bg-slate-900 border-sky-700'
                      }`}
                    >
                      <div className="text-xs font-bold text-sky-900 dark:text-sky-300 flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5 text-sky-600" />
                        <span>Vincular Nova Fonte / Livro ao Caderno:</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          required
                          value={newSourceTitle}
                          onChange={(e) => setNewSourceTitle(e.target.value)}
                          placeholder="Título do Livro / Artigo / PDF"
                          className="col-span-2 px-2.5 py-1.5 text-xs rounded border bg-white dark:bg-slate-950 border-sky-300 dark:border-slate-700"
                        />
                        <input
                          type="text"
                          value={newSourceAuthor}
                          onChange={(e) => setNewSourceAuthor(e.target.value)}
                          placeholder="Autor / Órgão (ex: ISO, NIST, Karpathy)"
                          className="px-2.5 py-1.5 text-xs rounded border bg-white dark:bg-slate-950 border-sky-300 dark:border-slate-700"
                        />
                        <select
                          value={newSourceType}
                          onChange={(e) => setNewSourceType(e.target.value as any)}
                          className="px-2.5 py-1.5 text-xs rounded border bg-white dark:bg-slate-950 border-sky-300 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                        >
                          <option value="book">Livro / E-book</option>
                          <option value="pdf">PDF / Apostila</option>
                          <option value="doc">Documento / Norma</option>
                          <option value="web">Artigo Web / URL</option>
                          <option value="drive">Arquivo no Google Drive</option>
                        </select>
                      </div>

                      <input
                        type="url"
                        value={newSourceUrl}
                        onChange={(e) => setNewSourceUrl(e.target.value)}
                        placeholder="Link oficial / URL (opcional)"
                        className="w-full px-2.5 py-1.5 text-xs rounded border bg-white dark:bg-slate-950 border-sky-300 dark:border-slate-700"
                      />

                      <textarea
                        value={newSourceSummary}
                        onChange={(e) => setNewSourceSummary(e.target.value)}
                        placeholder="Resumo dos capítulos / pontos principais..."
                        rows={2}
                        className="w-full px-2.5 py-1 text-xs rounded border bg-white dark:bg-slate-950 border-sky-300 dark:border-slate-700"
                      />

                      <textarea
                        value={newSourceSnippet}
                        onChange={(e) => setNewSourceSnippet(e.target.value)}
                        placeholder="Trechos ou notas textuais para ancorar a IA..."
                        rows={2}
                        className="w-full px-2.5 py-1 text-xs rounded border bg-white dark:bg-slate-950 border-sky-300 dark:border-slate-700 font-mono text-[11px]"
                      />

                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setIsLinkingSource(false)}
                          className="px-2 py-1 text-xs text-slate-500 hover:text-slate-700"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          className="btn-3d-primary px-3 py-1 rounded text-xs font-bold cursor-pointer"
                        >
                          Confirmar Vínculo
                        </button>
                      </div>
                    </form>
                  )}

                  {/* List of Sources */}
                  {activeBook.sources.length === 0 ? (
                    <div className="p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-center text-xs text-slate-500 space-y-1">
                      <BookOpen className="w-6 h-6 mx-auto text-slate-400" />
                      <p>Nenhum livro ou fonte vinculada ainda.</p>
                      <button
                        onClick={() => setIsLinkingSource(true)}
                        className="text-purple-600 dark:text-purple-400 font-bold hover:underline"
                      >
                        Vincular primeira fonte agora
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                      {activeBook.sources.map((src) => (
                        <div
                          key={src.id}
                          className={`p-2.5 rounded-xl border transition ${
                            isLight
                              ? 'bg-white hover:bg-slate-50 border-slate-200'
                              : 'bg-slate-900/90 hover:bg-slate-800/90 border-slate-800'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-1.5">
                            <div className="flex items-start gap-2 flex-1 min-w-0">
                              <span className="p-1 rounded bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 shrink-0 mt-0.5">
                                <BookOpen className="w-3.5 h-3.5" />
                              </span>
                              <div className="min-w-0 flex-1">
                                <h5 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                  {src.title}
                                </h5>
                                <div className="text-[10px] text-slate-500 font-medium flex items-center gap-2 mt-0.5">
                                  <span className="uppercase font-mono px-1 py-0.2 rounded bg-slate-100 dark:bg-slate-800">
                                    {src.type}
                                  </span>
                                  {src.author && <span>{src.author}</span>}
                                </div>
                                {src.summary && (
                                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                                    {src.summary}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              {src.url && (
                                <a
                                  href={src.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-slate-400 hover:text-sky-500 p-1 rounded"
                                  title="Abrir link da fonte"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                              <button
                                onClick={() => handleRemoveSource(src.id)}
                                className="text-slate-400 hover:text-rose-500 p-1 rounded"
                                title="Desvincular fonte"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-slate-500">
                Selecione ou crie um caderno acima.
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Script Generator & Grounded AI Box */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Mode Selector Tabs */}
            <div className={`p-3 border-b flex flex-wrap items-center gap-1.5 ${isLight ? 'bg-[#d8e8fa] border-[#8cb7ea]' : 'bg-[#0d1d36] border-slate-800'}`}>
              {(['script', 'qa', 'summary', 'feynman', 'faq'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setScriptMode(mode)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 border ${
                    scriptMode === mode
                      ? isLight
                        ? 'bg-purple-600 text-white border-purple-700 shadow-sm'
                        : 'bg-purple-600 text-white border-purple-500 shadow-sm'
                      : isLight
                      ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                  }`}
                >
                  <span>{modeDescriptions[mode].label}</span>
                </button>
              ))}
            </div>

            {/* Mode Explanation & Query Prompt Form */}
            <div className={`p-4 border-b space-y-3 ${isLight ? 'bg-purple-50/40 border-purple-200' : 'bg-slate-900/60 border-slate-800'}`}>
              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                <span className="font-medium">{modeDescriptions[scriptMode].desc}</span>
                <span className="font-mono text-[11px] text-purple-700 dark:text-purple-300 font-bold">
                  {activeBook?.sources.length || 0} fontes ancoradas
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={userQuery}
                    onChange={(e) => setUserQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleGenerateScript()}
                    placeholder={modeDescriptions[scriptMode].placeholder}
                    className={`w-full px-4 py-2.5 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 border transition ${
                      isLight
                        ? 'bg-white border-purple-300 text-slate-900 placeholder-slate-400'
                        : 'bg-[#09152a] border-slate-700 text-white placeholder-slate-500'
                    }`}
                  />
                </div>

                <button
                  onClick={handleGenerateScript}
                  disabled={isGenerating || !activeBook || activeBook.sources.length === 0}
                  className="btn-3d-primary px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Sintetizando...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>Gerar com Gemini</span>
                    </>
                  )}
                </button>
              </div>

              {generationError && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-300 text-rose-800 text-xs flex items-center justify-between">
                  <span>{generationError}</span>
                  <button onClick={() => setGenerationError('')} className="text-rose-500 font-bold">✕</button>
                </div>
              )}
            </div>

            {/* Output Script Viewer & History */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
              {currentOutput ? (
                <div className={`p-5 rounded-2xl border-2 space-y-3 shadow-md animate-fadeIn ${
                  isLight ? 'bg-white border-purple-300 text-slate-800' : 'bg-[#0d1933] border-purple-600/50 text-slate-100'
                }`}>
                  {/* Output Actions Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300">
                        {modeDescriptions[scriptMode].label} · Ancorado em "{activeBook?.title}"
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopyText('active-output', currentOutput)}
                        className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                          isLight
                            ? 'bg-slate-50 hover:bg-slate-100 border-slate-300 text-slate-800'
                            : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
                        }`}
                      >
                        {copiedId === 'active-output' ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Copiado!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copiar Script</span>
                          </>
                        )}
                      </button>

                      {onSaveAsNote && (
                        <button
                          onClick={() => handleSaveToStudyNotes(currentOutput, `[Notebook ${scriptMode.toUpperCase()}] ${activeBook?.title}`)}
                          className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                            savedNoteId === 'active-output'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : isLight
                              ? 'bg-purple-50 hover:bg-purple-100 text-purple-900 border-purple-300'
                              : 'bg-purple-950/60 hover:bg-purple-900 text-purple-300 border-purple-800'
                          }`}
                        >
                          <BookmarkPlus className="w-3.5 h-3.5" />
                          <span>{savedNoteId === 'active-output' ? 'Salvo em Notas!' : 'Salvar em Notas'}</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleDownloadMarkdown(currentOutput, `${activeBook?.title}_${scriptMode}`)}
                        className={`p-1.5 rounded-lg border text-xs text-slate-500 hover:text-slate-800 transition ${
                          isLight ? 'border-slate-300 hover:bg-slate-100' : 'border-slate-700 hover:bg-slate-800'
                        }`}
                        title="Baixar em formato Markdown (.md)"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Formatted Markdown Content */}
                  <div className="prose prose-sm max-w-none text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-sans">
                    {currentOutput}
                  </div>
                </div>
              ) : isGenerating ? (
                <div className="py-20 text-center space-y-3">
                  <div className="w-12 h-12 mx-auto rounded-2xl bg-purple-100 dark:bg-purple-950/60 border border-purple-400 flex items-center justify-center text-purple-600 animate-pulse">
                    <GoogleGeminiLogo className="w-6 h-6 animate-spin-slow" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    O Gemini está analisando os livros e redigindo a caixa de scripts...
                  </h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Cruzando {activeBook?.sources.length || 0} fontes e estruturando o conteúdo com rigor didático e fundamentação.
                  </p>
                </div>
              ) : (
                <div className="py-16 text-center space-y-3">
                  <div className="w-12 h-12 mx-auto rounded-2xl bg-purple-50 dark:bg-slate-900 border border-purple-300 flex items-center justify-center text-purple-500">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    Caixa de Scripts Pronta para Execução
                  </h4>
                  <p className="text-xs text-slate-500 max-w-lg mx-auto">
                    Selecione um modo acima (Roteiro de Gravação, Q&A Fundamentado, Síntese Executiva, Técnica Feynman ou FAQ) e clique em "Gerar com Gemini" para produzir materiais de estudo ancorados nos seus livros.
                  </p>

                  {/* Quick suggested action pills */}
                  <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                    <button
                      onClick={() => {
                        setUserQuery('Roteiro completo de vídeo sintetizando os tópicos críticos');
                        setScriptMode('script');
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold border bg-white dark:bg-slate-900 border-purple-300 text-purple-700 hover:bg-purple-50 cursor-pointer"
                    >
                      🎬 Gerar Roteiro de Vídeo
                    </button>
                    <button
                      onClick={() => {
                        setUserQuery('Explicar os 3 conceitos mais complexos das fontes');
                        setScriptMode('feynman');
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold border bg-white dark:bg-slate-900 border-purple-300 text-purple-700 hover:bg-purple-50 cursor-pointer"
                    >
                      🧠 Explicação Feynman
                    </button>
                    <button
                      onClick={() => {
                        setUserQuery('Quais são as principais exigências práticas citadas nos livros?');
                        setScriptMode('qa');
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold border bg-white dark:bg-slate-900 border-purple-300 text-purple-700 hover:bg-purple-50 cursor-pointer"
                    >
                      ❓ Tirar Dúvidas dos Livros
                    </button>
                  </div>
                </div>
              )}

              {/* Historical Scripts of this Book */}
              {activeBook?.generatedScripts && activeBook.generatedScripts.length > 0 && (
                <div className="space-y-2 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <h5 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-purple-600" />
                    <span>Scripts Anteriores deste Caderno ({activeBook.generatedScripts.length})</span>
                  </h5>

                  <div className="space-y-2">
                    {activeBook.generatedScripts.map((scr) => (
                      <div
                        key={scr.id}
                        className={`p-3 rounded-xl border transition ${
                          isLight ? 'bg-white hover:bg-purple-50/50 border-slate-200' : 'bg-slate-900 hover:bg-slate-800/80 border-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded font-bold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                              {scr.type}
                            </span>
                            <span className="text-xs font-bold ml-2 text-slate-800 dark:text-slate-200">
                              {scr.title}
                            </span>
                            <span className="text-[10px] text-slate-400 ml-2">
                              {new Date(scr.createdAt).toLocaleDateString('pt-BR')}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => setCurrentOutput(scr.content)}
                              className="px-2 py-1 rounded text-xs font-semibold text-purple-700 hover:underline cursor-pointer"
                            >
                              Carregar na Caixa
                            </button>
                            <button
                              onClick={() => handleCopyText(scr.id, scr.content)}
                              className="p-1 rounded text-slate-400 hover:text-slate-700"
                              title="Copiar conteúdo"
                            >
                              {copiedId === scr.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
