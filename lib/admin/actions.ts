"use server";

import { Prisma, type BrandStatus, type ClaimStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import type { z } from "zod";
import { requireAdmin } from "@/lib/auth/session";
import * as admin from "@/lib/services/admin-service";
import * as claims from "@/lib/services/claim-service";
import * as evidence from "@/lib/services/evidence-service";
import { recalculateBrandScore } from "@/lib/services/scoring-service";
import { BRAND_STATUSES, CLAIM_STATUSES } from "@/lib/validation/enums";
import {
  accessibilityAuditSchema,
  brandSchema,
  certificationSchema,
  claimSchema,
  claimSourceLinkSchema,
  disclosureSchema,
  fieldErrors,
  idSchema,
  methodologySchema,
  sourceSchema,
  targetSchema,
} from "@/lib/validation/schemas";

export type ActionResult =
  | { ok: true; id?: string; message?: string }
  | { ok: false; error: string; fields?: Record<string, string> };

/** Shared wrapper: authorise → validate → run → revalidate → map errors. */
async function run<S extends z.ZodType>(
  schema: S,
  raw: unknown,
  fn: (data: z.output<S>) => Promise<{ id?: string; message?: string } | void>,
): Promise<ActionResult> {
  await requireAdmin();
  const parsed = schema.safeParse(raw);
  if (!parsed.success)
    return {
      ok: false,
      error: "Please correct the highlighted fields.",
      fields: fieldErrors(parsed.error),
    };
  try {
    const out = (await fn(parsed.data)) ?? {};
    revalidatePath("/", "layout");
    return { ok: true, ...out };
  } catch (e) {
    return mapError(e);
  }
}

async function runSimple(
  fn: () => Promise<{ id?: string; message?: string } | void>,
): Promise<ActionResult> {
  await requireAdmin();
  try {
    const out = (await fn()) ?? {};
    revalidatePath("/", "layout");
    return { ok: true, ...out };
  } catch (e) {
    return mapError(e);
  }
}

function mapError(e: unknown): ActionResult {
  if (e instanceof claims.ClaimReviewError || e instanceof evidence.EvidenceError)
    return { ok: false, error: e.message };
  if (e instanceof Prisma.PrismaClientKnownRequestError) {
    if (e.code === "P2002")
      return {
        ok: false,
        error: "A record with this unique value already exists (e.g. slug or version).",
      };
    if (e.code === "P2025") return { ok: false, error: "The record no longer exists." };
    if (e.code === "P2003")
      return {
        ok: false,
        error: "This record is referenced by other data or refers to a missing record.",
      };
  }
  console.error(e);
  return { ok: false, error: "Something went wrong. Please try again." };
}

function assertId(id: string) {
  return idSchema.parse(id);
}

// --- Brands ----------------------------------------------------------------

export async function saveBrandAction(id: string | null, raw: unknown) {
  return run(brandSchema, raw, async (data) => {
    const brand = id ? await admin.updateBrand(assertId(id), data) : await admin.createBrand(data);
    return { id: brand.id, message: id ? "Brand updated." : "Brand created." };
  });
}

export async function setBrandStatusAction(id: string, status: BrandStatus) {
  return runSimple(async () => {
    if (!BRAND_STATUSES.includes(status)) throw new evidence.EvidenceError("Invalid status");
    await admin.setBrandStatus(assertId(id), status);
    return {
      message:
        status === "PUBLISHED" ? "Profile published." : `Status set to ${status.toLowerCase()}.`,
    };
  });
}

export async function deleteBrandAction(id: string) {
  return runSimple(async () => {
    await admin.deleteBrand(assertId(id));
    return { message: "Brand deleted." };
  });
}

export async function saveDisclosureAction(raw: unknown) {
  return run(disclosureSchema, raw, async (data) => {
    await evidence.saveDisclosureItems(data);
    return { message: "Disclosure checklist saved." };
  });
}

export async function recalculateScoreAction(brandId: string): Promise<ActionResult> {
  return runSimple(async () => {
    const result = await recalculateBrandScore(assertId(brandId));
    if (!result.ok) throw new evidence.EvidenceError(result.reason);
    return {
      message: `New snapshot created: ${result.snapshot.overallScore.toFixed(1)} / 100 (confidence ${result.snapshot.confidenceLevel.toLowerCase()}).`,
    };
  });
}

// --- Sources ---------------------------------------------------------------

export async function saveSourceAction(id: string | null, raw: unknown) {
  return run(sourceSchema, raw, async (data) => {
    const s = id
      ? await evidence.updateSource(assertId(id), data)
      : await evidence.createSource(data);
    return { id: s.id, message: id ? "Source updated." : "Source added." };
  });
}

export async function deleteSourceAction(id: string) {
  return runSimple(async () => {
    await evidence.deleteSource(assertId(id));
    return { message: "Source deleted." };
  });
}

// --- Claims ----------------------------------------------------------------

export async function saveClaimAction(id: string | null, raw: unknown) {
  return run(claimSchema, raw, async (data) => {
    const c = id ? await claims.updateClaim(assertId(id), data) : await claims.createClaim(data);
    return { id: c.id, message: id ? "Claim updated." : "Claim created as candidate." };
  });
}

export async function setClaimStatusAction(id: string, status: ClaimStatus) {
  return runSimple(async () => {
    if (!CLAIM_STATUSES.includes(status)) throw new claims.ClaimReviewError("Invalid status");
    await claims.setClaimStatus(assertId(id), status);
    return { message: `Claim marked ${status.toLowerCase().replace("_", " ")}.` };
  });
}

export async function deleteClaimAction(id: string) {
  return runSimple(async () => {
    await claims.deleteClaim(assertId(id));
    return { message: "Claim deleted." };
  });
}

export async function linkEvidenceAction(raw: unknown) {
  return run(claimSourceLinkSchema, raw, async (data) => {
    await claims.linkClaimSource(data);
    return { message: "Evidence linked." };
  });
}

export async function unlinkEvidenceAction(id: string) {
  return runSimple(async () => {
    await claims.unlinkClaimSource(assertId(id));
    return { message: "Evidence link removed." };
  });
}

// --- Certifications / targets / audits ---------------------------------------

export async function saveCertificationAction(id: string | null, raw: unknown) {
  return run(certificationSchema, raw, async (data) => {
    const c = id
      ? await evidence.updateCertification(assertId(id), data)
      : await evidence.createCertification(data);
    return { id: c.id, message: id ? "Certification updated." : "Certification added." };
  });
}

export async function deleteCertificationAction(id: string) {
  return runSimple(async () => {
    await evidence.deleteCertification(assertId(id));
    return { message: "Certification deleted." };
  });
}

export async function saveTargetAction(id: string | null, raw: unknown) {
  return run(targetSchema, raw, async (data) => {
    const t = id
      ? await evidence.updateTarget(assertId(id), data)
      : await evidence.createTarget(data);
    return { id: t.id, message: id ? "Target updated." : "Target added." };
  });
}

export async function deleteTargetAction(id: string) {
  return runSimple(async () => {
    await evidence.deleteTarget(assertId(id));
    return { message: "Target deleted." };
  });
}

export async function saveAuditAction(id: string | null, raw: unknown) {
  return run(accessibilityAuditSchema, raw, async (data) => {
    const a = id
      ? await evidence.updateAudit(assertId(id), data)
      : await evidence.createAudit(data);
    return { id: a.id, message: id ? "Audit updated." : "Audit recorded." };
  });
}

export async function deleteAuditAction(id: string) {
  return runSimple(async () => {
    await evidence.deleteAudit(assertId(id));
    return { message: "Audit deleted." };
  });
}

// --- Methodology -------------------------------------------------------------

export async function createMethodologyAction(raw: unknown) {
  return run(methodologySchema, raw, async (data) => {
    const m = await admin.createMethodologyVersion(data);
    return { id: m.id, message: `Methodology v${m.version} created (inactive).` };
  });
}

export async function activateMethodologyAction(id: string) {
  return runSimple(async () => {
    await admin.activateMethodologyVersion(assertId(id));
    return {
      message:
        "Methodology activated. Recalculate brand scores to create snapshots under this version.",
    };
  });
}
