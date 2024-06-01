import {
  boolean,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { userTable } from "../auth/schema";
import { createInsertSchema } from "drizzle-zod";

export const postTable = pgTable("post", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => userTable.id),
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
  })
    .defaultNow()
    .notNull(),
});

export const PostType = createInsertSchema(postTable);
export const postRequestSchema = PostType.pick({
  qoute: true,
  content: true,
  isCountDown: true,
  countDownDate: true,
});
