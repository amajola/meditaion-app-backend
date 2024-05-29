import { pgTable, text, timestamp } from "drizzle-orm/pg-core";


export const userTable = pgTable("user", {
  id:   text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text('password').notNull()
});

export const sessionTable = pgTable("session", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => userTable.id),
  expiresAt: timestamp("expires_at", {
    withTimezone: true,
    mode: "date",
  }).notNull(),
});

export type UserType = typeof userTable.$inferInsert;
export type SessioType = typeof sessionTable.$inferInsert;
