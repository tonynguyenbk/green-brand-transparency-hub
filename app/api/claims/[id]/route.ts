import { handleError, json, parseBody, parseId } from "@/lib/api/http";
import { authorizeApi, getAdminSession } from "@/lib/auth/session";
import { getClaim, setClaimStatus, updateClaim } from "@/lib/services/claim-service";
import { claimSchema, claimStatusSchema } from "@/lib/validation/schemas";

export const dynamic = "force-dynamic";

/** GET /api/claims/:id — public only when verified/published and the brand is published. */
export async function GET(_request: Request, ctx: RouteContext<"/api/claims/[id]">) {
  const id = parseId((await ctx.params).id);
  if (!id) return json({ error: "Invalid id" }, 400);
  try {
    const claim = await getClaim(id);
    const isPublic =
      claim &&
      (claim.status === "VERIFIED" || claim.status === "PUBLISHED") &&
      claim.brand.status === "PUBLISHED";
    if (!claim || (!isPublic && !(await getAdminSession())))
      return json({ error: "Not found" }, 404);
    if (!isPublic) return json({ data: claim });
    return json({
      data: {
        ...claim,
        claimSources: claim.claimSources.filter(
          (cs) => cs.source.status === "VERIFIED" || cs.source.status === "PUBLISHED",
        ),
      },
    });
  } catch (e) {
    return handleError(e);
  }
}

/**
 * PATCH /api/claims/:id — admin only.
 * Body is either a full claim payload, or { "status": "VERIFIED" } for a review transition.
 */
export async function PATCH(request: Request, ctx: RouteContext<"/api/claims/[id]">) {
  const auth = await authorizeApi();
  if ("response" in auth) return auth.response;
  const id = parseId((await ctx.params).id);
  if (!id) return json({ error: "Invalid id" }, 400);

  const raw = await request
    .clone()
    .json()
    .catch(() => null);
  const isStatusOnly =
    raw && typeof raw === "object" && Object.keys(raw).length === 1 && "status" in raw;
  try {
    if (isStatusOnly) {
      const body = await parseBody(request, claimStatusSchema);
      if ("response" in body) return body.response;
      return json({ data: await setClaimStatus(id, body.data.status) });
    }
    const body = await parseBody(request, claimSchema);
    if ("response" in body) return body.response;
    return json({ data: await updateClaim(id, body.data) });
  } catch (e) {
    return handleError(e);
  }
}
