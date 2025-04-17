import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  boolean,
  uuid,
  pgEnum,
  timestamp,
} from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["user", "admin"]);

export const usersTable = pgTable("users", {
  id: uuid("id").notNull().primaryKey(),
  createdAt: timestamp("created_at", { mode: "string" })
    .notNull()
    .default(sql`(now() AT TIME ZONE 'UTC')`),
  updatedAt: timestamp("updated_at", { mode: "string" })
    .notNull()
    .default(sql`(now() AT TIME ZONE 'UTC')`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  name: text("name"),
});
