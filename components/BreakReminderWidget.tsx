'use client';

import { useState, useEffect, useRef } from 'react';
import { useWindowStore } from '@/store/useWindowStore';
import { Play, Pause, RotateCcw, Coffee, Eye, Dumbbell } from 'lucide-react';

interface BreakReminderWidgetProps {
  windowId: string;
}

const BREAK_TYPES = {
  short: { name: 'Descanso Corto', duration: 5 * 60, icon: Coffee, color: 'bg-blue-500' },
  eyes: { name: 'Descanso Visual', duration: 20, icon: Eye, color: 'bg-green-500' },
  stretch: { name: 'Estiramiento', duration: 3 * 60, icon: Dumbbell, color: 'bg-purple-500' },
};

export default function BreakReminderWidget({ windowId }: BreakReminderWidgetProps) {
  const { getWindows, updateWindowContent } = useWindowStore();
  const windows = getWindows();
  const window = windows.find((w) => w.id === windowId);
  
  const content = (window?.content as { 
    workDuration?: number;
    isRunning?: boolean;
    timeRemaining?: number;
    breaksTaken?: number;
  }) || {};
  
  const [workDuration, setWorkDuration] = useState(content.workDuration || 25 * 60); // 25 minutos por defecto
  const [isRunning, setIsRunning] = useState(content.isRunning || false);
  const [timeRemaining, setTimeRemaining] = useState(content.timeRemaining || workDuration);
  const [breaksTaken, setBreaksTaken] = useState(content.breaksTaken || 0);
  const [showBreakOptions, setShowBreakOptions] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    updateWindowContent(windowId, { workDuration, isRunning, timeRemaining, breaksTaken });
  }, [workDuration, isRunning, timeRemaining, breaksTaken, windowId, updateWindowContent]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            setShowBreakOptions(true);
            playNotification();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  const playNotification = () => {
    // Usar una frecuencia de audio simple para notificación
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  const startTimer = () => {
    if (timeRemaining === 0) {
      setTimeRemaining(workDuration);
    }
    setIsRunning(true);
    setShowBreakOptions(false);
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeRemaining(workDuration);
    setShowBreakOptions(false);
  };

  const startBreak = (breakType: keyof typeof BREAK_TYPES) => {
    setTimeRemaining(BREAK_TYPES[breakType].duration);
    setBreaksTaken(breaksTaken + 1);
    setIsRunning(true);
    setShowBreakOptions(false);
  };

  const skipBreak = () => {
    setTimeRemaining(workDuration);
    setShowBreakOptions(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const progress = ((workDuration - timeRemaining) / workDuration) * 100;

  return (
    <div className="h-full flex flex-col bg-gray-800/50 text-white">
      {/* Header */}
      <div className="p-3 border-b border-gray-700/50">
        <h3 className="text-lg font-semibold text-center">Recordatorio de Descansos</h3>
      </div>

      {/* Timer Display */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {showBreakOptions ? (
          <div className="text-center space-y-4 w-full">
            <div className="text-2xl font-bold text-green-400">¡Tiempo de Descansar!</div>
            <p className="text-sm text-gray-400">Elige un tipo de descanso</p>
            
            <div className="space-y-2">
              {Object.entries(BREAK_TYPES).map(([key, breakType]) => {
                const Icon = breakType.icon;
                return (
                  <button
                    key={key}
                    onClick={() => startBreak(key as keyof typeof BREAK_TYPES)}
                    className={`w-full ${breakType.color} hover:opacity-90 rounded-lg p-4 flex items-center gap-3 transition-all`}
                  >
                    <Icon className="w-6 h-6" />
                    <div className="flex-1 text-left">
                      <div className="font-semibold">{breakType.name}</div>
                      <div className="text-sm opacity-80">{Math.floor(breakType.duration / 60)} minutos</div>
                    </div>
                  </button>
                );
              })}
              
              <button
                onClick={skipBreak}
                className="w-full bg-gray-700 hover:bg-gray-600 rounded-lg p-3 text-sm"
              >
                Saltar Descanso
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Circular Progress */}
            <div className="relative w-48 h-48 mb-6">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-gray-700"
                />
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 88}`}
                  strokeDashoffset={`${2 * Math.PI * 88 * (1 - progress / 100)}`}
                  className="text-blue-500 transition-all duration-1000"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-4xl font-mono font-bold">{formatTime(timeRemaining)}</div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex gap-3">
              {!isRunning ? (
                <button
                  onClick={startTimer}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg flex items-center gap-2"
                >
                  <Play className="w-5 h-5" />
                  Iniciar
                </button>
              ) : (
                <button
                  onClick={pauseTimer}
                  className="px-6 py-3 bg-yellow-600 hover:bg-yellow-700 rounded-lg flex items-center gap-2"
                >
                  <Pause className="w-5 h-5" />
                  Pausar
                </button>
              )}
              
              <button
                onClick={resetTimer}
                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center gap-2"
              >
                <RotateCcw className="w-5 h-5" />
                Reiniciar
              </button>
            </div>
          </>
        )}
      </div>

      {/* Settings & Stats */}
      <div className="p-4 border-t border-gray-700/50 space-y-3">
        <div>
          <label className="text-xs text-gray-400 block mb-1">Duración de Trabajo (minutos)</label>
          <input
            type="number"
            min="1"
            max="120"
            value={Math.floor(workDuration / 60)}
            onChange={(e) => {
              const newDuration = parseInt(e.target.value) * 60;
              setWorkDuration(newDuration);
              if (!isRunning) {
                setTimeRemaining(newDuration);
              }
            }}
            disabled={isRunning}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm focus:outline-none focus:border-blue-500 disabled:opacity-50"
          />
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Descansos Tomados:</span>
          <span className="font-bold text-green-400">{breaksTaken}</span>
        </div>
      </div>
    </div>
  );
}
