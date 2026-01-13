'use client';

import { useState, useEffect, useRef } from 'react';
import { useWindowStore } from '@/store/useWindowStore';
import dynamic from 'next/dynamic';
import '@excalidraw/excalidraw/index.css';

// Importar Excalidraw dinámicamente para evitar problemas de SSR
const Excalidraw = dynamic(
  async () => {
    const module = await import('@excalidraw/excalidraw');
    return module.Excalidraw;
  },
  { 
    ssr: false,
    loading: () => (
      <div className="h-full w-full flex items-center justify-center bg-white">
        <div className="text-gray-600">Cargando Excalidraw...</div>
      </div>
    )
  }
);

interface DiagramWidgetProps {
  windowId: string;
}

export default function DiagramWidget({ windowId }: DiagramWidgetProps) {
  const { getWindows, updateWindowContent } = useWindowStore();
  const windows = getWindows();
  const window = windows.find((w) => w.id === windowId);
  
  const content = (window?.content as { excalidrawData?: any }) || {};
  const [isClient, setIsClient] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Guardar el estado cuando cambia (con debounce)
  const handleChange = (elements: readonly any[], appState: any) => {
    // Limpiar timeout anterior
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Crear nuevo timeout para guardar después de 1 segundo de inactividad
    saveTimeoutRef.current = setTimeout(() => {
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
          currentItemFontSize: appState.currentItemFontSize,
          currentItemTextAlign: appState.currentItemTextAlign,
        },
      };
      
      updateWindowContent(windowId, { excalidrawData: sceneData });
    }, 1000);
  };

  // Limpiar timeout al desmontar
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  if (!isClient) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-white">
        <div className="text-gray-600">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-white">
      <Excalidraw
        initialData={content.excalidrawData || { elements: [], appState: {} }}
        onChange={handleChange}
        UIOptions={{
          canvasActions: {
            changeViewBackgroundColor: true,
            clearCanvas: true,
            export: { saveFileToDisk: false },
            loadScene: false,
            saveToActiveFile: false,
            toggleTheme: false,
          },
        }}
      />
    </div>
  );
}
