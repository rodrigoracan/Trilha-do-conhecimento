export type CategoryType = 'Governança' | 'Segurança' | 'Auditoria' | 'Técnica' | 'MLOps' | 'Estratégia';

export type CertStatus = 'Planejada' | 'Em Andamento' | 'Concluída';

export type ColorThemeType = 'sky' | 'emerald' | 'purple' | 'amber' | 'rose' | 'teal' | 'indigo';

export interface ExternalResource {
  id: string;
  title: string;
  url?: string;
  type: 'link' | 'pdf' | 'video' | 'doc' | 'file';
  description?: string;
  fileName?: string;
  fileSize?: string;
  fileType?: string;
  fileData?: string;
  addedAt: string;
}

export interface CertificationModule {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  subtopics?: string[];
}

export interface Simulado {
  id: string;
  certificationId: string;
  title: string;
  date: string;
  totalQuestions: number;
  correctAnswers: number;
  scorePercentage: number;
  passingScorePercentage: number;
  passed: boolean;
  timeSpentMinutes?: number;
  difficulty?: 'Fácil' | 'Médio' | 'Difícil' | 'Oficial';
  notes?: string;
  url?: string;
}

export interface Certification {
  id: string;
  code: string;
  title: string;
  issuer: string;
  category: CategoryType;
  colorTheme?: ColorThemeType;
  description: string;
  status: CertStatus;
  targetGate: string;
  targetMonths: string;
  estimatedHours: number;
  hoursSpent: number;
  officialUrl?: string;
  modules: CertificationModule[];
  externalResources: ExternalResource[];
  simulados?: Simulado[];
}

export interface StudyNote {
  id: string;
  title: string;
  content: string;
  certificationId?: string;
  attachments?: ExternalResource[];
  links?: { title: string; url: string }[];
  technique?: 'feynman' | 'active_recall' | 'resumo' | 'geral';
  feynmanDetails?: {
    concept: string;
    simpleExplanation: string;
    gapsIdentified: string;
    analogy: string;
  };
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ActionReminder {
  id: string;
  title: string;
  dueDate: string;
  priority: 'Alta' | 'Média' | 'Baixa';
  completed: boolean;
  certificationId?: string;
  createdAt: string;
}

export interface ScheduleGate {
  gateNumber: number;
  title: string;
  period: string;
  phaseName: string;
  description: string;
  focusCertifications: string[];
  deliverables: string[];
  status: 'Concluído' | 'Em Andamento' | 'Futuro';
}

export interface StudySession {
  id: string;
  date: string;
  minutes: number;
  certificationId?: string;
  certificationTitle?: string;
  mode: 'focus' | 'short_break' | 'long_break';
}

export interface PlannedStudyTask {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  durationMinutes: number;
  timeString?: string; // ex: "1h", "45 min"
  trackId?: string;
  trackTitle?: string;
  completed: boolean;
  notes?: string;
  createdAt: string;
}

export interface ActiveRecallCard {
  id: string;
  certificationId: string;
  topic: string;
  question: string;
  answer: string;
  box: number; // 1-5 Leitner box
  lastReviewed?: string;
  nextReviewDate?: string;
}

export interface AppConfig {
  googleDriveUrl: string;
  targetHoursWeekly: number;
  pomodoroWorkMinutes: number;
  pomodoroShortBreakMinutes: number;
  pomodoroLongBreakMinutes: number;
  soundEnabled: boolean;
  theme?: 'light' | 'dark';
}

export interface TrackAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  dataUrl?: string;
  externalUrl?: string;
  uploadedAt: string;
  notes?: string;
}

export interface TrackResource {
  id: string;
  title: string;
  url: string;
  type: 'video' | 'course' | 'doc' | 'github' | 'drive' | 'link';
  platform?: string;
  duration?: string;
  completed?: boolean;
  addedAt: string;
}

export interface TrackItemChecklist {
  id: string;
  text: string;
  done: boolean;
}

export interface TrackItem {
  id: string;
  title: string;
  description?: string;
  status: 'A Fazer' | 'Em Andamento' | 'Concluído';
  priority?: 'Alta' | 'Média' | 'Baixa';
  notes?: string;
  resources: TrackResource[];
  checklist?: TrackItemChecklist[];
  createdAt: string;
  updatedAt: string;
}

export interface TrackSubcategory {
  id: string;
  title: string;
  description?: string;
  colorTheme?: ColorThemeType;
  items: TrackItem[];
  attachments?: TrackAttachment[];
  order: number;
}

export type WeekDay = 'Segunda' | 'Terça' | 'Quarta' | 'Quinta' | 'Sexta' | 'Sábado' | 'Domingo';

export interface TrackScheduleSession {
  id: string;
  dayOfWeek: WeekDay;
  startTime: string; // ex: "19:30"
  durationMinutes: number; // ex: 60
  targetModuleTitle?: string;
  notes?: string;
  completed?: boolean;
}

export interface TrackSchedule {
  daysOfWeek: WeekDay[];
  weeklyTargetHours: number; // ex: 4
  preferredTimeSlot?: string; // ex: "19:30 - 20:30"
  startDate?: string;
  targetEndDate?: string;
  sessions: TrackScheduleSession[];
}

export interface KnowledgeTrack {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  colorTheme: ColorThemeType;
  category: string;
  isCertificationHub?: boolean;
  subcategories: TrackSubcategory[];
  tags?: string[];
  schedule?: TrackSchedule;
  createdAt: string;
  updatedAt: string;
}

export interface NotebookSource {
  id: string;
  title: string;
  type: 'pdf' | 'doc' | 'drive' | 'web' | 'text' | 'book';
  url?: string;
  author?: string;
  summary?: string;
  contentSnippet?: string;
  addedAt: string;
}

export interface NotebookScript {
  id: string;
  title: string;
  type: 'script' | 'summary' | 'qa' | 'faq' | 'feynman';
  content: string;
  createdAt: string;
}

export interface NotebookBook {
  id: string;
  title: string;
  category: string;
  description?: string;
  trackId?: string;
  colorTheme?: ColorThemeType;
  sources: NotebookSource[];
  generatedScripts: NotebookScript[];
  createdAt: string;
  updatedAt: string;
}
