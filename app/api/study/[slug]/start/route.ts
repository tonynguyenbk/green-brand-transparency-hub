import { handleError, json, parseBody } from "@/lib/api/http";
import { clientKey, rateLimit } from "@/lib/api/rate-limit";
import { StudyError, startParticipation } from "@/lib/services/research-service";
import { slugSchema, studyStartSchema } from "@/lib/validation/schemas";

/** POST /api/study/:slug/start { consent: true } → { participantCode, conditionKey } */
export async function POST(request: Request, ctx: RouteContext<"/api/study/[slug]/start">) {
  const slug = slugSchema.safeParse((await ctx.params).slug);
  if (!slug.success) return json({ error: "Invalid study" }, 400);
  if (!rateLimit(`study-start:${clientKey(request)}`, 20, 10 * 60 * 1000).allowed) {
    return json({ error: "Too many attempts. Please try again later." }, 429);
  }
  const body = await parseBody(request, studyStartSchema);
  if ("response" in body) return body.response;
  try {
    return json({ data: await startParticipation(slug.data) }, 201);
  } catch (e) {
    if (e instanceof StudyError) return json({ error: e.message }, 409);
    return handleError(e);
  }
}
