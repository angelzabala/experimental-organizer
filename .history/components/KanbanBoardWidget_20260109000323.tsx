'use client';

import { useState, useEffect } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useWindowStore } from '@/store/useWindowStore';
import { Plus, GripVertical, Trash2, X } from 'lucide-react';

interface KanbanCard {
  id: string;
  title: string;
  description?: string;
}

interface KanbanColumn {
  id: string;
  title: string;
  cards: KanbanCard[];
}

interface KanbanBoardWidgetProps {
  windowId: string;
}

const DEFAULT_COLUMNS: KanbanColumn[] = [
  { id: 'todo', title: 'Por Hacer', cards: [] },
  { id: 'in-progress', title: 'En Progreso', cards: [] },
  { id: 'done', title: 'Completado', cards: [] },
];

function KanbanCard({ card }: { card: KanbanCard }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-gray-700/50 border border-gray-600/50 rounded-lg p-3 mb-2 cursor-grab active:cursor-grabbing hover:bg-gray-700/70 transition-colors"
    >
      <div className="flex items-start gap-2">
        <div
          {...attributes}
          {...listeners}
          className="mt-1 cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="w-4 h-4 text-gray-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-gray-200 mb-1">{card.title}</h4>
          {card.description && (
            <p className="text-xs text-gray-400 line-clamp-2">{card.description}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function KanbanColumnComponent({
  column,
  onAddCard,
  onDeleteCard,
  onDeleteColumn,
  canDelete,
}: {
  column: KanbanColumn;
  onAddCard: (columnId: string) => void;
  onDeleteCard: (cardId: string) => void;
  onDeleteColumn: (columnId: string) => void;
  canDelete: boolean;
}) {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: column.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const cardIds = column.cards.map((card) => card.id);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex-shrink-0 flex-1 min-w-[120px] bg-gray-800/50 border border-gray-700/50 rounded-lg flex flex-col ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      {/* Column Header */}
      <div
        {...attributes}
        {...listeners}
        className="p-3 border-b border-gray-700/50 bg-gray-800/70 rounded-t-lg cursor-move relative group"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-200 flex-1 truncate pr-2">{column.title}</h3>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 bg-gray-700/50 px-2 py-1 rounded">
              {column.cards.length}
            </span>
            {canDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteColumn(column.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-600/50 rounded transition-opacity"
                aria-label="Eliminar columna"
              >
                <X className="w-3 h-3 text-gray-400" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Cards Container */}
      <div className="flex-1 overflow-y-auto p-3 min-h-[200px]">
        <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
          {column.cards.map((card) => (
            <div key={card.id} className="relative group">
              <KanbanCard card={card} />
              <button
                onClick={() => onDeleteCard(card.id)}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 bg-red-600/50 hover:bg-red-600/70 rounded transition-opacity"
                aria-label="Eliminar tarjeta"
              >
                <Trash2 className="w-3 h-3 text-white" />
              </button>
            </div>
          ))}
        </SortableContext>

        {/* Add Card Button */}
        <button
          onClick={() => onAddCard(column.id)}
          className="w-full mt-2 p-2 border-2 border-dashed border-gray-600/50 rounded-lg text-gray-400 hover:border-gray-500 hover:text-gray-300 hover:bg-gray-700/30 transition-colors flex items-center justify-center gap-2 text-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Agregar tarjeta</span>
        </button>
      </div>
    </div>
  );
}

export default function KanbanBoardWidget({ windowId }: KanbanBoardWidgetProps) {
  const { windows, updateWindowContent } = useWindowStore();
  const window = windows.find((w) => w.id === windowId);

  const content = (window?.content as { columns?: KanbanColumn[] }) || {};
  const [columns, setColumns] = useState<KanbanColumn[]>(
    content.columns || DEFAULT_COLUMNS
  );
  const [activeCard, setActiveCard] = useState<KanbanCard | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    updateWindowContent(windowId, { columns });
  }, [columns, windowId, updateWindowContent]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const card = findCard(active.id as string);
    setActiveCard(card);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeCard = findCard(active.id as string);
    const overId = over.id as string;

    if (!activeCard) return;

    // Si se arrastra sobre una columna
    const overColumn = columns.find((col) => col.id === overId);
    if (overColumn && activeCard) {
      const activeColumn = findColumnByCardId(activeCard.id);
      if (!activeColumn || activeColumn.id === overColumn.id) return;

      setColumns((prevColumns) => {
        const newColumns = prevColumns.map((col) => {
          if (col.id === activeColumn.id) {
            return {
              ...col,
              cards: col.cards.filter((c) => c.id !== activeCard.id),
            };
          }
          if (col.id === overColumn.id) {
            return {
              ...col,
              cards: [...col.cards, activeCard],
            };
          }
          return col;
        });
        return newColumns;
      });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveCard(null);

    if (!over) return;

    const activeCard = findCard(active.id as string);
    if (!activeCard) return;

    const overId = over.id as string;
    const overColumn = columns.find((col) => col.id === overId);

    if (overColumn) {
      const activeColumn = findColumnByCardId(activeCard.id);
      if (!activeColumn || activeColumn.id === overColumn.id) return;

      setColumns((prevColumns) => {
        return prevColumns.map((col) => {
          if (col.id === activeColumn.id) {
            return {
              ...col,
              cards: col.cards.filter((c) => c.id !== activeCard.id),
            };
          }
          if (col.id === overColumn.id) {
            return {
              ...col,
              cards: [...col.cards, activeCard],
            };
          }
          return col;
        });
      });
    }
  };

  const findCard = (cardId: string): KanbanCard | null => {
    for (const column of columns) {
      const card = column.cards.find((c) => c.id === cardId);
      if (card) return card;
    }
    return null;
  };

  const findColumnByCardId = (cardId: string): KanbanColumn | null => {
    return columns.find((col) => col.cards.some((c) => c.id === cardId)) || null;
  };

  const handleAddCard = (columnId: string) => {
    const title = prompt('Título de la tarjeta:');
    if (!title?.trim()) return;

    const description = prompt('Descripción (opcional):') || '';

    const newCard: KanbanCard = {
      id: `card-${Date.now()}-${Math.random()}`,
      title: title.trim(),
      description: description.trim() || undefined,
    };

    setColumns((prevColumns) =>
      prevColumns.map((col) =>
        col.id === columnId
          ? { ...col, cards: [...col.cards, newCard] }
          : col
      )
    );
  };

  const handleDeleteCard = (cardId: string) => {
    setColumns((prevColumns) =>
      prevColumns.map((col) => ({
        ...col,
        cards: col.cards.filter((c) => c.id !== cardId),
      }))
    );
  };

  const handleAddColumn = () => {
    const title = prompt('Nombre de la columna:');
    if (!title?.trim()) return;

    const newColumn: KanbanColumn = {
      id: `column-${Date.now()}-${Math.random()}`,
      title: title.trim(),
      cards: [],
    };

    setColumns((prevColumns) => [...prevColumns, newColumn]);
  };

  const handleDeleteColumn = (columnId: string) => {
    if (columns.length <= 1) {
      alert('Debe haber al menos una columna');
      return;
    }
    setColumns((prevColumns) => prevColumns.filter((col) => col.id !== columnId));
  };

  return (
    <div className="h-full flex flex-col bg-gray-900/50">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        {/* Header with Add Column Button */}
        <div className="flex items-center justify-end px-4 pt-4 pb-2">
          <button
            onClick={handleAddColumn}
            className="px-3 py-4 mt-2 mb-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-gray-300 hover:bg-gray-700/50 hover:text-white transition-colors flex items-center gap-2 text-sm"
            style={{ marginTop: '8px', marginBottom: '8px' }}
          >
            <Plus className="w-4 h-4" />
            <span>Agregar columna</span>
          </button>
        </div>

        {/* Columns Container */}
        <div className="flex-1 overflow-x-auto px-4 pb-4">
          <div className="flex gap-4 h-full w-full">
            {columns.map((column) => (
              <KanbanColumnComponent
                key={column.id}
                column={column}
                onAddCard={handleAddCard}
                onDeleteCard={handleDeleteCard}
                onDeleteColumn={handleDeleteColumn}
                canDelete={columns.length > 1}
              />
            ))}
          </div>
        </div>
      </DndContext>
    </div>
  );
}

