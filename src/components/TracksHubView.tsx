import React, { useState } from 'react';
import {
  KnowledgeTrack,
  Certification,
} from '../types';
import {
  Award,
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
  Filter
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
  onEditTrack: _onEditTrack,
  onDeleteTrack: _onDeleteTrack,
  theme = 'light',
}) => {
  const isLight = theme === 'light';
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Helper to map track icon name to Lucide Icon
  const getTrackIcon = (iconName: string, slug?: string) => {
    switch (iconName) {
      case 'Award':
        return Award;
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
        if (slug === 'certificacoes-ti') return Award;
        if (slug === 'data-science-ia') return BrainCircuit;
        if (slug === 'ethical-hacker') return ShieldAlert;
        if (slug === 'mentoria-racan') return Users;
        if (slug === 'racan-business-technology') return Briefcase;
        if (slug === 'canal-youtube') return Youtube;
        return Layers;
    }
  };

  // Color theme styles with respective soft pastel backgrounds and crisp contour lines
  const getThemeStyles = (color?: string) => {
    if (isLight) {
      switch (color) {
        case 'sky':
          return {
            border: 'border-2 border-[#38bdf8] hover:border-sky-500 shadow-md shadow-sky-900/5 hover:shadow-xl hover:shadow-sky-300/30',
            cardBg: 'bg-[#edf6ff]',
            badgeBg: 'bg-white/95 text-sky-900 border border-sky-300 font-bold shadow-2xs',
            iconBox: 'bg-white border border-sky-300 text-sky-600 shadow-xs',
            frameMark: 'bg-gradient-to-r from-sky-500 via-sky-400 to-blue-600',
            titleColor: 'text-slate-900 group-hover:text-sky-700',
            subtitleColor: 'text-sky-800 font-semibold',
            descColor: 'text-slate-700',
            tagBg: 'bg-white/90 border-sky-200 text-slate-800 font-medium',
            metaBox: 'bg-white/85 border border-sky-200/90 text-slate-800',
            progressBg: 'bg-sky-500',
            progressTrack: 'bg-sky-200/80',
            btnClass: 'btn-3d-primary',
          };
        case 'purple':
          return {
            border: 'border-2 border-[#c084fc] hover:border-purple-500 shadow-md shadow-purple-900/5 hover:shadow-xl hover:shadow-purple-300/30',
            cardBg: 'bg-[#f8f3ff]',
            badgeBg: 'bg-white/95 text-purple-900 border border-purple-300 font-bold shadow-2xs',
            iconBox: 'bg-white border border-purple-300 text-purple-600 shadow-xs',
            frameMark: 'bg-gradient-to-r from-purple-500 via-purple-400 to-indigo-600',
            titleColor: 'text-slate-900 group-hover:text-purple-700',
            subtitleColor: 'text-purple-800 font-semibold',
            descColor: 'text-slate-700',
            tagBg: 'bg-white/90 border-purple-200 text-slate-800 font-medium',
            metaBox: 'bg-white/85 border border-purple-200/90 text-slate-800',
            progressBg: 'bg-purple-500',
            progressTrack: 'bg-purple-200/80',
            btnClass: 'btn-3d-purple',
          };
        case 'rose':
          return {
            border: 'border-2 border-[#fb7185] hover:border-rose-500 shadow-md shadow-rose-900/5 hover:shadow-xl hover:shadow-rose-300/30',
            cardBg: 'bg-[#fff1f4]',
            badgeBg: 'bg-white/95 text-rose-900 border border-rose-300 font-bold shadow-2xs',
            iconBox: 'bg-white border border-rose-300 text-rose-600 shadow-xs',
            frameMark: 'bg-gradient-to-r from-rose-500 via-rose-400 to-red-600',
            titleColor: 'text-slate-900 group-hover:text-rose-700',
            subtitleColor: 'text-rose-800 font-semibold',
            descColor: 'text-slate-700',
            tagBg: 'bg-white/90 border-rose-200 text-slate-800 font-medium',
            metaBox: 'bg-white/85 border border-rose-200/90 text-slate-800',
            progressBg: 'bg-rose-500',
            progressTrack: 'bg-rose-200/80',
            btnClass: 'btn-3d-danger',
          };
        case 'emerald':
          return {
            border: 'border-2 border-[#34d399] hover:border-emerald-500 shadow-md shadow-emerald-900/5 hover:shadow-xl hover:shadow-emerald-300/30',
            cardBg: 'bg-[#eefdf4]',
            badgeBg: 'bg-white/95 text-emerald-900 border border-emerald-300 font-bold shadow-2xs',
            iconBox: 'bg-white border border-emerald-300 text-emerald-600 shadow-xs',
            frameMark: 'bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-600',
            titleColor: 'text-slate-900 group-hover:text-emerald-700',
            subtitleColor: 'text-emerald-800 font-semibold',
            descColor: 'text-slate-700',
            tagBg: 'bg-white/90 border-emerald-200 text-slate-800 font-medium',
            metaBox: 'bg-white/85 border border-emerald-200/90 text-slate-800',
            progressBg: 'bg-emerald-500',
            progressTrack: 'bg-emerald-200/80',
            btnClass: 'btn-3d-emerald',
          };
        case 'amber':
          return {
            border: 'border-2 border-[#fbbf24] hover:border-amber-500 shadow-md shadow-amber-900/5 hover:shadow-xl hover:shadow-amber-300/30',
            cardBg: 'bg-[#fffbeb]',
            badgeBg: 'bg-white/95 text-amber-950 border border-amber-300 font-bold shadow-2xs',
            iconBox: 'bg-white border border-amber-300 text-amber-600 shadow-xs',
            frameMark: 'bg-gradient-to-r from-amber-500 via-amber-400 to-orange-600',
            titleColor: 'text-slate-900 group-hover:text-amber-700',
            subtitleColor: 'text-amber-800 font-semibold',
            descColor: 'text-slate-700',
            tagBg: 'bg-white/90 border-amber-200 text-slate-800 font-medium',
            metaBox: 'bg-white/85 border border-amber-200/90 text-slate-800',
            progressBg: 'bg-amber-500',
            progressTrack: 'bg-amber-200/80',
            btnClass: 'btn-3d-amber',
          };
        case 'teal':
          return {
            border: 'border-2 border-[#2dd4bf] hover:border-teal-500 shadow-md shadow-teal-900/5 hover:shadow-xl hover:shadow-teal-300/30',
            cardBg: 'bg-[#effcf9]',
            badgeBg: 'bg-white/95 text-teal-950 border border-teal-300 font-bold shadow-2xs',
            iconBox: 'bg-white border border-teal-300 text-teal-600 shadow-xs',
            frameMark: 'bg-gradient-to-r from-teal-500 via-teal-400 to-cyan-600',
            titleColor: 'text-slate-900 group-hover:text-teal-700',
            subtitleColor: 'text-teal-800 font-semibold',
            descColor: 'text-slate-700',
            tagBg: 'bg-white/90 border-teal-200 text-slate-800 font-medium',
            metaBox: 'bg-white/85 border border-teal-200/90 text-slate-800',
            progressBg: 'bg-teal-500',
            progressTrack: 'bg-teal-200/80',
            btnClass: 'btn-3d-teal',
          };
        default:
          return {
            border: 'border-2 border-[#60a5fa] hover:border-blue-500 shadow-md shadow-blue-900/5 hover:shadow-xl hover:shadow-blue-300/30',
            cardBg: 'bg-[#edf6ff]',
            badgeBg: 'bg-white/95 text-blue-900 border border-blue-300 font-bold shadow-2xs',
            iconBox: 'bg-white border border-blue-300 text-blue-600 shadow-xs',
            frameMark: 'bg-gradient-to-r from-blue-500 via-sky-400 to-blue-600',
            titleColor: 'text-slate-900 group-hover:text-blue-700',
            subtitleColor: 'text-blue-800 font-semibold',
            descColor: 'text-slate-700',
            tagBg: 'bg-white/90 border-blue-200 text-slate-800 font-medium',
            metaBox: 'bg-white/85 border border-blue-200/90 text-slate-800',
            progressBg: 'bg-blue-500',
            progressTrack: 'bg-blue-200/80',
            btnClass: 'btn-3d-primary',
          };
      }
    }

    // Dark Mode Theme
    switch (color) {
      case 'sky':
        return {
          border: 'border-2 border-sky-500/50 hover:border-sky-400',
          cardBg: 'bg-gradient-to-br from-sky-950/40 via-[#0d233e] to-[#0a1628]',
          badgeBg: 'bg-sky-500/15 text-sky-300 border-sky-400/30',
          iconBox: 'bg-[#09152a] border-slate-700/80 text-sky-400',
          frameMark: 'bg-sky-500',
          titleColor: 'text-white group-hover:text-sky-300',
          subtitleColor: 'text-slate-300 font-medium',
          descColor: 'text-slate-400',
          tagBg: 'bg-[#091426] border-slate-800 text-slate-300',
          metaBox: 'bg-[#071120]/70 border-slate-800/60 text-slate-200',
          progressBg: 'bg-sky-500',
          progressTrack: 'bg-[#071120]',
          btnClass: 'btn-3d-primary',
        };
      case 'purple':
        return {
          border: 'border-2 border-purple-500/50 hover:border-purple-400',
          cardBg: 'bg-gradient-to-br from-purple-950/40 via-[#180f33] to-[#0a1628]',
          badgeBg: 'bg-purple-500/15 text-purple-300 border-purple-400/30',
          iconBox: 'bg-[#09152a] border-slate-700/80 text-purple-400',
          frameMark: 'bg-purple-500',
          titleColor: 'text-white group-hover:text-purple-300',
          subtitleColor: 'text-slate-300 font-medium',
          descColor: 'text-slate-400',
          tagBg: 'bg-[#091426] border-slate-800 text-slate-300',
          metaBox: 'bg-[#071120]/70 border-slate-800/60 text-slate-200',
          progressBg: 'bg-purple-500',
          progressTrack: 'bg-[#071120]',
          btnClass: 'btn-3d-purple',
        };
      case 'rose':
        return {
          border: 'border-2 border-rose-500/50 hover:border-rose-400',
          cardBg: 'bg-gradient-to-br from-rose-950/40 via-[#260c18] to-[#0a1628]',
          badgeBg: 'bg-rose-500/15 text-rose-300 border-rose-400/30',
          iconBox: 'bg-[#09152a] border-slate-700/80 text-rose-400',
          frameMark: 'bg-rose-500',
          titleColor: 'text-white group-hover:text-rose-300',
          subtitleColor: 'text-slate-300 font-medium',
          descColor: 'text-slate-400',
          tagBg: 'bg-[#091426] border-slate-800 text-slate-300',
          metaBox: 'bg-[#071120]/70 border-slate-800/60 text-slate-200',
          progressBg: 'bg-rose-500',
          progressTrack: 'bg-[#071120]',
          btnClass: 'btn-3d-danger',
        };
      case 'emerald':
        return {
          border: 'border-2 border-emerald-500/50 hover:border-emerald-400',
          cardBg: 'bg-gradient-to-br from-emerald-950/40 via-[#0c2419] to-[#0a1628]',
          badgeBg: 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30',
          iconBox: 'bg-[#09152a] border-slate-700/80 text-emerald-400',
          frameMark: 'bg-emerald-500',
          titleColor: 'text-white group-hover:text-emerald-300',
          subtitleColor: 'text-slate-300 font-medium',
          descColor: 'text-slate-400',
          tagBg: 'bg-[#091426] border-slate-800 text-slate-300',
          metaBox: 'bg-[#071120]/70 border-slate-800/60 text-slate-200',
          progressBg: 'bg-emerald-500',
          progressTrack: 'bg-[#071120]',
          btnClass: 'btn-3d-emerald',
        };
      case 'amber':
        return {
          border: 'border-2 border-amber-500/50 hover:border-amber-400',
          cardBg: 'bg-gradient-to-br from-amber-950/40 via-[#261c0c] to-[#0a1628]',
          badgeBg: 'bg-amber-500/15 text-amber-300 border-amber-400/30',
          iconBox: 'bg-[#09152a] border-slate-700/80 text-amber-400',
          frameMark: 'bg-amber-500',
          titleColor: 'text-white group-hover:text-amber-300',
          subtitleColor: 'text-slate-300 font-medium',
          descColor: 'text-slate-400',
          tagBg: 'bg-[#091426] border-slate-800 text-slate-300',
          metaBox: 'bg-[#071120]/70 border-slate-800/60 text-slate-200',
          progressBg: 'bg-amber-500',
          progressTrack: 'bg-[#071120]',
          btnClass: 'btn-3d-amber',
        };
      case 'teal':
        return {
          border: 'border-2 border-teal-500/50 hover:border-teal-400',
          cardBg: 'bg-gradient-to-br from-teal-950/40 via-[#0a2324] to-[#0a1628]',
          badgeBg: 'bg-teal-500/15 text-teal-300 border-teal-400/30',
          iconBox: 'bg-[#09152a] border-slate-700/80 text-teal-400',
          frameMark: 'bg-teal-500',
          titleColor: 'text-white group-hover:text-teal-300',
          subtitleColor: 'text-slate-300 font-medium',
          descColor: 'text-slate-400',
          tagBg: 'bg-[#091426] border-slate-800 text-slate-300',
          metaBox: 'bg-[#071120]/70 border-slate-800/60 text-slate-200',
          progressBg: 'bg-teal-500',
          progressTrack: 'bg-[#071120]',
          btnClass: 'btn-3d-teal',
        };
      default:
        return {
          border: 'border-2 border-blue-500/50 hover:border-blue-400',
          cardBg: 'bg-gradient-to-br from-blue-950/40 via-[#0d233e] to-[#0a1628]',
          badgeBg: 'bg-blue-500/15 text-blue-300 border-blue-400/30',
          iconBox: 'bg-[#09152a] border-slate-700/80 text-blue-400',
          frameMark: 'bg-blue-500',
          titleColor: 'text-white group-hover:text-blue-300',
          subtitleColor: 'text-slate-300 font-medium',
          descColor: 'text-slate-400',
          tagBg: 'bg-[#091426] border-slate-800 text-slate-300',
          metaBox: 'bg-[#071120]/70 border-slate-800/60 text-slate-200',
          progressBg: 'bg-blue-500',
          progressTrack: 'bg-[#071120]',
          btnClass: 'btn-3d-primary',
        };
    }
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
    { id: 'Governança & TI', label: 'Certificações' },
    { id: 'IA & Engenharia de Dados', label: 'Data & IA' },
    { id: 'Segurança & Redes', label: 'Segurança' },
    { id: 'Mentoria & Carreira', label: 'Mentoria' },
    { id: 'Negócios & Governança', label: 'Negócios' },
    { id: 'Comunicação & Mídia', label: 'YouTube' },
  ];

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Distinct Prominent Control Bar with High Contrast Outline */}
      <div
        className={`flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3.5 p-3.5 sm:p-4 rounded-2xl border-2 transition-all ${
          isLight
            ? 'bg-gradient-to-r from-[#faf5ff] via-[#f3e8ff] to-[#f5f3ff] border-purple-400 shadow-lg shadow-purple-950/10'
            : 'bg-gradient-to-r from-[#1d1238] via-[#26174a] to-[#1d1238] border-purple-500/80 shadow-2xl shadow-black/70'
        }`}
      >
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${isLight ? 'text-purple-700' : 'text-purple-300'}`} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar trilha, módulo, vídeo ou anotação..."
            className={`w-full pl-10 pr-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-purple-500/40 ${
              isLight
                ? 'bg-white border-2 border-purple-300 text-slate-900 placeholder-slate-400 focus:border-purple-600 shadow-2xs'
                : 'bg-[#100824] border-2 border-purple-500/60 text-white placeholder-slate-400 focus:border-purple-400'
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
            <Filter className={`w-3.5 h-3.5 mr-0.5 shrink-0 ${isLight ? 'text-purple-700' : 'text-purple-400'}`} />
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer border-2 ${
                    isSelected
                      ? 'bg-purple-600 text-white font-black shadow-md shadow-purple-600/30 border-purple-400 scale-[1.02]'
                      : isLight
                      ? 'bg-white hover:bg-purple-100/70 text-purple-950 border-purple-300 font-extrabold shadow-2xs'
                      : 'bg-[#140b28] text-purple-200 hover:text-white hover:bg-purple-900/60 border-purple-500/40'
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
            className="btn-3d-primary px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer shadow-md shrink-0 ml-auto"
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
                  {/* Header with Icon, Category Badge (18 Meses removed) */}
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
