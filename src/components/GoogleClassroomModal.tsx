import React, { useState, useEffect } from 'react';
import { GoogleClassroomLogo } from './Logos';
import {
  X,
  Search,
  RefreshCw,
  ExternalLink,
  BookOpen,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Video,
  Link as LinkIcon,
  Plus,
  Users,
  Copy,
  Check,
  GraduationCap,
  Sparkles,
  Layers,
  ChevronRight,
  ArrowLeft,
  Trash2,
  FolderOpen
} from 'lucide-react';
import {
  ClassroomCourse,
  ClassroomCourseWork,
  ClassroomCourseWorkMaterial,
  ClassroomAnnouncement,
  listClassroomCourses,
  listClassroomCourseWork,
  listClassroomCourseWorkMaterials,
  listClassroomAnnouncements,
  createClassroomCourseWork,
  deleteClassroomCourseWork
} from '../utils/googleClassroom';
import { googleSignIn, logout, auth } from '../lib/firebase';
import { User, onAuthStateChanged } from 'firebase/auth';
import { KnowledgeTrack, Certification } from '../types';

interface GoogleClassroomModalProps {
  isOpen: boolean;
  onClose: () => void;
  tracks: KnowledgeTrack[];
  certifications?: Certification[];
  onAddResourceToTrack?: (trackId: string, subcategoryId: string, resource: { title: string; url: string; type: 'video' | 'doc' | 'link' }) => void;
  theme?: 'light' | 'dark';
}

type TabType = 'courses' | 'courseDetail';
type CourseDetailTab = 'courseWork' | 'materials' | 'announcements';

