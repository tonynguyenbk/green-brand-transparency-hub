import { handleError, json } from "@/lib/api/http";
import {
  MAX_COMPARE,
  MIN_COMPARE,
  compareBrands,
  parseCompareSlugs,
} from "@/lib/services/comparison-service";

export const dynamic = "force-dynamic";

/** GET /api/compare?brands=brand-a,brand-b — 2 to 4 published brands. */
export async function GET(request: Request) {
  const raw = new URL(request.url).searchParams.get("brands") ?? "";
  const slugs = parseCompareSlugs(raw).filter((s) => /^[a-z0-9-]{2,80}$/.test(s));
  if (slugs.length < MIN_COMPARE) {
    return json(
      { error: `Provide between ${MIN_COMPARE} and ${MAX_COMPARE} brand slugs, e.g. ?brands=a,b` },
      400,
    );
  }
  try {
    return json({ data: await compareBrands(slugs) });
  } catch (e) {
    return handleError(e);
  }
}
