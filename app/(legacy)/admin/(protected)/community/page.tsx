import Link from "next/link";
import { AdminHeader, AdminTable } from "@/components/admin/admin-ui";
import { Button } from "@/components/ui/button";
import { reviewSubmissionAction, setRatingHiddenAction } from "@/lib/community/actions";
import {
  communityQueueCounts,
  listFlaggedSources,
  listPendingSubmissions,
  listRecentRatings,
} from "@/lib/community/service";
import { formatEsg } from "@/lib/esg/scoring";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils/format";

export const metadata = { title: "Community" };

const TABS = [
  { key: "submissions", label: "Article suggestions" },
  { key: "flagged", label: "Doubtful sources" },
  { key: "ratings", label: "Recent ratings" },
] as const;

const PILLAR = { E: "Environmental", S: "Social", G: "Governance" } as const;
const SENTIMENT = { POSITIVE: "Positive", NEUTRAL: "Neutral", NEGATIVE: "Negative" } as const;

export default async function AdminCommunityPage(props: PageProps<"/admin/community">) {
  const { tab: raw } = await props.searchParams;
  const tab = TABS.find((t) => t.key === raw)?.key ?? "submissions";
  const counts = await communityQueueCounts();

  return (
    <>
      <AdminHeader
        title="Community"
        description="Member suggestions, reliability votes and ratings. Approving a suggestion only adds it to the company's sources — E/S/G scores change only when you re-assess the company (npm run seed:esg), and the previous assessment is kept."
      />
      <nav aria-label="Community queues" className="flex flex-wrap gap-1.5 text-sm">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={`/admin/community?tab=${t.key}`}
            aria-current={tab === t.key ? "page" : undefined}
            className={cn(
              "rounded-full border px-3 py-1",
              tab === t.key && "border-primary bg-accent font-semibold",
            )}
          >
            {t.label}
            {t.key === "submissions" && ` · ${counts.pending}`}
            {t.key === "flagged" && ` · ${counts.flagged}`}
          </Link>
        ))}
      </nav>
      {tab === "submissions" && <Submissions />}
      {tab === "flagged" && <Flagged />}
      {tab === "ratings" && <Ratings />}
    </>
  );
}

async function Submissions() {
  const rows = await listPendingSubmissions();
  return (
    <AdminTable
      head={["Company", "Article", "Pillar", "News", "Member", "Decision"]}
      empty={!rows.length}
    >
      {rows.map((r) => {
        const approved = r.member.submissions.filter((s) => s.status === "APPROVED").length;
        const rejected = r.member.submissions.filter((s) => s.status === "REJECTED").length;
        return (
          <tr key={r.id} className="align-top">
            <td className="px-4 py-3 font-semibold">
              <Link href={`/companies/${r.brand.slug}`} className="hover:underline">
                {r.brand.name}
              </Link>
            </td>
            <td className="max-w-sm px-4 py-3">
              <a
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium hover:underline"
              >
                {r.title}
              </a>
              <p className="text-muted-foreground mt-1 text-xs">{r.summary}</p>
              <p className="text-muted-foreground mt-1 text-xs">{formatDate(r.createdAt)}</p>
            </td>
            <td className="px-4 py-3">{PILLAR[r.pillar]}</td>
            <td className="px-4 py-3">{SENTIMENT[r.sentiment]}</td>
            <td className="px-4 py-3">
              {r.member.displayName}
              <p className="text-muted-foreground text-xs">{r.member.email}</p>
              <p className="text-muted-foreground text-xs">
                {approved} approved · {rejected} rejected before
              </p>
            </td>
            <td className="px-4 py-3">
              <form action={reviewSubmissionAction} className="flex min-w-48 flex-col gap-2">
                <input type="hidden" name="submissionId" value={r.id} />
                <label className="sr-only" htmlFor={`note-${r.id}`}>
                  Note
                </label>
                <input
                  id={`note-${r.id}`}
                  name="reviewNote"
                  placeholder="Note (optional)"
                  maxLength={1000}
                  className="border-input h-8 rounded-md border bg-transparent px-2 text-xs"
                />
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    name="decision"
                    value="REJECTED"
                    variant="outline"
                    size="sm"
                  >
                    Reject
                  </Button>
                  <Button type="submit" name="decision" value="APPROVED" size="sm">
                    Approve
                  </Button>
                </div>
              </form>
            </td>
          </tr>
        );
      })}
    </AdminTable>
  );
}

async function Flagged() {
  const rows = await listFlaggedSources();
  return (
    <AdminTable head={["Company", "Source", "Reliable", "Votes"]} empty={!rows.length}>
      {rows.map((s) => (
        <tr key={s.id}>
          <td className="px-4 py-3 font-semibold">{s.brand.name}</td>
          <td className="max-w-md px-4 py-3">
            <a href={s.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
              {s.title}
            </a>
          </td>
          <td className="px-4 py-3">{Math.round((s.reliability.share ?? 0) * 100)}%</td>
          <td className="px-4 py-3">{s.reliability.total}</td>
        </tr>
      ))}
    </AdminTable>
  );
}

async function Ratings() {
  const rows = await listRecentRatings();
  return (
    <AdminTable
      head={["Updated", "Company", "Member", "Stars", "E · S · G", "Comment", ""]}
      empty={!rows.length}
    >
      {rows.map((r) => (
        <tr key={r.id} className={cn("align-top", r.hidden && "opacity-50")}>
          <td className="px-4 py-3 whitespace-nowrap">{formatDate(r.updatedAt)}</td>
          <td className="px-4 py-3 font-semibold">{r.brand.name}</td>
          <td className="px-4 py-3">
            {r.member.displayName}
            <p className="text-muted-foreground text-xs">{r.member.email}</p>
          </td>
          <td className="px-4 py-3">{r.stars}★</td>
          <td className="px-4 py-3 whitespace-nowrap">
            {formatEsg(r.environmental)} · {formatEsg(r.social)} · {formatEsg(r.governance)}
          </td>
          <td className="text-muted-foreground max-w-xs px-4 py-3 text-xs">{r.comment}</td>
          <td className="px-4 py-3">
            <form action={setRatingHiddenAction}>
              <input type="hidden" name="ratingId" value={r.id} />
              <input type="hidden" name="hidden" value={r.hidden ? "false" : "true"} />
              <Button type="submit" variant="outline" size="sm">
                {r.hidden ? "Show" : "Hide"}
              </Button>
            </form>
          </td>
        </tr>
      ))}
    </AdminTable>
  );
}
