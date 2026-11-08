import React, { useState } from 'react';
import {
  KnowledgeTrack,
  TrackSubcategory,
  TrackItem,
  TrackResource,
  TrackItemChecklist,
  TrackAttachment,
  StudySession,
  StudyNote,
  CertStatus
} from '../types';
import {
  ArrowLeft,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Timer,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Play,
  Copy,
  Check,
  Sparkles,
  Link2,
  PlusCircle,
  Paperclip,
  Download,
  Eye,
  FileText,
  FileSpreadsheet,
  Film,
  Search,
  Calendar,
  BookOpen,
  BarChart3,
  TrendingUp,
  MoreVertical,
  Clock,
  Circle,
  FolderOpen,
  LayoutGrid,
  List,
  MessageSquare
} from 'lucide-react';
import { VideoPlayerModal } from './VideoPlayerModal';
import { SubcategoryModal } from './SubcategoryModal';
import { TrackItemModal } from './TrackItemModal';
import { TrackResourceModal } from './TrackResourceModal';
import { AttachDocumentModal } from './AttachDocumentModal';
import { DocumentPreviewModal } from './DocumentPreviewModal';
import { TrackScheduleSection } from './TrackScheduleSection';
import { TrackPerformanceDashboard } from './TrackPerformanceDashboard';
import { GoogleGeminiLogo, NotebookLMLogo } from './Logos';

interface TrackDetailViewProps {
  track: KnowledgeTrack;
  onBackToTracks: () => void;
  onUpdateTrack: (updatedTrack: KnowledgeTrack) => void;
  onStartPomodoroForTrack?: (trackTitle: string, itemTitle?: string) => void;
  onOpenGeminiChat?: (context?: string) => void;
  onOpenNotebookGemini?: (trackId?: string) => void;
  theme?: 'light' | 'dark';
  studySessions?: StudySession[];
  onLogStudyHours?: (hours: number, trackTitle: string) => void;
  notes?: StudyNote[];
  onSaveNote?: (note: StudyNote) => void;
  onDeleteNote?: (id: string) => void;
  onOpenNotesForModule?: (trackId: string, subcategoryId?: string) => void;
}

