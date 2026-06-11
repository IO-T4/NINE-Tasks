import { getTasksAction } from "@/features/tasks/actions/task.actions";
import { FocusClient } from "./client";

export default async function FocusPage() {
  const tasks = await getTasksAction();
  
  return (
    <div className="max-w-4xl mx-auto w-full px-4 py-4 md:py-12">
      <header className="mb-10 border-b pb-8 border-border/40">
        <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl flex items-center gap-3">
          🎯 Focus 
          <span className="text-muted-foreground font-light text-xl md:text-2xl mt-1">Próximos 7 días</span>
        </h1>
        <p className="text-lg text-muted-foreground mt-2 font-light">
          Aísla el ruido exterior. Céntrate exclusivamente en lo más inminente.
        </p>
      </header>
      
      <FocusClient tasks={tasks} />
    </div>
  );
}
