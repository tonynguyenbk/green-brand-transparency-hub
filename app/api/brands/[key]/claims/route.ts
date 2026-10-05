import { handleError, json, parseId } from "@/lib/api/http";
import { getAdminSession } from "@/lib/auth/session";
import { resolveBrandKey } from "@/lib/services/brand-service";
import { listClaims, listPublicClaimsForBrand } from "@/lib/services/claim-service";

export const dynamic = "force-dynamic";

/**
 * GET /api/brands/:id/claims (id or slug).
 * Public: verified/published claims of published brands. Admins receive all claims.
 */
export async function GET(_request: Request, ctx: RouteContext<"/api/brands/[key]/claims">) {
  const key = parseId((await ctx.params).key);
  if (!key) return json({ error: "Invalid id" }, 400);
  try {
    const brand = await resolveBrandKey(key);
    if (!brand) return json({ error: "Not found" }, 404);
    const admin = await getAdminSession();
    if (admin) return json({ data: await listClaims({ brandId: brand.id }) });
    if (brand.status !== "PUBLISHED") return json({ error: "Not found" }, 404);
    return json({ data: await listPublicClaimsForBrand(brand.id) });
  } catch (e) {
    return handleError(e);
  }
}
