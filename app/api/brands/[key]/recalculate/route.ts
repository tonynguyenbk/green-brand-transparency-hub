import { handleError, json, parseId } from "@/lib/api/http";
import { authorizeApi } from "@/lib/auth/session";
import { resolveBrandKey } from "@/lib/services/brand-service";
import { recalculateBrandScore } from "@/lib/services/scoring-service";

export const dynamic = "force-dynamic";

/** POST /api/brands/:id/recalculate — admin only. Inserts a new BrandScore snapshot. */
export async function POST(_request: Request, ctx: RouteContext<"/api/brands/[key]/recalculate">) {
  const auth = await authorizeApi();
  if ("response" in auth) return auth.response;
  const key = parseId((await ctx.params).key);
  if (!key) return json({ error: "Invalid id" }, 400);
  try {
    const brand = await resolveBrandKey(key);
    if (!brand) return json({ error: "Not found" }, 404);
    const result = await recalculateBrandScore(brand.id);
    if (!result.ok) {
      return json(
        { error: result.reason, missingDimensions: result.assessment.missingDimensions },
        422,
      );
    }
    return json({ data: result.snapshot, gaps: result.assessment.gaps }, 201);
  } catch (e) {
    return handleError(e);
  }
}
