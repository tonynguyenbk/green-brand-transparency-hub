import { beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

describe("dev session tokens", () => {
  beforeAll(() => {
    process.env.DEV_AUTH_SECRET = "a".repeat(40);
    process.env.DEV_ADMIN_PASSWORD = "correct horse";
  });

  it("verifies a fresh token and rejects tampered or expired ones", async () => {
    const { createDevSessionToken, verifyDevSessionToken } = await import("@/lib/auth/dev-session");
    const now = Date.UTC(2026, 9, 5);
    const token = createDevSessionToken(now);
    expect(verifyDevSessionToken(token, now)).toBe(true);
    expect(verifyDevSessionToken(token.replace(/.$/, "x"), now)).toBe(false);
    expect(verifyDevSessionToken(token, now + 9 * 60 * 60 * 1000)).toBe(false);
    expect(verifyDevSessionToken(undefined, now)).toBe(false);
  });

  it("checks the development password", async () => {
    const { verifyDevPassword } = await import("@/lib/auth/dev-session");
    expect(verifyDevPassword("correct horse")).toBe(true);
    expect(verifyDevPassword("wrong")).toBe(false);
  });
});
