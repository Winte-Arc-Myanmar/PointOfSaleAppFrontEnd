/**
 * NextAuth route handler.
 * Required for NextAuth - auth protocol only, not business API proxy.
 */

import { handlers } from "@/server/auth";

export const { GET, POST } = handlers;
