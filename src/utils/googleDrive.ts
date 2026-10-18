import { getAccessToken } from '../lib/firebase';

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
  iconLink?: string;
  size?: string;
  modifiedTime?: string;
  thumbnailLink?: string;
}

/**
 * List or search files from the user's Google Drive
 */
export async function listDriveFiles(query?: string): Promise<DriveFile[]> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Não autenticado com o Google Drive. Faça login primeiro.');
  }

  let q = "trashed = false";
  if (query && query.trim()) {
    q += ` and name contains '${query.replace(/'/g, "\\'")}'`;
  }

  const fields = 'files(id, name, mimeType, webViewLink, iconLink, size, modifiedTime, thumbnailLink)';
  const url = `https://www.googleapis.com/drive/v3/files?pageSize=30&orderBy=modifiedTime desc&q=${encodeURIComponent(
    q
  )}&fields=${encodeURIComponent(fields)}`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody?.error?.message || `Erro ao listar arquivos do Google Drive: ${res.statusText}`);
  }

  const data = await res.json();
  return data.files || [];
}

/**
 * Create or find a study folder in Google Drive
 */
export async function getOrCreateStudyFolder(folderName = 'Certificações IA - Materiais'): Promise<DriveFile> {
  const token = await getAccessToken();
  if (!token) throw new Error('Não autenticado com o Google Drive');

  // Search if exists
  const q = `mimeType = 'application/vnd.google-apps.folder' and name = '${folderName.replace(/'/g, "\\'")}' and trashed = false`;
  const searchUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id, name, webViewLink)`;

  const searchRes = await fetch(searchUrl, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (searchRes.ok) {
    const searchData = await searchRes.json();
    if (searchData.files && searchData.files.length > 0) {
      return searchData.files[0];
    }
  }

  // Create folder if not found
  const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
    }),
  });

  if (!createRes.ok) {
    const err = await createRes.json().catch(() => ({}));
    throw new Error(err?.error?.message || 'Erro ao criar pasta no Google Drive');
  }

  return await createRes.json();
}

/**
 * Upload text/JSON content (such as a database backup or note) directly to Google Drive
 */
export async function uploadJsonToDrive(
  fileName: string,
  content: string,
  folderId?: string
): Promise<DriveFile> {
  const token = await getAccessToken();
  if (!token) throw new Error('Não autenticado com o Google Drive');

  const metadata: Record<string, any> = {
    name: fileName,
    mimeType: 'application/json',
  };
  if (folderId) {
    metadata.parents = [folderId];
  }

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: application/json\r\n\r\n' +
    content +
    closeDelimiter;

  const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body: multipartRequestBody,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || 'Falha ao salvar no Google Drive');
  }

  return await res.json();
}

/**
 * Delete a file from Google Drive (Requires explicit confirmation beforehand)
 */
export async function deleteDriveFile(fileId: string): Promise<void> {
  const token = await getAccessToken();
  if (!token) throw new Error('Não autenticado com o Google Drive');

  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || 'Falha ao remover arquivo do Google Drive');
  }
}
