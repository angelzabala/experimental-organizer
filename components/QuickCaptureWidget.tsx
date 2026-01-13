'use client';

import { useState, useEffect } from 'react';
import { useWindowStore } from '@/store/useWindowStore';
import { Plus, Trash2, Check, ArrowRight } from 'lucide-react';

interface CaptureItem {
  id: string;
  text: string;
  timestamp: number;
  processed: boolean;
}

interface QuickCaptureWidgetProps {
  windowId: string;
}

export default function QuickCaptureWidget({ windowId }: QuickCaptureWidgetProps) {
  const { getWindows, updateWindowContent } = useWindowStore();
  const windows = getWindows();
  const window = windows.find((w) => w.id === windowId);
  
  const content = (window?.content as { items?: CaptureItem[] }) || {};
  const [items, setItems] = useState<CaptureItem[]>(content.items || []);
  const [newItemText, setNewItemText] = useState('');

  useEffect(() => {
    updateWindowContent(windowId, { items });
  }, [items, windowId, updateWindowContent]);

  const addItem = () => {
    if (newItemText.trim()) {
      const item: CaptureItem = {
        id: `capture-${Date.now()}`,
        text: newItemText.trim(),
        timestamp: Date.now(),
        processed: false,
      };
      setItems([item, ...items]);
      setNewItemText('');
    }
  };

  const toggleProcessed = (itemId: string) => {
    setItems(items.map(item => 
      item.id === itemId ? { ...item, processed: !item.processed } : item
    ));
  };

  const deleteItem = (itemId: string) => {
    setItems(items.filter(item => item.id !== itemId));
  };

  const clearProcessed = () => {
    setItems(items.filter(item => !item.processed));
  };

  const unprocessedCount = items.filter(item => !item.processed).length;
  const processedCount = items.filter(item => item.processed).length;

  return (
    <div className="h-full flex flex-col bg-gray-800/50 text-white">
      {/* Header */}
      <div className="p-3 border-b border-gray-700/50">
        <h3 className="text-lg font-semibold mb-3">Quick Capture</h3>
        
        {/* Quick Input */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Captura una idea rápida..."
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addItem()}
            className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={addItem}
            disabled={!newItemText.trim()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="p-3 border-b border-gray-700/50 grid grid-cols-2 gap-4 text-center">
        <div>
          <div className="text-2xl font-bold text-yellow-400">{unprocessedCount}</div>
          <div className="text-xs text-gray-400">Sin Procesar</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-green-400">{processedCount}</div>
          <div className="text-xs text-gray-400">Procesadas</div>
        </div>
      </div>

      {/* Items List */}
      <div className="flex-1 overflow-y-auto p-3">
        {items.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p className="text-sm">No hay capturas</p>
            <p className="text-xs mt-2">Escribe rápido tus ideas y procésalas después</p>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map(item => (
              <div
                key={item.id}
                className={`p-3 rounded border transition-all ${
                  item.processed
                    ? 'bg-green-600/10 border-green-600/30 opacity-60'
                    : 'bg-gray-700/30 border-gray-600/30 hover:bg-gray-700/50'
                }`}
              >
                <div className="flex items-start gap-2">
                  <button
                    onClick={() => toggleProcessed(item.id)}
                    className={`flex-shrink-0 w-5 h-5 mt-0.5 rounded border-2 flex items-center justify-center transition-colors ${
                      item.processed
                        ? 'bg-green-600 border-green-600'
                        : 'border-gray-500 hover:border-green-500'
                    }`}
                  >
                    {item.processed && <Check className="w-3 h-3 text-white" />}
                  </button>
                  
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${item.processed ? 'line-through text-gray-400' : 'text-gray-200'}`}>
                      {item.text}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(item.timestamp).toLocaleString('es-ES', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>

                  <button
                    onClick={() => deleteItem(item.id)}
                    className="flex-shrink-0 p-1 hover:bg-red-600/50 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Actions */}
      {processedCount > 0 && (
        <div className="p-3 border-t border-gray-700/50">
          <button
            onClick={clearProcessed}
            className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Limpiar Procesadas ({processedCount})
          </button>
        </div>
      )}
    </div>
  );
}
