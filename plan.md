Plan de Desarrollo: OS-Style Productivity Tool
Contexto del Proyecto
Estamos construyendo una plataforma de organización personal con una interfaz de "Sistema Operativo Web". El objetivo es permitir a los usuarios gestionar su día a día mediante ventanas flotantes que contienen widgets.

Stack Tecnológico
Framework: Next.js 14+ (App Router)

Lenguaje: TypeScript

Estilos: Tailwind CSS

Estado Global: Zustand

Interacciones: dnd-kit (para drag & drop y resize)

Iconos: Lucide React

Fase 1: Proof of Concept (POC) - Alcance Obligatorio
El objetivo de esta fase es validar el sistema de ventanas y la interactividad básica.

1. Sistema de Gestión de Ventanas (Window Manager)

Implementar un WindowManager que renderice una lista de ventanas activas desde el store de Zustand.

Cada ventana debe tener: id, title, type (widget type), position {x, y}, size {w, h}, isMaximized, y zIndex.

2. Funcionalidades de Ventana

Arrastrar: Usar dnd-kit para mover la ventana por el viewport.

Z-Index: Al hacer clic en una ventana, esta debe pasar al frente (ser la de mayor z-index).

Maximizar/Restaurar: Un botón en la barra superior que expanda la ventana al 100% del viewport y otro para volver a su tamaño y posición previos.

Cerrar: Eliminar la ventana del estado.

3. Widget de Post-it (Sticky Note)

Un widget simple dentro de una ventana que permita escribir texto.

El contenido debe persistir en el estado de Zustand (memoria local por ahora).

Color de fondo personalizable (amarillo, verde, azul pastel).

Prompt para Cursor (Copiar y Pegar)
Instrucciones para Cursor:

"Actúa como un Ingeniero de Software Senior experto en React y Next.js. Vamos a construir un MVP de una herramienta de productividad con interfaz de escritorio (OS-style).

Tarea 1: Setup de Zustand Store Crea un archivo src/store/useWindowStore.ts que gestione el estado de las ventanas. Necesito acciones para: addWindow, updateWindowPosition, toggleMaximize, y focusWindow (para manejar z-index).

Tarea 2: Componente Base de Ventana Crea un componente funcional Window.tsx que use @dnd-kit/core para el movimiento. La ventana debe tener una 'Title Bar' con botones de cerrar y maximizar/restaurar. El cuerpo de la ventana debe ser un slot para widgets.

Tarea 3: Widget de Sticky Notes Crea un componente StickyNoteWidget.tsx que sea un textarea sin bordes que ocupe todo el espacio de la ventana. Debe sincronizar su texto con el store de Zustand.

Tarea 4: El Desktop En page.tsx, implementa el área de escritorio donde se renderizarán todas las ventanas activas. Asegúrate de que el contenedor ocupe el 100vh y tenga un fondo visualmente agradable.

Reglas Técnicas:

Usa Tailwind CSS para todos los estilos.

Asegúrate de que las ventanas no se puedan arrastrar fuera de los límites visibles si es posible.

Aplica un diseño minimalista y moderno (Glassmorphism sugerido para las ventanas).

Usa TypeScript estrictamente."

Siguientes pasos sugeridos para ti:

Instalación inicial: Asegúrate de correr npx create-next-app@latest e instalar las dependencias: npm install zustand @dnd-kit/core @dnd-kit/modifiers lucide-react.

Configuración de dnd-kit: Pide a Cursor que use los modifiers de dnd-kit para restringir el movimiento al contenedor del escritorio.