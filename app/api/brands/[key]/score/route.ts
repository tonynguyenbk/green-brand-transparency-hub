import { handleError, json, parseId } from "@/lib/api/http";
import { getAdminSession } from "@/lib/auth/session";
import { resolveBrandKey } from "@/lib/services/brand-service";
import { getScoreHistory } from "@/lib/services/scoring-service";

export const dynamic = "force-dynamic";

/** GET /api/brands/:id/score — latest snapshot plus history (with methodology version, timestamp, sources, confidence). */
export async function GET(_request: Request, ctx: RouteContext<"/api/brands/[key]/score">) {
  const key = parseId((await ctx.params).key);
  if (!key) return json({ error: "Invalid id" }, 400);
  try {
    const brand = await resolveBrandKey(key);
    if (!brand || (brand.status !== "PUBLISHED" && !(await getAdminSession()))) {
      return json({ error: "Not found" }, 404);
    }
    const history = await getScoreHistory(brand.id);
    const latest = history.at(-1) ?? null;
    return json({
      data: {
        latest,
        history: history.map(({ detailsJson: _details, ...rest }) => rest),
        message: latest
          ? undefined
          : "Score cannot yet be calculated because required review data is incomplete.",
      },
    });
  } catch (e) {
    return handleError(e);
  }
}
