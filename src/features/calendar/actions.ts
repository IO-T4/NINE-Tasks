"use server";

import { db } from "@/lib/db/client";
import { externalCalendars } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getExternalCalendarsAction() {
  try {
    return await db.select().from(externalCalendars);
  } catch (error) {
    return [];
  }
}

export async function addExternalCalendarAction(name: string, url: string, color: string) {
  try {
    await db.insert(externalCalendars).values({ name, url, color });
    revalidatePath("/admin");
    revalidatePath("/calendar");
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

export async function deleteExternalCalendarAction(id: number) {
  try {
    await db.delete(externalCalendars).where(eq(externalCalendars.id, id));
    revalidatePath("/admin");
    revalidatePath("/calendar");
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

export async function updateExternalCalendarColorAction(id: number, color: string) {
  try {
    await db.update(externalCalendars).set({ color }).where(eq(externalCalendars.id, id));
    revalidatePath("/admin");
    revalidatePath("/calendar");
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

export async function fetchExternalEventsAction() {
  try {
    const calendars = await getExternalCalendarsAction();
    // ical.js is a CommonJS module, sometimes default import needs specific handling
    const ICAL = require('ical.js');
    
    let allEvents: any[] = [];
    
    for (const cal of calendars) {
      try {
        const response = await fetch(cal.url, { next: { revalidate: 3600 } }); // Cache 1 hour
        if (!response.ok) throw new Error(`Failed to fetch ${cal.url}`);
        const icsData = await response.text();
        
        const jcalData = ICAL.parse(icsData);
        const comp = new ICAL.Component(jcalData);
        const vevents = comp.getAllSubcomponents('vevent');
        
        vevents.forEach((vevent: any) => {
          const event = new ICAL.Event(vevent);
          allEvents.push({
            id: event.uid,
            title: event.summary,
            start: event.startDate.toJSDate(),
            end: event.endDate ? event.endDate.toJSDate() : event.startDate.toJSDate(),
            color: cal.color,
            calendarName: cal.name
          });
        });
      } catch (err) {
        console.error("Error fetching calendar", cal.url, err);
      }
    }
    
    return allEvents;
  } catch (error) {
    console.error("Error fetching external events", error);
    return [];
  }
}

import { calendarEvents } from "@/lib/db/schema";

export async function getCalendarEventsAction() {
  try {
    return await db.select().from(calendarEvents);
  } catch (error) {
    return [];
  }
}

export async function createCalendarEventAction(title: string, startAt: Date, endAt: Date, color: string, categoryId: number | null = null, description: string = "") {
  try {
    await db.insert(calendarEvents).values({
      title,
      startAt,
      endAt,
      color,
      categoryId,
      description
    });
    revalidatePath("/calendar");
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

export async function deleteCalendarEventAction(id: number) {
  try {
    await db.delete(calendarEvents).where(eq(calendarEvents.id, id));
    revalidatePath("/calendar");
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}
