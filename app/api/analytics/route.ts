import { captureServerEvent } from "@/lib/analytics/server";
import { parseBody } from "@/lib/api/http";
import { analyticsEventSchema } from "@/lib/validation/schemas";

/** POST /api/analytics — receives product events; logged locally by default. */
export async function POST(request: Request) {
  const body = await parseBody(request, analyticsEventSchema);
  if ("response" in body) return body.response;
  await captureServerEvent({ ...body.data, timestamp: new Date().toISOString() });
  return new Response(null, { status: 204 });
}
