'use client';

import { useState, useEffect } from 'react';
import { useWindowStore } from '@/store/useWindowStore';

interface StickyNoteWidgetProps {
  windowId: string;
}

const COLORS = {
  yellow: 'bg-yellow-200',
  green: 'bg-green-200',
  blue: 'bg-blue-200',
};

type ColorKey = keyof typeof COLORS;

export default function StickyNoteWidget({ windowId }: StickyNoteWidgetProps) {
  const { getWindows, updateWindowContent } = useWindowStore();
  const windows = getWindows();
  const window = windows.find((w) => w.id === windowId);
  
  const content = (window?.content as { text?: string; color?: ColorKey }) || {};
  const [text, setText] = useState(content.text || '');
  const [color, setColor] = useState<ColorKey>(content.color || 'yellow');

  useEffect(() => {
    updateWindowContent(windowId, { text, color });
  }, [text, color, windowId, updateWindowContent]);

  const currentColorClass = COLORS[color];

  return (
    <div className={`h-full flex flex-col ${currentColorClass}`}>
      {/* Color Picker */}
      <div className="flex gap-2 p-2 border-b border-gray-300/50">
        {Object.keys(COLORS).map((colorKey) => (
          <button
            key={colorKey}
            onClick={() => setColor(colorKey as ColorKey)}
            className={`w-6 h-6 rounded-full ${COLORS[colorKey as ColorKey]} border-2 ${
              color === colorKey ? 'border-gray-600' : 'border-transparent'
            } hover:border-gray-400 transition-colors`}
            aria-label={`Cambiar color a ${colorKey}`}
          />
        ))}
      </div>

      {/* Text Area */}
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Escribe tu nota aquí..."
        className="flex-1 w-full p-4 resize-none border-none outline-none bg-transparent text-gray-800 placeholder-gray-500"
        style={{ fontFamily: 'inherit' }}
      />
    </div>
  );
}


