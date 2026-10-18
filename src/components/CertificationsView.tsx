import React, { useState } from 'react';
import { Certification, CategoryType, CertStatus, ExternalResource, ColorThemeType } from '../types';
import { downloadFile, deleteFileFromIndexedDB } from '../utils/indexedDB';
import {
  Plus,
  Trash2,
  Timer,
  BookOpen,
  CheckCircle2,
  Circle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  FolderOpen,
  Sparkles,
  Link as LinkIcon,
  Video,
  FileText,
  Download,
  FileCode,
  FileCheck,
  ArrowLeft
} from 'lucide-react';

interface CertificationsViewProps {
  certifications: Certification[];
  onUpdateCert: (cert: Certification) => void;
  onDeleteCert: (id: string) => void;
  onOpenCreateModal: () => void;
  onOpenEditModal: (cert: Certification) => void;
  onOpenAddResourceModal: (cert: Certification) => void;
  onOpenSimuladosForCert: (cert: Certification) => void;
  onStartFeynmanForCert: (cert: Certification) => void;
  onOpenNotesForCert?: (cert: Certification) => void;
  onBackToTracks?: () => void;
  theme?: 'light' | 'dark';
}

const THEMES_MAP: Record<
  string,
  {
    cardClass: string;
    titleColor: string;
    codeColor: string;
    badgeClass: string;
    progressBg: string;
    iconColor: string;
  }
> = {
  sky: {
    cardClass: 'card-3d-sky',
    titleColor: 'text-sky-300',
    codeColor: 'text-sky-400',
    badgeClass: 'bg-sky-950/90 text-sky-300 border-sky-500/50',
    progressBg: 'bg-sky-500',
    iconColor: 'text-sky-400',
  },
  emerald: {
    cardClass: 'card-3d-emerald',
    titleColor: 'text-emerald-300',
    codeColor: 'text-emerald-400',
    badgeClass: 'bg-emerald-950/90 text-emerald-300 border-emerald-500/50',
    progressBg: 'bg-emerald-500',
    iconColor: 'text-emerald-400',
  },
  purple: {
    cardClass: 'card-3d-purple',
    titleColor: 'text-purple-300',
    codeColor: 'text-purple-400',
    badgeClass: 'bg-purple-950/90 text-purple-300 border-purple-500/50',
    progressBg: 'bg-purple-500',
    iconColor: 'text-purple-400',
  },
  amber: {
    cardClass: 'card-3d-amber',
    titleColor: 'text-amber-300',
    codeColor: 'text-amber-400',
    badgeClass: 'bg-amber-950/90 text-amber-300 border-amber-500/50',
    progressBg: 'bg-amber-500',
    iconColor: 'text-amber-400',
  },
  rose: {
    cardClass: 'card-3d-rose',
    titleColor: 'text-rose-300',
    codeColor: 'text-rose-400',
    badgeClass: 'bg-rose-950/90 text-rose-300 border-rose-500/50',
    progressBg: 'bg-rose-500',
    iconColor: 'text-rose-400',
  },
  teal: {
    cardClass: 'card-3d-teal',
    titleColor: 'text-teal-300',
    codeColor: 'text-teal-400',
    badgeClass: 'bg-teal-950/90 text-teal-300 border-teal-500/50',
    progressBg: 'bg-teal-500',
    iconColor: 'text-teal-400',
  },
  indigo: {
    cardClass: 'card-3d-indigo',
    titleColor: 'text-indigo-300',
    codeColor: 'text-indigo-400',
    badgeClass: 'bg-indigo-950/90 text-indigo-300 border-indigo-500/50',
    progressBg: 'bg-indigo-500',
    iconColor: 'text-indigo-400',
  },
};

const PALETTE_FALLBACKS = ['sky', 'emerald', 'purple', 'amber', 'rose', 'teal', 'indigo'];

