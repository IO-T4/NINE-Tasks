"use server";

import { db } from "@/lib/db/client";
import { tasks } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { addXPAction } from "@/features/profile/actions";

export async function updateTaskStatusAction(taskId: number, newStatus: "todo" | "in-progress" | "done") {
  try {
    const isCompleted = newStatus === "done";
    await db.update(tasks)
      .set({ status: newStatus, isCompleted })
      .where(eq(tasks.id, taskId));

    if (isCompleted) {
      await addXPAction(10);
    }

    revalidatePath("/");
    revalidatePath("/board");
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}
