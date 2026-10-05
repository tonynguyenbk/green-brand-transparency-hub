import { handleError, json, parseBody } from "@/lib/api/http";
import { authorizeApi } from "@/lib/auth/session";
import { createSource } from "@/lib/services/evidence-service";
import { sourceSchema } from "@/lib/validation/schemas";

export const dynamic = "force-dynamic";

/** POST /api/sources — admin only. */
export async function POST(request: Request) {
  const auth = await authorizeApi();
  if ("response" in auth) return auth.response;
  const body = await parseBody(request, sourceSchema);
  if ("response" in body) return body.response;
  try {
    return json({ data: await createSource(body.data) }, 201);
  } catch (e) {
    return handleError(e);
  }
}
