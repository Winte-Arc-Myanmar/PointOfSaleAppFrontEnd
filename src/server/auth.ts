/**
 * NextAuth config - frontend auth only.
 * Session/JWT from external auth backend; no Next.js API proxy for business data.
 */

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { API_CONFIG } from "@/core/infrastructure/api/constants";

const baseUrl = API_CONFIG.BASE_URL.replace(/\/$/, "");

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Call your external auth API here
        const res = await fetch(`${baseUrl}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: credentials?.email,
            password: credentials?.password,
          }),
        });
        if (!res.ok) return null;
        const data = await res.json();
        return {
          id: data.user?.id,
          email: data.user?.email ?? credentials?.email,
          name: data.user?.name,
          image: data.user?.image,
          accessToken: data.token ?? data.accessToken,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user?.accessToken) token.accessToken = user.accessToken as string;
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.accessToken) {
        (session as { accessToken?: string }).accessToken =
          token.accessToken as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
});
