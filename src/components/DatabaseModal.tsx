import React, { useRef, useState, useEffect } from 'react';
import {
  AppDatabase,
  exportBackupJSON,
  importBackupJSON,
  getDefaultDatabase,
  listAvailableSnapshots,
  restoreSnapshot,
  StorageSnapshotInfo,
} from '../utils/storage';
import { GoogleDriveLogo, GoogleGLogo } from './Logos';
import {
  X,
  Database,
  Download,
  Upload,
  RotateCcw,
  CheckCircle,
  ExternalLink,
  History,
  Cloud,
  CloudUpload,
  CloudDownload,
  AlertTriangle,
  Info,
  Loader2,
} from 'lucide-react';
import { auth, googleSignIn } from '../lib/firebase';

interface DatabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  database: AppDatabase;
  onUpdateDatabase: (db: AppDatabase) => void;
  syncStatus?: 'synced' | 'syncing' | 'error';
  onSyncStatusChange?: (status: 'synced' | 'syncing' | 'error') => void;
}

export const DatabaseModal: React.FC<DatabaseModalProps> = ({
  isOpen,
  onClose,
  database,
  onUpdateDatabase,
  syncStatus = 'synced',
  onSyncStatusChange,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [driveUrlInput, setDriveUrlInput] = useState(database.config.googleDriveUrl || 'https://drive.google.com');
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; isError?: boolean } | null>(null);
  const [snapshots, setSnapshots] = useState<StorageSnapshotInfo[]>([]);
  const [isSyncingCloud, setIsSyncingCloud] = useState(false);
  const [currentUser, setCurrentUser] = useState(auth.currentUser);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSnapshots(listAvailableSnapshots());
      setCurrentUser(auth.currentUser);
    }
  }, [isOpen]);

  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const res = await googleSignIn();
      if (res?.user) {
        setCurrentUser(res.user);
        showFeedback(`Conectado com sucesso como ${res.user.displayName || res.user.email}!`);
      }
    } catch (err: any) {
      showFeedback(`Erro ao entrar com o Google: ${err.message || 'Falha na autenticação'}`, true);
    } finally {
      setIsLoggingIn(false);
    }
  };

  if (!isOpen) return null;

  const showFeedback = (text: string, isError = false) => {
    setFeedbackMsg({ text, isError });
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  const handleExport = () => {
    exportBackupJSON(database);
    showFeedback('Backup JSON exportado com sucesso!');
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const imported = await importBackupJSON(file);
      onUpdateDatabase(imported);
      setSnapshots(listAvailableSnapshots());
      showFeedback('Backup importado com sucesso! Suas certificações e anotações foram restauradas.');
    } catch (err: any) {
      showFeedback(`Falha ao importar backup: ${err.message || 'Arquivo inválido'}`, true);
    }
  };

  const handleRestoreSnapshot = (key: string, label: string) => {
    if (confirm(`Deseja restaurar a versão "${label}"? Seus dados atuais serão salvos em cópia de segurança antes da substituição.`)) {
      try {
        const restored = restoreSnapshot(key);
        onUpdateDatabase(restored);
        setSnapshots(listAvailableSnapshots());
        showFeedback(`Versão "${label}" restaurada com sucesso!`);
      } catch (err: any) {
        showFeedback(`Erro ao restaurar snapshot: ${err.message}`, true);
      }
    }
  };

  const handleCloudUpload = async () => {
    if (!currentUser) {
      showFeedback('Faça login com o Google para sincronizar com a nuvem.', true);
      return;
    }
    setIsSyncingCloud(true);
    onSyncStatusChange?.('syncing');
    try {
      const token = await currentUser.getIdToken();
      const res = await fetch('/api/cloudsql/sync-all', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          certifications: database.certifications,
          notes: database.notes,
          studySessions: database.studySessions,
        }),
      });
      if (!res.ok) throw new Error('Erro na resposta do servidor');
      onSyncStatusChange?.('synced');
      showFeedback('Dados enviados para a Nuvem com sucesso!');
    } catch {
      onSyncStatusChange?.('error');
      showFeedback('Erro ao enviar dados para a nuvem.', true);
    } finally {
      setIsSyncingCloud(false);
    }
  };

  const handleCloudDownload = async () => {
    if (!currentUser) {
      showFeedback('Faça login com o Google para buscar dados na nuvem.', true);
      return;
    }
    setIsSyncingCloud(true);
    onSyncStatusChange?.('syncing');
    try {
      const token = await currentUser.getIdToken();
      const res = await fetch('/api/cloudsql/pull-all', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('Erro na resposta do servidor');
      const data = await res.json();

      if (!data.certifications?.length && !data.notes?.length) {
        onSyncStatusChange?.('synced');
        showFeedback('Nenhum dado salvo encontrado na nuvem para este usuário.');
        return;
      }

      if (
        confirm(
          `Encontradas ${data.certifications?.length || 0} certificações e ${data.notes?.length || 0} anotações na nuvem. Deseja carregar agora?`
        )
      ) {
        const updated: AppDatabase = {
          ...database,
          certifications: data.certifications?.length ? data.certifications : database.certifications,
          notes: data.notes?.length ? data.notes : database.notes,
          studySessions: data.studySessions?.length ? data.studySessions : database.studySessions,
        };
        onUpdateDatabase(updated);
        onSyncStatusChange?.('synced');
        showFeedback('Dados da nuvem restaurados com sucesso!');
      } else {
        onSyncStatusChange?.('synced');
      }
    } catch {
      onSyncStatusChange?.('error');
      showFeedback('Erro ao puxar dados da nuvem.', true);
    } finally {
      setIsSyncingCloud(false);
    }
  };

  const handleSaveDriveUrl = () => {
    const updated: AppDatabase = {
      ...database,
      config: {
        ...database.config,
        googleDriveUrl: driveUrlInput.trim() || 'https://drive.google.com',
      },
    };
    onUpdateDatabase(updated);
    showFeedback('Link do Google Drive atualizado!');
  };

  const handleResetToDefault = () => {
    if (confirm('Restaurar dados para o padrão da trilha? Esta ação removerá alterações locais não exportadas.')) {
      const defaultDb = getDefaultDatabase();
      onUpdateDatabase(defaultDb);
      setSnapshots(listAvailableSnapshots());
      showFeedback('Dados restaurados para o padrão.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900 border border-slate-800 rounded-xl p-5 text-slate-100 text-xs shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Banco de Dados, Snapshots & Recuperação</h3>
            <span className="text-[10px] text-emerald-400 font-mono">Local-First</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white cursor-pointer p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Feedback Alert */}
        {feedbackMsg && (
          <div
            className={`mt-3 p-2.5 rounded font-medium flex items-center gap-2 ${
              feedbackMsg.isError
                ? 'bg-rose-950/80 border border-rose-700 text-rose-300'
                : 'bg-emerald-950/80 border border-emerald-700 text-emerald-300'
            }`}
          >
            {feedbackMsg.isError ? <AlertTriangle className="w-4 h-4 flex-shrink-0" /> : <CheckCircle className="w-4 h-4 flex-shrink-0" />}
            <span>{feedbackMsg.text}</span>
          </div>
        )}

        {/* Home vs Work computer recovery guide */}
        <div className="mt-4 p-3 rounded-lg bg-indigo-950/40 border border-indigo-800/60 text-slate-200 space-y-2">
          <div className="flex items-center gap-1.5 text-indigo-300 font-bold text-[12px]">
            <Info className="w-4 h-4 text-indigo-400 flex-shrink-0" />
            Como recuperar anotações e certificações feitas no computador de casa?
          </div>
          <p className="text-[11px] leading-relaxed text-slate-300">
            Por segurança e privacidade, esta plataforma salva seus dados diretamente no armazenamento local (<code className="text-sky-300 font-mono">localStorage & IndexedDB</code>) do navegador onde você estuda.
            <strong className="text-emerald-300"> Seus dados alterados em casa não foram perdidos</strong>: eles continuam salvos com segurança no navegador do seu computador de casa!
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
            <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
              <span className="font-semibold text-amber-300">Opção 1 (Imediata via Arquivo):</span>
              <ol className="list-decimal list-inside space-y-0.5 mt-1 text-slate-400">
                <li>No computador de casa, clique em <strong>Exportar Backup JSON</strong>.</li>
                <li>Neste computador, clique em <strong>Importar Backup JSON</strong> abaixo.</li>
              </ol>
            </div>
            <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
              <span className="font-semibold text-sky-300">Opção 2 (Nuvem / Conta Google):</span>
              <p className="mt-1 text-slate-400">
                Faça login com a mesma conta Google no topo em ambos os computadores e clique em <strong>Enviar para Nuvem</strong> em casa e <strong>Puxar da Nuvem</strong> aqui.
              </p>
            </div>
          </div>
        </div>

        {/* Database Metrics */}
        {(() => {
          const totalFiles = database.certifications.reduce(
            (acc, c) => acc + (c.externalResources ? c.externalResources.filter((r) => !r.fileData).length : 0),
            0
          ) + database.notes.reduce((acc, n) => acc + (n.attachments?.length || 0), 0);

          const totalLinks = database.certifications.reduce(
            (acc, c) => acc + (c.externalResources ? c.externalResources.filter((r) => !r.fileData).length : 0),
            0
          ) + database.notes.reduce((acc, n) => acc + (n.links?.length || 0), 0);

          const totalSimulados = database.certifications.reduce(
            (acc, c) => acc + (c.simulados ? c.simulados.length : 0),
            0
          );

          return (
            <div className="space-y-2 my-4">
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center font-mono">
                <div className="p-2 rounded bg-slate-950 border border-slate-800">
                  <div className="text-sm font-bold text-sky-400">{database.certifications.length}</div>
                  <div className="text-[10px] text-slate-400 font-sans">Trilhas</div>
                </div>
                <div className="p-2 rounded bg-slate-950 border border-slate-800">
                  <div className="text-sm font-bold text-amber-400">{totalSimulados}</div>
                  <div className="text-[10px] text-slate-400 font-sans">Simulados</div>
                </div>
                <div className="p-2 rounded bg-slate-950 border border-slate-800">
                  <div className="text-sm font-bold text-emerald-400">{totalFiles}</div>
                  <div className="text-[10px] text-slate-400 font-sans">Arquivos</div>
                </div>
                <div className="p-2 rounded bg-slate-950 border border-slate-800">
                  <div className="text-sm font-bold text-teal-400">{totalLinks}</div>
                  <div className="text-[10px] text-slate-400 font-sans">Links</div>
                </div>
                <div className="p-2 rounded bg-slate-950 border border-slate-800">
                  <div className="text-sm font-bold text-indigo-400">{database.notes.length}</div>
                  <div className="text-[10px] text-slate-400 font-sans">Notas</div>
                </div>
                <div className="p-2 rounded bg-slate-950 border border-slate-800">
                  <div className="text-sm font-bold text-purple-400">{database.studySessions.length}</div>
                  <div className="text-[10px] text-slate-400 font-sans">Sessões</div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Primary Backup & Restore File Actions */}
        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-3 mb-4">
          <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            Transferência Manual de Backup (JSON)
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              onClick={handleExport}
              className="btn-3d-emerald py-2 px-3 rounded-lg font-medium flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" /> Exportar Backup JSON
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="btn-3d-primary py-2 px-3 rounded-lg font-medium flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" /> Importar Backup JSON
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleImportFile}
            />
          </div>
        </div>

        {/* Cloud Sync section */}
        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-3 mb-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Cloud className="w-3.5 h-3.5 text-sky-400" />
              Sincronização em Nuvem (PostgreSQL & Google)
            </span>
            <div className="flex items-center gap-2 font-mono">
              {syncStatus === 'syncing' && (
                <span className="text-[10px] text-[#00F0FF] bg-[#00F0FF]/10 px-2 py-0.5 rounded border border-[#00F0FF]/30 flex items-center gap-1">
                  <Loader2 className="w-2.5 h-2.5 animate-spin" /> Sincronizando
                </span>
              )}
              {syncStatus === 'synced' && (
                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle className="w-2.5 h-2.5" /> Sincronizado
                </span>
              )}
              {syncStatus === 'error' && (
                <span className="text-[10px] text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/30 flex items-center gap-1">
                  <AlertTriangle className="w-2.5 h-2.5" /> Erro
                </span>
              )}
              {currentUser ? (
                <span className="text-[10px] text-emerald-400 font-medium">Conectado ({currentUser.email || 'Google'})</span>
              ) : (
                <span className="text-[10px] text-amber-400 font-medium">Desconectado</span>
              )}
            </div>
          </div>
          <p className="text-[11px] text-slate-400">
            Sincronize suas anotações e certificações diretamente pelo banco de dados na nuvem para não depender de arquivos.
          </p>

          {!currentUser ? (
            <div className="p-3 rounded-lg bg-blue-950/40 border border-blue-800/60 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-[11px] text-slate-300">
                Você ainda não está conectado. Entre com sua conta Google para sincronizar suas anotações entre o computador de casa e do trabalho.
              </div>
              <button
                onClick={handleGoogleLogin}
                disabled={isLoggingIn}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-white text-slate-900 hover:bg-slate-100 transition shadow-sm cursor-pointer shrink-0"
              >
                {isLoggingIn ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500" />
                ) : (
                  <GoogleGLogo className="w-3.5 h-3.5" />
                )}
                <span>{isLoggingIn ? 'Conectando...' : 'Entrar com o Google'}</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                onClick={handleCloudUpload}
                disabled={isSyncingCloud}
                className="btn-3d-primary py-2 px-3 rounded-lg font-medium flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <CloudUpload className="w-3.5 h-3.5" /> {isSyncingCloud ? 'Enviando...' : 'Enviar Dados para a Nuvem'}
              </button>

              <button
                onClick={handleCloudDownload}
                disabled={isSyncingCloud}
                className="btn-3d-secondary py-2 px-3 rounded-lg font-medium flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <CloudDownload className="w-3.5 h-3.5" /> {isSyncingCloud ? 'Puxando...' : 'Puxar Dados da Nuvem'}
              </button>
            </div>
          )}
        </div>

        {/* Snapshots Detector */}
        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-amber-400" />
              Snapshots & Versões Salvas neste Navegador ({snapshots.length})
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            Se você já editou nesta mesma máquina anteriormente em outra versão, você pode restaurar qualquer snapshot com 1 clique:
          </p>
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {snapshots.length === 0 ? (
              <div className="text-slate-500 italic p-2 text-center">Nenhum outro snapshot detectado neste navegador.</div>
            ) : (
              snapshots.map((snap) => (
                <div
                  key={snap.key}
                  className={`p-2.5 rounded border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 ${
                    snap.isActive
                      ? 'bg-emerald-950/30 border-emerald-800/80'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-200">{snap.label}</span>
                      {snap.isActive && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-900/60 text-emerald-300 font-mono">
                          Em Uso
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5">
                      <span>{snap.certCount} certificações</span>
                      <span>{snap.notesCount} anotações</span>
                      <span>Atualizado: {snap.lastUpdated.split('T')[0]}</span>
                      {snap.certTitles.length > 0 && (
                        <span className="text-sky-300/80 truncate max-w-xs">
                          Ex: {snap.certTitles.join(', ')}
                        </span>
                      )}
                    </div>
                  </div>

                  {!snap.isActive && (
                    <button
                      onClick={() => handleRestoreSnapshot(snap.key, snap.label)}
                      className="px-2.5 py-1 rounded bg-amber-600/80 hover:bg-amber-600 text-white font-medium text-[11px] cursor-pointer flex-shrink-0"
                    >
                      Restaurar Versão
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Drive config */}
        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2 mb-4">
          <div className="flex items-center justify-between text-slate-300 font-medium">
            <span className="flex items-center gap-1.5">
              <GoogleDriveLogo className="w-3.5 h-3.5" /> Pasta no Google Drive:
            </span>
            <a
              href={database.config.googleDriveUrl}
              target="_blank"
              rel="noreferrer"
              className="text-sky-400 hover:underline flex items-center gap-0.5"
            >
              Testar <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>
          <div className="flex gap-2">
            <input
              type="url"
              value={driveUrlInput}
              onChange={(e) => setDriveUrlInput(e.target.value)}
              placeholder="https://drive.google.com/..."
              className="flex-1 px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded text-slate-200 focus:outline-none"
            />
            <button
              onClick={handleSaveDriveUrl}
              className="btn-3d-primary px-3 py-1 rounded font-semibold cursor-pointer"
            >
              Salvar
            </button>
          </div>
        </div>

        {/* Footer actions */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={handleResetToDefault}
            className="text-slate-500 hover:text-rose-400 transition cursor-pointer flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" /> Zerar Progresso (Padrão)
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-slate-800 text-slate-200 hover:text-white cursor-pointer font-medium"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
