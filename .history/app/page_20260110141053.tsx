'use client';

import { useEffect } from 'react';
import WindowManager from '@/components/WindowManager';
import SaveIndicator from '@/components/SaveIndicator';
import Sidebar from '@/components/Sidebar';
import { useWindowStore } from '@/store/useWindowStore';
import { StickyNote, ListTodo, Columns, Globe, Timer } from 'lucide-react';

export default function Home() {
  const { addWindow, workspaces, activeWorkspaceId, addWorkspace, setActiveWorkspace } = useWindowStore();

  // Inicializar un workspace por defecto si no hay ninguno
  useEffect(() => {
    if (workspaces.length === 0) {
      const workspaceId = addWorkspace('Workspace Principal');
      setActiveWorkspace(workspaceId);
    } else if (!activeWorkspaceId && workspaces.length > 0) {
      setActiveWorkspace(workspaces[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaces.length, activeWorkspaceId]);

  const handleAddStickyNote = () => {
    addWindow({
      id: `window-${Date.now()}`,
      title: 'Nota Adhesiva',
      type: 'sticky-note',
      position: { x: 100, y: 100 },
      size: { w: 300, h: 300 },
      isMaximized: false,
      content: { text: '', color: 'yellow' },
    });
  };

  const handleAddTodoList = () => {
    addWindow({
      id: `window-${Date.now()}`,
      title: 'Lista de Pendientes',
      type: 'todo',
      position: { x: 150, y: 150 },
      size: { w: 400, h: 500 },
      isMaximized: false,
      content: { todos: [] },
    });
  };

  const handleAddKanbanBoard = () => {
    addWindow({
      id: `window-${Date.now()}`,
      title: 'Kanban Board',
      type: 'kanban',
      position: { x: 200, y: 100 },
      size: { w: 900, h: 600 },
      isMaximized: false,
      content: {
        columns: [
          { id: 'todo', title: 'Por Hacer', cards: [] },
          { id: 'in-progress', title: 'En Progreso', cards: [] },
          { id: 'done', title: 'Completado', cards: [] },
        ],
      },
    });
  };

  const handleAddIframe = () => {
    const url = prompt('Ingresa la URL del sitio web:');
    if (!url?.trim()) return;

    // Asegurar que la URL tenga protocolo
    let finalUrl = url.trim();
    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      finalUrl = 'https://' + finalUrl;
    }

    addWindow({
      id: `window-${Date.now()}`,
      title: 'Navegador Web',
      type: 'iframe',
      position: { x: 250, y: 150 },
      size: { w: 800, h: 600 },
      isMaximized: false,
      content: { url: finalUrl },
    });
  };

  const handleAddPomodoro = () => {
    addWindow({
      id: `window-${Date.now()}`,
      title: 'Pomodoro Timer',
      type: 'pomodoro',
      position: { x: 300, y: 200 },
      size: { w: 400, h: 550 },
      isMaximized: false,
      content: {
        workTime: 25,
        shortBreakTime: 5,
        longBreakTime: 15,
        completedPomodoros: 0,
      },
    });
  };

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 relative overflow-hidden">
        {/* Desktop Background */}
        <div className="absolute inset-0">
          {/* Puedes agregar un fondo de escritorio aquí */}
        </div>

        {/* Toolbar */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-50">
        <div className="flex gap-3">
          <button
            onClick={handleAddStickyNote}
            className="px-4 py-2 bg-gray-800/80 backdrop-blur-md border border-gray-700/50 rounded-lg text-white hover:bg-gray-700/80 transition-colors flex items-center gap-2 shadow-lg"
          >
            <StickyNote className="w-5 h-5" />
            <span>Nueva Nota</span>
          </button>
          <button
            onClick={handleAddTodoList}
            className="px-4 py-2 bg-gray-800/80 backdrop-blur-md border border-gray-700/50 rounded-lg text-white hover:bg-gray-700/80 transition-colors flex items-center gap-2 shadow-lg"
          >
            <ListTodo className="w-5 h-5" />
            <span>Lista de Pendientes</span>
          </button>
          <button
            onClick={handleAddKanbanBoard}
            className="px-4 py-2 bg-gray-800/80 backdrop-blur-md border border-gray-700/50 rounded-lg text-white hover:bg-gray-700/80 transition-colors flex items-center gap-2 shadow-lg"
          >
            <Columns className="w-5 h-5" />
            <span>Kanban Board</span>
          </button>
          <button
            onClick={handleAddIframe}
            className="px-4 py-2 bg-gray-800/80 backdrop-blur-md border border-gray-700/50 rounded-lg text-white hover:bg-gray-700/80 transition-colors flex items-center gap-2 shadow-lg"
          >
            <Globe className="w-5 h-5" />
            <span>Navegador Web</span>
          </button>
          <button
            onClick={handleAddPomodoro}
            className="px-4 py-2 bg-gray-800/80 backdrop-blur-md border border-gray-700/50 rounded-lg text-white hover:bg-gray-700/80 transition-colors flex items-center gap-2 shadow-lg"
          >
            <Timer className="w-5 h-5" />
            <span>Pomodoro</span>
          </button>
        </div>
        </div>

        {/* Window Manager */}
        <WindowManager />

        {/* Save Indicator */}
        <SaveIndicator />
      </div>
    </main>
  );
}

