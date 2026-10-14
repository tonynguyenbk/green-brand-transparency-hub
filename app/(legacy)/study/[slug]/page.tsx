import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/page-header";
import { StudyFlow } from "@/components/research/study-flow";
import type { HubSummaryData } from "@/components/research/stimulus";
import { parseStimulus } from "@/lib/research/instrument";
import { DIMENSION_KEYS, DIMENSION_LABELS } from "@/lib/scoring";
import { getPublicBrandProfile } from "@/lib/services/brand-service";
import { TREATMENT_KEY, getStudyBySlug } from "@/lib/services/research-service";
import { slugSchema } from "@/lib/validation/schemas";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Research study", robots: { index: false } };

const DEFAULT_DEBRIEF =
  "This study compares how people respond to a brand message with and without access to structured transparency information. The brand shown is fictional. Thank you for your help.";

export default async function StudyPage(props: PageProps<"/study/[slug]">) {
  const slug = slugSchema.safeParse((await props.params).slug);
  if (!slug.success) notFound();
  const study = await getStudyBySlug(slug.data);
  if (!study) notFound();

  const stimulus = parseStimulus(study.stimulusJson);
  if (study.status !== "ACTIVE" || !stimulus) {
    return (
      <Container className="py-24">
        <div className="mx-auto max-w-lg space-y-3 text-center">
          <h1 className="text-2xl font-semibold">{study.title}</h1>
          <p className="text-muted-foreground">
            This study is not currently open for participation.
          </p>
        </div>
      </Container>
    );
  }

  const treatment = study.conditions.find((c) => c.key === TREATMENT_KEY);
  let hubSummary: HubSummaryData | null = null;
  if (treatment?.brand) {
    const profile = await getPublicBrandProfile(treatment.brand.slug);
    if (profile?.latestScore) {
      const s = profile.latestScore;
      const scores = {
        disclosure: s.disclosureScore,
        evidence: s.evidenceScore,
        verification: s.verificationScore,
        targets: s.targetsScore,
        accessibility: s.accessibilityScore,
      };
      hubSummary = {
        brandName: profile.brand.name,
        score: s.overallScore,
        confidence: s.confidenceLevel,
        dimensions: DIMENSION_KEYS.map((k) => ({ label: DIMENSION_LABELS[k], score: scores[k] })),
        claims: profile.claims.slice(0, 5).map((c) => ({
          text: c.claimText,
          riskLevel: c.riskLevel,
          riskScore: c.riskScore,
          evidenceStrength: c.evidenceStrength,
        })),
        gaps: (profile.scoreDetails?.gaps ?? []).slice(0, 4).map((g) => g.message),
      };
    }
  }

  return (
    <Container className="py-12">
      <StudyFlow
        slug={study.slug}
        title={study.title}
        consentText={study.consentText}
        debriefText={study.debriefText ?? DEFAULT_DEBRIEF}
        stimulus={stimulus}
        hubSummary={hubSummary}
      />
    </Container>
  );
}
