/**
 * Seed 20 demo members with profiles, ratings and source votes spread over the
 * last 60 days, so the leaderboard has something to show in every period.
 *
 * Demo members have provider "demo": they cannot sign in, and their ratings and
 * votes are excluded from public community aggregates (lib/community/service.ts).
 *
 *   npm run demo:seed            # (re)create the demo members
 *   npm run demo:seed -- --remove  # delete them and everything they created
 */
import "dotenv/config";
import { PrismaClient, type EsgPillar } from "@prisma/client";

const prisma = new PrismaClient();
const DAY = 24 * 60 * 60 * 1000;

const MEMBERS: { name: string; bio: string; interests: EsgPillar[]; activity: number }[] = [
  {
    name: "Minh Anh",
    bio: "Sinh viên môi trường, mê đọc báo cáo phát thải.",
    interests: ["E"],
    activity: 1,
  },
  {
    name: "Hoàng Long",
    bio: "Kỹ sư năng lượng tái tạo ở Đà Nẵng.",
    interests: ["E", "G"],
    activity: 0.95,
  },
  {
    name: "Thu Trang",
    bio: "Quan tâm thời trang bền vững và chuỗi cung ứng.",
    interests: ["S", "E"],
    activity: 0.9,
  },
  {
    name: "greenwatcher",
    bio: "Theo dõi tuyên bố xanh của các thương hiệu lớn.",
    interests: ["G"],
    activity: 0.85,
  },
  {
    name: "Quốc Bảo",
    bio: "Nhà đầu tư cá nhân, đọc ESG trước khi mua cổ phiếu.",
    interests: ["G", "S"],
    activity: 0.8,
  },
  {
    name: "Lan Phương",
    bio: "Giáo viên sinh học, dạy học sinh về khí hậu.",
    interests: ["E"],
    activity: 0.75,
  },
  {
    name: "Eco Khoa",
    bio: "Thích so sánh bao bì nhựa giữa các hãng sữa.",
    interests: ["E"],
    activity: 0.7,
  },
  {
    name: "Ngọc Hân",
    bio: "Làm truyền thông, quan tâm minh bạch doanh nghiệp.",
    interests: ["G"],
    activity: 0.65,
  },
  {
    name: "Đức Thịnh",
    bio: "Nghiên cứu sinh kinh tế phát triển.",
    interests: ["S", "G"],
    activity: 0.6,
  },
  {
    name: "Mai Linh",
    bio: "Người tiêu dùng muốn mua sắm có trách nhiệm hơn.",
    interests: ["S"],
    activity: 0.55,
  },
  {
    name: "Tuấn Kiệt",
    bio: "Dev, rảnh thì đi nhặt rác ở bãi biển.",
    interests: ["E"],
    activity: 0.5,
  },
  {
    name: "Bích Ngọc",
    bio: "Quan tâm quyền lao động trong ngành dệt may.",
    interests: ["S"],
    activity: 0.45,
  },
  {
    name: "Hải Đăng",
    bio: "Sinh viên tài chính, tìm hiểu đầu tư bền vững.",
    interests: ["G"],
    activity: 0.4,
  },
  {
    name: "climate_ly",
    bio: "Tình nguyện viên dự án trồng rừng ngập mặn.",
    interests: ["E", "S"],
    activity: 0.35,
  },
  {
    name: "Phương Thảo",
    bio: "Mẹ bỉm sữa, đọc kỹ nhãn sản phẩm.",
    interests: ["S"],
    activity: 0.3,
  },
  {
    name: "Gia Huy",
    bio: "Học sinh lớp 12, thích chủ đề biến đổi khí hậu.",
    interests: ["E"],
    activity: 0.25,
  },
  {
    name: "Thanh Tùng",
    bio: "Kế toán, tò mò về báo cáo bền vững.",
    interests: ["G"],
    activity: 0.2,
  },
  { name: "Khánh Vy", bio: "", interests: [], activity: 0.15 },
  { name: "Văn Nam", bio: "", interests: [], activity: 0.1 },
  { name: "An Nhiên", bio: "Mới tham gia, đang tìm hiểu ESG.", interests: ["S"], activity: 0.05 },
];

/** Deterministic PRNG so reruns produce the same leaderboard. */
function rng(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 2 ** 32;
    return seed / 2 ** 32;
  };
}

const clamp = (v: number) => Math.min(10, Math.max(0, Math.round(v * 2) / 2));

async function remove() {
  const { count } = await prisma.member.deleteMany({ where: { provider: "demo" } });
  console.log(`Removed ${count} demo members (ratings, votes and photos cascade).`);
}

async function seed() {
  await remove();
  const now = Date.now();
  const rand = rng(42);
  const brands = await prisma.brand.findMany({
    where: { status: "PUBLISHED", esgAssessments: { some: { isCurrent: true } } },
    select: {
      id: true,
      esgAssessments: { where: { isCurrent: true }, take: 1 },
      esgSources: { select: { id: true } },
    },
  });
  if (brands.length === 0) throw new Error("No published companies to rate.");

  for (const [i, m] of MEMBERS.entries()) {
    const joined = new Date(now - (20 + rand() * 40) * DAY);
    // Recent activity is weighted towards the most active members so weekly ranks differ from all-time.
    const when = () => new Date(joined.getTime() + rand() * (now - joined.getTime()));
    const complete = m.bio !== "" && m.interests.length > 0;
    const member = await prisma.member.create({
      data: {
        provider: "demo",
        subject: `demo-${i + 1}`,
        displayName: m.name,
        bio: m.bio || null,
        interests: m.interests,
        createdAt: joined,
        profileCompletedAt: complete ? new Date(joined.getTime() + DAY) : null,
      },
    });

    const shuffled = [...brands].sort(() => rand() - 0.5);
    const rated = shuffled.slice(0, Math.max(1, Math.round(m.activity * brands.length * 0.8)));
    await prisma.communityRating.createMany({
      data: rated.map((b) => {
        const a = b.esgAssessments[0];
        const at = when();
        return {
          brandId: b.id,
          memberId: member.id,
          stars: 1 + Math.floor(rand() * 5),
          environmental: clamp(a.environmental + (rand() - 0.5) * 3),
          social: clamp(a.social + (rand() - 0.5) * 3),
          governance: clamp(a.governance + (rand() - 0.5) * 3),
          createdAt: at,
          updatedAt: at,
        };
      }),
    });

    const sources = rated.flatMap((b) => b.esgSources);
    const voted = sources.filter(() => rand() < m.activity);
    await prisma.sourceVote.createMany({
      data: voted.map((s) => {
        const at = when();
        return {
          sourceId: s.id,
          memberId: member.id,
          reliable: rand() < 0.8,
          createdAt: at,
          updatedAt: at,
        };
      }),
    });
    console.log(`${m.name}: ${rated.length} ratings, ${voted.length} votes`);
  }
}

(process.argv.includes("--remove") ? remove() : seed())
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
