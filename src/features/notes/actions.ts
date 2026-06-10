"use server";

import { db } from "@/lib/db/client";
import { scratchpad } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getScratchpadAction() {
  try {
    let note = await db.select().from(scratchpad).where(eq(scratchpad.id, 1));
    if (note.length === 0) {
      const newNote = await db.insert(scratchpad).values({ id: 1, content: "" }).returning();
      return newNote[0];
    }
    return note[0];
  } catch (error) {
    return { id: 1, content: "" };
  }
}

export async function updateScratchpadAction(content: string) {
  try {
    const existing = await db.select().from(scratchpad).where(eq(scratchpad.id, 1));
    if (existing.length === 0) {
      await db.insert(scratchpad).values({ id: 1, content });
    } else {
      await db.update(scratchpad).set({ content, updatedAt: new Date() }).where(eq(scratchpad.id, 1));
    }
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}
