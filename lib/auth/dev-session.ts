import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { DEV_SESSION_MAX_AGE_SECONDS } from "./config";

/**
 * Signed development session token: "<expiresEpochSeconds>.<hmac>".
 * No password or user data is stored in the cookie.
 */
function sign(payload: string): string {
  return createHmac("sha256", process.env.DEV_AUTH_SECRET ?? "")
    .update(payload)
    .digest("base64url");
}

export function createDevSessionToken(now = Date.now()): string {
  const expires = Math.floor(now / 1000) + DEV_SESSION_MAX_AGE_SECONDS;
  const payload = `dev-admin:${expires}`;
  return `${expires}.${sign(payload)}`;
}

export function verifyDevSessionToken(token: string | undefined, now = Date.now()): boolean {
  if (!token) return false;
  const [expiresRaw, signature] = token.split(".");
  const expires = Number(expiresRaw);
  if (!Number.isInteger(expires) || !signature) return false;
  if (expires * 1000 < now) return false;
  return safeEqual(signature, sign(`dev-admin:${expires}`));
}

export function verifyDevPassword(candidate: string): boolean {
  const expected = process.env.DEV_ADMIN_PASSWORD ?? "";
  if (!expected) return false;
  // Compare HMACs so lengths are equal and timing does not leak.
  return safeEqual(sign(`pw:${candidate}`), sign(`pw:${expected}`));
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}
