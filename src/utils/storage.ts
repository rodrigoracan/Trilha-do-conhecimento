import {
  Certification,
  ScheduleGate,
  StudyNote,
  ActionReminder,
  ActiveRecallCard,
  AppConfig,
  StudySession,
  KnowledgeTrack,
  NotebookBook,
  PlannedStudyTask
} from '../types';
import {
  initialCertifications,
  initialScheduleGates,
  initialNotes,
  initialReminders,
  initialFlashcards,
  initialConfig,
  initialKnowledgeTracks,
  initialNotebooks
} from '../data/initialData';

const STORAGE_KEY = 'trilha_estudos_racan_v1';

export interface AppDatabase {
  version: number;
  lastUpdated: string;
  config: AppConfig;
  knowledgeTracks: KnowledgeTrack[];
  certifications: Certification[];
  scheduleGates: ScheduleGate[];
  notes: StudyNote[];
  reminders: ActionReminder[];
  flashcards: ActiveRecallCard[];
  studySessions: StudySession[];
  notebooks: NotebookBook[];
  plannedTasks?: PlannedStudyTask[];
  userGeminiApiKey?: string;
}

export function loadDatabase(): AppDatabase {
  if (typeof window === 'undefined') {
    return getDefaultDatabase();
  }

  try {
    let raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Check for earlier versions to preserve existing user data
      raw = localStorage.getItem('trilha_estudos_ia_data_v3') || localStorage.getItem('trilha_estudos_ia_data_v2') || localStorage.getItem('trilha_estudos_ia_data_v1');
    }

    if (!raw) {
      const initial = getDefaultDatabase();
      saveDatabase(initial);
      return initial;
    }

    const parsed = JSON.parse(raw) as Partial<AppDatabase>;

    // Ensure certifications list contains MLOps if missing
    let loadedCerts = parsed.certifications?.length ? parsed.certifications : initialCertifications;
    const hasMlOps = loadedCerts.some((c) => c.id === 'mlops-governance' || c.code.toLowerCase().includes('mlops'));
    if (!hasMlOps) {
      const mlopsInitial = initialCertifications.find((c) => c.id === 'mlops-governance');
      if (mlopsInitial) {
        loadedCerts = [...loadedCerts, mlopsInitial];
      }
    }

    // Ensure knowledge tracks exist and cleanse initial mock subcategories so tracks without real data are zeroed
    let loadedTracks: KnowledgeTrack[] = (parsed.knowledgeTracks && parsed.knowledgeTracks.length > 0
      ? parsed.knowledgeTracks
      : initialKnowledgeTracks
    ).map((track: KnowledgeTrack): KnowledgeTrack => {
      // Cleanse mock seed subcategories (ids starting with ds-, eh-, mr-, rbt-, yt-)
      const cleanSubcategories = (track.subcategories || []).filter(
        (sub) => !['ds-sub-', 'eh-sub-', 'mr-sub-', 'rbt-sub-', 'yt-sub-'].some((prefix) => sub.id.startsWith(prefix))
      );

      // Match default track to populate schedule template if missing
      const defaultTrack = initialKnowledgeTracks.find((t) => t.id === track.id || t.slug === track.slug);
      const schedule = track.schedule || defaultTrack?.schedule || {
        daysOfWeek: ['Segunda', 'Quarta', 'Sexta'],
        weeklyTargetHours: 3,
        preferredTimeSlot: '19:30 - 20:30',
        sessions: [],
      };

      return {
        ...track,
        subcategories: cleanSubcategories,
        schedule,
      };
    });

    // Check if default tracks are present, if not add them
    initialKnowledgeTracks.forEach((defTrack) => {
      if (!loadedTracks.some((t) => t.id === defTrack.id || t.slug === defTrack.slug)) {
        loadedTracks = [...loadedTracks, defTrack];
      }
    });

    const loadedDb: AppDatabase = {
      version: parsed.version || 3,
      lastUpdated: parsed.lastUpdated || new Date().toISOString(),
      config: { ...initialConfig, ...(parsed.config || {}) },
      knowledgeTracks: loadedTracks,
      certifications: loadedCerts,
      scheduleGates: parsed.scheduleGates?.length ? parsed.scheduleGates : initialScheduleGates,
      notes: parsed.notes || initialNotes,
      reminders: parsed.reminders || initialReminders,
      flashcards: parsed.flashcards || initialFlashcards,
      studySessions: parsed.studySessions || [],
      notebooks: parsed.notebooks?.length ? parsed.notebooks : initialNotebooks,
      plannedTasks: parsed.plannedTasks || [],
      userGeminiApiKey: parsed.userGeminiApiKey || '',
    };

    saveDatabase(loadedDb);
    return loadedDb;
  } catch (err) {
    console.error('Falha ao carregar banco local, restaurando padrão:', err);
    return getDefaultDatabase();
  }
}

export function saveDatabase(db: AppDatabase): void {
  if (typeof window === 'undefined') return;
  try {
    db.lastUpdated = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch (err) {
    console.error('Falha ao salvar no banco local:', err);
  }
}

export function getDefaultDatabase(): AppDatabase {
  return {
    version: 3,
    lastUpdated: new Date().toISOString(),
    config: initialConfig,
    knowledgeTracks: initialKnowledgeTracks,
    certifications: initialCertifications,
    scheduleGates: initialScheduleGates,
    notes: initialNotes,
    reminders: initialReminders,
    flashcards: initialFlashcards,
    studySessions: [],
    notebooks: initialNotebooks,
    plannedTasks: [],
    userGeminiApiKey: '',
  };
}

export function exportBackupJSON(db: AppDatabase): void {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(db, null, 2));
  const downloadAnchor = document.createElement('a');
  const dateStr = new Date().toISOString().split('T')[0];
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `trilha-estudos-racan-backup-${dateStr}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function importBackupJSON(file: File): Promise<AppDatabase> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text) as AppDatabase;
        if (!parsed.certifications || !Array.isArray(parsed.certifications)) {
          throw new Error('Formato de arquivo de backup inválido.');
        }
        saveDatabase(parsed);
        resolve(parsed);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Erro na leitura do arquivo'));
    reader.readAsText(file);
  });
}
