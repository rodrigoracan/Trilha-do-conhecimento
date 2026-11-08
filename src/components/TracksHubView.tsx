import React, { useState } from 'react';
import {
  KnowledgeTrack,
  Certification,
  StudyNote,
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
  notes?: StudyNote[];
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
  notes = [],
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

          // Compute realistic evolution percentage factoring completedPercent, items, workload, and notes
          let progressPercentage = 0;
          if (isCertHub) {
            if (certifications.length > 0) {
              const certsProgressSum = certifications.reduce((acc, c) => {
                const cNotes = notes.filter((n) => {
                  if (n.certificationId && (n.certificationId === c.id || n.certificationId === c.code)) return true;
                  if (n.trackId && (n.trackId === c.id || n.trackId === c.code)) return true;
                  const certCodeLower = (c.code || '').toLowerCase();
                  const certTitleLower = (c.title || '').toLowerCase();
                  if (n.trackTitle) {
                    const tLower = n.trackTitle.toLowerCase();
                    if (tLower === certTitleLower || tLower === certCodeLower || tLower.includes(certCodeLower) || certTitleLower.includes(tLower)) return true;
                  }
                  if (n.subcategoryTitle) {
                    const subLower = n.subcategoryTitle.toLowerCase();
                    if (subLower === certTitleLower || subLower === certCodeLower || subLower.includes(certCodeLower)) return true;
                  }
                  if (n.title) {
                    const titleLower = n.title.toLowerCase();
                    if (titleLower.includes(certCodeLower) || titleLower.includes(certTitleLower)) return true;
                  }
                  return false;
                });
                const nHours = cNotes.reduce((sum, n) => sum + (Number(n.studyHours) || 0), 0);
                const nPct = cNotes.reduce((sum, n) => sum + (Number(n.studyPercent) || 0), 0);
                const effHours = Math.max(c.hoursSpent || 0, nHours);
                const hPct = c.estimatedHours > 0 ? Math.round((effHours / c.estimatedHours) * 100) : 0;
                const tMods = c.modules.length;
                const cMods = c.modules.filter((m) => m.completed).length;
                const mPct = tMods > 0 ? Math.round((cMods / tMods) * 100) : 0;
                const sList = c.simulados || [];
                const sPassed = sList.some((s) => s.passed);
                const sBest = sList.reduce((best, s) => Math.max(best, s.scorePercentage), 0);

                let cProg = 0;
                if (c.status === 'Concluída') cProg = 100;
                else if (tMods > 0) cProg = Math.max(mPct, hPct, nPct);
                else cProg = Math.max(hPct, nPct);

                if (sPassed && cProg < 85) cProg = 85;
                else if (sBest > cProg) cProg = Math.min(100, sBest);

                return acc + Math.min(100, Math.max(0, cProg));
              }, 0);
              progressPercentage = Math.min(100, Math.round(certsProgressSum / certifications.length));
            } else {
              progressPercentage = 0;
            }
          } else if (subcategoriesCount > 0) {
            const sumPercents = (track.subcategories || []).reduce((acc, sub) => {
              const subItems = sub.items?.length || 0;
              const subDone = sub.items?.filter((i) => i.status === 'Concluído').length || 0;
              const itemsPct = subItems > 0 ? Math.round((subDone / subItems) * 100) : 0;

              // Check notes for this module
              const subNotes = notes.filter((n) =>
                (n.trackId === track.id || n.trackTitle === track.title) &&
                (n.subcategoryId === sub.id || n.subcategoryTitle === sub.title)
              );
              const subNotesHours = subNotes.reduce((s, n) => s + (Number(n.studyHours) || 0), 0);
              const subNotesPct = subNotes.reduce((s, n) => s + (Number(n.studyPercent) || 0), 0);
              const effSubHours = Math.max(sub.hoursSpent || 0, subNotesHours);

              const hoursPct = sub.estimatedHours && sub.estimatedHours > 0
                ? Math.round((effSubHours / sub.estimatedHours) * 100)
                : 0;
              const modPercent = Math.min(
                100,
                Math.max(sub.completedPercent || 0, hoursPct, itemsPct, subNotesPct)
              );
              return acc + modPercent;
            }, 0);
            progressPercentage = Math.min(100, Math.round(sumPercents / subcategoriesCount));
          } else if (totalItemsCount > 0) {
            progressPercentage = Math.round((completedItemsCount / totalItemsCount) * 100);
          }

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
              className="technical-card p-5 sm:p-6 flex flex-col justify-between cursor-pointer group select-none border-[1.5px] border-[#00F0FF]/35 hover:border-[#00F0FF] shadow-[0_4px_24px_rgba(0,0,0,0.6)]"
            >
              <div>
                {/* Header: SEC_XX and ID: XX + Options Menu */}
                <div className="flex items-center justify-between mb-4 pb-2.5 border-b-[1.5px] border-[#00F0FF]/25">
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
                        className="px-2 py-0.5 text-[10px] font-mono bg-[#00F0FF]/5 text-white/80 border border-[#00F0FF]/25 uppercase tracking-wider"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Progress Bar & Open Button */}
              <div className="pt-4 border-t-[1.5px] border-[#00F0FF]/25 space-y-3.5">
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
