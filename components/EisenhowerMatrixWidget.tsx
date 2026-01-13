'use client';

import { useState, useEffect } from 'react';
import { useWindowStore } from '@/store/useWindowStore';
import { Plus, Trash2, MoveRight } from 'lucide-react';

interface MatrixTask {
  id: string;
  text: string;
  quadrant: 'urgent-important' | 'not-urgent-important' | 'urgent-not-important' | 'not-urgent-not-important';
}

interface EisenhowerMatrixWidgetProps {
  windowId: string;
}

const QUADRANTS = {
  'urgent-important': {
    title: 'Urgente e Importante',
    subtitle: 'Hacer Ahora',
    color: 'bg-red-600/20 border-red-600/50',
    textColor: 'text-red-400',
  },
  'not-urgent-important': {
    title: 'No Urgente e Importante',
    subtitle: 'Programar',
    color: 'bg-blue-600/20 border-blue-600/50',
    textColor: 'text-blue-400',
  },
  'urgent-not-important': {
    title: 'Urgente y No Importante',
    subtitle: 'Delegar',
    color: 'bg-yellow-600/20 border-yellow-600/50',
    textColor: 'text-yellow-400',
  },
  'not-urgent-not-important': {
    title: 'No Urgente y No Importante',
    subtitle: 'Eliminar',
    color: 'bg-gray-600/20 border-gray-600/50',
    textColor: 'text-gray-400',
  },
};

export default function EisenhowerMatrixWidget({ windowId }: EisenhowerMatrixWidgetProps) {
  const { getWindows, updateWindowContent } = useWindowStore();
  const windows = getWindows();
  const window = windows.find((w) => w.id === windowId);
  
  const content = (window?.content as { tasks?: MatrixTask[] }) || {};
  const [tasks, setTasks] = useState<MatrixTask[]>(content.tasks || []);
  const [addingTo, setAddingTo] = useState<string | null>(null);
  const [newTaskText, setNewTaskText] = useState('');

  useEffect(() => {
    updateWindowContent(windowId, { tasks });
  }, [tasks, windowId, updateWindowContent]);

  const addTask = (quadrant: string) => {
    if (newTaskText.trim()) {
      const task: MatrixTask = {
        id: `task-${Date.now()}`,
        text: newTaskText.trim(),
        quadrant: quadrant as MatrixTask['quadrant'],
      };
      setTasks([...tasks, task]);
      setNewTaskText('');
      setAddingTo(null);
    }
  };

  const deleteTask = (taskId: string) => {
    setTasks(tasks.filter(t => t.id !== taskId));
  };

  const moveTask = (taskId: string, newQuadrant: MatrixTask['quadrant']) => {
    setTasks(tasks.map(t => 
      t.id === taskId ? { ...t, quadrant: newQuadrant } : t
    ));
  };

  const getTasksForQuadrant = (quadrant: string) => {
    return tasks.filter(t => t.quadrant === quadrant);
  };

  return (
    <div className="h-full flex flex-col bg-gray-800/50 text-white p-3">
      {/* Header */}
      <div className="mb-3 text-center">
        <h3 className="text-lg font-semibold">Matriz de Eisenhower</h3>
        <p className="text-xs text-gray-400">Prioriza tus tareas</p>
      </div>

      {/* Matrix Grid */}
      <div className="flex-1 grid grid-cols-2 gap-3">
        {Object.entries(QUADRANTS).map(([quadrantKey, quadrantInfo]) => {
          const quadrantTasks = getTasksForQuadrant(quadrantKey);
          const isAdding = addingTo === quadrantKey;

          return (
            <div
              key={quadrantKey}
              className={`${quadrantInfo.color} border-2 rounded-lg p-3 flex flex-col`}
            >
              {/* Quadrant Header */}
              <div className="mb-2">
                <h4 className={`font-semibold text-sm ${quadrantInfo.textColor}`}>
                  {quadrantInfo.title}
                </h4>
                <p className="text-xs text-gray-400">{quadrantInfo.subtitle}</p>
              </div>

              {/* Tasks */}
              <div className="flex-1 overflow-y-auto space-y-2 mb-2">
                {quadrantTasks.map(task => (
                  <div
                    key={task.id}
                    className="bg-gray-800/50 rounded p-2 text-sm group relative"
                  >
                    <p className="pr-6">{task.text}</p>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="absolute top-2 right-2 p-0.5 hover:bg-red-600/50 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3 h-3 text-gray-400" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Task */}
              {isAdding ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Nueva tarea..."
                    value={newTaskText}
                    onChange={(e) => setNewTaskText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') addTask(quadrantKey);
                      if (e.key === 'Escape') {
                        setAddingTo(null);
                        setNewTaskText('');
                      }
                    }}
                    autoFocus
                    className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-xs focus:outline-none focus:border-blue-500"
                  />
                  <div className="flex gap-1">
                    <button
                      onClick={() => addTask(quadrantKey)}
                      className="flex-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs"
                    >
                      Agregar
                    </button>
                    <button
                      onClick={() => {
                        setAddingTo(null);
                        setNewTaskText('');
                      }}
                      className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setAddingTo(quadrantKey)}
                  className="w-full px-3 py-2 bg-gray-700/50 hover:bg-gray-700 rounded flex items-center justify-center gap-2 text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Agregar
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Stats */}
      <div className="mt-3 pt-3 border-t border-gray-700/50 text-center text-xs text-gray-400">
        Total: {tasks.length} tareas
      </div>
    </div>
  );
}
