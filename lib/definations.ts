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

