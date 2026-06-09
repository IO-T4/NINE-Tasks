'use server'; // Magia de Next.js: Todo esto se ejecuta de forma segura en el servidor

import { db } from '@/lib/db/client';
import { tasks } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

// 1. Obtener todas las tareas (ordenadas por la más reciente)
export async function getTasksAction() {
  try {
    const allTasks = await db.select().from(tasks).orderBy(desc(tasks.createdAt));
    return allTasks;
  } catch (error) {
    console.error("Error al obtener las tareas:", error);
    return [];
  }
}

// 2. Crear una nueva tarea
export async function createTaskAction(title: string) {
  try {
    if (!title.trim()) throw new Error("El título es obligatorio");

    await db.insert(tasks).values({ title });

    // Le dice a Next.js que refresque la pantalla de inicio al instante
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error("Error al crear la tarea:", error);
    return { success: false, error: "No se pudo crear la tarea" };
  }
}