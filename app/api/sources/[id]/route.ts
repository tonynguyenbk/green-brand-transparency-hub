import { handleError, json, parseBody, parseId } from "@/lib/api/http";
import { authorizeApi } from "@/lib/auth/session";
import { updateSource } from "@/lib/services/evidence-service";
import { sourceSchema } from "@/lib/validation/schemas";

export const dynamic = "force-dynamic";

/** PATCH /api/sources/:id — admin only. */
export async function PATCH(request: Request, ctx: RouteContext<"/api/sources/[id]">) {
  const auth = await authorizeApi();
  if ("response" in auth) return auth.response;
  const id = parseId((await ctx.params).id);
  if (!id) return json({ error: "Invalid id" }, 400);
  const body = await parseBody(request, sourceSchema);
  if ("response" in body) return body.response;
  try {
    return json({ data: await updateSource(id, body.data) });
  } catch (e) {
    return handleError(e);
  }
}
