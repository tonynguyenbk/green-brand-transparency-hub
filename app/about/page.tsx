import type { Metadata } from "next";
import Link from "next/link";
import { Container, PageHeader, Section } from "@/components/layout/page-header";
import { MethodologyDisclaimer } from "@/components/layout/notices";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return (
    <Container className="py-10">
      <PageHeader eyebrow="About" title={SITE.name} description={SITE.subtitle} />
      <div className="mt-12 max-w-3xl space-y-12 [&_p]:leading-relaxed">
        <Section id="purpose" title="Project purpose">
          <p>
            Consumers increasingly encounter claims such as “eco-friendly”, “carbon neutral” or
            “responsibly sourced”, but rarely have the time or tools to check them. The Hub
            transforms fragmented sustainability claims into structured, evidence-linked
            transparency indicators that help consumers evaluate brand communication and enable
            researchers to study how transparency affects trust and purchase intention.
          </p>
          <p className="font-serif text-lg">
            The guiding question is not “Which brand is truly green?” but “How transparent,
            specific, accessible and verifiable is the evidence behind what this brand tells
            consumers about sustainability?”
          </p>
        </Section>

        <Section id="motivation" title="Academic motivation">
          <p>
            The project sits at the intersection of marketing theory, consumer behaviour, data
            transparency and marketing technology. It applies information asymmetry, signaling and
            trust-transfer theory to a working software product, and lays the foundation for an
            exploratory consumer experiment. See the{" "}
            <Link href="/research" className="text-primary hover:underline">
              research framework
            </Link>
            .
          </p>
        </Section>

        <Section id="principles" title="Transparency principles">
          <ul className="list-disc space-y-1.5 pl-5">
            <li>Evaluate communication, never accuse: no brand is labelled a “greenwasher”.</li>
            <li>Missing data stays missing — it is never silently converted into zero.</li>
            <li>Automatically extracted claims stay candidates until a human verifies them.</li>
            <li>
              Every score records its methodology version, timestamp, source count and confidence.
            </li>
            <li>The methodology, including its limitations, is public and versioned.</li>
          </ul>
        </Section>

        <Section id="limitations" title="Project limitations">
          <ul className="list-disc space-y-1.5 pl-5">
            <li>This is a student portfolio MVP; the sample brands are fictional.</li>
            <li>
              Weights and thresholds are methodological choices that have not been empirically
              validated.
            </li>
            <li>Reviewer ratings are subjective and not yet tested for inter-rater reliability.</li>
            <li>The planned consumer study has not been run; no effects are claimed.</li>
          </ul>
          <p>
            Read the full{" "}
            <Link href="/methodology#limitations" className="text-primary hover:underline">
              methodology limitations
            </Link>
            .
          </p>
        </Section>

        <MethodologyDisclaimer />
      </div>
    </Container>
  );
}
