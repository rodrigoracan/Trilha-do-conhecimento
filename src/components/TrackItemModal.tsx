import React, { useState, useEffect } from 'react';
import { X, CheckSquare, Sparkles, AlertCircle } from 'lucide-react';
import { TrackItem } from '../types';

interface TrackItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<TrackItem>) => void;
  itemToEdit?: TrackItem | null;
  subcategoryTitle?: string;
}

export const TrackItemModal: React.FC<TrackItemModalProps> = ({
  isOpen,
  onClose,
  onSave,
  itemToEdit,
  subcategoryTitle,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'A Fazer' | 'Em Andamento' | 'Concluído'>('A Fazer');
  const [priority, setPriority] = useState<'Alta' | 'Média' | 'Baixa'>('Alta');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (itemToEdit) {
      setTitle(itemToEdit.title || '');
      setDescription(itemToEdit.description || '');
      setStatus(itemToEdit.status || 'A Fazer');
      setPriority(itemToEdit.priority || 'Alta');
      setNotes(itemToEdit.notes || '');
    } else {
      setTitle('');
      setDescription('');
      setStatus('A Fazer');
      setPriority('Alta');
      setNotes('');
    }
  }, [itemToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      notes: notes.trim(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-xl bg-[#0b172d] border border-blue-900/60 rounded-xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 bg-[#0e1d37] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-400">
              <CheckSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-tight">
                {itemToEdit ? 'Editar Tópico / Item' : 'Novo Tópico de Estudo'}
              </h3>
              {subcategoryTitle && (
                <div className="text-[11px] text-sky-400 font-mono">
                  Módulo: {subcategoryTitle}
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Título do Tópico / Aula *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Teorema de Bayes e Inferência Estatística"
              className="w-full px-3 py-2 bg-[#081224] border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Descrição / Resumo do Conteúdo
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o escopo deste tópico, conceitos que serão aprendidos..."
              rows={2}
              className="w-full p-3 bg-[#081224] border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Status */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 bg-[#081224] border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-sky-500"
              >
                <option value="A Fazer">A Fazer</option>
                <option value="Em Andamento">Em Andamento</option>
                <option value="Concluído">Concluído</option>
              </select>
            </div>

            {/* Priority */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Prioridade</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full px-3 py-2 bg-[#081224] border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-sky-500"
              >
                <option value="Alta">Alta</option>
                <option value="Média">Média</option>
                <option value="Baixa">Baixa</option>
              </select>
            </div>
          </div>

          {/* Notes Area */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Anotações e Síntese de Estudo
              </label>
              <span className="text-[10px] text-slate-400">Markdown suportado</span>
            </div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Escreva anotações conceituais, fórmulas, passos práticos ou insights..."
              rows={4}
              className="w-full p-3 bg-[#081224] border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 resize-none font-mono"
            />
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
              disabled={!title.trim()}
              className="btn-3d-primary px-4 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-50"
            >
              {itemToEdit ? 'Salvar Alterações' : 'Adicionar Tópico'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
