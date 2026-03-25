/**
 * NextAuth config - credentials flow.
 * Session/JWT stores accessToken, type, tenantId, activeBranch, access (for permission checks).
 * systemAdmin has full access; regular users are gated by per-branch permissions.
 */

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import container from "@/core/infrastructure/di/container";
import type { IAuthService } from "@/core/domain/services/IAuthService";
import type { UserType, BranchAccess } from "@/core/domain/types/auth";
import { normalizeLoginCredentials } from "@/server/normalizeCredentials";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        type: { label: "Type", type: "text" },
        tenantId: { label: "Tenant ID", type: "text" },
        branchId: { label: "Branch ID", type: "text" },
      },
      async authorize(credentials) {
        const normalized = normalizeLoginCredentials(credentials);
        if (!normalized) return null;

        const authService = container.resolve<IAuthService>("authService");
        const user = await authService.login(normalized);
        if (!user?.accessToken) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          accessToken: user.accessToken,
          type: user.type,
          tenantId: user.tenantId,
          activeBranch: user.activeBranch,
          access: user.access,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.accessToken as string;
        token.type = user.type;
        token.tenantId = user.tenantId;
        token.activeBranch = user.activeBranch;
        token.access = user.access;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.accessToken = token.accessToken as string;
        session.activeBranch = token.activeBranch as string | undefined;
        session.access = token.access as BranchAccess[] | undefined;
        (session.user as { type?: UserType }).type = token.type as UserType;
        (session.user as { tenantId?: string }).tenantId = token.tenantId as
          | string
          | undefined;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
});
