'use client';

import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';
import Window from './Window';
import StickyNoteWidget from './StickyNoteWidget';
import TodoListWidget from './TodoListWidget';
import KanbanBoardWidget from './KanbanBoardWidget';
import IframeWidget from './IframeWidget';
import PomodoroWidget from './PomodoroWidget';
import CalendarWidget from './CalendarWidget';
import TimeTrackerWidget from './TimeTrackerWidget';
import HabitTrackerWidget from './HabitTrackerWidget';
import MindMapWidget from './MindMapWidget';
import QuickLinksWidget from './QuickLinksWidget';
import QuickCaptureWidget from './QuickCaptureWidget';
import EisenhowerMatrixWidget from './EisenhowerMatrixWidget';
import CalculatorWidget from './CalculatorWidget';
import BreakReminderWidget from './BreakReminderWidget';
import DiagramWidget from './DiagramWidget';
import { useWindowStore } from '@/store/useWindowStore';

export default function WindowManager() {
  const { getWindows, updateWindowPosition } = useWindowStore();
  const windows = getWindows();

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, delta } = event;
    const window = windows.find((w) => w.id === active.id);
    
    if (window && !window.isMaximized && delta && (delta.x !== 0 || delta.y !== 0)) {
      const newPosition = {
        x: Math.max(0, window.position.x + delta.x),
        y: Math.max(0, window.position.y + delta.y),
      };
      updateWindowPosition(window.id, newPosition);
    }
  };

  return (
    <DndContext onDragEnd={handleDragEnd} modifiers={[restrictToWindowEdges]}>
      {windows.map((window) => (
        <Window key={window.id} window={window}>
          {window.type === 'sticky-note' && <StickyNoteWidget windowId={window.id} />}
          {window.type === 'todo' && <TodoListWidget windowId={window.id} />}
          {window.type === 'kanban' && <KanbanBoardWidget windowId={window.id} />}
          {window.type === 'iframe' && <IframeWidget windowId={window.id} />}
          {window.type === 'pomodoro' && <PomodoroWidget windowId={window.id} />}
          {window.type === 'calendar' && <CalendarWidget windowId={window.id} />}
          {window.type === 'time-tracker' && <TimeTrackerWidget windowId={window.id} />}
          {window.type === 'habit-tracker' && <HabitTrackerWidget windowId={window.id} />}
          {window.type === 'mind-map' && <MindMapWidget windowId={window.id} />}
          {window.type === 'quick-links' && <QuickLinksWidget windowId={window.id} />}
          {window.type === 'quick-capture' && <QuickCaptureWidget windowId={window.id} />}
          {window.type === 'eisenhower-matrix' && <EisenhowerMatrixWidget windowId={window.id} />}
          {window.type === 'calculator' && <CalculatorWidget windowId={window.id} />}
          {window.type === 'break-reminder' && <BreakReminderWidget windowId={window.id} />}
          {window.type === 'diagram' && <DiagramWidget windowId={window.id} />}
        </Window>
      ))}
    </DndContext>
  );
}

