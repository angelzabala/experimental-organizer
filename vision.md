🚀 Project Vision: Spatial Productivity OS
1. Concepto Central
Una plataforma de productividad visual basada en un sistema de "Escritorio Web". A diferencia de las herramientas lineales (como Notion), esta permite organizar la información mediante ventanas flotantes, redimensionables y jerárquicas (carpetas dentro de carpetas), optimizando la organización espacial del cerebro.

2. Stack Tecnológico Sugerido
Frontend: Next.js 14+ (App Router), TypeScript, Tailwind CSS.

Estado Global: Zustand (Ligero, ideal para coordenadas y estados de ventanas).

Interactividad: dnd-kit (Drag & drop y resize con alto rendimiento).

Animaciones: Framer Motion (Transiciones de maximizado y apertura).

Backend/Persistencia: Supabase (Auth, PostgreSQL y Realtime).

UI Components: Radix UI / Shadcn UI (Accesibilidad y componentes base).

3. Catálogo de Widgets (Roadmap)
Fase 1: Core

Sticky Note: Notas rápidas de texto plano con colores.

Kanban Board: Gestión de tareas por estados (To Do, Doing, Done).

TODO List: Checklists simples de alta prioridad.

Fase 2: Integraciones y Utilidad

Habit Tracker: Cuadrícula visual para seguimiento de hábitos diarios.

Pomodoro Timer: Widget pequeño con estados de enfoque y descanso.

Google Calendar Bridge: Visualización de eventos y creación de notas vinculadas.

Speed Dial: Panel de enlaces directos a sitios web externos.

Fase 3: Multimedia

Media Embed: Visualizador de PDFs y reproductores de YouTube/Spotify.

Galería de Imágenes: Previsualización de recursos visuales.

4. Features para Producto Comercial (MVP+)
Workspaces Guardados: Capacidad de guardar "layouts" específicos (ej. Layout de Trabajo vs. Layout de Ocio).

Jerarquía Infinita: Carpetas que pueden contener otras carpetas o widgets, permitiendo una organización profunda.

Modo Enfoque (Solo Focus): Aislar una ventana ocultando el resto del escritorio con un clic.

Sincronización Multi-dispositivo: Persistencia de la posición y estado de las ventanas en la nube.

Personalización Estética: Temas (Dark mode, Glassmorphism, Retro OS).

5. Arquitectura de Datos (Simplificada)
El estado se manejará mediante un árbol de Nodos:

TypeScript
interface Node {
  id: string;
  parentId: string | null;
  type: 'folder' | 'widget';
  widgetType?: 'note' | 'kanban' | 'todo';
  title: string;
  position: { x: number, y: number };
  size: { w: number, h: number };
  data: any; // Contenido específico del widget
  zIndex: number;
}
6. Objetivos de Portafolio
Demostrar dominio de manipulación compleja del DOM y eventos de puntero.

Implementar una arquitectura de estado eficiente (evitando re-renders masivos al mover ventanas).

Crear una interfaz de usuario altamente interactiva que se aleje de los formularios CRUD tradicionales.