
import { pgTable, timestamp, varchar, uuid, text } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  email: varchar("email", { length: 256 }).unique().notNull(),
  password: varchar("hashed_password").default("unset").notNull(),
});

export const chirps = pgTable("chirps", {
  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  body: text("body").notNull(),
  userId: uuid("user_id").notNull().references(() => users.id, {onDelete: 'cascade'}),
});

export const refreshTokens = pgTable("refresh_tokens", {
  token: text().primaryKey(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  userId: uuid("user_id").notNull().references(() => users.id, {onDelete: 'cascade'}),
  expiresAt: timestamp("expires_at").notNull(),
  revokedAt: timestamp("revoked_at"),

});


export type NewUser = typeof users.$inferInsert;
export type UserResponse = Omit<NewUser, "password">;
export type NewChirp = typeof chirps.$inferInsert;
export type RefreshToken = typeof refreshTokens.$inferInsert;