import { adminSchema } from './admin-panel.schema';
import { restaurantSchema } from './restaurant.schema';

// Merged schema
export const schema = {
  ...adminSchema,
  ...restaurantSchema,
};

export type AppSchema = typeof schema;
