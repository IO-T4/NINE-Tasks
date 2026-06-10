"use client";

import { useTransition } from "react";
import { archiveTasksAction, deleteTaskAction } from "@/features/tasks/actions/task.actions";
import { Folder, Inbox, Trash2, ArchiveRestore } from "lucide-react";
import { TaskItem } from "@/features/tasks/components/task-item";

export function ArchiveClient({ initialTasks }: { initialTasks: any[] }) {
  const [isPending, startTransition] = useTransition();

  const handleUnarchive = (id: number) => {
    startTransition(async () => {
      await archiveTasksAction([id], false);
    });
  };

  const handleDelete = (id: number) => {
    startTransition(async () => {
      await deleteTaskAction(id);
    });
  };

  const grouped = initialTasks.reduce((acc: any, task: any) => {
    const cat = task.categoryName || "Sin Categoría";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(task);
    return acc;
  }, {});

  if (initialTasks.length === 0) {
    return (
      <div className="text-center py-20 text-muted-foreground border rounded-3xl bg-card">
        <Inbox className="w-16 h-16 mx-auto mb-4 opacity-20" />
        <p className="text-xl font-semibold">El archivo está vacío</p>
        <p>Las tareas que archives en tu Weekly Review aparecerán aquí.</p>
      </div>
    );
  }

  return (
    <div className={`space-y-10 ${isPending ? 'opacity-50 pointer-events-none' : ''}`}>
      {Object.entries(grouped).map(([category, catTasks]: [string, any]) => (
        <div key={category} className="space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2 text-foreground/80">
            <Folder className="w-5 h-5 text-primary" /> {category}
            <span className="text-sm font-normal text-muted-foreground ml-2">
              ({catTasks.length})
            </span>
          </h2>
          <div className="space-y-3">
            {catTasks.map((task: any) => (
              <div key={task.id} className="flex items-center gap-3 opacity-70 hover:opacity-100 transition-opacity">
                <div className="flex-1 min-w-0 pointer-events-none">
                  {/* Make TaskItem purely visual in archive by disabling pointer events, 
                      except we want to allow viewing subtasks if any, but since it's archive, it's mostly read-only.
                  */}
                  <TaskItem task={task} allTasks={[]} />
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleUnarchive(task.id)}
                    className="p-2 bg-card border rounded-xl hover:bg-primary/10 hover:text-primary transition-colors flex items-center justify-center gap-2"
                    title="Desarchivar (volver a Tareas)"
                  >
                    <ArchiveRestore className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => handleDelete(task.id)}
                    className="p-2 bg-card border rounded-xl hover:bg-destructive/10 hover:text-destructive transition-colors flex items-center justify-center gap-2"
                    title="Eliminar para siempre"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
