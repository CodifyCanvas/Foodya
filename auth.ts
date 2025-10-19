// @/auth.ts

import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

import type { JWT } from "next-auth/jwt";
import type { Session, User } from "next-auth";

import { getUserForSignin } from './lib/crud-actions/users';
import { signInFormSchema } from './lib/zod-schema';



/**
 * === NextAuth Authentication Configuration ===
 * 
 * - Uses Credentials provider with custom user verification logic.
 * - JWT-based session management.
 * - Populates session and token with custom user fields.
 */
export const { handlers, signIn, signOut, auth } = NextAuth({


  /**
   * === Providers ===
   * 
   * Auth Providers (custom credentials-based)
   */
  providers: [
    Credentials({

      /**
       * === Authorize User Credentials ===
       * 
       * Validates and authenticates user based on email and password.
       * 
       * @param credentials - Credentials from the sign-in form.
       * @returns - Authenticated user object or null.
       */
      async authorize(credentials) {

        // Validate credientials using Zod schema
        const parsed = signInFormSchema.parse(credentials)
        const { email, password } = parsed

        if (email && password) {
          const user = await getUserForSignin(email, password);

          if (!user) return null;

          return user;
        }

        return null;
      },
    }),
  ],


  /**
   * === Callbacks ===
   * 
   * Customize the token and session structure.
   */
  callbacks: {

    /**
     * === JWT Callback ===
     * 
     * Adds user fields to the token during sign-in.
     * 
     * @param {Object} param
     * @param {JWT} param.token - Current JWT token.
     * @param {User} [param.user] - User object on first login.
     * @returns - Updated token.
     */
    async jwt({ token, user }: { token: JWT; user?: User }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.is_active = user.is_active;
        token.role_id = user.role_id;
        token.role_name = user.role_name;
        token.created_at = user.created_at;
      }
      return token;
    },

    /**
     * === Session Callback ===
     * Populates session with additional fields from the token.
     * 
     * @param {Object} param
     * @param {Session} param.session - Current session object.
     * @param {JWT} param.token - JWT token containing user info.
     * @returns - Updated session.
     */
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.is_active = token.is_active;
        session.user.role_id = token.role_id;
        session.user.role_name = token.role_name;
        session.user.created_at = new Date(token.created_at);
      }
      return session;
    },
  },


  /**
   * === Session Configuration ===
   * 
   * - JWT-based strategy.
   * - Sessions last 24 hours.
   */
  session: {
    strategy: 'jwt',
    maxAge: 60 * 60 * 24, // <- 24 hours
  },
});