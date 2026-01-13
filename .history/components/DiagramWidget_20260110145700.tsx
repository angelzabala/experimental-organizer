'use client';

import { useState, useEffect } from 'react';
import { useWindowStore } from '@/store/useWindowStore';
import dynamic from 'next/dynamic';

// Importar Excalidraw dinámicamente para evitar problemas de SSR
const Excalidraw = dynamic(
  async () => (await import('@excalidraw/excalidraw')).Excalidraw,
  { ssr: false }
);

interface DiagramWidgetProps {
  windowId: string;
}

export default function DiagramWidget({ windowId }: DiagramWidgetProps) {
  const { getWindows, updateWindowContent } = useWindowStore();
  const windows = getWindows();
  const window = windows.find((w) => w.id === windowId);
  
  const content = (window?.content as { excalidrawData?: any }) || {};
  const [excalidrawAPI, setExcalidrawAPI] = useState<any>(null);

  // Guardar el estado cuando cambia
  const handleChange = (elements: readonly any[], appState: any) => {
    if (excalidrawAPI) {
      const sceneData = {
        elements: elements,
        appState: {
          viewBackgroundColor: appState.viewBackgroundColor,
          currentItemStrokeColor: appState.currentItemStrokeColor,
          currentItemBackgroundColor: appState.currentItemBackgroundColor,
          currentItemFillStyle: appState.currentItemFillStyle,
          currentItemStrokeWidth: appState.currentItemStrokeWidth,
          currentItemRoughness: appState.currentItemRoughness,
          currentItemOpacity: appState.currentItemOpacity,
        },
      };
      
      // Debounce para evitar guardar en cada movimiento
      const timeoutId = setTimeout(() => {
        updateWindowContent(windowId, { excalidrawData: sceneData });
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  };

  return (
    <div className="h-full w-full bg-white">
      <Excalidraw
        excalidrawAPI={(api) => setExcalidrawAPI(api)}
        initialData={content.excalidrawData}
        onChange={handleChange}
        UIOptions={{
          canvasActions: {
            loadScene: false,
            export: false,
            saveAsImage: true,
          },
        }}
        theme="light"
      />
    </div>
  );
}
