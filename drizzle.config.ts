// @/drizzle.config.ts
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './lib/db/migrations/',
  schema: './lib/drizzle-schema/*',
  dialect: 'mysql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
