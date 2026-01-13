'use client';

import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';
import Window from './Window';
import StickyNoteWidget from './StickyNoteWidget';
import TodoListWidget from './TodoListWidget';
import KanbanBoardWidget from './KanbanBoardWidget';
import { useWindowStore } from '@/store/useWindowStore';

export default function WindowManager() {
  const { windows, updateWindowPosition } = useWindowStore();

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
          {window.type === 'sticky-note' && (
            <StickyNoteWidget windowId={window.id} />
          )}
          {window.type === 'todo' && (
            <TodoListWidget windowId={window.id} />
          )}
          {window.type === 'kanban' && (
            <KanbanBoardWidget windowId={window.id} />
          )}
        </Window>
      ))}
    </DndContext>
  );
}

