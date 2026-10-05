import { handleError, json, parseId } from "@/lib/api/http";
import { authorizeApi } from "@/lib/auth/session";
import { exportStudyCsv } from "@/lib/services/research-service";

export const dynamic = "force-dynamic";

/** GET /api/admin/research/:id/export — anonymous CSV of completed responses (admin only). */
export async function GET(_request: Request, ctx: RouteContext<"/api/admin/research/[id]/export">) {
  const auth = await authorizeApi();
  if ("response" in auth) return auth.response;
  const id = parseId((await ctx.params).id);
  if (!id) return json({ error: "Invalid id" }, 400);
  try {
    const csv = await exportStudyCsv(id);
    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="study-${id}.csv"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    return handleError(e);
  }
}
