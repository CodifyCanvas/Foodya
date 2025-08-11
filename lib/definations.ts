// User object returned from API
export interface User {
    id?: number;
    name: string;
    password: string;
    email: string;
    is_active: boolean;
    role_id: string;
    role_name: string;
    created_at: Date;
}

// Permissions assigned to a role for a specific module
export interface Permissions {
    id: number,
    role_id: number,
    role_name: string,
    module_id: number,
    module_name: string,
    can_view: boolean,
    can_create: boolean,
    can_edit: boolean,
    can_delete: boolean,
}

// Role object used in dropdowns or display
export interface RoleSelectInput {
    label: string;
    value: string;
}

/* === Module Type Definition === */
export interface ModuleInterface {
  id?: number;
  name: string;
  label: string;
}

/* === Role Type Definition === */
export interface Role {
  id?: number;
  role: string;
}

/* === Role Type Definition === */
export interface MenuCategories {
  id?: number;
  name: string;
  description: string; 
}


/* === Mune Items Definition === */
export interface ItemWithOptions {
  id?: number;
  image?: string | null; // Optional image file
  item: string;
  description: string;
  price: number;
  is_available: boolean;
  category: string;
  category_id: string;
  options: { option_id: number; option_name: string; price: string; }[];  
};

// Categories object used in dropdowns or display
export interface CategoriesSelectInput {
    label: string;
    value: string;
}

/* === Module Type Definition === */
export interface RestaurantTablesInterface {
  id?: number;
  table_number: string;
  status: 'booked' | 'occupied' | 'available';
}

/* === Bookings Tables Type Definition === */
export interface BookingsTablesInterface {
  id: number;
  tableId: string; 
  tableName: string | null;
  customerName: string;
  advancePaid: string | null;
  status: 'scheduled' | 'booked' | 'completed' | 'processing' | 'expired' | 'cancelled';
  bookedByUserId: number; 
  bookedByUserName: string | null;
  bookedByUserEmail: string | null; 
  reservationStart: Date;
  reservationEnd: Date;  
  bookingDate: Date;      
}

// Categories object used in dropdowns or display
export interface TablesSelectInput {
    label: string;
    value: string;
}