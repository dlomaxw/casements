import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { createHash } from 'node:crypto';
import { prisma } from '@/lib/db';

// Matches the hashing used in prisma/seed.mjs
export function hashPassword(password: string): string {
  return createHash('sha256').update(`casements:${password}`).digest('hex');
}

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  pages: { signIn: '/crm/login' },
  providers: [
    CredentialsProvider({
      name: 'CRM Login',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;
        try {
          const user = await prisma.user.findUnique({ where: { email: credentials.email } });
          if (!user?.passwordHash) return null;
          if (user.passwordHash !== hashPassword(credentials.password)) return null;
          return { id: user.id, name: user.name, email: user.email, role: user.role } as any;
        } catch (err) {
          console.error('[auth] Database unavailable during login:', err);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
};