export const TrackDetailView: React.FC<TrackDetailViewProps> = ({
  track,
  onBackToTracks,
  onUpdateTrack,
  onStartPomodoroForTrack,
  onOpenGeminiChat,
  onOpenNotebookGemini,
  theme = 'light',
  studySessions = [],
  onLogStudyHours,
  notes = [],
  onSaveNote,
  onDeleteNote,
  onOpenNotesForModule,
}) => {
  const isLight = theme === 'light';
  const [viewMode, setViewMode] = useState<'modules' | 'schedule' | 'dashboard'>('modules');
  const [modulesLayout, setModulesLayout] = useState<'blocks' | 'list'>('blocks');
  const [searchQuery, setSearchQuery] = useState('');
  const [collapsedSubcategories, setCollapsedSubcategories] = useState<Record<string, boolean>>({});
  const [expandedGridTopics, setExpandedGridTopics] = useState<Record<string, boolean>>({});
  const [expandedGridNotes, setExpandedGridNotes] = useState<Record<string, boolean>>({});
  const [openDropdownSubId, setOpenDropdownSubId] = useState<string | null>(null);

  // Quick Hours & Workload Modal state
  const [quickHoursModalSub, setQuickHoursModalSub] = useState<TrackSubcategory | null>(null);
  const [quickHoursEst, setQuickHoursEst] = useState<number>(40);
  const [quickHoursSpent, setQuickHoursSpent] = useState<number>(0);
  const [quickHoursPercent, setQuickHoursPercent] = useState<number>(0);
  const [quickHoursStatus, setQuickHoursStatus] = useState<CertStatus>('Planejada');

  // Quick Note with Percentage Abatement Modal state
  const [quickNoteModalSub, setQuickNoteModalSub] = useState<TrackSubcategory | null>(null);
  const [quickNoteTitle, setQuickNoteTitle] = useState('');
  const [quickNoteContent, setQuickNoteContent] = useState('');
  const [quickNoteHours, setQuickNoteHours] = useState<number | ''>('');
  const [quickNotePercent, setQuickNotePercent] = useState<number | ''>('');
  const [quickNoteAutoPercent, setQuickNoteAutoPercent] = useState(true);

  // Modals state
  const [isSubcategoryModalOpen, setIsSubcategoryModalOpen] = useState(false);
  const [subcategoryToEdit, setSubcategoryToEdit] = useState<TrackSubcategory | null>(null);

  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<TrackItem | null>(null);
  const [activeSubcategoryIdForItem, setActiveSubcategoryIdForItem] = useState<string>('');

  const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);
  const [activeItemIdForResource, setActiveItemIdForResource] = useState<string>('');
  const [activeItemTitleForResource, setActiveItemTitleForResource] = useState<string>('');

  const [videoModalResource, setVideoModalResource] = useState<TrackResource | null>(null);
  const [videoModalItemTitle, setVideoModalItemTitle] = useState<string>('');

  // Document attachment modal state
  const [isAttachDocModalOpen, setIsAttachDocModalOpen] = useState(false);
  const [activeModuleForDoc, setActiveModuleForDoc] = useState<{ id: string; title: string } | null>(null);

  // Document preview modal state
  const [previewAttachment, setPreviewAttachment] = useState<TrackAttachment | null>(null);
  const [previewModuleTitle, setPreviewModuleTitle] = useState<string>('');

  // Editing note in-place state
  const [editingNoteItemId, setEditingNoteItemId] = useState<string | null>(null);
  const [tempNoteContent, setTempNoteContent] = useState<string>('');

  // Open Quick Hours Modal for a module
  const openQuickHoursModal = (sub: TrackSubcategory) => {
    setQuickHoursModalSub(sub);
    setQuickHoursEst(sub.estimatedHours || 40);
    setQuickHoursSpent(sub.hoursSpent || 0);
    setQuickHoursPercent(sub.completedPercent || 0);
    setQuickHoursStatus(sub.status || 'Planejada');
  };

  // Open Quick Note Modal for a module
  const openQuickNoteModal = (sub: TrackSubcategory) => {
    setQuickNoteModalSub(sub);
    setQuickNoteTitle(`Anotação: ${sub.title}`);
    setQuickNoteContent('');
    setQuickNoteHours(2);
    const est = sub.estimatedHours || 40;
    setQuickNotePercent(Math.min(100, Math.round((2 / est) * 100)));
  };

  // Toggle collapse for subcategory (module)
  const toggleCollapse = (subId: string) => {
    setCollapsedSubcategories((prev) => ({
      ...prev,
      [subId]: !prev[subId],
    }));
  };

  const expandAll = () => setCollapsedSubcategories({});
  const collapseAll = () => {
    const allCollapsed: Record<string, boolean> = {};
    track.subcategories?.forEach((sub) => {
      allCollapsed[sub.id] = true;
    });
    setCollapsedSubcategories(allCollapsed);
  };

  // --- MODULE (SUBCATEGORY) CRUD ---
  const handleSaveSubcategory = (data: Partial<TrackSubcategory>) => {
    let updatedSubcategories = [...(track.subcategories || [])];

    if (subcategoryToEdit) {
      updatedSubcategories = updatedSubcategories.map((sub) =>
        sub.id === subcategoryToEdit.id ? { ...sub, ...data } : sub
      );
    } else {
      const newSub: TrackSubcategory = {
        id: `mod-${Date.now()}`,
        title: data.title || 'Novo Módulo',
        description: data.description || '',
        colorTheme: data.colorTheme || track.colorTheme,
        items: [],
        attachments: [],
        order: updatedSubcategories.length + 1,
      };
      updatedSubcategories.push(newSub);
    }

    onUpdateTrack({
      ...track,
      subcategories: updatedSubcategories,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleDeleteSubcategory = (subId: string, subTitle: string) => {
    // Immediate clean removal with update
    const updatedSubcategories = track.subcategories.filter((s) => s.id !== subId);
    onUpdateTrack({
      ...track,
      subcategories: updatedSubcategories,
      updatedAt: new Date().toISOString(),
    });
  };

  // --- DOCUMENT ATTACHMENTS FOR MODULES ---
  const handleOpenAttachDocModal = (subId: string, subTitle: string) => {
    setActiveModuleForDoc({ id: subId, title: subTitle });
    setIsAttachDocModalOpen(true);
  };

  const handleSaveModuleAttachment = (attachment: TrackAttachment) => {
    if (!activeModuleForDoc) return;

    const updatedSubcategories = track.subcategories.map((sub) => {
      if (sub.id !== activeModuleForDoc.id) return sub;
      const currentAttachments = sub.attachments || [];
      return {
        ...sub,
        attachments: [attachment, ...currentAttachments],
      };
    });

    onUpdateTrack({
      ...track,
      subcategories: updatedSubcategories,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleDeleteModuleAttachment = (subId: string, attachmentId: string) => {
    const updatedSubcategories = track.subcategories.map((sub) => {
      if (sub.id !== subId) return sub;
      return {
        ...sub,
        attachments: (sub.attachments || []).filter((a) => a.id !== attachmentId),
      };
    });

    onUpdateTrack({
      ...track,
      subcategories: updatedSubcategories,
      updatedAt: new Date().toISOString(),
    });
  };

  // --- ITEM CRUD ---
  const handleSaveItem = (itemData: Partial<TrackItem>) => {
    if (!activeSubcategoryIdForItem) return;

    const updatedSubcategories = track.subcategories.map((sub) => {
      if (sub.id !== activeSubcategoryIdForItem) return sub;

      let updatedItems = [...(sub.items || [])];
      if (itemToEdit) {
        updatedItems = updatedItems.map((item) =>
          item.id === itemToEdit.id
            ? { ...item, ...itemData, updatedAt: new Date().toISOString() }
            : item
        );
      } else {
        const newItem: TrackItem = {
          id: `item-${Date.now()}`,
          title: itemData.title || 'Novo Tópico',
          description: itemData.description || '',
          status: itemData.status || 'A Fazer',
          priority: itemData.priority || 'Média',
          notes: itemData.notes || '',
          resources: itemData.resources || [],
          checklist: itemData.checklist || [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        updatedItems.push(newItem);
      }

      return { ...sub, items: updatedItems };
    });

    onUpdateTrack({
      ...track,
      subcategories: updatedSubcategories,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleDeleteItem = (subId: string, itemId: string) => {
    const updatedSubcategories = track.subcategories.map((sub) => {
      if (sub.id !== subId) return sub;
      return {
        ...sub,
        items: sub.items.filter((item) => item.id !== itemId),
      };
    });

    onUpdateTrack({
      ...track,
      subcategories: updatedSubcategories,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleToggleItemStatus = (itemId: string) => {
    const nextStatusMap: Record<TrackItem['status'], TrackItem['status']> = {
      'A Fazer': 'Em Andamento',
      'Em Andamento': 'Concluído',
      'Concluído': 'A Fazer',
    };

    const updatedSubcategories = track.subcategories.map((sub) => {
      const updatedItems = sub.items.map((item) => {
        if (item.id !== itemId) return item;
        return {
          ...item,
          status: nextStatusMap[item.status],
          updatedAt: new Date().toISOString(),
        };
      });
      return { ...sub, items: updatedItems };
    });

    onUpdateTrack({
      ...track,
      subcategories: updatedSubcategories,
      updatedAt: new Date().toISOString(),
    });
  };

  // --- RESOURCE CRUD ---
  const handleSaveResource = (resData: Partial<TrackResource>) => {
    if (!activeItemIdForResource) return;

    const newRes: TrackResource = {
      id: `res-${Date.now()}`,
      title: resData.title || 'Novo Link / Vídeo',
      url: resData.url || '',
      type: resData.type || 'link',
      platform: resData.platform || '',
      duration: resData.duration || '',
      completed: false,
      addedAt: new Date().toISOString(),
    };

    const updatedSubcategories = track.subcategories.map((sub) => {
      const updatedItems = sub.items.map((item) => {
        if (item.id !== activeItemIdForResource) return item;
        return {
          ...item,
          resources: [...(item.resources || []), newRes],
          updatedAt: new Date().toISOString(),
        };
      });
      return { ...sub, items: updatedItems };
    });

    onUpdateTrack({
      ...track,
      subcategories: updatedSubcategories,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleDeleteResource = (itemId: string, resId: string) => {
    const updatedSubcategories = track.subcategories.map((sub) => {
      const updatedItems = sub.items.map((item) => {
        if (item.id !== itemId) return item;
        return {
          ...item,
          resources: item.resources.filter((r) => r.id !== resId),
          updatedAt: new Date().toISOString(),
        };
      });
      return { ...sub, items: updatedItems };
    });

    onUpdateTrack({
      ...track,
      subcategories: updatedSubcategories,
      updatedAt: new Date().toISOString(),
    });
  };

  // --- CHECKLIST ITEMS ---
  const handleToggleChecklist = (itemId: string, checkId: string) => {
    const updatedSubcategories = track.subcategories.map((sub) => {
      const updatedItems = sub.items.map((item) => {
        if (item.id !== itemId) return item;
        const updatedChecklist = (item.checklist || []).map((chk) =>
          chk.id === checkId ? { ...chk, done: !chk.done } : chk
        );
        return { ...item, checklist: updatedChecklist, updatedAt: new Date().toISOString() };
      });
      return { ...sub, items: updatedItems };
    });

    onUpdateTrack({
      ...track,
      subcategories: updatedSubcategories,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleAddChecklistItem = (itemId: string, text: string) => {
    if (!text.trim()) return;
    const newCheck: TrackItemChecklist = {
      id: `chk-${Date.now()}`,
      text: text.trim(),
      done: false,
    };

    const updatedSubcategories = track.subcategories.map((sub) => {
      const updatedItems = sub.items.map((item) => {
        if (item.id !== itemId) return item;
        return {
          ...item,
          checklist: [...(item.checklist || []), newCheck],
          updatedAt: new Date().toISOString(),
        };
      });
      return { ...sub, items: updatedItems };
    });

    onUpdateTrack({
      ...track,
      subcategories: updatedSubcategories,
      updatedAt: new Date().toISOString(),
    });
  };

  // --- IN-PLACE NOTE EDITING ---
  const handleSaveInPlaceNote = (itemId: string) => {
    const updatedSubcategories = track.subcategories.map((sub) => {
      const updatedItems = sub.items.map((item) => {
        if (item.id !== itemId) return item;
        return { ...item, notes: tempNoteContent, updatedAt: new Date().toISOString() };
      });
      return { ...sub, items: updatedItems };
    });

    onUpdateTrack({
      ...track,
      subcategories: updatedSubcategories,
      updatedAt: new Date().toISOString(),
    });
    setEditingNoteItemId(null);
  };

  // Append note from VideoPlayerModal
  const handleSaveNoteFromPlayer = (noteText: string) => {
    if (!videoModalResource || !activeItemIdForResource) return;

    const updatedSubcategories = track.subcategories.map((sub) => {
      const updatedItems = sub.items.map((item) => {
        if (item.id !== activeItemIdForResource) return item;
        const currentNotes = item.notes ? `${item.notes}\n\n` : '';
        const timestamp = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        const appended = `${currentNotes}📝 Nota da Aula (${timestamp}):\n${noteText}`;
        return { ...item, notes: appended, updatedAt: new Date().toISOString() };
      });
      return { ...sub, items: updatedItems };
    });

    onUpdateTrack({
      ...track,
      subcategories: updatedSubcategories,
      updatedAt: new Date().toISOString(),
    });
  };

  // Filter notes linked to this track
  const trackNotes = notes.filter(
    (n) => n.trackId === track.id || (n.trackTitle && n.trackTitle.toLowerCase() === track.title.toLowerCase())
  );

  // --- STATS CALCULATION ---
  let totalItemsCount = 0;
  let completedItemsCount = 0;
  let inProgressCount = 0;
  let resourcesCount = 0;
  let totalAttachmentsCount = 0;
  let totalTrackHoursSpent = 0;
  let totalTrackHoursEstimated = 0;

  track.subcategories?.forEach((sub) => {
    totalAttachmentsCount += sub.attachments?.length || 0;
    totalTrackHoursSpent += sub.hoursSpent || 0;
    totalTrackHoursEstimated += sub.estimatedHours || 40;
    sub.items?.forEach((item) => {
      totalItemsCount += 1;
      if (item.status === 'Concluído') completedItemsCount += 1;
      if (item.status === 'Em Andamento') inProgressCount += 1;
      resourcesCount += item.resources?.length || 0;
    });
  });

  const subsCount = track.subcategories?.length || 0;
  const progressPercentage = subsCount > 0
    ? Math.round(
        track.subcategories.reduce((acc, sub) => {
          if (sub.completedPercent !== undefined && sub.completedPercent !== null) {
            return acc + sub.completedPercent;
          }
          const subTotal = sub.items?.length || 0;
          const subDone = sub.items?.filter((i) => i.status === 'Concluído').length || 0;
          return acc + (subTotal > 0 ? Math.round((subDone / subTotal) * 100) : 0);
        }, 0) / subsCount
      )
    : 0;

  // Format file size helper
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return 'Link Externo';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Quick Hours save handler
  const handleSaveQuickHours = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickHoursModalSub) return;
    const est = Math.max(1, Number(quickHoursEst) || 1);
    const spent = Math.max(0, Number(quickHoursSpent) || 0);
    const pct = Math.min(100, Math.max(0, Number(quickHoursPercent) || 0));
    const nextStatus: CertStatus =
      pct >= 100
        ? 'Concluída'
        : spent > 0 || pct > 0
        ? 'Em Andamento'
        : quickHoursStatus;

    const updatedSubs = (track.subcategories || []).map((s) =>
      s.id === quickHoursModalSub.id
        ? {
            ...s,
            estimatedHours: est,
            hoursSpent: spent,
            completedPercent: pct,
            status: nextStatus,
          }
        : s
    );
    onUpdateTrack({
      ...track,
      subcategories: updatedSubs,
      updatedAt: new Date().toISOString(),
    });
    setQuickHoursModalSub(null);
  };

  // Module status toggle/change
  const handleModuleStatusChange = (sub: TrackSubcategory, newStatus: CertStatus) => {
    let nextPercent = sub.completedPercent || 0;
    if (newStatus === 'Concluída' && nextPercent < 100) nextPercent = 100;
    if (newStatus === 'Planejada' && nextPercent > 0) nextPercent = 0;
    if (newStatus === 'Em Andamento' && nextPercent === 0) nextPercent = 10;

    const updatedSubs = (track.subcategories || []).map((s) =>
      s.id === sub.id ? { ...s, status: newStatus, completedPercent: nextPercent } : s
    );
    onUpdateTrack({
      ...track,
      subcategories: updatedSubs,
      updatedAt: new Date().toISOString(),
    });
  };

  // Quick Note save handler with percentage abatement
  const handleSaveQuickNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickNoteModalSub || !onSaveNote) return;
    const hoursNum = typeof quickNoteHours === 'number' ? quickNoteHours : Number(quickNoteHours) || 0;
    let pctNum = typeof quickNotePercent === 'number' ? quickNotePercent : Number(quickNotePercent) || 0;
    if (pctNum === 0 && hoursNum > 0 && quickNoteModalSub.estimatedHours) {
      pctNum = Math.min(100, Math.round((hoursNum / quickNoteModalSub.estimatedHours) * 100));
    }

    const newNote: StudyNote = {
      id: `note-${Date.now()}`,
      title: quickNoteTitle.trim() || `Anotação de Estudo - ${quickNoteModalSub.title}`,
      content: quickNoteContent.trim(),
      trackId: track.id,
      trackTitle: track.title,
      subcategoryId: quickNoteModalSub.id,
      subcategoryTitle: quickNoteModalSub.title,
      studyHours: hoursNum > 0 ? hoursNum : undefined,
      studyPercent: pctNum > 0 ? pctNum : undefined,
      tags: [track.category, 'Módulo', quickNoteModalSub.title.slice(0, 16)],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    onSaveNote(newNote);

    // Compute updated hours and percentage abatement for the module
    const currentHours = quickNoteModalSub.hoursSpent || 0;
    const newHours = currentHours + hoursNum;
    const est = quickNoteModalSub.estimatedHours || 40;
    const currentPercent =
      quickNoteModalSub.completedPercent !== undefined && quickNoteModalSub.completedPercent !== null
        ? quickNoteModalSub.completedPercent
        : est > 0 ? Math.round((currentHours / est) * 100) : 0;
    const newPercent = Math.min(100, Math.max(0, currentPercent + pctNum));
    const nextStatus: CertStatus =
      newPercent >= 100
        ? 'Concluída'
        : newPercent > 0 || newHours > 0
        ? 'Em Andamento'
        : quickNoteModalSub.status || 'Planejada';

    const updatedSubs = (track.subcategories || []).map((s) =>
      s.id === quickNoteModalSub.id
        ? {
            ...s,
            hoursSpent: newHours,
            completedPercent: newPercent,
            status: nextStatus,
          }
        : s
    );

    onUpdateTrack({
      ...track,
      subcategories: updatedSubs,
      updatedAt: new Date().toISOString(),
    });

    if (hoursNum > 0 && onLogStudyHours) {
      onLogStudyHours(hoursNum, track.title);
    }

    setQuickNoteModalSub(null);
  };

  // Color mapper for frame markings and respective soft pastel background
  const getThemeFrameMarking = (color?: string) => {
    if (isLight) {
      switch (color) {
        case 'sky':
          return 'bg-[#edf6ff] border-2 border-[#38bdf8] shadow-md shadow-sky-900/5';
        case 'purple':
          return 'bg-[#f8f3ff] border-2 border-[#c084fc] shadow-md shadow-purple-900/5';
        case 'rose':
          return 'bg-[#fff1f4] border-2 border-[#fb7185] shadow-md shadow-rose-900/5';
        case 'emerald':
          return 'bg-[#eefdf4] border-2 border-[#34d399] shadow-md shadow-emerald-900/5';
        case 'amber':
          return 'bg-[#fffbeb] border-2 border-[#fbbf24] shadow-md shadow-amber-900/5';
        case 'teal':
          return 'bg-[#effcf9] border-2 border-[#2dd4bf] shadow-md shadow-teal-900/5';
        default:
          return 'bg-[#edf6ff] border-2 border-sky-400 shadow-md shadow-sky-900/5';
      }
    }

    return 'bg-[#141417] border-[1.5px] border-white/10 hover:border-[#00F0FF] transition-all';
  };

  const getTrackBannerStyles = (color?: string) => {
    if (isLight) {
      switch (color) {
        case 'sky':
          return 'bg-[#edf6ff] border-2 border-[#38bdf8] shadow-md shadow-sky-900/5';
        case 'purple':
          return 'bg-[#f8f3ff] border-2 border-[#c084fc] shadow-md shadow-purple-900/5';
        case 'rose':
          return 'bg-[#fff1f4] border-2 border-[#fb7185] shadow-md shadow-rose-900/5';
        case 'emerald':
          return 'bg-[#eefdf4] border-2 border-[#34d399] shadow-md shadow-emerald-900/5';
        case 'amber':
          return 'bg-[#fffbeb] border-2 border-[#fbbf24] shadow-md shadow-amber-900/5';
        case 'teal':
          return 'bg-[#effcf9] border-2 border-[#2dd4bf] shadow-md shadow-teal-900/5';
        default:
          return 'bg-[#edf6ff] border-2 border-sky-400 shadow-md shadow-sky-900/5';
      }
    }
    return 'technical-card bg-[#141417] border-[1.5px] border-[#00F0FF]/35 hover:border-[#00F0FF] shadow-[0_4px_30px_rgba(0,0,0,0.7)]';
  };

  // Card theme helper matching CertificationsView layout
  const getCardThemeStyles = (colorKey?: string) => {
    const key = colorKey || track.colorTheme || 'sky';
    if (isLight) {
      switch (key) {
        case 'emerald':
          return {
            cardBg: 'bg-[#eefdf4] border-2 border-emerald-400 shadow-md shadow-emerald-900/5',
            titleColor: 'text-emerald-950',
            badgeClass: 'bg-white text-emerald-900 border-emerald-300 font-bold',
            progressBg: 'bg-emerald-500',
            iconColor: 'text-emerald-600',
          };
        case 'purple':
          return {
            cardBg: 'bg-[#f8f3ff] border-2 border-purple-400 shadow-md shadow-purple-900/5',
            titleColor: 'text-purple-950',
            badgeClass: 'bg-white text-purple-900 border-purple-300 font-bold',
            progressBg: 'bg-purple-500',
            iconColor: 'text-purple-600',
          };
        case 'amber':
          return {
            cardBg: 'bg-[#fffbeb] border-2 border-amber-400 shadow-md shadow-amber-900/5',
            titleColor: 'text-amber-950',
            badgeClass: 'bg-white text-amber-900 border-amber-300 font-bold',
            progressBg: 'bg-amber-500',
            iconColor: 'text-amber-600',
          };
        case 'rose':
          return {
            cardBg: 'bg-[#fff1f4] border-2 border-rose-400 shadow-md shadow-rose-900/5',
            titleColor: 'text-rose-950',
            badgeClass: 'bg-white text-rose-900 border-rose-300 font-bold',
            progressBg: 'bg-rose-500',
            iconColor: 'text-rose-600',
          };
        case 'teal':
          return {
            cardBg: 'bg-[#effcf9] border-2 border-teal-400 shadow-md shadow-teal-900/5',
            titleColor: 'text-teal-950',
            badgeClass: 'bg-white text-teal-900 border-teal-300 font-bold',
            progressBg: 'bg-teal-500',
            iconColor: 'text-teal-600',
          };
        case 'indigo':
          return {
            cardBg: 'bg-[#eef2ff] border-2 border-indigo-400 shadow-md shadow-indigo-900/5',
            titleColor: 'text-indigo-950',
            badgeClass: 'bg-white text-indigo-900 border-indigo-300 font-bold',
            progressBg: 'bg-indigo-500',
            iconColor: 'text-indigo-600',
          };
        default:
          return {
            cardBg: 'bg-[#edf6ff] border-2 border-sky-400 shadow-md shadow-sky-900/5',
            titleColor: 'text-sky-950',
            badgeClass: 'bg-white text-sky-900 border-sky-300 font-bold',
            progressBg: 'bg-sky-500',
            iconColor: 'text-sky-600',
          };
      }
    }

    // Technical Dark Mode Theme (Variation 3: RACAN Study OS)
    return {
      cardBg: 'technical-card',
      titleColor: 'text-white',
      badgeClass: 'bg-[#0C0C0E] text-[#00F0FF] border-[#00F0FF]/40 font-mono',
      progressBg: 'bg-[#00F0FF]',
      iconColor: 'text-[#00F0FF]',
    };
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Breadcrumb Navigation & Top Action Bar */}
      <div
        className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 border-[1.5px] transition-colors ${
          isLight
            ? 'bg-[#e5f0fc] border-[#8cb7ea] shadow-md shadow-sky-900/5'
            : 'bg-[#141417] border-[#00F0FF]/35 shadow-lg'
        }`}
      >
        <div className="flex items-center gap-2 text-xs sm:text-sm font-mono">
          <button
            onClick={onBackToTracks}
            className={`flex items-center gap-1.5 font-bold transition cursor-pointer ${
              isLight ? 'text-sky-800 hover:text-sky-950' : 'text-[#00F0FF] hover:underline'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>ROOT_TRILHAS</span>
          </button>
          <span className={isLight ? 'text-slate-400 font-bold' : 'text-white/30'}>/</span>
          <span className={`truncate ${isLight ? 'text-slate-600 font-semibold' : 'text-white/60'}`}>
            {track.category.toUpperCase()}
          </span>
          <span className={isLight ? 'text-slate-400 font-bold' : 'text-white/30'}>/</span>
          <span className={`font-bold truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
            {track.title}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onOpenGeminiChat && (
            <button
              onClick={() => onOpenGeminiChat(track.title)}
              className={isLight ? 'px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer bg-white border border-sky-400 text-sky-950 shadow-xs' : 'btn-tech-subtle flex items-center gap-1.5 px-3 py-1.5'}
              title="Fazer perguntas ao Gemini com o contexto desta trilha"
            >
              <GoogleGeminiLogo className="w-3.5 h-3.5 text-[#00F0FF]" />
              <span>Dúvidas com Gemini</span>
            </button>
          )}

          {onOpenNotebookGemini && (
            <button
              onClick={() => onOpenNotebookGemini(track.id || track.slug)}
              className={isLight ? 'px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer bg-white border border-purple-400 text-purple-950 shadow-xs' : 'btn-tech-subtle flex items-center gap-1.5 px-3 py-1.5'}
              title="Abrir Caderno de Livros e Caixa de Roteiros desta trilha"
            >
              <NotebookLMLogo className="w-3.5 h-3.5" />
              <span>Caderno & Scripts</span>
            </button>
          )}

          {onStartPomodoroForTrack && (
            <button
              onClick={() => onStartPomodoroForTrack(track.title)}
              className={isLight ? 'btn-3d-amber px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer' : 'btn-tech-subtle flex items-center gap-1.5 px-3 py-1.5'}
              title="Iniciar bloco Pomodoro focado nesta trilha"
            >
              <Timer className="w-3.5 h-3.5 text-[#00F0FF]" />
              <span>Pomodoro</span>
            </button>
          )}

          <button
            onClick={() => {
              setSubcategoryToEdit(null);
              setIsSubcategoryModalOpen(true);
            }}
            className={isLight ? 'btn-3d-primary px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md' : 'btn-tech flex items-center gap-1.5 px-3.5 py-1.5'}
            title="Criar novo módulo dentro desta trilha"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Novo Módulo</span>
          </button>
        </div>
      </div>

      {/* Main Track Banner - Technical Command Console */}
      <div
        className={`p-5 sm:p-6 shadow-xl space-y-4 overflow-hidden relative border-[1.5px] ${getTrackBannerStyles(
          track.colorTheme
        )}`}
      >
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="label-tech">TRACK_CONSOLE // SEC_01</span>
              <span
                className={`px-2 py-0.5 text-[11px] font-mono font-bold border ${
                  isLight
                    ? 'bg-sky-50 text-sky-800 border-sky-300'
                    : 'bg-[#00F0FF]/10 text-[#00F0FF] border-[#00F0FF]/40'
                }`}
              >
                [ {track.category.toUpperCase()} ]
              </span>

              {/* Clickable Schedule Badge */}
              <button
                onClick={() => setViewMode('schedule')}
                className={`px-2.5 py-1 text-xs font-mono font-bold border transition cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'schedule'
                    ? isLight ? 'bg-purple-600 text-white border-purple-700' : 'bg-[#00F0FF] text-[#0C0C0E] border-[#00F0FF]'
                    : isLight
                    ? 'bg-purple-50 hover:bg-purple-100 text-purple-900 border-purple-300'
                    : 'btn-tech-subtle'
                }`}
                title="Abrir cronograma de dias e horários desta trilha"
              >
                <Calendar className="w-3 h-3 text-[#00F0FF]" />
                <span>
                  CRONOGRAMA: {track.schedule?.daysOfWeek?.slice(0, 3).join(', ') || 'CONFIGURAR'}
                  {track.schedule?.daysOfWeek && track.schedule.daysOfWeek.length > 3 ? '...' : ''}
                  {track.schedule?.weeklyTargetHours ? ` · ${track.schedule.weeklyTargetHours}H/SEM` : ''}
                </span>
              </button>

              {/* Clickable Dashboard 18M Badge */}
              <button
                onClick={() => setViewMode('dashboard')}
                className={`px-2.5 py-1 text-xs font-mono font-bold border transition cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'dashboard'
                    ? isLight ? 'bg-emerald-600 text-white border-emerald-700' : 'bg-[#00F0FF] text-[#0C0C0E] border-[#00F0FF]'
                    : isLight
                    ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border-emerald-300'
                    : 'btn-tech-subtle'
                }`}
                title="Abrir Dashboard de Desempenho e Meta 18 Meses"
              >
                <TrendingUp className="w-3 h-3 text-[#00F0FF]" />
                <span>
                  DASHBOARD: {progressPercentage}% · META 18M
                </span>
              </button>

              {track.tags?.map((t, idx) => (
                <span
                  key={idx}
                  className={`px-2 py-0.5 text-[10px] font-mono border ${
                    isLight
                      ? 'bg-slate-100 text-slate-700 border-slate-200 font-medium'
                      : 'bg-[#0C0C0E] text-white/50 border-white/10'
                  }`}
                >
                  #{t}
                </span>
              ))}
            </div>

            <h2 className={`text-xl sm:text-2xl font-black tracking-tight ${isLight ? 'text-slate-900' : 'text-white font-[\'Syne\',sans-serif]'}`}>
              {track.title}
            </h2>
            <p className={`text-xs sm:text-sm font-mono ${isLight ? 'text-sky-700 font-semibold' : 'text-[#00F0FF]'}`}>
              {track.subtitle}
            </p>
            <p className={`text-xs leading-relaxed pt-0.5 ${isLight ? 'text-slate-600' : 'text-white/60'}`}>
              {track.description}
            </p>
          </div>

          {/* Quick Stats Grid - Technical Dark */}
          <div
            className={`w-full lg:w-auto shrink-0 ${
              isLight
                ? 'grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl border font-mono text-center bg-slate-50 border-slate-200'
                : 'stat-grid rounded-none w-full lg:w-80'
            }`}
          >
            <div className={isLight ? 'px-2 py-1' : 'stat-item'}>
              <span className={isLight ? 'text-[10px] font-sans uppercase font-medium text-slate-500 block' : 'label-tech'}>
                Módulos
              </span>
              <div className={`text-lg font-bold font-mono ${isLight ? 'text-sky-700' : 'stat-value text-white'}`}>
                {subsCount}
              </div>
            </div>
            <div className={isLight ? 'px-2 py-1' : 'stat-item'}>
              <span className={isLight ? 'text-[10px] font-sans uppercase font-medium text-slate-500 block' : 'label-tech'}>
                Carga Horária
              </span>
              <div className={`text-lg font-bold font-mono ${isLight ? 'text-amber-700' : 'stat-value text-[#00F0FF]'}`}>
                {totalTrackHoursSpent}h / {totalTrackHoursEstimated}h
              </div>
            </div>
            <div className={isLight ? 'px-2 py-1' : 'stat-item'}>
              <span className={isLight ? 'text-[10px] font-sans uppercase font-medium text-slate-500 block' : 'label-tech'}>
                Tópicos
              </span>
              <div className={`text-lg font-bold font-mono ${isLight ? 'text-emerald-700' : 'stat-value text-white'}`}>
                {completedItemsCount}/{totalItemsCount}
              </div>
            </div>
            <div className={isLight ? 'px-2 py-1' : 'stat-item'}>
              <span className={isLight ? 'text-[10px] font-sans uppercase font-medium text-slate-500 block' : 'label-tech'}>
                Anotações
              </span>
              <div className={`text-lg font-bold font-mono ${isLight ? 'text-purple-700' : 'stat-value text-white'}`}>
                {trackNotes.length}
              </div>
            </div>
          </div>
        </div>

        {/* Overall Progress Bar */}
        <div className={`space-y-1.5 pt-3 border-t-[1.5px] ${isLight ? 'border-slate-200/90' : 'border-[#00F0FF]/25'}`}>
          <div className="flex items-center justify-between text-xs font-mono">
            <span className={`font-semibold flex items-center gap-1.5 ${isLight ? 'text-slate-700' : 'text-white/70'}`}>
              <CheckCircle2 className={`w-3.5 h-3.5 ${isLight ? 'text-emerald-500' : 'text-[#00F0FF]'}`} />
              PROGRESSO_GERAL_DA_TRILHA
            </span>
            <span className={`font-bold font-mono ${isLight ? 'text-slate-900' : 'text-[#00F0FF]'}`}>
              {progressPercentage}% CONCLUÍDO · {totalTrackHoursSpent}h de {totalTrackHoursEstimated}h ({completedItemsCount}/{totalItemsCount} tópicos)
            </span>
          </div>
          <div className={isLight ? 'w-full h-2.5 rounded-full overflow-hidden shadow-inner bg-slate-200' : 'progress-bar-tech h-2 border border-[#00F0FF]/30 bg-[#0C0C0E]'}>
            <div
              className={isLight ? 'h-full bg-gradient-to-r from-sky-500 via-blue-500 to-emerald-500 rounded-full transition-all duration-500' : 'progress-fill-tech h-full'}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Switcher: Módulos & Conteúdos vs. Cronograma & Dias de Estudo */}
      <div
        className={`p-1.5 border-[1.5px] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 transition-colors ${
          isLight ? 'bg-[#dbe9fa] border-[#76a7e8]' : 'bg-[#141417] border-[#00F0FF]/35 shadow-lg'
        }`}
      >
        <div className="flex items-center gap-1.5 w-full sm:w-auto font-mono">
          <button
            onClick={() => setViewMode('modules')}
            className={`flex-1 sm:flex-initial px-4 py-2 text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer border ${
              viewMode === 'modules'
                ? isLight
                  ? 'bg-white text-sky-950 border-sky-400 shadow-sm'
                  : 'bg-[#00F0FF] text-[#0C0C0E] border-[#00F0FF]'
                : isLight
                ? 'text-slate-700 hover:bg-white/60 border-transparent'
                : 'btn-tech-subtle border-transparent'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>[x] Módulos & Conteúdos</span>
            <span
              className={`px-2 py-0.5 text-[10px] font-mono font-bold ${
                viewMode === 'modules'
                  ? isLight ? 'bg-sky-100 text-sky-900' : 'bg-[#0C0C0E] text-[#00F0FF]'
                  : 'bg-white/10 text-white/70'
              }`}
            >
              {track.subcategories?.length || 0}
            </span>
          </button>

          <button
            onClick={() => setViewMode('schedule')}
            className={`flex-1 sm:flex-initial px-4 py-2 text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer border ${
              viewMode === 'schedule'
                ? isLight
                  ? 'bg-white text-purple-950 border-purple-400 shadow-sm'
                  : 'bg-[#00F0FF] text-[#0C0C0E] border-[#00F0FF]'
                : isLight
                ? 'text-slate-700 hover:bg-white/60 border-transparent'
                : 'btn-tech-subtle border-transparent'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>[ ] Cronograma Semanal</span>
            <span
              className={`px-2 py-0.5 text-[10px] font-mono font-bold ${
                viewMode === 'schedule'
                  ? isLight ? 'bg-purple-100 text-purple-900' : 'bg-[#0C0C0E] text-[#00F0FF]'
                  : 'bg-white/10 text-white/70'
              }`}
            >
              {track.schedule?.daysOfWeek?.length || 0} dias · {track.schedule?.weeklyTargetHours || 3}h/sem
            </span>
          </button>

          <button
            onClick={() => setViewMode('dashboard')}
            className={`flex-1 sm:flex-initial px-4 py-2 text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer border ${
              viewMode === 'dashboard'
                ? isLight
                  ? 'bg-white text-emerald-950 border-emerald-400 shadow-sm'
                  : 'bg-[#00F0FF] text-[#0C0C0E] border-[#00F0FF]'
                : isLight
                ? 'text-slate-700 hover:bg-white/60 border-transparent'
                : 'btn-tech-subtle border-transparent'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>[ ] Dashboard Desempenho</span>
            <span
              className={`px-2 py-0.5 text-[10px] font-mono font-bold ${
                viewMode === 'dashboard'
                  ? isLight ? 'bg-emerald-100 text-emerald-900' : 'bg-[#0C0C0E] text-[#00F0FF]'
                  : 'bg-white/10 text-white/70'
              }`}
            >
              Meta 18M
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2 justify-end">
          {viewMode === 'modules' ? (
            <button
              onClick={() => {
                setSubcategoryToEdit(null);
                setIsSubcategoryModalOpen(true);
              }}
              className={isLight ? 'btn-3d-primary px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm' : 'btn-tech px-3.5 py-1.5 flex items-center gap-1.5'}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Novo Módulo</span>
            </button>
          ) : viewMode === 'dashboard' ? (
            <span className="text-xs font-mono text-white/50 px-2 hidden sm:inline">
              // Recharts calculados para esta trilha
            </span>
          ) : (
            <span className="text-xs font-mono text-white/50 px-2 hidden sm:inline">
              // Defina os dias e horários para estudar esta trilha
            </span>
          )}
        </div>
      </div>

      {viewMode === 'dashboard' ? (
        <TrackPerformanceDashboard
          track={track}
          studySessions={studySessions}
          onUpdateTrack={onUpdateTrack}
          onStartPomodoro={onStartPomodoroForTrack}
          onLogStudyHours={onLogStudyHours}
          onCreateModule={() => {
            setSubcategoryToEdit(null);
            setIsSubcategoryModalOpen(true);
          }}
          theme={theme}
        />
      ) : viewMode === 'schedule' ? (
        <TrackScheduleSection
          track={track}
          onUpdateTrack={onUpdateTrack}
          onStartPomodoro={onStartPomodoroForTrack}
          theme={theme}
        />
      ) : (
        <>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${isLight ? 'text-slate-400' : 'text-[#00F0FF]'}`} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="> RUN SEARCH_MODULES_ (tópico, aula, anotação)..."
            className={`w-full pl-10 pr-4 py-2 text-xs sm:text-sm font-mono transition focus:outline-none ${
              isLight
                ? 'bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:border-sky-500 rounded-lg'
                : 'bg-[#141417] border-[1.5px] border-[#00F0FF]/30 text-white placeholder-white/30 focus:border-[#00F0FF]'
            }`}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs ${isLight ? 'text-slate-400 hover:text-slate-700' : 'text-white/50 hover:text-[#00F0FF]'}`}
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 self-end sm:self-auto text-xs font-mono">
          {/* Layout switcher: Quadros (Blocos) vs. Lista Detalhada */}
          <div className={`flex items-center p-0.5 border-[1.5px] ${
            isLight ? 'bg-slate-100 border-slate-200 rounded-lg' : 'bg-[#141417] border-[#00F0FF]/30'
          }`}>
            <button
              type="button"
              onClick={() => setModulesLayout('blocks')}
              className={`px-2.5 py-1 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                modulesLayout === 'blocks'
                  ? isLight ? 'bg-sky-600 text-white shadow-xs rounded-md' : 'bg-[#00F0FF] text-[#0C0C0E] font-bold'
                  : isLight
                  ? 'text-slate-700 hover:text-slate-900'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Quadros (Blocos)</span>
            </button>
            <button
              type="button"
              onClick={() => setModulesLayout('list')}
              className={`px-2.5 py-1 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                modulesLayout === 'list'
                  ? isLight ? 'bg-sky-600 text-white shadow-xs rounded-md' : 'bg-[#00F0FF] text-[#0C0C0E] font-bold'
                  : isLight
                  ? 'text-slate-700 hover:text-slate-900'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Lista Detalhada</span>
            </button>
          </div>

          {modulesLayout === 'list' && (
            <>
              <button
                onClick={expandAll}
                className={isLight ? 'px-3 py-1.5 rounded-lg border font-medium transition cursor-pointer bg-white hover:bg-slate-100 border-slate-200 text-slate-700' : 'btn-tech-subtle px-3 py-1.5'}
              >
                Expandir Todos
              </button>
              <button
                onClick={collapseAll}
                className={isLight ? 'px-3 py-1.5 rounded-lg border font-medium transition cursor-pointer bg-white hover:bg-slate-100 border-slate-200 text-slate-700' : 'btn-tech-subtle px-3 py-1.5'}
              >
                Recolher Todos
              </button>
            </>
          )}

          <button
            onClick={() => {
              setSubcategoryToEdit(null);
              setIsSubcategoryModalOpen(true);
            }}
            className={isLight ? 'btn-3d-primary px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm' : 'btn-tech px-3 py-1.5 flex items-center gap-1.5'}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Novo Módulo</span>
          </button>
        </div>
      </div>

      {/* RENDER VIEW: QUADROS (BLOCOS) IDENTICAL TO CERTIFICAÇÕES DE TI */}
      {modulesLayout === 'blocks' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {track.subcategories?.map((subcategory, index) => {
            const cardTheme = getCardThemeStyles(subcategory.colorTheme || track.colorTheme);
            const subTotalItems = subcategory.items?.length || 0;
            const subCompletedItems = subcategory.items?.filter((i) => i.status === 'Concluído').length || 0;
            const subHoursSpent = subcategory.hoursSpent || 0;
            const subEstHours = subcategory.estimatedHours || 40;
            const moduleNotes = trackNotes.filter((n) => n.subcategoryId === subcategory.id);
            const notesPercentTotal = moduleNotes.reduce((acc, n) => acc + (n.studyPercent || 0), 0);
            const notesHoursTotal = moduleNotes.reduce((acc, n) => acc + (n.studyHours || 0), 0);
            const effectiveHoursSpent = Math.max(subHoursSpent, notesHoursTotal);
            const hoursBasedPercent = subEstHours > 0 ? Math.round((effectiveHoursSpent / subEstHours) * 100) : 0;
            const itemsBasedPercent = subTotalItems > 0 ? Math.round((subCompletedItems / subTotalItems) * 100) : 0;

            // Dynamically calculate evolution percentage:
            // Combines manual completedPercent, hours ratio, sum of notes abatement %, and completed topics
            const subPercent = Math.min(
              100,
              Math.max(
                subcategory.completedPercent ?? 0,
                hoursBasedPercent,
                notesPercentTotal,
                itemsBasedPercent
              )
            );
            const attachments = subcategory.attachments || [];
            const isTopicsExpanded = expandedGridTopics[subcategory.id] ?? true;
            const isNotesExpanded = expandedGridNotes[subcategory.id] ?? false;

            // Filter items by search query if any
            const filteredItems = subcategory.items?.filter((item) => {
              if (!searchQuery) return true;
              const q = searchQuery.toLowerCase();
              return (
                item.title.toLowerCase().includes(q) ||
                item.description?.toLowerCase().includes(q) ||
                item.notes?.toLowerCase().includes(q)
              );
            }) || [];

            return (
              <div
                key={subcategory.id}
                className={`p-5 flex flex-col justify-between select-none transition-all duration-200 relative ${
                  isLight
                    ? `rounded-2xl ${cardTheme.cardBg} hover:-translate-y-1`
                    : 'technical-card border-[1.5px] border-[#00F0FF]/35 hover:border-[#00F0FF] shadow-[0_4px_24px_rgba(0,0,0,0.6)]'
                }`}
              >
                <div>
                  {/* Header: Module Code Badge, Status Selector & Three-dots Menu */}
                  <div className={`flex items-center justify-between gap-2 text-xs mb-3 font-mono pb-2.5 border-b ${
                    isLight ? 'border-slate-200/90' : 'border-[#00F0FF]/25'
                  }`}>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold font-mono px-2 py-0.5 border ${
                        isLight ? cardTheme.badgeClass : 'bg-[#0C0C0E] text-[#00F0FF] border-[#00F0FF]/40'
                      }`}>
                        MOD {String(index + 1).padStart(2, '0')}
                      </span>
                      <span className={isLight ? 'text-[11px] font-medium text-slate-600' : 'label-tech'}>
                        SEC_MOD_{String(index + 1).padStart(2, '0')}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <select
                        value={subcategory.status || 'Planejada'}
                        onChange={(e) => handleModuleStatusChange(subcategory, e.target.value as CertStatus)}
                        className={`text-[11px] font-mono font-semibold px-2 py-0.5 cursor-pointer focus:outline-none border ${
                          isLight
                            ? 'bg-white border-slate-300 text-slate-800 rounded'
                            : 'bg-[#0C0C0E] border-white/20 text-[#00F0FF] focus:border-[#00F0FF]'
                        }`}
                      >
                        <option value="Planejada">Planejada</option>
                        <option value="Em Andamento">Em Andamento</option>
                        <option value="Concluída">Concluída</option>
                      </select>

                      {/* Three-dots menu for Edit/Delete without textual clutter */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenDropdownSubId(openDropdownSubId === subcategory.id ? null : subcategory.id);
                          }}
                          className={`p-1 transition cursor-pointer ${
                            isLight
                              ? 'rounded-md hover:bg-slate-200/80 text-slate-600'
                              : 'hover:bg-white/10 text-white/50 hover:text-[#00F0FF]'
                          }`}
                          title="Opções do Módulo"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {openDropdownSubId === subcategory.id && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className={`absolute right-0 top-full mt-1 w-48 shadow-2xl border py-1.5 z-30 animate-fadeIn font-mono text-xs ${
                              isLight
                                ? 'bg-white border-slate-200 text-slate-800 rounded-xl'
                                : 'bg-[#141417] border-white/10 text-white'
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() => {
                                setOpenDropdownSubId(null);
                                setSubcategoryToEdit(subcategory);
                                setIsSubcategoryModalOpen(true);
                              }}
                              className={`w-full px-3 py-1.5 text-left font-medium flex items-center gap-2 cursor-pointer transition ${
                                isLight ? 'hover:bg-slate-100' : 'hover:bg-white/10 text-[#00F0FF]'
                              }`}
                            >
                              <Edit2 className="w-3.5 h-3.5 text-sky-500" />
                              <span>Editar Módulo</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setOpenDropdownSubId(null);
                                openQuickHoursModal(subcategory);
                              }}
                              className={`w-full px-3 py-1.5 text-left font-medium flex items-center gap-2 cursor-pointer transition ${
                                isLight ? 'hover:bg-slate-100' : 'hover:bg-white/10 text-[#00F0FF]'
                              }`}
                            >
                              <Clock className="w-3.5 h-3.5 text-amber-500" />
                              <span>Carga Horária & %</span>
                            </button>

                            <div className={`my-1 border-t ${isLight ? 'border-slate-100' : 'border-white/10'}`} />

                            <button
                              type="button"
                              onClick={() => {
                                setOpenDropdownSubId(null);
                                handleDeleteSubcategory(subcategory.id, subcategory.title);
                              }}
                              className={`w-full px-3 py-1.5 text-left font-medium flex items-center gap-2 text-rose-500 cursor-pointer transition ${
                                isLight ? 'hover:bg-rose-50' : 'hover:bg-rose-950/40 text-rose-400'
                              }`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Excluir Módulo</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className={isLight ? `text-base font-bold ${cardTheme.titleColor} tracking-tight leading-snug` : 'text-base font-bold text-white font-[\'Syne\',sans-serif] tracking-tight leading-snug'}>
                    {subcategory.title}
                  </h3>

                  {subcategory.description && (
                    <p className={`text-xs mt-1 leading-relaxed line-clamp-2 ${isLight ? 'text-slate-600' : 'text-white/60'}`}>
                      {subcategory.description}
                    </p>
                  )}

                  {/* Progress Bar & Quick Hours / % Adjustment */}
                  <div className={`mt-4 pt-3 border-t-[1.5px] ${isLight ? 'border-slate-200/90' : 'border-[#00F0FF]/25'}`}>
                    <div className={`flex items-center justify-between text-xs mb-1.5 font-mono ${isLight ? 'text-slate-700' : 'text-white/70'}`}>
                      <span>
                        PROGRESSO: <strong className={isLight ? 'font-mono text-slate-900' : 'font-mono text-[#00F0FF]'}>{subPercent}%</strong>
                      </span>
                      <button
                        type="button"
                        onClick={() => openQuickHoursModal(subcategory)}
                        className={`text-[11px] font-mono font-bold px-2 py-0.5 border transition flex items-center gap-1 cursor-pointer ${
                          isLight
                            ? 'bg-white hover:bg-sky-50 text-sky-900 border-sky-300 shadow-2xs hover:border-sky-500 rounded'
                            : 'bg-[#0C0C0E] hover:border-[#00F0FF] text-[#00F0FF] border-[#00F0FF]/30'
                        }`}
                        title="Clique para ajustar a carga horária total e horas estudadas"
                      >
                        <Clock className="w-3 h-3 text-[#00F0FF] shrink-0" />
                        <span>{subHoursSpent}h / {subEstHours}h</span>
                        <Edit2 className="w-2.5 h-2.5 text-white/40" />
                      </button>
                    </div>
                    <div className={isLight ? 'w-full h-2 rounded-full overflow-hidden border shadow-inner bg-slate-200/90 border-slate-300/60' : 'progress-bar-tech h-2 border border-[#00F0FF]/30 bg-[#0C0C0E]'}>
                      <div
                        className={isLight ? `h-full ${cardTheme.progressBg} rounded-full transition-all duration-300` : 'progress-fill-tech h-full'}
                        style={{ width: `${Math.max(subPercent > 0 ? 2 : 0, subPercent)}%` }}
                      />
                    </div>
                  </div>

                  {/* Modules & Topics (Collapsible) */}
                  <div className={`mt-4 pt-2.5 border-t-[1.5px] ${isLight ? 'border-slate-200/90' : 'border-[#00F0FF]/25'}`}>
                    <div className="flex items-center justify-between text-xs font-semibold py-1">
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedGridTopics((prev) => ({
                            ...prev,
                            [subcategory.id]: !isTopicsExpanded,
                          }))
                        }
                        className={`flex items-center gap-1.5 cursor-pointer transition font-mono ${
                          isLight ? 'text-slate-800 hover:text-sky-800' : 'text-white/80 hover:text-[#00F0FF]'
                        }`}
                      >
                        <BookOpen className={`w-3.5 h-3.5 ${isLight ? cardTheme.iconColor : 'text-[#00F0FF]'}`} />
                        <span>Conteúdos ({subCompletedItems}/{subTotalItems})</span>
                        {isTopicsExpanded ? (
                          <ChevronDown className="w-3.5 h-3.5 text-white/40" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5 text-white/40" />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setActiveSubcategoryIdForItem(subcategory.id);
                          setItemToEdit(null);
                          setIsItemModalOpen(true);
                        }}
                        className={`text-[11px] flex items-center gap-0.5 cursor-pointer font-mono ${
                          isLight ? 'text-sky-600 hover:underline font-medium' : 'text-[#00F0FF] hover:underline font-bold'
                        }`}
                      >
                        <Plus className="w-3 h-3" /> Tópico
                      </button>
                    </div>

                    {isTopicsExpanded && (
                      <div className="mt-2 space-y-1.5 max-h-52 overflow-y-auto pr-1">
                        {filteredItems.map((item) => (
                          <div
                            key={item.id}
                            onClick={() => handleToggleItemStatus(item.id)}
                            className={`p-2 border text-xs font-mono cursor-pointer transition flex items-start gap-2 ${
                              item.status === 'Concluído'
                                ? isLight
                                  ? 'bg-slate-100/70 border-slate-200 text-slate-400 rounded-lg'
                                  : 'bg-[#0C0C0E]/70 border-[#00F0FF]/15 text-white/30 line-through'
                                : isLight
                                ? 'bg-white/90 border-slate-200 text-slate-800 hover:border-sky-300 shadow-2xs rounded-lg'
                                : 'bg-[#0C0C0E] border-[#00F0FF]/25 text-white/90 hover:border-[#00F0FF]'
                            }`}
                          >
                            <div className="mt-0.5 shrink-0">
                              {item.status === 'Concluído' ? (
                                <CheckCircle2 className={`w-3.5 h-3.5 ${isLight ? 'text-emerald-500' : 'text-[#00F0FF]'}`} />
                              ) : (
                                <Circle className={`w-3.5 h-3.5 ${isLight ? 'text-slate-400' : 'text-white/40'}`} />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className={item.status === 'Concluído' ? 'line-through text-white/30' : 'font-medium'}>
                                {item.title}
                              </div>
                              {item.description && (
                                <div className={`text-[10px] mt-0.5 ${isLight ? 'text-slate-500' : 'text-white/40'}`}>
                                  {item.description}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}

                        {filteredItems.length === 0 && (
                          <p className="text-[11px] font-mono text-white/40 italic py-1 text-center">
                            Nenhum tópico cadastrado ainda. Clique em "+ Tópico".
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* External Materials Section */}
                  <div className={`mt-3.5 pt-2.5 border-t-[1.5px] ${isLight ? 'border-slate-200/90' : 'border-[#00F0FF]/25'}`}>
                    <div className="flex items-center justify-between text-xs mb-1 font-mono">
                      <span className={`text-[11px] flex items-center gap-1 ${isLight ? 'text-slate-600 font-medium' : 'text-white/60'}`}>
                        <FolderOpen className={`w-3 h-3 ${isLight ? 'text-purple-500' : 'text-[#00F0FF]'}`} />
                        Arquivos & Links Salvos ({attachments.length})
                      </span>
                      <button
                        type="button"
                        onClick={() => handleOpenAttachDocModal(subcategory.id, subcategory.title)}
                        className={`text-[11px] flex items-center gap-0.5 cursor-pointer font-mono ${
                          isLight ? 'text-purple-600 hover:underline font-medium' : 'text-[#00F0FF] hover:underline font-bold'
                        }`}
                      >
                        <Plus className="w-3 h-3" /> Anexar
                      </button>
                    </div>

                    {attachments.length > 0 && (
                      <div className="space-y-1 mt-1.5 max-h-36 overflow-y-auto pr-1">
                        {attachments.map((att) => (
                          <div
                            key={att.id}
                            className={`flex items-center justify-between p-1.5 border text-xs font-mono ${
                              isLight
                                ? 'bg-white/80 border-slate-200 text-slate-800 rounded'
                                : 'bg-[#0C0C0E] border-[#00F0FF]/20 text-white/90'
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() => {
                                setPreviewAttachment(att);
                                setPreviewModuleTitle(subcategory.title);
                              }}
                              className={`font-medium hover:underline truncate flex items-center gap-1.5 cursor-pointer text-left flex-1 ${
                                isLight ? 'text-purple-600' : 'text-[#00F0FF]'
                              }`}
                              title={att.name}
                            >
                              <FileText className={`w-3 h-3 shrink-0 ${isLight ? 'text-purple-500' : 'text-[#00F0FF]'}`} />
                              <span className="truncate">{att.name}</span>
                              <span className="text-[10px] font-mono text-white/40 shrink-0">
                                ({formatFileSize(att.size)})
                              </span>
                            </button>

                            <div className="flex items-center gap-1 shrink-0 ml-1">
                              {att.dataUrl && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const a = document.createElement('a');
                                    a.href = att.dataUrl!;
                                    a.download = att.name;
                                    document.body.appendChild(a);
                                    a.click();
                                    document.body.removeChild(a);
                                  }}
                                  className="p-0.5 text-white/40 hover:text-[#00F0FF]"
                                  title="Baixar arquivo"
                                >
                                  <Download className="w-3 h-3" />
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleDeleteModuleAttachment(subcategory.id, att.id)}
                                className="text-white/40 hover:text-rose-400 p-0.5 cursor-pointer transition"
                                title="Remover anexo"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Module Notes & Abatement Badges Section */}
                  <div className={`mt-3.5 pt-2.5 border-t-[1.5px] ${isLight ? 'border-slate-200/90' : 'border-[#00F0FF]/25'}`}>
                    <div className="flex items-center justify-between text-xs mb-1 font-mono">
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedGridNotes((prev) => ({
                            ...prev,
                            [subcategory.id]: !isNotesExpanded,
                          }))
                        }
                        className={`text-[11px] flex items-center gap-1 cursor-pointer transition ${
                          isLight ? 'text-slate-700 hover:text-sky-800 font-medium' : 'text-white/80 hover:text-[#00F0FF]'
                        }`}
                      >
                        <FileText className={`w-3 h-3 ${isLight ? 'text-amber-500' : 'text-[#00F0FF]'}`} />
                        <span>Anotações & Abatimentos ({moduleNotes.length})</span>
                        {isNotesExpanded ? (
                          <ChevronDown className="w-3 h-3 text-white/40" />
                        ) : (
                          <ChevronRight className="w-3 h-3 text-white/40" />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => openQuickNoteModal(subcategory)}
                        className={`text-[11px] flex items-center gap-0.5 cursor-pointer font-mono font-bold ${
                          isLight ? 'text-amber-600 hover:underline' : 'text-[#00F0FF] hover:underline'
                        }`}
                        title="Escrever anotação e abater % da carga horária"
                      >
                        <Plus className="w-3 h-3" /> Anotar (+%)
                      </button>
                    </div>

                    {moduleNotes.length > 0 && isNotesExpanded && (
                      <div className="space-y-1.5 mt-1.5 max-h-40 overflow-y-auto pr-1">
                        {moduleNotes.map((nt) => (
                          <div
                            key={nt.id}
                            className={`p-2 border text-xs font-mono space-y-1 ${
                              isLight
                                ? 'bg-white/90 border-slate-200 text-slate-800 shadow-2xs rounded-lg'
                                : 'bg-[#0C0C0E] border-[#00F0FF]/25 text-white'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-bold truncate text-[11px]">{nt.title}</span>
                              <div className="flex items-center gap-1 shrink-0">
                                {nt.studyPercent && (
                                  <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-bold border ${
                                    isLight
                                      ? 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30'
                                      : 'bg-[#00F0FF]/15 text-[#00F0FF] border-[#00F0FF]/40'
                                  }`}>
                                    +{nt.studyPercent}%
                                  </span>
                                )}
                                {nt.studyHours && (
                                  <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-semibold bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/30">
                                    {nt.studyHours}h
                                  </span>
                                )}
                              </div>
                            </div>
                            <p className={`text-[10px] line-clamp-2 leading-relaxed ${isLight ? 'text-slate-600' : 'text-white/60'}`}>
                              {nt.content}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className={`mt-4 pt-3 border-t-[1.5px] flex items-center justify-between gap-1.5 text-xs font-mono ${
                  isLight ? 'border-slate-200/90' : 'border-[#00F0FF]/25'
                }`}>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => openQuickNoteModal(subcategory)}
                      className={isLight ? 'btn-3d-amber px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1 cursor-pointer shadow-xs' : 'btn-tech text-[10px] px-2.5 py-1 flex items-center gap-1'}
                      title="Adicionar anotação com horas e abatimento de percentual"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      Anotar (+%)
                    </button>

                    {onStartPomodoroForTrack && (
                      <button
                        type="button"
                        onClick={() => onStartPomodoroForTrack(track.title, subcategory.title)}
                        className={isLight ? 'btn-3d-primary px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1 cursor-pointer shadow-xs' : 'btn-tech-subtle text-[10px] px-2.5 py-1 flex items-center gap-1'}
                        title="Focar com Pomodoro neste módulo"
                      >
                        <Timer className="w-3 h-3 text-[#00F0FF]" />
                        Pomodoro
                      </button>
                    )}

                    {onOpenNotesForModule && (
                      <button
                        type="button"
                        onClick={() => onOpenNotesForModule(track.id, subcategory.id)}
                        className={isLight ? 'px-2 py-1 rounded text-xs font-semibold flex items-center gap-1 cursor-pointer transition bg-white hover:bg-sky-50 text-slate-800 border border-slate-300 shadow-2xs' : 'btn-tech-subtle text-[10px] px-2 py-1 flex items-center gap-1'}
                        title="Ver todas as anotações no Bloco de Notas"
                      >
                        <MessageSquare className="w-3 h-3 text-[#00F0FF]" />
                        Ver Notas
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveSubcategoryIdForItem(subcategory.id);
                        setItemToEdit(null);
                        setIsItemModalOpen(true);
                      }}
                      className={isLight ? 'p-1.5 rounded-lg border text-xs cursor-pointer transition bg-white hover:bg-slate-100 border-slate-200 text-slate-700' : 'btn-tech-subtle p-1.5'}
                      title="Adicionar Novo Tópico"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Alternative Detailed List View */
        <div className="space-y-5">
          {track.subcategories?.map((subcategory, index) => {
            const isCollapsed = !!collapsedSubcategories[subcategory.id];

          // Filter items by search query if any
          const filteredItems = subcategory.items?.filter((item) => {
            if (!searchQuery) return true;
            const q = searchQuery.toLowerCase();
            return (
              item.title.toLowerCase().includes(q) ||
              item.description?.toLowerCase().includes(q) ||
              item.notes?.toLowerCase().includes(q) ||
              item.resources?.some((r) => r.title.toLowerCase().includes(q) || r.url.toLowerCase().includes(q))
            );
          }) || [];

          const subTotalItems = subcategory.items?.length || 0;
          const subCompletedItems = subcategory.items?.filter((i) => i.status === 'Concluído').length || 0;
          const subProgress = subTotalItems > 0 ? Math.round((subCompletedItems / subTotalItems) * 100) : 0;
          const attachments = subcategory.attachments || [];

          return (
            <div
              key={subcategory.id}
              className={`rounded-2xl overflow-hidden transition-all ${
                isLight
                  ? getThemeFrameMarking(subcategory.colorTheme || track.colorTheme)
                  : 'bg-[#0a1528] border-2 border-slate-800 shadow-md'
              }`}
            >
              {/* Module Accordion Header */}
              <div
                className={`p-4 sm:p-5 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isLight
                    ? 'bg-white/75 border-black/10'
                    : 'bg-gradient-to-r from-[#0d1d36] via-[#102444] to-[#0d1d36] border-slate-800'
                }`}
              >
                <div
                  onClick={() => toggleCollapse(subcategory.id)}
                  className="flex items-center gap-3 cursor-pointer select-none flex-1"
                >
                  <button className="text-slate-400 hover:text-sky-500 transition">
                    {isCollapsed ? (
                      <ChevronRight className="w-5 h-5 text-sky-500" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-sky-500" />
                    )}
                  </button>

                  <div
                    className={`w-8.5 h-8.5 rounded-lg border flex items-center justify-center font-bold text-xs shrink-0 font-mono shadow-sm ${
                      isLight
                        ? 'bg-sky-50 border-sky-300 text-sky-700'
                        : 'bg-sky-500/15 border-sky-400/30 text-sky-400'
                    }`}
                  >
                    {index + 1}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className={`text-sm sm:text-base font-bold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        {subcategory.title}
                      </h3>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold border ${
                          isLight
                            ? 'bg-white border-slate-200 text-sky-800 shadow-2xs'
                            : 'bg-[#071120] border-slate-700 text-sky-300'
                        }`}
                      >
                        {subCompletedItems}/{subTotalItems} concluídos ({subProgress}%)
                      </span>

                      {/* Document Attachment Badge */}
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold border ${
                          attachments.length > 0
                            ? isLight
                              ? 'bg-purple-50 border-purple-200 text-purple-700'
                              : 'bg-purple-500/20 border-purple-400/30 text-purple-300'
                            : isLight
                            ? 'bg-slate-100 border-slate-200 text-slate-500'
                            : 'bg-slate-800/60 border-slate-700/50 text-slate-400'
                        }`}
                      >
                        <Paperclip className="w-3 h-3" />
                        <span>{attachments.length} anexo(s)</span>
                      </span>
                    </div>

                    {subcategory.description && (
                      <p className={`text-xs mt-0.5 line-clamp-1 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                        {subcategory.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Module Controls & Fast Actions */}
                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                  {/* Attach Document Button right on the module */}
                  <button
                    onClick={() => handleOpenAttachDocModal(subcategory.id, subcategory.title)}
                    className="btn-3d-purple px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm"
                    title="Anexar documentos e arquivos a este módulo"
                  >
                    <Paperclip className="w-3.5 h-3.5" />
                    <span>Anexar Documento</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveSubcategoryIdForItem(subcategory.id);
                      setItemToEdit(null);
                      setIsItemModalOpen(true);
                    }}
                    className="btn-3d-primary px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm"
                    title="Adicionar novo tópico ou aula a este módulo"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Novo Tópico</span>
                  </button>

                  <button
                    onClick={() => {
                      setSubcategoryToEdit(subcategory);
                      setIsSubcategoryModalOpen(true);
                    }}
                    className={`p-1.5 rounded-lg border text-xs cursor-pointer transition ${
                      isLight
                        ? 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700'
                        : 'btn-3d-dark text-slate-300 hover:text-white'
                    }`}
                    title="Editar Módulo"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDeleteSubcategory(subcategory.id, subcategory.title)}
                    className={`p-1.5 rounded-lg border text-xs cursor-pointer transition ${
                      isLight
                        ? 'bg-white hover:bg-rose-50 border-slate-200 text-rose-600 hover:border-rose-300'
                        : 'btn-3d-dark text-slate-400 hover:text-red-400'
                    }`}
                    title="Excluir Módulo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Module Body (When Opened) */}
              {!isCollapsed && (
                <div className="p-4 sm:p-5 space-y-5">
                  {/* SECTION 1: Document Attachments of this Module */}
                  <div
                    className={`p-4 rounded-xl border transition-colors ${
                      isLight ? 'bg-slate-50/80 border-slate-200' : 'bg-[#081224] border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <Paperclip className="w-4 h-4 text-purple-500" />
                        <h4 className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                          Documentos e Arquivos Anexados deste Módulo ({attachments.length})
                        </h4>
                      </div>

                      <button
                        onClick={() => handleOpenAttachDocModal(subcategory.id, subcategory.title)}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-md border flex items-center gap-1.5 transition cursor-pointer ${
                          isLight
                            ? 'bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200'
                            : 'bg-purple-950/60 text-purple-300 hover:bg-purple-900 border-purple-800/60'
                        }`}
                      >
                        <Plus className="w-3 h-3" />
                        <span>Anexar Novo Arquivo</span>
                      </button>
                    </div>

                    {attachments.length === 0 ? (
                      <div
                        onClick={() => handleOpenAttachDocModal(subcategory.id, subcategory.title)}
                        className={`p-4 rounded-lg border-2 border-dashed flex flex-col items-center justify-center text-center cursor-pointer transition ${
                          isLight
                            ? 'border-slate-300 hover:border-purple-400 bg-white hover:bg-purple-50/40 text-slate-500'
                            : 'border-slate-800 hover:border-purple-500 bg-[#071120] hover:bg-purple-950/20 text-slate-400'
                        }`}
                      >
                        <Paperclip className="w-5 h-5 text-purple-400 mb-1" />
                        <div className={`text-xs font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                          Nenhum documento anexado ainda a este módulo.
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Clique aqui para anexar apostilas em PDF, resumos, planilhas ou links do Google Drive.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                        {attachments.map((att) => (
                          <div
                            key={att.id}
                            className={`p-3 rounded-lg border flex flex-col justify-between transition-all shadow-xs ${
                              isLight
                                ? 'bg-white border-slate-200 hover:border-purple-300'
                                : 'bg-[#0b172d] border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            <div className="space-y-1">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2 min-w-0">
                                  <div className="w-7 h-7 rounded-md bg-purple-500/15 text-purple-500 flex items-center justify-center shrink-0">
                                    <FileText className="w-4 h-4" />
                                  </div>
                                  <div className="min-w-0">
                                    <div
                                      className={`text-xs font-bold truncate cursor-pointer hover:underline ${
                                        isLight ? 'text-slate-900' : 'text-white'
                                      }`}
                                      title={att.name}
                                      onClick={() => {
                                        setPreviewAttachment(att);
                                        setPreviewModuleTitle(subcategory.title);
                                      }}
                                    >
                                      {att.name}
                                    </div>
                                    <div className="text-[10px] text-slate-500 font-mono">
                                      {formatFileSize(att.size)} • {new Date(att.uploadedAt).toLocaleDateString('pt-BR')}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {att.notes && (
                                <p className={`text-[10px] line-clamp-1 italic ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                                  "{att.notes}"
                                </p>
                              )}
                            </div>

                            {/* Action Buttons */}
                            <div className={`mt-2.5 pt-2 border-t flex items-center justify-between text-xs ${isLight ? 'border-slate-100' : 'border-slate-800/80'}`}>
                              <button
                                onClick={() => {
                                  setPreviewAttachment(att);
                                  setPreviewModuleTitle(subcategory.title);
                                }}
                                className={`text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition ${
                                  isLight ? 'text-sky-700 hover:text-sky-900' : 'text-sky-400 hover:text-sky-300'
                                }`}
                              >
                                <Eye className="w-3 h-3" />
                                <span>Visualizar</span>
                              </button>

                              <div className="flex items-center gap-1.5">
                                {att.dataUrl && (
                                  <button
                                    onClick={() => {
                                      const a = document.createElement('a');
                                      a.href = att.dataUrl!;
                                      a.download = att.name;
                                      document.body.appendChild(a);
                                      a.click();
                                      document.body.removeChild(a);
                                    }}
                                    className={`p-1 rounded transition text-slate-400 hover:text-sky-500 ${
                                      isLight ? 'hover:bg-slate-100' : 'hover:bg-slate-800'
                                    }`}
                                    title="Baixar arquivo"
                                  >
                                    <Download className="w-3.5 h-3.5" />
                                  </button>
                                )}

                                <button
                                  onClick={() => handleDeleteModuleAttachment(subcategory.id, att.id)}
                                  className={`p-1 rounded transition text-slate-400 hover:text-rose-500 ${
                                    isLight ? 'hover:bg-slate-100' : 'hover:bg-slate-800'
                                  }`}
                                  title="Remover anexo"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* SECTION 2: Topics / Items List */}
                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between">
                      <h4 className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                        Tópicos e Aulas ({filteredItems.length})
                      </h4>
                      <button
                        onClick={() => {
                          setActiveSubcategoryIdForItem(subcategory.id);
                          setItemToEdit(null);
                          setIsItemModalOpen(true);
                        }}
                        className={`text-xs font-semibold px-2 py-0.5 rounded-md border flex items-center gap-1 transition cursor-pointer ${
                          isLight
                            ? 'bg-sky-50 text-sky-700 hover:bg-sky-100 border-sky-200'
                            : 'bg-sky-950/60 text-sky-300 hover:bg-sky-900 border-sky-800/60'
                        }`}
                      >
                        <Plus className="w-3 h-3" />
                        <span>Novo Tópico</span>
                      </button>
                    </div>

                    {filteredItems.length === 0 ? (
                      <div
                        className={`p-6 text-center rounded-xl border space-y-2 ${
                          isLight ? 'bg-slate-50 border-slate-200 text-slate-500' : 'bg-[#071120]/60 border-slate-800 text-slate-400'
                        }`}
                      >
                        <p className="text-xs">Nenhum tópico cadastrado neste módulo ainda.</p>
                        <button
                          onClick={() => {
                            setActiveSubcategoryIdForItem(subcategory.id);
                            setItemToEdit(null);
                            setIsItemModalOpen(true);
                          }}
                          className="btn-3d-primary px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Adicionar Primeiro Tópico</span>
                        </button>
                      </div>
                    ) : (
                      filteredItems.map((item) => {
                        const isEditingNote = editingNoteItemId === item.id;

                        const statusColors: Record<TrackItem['status'], string> = {
                          'A Fazer': isLight
                            ? 'bg-slate-100 text-slate-700 border-slate-300 hover:border-slate-400'
                            : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:border-slate-600',
                          'Em Andamento': isLight
                            ? 'bg-amber-50 text-amber-800 border-amber-300 hover:border-amber-400'
                            : 'bg-amber-500/15 text-amber-300 border-amber-400/40 hover:border-amber-300',
                          'Concluído': isLight
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:border-emerald-400'
                            : 'bg-emerald-500/15 text-emerald-300 border-emerald-400/40 hover:border-emerald-300',
                        };

                        const priorityColors: Record<NonNullable<TrackItem['priority']>, string> = {
                          Alta: isLight
                            ? 'text-rose-700 bg-rose-50 border-rose-200 font-semibold'
                            : 'text-rose-400 bg-rose-500/10 border-rose-500/30',
                          Média: isLight
                            ? 'text-amber-800 bg-amber-50 border-amber-200 font-semibold'
                            : 'text-amber-400 bg-amber-500/10 border-amber-500/30',
                          Baixa: isLight
                            ? 'text-slate-600 bg-slate-100 border-slate-200'
                            : 'text-slate-400 bg-slate-500/10 border-slate-500/30',
                        };

                        return (
                          <div
                            key={item.id}
                            className={`rounded-xl p-4 border transition shadow-xs space-y-3.5 ${
                              isLight
                                ? 'bg-white border-slate-200/90 hover:border-sky-300'
                                : 'bg-[#081224] border-slate-800 hover:border-slate-700/80'
                            }`}
                          >
                            {/* Item Header: Status Toggle, Title, Priority, Actions */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                                <button
                                  onClick={() => handleToggleItemStatus(item.id)}
                                  className={`px-2.5 py-1 rounded-md text-xs font-bold border transition cursor-pointer shrink-0 ${statusColors[item.status]}`}
                                  title="Clique para alternar status: A Fazer -> Em Andamento -> Concluído"
                                >
                                  {item.status}
                                </button>

                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h4
                                      className={`text-sm sm:text-base font-bold ${
                                        item.status === 'Concluído'
                                          ? isLight ? 'line-through text-slate-400' : 'line-through text-slate-500'
                                          : isLight ? 'text-slate-900' : 'text-white'
                                      }`}
                                    >
                                      {item.title}
                                    </h4>
                                    {item.priority && (
                                      <span className={`text-[10px] px-2 py-0.5 rounded border ${priorityColors[item.priority]}`}>
                                        Prioridade {item.priority}
                                      </span>
                                    )}
                                  </div>
                                  {item.description && (
                                    <p className={`text-xs mt-0.5 leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                                      {item.description}
                                    </p>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
                                {onStartPomodoroForTrack && (
                                  <button
                                    onClick={() => onStartPomodoroForTrack(track.title, item.title)}
                                    className={`p-1.5 rounded-lg border text-xs cursor-pointer transition ${
                                      isLight
                                        ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200'
                                        : 'btn-3d-amber'
                                    }`}
                                    title="Focar neste tópico com Pomodoro"
                                  >
                                    <Timer className="w-3.5 h-3.5" />
                                  </button>
                                )}

                                <button
                                  onClick={() => {
                                    setActiveItemIdForResource(item.id);
                                    setActiveItemTitleForResource(item.title);
                                    setIsResourceModalOpen(true);
                                  }}
                                  className={`px-2 py-1 rounded-lg border text-xs font-semibold flex items-center gap-1 cursor-pointer transition ${
                                    isLight
                                      ? 'bg-sky-50 text-sky-700 hover:bg-sky-100 border-sky-200'
                                      : 'btn-3d-primary'
                                  }`}
                                  title="Adicionar link de curso, vídeo ou documento"
                                >
                                  <PlusCircle className="w-3.5 h-3.5" />
                                  <span>Link/Vídeo</span>
                                </button>

                                <button
                                  onClick={() => {
                                    setActiveSubcategoryIdForItem(subcategory.id);
                                    setItemToEdit(item);
                                    setIsItemModalOpen(true);
                                  }}
                                  className={`p-1.5 rounded-lg border text-xs cursor-pointer transition ${
                                    isLight
                                      ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600'
                                      : 'btn-3d-dark text-slate-300 hover:text-white'
                                  }`}
                                  title="Editar Tópico"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  onClick={() => handleDeleteItem(subcategory.id, item.id)}
                                  className={`p-1.5 rounded-lg border text-xs cursor-pointer transition ${
                                    isLight
                                      ? 'bg-slate-50 hover:bg-rose-50 border-slate-200 text-rose-600 hover:border-rose-200'
                                      : 'btn-3d-dark text-slate-400 hover:text-red-400'
                                  }`}
                                  title="Excluir Tópico"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Links de Cursos & Vídeos */}
                            {item.resources && item.resources.length > 0 && (
                              <div
                                className={`p-3 rounded-lg border space-y-2 ${
                                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#071120] border-slate-800/80'
                                }`}
                              >
                                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                                  <Link2 className="w-3.5 h-3.5 text-sky-500" />
                                  <span>Links & Aulas Recomendadas ({item.resources.length})</span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                  {item.resources.map((res) => {
                                    const isYoutube =
                                      res.url.includes('youtube.com') ||
                                      res.url.includes('youtu.be') ||
                                      res.type === 'video';

                                    return (
                                      <div
                                        key={res.id}
                                        className={`p-2.5 rounded-md border flex items-center justify-between gap-2 transition ${
                                          isLight
                                            ? 'bg-white border-slate-200 hover:border-sky-300'
                                            : 'bg-[#0a1528] border-slate-800 hover:border-slate-700'
                                        }`}
                                      >
                                        <div className="flex items-center gap-2 min-w-0">
                                          <div
                                            className={`w-7 h-7 rounded flex items-center justify-center shrink-0 ${
                                              isYoutube
                                                ? 'bg-red-500/15 text-red-500'
                                                : 'bg-sky-500/15 text-sky-500'
                                            }`}
                                          >
                                            {isYoutube ? <Film className="w-4 h-4" /> : <ExternalLink className="w-4 h-4" />}
                                          </div>
                                          <div className="min-w-0">
                                            <div className={`text-xs font-bold truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
                                              {res.title}
                                            </div>
                                            <div className="text-[10px] text-slate-500 truncate">
                                              {res.platform || 'Web'} {res.duration && `• ${res.duration}`}
                                            </div>
                                          </div>
                                        </div>

                                        <div className="flex items-center gap-1 shrink-0">
                                          {isYoutube && (
                                            <button
                                              onClick={() => {
                                                setVideoModalResource(res);
                                                setVideoModalItemTitle(item.title);
                                                setActiveItemIdForResource(item.id);
                                              }}
                                              className="px-2 py-1 rounded bg-red-600 hover:bg-red-500 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer shadow-sm"
                                              title="Assistir com player integrado"
                                            >
                                              <Play className="w-3 h-3 fill-current" />
                                              <span>Assistir</span>
                                            </button>
                                          )}

                                          <a
                                            href={res.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className={`p-1.5 rounded transition ${
                                              isLight ? 'text-slate-500 hover:text-sky-600 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                                            }`}
                                            title="Abrir em nova aba"
                                          >
                                            <ExternalLink className="w-3.5 h-3.5" />
                                          </a>

                                          <button
                                            onClick={() => handleDeleteResource(item.id, res.id)}
                                            className={`p-1.5 rounded transition text-slate-400 hover:text-rose-500 ${
                                              isLight ? 'hover:bg-slate-100' : 'hover:bg-slate-800'
                                            }`}
                                            title="Remover link"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {/* Checklist de Tarefas Práticas */}
                            {item.checklist && item.checklist.length > 0 && (
                              <div
                                className={`p-3 rounded-lg border space-y-2 ${
                                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#071120] border-slate-800/80'
                                }`}
                              >
                                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                  <span>Checklist Prático ({item.checklist.filter((c) => c.done).length}/{item.checklist.length})</span>
                                </div>

                                <div className="space-y-1.5">
                                  {item.checklist.map((chk) => (
                                    <div
                                      key={chk.id}
                                      onClick={() => handleToggleChecklist(item.id, chk.id)}
                                      className={`flex items-center gap-2 p-2 rounded-md border text-xs cursor-pointer transition select-none ${
                                        chk.done
                                          ? isLight
                                            ? 'bg-white border-slate-200 text-slate-400 line-through'
                                            : 'bg-[#0a1528]/50 border-slate-800 text-slate-500 line-through'
                                          : isLight
                                          ? 'bg-white border-slate-200 text-slate-800 hover:border-slate-300'
                                          : 'bg-[#0a1528] border-slate-800 text-slate-200 hover:border-slate-700'
                                      }`}
                                    >
                                      <input
                                        type="checkbox"
                                        checked={chk.done}
                                        onChange={() => {}}
                                        className="rounded text-sky-500 focus:ring-sky-500 cursor-pointer pointer-events-none"
                                      />
                                      <span className="flex-1">{chk.text}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Anotações e Resumo Rápido */}
                            <div
                              className={`p-3 rounded-lg border space-y-2 ${
                                isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#071120] border-slate-800/80'
                              }`}
                            >
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                                  <span>Anotações & Insights de Estudo</span>
                                </span>

                                {!isEditingNote && (
                                  <button
                                    onClick={() => {
                                      setEditingNoteItemId(item.id);
                                      setTempNoteContent(item.notes || '');
                                    }}
                                    className={`text-xs font-semibold hover:underline flex items-center gap-1 ${
                                      isLight ? 'text-sky-700' : 'text-sky-400'
                                    }`}
                                  >
                                    <Edit2 className="w-3 h-3" />
                                    <span>{item.notes ? 'Editar Anotação' : '+ Adicionar Anotação'}</span>
                                  </button>
                                )}
                              </div>

                              {isEditingNote ? (
                                <div className="space-y-2">
                                  <textarea
                                    rows={4}
                                    value={tempNoteContent}
                                    onChange={(e) => setTempNoteContent(e.target.value)}
                                    placeholder="Escreva suas anotações, comandos, fórmulas, pontos-chave..."
                                    className={`w-full p-2.5 rounded-lg text-xs font-mono transition focus:outline-none focus:ring-2 focus:ring-sky-500/30 ${
                                      isLight
                                        ? 'bg-white border border-slate-300 text-slate-900 focus:border-sky-500'
                                        : 'bg-[#0a1528] border border-slate-700 text-white focus:border-sky-500'
                                    }`}
                                  />
                                  <div className="flex items-center justify-end gap-2">
                                    <button
                                      onClick={() => setEditingNoteItemId(null)}
                                      className={`px-2.5 py-1 text-xs rounded ${isLight ? 'text-slate-500 hover:bg-slate-200' : 'text-slate-400 hover:text-white'}`}
                                    >
                                      Cancelar
                                    </button>
                                    <button
                                      onClick={() => handleSaveInPlaceNote(item.id)}
                                      className="btn-3d-primary px-3 py-1 rounded text-xs font-bold"
                                    >
                                      Salvar Anotação
                                    </button>
                                  </div>
                                </div>
                              ) : item.notes ? (
                                <div
                                  className={`p-2.5 rounded-md text-xs leading-relaxed whitespace-pre-wrap ${
                                    isLight ? 'bg-white border border-slate-200 text-slate-800' : 'bg-[#0a1528] border border-slate-800 text-slate-200'
                                  }`}
                                >
                                  {item.notes}
                                </div>
                              ) : (
                                <p className="text-xs text-slate-500 italic">
                                  Nenhuma anotação registrada para este tópico. Clique em "+ Adicionar Anotação" para fixar conceitos.
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {(!track.subcategories || track.subcategories.length === 0) && (
          <div className={`p-10 text-center rounded-2xl border-2 border-dashed space-y-4 ${
            isLight ? 'bg-white/80 border-sky-300 text-slate-800 shadow-sm' : 'bg-[#09152a] border-slate-800 text-slate-300'
          }`}>
            <div className="w-14 h-14 mx-auto rounded-2xl bg-sky-500/10 border border-sky-400 flex items-center justify-center text-sky-600">
              <BookOpen className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                Trilha zerada e pronta para seus conteúdos!
              </h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                Esta trilha está limpa para você cadastrar seus próprios módulos, colar links de cursos, anexar documentos e organizar suas anotações do zero.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={() => {
                  setSubcategoryToEdit(null);
                  setIsSubcategoryModalOpen(true);
                }}
                className="btn-3d-primary px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>+ Criar Primeiro Módulo</span>
              </button>
              <button
                onClick={() => setViewMode('schedule')}
                className={`px-4 py-2 rounded-xl text-xs font-bold border transition cursor-pointer flex items-center gap-2 ${
                  isLight ? 'bg-purple-50 text-purple-900 border-purple-300 hover:bg-purple-100' : 'bg-purple-950/60 text-purple-200 border-purple-700 hover:bg-purple-900'
                }`}
              >
                <Calendar className="w-4 h-4 text-purple-600" />
                <span>Organizar Dias & Horários desta Trilha</span>
              </button>
            </div>
          </div>
        )}
      </div>
      )}
      </>
      )}

      {/* Modals */}
      <SubcategoryModal
        isOpen={isSubcategoryModalOpen}
        onClose={() => setIsSubcategoryModalOpen(false)}
        onSave={handleSaveSubcategory}
        subcategoryToEdit={subcategoryToEdit}
        theme={theme}
      />

      <TrackItemModal
        isOpen={isItemModalOpen}
        onClose={() => setIsItemModalOpen(false)}
        onSave={handleSaveItem}
        itemToEdit={itemToEdit}
      />

      <TrackResourceModal
        isOpen={isResourceModalOpen}
        onClose={() => setIsResourceModalOpen(false)}
        onSave={handleSaveResource}
        itemTitle={activeItemTitleForResource}
      />

      <AttachDocumentModal
        isOpen={isAttachDocModalOpen}
        onClose={() => setIsAttachDocModalOpen(false)}
        moduleTitle={activeModuleForDoc?.title || ''}
        onSaveAttachment={handleSaveModuleAttachment}
        theme={theme}
      />

      <DocumentPreviewModal
        isOpen={!!previewAttachment}
        onClose={() => setPreviewAttachment(null)}
        attachment={previewAttachment}
        moduleTitle={previewModuleTitle}
        theme={theme}
      />

      {videoModalResource && (
        <VideoPlayerModal
          isOpen={!!videoModalResource}
          onClose={() => setVideoModalResource(null)}
          resource={videoModalResource}
          trackTitle={track.title}
          itemTitle={videoModalItemTitle}
          onSaveQuickNote={handleSaveNoteFromPlayer}
        />
      )}

      {/* Quick Workload & Hours Modal */}
      {quickHoursModalSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fadeIn">
          <div
            className={`w-full max-w-md border-[1.5px] p-5 shadow-2xl space-y-4 ${
              isLight
                ? 'rounded-2xl border-slate-200 bg-white text-slate-900'
                : 'border-[#00F0FF]/40 bg-[#141417] text-white font-mono'
            }`}
          >
            <div className={`flex items-center justify-between border-b pb-3 ${isLight ? 'border-slate-200' : 'border-white/10'}`}>
              <div>
                <span className="label-tech">CONFIG_HOURS // WORKLOAD</span>
                <h3 className={`text-base font-bold ${isLight ? 'text-slate-900' : 'text-white font-[\'Syne\',sans-serif]'}`}>
                  Carga Horária & Meta do Módulo
                </h3>
                <p className={`text-xs mt-0.5 font-mono ${isLight ? 'text-slate-500' : 'text-[#00F0FF]'}`}>
                  {quickHoursModalSub.title}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setQuickHoursModalSub(null)}
                className={`text-xs px-2 py-1 cursor-pointer transition ${
                  isLight ? 'text-slate-400 hover:text-slate-700' : 'text-white/50 hover:text-[#00F0FF]'
                }`}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveQuickHours} className="space-y-3.5 font-mono">
              <div>
                <label className={isLight ? 'block text-xs font-semibold text-slate-700 mb-1' : 'label-tech block mb-1 text-white/70'}>
                  Carga Horária Total Prevista (horas)
                </label>
                <input
                  type="number"
                  min="1"
                  step="0.5"
                  value={quickHoursEst}
                  onChange={(e) => setQuickHoursEst(Number(e.target.value))}
                  className={`w-full px-3 py-2 text-xs font-mono border ${
                    isLight
                      ? 'bg-slate-50 border-slate-300 text-slate-900 rounded-lg'
                      : 'bg-[#0C0C0E] border-white/20 text-white focus:border-[#00F0FF] outline-none'
                  }`}
                  required
                />
                <span className="text-[10px] text-white/40 font-mono mt-0.5 block">Ex: 40h para um curso completo.</span>
              </div>

              <div>
                <label className={isLight ? 'block text-xs font-semibold text-slate-700 mb-1' : 'label-tech block mb-1 text-white/70'}>
                  Horas Estudadas até Agora (horas)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={quickHoursSpent}
                  onChange={(e) => {
                    const spent = Number(e.target.value);
                    setQuickHoursSpent(spent);
                    if (quickHoursEst > 0) {
                      setQuickHoursPercent(Math.min(100, Math.round((spent / quickHoursEst) * 100)));
                    }
                  }}
                  className={`w-full px-3 py-2 text-xs font-mono border ${
                    isLight
                      ? 'bg-slate-50 border-slate-300 text-slate-900 rounded-lg'
                      : 'bg-[#0C0C0E] border-white/20 text-white focus:border-[#00F0FF] outline-none'
                  }`}
                />
              </div>

              <div>
                <label className={isLight ? 'block text-xs font-semibold text-slate-700 mb-1' : 'label-tech block mb-1 text-white/70'}>
                  Percentual de Conclusão (%)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={quickHoursPercent}
                    onChange={(e) => setQuickHoursPercent(Number(e.target.value))}
                    className="flex-1 accent-[#00F0FF]"
                  />
                  <span className="w-12 text-right font-mono font-bold text-sm text-[#00F0FF]">{quickHoursPercent}%</span>
                </div>
              </div>

              <div>
                <label className={isLight ? 'block text-xs font-semibold text-slate-700 mb-1' : 'label-tech block mb-1 text-white/70'}>
                  Status do Módulo
                </label>
                <select
                  value={quickHoursStatus}
                  onChange={(e) => setQuickHoursStatus(e.target.value as CertStatus)}
                  className={`w-full px-3 py-2 text-xs font-mono border ${
                    isLight
                      ? 'bg-slate-50 border-slate-300 text-slate-900 rounded-lg'
                      : 'bg-[#0C0C0E] border-white/20 text-[#00F0FF] focus:border-[#00F0FF] outline-none'
                  }`}
                >
                  <option value="Planejada">Planejada</option>
                  <option value="Em Andamento">Em Andamento</option>
                  <option value="Concluída">Concluída</option>
                </select>
              </div>

              <div className={`flex items-center justify-end gap-2 pt-2 border-t ${isLight ? 'border-slate-200' : 'border-white/10'}`}>
                <button
                  type="button"
                  onClick={() => setQuickHoursModalSub(null)}
                  className={isLight ? 'px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 cursor-pointer' : 'btn-tech-subtle px-3 py-1.5 text-xs'}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={isLight ? 'btn-3d-primary px-4 py-1.5 rounded-lg text-xs font-bold cursor-pointer' : 'btn-tech px-4 py-1.5 text-xs'}
                >
                  Salvar Carga Horária
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Note with Percentage Abatement Modal */}
      {quickNoteModalSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fadeIn">
          <div
            className={`w-full max-w-lg border-[1.5px] p-5 shadow-2xl space-y-4 ${
              isLight
                ? 'rounded-2xl border-slate-200 bg-white text-slate-900'
                : 'border-[#00F0FF]/40 bg-[#141417] text-white font-mono'
            }`}
          >
            <div className={`flex items-center justify-between border-b pb-3 ${isLight ? 'border-slate-200' : 'border-white/10'}`}>
              <div>
                <span className="label-tech">NOTE_LOG // HOURS_ABATEMENT</span>
                <h3 className={`text-base font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white font-[\'Syne\',sans-serif]'}`}>
                  <FileText className="w-4 h-4 text-[#00F0FF]" />
                  Anotação & Abatimento de Carga Horária
                </h3>
                <p className={`text-xs mt-0.5 font-mono ${isLight ? 'text-slate-500' : 'text-white/60'}`}>
                  Módulo: <span className="font-semibold text-[#00F0FF]">{quickNoteModalSub.title}</span> · Meta: {quickNoteModalSub.hoursSpent || 0}h/{quickNoteModalSub.estimatedHours || 40}h ({quickNoteModalSub.completedPercent || 0}%)
                </p>
              </div>
              <button
                type="button"
                onClick={() => setQuickNoteModalSub(null)}
                className={`text-xs px-2 py-1 cursor-pointer transition ${
                  isLight ? 'text-slate-400 hover:text-slate-700' : 'text-white/50 hover:text-[#00F0FF]'
                }`}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveQuickNote} className="space-y-3.5 font-mono">
              <div>
                <label className={isLight ? 'block text-xs font-semibold text-slate-700 mb-1' : 'label-tech block mb-1 text-white/70'}>
                  Título da Anotação
                </label>
                <input
                  type="text"
                  value={quickNoteTitle}
                  onChange={(e) => setQuickNoteTitle(e.target.value)}
                  placeholder="Ex: Resumo Aula 03 - Riscos de IA e Governança"
                  className={`w-full px-3 py-2 text-xs font-mono border ${
                    isLight
                      ? 'bg-slate-50 border-slate-300 text-slate-900 rounded-lg'
                      : 'bg-[#0C0C0E] border-white/20 text-white focus:border-[#00F0FF] outline-none'
                  }`}
                  required
                />
              </div>

              <div>
                <label className={isLight ? 'block text-xs font-semibold text-slate-700 mb-1' : 'label-tech block mb-1 text-white/70'}>
                  Conteúdo / Conceitos / Notas de Aula
                </label>
                <textarea
                  rows={4}
                  value={quickNoteContent}
                  onChange={(e) => setQuickNoteContent(e.target.value)}
                  placeholder="Escreva seus aprendizados, insights, referências da aula..."
                  className={`w-full px-3 py-2 text-xs font-mono border ${
                    isLight
                      ? 'bg-slate-50 border-slate-300 text-slate-900 rounded-lg'
                      : 'bg-[#0C0C0E] border-white/20 text-white focus:border-[#00F0FF] outline-none'
                  }`}
                  required
                />
              </div>

              <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 border ${
                isLight ? 'bg-slate-50 border-slate-200 rounded-xl' : 'bg-[#0C0C0E] border-white/10'
              }`}>
                <div>
                  <label className={isLight ? 'block text-xs font-semibold text-slate-700 mb-1' : 'label-tech block mb-1 text-white/70'}>
                    Horas Estudadas nesta Anotação
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={quickNoteHours}
                    onChange={(e) => {
                      const h = e.target.value === '' ? '' : Number(e.target.value);
                      setQuickNoteHours(h);
                      if (quickNoteAutoPercent && typeof h === 'number' && h > 0) {
                        const est = quickNoteModalSub.estimatedHours || 40;
                        setQuickNotePercent(Math.min(100, Math.round((h / est) * 100)));
                      }
                    }}
                    placeholder="Ex: 2 (horas)"
                    className={`w-full px-3 py-1.5 text-xs font-mono border ${
                      isLight
                        ? 'bg-white border-slate-300 text-slate-900 rounded-lg'
                        : 'bg-[#141417] border-white/20 text-white focus:border-[#00F0FF] outline-none'
                    }`}
                  />
                  <span className="text-[10px] text-white/40 block mt-0.5">// Soma nas horas do módulo</span>
                </div>

                <div>
                  <label className={isLight ? 'block text-xs font-semibold text-slate-700 mb-1' : 'label-tech block mb-1 text-white/70'}>
                    % Abatido do Módulo
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={quickNotePercent}
                    onChange={(e) => {
                      setQuickNoteAutoPercent(false);
                      setQuickNotePercent(e.target.value === '' ? '' : Number(e.target.value));
                    }}
                    placeholder="Ex: 15 (%)"
                    className={`w-full px-3 py-1.5 text-xs font-mono border ${
                      isLight
                        ? 'bg-white border-slate-300 text-slate-900 rounded-lg'
                        : 'bg-[#141417] border-white/20 text-[#00F0FF] focus:border-[#00F0FF] outline-none'
                    }`}
                  />
                  <div className="flex items-center gap-1 mt-1.5">
                    {[10, 20, 25, 50, 100].map((pct) => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => {
                          setQuickNoteAutoPercent(false);
                          setQuickNotePercent(pct);
                        }}
                        className={isLight ? 'px-1.5 py-0.5 rounded text-[10px] font-mono bg-sky-500/10 text-sky-600 hover:bg-sky-500/20 cursor-pointer' : 'btn-tech-subtle text-[10px] px-1.5 py-0.5'}
                      >
                        +{pct}%
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Dynamic live calculation preview */}
              <div className={`p-3 border text-xs font-mono ${
                isLight ? 'bg-sky-50 border-sky-300 text-slate-800 rounded-xl' : 'bg-[#00F0FF]/5 border-[#00F0FF]/30 text-white/80'
              }`}>
                <span className="font-bold text-[#00F0FF] block mb-0.5">// IMPACTO_NO_MÓDULO:</span>
                <span>
                  O módulo avançará de <strong className="text-white">{quickNoteModalSub.completedPercent || 0}%</strong> para{' '}
                  <strong className="text-[#00F0FF]">
                    {Math.min(100, (quickNoteModalSub.completedPercent || 0) + (Number(quickNotePercent) || 0))}%
                  </strong>{' '}
                  (+{Number(quickNotePercent) || 0}%) e somará{' '}
                  <strong className="text-white">{Number(quickNoteHours) || 0}h</strong> às {quickNoteModalSub.hoursSpent || 0}h já estudadas.
                </span>
              </div>

              <div className={`flex items-center justify-end gap-2 pt-2 border-t ${isLight ? 'border-slate-200' : 'border-white/10'}`}>
                <button
                  type="button"
                  onClick={() => setQuickNoteModalSub(null)}
                  className={isLight ? 'px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 cursor-pointer' : 'btn-tech-subtle px-3 py-1.5 text-xs'}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={isLight ? 'btn-3d-amber px-4 py-1.5 rounded-lg text-xs font-bold shadow-md cursor-pointer' : 'btn-tech px-4 py-1.5 text-xs'}
                >
                  Salvar Anotação e Abater %
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
