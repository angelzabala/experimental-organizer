'use client';

import { useState, useEffect } from 'react';
import { useWindowStore } from '@/store/useWindowStore';
import { Plus, Trash2, Check, X } from 'lucide-react';

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
}

interface TodoListWidgetProps {
  windowId: string;
}

export default function TodoListWidget({ windowId }: TodoListWidgetProps) {
  const { getWindows, updateWindowContent } = useWindowStore();
  const windows = getWindows();
  const window = windows.find((w) => w.id === windowId);
  
  const content = (window?.content as { todos?: TodoItem[] }) || {};
  const [todos, setTodos] = useState<TodoItem[]>(content.todos || []);
  const [newTodoText, setNewTodoText] = useState('');

  useEffect(() => {
    updateWindowContent(windowId, { todos });
  }, [todos, windowId, updateWindowContent]);

  const addTodo = () => {
    if (newTodoText.trim()) {
      const newTodo: TodoItem = {
        id: `todo-${Date.now()}-${Math.random()}`,
        text: newTodoText.trim(),
        completed: false,
      };
      setTodos([...todos, newTodo]);
      setNewTodoText('');
    }
  };

  const toggleTodo = (id: string) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addTodo();
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-800/50">
      {/* Input Section */}
      <div className="p-3 border-b border-gray-700/50">
        <div className="flex gap-2">
          <input
            type="text"
            value={newTodoText}
            onChange={(e) => setNewTodoText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Agregar nueva tarea..."
            className="flex-1 px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          <button
            onClick={addTodo}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors flex items-center gap-1"
            aria-label="Agregar tarea"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Todo List */}
      <div className="flex-1 overflow-y-auto p-3">
        {todos.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            <p>No hay tareas pendientes</p>
            <p className="text-sm mt-2">Agrega una nueva tarea arriba</p>
          </div>
        ) : (
          <div className="space-y-2">
            {todos.map((todo) => (
              <div
                key={todo.id}
                className={`flex items-center gap-2 p-2 rounded bg-gray-700/30 border border-gray-600/30 hover:bg-gray-700/50 transition-colors ${
                  todo.completed ? 'opacity-60' : ''
                }`}
              >
                <button
                  onClick={() => toggleTodo(todo.id)}
                  className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                    todo.completed
                      ? 'bg-green-600 border-green-600'
                      : 'border-gray-500 hover:border-green-500'
                  }`}
                  aria-label={todo.completed ? 'Marcar como pendiente' : 'Marcar como completada'}
                >
                  {todo.completed && <Check className="w-3 h-3 text-white" />}
                </button>
                <span
                  className={`flex-1 text-sm ${
                    todo.completed
                      ? 'line-through text-gray-400'
                      : 'text-gray-200'
                  }`}
                >
                  {todo.text}
                </span>
                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="flex-shrink-0 p-1 hover:bg-red-600/50 rounded transition-colors"
                  aria-label="Eliminar tarea"
                >
                  <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-400" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Stats */}
      {todos.length > 0 && (
        <div className="p-2 border-t border-gray-700/50 bg-gray-800/30">
          <p className="text-xs text-gray-400 text-center">
            {todos.filter(t => t.completed).length} de {todos.length} completadas
          </p>
        </div>
      )}
    </div>
  );
}


