"use server";

import { db } from "@/lib/db/client";
import { milestones } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getMilestonesAction() {
  try {
    return await db.select().from(milestones).orderBy(milestones.createdAt);
  } catch (error) {
    return [];
  }
}

export async function createMilestoneAction(title: string, description: string = "") {
  try {
    await db.insert(milestones).values({
      title,
      description
    });
    revalidatePath("/milestones");
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

export async function toggleMilestoneAction(id: number, isCompleted: boolean) {
  try {
    await db.update(milestones).set({ isCompleted }).where(eq(milestones.id, id));
    revalidatePath("/milestones");
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

export async function deleteMilestoneAction(id: number) {
  try {
    await db.delete(milestones).where(eq(milestones.id, id));
    revalidatePath("/milestones");
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}
