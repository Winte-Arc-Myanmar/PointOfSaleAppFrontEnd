/**
 * NextAuth config - credentials flow.
 * Sign-in goes through architecture: auth.ts → AuthService → AuthRepository → backend.
 * Session/JWT stores accessToken, type, tenantId, branchId (for feature visibility).
 */

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import container from "@/core/infrastructure/di/container";
import type { IAuthService } from "@/core/domain/services/IAuthService";
import type { UserType } from "@/core/domain/types/auth";
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
        console.log("[auth.authorize] received", {
          email: credentials?.email,
          type: credentials?.type,
          tenantId: credentials?.tenantId,
          branchId: credentials?.branchId,
          hasPassword: !!credentials?.password,
        });
        const normalized = normalizeLoginCredentials(credentials);
        if (!normalized) {
          console.log(
            "[auth.authorize] normalizeLoginCredentials returned null"
          );
          return null;
        }
        console.log("[auth.authorize] normalized", {
          email: normalized.email,
          type: normalized.type,
          tenantId: normalized.tenantId,
          branchId: normalized.branchId,
        });
        const authService = container.resolve<IAuthService>("authService");
        const user = await authService.login(normalized);
        if (!user?.accessToken) {
          console.log(
            "[auth.authorize] login returned no user or no accessToken",
            {
              hasUser: !!user,
              hasAccessToken: !!user?.accessToken,
            }
          );
          return null;
        }
        console.log("[auth.authorize] success", {
          id: user.id,
          email: user.email,
          type: user.type,
        });
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          accessToken: user.accessToken,
          type: user.type,
          tenantId: user.tenantId,
          branchId: user.branchId,
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
        token.branchId = user.branchId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session as { accessToken?: string }).accessToken =
          token.accessToken as string;
        (session.user as { type?: UserType }).type = token.type as UserType;
        (session.user as { tenantId?: string }).tenantId = token.tenantId as
          | string
          | undefined;
        (session.user as { branchId?: string | null }).branchId =
          (token.branchId ?? null) as string | null | undefined;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
});
