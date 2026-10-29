/**
 * Greenlens ESG assessments — source: rating.md (project research, Oct 2026).
 *
 * Analytical estimates built from collected news articles and company
 * disclosures; NOT official ratings from MSCI, Sustainalytics or S&P Global.
 * Pillars are scored /10; the overall score is always recomputed from the
 * pillars with lib/esg/scoring.ts (the `listedOverall` from rating.md is kept
 * only for auditing).
 */
export type SectorKey = "fashion" | "beauty" | "food" | "tech" | "retail" | "real-estate";

export interface Bilingual {
  vi: string;
  en: string;
}

export interface EsgSourceSeed {
  title: string;
  url: string;
  /** True when the link is not a specific article (e.g. a search page). */
  needsReplacement?: boolean;
}

export interface EsgCompanySeed {
  slug: string;
  name: string;
  sector: SectorKey;
  country: string;
  domain: string;
  e: number;
  s: number;
  g: number;
  listedOverall: number;
  why: Bilingual;
  notes: { e: Bilingual; s: Bilingual; g: Bilingual };
  sources: EsgSourceSeed[];
  /** ISO date of the assessment; defaults to the original dataset date. */
  assessedAt?: string;
}

export const SECTORS: { key: SectorKey; vi: string; en: string; context: Bilingual }[] = [
  {
    key: "fashion",
    vi: "Thời trang",
    en: "Fashion & apparel",
    context: {
      vi: "Sản xuất thâm dụng carbon, rác thải dệt may, tiêu thụ nước và điều kiện lao động trong chuỗi cung ứng toàn cầu.",
      en: "Carbon-intensive manufacturing, textile waste, water use and labour conditions across global supply chains.",
    },
  },
  {
    key: "beauty",
    vi: "Làm đẹp & chăm sóc cá nhân",
    en: "Beauty & personal care",
    context: {
      vi: "Bao bì, thành phần, quản lý hóa chất, phát thải sản xuất và an toàn sản phẩm.",
      en: "Packaging, ingredients, chemical management, manufacturing emissions and product safety.",
    },
  },
  {
    key: "food",
    vi: "Thực phẩm & đồ uống",
    en: "Food & beverage",
    context: {
      vi: "Nguồn nguyên liệu nông nghiệp, nước, rác bao bì, khí nhà kính, dinh dưỡng và sức khỏe người tiêu dùng.",
      en: "Agricultural sourcing, water, packaging waste, greenhouse gases, nutrition and consumer health.",
    },
  },
  {
    key: "tech",
    vi: "Công nghệ & điện tử",
    en: "Technology & electronics",
    context: {
      vi: "Sản xuất tiêu tốn năng lượng, khai thác khoáng sản, rác thải điện tử, lao động và quyền riêng tư dữ liệu.",
      en: "Energy-intensive manufacturing, mineral sourcing, e-waste, labour conditions and data privacy.",
    },
  },
  {
    key: "retail",
    vi: "Bán lẻ & hàng tiêu dùng",
    en: "Retail & consumer goods",
    context: {
      vi: "Nguồn hàng, bao bì, năng lượng, quản lý rác, phúc lợi nhân viên và quan hệ nhà cung cấp.",
      en: "Product sourcing, packaging, energy, waste management, worker welfare and supplier relationships.",
    },
  },
  {
    key: "real-estate",
    vi: "Bất động sản",
    en: "Real estate",
    context: {
      vi: "Sử dụng đất và hệ sinh thái, năng lượng và vật liệu của công trình, rủi ro ngập lụt và khí hậu, nhà ở vừa túi tiền, an toàn lao động công trường và minh bạch tài chính.",
      en: "Land use and ecosystems, building energy and materials, flood and climate risk, affordable housing, construction-site safety and financial transparency.",
    },
  },
];

const b = (vi: string, en: string): Bilingual => ({ vi, en });

