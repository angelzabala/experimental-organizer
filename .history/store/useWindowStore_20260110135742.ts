import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';

export type WidgetType = 'sticky-note' | 'todo' | 'calendar' | 'kanban' | 'iframe' | 'pomodoro';

export interface WindowPosition {
  x: number;
  y: number;
}

export interface WindowSize {
  w: number;
  h: number;
}

export interface Window {
  id: string;
  title: string;
  type: WidgetType;
  position: WindowPosition;
  size: WindowSize;
  isMaximized: boolean;
  zIndex: number;
  content?: Record<string, any>;
  previousPosition?: WindowPosition;
  previousSize?: WindowSize;
}

type SaveStatus = 'idle' | 'saving' | 'saved';

// Store separado para el estado de guardado (no persistido)
interface SaveStatusStore {
  saveStatus: SaveStatus;
  setSaveStatus: (status: SaveStatus) => void;
}

export const useSaveStatusStore = create<SaveStatusStore>((set) => ({
  saveStatus: 'idle',
  setSaveStatus: (status) => {
    set((state) => {
      // Solo actualizar si el estado es diferente
      if (state.saveStatus !== status) {
        return { saveStatus: status };
      }
      return state;
    });
  },
}));

interface WindowStore {
  windows: Window[];
  maxZIndex: number;
  addWindow: (window: Omit<Window, 'zIndex'>) => void;
  updateWindowPosition: (id: string, position: WindowPosition) => void;
  updateWindowSize: (id: string, size: WindowSize) => void;
  toggleMaximize: (id: string) => void;
  focusWindow: (id: string) => void;
  closeWindow: (id: string) => void;
  updateWindowContent: (id: string, content: Record<string, any>) => void;
}

// Storage personalizado con debounce de 3 segundos
// Variables compartidas para el debounce (fuera de la función para que sean singleton)
const DEBOUNCE_MS = 3000;
let debounceTimeoutId: ReturnType<typeof setTimeout> | null = null;
let pendingStorageValue: { key: string; value: string } | null = null;
let flushInitialized = false;
let saveStatusCallback: ((status: SaveStatus) => void) | null = null;
let isUpdatingFromStorage = false; // Flag para evitar recursión

// Función para registrar el callback de estado de guardado
export const setSaveStatusCallback = (callback: (status: SaveStatus) => void) => {
  saveStatusCallback = callback;
};

// Función helper para actualizar el estado de guardado
const updateSaveStatus = (status: SaveStatus) => {
  if (saveStatusCallback) {
    saveStatusCallback(status);
  }
  // También actualizar el store separado
  useSaveStatusStore.getState().setSaveStatus(status);
};

// Función para guardar inmediatamente el valor pendiente
const flushPendingStorage = () => {
  if (debounceTimeoutId) {
    clearTimeout(debounceTimeoutId);
    debounceTimeoutId = null;
  }
  if (pendingStorageValue !== null) {
    localStorage.setItem(pendingStorageValue.key, pendingStorageValue.value);
    pendingStorageValue = null;
    
    // Notificar que se guardó
    updateSaveStatus('saved');
  }
};

// Inicializar los event listeners solo una vez
const initializeFlushListeners = () => {
  if (flushInitialized || typeof window === 'undefined') return;
  flushInitialized = true;

  // Guardar inmediatamente cuando la página se cierra
  window.addEventListener('beforeunload', flushPendingStorage);
  // También guardar cuando la página se oculta (pestaña cambia, etc.)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      flushPendingStorage();
    }
  });
};

