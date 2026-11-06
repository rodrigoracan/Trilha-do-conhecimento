/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Certification,
  CertStatus,
  ScheduleGate,
  StudyNote,
  ActionReminder,
  ActiveRecallCard,
  StudySession,
  ExternalResource,
  KnowledgeTrack,
  PlannedStudyTask,
  NotebookBook,
  TrackResource,
} from './types';
import {
  loadDatabase,
  saveDatabase,
  AppDatabase,
} from './utils/storage';
import { Navbar, ActiveTab } from './components/Navbar';
import { HeaderBanner } from './components/HeaderBanner';
import { ToolsMenuBar } from './components/ToolsMenuBar';
import { DashboardView } from './components/DashboardView';
import { TracksHubView } from './components/TracksHubView';
import { TrackDetailView } from './components/TrackDetailView';
import { TrackEditModal } from './components/TrackEditModal';
import { CertificationsView } from './components/CertificationsView';
import { PomodoroView } from './components/PomodoroView';
import { StudyTechniquesView } from './components/StudyTechniquesView';
import { NotesView } from './components/NotesView';
import { RemindersView } from './components/RemindersView';
import { StudyPlannerCalendarView } from './components/StudyPlannerCalendarView';
import { CertEditModal } from './components/CertEditModal';
import { AddExternalResourceModal } from './components/AddExternalResourceModal';
import { DatabaseModal } from './components/DatabaseModal';
import { SimuladosModal } from './components/SimuladosModal';
import { GlobalPomodoroWidget } from './components/GlobalPomodoroWidget';
import { GoogleDriveModal } from './components/GoogleDriveModal';
import { GoogleClassroomModal } from './components/GoogleClassroomModal';
import { GeminiChatModal } from './components/GeminiChatModal';
import { NotebookGeminiModal } from './components/NotebookGeminiModal';
import { McpLegislationModal } from './components/McpLegislationModal';
import { initialNotebooks } from './data/initialData';
import { auth, googleSignIn, logout } from './lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import {
  LayoutDashboard,
  FolderTree,
  Award,
  Timer,
  FileText,
  Calendar,
  Brain,
  CheckSquare,
  Database,
  Sparkles,
  Scale,
  LogOut,
  Menu,
  X,
  Search,
  User as UserIcon,
  Loader2,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import {
  GoogleDriveLogo,
  GoogleClassroomLogo,
  GoogleGeminiLogo,
  NotebookLMLogo,
  GoogleGLogo
} from './components/Logos';

