"use client";

import { Loader2Icon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LIKERT_LABELS, SURVEY_ITEMS, type StudyStimulus } from "@/lib/research/instrument";
import { AdStimulus, HubSummary, type HubSummaryData } from "./stimulus";

type Step = "consent" | "stimulus" | "survey" | "done";

/**
 * Participant flow: consent → (server-side random assignment) → stimulus →
 * Likert questionnaire → debrief. No personal data is requested.
 */
export function StudyFlow({
  slug,
  title,
  consentText,
  debriefText,
  stimulus,
  hubSummary,
}: {
  slug: string;
  title: string;
  consentText: string;
  debriefText: string;
  stimulus: StudyStimulus;
  hubSummary: HubSummaryData | null;
}) {
  const [step, setStep] = useState<Step>("consent");
  const [agreed, setAgreed] = useState(false);
  const [assignment, setAssignment] = useState<{
    participantCode: string;
    conditionKey: string;
  } | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function post(path: string, body: unknown) {
    const res = await fetch(`/api/study/${slug}/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = res.status === 204 ? {} : await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.error ?? "Something went wrong. Please try again.");
    return json;
  }

  async function start() {
    setBusy(true);
    setError(null);
    try {
      const json = await post("start", { consent: true });
      setAssignment(json.data);
      setStep("stimulus");
      window.scrollTo({ top: 0 });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function submit() {
    const missing = SURVEY_ITEMS.filter((i) => !answers[i.id]);
    if (missing.length > 0) {
      setError(`Please answer every statement (${missing.length} remaining).`);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await post("responses", { participantCode: assignment!.participantCode, items: answers });
      setStep("done");
      window.scrollTo({ top: 0 });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const progress = { consent: 1, stimulus: 2, survey: 3, done: 4 }[step];

  return (
    <div className="mx-auto max-w-2xl space-y-6" data-testid="study-flow">
      <p className="text-muted-foreground text-xs" aria-live="polite">
        Step {progress} of 4
      </p>

      {step === "consent" && (
        <section className="bg-card space-y-5 rounded-xl border p-6">
          <h2 className="text-xl font-semibold">{title}</h2>
          <p className="text-sm whitespace-pre-line">{consentText}</p>
          <ul className="text-muted-foreground list-disc space-y-1 pl-5 text-sm">
            <li>
              It takes about 3 minutes. You will see a short brand message and answer 7 statements.
            </li>
            <li>
              No name, e-mail or other personal data is collected; answers are stored anonymously.
            </li>
            <li>You can stop at any time by closing the page.</li>
          </ul>
          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              className="mt-0.5 size-4 accent-[var(--primary)]"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
            />
            I have read the information above and agree to take part.
          </label>
          <Button onClick={start} disabled={!agreed || busy}>
            {busy && <Loader2Icon className="animate-spin" />}
            Start
          </Button>
        </section>
      )}

      {step === "stimulus" && assignment && (
        <section className="space-y-5">
          <p className="text-muted-foreground text-sm">
            Please look at the following information as you would when shopping.
          </p>
          <AdStimulus stimulus={stimulus} />
          {assignment.conditionKey === "transparency_hub" && hubSummary && (
            <HubSummary data={hubSummary} />
          )}
          <Button
            onClick={() => {
              setStep("survey");
              window.scrollTo({ top: 0 });
            }}
          >
            Continue to questions
          </Button>
        </section>
      )}

      {step === "survey" && (
        <form
          className="space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            void submit();
          }}
        >
          <p className="text-muted-foreground text-sm">
            Thinking about <strong>{stimulus.brandName}</strong>, how much do you agree with each
            statement?
          </p>
          {SURVEY_ITEMS.map((item, index) => (
            <fieldset key={item.id} className="bg-card rounded-lg border p-4">
              <legend className="px-1 text-sm font-medium">
                {index + 1}. {item.text}
              </legend>
              <div className="mt-3 grid gap-2 sm:grid-cols-5">
                {LIKERT_LABELS.map((label, i) => (
                  <label
                    key={label}
                    className="has-[:checked]:border-primary has-[:checked]:bg-accent flex cursor-pointer items-center gap-2 rounded-md border px-2 py-2 text-xs sm:flex-col sm:text-center"
                  >
                    <input
                      type="radio"
                      name={item.id}
                      value={i + 1}
                      checked={answers[item.id] === i + 1}
                      onChange={() => setAnswers((a) => ({ ...a, [item.id]: i + 1 }))}
                      className="accent-[var(--primary)]"
                    />
                    {label}
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
          <Button type="submit" disabled={busy}>
            {busy && <Loader2Icon className="animate-spin" />}
            Submit answers
          </Button>
        </form>
      )}

      {step === "done" && (
        <section className="bg-card space-y-3 rounded-xl border p-6" role="status">
          <h2 className="text-xl font-semibold">Thank you for taking part</h2>
          <p className="text-muted-foreground text-sm whitespace-pre-line">{debriefText}</p>
        </section>
      )}

      {error && (
        <p role="alert" className="text-destructive text-sm">
          {error}
        </p>
      )}
    </div>
  );
}
