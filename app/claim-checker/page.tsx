import type { Metadata } from "next";
import Link from "next/link";
import { ClaimCheckerForm } from "@/components/claim/claim-checker-form";
import { Container, PageHeader } from "@/components/layout/page-header";
import { MethodologyDisclaimer } from "@/components/layout/notices";
import { BROAD_TERMS } from "@/lib/claims/dictionary";

export const metadata: Metadata = { title: "Claim Checker" };

export default function ClaimCheckerPage() {
  return (
    <Container className="space-y-10 py-10">
      <PageHeader
        eyebrow="Claim Checker"
        title="How verifiable is this green claim?"
        description={
          <>
            Paste a sustainability claim to see which parts are broad, which are measurable, and
            what evidence would make it easier to verify. The checker is rule-based and uses the
            same{" "}
            <Link href="/methodology#claim-risk" className="text-primary hover:underline">
              Green Claim Transparency Risk
            </Link>{" "}
            formula as reviewed claims.
          </>
        }
      />
      <ClaimCheckerForm />
      <details className="bg-card rounded-xl border p-5 text-sm">
        <summary className="cursor-pointer font-medium">Which terms are treated as broad?</summary>
        <p className="text-muted-foreground mt-3">
          These terms are <strong>not</strong> labelled as deceptive. They are flagged so the
          checker can look for the percentage, measurement, year, baseline, certification, source,
          metric or scope that would make them verifiable:
        </p>
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {BROAD_TERMS.map((t) => (
            <li key={t.term} className="rounded-full border px-2 py-0.5 text-xs">
              {t.term}
            </li>
          ))}
        </ul>
      </details>
      <MethodologyDisclaimer />
    </Container>
  );
}
