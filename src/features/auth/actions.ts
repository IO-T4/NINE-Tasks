"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db/client";
import { sessions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const COOKIE_NAME = "nine_tasks_session";
const ONE_YEAR = 60 * 60 * 24 * 365; 

export async function loginAction(prevState: any, formData: FormData) {
  const password = formData.get("password");
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    return { error: "Contraseña de administrador no configurada en el servidor." };
  }

  if (password === adminPassword) {
    const headersList = await headers();
    const userAgent = headersList.get("user-agent") || "Desconocido";
    const ipAddress = headersList.get("x-forwarded-for") || "127.0.0.1";
    
    // Generate a secure token
    const token = crypto.randomUUID();

    // Insert into DB
    await db.insert(sessions).values({
      token,
      userAgent,
      ipAddress,
    });

    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: ONE_YEAR,
      path: "/",
      sameSite: "lax",
    });
    
    redirect("/");
  } else {
    return { error: "Contraseña incorrecta." };
  }
}

export async function logoutAction() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  
  if (token) {
    // Eliminar de DB
    await db.delete(sessions).where(eq(sessions.token, token));
  }
  
  cookieStore.delete(COOKIE_NAME);
  redirect("/login");
}

export async function revokeSessionAction(id: number) {
  try {
    await db.delete(sessions).where(eq(sessions.id, id));
    return { success: true };
  } catch (e) {
    return { success: false };
  }
}
