import { config } from "dotenv";
import { vi } from "vitest";

config();
// Prefer a dedicated test database when provided.
if (process.env.TEST_DATABASE_URL) process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
vi.mock("server-only", () => ({}));
