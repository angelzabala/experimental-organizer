'use client';

import { useState, useEffect, useRef } from 'react';
import { useWindowStore } from '@/store/useWindowStore';
import { Play, Pause, RotateCcw, Settings, Check } from 'lucide-react';

interface PomodoroWidgetProps {
  windowId: string;
}

type TimerMode = 'work' | 'shortBreak' | 'longBreak';

export default function PomodoroWidget({ windowId }: PomodoroWidgetProps) {
  const { getWindows, updateWindowContent } = useWindowStore();
  const windows = getWindows();
  const window = windows.find((w) => w.id === windowId);
  
  const content = (window?.content as {
    workTime?: number;
    shortBreakTime?: number;
    longBreakTime?: number;
    completedPomodoros?: number;
  }) || {};

  const [workTime, setWorkTime] = useState(content.workTime || 25);
  const [shortBreakTime, setShortBreakTime] = useState(content.shortBreakTime || 5);
  const [longBreakTime, setLongBreakTime] = useState(content.longBreakTime || 15);
  const [completedPomodoros, setCompletedPomodoros] = useState(content.completedPomodoros || 0);
  
  const [mode, setMode] = useState<TimerMode>('work');
  const [timeLeft, setTimeLeft] = useState(workTime * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    updateWindowContent(windowId, {
      workTime,
      shortBreakTime,
      longBreakTime,
      completedPomodoros,
    });
  }, [workTime, shortBreakTime, longBreakTime, completedPomodoros, windowId, updateWindowContent]);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft]);

  const handleTimerComplete = () => {
    setIsRunning(false);
    
    if (mode === 'work') {
      const newCount = completedPomodoros + 1;
      setCompletedPomodoros(newCount);
      
      // Cada 4 pomodoros, descanso largo
      if (newCount % 4 === 0) {
        setMode('longBreak');
        setTimeLeft(longBreakTime * 60);
      } else {
        setMode('shortBreak');
        setTimeLeft(shortBreakTime * 60);
      }
    } else {
      setMode('work');
      setTimeLeft(workTime * 60);
    }
  };

  const handlePlayPause = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    if (mode === 'work') {
      setTimeLeft(workTime * 60);
    } else if (mode === 'shortBreak') {
      setTimeLeft(shortBreakTime * 60);
    } else {
      setTimeLeft(longBreakTime * 60);
    }
  };

  const handleModeChange = (newMode: TimerMode) => {
    setIsRunning(false);
    setMode(newMode);
    if (newMode === 'work') {
      setTimeLeft(workTime * 60);
    } else if (newMode === 'shortBreak') {
      setTimeLeft(shortBreakTime * 60);
    } else {
      setTimeLeft(longBreakTime * 60);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    let total = workTime * 60;
    if (mode === 'shortBreak') total = shortBreakTime * 60;
    if (mode === 'longBreak') total = longBreakTime * 60;
    return ((total - timeLeft) / total) * 100;
  };

  const getModeColor = () => {
    switch (mode) {
      case 'work': return 'from-red-600 to-red-700';
      case 'shortBreak': return 'from-green-600 to-green-700';
      case 'longBreak': return 'from-blue-600 to-blue-700';
    }
  };

  const getModeLabel = () => {
    switch (mode) {
      case 'work': return 'Trabajo';
      case 'shortBreak': return 'Descanso Corto';
      case 'longBreak': return 'Descanso Largo';
    }
  };

  if (showSettings) {
    return (
      <div className="h-full flex flex-col bg-gray-900/50 p-6">
        <h3 className="text-lg font-semibold text-gray-200 mb-4">Configuración</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tiempo de Trabajo (minutos)
            </label>
            <input
              type="number"
              value={workTime}
              onChange={(e) => setWorkTime(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white focus:outline-none focus:border-blue-500"
              min="1"
              max="60"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Descanso Corto (minutos)
            </label>
            <input
              type="number"
              value={shortBreakTime}
              onChange={(e) => setShortBreakTime(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white focus:outline-none focus:border-blue-500"
              min="1"
              max="30"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Descanso Largo (minutos)
            </label>
            <input
              type="number"
              value={longBreakTime}
              onChange={(e) => setLongBreakTime(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white focus:outline-none focus:border-blue-500"
              min="1"
              max="60"
            />
          </div>

          <button
            onClick={() => {
              setShowSettings(false);
              handleReset();
            }}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>Guardar</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-900/50">
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-6 pb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-400">
            Pomodoros completados: {completedPomodoros}
          </span>
        </div>
        <button
          onClick={() => setShowSettings(true)}
          className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
          aria-label="Configuración"
        >
          <Settings className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* Mode Selector */}
      <div className="flex gap-2 px-6 pb-4">
        <button
          onClick={() => handleModeChange('work')}
          className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            mode === 'work'
              ? 'bg-red-600 text-white'
              : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
          }`}
        >
          Trabajo
        </button>
        <button
          onClick={() => handleModeChange('shortBreak')}
          className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            mode === 'shortBreak'
              ? 'bg-green-600 text-white'
              : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
          }`}
        >
          Descanso
        </button>
        <button
          onClick={() => handleModeChange('longBreak')}
          className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            mode === 'longBreak'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
          }`}
        >
          D. Largo
        </button>
      </div>

      {/* Timer Display */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-6">
        <div className="relative w-64 h-64">
          {/* Progress Circle */}
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="128"
              cy="128"
              r="120"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-gray-700"
            />
            <circle
              cx="128"
              cy="128"
              r="120"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 120}`}
              strokeDashoffset={`${2 * Math.PI * 120 * (1 - getProgress() / 100)}`}
              className={`bg-gradient-to-r ${getModeColor()} transition-all duration-1000`}
              style={{
                stroke: mode === 'work' ? '#dc2626' : mode === 'shortBreak' ? '#16a34a' : '#2563eb'
              }}
            />
          </svg>

          {/* Timer Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-6xl font-bold text-white mb-2">
              {formatTime(timeLeft)}
            </div>
            <div className="text-sm text-gray-400 uppercase tracking-wide">
              {getModeLabel()}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-4 mt-8">
          <button
            onClick={handlePlayPause}
            className={`px-8 py-3 rounded-lg text-white font-medium transition-colors flex items-center gap-2 ${
              isRunning
                ? 'bg-yellow-600 hover:bg-yellow-700'
                : `bg-gradient-to-r ${getModeColor()} hover:opacity-90`
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-5 h-5" />
                <span>Pausar</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                <span>Iniciar</span>
              </>
            )}
          </button>
          <button
            onClick={handleReset}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition-colors flex items-center gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            <span>Reiniciar</span>
          </button>
        </div>
      </div>
    </div>
  );
}


