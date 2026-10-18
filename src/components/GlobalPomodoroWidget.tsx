import React, { useState, useEffect, useRef } from 'react';
import { Certification, StudySession } from '../types';
import { soundService } from '../utils/audio';
import {
  Play,
  Pause,
  RotateCcw,
  Timer,
  X,
  Minimize2,
  Maximize2,
  Volume2,
  VolumeX,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

interface GlobalPomodoroWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  certifications: Certification[];
  selectedCertId?: string;
  onSelectCertId: (id: string) => void;
  onSessionComplete: (session: Omit<StudySession, 'id'>) => void;
}

export const GlobalPomodoroWidget: React.FC<GlobalPomodoroWidgetProps> = ({
  isOpen,
  onClose,
  certifications,
  selectedCertId,
  onSelectCertId,
  onSessionComplete,
}) => {
  const [mode, setMode] = useState<'focus' | 'short_break' | 'long_break'>('focus');
  const [customFocusMin, setCustomFocusMin] = useState<number>(25);
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const getModeDuration = (m: 'focus' | 'short_break' | 'long_break'): number => {
    switch (m) {
      case 'focus':
        return customFocusMin * 60;
      case 'short_break':
        return 5 * 60;
      case 'long_break':
        return 15 * 60;
    }
  };

  const switchMode = (newMode: 'focus' | 'short_break' | 'long_break') => {
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(getModeDuration(newMode));
  };

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsRunning(false);
            if (soundEnabled) soundService.playCompletionChime();

            const sessionMinutes = Math.round(getModeDuration(mode) / 60);
            const activeCert = certifications.find((c) => c.id === selectedCertId);

            onSessionComplete({
              date: new Date().toISOString(),
              minutes: sessionMinutes,
              certificationId: selectedCertId || undefined,
              certificationTitle: activeCert?.title || 'Foco Geral',
              mode,
            });

            // Switch to break or focus
            if (mode === 'focus') {
              switchMode('short_break');
            } else {
              switchMode('focus');
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, mode, selectedCertId, customFocusMin, soundEnabled]);

  if (!isOpen) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const togglePlay = () => {
    if (!isRunning && soundEnabled) soundService.playClick();
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(getModeDuration(mode));
    if (soundEnabled) soundService.playClick();
  };

  const activeCert = certifications.find((c) => c.id === selectedCertId);

  // If minimized, render a sleek floating pill in the bottom right corner
  if (isMinimized) {
    return (
      <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 p-2 px-3 rounded-full bg-[#0d1629] border border-amber-500/50 shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-2">
        <button
          onClick={togglePlay}
          className={`w-7 h-7 rounded-full flex items-center justify-center cursor-pointer transition ${
            isRunning
              ? 'bg-amber-500 text-slate-950 shadow-md animate-pulse'
              : 'bg-slate-800 text-amber-400 hover:bg-slate-700'
          }`}
          title={isRunning ? 'Pausar' : 'Iniciar'}
        >
          {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
        </button>

        <span className="font-mono text-xs font-bold text-white tracking-wider">
          {formatTime(timeLeft)}
        </span>

        {activeCert && (
          <span className="text-[10px] font-mono text-amber-300 max-w-[80px] truncate">
            {activeCert.code}
          </span>
        )}

        <button
          onClick={() => setIsMinimized(false)}
          className="text-slate-400 hover:text-white p-1 cursor-pointer"
          title="Expandir relógio"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={onClose}
          className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer"
          title="Fechar Pomodoro"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  // Expanded floating modal widget
  return (
    <div className="fixed bottom-5 right-5 z-50 w-80 bg-[#0f1b33] border border-[#1e2f54] rounded-2xl p-4 text-slate-100 text-xs shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-3 select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-1.5 font-bold text-white">
          <Timer className="w-4 h-4 text-amber-400" />
          <span>Foco Pomodoro</span>
          {isRunning && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping ml-1" />
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-1 text-slate-400 hover:text-white rounded cursor-pointer"
            title={soundEnabled ? 'Som ativado' : 'Som desativado'}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-sky-400" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => setIsMinimized(true)}
            className="p-1 text-slate-400 hover:text-white rounded cursor-pointer"
            title="Minimizar"
          >
            <Minimize2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded cursor-pointer"
            title="Fechar / Desativar"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Mode Switcher */}
      <div className="flex gap-1 p-1 bg-slate-950/80 rounded-lg border border-slate-800 my-2.5">
        <button
          onClick={() => switchMode('focus')}
          className={`flex-1 py-1 rounded text-[11px] font-semibold transition cursor-pointer ${
            mode === 'focus'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Foco
        </button>
        <button
          onClick={() => switchMode('short_break')}
          className={`flex-1 py-1 rounded text-[11px] font-semibold transition cursor-pointer ${
            mode === 'short_break'
              ? 'bg-sky-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Pausa (5m)
        </button>
        <button
          onClick={() => switchMode('long_break')}
          className={`flex-1 py-1 rounded text-[11px] font-semibold transition cursor-pointer ${
            mode === 'long_break'
              ? 'bg-purple-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Pausa (15m)
        </button>
      </div>

      {/* Digital Timer Display */}
      <div className="text-center py-2">
        <div className="text-4xl font-black font-mono tracking-tight text-white drop-shadow-md">
          {formatTime(timeLeft)}
        </div>
        <p className="text-[11px] text-slate-400 mt-1">
          {mode === 'focus' ? 'Sessão de Estudo em Foco' : 'Momento de Descanso'}
        </p>
      </div>

      {/* Select Certification Target */}
      <div className="my-2">
        <label className="text-[10px] text-slate-400 block mb-0.5 font-semibold">
          Trilha em foco:
        </label>
        <select
          value={selectedCertId || ''}
          onChange={(e) => onSelectCertId(e.target.value)}
          className="w-full px-2 py-1 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-xs focus:outline-none font-medium truncate"
        >
          <option value="">Foco Geral / Avulso</option>
          {certifications.map((c) => (
            <option key={c.id} value={c.id}>
              {c.code} · {c.title.split('-')[0].trim()}
            </option>
          ))}
        </select>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-2 pt-1">
        <button
          onClick={handleReset}
          className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
          title="Reiniciar timer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={togglePlay}
          className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-md transition ${
            isRunning
              ? 'bg-amber-600 text-white hover:bg-amber-500'
              : 'btn-3d-amber'
          }`}
        >
          {isRunning ? (
            <>
              <Pause className="w-4 h-4" /> Pausar Foco
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" /> Iniciar Foco
            </>
          )}
        </button>
      </div>
    </div>
  );
};
