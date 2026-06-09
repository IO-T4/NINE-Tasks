"use server";

import { db } from "@/lib/db/client";
import { tasks, timeEntries } from "@/lib/db/schema";
import { eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function startTimerAction(taskIds: number[]) {
  if (taskIds.length === 0) return { success: false };
  
  const now = new Date();
  
  try {
    // 1. Update tasks to "playing" state
    await db.update(tasks)
      .set({ 
        timerStatus: "playing", 
        lastTimerStartAt: now 
      })
      .where(inArray(tasks.id, taskIds));
      
    // 2. Create time entries
    await db.insert(timeEntries).values(
      taskIds.map(id => ({
        taskId: id,
        startTime: now
      }))
    );
    
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error starting timer", error);
    return { success: false };
  }
}

export async function pauseTimerAction(taskIds: number[]) {
  if (taskIds.length === 0) return { success: false };
  
  const now = new Date();
  
  try {
    // We need to fetch the current tasks to calculate time spent
    const activeTasks = await db.select().from(tasks).where(inArray(tasks.id, taskIds));
    
    for (const task of activeTasks) {
      if (task.timerStatus === "playing" && task.lastTimerStartAt) {
        const secondsSpent = Math.floor((now.getTime() - task.lastTimerStartAt.getTime()) / 1000);
        
        // Update task total time
        await db.update(tasks)
          .set({ 
            timerStatus: "idle",
            timeSpentSeconds: task.timeSpentSeconds + secondsSpent
          })
          .where(eq(tasks.id, task.id));
          
        // End the time entry (update the latest one without an end time)
        // Note: For simplicity in SQLite/Postgres we just update timeEntries where taskId matches and endTime is null
        // In Drizzle we can't easily do update limit 1, but since it's just one active per task it's fine.
        const pendingEntries = await db.select().from(timeEntries)
          .where(eq(timeEntries.taskId, task.id))
          .orderBy(timeEntries.startTime);
          
        const activeEntry = pendingEntries.find(e => !e.endTime);
        if (activeEntry) {
          await db.update(timeEntries)
            .set({ 
              endTime: now,
              durationSeconds: secondsSpent
            })
            .where(eq(timeEntries.id, activeEntry.id));
        }
      }
    }
    
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error pausing timer", error);
    return { success: false };
  }
}
