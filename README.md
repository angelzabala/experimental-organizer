# Experimental Organizer

Herramienta de productividad con interfaz estilo sistema operativo, construida con Next.js 14+ y TypeScript.

## Características

- 🪟 Sistema de ventanas flotantes con drag & drop
- 📝 Widget de notas adhesivas (Sticky Notes)
- 🎨 Interfaz moderna con glassmorphism
- ⚡ Gestión de estado con Zustand
- 🎯 TypeScript estricto

## Stack Tecnológico

- **Framework**: Next.js 14+ (App Router)
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS
- **Estado Global**: Zustand
- **Interacciones**: dnd-kit (drag & drop)
- **Iconos**: Lucide React

## Instalación

```bash
npm install
```

## Desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Estructura del Proyecto

```
├── app/                    # App Router de Next.js
│   ├── layout.tsx         # Layout principal
│   ├── page.tsx           # Página principal (Desktop)
│   └── globals.css        # Estilos globales
├── components/            # Componentes React
│   ├── Window.tsx         # Componente base de ventana
│   ├── WindowManager.tsx  # Gestor de ventanas
│   └── StickyNoteWidget.tsx # Widget de notas
└── store/                # Store de Zustand
    └── useWindowStore.ts  # Estado global de ventanas
```

## Funcionalidades Implementadas

### Fase 1: Proof of Concept (POC)

✅ Sistema de gestión de ventanas
✅ Arrastrar ventanas (drag & drop)
✅ Z-Index automático al hacer clic
✅ Maximizar/Restaurar ventanas
✅ Cerrar ventanas
✅ Widget de Post-it con:
  - Edición de texto
  - Persistencia en estado
  - Colores personalizables (amarillo, verde, azul)

## Próximos Pasos

- [ ] Widget de TODO
- [ ] Widget de Calendario
- [ ] Persistencia en localStorage
- [ ] Redimensionar ventanas
- [ ] Múltiples escritorios/espacios de trabajo