export const GoogleClassroomModal: React.FC<GoogleClassroomModalProps> = ({
  isOpen,
  onClose,
  tracks,
  certifications = [],
  onAddResourceToTrack,
  theme = 'light',
}) => {
  const isLight = theme === 'light';
  const [currentUser, setCurrentUser] = useState<User | null>(auth.currentUser);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Courses state
  const [courses, setCourses] = useState<ClassroomCourse[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [courseFilter, setCourseFilter] = useState<'ACTIVE' | 'ARCHIVED' | 'ALL'>('ACTIVE');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Selected course state
  const [selectedCourse, setSelectedCourse] = useState<ClassroomCourse | null>(null);
  const [courseDetailTab, setCourseDetailTab] = useState<CourseDetailTab>('courseWork');
  const [courseWorks, setCourseWorks] = useState<ClassroomCourseWork[]>([]);
  const [materials, setMaterials] = useState<ClassroomCourseWorkMaterial[]>([]);
  const [announcements, setAnnouncements] = useState<ClassroomAnnouncement[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);

  // Create Assignment Modal / Confirmation state
  const [isCreateWorkModalOpen, setIsCreateWorkModalOpen] = useState(false);
  const [newWorkTitle, setNewWorkTitle] = useState('');
  const [newWorkDescription, setNewWorkDescription] = useState('');
  const [newWorkMaxPoints, setNewWorkMaxPoints] = useState('100');
  const [newWorkDueDate, setNewWorkDueDate] = useState('');
  const [isConfirmingCreation, setIsConfirmingCreation] = useState(false);

  // Delete Assignment confirmation state
  const [workToDelete, setWorkToDelete] = useState<ClassroomCourseWork | null>(null);

  // Attach to Track Modal state
  const [attachTargetItem, setAttachTargetItem] = useState<{ title: string; url: string; type: 'video' | 'doc' | 'link' } | null>(null);
  const [selectedTrackId, setSelectedTrackId] = useState<string>(tracks[0]?.id || '');
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string>('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user && isOpen) {
        loadCourses();
      }
    });
    return () => unsubscribe();
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && currentUser) {
      loadCourses();
    }
  }, [isOpen, courseFilter]);

  // Set default subcategory when track changes
  useEffect(() => {
    const track = tracks.find((t) => t.id === selectedTrackId);
    if (track && track.subcategories && track.subcategories.length > 0) {
      setSelectedSubcategoryId(track.subcategories[0].id);
    } else {
      setSelectedSubcategoryId('');
    }
  }, [selectedTrackId, tracks]);

  // Load all courses
  const loadCourses = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const data = await listClassroomCourses(courseFilter);
      setCourses(data);
    } catch (err: any) {
      console.error('Error loading Google Classroom courses:', err);
      setErrorMessage(err.message || 'Erro ao carregar turmas do Google Classroom');
    } finally {
      setLoading(false);
    }
  };

  // Select a course and load its details
  const handleSelectCourse = async (course: ClassroomCourse) => {
    setSelectedCourse(course);
    setDetailLoading(true);
    setErrorMessage(null);
    try {
      const [works, mats, ann] = await Promise.all([
        listClassroomCourseWork(course.id).catch(() => []),
        listClassroomCourseWorkMaterials(course.id).catch(() => []),
        listClassroomAnnouncements(course.id).catch(() => []),
      ]);
      setCourseWorks(works);
      setMaterials(mats);
      setAnnouncements(ann);
    } catch (err: any) {
      console.error('Error loading course details:', err);
      setErrorMessage(err.message || 'Erro ao carregar detalhes da turma');
    } finally {
      setDetailLoading(false);
    }
  };

  // Google Login handler
  const handleLogin = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      await googleSignIn();
      setSuccessMessage('Conectado com sucesso ao Google Classroom!');
      setTimeout(() => setSuccessMessage(null), 3000);
      await loadCourses();
    } catch (err: any) {
      console.error('Google sign in error:', err);
      setErrorMessage(err.message || 'Falha ao autenticar com a conta Google');
    } finally {
      setLoading(false);
    }
  };

  // Logout handler
  const handleLogout = async () => {
    await logout();
    setCurrentUser(null);
    setCourses([]);
    setSelectedCourse(null);
  };

  // Copy code to clipboard
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Create Assignment in Course with explicit confirmation
  const handleCreateAssignment = async () => {
    if (!selectedCourse || !newWorkTitle.trim()) return;
    setLoading(true);
    setErrorMessage(null);
    try {
      let dueDateObj: { year: number; month: number; day: number } | undefined;
      if (newWorkDueDate) {
        const d = new Date(newWorkDueDate);
        if (!isNaN(d.getTime())) {
          dueDateObj = {
            year: d.getFullYear(),
            month: d.getMonth() + 1,
            day: d.getDate(),
          };
        }
      }

      await createClassroomCourseWork(selectedCourse.id, {
        title: newWorkTitle.trim(),
        description: newWorkDescription.trim(),
        maxPoints: parseInt(newWorkMaxPoints, 10) || 100,
        dueDate: dueDateObj,
      });

      setSuccessMessage(`Atividade "${newWorkTitle}" criada com sucesso na turma!`);
      setTimeout(() => setSuccessMessage(null), 3500);
      setIsCreateWorkModalOpen(false);
      setIsConfirmingCreation(false);
      setNewWorkTitle('');
      setNewWorkDescription('');
      setNewWorkDueDate('');

      // Reload course works
      const updated = await listClassroomCourseWork(selectedCourse.id);
      setCourseWorks(updated);
    } catch (err: any) {
      console.error('Error creating assignment:', err);
      setErrorMessage(err.message || 'Erro ao publicar atividade');
    } finally {
      setLoading(false);
    }
  };

  // Delete Assignment with explicit confirmation
  const handleDeleteAssignment = async () => {
    if (!selectedCourse || !workToDelete) return;
    setLoading(true);
    setErrorMessage(null);
    try {
      await deleteClassroomCourseWork(selectedCourse.id, workToDelete.id);
      setSuccessMessage(`Atividade "${workToDelete.title}" excluída com sucesso.`);
      setTimeout(() => setSuccessMessage(null), 3000);
      setWorkToDelete(null);

      // Reload course works
      const updated = await listClassroomCourseWork(selectedCourse.id);
      setCourseWorks(updated);
    } catch (err: any) {
      console.error('Error deleting assignment:', err);
      setErrorMessage(err.message || 'Erro ao excluir atividade');
    } finally {
      setLoading(false);
    }
  };

  // Confirm attachment to track
  const handleConfirmAttachToTrack = () => {
    if (!attachTargetItem || !selectedTrackId || !onAddResourceToTrack) return;
    onAddResourceToTrack(selectedTrackId, selectedSubcategoryId, attachTargetItem);
    setSuccessMessage(`Recurso "${attachTargetItem.title}" adicionado com sucesso à trilha!`);
    setTimeout(() => setSuccessMessage(null), 3500);
    setAttachTargetItem(null);
  };

  if (!isOpen) return null;

  const filteredCourses = courses.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      (c.section && c.section.toLowerCase().includes(q)) ||
      (c.descriptionHeading && c.descriptionHeading.toLowerCase().includes(q))
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-xs animate-fadeIn">
      <div
        className={`w-full max-w-5xl max-h-[92vh] flex flex-col rounded-3xl border-2 shadow-2xl overflow-hidden transition-colors ${
          isLight ? 'bg-white border-[#8cb7ea]' : 'bg-[#09152a] border-emerald-900/50'
        }`}
      >
        {/* Modal Header */}
        <div
          className={`px-5 py-4 border-b flex items-center justify-between shrink-0 ${
            isLight ? 'bg-gradient-to-r from-emerald-50 via-teal-50 to-white border-slate-200' : 'bg-[#0b1b33] border-slate-800'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-white shadow-sm border border-emerald-500/30">
              <GoogleClassroomLogo className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className={`text-base sm:text-lg font-black tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  Google Classroom · Central de Turmas & Atividades
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  Google Workspace
                </span>
              </div>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Acesse suas turmas, consulte exercícios, sincronize materiais e vincule atividades diretamente às Trilhas RACAN.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {currentUser && (
              <div className="hidden sm:flex items-center gap-2 pr-2 border-r border-slate-300 dark:border-slate-700">
                {currentUser.photoURL && (
                  <img src={currentUser.photoURL} alt="Avatar" className="w-6 h-6 rounded-full border" />
                )}
                <span className={`text-xs font-semibold truncate max-w-[140px] ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  {currentUser.displayName || currentUser.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-[11px] text-red-500 hover:text-red-600 font-bold ml-1 cursor-pointer"
                  title="Desconectar conta Google"
                >
                  Sair
                </button>
              </div>
            )}
            <button
              onClick={onClose}
              className={`p-2 rounded-xl transition cursor-pointer ${
                isLight ? 'hover:bg-slate-200 text-slate-500' : 'hover:bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Status Messages */}
        {errorMessage && (
          <div className="mx-5 mt-3 p-3 rounded-xl bg-red-500/15 border border-red-500/40 text-red-400 text-xs font-semibold flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button onClick={() => setErrorMessage(null)} className="text-red-400 hover:text-white p-1">
              ✕
            </button>
          </div>
        )}

        {successMessage && (
          <div className="mx-5 mt-3 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-xs font-semibold flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
            <button onClick={() => setSuccessMessage(null)} className="text-emerald-400 hover:text-white p-1">
              ✕
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {!currentUser ? (
            /* Sign in with Google view */
            <div
              className={`p-10 rounded-3xl border-2 border-dashed text-center space-y-6 max-w-lg mx-auto my-6 ${
                isLight ? 'border-emerald-300 bg-emerald-50/40' : 'border-emerald-900/50 bg-[#061224]'
              }`}
            >
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-inner">
                <GoogleClassroomLogo className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <h4 className={`text-lg font-black tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  Conecte sua Conta ao Google Classroom
                </h4>
                <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                  Com a permissão da sua conta Google Workspace, você poderá visualizar suas turmas ativas, consultar atividades e exercícios, baixar materiais e criar tarefas de estudo diretamente vinculadas ao seu plano de estudos.
                </p>
              </div>

              {/* Official Google Sign-In Styled Button */}
              <div className="flex justify-center pt-2">
                <button
                  onClick={handleLogin}
                  disabled={loading}
                  className="px-5 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-300 hover:border-emerald-500 shadow-md flex items-center gap-3 font-bold text-xs sm:text-sm cursor-pointer transition transform hover:-translate-y-0.5"
                >
                  <svg viewBox="0 0 48 48" className="w-5 h-5 shrink-0">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                  </svg>
                  <span>{loading ? 'Conectando...' : 'Fazer Login com Google'}</span>
                </button>
              </div>

              <div className="text-[11px] text-slate-400 font-medium">
                Permissões configuradas com segurança pelo Google OAuth 2.0.
              </div>
            </div>
          ) : selectedCourse ? (
            /* Selected Course Detail View */
            <div className="space-y-4">
              {/* Top Course Breadcrumb Bar */}
              <div
                className={`p-3.5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isLight ? 'bg-emerald-50/70 border-emerald-200' : 'bg-[#08172c] border-emerald-900/40'
                }`}
              >
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedCourse(null)}
                    className={`flex items-center gap-1.5 text-xs font-bold transition cursor-pointer ${
                      isLight ? 'text-emerald-800 hover:text-emerald-950' : 'text-emerald-400 hover:text-emerald-300'
                    }`}
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Todas as Turmas</span>
                  </button>
                  <span className="text-slate-400">/</span>
                  <span className={`text-xs font-extrabold truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    {selectedCourse.name}
                  </span>
                  {selectedCourse.section && (
                    <span className="text-xs text-slate-500 font-mono">({selectedCourse.section})</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {selectedCourse.alternateLink && (
                    <a
                      href={selectedCourse.alternateLink}
                      target="_blank"
                      rel="noreferrer"
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 cursor-pointer ${
                        isLight
                          ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                          : 'bg-[#060e1d] hover:bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Abrir no Classroom</span>
                    </a>
                  )}

                  <button
                    onClick={() => setIsCreateWorkModalOpen(true)}
                    className="btn-3d-primary px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Nova Atividade</span>
                  </button>
                </div>
              </div>

              {/* Course Detail Tabs */}
              <div
                className={`p-1 rounded-xl border flex items-center gap-1 ${
                  isLight ? 'bg-slate-100 border-slate-200' : 'bg-[#060e1d] border-slate-800'
                }`}
              >
                <button
                  onClick={() => setCourseDetailTab('courseWork')}
                  className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2 ${
                    courseDetailTab === 'courseWork'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : isLight
                      ? 'text-slate-600 hover:text-slate-900'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Atividades & Exercícios</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-black/20 text-white">
                    {courseWorks.length}
                  </span>
                </button>

                <button
                  onClick={() => setCourseDetailTab('materials')}
                  className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2 ${
                    courseDetailTab === 'materials'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : isLight
                      ? 'text-slate-600 hover:text-slate-900'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Materiais de Estudo</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-black/20 text-white">
                    {materials.length}
                  </span>
                </button>

                <button
                  onClick={() => setCourseDetailTab('announcements')}
                  className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2 ${
                    courseDetailTab === 'announcements'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : isLight
                      ? 'text-slate-600 hover:text-slate-900'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Mural & Avisos</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-black/20 text-white">
                    {announcements.length}
                  </span>
                </button>
              </div>

              {/* Tab 1: CourseWorks (Assignments) */}
              {courseDetailTab === 'courseWork' && (
                <div className="space-y-3">
                  {detailLoading ? (
                    <div className="p-12 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-emerald-500" />
                      <span>Carregando atividades do Google Classroom...</span>
                    </div>
                  ) : courseWorks.length === 0 ? (
                    <div
                      className={`p-8 rounded-2xl border-2 border-dashed text-center space-y-2 ${
                        isLight ? 'border-slate-300 bg-slate-50' : 'border-slate-800 bg-[#060e1d]'
                      }`}
                    >
                      <FileText className="w-8 h-8 text-slate-400 mx-auto" />
                      <div className={`text-sm font-bold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                        Nenhuma atividade cadastrada nesta turma ainda
                      </div>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto">
                        Crie uma nova tarefa de estudo para esta turma usando o botão "Nova Atividade".
                      </p>
                    </div>
                  ) : (
                    courseWorks.map((work) => (
                      <div
                        key={work.id}
                        className={`p-4 rounded-2xl border-2 transition-all space-y-3 ${
                          isLight
                            ? 'bg-white border-[#9fc1ee] hover:border-emerald-400 shadow-sm'
                            : 'bg-[#09152a] border-slate-800 hover:border-emerald-500/50 shadow-sm'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
                                {work.workType === 'ASSIGNMENT' ? 'Tarefa / Trabalho' : 'Pergunta'}
                              </span>
                              {work.maxPoints !== undefined && (
                                <span className="text-[11px] font-mono text-slate-500">
                                  {work.maxPoints} pts
                                </span>
                              )}
                              {work.dueDate && (
                                <span className="text-[11px] font-mono text-amber-500 flex items-center gap-1 font-bold">
                                  <Clock className="w-3 h-3" />
                                  Entrega: {String(work.dueDate.day).padStart(2, '0')}/{String(work.dueDate.month).padStart(2, '0')}/{work.dueDate.year}
                                </span>
                              )}
                            </div>
                            <h4 className={`text-sm font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                              {work.title}
                            </h4>
                            {work.description && (
                              <p className={`text-xs whitespace-pre-wrap leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                                {work.description}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {work.alternateLink && (
                              <a
                                href={work.alternateLink}
                                target="_blank"
                                rel="noreferrer"
                                className="p-2 rounded-xl text-slate-400 hover:text-emerald-500 transition border border-transparent hover:border-slate-700"
                                title="Abrir no Google Classroom"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            )}

                            {onAddResourceToTrack && (
                              <button
                                onClick={() =>
                                  setAttachTargetItem({
                                    title: `[Classroom] ${work.title}`,
                                    url: work.alternateLink || selectedCourse.alternateLink || '',
                                    type: 'doc',
                                  })
                                }
                                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer flex items-center gap-1.5 ${
                                  isLight
                                    ? 'bg-sky-50 text-sky-900 border-sky-300 hover:bg-sky-100'
                                    : 'bg-sky-950/40 text-sky-300 border-sky-800 hover:bg-sky-900'
                                }`}
                                title="Vincular esta atividade à uma Trilha de Estudos RACAN"
                              >
                                <FolderOpen className="w-3.5 h-3.5 text-sky-500" />
                                <span>Vincular à Trilha</span>
                              </button>
                            )}

                            <button
                              onClick={() => setWorkToDelete(work)}
                              className="p-2 rounded-xl text-slate-400 hover:text-red-500 transition cursor-pointer"
                              title="Excluir atividade (requer confirmação)"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Attached materials in this assignment */}
                        {work.materials && work.materials.length > 0 && (
                          <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80 flex flex-wrap gap-2">
                            {work.materials.map((m, idx) => {
                              if (m.driveFile) {
                                return (
                                  <a
                                    key={idx}
                                    href={m.driveFile.driveFile.alternateLink || '#'}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center gap-1.5 hover:underline"
                                  >
                                    <FileText className="w-3 h-3" />
                                    <span>{m.driveFile.driveFile.title}</span>
                                  </a>
                                );
                              }
                              if (m.youtubeVideo) {
                                return (
                                  <a
                                    key={idx}
                                    href={m.youtubeVideo.alternateLink || '#'}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-1.5 hover:underline"
                                  >
                                    <Video className="w-3 h-3" />
                                    <span>{m.youtubeVideo.title}</span>
                                  </a>
                                );
                              }
                              if (m.link) {
                                return (
                                  <a
                                    key={idx}
                                    href={m.link.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center gap-1.5 hover:underline"
                                  >
                                    <LinkIcon className="w-3 h-3" />
                                    <span>{m.link.title || m.link.url}</span>
                                  </a>
                                );
                              }
                              return null;
                            })}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Tab 2: Materials */}
              {courseDetailTab === 'materials' && (
                <div className="space-y-3">
                  {materials.length === 0 ? (
                    <div
                      className={`p-8 rounded-2xl border-2 border-dashed text-center space-y-2 ${
                        isLight ? 'border-slate-300 bg-slate-50' : 'border-slate-800 bg-[#060e1d]'
                      }`}
                    >
                      <BookOpen className="w-8 h-8 text-slate-400 mx-auto" />
                      <div className={`text-sm font-bold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                        Nenhum material de apoio publicado nesta turma
                      </div>
                    </div>
                  ) : (
                    materials.map((mat) => (
                      <div
                        key={mat.id}
                        className={`p-4 rounded-2xl border-2 space-y-2 ${
                          isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#09152a] border-slate-800 shadow-sm'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className={`text-sm font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                              {mat.title}
                            </h4>
                            {mat.description && (
                              <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                                {mat.description}
                              </p>
                            )}
                          </div>
                          {onAddResourceToTrack && (
                            <button
                              onClick={() =>
                                setAttachTargetItem({
                                  title: `[Classroom Material] ${mat.title}`,
                                  url: mat.alternateLink || selectedCourse.alternateLink || '',
                                  type: 'doc',
                                })
                              }
                              className="px-2.5 py-1 rounded-lg text-xs font-bold border border-sky-400/40 text-sky-400 hover:bg-sky-950/30 transition flex items-center gap-1 cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Vincular à Trilha</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Tab 3: Announcements */}
              {courseDetailTab === 'announcements' && (
                <div className="space-y-3">
                  {announcements.length === 0 ? (
                    <div
                      className={`p-8 rounded-2xl border-2 border-dashed text-center space-y-2 ${
                        isLight ? 'border-slate-300 bg-slate-50' : 'border-slate-800 bg-[#060e1d]'
                      }`}
                    >
                      <Users className="w-8 h-8 text-slate-400 mx-auto" />
                      <div className={`text-sm font-bold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                        Nenhum aviso no mural desta turma
                      </div>
                    </div>
                  ) : (
                    announcements.map((ann) => (
                      <div
                        key={ann.id}
                        className={`p-4 rounded-2xl border-2 space-y-2 ${
                          isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#09152a] border-slate-800 shadow-sm'
                        }`}
                      >
                        <p className={`text-xs whitespace-pre-wrap leading-relaxed ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                          {ann.text}
                        </p>
                        {ann.alternateLink && (
                          <div className="pt-1">
                            <a
                              href={ann.alternateLink}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[11px] text-emerald-500 hover:underline flex items-center gap-1 font-semibold"
                            >
                              <span>Ver aviso no Classroom</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          ) : (
            /* Courses List View */
            <div className="space-y-4">
              {/* Filter and Search Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar turma por nome, disciplina ou sala..."
                    className={`w-full pl-10 pr-4 py-2 rounded-xl text-xs sm:text-sm border transition focus:outline-none ${
                      isLight
                        ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-emerald-500'
                        : 'bg-[#050c18] border-slate-700 text-white focus:border-emerald-500'
                    }`}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <div
                    className={`p-1 rounded-xl border flex items-center gap-1 ${
                      isLight ? 'bg-slate-100 border-slate-200' : 'bg-[#060e1d] border-slate-700'
                    }`}
                  >
                    {(['ACTIVE', 'ARCHIVED', 'ALL'] as const).map((st) => (
                      <button
                        key={st}
                        onClick={() => setCourseFilter(st)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition ${
                          courseFilter === st
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : isLight
                            ? 'text-slate-600 hover:text-slate-900'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {st === 'ACTIVE' ? 'Ativas' : st === 'ARCHIVED' ? 'Arquivadas' : 'Todas'}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={loadCourses}
                    disabled={loading}
                    className={`p-2 rounded-xl border transition cursor-pointer ${
                      isLight
                        ? 'bg-white hover:bg-slate-100 border-slate-300 text-slate-600'
                        : 'bg-[#060e1d] hover:bg-slate-800 border-slate-700 text-slate-300'
                    }`}
                    title="Recarregar turmas"
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-500' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Courses Grid */}
              {loading ? (
                <div className="p-16 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                  <RefreshCw className="w-5 h-5 animate-spin text-emerald-500" />
                  <span>Consultando suas turmas no Google Classroom...</span>
                </div>
              ) : filteredCourses.length === 0 ? (
                <div
                  className={`p-10 rounded-3xl border-2 border-dashed text-center space-y-3 ${
                    isLight ? 'border-slate-300 bg-slate-50' : 'border-slate-800 bg-[#060e1d]'
                  }`}
                >
                  <GraduationCap className="w-10 h-10 text-slate-400 mx-auto" />
                  <div className={`text-base font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    Nenhuma turma encontrada
                  </div>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Não encontramos turmas {courseFilter === 'ACTIVE' ? 'ativas' : ''} vinculadas a esta conta Google. Acesse o Google Classroom para criar ou ingressar em uma turma.
                  </p>
                  <a
                    href="https://classroom.google.com"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition"
                  >
                    <span>Ir para classroom.google.com</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredCourses.map((c) => (
                    <div
                      key={c.id}
                      className={`p-5 rounded-2xl border-2 flex flex-col justify-between transition-all hover:scale-[1.01] ${
                        isLight
                          ? 'bg-white border-[#8cb7ea] hover:border-emerald-500 shadow-sm hover:shadow-md'
                          : 'bg-[#09152a] border-slate-800 hover:border-emerald-500/60 shadow-sm'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                              c.courseState === 'ACTIVE'
                                ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30'
                                : 'bg-slate-500/10 text-slate-400 border border-slate-500/30'
                            }`}
                          >
                            {c.courseState === 'ACTIVE' ? 'Ativa' : 'Arquivada'}
                          </span>

                          {c.enrollmentCode && (
                            <button
                              onClick={() => handleCopyCode(c.enrollmentCode!)}
                              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer transition border ${
                                isLight
                                  ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
                                  : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
                              }`}
                              title="Copiar código de inscrição da turma"
                            >
                              {copiedCode === c.enrollmentCode ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-500" />
                                  <span>Copiado</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3 text-slate-400" />
                                  <span>Código: {c.enrollmentCode}</span>
                                </>
                              )}
                            </button>
                          )}
                        </div>

                        <div>
                          <h4 className={`text-base font-extrabold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                            {c.name}
                          </h4>
                          {c.section && (
                            <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                              {c.section}
                            </p>
                          )}
                          {c.descriptionHeading && (
                            <p className="text-xs text-slate-500 line-clamp-2 pt-1">
                              {c.descriptionHeading}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
                        <button
                          onClick={() => handleSelectCourse(c)}
                          className="btn-3d-primary px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs flex-1 justify-center"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Ver Atividades</span>
                          <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                        </button>

                        {c.alternateLink && (
                          <a
                            href={c.alternateLink}
                            target="_blank"
                            rel="noreferrer"
                            className={`p-2 rounded-xl border transition cursor-pointer ${
                              isLight
                                ? 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200'
                                : 'bg-[#060e1d] hover:bg-slate-800 text-slate-400 border-slate-700'
                            }`}
                            title="Abrir no Google Classroom"
                          >
                            <ExternalLink className="w-3.5 h-3.5 text-emerald-500" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div
          className={`px-5 py-3 border-t flex flex-col sm:flex-row items-center justify-between gap-2 shrink-0 text-xs ${
            isLight ? 'bg-slate-50 border-slate-200 text-slate-600' : 'bg-[#0b1b33] border-slate-800 text-slate-400'
          }`}
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>
              Google Classroom conectado diretamente ao ecossistema RACAN de Governança e Estudos.
            </span>
          </div>

          <button
            onClick={onClose}
            className={`px-4 py-1.5 rounded-xl font-bold cursor-pointer transition ${
              isLight ? 'bg-slate-200 hover:bg-slate-300 text-slate-800' : 'bg-slate-800 hover:bg-slate-700 text-white'
            }`}
          >
            Fechar
          </button>
        </div>
      </div>

      {/* CREATE WORK MODAL WITH EXPLICIT CONFIRMATION */}
      {isCreateWorkModalOpen && selectedCourse && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
          <div
            className={`w-full max-w-lg p-6 rounded-3xl border-2 space-y-4 shadow-2xl ${
              isLight ? 'bg-white border-[#8cb7ea]' : 'bg-[#09152a] border-emerald-900/60'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-500" />
                <h3 className={`text-base font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  Nova Atividade · {selectedCourse.name}
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsCreateWorkModalOpen(false);
                  setIsConfirmingCreation(false);
                }}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {!isConfirmingCreation ? (
              <div className="space-y-4">
                <div>
                  <label className={`block text-xs font-bold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    Título da Atividade *
                  </label>
                  <input
                    type="text"
                    value={newWorkTitle}
                    onChange={(e) => setNewWorkTitle(e.target.value)}
                    placeholder="Ex: Exercício de Governança ISO 42001 - Módulo 2"
                    className={`w-full p-2.5 rounded-xl border text-xs sm:text-sm font-semibold focus:outline-none ${
                      isLight
                        ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-emerald-500'
                        : 'bg-[#050c18] border-slate-700 text-white focus:border-emerald-500'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-bold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    Instruções / Descrição
                  </label>
                  <textarea
                    rows={3}
                    value={newWorkDescription}
                    onChange={(e) => setNewWorkDescription(e.target.value)}
                    placeholder="Descreva o objetivo da atividade, leituras recomendadas e critérios de entrega..."
                    className={`w-full p-2.5 rounded-xl border text-xs leading-relaxed focus:outline-none resize-none ${
                      isLight
                        ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-emerald-500'
                        : 'bg-[#050c18] border-slate-700 text-white focus:border-emerald-500'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={`block text-xs font-bold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                      Pontuação Máxima
                    </label>
                    <input
                      type="number"
                      value={newWorkMaxPoints}
                      onChange={(e) => setNewWorkMaxPoints(e.target.value)}
                      className={`w-full p-2.5 rounded-xl border text-xs font-mono font-bold focus:outline-none ${
                        isLight
                          ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-emerald-500'
                          : 'bg-[#050c18] border-slate-700 text-white focus:border-emerald-500'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-xs font-bold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                      Data de Entrega (Opcional)
                    </label>
                    <input
                      type="date"
                      value={newWorkDueDate}
                      onChange={(e) => setNewWorkDueDate(e.target.value)}
                      className={`w-full p-2.5 rounded-xl border text-xs font-bold focus:outline-none ${
                        isLight
                          ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-emerald-500'
                          : 'bg-[#050c18] border-slate-700 text-white focus:border-emerald-500'
                      }`}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsCreateWorkModalOpen(false)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer ${
                      isLight ? 'text-slate-600 hover:bg-slate-100' : 'text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    disabled={!newWorkTitle.trim()}
                    onClick={() => setIsConfirmingCreation(true)}
                    className="btn-3d-primary px-4 py-2 rounded-xl text-xs font-bold cursor-pointer disabled:opacity-50"
                  >
                    Avançar para Publicação →
                  </button>
                </div>
              </div>
            ) : (
              /* Explicit User Confirmation for Workspace Mutation */
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs font-semibold space-y-2">
                  <div className="flex items-center gap-2 font-bold">
                    <AlertCircle className="w-4 h-4" />
                    <span>Confirmação de Publicação no Google Classroom</span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                    Você está prestes a publicar a atividade <strong>"{newWorkTitle}"</strong> na turma <strong>"{selectedCourse.name}"</strong>. Os alunos e participantes da turma receberão a tarefa no mural.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsConfirmingCreation(false)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer ${
                      isLight ? 'text-slate-600 hover:bg-slate-100' : 'text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    Voltar e Editar
                  </button>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={handleCreateAssignment}
                    className="btn-3d-emerald px-4 py-2 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    {loading ? 'Publicando...' : 'Confirmar & Publicar Atividade'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION DIALOG */}
      {workToDelete && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
          <div
            className={`w-full max-w-md p-6 rounded-3xl border-2 space-y-4 shadow-2xl ${
              isLight ? 'bg-white border-red-300' : 'bg-[#09152a] border-red-900/60'
            }`}
          >
            <div className="flex items-center gap-2 text-red-500 font-extrabold text-base">
              <Trash2 className="w-5 h-5" />
              <span>Confirmar Exclusão de Atividade</span>
            </div>

            <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
              Tem certeza que deseja excluir a atividade <strong>"{workToDelete.title}"</strong> da turma do Google Classroom? Esta ação é definitiva no Google Workspace.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setWorkToDelete(null)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer ${
                  isLight ? 'text-slate-600 hover:bg-slate-100' : 'text-slate-400 hover:bg-slate-800'
                }`}
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleDeleteAssignment}
                className="btn-3d-danger px-4 py-2 rounded-xl text-xs font-bold cursor-pointer"
              >
                {loading ? 'Excluindo...' : 'Sim, Excluir Atividade'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ATTACH TO TRACK MODAL */}
      {attachTargetItem && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
          <div
            className={`w-full max-w-md p-6 rounded-3xl border-2 space-y-4 shadow-2xl ${
              isLight ? 'bg-white border-[#8cb7ea]' : 'bg-[#09152a] border-sky-900/60'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-sky-500" />
                <h3 className={`text-base font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  Vincular ao Ecossistema de Trilhas
                </h3>
              </div>
              <button
                onClick={() => setAttachTargetItem(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
              O item <strong>"{attachTargetItem.title}"</strong> será adicionado como material oficial dentro do módulo selecionado.
            </p>

            <div className="space-y-3">
              <div>
                <label className={`block text-xs font-bold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                  Selecione a Trilha:
                </label>
                <select
                  value={selectedTrackId}
                  onChange={(e) => setSelectedTrackId(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border text-xs font-bold focus:outline-none ${
                    isLight
                      ? 'bg-slate-50 border-slate-300 text-slate-900'
                      : 'bg-[#050c18] border-slate-700 text-white'
                  }`}
                >
                  {tracks.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title} ({t.category})
                    </option>
                  ))}
                </select>
              </div>

              {(() => {
                const tr = tracks.find((t) => t.id === selectedTrackId);
                const subs = tr?.subcategories || [];
                return (
                  <div>
                    <label className={`block text-xs font-bold mb-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                      Selecione o Módulo:
                    </label>
                    {subs.length === 0 ? (
                      <div className="text-xs text-amber-500 font-semibold p-2 rounded-lg bg-amber-500/10">
                        Esta trilha não possui módulos criados ainda.
                      </div>
                    ) : (
                      <select
                        value={selectedSubcategoryId}
                        onChange={(e) => setSelectedSubcategoryId(e.target.value)}
                        className={`w-full p-2.5 rounded-xl border text-xs font-bold focus:outline-none ${
                          isLight
                            ? 'bg-slate-50 border-slate-300 text-slate-900'
                            : 'bg-[#050c18] border-slate-700 text-white'
                        }`}
                      >
                        {subs.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.title}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                );
              })()}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setAttachTargetItem(null)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer ${
                  isLight ? 'text-slate-600 hover:bg-slate-100' : 'text-slate-400 hover:bg-slate-800'
                }`}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmAttachToTrack}
                disabled={!selectedSubcategoryId}
                className="btn-3d-primary px-4 py-2 rounded-xl text-xs font-bold cursor-pointer disabled:opacity-50"
              >
                Vincular à Trilha
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
