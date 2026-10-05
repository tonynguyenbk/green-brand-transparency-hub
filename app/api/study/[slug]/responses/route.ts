import { handleError, json, parseBody } from "@/lib/api/http";
import { StudyError, completeParticipation } from "@/lib/services/research-service";
import { slugSchema, studyResponseSchema } from "@/lib/validation/schemas";

/** POST /api/study/:slug/responses { participantCode, items: { BT1: 1–5, … } } */
export async function POST(request: Request, ctx: RouteContext<"/api/study/[slug]/responses">) {
  const slug = slugSchema.safeParse((await ctx.params).slug);
  if (!slug.success) return json({ error: "Invalid study" }, 400);
  const body = await parseBody(request, studyResponseSchema);
  if ("response" in body) return body.response;
  try {
    await completeParticipation(slug.data, body.data.participantCode, body.data.items);
    return new Response(null, { status: 204 });
  } catch (e) {
    if (e instanceof StudyError) return json({ error: e.message }, 409);
    return handleError(e);
  }
}
