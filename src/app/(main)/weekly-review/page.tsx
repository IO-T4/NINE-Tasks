import { getTasksAction } from "@/features/tasks/actions/task.actions";
import { WeeklyReviewClient } from "./client";

export default async function WeeklyReviewPage() {
  const tasks = await getTasksAction();

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in">
      <WeeklyReviewClient initialTasks={tasks} />
    </div>
  );
}
