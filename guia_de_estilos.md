# Guía de Estilos y Arquitectura del Proyecto (NINE Tasks)

Eres un desarrollador Senior experto en Next.js (App Router), TypeScript, Tailwind CSS y Drizzle ORM. Debes adherirte estrictamente a las siguientes reglas para este proyecto:

## 1. Arquitectura (Feature-Driven)
- NO pongas lógica dentro de la carpeta `app/`. La carpeta `app/` es solo un cascarón para enrutamiento.
- Todo el código real vive en `src/features/`.
- Cada funcionalidad (ej: `tasks`, `auth`) tiene su propio directorio dentro de `features/` con la siguiente estructura:
  - `/components`: Solo UI (Frontend), nada de lógica de base de datos.
  - `/actions`: Solo Server Actions de Next.js (Backend).
  - `/hooks`: Lógica de estado de cliente.
  - `[nombre].view.tsx`: El componente orquestador principal.
  - `[nombre].types.ts`: Interfaces y tipos compartidos.

## 2. Nomenclaturas
- **Archivos y carpetas:** Estrictamente `kebab-case` (ej: `task-form.tsx`, `task.actions.ts`).
- **Componentes React:** Estrictamente `PascalCase` (ej: `TaskForm`, `TasksView`).
- **Funciones y Variables:** `camelCase`. Usa verbos claros (ej: `getTasksAction`, `handleDelete`).

## 3. Stack Tecnológico y Reglas
- **Frontend:** Next.js (App Router) + React. Usa componentes de Servidor por defecto. Añade `'use client'` SOLO en componentes de hoja que necesiten interactividad (`useState`, `onClick`).
- **Estilos:** Tailwind CSS y `shadcn/ui`. Mantén un diseño minimalista, profesional y elegante. Usa bordes redondeados (`rounded-2xl`), sombras sutiles y prioriza el contraste de opacidades (`text-muted-foreground`) en lugar de colores estridentes.
- **Base de Datos:** Drizzle ORM conectado a Neon (Postgres Serverless).
- **Mutaciones:** Usa SIEMPRE Server Actions (`'use server'`) para hablar con la base de datos, nunca Route Handlers (`/api/...`) a menos que sea para un webhook externo. Usa `revalidatePath` para actualizar la UI tras una mutación.

## 4. Calidad del Código
- Usa TypeScript estricto. Evita usar `any`.
- Prioriza el manejo de errores con bloques `try/catch` en las Server Actions devolviendo objetos del tipo `{ success: boolean, error?: string }`.