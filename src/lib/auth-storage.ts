// Penyimpanan sesi berbasis cookie agar bisa dibaca oleh middleware (server)
// maupun oleh AuthProvider (client). Token JWT bersifat stateless, jadi cukup
// disimpan di cookie non-HttpOnly (di-set dari client setelah login).

import type { Role } from "@/lib/types";

export const TOKEN_KEY = "ws_token";
export const ROLE_KEY = "ws_role";

const MAX_AGE = 60 * 60 * 24 * 7; // 7 hari

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split("=").slice(1).join("=")) : null;
}

function writeCookie(name: string, value: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=${encodeURIComponent(
    value,
  )}; path=/; max-age=${MAX_AGE}; SameSite=Lax`;
}

function deleteCookie(name: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
}

export function getStoredToken(): string | null {
  return readCookie(TOKEN_KEY);
}

export function getStoredRole(): Role | null {
  const r = readCookie(ROLE_KEY);
  return r === "member" || r === "admin_space" ? r : null;
}

export function setSession(token: string, role: Role) {
  writeCookie(TOKEN_KEY, token);
  writeCookie(ROLE_KEY, role);
}

export function clearSession() {
  deleteCookie(TOKEN_KEY);
  deleteCookie(ROLE_KEY);
}
