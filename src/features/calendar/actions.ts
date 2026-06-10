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

export async function fetchExternalEventsAction() {
  try {
    const calendars = await getExternalCalendarsAction();
    const ical = await import('node-ical');
    
    let allEvents: any[] = [];
    
    for (const cal of calendars) {
      try {
        const data = await ical.async.fromURL(cal.url);
        for (const k in data) {
          const ev = data[k];
          if (ev.type === 'VEVENT') {
            allEvents.push({
              id: ev.uid,
              title: ev.summary,
              start: ev.start,
              end: ev.end,
              color: cal.color,
              calendarName: cal.name
            });
          }
        }
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