export const COMPANIES: EsgCompanySeed[] = [
  {
    slug: "nike",
    name: "Nike",
    sector: "fashion",
    country: "US",
    domain: "nike.com",
    e: 6.5,
    s: 6.0,
    g: 6.0,
    listedOverall: 6.2,
    why: b(
      "Nike có nguồn lực lớn để cải thiện, nhưng chuỗi cung ứng toàn cầu và yêu cầu chứng minh trách nhiệm xã hội nhất quán khiến điểm chưa thể cao hơn.",
      "Nike has substantial resources to improve sustainability, but its global supply-chain footprint and the need to demonstrate consistent social responsibility prevent a higher rating.",
    ),
    notes: {
      e: b(
        "Đã đầu tư vào vật liệu ít tác động, giảm rác thải và năng lượng tái tạo. Tuy nhiên, quy mô sản xuất toàn cầu và sự phụ thuộc vào nhà cung cấp khiến việc loại bỏ phát thải và rác dệt may rất khó.",
        "Invested in lower-impact materials, waste reduction and renewable energy; global manufacturing and supplier dependence make emissions and textile waste hard to eliminate.",
      ),
      s: b(
        "Các chương trình thể thao và cộng đồng là điểm tích cực; điều kiện lao động, bảo vệ người lao động và trách nhiệm của nhà cung cấp vẫn cần được xem xét.",
        "Sports and community initiatives are positive; labour conditions, worker protections and supplier accountability remain areas to investigate.",
      ),
      g: b(
        "Phân tích quản trị doanh nghiệp đặt ra câu hỏi về lãnh đạo và chiến lược. Những khó khăn trong quản lý tự chúng không chứng minh có sai phạm.",
        "Governance analysis raises questions about leadership and strategy; management challenges alone do not establish misconduct.",
      ),
    },
    sources: [
      {
        title:
          "Tackling climate change in sport: Nike's sustainable impact — Sustainability Magazine",
        url: "https://sustainabilitymag.com/news/tackling-climate-change-in-sport-nikes-sustainable-impact",
      },
      {
        title: "Nike corporate social responsibility — Business Model Analyst",
        url: "https://businessmodelanalyst.com/nike-corporate-social-responsibility/",
      },
      {
        title: "What is going on at Nike? — Corporate Governance Institute",
        url: "https://www.thecorporategovernanceinstitute.com/insights/news-analysis/what-is-going-on-at-nike/",
      },
    ],
  },
  {
    slug: "adidas",
    name: "Adidas",
    sector: "fashion",
    country: "DE",
    domain: "adidas.com",
    e: 7.5,
    s: 7.0,
    g: 7.5,
    listedOverall: 7.3,
    why: b(
      "Adidas thuộc nhóm mạnh vì báo cáo tiến độ đo lường được và tự nêu ra điểm còn thiếu, thay vì chỉ đưa ra lời hứa chung chung.",
      "Adidas is one of the stronger companies because it reports measurable progress and identifies shortcomings rather than relying on general promises.",
    ),
    notes: {
      e: b(
        "Báo cáo giảm 9% cường độ carbon của sản phẩm (2022–2025) và giảm 22% phát thải Phạm vi 1 và 2 trong cùng giai đoạn.",
        "Reported a 9% reduction in product carbon intensity (2022–2025) and a 22% reduction in Scope 1 and 2 emissions over the same period.",
      ),
      s: b(
        "Có quy trình thẩm định nhân quyền và đánh giá nhà cung cấp; năm 2025, 80% nhà cung cấp cấp 1 đạt mức 4S, thấp hơn mục tiêu 90%.",
        "Human-rights due diligence and supplier assessments exist; 80% of Tier 1 suppliers reached its higher 4S rating in 2025, below the 90% target.",
      ),
      g: b(
        "Mục tiêu công khai, báo cáo bền vững và chính sách nhân quyền cho thấy cách tiếp cận có cấu trúc về trách nhiệm giải trình.",
        "Published targets, sustainability reporting and human-rights policies show a structured approach to accountability.",
      ),
    },
    sources: [
      {
        title: "From performance to purpose: Adidas's social impact and people strategy — SAGE",
        url: "https://sk.sagepub.com/cases/from-performance-to-purpose-adidass-social-impact-and-people-strategy",
      },
      {
        title: "Inside Adidas' approach to growth and sustainability — Sustainability Magazine",
        url: "https://sustainabilitymag.com/articles/inside-adidas-approach-to-growth-and-sustainability",
      },
      {
        title: "Our targets — adidas Group",
        url: "https://www.adidas-group.com/en/sustainability/our-gameplan/our-targets",
      },
    ],
  },
  {
    slug: "hm",
    name: "H&M",
    sector: "fashion",
    country: "SE",
    domain: "hm.com",
    e: 7.5,
    s: 6.0,
    g: 5.5,
    listedOverall: 6.5,
    why: b(
      "H&M có tiến bộ môi trường rõ, nhưng sản lượng thời trang nhanh và những nghi vấn về độ tin cậy của các tuyên bố bền vững kéo điểm tổng xuống.",
      "H&M shows environmental progress, but fast-fashion volumes and concerns about the credibility of its sustainability claims limit its overall score.",
    ),
    notes: {
      e: b(
        "Báo cáo năm 2025 giảm 41% phát thải Phạm vi 1 và 2, giảm 34,6% Phạm vi 3 so với năm gốc 2019.",
        "Reported 41% lower Scope 1 and 2 and 34.6% lower Scope 3 emissions in 2025 versus a 2019 baseline.",
      ),
      s: b(
        "Mạng lưới sản xuất thuê ngoài rộng lớn tạo ra thách thức liên tục về điều kiện làm việc tại nhà cung cấp.",
        "An extensive outsourced production network creates continuing challenges around supplier working conditions.",
      ),
      g: b(
        "Tranh cãi về greenwashing được báo chí đưa tin đặt ra câu hỏi liệu truyền thông bền vững có phản ánh đúng tác động thực tế hay không.",
        "A reported greenwashing controversy raises concerns about whether sustainability marketing reflects broader impact.",
      ),
    },
    sources: [
      {
        title: "H&M case shows how greenwashing breaks brand promise — Forbes",
        url: "https://www.forbes.com/sites/retailwire/2022/07/13/hm-case-shows-how-greenwashing-breaks-brand-promise/",
      },
      {
        title: "What H&M's sustainability report says about its emissions — Vogue",
        url: "https://www.vogue.com/article/what-handms-sustainability-report-says-about-its-emissions",
      },
      {
        title:
          "Sustainability, circularity and social responsibility at H&M — Sustainability Magazine",
        url: "https://sustainabilitymag.com/articles/sustainability-circularity-social-responsibility-at-h-m",
      },
    ],
  },
  {
    slug: "uniqlo",
    name: "UNIQLO",
    sector: "fashion",
    country: "JP",
    domain: "uniqlo.com",
    e: 7.5,
    s: 7.0,
    g: 7.0,
    listedOverall: 7.2,
    why: b(
      "UNIQLO có tiến bộ môi trường đo được và các chương trình cộng đồng rõ ràng. Thách thức là giữ tốc độ cải thiện theo kịp tốc độ mở rộng.",
      "UNIQLO has measurable environmental progress and visible community programmes; the challenge is keeping pace with expansion.",
    ),
    notes: {
      e: b(
        "Fast Retailing báo cáo năm tài chính 2025 giảm 90,3% phát thải Phạm vi 1 và 2 so với 2019, 93,5% điện tại cửa hàng và văn phòng là điện tái tạo; Phạm vi 3 giảm 19,9%.",
        "Fast Retailing reported 90.3% lower Scope 1 and 2 emissions vs 2019 in FY2025, 93.5% renewable electricity in stores and offices; Scope 3 down 19.9%.",
      ),
      s: b(
        "Các chương trình cộng đồng, giáo dục và hỗ trợ xã hội tại Việt Nam là điểm tích cực; điều kiện lao động ở nhà cung cấp vẫn cần lưu ý.",
        "Community, education and social-support initiatives in Vietnam are positive; supplier labour conditions remain a consideration.",
      ),
      g: b(
        "Kết quả công bố và sáng kiến truy xuất nguồn gốc hỗ trợ tính minh bạch; cần thêm kiểm chứng độc lập để tăng độ tin cậy.",
        "Published results and traceability initiatives support transparency; more independent verification would strengthen confidence.",
      ),
    },
    sources: [
      {
        title: "UNIQLO expands sustainability initiatives in Viet Nam — Bizhub",
        url: "https://bizhub.vietnamnews.vn/uniqlo-expands-sustainability-initiatives-in-viet-nam-post414713.html",
      },
      {
        title: "UNIQLO Vietnam cares for stable social foundation — Saigon Times",
        url: "https://news.tuoitre.vn/saigontimes/uniqlo-vietnam-cares-for-stable-social-foundation-105373659.htm",
      },
      {
        title: "Fast Retailing fiscal 2025 sustainability results — UNIQLO VN",
        url: "https://www.uniqlo.com/vn/vi/news/topics/2026100601/",
      },
    ],
  },
  {
    slug: "canifa",
    name: "Canifa",
    sector: "fashion",
    country: "VN",
    domain: "canifa.com",
    e: 6.0,
    s: 7.5,
    g: 6.0,
    listedOverall: 6.5,
    why: b(
      "Bằng chứng mạnh nhất của Canifa nằm ở đóng góp xã hội. Điểm E và G thấp hơn phản ánh khoảng trống bằng chứng, không chứng minh công ty làm kém.",
      "Canifa's strongest evidence lies in social contribution; lower E and G reflect gaps in evidence, not proof of poor performance.",
    ),
    notes: {
      e: b(
        "Các bài báo cho thấy bằng chứng về trách nhiệm xã hội rõ hơn so với việc giảm phát thải, nước hay rác dệt may được đo lường độc lập.",
        "Articles provide stronger evidence of social responsibility than of measured reductions in emissions, water or textile waste.",
      ),
      s: b(
        "Chương trình sưởi ấm mùa đông cho trẻ em vùng cao thể hiện sự gắn kết cộng đồng và hỗ trợ nhóm dễ tổn thương.",
        "A winter-warming programme for children in mountainous areas shows community engagement.",
      ),
      g: b(
        "Thông tin CSR công khai có giá trị, nhưng cần báo cáo đầy đủ hơn về nhà cung cấp, hiệu quả môi trường và trách nhiệm giải trình.",
        "Public CSR information is useful, but fuller reporting on suppliers and accountability is needed.",
      ),
    },
    sources: [
      {
        title: "Canifa và hành trình 20 năm lan tỏa hơi ấm mùa đông tới trẻ vùng cao — CafeBiz",
        url: "https://cafebiz.vn/canifa-va-hanh-trinh-20-nam-lan-toa-hoi-am-mua-dong-toi-tre-vung-cao-176241106083825137.chn",
      },
      {
        title: "Chuỗi hoạt động CSR của Canifa lan tỏa giá trị tích cực — Công Thương",
        url: "https://congthuong.vn/chuoi-hoat-dong-csr-cua-canifa-lan-toa-gia-tri-tich-cuc-366217.html",
      },
      {
        title: "Canifa business and partnership controversy — Vietnam.vn",
        url: "https://www.vietnam.vn/en/canifa-chuyen-ve-nhan-hang-thoi-trang-ky-tinh-nhat-viet-nam-doi-tac-tung-tuyen-bo-nghi-choi-vi-doi-hoi-qua-nhieu",
      },
    ],
  },
  {
    slug: "viet-tien",
    name: "Việt Tiến",
    sector: "fashion",
    country: "VN",
    domain: "viettien.com.vn",
    e: 6.5,
    s: 6.5,
    g: 6.0,
    listedOverall: 6.4,
    why: b(
      "Việt Tiến cam kết phát triển bền vững, nhưng các bài báo có ít bằng chứng định lượng hơn so với công bố của các đối thủ quốc tế lớn.",
      "Viet Tien shows a commitment to sustainable development, but the articles provide less quantified evidence than larger international competitors.",
    ),
    notes: {
      e: b(
        "Cam kết phát triển bền vững và đa dạng chất liệu là tín hiệu tốt; cần thêm số liệu định lượng về phát thải, năng lượng và rác thải.",
        "Commitment to sustainable development and diversified materials is encouraging; quantitative emissions, energy and waste data are needed.",
      ),
      s: b(
        "Lịch sử sản xuất lâu đời và đóng góp việc làm là điểm tích cực; cần bằng chứng về tiền lương, điều kiện làm việc và tiêu chuẩn nhà cung cấp.",
        "Long manufacturing history and employment are positives; evidence on wages, working conditions and supplier standards is needed.",
      ),
      g: b(
        "Sự phát triển liên tục và uy tín thương hiệu quốc gia tự chúng chưa chứng minh được năng lực giám sát ESG mạnh hay tính minh bạch.",
        "Business continuity and national-brand recognition do not by themselves establish strong ESG oversight or transparency.",
      ),
    },
    sources: [
      {
        title: "Việt Tiến theo đuổi phát triển bền vững đa chất liệu — VnExpress",
        url: "https://vnexpress.net/viet-tien-theo-duoi-phat-trien-ben-vung-da-chat-lieu-4784893.html",
      },
      {
        title: "Tổng Công ty May Việt Tiến kỷ niệm 50 năm hình thành và phát triển — Lao Động",
        url: "https://news.laodong.vn/ldt/thi-truong/tong-cong-ty-co-phan-may-viet-tien-ky-niem-50-nam-hinh-thanh-va-phat-trien-1639678.ldo",
      },
    ],
  },
  {
    slug: "loreal",
    name: "L'Oréal",
    sector: "beauty",
    country: "FR",
    domain: "loreal.com",
    e: 7.5,
    s: 7.5,
    g: 6.5,
    listedOverall: 7.2,
    why: b(
      "L'Oréal có chương trình bền vững rộng, nhưng các khoản trách nhiệm liên quan đến hóa chất khiến điểm quản trị được chấm thận trọng hơn.",
      "L'Oréal has a broad sustainability programme, but chemical-related liabilities justify a more cautious governance score.",
    ),
    notes: {
      e: b(
        "Tham vọng và sáng kiến môi trường hỗ trợ một điểm số khá cao; cần phân biệt kết quả toàn tập đoàn với tuyên bố của từng sản phẩm hay thương hiệu.",
        "Sustainability ambitions support a relatively strong score; company-wide results should be distinguished from product or brand claims.",
      ),
      s: b(
        "Các chương trình CSR, bao gồm tại Việt Nam, là bằng chứng tích cực về đóng góp xã hội.",
        "CSR programmes, including in Vietnam, provide positive evidence of social contribution.",
      ),
      g: b(
        "Thông tin về việc xem xét phương án xử lý trách nhiệm liên quan đến hóa chất là một câu hỏi về quản trị rủi ro đang được xem xét, không phải bằng chứng sai phạm.",
        "A reported review of options on chemical-related liabilities is a risk-management question under examination, not proof of wrongdoing.",
      ),
    },
    sources: [
      {
        title: "L'Oréal Vietnam: CSR is a core strategy — Saigon Times",
        url: "https://news.tuoitre.vn/saigontimes/loreal-vietnam-csr-is-a-core-strategy-105411287.htm",
      },
      {
        title:
          "L'Oréal's green ambition: progress, gaps and what investors should watch — OneStopESG",
        url: "https://onestopesg.com/esg-news/l-or-al-s-green-ambition-with-hard-reality-progress-gaps-and-what-investors-should-watch-1772257065129",
      },
      {
        title: "L'Oréal taps advisers to explore unloading chemical-related liabilities — Reuters",
        url: "https://www.reuters.com/business/retail-consumer/loreal-taps-advisers-explore-unloading-chemical-related-liabilities-wsj-reports-2026-10-05/",
      },
    ],
  },
  {
    slug: "unilever",
    name: "Unilever",
    sector: "beauty",
    country: "UK",
    domain: "unilever.com",
    e: 6.0,
    s: 7.0,
    g: 5.5,
    listedOverall: 6.2,
    why: b(
      "Unilever có kinh nghiệm bền vững lâu năm, nhưng việc nới lỏng các cam kết trước đây làm giảm độ tin cậy của những lời hứa.",
      "Unilever has long sustainability experience, but scaling back earlier pledges weakens the credibility of its commitments.",
    ),
    notes: {
      e: b(
        "Unilever Việt Nam có sáng kiến kinh tế tuần hoàn và bao bì tái chế; tập đoàn đã nới lỏng một số mục tiêu môi trường trước đây.",
        "Unilever Vietnam reports circular-economy and recycled-packaging work; the group weakened some earlier environmental targets.",
      ),
      s: b(
        "Các chương trình cộng đồng và người tiêu dùng hỗ trợ điểm xã hội tốt; việc bỏ hoặc giảm một số cam kết xã hội là điều đáng lo.",
        "Community and consumer initiatives support a good score; dropping or weakening some social commitments is a concern.",
      ),
      g: b(
        "Cắt giảm các cam kết đã công bố có thể làm suy giảm niềm tin vào trách nhiệm giải trình dài hạn.",
        "Reducing announced commitments can undermine confidence in long-term accountability.",
      ),
    },
    sources: [
      {
        title: "Unilever to scale back environmental and social pledges — The Guardian",
        url: "https://www.theguardian.com/business/2024/apr/19/unilever-to-scale-back-environmental-and-social-pledges",
      },
      {
        title:
          "Unilever Vietnam wins twin sustainability awards for circular innovation — VnEconomy",
        url: "https://en.vneconomy.vn/unilever-vietnam-wins-twin-sustainability-awards-for-circular-innovation.htm",
      },
      {
        title: "Unilever contributes to improving people's living quality — Saigon Times",
        url: "https://news.tuoitre.vn/saigontimes/unilever-contributes-to-improving-peoples-living-quality-105136542.htm",
      },
    ],
  },
  {
    slug: "the-body-shop",
    name: "The Body Shop",
    sector: "beauty",
    country: "UK",
    domain: "thebodyshop.com",
    e: 6.5,
    s: 7.5,
    g: 4.5,
    listedOverall: 6.3,
    why: b(
      "The Body Shop cho thấy định vị đạo đức mạnh không tự đảm bảo ổn định tài chính. Sứ mệnh xã hội là điểm mạnh, còn khó khăn kinh doanh là điểm yếu.",
      "The Body Shop shows strong ethical positioning does not guarantee financial stability: its social mission is a strength, its business difficulties a weakness.",
    ),
    notes: {
      e: b(
        "Lịch sử thu mua có đạo đức và mô hình refill là điểm tích cực; chưa đủ bằng chứng về hiệu quả môi trường hiện tại trên toàn doanh nghiệp.",
        "Historical ethical sourcing and refills are positive; evidence of current company-wide environmental performance is insufficient.",
      ),
      s: b(
        "Nguyên tắc sáng lập về thương mại công bằng và hỗ trợ cộng đồng là thế mạnh quan trọng.",
        "Founding principles of ethical trade and community support are important strengths.",
      ),
      g: b(
        "Khủng hoảng tài chính và việc tiến hành thủ tục quản lý tài sản đặt ra câu hỏi về khả năng chống chịu và quyết định quản lý.",
        "Financial collapse and administration raised questions about resilience and management decisions.",
      ),
    },
    sources: [
      {
        title: "The Body Shop shouldn't have failed — The Conversation",
        url: "https://theconversation.com/the-body-shop-shouldnt-have-failed-in-an-age-when-consumers-want-activism-from-their-brands-what-happened-226128",
      },
      {
        title: "The Body Shop's bankruptcy: impact of ESG implementation — Modern Diplomacy",
        url: "https://moderndiplomacy.eu/2024/05/18/the-body-shops-bankruptcy-impact-of-esg-implementation/",
      },
      {
        title: "Reigniting The Body Shop's founding principles — British Beauty Council",
        url: "https://britishbeautycouncil.com/news/reigniting-the-body-shops-founding-principles-beauty-should-never-make-people-feel-robbed/",
      },
    ],
  },
  {
    slug: "cocoon",
    name: "Cocoon",
    sector: "beauty",
    country: "VN",
    domain: "cocoonvietnam.com",
    e: 8.0,
    s: 8.0,
    g: 6.5,
    listedOverall: 7.6,
    why: b(
      "Cocoon nổi bật vì gắn bản sắc thương hiệu với hành động môi trường cụ thể. Điểm vẫn mang tính tạm thời vì thiếu kiểm chứng độc lập.",
      "Cocoon stands out for linking brand identity with practical environmental action; its score stays provisional for lack of independent verification.",
    ),
    notes: {
      e: b(
        "Có bao bì tái chế và chương trình thu hồi chai; tháng 6/2026 công bố hợp tác dùng bao bì nhựa tái chế 100% cho một số sản phẩm.",
        "Recycled packaging and bottle-return programmes; in June 2026 announced 100% recycled-plastic packaging for selected products.",
      ),
      s: b(
        "Bản sắc Việt, định vị thuần chay và các hoạt động cộng đồng như bảo tồn rùa biển.",
        "Vietnamese identity, vegan positioning and community work such as sea-turtle conservation.",
      ),
      g: b(
        "Các sáng kiến công bố là đáng khích lệ, nhưng cần thêm dữ liệu ESG toàn công ty được kiểm chứng độc lập.",
        "Initiatives are encouraging, but more independently verified company-wide ESG data is needed.",
      ),
    },
    sources: [
      {
        title: "Cocoon hợp tác Duy Tân Recycling dùng nhựa tái chế 100% trong bao bì — Tuổi Trẻ",
        url: "https://tuoitre.vn/cocoon-hop-tac-duy-tan-recycling-dung-nhua-tai-che-100-trong-bao-bi-20260613104236127.htm",
      },
      {
        title: "Duy Tan and Cocoon expand circular packaging initiative — VnEconomy",
        url: "https://en.vneconomy.vn/duy-tan-and-cocoon-expand-circular-packaging-initiative-with-recycled-plastics.htm",
      },
      {
        title: "Điểm xanh online cùng Cocoon — Cocoon",
        url: "https://oms-int-web.cocoonvietnam.com/bai-viet/diem-xanh-online-cung-cocoon-song-xanh-moi-ngay-2026",
      },
    ],
  },
  {
    slug: "maybelline",
    name: "Maybelline",
    sector: "beauty",
    country: "US",
    domain: "maybelline.com",
    e: 6.5,
    s: 7.5,
    g: 6.5,
    listedOverall: 6.9,
    why: b(
      "Maybelline có chương trình xã hội nổi bật về sức khỏe tinh thần. Điểm môi trường ở mức vừa vì cam kết tương lai chưa chứng minh mục tiêu đã đạt.",
      "Maybelline has visible mental-health programmes; its environmental score is moderate because future commitments don't prove targets are met.",
    ),
    notes: {
      e: b(
        "Cam kết về bao bì và trung hòa carbon là tích cực, nhưng cần đối chiếu với tiến độ thực tế và dấu chân môi trường của sản phẩm.",
        "Packaging and carbon-neutrality commitments are positive but must be assessed against actual progress and product footprint.",
      ),
      s: b(
        "Chiến dịch Brave Together và hợp tác với Quỹ WHO tập trung vào nâng cao nhận thức và tiếp cận hỗ trợ sức khỏe tinh thần.",
        "The Brave Together campaign and WHO Foundation partnership focus on mental-health awareness and access to support.",
      ),
      g: b(
        "Cam kết và quan hệ đối tác công khai hỗ trợ trách nhiệm giải trình; cần dữ liệu toàn công ty rõ hơn về bao bì, phát thải và tiến độ.",
        "Public commitments support accountability; stronger company-wide data on packaging, emissions and progress would improve confidence.",
      ),
    },
    sources: [
      {
        title:
          "Maybelline New York embarks on global partnership with the WHO Foundation — PR Newswire",
        url: "https://www.prnewswire.com/news-releases/maybelline-new-york-embarks-on-long-term-global-partnership-with-the-who-foundation-to-increase-access-to-mental-health-services-302139046.html",
      },
      {
        title: "Maybelline spotlights Gen Z's mental health with Brave Together — Famous Campaigns",
        url: "https://www.famouscampaigns.com/2024/10/maybelline-spotlights-gen-zs-mental-health-with-brave-together-campaign-for-world-mental-health-day/",
      },
      {
        title:
          "Maybelline commits to carbon neutrality and 100% recycled plastic packaging by 2030 — FashionNetwork",
        url: "https://us.fashionnetwork.com/news/Maybelline-commits-to-carbon-neutrality-100-recycled-plastic-packaging-by-2030,1370137.html",
      },
    ],
  },
  {
    slug: "nestle",
    name: "Nestlé",
    sector: "food",
    country: "CH",
    domain: "nestle.com",
    e: 6.5,
    s: 6.5,
    g: 5.5,
    listedOverall: 6.2,
    why: b(
      "Nestlé có nhiều sáng kiến bền vững, nhưng quy mô lớn và rủi ro ở nông nghiệp, bao bì, quản trị khiến điểm tổng ở mức trung bình.",
      "Nestlé has substantial initiatives, but its scale and exposure to agricultural, packaging and governance risks justify a moderate score.",
    ),
    notes: {
      e: b(
        "Nestlé Việt Nam thúc đẩy tiêu dùng xanh và nông nghiệp tái sinh (Kế hoạch NESCAFÉ); tác động từ nguồn nguyên liệu, bao bì và nước vẫn đáng kể.",
        "Nestlé Vietnam promotes green consumption and regenerative farming (NESCAFÉ Plan); sourcing, packaging and water impacts remain significant.",
      ),
      s: b(
        "Giáo dục người tiêu dùng và hợp tác với nông dân là tích cực; dinh dưỡng và an toàn sản phẩm cũng là yếu tố quan trọng.",
        "Consumer education and farming partnerships are positive; nutrition and product safety also matter.",
      ),
      g: b(
        "Những lo ngại về quản trị được The New York Times nêu cho thấy cần đánh giá năng lực giám sát song song với các chương trình bền vững.",
        "Governance concerns reported by The New York Times show why oversight must be evaluated alongside programmes.",
      ),
    },
    sources: [
      {
        title: "Nestlé Vietnam pioneers green consumption habits — Vietnam News",
        url: "https://vietnamnews.vn/economy/1721780/nestle-vietnam-pioneers-green-consumption-habits-for-a-sustainable-future.html",
      },
      {
        title: "Nestlé Vietnam and its journey to sustainable development — Saigon Times",
        url: "https://news.tuoitre.vn/saigontimes/nestle-vietnam-and-its-journey-to-sustainable-development-105198345.htm",
      },
      {
        title: "Corporate governance looms as an issue for Nestlé — The New York Times (2017)",
        url: "https://www.nytimes.com/2017/06/26/business/dealbook/corporate-governance-looms-as-an-issue-for-nestle.html",
      },
    ],
  },
  {
    slug: "coca-cola",
    name: "Coca-Cola",
    sector: "food",
    country: "US",
    domain: "coca-colacompany.com",
    e: 4.5,
    s: 6.5,
    g: 5.5,
    listedOverall: 5.4,
    why: b(
      "Coca-Cola có chương trình cộng đồng, nhưng sự phụ thuộc vào bao bì đồ uống dùng một lần là điểm yếu môi trường lớn, kéo điểm tổng xuống.",
      "Coca-Cola has community programmes, but reliance on single-use beverage packaging is a major environmental weakness that limits the overall score.",
    ),
    notes: {
      e: b(
        "Ô nhiễm nhựa là mối lo trung tâm; các sáng kiến tái chế chưa bù đắp hết tác động của bao bì dùng một lần.",
        "Plastic pollution is the central concern; recycling initiatives do not fully offset the impact of single-use packaging.",
      ),
      s: b(
        "Quan hệ đối tác cộng đồng là tích cực; quản lý nguồn nước và tác động sức khỏe của đồ uống có đường vẫn cần xem xét.",
        "Community partnerships are positive; water stewardship and the health effects of sugary drinks remain relevant.",
      ),
      g: b(
        "Các cam kết bền vững cần được đối chiếu với kết quả đo lường được và quy mô bao bì thực tế.",
        "Sustainability commitments must be evaluated against measurable outcomes and the scale of its packaging footprint.",
      ),
    },
    sources: [
      {
        title:
          "Coca-Cola plastic waste in oceans expected to reach 602m kg a year by 2030 — The Guardian",
        url: "https://www.theguardian.com/business/2025/mar/27/coca-cola-plastic-waste-in-oceans-expected-to-reach-602m-kilograms-a-year-by-2030",
      },
      {
        title: "Coca-Cola environmental and social impact — GreenDigest",
        url: "https://greendigest.co/archive/cocacola-environmental-and-social-impact",
      },
    ],
  },
  {
    slug: "pepsico",
    name: "PepsiCo",
    sector: "food",
    country: "US",
    domain: "pepsico.com",
    e: 6.0,
    s: 6.0,
    g: 6.0,
    listedOverall: 6.0,
    why: b(
      "PepsiCo có chiến lược bền vững bài bản, nhưng khoảng cách giữa tham vọng và thách thức thực tế về bao bì, phát thải, sức khỏe người tiêu dùng khiến điểm chưa cao.",
      "PepsiCo has an organised strategy, but the gap between ambition and practical packaging, emissions and health challenges prevents a stronger rating.",
    ),
    notes: {
      e: b(
        "Tháng 5/2025 điều chỉnh mục tiêu, mở rộng nông nghiệp tái sinh lên 10 triệu mẫu Anh vào 2030, nhưng bỏ mục tiêu tái sử dụng trước đây.",
        "Refined targets in May 2025 and expanded regenerative agriculture to 10 million acres by 2030, but dropped its previous reuse target.",
      ),
      s: b(
        "Chương trình cộng đồng và cải thiện dinh dưỡng là tích cực; chất lượng dinh dưỡng của một phần danh mục sản phẩm vẫn là vấn đề.",
        "Community programmes and nutrition improvements are positive; the nutritional quality of parts of the portfolio remains an issue.",
      ),
      g: b(
        "Điều chỉnh mục tiêu có thể tăng tính khả thi, nhưng việc thay đổi cam kết cũ đòi hỏi phải theo dõi kết quả thực tế.",
        "Refining goals can improve feasibility, but changes to earlier commitments mean actual results must be monitored.",
      ),
    },
    sources: [
      {
        title:
          "PepsiCo's sustainable packaging campaign and purchase intention in Ho Chi Minh City — UEH",
        url: "https://ueh.edu.vn/en/news/research-contribution-pepsicos-sustainable-packaging-campaign-and-its-effects-on-consumers-purchase-intention-in-ho-chi-minh-city-78901",
      },
      {
        title: "PepsiCo refines sustainability goals — PepsiCo",
        url: "https://www.pepsico.com/en/newsroom/press-releases/2025/pepsico-refines-sustainability-goals-to-position-business-for-the-long-term",
      },
      {
        title: "PepsiCo finds governance success through evolution — Governance Intelligence",
        url: "https://www.governance-intelligence.com/pepsico-finds-governance-success-through-evolution/",
      },
    ],
  },
  {
    slug: "vinamilk",
    name: "Vinamilk",
    sector: "food",
    country: "VN",
    domain: "vinamilk.com.vn",
    e: 7.5,
    s: 7.5,
    g: 7.0,
    listedOverall: 7.4,
    why: b(
      "Vinamilk khá mạnh vì có hành động môi trường đo lường được và được ghi nhận về quản trị. Cần thêm dữ liệu chi tiết về phát thải, nước và chuỗi nông nghiệp.",
      "Vinamilk appears relatively strong thanks to measurable environmental action and governance recognition; more detail on emissions, water and farming would refine it.",
    ),
    notes: {
      e: b(
        "Đã công bố các sáng kiến và thực hành giảm phát thải trên toàn hoạt động.",
        "Reported emissions-reduction initiatives and practices across its operations.",
      ),
      s: b(
        "Đóng góp về dinh dưỡng và phúc lợi cộng đồng; phúc lợi động vật, an toàn sản phẩm và chuỗi cung ứng cũng cần được xem xét.",
        "Contribution to nutrition and community welfare; animal welfare, product safety and supply-chain practices should also be considered.",
      ),
      g: b(
        "Các giải thưởng về quản trị và phát triển bền vững là tích cực nhưng cần được đối chiếu với công bố chi tiết và kiểm chứng độc lập.",
        "Governance and sustainability awards are positive but should be weighed against detailed disclosure and independent verification.",
      ),
    },
    sources: [
      {
        title: "Vinamilk showcases emissions-reduction practices — Vietnam News",
        url: "https://vietnamnews.vn/economy/1783213/vinamilk-showcases-emissions-reduction-practices-at-national-environment-and-climate-forum.html",
      },
      {
        title: "Vinamilk nhận loạt giải thưởng về quản trị và phát triển bền vững — Báo Nghệ An",
        url: "https://baonghean.vn/en/vinamilk-nhan-loat-giai-thuong-ve-quan-tri-va-phat-trien-ben-vung-10285380.html",
      },
    ],
  },
  {
    slug: "th-true-milk",
    name: "TH true MILK",
    sector: "food",
    country: "VN",
    domain: "thmilk.vn",
    e: 7.5,
    s: 7.5,
    g: 6.5,
    listedOverall: 7.2,
    why: b(
      "TH true MILK có mô hình sản xuất hướng bền vững, nhưng chi phí môi trường của chăn nuôi bò sữa khiến thương hiệu xanh chưa đủ để đạt điểm cao nhất.",
      "TH true MILK has a promising sustainability-oriented model, but the environmental costs of dairy mean green branding alone can't justify a top score.",
    ),
    notes: {
      e: b(
        "Mô hình nhà máy xanh và hiệu suất sản xuất là bằng chứng tốt; chăn nuôi bò sữa vẫn kéo theo phát thải, nước, thức ăn chăn nuôi và chất thải.",
        "Green-factory model and production efficiency; dairy still involves emissions, water, feed production and waste.",
      ),
      s: b(
        "Tập trung vào chất lượng thực phẩm, phát triển nông nghiệp và gắn kết cộng đồng.",
        "Focus on food quality, agricultural development and community engagement.",
      ),
      g: b(
        "Báo cáo công khai là đáng khích lệ; cần thêm công bố ESG được kiểm chứng độc lập.",
        "Public reporting is encouraging; more independently verified ESG disclosure is needed.",
      ),
    },
    sources: [
      {
        title: "Exploring TH true MILK green factory — VietnamPlus",
        url: "https://en.vietnamplus.vn/exploring-th-true-milk-green-factory-from-green-pasture-to-clean-milk-post323661.vnp",
      },
      {
        title: "TH true MILK champions green production to support net zero goal — The Investor",
        url: "https://theinvestor.vn/th-true-milk-champions-green-production-to-support-net-zero-goal-d8592.html",
      },
      {
        title: "Các sản phẩm xanh bền vững của TH true MILK — Lao Động",
        url: "https://news.laodong.vn/kinh-doanh/cac-san-pham-xanh-ben-vung-cua-th-true-milk-dong-hanh-cung-hoi-nghi-nguoi-viet-nam-o-nuoc-ngoai-1384796.ldo",
      },
    ],
  },
  {
    slug: "masan-consumer",
    name: "Masan Consumer",
    sector: "food",
    country: "VN",
    domain: "masanconsumer.com",
    e: 6.0,
    s: 6.5,
    g: 6.0,
    listedOverall: 6.2,
    why: b(
      "Masan Consumer có cơ hội cải thiện qua sản xuất và bao bì có trách nhiệm. Điểm ở mức vừa vì bằng chứng chưa đầy đủ bằng công bố của các công ty quốc tế.",
      "Masan Consumer can improve through responsible manufacturing and packaging; the score is moderate because evidence is less comprehensive than international disclosures.",
    ),
    notes: {
      e: b(
        "Đổi mới sản phẩm có thể hỗ trợ hiệu quả tài nguyên; còn ít bằng chứng định lượng về phát thải, bao bì và rác thải.",
        "Innovation may support resource efficiency; limited quantitative evidence on emissions, packaging and waste.",
      ),
      s: b(
        "Đóng góp vào khả năng tiếp cận của người tiêu dùng và phát triển cộng đồng; an toàn sản phẩm, dinh dưỡng và giá cả hợp lý cũng liên quan.",
        "Consumer access and community development are positive; product safety, nutrition and affordability are relevant.",
      ),
      g: b(
        "Cần bằng chứng rõ hơn về giám sát của HĐQT, công bố ESG và trách nhiệm giải trình.",
        "Stronger evidence on board oversight, ESG disclosure and accountability is required.",
      ),
    },
    sources: [
      {
        title: "Masan Group drives innovation for sustainable development — Tuổi Trẻ",
        url: "https://news.tuoitre.vn/masan-group-drives-innovation-for-sustainable-development-103250716095142546.htm",
      },
      {
        title: "Google search results (not a specific article)",
        url: "https://www.google.com/search?q=newspaper+about+masan+governance+impact",
        needsReplacement: true,
      },
    ],
  },
  {
    slug: "apple",
    name: "Apple",
    sector: "tech",
    country: "US",
    domain: "apple.com",
    e: 7.5,
    s: 7.0,
    g: 7.5,
    listedOverall: 7.4,
    why: b(
      "Đổi mới và báo cáo môi trường là thế mạnh lớn của Apple, nhưng quy mô sản xuất và chuỗi cung ứng toàn cầu phức tạp khiến điểm chưa cao hơn.",
      "Apple's environmental innovation and reporting are major strengths, but its manufacturing footprint and complex supply chain prevent a higher score.",
    ),
    notes: {
      e: b(
        "30% vật liệu trong các sản phẩm xuất xưởng năm 2025 đến từ nguồn tái chế; năm 2026 tiếp tục tiến bộ về vật liệu pin và bao bì tái chế.",
        "30% of material in products shipped in 2025 came from recycled sources; further progress on recycled battery materials and packaging in 2026.",
      ),
      s: b(
        "Các chương trình hỗ trợ tiếp cận và giáo dục là thế mạnh; điều kiện lao động trong chuỗi cung ứng điện tử toàn cầu vẫn quan trọng.",
        "Accessibility and education initiatives are strengths; supply-chain labour conditions remain important.",
      ),
      g: b(
        "Báo cáo môi trường chi tiết và mục tiêu công khai hỗ trợ minh bạch, nhưng không tự loại bỏ rủi ro về nhà cung cấp, quyền riêng tư hay thực tiễn thị trường.",
        "Detailed reporting and published targets support transparency, but do not remove risks involving suppliers, privacy or market practices.",
      ),
    },
    sources: [
      {
        title: "Apple products contain record recycled material — CNET",
        url: "https://www.cnet.com/tech/apple-environmental-progress-report-2025-products-contain-record-recycled-material/",
      },
      {
        title: "Apple accelerates progress with highest-ever recycled material — Apple Newsroom",
        url: "https://www.apple.com/newsroom/2026/04/apple-accelerates-progress-with-highest-ever-recycled-material-in-its-products/",
      },
    ],
  },
  {
    slug: "samsung",
    name: "Samsung",
    sector: "tech",
    country: "KR",
    domain: "samsung.com",
    e: 7.0,
    s: 6.5,
    g: 7.0,
    listedOverall: 6.9,
    why: b(
      "Samsung có tiến bộ trong thiết kế sản phẩm thân thiện môi trường, nhưng rác thải điện tử, tác động sản xuất và trách nhiệm chuỗi cung ứng vẫn là vấn đề trọng yếu.",
      "Samsung has progressed in environmental product design, but e-waste, manufacturing impacts and supply-chain responsibility remain material.",
    ),
    notes: {
      e: b(
        "Báo cáo đạt cả bốn mục tiêu của chương trình Galaxy for the Planet cho năm 2025 và đặt mục tiêu mới đến 2030.",
        "Reported achieving all four Galaxy for the Planet goals for 2025 and set new goals through 2030.",
      ),
      s: b(
        "Tạo việc làm và tiếp cận số là tích cực; sản xuất điện tử và thiết bị thải bỏ gây lo ngại về lao động và công bằng môi trường.",
        "Employment and digital access are positive; manufacturing and discarded devices raise labour and environmental-justice concerns.",
      ),
      g: b(
        "Mục tiêu và công bố bền vững công khai là tích cực; lo ngại của Greenpeace về điện thoại bị thải bỏ nhấn mạnh tầm quan trọng của trách nhiệm giải trình.",
        "Public targets are positive; Greenpeace concerns about discarded phones highlight the importance of accountability.",
      ),
    },
    sources: [
      {
        title:
          "Samsung expands Galaxy for the Planet with new goals through 2030 — Samsung Newsroom",
        url: "https://news.samsung.com/global/samsung-expands-its-journey-galaxy-for-the-planet-with-new-goals-through-2030",
      },
      {
        title: "Dumping 4.3 million Samsung phones is an environmental disaster — Greenpeace",
        url: "https://www.greenpeace.org/eastasia/press/1259/dumping-4-3-million-samsung-phones-is-an-environmental-disaster-warns-greenpeace/",
      },
      {
        title: "Organizations urge Samsung to stop fueling climate change — Insure Our Future",
        url: "https://global.insure-our-future.com/organizations-urge-samsung-to-stop-fueling-climate-change/",
      },
    ],
  },
  {
    slug: "dell",
    name: "Dell Technologies",
    sector: "tech",
    country: "US",
    domain: "dell.com",
    e: 7.5,
    s: 7.5,
    g: 7.0,
    listedOverall: 7.4,
    why: b(
      "Dell kết hợp thu hồi sản phẩm, kinh tế tuần hoàn và hòa nhập xã hội. Câu hỏi chính là các chương trình có tạo kết quả đo được ở quy mô lớn không.",
      "Dell combines product recovery, circularity and inclusion; the main question is whether its programmes deliver measurable results at scale.",
    ),
    notes: {
      e: b(
        "Các sáng kiến tuần hoàn, chương trình tái chế và thu hồi máy tính cũ là cách tiếp cận thiết thực với rác thải điện tử.",
        "Circularity initiatives, recycling programmes and computer recovery show a practical approach to electronic waste.",
      ),
      s: b(
        "Các chương trình hòa nhập và tiếp cận công nghệ hỗ trợ tác động xã hội tích cực.",
        "Inclusion and technology-access programmes support positive social impact.",
      ),
      g: b(
        "Mục tiêu bền vững công khai tạo cơ sở cho trách nhiệm giải trình; dữ liệu đầy đủ hơn về nhà cung cấp, phát thải và nhân sự sẽ củng cố đánh giá.",
        "Public goals support accountability; fuller supplier, emissions and workforce data would strengthen the assessment.",
      ),
    },
    sources: [
      {
        title: "Dell Technologies: circularity, inclusivity and waste — Sustainability Magazine",
        url: "https://sustainabilitymag.com/news/dell-technologies-circularity-inclusivity-waste",
      },
      {
        title: "Dell collects 175 tons of unwanted computers — CSRwire",
        url: "https://csrwire.com/press-release/dell-exceeds-recycled-paper-goal-collects-175-tons-of-unwanted-computers-through-international-recycling-events-employees-partners-help-turn-environmental-responsibility-plans-into-results/",
      },
      {
        title: "Dell Tech's 2030 goals show social impact makes business sense — SDxCentral",
        url: "https://www.sdxcentral.com/opinions/dell-techs-2030-goals-show-social-impact-makes-business-sense/",
      },
    ],
  },
  {
    slug: "hp",
    name: "HP",
    sector: "tech",
    country: "US",
    domain: "hp.com",
    e: 7.5,
    s: 7.5,
    g: 7.0,
    listedOverall: 7.4,
    why: b(
      "HP cân bằng giữa trách nhiệm môi trường và xã hội, nhưng điểm mang tính tạm thời vì các nguồn chưa thể hiện đầy đủ kết quả ESG hiện tại.",
      "HP shows a balanced approach, but the score is provisional because the sources don't establish its full current ESG performance.",
    ),
    notes: {
      e: b(
        "Thiết kế sản phẩm tuần hoàn, thu hồi vật liệu và mục tiêu môi trường; ít bằng chứng chi tiết về kết quả môi trường mới nhất.",
        "Circular design, materials recovery and environmental targets; less detailed evidence of its latest environmental results.",
      ),
      s: b(
        "Các sáng kiến tác động xã hội và chương trình Future of Work Accelerator mở rộng cơ hội và hỗ trợ cộng đồng.",
        "Social-impact initiatives and the Future of Work Accelerator expand opportunities and support communities.",
      ),
      g: b(
        "Mục tiêu công khai và báo cáo tác động là tích cực; cần kiểm chứng độc lập và dữ liệu minh bạch để đánh giá tự tin hơn.",
        "Public targets and impact reporting are positive; independent verification and transparent data would add confidence.",
      ),
    },
    sources: [
      {
        title: "HP's social impact team named TIME Team of the Year — TIME",
        url: "https://time.com/branded-content/smartsheet/hps-social-impact-team-is-named-time-team-of-the-year/",
      },
      {
        title: "How HP's Future of Work Accelerator is driving impact — Forbes",
        url: "https://www.forbes.com/sites/afdhelaziz/2026/03/24/how-hps-future-of-work-accelerator-is-driving-impact-and-innovation-around-the-world/",
      },
      {
        title: "HP's sustainable vision — DTP Group",
        url: "https://dtpgroup.co.uk/insight/hp-sustainable-vision/",
      },
    ],
  },
  {
    slug: "fpt",
    name: "FPT",
    sector: "tech",
    country: "VN",
    domain: "fpt.com",
    e: 7.0,
    s: 8.0,
    g: 7.5,
    listedOverall: 7.5,
    why: b(
      "FPT là ứng viên mạnh trong nhóm doanh nghiệp Việt vì có mục tiêu cụ thể, số liệu đầu tư cộng đồng và quy trình quản trị đang hoàn thiện.",
      "FPT is a strong Vietnamese candidate thanks to specific targets, community-investment figures and developing governance processes.",
    ),
    notes: {
      e: b(
        "Báo cáo bền vững 2025 đặt mục tiêu net zero năm 2040, lắp điện mặt trời áp mái và theo dõi phát thải có hệ thống; cần theo dõi mức giảm theo thời gian.",
        "2025 reporting sets a 2040 net-zero target, rooftop solar and systematic emissions monitoring; reductions should be tracked over time.",
      ),
      s: b(
        "Năm 2025 dành 72,8 tỷ đồng cho hoạt động CSR: hỗ trợ giáo dục, phát triển cộng đồng và trẻ em có hoàn cảnh khó khăn.",
        "Allocated VND 72.8 billion to CSR in 2025: education, community development and disadvantaged children.",
      ),
      g: b(
        "Báo cáo ESG thường niên, đánh giá nhà cung cấp và các sáng kiến quản trị cho thấy cách tiếp cận có cấu trúc; độ bao phủ đánh giá nhà cung cấp còn cải thiện được.",
        "Annual ESG report, supplier assessments and governance initiatives show structure; supplier assessment coverage can still improve.",
      ),
    },
    sources: [
      {
        title: "2025: a year of progress toward FPT sustainability commitments — FPT Software",
        url: "https://fptsoftware.com/newsroom/news-and-press-releases/news/2025-a-year-of-progress-toward-fpt-sustainability-commitments",
      },
      {
        title: "FPT 2025 ESG report: message and orientation — FPT annual report",
        url: "https://bctn2025.fpt.com/esg-report/esg-message-and-orientation/",
      },
      {
        title: "Accompanying community development — FPT annual report",
        url: "https://bctn2025.fpt.com/esg-report/accompanying-community-development/",
      },
    ],
  },
  {
    slug: "walmart",
    name: "Walmart",
    sector: "retail",
    country: "US",
    domain: "walmart.com",
    e: 6.5,
    s: 6.5,
    g: 6.5,
    listedOverall: 6.5,
    why: b(
      "Walmart có nguồn lực và sáng kiến bền vững lâu năm, nhưng chuỗi cung ứng toàn cầu và trách nhiệm với lực lượng lao động khổng lồ là thách thức lớn.",
      "Walmart has substantial resources and established initiatives, but its global supply chain and workforce responsibilities create significant challenges.",
    ),
    notes: {
      e: b(
        "Mục tiêu net zero cho hoạt động toàn cầu năm 2040, điện tái tạo năm 2035 và Project Gigaton giảm phát thải chuỗi cung ứng.",
        "Net-zero operations by 2040, renewable electricity by 2035, and Project Gigaton for supply-chain emissions.",
      ),
      s: b(
        "Chương trình cộng đồng là tích cực; tiền lương, điều kiện làm việc và lao động ở nhà cung cấp là vấn đề quan trọng với quy mô này.",
        "Community programmes are positive; wages, working conditions and supplier labour practices matter at this scale.",
      ),
      g: b(
        "Mục tiêu và báo cáo công khai hỗ trợ trách nhiệm giải trình, nhưng cần đánh giá tiến độ của từng mục tiêu thay vì mặc định đặt mục tiêu là thành công.",
        "Public targets support accountability, but progress against each target must be assessed rather than assumed.",
      ),
    },
    sources: [
      {
        title: "Walmart reports progress on sustainability and climate — WWD",
        url: "https://wwd.com/sourcing-journal/industry-news/walmart-reports-progress-sustainability-climate-initiatives-1239090322/",
      },
      {
        title: "Advancing sustainability: climate — Walmart.org",
        url: "https://www.walmart.org/what-we-do/advancing-sustainability/climate",
      },
      {
        title: "Walmart's progress on 2025 sustainability goals — Trellis",
        url: "https://trellis.net/article/walmart-progress-2025-sustainability-goals/",
      },
    ],
  },
  {
    slug: "ikea",
    name: "IKEA",
    sector: "retail",
    country: "SE",
    domain: "ikea.com",
    e: 6.5,
    s: 7.0,
    g: 6.0,
    listedOverall: 6.5,
    why: b(
      "IKEA khuyến khích tái sử dụng, nhưng các nỗ lực này phải được cân nhắc cùng tác động môi trường của việc khai thác gỗ và sản xuất nội thất quy mô rất lớn.",
      "IKEA encourages reuse, but that must be weighed against the impact of sourcing and producing furniture at very large scale.",
    ),
    notes: {
      e: b(
        "Chợ đồ cũ và các sáng kiến tuần hoàn kéo dài vòng đời nội thất; cáo buộc phá rừng đặt ra câu hỏi về nguồn gỗ.",
        "Second-hand marketplace and circular initiatives extend furniture lifecycles; forest-destruction allegations raise sourcing questions.",
      ),
      s: b(
        "Có quan hệ đối tác cộng đồng và tác động xã hội; điều kiện lao động và thu mua có trách nhiệm trong chuỗi cung ứng cần được xem xét.",
        "Community and social-impact partnerships exist; worker conditions and responsible sourcing should be examined.",
      ),
      g: b(
        "Các tranh cãi về nguồn gỗ đặt ra câu hỏi về năng lực giám sát chuỗi cung ứng và hiệu quả của các biện pháp bảo vệ môi trường.",
        "Forest-sourcing controversies raise questions about supply-chain oversight and environmental safeguards.",
      ),
    },
    sources: [
      {
        title: "IKEA has just launched another second-hand marketplace — Euronews",
        url: "https://www.euronews.com/2026/10/12/ikea-has-just-launched-another-second-hand-marketplace-but-will-it-stop-producing-fast-fur",
      },
      {
        title: "IKEA blamed for Romanian forest destruction — Mongabay",
        url: "https://news.mongabay.com/2024/04/ikea-blamed-for-romanian-forest-destruction/",
      },
      {
        title: "IKEA social impact partnership — The CEO Magazine",
        url: "https://www.theceomagazine.com/business/innovation-technology/ikea-social-impact-partnership/",
      },
    ],
  },
  {
    slug: "7-eleven",
    name: "7-Eleven",
    sector: "retail",
    country: "US",
    domain: "corp.7-eleven.com",
    e: 6.0,
    s: 7.0,
    g: 6.5,
    listedOverall: 6.5,
    why: b(
      "7-Eleven có cách tiếp cận bài bản với cộng đồng, nhưng điểm môi trường phụ thuộc vào cải thiện đo được về bao bì, rác thực phẩm và hiệu suất vận hành.",
      "7-Eleven has a structured community approach, but its environmental score depends on measurable gains in packaging, food waste and efficiency.",
    ),
    notes: {
      e: b(
        "Khung báo cáo tác động có nội dung môi trường; mô hình cửa hàng tiện lợi phụ thuộc nhiều vào bao bì, làm lạnh, vận chuyển và quản lý rác thực phẩm.",
        "Impact reporting covers environmental stewardship; convenience retail relies on packaging, refrigeration, transport and food-waste management.",
      ),
      s: b(
        "Báo cáo tác động 2024 và 2025 nêu bật hỗ trợ cộng đồng và tiêu dùng có trách nhiệm.",
        "The 2024 and 2025 impact reports highlight community support and responsible consumption.",
      ),
      g: b(
        "Báo cáo tác động định kỳ và bộ phận lãnh đạo phát triển bền vững là nền tảng tốt; cần thêm dữ liệu kết quả chi tiết.",
        "Regular impact reporting and a sustainability leadership function provide a foundation; more outcome data is needed.",
      ),
    },
    sources: [
      {
        title: "7-Eleven, Inc. releases 2024 Impact Report — 7-Eleven",
        url: "https://corp.7-eleven.com/corp-press-releases/7-eleven-inc-releases-2024-impact-report",
      },
      {
        title: "7-Eleven, Inc. releases 2025 Impact Report — 7-Eleven",
        url: "https://corp.7-eleven.com/corp-press-releases/7-eleven-inc-releases-2025-impact-report",
      },
      {
        title: "7-Eleven impact report focuses on people, planet, products — CSNews",
        url: "https://csnews.com/7-eleven-impact-report-focuses-people-planet-products",
      },
    ],
  },
  {
    slug: "saigon-coop",
    name: "Saigon Co.op",
    sector: "retail",
    country: "VN",
    domain: "saigonco-op.com.vn",
    e: 6.5,
    s: 8.0,
    g: 6.5,
    listedOverall: 7.0,
    why: b(
      "Thế mạnh của Saigon Co.op là tác động xã hội, nhất là hỗ trợ cộng đồng lúc khó khăn. Điểm E và G ở mức vừa vì thiếu số liệu định lượng.",
      "Saigon Co.op's strength is social impact, especially support in difficult times; E and G stay moderate for lack of quantitative evidence.",
    ),
    notes: {
      e: b(
        "Các sáng kiến phát triển bền vững và CSR là điểm khởi đầu; cần thêm số liệu định lượng về năng lượng, bao bì, rác thải và phát thải.",
        "Sustainable-development and CSR initiatives are a starting point; quantitative energy, packaging, waste and emissions data are needed.",
      ),
      s: b(
        "Hỗ trợ cộng đồng và đưa hàng thiết yếu đến vùng bị bão là đóng góp xã hội rõ ràng.",
        "Community assistance and delivering essential goods to storm-hit areas show a clear social contribution.",
      ),
      g: b(
        "Mô hình hợp tác xã và thông tin CSR công khai có giá trị; báo cáo chi tiết hơn về giám sát và tiêu chuẩn nhà cung cấp sẽ tăng độ tin cậy.",
        "The cooperative model and published CSR information help; detailed reporting on oversight and supplier standards would improve confidence.",
      ),
    },
    sources: [
      {
        title: "Sustainable development & CSR — Saigon Co.op",
        url: "https://saigonco-op.com.vn/sustainable-development-csr",
      },
      {
        title: "Saigon Co.op rushes to deliver essential goods to storm-hit areas — VietnamPlus",
        url: "https://en.vietnamplus.vn/saigon-coop-rushes-to-deliver-essential-goods-to-storm-hit-areas-post332146.vnp",
      },
      {
        title:
          "Saigon Co.op expected to enter world's top 300 cooperatives — Nông nghiệp & Môi trường",
        url: "https://van.nongnghiepmoitruong.vn/saigon-coop-expected-to-enter-worlds-top-300-cooperatives-early-d821010.html",
      },
    ],
  },
  {
    slug: "nam-long",
    name: "Nam Long",
    sector: "real-estate",
    country: "VN",
    domain: "namlongvn.com",
    e: 7.0,
    s: 7.0,
    g: 6.5,
    listedOverall: 6.9,
    assessedAt: "2026-10-29",
    why: b(
      "Nam Long có bằng chứng cụ thể và kiểm chứng được: dự án đạt chứng nhận xanh EDGE của IFC, IFC là nhà đầu tư trái phiếu, báo cáo bền vững 3 năm liền theo GRI, và số căn nhà vừa túi tiền bàn giao được công bố. Điểm chưa cao hơn vì chưa thấy số liệu phát thải toàn công ty hay kiểm toán độc lập.",
      "Nam Long shows specific, checkable evidence: IFC EDGE-certified projects, IFC as a bond investor, three consecutive GRI-referenced sustainability reports and published affordable-home handovers. It is not higher because company-wide emissions data and independent assurance were not found.",
    ),
    notes: {
      e: b(
        "Phân khu Solaria Rise (Waterpoint) đạt EDGE với mức tiết kiệm khoảng 23% năng lượng, 27–31% nước và tới 33% carbon hàm chứa trong vật liệu; Waterpoint giữ hành lang cây xanh ven sông 50 m và 62 ha công viên. Chưa thấy công bố phát thải Scope 1–2 toàn công ty.",
        "Solaria Rise (Waterpoint) is EDGE-certified at about 23% energy, 27–31% water and up to 33% embodied-carbon savings; Waterpoint keeps a 50 m riparian buffer and 62 ha of parks. No company-wide Scope 1–2 emissions disclosure was found.",
      ),
      s: b(
        "Năm 2025 bàn giao 1.119 căn nhà ở xã hội và vừa túi tiền (EHome, EHomeS), 11,8 triệu giờ công an toàn không có tai nạn nghiêm trọng, và quỹ học bổng gần 1.800 suất trong 16 năm.",
        "In 2025 it handed over 1,119 social and affordable homes (EHome, EHomeS), logged 11.8 million safe work hours with no serious accidents, and has funded nearly 1,800 scholarships over 16 years.",
      ),
      g: b(
        "Báo cáo bền vững năm thứ ba liên tiếp, tham chiếu GRI 2021 và tiêu chuẩn hoạt động của IFC; IFC mua 1.000 tỷ đồng trái phiếu kèm cam kết chuẩn EDGE. Chưa thấy đảm bảo độc lập cho số liệu ESG.",
        "Third consecutive sustainability report referencing GRI 2021 and IFC Performance Standards; IFC bought VND 1,000 billion of bonds tied to EDGE standards. No independent assurance of ESG data was found.",
      ),
    },
    sources: [
      {
        title: "Nam Long năm thứ 3 liên tiếp công bố báo cáo phát triển bền vững — Znews",
        url: "https://znews.vn/nam-long-nam-thu-3-lien-tiep-cong-bo-bao-cao-phat-trien-ben-vung-post1673342.html",
      },
      {
        title:
          "IFC hỗ trợ Nam Long phát triển dự án nhà ở xanh và bền vững — Thị trường Tài chính Tiền tệ",
        url: "https://thitruongtaichinhtiente.vn/ifc-ho-tro-cong-ty-co-phan-dau-tu-nam-long-phat-trien-du-an-nha-o-xanh-va-ben-vung-40143.html",
      },
      {
        title: "Nam Long 'Bắc tiến' với dòng sản phẩm EHome — Tuổi Trẻ",
        url: "https://tuoitre.vn/nam-long-bac-tien-voi-dong-san-pham-ehome-20250528193811402.htm",
      },
    ],
  },
  {
    slug: "vinhomes",
    name: "Vinhomes",
    sector: "real-estate",
    country: "VN",
    domain: "vinhomes.vn",
    e: 4.5,
    s: 6.0,
    g: 5.0,
    listedOverall: 5.2,
    assessedAt: "2026-10-29",
    why: b(
      "Vinhomes đóng góp lớn về nhà ở xã hội, nhưng dự án lấn biển Cần Giờ cạnh khu dự trữ sinh quyển rừng ngập mặn gây lo ngại môi trường chưa được giải đáp độc lập, và Fitch cho biết xếp hạng của công ty bị kéo xuống bởi công ty mẹ Vingroup.",
      "Vinhomes contributes substantially to social housing, but its Can Gio sea-reclamation project beside a mangrove biosphere reserve raises environmental concerns not independently resolved, and Fitch says its rating is held back by parent Vingroup.",
    ),
    notes: {
      e: b(
        "Dự án Cần Giờ 2.870 ha (khoảng 8,5 tỷ USD) do công ty con của Vingroup làm chủ đầu tư, nằm trong vùng đệm Khu dự trữ sinh quyển rừng ngập mặn Cần Giờ; chuyên gia lo ngại xói lở, khai thác khoảng 138 triệu m³ cát và rủi ro khí hậu. Doanh nghiệp cho biết đã có ĐTM được duyệt và dành phân khu bảo tồn. Đây là vấn đề đang được tranh luận, không phải kết luận sai phạm.",
        "The 2,870 ha (about $8.5bn) Can Gio project, led by a Vingroup subsidiary, sits in the buffer zone of the Can Gio mangrove biosphere reserve; experts warn of erosion, about 138 million m³ of sand extraction and climate risk. The company says its EIA was approved and conservation zones are planned. This is a debated issue, not a finding of wrongdoing.",
      ),
      s: b(
        "Triển khai nhà ở xã hội Happy Home quy mô lớn, ví dụ dự án Cam Ranh gần 3.600 căn thấp tầng cho người thu nhập thấp và công nhân, dự kiến hoàn thành cuối 2026.",
        "Large-scale Happy Home social housing, e.g. nearly 3,600 low-rise units for low-income buyers and workers in Cam Ranh, due by end-2026.",
      ),
      g: b(
        "Fitch xếp hạng BB- (ổn định); hồ sơ độc lập ở mức bb nhưng bị giới hạn bởi Vingroup, và dòng tiền của Vinhomes được kỳ vọng bù đắp cho VinFast đang đốt tiền. Thông tin ESG chủ yếu công bố ở cấp tập đoàn.",
        "Fitch rates it BB- (stable); its standalone profile is bb but capped by Vingroup, and Vinhomes' cash flows are expected to offset VinFast's cash burn. ESG information is mostly disclosed at group level.",
      ),
    },
    sources: [
      {
        title:
          "Vingroup aims to launch $8.5bn Can Gio reclaimed coastal urban project — Tuoi Tre News",
        url: "https://news.tuoitre.vn/vingroup-aims-to-launch-85bn-can-gio-reclaimed-coastal-urban-project-before-april-30-10385092.htm",
      },
      {
        title: "Vietnam approves US$9 billion project within mangrove reserve — Eco-Business",
        url: "https://eco-business.com/news/vietnam-approves-us9-billion-project-within-mangrove-reserve",
      },
      {
        title: "Vinhomes khởi công dự án nhà ở xã hội gần 3.800 tỷ tại Khánh Hòa — Nhà Đầu tư",
        url: "https://nhadautu.vn/vinhomes-khoi-cong-du-an-nha-o-xa-hoi-gan-3800-ty-tai-khanh-hoa-d83088.html",
      },
      {
        title: "Fitch rates Vietnam's realty heavyweight Vinhomes as 'BB-' — The Investor",
        url: "https://theinvestor.vn/fitch-rates-vietnams-realty-heavyweight-vinhomes-as-bb-d14088.html",
      },
    ],
  },
];
