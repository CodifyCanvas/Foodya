// types/next-auth.d.ts
import "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    name: string;
    email: string;
    password?: string;
    is_active: boolean;
    role_id: string;
    role_name: string;
    created_at: Date;
  }

  interface Session {
    user: User;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    name: string;
    email: string;
    password?: string;
    is_active: boolean;
    role_id: string;
    role_name: string;
    created_at: Date;
  }
}