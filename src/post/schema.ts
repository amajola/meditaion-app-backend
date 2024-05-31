import { boolean, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { userTable } from "../auth/schema";

export const postTable = pgTable("post", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => userTable.id),
  qoute: text("title").notNull(),
  isCountDown: boolean("is_count_down").notNull(),
  countDownDate: timestamp("count_down_date", {
    withTimezone: true,
    mode: "date",
  }),
  content: text("content").notNull(),
  createdAt: timestamp("created_at", {
    withTimezone: true,
    mode: "date",
  }).notNull(),
});