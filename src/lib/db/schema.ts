import { pgTable, serial, text, boolean, timestamp, integer } from "drizzle-orm/pg-core";

export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  token: text("token").notNull().unique(),
  userAgent: text("user_agent"),
  ipAddress: text("ip_address"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastSeenAt: timestamp("last_seen_at").defaultNow().notNull(),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  color: text("color").default("blue").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  
  // Advanced fields
  status: text("status", { enum: ["todo", "in-progress", "done"] }).default("todo").notNull(),
  priority: text("priority", { enum: ["low", "medium", "high", "urgent"] }).default("medium").notNull(),
  dueDate: timestamp("due_date"),
  
  // Relations
  categoryId: integer("category_id").references(() => categories.id, { onDelete: 'set null' }),
  
  // Legacy / derived boolean for simplicity
  isCompleted: boolean("is_completed").default(false).notNull(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});