import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Send,
  Sparkles,
  Bot,
  User as UserIcon,
  Copy,
  Check,
  BookmarkPlus,
  Key,
  ExternalLink,
  RefreshCw,
  HelpCircle,
  BookOpen
} from 'lucide-react';
import { GoogleGeminiLogo } from './Logos';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
}

interface GeminiChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveAsNote?: (noteContent: string, title?: string) => void;
  userApiKey?: string;
  onSaveApiKey?: (key: string) => void;
  currentTrackTitle?: string;
  theme?: 'light' | 'dark';
}

export const GeminiChatModal: React.FC<GeminiChatModalProps> = ({
  isOpen,
  onClose,
  onSaveAsNote,
  userApiKey = '',
  onSaveApiKey,
  currentTrackTitle,
  theme = 'light',
}) => {
  const isLight = theme === 'light';
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      role: 'model',
      content: `Olá! Sou o seu **Assistente Gemini** integrado à **Trilha de Estudos RACAN**.

Estou conectado diretamente via API para tirar dúvidas conceituais, formular simulados, explicar tópicos complexos pela Técnica Feynman e gerar roteiros de estudos.

Como posso ajudar você hoje?`,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showKeyConfig, setShowKeyConfig] = useState(false);
  const [tempApiKey, setTempApiKey] = useState(userApiKey);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [savedNoteId, setSavedNoteId] = useState<string | null>(null);

  useEffect(() => {
    setTempApiKey(userApiKey);
  }, [userApiKey]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const quickPrompts = [
    { label: '🧠 Explicar com Técnica Feynman', text: 'Pode me explicar este conceito usando a Técnica Feynman em 3 níveis (simples, técnico e armadilhas)?' },
    { label: '📝 Gerar 3 Questões de Simulado', text: 'Gere 3 questões desafiadoras de múltipla escolha com 4 alternativas e gabarito justificado sobre este tema.' },
    { label: '⚖️ ISO 42001 vs EU AI Act', text: 'Qual é a relação e a diferença prática entre os requisitos da ISO/IEC 42001 e o EU AI Act?' },
    { label: '🛡️ Ataques de Rede & Pentest', text: 'Explique o funcionamento de um ataque de Man-in-the-Middle e as medidas de mitigação em redes empresariais.' },
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputPrompt).trim();
    if (!text || isLoading) return;

    setErrorMessage('');
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setIsLoading(true);

    try {
      const history = messages
        .filter((m) => m.id !== 'welcome-1')
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: text,
          history,
          context: currentTrackTitle ? `Trilha em estudo: ${currentTrackTitle}` : undefined,
          apiKey: userApiKey || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Erro ao processar sua pergunta com o Gemini.');
      }

      const modelMsg: ChatMessage = {
        id: `model-${Date.now()}`,
        role: 'model',
        content: data.text,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, modelMsg]);
    } catch (err: any) {
      console.error('Chat error:', err);
      setErrorMessage(err.message || 'Erro de conexão com o Gemini.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSaveNote = (id: string, text: string) => {
    if (onSaveAsNote) {
      const firstLine = text.split('\n')[0].replace(/^[#*\s]+/, '').slice(0, 50) || 'Resposta Gemini AI';
      onSaveAsNote(text, `[Gemini] ${firstLine}`);
      setSavedNoteId(id);
      setTimeout(() => setSavedNoteId(null), 2500);
    }
  };

  const handleSaveCustomKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSaveApiKey) {
      onSaveApiKey(tempApiKey.trim());
    }
    setShowKeyConfig(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div
        className={`w-full max-w-4xl h-[92vh] rounded-2xl border-2 shadow-2xl flex flex-col overflow-hidden transition-all ${
          isLight
            ? 'bg-[#ebf3fc] border-[#76a7e8] text-slate-900'
            : 'bg-[#09152a] border-sky-600/50 text-slate-100'
        }`}
      >
        {/* Header Bar */}
        <div
          className={`px-5 py-3.5 border-b-2 flex items-center justify-between shrink-0 ${
            isLight
              ? 'bg-[#d8e8fa] border-[#8cb7ea]'
              : 'bg-[#0d1d36] border-slate-800'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white border border-sky-300 flex items-center justify-center text-sky-500 shadow-sm shrink-0">
              <GoogleGeminiLogo className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className={`text-base font-extrabold tracking-tight ${isLight ? 'text-sky-950' : 'text-white'}`}>
                  Gemini AI · Perguntas & Respostas
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold bg-sky-500/20 text-sky-600 dark:text-sky-300 border border-sky-400/30">
                  gemini-3.8-flash
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Assistente de estudos conectado via API • Respostas diretas no programa
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
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
              <Key className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{userApiKey ? 'API Ativa' : 'Minha API'}</span>
            </button>

            {/* Official Web Link */}
            <a
              href="https://gemini.google.com"
              target="_blank"
              rel="noreferrer"
              className={`p-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 transition ${
                isLight
                  ? 'bg-white hover:bg-slate-50 border-sky-300 text-slate-700'
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
              }`}
              title="Abrir gemini.google.com em nova aba"
            >
              <ExternalLink className="w-3.5 h-3.5" />
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
          <form
            onSubmit={handleSaveCustomKey}
            className={`p-4 border-b-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 transition-colors ${
              isLight ? 'bg-sky-50 border-sky-200' : 'bg-slate-900 border-slate-800'
            }`}
          >
            <div className="flex-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Chave de API do Gemini (Opcional - usa a do ambiente por padrão):
              </label>
              <input
                type="password"
                value={tempApiKey}
                onChange={(e) => setTempApiKey(e.target.value)}
                placeholder="Insira sua GEMINI_API_KEY (AIza...)"
                className="w-full px-3 py-1.5 text-xs rounded-lg border bg-white dark:bg-slate-950 border-sky-300 dark:border-slate-700 focus:outline-none focus:border-sky-500 font-mono"
              />
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto pt-1 sm:pt-4">
              <button
                type="submit"
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
          </form>
        )}

        {/* Chat Thread Messages */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';

            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-xs ${
                    isUser
                      ? 'bg-sky-600 text-white font-bold'
                      : isLight
                      ? 'bg-white border-2 border-sky-400 text-sky-600'
                      : 'bg-[#0d1d36] border border-sky-500/40 text-sky-400'
                  }`}
                >
                  {isUser ? <UserIcon className="w-4 h-4" /> : <GoogleGeminiLogo className="w-4 h-4" />}
                </div>

                <div
                  className={`rounded-2xl p-4 border text-xs sm:text-[13px] leading-relaxed transition-all shadow-xs space-y-2 ${
                    isUser
                      ? 'bg-sky-600 text-white border-sky-500 rounded-tr-none'
                      : isLight
                      ? 'bg-white text-slate-800 border-2 border-[#8cb7ea] rounded-tl-none'
                      : 'bg-[#0b172d] text-slate-100 border-slate-800 rounded-tl-none'
                  }`}
                >
                  <div className="whitespace-pre-wrap font-sans">{msg.content}</div>

                  {!isUser && msg.id !== 'welcome-1' && (
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 text-[11px]">
                      <span className="text-slate-400 font-mono">{msg.timestamp}</span>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleCopy(msg.id, msg.content)}
                          className={`px-2 py-1 rounded border flex items-center gap-1 transition ${
                            isLight
                              ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                              : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
                          }`}
                          title="Copiar resposta"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span>Copiado</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copiar</span>
                            </>
                          )}
                        </button>

                        {onSaveAsNote && (
                          <button
                            onClick={() => handleSaveNote(msg.id, msg.content)}
                            className={`px-2 py-1 rounded border flex items-center gap-1 transition ${
                              savedNoteId === msg.id
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                : isLight
                                ? 'bg-sky-50 hover:bg-sky-100 text-sky-800 border-sky-200'
                                : 'bg-sky-950/60 hover:bg-sky-900 text-sky-300 border-sky-800'
                            }`}
                            title="Salvar como Anotação de Estudo na aba Notas"
                          >
                            <BookmarkPlus className="w-3 h-3" />
                            <span>{savedNoteId === msg.id ? 'Salvo em Notas!' : 'Salvar em Notas'}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 max-w-md mr-auto">
              <div className="w-8 h-8 rounded-full bg-white border border-sky-300 text-sky-500 flex items-center justify-center shrink-0 animate-pulse">
                <GoogleGeminiLogo className="w-4 h-4" />
              </div>
              <div className={`p-3.5 rounded-2xl rounded-tl-none border text-xs flex items-center gap-2 ${
                isLight ? 'bg-white border-sky-200 text-slate-700' : 'bg-[#0b172d] border-slate-800 text-slate-300'
              }`}>
                <RefreshCw className="w-3.5 h-3.5 text-sky-500 animate-spin" />
                <span>O Gemini está pensando e formulando a resposta...</span>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border-2 border-rose-300 text-rose-800 text-xs flex items-start justify-between gap-2">
              <span>{errorMessage}</span>
              <button onClick={() => setErrorMessage('')} className="text-rose-500 font-bold">✕</button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts Bar */}
        <div className={`px-4 py-2 border-t flex items-center gap-1.5 overflow-x-auto scrollbar-none ${
          isLight ? 'bg-[#e5f0fc] border-[#8cb7ea]' : 'bg-[#081224] border-slate-800'
        }`}>
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>Sugestões:</span>
          </span>
          {quickPrompts.map((qp, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(qp.text)}
              disabled={isLoading}
              className={`px-2.5 py-1 rounded-lg text-xs whitespace-nowrap border transition cursor-pointer font-medium shrink-0 ${
                isLight
                  ? 'bg-white hover:bg-sky-50 border-sky-300 text-slate-800'
                  : 'bg-slate-800/80 hover:bg-slate-700 border-slate-700 text-slate-200'
              }`}
            >
              {qp.label}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className={`p-3.5 sm:p-4 border-t-2 flex items-center gap-2 ${
            isLight ? 'bg-[#d8e8fa] border-[#8cb7ea]' : 'bg-[#0c1833] border-slate-800'
          }`}
        >
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            placeholder="Faça uma pergunta ao Gemini (ex: O que cai na Cláusula 5 da ISO 42001? Explique RAG...)"
            className={`flex-1 px-4 py-2.5 rounded-xl text-xs sm:text-sm transition focus:outline-none focus:ring-2 focus:ring-sky-500/40 ${
              isLight
                ? 'bg-white border-2 border-sky-300 text-slate-900 placeholder-slate-400 focus:border-sky-500 shadow-2xs'
                : 'bg-[#09152a] border border-slate-700 text-white placeholder-slate-500 focus:border-sky-500'
            }`}
          />

          <button
            type="submit"
            disabled={!inputPrompt.trim() || isLoading}
            className="btn-3d-primary px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md disabled:opacity-50 shrink-0"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Perguntar</span>
          </button>
        </form>
      </div>
    </div>
  );
};
