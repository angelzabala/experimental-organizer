'use client';

import { useState, useEffect, useRef } from 'react';
import { useWindowStore } from '@/store/useWindowStore';
import dynamic from 'next/dynamic';
import '@fortune-sheet/react/dist/index.css';

// Importar FortuneSheet dinámicamente para evitar problemas de SSR
const Workbook = dynamic(
  async () => {
    const module = await import('@fortune-sheet/react');
    return module.Workbook;
  },
  { 
    ssr: false,
    loading: () => (
      <div className="h-full w-full flex items-center justify-center bg-white">
        <div className="text-gray-600">Loading Spreadsheet...</div>
      </div>
    )
  }
);

interface SpreadsheetWidgetProps {
  windowId: string;
}

export default function SpreadsheetWidget({ windowId }: SpreadsheetWidgetProps) {
  const { getWindows, updateWindowContent } = useWindowStore();
  const windows = getWindows();
  const window = windows.find((w) => w.id === windowId);
  
  const content = (window?.content as { sheetData?: any[] }) || {};
  const [isClient, setIsClient] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastDataRef = useRef<string>('');

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Datos iniciales por defecto - estructura simplificada
  const defaultData = [
    {
      name: 'Sheet 1',
      celldata: [],
      row: 50,
      column: 26,
      config: {},
      index: 0,
      order: 0,
      status: 1,
    },
  ];

  const handleChange = (data: any) => {
    if (!data || !Array.isArray(data)) return;

    // Serializar solo los celldata para comparar (ignorar propiedades internas de FortuneSheet)
    const dataString = JSON.stringify(data.map(sheet => ({
      name: sheet.name,
      celldata: sheet.celldata,
      row: sheet.row,
      column: sheet.column,
    })));

    // Solo guardar si los datos realmente cambiaron
    if (dataString === lastDataRef.current) {
      return;
    }

    lastDataRef.current = dataString;

    // Limpiar timeout anterior
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Guardar después de 3 segundos de inactividad
    saveTimeoutRef.current = setTimeout(() => {
      updateWindowContent(windowId, { sheetData: data });
    }, 3000);
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
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-white">
      <Workbook
        data={content.sheetData && content.sheetData.length > 0 ? content.sheetData : defaultData}
        onChange={handleChange}
      />
    </div>
  );
}
