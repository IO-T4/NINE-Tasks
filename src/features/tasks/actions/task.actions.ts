'use server';

import { db } from '@/lib/db/client';
import { tasks, categories } from '@/lib/db/schema';
import { desc, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { addXPAction } from '@/features/profile/actions';

// Categorías
export async function getCategoriesAction() {
  try {
    return await db.select().from(categories).orderBy(desc(categories.createdAt));
  } catch (error) {
    console.error("Error al obtener categorías:", error);
    return [];
  }
}

export async function createCategoryAction(name: string, color: string = "blue") {
  try {
    const [newCat] = await db.insert(categories).values({ name, color }).returning();
    revalidatePath('/');
    revalidatePath('/projects');
    return { success: true, category: newCat };
  } catch (error) {
    console.error("Error al crear categoría:", error);
    return { success: false };
  }
}

export async function deleteCategoryAction(id: number) {
  try {
    await db.delete(categories).where(eq(categories.id, id));
    revalidatePath('/');
    revalidatePath('/projects');
    return { success: true };
  } catch (error) {
    console.error("Error al eliminar categoría:", error);
    return { success: false };
  }
}

export async function updateCategoryAction(id: number, name: string, color: string) {
  try {
    await db.update(categories).set({ name, color }).where(eq(categories.id, id));
    revalidatePath('/');
    revalidatePath('/projects');
    return { success: true };
  } catch (error) {
    console.error("Error al actualizar categoría:", error);
    return { success: false };
  }
}

// Tareas
export async function getTasksAction() {
  try {
    // Join tasks with categories
    const allTasks = await db
      .select({
        id: tasks.id,
        title: tasks.title,
        description: tasks.description,
        isCompleted: tasks.isCompleted,
        status: tasks.status,
        priority: tasks.priority,
        dueDate: tasks.dueDate,
        createdAt: tasks.createdAt,
        categoryId: tasks.categoryId,
        categoryName: categories.name,
        categoryColor: categories.color,
        timerStatus: tasks.timerStatus,
        timeSpentSeconds: tasks.timeSpentSeconds,
        parentId: tasks.parentId,
        orderIndex: tasks.orderIndex,
        milestoneId: tasks.milestoneId,
        isArchived: tasks.isArchived,
        isPinned: tasks.isPinned,
        isMicroTask: tasks.isMicroTask,
      })
      .from(tasks)
      .leftJoin(categories, eq(tasks.categoryId, categories.id))
      .where(eq(tasks.isArchived, false))
      .orderBy(tasks.orderIndex, desc(tasks.createdAt));
      
    return allTasks;
  } catch (error) {
    console.error("Error al obtener las tareas:", error);
    return [];
  }
}

export async function toggleTaskPinAction(id: number, isPinned: boolean) {
  try {
    await db.update(tasks).set({ isPinned }).where(eq(tasks.id, id));
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

export async function getArchivedTasksAction() {
  try {
    const allTasks = await db
      .select({
        id: tasks.id,
        title: tasks.title,
        description: tasks.description,
        isCompleted: tasks.isCompleted,
        status: tasks.status,
        priority: tasks.priority,
        dueDate: tasks.dueDate,
        createdAt: tasks.createdAt,
        categoryId: tasks.categoryId,
        categoryName: categories.name,
        categoryColor: categories.color,
        isArchived: tasks.isArchived,
      })
      .from(tasks)
      .leftJoin(categories, eq(tasks.categoryId, categories.id))
      .where(eq(tasks.isArchived, true))
      .orderBy(desc(tasks.createdAt));
      
    return allTasks;
  } catch (error) {
    return [];
  }
}

export async function archiveTasksAction(ids: number[], archive: boolean = true) {
  try {
    for (const id of ids) {
      await db.update(tasks).set({ isArchived: archive }).where(eq(tasks.id, id));
    }
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

export async function createTaskAction(
  title: string, 
  priority: "low" | "medium" | "high" | "urgent",
  energyLevel: "low" | "medium" | "high",
  categoryId: number | null = null,
  dueDate: Date | null = null,
  parentId: number | null = null,
  milestoneId: number | null = null,
  isMicroTask: boolean = false
) {
  try {
    if (!title.trim()) throw new Error("El título es obligatorio");

    await db.insert(tasks).values({ 
      title,
      priority,
      energyLevel,
      categoryId: categoryId || null,
      dueDate: dueDate || null,
      parentId: parentId || null,
      milestoneId: milestoneId || null,
      isMicroTask,
      status: "todo"
    });

    await addXPAction(10); // 10 XP per task created

    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error("Error al crear la tarea:", error);
    return { success: false, error: "No se pudo crear la tarea" };
  }
}

export async function toggleTaskAction(id: number, isCompleted: boolean) {
  try {
    const newStatus = isCompleted ? "done" : "todo";
    await db.update(tasks)
      .set({ isCompleted, status: newStatus })
      .where(eq(tasks.id, id));
      
    if (isCompleted) {
      // Add 10 XP for completing a task
      await addXPAction(10);
    }
    
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error("Error al actualizar la tarea:", error);
    return { success: false };
  }
}

export async function updateTaskTimeAction(id: number, timeSpentSeconds: number) {
  try {
    await db.update(tasks).set({ timeSpentSeconds }).where(eq(tasks.id, id));
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

export async function updateTaskStatusAction(id: number, status: "todo" | "in-progress" | "done") {
  try {
    const isCompleted = status === "done";
    await db.update(tasks)
      .set({ status, isCompleted })
      .where(eq(tasks.id, id));
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

export async function deleteTaskAction(id: number) {
  try {
    await db.delete(tasks).where(eq(tasks.id, id));
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error("Error al eliminar la tarea:", error);
    return { success: false };
  }
}

export async function updateTaskOrderAction(updates: { id: number; orderIndex: number }[]) {
  try {
    // Basic bulk update loop
    for (const u of updates) {
      await db.update(tasks).set({ orderIndex: u.orderIndex }).where(eq(tasks.id, u.id));
    }
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}