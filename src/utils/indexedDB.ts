import { ExternalResource } from '../types';

const DB_NAME = 'TrilhaCertificacoesIADB_v3';
const DB_VERSION = 1;
const STORE_FILES = 'attached_files';

export function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB não suportado neste navegador'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_FILES)) {
        const store = db.createObjectStore(STORE_FILES, { keyPath: 'id' });
        store.createIndex('certId', 'certId', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Saves an uploaded file (PDF, DOCX, TXT, Image, etc.) into IndexedDB
 */
export async function saveFileToIndexedDB(
  file: File,
  certId: string,
  description?: string
): Promise<ExternalResource> {
  const db = await openDB();

  // Convert to Base64 Data URL for persistent storage & instant download/open
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

  const id = `file-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const isPdf = file.type === 'application/pdf' || file.name.endsWith('.pdf');
  const resourceType = isPdf ? 'pdf' : 'file';

  const resource: ExternalResource = {
    id,
    title: file.name,
    fileName: file.name,
    fileSize: formatSize(file.size),
    fileType: file.type || 'application/octet-stream',
    fileData: dataUrl,
    type: resourceType,
    description: description || undefined,
    addedAt: new Date().toISOString().split('T')[0],
  };

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_FILES], 'readwrite');
    const store = transaction.objectStore(STORE_FILES);
    const record = { ...resource, certId };
    const req = store.put(record);

    req.onsuccess = () => resolve(resource);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Downloads / opens an attached file stored in IndexedDB
 */
export function downloadFile(resource: ExternalResource): void {
  if (!resource.fileData) return;

  const link = document.createElement('a');
  link.href = resource.fileData;
  link.download = resource.fileName || resource.title || 'documento';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Deletes a file from IndexedDB
 */
export async function deleteFileFromIndexedDB(id: string): Promise<void> {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_FILES], 'readwrite');
    const store = transaction.objectStore(STORE_FILES);
    store.delete(id);
  } catch (err) {
    console.warn('Erro ao remover arquivo do IndexedDB:', err);
  }
}
