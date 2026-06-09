'use server';

import { db } from '@/lib/db/client';
import { tasks, categories } from '@/lib/db/schema';
import { desc, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

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
    return { success: true, category: newCat };
  } catch (error) {
    console.error("Error al crear categoría:", error);
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
      })
      .from(tasks)
      .leftJoin(categories, eq(tasks.categoryId, categories.id))
      .orderBy(desc(tasks.createdAt));
      
    return allTasks;
  } catch (error) {
    console.error("Error al obtener las tareas:", error);
    return [];
  }
}

export async function createTaskAction(
  title: string, 
  priority: "low" | "medium" | "high" | "urgent" = "medium",
  categoryId?: number | null
) {
  try {
    if (!title.trim()) throw new Error("El título es obligatorio");

    await db.insert(tasks).values({ 
      title,
      priority,
      categoryId: categoryId || null,
      status: "todo"
    });

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
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error("Error al actualizar la tarea:", error);
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