'use client';

import { useState, useEffect } from 'react';
import { useWindowStore } from '@/store/useWindowStore';
import { Plus, Trash2, Check, X } from 'lucide-react';

interface Habit {
  id: string;
  name: string;
  color: string;
  completedDates: string[]; // Array de fechas en formato YYYY-MM-DD
}

interface HabitTrackerWidgetProps {
  windowId: string;
}

const COLORS = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-red-500', 'bg-yellow-500', 'bg-pink-500', 'bg-indigo-500'];

export default function HabitTrackerWidget({ windowId }: HabitTrackerWidgetProps) {
  const { getWindows, updateWindowContent } = useWindowStore();
  const windows = getWindows();
  const window = windows.find((w) => w.id === windowId);
  
  const content = (window?.content as { habits?: Habit[] }) || {};
  const [habits, setHabits] = useState<Habit[]>(content.habits || []);
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitColor, setNewHabitColor] = useState(COLORS[0]);

  useEffect(() => {
    updateWindowContent(windowId, { habits });
  }, [habits, windowId, updateWindowContent]);

  const addHabit = () => {
    if (newHabitName.trim()) {
      const habit: Habit = {
        id: `habit-${Date.now()}`,
        name: newHabitName.trim(),
        color: newHabitColor,
        completedDates: [],
      };
      setHabits([...habits, habit]);
      setNewHabitName('');
      setNewHabitColor(COLORS[0]);
      setShowAddHabit(false);
    }
  };

  const deleteHabit = (habitId: string) => {
    setHabits(habits.filter(h => h.id !== habitId));
  };

  const toggleHabitForDate = (habitId: string, dateStr: string) => {
    setHabits(habits.map(habit => {
      if (habit.id === habitId) {
        const isCompleted = habit.completedDates.includes(dateStr);
        return {
          ...habit,
          completedDates: isCompleted
            ? habit.completedDates.filter(d => d !== dateStr)
            : [...habit.completedDates, dateStr],
        };
      }
      return habit;
    }));
  };

  const getLast30Days = () => {
    const days = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push(date);
    }
    return days;
  };

  const getDateString = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const getStreak = (habit: Habit) => {
    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < 365; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = getDateString(date);
      
      if (habit.completedDates.includes(dateStr)) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const days = getLast30Days();

  return (
    <div className="h-full flex flex-col bg-gray-800/50 text-white">
      {/* Header */}
      <div className="p-3 border-b border-gray-700/50">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Seguimiento de Hábitos</h3>
          <button
            onClick={() => setShowAddHabit(!showAddHabit)}
            className="p-1.5 hover:bg-gray-700 rounded transition-colors"
          >
            {showAddHabit ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          </button>
        </div>

        {showAddHabit && (
          <div className="mt-3 space-y-2">
            <input
              type="text"
              placeholder="Nombre del hábito"
              value={newHabitName}
              onChange={(e) => setNewHabitName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addHabit()}
              autoFocus
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm focus:outline-none focus:border-blue-500"
            />
            <div className="flex items-center gap-2">
              <div className="flex gap-1 flex-1">
                {COLORS.map(color => (
                  <button
                    key={color}
                    onClick={() => setNewHabitColor(color)}
                    className={`w-6 h-6 ${color} rounded ${newHabitColor === color ? 'ring-2 ring-white' : ''}`}
                  />
                ))}
              </div>
              <button
                onClick={addHabit}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 rounded text-sm"
              >
                Agregar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Habits Grid */}
      <div className="flex-1 overflow-y-auto p-3">
        {habits.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p className="text-sm">No hay hábitos registrados</p>
            <p className="text-xs mt-2">Agrega un hábito para comenzar</p>
          </div>
        ) : (
          <div className="space-y-4">
            {habits.map(habit => (
              <div key={habit.id} className="bg-gray-700/30 border border-gray-600/30 rounded p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 ${habit.color} rounded-full`} />
                    <span className="font-medium text-sm">{habit.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">
                      🔥 {getStreak(habit)} días
                    </span>
                    <button
                      onClick={() => deleteHabit(habit.id)}
                      className="p-1 hover:bg-red-600/50 rounded transition-colors"
                    >
                      <Trash2 className="w-3 h-3 text-gray-400" />
                    </button>
                  </div>
                </div>

                {/* Grid de días */}
                <div className="grid grid-cols-15 gap-1">
                  {days.map((date, idx) => {
                    const dateStr = getDateString(date);
                    const isCompleted = habit.completedDates.includes(dateStr);
                    const today = isToday(date);

                    return (
                      <button
                        key={idx}
                        onClick={() => toggleHabitForDate(habit.id, dateStr)}
                        className={`aspect-square rounded text-[0.5rem] flex items-center justify-center transition-colors ${
                          isCompleted
                            ? `${habit.color} text-white`
                            : 'bg-gray-700/50 hover:bg-gray-600/50'
                        } ${today ? 'ring-1 ring-white' : ''}`}
                        title={date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                      >
                        {date.getDate()}
                      </button>
                    );
                  })}
                </div>

                {/* Stats */}
                <div className="mt-2 flex gap-3 text-xs text-gray-400">
                  <span>Este mes: {habit.completedDates.filter(d => d.startsWith(new Date().toISOString().slice(0, 7))).length} días</span>
                  <span>Total: {habit.completedDates.length} días</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
