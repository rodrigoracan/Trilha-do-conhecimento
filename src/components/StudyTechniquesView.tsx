import React, { useState } from 'react';
import { Certification, ActiveRecallCard, StudyNote } from '../types';
import { GoogleGeminiLogo } from './Logos';
import {
  Brain,
  Sparkles,
  Layers,
  RotateCw,
  Plus,
  CheckCircle,
  XCircle,
  Copy,
  Save,
  Clock,
  HelpCircle
} from 'lucide-react';

interface StudyTechniquesViewProps {
  certifications: Certification[];
  flashcards: ActiveRecallCard[];
  onUpdateFlashcards: (cards: ActiveRecallCard[]) => void;
  onSaveFeynmanNote: (note: Omit<StudyNote, 'id' | 'createdAt' | 'updatedAt'>) => void;
  selectedCertId?: string;
}

export const StudyTechniquesView: React.FC<StudyTechniquesViewProps> = ({
  certifications,
  flashcards,
  onUpdateFlashcards,
  onSaveFeynmanNote,
  selectedCertId,
}) => {
  const [activeTab, setActiveTab] = useState<'feynman' | 'recall' | 'spaced' | 'blurting'>('feynman');

  // Feynman State
  const [feynmanCertId, setFeynmanCertId] = useState<string>(selectedCertId || certifications[0]?.id || '');
  const [feynmanConcept, setFeynmanConcept] = useState<string>('Cláusula 5.2 da ISO/IEC 42001 (Política de IA)');
  const [feynmanSimple, setFeynmanSimple] = useState<string>('');
  const [feynmanGaps, setFeynmanGaps] = useState<string>('');
  const [feynmanAnalogy, setFeynmanAnalogy] = useState<string>('');
  const [feynmanSavedMsg, setFeynmanSavedMsg] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  // Active Recall Flashcard State
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showNewCardModal, setShowNewCardModal] = useState(false);
  const [newCardTopic, setNewCardTopic] = useState('');
  const [newCardQ, setNewCardQ] = useState('');
  const [newCardA, setNewCardA] = useState('');

  // Blurting State
  const [blurtingTopic, setBlurtingTopic] = useState('');
  const [blurtingText, setBlurtingText] = useState('');
  const [blurtingTimer, setBlurtingTimer] = useState<number>(300);
  const [blurtingActive, setBlurtingActive] = useState(false);

  // Feynman Handler
  const handleSaveFeynman = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feynmanConcept.trim() || !feynmanSimple.trim()) return;

    const cert = certifications.find((c) => c.id === feynmanCertId);

    onSaveFeynmanNote({
      title: `Feynman: ${feynmanConcept.trim()}`,
      content: `[Conceito]\n${feynmanConcept}\n\n[Explicação Simples]\n${feynmanSimple}\n\n[Lacunas]\n${feynmanGaps || 'Nenhuma'}\n\n[Analogia]\n${feynmanAnalogy || 'Nenhuma'}`,
      certificationId: cert?.id,
      technique: 'feynman',
      feynmanDetails: {
        concept: feynmanConcept.trim(),
        simpleExplanation: feynmanSimple.trim(),
        gapsIdentified: feynmanGaps.trim(),
        analogy: feynmanAnalogy.trim(),
      },
      tags: ['Feynman', cert?.code || 'Geral'],
    });

    setFeynmanSavedMsg(true);
    setTimeout(() => setFeynmanSavedMsg(false), 2500);
  };

  const handleCopyPrompt = () => {
    const prompt = `Avalie minha explicação do conceito "${feynmanConcept}" pela técnica Feynman:
"${feynmanSimple}"
Analogia: "${feynmanAnalogy}"
Aponte imprecisões e faça 2 perguntas no padrão de prova.`;

    navigator.clipboard.writeText(prompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const handleScoreCard = (correct: boolean) => {
    if (flashcards.length === 0) return;
    const card = flashcards[currentCardIndex];
    const newBox = correct ? Math.min(5, card.box + 1) : 1;
    const updated = flashcards.map((c, i) =>
      i === currentCardIndex ? { ...c, box: newBox, lastReviewed: new Date().toISOString() } : c
    );
    onUpdateFlashcards(updated);
    setIsFlipped(false);
    if (currentCardIndex < flashcards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    } else {
      setCurrentCardIndex(0);
    }
  };

  const handleAddFlashcard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCardQ.trim() || !newCardA.trim()) return;
    const newCard: ActiveRecallCard = {
      id: `card-${Date.now()}`,
      certificationId: feynmanCertId,
      topic: newCardTopic.trim() || 'Geral',
      question: newCardQ.trim(),
      answer: newCardA.trim(),
      box: 1,
    };
    onUpdateFlashcards([...flashcards, newCard]);
    setNewCardTopic('');
    setNewCardQ('');
    setNewCardA('');
    setShowNewCardModal(false);
  };

  const currentCard = flashcards[currentCardIndex];

  return (
    <div className="space-y-4">
      {/* Sub-tabs */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-1 text-xs">
          <button
            onClick={() => setActiveTab('feynman')}
            className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
              activeTab === 'feynman' ? 'bg-slate-800 text-sky-400' : 'text-slate-400 hover:text-white'
            }`}
          >
            Técnica Feynman
          </button>
          <button
            onClick={() => setActiveTab('recall')}
            className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
              activeTab === 'recall' ? 'bg-slate-800 text-sky-400' : 'text-slate-400 hover:text-white'
            }`}
          >
            Active Recall ({flashcards.length})
          </button>
          <button
            onClick={() => setActiveTab('spaced')}
            className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
              activeTab === 'spaced' ? 'bg-slate-800 text-sky-400' : 'text-slate-400 hover:text-white'
            }`}
          >
            Repetição Espaçada
          </button>
          <button
            onClick={() => setActiveTab('blurting')}
            className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
              activeTab === 'blurting' ? 'bg-slate-800 text-sky-400' : 'text-slate-400 hover:text-white'
            }`}
          >
            Blurting
          </button>
        </div>
      </div>

      {/* FEYNMAN */}
      {activeTab === 'feynman' && (
        <div className="box-3d p-5">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800 text-xs">
            <span className="font-bold text-white">Prática Feynman (Conceito → Explicação Simples → Lacunas → Analogia)</span>
            {feynmanSavedMsg && (
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> Salvo nas Notas
              </span>
            )}
          </div>

          <form onSubmit={handleSaveFeynman} className="space-y-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Certificação:</label>
                <select
                  value={feynmanCertId}
                  onChange={(e) => setFeynmanCertId(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none"
                >
                  {certifications.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-400 mb-1">Conceito a fixar:</label>
                <input
                  type="text"
                  required
                  value={feynmanConcept}
                  onChange={(e) => setFeynmanConcept(e.target.value)}
                  placeholder="Ex: Cláusula 5.2 Política de IA ou Artigo 50 EU AI Act"
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Explicação em linguagem simples (como para um leigo):</label>
              <textarea
                rows={4}
                required
                value={feynmanSimple}
                onChange={(e) => setFeynmanSimple(e.target.value)}
                placeholder="Explique com palavras próprias sem usar jargões difíceis..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Onde tive dúvida (lacunas):</label>
                <textarea
                  rows={2}
                  value={feynmanGaps}
                  onChange={(e) => setFeynmanGaps(e.target.value)}
                  placeholder="Termos ou regras que esqueci de cabeça..."
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Analogia prática:</label>
                <textarea
                  rows={2}
                  value={feynmanAnalogy}
                  onChange={(e) => setFeynmanAnalogy(e.target.value)}
                  placeholder="Ex: Como o freio de um carro..."
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={handleCopyPrompt}
                className="text-slate-400 hover:text-sky-300 flex items-center gap-1.5 cursor-pointer font-medium"
              >
                <GoogleGeminiLogo className="w-3.5 h-3.5" />
                {copiedPrompt ? 'Prompt copiado!' : 'Copiar prompt para Gemini'}
              </button>

              <button
                type="submit"
                className="btn-3d-primary px-4 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                Salvar Nota
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ACTIVE RECALL */}
      {activeTab === 'recall' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>
              Cartão {currentCardIndex + 1} de {flashcards.length} · Nível {currentCard?.box || 1}
            </span>
            <button
              onClick={() => setShowNewCardModal(true)}
              className="text-sky-400 hover:underline flex items-center gap-1 cursor-pointer font-medium"
            >
              <Plus className="w-3.5 h-3.5" /> Criar flashcard
            </button>
          </div>

          {currentCard ? (
            <div className="max-w-xl mx-auto">
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className={`min-h-[220px] p-6 rounded-xl cursor-pointer transition flex flex-col justify-between text-center select-none border ${
                  isFlipped
                    ? 'bg-slate-900 border-emerald-500/60'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="text-[11px] font-mono text-sky-400 uppercase tracking-wider">
                  {currentCard.topic} · {isFlipped ? 'Resposta' : 'Pergunta'}
                </div>

                <div className="text-base sm:text-lg font-medium text-white my-4 whitespace-pre-line leading-relaxed">
                  {isFlipped ? currentCard.answer : currentCard.question}
                </div>

                <div className="text-[11px] text-slate-500">
                  Clique para virar o cartão
                </div>
              </div>

              {isFlipped && (
                <div className="flex items-center justify-center gap-3 mt-4 text-xs">
                  <button
                    onClick={() => handleScoreCard(false)}
                    className="btn-3d-danger px-4 py-2 rounded-lg font-medium flex items-center gap-1.5 cursor-pointer"
                  >
                    <XCircle className="w-3.5 h-3.5" /> Errei (Nível 1)
                  </button>
                  <button
                    onClick={() => handleScoreCard(true)}
                    className="btn-3d-emerald px-4 py-2 rounded-lg font-medium flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle className="w-3.5 h-3.5" /> Acertei (+1 Nível)
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-xs text-slate-500">
              Nenhum flashcard disponível.
            </div>
          )}
        </div>
      )}

      {/* SPACED REPETITION */}
      {activeTab === 'spaced' && (
        <div className="box-3d p-5 space-y-3 text-xs">
          <div className="text-sm font-bold text-white mb-2">Marcos de Revisão Espaçada</div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <span className="font-bold text-sky-400">D+1 (24 horas)</span>
              <p className="text-slate-400 mt-1">Revisão rápida de 10 min. Recupera a perda imediata pós-estudo.</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <span className="font-bold text-emerald-400">D+7 (1 semana)</span>
              <p className="text-slate-400 mt-1">Teste ativo ou resolução de 5 questões sem consulta.</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <span className="font-bold text-amber-400">D+15 (15 dias)</span>
              <p className="text-slate-400 mt-1">Revisão de exceções, artigos específicos e fórmulas.</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <span className="font-bold text-purple-400">D+30 (1 mês)</span>
              <p className="text-slate-400 mt-1">Consolidação permanente na memória de longo prazo.</p>
            </div>
          </div>
        </div>
      )}

      {/* BLURTING */}
      {activeTab === 'blurting' && (
        <div className="box-3d p-5 space-y-3 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="font-bold text-white">Método Blurting: Despeje tudo da memória em 5 minutos</span>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-amber-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                {Math.floor(blurtingTimer / 60)}:{(blurtingTimer % 60).toString().padStart(2, '0')}
              </span>
              <button
                onClick={() => {
                  setBlurtingActive(!blurtingActive);
                  if (!blurtingActive) setBlurtingTimer(300);
                }}
                className="btn-3d-amber px-2.5 py-1 rounded text-xs cursor-pointer font-semibold"
              >
                {blurtingActive ? 'Pausar' : 'Iniciar 5m'}
              </button>
            </div>
          </div>

          <input
            type="text"
            value={blurtingTopic}
            onChange={(e) => setBlurtingTopic(e.target.value)}
            placeholder="Tema do desafio (ex: 38 controles da ISO 42001)..."
            className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none"
          />

          <textarea
            rows={6}
            value={blurtingText}
            onChange={(e) => setBlurtingText(e.target.value)}
            placeholder="Escreva tudo o que lembrar de cabeça sem olhar as notas..."
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none font-mono resize-none"
          />

          <div className="flex justify-end">
            <button
              onClick={() => {
                if (!blurtingTopic || !blurtingText) return;
                onSaveFeynmanNote({
                  title: `Blurting: ${blurtingTopic}`,
                  content: blurtingText,
                  technique: 'active_recall',
                  tags: ['Blurting', 'Memória'],
                });
                alert('Salvo nas notas!');
              }}
              className="btn-3d-primary px-3 py-1.5 rounded-lg font-semibold cursor-pointer"
            >
              Salvar nas Notas
            </button>
          </div>
        </div>
      )}

      {/* New Flashcard Modal */}
      {showNewCardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-xl p-5 text-slate-100 text-xs">
            <h3 className="text-sm font-bold text-white mb-3">Novo Flashcard</h3>

            <form onSubmit={handleAddFlashcard} className="space-y-3">
              <div>
                <label className="block text-slate-400 mb-1">Tópico:</label>
                <input
                  type="text"
                  required
                  value={newCardTopic}
                  onChange={(e) => setNewCardTopic(e.target.value)}
                  placeholder="Ex: ISO 42001 Cl. 8"
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Pergunta:</label>
                <textarea
                  rows={2}
                  required
                  value={newCardQ}
                  onChange={(e) => setNewCardQ(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded text-white focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Resposta:</label>
                <textarea
                  rows={3}
                  required
                  value={newCardA}
                  onChange={(e) => setNewCardA(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded text-white focus:outline-none resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowNewCardModal(false)}
                  className="px-3 py-1 rounded bg-slate-800 text-slate-300 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-3d-primary px-3 py-1 rounded font-semibold cursor-pointer"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
