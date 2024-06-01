import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const userTable = pgTable("user", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  description: text("description"),
});

export const sessionTable = pgTable("session", {
  id: text("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => userTable.id),
  expiresAt: timestamp("expires_at", {
    withTimezone: true,
    mode: "date",
  }).notNull(),
});

export const SessionType = createInsertSchema(sessionTable);
export const UserType = createInsertSchema(userTable).pick({
  id: true,
  name: true,
  email: true,
});

export const authSignupInputSchema = z.object({
  name: z.string(),
  email: z.string(),
  password: z.string(),
});

export const authSignInInputSchema = authSignupInputSchema.omit({
  name: true,
});
