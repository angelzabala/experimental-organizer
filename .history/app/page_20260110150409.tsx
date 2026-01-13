'use client';

import WindowManager from '@/components/WindowManager';
import SaveIndicator from '@/components/SaveIndicator';
import Sidebar from '@/components/Sidebar';
import { useWindowStore } from '@/store/useWindowStore';
import { 
  StickyNote, 
  ListTodo, 
  Columns, 
  Globe, 
  Timer,
  Calendar as CalendarIcon,
  Clock,
  Target,
  Brain,
  Link2,
  Lightbulb,
  Grid3x3,
  Calculator as CalculatorIcon,
  Coffee,
  PenTool,
  Sheet
} from 'lucide-react';

export default function Home() {
  const { addWindow } = useWindowStore();

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

  const handleAddCalendar = () => {
    addWindow({
      id: `window-${Date.now()}`,
      title: 'Calendario',
      type: 'calendar',
      position: { x: 150, y: 100 },
      size: { w: 600, h: 700 },
      isMaximized: false,
      content: { events: [] },
    });
  };

  const handleAddTimeTracker = () => {
    addWindow({
      id: `window-${Date.now()}`,
      title: 'Time Tracker',
      type: 'time-tracker',
      position: { x: 200, y: 150 },
      size: { w: 400, h: 600 },
      isMaximized: false,
      content: { sessions: [] },
    });
  };

  const handleAddHabitTracker = () => {
    addWindow({
      id: `window-${Date.now()}`,
      title: 'Habit Tracker',
      type: 'habit-tracker',
      position: { x: 250, y: 100 },
      size: { w: 500, h: 600 },
      isMaximized: false,
      content: { habits: [] },
    });
  };

  const handleAddMindMap = () => {
    addWindow({
      id: `window-${Date.now()}`,
      title: 'Mapa Mental',
      type: 'mind-map',
      position: { x: 150, y: 100 },
      size: { w: 700, h: 500 },
      isMaximized: false,
      content: { nodes: [] },
    });
  };

  const handleAddQuickLinks = () => {
    addWindow({
      id: `window-${Date.now()}`,
      title: 'Enlaces Rápidos',
      type: 'quick-links',
      position: { x: 200, y: 150 },
      size: { w: 400, h: 500 },
      isMaximized: false,
      content: { links: [] },
    });
  };

  const handleAddQuickCapture = () => {
    addWindow({
      id: `window-${Date.now()}`,
      title: 'Quick Capture',
      type: 'quick-capture',
      position: { x: 250, y: 100 },
      size: { w: 400, h: 500 },
      isMaximized: false,
      content: { items: [] },
    });
  };

  const handleAddEisenhowerMatrix = () => {
    addWindow({
      id: `window-${Date.now()}`,
      title: 'Matriz de Eisenhower',
      type: 'eisenhower-matrix',
      position: { x: 150, y: 100 },
      size: { w: 700, h: 600 },
      isMaximized: false,
      content: { tasks: [] },
    });
  };

  const handleAddCalculator = () => {
    addWindow({
      id: `window-${Date.now()}`,
      title: 'Calculadora',
      type: 'calculator',
      position: { x: 300, y: 200 },
      size: { w: 350, h: 500 },
      isMaximized: false,
      content: { history: [] },
    });
  };

  const handleAddBreakReminder = () => {
    addWindow({
      id: `window-${Date.now()}`,
      title: 'Break Reminder',
      type: 'break-reminder',
      position: { x: 200, y: 150 },
      size: { w: 400, h: 550 },
      isMaximized: false,
      content: {},
    });
  };

  const handleAddDiagram = () => {
    addWindow({
      id: `window-${Date.now()}`,
      title: 'Diagrama',
      type: 'diagram',
      position: { x: 150, y: 100 },
      size: { w: 700, h: 600 },
      isMaximized: false,
      content: { shapes: [] },
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
          <div className="flex gap-2 flex-wrap justify-center max-w-4xl">
            <button
              onClick={handleAddStickyNote}
              className="px-3 py-2 bg-gray-800/80 backdrop-blur-md border border-gray-700/50 rounded-lg text-white hover:bg-gray-700/80 transition-colors flex items-center gap-2 shadow-lg text-sm"
            >
              <StickyNote className="w-4 h-4" />
              <span>Nota</span>
            </button>
            <button
              onClick={handleAddTodoList}
              className="px-3 py-2 bg-gray-800/80 backdrop-blur-md border border-gray-700/50 rounded-lg text-white hover:bg-gray-700/80 transition-colors flex items-center gap-2 shadow-lg text-sm"
            >
              <ListTodo className="w-4 h-4" />
              <span>Todo</span>
            </button>
            <button
              onClick={handleAddKanbanBoard}
              className="px-3 py-2 bg-gray-800/80 backdrop-blur-md border border-gray-700/50 rounded-lg text-white hover:bg-gray-700/80 transition-colors flex items-center gap-2 shadow-lg text-sm"
            >
              <Columns className="w-4 h-4" />
              <span>Kanban</span>
            </button>
            <button
              onClick={handleAddCalendar}
              className="px-3 py-2 bg-gray-800/80 backdrop-blur-md border border-gray-700/50 rounded-lg text-white hover:bg-gray-700/80 transition-colors flex items-center gap-2 shadow-lg text-sm"
            >
              <CalendarIcon className="w-4 h-4" />
              <span>Calendario</span>
            </button>
            <button
              onClick={handleAddTimeTracker}
              className="px-3 py-2 bg-gray-800/80 backdrop-blur-md border border-gray-700/50 rounded-lg text-white hover:bg-gray-700/80 transition-colors flex items-center gap-2 shadow-lg text-sm"
            >
              <Clock className="w-4 h-4" />
              <span>Tracker</span>
            </button>
            <button
              onClick={handleAddHabitTracker}
              className="px-3 py-2 bg-gray-800/80 backdrop-blur-md border border-gray-700/50 rounded-lg text-white hover:bg-gray-700/80 transition-colors flex items-center gap-2 shadow-lg text-sm"
            >
              <Target className="w-4 h-4" />
              <span>Hábitos</span>
            </button>
            <button
              onClick={handleAddMindMap}
              className="px-3 py-2 bg-gray-800/80 backdrop-blur-md border border-gray-700/50 rounded-lg text-white hover:bg-gray-700/80 transition-colors flex items-center gap-2 shadow-lg text-sm"
            >
              <Brain className="w-4 h-4" />
              <span>Mapa</span>
            </button>
            <button
              onClick={handleAddQuickLinks}
              className="px-3 py-2 bg-gray-800/80 backdrop-blur-md border border-gray-700/50 rounded-lg text-white hover:bg-gray-700/80 transition-colors flex items-center gap-2 shadow-lg text-sm"
            >
              <Link2 className="w-4 h-4" />
              <span>Links</span>
            </button>
            <button
              onClick={handleAddQuickCapture}
              className="px-3 py-2 bg-gray-800/80 backdrop-blur-md border border-gray-700/50 rounded-lg text-white hover:bg-gray-700/80 transition-colors flex items-center gap-2 shadow-lg text-sm"
            >
              <Lightbulb className="w-4 h-4" />
              <span>Capture</span>
            </button>
            <button
              onClick={handleAddEisenhowerMatrix}
              className="px-3 py-2 bg-gray-800/80 backdrop-blur-md border border-gray-700/50 rounded-lg text-white hover:bg-gray-700/80 transition-colors flex items-center gap-2 shadow-lg text-sm"
            >
              <Grid3x3 className="w-4 h-4" />
              <span>Matriz</span>
            </button>
            <button
              onClick={handleAddCalculator}
              className="px-3 py-2 bg-gray-800/80 backdrop-blur-md border border-gray-700/50 rounded-lg text-white hover:bg-gray-700/80 transition-colors flex items-center gap-2 shadow-lg text-sm"
            >
              <CalculatorIcon className="w-4 h-4" />
              <span>Calc</span>
            </button>
            <button
              onClick={handleAddBreakReminder}
              className="px-3 py-2 bg-gray-800/80 backdrop-blur-md border border-gray-700/50 rounded-lg text-white hover:bg-gray-700/80 transition-colors flex items-center gap-2 shadow-lg text-sm"
            >
              <Coffee className="w-4 h-4" />
              <span>Break</span>
            </button>
            <button
              onClick={handleAddDiagram}
              className="px-3 py-2 bg-gray-800/80 backdrop-blur-md border border-gray-700/50 rounded-lg text-white hover:bg-gray-700/80 transition-colors flex items-center gap-2 shadow-lg text-sm"
            >
              <PenTool className="w-4 h-4" />
              <span>Diagrama</span>
            </button>
            <button
              onClick={handleAddPomodoro}
              className="px-3 py-2 bg-gray-800/80 backdrop-blur-md border border-gray-700/50 rounded-lg text-white hover:bg-gray-700/80 transition-colors flex items-center gap-2 shadow-lg text-sm"
            >
              <Timer className="w-4 h-4" />
              <span>Pomodoro</span>
            </button>
            <button
              onClick={handleAddIframe}
              className="px-3 py-2 bg-gray-800/80 backdrop-blur-md border border-gray-700/50 rounded-lg text-white hover:bg-gray-700/80 transition-colors flex items-center gap-2 shadow-lg text-sm"
            >
              <Globe className="w-4 h-4" />
              <span>Web</span>
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

