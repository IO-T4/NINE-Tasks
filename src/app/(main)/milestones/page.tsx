import { getMilestonesAction } from "@/features/milestones/actions";
import { getTasksAction } from "@/features/tasks/actions/task.actions";
import { MilestonesClient } from "./client";

export default async function MilestonesPage() {
  const milestones = await getMilestonesAction();
  const tasks = await getTasksAction();

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in">
      <div>
        <h1 className="text-4xl font-extrabold tracking-tighter text-primary">Metas a Largo Plazo</h1>
        <p className="text-muted-foreground text-lg mt-2 font-medium">Define tus grandes objetivos y asóciales tareas para medir tu progreso.</p>
      </div>

      <MilestonesClient initialMilestones={milestones} tasks={tasks} />
    </div>
  );
}