export default function App() {
  const [database, setDatabase] = useState<AppDatabase>(() => loadDatabase());
  const [activeTab, setActiveTab] = useState<ActiveTab>('tracks');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => database.config.theme || 'light');

  // Track selection state
  const [selectedTrack, setSelectedTrack] = useState<KnowledgeTrack | null>(null);
  const [isCreateTrackModalOpen, setIsCreateTrackModalOpen] = useState(false);
  const [trackToEdit, setTrackToEdit] = useState<KnowledgeTrack | null>(null);

  // Modals state
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [certToEdit, setCertToEdit] = useState<Certification | null>(null);

  const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);
  const [certForResource, setCertForResource] = useState<Certification | null>(null);

  const [isDatabaseModalOpen, setIsDatabaseModalOpen] = useState(false);
  const [isPomodoroWidgetOpen, setIsPomodoroWidgetOpen] = useState(false);
  const [isSimuladosModalOpen, setIsSimuladosModalOpen] = useState(false);
  const [isGoogleDriveModalOpen, setIsGoogleDriveModalOpen] = useState(false);
  const [isGoogleClassroomModalOpen, setIsGoogleClassroomModalOpen] = useState(false);
  const [certForSimulados, setCertForSimulados] = useState<Certification | null>(null);

  const [currentUser, setCurrentUser] = useState<User | null>(auth.currentUser);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [sidebarCategory, setSidebarCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  // Gemini AI, Notebook & MCP Modals states
  const [isGeminiChatModalOpen, setIsGeminiChatModalOpen] = useState(false);
  const [isNotebookModalOpen, setIsNotebookModalOpen] = useState(false);
  const [isMcpModalOpen, setIsMcpModalOpen] = useState(false);
  const [geminiTrackContext, setGeminiTrackContext] = useState<string>('');
  const [selectedNotebookBookId, setSelectedNotebookBookId] = useState<string>('');

  // Focus targets & note navigation
  const [selectedCertIdForFocus, setSelectedCertIdForFocus] = useState<string>('');
  const [selectedTrackIdForNotes, setSelectedTrackIdForNotes] = useState<string>('');
  const [selectedSubcategoryIdForNotes, setSelectedSubcategoryIdForNotes] = useState<string>('');

  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const res = await googleSignIn();
      if (res?.user) {
        setCurrentUser(res.user);
      }
    } catch (err: any) {
      console.error('Falha ao entrar com Google:', err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setCurrentUser(null);
    } catch (err: any) {
      console.error('Falha ao sair da conta:', err);
    }
  };

  // Update Notebooks in database & persistent storage
  const handleUpdateNotebooks = (updatedBooks: NotebookBook[]) => {
    setDatabase((prev) => {
      const next = { ...prev, notebooks: updatedBooks, lastUpdated: new Date().toISOString() };
      saveDatabase(next);
      return next;
    });
  };

  // Save personal Gemini API Key
  const handleSaveUserGeminiApiKey = (key: string) => {
    setDatabase((prev) => {
      const next = { ...prev, userGeminiApiKey: key, lastUpdated: new Date().toISOString() };
      saveDatabase(next);
      return next;
    });
  };

  // Cloud SQL background synchronization helper
  const syncWithCloudSQL = async (
    endpoint: string,
    method: 'POST' | 'DELETE',
    body?: any
  ) => {
    try {
      const user = auth.currentUser;
      if (!user) return;
      const idToken = await user.getIdToken();
      await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: body ? JSON.stringify(body) : undefined,
      });
    } catch {
      // Background operation; offline/local-first fallback intact
    }
  };

  // Sync user profile & data when user signs in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      setCurrentUser(user);
      if (user) {
        try {
          const idToken = await user.getIdToken();
          await fetch('/api/auth/sync-user', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${idToken}`,
            },
          });

          // Check if Cloud SQL already has saved certifications or notes for this user
          const pullRes = await fetch('/api/cloudsql/pull-all', {
            headers: {
              Authorization: `Bearer ${idToken}`,
            },
          });

          if (pullRes.ok) {
            const remoteData = await pullRes.json();
            const remoteCerts = remoteData.certifications || [];
            const remoteNotes = remoteData.notes || [];

            if (remoteCerts.length > 0 || remoteNotes.length > 0) {
              // Remote records exist: merge/enrich local database with remote updates
              setDatabase((prev) => {
                const mergedCerts = [...prev.certifications];
                remoteCerts.forEach((rc: any) => {
                  const idx = mergedCerts.findIndex((c) => c.id === rc.id);
                  if (idx >= 0) {
                    mergedCerts[idx] = { ...mergedCerts[idx], ...rc };
                  } else {
                    mergedCerts.push(rc);
                  }
                });

                const mergedNotes = [...prev.notes];
                remoteNotes.forEach((rn: any) => {
                  const idx = mergedNotes.findIndex((n) => n.id === rn.id);
                  if (idx >= 0) {
                    mergedNotes[idx] = { ...mergedNotes[idx], ...rn };
                  } else {
                    mergedNotes.push(rn);
                  }
                });

                const nextDb: AppDatabase = {
                  ...prev,
                  certifications: mergedCerts,
                  notes: mergedNotes,
                };
                saveDatabase(nextDb);
                return nextDb;
              });
            } else {
              // No remote records yet: seed Cloud SQL with initial local data
              await fetch('/api/cloudsql/sync-all', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${idToken}`,
                },
                body: JSON.stringify({
                  certifications: database.certifications,
                  notes: database.notes,
                  studySessions: database.studySessions,
                }),
              });
            }
          }
        } catch {
          // Gracefully continue with client-side state
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Persist state updates
  const updateDbAndPersist = (updater: (prev: AppDatabase) => AppDatabase) => {
    setDatabase((prev) => {
      const next = updater(prev);
      saveDatabase(next);
      return next;
    });
  };

  // --- KNOWLEDGE TRACK ACTIONS ---
  const handleOpenTrack = (track: KnowledgeTrack) => {
    setSelectedTrack(track);
    setActiveTab('tracks');
  };

  const handleBackToTracks = () => {
    setSelectedTrack(null);
    setActiveTab('tracks');
  };

  const handleOpenCertifications = () => {
    setSelectedTrack(null);
    setActiveTab('certs');
  };

  const handleUpdateTrack = (updatedTrack: KnowledgeTrack) => {
    updateDbAndPersist((prev) => {
      const updated = (prev.knowledgeTracks || []).map((t) =>
        t.id === updatedTrack.id ? updatedTrack : t
      );
      return { ...prev, knowledgeTracks: updated };
    });
    setSelectedTrack(updatedTrack);
  };

  const handleSaveTrack = (trackData: Partial<KnowledgeTrack>) => {
    updateDbAndPersist((prev) => {
      if (trackToEdit) {
        const updated = (prev.knowledgeTracks || []).map((t) =>
          t.id === trackToEdit.id ? { ...t, ...trackData, updatedAt: new Date().toISOString() } : t
        );
        return { ...prev, knowledgeTracks: updated };
      } else {
        const newTrack: KnowledgeTrack = {
          id: `track-${Date.now()}`,
          slug: (trackData.title || 'nova-trilha')
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/\s+/g, '-')
            .replace(/[^\w-]/g, ''),
          title: trackData.title || 'Nova Trilha RACAN',
          subtitle: trackData.subtitle || 'Especialização e Prática',
          description: trackData.description || '',
          category: trackData.category || 'Geral',
          colorTheme: trackData.colorTheme || 'sky',
          icon: 'Layers',
          subcategories: [],
          tags: trackData.tags || [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        return { ...prev, knowledgeTracks: [...(prev.knowledgeTracks || []), newTrack] };
      }
    });
  };

  const handleDeleteTrack = (trackId: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta trilha de conhecimento e todos os seus tópicos?')) {
      updateDbAndPersist((prev) => {
        const updated = (prev.knowledgeTracks || []).filter((t) => t.id !== trackId);
        return { ...prev, knowledgeTracks: updated };
      });
      if (selectedTrack?.id === trackId) {
        setSelectedTrack(null);
      }
    }
  };

  // --- CERTIFICATION ACTIONS ---
  const handleSaveCert = (certData: Partial<Certification>) => {
    updateDbAndPersist((prev) => {
      if (certToEdit) {
        // Edit existing
        const updated = prev.certifications.map((c) =>
          c.id === certToEdit.id ? { ...c, ...certData } : c
        );
        return { ...prev, certifications: updated };
      } else {
        // Create new
        const newCert: Certification = {
          id: `cert-${Date.now()}`,
          code: certData.code || 'NOVA TRILHA',
          title: certData.title || 'Nova Trilha de Estudo',
          issuer: certData.issuer || 'Organização Certificadora',
          category: certData.category || 'Governança',
          colorTheme: certData.colorTheme || 'teal',
          description: certData.description || '',
          status: certData.status || 'Planejada',
          targetGate: certData.targetGate || 'Gate 1',
          targetMonths: certData.targetMonths || 'Meses 1 a 4',
          estimatedHours: certData.estimatedHours || 60,
          hoursSpent: 0,
          officialUrl: certData.officialUrl,
          modules: certData.modules && certData.modules.length > 0
            ? certData.modules
            : [
                {
                  id: `m-${Date.now()}-1`,
                  title: 'Módulo 1: Fundamentos e Escopo',
                  description: '',
                  completed: false,
                },
              ],
          externalResources: [],
        };
        return { ...prev, certifications: [...prev.certifications, newCert] };
      }
    });
    setCertToEdit(null);
  };

  const handleUpdateCert = (updatedCert: Certification) => {
    updateDbAndPersist((prev) => ({
      ...prev,
      certifications: prev.certifications.map((c) =>
        c.id === updatedCert.id ? updatedCert : c
      ),
    }));
    syncWithCloudSQL('/api/certifications', 'POST', updatedCert);
  };

  const handleDeleteCert = (id: string) => {
    updateDbAndPersist((prev) => ({
      ...prev,
      certifications: prev.certifications.filter((c) => c.id !== id),
    }));
    syncWithCloudSQL(`/api/certifications/${id}`, 'DELETE');
  };

  const handleAddExternalResource = (
    resource: ExternalResource
  ) => {
    if (!certForResource) return;
    const newRes: ExternalResource = {
      ...resource,
      id: resource.id || `res-${Date.now()}`,
      addedAt: resource.addedAt || new Date().toISOString().split('T')[0],
    };

    updateDbAndPersist((prev) => {
      const updatedCerts = prev.certifications.map((c) => {
        if (c.id === certForResource.id) {
          const updated = { ...c, externalResources: [...c.externalResources, newRes] };
          syncWithCloudSQL('/api/certifications', 'POST', updated);
          return updated;
        }
        return c;
      });
      return { ...prev, certifications: updatedCerts };
    });
  };

  const handleAddResourceFromDrive = (
    certId: string,
    resource: { title: string; url: string; type: 'doc' | 'link'; description?: string }
  ) => {
    const newRes: ExternalResource = {
      id: `res-drive-${Date.now()}`,
      title: resource.title,
      url: resource.url,
      type: resource.type,
      description: resource.description,
      addedAt: new Date().toISOString().split('T')[0],
    };

    updateDbAndPersist((prev) => {
      const updatedCerts = prev.certifications.map((c) => {
        if (c.id === certId) {
          const updated = { ...c, externalResources: [...c.externalResources, newRes] };
          syncWithCloudSQL('/api/certifications', 'POST', updated);
          return updated;
        }
        return c;
      });
      return { ...prev, certifications: updatedCerts };
    });
  };

  const handleAddResourceFromClassroom = (
    trackId: string,
    subcategoryId: string,
    resource: { title: string; url: string; type: 'video' | 'doc' | 'link' }
  ) => {
    updateDbAndPersist((prev) => {
      const updatedTracks = (prev.knowledgeTracks || []).map((t) => {
        if (t.id !== trackId) return t;
        const updatedSubs = (t.subcategories || []).map((sub) => {
          if (sub.id !== subcategoryId) return sub;
          const newRes: TrackResource = {
            id: `res-classroom-${Date.now()}`,
            title: resource.title,
            url: resource.url,
            type: resource.type,
            platform: 'Google Classroom',
            addedAt: new Date().toISOString(),
            completed: false,
          };
          if (sub.items && sub.items.length > 0) {
            const updatedItems = [...sub.items];
            updatedItems[0] = {
              ...updatedItems[0],
              resources: [...(updatedItems[0].resources || []), newRes],
            };
            return { ...sub, items: updatedItems };
          }
          return sub;
        });
        return { ...t, subcategories: updatedSubs, updatedAt: new Date().toISOString() };
      });
      return { ...prev, knowledgeTracks: updatedTracks };
    });
  };

  // --- POMODORO SESSION COMPLETION ---
  const handleSessionComplete = (session: Omit<StudySession, 'id'>) => {
    const newSession: StudySession = {
      ...session,
      id: `session-${Date.now()}`,
    };

    updateDbAndPersist((prev) => {
      // If focus session with certification, add hours to cert
      const updatedCerts = prev.certifications.map((c) => {
        if (c.id === session.certificationId && session.mode === 'focus') {
          const updated = {
            ...c,
            hoursSpent: Number((c.hoursSpent + session.minutes / 60).toFixed(1)),
          };
          syncWithCloudSQL('/api/certifications', 'POST', updated);
          return updated;
        }
        return c;
      });

      return {
        ...prev,
        certifications: updatedCerts,
        studySessions: [newSession, ...prev.studySessions],
      };
    });
    syncWithCloudSQL('/api/study-sessions', 'POST', newSession);
  };

  // --- MANUAL HOURS LOGGING ---
  const handleLogManualHours = (hours: number, certId?: string) => {
    const session: StudySession = {
      id: `session-manual-${Date.now()}`,
      date: new Date().toISOString(),
      minutes: Math.round(hours * 60),
      certificationId: certId,
      certificationTitle: certId
        ? database.certifications.find((c) => c.id === certId)?.title
        : 'Estudos Avulsos',
      mode: 'focus',
    };

    updateDbAndPersist((prev) => {
      const updatedCerts = prev.certifications.map((c) => {
        if (c.id === certId) {
          return { ...c, hoursSpent: Number((c.hoursSpent + hours).toFixed(1)) };
        }
        return c;
      });

      return {
        ...prev,
        certifications: updatedCerts,
        studySessions: [session, ...prev.studySessions],
      };
    });
  };

  // --- NOTES ACTIONS WITH AUTOMATIC HOURS DEDUCTION & PROGRESS CALCULATION ---
  const handleSaveNote = (note: StudyNote) => {
    updateDbAndPersist((prev) => {
      const existingNote = prev.notes.find((n) => n.id === note.id);
      const prevHours = existingNote?.studyHours || 0;
      const newHours = note.studyHours || 0;
      const hoursDelta = Number((newHours - prevHours).toFixed(1));

      // 1. Update certifications if note is linked to a certification
      let updatedCerts = prev.certifications;
      if (note.certificationId && hoursDelta !== 0) {
        updatedCerts = prev.certifications.map((c) => {
          if (c.id === note.certificationId) {
            const nextSpent = Math.max(0, Number(((c.hoursSpent || 0) + hoursDelta).toFixed(1)));
            const nextStatus: CertStatus =
              c.status === 'Planejada' && nextSpent > 0 ? 'Em Andamento' : c.status;
            const updated = {
              ...c,
              hoursSpent: nextSpent,
              status: nextStatus,
            };
            syncWithCloudSQL('/api/certifications', 'POST', updated);
            return updated;
          }
          return c;
        });
      }

      // 2. Update knowledge tracks & modules if note is linked to a track and module
      let updatedTracks = prev.knowledgeTracks || [];
      if (note.trackId && note.subcategoryId) {
        const prevPercent = existingNote?.studyPercent || 0;
        const newPercent = note.studyPercent || 0;
        let percentDelta = Number((newPercent - prevPercent).toFixed(1));

        updatedTracks = updatedTracks.map((t) => {
          if (t.id !== note.trackId) return t;
          const updatedSubs = (t.subcategories || []).map((sub) => {
            if (sub.id !== note.subcategoryId) return sub;
            if (percentDelta === 0 && hoursDelta !== 0 && sub.estimatedHours) {
              percentDelta = Math.round((hoursDelta / sub.estimatedHours) * 100);
            }
            const nextSpent = Math.max(0, Number(((sub.hoursSpent || 0) + hoursDelta).toFixed(1)));
            const nextPercent = Math.min(
              100,
              Math.max(0, Math.round((sub.completedPercent || 0) + percentDelta))
            );
            const nextStatus: CertStatus =
              nextPercent >= 100
                ? 'Concluída'
                : nextPercent > 0
                ? 'Em Andamento'
                : sub.status || 'Planejada';

            return {
              ...sub,
              hoursSpent: nextSpent,
              completedPercent: nextPercent,
              status: nextStatus,
            };
          });
          const updatedTrackObj = { ...t, subcategories: updatedSubs, updatedAt: new Date().toISOString() };
          if (selectedTrack?.id === t.id) {
            setSelectedTrack(updatedTrackObj);
          }
          return updatedTrackObj;
        });
      }

      // 3. Create or update studySessions for analytics/D3/Dashboard
      let updatedSessions = prev.studySessions;
      const sessionNoteId = `session-note-${note.id}`;
      if (newHours > 0) {
        const certLinked = prev.certifications.find((c) => c.id === note.certificationId);
        const targetTitle =
          certLinked?.title ||
          (note.trackTitle ? `${note.trackTitle}${note.subcategoryTitle ? ` - ${note.subcategoryTitle.split(':')[0]}` : ''}` : 'Anotação de Estudo');

        const noteSession: StudySession = {
          id: sessionNoteId,
          date: note.updatedAt || new Date().toISOString(),
          minutes: Math.round(newHours * 60),
          certificationId: note.certificationId,
          certificationTitle: targetTitle,
          mode: 'focus',
        };
        const hasSession = prev.studySessions.some((s) => s.id === sessionNoteId);
        if (hasSession) {
          updatedSessions = prev.studySessions.map((s) => (s.id === sessionNoteId ? noteSession : s));
        } else {
          updatedSessions = [noteSession, ...prev.studySessions];
        }
        syncWithCloudSQL('/api/study-sessions', 'POST', noteSession);
      } else {
        updatedSessions = prev.studySessions.filter((s) => s.id !== sessionNoteId);
      }

      // 4. Update notes
      const exists = prev.notes.some((n) => n.id === note.id);
      const nextNotes = exists
        ? prev.notes.map((n) => (n.id === note.id ? note : n))
        : [note, ...prev.notes];

      return {
        ...prev,
        notes: nextNotes,
        certifications: updatedCerts,
        knowledgeTracks: updatedTracks,
        studySessions: updatedSessions,
      };
    });
    syncWithCloudSQL('/api/notes', 'POST', note);
  };

  const handleDeleteNote = (id: string) => {
    updateDbAndPersist((prev) => {
      const noteToDelete = prev.notes.find((n) => n.id === id);
      let updatedCerts = prev.certifications;
      if (noteToDelete?.studyHours && noteToDelete.certificationId) {
        const hoursToSubtract = noteToDelete.studyHours;
        updatedCerts = prev.certifications.map((c) => {
          if (c.id === noteToDelete.certificationId) {
            const nextSpent = Math.max(0, Number(((c.hoursSpent || 0) - hoursToSubtract).toFixed(1)));
            const updated = {
              ...c,
              hoursSpent: nextSpent,
            };
            syncWithCloudSQL('/api/certifications', 'POST', updated);
            return updated;
          }
          return c;
        });
      }

      let updatedTracks = prev.knowledgeTracks || [];
      if (noteToDelete?.trackId && noteToDelete.subcategoryId) {
        const hoursSub = noteToDelete.studyHours || 0;
        const percentSub = noteToDelete.studyPercent || 0;
        updatedTracks = updatedTracks.map((t) => {
          if (t.id !== noteToDelete.trackId) return t;
          const updatedSubs = (t.subcategories || []).map((sub) => {
            if (sub.id !== noteToDelete.subcategoryId) return sub;
            const nextSpent = Math.max(0, Number(((sub.hoursSpent || 0) - hoursSub).toFixed(1)));
            const nextPercent = Math.max(0, Math.round((sub.completedPercent || 0) - percentSub));
            return {
              ...sub,
              hoursSpent: nextSpent,
              completedPercent: nextPercent,
            };
          });
          const updatedTrackObj = { ...t, subcategories: updatedSubs, updatedAt: new Date().toISOString() };
          if (selectedTrack?.id === t.id) {
            setSelectedTrack(updatedTrackObj);
          }
          return updatedTrackObj;
        });
      }

      const sessionNoteId = `session-note-${id}`;
      const updatedSessions = prev.studySessions.filter((s) => s.id !== sessionNoteId);

      return {
        ...prev,
        notes: prev.notes.filter((n) => n.id !== id),
        certifications: updatedCerts,
        knowledgeTracks: updatedTracks,
        studySessions: updatedSessions,
      };
    });
    syncWithCloudSQL(`/api/notes/${id}`, 'DELETE');
  };

  // --- REMINDERS ACTIONS ---
  const handleToggleReminder = (id: string) => {
    updateDbAndPersist((prev) => ({
      ...prev,
      reminders: prev.reminders.map((r) =>
        r.id === id ? { ...r, completed: !r.completed } : r
      ),
    }));
  };

  const handleAddReminder = (
    reminder: Omit<ActionReminder, 'id' | 'createdAt'>
  ) => {
    const newRem: ActionReminder = {
      ...reminder,
      id: `rem-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    updateDbAndPersist((prev) => ({
      ...prev,
      reminders: [newRem, ...prev.reminders],
    }));
  };

  const handleDeleteReminder = (id: string) => {
    updateDbAndPersist((prev) => ({
      ...prev,
      reminders: prev.reminders.filter((r) => r.id !== id),
    }));
  };

  // --- ACTIVE RECALL / FLASHCARDS ---
  const handleUpdateFlashcards = (cards: ActiveRecallCard[]) => {
    updateDbAndPersist((prev) => ({
      ...prev,
      flashcards: cards,
    }));
  };

  // --- GATES UPDATE ---
  const handleUpdateGates = (gates: ScheduleGate[]) => {
    updateDbAndPersist((prev) => ({
      ...prev,
      scheduleGates: gates,
    }));
  };

  // --- STUDY PLANNER / CALENDAR TASKS ---
  const handleAddPlannedTask = (
    taskData: Omit<PlannedStudyTask, 'id' | 'createdAt'>
  ) => {
    const newTask: PlannedStudyTask = {
      ...taskData,
      id: `task-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    updateDbAndPersist((prev) => ({
      ...prev,
      plannedTasks: [newTask, ...(prev.plannedTasks || [])],
    }));
  };

  const handleUpdatePlannedTask = (updatedTask: PlannedStudyTask) => {
    updateDbAndPersist((prev) => ({
      ...prev,
      plannedTasks: (prev.plannedTasks || []).map((t) =>
        t.id === updatedTask.id ? updatedTask : t
      ),
    }));
  };

  const handleDeletePlannedTask = (taskId: string) => {
    updateDbAndPersist((prev) => ({
      ...prev,
      plannedTasks: (prev.plannedTasks || []).filter((t) => t.id !== taskId),
    }));
  };

  const handleTogglePlannedTask = (taskId: string) => {
    updateDbAndPersist((prev) => ({
      ...prev,
      plannedTasks: (prev.plannedTasks || []).map((t) =>
        t.id === taskId ? { ...t, completed: !t.completed } : t
      ),
    }));
  };

  // Calculations for banner & stats
  const pendingRemindersCount = database.reminders.filter((r) => !r.completed).length;
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const weeklyHoursLogged = Number(
    (
      database.studySessions
        .filter((s) => new Date(s.date) >= oneWeekAgo && s.mode === 'focus')
        .reduce((acc, curr) => acc + curr.minutes, 0) / 60
    ).toFixed(1)
  );

  const tracksCount = database.knowledgeTracks?.length || 6;
  const modulesCount = (database.knowledgeTracks || []).reduce((acc, t) => {
    return acc + (t.subcategories?.length || 0);
  }, 0);

  const handleToggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    updateDbAndPersist((prev) => ({
      ...prev,
      config: {
        ...prev.config,
        theme: nextTheme,
      },
    }));
  };

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-[#0C0C0E] text-white font-['Inter',sans-serif] selection:bg-[#00F0FF] selection:text-[#0C0C0E]">
      {/* Main Grid Area: Rail (72px) + Dash-Sidebar (290px) + Viewport (flex-1) */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* 1. Mini Nav Rail (Left) */}
        <aside className="w-[72px] shrink-0 bg-[#141417] border-r border-white/10 flex flex-col items-center py-4 gap-3 z-30 select-none">
          {/* Logo "R" */}
          <button
            onClick={() => {
              setSelectedTrack(null);
              setActiveTab('tracks');
            }}
            className="w-10 h-10 bg-[#00F0FF] text-[#0C0C0E] font-['Syne',sans-serif] font-black text-xl flex items-center justify-center cursor-pointer shadow-[0_0_14px_rgba(0,240,255,0.45)] hover:scale-105 transition-all mb-2"
            title="RACAN Central // Trilhas Hub"
          >
            R
          </button>

          {/* Primary Nav Icons */}
          <div className="flex flex-col items-center gap-2 w-full px-3">
            {[
              { id: 'dashboard' as ActiveTab, icon: LayoutDashboard, label: 'Dashboard' },
              { id: 'tracks' as ActiveTab, icon: FolderTree, label: 'Trilhas Hub' },
              { id: 'certs' as ActiveTab, icon: Award, label: 'Certificações TI' },
              { id: 'pomodoro' as ActiveTab, icon: Timer, label: 'Pomodoro Focus' },
              { id: 'notes' as ActiveTab, icon: FileText, label: 'Caderno / Notas' },
              { id: 'planner' as ActiveTab, icon: Calendar, label: 'Planejamento' },
              { id: 'techniques' as ActiveTab, icon: Brain, label: 'Técnicas' },
              { id: 'reminders' as ActiveTab, icon: CheckSquare, label: 'Ações / Checklist' },
            ].map((item) => {
              const active = activeTab === item.id;
              const IconComp = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.id === 'tracks') setSelectedTrack(null);
                    setActiveTab(item.id);
                  }}
                  className={`nav-rail-icon rounded-none ${active ? 'active' : ''}`}
                  title={item.label}
                  aria-label={item.label}
                >
                  <IconComp className="w-4 h-4" />
                </button>
              );
            })}
          </div>

          <div className="w-8 h-[1px] bg-white/10 my-1" />

          {/* Utility Tools Icons */}
          <div className="flex flex-col items-center gap-2 w-full px-3">
            <button
              onClick={() => setIsGoogleDriveModalOpen(true)}
              className="nav-rail-icon rounded-none"
              title="Google Drive"
            >
              <GoogleDriveLogo className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsGoogleClassroomModalOpen(true)}
              className="nav-rail-icon rounded-none"
              title="Google Classroom"
            >
              <GoogleClassroomLogo className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setGeminiTrackContext(selectedTrack ? selectedTrack.title : '');
                setIsGeminiChatModalOpen(true);
              }}
              className="nav-rail-icon rounded-none"
              title="Gemini AI"
            >
              <GoogleGeminiLogo className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setSelectedNotebookBookId('');
                setIsNotebookModalOpen(true);
              }}
              className="nav-rail-icon rounded-none"
              title="NotebookLM"
            >
              <NotebookLMLogo className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsDatabaseModalOpen(true)}
              className="nav-rail-icon rounded-none"
              title="Banco de Dados / Backup"
            >
              <Database className="w-4 h-4 text-[#00F0FF]" />
            </button>
          </div>

          {/* Bottom user avatar / login */}
          <div className="mt-auto flex flex-col items-center gap-2">
            {currentUser ? (
              <div
                className="w-9 h-9 border border-[#00F0FF]/60 bg-[#0C0C0E] flex items-center justify-center cursor-pointer relative group"
                title={`Conectado como ${currentUser.displayName || currentUser.email}`}
              >
                {currentUser.photoURL ? (
                  <img src={currentUser.photoURL} alt="User" className="w-full h-full object-cover" />
                ) : (
                  <span className="font-mono text-xs font-bold text-[#00F0FF]">
                    {(currentUser.displayName || currentUser.email || 'U')[0].toUpperCase()}
                  </span>
                )}
                <button
                  onClick={handleLogout}
                  className="absolute left-12 top-0 hidden group-hover:flex items-center gap-1.5 px-2.5 py-1.5 bg-[#141417] border border-rose-500/50 text-rose-400 font-mono text-[11px] whitespace-nowrap shadow-xl z-50"
                  title="Desconectar"
                >
                  <LogOut className="w-3 h-3" /> SAIR
                </button>
              </div>
            ) : (
              <button
                onClick={handleGoogleLogin}
                disabled={isLoggingIn}
                className="w-9 h-9 border border-white/20 bg-[#141417] hover:border-[#00F0FF] flex items-center justify-center cursor-pointer transition text-white/70 hover:text-white"
                title="Entrar com o Google"
              >
                {isLoggingIn ? <Loader2 className="w-4 h-4 animate-spin text-[#00F0FF]" /> : <GoogleGLogo className="w-4 h-4" />}
              </button>
            )}
          </div>
        </aside>

        {/* 2. Dashboard Menu Sidebar (Center-Left) */}
        <aside
          className={`w-[290px] shrink-0 bg-[#0C0C0E] border-r border-white/10 p-5 flex flex-col gap-6 overflow-y-auto select-none transition-all ${
            isMobileSidebarOpen
              ? 'fixed inset-y-0 left-[72px] z-40 w-72 bg-[#0C0C0E] shadow-2xl flex'
              : 'hidden md:flex'
          }`}
        >
          {/* Header */}
          <div className="app-header space-y-1">
            <span className="label-tech text-[#00F0FF]">Central Station</span>
            <h1 className="font-['Syne',sans-serif] text-2xl font-black uppercase tracking-tight text-white leading-none">
              Study<br />Hub_OS
            </h1>
          </div>

          {/* Stat Grid */}
          <div className="stat-grid grid grid-cols-2 gap-[1px] bg-white/10 border border-white/10">
            <div className="stat-item bg-[#0C0C0E] p-3">
              <span className="label-tech block text-white/50">Trilhas</span>
              <div className="stat-value font-mono text-xl font-bold text-white tabular-nums">
                {String(tracksCount).padStart(2, '0')}
              </div>
            </div>
            <div className="stat-item bg-[#0C0C0E] p-3">
              <span className="label-tech block text-white/50">Módulos</span>
              <div className="stat-value font-mono text-xl font-bold text-white tabular-nums">
                {String(modulesCount).padStart(2, '0')}
              </div>
            </div>
            <div className="stat-item bg-[#0C0C0E] p-3">
              <span className="label-tech block text-white/50">Certs TI</span>
              <div className="stat-value font-mono text-xl font-bold text-[#00F0FF] tabular-nums">
                {String(database.certifications.length).padStart(2, '0')}
              </div>
            </div>
            <div className="stat-item bg-[#0C0C0E] p-3">
              <span className="label-tech block text-white/50">Horas Foco</span>
              <div className="stat-value font-mono text-xl font-bold text-[#00F0FF] tabular-nums">
                {weeklyHoursLogged}h
              </div>
            </div>
          </div>

          {/* Search Area */}
          <div className="search-area bg-[#141417] border border-white/10 p-2.5 flex items-center gap-2">
            <span className="font-mono text-[#00F0FF] text-xs font-bold">&gt;</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="RUN SEARCH_"
              className="bg-transparent border-none text-white font-mono text-xs w-full outline-none placeholder:text-white/30"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-white/40 hover:text-white font-mono text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Directory Navigation */}
          <nav className="space-y-2">
            <span className="label-tech block text-white/50">Directory</span>
            <div className="flex flex-col gap-1 font-mono text-xs">
              {[
                { id: 'all', label: 'Root_All' },
                { id: 'Gov_Laws', label: 'Gov_Laws' },
                { id: 'Cert_Hub', label: 'Cert_Hub' },
                { id: 'IA_Research', label: 'IA_Research' },
                { id: 'Security', label: 'Security' },
                { id: 'Mentorship', label: 'Mentorship' },
                { id: 'Tech_Business', label: 'Tech_Business' },
              ].map((cat) => {
                const active = sidebarCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSidebarCategory(cat.id);
                      if (activeTab !== 'tracks') setActiveTab('tracks');
                    }}
                    className={`text-left py-1.5 px-2 transition flex items-center gap-2 cursor-pointer ${
                      active
                        ? 'text-[#00F0FF] font-bold bg-[#00F0FF]/10 border-l-2 border-[#00F0FF]'
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span className="text-white/40">[{active ? 'x' : ' '}]</span>
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </nav>

          {/* New Track Action Button */}
          <button
            onClick={() => {
              setTrackToEdit(null);
              setIsCreateTrackModalOpen(true);
            }}
            className="btn-tech mt-auto w-full"
          >
            + Initialize_New_Track
          </button>
        </aside>

        {/* 3. Main Viewport (Right) */}
        <main className="viewport flex-1 flex flex-col overflow-hidden bg-radial from-[#141417] via-[#0E0E11] to-[#0C0C0E] relative">
          <div className="dot-matrix absolute inset-0 pointer-events-none z-0" />

          {/* Top Bar Command Strip */}
          <div className="relative z-10 px-5 sm:px-6 py-3 border-b border-white/10 bg-[#0C0C0E]/95 backdrop-blur-md flex items-center justify-between gap-4 shrink-0">
            {/* Breadcrumb & Mobile Menu Toggle */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMobileSidebarOpen((prev) => !prev)}
                className="md:hidden p-1.5 text-white/70 hover:text-white border border-white/10 bg-[#141417] cursor-pointer"
                title="Toggle Directory"
              >
                {isMobileSidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>

              <div className="flex items-center gap-2 font-mono text-xs text-white/60">
                <span className="text-[#00F0FF] font-bold">RACAN_OS</span>
                <span>//</span>
                <span className="text-white uppercase font-bold">
                  {activeTab === 'tracks' ? (selectedTrack ? selectedTrack.title : 'TRILHAS_HUB') : activeTab.toUpperCase()}
                </span>
                {selectedTrack && (
                  <>
                    <span>//</span>
                    <button
                      onClick={handleBackToTracks}
                      className="text-[#00F0FF] hover:underline cursor-pointer"
                    >
                      [VOLTAR_AO_HUB]
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Quick Actions & Google Auth */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setIsMcpModalOpen(true)}
                className="btn-tech-subtle px-2.5 py-1 text-[11px] gap-1.5"
                title="Legislações & MCP"
              >
                <Scale className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">LEGISLAÇÕES_MCP</span>
              </button>

              <button
                onClick={() => setIsSimuladosModalOpen(true)}
                className="btn-tech-subtle px-2.5 py-1 text-[11px] gap-1.5"
                title="Simulados"
              >
                <Award className="w-3.5 h-3.5 text-teal-400" />
                <span className="hidden sm:inline">SIMULADOS</span>
              </button>

              <button
                onClick={() => setIsDatabaseModalOpen(true)}
                className="btn-tech-subtle px-2.5 py-1 text-[11px] gap-1.5 text-[#00F0FF] border-[#00F0FF]/30"
                title="Backup & Database"
              >
                <Database className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">BACKUP</span>
              </button>

              {currentUser ? (
                <div className="flex items-center gap-2 pl-2 border-l border-white/10">
                  <span className="text-[11px] font-mono text-emerald-400 hidden xl:inline">
                    {currentUser.displayName || currentUser.email?.split('@')[0]}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="p-1 text-white/40 hover:text-rose-400 cursor-pointer"
                    title="Desconectar"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleGoogleLogin}
                  disabled={isLoggingIn}
                  className="btn-tech px-2.5 py-1 text-[11px] flex items-center gap-1.5 ml-2"
                >
                  {isLoggingIn ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <GoogleGLogo className="w-3.5 h-3.5" />
                  )}
                  <span>LOGIN_GOOGLE</span>
                </button>
              )}
            </div>
          </div>

          {/* Viewport Dynamic Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 relative z-10">
            {activeTab === 'tracks' && (
              selectedTrack ? (
                <TrackDetailView
                  track={selectedTrack}
                  onBackToTracks={handleBackToTracks}
                  onUpdateTrack={handleUpdateTrack}
                  onStartPomodoroForTrack={(trackTitle, itemTitle) => {
                    setSelectedCertIdForFocus(`${trackTitle}${itemTitle ? ` - ${itemTitle}` : ''}`);
                    setIsPomodoroWidgetOpen(true);
                  }}
                  onOpenGeminiChat={(ctx) => {
                    setGeminiTrackContext(ctx || selectedTrack.title);
                    setIsGeminiChatModalOpen(true);
                  }}
                  onOpenNotebookGemini={(trackId) => {
                    const match = (database.notebooks || initialNotebooks).find(
                      (nb) => nb.trackId === trackId || nb.trackId === selectedTrack.slug
                    );
                    if (match) setSelectedNotebookBookId(match.id);
                    setIsNotebookModalOpen(true);
                  }}
                  theme="dark"
                  studySessions={database.studySessions}
                  onLogStudyHours={(hours, trackTitle) => handleLogManualHours(hours, trackTitle)}
                  notes={database.notes}
                  onSaveNote={handleSaveNote}
                  onDeleteNote={handleDeleteNote}
                  onOpenNotesForModule={(trackId, subcategoryId) => {
                    setSelectedTrackIdForNotes(trackId);
                    setSelectedSubcategoryIdForNotes(subcategoryId || '');
                    setActiveTab('notes');
                  }}
                />
              ) : (
                <TracksHubView
                  tracks={database.knowledgeTracks || []}
                  certifications={database.certifications}
                  onOpenTrack={handleOpenTrack}
                  onOpenCertifications={handleOpenCertifications}
                  onOpenCreateTrackModal={() => {
                    setTrackToEdit(null);
                    setIsCreateTrackModalOpen(true);
                  }}
                  onEditTrack={(t) => {
                    setTrackToEdit(t);
                    setIsCreateTrackModalOpen(true);
                  }}
                  onDeleteTrack={handleDeleteTrack}
                  searchTerm={searchQuery}
                  selectedCategory={sidebarCategory}
                />
              )
            )}

            {activeTab === 'dashboard' && (
              <DashboardView
                certifications={database.certifications}
                studySessions={database.studySessions}
                gates={database.scheduleGates}
                plannedTasks={database.plannedTasks || []}
                reminders={database.reminders}
                knowledgeTracks={database.knowledgeTracks || []}
                targetHoursWeekly={database.config?.targetHoursWeekly || 11}
                onNavigateToTab={(tab) => {
                  setSelectedTrack(null);
                  setActiveTab(tab);
                }}
                onStartPomodoro={(target) => {
                  if (target) setSelectedCertIdForFocus(target);
                  setIsPomodoroWidgetOpen(true);
                }}
                onLogManualHours={handleLogManualHours}
                theme="dark"
              />
            )}

            {activeTab === 'planner' && (
              <StudyPlannerCalendarView
                plannedTasks={database.plannedTasks || []}
                tracks={database.knowledgeTracks || []}
                certifications={database.certifications}
                onAddPlannedTask={handleAddPlannedTask}
                onUpdatePlannedTask={handleUpdatePlannedTask}
                onDeletePlannedTask={handleDeletePlannedTask}
                onTogglePlannedTask={handleTogglePlannedTask}
                theme="dark"
              />
            )}

            {activeTab === 'certs' && (
              <CertificationsView
                certifications={database.certifications}
                onBackToTracks={handleBackToTracks}
                onUpdateCert={handleUpdateCert}
                onDeleteCert={handleDeleteCert}
                onOpenCreateModal={() => {
                  setCertToEdit(null);
                  setIsCertModalOpen(true);
                }}
                onOpenEditModal={(cert) => {
                  setCertToEdit(cert);
                  setIsCertModalOpen(true);
                }}
                onOpenAddResourceModal={(cert) => {
                  setCertForResource(cert);
                  setIsResourceModalOpen(true);
                }}
                onOpenSimuladosForCert={(cert) => {
                  setCertForSimulados(cert);
                  setIsSimuladosModalOpen(true);
                }}
                onStartFeynmanForCert={(cert) => {
                  setSelectedCertIdForFocus(cert.id);
                  setActiveTab('techniques');
                }}
                onOpenNotesForCert={(cert) => {
                  setSelectedCertIdForFocus(cert.id);
                  setActiveTab('notes');
                }}
                theme="dark"
              />
            )}

            {activeTab === 'pomodoro' && (
              <PomodoroView
                certifications={database.certifications}
                selectedCertId={selectedCertIdForFocus}
                onSelectCertId={setSelectedCertIdForFocus}
                onSessionComplete={handleSessionComplete}
                studySessions={database.studySessions}
              />
            )}

            {activeTab === 'techniques' && (
              <StudyTechniquesView
                certifications={database.certifications}
                flashcards={database.flashcards}
                onUpdateFlashcards={handleUpdateFlashcards}
                onSaveFeynmanNote={(noteData) => {
                  const newNote: StudyNote = {
                    ...noteData,
                    id: `note-${Date.now()}`,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                  };
                  handleSaveNote(newNote);
                }}
                selectedCertId={selectedCertIdForFocus}
              />
            )}

            {activeTab === 'notes' && (
              <NotesView
                notes={database.notes}
                certifications={database.certifications}
                tracks={database.knowledgeTracks || []}
                onSaveNote={handleSaveNote}
                onDeleteNote={handleDeleteNote}
                selectedCertId={selectedCertIdForFocus}
                selectedTrackId={selectedTrackIdForNotes}
                selectedSubcategoryId={selectedSubcategoryIdForNotes}
                theme="dark"
              />
            )}

            {activeTab === 'reminders' && (
              <RemindersView
                reminders={database.reminders}
                certifications={database.certifications}
                onToggleReminder={handleToggleReminder}
                onAddReminder={handleAddReminder}
                onDeleteReminder={handleDeleteReminder}
              />
            )}
          </div>
        </main>
      </div>

      {/* 4. Bottom Status Bar - Variation 3 */}
      <footer className="status-bar h-9 shrink-0 bg-[#141417] border-t border-white/10 px-4 sm:px-6 flex items-center justify-between text-xs font-mono text-white/50 z-30 select-none">
        <div className="label-tech text-white/60">
          STATUS: <span className="text-emerald-400 font-bold">ONLINE</span> // USER: <span className="text-white font-semibold">{currentUser?.displayName || currentUser?.email || 'Rodrigo Rahal Canado'}</span>
        </div>
        <div className="label-tech text-white/40 hidden md:block">
          RACAN HUB NETWORK // 2026.11.06
        </div>
        <div className="label-tech text-[#00F0FF] font-bold flex items-center gap-1.5">
          <span>SYSTEM READY_</span>
          <span className="inline-block w-1.5 h-3 bg-[#00F0FF] animate-pulse" />
        </div>
      </footer>

      {/* Global Modals */}
      <TrackEditModal
        isOpen={isCreateTrackModalOpen}
        onClose={() => {
          setIsCreateTrackModalOpen(false);
          setTrackToEdit(null);
        }}
        onSave={handleSaveTrack}
        trackToEdit={trackToEdit}
      />

      <CertEditModal
        isOpen={isCertModalOpen}
        onClose={() => {
          setIsCertModalOpen(false);
          setCertToEdit(null);
        }}
        onSave={handleSaveCert}
        certToEdit={certToEdit}
      />

      <AddExternalResourceModal
        isOpen={isResourceModalOpen}
        onClose={() => {
          setIsResourceModalOpen(false);
          setCertForResource(null);
        }}
        onAdd={handleAddExternalResource}
        certId={certForResource?.id || ''}
        certTitle={certForResource?.title || 'Trilha'}
      />

      <DatabaseModal
        isOpen={isDatabaseModalOpen}
        onClose={() => setIsDatabaseModalOpen(false)}
        database={database}
        onUpdateDatabase={(updated) => {
          setDatabase(updated);
          saveDatabase(updated);
        }}
      />

      <SimuladosModal
        isOpen={isSimuladosModalOpen}
        onClose={() => {
          setIsSimuladosModalOpen(false);
          setCertForSimulados(null);
        }}
        cert={certForSimulados}
        onUpdateCert={(updated) => {
          handleUpdateCert(updated);
          setCertForSimulados(updated);
        }}
        onSendToNotes={(title, content) => {
          const newNote: StudyNote = {
            id: `note-${Date.now()}`,
            title,
            content,
            certificationId: certForSimulados?.id,
            tags: ['Simulado', 'Revisão'],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          handleSaveNote(newNote);
        }}
      />

      <GlobalPomodoroWidget
        isOpen={isPomodoroWidgetOpen}
        onClose={() => setIsPomodoroWidgetOpen(false)}
        certifications={database.certifications}
        selectedCertId={selectedCertIdForFocus}
        onSelectCertId={setSelectedCertIdForFocus}
        onSessionComplete={handleSessionComplete}
      />

      <GoogleDriveModal
        isOpen={isGoogleDriveModalOpen}
        onClose={() => setIsGoogleDriveModalOpen(false)}
        certifications={database.certifications}
        onAddResourceToCert={handleAddResourceFromDrive}
        database={database}
      />

      <GoogleClassroomModal
        isOpen={isGoogleClassroomModalOpen}
        onClose={() => setIsGoogleClassroomModalOpen(false)}
        tracks={database.knowledgeTracks || []}
        certifications={database.certifications}
        onAddResourceToTrack={handleAddResourceFromClassroom}
        theme={theme}
      />

      {/* Gemini AI Q&A Interactive Script & Questions Modal */}
      <GeminiChatModal
        isOpen={isGeminiChatModalOpen}
        onClose={() => setIsGeminiChatModalOpen(false)}
        currentTrackTitle={geminiTrackContext}
        userApiKey={database.userGeminiApiKey}
        onSaveApiKey={handleSaveUserGeminiApiKey}
        onSaveAsNote={(content, title) => {
          const newNote: StudyNote = {
            id: `note-${Date.now()}`,
            title: title || 'Resposta Gemini AI',
            content,
            tags: ['Gemini AI', 'Perguntas e Respostas', geminiTrackContext || 'Geral'],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          handleSaveNote(newNote);
        }}
        theme={theme}
      />

      {/* Notebook Gemini: Books Linking, Sources & Script Generator Modal */}
      <NotebookGeminiModal
        isOpen={isNotebookModalOpen}
        onClose={() => setIsNotebookModalOpen(false)}
        books={database.notebooks && database.notebooks.length > 0 ? database.notebooks : initialNotebooks}
        onUpdateBooks={handleUpdateNotebooks}
        initialBookId={selectedNotebookBookId}
        userApiKey={database.userGeminiApiKey}
        onSaveApiKey={handleSaveUserGeminiApiKey}
        onSaveAsNote={(content, title) => {
          const newNote: StudyNote = {
            id: `note-${Date.now()}`,
            title: title || 'Síntese Notebook Gemini',
            content,
            tags: ['Notebook Gemini', 'Livros', 'Roteiro'],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          handleSaveNote(newNote);
        }}
        theme={theme}
      />

      {/* Official Legislation & MCP Connectors Hub Modal */}
      <McpLegislationModal
        isOpen={isMcpModalOpen}
        onClose={() => setIsMcpModalOpen(false)}
        onAskAiAboutLegislation={(legislationTitle) => {
          setGeminiTrackContext(`Legislação/Norma: ${legislationTitle}`);
          setIsGeminiChatModalOpen(true);
        }}
        theme={theme}
      />
    </div>
  );
}
