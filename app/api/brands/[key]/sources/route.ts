import { handleError, json, parseId } from "@/lib/api/http";
import { getAdminSession } from "@/lib/auth/session";
import { resolveBrandKey } from "@/lib/services/brand-service";
import { listPublicSourcesForBrand, listSources } from "@/lib/services/evidence-service";

export const dynamic = "force-dynamic";

/** GET /api/brands/:id/sources (id or slug). Public: verified sources of published brands; admins: all. */
export async function GET(_request: Request, ctx: RouteContext<"/api/brands/[key]/sources">) {
  const key = parseId((await ctx.params).key);
  if (!key) return json({ error: "Invalid id" }, 400);
  try {
    const brand = await resolveBrandKey(key);
    if (!brand) return json({ error: "Not found" }, 404);
    if (await getAdminSession()) return json({ data: await listSources(brand.id) });
    if (brand.status !== "PUBLISHED") return json({ error: "Not found" }, 404);
    return json({ data: await listPublicSourcesForBrand(brand.id) });
  } catch (e) {
    return handleError(e);
  }
}