export const CertificationsView: React.FC<CertificationsViewProps> = ({
  certifications,
  onUpdateCert,
  onDeleteCert,
  onOpenCreateModal,
  onOpenEditModal,
  onOpenAddResourceModal,
  onOpenSimuladosForCert,
  onStartFeynmanForCert,
  onOpenNotesForCert,
  onBackToTracks,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});

  const categories = ['Todas', 'Governança', 'MLOps', 'Segurança', 'Auditoria', 'Técnica'];

  const filteredCerts = certifications.filter((c) => {
    if (selectedCategory === 'Todas') return true;
    return c.category === selectedCategory;
  });

  const toggleModuleExpansion = (id: string) => {
    setExpandedModules((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleModuleCompletion = (cert: Certification, moduleId: string) => {
    const updatedModules = cert.modules.map((m) =>
      m.id === moduleId ? { ...m, completed: !m.completed } : m
    );
    onUpdateCert({ ...cert, modules: updatedModules });
  };

  const handleStatusChange = (cert: Certification, newStatus: CertStatus) => {
    onUpdateCert({ ...cert, status: newStatus });
  };

  const handleDeleteResource = async (cert: Certification, resource: ExternalResource) => {
    if (resource.fileData) {
      await deleteFileFromIndexedDB(resource.id);
    }
    const updated = cert.externalResources.filter((r) => r.id !== resource.id);
    onUpdateCert({ ...cert, externalResources: updated });
  };

  return (
    <div className="space-y-4">
      {/* Return to Tracks Breadcrumb Banner */}
      {onBackToTracks && (
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#09152a] border border-blue-900/40 shadow-sm animate-fadeIn">
          <div className="flex items-center gap-2.5 text-xs">
            <button
              onClick={onBackToTracks}
              className="btn-3d-dark px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-sky-400 hover:text-white cursor-pointer font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Voltar para Trilhas RACAN</span>
            </button>
            <span className="text-slate-600">/</span>
            <span className="text-slate-400 font-mono">Trilhas de Conhecimento</span>
            <span className="text-slate-600">/</span>
            <span className="text-white font-semibold">Certificações de TI</span>
          </div>
          <span className="text-xs text-sky-300 font-mono hidden sm:inline">
            Preparação Executiva & Simulados
          </span>
        </div>
      )}

      {/* Top Filter Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-bold text-white tracking-tight">
            Trilhas de Estudo & Certificações
          </h2>
          <span className="text-xs text-slate-400 font-mono">
            ({filteredCerts.length})
          </span>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-between sm:justify-end">
          <div className="flex items-center gap-1 text-xs overflow-x-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded text-xs font-medium transition cursor-pointer whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-slate-800 text-sky-400 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <button
            onClick={onOpenCreateModal}
            className="btn-3d-teal px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            Novo Módulo
          </button>
        </div>
      </div>

      {/* Responsive Grid with 3D Colored Boxes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCerts.map((cert, index) => {
          const themeKey =
            cert.colorTheme || PALETTE_FALLBACKS[index % PALETTE_FALLBACKS.length];
          const theme = THEMES_MAP[themeKey] || THEMES_MAP.sky;

          const totalModules = cert.modules.length;
          const completedModules = cert.modules.filter((m) => m.completed).length;
          const progressPercent =
            totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;
          const isExpanded = expandedModules[cert.id] ?? false;

          return (
            <div
              key={cert.id}
              className={`card-3d-base ${theme.cardClass} p-5 flex flex-col justify-between select-none`}
            >
              <div>
                {/* Header: Initial Code Badge & Gate */}
                <div className="flex items-center justify-between gap-2 text-xs mb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm font-black font-mono px-2.5 py-1 rounded-md border ${theme.badgeClass}`}
                    >
                      {cert.code}
                    </span>
                    <span className="text-[11px] font-medium text-slate-400">
                      {cert.targetGate}
                    </span>
                  </div>

                  <select
                    value={cert.status}
                    onChange={(e) => handleStatusChange(cert, e.target.value as CertStatus)}
                    className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-950/90 border border-slate-700/60 text-slate-300 cursor-pointer focus:outline-none"
                  >
                    <option value="Planejada">Planejada</option>
                    <option value="Em Andamento">Em Andamento</option>
                    <option value="Concluída">Concluída</option>
                  </select>
                </div>

                {/* Initial Title (Clean, NO verbose descriptions on initial page) */}
                <h3 className={`text-base font-bold ${theme.titleColor} tracking-tight leading-snug`}>
                  {cert.title}
                </h3>

                <div className="text-xs text-slate-400 mt-1 flex items-center gap-2 font-medium">
                  <span>{cert.issuer}</span>
                  {cert.officialUrl && (
                    <a
                      href={cert.officialUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-slate-400 hover:text-white flex items-center gap-0.5 text-[11px] ml-auto"
                    >
                      Oficial <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                </div>

                {/* 3D Progress Bar */}
                <div className="mt-4 pt-3 border-t border-slate-800/80">
                  <div className="flex items-center justify-between text-xs mb-1.5 text-slate-300 font-medium">
                    <span>
                      Progresso: <strong className="text-white font-mono">{progressPercent}%</strong>
                    </span>
                    <span className="text-slate-400 text-[11px] font-mono">
                      {cert.hoursSpent}h / {cert.estimatedHours}h
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-950/90 rounded-full overflow-hidden border border-slate-800/80 shadow-inner">
                    <div
                      className={`h-full ${theme.progressBg} rounded-full transition-all duration-300`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Modules & Topics (Collapsible) */}
                <div className="mt-4 pt-2 border-t border-slate-800/80">
                  <button
                    onClick={() => toggleModuleExpansion(cert.id)}
                    className="w-full flex items-center justify-between text-xs font-semibold text-slate-300 hover:text-white py-1 transition cursor-pointer"
                  >
                    <span className="flex items-center gap-1.5">
                      <BookOpen className={`w-3.5 h-3.5 ${theme.iconColor}`} />
                      Conteúdos ({completedModules}/{cert.modules.length})
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="mt-2 space-y-1.5 max-h-52 overflow-y-auto pr-1">
                      {cert.modules.map((module) => (
                        <div
                          key={module.id}
                          onClick={() => toggleModuleCompletion(cert, module.id)}
                          className={`p-2 rounded-lg border text-xs cursor-pointer transition flex items-start gap-2 ${
                            module.completed
                              ? 'bg-slate-950/40 border-slate-800/50 text-slate-500'
                              : 'bg-slate-950/80 border-slate-800/90 text-slate-200 hover:border-slate-700'
                          }`}
                        >
                          <div className="mt-0.5 shrink-0">
                            {module.completed ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Circle className="w-3.5 h-3.5 text-slate-500" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className={module.completed ? 'line-through text-slate-500' : 'font-medium'}>
                              {module.title}
                            </div>
                            {module.description && (
                              <div className="text-[10px] text-slate-400 mt-0.5">
                                {module.description}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* External Materials Section (Files & Links stored in DB) */}
                <div className="mt-3 pt-2 border-t border-slate-800/80">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                      <FolderOpen className="w-3 h-3 text-slate-400" />
                      Arquivos & Links Salvos ({cert.externalResources.length})
                    </span>
                    <button
                      onClick={() => onOpenAddResourceModal(cert)}
                      className="text-[11px] text-sky-400 hover:underline flex items-center gap-0.5 cursor-pointer font-medium"
                    >
                      <Plus className="w-3 h-3" /> Anexar
                    </button>
                  </div>

                  {cert.externalResources.length > 0 && (
                    <div className="space-y-1 mt-1.5">
                      {cert.externalResources.map((res) => {
                        const isFile = !!res.fileData;

                        return (
                          <div
                            key={res.id}
                            className="flex items-center justify-between p-1.5 rounded bg-slate-950/80 border border-slate-800/80 text-xs"
                          >
                            {isFile ? (
                              <button
                                type="button"
                                onClick={() => downloadFile(res)}
                                className="font-medium text-emerald-400 hover:text-emerald-300 truncate flex items-center gap-1.5 cursor-pointer text-left flex-1"
                                title="Clique para baixar / abrir o arquivo do banco de dados"
                              >
                                <Download className="w-3 h-3 text-emerald-400 shrink-0" />
                                <span className="truncate">{res.fileName || res.title}</span>
                                {res.fileSize && (
                                  <span className="text-[10px] text-slate-500 font-mono shrink-0">
                                    ({res.fileSize})
                                  </span>
                                )}
                              </button>
                            ) : (
                              <a
                                href={res.url}
                                target="_blank"
                                rel="noreferrer"
                                className="font-medium text-slate-300 hover:text-sky-300 truncate flex items-center gap-1.5 flex-1"
                              >
                                {res.type === 'video' && <Video className="w-3 h-3 text-rose-400 shrink-0" />}
                                {res.type === 'doc' && <FileText className="w-3 h-3 text-emerald-400 shrink-0" />}
                                {res.type === 'link' && <LinkIcon className="w-3 h-3 text-sky-400 shrink-0" />}
                                <span className="truncate">{res.title}</span>
                              </a>
                            )}

                            <button
                              onClick={() => handleDeleteResource(cert, res)}
                              className="text-slate-500 hover:text-rose-400 p-0.5 cursor-pointer shrink-0 ml-1"
                              title="Remover do banco"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Minimal Card Footer Actions */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-1.5 text-xs">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onOpenSimuladosForCert(cert)}
                    className="btn-3d-amber px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    title="Adicionar e gerenciar Simulados desta certificação"
                  >
                    <FileCheck className="w-3.5 h-3.5 text-amber-300" />
                    Simulados
                  </button>
                  <button
                    onClick={() => onStartFeynmanForCert(cert)}
                    className="btn-3d-purple px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" />
                    Feynman
                  </button>
                  {onOpenNotesForCert && (
                    <button
                      onClick={() => onOpenNotesForCert(cert)}
                      className="btn-3d-dark px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1 cursor-pointer text-slate-300 hover:text-white"
                      title="Abrir anotações no Bloco de Notas"
                    >
                      <FileText className="w-3 h-3 text-sky-400" />
                      Anotar
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onOpenEditModal(cert)}
                    className="text-slate-400 hover:text-white px-2 py-1 rounded hover:bg-slate-800/60 cursor-pointer"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Excluir a trilha "${cert.title}"?`)) {
                        onDeleteCert(cert.id);
                      }
                    }}
                    className="text-slate-500 hover:text-rose-400 px-2 py-1 rounded hover:bg-rose-950/40 cursor-pointer"
                    title="Excluir esta trilha"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
