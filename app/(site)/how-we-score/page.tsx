import type { Metadata } from "next";
import { BAND_VAR, BandScale, PILLAR_VAR } from "@/components/gl/score-parts";
import { SiteHeader } from "@/components/gl/site-chrome";
import { BANDS, ESG_METHODOLOGY_VERSION, ESG_WEIGHTS } from "@/lib/esg/scoring";
import { getLocale } from "@/lib/i18n/server";
import { tr } from "@/lib/i18n/shared";

export const metadata: Metadata = { title: "How we score" };
export const dynamic = "force-dynamic";

export default async function HowWeScorePage() {
  const locale = await getLocale();
  const L = (vi: string, en: string) => tr(locale, vi, en);

  const pillars = [
    {
      k: "e" as const,
      name: L("Môi trường", "Environmental"),
      items: L(
        "Phát thải carbon, năng lượng tái tạo, giảm rác thải, bao bì, tái chế, sử dụng tài nguyên, ô nhiễm, và mục tiêu môi trường so với kết quả thực tế.",
        "Carbon emissions, renewable energy, waste reduction, packaging, recycling, resource use, pollution, and environmental targets versus actual results.",
      ),
    },
    {
      k: "s" as const,
      name: L("Xã hội", "Social"),
      items: L(
        "Phúc lợi nhân viên, quyền lao động, điều kiện làm việc trong chuỗi cung ứng, đa dạng, an toàn sản phẩm, phúc lợi người tiêu dùng và đầu tư cộng đồng.",
        "Employee welfare, labour rights, supply-chain working conditions, diversity, product safety, consumer welfare and community investment.",
      ),
    },
    {
      k: "g" as const,
      name: L("Quản trị", "Governance"),
      items: L(
        "Giám sát của hội đồng quản trị, trách nhiệm giải trình, đạo đức kinh doanh, minh bạch, quản trị rủi ro và cách phản hồi tranh cãi.",
        "Board oversight, accountability, business ethics, transparency, risk management and responses to controversies.",
      ),
    },
  ];

  const principles = [
    [
      L("Thưởng kết quả, không thưởng lời hứa", "Reward results, not promises"),
      L(
        "Mục tiêu tham vọng không đủ để có điểm cao nếu chưa có kết quả được báo cáo.",
        "Ambitious targets don't earn a high score without reported results.",
      ),
    ],
    [
      L("Thành tích và tranh cãi cùng được tính", "Achievements and controversies both count"),
      L(
        "Điểm phản ánh cả sáng kiến tích cực lẫn điểm yếu, khoảng trống được báo chí nêu.",
        "Scores reflect positive initiatives and the weaknesses and gaps reported in the coverage.",
      ),
    ],
    [
      L("Cáo buộc không phải kết luận", "Allegations are not findings"),
      L(
        "Vấn đề được báo cáo được ghi là đang xem xét, không phải bằng chứng sai phạm.",
        "Reported issues are treated as under examination, not as proof of wrongdoing.",
      ),
    ],
    [
      L("Thiếu bằng chứng ≠ làm kém", "Missing evidence ≠ poor performance"),
      L(
        "Ít thông tin nghĩa là khó kiểm chứng hơn, và điều đó có thể ảnh hưởng điểm quản trị.",
        "Less information means harder to verify, which may affect the governance score.",
      ),
    ],
  ];

  return (
    <>
      <div className="contours text-on-forest">
        <SiteHeader variant="forest" />
        <section id="main" className="mx-auto max-w-6xl px-4 pt-10 pb-16 sm:px-6 sm:pt-16">
          <p className="eyebrow text-mint">
            {L("Phương pháp", "Methodology")} · {ESG_METHODOLOGY_VERSION}
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl leading-[1.06] font-semibold sm:text-6xl">
            {L(
              "Một công thức công khai, áp dụng như nhau cho mọi công ty.",
              "One published formula, applied the same way to every company.",
            )}
          </h1>
          <p className="text-on-forest-2 mt-6 max-w-2xl text-lg">
            {L(
              "Mỗi công ty được chấm ba trụ trên thang 10, dựa trên bài báo và công bố của doanh nghiệp đã thu thập. Điểm ESG là trung bình có trọng số của ba trụ.",
              "Each company is scored on three pillars out of 10, using collected articles and company disclosures. The ESG score is the weighted average of the three.",
            )}
          </p>
          <div
            className="mt-10 flex h-16 overflow-hidden rounded-2xl text-sm font-semibold text-white sm:text-base"
            role="img"
            aria-label="E 40%, S 35%, G 25%"
          >
            {(["e", "s", "g"] as const).map((k) => (
              <div
                key={k}
                className="flex items-center px-5"
                style={{ flex: ESG_WEIGHTS[k], background: PILLAR_VAR[k] }}
              >
                {k.toUpperCase()} · {Math.round(ESG_WEIGHTS[k] * 100)}%
              </div>
            ))}
          </div>
          <p className="tabular text-on-forest-2 mt-4 font-mono">
            ESG = 0.40 × E + 0.35 × S + 0.25 × G
          </p>
        </section>
      </div>

      <main className="mx-auto max-w-6xl space-y-20 px-4 pt-16 sm:px-6">
        <section aria-labelledby="p-h" className="space-y-6">
          <h2 id="p-h" className="text-3xl font-semibold">
            {L("Ba trụ được đánh giá", "The three pillars")}
          </h2>
          <ul className="grid gap-4 md:grid-cols-3">
            {pillars.map((p) => (
              <li key={p.k} className="bg-card rounded-2xl border p-6">
                <div className="flex items-center gap-3">
                  <span
                    className="grid size-11 place-items-center rounded-xl font-serif text-xl font-semibold text-white"
                    style={{ background: PILLAR_VAR[p.k] }}
                  >
                    {p.k.toUpperCase()}
                  </span>
                  <div>
                    <h3 className="font-sans text-base font-semibold">{p.name}</h3>
                    <p className="tabular text-muted-foreground text-sm">
                      {Math.round(ESG_WEIGHTS[p.k] * 100)}%
                    </p>
                  </div>
                </div>
                <p className="text-muted-foreground mt-4 text-sm leading-relaxed">{p.items}</p>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="b-h" className="space-y-6">
          <h2 id="b-h" className="text-3xl font-semibold">
            {L("Đọc điểm số", "Reading the score")}
          </h2>
          <div className="bg-card rounded-2xl border p-6 sm:p-8">
            <BandScale locale={locale} />
            <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {[...BANDS].reverse().map((b) => (
                <li
                  key={b.key}
                  className="border-t-4 pt-3"
                  style={{ borderColor: BAND_VAR[b.key] }}
                >
                  <p className="tabular font-semibold">
                    {b.min.toFixed(1)}–{b.max.toFixed(1)} · {tr(locale, b.vi, b.en)}
                  </p>
                  <p className="text-muted-foreground mt-1 text-sm">
                    {tr(locale, b.meaningVi, b.meaningEn)}
                  </p>
                </li>
              ))}
            </ul>
            <p className="text-muted-foreground mt-6 text-sm">
              {L(
                "Điểm hiển thị làm tròn một chữ số thập phân theo quy tắc chuẩn (7,25 → 7,3). Xếp hạng dùng giá trị chưa làm tròn.",
                "Displayed scores are rounded half-up to one decimal (7.25 → 7.3). Rankings use the unrounded value.",
              )}
            </p>
          </div>
        </section>

        <section aria-labelledby="pr-h" className="space-y-6">
          <h2 id="pr-h" className="text-3xl font-semibold">
            {L("Nguyên tắc chấm", "Scoring principles")}
          </h2>
          <dl className="grid gap-x-10 gap-y-8 md:grid-cols-2">
            {principles.map(([t, d]) => (
              <div key={t} className="border-primary border-l-2 pl-5">
                <dt className="font-serif text-xl font-semibold">{t}</dt>
                <dd className="text-muted-foreground mt-2">{d}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section aria-labelledby="l-h" className="rounded-3xl border border-dashed p-6 sm:p-10">
          <h2 id="l-h" className="text-2xl font-semibold">
            {L("Giới hạn", "Limitations")}
          </h2>
          <ul className="text-muted-foreground mt-4 list-disc space-y-2 pl-5">
            <li>
              {L(
                "Đây là ước tính phân tích của nhóm nghiên cứu, không phải xếp hạng chính thức của MSCI, Sustainalytics hay S&P Global.",
                "These are the research team's analytical estimates, not official ratings from MSCI, Sustainalytics or S&P Global.",
              )}
            </li>
            <li>
              {L(
                "Một số nguồn là thông cáo của doanh nghiệp hoặc bài bình luận, không phải tin độc lập; chúng tôi đang thay dần bằng nguồn độc lập.",
                "Some sources are company announcements or commentary rather than independent reporting; we are replacing them over time.",
              )}
            </li>
            <li>
              {L(
                "Điểm có thể thay đổi khi có bằng chứng mới. Mỗi lần chấm lại được lưu thành một bản mới, không ghi đè bản cũ.",
                "Scores can change as new evidence appears. Every re-assessment is saved as a new version; old ones are never overwritten.",
              )}
            </li>
            <li>
              {L(
                "Không phải lời khuyên đầu tư hay chứng nhận về tính bền vững.",
                "Not investment advice or a sustainability certification.",
              )}
            </li>
          </ul>
        </section>
      </main>
    </>
  );
}
