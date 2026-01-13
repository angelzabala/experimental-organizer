'use client';

import { useState, useEffect } from 'react';
import { useWindowStore } from '@/store/useWindowStore';
import { Globe, Edit2, Check, X, ExternalLink, AlertCircle } from 'lucide-react';

interface IframeWidgetProps {
  windowId: string;
}

export default function IframeWidget({ windowId }: IframeWidgetProps) {
  const { getWindows, updateWindowContent } = useWindowStore();
  const windows = getWindows();
  const window = windows.find((w) => w.id === windowId);
  
  const content = (window?.content as { url?: string }) || {};
  const [url, setUrl] = useState(content.url || '');
  const [isEditing, setIsEditing] = useState(!url);
  const [tempUrl, setTempUrl] = useState(url);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (url) {
      updateWindowContent(windowId, { url });
    }
  }, [url, windowId, updateWindowContent]);

  const handleSave = () => {
    if (tempUrl.trim()) {
      // Asegurar que la URL tenga protocolo
      let finalUrl = tempUrl.trim();
      if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
        finalUrl = 'https://' + finalUrl;
      }
      setUrl(finalUrl);
      setIsEditing(false);
      setHasError(false);
    }
  };

  const handleOpenInNewTab = () => {
    if (url) {
      (window as any).open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleCancel = () => {
    setTempUrl(url);
    setIsEditing(false);
  };

  const handleEdit = () => {
    setTempUrl(url);
    setIsEditing(true);
  };

  if (isEditing) {
    return (
      <div className="h-full flex flex-col bg-gray-900/50 p-4">
        <div className="flex flex-col gap-3">
          <label className="text-sm font-medium text-gray-300">
            URL del sitio web:
          </label>
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={tempUrl}
                onChange={(e) => setTempUrl(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSave();
                  } else if (e.key === 'Escape') {
                    handleCancel();
                  }
                }}
                placeholder="https://ejemplo.com"
                className="flex-1 px-3 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                autoFocus
              />
            <button
              onClick={handleSave}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-1"
              aria-label="Guardar URL"
            >
              <Check className="w-4 h-4" />
            </button>
              <button
                onClick={handleCancel}
                className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center gap-1"
                aria-label="Cancelar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="bg-yellow-900/30 border border-yellow-700/50 rounded-lg p-3 flex gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-yellow-200">
                <p className="font-medium mb-1">Nota sobre compatibilidad:</p>
                <p>Algunos sitios como YouTube, Facebook, Google, Instagram y bancos no permiten ser embebidos por seguridad. Para estos sitios, usa el botón "Abrir en pestaña" que aparecerá.</p>
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-400">
            Presiona Enter para guardar o Escape para cancelar
          </p>
        </div>
      </div>
    );
  }

  if (!url) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-900/50">
        <div className="text-center">
          <Globe className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 mb-4">No hay URL configurada</p>
          <button
            onClick={handleEdit}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2 mx-auto"
          >
            <Edit2 className="w-4 h-4" />
            <span>Agregar URL</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-900/50 relative group">
      {/* Toolbar - aparece al hacer hover */}
      <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 flex gap-2 transition-opacity">
        <button
          onClick={handleOpenInNewTab}
          className="px-3 py-1.5 bg-gray-800/90 border border-gray-700/50 rounded-lg text-gray-300 hover:bg-gray-700/90 hover:text-white transition-colors flex items-center gap-2 text-sm"
          aria-label="Abrir en pestaña nueva"
          title="Abrir en pestaña nueva"
        >
          <ExternalLink className="w-4 h-4" />
          <span>Abrir en pestaña</span>
        </button>
        <button
          onClick={handleEdit}
          className="px-3 py-1.5 bg-gray-800/90 border border-gray-700/50 rounded-lg text-gray-300 hover:bg-gray-700/90 hover:text-white transition-colors flex items-center gap-2 text-sm"
          aria-label="Editar URL"
        >
          <Edit2 className="w-4 h-4" />
          <span>Editar URL</span>
        </button>
      </div>

      {/* Error Message - si el iframe no carga */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/95 z-20 p-6">
          <div className="text-center max-w-md">
            <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              No se puede cargar este sitio
            </h3>
            <p className="text-gray-400 mb-4">
              Este sitio web no permite ser embebido por razones de seguridad.
              Sitios como YouTube, Facebook, Google e Instagram tienen esta restricción.
            </p>
            <button
              onClick={handleOpenInNewTab}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2 mx-auto"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Abrir en pestaña nueva</span>
            </button>
          </div>
        </div>
      )}

      {/* Iframe */}
      <iframe
        src={url}
        className="w-full h-full border-0"
        title={url}
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        onError={() => setHasError(true)}
      />
    </div>
  );
}

