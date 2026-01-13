'use client';

import { useState, useEffect } from 'react';
import { useWindowStore } from '@/store/useWindowStore';
import { Plus, Trash2, Edit2, Check, X, ExternalLink, Globe, Github, Twitter, Mail, Star } from 'lucide-react';

interface QuickLink {
  id: string;
  title: string;
  url: string;
  icon: string;
  color: string;
}

interface QuickLinksWidgetProps {
  windowId: string;
}

const ICONS = {
  globe: Globe,
  github: Github,
  twitter: Twitter,
  mail: Mail,
  star: Star,
  link: ExternalLink,
};

const COLORS = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-red-500', 'bg-yellow-500', 'bg-pink-500', 'bg-indigo-500', 'bg-orange-500'];

export default function QuickLinksWidget({ windowId }: QuickLinksWidgetProps) {
  const { getWindows, updateWindowContent } = useWindowStore();
  const windows = getWindows();
  const window = windows.find((w) => w.id === windowId);
  
  const content = (window?.content as { links?: QuickLink[] }) || {};
  const [links, setLinks] = useState<QuickLink[]>(content.links || []);
  const [showAddLink, setShowAddLink] = useState(false);
  const [editingLink, setEditingLink] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    icon: 'globe' as keyof typeof ICONS,
    color: COLORS[0],
  });

  useEffect(() => {
    updateWindowContent(windowId, { links });
  }, [links, windowId, updateWindowContent]);

  const addLink = () => {
    if (formData.title.trim() && formData.url.trim()) {
      const link: QuickLink = {
        id: `link-${Date.now()}`,
        title: formData.title.trim(),
        url: formData.url.trim(),
        icon: formData.icon,
        color: formData.color,
      };
      setLinks([...links, link]);
      setFormData({ title: '', url: '', icon: 'globe', color: COLORS[0] });
      setShowAddLink(false);
    }
  };

  const updateLink = () => {
    if (editingLink && formData.title.trim() && formData.url.trim()) {
      setLinks(links.map(link => 
        link.id === editingLink
          ? { ...link, title: formData.title.trim(), url: formData.url.trim(), icon: formData.icon, color: formData.color }
          : link
      ));
      setFormData({ title: '', url: '', icon: 'globe', color: COLORS[0] });
      setEditingLink(null);
    }
  };

  const deleteLink = (linkId: string) => {
    setLinks(links.filter(l => l.id !== linkId));
  };

  const startEdit = (link: QuickLink) => {
    setFormData({
      title: link.title,
      url: link.url,
      icon: link.icon as keyof typeof ICONS,
      color: link.color,
    });
    setEditingLink(link.id);
    setShowAddLink(false);
  };

  const cancelEdit = () => {
    setFormData({ title: '', url: '', icon: 'globe', color: COLORS[0] });
    setEditingLink(null);
    setShowAddLink(false);
  };

  const openLink = (url: string) => {
    // Asegurar que la URL tenga protocolo
    let finalUrl = url.trim();
    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      finalUrl = 'https://' + finalUrl;
    }
    window.open(finalUrl, '_blank');
  };

  return (
    <div className="h-full flex flex-col bg-gray-800/50 text-white">
      {/* Header */}
      <div className="p-3 border-b border-gray-700/50">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Enlaces Rápidos</h3>
          <button
            onClick={() => {
              if (editingLink) cancelEdit();
              setShowAddLink(!showAddLink);
            }}
            className="p-1.5 hover:bg-gray-700 rounded transition-colors"
          >
            {showAddLink || editingLink ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          </button>
        </div>

        {/* Form */}
        {(showAddLink || editingLink) && (
          <div className="mt-3 space-y-2">
            <input
              type="text"
              placeholder="Título"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm focus:outline-none focus:border-blue-500"
            />
            <input
              type="text"
              placeholder="URL (ej: google.com)"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm focus:outline-none focus:border-blue-500"
            />
            
            {/* Icon Selector */}
            <div className="flex gap-2 items-center">
              <span className="text-xs text-gray-400">Icono:</span>
              {Object.keys(ICONS).map(iconKey => {
                const Icon = ICONS[iconKey as keyof typeof ICONS];
                return (
                  <button
                    key={iconKey}
                    onClick={() => setFormData({ ...formData, icon: iconKey as keyof typeof ICONS })}
                    className={`p-2 rounded ${formData.icon === iconKey ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
                  >
                    <Icon className="w-4 h-4" />
                  </button>
                );
              })}
            </div>

            {/* Color Selector */}
            <div className="flex gap-2 items-center">
              <span className="text-xs text-gray-400">Color:</span>
              {COLORS.map(color => (
                <button
                  key={color}
                  onClick={() => setFormData({ ...formData, color })}
                  className={`w-6 h-6 ${color} rounded ${formData.color === color ? 'ring-2 ring-white' : ''}`}
                />
              ))}
            </div>

            <div className="flex gap-2">
              <button
                onClick={editingLink ? updateLink : addLink}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm"
              >
                {editingLink ? 'Actualizar' : 'Agregar'}
              </button>
              <button
                onClick={cancelEdit}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Links Grid */}
      <div className="flex-1 overflow-y-auto p-3">
        {links.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p className="text-sm">No hay enlaces guardados</p>
            <p className="text-xs mt-2">Agrega tus sitios favoritos</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {links.map(link => {
              const Icon = ICONS[link.icon as keyof typeof ICONS] || Globe;
              
              return (
                <div
                  key={link.id}
                  className={`${link.color} rounded-lg p-4 shadow-lg group relative cursor-pointer hover:scale-105 transition-transform`}
                  onClick={() => openLink(link.url)}
                >
                  <div className="flex flex-col items-center text-center">
                    <Icon className="w-8 h-8 mb-2 text-white" />
                    <span className="text-sm font-medium text-white">{link.title}</span>
                    <span className="text-xs text-white/70 mt-1 truncate w-full">{link.url}</span>
                  </div>

                  {/* Hover Actions */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        startEdit(link);
                      }}
                      className="p-1 bg-black/30 hover:bg-black/50 rounded"
                    >
                      <Edit2 className="w-3 h-3 text-white" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteLink(link.id);
                      }}
                      className="p-1 bg-black/30 hover:bg-black/50 rounded"
                    >
                      <Trash2 className="w-3 h-3 text-white" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
