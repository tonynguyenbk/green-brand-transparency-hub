import { json, parseBody } from "@/lib/api/http";
import { checkClaim } from "@/lib/claims/checker";
import { claimCheckerSchema } from "@/lib/validation/schemas";

/** POST /api/claim-checker { "claim": "…" } — rule-based analysis, nothing is stored. */
export async function POST(request: Request) {
  const body = await parseBody(request, claimCheckerSchema);
  if ("response" in body) return body.response;
  return json(checkClaim(body.data.claim));
}
