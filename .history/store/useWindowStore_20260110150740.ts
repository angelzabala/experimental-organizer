import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';

export type WidgetType = 
  | 'sticky-note' 
  | 'todo' 
  | 'calendar' 
  | 'kanban' 
  | 'pomodoro'
  | 'time-tracker'
  | 'habit-tracker'
  | 'mind-map'
  | 'quick-links'
  | 'quick-capture'
  | 'eisenhower-matrix'
  | 'calculator'
  | 'break-reminder'
  | 'diagram'
  | 'spreadsheet';

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

export interface Project {
  id: string;
  name: string;
  windows: Window[];
  maxZIndex: number;
}

export interface Workspace {
  id: string;
  name: string;
  projects: Project[];
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
  workspaces: Workspace[];
  activeWorkspaceId: string | null;
  activeProjectId: string | null;
  
  // Workspace methods
  addWorkspace: (name: string) => string; // Retorna el ID del workspace creado
  deleteWorkspace: (workspaceId: string) => void;
  setActiveWorkspace: (workspaceId: string) => void;
  updateWorkspaceName: (workspaceId: string, name: string) => void;
  
  // Project methods
  addProject: (workspaceId: string, name: string) => string; // Retorna el ID del project creado
  deleteProject: (workspaceId: string, projectId: string) => void;
  setActiveProject: (workspaceId: string, projectId: string) => void;
  updateProjectName: (workspaceId: string, projectId: string, name: string) => void;
  
  // Window methods (ahora trabajan con el project activo)
  addWindow: (window: Omit<Window, 'zIndex'>) => void;
  updateWindowPosition: (id: string, position: WindowPosition) => void;
  updateWindowSize: (id: string, size: WindowSize) => void;
  toggleMaximize: (id: string) => void;
  focusWindow: (id: string) => void;
  closeWindow: (id: string) => void;
  updateWindowContent: (id: string, content: Record<string, any>) => void;
  
  // Helpers
  getActiveProject: () => Project | null;
  getActiveWorkspace: () => Workspace | null;
  getWindows: () => Window[]; // Obtiene las windows del project activo
}

