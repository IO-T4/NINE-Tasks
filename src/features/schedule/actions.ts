"use server";

import { db } from "@/lib/db/client";
import { schedules, scheduleExceptions } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { addXPAction } from "@/features/profile/actions";

export async function getSchedulesAction() {
  try {
    return await db.select().from(schedules);
  } catch (e) {
    return [];
  }
}

export async function getExceptionsAction() {
  try {
    return await db.select().from(scheduleExceptions);
  } catch (e) {
    return [];
  }
}

export async function createScheduleAction(data: {
  title: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  categoryId?: number;
}) {
  try {
    await db.insert(schedules).values({
      ...data,
      categoryId: data.categoryId || null
    });
    await addXPAction(20); // 20 XP for setting up a routine
    revalidatePath("/schedule");
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

export async function cancelScheduleForDateAction(scheduleId: number, dateString: string) {
  try {
    await db.insert(scheduleExceptions).values({
      scheduleId,
      exceptionDate: dateString,
      isCancelled: true
    });
    revalidatePath("/schedule");
    return { success: true };
  } catch (e) {
    return { success: false };
  }
}

export async function deleteScheduleAction(id: number) {
  try {
    await db.delete(schedules).where(eq(schedules.id, id));
    revalidatePath("/schedule");
    return { success: true };
  } catch (e) {
    return { success: false };
  }
}
