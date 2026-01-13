'use client';

import { useState, useEffect } from 'react';
import { useWindowStore } from '@/store/useWindowStore';
import { ChevronLeft, ChevronRight, Plus, X, Clock } from 'lucide-react';

interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  startTime?: string; // HH:MM
  endTime?: string; // HH:MM
  isAllDay: boolean;
  color: string;
}

interface CalendarWidgetProps {
  windowId: string;
}

const COLORS = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-red-500', 'bg-yellow-500', 'bg-pink-500'];

export default function CalendarWidget({ windowId }: CalendarWidgetProps) {
  const { getWindows, updateWindowContent } = useWindowStore();
  const windows = getWindows();
  const window = windows.find((w) => w.id === windowId);
  
  const content = (window?.content as { events?: CalendarEvent[] }) || {};
  const [events, setEvents] = useState<CalendarEvent[]>(content.events || []);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [newEvent, setNewEvent] = useState({ 
    title: '', 
    date: '', 
    startTime: '', 
    endTime: '', 
    isAllDay: false,
    color: COLORS[0] 
  });

  useEffect(() => {
    updateWindowContent(windowId, { events });
  }, [events, windowId, updateWindowContent]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek };
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const addEvent = () => {
    if (newEvent.title.trim() && newEvent.date) {
      const event: CalendarEvent = {
        id: `event-${Date.now()}`,
        title: newEvent.title.trim(),
        date: newEvent.date,
        startTime: newEvent.isAllDay ? undefined : (newEvent.startTime || undefined),
        endTime: newEvent.isAllDay ? undefined : (newEvent.endTime || undefined),
        isAllDay: newEvent.isAllDay,
        color: newEvent.color,
      };
      setEvents([...events, event]);
      setNewEvent({ 
        title: '', 
        date: '', 
        startTime: '', 
        endTime: '', 
        isAllDay: false,
        color: COLORS[0] 
      });
      setShowAddEvent(false);
    }
  };

  const deleteEvent = (eventId: string) => {
    setEvents(events.filter(e => e.id !== eventId));
  };

  const getEventsForDate = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(e => e.date === dateStr);
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="h-full flex flex-col bg-gray-800/50 text-white">
      {/* Header */}
      <div className="p-3 border-b border-gray-700/50 flex items-center justify-between">
        <button onClick={previousMonth} className="p-1 hover:bg-gray-700 rounded">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h3 className="text-lg font-semibold">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h3>
        <button onClick={nextMonth} className="p-1 hover:bg-gray-700 rounded">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 p-3 overflow-y-auto">
        {/* Day Names */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map(day => (
            <div key={day} className="text-center text-xs font-semibold text-gray-400 py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: startingDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dayEvents = getEventsForDate(day);
            const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();

            return (
              <div
                key={day}
                className={`aspect-square border border-gray-700/50 rounded p-1 text-sm ${
                  isToday ? 'bg-blue-600/20 border-blue-500' : 'bg-gray-700/30'
                } hover:bg-gray-700/50 transition-colors`}
              >
                <div className="font-semibold">{day}</div>
                {dayEvents.slice(0, 2).map(event => (
                  <div
                    key={event.id}
                    className={`text-xs ${event.color} text-white px-1 rounded mt-0.5 truncate`}
                    title={`${event.title}${event.startTime ? ` - ${event.startTime}${event.endTime ? ` a ${event.endTime}` : ''}` : ''}`}
                  >
                    {!event.isAllDay && event.startTime && <Clock className="w-2 h-2 inline mr-0.5" />}
                    {event.title}
                  </div>
                ))}
                {dayEvents.length > 2 && (
                  <div className="text-xs text-gray-400">+{dayEvents.length - 2}</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Event Form */}
      <div className="p-3 border-t border-gray-700/50">
        {showAddEvent ? (
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Event title"
              value={newEvent.title}
              onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && addEvent()}
              autoFocus
              className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm focus:outline-none focus:border-blue-500"
            />
            <input
              type="date"
              value={newEvent.date}
              onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
              className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm focus:outline-none focus:border-blue-500"
            />
            
            {/* All Day Toggle */}
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={newEvent.isAllDay}
                onChange={(e) => setNewEvent({ ...newEvent, isAllDay: e.target.checked })}
                className="w-4 h-4 rounded"
              />
              <span>Evento de todo el día</span>
            </label>

            {/* Time Inputs - only show if not all day */}
            {!newEvent.isAllDay && (
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-xs text-gray-400 block mb-1">Hora inicio</label>
                  <input
                    type="time"
                    value={newEvent.startTime}
                    onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                    className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-gray-400 block mb-1">Hora fin</label>
                  <input
                    type="time"
                    value={newEvent.endTime}
                    onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                    className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            )}

            {/* Color Picker */}
            <div className="flex gap-2 items-center">
              <span className="text-xs text-gray-400">Color:</span>
              <div className="flex gap-1">
                {COLORS.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setNewEvent({ ...newEvent, color })}
                    className={`w-6 h-6 ${color} rounded ${newEvent.color === color ? 'ring-2 ring-white' : ''}`}
                  />
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button 
                onClick={addEvent} 
                disabled={!newEvent.title.trim() || !newEvent.date}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded text-sm flex-1"
              >
                Agregar
              </button>
              <button 
                onClick={() => {
                  setShowAddEvent(false);
                  setNewEvent({ 
                    title: '', 
                    date: '', 
                    startTime: '', 
                    endTime: '', 
                    isAllDay: false,
                    color: COLORS[0] 
                  });
                }} 
                className="p-1 hover:bg-gray-700 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowAddEvent(true)}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Agregar Evento
          </button>
        )}
      </div>

      {/* Events List */}
      {events.length > 0 && (
        <div className="p-3 border-t border-gray-700/50 max-h-40 overflow-y-auto">
          <h4 className="text-xs font-semibold text-gray-400 mb-2">Próximos Eventos</h4>
          {events
            .sort((a, b) => {
              const dateCompare = a.date.localeCompare(b.date);
              if (dateCompare !== 0) return dateCompare;
              if (a.isAllDay && !b.isAllDay) return -1;
              if (!a.isAllDay && b.isAllDay) return 1;
              return (a.startTime || '').localeCompare(b.startTime || '');
            })
            .slice(0, 8)
            .map(event => (
              <div key={event.id} className="flex items-center gap-2 mb-1 text-sm p-2 bg-gray-700/30 rounded hover:bg-gray-700/50 transition-colors">
                <div className={`w-2 h-2 ${event.color} rounded-full flex-shrink-0`} />
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{event.title}</div>
                  <div className="text-xs text-gray-400">
                    {new Date(event.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                    {event.isAllDay ? ' - Todo el día' : event.startTime ? ` - ${event.startTime}${event.endTime ? ` a ${event.endTime}` : ''}` : ''}
                  </div>
                </div>
                <button onClick={() => deleteEvent(event.id)} className="p-1 hover:bg-red-600/50 rounded flex-shrink-0">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
