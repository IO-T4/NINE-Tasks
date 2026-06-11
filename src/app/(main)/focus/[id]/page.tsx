import { db } from "@/lib/db/client";
import { tasks } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { FocusSessionClient } from "./client";
import { getCategoriesAction } from "@/features/tasks/actions/task.actions";
import { getMilestonesAction } from "@/features/milestones/actions";

export default async function FocusSessionPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const taskId = parseInt(resolvedParams.id);
  if (isNaN(taskId)) return <div>Error: ID is not a number. Received: {resolvedParams.id}</div>;

  const taskResult = await db.select().from(tasks).where(eq(tasks.id, taskId));
  if (taskResult.length === 0) return <div>Error: Task {taskId} not found in database.</div>;

  const categories = await getCategoriesAction();
  const milestones = await getMilestonesAction();

  return <FocusSessionClient task={taskResult[0]} categories={categories} milestones={milestones} />;
}
