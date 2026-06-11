import { getTasksAction } from "@/features/tasks/actions/task.actions";
import { BoardClient } from "./client";

export default async function BoardPage() {
  const tasks = await getTasksAction();
  
  return (
    <div className="mx-auto w-full px-4 py-4 md:py-12 flex flex-col h-[calc(100vh-64px)] md:h-screen max-w-full">
      <header className="mb-6 flex-shrink-0">
        <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl flex items-center gap-3">
          📋 Tablero Kanban
        </h1>
        <p className="text-lg text-muted-foreground mt-2 font-light">
          Arrastra y suelta tareas entre columnas.
        </p>
      </header>
      
      <div className="flex-1 min-h-0">
        <BoardClient initialTasks={tasks} />
      </div>
    </div>
  );
}
