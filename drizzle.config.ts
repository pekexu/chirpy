import { defineConfig } from "drizzle-kit";
import { config } from "./src/config";
import type { MigrationConfig } from "drizzle-orm/migrator";

export default defineConfig({
  schema: "src/db/schema.ts",
  out: "src/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: config.db.url,
  },
});

