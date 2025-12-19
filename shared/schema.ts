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

export interface Agent {
  id: string;
  name: string;
  description: string;
  status: 'idle' | 'working' | 'complete' | 'error';
  tools: string[];
  enabledTools?: string[];
  steeringX: number;
  steeringY: number;
  lastAppliedSteeringX?: number;
  lastAppliedSteeringY?: number;
  tokenCount: number;
  costSpent?: number;
  messages?: Array<{ role: string; content: string }>;
  axisLabels?: {
    xMin: string;
    xMax: string;
    yMin: string;
    yMax: string;
  };
}