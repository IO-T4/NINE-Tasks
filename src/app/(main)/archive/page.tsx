import { getArchivedTasksAction } from "@/features/tasks/actions/task.actions";
import { ArchiveClient } from "./client";

export default async function ArchivePage() {
  const archivedTasks = await getArchivedTasksAction();

  return (
    <div className="max-w-5xl mx-auto w-full px-4 py-4 md:py-12 space-y-8 animate-in fade-in">
      <div>
        <h1 className="text-4xl font-extrabold tracking-tighter text-primary">Archivo Histórico</h1>
        <p className="text-muted-foreground text-lg mt-2 font-medium">Consulta tus tareas antiguas. Fuera de la vista principal, pero nunca olvidadas.</p>
      </div>

      <ArchiveClient initialTasks={archivedTasks} />
    </div>
  );
}
