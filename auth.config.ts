import type { NextRequest } from 'next/server';
import type { Session } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request }: { auth: Session | null; request: NextRequest }) {
      const isLoggedIn = !!auth?.user;

      const protectedRoutes = ['/restaurant'];
      const isProtected = protectedRoutes.some(path =>
        request.nextUrl.pathname.startsWith(path)
      );

      const isOnLoginPage = request.nextUrl.pathname === '/login';

      if (isProtected) {
        return isLoggedIn;
      }

      if (isLoggedIn && isOnLoginPage) {
        return Response.redirect(new URL('/restaurant', request.nextUrl));
      }

      return true;
    },
  },
  providers: [],
};