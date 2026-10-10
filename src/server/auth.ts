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
import type { JWT } from "next-auth/jwt";
import { API_CONFIG, API_ENDPOINTS } from "@/core/infrastructure/api/constants";

/** Renew this long before the API's hour-long access token runs out. */
const RENEW_BEFORE_MS = 5 * 60 * 1000;

function expiresAt(accessToken: unknown): number | null {
  if (typeof accessToken !== "string") return null;
  try {
    const payload = JSON.parse(
      Buffer.from(accessToken.split(".")[1] ?? "", "base64url").toString("utf8"),
    ) as { exp?: number };
    return payload.exp ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

/**
 * Keeps the session signed in: once the access token is near its end, swap the
 * refresh token for a new pair. If that fails the token is left to expire, and
 * the next API call's 401 signs the user out as before.
 */
async function renewIfExpiring(token: JWT): Promise<JWT> {
  const expiry = expiresAt(token.accessToken);
  if (!expiry || expiry - Date.now() > RENEW_BEFORE_MS) return token;
  if (typeof token.refreshToken !== "string") return token;
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.AUTH.REFRESH}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: token.refreshToken }),
    });
    if (!response.ok) return token;
    const body = (await response.json()) as {
      data?: { access_token?: string; refresh_token?: string };
      access_token?: string;
      refresh_token?: string;
    };
    const renewed = body.data ?? body;
    if (!renewed.access_token) return token;
    return {
      ...token,
      accessToken: renewed.access_token,
      refreshToken: renewed.refresh_token ?? token.refreshToken,
    };
  } catch {
    return token;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        login: { label: "User ID or email", type: "text" },
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
          refreshToken: user.refreshToken,
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
        token.refreshToken = user.refreshToken as string | undefined;
        token.type = user.type;
        token.tenantId = user.tenantId;
        token.activeBranch = user.activeBranch;
        token.access = user.access;
        return token;
      }
      return renewIfExpiring(token);
    },
    async session({ session, token }) {
      if (session.user) {
        session.accessToken = token.accessToken as string;
        session.activeBranch = token.activeBranch as string | undefined;
        session.access = token.access as BranchAccess[] | undefined;
        session.expiresAt = expiresAt(token.accessToken);
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
