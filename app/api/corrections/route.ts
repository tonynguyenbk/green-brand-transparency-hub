import { handleError, json, parseBody } from "@/lib/api/http";
import { clientKey, rateLimit } from "@/lib/api/rate-limit";
import { CorrectionError, submitCorrectionReport } from "@/lib/services/correction-service";
import { correctionReportSchema } from "@/lib/validation/schemas";

/**
 * POST /api/corrections — public "Report an issue".
 * Validated, honeypot-protected and rate limited (5 reports / 10 min / client).
 */
export async function POST(request: Request) {
  const limit = rateLimit(`corrections:${clientKey(request)}`, 5, 10 * 60 * 1000);
  if (!limit.allowed) {
    return json({ error: "Too many reports. Please try again later." }, 429);
  }
  const body = await parseBody(request, correctionReportSchema);
  if ("response" in body) return body.response;
  try {
    const report = await submitCorrectionReport(body.data);
    return json({ data: { id: report.id } }, 201);
  } catch (e) {
    if (e instanceof CorrectionError) return json({ error: e.message }, 422);
    return handleError(e);
  }
}
