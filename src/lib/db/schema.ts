import { pgTable, serial, text, boolean, timestamp, integer, date, time } from "drizzle-orm/pg-core";

export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  token: text("token").notNull().unique(),
  deviceName: text("device_name"),
  isAdmin: boolean("is_admin").default(false).notNull(),
  userAgent: text("user_agent"),
  ipAddress: text("ip_address"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastSeenAt: timestamp("last_seen_at").defaultNow().notNull(),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  color: text("color").default("blue").notNull(),
  isCompleted: boolean("is_completed").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status", { enum: ["todo", "in-progress", "done"] }).default("todo").notNull(),
  priority: text("priority", { enum: ["low", "medium", "high", "urgent"] }).default("medium").notNull(),
  dueDate: timestamp("due_date"),
  categoryId: integer("category_id").references(() => categories.id, { onDelete: 'set null' }),
  isCompleted: boolean("is_completed").default(false).notNull(),
  
  // Time tracking fields
  timeSpentSeconds: integer("time_spent_seconds").default(0).notNull(),
  timerStatus: text("timer_status", { enum: ["idle", "playing"] }).default("idle").notNull(),
  lastTimerStartAt: timestamp("last_timer_start_at"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const timeEntries = pgTable("time_entries", {
  id: serial("id").primaryKey(),
  taskId: integer("task_id").references(() => tasks.id, { onDelete: 'cascade' }).notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  durationSeconds: integer("duration_seconds").default(0).notNull(),
});

export const schedules = pgTable("schedules", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  dayOfWeek: integer("day_of_week").notNull(), // 0=Sunday, 1=Monday...
  startTime: time("start_time").notNull(),
  endTime: time("end_time").notNull(),
  startDate: date("start_date"), // YYYY-MM-DD
  endDate: date("end_date"), // YYYY-MM-DD
  categoryId: integer("category_id").references(() => categories.id, { onDelete: 'set null' }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const scheduleExceptions = pgTable("schedule_exceptions", {
  id: serial("id").primaryKey(),
  scheduleId: integer("schedule_id").references(() => schedules.id, { onDelete: 'cascade' }).notNull(),
  exceptionDate: date("exception_date").notNull(), // The specific date altered
  isCancelled: boolean("is_cancelled").default(true).notNull(),
});