import type { Metadata } from "next";
import { ArrowDownIcon } from "lucide-react";
import { Container, PageHeader, Section } from "@/components/layout/page-header";

export const metadata: Metadata = { title: "Research framework" };

const MODEL = [
  "Green Claim Transparency",
  "Perceived Credibility",
  "Brand Trust",
  "Purchase Intention",
];

const HYPOTHESES = [
  ["H1", "Higher perceived sustainability transparency is positively associated with brand trust."],
  ["H2", "Brand trust is positively associated with purchase intention."],
  [
    "H3",
    "Access to evidence-based transparency information increases perceived credibility relative to advertising alone.",
  ],
  ["H4", "Vague environmental claims are associated with higher perceived greenwashing risk."],
  [
    "H5",
    "Third-party verification strengthens the relationship between transparency and brand trust.",
  ],
];

const CONSTRUCTS = [
  {
    name: "Brand Trust",
    items: [
      "I trust this brand.",
      "This brand appears honest.",
      "This brand provides credible sustainability information.",
    ],
  },
  {
    name: "Purchase Intention",
    items: [
      "I would consider purchasing from this brand.",
      "I would choose this brand over a similar competitor.",
    ],
  },
  {
    name: "Perceived Transparency",
    items: ["This brand clearly explains its environmental claims."],
  },
  {
    name: "Perceived Greenwashing",
    items: ["This brand appears to exaggerate its environmental performance."],
  },
];

export default function ResearchPage() {
  return (
    <Container className="py-10">
      <PageHeader
        eyebrow="Research"
        title="From green claims to consumer trust"
        description="The academic framework behind the Hub: how a digital transparency tool may reduce information asymmetry in sustainability communication, and how its effect on trust and purchase intention could be tested."
      />
      <div className="mt-12 max-w-3xl space-y-14 [&_p]:leading-relaxed">
        <Section id="question" title="Core research question">
          <blockquote className="border-primary border-l-4 pl-4 font-serif text-xl">
            How can digital transparency tools help consumers evaluate sustainability claims and
            build trust in brands?
          </blockquote>
        </Section>

        <Section id="asymmetry" title="Information asymmetry">
          <p>
            Brands hold far more information than consumers about their supply chains, material
            sourcing, emissions, manufacturing and certifications. Consumers typically receive a
            simplified marketing claim and lack the time or expertise to verify it. The Hub attempts
            to reduce this asymmetry by consolidating evidence, linking each claim to its sources
            and making gaps explicit.
          </p>
        </Section>

        <Section id="signaling" title="Signaling theory">
          <p>
            Environmental communication acts as a signal of underlying commitments. Strong signals
            are specific, costly to imitate and verifiable; weak signals are vague, unquantified or
            unsupported. The Hub assesses the <em>quality</em> of the signal, not merely its
            presence.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="bg-card rounded-lg border p-4">
              <p className="text-muted-foreground text-xs font-semibold uppercase">Weaker signal</p>
              <p className="mt-2 font-serif">“Designed with the planet in mind.”</p>
            </div>
            <div className="bg-card rounded-lg border p-4">
              <p className="text-muted-foreground text-xs font-semibold uppercase">
                Stronger signal
              </p>
              <p className="mt-2 font-serif">
                “This product contains 75% post-consumer recycled polyester, verified by [third
                party], compared with a 2024 baseline.”
              </p>
            </div>
          </div>
        </Section>

        <Section id="trust-transfer" title="Trust transfer theory">
          <p>
            Consumers may transfer trust from a credible third party — a certification body, an
            auditor or an assurance provider — to the brand. Third-party verification is therefore
            modelled as a potential moderator. Importantly, a certification only covers its stated
            scope; the Hub shows that scope so trust is not transferred further than the evidence
            supports.
          </p>
        </Section>

        <Section id="model" title="Proposed consumer model">
          <div className="bg-card grid gap-6 rounded-xl border p-6 sm:grid-cols-[1fr_auto] sm:items-center">
            <ol
              className="flex flex-col items-center gap-1"
              aria-label="Conceptual model, in order"
            >
              {MODEL.map((m, i) => (
                <li key={m} className="flex w-full max-w-xs flex-col items-center gap-1">
                  <span className="border-primary/30 bg-accent text-accent-foreground w-full rounded-lg border-2 px-4 py-3 text-center font-medium">
                    {m}
                  </span>
                  {i < MODEL.length - 1 && (
                    <ArrowDownIcon className="text-muted-foreground size-4" aria-hidden="true" />
                  )}
                </li>
              ))}
            </ol>
            <div className="rounded-lg border border-dashed p-4 text-center sm:max-w-48">
              <p className="text-muted-foreground text-xs font-semibold uppercase">
                Optional moderator
              </p>
              <p className="mt-1 font-medium">Third-Party Verification</p>
              <p className="text-muted-foreground mt-1 text-xs">
                Moderates the transparency → trust path (H5).
              </p>
            </div>
          </div>
          <p className="text-muted-foreground text-sm">
            Brand trust may also act as a mediator between perceived credibility and purchase
            intention.
          </p>
        </Section>

        <Section id="hypotheses" title="Hypotheses">
          <dl className="space-y-3">
            {HYPOTHESES.map(([id, text]) => (
              <div key={id} className="grid grid-cols-[3rem_1fr] gap-2">
                <dt className="text-primary font-semibold">{id}</dt>
                <dd>{text}</dd>
              </div>
            ))}
          </dl>
        </Section>

        <Section id="experiment" title="Planned A/B experiment">
          <div
            className="border-notice/30 bg-notice-bg text-notice rounded-lg border p-4 text-sm"
            role="note"
          >
            <strong>Status: planned.</strong> No participant data has been collected and no effects
            have been demonstrated.
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="bg-card rounded-lg border p-4">
              <p className="font-semibold">Control group</p>
              <p className="text-muted-foreground mt-1 text-sm">
                Brand, green advertisement and product description.
              </p>
            </div>
            <div className="bg-card rounded-lg border p-4">
              <p className="font-semibold">Transparency Hub condition</p>
              <p className="text-muted-foreground mt-1 text-sm">
                The same materials plus the brand&apos;s Transparency Hub profile.
              </p>
            </div>
          </div>
          <p>
            Both groups answer identical items on a <strong>5-point Likert scale</strong> (1 =
            strongly disagree, 5 = strongly agree). The design targets an exploratory sample of
            100–200 respondents; with convenience sampling, findings would not be described as
            representative.
          </p>
          <div className="space-y-3">
            {CONSTRUCTS.map((c) => (
              <div key={c.name}>
                <p className="font-medium">{c.name}</p>
                <ul className="text-muted-foreground list-disc pl-5 text-sm">
                  {c.items.map((i) => (
                    <li key={i}>{i}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="text-muted-foreground text-sm">
            Planned analysis: descriptive statistics, Cronbach&apos;s alpha, independent-samples
            t-tests, correlation and, where appropriate, linear regression. Participation would
            require informed consent; responses are anonymous and stored only as aggregated
            construct scores.
          </p>
        </Section>
      </div>
    </Container>
  );
}
