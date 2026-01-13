'use client';

import { useState } from 'react';
import { useWindowStore } from '@/store/useWindowStore';
import {
  Folder,
  FolderOpen,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';

export default function Sidebar() {
  const {
    workspaces,
    activeWorkspaceId,
    activeProjectId,
    addWorkspace,
    deleteWorkspace,
    setActiveWorkspace,
    updateWorkspaceName,
    addProject,
    deleteProject,
    setActiveProject,
    updateProjectName,
  } = useWindowStore();

  const [expandedWorkspaces, setExpandedWorkspaces] = useState<Set<string>>(
    new Set(activeWorkspaceId ? [activeWorkspaceId] : [])
  );
  const [editingWorkspace, setEditingWorkspace] = useState<string | null>(null);
  const [editingProject, setEditingProject] = useState<{ workspaceId: string; projectId: string } | null>(null);
  const [workspaceName, setWorkspaceName] = useState('');
  const [projectName, setProjectName] = useState('');

  const toggleWorkspace = (workspaceId: string) => {
    setExpandedWorkspaces((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(workspaceId)) {
        newSet.delete(workspaceId);
      } else {
        newSet.add(workspaceId);
      }
      return newSet;
    });
  };

  const handleAddWorkspace = () => {
    const name = prompt('Workspace name:');
    if (name?.trim()) {
      const workspaceId = addWorkspace(name.trim());
      setExpandedWorkspaces((prev) => new Set(prev).add(workspaceId));
    }
  };

  const handleDeleteWorkspace = (workspaceId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this workspace? All projects and windows will be lost.')) {
      deleteWorkspace(workspaceId);
    }
  };

  const handleEditWorkspace = (workspaceId: string, currentName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingWorkspace(workspaceId);
    setWorkspaceName(currentName);
  };

  const handleSaveWorkspaceName = (workspaceId: string) => {
    if (workspaceName.trim()) {
      updateWorkspaceName(workspaceId, workspaceName.trim());
    }
    setEditingWorkspace(null);
    setWorkspaceName('');
  };

  const handleAddProject = (workspaceId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const name = prompt('Project name:');
    if (name?.trim()) {
      addProject(workspaceId, name.trim());
      setExpandedWorkspaces((prev) => new Set(prev).add(workspaceId));
    }
  };

  const handleDeleteProject = (workspaceId: string, projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this project? All windows will be lost.')) {
      deleteProject(workspaceId, projectId);
    }
  };

  const handleEditProject = (
    workspaceId: string,
    projectId: string,
    currentName: string,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    setEditingProject({ workspaceId, projectId });
    setProjectName(currentName);
  };

  const handleSaveProjectName = () => {
    if (editingProject && projectName.trim()) {
      updateProjectName(editingProject.workspaceId, editingProject.projectId, projectName.trim());
    }
    setEditingProject(null);
    setProjectName('');
  };

  return (
    <div className="w-64 h-full bg-gray-800/90 backdrop-blur-md border-r border-gray-700/50 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700/50">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-white">Workspaces</h2>
          <button
            onClick={handleAddWorkspace}
            className="p-1.5 hover:bg-gray-700/50 rounded transition-colors"
            aria-label="Add workspace"
          >
            <Plus className="w-4 h-4 text-gray-300" />
          </button>
        </div>
      </div>

      {/* Workspaces List */}
      <div className="flex-1 overflow-y-auto p-2">
        {workspaces.length === 0 ? (
          <div className="text-center text-gray-400 py-8 px-4">
            <p className="text-sm">No workspaces</p>
            <p className="text-xs mt-2">Create one to get started</p>
          </div>
        ) : (
          <div className="space-y-1">
            {workspaces.map((workspace) => {
              const isExpanded = expandedWorkspaces.has(workspace.id);
              const isActive = activeWorkspaceId === workspace.id;
              const isEditing = editingWorkspace === workspace.id;

              return (
                <div key={workspace.id} className="select-none">
                  {/* Workspace Header */}
                  <div
                    className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors group ${
                      isActive ? 'bg-gray-700/50' : 'hover:bg-gray-700/30'
                    }`}
                    onClick={() => {
                      toggleWorkspace(workspace.id);
                      setActiveWorkspace(workspace.id);
                    }}
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    )}
                    {isExpanded ? (
                      <FolderOpen className="w-4 h-4 text-blue-400 flex-shrink-0" />
                    ) : (
                      <Folder className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    )}
                    
                    {isEditing ? (
                      <div className="flex-1 flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="text"
                          value={workspaceName}
                          onChange={(e) => setWorkspaceName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveWorkspaceName(workspace.id);
                            if (e.key === 'Escape') {
                              setEditingWorkspace(null);
                              setWorkspaceName('');
                            }
                          }}
                          autoFocus
                          className="flex-1 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-blue-500"
                        />
                        <button
                          onClick={() => handleSaveWorkspaceName(workspace.id)}
                          className="p-1 hover:bg-gray-600 rounded"
                        >
                          <Check className="w-3 h-3 text-green-400" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingWorkspace(null);
                            setWorkspaceName('');
                          }}
                          className="p-1 hover:bg-gray-600 rounded"
                        >
                          <X className="w-3 h-3 text-red-400" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="flex-1 text-sm text-gray-200 truncate">{workspace.name}</span>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => handleEditWorkspace(workspace.id, workspace.name, e)}
                            className="p-1 hover:bg-gray-600 rounded"
                            aria-label="Editar workspace"
                          >
                            <Edit2 className="w-3 h-3 text-gray-400" />
                          </button>
                          <button
                            onClick={(e) => handleDeleteWorkspace(workspace.id, e)}
                            className="p-1 hover:bg-gray-600 rounded"
                            aria-label="Eliminar workspace"
                          >
                            <Trash2 className="w-3 h-3 text-red-400" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Projects List */}
                  {isExpanded && (
                    <div className="ml-6 mt-1 space-y-1">
                      {workspace.projects.map((project) => {
                        const isProjectActive =
                          activeWorkspaceId === workspace.id && activeProjectId === project.id;
                        const isProjectEditing =
                          editingProject?.workspaceId === workspace.id &&
                          editingProject?.projectId === project.id;

                        return (
                          <div
                            key={project.id}
                            className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors group ${
                              isProjectActive
                                ? 'bg-blue-600/30 border border-blue-500/50'
                                : 'hover:bg-gray-700/30'
                            }`}
                            onClick={() => setActiveProject(workspace.id, project.id)}
                          >
                            {isProjectEditing ? (
                              <div className="flex-1 flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                <input
                                  type="text"
                                  value={projectName}
                                  onChange={(e) => setProjectName(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSaveProjectName();
                                    if (e.key === 'Escape') {
                                      setEditingProject(null);
                                      setProjectName('');
                                    }
                                  }}
                                  autoFocus
                                  className="flex-1 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-blue-500"
                                />
                                <button
                                  onClick={handleSaveProjectName}
                                  className="p-1 hover:bg-gray-600 rounded"
                                >
                                  <Check className="w-3 h-3 text-green-400" />
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingProject(null);
                                    setProjectName('');
                                  }}
                                  className="p-1 hover:bg-gray-600 rounded"
                                >
                                  <X className="w-3 h-3 text-red-400" />
                                </button>
                              </div>
                            ) : (
                              <>
                                <div className="w-2 h-2 rounded-full bg-gray-500 flex-shrink-0" />
                                <span className="flex-1 text-sm text-gray-300 truncate">{project.name}</span>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={(e) =>
                                      handleEditProject(workspace.id, project.id, project.name, e)
                                    }
                                    className="p-1 hover:bg-gray-600 rounded"
                                    aria-label="Editar proyecto"
                                  >
                                    <Edit2 className="w-3 h-3 text-gray-400" />
                                  </button>
                                  {workspace.projects.length > 1 && (
                                    <button
                                      onClick={(e) => handleDeleteProject(workspace.id, project.id, e)}
                                      className="p-1 hover:bg-gray-600 rounded"
                                      aria-label="Eliminar proyecto"
                                    >
                                      <Trash2 className="w-3 h-3 text-red-400" />
                                    </button>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        );
                      })}
                      <button
                        onClick={(e) => handleAddProject(workspace.id, e)}
                        className="flex items-center gap-2 p-2 rounded hover:bg-gray-700/30 text-gray-400 hover:text-gray-200 transition-colors text-sm w-full"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Nuevo Proyecto</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
