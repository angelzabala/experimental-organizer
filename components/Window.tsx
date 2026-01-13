'use client';

import { useDraggable } from '@dnd-kit/core';
import { X, Maximize2, Minimize2 } from 'lucide-react';
import { useWindowStore } from '@/store/useWindowStore';

interface WindowProps {
  window: {
    id: string;
    title: string;
    position: { x: number; y: number };
    size: { w: number; h: number };
    isMaximized: boolean;
    zIndex: number;
  };
  children: React.ReactNode;
}

export default function Window({ window, children }: WindowProps) {
  const { focusWindow, toggleMaximize, closeWindow, updateWindowSize } = useWindowStore();

  const handleResizeStart = (e: React.MouseEvent) => {
    if (window.isMaximized) return;
    e.preventDefault();
    e.stopPropagation();

    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = window.size.w;
    const startHeight = window.size.h;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;

      const newWidth = Math.max(200, startWidth + deltaX);
      const newHeight = Math.max(150, startHeight + deltaY);

      updateWindowSize(window.id, { w: newWidth, h: newHeight });
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: window.id,
    disabled: window.isMaximized,
  });

  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    left: window.isMaximized ? 0 : `${window.position.x}px`,
    top: window.isMaximized ? 0 : `${window.position.y}px`,
    width: window.isMaximized ? '100%' : `${window.size.w}px`,
    height: window.isMaximized ? '100%' : `${window.size.h}px`,
    zIndex: window.zIndex,
  };

  const handleClick = () => {
    focusWindow(window.id);
  };

  const handleMaximize = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleMaximize(window.id);
    focusWindow(window.id);
  };

  const handleClose = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    closeWindow(window.id);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`absolute bg-gray-900/80 backdrop-blur-md border border-gray-700/50 rounded-lg shadow-2xl flex flex-col ${
        isDragging ? 'opacity-90' : 'opacity-100'
      }`}
      onClick={handleClick}
    >
      {/* Title Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800/50 border-b border-gray-700/50 rounded-t-lg select-none">
        <span
          {...listeners}
          {...attributes}
          className="flex-1 text-sm font-medium text-gray-200 cursor-move"
        >
          {window.title}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={handleMaximize}
            className="p-1 hover:bg-gray-700/50 rounded transition-colors"
            aria-label={window.isMaximized ? 'Restaurar' : 'Maximizar'}
            type="button"
          >
            {window.isMaximized ? (
              <Minimize2 className="w-4 h-4 text-gray-300" />
            ) : (
              <Maximize2 className="w-4 h-4 text-gray-300" />
            )}
          </button>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-red-600/50 rounded transition-colors"
            aria-label="Cerrar"
            type="button"
          >
            <X className="w-4 h-4 text-gray-300" />
          </button>
        </div>
      </div>

      {/* Window Content */}
      <div className="flex-1 overflow-hidden rounded-b-lg">{children}</div>

      {/* Resize Handle */}
      {!window.isMaximized && (
        <div
          onMouseDown={handleResizeStart}
          className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize opacity-0 hover:opacity-100 transition-opacity group"
          style={{
            background: 'linear-gradient(to top left, transparent 0%, transparent calc(50% - 1px), rgba(156, 163, 175, 0.5) calc(50% - 1px), rgba(156, 163, 175, 0.5) calc(50% + 1px), transparent calc(50% + 1px))',
          }}
        />
      )}
    </div>
  );
}

