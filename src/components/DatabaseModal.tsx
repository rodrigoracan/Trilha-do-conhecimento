import React, { useRef, useState } from 'react';
import { AppDatabase, exportBackupJSON, importBackupJSON, getDefaultDatabase } from '../utils/storage';
import { GoogleDriveLogo } from './Logos';
import { X, Database, Download, Upload, RotateCcw, CheckCircle, ExternalLink } from 'lucide-react';

interface DatabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  database: AppDatabase;
  onUpdateDatabase: (db: AppDatabase) => void;
}

export const DatabaseModal: React.FC<DatabaseModalProps> = ({
  isOpen,
  onClose,
  database,
  onUpdateDatabase,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [driveUrlInput, setDriveUrlInput] = useState(database.config.googleDriveUrl || 'https://drive.google.com');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleExport = () => {
    exportBackupJSON(database);
    setFeedbackMsg('Backup JSON exportado!');
    setTimeout(() => setFeedbackMsg(null), 2500);
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const imported = await importBackupJSON(file);
      onUpdateDatabase(imported);
      setFeedbackMsg('Backup importado com sucesso!');
      setTimeout(() => setFeedbackMsg(null), 3000);
    } catch {
      alert('Arquivo inválido.');
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
    setFeedbackMsg('Link do Drive atualizado!');
    setTimeout(() => setFeedbackMsg(null), 2500);
  };

  const handleResetToDefault = () => {
    if (confirm('Restaurar dados para o padrão da trilha?')) {
      const defaultDb = getDefaultDatabase();
      onUpdateDatabase(defaultDb);
      setFeedbackMsg('Dados restaurados.');
      setTimeout(() => setFeedbackMsg(null), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-xl p-5 text-slate-100 text-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Banco de Dados Local</h3>
            <span className="text-[10px] text-emerald-400 font-mono">Sincronizado</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {feedbackMsg && (
          <div className="mt-3 p-2 rounded bg-emerald-950/80 border border-emerald-700 text-emerald-300 font-medium flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5" />
            {feedbackMsg}
          </div>
        )}

        {/* Rich database metrics */}
        {(() => {
          const totalFiles = database.certifications.reduce(
            (acc, c) => acc + (c.externalResources ? c.externalResources.filter((r) => !!r.fileData).length : 0),
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
              <div className="p-2.5 rounded-lg bg-[#0a1224] border border-[#1e2f54] text-[11px] text-slate-300 leading-relaxed">
                <span className="text-emerald-400 font-semibold">● Banco de Dados Conectado: </span>
                Suas trilhas, simulados realizados, arquivos anexados (IndexedDB), links úteis e anotações do bloco de notas são salvos e sincronizados automaticamente no seu navegador.
              </div>

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

        {/* Drive config */}
        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2 mb-4">
          <div className="flex items-center justify-between text-slate-300 font-medium">
            <span className="flex items-center gap-1.5">
              <GoogleDriveLogo className="w-3.5 h-3.5" /> Link da sua pasta no Google Drive:
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

        {/* Backup Actions */}
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleExport}
              className="btn-3d-emerald py-2 rounded-lg font-medium flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" /> Exportar Backup JSON
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="btn-3d-primary py-2 rounded-lg font-medium flex items-center justify-center gap-1.5 cursor-pointer"
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

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
            <button
              onClick={handleResetToDefault}
              className="text-slate-500 hover:text-rose-400 transition cursor-pointer flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> Zerar Progresso (Iniciar do Zero)
            </button>

            <button
              onClick={onClose}
              className="px-3 py-1 rounded bg-slate-800 text-slate-300 hover:text-white cursor-pointer font-medium"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
