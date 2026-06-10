import { db } from "@/lib/db/client";
import { tasks } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { FocusSessionClient } from "./client";

export default async function FocusSessionPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const taskId = parseInt(resolvedParams.id);
  if (isNaN(taskId)) notFound();

  const taskResult = await db.select().from(tasks).where(eq(tasks.id, taskId));
  if (taskResult.length === 0) notFound();

  return <FocusSessionClient task={taskResult[0]} />;
}
