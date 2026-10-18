import React, { useState, useEffect } from 'react';
import { GoogleDriveLogo } from './Logos';
import {
  X,
  Search,
  FolderPlus,
  Upload,
  ExternalLink,
  Trash2,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  FileText,
  File,
  HardDrive,
  Link as LinkIcon,
  Plus
} from 'lucide-react';
import {
  listDriveFiles,
  getOrCreateStudyFolder,
  uploadJsonToDrive,
  deleteDriveFile,
  DriveFile
} from '../utils/googleDrive';
import { googleSignIn, logout, auth } from '../lib/firebase';
import { User, onAuthStateChanged } from 'firebase/auth';
import { Certification } from '../types';
import { AppDatabase } from '../utils/storage';

interface GoogleDriveModalProps {
  isOpen: boolean;
  onClose: () => void;
  certifications: Certification[];
  onAddResourceToCert: (certId: string, resource: { title: string; url: string; type: 'doc' | 'link'; description?: string }) => void;
  database: AppDatabase;
}

export const GoogleDriveModal: React.FC<GoogleDriveModalProps> = ({
  isOpen,
  onClose,
  certifications,
  onAddResourceToCert,
  database,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(auth.currentUser);
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [selectedFileForAttach, setSelectedFileForAttach] = useState<DriveFile | null>(null);
  const [targetCertId, setTargetCertId] = useState<string>(certifications[0]?.id || '');
  const [fileToDelete, setFileToDelete] = useState<DriveFile | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user && isOpen) {
        loadFiles();
      }
    });
    return () => unsubscribe();
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && currentUser) {
      loadFiles();
    }
  }, [isOpen, currentUser]);

  const loadFiles = async (query = searchQuery) => {
    setLoading(true);
    setStatusMessage(null);
    try {
      const driveFiles = await listDriveFiles(query);
      setFiles(driveFiles);
    } catch (err: any) {
      console.error('Error fetching drive files:', err);
      setStatusMessage({ type: 'error', text: err.message || 'Falha ao carregar arquivos do Drive' });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async () => {
    setLoading(true);
    setStatusMessage(null);
    try {
      const result = await googleSignIn();
      if (result) {
        setCurrentUser(result.user);
        setStatusMessage({ type: 'success', text: `Conectado como ${result.user.email}` });
        await loadFiles();
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Falha ao autenticar com o Google' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setCurrentUser(null);
    setFiles([]);
    setStatusMessage(null);
  };

  const handleCreateFolder = async () => {
    setLoading(true);
    setStatusMessage(null);
    try {
      const folder = await getOrCreateStudyFolder();
      setStatusMessage({ type: 'success', text: `Pasta "${folder.name}" criada/localizada com sucesso no seu Drive!` });
      await loadFiles();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Erro ao criar pasta' });
    } finally {
      setLoading(false);
    }
  };

  const handleBackupToDrive = async () => {
    setLoading(true);
    setStatusMessage(null);
    try {
      const backupJson = JSON.stringify(database, null, 2);
      const fileName = `Backup_Certificacoes_IA_${new Date().toISOString().split('T')[0]}.json`;
      const uploaded = await uploadJsonToDrive(fileName, backupJson);
      setStatusMessage({
        type: 'success',
        text: `Backup salvo no seu Google Drive com sucesso como "${uploaded.name}"!`,
      });
      await loadFiles();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Erro ao fazer backup no Drive' });
    } finally {
      setLoading(false);
    }
  };

  const confirmDeleteFile = async () => {
    if (!fileToDelete) return;
    setLoading(true);
    setStatusMessage(null);
    try {
      await deleteDriveFile(fileToDelete.id);
      setStatusMessage({ type: 'success', text: `Arquivo "${fileToDelete.name}" removido do Drive.` });
      setFiles((prev) => prev.filter((f) => f.id !== fileToDelete.id));
      setFileToDelete(null);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Erro ao remover arquivo' });
    } finally {
      setLoading(false);
    }
  };

  const handleAttachToCert = () => {
    if (!selectedFileForAttach || !targetCertId) return;
    const cert = certifications.find((c) => c.id === targetCertId);
    if (!cert) return;

    onAddResourceToCert(targetCertId, {
      title: selectedFileForAttach.name,
      url: selectedFileForAttach.webViewLink || `https://drive.google.com/file/d/${selectedFileForAttach.id}/view`,
      type: 'doc',
      description: `Vinculado do Google Drive (${selectedFileForAttach.size ? Math.round(Number(selectedFileForAttach.size) / 1024) + ' KB' : 'Arquivo'})`,
    });

    setStatusMessage({
      type: 'success',
      text: `Arquivo "${selectedFileForAttach.name}" vinculado à trilha "${cert.title}" com sucesso!`,
    });
    setSelectedFileForAttach(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-3xl rounded-xl bg-[#0f1b33] border border-[#1e2f54] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0d172b]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-sky-500/10 border border-sky-400/20 flex items-center justify-center">
              <GoogleDriveLogo className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Google Drive · Central de Materiais & Simulados
              </h2>
              <p className="text-xs text-slate-400">
                Acesse seus PDFs, apostilas, resumos e faça backup em nuvem diretamente no seu Drive
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Status Message Banner */}
          {statusMessage && (
            <div
              className={`p-3 rounded-lg flex items-center gap-2 text-xs font-medium ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-300'
                  : 'bg-rose-950/60 border border-rose-500/40 text-rose-300'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Auth Bar */}
          {!currentUser ? (
            <div className="p-6 rounded-xl bg-slate-900/90 border border-slate-800 text-center space-y-4">
              <div className="w-12 h-12 mx-auto rounded-full bg-sky-500/10 border border-sky-400/30 flex items-center justify-center">
                <GoogleDriveLogo className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Conecte sua Conta Google</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                  Permite explorar seus arquivos de estudo do Google Drive, salvar resumos, anexar apostilas em PDF diretamente nas trilhas e realizar backups automáticos com permissão da sua conta.
                </p>
              </div>

              {/* Official Google Sign-In Material Button */}
              <div className="flex justify-center pt-2">
                <button
                  onClick={handleSignIn}
                  disabled={loading}
                  className="inline-flex items-center gap-3 px-5 py-2.5 rounded-lg bg-white text-slate-800 hover:bg-slate-100 font-medium text-sm transition shadow cursor-pointer disabled:opacity-50"
                >
                  <svg className="w-4 h-4" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                  </svg>
                  <span>{loading ? 'Conectando...' : 'Sign in with Google'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* User Account and Quick Action Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 font-bold text-xs">
                    {currentUser.email ? currentUser.email[0].toUpperCase() : 'G'}
                  </div>
                  <div>
                    <div className="font-semibold text-white truncate max-w-xs">{currentUser.email}</div>
                    <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Google Drive Conectado
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleCreateFolder}
                    disabled={loading}
                    className="btn-3d-dark px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs text-sky-300 hover:text-white cursor-pointer"
                    title="Criar pasta dedicada no Google Drive"
                  >
                    <FolderPlus className="w-3.5 h-3.5 text-sky-400" />
                    <span>Criar Pasta de Estudos</span>
                  </button>

                  <button
                    onClick={handleBackupToDrive}
                    disabled={loading}
                    className="btn-3d-dark px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs text-emerald-300 hover:text-white cursor-pointer"
                    title="Salvar backup completo de todas as trilhas e notas no Google Drive"
                  >
                    <Upload className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Backup no Drive</span>
                  </button>

                  <button
                    onClick={handleLogout}
                    className="text-slate-500 hover:text-rose-400 px-2 py-1 transition cursor-pointer"
                  >
                    Desconectar
                  </button>
                </div>
              </div>

              {/* Search Bar */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && loadFiles(searchQuery)}
                    placeholder="Buscar arquivos no Google Drive (ex: ISO, Security+, Guia, Simulado)..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  />
                </div>
                <button
                  onClick={() => loadFiles(searchQuery)}
                  disabled={loading}
                  className="btn-3d-dark px-3 py-2 rounded-lg text-xs font-semibold text-slate-200 hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  <span>Atualizar</span>
                </button>
              </div>

              {/* Attach File to Certification Track Form */}
              {selectedFileForAttach && (
                <div className="p-3.5 rounded-lg bg-sky-950/40 border border-sky-500/40 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sky-300 flex items-center gap-1.5">
                      <LinkIcon className="w-3.5 h-3.5" />
                      Vincular "{selectedFileForAttach.name}" a uma Trilha:
                    </span>
                    <button
                      onClick={() => setSelectedFileForAttach(null)}
                      className="text-slate-400 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={targetCertId}
                      onChange={(e) => setTargetCertId(e.target.value)}
                      className="flex-1 bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white"
                    >
                      {certifications.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.code} · {c.title}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={handleAttachToCert}
                      className="btn-3d-sky px-3 py-1.5 rounded text-xs font-semibold cursor-pointer"
                    >
                      Confirmar Vínculo
                    </button>
                  </div>
                </div>
              )}

              {/* File List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                  <span>Arquivos encontrados ({files.length})</span>
                  <a
                    href="https://drive.google.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-sky-400 hover:underline flex items-center gap-1"
                  >
                    <span>Ir para drive.google.com</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                {loading ? (
                  <div className="py-12 text-center text-slate-500 text-xs flex flex-col items-center gap-2">
                    <RefreshCw className="w-5 h-5 animate-spin text-sky-400" />
                    <span>Carregando arquivos do Google Drive...</span>
                  </div>
                ) : files.length === 0 ? (
                  <div className="py-10 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-lg space-y-2">
                    <File className="w-8 h-8 mx-auto text-slate-600" />
                    <p>Nenhum arquivo encontrado com esse filtro.</p>
                    <button
                      onClick={handleCreateFolder}
                      className="text-sky-400 hover:underline font-semibold cursor-pointer"
                    >
                      Criar pasta "Certificações IA" no seu Drive agora
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                    {files.map((file) => {
                      const isFolder = file.mimeType === 'application/vnd.google-apps.folder';
                      return (
                        <div
                          key={file.id}
                          className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition text-xs"
                        >
                          <div className="flex items-center gap-2.5 truncate flex-1 min-w-0">
                            {isFolder ? (
                              <FolderPlus className="w-4 h-4 text-amber-400 shrink-0" />
                            ) : file.mimeType.includes('pdf') ? (
                              <FileText className="w-4 h-4 text-rose-400 shrink-0" />
                            ) : (
                              <File className="w-4 h-4 text-sky-400 shrink-0" />
                            )}
                            <div className="truncate min-w-0">
                              <p className="font-medium text-slate-200 truncate">{file.name}</p>
                              <p className="text-[10px] text-slate-500 font-mono">
                                {file.modifiedTime ? new Date(file.modifiedTime).toLocaleDateString() : ''}
                                {file.size ? ` · ${Math.round(Number(file.size) / 1024)} KB` : ''}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0 ml-2">
                            {/* Attach to cert button */}
                            {!isFolder && (
                              <button
                                onClick={() => setSelectedFileForAttach(file)}
                                className="btn-3d-dark px-2 py-1 rounded text-[11px] font-medium text-sky-300 hover:text-white flex items-center gap-1 cursor-pointer"
                                title="Anexar arquivo a uma Trilha"
                              >
                                <Plus className="w-3 h-3 text-sky-400" />
                                <span>Vincular à Trilha</span>
                              </button>
                            )}

                            {/* Open in Drive link */}
                            <a
                              href={file.webViewLink || `https://drive.google.com/file/d/${file.id}/view`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
                              title="Abrir no Google Drive"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>

                            {/* Safe Delete with Confirmation */}
                            <button
                              onClick={() => setFileToDelete(file)}
                              className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition cursor-pointer"
                              title="Remover do Google Drive"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Mandatory User Confirmation Dialog for Destructive Operations */}
        {fileToDelete && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm animate-fade-in">
            <div className="bg-[#121e38] border border-rose-500/50 rounded-xl p-5 max-w-md w-full shadow-2xl space-y-3">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>Confirmar Exclusão no Google Drive</span>
              </div>
              <p className="text-xs text-slate-300">
                Tem certeza de que deseja excluir o arquivo <strong>"{fileToDelete.name}"</strong> do seu Google Drive? Esta ação modificará seus arquivos na nuvem.
              </p>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setFileToDelete(null)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDeleteFile}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white cursor-pointer"
                >
                  Confirmar e Excluir
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-[#0d172b] flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5 text-[11px] font-mono">
            <HardDrive className="w-3.5 h-3.5 text-sky-400" />
            <span>Sincronização Direta Google Workspace</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
