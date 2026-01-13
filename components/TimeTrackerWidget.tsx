'use client';

import { useState, useEffect, useRef } from 'react';
import { useWindowStore } from '@/store/useWindowStore';
import { Play, Pause, Square, Clock, Trash2 } from 'lucide-react';

interface TimeSession {
  id: string;
  task: string;
  startTime: number;
  endTime?: number;
  duration: number; // en segundos
  date: string;
}

interface TimeTrackerWidgetProps {
  windowId: string;
}

export default function TimeTrackerWidget({ windowId }: TimeTrackerWidgetProps) {
  const { getWindows, updateWindowContent } = useWindowStore();
  const windows = getWindows();
  const window = windows.find((w) => w.id === windowId);
  
  const content = (window?.content as { 
    sessions?: TimeSession[];
    currentTask?: string;
    startTime?: number;
    isRunning?: boolean;
  }) || {};
  
  const [sessions, setSessions] = useState<TimeSession[]>(content.sessions || []);
  const [currentTask, setCurrentTask] = useState(content.currentTask || '');
  const [isRunning, setIsRunning] = useState(content.isRunning || false);
  const [startTime, setStartTime] = useState<number | null>(content.startTime || null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    updateWindowContent(windowId, { sessions, currentTask, startTime, isRunning });
  }, [sessions, currentTask, startTime, isRunning, windowId, updateWindowContent]);

  useEffect(() => {
    if (isRunning && startTime) {
      intervalRef.current = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
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
  }, [isRunning, startTime]);

  const startTimer = () => {
    if (!currentTask.trim()) return;
    
    const now = Date.now();
    setStartTime(now);
    setIsRunning(true);
    setElapsedTime(0);
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const stopTimer = () => {
    if (startTime && currentTask) {
      const endTime = Date.now();
      const duration = Math.floor((endTime - startTime) / 1000);
      
      const session: TimeSession = {
        id: `session-${Date.now()}`,
        task: currentTask,
        startTime,
        endTime,
        duration,
        date: new Date().toISOString().split('T')[0],
      };
      
      setSessions([session, ...sessions]);
      setCurrentTask('');
      setStartTime(null);
      setIsRunning(false);
      setElapsedTime(0);
    }
  };

  const deleteSession = (sessionId: string) => {
    setSessions(sessions.filter(s => s.id !== sessionId));
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const getTotalTimeToday = () => {
    const today = new Date().toISOString().split('T')[0];
    return sessions
      .filter(s => s.date === today)
      .reduce((acc, s) => acc + s.duration, 0);
  };

  const getTotalTimeWeek = () => {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    return sessions
      .filter(s => s.date >= weekAgo)
      .reduce((acc, s) => acc + s.duration, 0);
  };

  return (
    <div className="h-full flex flex-col bg-gray-800/50 text-white">
      {/* Timer Display */}
      <div className="p-4 border-b border-gray-700/50 text-center">
        <div className="text-4xl font-mono font-bold mb-2">{formatTime(elapsedTime)}</div>
        <input
          type="text"
          placeholder="¿En qué estás trabajando?"
          value={currentTask}
          onChange={(e) => setCurrentTask(e.target.value)}
          disabled={isRunning}
          className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded text-sm focus:outline-none focus:border-blue-500 disabled:opacity-50"
        />
      </div>

      {/* Controls */}
      <div className="p-4 border-b border-gray-700/50 flex gap-2 justify-center">
        {!isRunning && !startTime && (
          <button
            onClick={startTimer}
            disabled={!currentTask.trim()}
            className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded flex items-center gap-2"
          >
            <Play className="w-4 h-4" />
            Iniciar
          </button>
        )}
        
        {isRunning && (
          <button
            onClick={pauseTimer}
            className="px-6 py-2 bg-yellow-600 hover:bg-yellow-700 rounded flex items-center gap-2"
          >
            <Pause className="w-4 h-4" />
            Pausar
          </button>
        )}
        
        {!isRunning && startTime && (
          <button
            onClick={startTimer}
            className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded flex items-center gap-2"
          >
            <Play className="w-4 h-4" />
            Continuar
          </button>
        )}
        
        {startTime && (
          <button
            onClick={stopTimer}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 rounded flex items-center gap-2"
          >
            <Square className="w-4 h-4" />
            Finalizar
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="p-4 border-b border-gray-700/50 grid grid-cols-2 gap-4 text-center">
        <div>
          <div className="text-xs text-gray-400 mb-1">Hoy</div>
          <div className="text-xl font-bold text-blue-400">{formatTime(getTotalTimeToday())}</div>
        </div>
        <div>
          <div className="text-xs text-gray-400 mb-1">Esta Semana</div>
          <div className="text-xl font-bold text-purple-400">{formatTime(getTotalTimeWeek())}</div>
        </div>
      </div>

      {/* Sessions History */}
      <div className="flex-1 overflow-y-auto p-4">
        <h4 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Historial de Sesiones
        </h4>
        
        {sessions.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p className="text-sm">No hay sesiones registradas</p>
          </div>
        ) : (
          <div className="space-y-2">
            {sessions.map(session => (
              <div
                key={session.id}
                className="p-3 bg-gray-700/30 border border-gray-600/30 rounded hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-1">
                  <span className="font-medium text-sm">{session.task}</span>
                  <button
                    onClick={() => deleteSession(session.id)}
                    className="p-1 hover:bg-red-600/50 rounded transition-colors"
                  >
                    <Trash2 className="w-3 h-3 text-gray-400" />
                  </button>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>{formatTime(session.duration)}</span>
                  <span>{session.date}</span>
                </div>
                {session.startTime && session.endTime && (
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(session.startTime).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} - {new Date(session.endTime).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
