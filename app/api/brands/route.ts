import { handleError, json, parseBody } from "@/lib/api/http";
import { authorizeApi } from "@/lib/auth/session";
import { createBrand } from "@/lib/services/admin-service";
import { listPublicBrands } from "@/lib/services/brand-service";
import { brandDirectoryQuerySchema, brandSchema } from "@/lib/validation/schemas";

export const dynamic = "force-dynamic";

/** GET /api/brands?q=&industry=&minScore=&maxScore=&risk=&sort= — public, published brands only. */
export async function GET(request: Request) {
  try {
    const params = Object.fromEntries(new URL(request.url).searchParams);
    const filters = brandDirectoryQuerySchema.parse(params);
    const brands = await listPublicBrands(filters);
    return json({ data: brands, count: brands.length });
  } catch (e) {
    return handleError(e);
  }
}

/** POST /api/brands — admin only. */
export async function POST(request: Request) {
  const auth = await authorizeApi();
  if ("response" in auth) return auth.response;
  const body = await parseBody(request, brandSchema);
  if ("response" in body) return body.response;
  try {
    return json({ data: await createBrand(body.data) }, 201);
  } catch (e) {
    return handleError(e);
  }
}
