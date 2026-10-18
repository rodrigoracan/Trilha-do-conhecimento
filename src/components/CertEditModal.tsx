import React, { useState, useEffect } from 'react';
import { Certification, CategoryType, CertStatus, ColorThemeType } from '../types';
import { X, Save, Palette, Plus, Trash2 } from 'lucide-react';

interface CertEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (cert: Partial<Certification>) => void;
  certToEdit: Certification | null;
}

const COLOR_OPTIONS: { id: ColorThemeType; label: string; bg: string }[] = [
  { id: 'sky', label: 'Azul Céu', bg: 'bg-sky-500' },
  { id: 'emerald', label: 'Esmeralda', bg: 'bg-emerald-500' },
  { id: 'purple', label: 'Violeta', bg: 'bg-purple-500' },
  { id: 'amber', label: 'Âmbar', bg: 'bg-amber-500' },
  { id: 'rose', label: 'Carmesim', bg: 'bg-rose-500' },
  { id: 'teal', label: 'Menta / MLOps', bg: 'bg-teal-500' },
  { id: 'indigo', label: 'Índigo', bg: 'bg-indigo-500' },
];

export const CertEditModal: React.FC<CertEditModalProps> = ({
  isOpen,
  onClose,
  onSave,
  certToEdit,
}) => {
  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [issuer, setIssuer] = useState('');
  const [category, setCategory] = useState<CategoryType>('Governança');
  const [colorTheme, setColorTheme] = useState<ColorThemeType>('sky');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<CertStatus>('Planejada');
  const [targetGate, setTargetGate] = useState('Gate 1');
  const [targetMonths, setTargetMonths] = useState('Meses 1 a 4');
  const [estimatedHours, setEstimatedHours] = useState(60);
  const [officialUrl, setOfficialUrl] = useState('');
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [modulesList, setModulesList] = useState<{ id: string; title: string; completed: boolean }[]>([]);

  useEffect(() => {
    if (certToEdit) {
      setTitle(certToEdit.title);
      setCode(certToEdit.code);
      setIssuer(certToEdit.issuer);
      setCategory(certToEdit.category);
      setColorTheme(certToEdit.colorTheme || 'sky');
      setDescription(certToEdit.description || '');
      setStatus(certToEdit.status);
      setTargetGate(certToEdit.targetGate);
      setTargetMonths(certToEdit.targetMonths);
      setEstimatedHours(certToEdit.estimatedHours);
      setOfficialUrl(certToEdit.officialUrl || '');
      setModulesList(
        certToEdit.modules.map((m) => ({ id: m.id, title: m.title, completed: m.completed }))
      );
    } else {
      setTitle('');
      setCode('');
      setIssuer('');
      setCategory('Governança');
      setColorTheme('teal');
      setDescription('');
      setStatus('Planejada');
      setTargetGate('Gate 1');
      setTargetMonths('Meses 1 a 4');
      setEstimatedHours(60);
      setOfficialUrl('');
      setModulesList([
        { id: `mod-1`, title: 'Fundamentos e Requisitos Normativos', completed: false },
        { id: `mod-2`, title: 'Arquitetura e Implementação Prática', completed: false },
      ]);
    }
  }, [certToEdit, isOpen]);

  if (!isOpen) return null;

  const handleAddModule = () => {
    if (!newModuleTitle.trim()) return;
    setModulesList((prev) => [
      ...prev,
      { id: `mod-${Date.now()}`, title: newModuleTitle.trim(), completed: false },
    ]);
    setNewModuleTitle('');
  };

  const handleRemoveModule = (id: string) => {
    setModulesList((prev) => prev.filter((m) => m.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      title: title.trim(),
      code: code.trim() || title.trim(),
      issuer: issuer.trim() || 'Organização Certificadora',
      category,
      colorTheme,
      description: description.trim(),
      status,
      targetGate,
      targetMonths,
      estimatedHours: Number(estimatedHours) || 40,
      officialUrl: officialUrl.trim() || undefined,
      modules: modulesList.map((m) => ({
        id: m.id,
        title: m.title,
        description: '',
        completed: m.completed,
      })),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-[#0f1b33] border border-[#1e2f54] rounded-xl p-5 text-slate-100 text-xs max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Palette className="w-4 h-4 text-sky-400" />
            {certToEdit ? 'Editar Trilha de Estudo' : 'Nova Trilha de Estudo'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          {/* Color Selection Palette */}
          <div>
            <label className="block text-slate-400 mb-1 font-semibold">
              Cor Visual em 3D da Trilha:
            </label>
            <div className="flex flex-wrap gap-2">
              {COLOR_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setColorTheme(opt.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition cursor-pointer ${
                    colorTheme === opt.id
                      ? 'border-white text-white shadow-md'
                      : 'border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <span className={`w-2.5 h-2.5 rounded-full ${opt.bg}`} />
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <label className="block text-slate-400 mb-1">Nome da Trilha *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: MLOps - Engenharia & Governança"
                className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-sky-500 font-semibold"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Sigla / Código *</label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Ex: MLOps"
                className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-sky-500 font-mono font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-slate-400 mb-1">Órgão Emissor:</label>
              <input
                type="text"
                value={issuer}
                onChange={(e) => setIssuer(e.target.value)}
                placeholder="Ex: Linux Foundation, ISO, IAPP"
                className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-sky-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Categoria:</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CategoryType)}
                className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-sky-500"
              >
                <option value="Governança">Governança</option>
                <option value="MLOps">MLOps & Pipelines</option>
                <option value="Segurança">Segurança</option>
                <option value="Auditoria">Auditoria</option>
                <option value="Técnica">Técnica</option>
                <option value="Estratégia">Estratégia</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-slate-400 mb-1">Status:</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as CertStatus)}
                className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none"
              >
                <option value="Planejada">Planejada</option>
                <option value="Em Andamento">Em Andamento</option>
                <option value="Concluída">Concluída</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Fase:</label>
              <input
                type="text"
                value={targetGate}
                onChange={(e) => setTargetGate(e.target.value)}
                placeholder="Gate 2"
                className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Horas:</label>
              <input
                type="number"
                min={1}
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Link Oficial (opcional):</label>
            <input
              type="url"
              value={officialUrl}
              onChange={(e) => setOfficialUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-slate-200 focus:outline-none"
            />
          </div>

          {/* Modules List manager */}
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
            <span className="text-slate-300 font-semibold block">
              Módulos / Tópicos de Estudo ({modulesList.length}):
            </span>
            <div className="flex gap-2">
              <input
                type="text"
                value={newModuleTitle}
                onChange={(e) => setNewModuleTitle(e.target.value)}
                placeholder="Novo módulo (ex: Testes Automatizados de Modelos)..."
                className="flex-1 px-2.5 py-1 bg-slate-900 border border-slate-800 rounded text-slate-200 text-xs focus:outline-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddModule();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddModule}
                className="btn-3d-primary px-3 py-1 rounded text-xs font-semibold cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
              {modulesList.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between p-1.5 rounded bg-slate-900/80 border border-slate-800/80 text-xs"
                >
                  <span className="text-slate-200 truncate">{m.title}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveModule(m.id)}
                    className="text-slate-500 hover:text-rose-400 p-0.5 cursor-pointer ml-1"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-3d-primary px-4 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              {certToEdit ? 'Salvar Trilha' : 'Criar Trilha'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
