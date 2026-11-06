import React, { useState } from 'react';
import {
  KnowledgeTrack,
  Certification,
} from '../types';
import {
  MoreVertical,
  Edit3,
  Trash2,
  FolderTree,
  Award,
  Video,
  ArrowRight
} from 'lucide-react';

interface TracksHubViewProps {
  tracks: KnowledgeTrack[];
  certifications: Certification[];
  onOpenTrack: (track: KnowledgeTrack) => void;
  onOpenCertifications: () => void;
  onOpenCreateTrackModal: () => void;
  onEditTrack: (track: KnowledgeTrack) => void;
  onDeleteTrack: (trackId: string) => void;
  searchTerm?: string;
  selectedCategory?: string;
}

export const TracksHubView: React.FC<TracksHubViewProps> = ({
  tracks,
  certifications,
  onOpenTrack,
  onOpenCertifications,
  onOpenCreateTrackModal,
  onEditTrack,
  onDeleteTrack,
  searchTerm = '',
  selectedCategory = 'all',
}) => {
  const [openMenuTrackId, setOpenMenuTrackId] = useState<string | null>(null);

  // Helper to generate technical section ID from track slug or index
  const getTechSectionId = (index: number) => {
    return `SEC_${String(index + 1).padStart(2, '0')}`;
  };

  const getTechId = (slug?: string, index?: number) => {
    switch (slug) {
      case 'governanca-seguranca-ia':
        return 'ID: IA_GOV';
      case 'certificacoes-ti':
        return 'ID: TI_CERT';
      case 'data-science-ia':
        return 'ID: DATA_DS';
      case 'ethical-hacker':
        return 'ID: ETH_HACK';
      case 'mentoria-racan':
        return 'ID: RAC_MENT';
      case 'racan-business-technology':
        return 'ID: BIZ_TECH';
      case 'canal-youtube':
        return 'ID: YT_MEDIA';
      default:
        return `ID: TRK_${String((index || 0) + 1).padStart(2, '0')}`;
    }
  };

  // Filter tracks by category and search term
  const filteredTracks = tracks.filter((track) => {
    const matchesCategory =
      selectedCategory === 'all' ||
      track.category.toLowerCase().includes(selectedCategory.toLowerCase()) ||
      (selectedCategory === 'Gov_Laws' && (track.slug?.includes('governanca') || track.category.includes('Governança'))) ||
      (selectedCategory === 'Cert_Hub' && (track.slug?.includes('certificacoes') || track.isCertificationHub)) ||
      (selectedCategory === 'IA_Research' && (track.slug?.includes('data-science') || track.category.includes('Data Science'))) ||
      (selectedCategory === 'Security' && (track.slug?.includes('hacker') || track.category.includes('Segurança'))) ||
      (selectedCategory === 'Mentorship' && (track.slug?.includes('mentoria') || track.category.includes('Mentoria'))) ||
      (selectedCategory === 'Tech_Business' && (track.slug?.includes('business') || track.category.includes('Estratégia')));

    const term = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !term ||
      track.title.toLowerCase().includes(term) ||
      track.subtitle.toLowerCase().includes(term) ||
      track.description.toLowerCase().includes(term) ||
      track.tags?.some((t) => t.toLowerCase().includes(term));

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Technical Grid of Tracks - Variation 3 */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredTracks.map((track, idx) => {
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

          const progressPercentage =
            totalItemsCount > 0
              ? Math.round((completedItemsCount / totalItemsCount) * 100)
              : 0;

          const secCode = getTechSectionId(idx);
          const techId = getTechId(track.slug, idx);

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
              className="technical-card p-5 sm:p-6 flex flex-col justify-between cursor-pointer group select-none"
            >
              <div>
                {/* Header: SEC_XX and ID: XX + Options Menu */}
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <span className="label-tech text-[#00F0FF] font-bold">{secCode}</span>
                    <span className="label-tech text-white/50">{techId}</span>
                  </div>

                  {/* Kebab 3-dots Menu */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuTrackId(openMenuTrackId === track.id ? null : track.id);
                      }}
                      className="p-1 text-white/40 hover:text-white hover:bg-white/10 rounded transition cursor-pointer"
                      title="Opções da Trilha"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {openMenuTrackId === track.id && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="absolute right-0 top-7 z-40 w-44 bg-[#141417] border border-[#00F0FF]/40 py-1 shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95"
                      >
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuTrackId(null);
                            onEditTrack(track);
                          }}
                          className="w-full px-3 py-2 text-left text-xs font-mono text-white/80 hover:text-[#00F0FF] hover:bg-white/5 flex items-center gap-2 transition cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-[#00F0FF]" />
                          <span>EDIT_TRACK</span>
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
                          className="w-full px-3 py-2 text-left text-xs font-mono text-rose-400 hover:bg-rose-950/40 flex items-center gap-2 transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>DELETE_TRACK</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Track Title (Syne 800) */}
                <h3 className="font-['Syne',sans-serif] text-xl font-bold tracking-tight text-white mb-1.5 group-hover:text-[#00F0FF] transition-colors leading-snug">
                  {track.title}
                </h3>

                {/* Meta Line (Cyan JetBrains Mono) */}
                <div className="font-mono text-xs text-[#00F0FF] tracking-wide mb-3">
                  {track.subtitle || track.category}
                </div>

                {/* Description (Inter) */}
                <p className="text-xs text-white/60 leading-relaxed mb-4 line-clamp-3">
                  {track.description}
                </p>

                {/* Tags */}
                {track.tags && track.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {track.tags.slice(0, 3).map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        className="px-2 py-0.5 text-[10px] font-mono bg-white/5 text-white/70 border border-white/10 uppercase tracking-wider"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Progress Bar & Open Button */}
              <div className="pt-4 border-t border-white/10 space-y-3.5">
                {/* Stats line */}
                <div className="flex items-center justify-between text-xs font-mono text-white/60">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-[11px]">
                      <FolderTree className="w-3 h-3 text-[#00F0FF]" />
                      {subcategoriesCount} {isCertHub ? 'GATES' : 'MÓDULOS'}
                    </span>
                    <span className="flex items-center gap-1 text-[11px]">
                      <Award className="w-3 h-3 text-[#00F0FF]" />
                      {totalItemsCount} {isCertHub ? 'CERTS' : 'TÓPICOS'}
                    </span>
                  </div>
                  <span className="text-[#00F0FF] font-bold">{progressPercentage}%</span>
                </div>

                {/* Progress Bar */}
                <div className="progress-bar-tech">
                  <div
                    className="progress-fill-tech transition-all duration-500"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>

                {/* Action Button: btn-tech */}
                <button
                  type="button"
                  className="btn-tech w-full flex items-center justify-center gap-2 group-hover:shadow-[0_0_12px_rgba(0,240,255,0.4)]"
                >
                  <span>{isCertHub ? 'OPEN_CERT_HUB' : 'OPEN_DATABASE'}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredTracks.length === 0 && (
        <div className="p-12 text-center bg-[#141417] border border-white/10 text-white/60 space-y-3">
          <div className="font-mono text-sm text-[#00F0FF] font-bold">&gt; NO_RECORDS_FOUND</div>
          <p className="text-xs text-white/50">Nenhuma trilha encontrada para os filtros atuais.</p>
          <button
            onClick={onOpenCreateTrackModal}
            className="btn-tech mt-2"
          >
            + INITIALIZE_NEW_TRACK
          </button>
        </div>
      )}
    </div>
  );
};
