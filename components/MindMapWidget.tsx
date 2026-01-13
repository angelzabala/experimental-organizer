'use client';

import { useState, useEffect, useRef } from 'react';
import { useWindowStore } from '@/store/useWindowStore';
import { Plus, Trash2, Edit2, Check } from 'lucide-react';

interface MindMapNode {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  children: string[]; // IDs de nodos hijos
}

interface MindMapWidgetProps {
  windowId: string;
}

const COLORS = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-red-500', 'bg-yellow-500', 'bg-pink-500'];

export default function MindMapWidget({ windowId }: MindMapWidgetProps) {
  const { getWindows, updateWindowContent } = useWindowStore();
  const windows = getWindows();
  const window = windows.find((w) => w.id === windowId);
  
  const content = (window?.content as { nodes?: MindMapNode[] }) || {};
  const [nodes, setNodes] = useState<MindMapNode[]>(content.nodes || [
    { id: 'root', text: 'Idea Central', x: 250, y: 150, color: COLORS[0], children: [] }
  ]);
  const [draggingNode, setDraggingNode] = useState<string | null>(null);
  const [editingNode, setEditingNode] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    updateWindowContent(windowId, { nodes });
  }, [nodes, windowId, updateWindowContent]);

  const addChildNode = (parentId: string) => {
    const parent = nodes.find(n => n.id === parentId);
    if (!parent) return;

    const newNode: MindMapNode = {
      id: `node-${Date.now()}`,
      text: 'Nueva Idea',
      x: parent.x + 150,
      y: parent.y + (parent.children.length * 80) - 40,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      children: [],
    };

    setNodes([
      ...nodes.map(n => 
        n.id === parentId 
          ? { ...n, children: [...n.children, newNode.id] }
          : n
      ),
      newNode,
    ]);
  };

  const deleteNode = (nodeId: string) => {
    if (nodeId === 'root') return; // No eliminar el nodo raíz
    
    // Eliminar referencias en los padres
    const updatedNodes = nodes
      .filter(n => n.id !== nodeId)
      .map(n => ({
        ...n,
        children: n.children.filter(childId => childId !== nodeId),
      }));
    
    setNodes(updatedNodes);
  };

  const startEdit = (nodeId: string, currentText: string) => {
    setEditingNode(nodeId);
    setEditText(currentText);
  };

  const saveEdit = () => {
    if (editingNode && editText.trim()) {
      setNodes(nodes.map(n => 
        n.id === editingNode ? { ...n, text: editText.trim() } : n
      ));
    }
    setEditingNode(null);
    setEditText('');
  };

  const handleMouseDown = (nodeId: string) => {
    setDraggingNode(nodeId);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (draggingNode && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      setNodes(nodes.map(n => 
        n.id === draggingNode ? { ...n, x, y } : n
      ));
    }
  };

  const handleMouseUp = () => {
    setDraggingNode(null);
  };

  const changeNodeColor = (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;
    
    const currentIndex = COLORS.indexOf(node.color);
    const nextColor = COLORS[(currentIndex + 1) % COLORS.length];
    
    setNodes(nodes.map(n => 
      n.id === nodeId ? { ...n, color: nextColor } : n
    ));
  };

  return (
    <div className="h-full flex flex-col bg-gray-800/50 text-white">
      {/* Header */}
      <div className="p-3 border-b border-gray-700/50 flex items-center justify-between">
        <h3 className="text-sm font-semibold">Mapa Mental</h3>
        <div className="text-xs text-gray-400">
          Arrastra nodos • Click derecho para opciones
        </div>
      </div>

      {/* Canvas */}
      <div 
        ref={canvasRef}
        className="flex-1 relative overflow-hidden bg-gray-900/30"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {/* SVG para las líneas de conexión */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {nodes.map(node => 
            node.children.map(childId => {
              const child = nodes.find(n => n.id === childId);
              if (!child) return null;
              
              return (
                <line
                  key={`${node.id}-${childId}`}
                  x1={node.x + 50}
                  y1={node.y + 20}
                  x2={child.x}
                  y2={child.y + 20}
                  stroke="#4B5563"
                  strokeWidth="2"
                />
              );
            })
          )}
        </svg>

        {/* Nodos */}
        {nodes.map(node => (
          <div
            key={node.id}
            className={`absolute ${node.color} rounded-lg shadow-lg cursor-move group`}
            style={{
              left: node.x,
              top: node.y,
              minWidth: '100px',
              padding: '8px 12px',
            }}
            onMouseDown={() => handleMouseDown(node.id)}
            onContextMenu={(e) => {
              e.preventDefault();
              changeNodeColor(node.id);
            }}
          >
            {editingNode === node.id ? (
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') saveEdit();
                    if (e.key === 'Escape') setEditingNode(null);
                  }}
                  autoFocus
                  className="flex-1 px-2 py-1 bg-white/20 border border-white/30 rounded text-xs focus:outline-none"
                />
                <button
                  onClick={saveEdit}
                  className="p-1 hover:bg-white/20 rounded"
                >
                  <Check className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <>
                <div className="text-sm font-medium text-white">{node.text}</div>
                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      startEdit(node.id, node.text);
                    }}
                    className="p-1 bg-black/20 hover:bg-black/40 rounded"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      addChildNode(node.id);
                    }}
                    className="p-1 bg-black/20 hover:bg-black/40 rounded"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                  {node.id !== 'root' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNode(node.id);
                      }}
                      className="p-1 bg-black/20 hover:bg-black/40 rounded"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-2 border-t border-gray-700/50 text-xs text-gray-400 text-center">
        {nodes.length} nodos • Click derecho para cambiar color
      </div>
    </div>
  );
}
