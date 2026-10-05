import { handleError, json, parseBody, parseId } from "@/lib/api/http";
import { authorizeApi } from "@/lib/auth/session";
import { deleteBrand, updateBrand } from "@/lib/services/admin-service";
import { getPublicBrandProfile } from "@/lib/services/brand-service";
import { brandSchema, slugSchema } from "@/lib/validation/schemas";

export const dynamic = "force-dynamic";

/** GET /api/brands/:slug — public profile (published brands, verified claims only). */
export async function GET(_request: Request, ctx: RouteContext<"/api/brands/[key]">) {
  const { key } = await ctx.params;
  const slug = slugSchema.safeParse(key);
  if (!slug.success) return json({ error: "Invalid slug" }, 400);
  try {
    const profile = await getPublicBrandProfile(slug.data);
    if (!profile) return json({ error: "Not found" }, 404);
    return json({ data: profile });
  } catch (e) {
    return handleError(e);
  }
}

/** PATCH /api/brands/:id — admin only. Full brand payload (validated). */
export async function PATCH(request: Request, ctx: RouteContext<"/api/brands/[key]">) {
  const auth = await authorizeApi();
  if ("response" in auth) return auth.response;
  const id = parseId((await ctx.params).key);
  if (!id) return json({ error: "Invalid id" }, 400);
  const body = await parseBody(request, brandSchema);
  if ("response" in body) return body.response;
  try {
    return json({ data: await updateBrand(id, body.data) });
  } catch (e) {
    return handleError(e);
  }
}

/** DELETE /api/brands/:id — admin only. Cascades to the brand's records. */
export async function DELETE(_request: Request, ctx: RouteContext<"/api/brands/[key]">) {
  const auth = await authorizeApi();
  if ("response" in auth) return auth.response;
  const id = parseId((await ctx.params).key);
  if (!id) return json({ error: "Invalid id" }, 400);
  try {
    await deleteBrand(id);
    return new Response(null, { status: 204 });
  } catch (e) {
    return handleError(e);
  }
}
