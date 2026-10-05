import { handleError, json, parseBody } from "@/lib/api/http";
import { authorizeApi } from "@/lib/auth/session";
import { createClaim } from "@/lib/services/claim-service";
import { claimSchema } from "@/lib/validation/schemas";

export const dynamic = "force-dynamic";

/** POST /api/claims — admin only. New claims default to CANDIDATE and do not affect scores. */
export async function POST(request: Request) {
  const auth = await authorizeApi();
  if ("response" in auth) return auth.response;
  const body = await parseBody(request, claimSchema);
  if ("response" in body) return body.response;
  try {
    return json({ data: await createClaim(body.data) }, 201);
  } catch (e) {
    return handleError(e);
  }
}
