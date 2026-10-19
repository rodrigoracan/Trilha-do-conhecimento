import { getAccessToken } from '../lib/firebase';

export interface ClassroomCourse {
  id: string;
  name: string;
  section?: string;
  descriptionHeading?: string;
  description?: string;
  room?: string;
  ownerId?: string;
  creationTime?: string;
  updateTime?: string;
  enrollmentCode?: string;
  courseState: 'ACTIVE' | 'ARCHIVED' | 'PROVISIONED' | 'DECLINED' | 'SUSPENDED';
  alternateLink?: string;
  teacherGroupEmail?: string;
  courseGroupEmail?: string;
  calendarId?: string;
}

export interface ClassroomMaterialItem {
  driveFile?: {
    driveFile: {
      id: string;
      title: string;
      alternateLink?: string;
      thumbnailUrl?: string;
    };
    shareMode?: string;
  };
  youtubeVideo?: {
    id: string;
    title: string;
    alternateLink?: string;
    thumbnailUrl?: string;
  };
  link?: {
    url: string;
    title?: string;
    thumbnailUrl?: string;
  };
  form?: {
    formUrl: string;
    title?: string;
    responseUrl?: string;
  };
}

export interface ClassroomCourseWork {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  materials?: ClassroomMaterialItem[];
  state: 'PUBLISHED' | 'DRAFT' | 'DELETED';
  alternateLink?: string;
  creationTime?: string;
  updateTime?: string;
  dueDate?: {
    year: number;
    month: number;
    day: number;
  };
  dueTime?: {
    hours?: number;
    minutes?: number;
    seconds?: number;
  };
  maxPoints?: number;
  workType?: 'ASSIGNMENT' | 'SHORT_ANSWER_QUESTION' | 'MULTIPLE_CHOICE_QUESTION';
  submissionModificationMode?: string;
  creatorUserId?: string;
}

export interface ClassroomCourseWorkMaterial {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  materials?: ClassroomMaterialItem[];
  state: 'PUBLISHED' | 'DRAFT' | 'DELETED';
  alternateLink?: string;
  creationTime?: string;
  updateTime?: string;
}

export interface ClassroomAnnouncement {
  id: string;
  courseId: string;
  text: string;
  materials?: ClassroomMaterialItem[];
  state: 'PUBLISHED' | 'DRAFT' | 'DELETED';
  alternateLink?: string;
  creationTime?: string;
  updateTime?: string;
}

/**
 * List all Google Classroom courses accessible to the authenticated user
 */
export async function listClassroomCourses(state: 'ACTIVE' | 'ARCHIVED' | 'ALL' = 'ACTIVE'): Promise<ClassroomCourse[]> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Não autenticado com o Google Classroom. Faça login com sua conta Google primeiro.');
  }

  let url = 'https://classroom.googleapis.com/v1/courses?pageSize=50';
  if (state !== 'ALL') {
    url += `&courseStates=${state}`;
  }

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(
      errorBody?.error?.message || `Erro ao consultar turmas do Google Classroom: ${res.statusText} (${res.status})`
    );
  }

  const data = await res.json();
  return data.courses || [];
}

/**
 * List course work (assignments, questions, quizzes) for a specific course
 */
export async function listClassroomCourseWork(courseId: string): Promise<ClassroomCourseWork[]> {
  const token = await getAccessToken();
  if (!token) throw new Error('Não autenticado com o Google Classroom');

  const url = `https://classroom.googleapis.com/v1/courses/${encodeURIComponent(courseId)}/courseWork?pageSize=50&orderBy=updateTime desc`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(
      errorBody?.error?.message || `Erro ao listar atividades da turma: ${res.statusText} (${res.status})`
    );
  }

  const data = await res.json();
  return data.courseWork || [];
}

/**
 * List reference materials in a course
 */
export async function listClassroomCourseWorkMaterials(courseId: string): Promise<ClassroomCourseWorkMaterial[]> {
  const token = await getAccessToken();
  if (!token) throw new Error('Não autenticado com o Google Classroom');

  const url = `https://classroom.googleapis.com/v1/courses/${encodeURIComponent(courseId)}/courseWorkMaterials?pageSize=50&orderBy=updateTime desc`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(
      errorBody?.error?.message || `Erro ao listar materiais da turma: ${res.statusText} (${res.status})`
    );
  }

  const data = await res.json();
  return data.courseWorkMaterial || [];
}

/**
 * List announcements for a specific course
 */
export async function listClassroomAnnouncements(courseId: string): Promise<ClassroomAnnouncement[]> {
  const token = await getAccessToken();
  if (!token) throw new Error('Não autenticado com o Google Classroom');

  const url = `https://classroom.googleapis.com/v1/courses/${encodeURIComponent(courseId)}/announcements?pageSize=30&orderBy=updateTime desc`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(
      errorBody?.error?.message || `Erro ao listar avisos da turma: ${res.statusText} (${res.status})`
    );
  }

  const data = await res.json();
  return data.announcements || [];
}

/**
 * Create a new assignment or coursework item in a Google Classroom course
 * NOTE: Callers MUST confirm with the user before invoking this mutating action.
 */
export async function createClassroomCourseWork(
  courseId: string,
  courseWork: {
    title: string;
    description?: string;
    workType?: 'ASSIGNMENT' | 'SHORT_ANSWER_QUESTION';
    maxPoints?: number;
    dueDate?: { year: number; month: number; day: number };
    dueTime?: { hours?: number; minutes?: number };
  }
): Promise<ClassroomCourseWork> {
  const token = await getAccessToken();
  if (!token) throw new Error('Não autenticado com o Google Classroom');

  const url = `https://classroom.googleapis.com/v1/courses/${encodeURIComponent(courseId)}/courseWork`;

  const payload: any = {
    title: courseWork.title,
    description: courseWork.description || '',
    workType: courseWork.workType || 'ASSIGNMENT',
    state: 'PUBLISHED',
  };

  if (courseWork.maxPoints !== undefined) {
    payload.maxPoints = courseWork.maxPoints;
  }
  if (courseWork.dueDate) {
    payload.dueDate = courseWork.dueDate;
  }
  if (courseWork.dueTime) {
    payload.dueTime = courseWork.dueTime;
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(
      errorBody?.error?.message || `Erro ao criar atividade no Google Classroom: ${res.statusText} (${res.status})`
    );
  }

  return await res.json();
}

/**
 * Delete a coursework item from a course
 * NOTE: Callers MUST obtain user confirmation prior to calling this method.
 */
export async function deleteClassroomCourseWork(courseId: string, courseWorkId: string): Promise<void> {
  const token = await getAccessToken();
  if (!token) throw new Error('Não autenticado com o Google Classroom');

  const url = `https://classroom.googleapis.com/v1/courses/${encodeURIComponent(courseId)}/courseWork/${encodeURIComponent(courseWorkId)}`;

  const res = await fetch(url, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok && res.status !== 204) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(
      errorBody?.error?.message || `Erro ao excluir atividade do Classroom: ${res.statusText} (${res.status})`
    );
  }
}
