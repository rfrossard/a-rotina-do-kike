import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const activityEvents = sqliteTable("activity_events", {
  id: text("id").primaryKey(),
  eventType: text("event_type").notNull(),
  activity: text("activity"),
  points: integer("points").notNull().default(0),
  day: text("day").notNull(),
  occurredAt: text("occurred_at").notNull(),
});

export const gameState = sqliteTable("game_state", {
  id: integer("id").primaryKey(),
  balance: integer("balance").notNull().default(245),
  updatedAt: text("updated_at").notNull(),
});