// Storage personalizado con debounce de 1 segundo
// Variables compartidas para el debounce (fuera de la función para que sean singleton)
const DEBOUNCE_MS = 1000;
let debounceTimeoutId: ReturnType<typeof setTimeout> | null = null;
let pendingStorageValue: { key: string; value: string } | null = null;
let flushInitialized = false;
let saveStatusCallback: ((status: SaveStatus) => void) | null = null;

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
      // Guardar el valor pendiente
      pendingStorageValue = { key: name, value };

      // Limpiar el timeout anterior si existe
      if (debounceTimeoutId) {
        clearTimeout(debounceTimeoutId);
      }

      // Notificar que se está guardando
      updateSaveStatus('saving');

      // Crear un nuevo timeout para guardar después de 3 segundos
      debounceTimeoutId = setTimeout(() => {
        if (pendingStorageValue !== null && pendingStorageValue.key === name) {
          localStorage.setItem(name, pendingStorageValue.value);
          pendingStorageValue = null;
          
          // Notificar que se guardó
          updateSaveStatus('saved');
          // Volver a idle después de 2 segundos
          setTimeout(() => {
            updateSaveStatus('idle');
          }, 2000);
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
      workspaces: [],
      activeWorkspaceId: null,
      activeProjectId: null,
      
      // Workspace methods
      addWorkspace: (name: string) => {
        const workspaceId = `workspace-${Date.now()}`;
        const projectId = `project-${Date.now()}`;
        const newWorkspace: Workspace = {
          id: workspaceId,
          name,
          projects: [{
            id: projectId,
            name: 'Proyecto Principal',
            windows: [],
            maxZIndex: 0,
          }],
        };
        
        set((state) => ({
          workspaces: [...state.workspaces, newWorkspace],
          activeWorkspaceId: workspaceId,
          activeProjectId: projectId,
        }));
        
        return workspaceId;
      },
      
      deleteWorkspace: (workspaceId: string) => {
        set((state) => {
          const newWorkspaces = state.workspaces.filter(w => w.id !== workspaceId);
          let newActiveWorkspaceId = state.activeWorkspaceId;
          let newActiveProjectId = state.activeProjectId;
          
          // Si se eliminó el workspace activo, cambiar al primero disponible
          if (state.activeWorkspaceId === workspaceId) {
            if (newWorkspaces.length > 0) {
              newActiveWorkspaceId = newWorkspaces[0].id;
              newActiveProjectId = newWorkspaces[0].projects[0]?.id || null;
            } else {
              newActiveWorkspaceId = null;
              newActiveProjectId = null;
            }
          }
          
          return {
            workspaces: newWorkspaces,
            activeWorkspaceId: newActiveWorkspaceId,
            activeProjectId: newActiveProjectId,
          };
        });
      },
      
      setActiveWorkspace: (workspaceId: string) => {
        set((state) => {
          const workspace = state.workspaces.find(w => w.id === workspaceId);
          if (workspace && workspace.projects.length > 0) {
            return {
              activeWorkspaceId: workspaceId,
              activeProjectId: workspace.projects[0].id,
            };
          }
          return state;
        });
      },
      
      updateWorkspaceName: (workspaceId: string, name: string) => {
        set((state) => ({
          workspaces: state.workspaces.map(w =>
            w.id === workspaceId ? { ...w, name } : w
          ),
        }));
      },
      
      // Project methods
      addProject: (workspaceId: string, name: string) => {
        const projectId = `project-${Date.now()}`;
        set((state) => ({
          workspaces: state.workspaces.map(w =>
            w.id === workspaceId
              ? {
                  ...w,
                  projects: [
                    ...w.projects,
                    {
                      id: projectId,
                      name,
                      windows: [],
                      maxZIndex: 0,
                    },
                  ],
                }
              : w
          ),
          activeProjectId: projectId,
        }));
        return projectId;
      },
      
      deleteProject: (workspaceId: string, projectId: string) => {
        set((state) => {
          const workspace = state.workspaces.find(w => w.id === workspaceId);
          if (!workspace) return state;
          
          const newProjects = workspace.projects.filter(p => p.id !== projectId);
          if (newProjects.length === 0) return state; // No permitir eliminar el último project
          
          let newActiveProjectId = state.activeProjectId;
          if (state.activeProjectId === projectId) {
            newActiveProjectId = newProjects[0].id;
          }
          
          return {
            workspaces: state.workspaces.map(w =>
              w.id === workspaceId
                ? { ...w, projects: newProjects }
                : w
            ),
            activeProjectId: newActiveProjectId,
          };
        });
      },
      
      setActiveProject: (workspaceId: string, projectId: string) => {
        set((state) => ({
          activeWorkspaceId: workspaceId,
          activeProjectId: projectId,
        }));
      },
      
      updateProjectName: (workspaceId: string, projectId: string, name: string) => {
        set((state) => ({
          workspaces: state.workspaces.map(w =>
            w.id === workspaceId
              ? {
                  ...w,
                  projects: w.projects.map(p =>
                    p.id === projectId ? { ...p, name } : p
                  ),
                }
              : w
          ),
        }));
      },
      
      // Window methods
      addWindow: (window) => {
        const state = get();
        if (!state.activeWorkspaceId || !state.activeProjectId) return;
        
        set((s) => {
          const workspace = s.workspaces.find(w => w.id === s.activeWorkspaceId);
          if (!workspace) return s;
          
          const project = workspace.projects.find(p => p.id === s.activeProjectId);
          if (!project) return s;
          
          const newZIndex = project.maxZIndex + 1;
          const newWindow = { ...window, zIndex: newZIndex };
          
          return {
            workspaces: s.workspaces.map(w =>
              w.id === s.activeWorkspaceId
                ? {
                    ...w,
                    projects: w.projects.map(p =>
                      p.id === s.activeProjectId
                        ? {
                            ...p,
                            windows: [...p.windows, newWindow],
                            maxZIndex: newZIndex,
                          }
                        : p
                    ),
                  }
                : w
            ),
          };
        });
      },
      
      updateWindowPosition: (id, position) => {
        const state = get();
        if (!state.activeWorkspaceId || !state.activeProjectId) return;
        
        set((s) => ({
          workspaces: s.workspaces.map(w =>
            w.id === s.activeWorkspaceId
              ? {
                  ...w,
                  projects: w.projects.map(p =>
                    p.id === s.activeProjectId
                      ? {
                          ...p,
                          windows: p.windows.map(win =>
                            win.id === id ? { ...win, position } : win
                          ),
                        }
                      : p
                  ),
                }
              : w
          ),
        }));
      },
      
      updateWindowSize: (id, size) => {
        const state = get();
        if (!state.activeWorkspaceId || !state.activeProjectId) return;
        
        set((s) => ({
          workspaces: s.workspaces.map(w =>
            w.id === s.activeWorkspaceId
              ? {
                  ...w,
                  projects: w.projects.map(p =>
                    p.id === s.activeProjectId
                      ? {
                          ...p,
                          windows: p.windows.map(win =>
                            win.id === id ? { ...win, size } : win
                          ),
                        }
                      : p
                  ),
                }
              : w
          ),
        }));
      },
      
      toggleMaximize: (id) => {
        const state = get();
        if (!state.activeWorkspaceId || !state.activeProjectId) return;
        
        set((s) => ({
          workspaces: s.workspaces.map(w =>
            w.id === s.activeWorkspaceId
              ? {
                  ...w,
                  projects: w.projects.map(p =>
                    p.id === s.activeProjectId
                      ? {
                          ...p,
                          windows: p.windows.map(win => {
                            if (win.id !== id) return win;
                            
                            if (!win.isMaximized) {
                              return {
                                ...win,
                                isMaximized: true,
                                previousPosition: { ...win.position },
                                previousSize: { ...win.size },
                                position: { x: 0, y: 0 },
                              };
                            } else {
                              return {
                                ...win,
                                isMaximized: false,
                                position: win.previousPosition || { x: 100, y: 100 },
                                size: win.previousSize || { w: 300, h: 300 },
                                previousPosition: undefined,
                                previousSize: undefined,
                              };
                            }
                          }),
                        }
                      : p
                  ),
                }
              : w
          ),
        }));
      },
      
      focusWindow: (id) => {
        const state = get();
        if (!state.activeWorkspaceId || !state.activeProjectId) return;
        
        set((s) => {
          const workspace = s.workspaces.find(w => w.id === s.activeWorkspaceId);
          if (!workspace) return s;
          
          const project = workspace.projects.find(p => p.id === s.activeProjectId);
          if (!project) return s;
          
          const newZIndex = project.maxZIndex + 1;
          
          return {
            workspaces: s.workspaces.map(w =>
              w.id === s.activeWorkspaceId
                ? {
                    ...w,
                    projects: w.projects.map(p =>
                      p.id === s.activeProjectId
                        ? {
                            ...p,
                            windows: p.windows.map(win =>
                              win.id === id ? { ...win, zIndex: newZIndex } : win
                            ),
                            maxZIndex: newZIndex,
                          }
                        : p
                    ),
                  }
                : w
            ),
          };
        });
      },
      
      closeWindow: (id) => {
        const state = get();
        if (!state.activeWorkspaceId || !state.activeProjectId) return;
        
        set((s) => ({
          workspaces: s.workspaces.map(w =>
            w.id === s.activeWorkspaceId
              ? {
                  ...w,
                  projects: w.projects.map(p =>
                    p.id === s.activeProjectId
                      ? {
                          ...p,
                          windows: p.windows.filter(win => win.id !== id),
                        }
                      : p
                  ),
                }
              : w
          ),
        }));
      },
      
      updateWindowContent: (id, content) => {
        const state = get();
        if (!state.activeWorkspaceId || !state.activeProjectId) return;
        
        set((s) => ({
          workspaces: s.workspaces.map(w =>
            w.id === s.activeWorkspaceId
              ? {
                  ...w,
                  projects: w.projects.map(p =>
                    p.id === s.activeProjectId
                      ? {
                          ...p,
                          windows: p.windows.map(win =>
                            win.id === id ? { ...win, content: { ...win.content, ...content } } : win
                          ),
                        }
                      : p
                  ),
                }
              : w
          ),
        }));
      },
      
      // Helpers
      getActiveProject: () => {
        const state = get();
        if (!state.activeWorkspaceId || !state.activeProjectId) return null;
        const workspace = state.workspaces.find(w => w.id === state.activeWorkspaceId);
        if (!workspace) return null;
        return workspace.projects.find(p => p.id === state.activeProjectId) || null;
      },
      
      getActiveWorkspace: () => {
        const state = get();
        if (!state.activeWorkspaceId) return null;
        return state.workspaces.find(w => w.id === state.activeWorkspaceId) || null;
      },
      
      getWindows: () => {
        const project = get().getActiveProject();
        return project?.windows || [];
      },
    }),
    {
      name: 'window-store', // nombre de la clave en localStorage
      storage: createJSONStorage(() => createDebouncedStorage()), // usar storage con debounce
      partialize: (state) => ({
        workspaces: state.workspaces,
        activeWorkspaceId: state.activeWorkspaceId,
        activeProjectId: state.activeProjectId,
      }),
      onRehydrateStorage: () => (state) => {
        // Asegurar que maxZIndex sea correcto para cada project después de restaurar
        if (state) {
          state.workspaces.forEach(workspace => {
            workspace.projects.forEach(project => {
              if (project.windows.length > 0) {
                const maxZ = Math.max(...project.windows.map(w => w.zIndex), 0);
                if (maxZ > project.maxZIndex) {
                  project.maxZIndex = maxZ;
                }
              }
            });
          });
          
          // Si no hay workspaces, crear uno por defecto
          if (state.workspaces.length === 0) {
            const workspaceId = `workspace-${Date.now()}`;
            const projectId = `project-${Date.now()}`;
            state.workspaces = [{
              id: workspaceId,
              name: 'Workspace Principal',
              projects: [{
                id: projectId,
                name: 'Proyecto Principal',
                windows: [],
                maxZIndex: 0,
              }],
            }];
            state.activeWorkspaceId = workspaceId;
            state.activeProjectId = projectId;
          } else if (!state.activeWorkspaceId && state.workspaces.length > 0) {
            // Si hay workspaces pero no hay activo, activar el primero
            state.activeWorkspaceId = state.workspaces[0].id;
            if (state.workspaces[0].projects.length > 0) {
              state.activeProjectId = state.workspaces[0].projects[0].id;
            }
          }
        }
        
        // Registrar el callback para actualizar el estado de guardado
        if (state) {
          setSaveStatusCallback(useSaveStatusStore.getState().setSaveStatus);
        }
      },
    }
  )
);