const createDebouncedStorage = (): StateStorage => {
  // Inicializar los listeners la primera vez
  initializeFlushListeners();

  return {
    getItem: (name: string): string | null => {
      return localStorage.getItem(name);
    },
    setItem: (name: string, value: string): void => {
      // Si estamos actualizando desde el storage (rehidratación), no hacer nada
      if (isUpdatingFromStorage) {
        return;
      }

      // Guardar el valor pendiente
      pendingStorageValue = { key: name, value };

      // Limpiar el timeout anterior si existe
      if (debounceTimeoutId) {
        clearTimeout(debounceTimeoutId);
      }

      // Notificar que se está guardando (usar setTimeout para evitar recursión)
      if (saveStatusCallback) {
        setTimeout(() => {
          if (saveStatusCallback && !isUpdatingFromStorage) {
            saveStatusCallback('saving');
          }
        }, 0);
      }

      // Crear un nuevo timeout para guardar después de 3 segundos
      debounceTimeoutId = setTimeout(() => {
        if (pendingStorageValue !== null && pendingStorageValue.key === name) {
          localStorage.setItem(name, pendingStorageValue.value);
          pendingStorageValue = null;
          
          // Notificar que se guardó (ya estamos en un setTimeout, así que podemos llamar directamente)
          if (saveStatusCallback) {
            // Usar setTimeout para evitar cualquier problema de recursión
            setTimeout(() => {
              if (saveStatusCallback) {
                saveStatusCallback('saved');
                // Volver a idle después de 2 segundos
                setTimeout(() => {
                  if (saveStatusCallback) {
                    saveStatusCallback('idle');
                  }
                }, 2000);
              }
            }, 0);
          }
        }
        debounceTimeoutId = null;
      }, DEBOUNCE_MS);
    },
    removeItem: (name: string): void => {
      // Si hay un guardado pendiente para esta clave, cancelarlo
      if (debounceTimeoutId && pendingStorageValue?.key === name) {
        clearTimeout(debounceTimeoutId);
        debounceTimeoutId = null;
        pendingStorageValue = null;
      }
      localStorage.removeItem(name);
    },
  };
};

export const useWindowStore = create<WindowStore>()(
  persist(
    (set, get) => ({
      windows: [],
      maxZIndex: 0,
      saveStatus: 'idle' as SaveStatus,
      
      setSaveStatus: (status: SaveStatus) => {
        // Solo actualizar si el estado es diferente para evitar bucles
        set((state) => {
          if (state.saveStatus !== status) {
            return { saveStatus: status };
          }
          return state;
        });
      },
      
      addWindow: (window) => {
        set((state) => {
          const newZIndex = state.maxZIndex + 1;
          return {
            windows: [...state.windows, { ...window, zIndex: newZIndex }],
            maxZIndex: newZIndex,
          };
        });
      },
      
      updateWindowPosition: (id, position) => {
        set((state) => ({
          windows: state.windows.map((w) =>
            w.id === id ? { ...w, position } : w
          ),
        }));
      },
      
      updateWindowSize: (id, size) => {
        set((state) => ({
          windows: state.windows.map((w) =>
            w.id === id ? { ...w, size } : w
          ),
        }));
      },
      
      toggleMaximize: (id) => {
        set((state) => ({
          windows: state.windows.map((w) => {
            if (w.id !== id) return w;
            
            if (!w.isMaximized) {
              // Guardar posición y tamaño actuales antes de maximizar
              return {
                ...w,
                isMaximized: true,
                previousPosition: { ...w.position },
                previousSize: { ...w.size },
                position: { x: 0, y: 0 },
              };
            } else {
              // Restaurar posición y tamaño previos
              return {
                ...w,
                isMaximized: false,
                position: w.previousPosition || { x: 100, y: 100 },
                size: w.previousSize || { w: 300, h: 300 },
                previousPosition: undefined,
                previousSize: undefined,
              };
            }
          }),
        }));
      },
      
      focusWindow: (id) => {
        set((state) => {
          const newZIndex = state.maxZIndex + 1;
          return {
            windows: state.windows.map((w) =>
              w.id === id ? { ...w, zIndex: newZIndex } : w
            ),
            maxZIndex: newZIndex,
          };
        });
      },
      
      closeWindow: (id) => {
        set((state) => ({
          windows: state.windows.filter((w) => w.id !== id),
        }));
      },
      
      updateWindowContent: (id, content) => {
        set((state) => ({
          windows: state.windows.map((w) =>
            w.id === id ? { ...w, content: { ...w.content, ...content } } : w
          ),
        }));
      },
    }),
    {
      name: 'window-store', // nombre de la clave en localStorage
      storage: createJSONStorage(() => createDebouncedStorage()), // usar storage con debounce
      partialize: (state) => ({
        // Excluir saveStatus de la persistencia para evitar bucles infinitos
        windows: state.windows,
        maxZIndex: state.maxZIndex,
      }),
      onRehydrateStorage: () => (state) => {
        // Asegurar que maxZIndex sea correcto después de restaurar desde localStorage
        if (state && state.windows.length > 0) {
          const maxZ = Math.max(...state.windows.map(w => w.zIndex), 0);
          if (maxZ > state.maxZIndex) {
            state.maxZIndex = maxZ;
          }
        }
        
        // Registrar el callback para actualizar el estado de guardado
        if (state) {
          setSaveStatusCallback(state.setSaveStatus);
        }
      },
    }
  )
);

