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
  theme = 'light',
}) => {
  const isLight = theme === 'light';
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

  // Dynamic light/dark theme styles for cards
  const getCardThemeStyles = (colorKey: string) => {
    if (isLight) {
      switch (colorKey) {
        case 'emerald':
          return {
            cardBg: 'bg-[#eefdf4] border-2 border-emerald-400 shadow-md shadow-emerald-900/5',
            titleColor: 'text-emerald-950',
            codeColor: 'text-emerald-700',
            badgeClass: 'bg-white text-emerald-900 border-emerald-300 font-bold',
            progressBg: 'bg-emerald-500',
            iconColor: 'text-emerald-600',
          };
        case 'purple':
          return {
            cardBg: 'bg-[#f8f3ff] border-2 border-purple-400 shadow-md shadow-purple-900/5',
            titleColor: 'text-purple-950',
            codeColor: 'text-purple-700',
            badgeClass: 'bg-white text-purple-900 border-purple-300 font-bold',
            progressBg: 'bg-purple-500',
            iconColor: 'text-purple-600',
          };
        case 'amber':
          return {
            cardBg: 'bg-[#fffbeb] border-2 border-amber-400 shadow-md shadow-amber-900/5',
            titleColor: 'text-amber-950',
            codeColor: 'text-amber-700',
            badgeClass: 'bg-white text-amber-900 border-amber-300 font-bold',
            progressBg: 'bg-amber-500',
            iconColor: 'text-amber-600',
          };
        case 'rose':
          return {
            cardBg: 'bg-[#fff1f4] border-2 border-rose-400 shadow-md shadow-rose-900/5',
            titleColor: 'text-rose-950',
            codeColor: 'text-rose-700',
            badgeClass: 'bg-white text-rose-900 border-rose-300 font-bold',
            progressBg: 'bg-rose-500',
            iconColor: 'text-rose-600',
          };
        case 'teal':
          return {
            cardBg: 'bg-[#effcf9] border-2 border-teal-400 shadow-md shadow-teal-900/5',
            titleColor: 'text-teal-950',
            codeColor: 'text-teal-700',
            badgeClass: 'bg-white text-teal-900 border-teal-300 font-bold',
            progressBg: 'bg-teal-500',
            iconColor: 'text-teal-600',
          };
        case 'indigo':
          return {
            cardBg: 'bg-[#eef2ff] border-2 border-indigo-400 shadow-md shadow-indigo-900/5',
            titleColor: 'text-indigo-950',
            codeColor: 'text-indigo-700',
            badgeClass: 'bg-white text-indigo-900 border-indigo-300 font-bold',
            progressBg: 'bg-indigo-500',
            iconColor: 'text-indigo-600',
          };
        default:
          return {
            cardBg: 'bg-[#edf6ff] border-2 border-sky-400 shadow-md shadow-sky-900/5',
            titleColor: 'text-sky-950',
            codeColor: 'text-sky-700',
            badgeClass: 'bg-white text-sky-900 border-sky-300 font-bold',
            progressBg: 'bg-sky-500',
            iconColor: 'text-sky-600',
          };
      }
    }

    // Dark Mode Theme
    switch (colorKey) {
      case 'emerald':
        return {
          cardBg: 'card-3d-base card-3d-emerald',
          titleColor: 'text-emerald-300',
          codeColor: 'text-emerald-400',
          badgeClass: 'bg-emerald-950/90 text-emerald-300 border-emerald-500/50',
          progressBg: 'bg-emerald-500',
          iconColor: 'text-emerald-400',
        };
      case 'purple':
        return {
          cardBg: 'card-3d-base card-3d-purple',
          titleColor: 'text-purple-300',
          codeColor: 'text-purple-400',
          badgeClass: 'bg-purple-950/90 text-purple-300 border-purple-500/50',
          progressBg: 'bg-purple-500',
          iconColor: 'text-purple-400',
        };
      case 'amber':
        return {
          cardBg: 'card-3d-base card-3d-amber',
          titleColor: 'text-amber-300',
          codeColor: 'text-amber-400',
          badgeClass: 'bg-amber-950/90 text-amber-300 border-amber-500/50',
          progressBg: 'bg-amber-500',
          iconColor: 'text-amber-400',
        };
      case 'rose':
        return {
          cardBg: 'card-3d-base card-3d-rose',
          titleColor: 'text-rose-300',
          codeColor: 'text-rose-400',
          badgeClass: 'bg-rose-950/90 text-rose-300 border-rose-500/50',
          progressBg: 'bg-rose-500',
          iconColor: 'text-rose-400',
        };
      case 'teal':
        return {
          cardBg: 'card-3d-base card-3d-teal',
          titleColor: 'text-teal-300',
          codeColor: 'text-teal-400',
          badgeClass: 'bg-teal-950/90 text-teal-300 border-teal-500/50',
          progressBg: 'bg-teal-500',
          iconColor: 'text-teal-400',
        };
      case 'indigo':
        return {
          cardBg: 'card-3d-base card-3d-indigo',
          titleColor: 'text-indigo-300',
          codeColor: 'text-indigo-400',
          badgeClass: 'bg-indigo-950/90 text-indigo-300 border-indigo-500/50',
          progressBg: 'bg-indigo-500',
          iconColor: 'text-indigo-400',
        };
      default:
        return {
          cardBg: 'card-3d-base card-3d-sky',
          titleColor: 'text-sky-300',
          codeColor: 'text-sky-400',
          badgeClass: 'bg-sky-950/90 text-sky-300 border-sky-500/50',
          progressBg: 'bg-sky-500',
          iconColor: 'text-sky-400',
        };
    }
  };

  return (
    <div className="space-y-4">
      {/* Return to Tracks Breadcrumb Banner - Adapts to Light & Dark Theme */}
      {onBackToTracks && (
        <div
          className={`flex items-center justify-between p-3.5 rounded-xl border-2 transition-colors animate-fadeIn ${
            isLight
              ? 'bg-[#e5f0fc] border-[#8cb7ea] shadow-md shadow-sky-900/5'
              : 'bg-[#09152a] border-blue-900/40 shadow-sm'
          }`}
        >
          <div className="flex items-center gap-2.5 text-xs">
            <button
              onClick={onBackToTracks}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer font-bold transition ${
                isLight
                  ? 'bg-white hover:bg-sky-50 text-sky-800 border border-sky-300 shadow-2xs'
                  : 'btn-3d-dark text-sky-400 hover:text-white'
              }`}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Voltar para Trilhas RACAN</span>
            </button>
            <span className={isLight ? 'text-slate-400 font-bold' : 'text-slate-600'}>/</span>
            <span className={`font-mono ${isLight ? 'text-slate-600 font-semibold' : 'text-slate-400'}`}>
              Trilhas de Conhecimento
            </span>
            <span className={isLight ? 'text-slate-400 font-bold' : 'text-slate-600'}>/</span>
            <span className={`font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Certificações de TI
            </span>
          </div>
          <span className={`text-xs font-mono hidden sm:inline ${isLight ? 'text-sky-700 font-semibold' : 'text-sky-300'}`}>
            Preparação Executiva & Simulados
          </span>
        </div>
      )}

      {/* Top Filter Bar */}
      <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b ${
        isLight ? 'border-sky-200' : 'border-slate-800/80'
      }`}>
        <div className="flex items-center gap-2">
          <h2 className={`text-base font-bold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
            Trilhas de Estudo & Certificações
          </h2>
          <span className={`text-xs font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
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
                    ? isLight
                      ? 'bg-sky-600 text-white font-bold shadow-2xs'
                      : 'bg-slate-800 text-sky-400 font-semibold'
                    : isLight
                    ? 'bg-white hover:bg-sky-50 text-slate-700 border border-sky-200'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <button
            onClick={onOpenCreateModal}
            className="btn-3d-teal px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer whitespace-nowrap shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            Novo Módulo
          </button>
        </div>
      </div>

      {/* Responsive Grid with Themed Boxes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCerts.map((cert, index) => {
          const themeKey =
            cert.colorTheme || PALETTE_FALLBACKS[index % PALETTE_FALLBACKS.length];
          const cardTheme = getCardThemeStyles(themeKey);

          const totalModules = cert.modules.length;
          const completedModules = cert.modules.filter((m) => m.completed).length;
          const progressPercent =
            totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;
          const isExpanded = expandedModules[cert.id] ?? false;

          return (
            <div
              key={cert.id}
              className={`rounded-2xl ${cardTheme.cardBg} p-5 flex flex-col justify-between select-none transition-all duration-200 hover:-translate-y-1`}
            >
              <div>
                {/* Header: Initial Code Badge & Gate */}
                <div className="flex items-center justify-between gap-2 text-xs mb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm font-black font-mono px-2.5 py-1 rounded-md border ${cardTheme.badgeClass}`}
                    >
                      {cert.code}
                    </span>
                    <span className={`text-[11px] font-medium ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                      {cert.targetGate}
                    </span>
                  </div>

                  <select
                    value={cert.status}
                    onChange={(e) => handleStatusChange(cert, e.target.value as CertStatus)}
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded cursor-pointer focus:outline-none border ${
                      isLight
                        ? 'bg-white border-slate-300 text-slate-800'
                        : 'bg-slate-950/90 border-slate-700/60 text-slate-300'
                    }`}
                  >
                    <option value="Planejada">Planejada</option>
                    <option value="Em Andamento">Em Andamento</option>
                    <option value="Concluída">Concluída</option>
                  </select>
                </div>

                {/* Title */}
                <h3 className={`text-base font-bold ${cardTheme.titleColor} tracking-tight leading-snug`}>
                  {cert.title}
                </h3>

                <div className={`text-xs mt-1 flex items-center gap-2 font-medium ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                  <span>{cert.issuer}</span>
                  {cert.officialUrl && (
                    <a
                      href={cert.officialUrl}
                      target="_blank"
                      rel="noreferrer"
                      className={`flex items-center gap-0.5 text-[11px] ml-auto ${
                        isLight ? 'text-sky-700 hover:text-sky-900' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Oficial <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                </div>

                {/* Progress Bar */}
                <div className={`mt-4 pt-3 border-t ${isLight ? 'border-slate-200/90' : 'border-slate-800/80'}`}>
                  <div className={`flex items-center justify-between text-xs mb-1.5 font-medium ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    <span>
                      Progresso: <strong className={`font-mono ${isLight ? 'text-slate-900' : 'text-white'}`}>{progressPercent}%</strong>
                    </span>
                    <span className={`text-[11px] font-mono ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      {cert.hoursSpent}h / {cert.estimatedHours}h
                    </span>
                  </div>
                  <div className={`w-full h-2 rounded-full overflow-hidden border shadow-inner ${
                    isLight ? 'bg-slate-200/90 border-slate-300/60' : 'bg-slate-950/90 border-slate-800/80'
                  }`}>
                    <div
                      className={`h-full ${cardTheme.progressBg} rounded-full transition-all duration-300`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Modules & Topics (Collapsible) */}
                <div className={`mt-4 pt-2 border-t ${isLight ? 'border-slate-200/90' : 'border-slate-800/80'}`}>
                  <button
                    onClick={() => toggleModuleExpansion(cert.id)}
                    className={`w-full flex items-center justify-between text-xs font-semibold py-1 transition cursor-pointer ${
                      isLight ? 'text-slate-800 hover:text-sky-800' : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <BookOpen className={`w-3.5 h-3.5 ${cardTheme.iconColor}`} />
                      Conteúdos ({completedModules}/{cert.modules.length})
                    </span>
                    {isExpanded ? (
                      <ChevronUp className={`w-3.5 h-3.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`} />
                    ) : (
                      <ChevronDown className={`w-3.5 h-3.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`} />
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
                              ? isLight
                                ? 'bg-slate-100/70 border-slate-200 text-slate-400'
                                : 'bg-slate-950/40 border-slate-800/50 text-slate-500'
                              : isLight
                              ? 'bg-white/90 border-slate-200 text-slate-800 hover:border-sky-300 shadow-2xs'
                              : 'bg-slate-950/80 border-slate-800/90 text-slate-200 hover:border-slate-700'
                          }`}
                        >
                          <div className="mt-0.5 shrink-0">
                            {module.completed ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                              <Circle className={`w-3.5 h-3.5 ${isLight ? 'text-slate-400' : 'text-slate-500'}`} />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className={module.completed ? 'line-through text-slate-400' : 'font-medium'}>
                              {module.title}
                            </div>
                            {module.description && (
                              <div className={`text-[10px] mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                                {module.description}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* External Materials Section */}
                <div className={`mt-3 pt-2 border-t ${isLight ? 'border-slate-200/90' : 'border-slate-800/80'}`}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className={`text-[11px] font-medium flex items-center gap-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                      <FolderOpen className="w-3 h-3" />
                      Arquivos & Links Salvos ({cert.externalResources.length})
                    </span>
                    <button
                      onClick={() => onOpenAddResourceModal(cert)}
                      className="text-[11px] text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-0.5 cursor-pointer font-medium"
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
                            className={`flex items-center justify-between p-1.5 rounded border text-xs ${
                              isLight
                                ? 'bg-white/80 border-slate-200 text-slate-800'
                                : 'bg-slate-950/80 border-slate-800/80 text-slate-200'
                            }`}
                          >
                            {isFile ? (
                              <button
                                type="button"
                                onClick={() => downloadFile(res)}
                                className="font-medium text-emerald-600 dark:text-emerald-400 hover:underline truncate flex items-center gap-1.5 cursor-pointer text-left flex-1"
                                title="Clique para baixar / abrir o arquivo do banco de dados"
                              >
                                <Download className="w-3 h-3 shrink-0 text-emerald-500" />
                                <span className="truncate">{res.fileName || res.title}</span>
                                {res.fileSize && (
                                  <span className={`text-[10px] font-mono shrink-0 ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
                                    ({res.fileSize})
                                  </span>
                                )}
                              </button>
                            ) : (
                              <a
                                href={res.url}
                                target="_blank"
                                rel="noreferrer"
                                className={`font-medium truncate flex items-center gap-1.5 flex-1 ${
                                  isLight ? 'text-slate-700 hover:text-sky-700' : 'text-slate-300 hover:text-sky-300'
                                }`}
                              >
                                {res.type === 'video' && <Video className="w-3 h-3 text-rose-500 shrink-0" />}
                                {res.type === 'doc' && <FileText className="w-3 h-3 text-emerald-500 shrink-0" />}
                                {res.type === 'link' && <LinkIcon className="w-3 h-3 text-sky-500 shrink-0" />}
                                <span className="truncate">{res.title}</span>
                              </a>
                            )}

                            <button
                              onClick={() => handleDeleteResource(cert, res)}
                              className="text-slate-400 hover:text-rose-500 p-0.5 cursor-pointer shrink-0 ml-1 transition"
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

              {/* Card Footer Actions */}
              <div className={`mt-4 pt-3 border-t flex items-center justify-between gap-1.5 text-xs ${
                isLight ? 'border-slate-200/90' : 'border-slate-800/80'
              }`}>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onOpenSimuladosForCert(cert)}
                    className="btn-3d-amber px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1 cursor-pointer shadow-xs"
                    title="Adicionar e gerenciar Simulados desta certificação"
                  >
                    <FileCheck className="w-3.5 h-3.5 text-amber-200" />
                    Simulados
                  </button>
                  <button
                    onClick={() => onStartFeynmanForCert(cert)}
                    className="btn-3d-purple px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1 cursor-pointer shadow-xs"
                  >
                    <Sparkles className="w-3 h-3" />
                    Feynman
                  </button>
                  {onOpenNotesForCert && (
                    <button
                      onClick={() => onOpenNotesForCert(cert)}
                      className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1 cursor-pointer transition ${
                        isLight
                          ? 'bg-white hover:bg-sky-50 text-slate-800 border border-slate-300 shadow-2xs'
                          : 'btn-3d-dark text-slate-300 hover:text-white'
                      }`}
                      title="Abrir anotações no Bloco de Notas"
                    >
                      <FileText className="w-3 h-3 text-sky-500" />
                      Anotar
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onOpenEditModal(cert)}
                    className={`px-2 py-1 rounded cursor-pointer transition ${
                      isLight
                        ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Excluir a trilha "${cert.title}"?`)) {
                        onDeleteCert(cert.id);
                      }
                    }}
                    className={`px-2 py-1 rounded cursor-pointer transition ${
                      isLight
                        ? 'text-rose-600 hover:text-rose-800 hover:bg-rose-100/60'
                        : 'text-slate-500 hover:text-rose-400 hover:bg-rose-950/40'
                    }`}
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
