import React, { useState } from 'react';
import {
  KnowledgeTrack,
  Certification,
} from '../types';
import {
  Award,
  ShieldCheck,
  BrainCircuit,
  ShieldAlert,
  Users,
  Briefcase,
  Youtube,
  CheckCircle2,
  Search,
  Plus,
  ArrowRight,
  Layers,
  Filter,
  MoreVertical,
  Edit3,
  Trash2
} from 'lucide-react';

interface TracksHubViewProps {
  tracks: KnowledgeTrack[];
  certifications: Certification[];
  onOpenTrack: (track: KnowledgeTrack) => void;
  onOpenCertifications: () => void;
  onOpenCreateTrackModal: () => void;
  onEditTrack: (track: KnowledgeTrack) => void;
  onDeleteTrack: (trackId: string) => void;
  theme?: 'light' | 'dark';
}

export const TracksHubView: React.FC<TracksHubViewProps> = ({
  tracks,
  certifications,
  onOpenTrack,
  onOpenCertifications,
  onOpenCreateTrackModal,
  onEditTrack,
  onDeleteTrack,
  theme = 'light',
}) => {
  const isLight = theme === 'light';
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [openMenuTrackId, setOpenMenuTrackId] = useState<string | null>(null);

  // Helper to map track icon name to Lucide Icon
  const getTrackIcon = (iconName: string, slug?: string) => {
    switch (iconName) {
      case 'Award':
        return Award;
      case 'ShieldCheck':
        return ShieldCheck;
      case 'BrainCircuit':
        return BrainCircuit;
      case 'ShieldAlert':
        return ShieldAlert;
      case 'Users':
        return Users;
      case 'Briefcase':
        return Briefcase;
      case 'Youtube':
        return Youtube;
      default:
        if (slug === 'governanca-seguranca-ia') return ShieldCheck;
        if (slug === 'certificacoes-ti') return Award;
        if (slug === 'data-science-ia') return BrainCircuit;
        if (slug === 'ethical-hacker') return ShieldAlert;
        if (slug === 'mentoria-racan') return Users;
        if (slug === 'racan-business-technology') return Briefcase;
        if (slug === 'canal-youtube') return Youtube;
        return Layers;
    }
  };

  // Unified color theme styles based on the preferred layout and styling of "Certificações de TI"
  const getThemeStyles = (_color?: string) => {
    if (isLight) {
      return {
        border: 'border-2 border-[#38bdf8] hover:border-sky-500 shadow-md shadow-sky-900/10 hover:shadow-xl',
        cardBg: 'bg-[#dce9f8]',
        badgeBg: 'bg-white/95 text-sky-950 border border-sky-300 font-bold shadow-2xs',
        iconBox: 'bg-white border border-sky-300 text-sky-700 shadow-xs',
        frameMark: 'bg-gradient-to-r from-sky-500 via-sky-400 to-blue-600',
        titleColor: 'text-slate-900 group-hover:text-sky-800',
        subtitleColor: 'text-sky-900 font-bold',
        descColor: 'text-slate-700',
        tagBg: 'bg-white/90 border-sky-300 text-slate-800 font-semibold',
        metaBox: 'bg-white/90 border border-sky-300 text-slate-800',
        progressBg: 'bg-sky-500',
        progressTrack: 'bg-sky-200/90',
        btnClass: 'btn-3d-primary',
      };
    }

    // Dark Mode Theme - Elevated royal blue surfaces identical to the preferred "Certificações de TI" block
    return {
      border: 'border-2 border-sky-400/80 hover:border-sky-300 shadow-xl shadow-black/40',
      cardBg: 'bg-gradient-to-br from-[#10223f] via-[#14284b] to-[#0c1c36]',
      badgeBg: 'bg-sky-500/20 text-sky-300 border border-sky-400/40',
      iconBox: 'bg-[#08152c] border border-sky-500/40 text-sky-400 shadow-sm',
      frameMark: 'bg-sky-400',
      titleColor: 'text-white group-hover:text-sky-300',
      subtitleColor: 'text-slate-200 font-medium',
      descColor: 'text-slate-300',
      tagBg: 'bg-[#09162e] border border-slate-700/80 text-slate-200',
      metaBox: 'bg-[#08152b]/95 border border-slate-700/80 text-slate-200',
      progressBg: 'bg-sky-500',
      progressTrack: 'bg-[#08152b]',
      btnClass: 'btn-3d-primary',
    };
  };


  // Filtered tracks
  const filteredTracks = tracks.filter((track) => {
    const matchesSearch =
      track.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      track.subtitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      track.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      track.subcategories?.some((sub) =>
        sub.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.items?.some((i) => i.title.toLowerCase().includes(searchTerm.toLowerCase()))
      );

    const matchesCategory = selectedCategory === 'all' || track.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const categories = [
    { id: 'all', label: 'Todas as Trilhas' },
    { id: 'Governança & Regulação', label: 'Governança & Leis' },
    { id: 'Certificações Oficiais', label: 'Certificações' },
    { id: 'Inteligência Artificial', label: 'Data & IA' },
    { id: 'Cibersegurança', label: 'Segurança' },
    { id: 'Mentoria & Liderança', label: 'Mentoria' },
    { id: 'Negócios & Tecnologia', label: 'Negócios' },
    { id: 'Mídia & Conteúdo', label: 'YouTube' },
  ];

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Sleek, Borderless Filter Menu Bar */}
      <div
        className={`flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3.5 p-3.5 sm:p-4 rounded-2xl shadow-md transition-all ${
          isLight
            ? 'bg-white/80 backdrop-blur-md shadow-slate-200/50'
            : 'bg-[#0d1830]/90 backdrop-blur-md shadow-black/40 border border-slate-700/50'
        }`}
      >
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${isLight ? 'text-purple-600' : 'text-purple-400'}`} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar trilha, módulo, vídeo ou anotação..."
            className={`w-full pl-10 pr-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-purple-500/30 ${
              isLight
                ? 'bg-slate-100/90 text-slate-900 placeholder-slate-400 focus:bg-white'
                : 'bg-slate-800/70 text-white placeholder-slate-400 focus:bg-slate-800'
            }`}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs hover:opacity-100 ${isLight ? 'text-purple-400 hover:text-purple-700' : 'text-slate-400 hover:text-white'}`}
            >
              ✕
            </button>
          )}
        </div>

        {/* Category Filter Chips & Add Track Action */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
            <Filter className={`w-3.5 h-3.5 mr-0.5 shrink-0 ${isLight ? 'text-purple-600' : 'text-purple-400'}`} />
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                    isSelected
                      ? 'bg-purple-600 text-white shadow-xs'
                      : isLight
                      ? 'text-slate-600 hover:text-purple-700 hover:bg-purple-50/80 font-medium'
                      : 'text-slate-300 hover:text-white hover:bg-purple-950/40 font-medium'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Add Track Action */}
          <button
            onClick={onOpenCreateTrackModal}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer bg-purple-600 hover:bg-purple-700 text-white shadow-xs shrink-0 ml-auto transition"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Trilha de Estudo</span>
          </button>
        </div>
      </div>

      {/* 6 Aligned Tracks Grid with Respective Light Pastel Color Backgrounds & Standout Contours */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTracks.map((track) => {
          const IconComponent = getTrackIcon(track.icon, track.slug);
          const themeStyles = getThemeStyles(track.colorTheme);

          // For Certificações de TI, we pull stats from actual certifications list
          const isCertHub = track.isCertificationHub || track.slug === 'certificacoes-ti';

          let totalItemsCount = 0;
          let completedItemsCount = 0;
          let resourcesCount = 0;
          let subcategoriesCount = 0;

          if (isCertHub) {
            subcategoriesCount = 4; // 4 Gates do Cronograma
            totalItemsCount = certifications.length;
            completedItemsCount = certifications.filter((c) => c.status === 'Concluída').length;
            resourcesCount = certifications.reduce((acc, c) => acc + (c.externalResources?.length || 0), 0);
          } else {
            subcategoriesCount = track.subcategories?.length || 0;
            track.subcategories?.forEach((sub) => {
              sub.items?.forEach((item) => {
                totalItemsCount += 1;
                if (item.status === 'Concluído') completedItemsCount += 1;
                resourcesCount += item.resources?.length || 0;
              });
            });
          }

          const progressPercentage = totalItemsCount > 0
            ? Math.round((completedItemsCount / totalItemsCount) * 100)
            : 0;

          return (
            <div
              key={track.id}
              onClick={() => {
                if (isCertHub) {
                  onOpenCertifications();
                } else {
                  onOpenTrack(track);
                }
              }}
              className={`group relative rounded-2xl ${themeStyles.cardBg} ${themeStyles.border} flex flex-col justify-between transition-all duration-200 cursor-pointer hover:-translate-y-1 overflow-hidden select-none`}
            >
              {/* Colored Top Frame Marking Strip */}
              <div className={`h-2 w-full ${themeStyles.frameMark}`} />

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  {/* Header with Icon, Category Badge & Three-Dots Kebab Menu */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${themeStyles.iconBox} group-hover:scale-105 transition-transform`}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div>
                        <span className={`inline-block px-2.5 py-0.5 rounded-md text-[11px] ${themeStyles.badgeBg}`}>
                          {track.category}
                        </span>
                      </div>
                    </div>

                    {/* Three-Dots Kebab Menu Button in Upper Right Corner */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuTrackId(openMenuTrackId === track.id ? null : track.id);
                        }}
                        className={`p-1.5 rounded-lg transition cursor-pointer ${
                          isLight
                            ? 'hover:bg-blue-300/60 text-slate-700 hover:text-blue-950'
                            : 'hover:bg-slate-700/70 text-slate-300 hover:text-white'
                        }`}
                        title="Opções da Trilha (Editar ou Excluir)"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {openMenuTrackId === track.id && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className={`absolute right-0 top-8 z-30 w-44 rounded-xl shadow-2xl border py-1.5 backdrop-blur-md animate-in fade-in zoom-in-95 duration-150 ${
                            isLight
                              ? 'bg-white/98 border-blue-200 text-slate-800 shadow-blue-950/20'
                              : 'bg-[#0f1f3a]/98 border-blue-500/40 text-slate-100 shadow-black/80'
                          }`}
                        >
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuTrackId(null);
                              onEditTrack(track);
                            }}
                            className={`w-full px-3 py-2 text-left text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
                              isLight ? 'hover:bg-blue-50 hover:text-blue-700' : 'hover:bg-blue-900/40 hover:text-blue-300'
                            }`}
                          >
                            <Edit3 className="w-3.5 h-3.5 text-blue-500" />
                            <span>Editar Trilha</span>
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuTrackId(null);
                              if (confirm(`Deseja realmente excluir a trilha "${track.title}"?`)) {
                                onDeleteTrack(track.id);
                              }
                            }}
                            className={`w-full px-3 py-2 text-left text-xs font-bold flex items-center gap-2 transition cursor-pointer text-rose-500 ${
                              isLight ? 'hover:bg-rose-50' : 'hover:bg-rose-950/40'
                            }`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Excluir Trilha</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Track Title & Subtitle */}
                  <h3 className={`text-base sm:text-lg font-extrabold ${themeStyles.titleColor} transition-colors tracking-tight leading-snug mb-1`}>
                    {track.title}
                  </h3>
                  <p className={`text-xs ${themeStyles.subtitleColor} mb-2.5 line-clamp-1`}>
                    {track.subtitle}
                  </p>

                  {/* Description */}
                  <p className={`text-xs ${themeStyles.descColor} leading-relaxed mb-4 line-clamp-2`}>
                    {track.description}
                  </p>

                  {/* Tags */}
                  {track.tags && track.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {track.tags.slice(0, 4).map((tag, idx) => (
                        <span
                          key={idx}
                          className={`px-2 py-0.5 rounded text-[10px] font-mono border shadow-2xs ${themeStyles.tagBg}`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Bottom Section: Progress Bar, Metrics & Action Button */}
                <div className={`pt-3 border-t ${isLight ? 'border-black/10' : 'border-slate-800/80'} space-y-3`}>
                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className={`flex items-center gap-1 font-medium ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Progresso da Trilha
                      </span>
                      <span className={`font-extrabold font-mono ${isLight ? 'text-slate-900' : 'text-slate-200'}`}>
                        {progressPercentage}%
                      </span>
                    </div>
                    <div className={`h-2 w-full ${themeStyles.progressTrack} rounded-full overflow-hidden shadow-inner`}>
                      <div
                        className={`h-full ${themeStyles.progressBg} transition-all duration-500 rounded-full`}
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Quick Meta Counters with Contour and High Contrast */}
                  <div className={`grid grid-cols-3 gap-2 text-center text-[11px] py-1.5 rounded-xl font-mono shadow-2xs ${themeStyles.metaBox}`}>
                    <div>
                      <span className={`block text-[10px] font-sans font-bold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                        {isCertHub ? 'Gates' : 'Módulos'}
                      </span>
                      <span className={`font-extrabold ${isLight ? 'text-slate-900' : 'text-slate-200'}`}>
                        {subcategoriesCount}
                      </span>
                    </div>
                    <div>
                      <span className={`block text-[10px] font-sans font-bold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                        {isCertHub ? 'Certificações' : 'Tópicos'}
                      </span>
                      <span className={`font-extrabold ${isLight ? 'text-slate-900' : 'text-slate-200'}`}>
                        {totalItemsCount}
                      </span>
                    </div>
                    <div>
                      <span className={`block text-[10px] font-sans font-bold ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                        Links/Vídeos
                      </span>
                      <span className={`font-extrabold ${isLight ? 'text-slate-900' : 'text-slate-200'}`}>
                        {resourcesCount}
                      </span>
                    </div>
                  </div>

                  {/* Card Button */}
                  <button
                    type="button"
                    className={`w-full py-2 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 ${themeStyles.btnClass} shadow-md`}
                  >
                    <span>{isCertHub ? 'Abrir Certificações de TI' : `Acessar Módulos da Trilha`}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredTracks.length === 0 && (
        <div className={`p-8 text-center rounded-2xl border-2 ${isLight ? 'bg-white border-sky-300 text-slate-700 shadow-sm' : 'bg-[#09152a] border-slate-800 text-slate-400'} space-y-3`}>
          <Layers className="w-10 h-10 mx-auto text-sky-500 opacity-60" />
          <div className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-slate-300'}`}>Nenhuma trilha encontrada</div>
          <p className="text-xs text-slate-600">Tente buscar por outro termo ou selecione todas as categorias.</p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
            }}
            className="btn-3d-primary px-3 py-1.5 rounded-lg text-xs font-bold"
          >
            Limpar Filtros
          </button>
        </div>
      )}
    </div>
  );
};
