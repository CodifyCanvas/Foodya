import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import type { JWT } from "next-auth/jwt";
import type { Session, User } from "next-auth";
import { getUserForSignin } from './lib/crud-actions/users';
import { signInFormSchema } from './lib/zod-schema';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      async authorize(credentials) {
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

  callbacks: {
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

  session: {
    strategy: 'jwt',
    maxAge: 60 * 60 * 24,
  },
});