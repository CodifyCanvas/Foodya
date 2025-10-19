// @/auth.config.ts

import type { NextRequest } from 'next/server';
import type { Session } from 'next-auth';



/**
 * === Authentication Configuration for NextAuth ===
 * 
 * Defines custom sign-in page, authorization logic, and providers.
 */
export const authConfig = {
  pages: {
    signIn: '/login', // <- Custom login page
  },
  callbacks: {

    /**
     * Authorization callback to control access based on session and request path.
     */
    authorized({ auth, request }: { auth: Session | null; request: NextRequest }) {
      const isLoggedIn = !!auth?.user;

      // Routes that require authentication
      const protectedRoutes = ['/restaurant'];
      const isProtected = protectedRoutes.some(path =>
        request.nextUrl.pathname.startsWith(path)
      );

      const isOnLoginPage = request.nextUrl.pathname === '/login';

      // If route is protected, allow only if logged in
      if (isProtected) {
        return isLoggedIn;
      }

      // Redirect logged-in users away from the login page
      if (isLoggedIn && isOnLoginPage) {
        return Response.redirect(new URL('/restaurant/dashboard', request.nextUrl));
      }

      // Allow access by default
      return true;
    },
  },
  providers: [],
};