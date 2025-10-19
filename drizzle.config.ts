// @/drizzle.config.ts

import { defineConfig } from 'drizzle-kit';



/**
 * === Drizzle Configuration File ===
 * 
 * Defines migration output path, schema location, database dialect,
 * and credentials for connecting to the database.
 * 
 * @see https://orm.drizzle.team/docs/overview - Official documentation
 * @see https://orm.drizzle.team/docs/get-started/mysql-existing#step-3---setup-drizzle-config-file - Configuration reference
 */
export default defineConfig({
  out: './lib/db/migrations/',        // <- Migrations output directory
  schema: './lib/drizzle-schema/*',   // <- Schema files location
  dialect: 'mysql',                   // <- Database dialect (Options: 'mysql' | 'pg' | 'sqlite')
  dbCredentials: {
    url: process.env.DATABASE_URL!,   // <- Database connection URL from environment variable
  },
});