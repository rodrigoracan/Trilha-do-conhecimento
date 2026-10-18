/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Certification,
  ScheduleGate,
  StudyNote,
  ActionReminder,
  ActiveRecallCard,
  StudySession,
  ExternalResource,
  KnowledgeTrack,
} from './types';
import {
  loadDatabase,
  saveDatabase,
  AppDatabase,
} from './utils/storage';
import { Navbar, ActiveTab } from './components/Navbar';
import { HeaderBanner } from './components/HeaderBanner';
import { TracksHubView } from './components/TracksHubView';
import { TrackDetailView } from './components/TrackDetailView';
import { TrackEditModal } from './components/TrackEditModal';
import { CertificationsView } from './components/CertificationsView';
import { PomodoroView } from './components/PomodoroView';
import { StudyTechniquesView } from './components/StudyTechniquesView';
import { NotesView } from './components/NotesView';
import { RemindersView } from './components/RemindersView';
import { CertEditModal } from './components/CertEditModal';
import { AddExternalResourceModal } from './components/AddExternalResourceModal';
import { DatabaseModal } from './components/DatabaseModal';
import { SimuladosModal } from './components/SimuladosModal';
import { GlobalPomodoroWidget } from './components/GlobalPomodoroWidget';
import { GoogleDriveModal } from './components/GoogleDriveModal';
import { GeminiChatModal } from './components/GeminiChatModal';
import { NotebookGeminiModal } from './components/NotebookGeminiModal';
import { NotebookBook } from './types';
import { initialNotebooks } from './data/initialData';
import { auth } from './lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

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
  const [certForSimulados, setCertForSimulados] = useState<Certification | null>(null);

  // Gemini AI & Notebook Modals states
  const [isGeminiChatModalOpen, setIsGeminiChatModalOpen] = useState(false);
  const [isNotebookModalOpen, setIsNotebookModalOpen] = useState(false);
  const [geminiTrackContext, setGeminiTrackContext] = useState<string>('');
  const [selectedNotebookBookId, setSelectedNotebookBookId] = useState<string>('');

  // Focus targets
  const [selectedCertIdForFocus, setSelectedCertIdForFocus] = useState<string>('');

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
          // Bulk sync current database to Cloud SQL PostgreSQL
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

  // --- NOTES ACTIONS ---
  const handleSaveNote = (note: StudyNote) => {
    updateDbAndPersist((prev) => {
      const exists = prev.notes.some((n) => n.id === note.id);
      if (exists) {
        return {
          ...prev,
          notes: prev.notes.map((n) => (n.id === note.id ? note : n)),
        };
      }
      return {
        ...prev,
        notes: [note, ...prev.notes],
      };
    });
    syncWithCloudSQL('/api/notes', 'POST', note);
  };

  const handleDeleteNote = (id: string) => {
    updateDbAndPersist((prev) => ({
      ...prev,
      notes: prev.notes.filter((n) => n.id !== id),
    }));
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
    <div
      className={`min-h-screen flex flex-col antialiased selection:bg-sky-500 selection:text-white transition-colors duration-200 ${
        theme === 'light' ? 'bg-[#ebf3fc] text-slate-900' : 'bg-[#0c1529] text-slate-100'
      }`}
    >
      {/* Container Layout with Maximum Contrast and Depth */}
      <div className="max-w-[1440px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-5 flex-1 flex flex-col">
        {/* Top Header Banner with Shortcuts and Integrated Trilhas/Módulos Numbers */}
        <HeaderBanner
          onOpenDatabaseModal={() => setIsDatabaseModalOpen(true)}
          googleDriveUrl={database.config.googleDriveUrl}
          weeklyHoursLogged={weeklyHoursLogged}
          targetHoursWeekly={database.config.targetHoursWeekly}
          onTogglePomodoro={() => setIsPomodoroWidgetOpen((prev) => !prev)}
          isPomodoroOpen={isPomodoroWidgetOpen}
          onOpenGoogleDriveModal={() => setIsGoogleDriveModalOpen(true)}
          tracksCount={tracksCount}
          modulesCount={modulesCount}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          onOpenGeminiChat={() => {
            setGeminiTrackContext(selectedTrack ? selectedTrack.title : '');
            setIsGeminiChatModalOpen(true);
          }}
          onOpenNotebookGemini={() => {
            setSelectedNotebookBookId('');
            setIsNotebookModalOpen(true);
          }}
        />

        {/* Clean, Objective Navigation Tabs */}
        <Navbar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          pendingRemindersCount={pendingRemindersCount}
          notesCount={database.notes.length}
          theme={theme}
        />

        {/* Main Tab Content */}
        <main className="flex-1 pb-12">
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
                theme={theme}
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
                theme={theme}
              />
            )
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
              theme={theme}
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
              onSaveNote={handleSaveNote}
              onDeleteNote={handleDeleteNote}
              selectedCertId={selectedCertIdForFocus}
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
        </main>

        <footer className={`pt-4 border-t text-xs flex flex-col sm:flex-row items-center justify-between gap-2 transition-colors ${
          theme === 'light' ? 'border-slate-200 text-slate-500' : 'border-slate-800/80 text-slate-500'
        }`}>
          <div>Trilha de Estudos RACAN · Hub de Conhecimento, Certificações & Estratégia Tecnológica</div>
          <div className="flex items-center gap-2 text-slate-500 font-mono text-[11px] flex-wrap justify-center">
            <span>Certificações de TI</span>
            <span>·</span>
            <span>Data Science & IA</span>
            <span>·</span>
            <span>Ethical Hacker</span>
            <span>·</span>
            <span>Mentoria RACAN</span>
            <span>·</span>
            <span>Business Tech</span>
            <span>·</span>
            <span>Canal do YouTube</span>
          </div>
        </footer>
      </div>

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
    </div>
  );
}
