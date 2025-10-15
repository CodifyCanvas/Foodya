import { adminSchema } from './admin-panel.schema';
import { restaurantSchema } from './restaurant.schema';



/**
 * === Unified Schema Export ===
 * 
 * Merges schema definitions from all modules (e.g., admin panel, restaurant module).
 * This unified schema is used by Drizzle ORM for typed queries across the entire app.
 */
export const schema = {
  ...adminSchema,
  ...restaurantSchema,
};



export type AppSchema = typeof schema;