"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db/client";
import { sessions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";

const COOKIE_NAME = "nine_tasks_v2";
const ONE_YEAR = 60 * 60 * 24 * 365; 

export async function loginAction(prevState: any, formData: FormData) {
  const deviceName = formData.get("deviceName")?.toString();
  const password = formData.get("password")?.toString();
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    return { error: "Contraseña maestra no configurada en el servidor." };
  }

  if (!deviceName || !password) {
    return { error: "Nombre del dispositivo y contraseña son obligatorios." };
  }

  if (password !== adminPassword) {
    return { error: "Contraseña incorrecta." };
  }

  // Check if any sessions exist
  const allSessions = await db.select().from(sessions);
  const isFirstDevice = allSessions.length === 0;

  const existingDevice = allSessions.find(s => s.deviceName?.toLowerCase() === deviceName.toLowerCase());

  const headersList = await headers();
  const userAgent = headersList.get("user-agent") || "Desconocido";
  const ipAddress = headersList.get("x-forwarded-for") || "127.0.0.1";
  
  const token = crypto.randomUUID();

  if (existingDevice) {
    // Update existing device's token and info
    await db.update(sessions)
      .set({
        token,
        userAgent,
        ipAddress,
        lastSeenAt: new Date()
      })
      .where(eq(sessions.id, existingDevice.id));
  } else {
    // Insert new device
    await db.insert(sessions).values({
      token,
      deviceName,
      isAdmin: isFirstDevice, // The first device is MASTER_ADMIN
      userAgent,
      ipAddress,
    });
  }

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: ONE_YEAR,
    path: "/",
    sameSite: "lax",
  });
  
  redirect("/");
}

export async function logoutAction() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  
  if (token) {
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

export async function updateDeviceRoleAction(sessionId: number, isAdmin: boolean) {
  try {
    await db.update(sessions).set({ isAdmin }).where(eq(sessions.id, sessionId));
    return { success: true };
  } catch (e) {
    return { success: false };
  }
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  
  const [sessionRecord] = await db.select()
    .from(sessions)
    .where(eq(sessions.token, token));
    
  if (!sessionRecord) return null;
  
  // Return the session object itself as the "user"
  return {
    ...sessionRecord,
    role: sessionRecord.isAdmin ? "admin" : "user"
  };
}
