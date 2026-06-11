"use server";

import { db } from "@/lib/db/client";
import { globalProfile } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getProfileAction() {
  try {
    let [profile] = await db.select().from(globalProfile).where(eq(globalProfile.id, 1));
    if (!profile) {
      [profile] = await db.insert(globalProfile).values({ id: 1 }).returning();
    }
    return profile;
  } catch (error) {
    console.error("Error al obtener el perfil", error);
    return { id: 1, xp: 0, level: 1, prestige: 0 };
  }
}

export async function addXPAction(amount: number) {
  try {
    let profile = await getProfileAction();
    let newXp = profile.xp + amount;
    
    // XP needed per level increases. E.g. Level 1 needs 100, Level 2 needs 150...
    // Formula: nextLevelXp = currentLevel * 100
    let currentLevel = profile.level;
    let xpNeeded = currentLevel * 100;
    
    while (newXp >= xpNeeded) {
      newXp -= xpNeeded;
      currentLevel++;
      xpNeeded = currentLevel * 100;
    }
    
    // Check prestige (every 55 levels)
    let newPrestige = profile.prestige;
    if (currentLevel > 55) {
      newPrestige += Math.floor(currentLevel / 55);
      currentLevel = currentLevel % 55 || 1; 
    }
    
    await db.update(globalProfile)
      .set({ xp: newXp, level: currentLevel, prestige: newPrestige })
      .where(eq(globalProfile.id, 1));
      
    revalidatePath("/", "layout");
    return { success: true, levelUp: currentLevel > profile.level };
  } catch (error) {
    console.error("Error al sumar XP", error);
    return { success: false };
  }
}

export async function setActiveTitleAction(titleId: number | null) {
  try {
    await db.update(globalProfile).set({ activeTitleId: titleId }).where(eq(globalProfile.id, 1));
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

export async function getAttributesAction() {
  try {
    const { attributes } = await import("@/lib/db/schema");
    return await db.select().from(attributes);
  } catch (error) {
    return [];
  }
}

export async function getTitlesAction() {
  try {
    const { titles } = await import("@/lib/db/schema");
    return await db.select().from(titles);
  } catch (error) {
    return [];
  }
}

export async function getUserTitlesAction() {
  try {
    const { userTitles } = await import("@/lib/db/schema");
    return await db.select().from(userTitles);
  } catch (error) {
    return [];
  }
}
