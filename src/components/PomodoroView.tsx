import React, { useState, useEffect, useRef } from 'react';
import { Certification, StudySession } from '../types';
import { soundService } from '../utils/audio';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Timer,
  Volume2,
  VolumeX,
  CheckCircle2
} from 'lucide-react';

interface PomodoroViewProps {
  certifications: Certification[];
  selectedCertId?: string;
  onSelectCertId: (id: string) => void;
  onSessionComplete: (session: Omit<StudySession, 'id'>) => void;
  studySessions: StudySession[];
}

export const PomodoroView: React.FC<PomodoroViewProps> = ({
  certifications,
  selectedCertId,
  onSelectCertId,
  onSessionComplete,
  studySessions,
}) => {
  const [mode, setMode] = useState<'focus' | 'short_break' | 'long_break'>('focus');
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [customFocusMin, setCustomFocusMin] = useState<number>(25);

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
    if (timerRef.current) clearInterval(timerRef.current);
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

            if (soundEnabled) {
              soundService.playCompletionChime();
            }

            const selectedCert = certifications.find((c) => c.id === selectedCertId);
            onSessionComplete({
              date: new Date().toISOString(),
              minutes: Math.round(getModeDuration(mode) / 60),
              certificationId: selectedCert?.id,
              certificationTitle: selectedCert?.code || 'Foco Geral',
              mode,
            });

            if (mode === 'focus') {
              setMode('short_break');
              return 5 * 60;
            } else {
              setMode('focus');
              return customFocusMin * 60;
            }
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, mode, customFocusMin, soundEnabled, selectedCertId, certifications, onSessionComplete]);

  const toggleTimer = () => {
    soundService.playClick();
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    soundService.playClick();
    setIsRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeLeft(getModeDuration(mode));
  };

  const skipTimer = () => {
    soundService.playClick();
    setIsRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
    if (mode === 'focus') {
      switchMode('short_break');
    } else {
      switchMode('focus');
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const todaySessions = studySessions.filter((s) => s.date.startsWith(todayStr) && s.mode === 'focus');
  const totalMinutesToday = todaySessions.reduce((acc, s) => acc + s.minutes, 0);

  return (
    <div className="max-w-2xl mx-auto space-y-6 text-center">
      {/* Minimal Timer Box */}
      <div className="box-3d p-8 flex flex-col items-center">
        {/* Mode Buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-lg border border-slate-800 text-xs mb-6">
          <button
            onClick={() => switchMode('focus')}
            className={`px-3 py-1.5 rounded font-medium transition cursor-pointer ${
              mode === 'focus' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Foco ({customFocusMin}m)
          </button>
          <button
            onClick={() => switchMode('short_break')}
            className={`px-3 py-1.5 rounded font-medium transition cursor-pointer ${
              mode === 'short_break' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Pausa (5m)
          </button>
          <button
            onClick={() => switchMode('long_break')}
            className={`px-3 py-1.5 rounded font-medium transition cursor-pointer ${
              mode === 'long_break' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Pausa Longa (15m)
          </button>
        </div>

        {/* Cert Selector */}
        <div className="w-full max-w-xs mb-6 text-xs">
          <select
            value={selectedCertId || ''}
            onChange={(e) => onSelectCertId(e.target.value)}
            className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 focus:outline-none focus:border-sky-500 font-medium"
          >
            <option value="">Foco Geral</option>
            {certifications.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code} · {c.title}
              </option>
            ))}
          </select>
        </div>

        {/* Large Minimalist Digits */}
        <div className="text-7xl font-mono font-bold text-white tracking-tighter my-4 select-none">
          {formatTime(timeLeft)}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 mt-6">
          <button
            onClick={toggleTimer}
            className={`px-8 py-3 rounded-xl font-bold text-sm flex items-center gap-2 cursor-pointer transition ${
              isRunning ? 'btn-3d-amber' : 'btn-3d-primary'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4" /> Pausar
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" /> Iniciar
              </>
            )}
          </button>

          <button
            onClick={resetTimer}
            className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white cursor-pointer"
            title="Resetar"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={skipTimer}
            className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white cursor-pointer"
            title="Pular"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white cursor-pointer"
            title={soundEnabled ? 'Som ativado' : 'Som mudo'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>

        {/* Duration presets */}
        <div className="mt-8 flex items-center gap-2 text-xs text-slate-400">
          <span>Tempo de foco:</span>
          {[15, 25, 45, 60].map((m) => (
            <button
              key={m}
              onClick={() => {
                setCustomFocusMin(m);
                if (mode === 'focus') setTimeLeft(m * 60);
              }}
              className={`px-2 py-0.5 rounded cursor-pointer ${
                customFocusMin === m ? 'bg-sky-600 text-white font-bold' : 'bg-slate-950 text-slate-400'
              }`}
            >
              {m}m
            </button>
          ))}
        </div>
      </div>

      {/* Today Stats */}
      <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
        <span>Hoje: <strong className="text-white">{todaySessions.length} sessões</strong> ({totalMinutesToday} min)</span>
        <span>As sessões de foco alimentam automaticamente a meta semanal de 11h.</span>
      </div>
    </div>
  );
};
