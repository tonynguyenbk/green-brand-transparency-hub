import "server-only";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import type { z } from "zod";
import { ClaimReviewError } from "@/lib/services/claim-service";
import { EvidenceError } from "@/lib/services/evidence-service";
import { fieldErrors, idSchema } from "@/lib/validation/schemas";

const MAX_BODY_BYTES = 64 * 1024;

export function json(data: unknown, init?: number | ResponseInit) {
  return NextResponse.json(data, typeof init === "number" ? { status: init } : init);
}

/** Read and validate a JSON body with a Zod schema (server-side validation is mandatory). */
export async function parseBody<S extends z.ZodType>(
  request: Request,
  schema: S,
): Promise<{ data: z.output<S> } | { response: NextResponse }> {
  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > MAX_BODY_BYTES) return { response: json({ error: "Request body too large" }, 413) };
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return { response: json({ error: "Invalid JSON body" }, 400) };
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return {
      response: json({ error: "Validation failed", fields: fieldErrors(parsed.error) }, 422),
    };
  }
  return { data: parsed.data };
}

export function parseId(value: string): string | null {
  const r = idSchema.safeParse(value);
  return r.success ? r.data : null;
}

/** Map known errors to HTTP responses without leaking internals. */
export function handleError(error: unknown) {
  if (error instanceof ClaimReviewError || error instanceof EvidenceError) {
    return json({ error: error.message }, 409);
  }
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002")
      return json({ error: "A record with this unique value already exists." }, 409);
    if (error.code === "P2025") return json({ error: "Not found" }, 404);
    if (error.code === "P2003") return json({ error: "A referenced record does not exist." }, 409);
  }
  console.error(error);
  return json({ error: "Internal server error" }, 500);
}
