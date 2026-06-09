import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

// Forzamos a Drizzle a leer las variables de .env.local
dotenv.config({ path: ".env.local" });

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});