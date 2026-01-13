'use client';

import { useEffect } from 'react';
import { setSaveStatusCallback } from '@/store/useWindowStore';
import { useSaveStatusStore } from '@/store/useWindowStore';
import { Loader2, Check } from 'lucide-react';

export default function SaveIndicator() {
  const saveStatus = useSaveStatusStore((state) => state.saveStatus);
  const setSaveStatus = useSaveStatusStore((state) => state.setSaveStatus);

  // Inicializar el callback cuando el componente se monta (solo una vez)
  useEffect(() => {
    setSaveStatusCallback(setSaveStatus);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Solo ejecutar una vez al montar

  // No mostrar nada cuando está en idle
  if (saveStatus === 'idle') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-[9999]">
      <div
        className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg backdrop-blur-md border transition-all duration-300 ${
          saveStatus === 'saving'
            ? 'bg-blue-500/80 border-blue-400/50 text-white'
            : 'bg-green-500/80 border-green-400/50 text-white'
        }`}
      >
        {saveStatus === 'saving' ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm font-medium">Saving...</span>
          </>
        ) : (
          <>
            <Check className="w-4 h-4" />
            <span className="text-sm font-medium">Saved</span>
          </>
        )}
      </div>
    </div>
  );
}
