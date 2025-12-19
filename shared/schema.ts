import { sql } from "drizzle-orm";
import { pgTable, text, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export enum TaskStatus {
  PENDING = "pending",
  RUNNING = "running",
  COMPLETED = "completed",
  FAILED = "failed",
  SCHEDULED = "scheduled",
}

export interface Task {
  id: string;
  goal: string;
  status: TaskStatus;
  assignedAgentId: string;
  inputs: string[];
  outputs: string[];
  successCriteria: string;
  iterationCount: number;
  maxIterations: number;
  maxDurationSeconds?: number;
  startedAt?: Date;
  scheduledStartTime?: Date;
  runIntervalMinutes?: number;
  lastRunAt?: Date;
}