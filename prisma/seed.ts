/**
 * Development seed — FICTIONAL DATA ONLY.
 *
 * Every brand, claim, source, certification body and figure below is
 * invented for demonstration. All URLs point to example.com. No real
 * company, certification status or ESG statistic is represented.
 *
 * The seed is destructive: it clears all application tables first.
 * Scores are NOT hard-coded — they are produced by the real scoring engine.
 */
import "dotenv/config";
import {
  PrismaClient,
  type ClaimStatus,
  type DisclosureLevel,
  type DisclosureTopic,
  type EvidenceStrength,
  type MissingDataState,
  type SourceType,
  type SustainabilityCategory,
  type VerificationLevel,
  type VerificationStatus,
} from "@prisma/client";
import { deriveClaimRisk } from "../lib/services/claim-service";
import { recalculateBrandScore } from "../lib/services/scoring-service";
import { methodologyConfigSnapshot, METHODOLOGY_VERSION } from "../lib/scoring/config";

const prisma = new PrismaClient();
const d = (iso: string) => new Date(`${iso}T00:00:00.000Z`);
const FICTIONAL_NOTE = "Fictional sample record for development and demonstration.";

interface SeedSource {
  key: string;
  title: string;
  sourceType: SourceType;
  publisher: string;
  path: string;
  publicationDate: string;
  verificationLevel: VerificationLevel;
  status?: "VERIFIED" | "PUBLISHED" | "CANDIDATE";
  notes?: string;
}

interface SeedClaim {
  text: string;
  category: SustainabilityCategory;
  date?: string;
  /** [specificity, evidence level, measurability, verification, context] on the 0–5 rubric */
  rubric?: [number, number, number, number, number];
  status: ClaimStatus;
  methodologyNote?: string;
  verificationNote?: string;
  reviewerNotes?: string;
  origin?: string;
  evidence?: { source: string; excerpt?: string; page?: string; strength: EvidenceStrength }[];
}

interface SeedCertification {
  name: string;
  body: string;
  scope: string;
  validFrom: string;
  validTo: string;
  source?: string;
  status: VerificationStatus;
}

interface SeedTarget {
  title: string;
  category: SustainabilityCategory;
  metric?: string;
  baseline?: [number, number];
  target?: number;
  targetYear?: number;
  progress?: [number, number];
  isSpecific: boolean;
  hasHistoricalData: boolean;
  status: VerificationStatus;
  source?: string;
}

interface SeedBrand {
  slug: string;
  name: string;
  industry: string;
  country: string;
  description: string;
  lastReviewedAt: string;
  targetsDataState: MissingDataState;
  disclosure: Record<DisclosureTopic, [MissingDataState, DisclosureLevel | null]>;
  audit: {
    clickCount: number;
    searchability: number;
    readability: number;
    evidenceLinkage: number;
    notes: string;
  };
  sources: SeedSource[];
  claims: SeedClaim[];
  certifications: SeedCertification[];
  targets: SeedTarget[];
}

const INDUSTRIES = [
  { name: "Apparel & Footwear", slug: "apparel-footwear" },
  { name: "Consumer Technology", slug: "consumer-technology" },
  { name: "Beauty & Personal Care", slug: "beauty-personal-care" },
];

const url = (brand: string, path: string) => `https://example.com/${brand}/${path}`;

const BRANDS: SeedBrand[] = [
  {
    slug: "verdant-wear",
    name: "Verdant Wear",
    industry: "apparel-footwear",
    country: "Portugal",
    description:
      "Fictional outdoor and activewear label used to demonstrate a brand with extensive, mostly quantified sustainability disclosure.",
    lastReviewedAt: "2026-09-20",
    targetsDataState: "AVAILABLE",
    disclosure: {
      SUSTAINABILITY_REPORT: ["AVAILABLE", "CLEAR"],
      CARBON_EMISSIONS: ["AVAILABLE", "CLEAR"],
      MATERIAL_SOURCING: ["AVAILABLE", "CLEAR"],
      SUPPLY_CHAIN: ["AVAILABLE", "CLEAR"],
      WASTE_RECYCLING: ["AVAILABLE", "PARTIAL"],
      WATER_RESOURCE_USE: ["AVAILABLE", "PARTIAL"],
      METHODOLOGY: ["AVAILABLE", "CLEAR"],
    },
    audit: {
      clickCount: 2,
      searchability: 3,
      readability: 2,
      evidenceLinkage: 3,
      notes:
        "Impact report linked from the footer; claims cross-reference report sections but not page numbers.",
    },
    sources: [
      {
        key: "report",
        title: "Verdant Wear Impact Report 2025",
        sourceType: "SUSTAINABILITY_REPORT",
        publisher: "Verdant Wear",
        path: "impact-report-2025.pdf",
        publicationDate: "2026-04-15",
        verificationLevel: "SELF_DECLARED",
      },
      {
        key: "certdb",
        title: "Recycled Content Certificate Register — Verdant Wear",
        sourceType: "CERTIFICATION_DATABASE",
        publisher: "Global Recycled Content Registry (fictional)",
        path: "recycled-content-register",
        publicationDate: "2026-01-10",
        verificationLevel: "RECOGNIZED_CERTIFICATION",
      },
      {
        key: "assurance",
        title: "Independent Limited Assurance Statement — GHG Emissions 2025",
        sourceType: "ASSURANCE_STATEMENT",
        publisher: "Atlas Assurance Partners (fictional)",
        path: "ghg-assurance-2025.pdf",
        publicationDate: "2026-04-15",
        verificationLevel: "INDEPENDENT_ASSURANCE",
      },
      {
        key: "materials",
        title: "Sustainability — Materials & Water",
        sourceType: "SUSTAINABILITY_WEBPAGE",
        publisher: "Verdant Wear",
        path: "sustainability/materials",
        publicationDate: "2026-06-01",
        verificationLevel: "SELF_DECLARED",
      },
      {
        key: "suppliers",
        title: "Supplier List (Tier 1 & Tier 2)",
        sourceType: "SUSTAINABILITY_WEBPAGE",
        publisher: "Verdant Wear",
        path: "sustainability/suppliers",
        publicationDate: "2026-07-01",
        verificationLevel: "SELF_DECLARED",
      },
      {
        key: "packaging",
        title: "Packaging FAQ",
        sourceType: "PRODUCT_PAGE",
        publisher: "Verdant Wear",
        path: "help/packaging",
        publicationDate: "2026-03-01",
        verificationLevel: "SELF_DECLARED",
      },
      {
        key: "campaign",
        title: "Campaign page: “Designed with the planet in mind”",
        sourceType: "MARKETING_MATERIAL",
        publisher: "Verdant Wear",
        path: "campaign/planet",
        publicationDate: "2026-05-01",
        verificationLevel: "SELF_DECLARED",
      },
    ],
    claims: [
      {
        text: "68% of the polyester used in our 2025 collections came from post-consumer recycled bottles, verified under a recycled content standard.",
        category: "MATERIALS",
        date: "2026-04-15",
        rubric: [5, 5, 5, 5, 4],
        status: "PUBLISHED",
        methodologyNote:
          "Share calculated by material weight across all 2025 purchase orders (report section 3.2).",
        verificationNote:
          "Recycled content certified for outerwear and activewear lines; see certification scope.",
        evidence: [
          {
            source: "report",
            excerpt:
              "Recycled polyester represented 68% of total polyester volume (by weight) purchased for 2025 collections.",
            page: "21",
            strength: "STRONG",
          },
          {
            source: "certdb",
            excerpt:
              "Certificate covers recycled polyester inputs for outerwear and activewear product groups.",
            strength: "STRONG",
          },
        ],
      },
      {
        text: "We reduced absolute Scope 1 and 2 greenhouse gas emissions by 42% compared with our 2019 baseline.",
        category: "CARBON_CLIMATE",
        date: "2026-04-15",
        rubric: [5, 5, 5, 4, 5],
        status: "PUBLISHED",
        methodologyNote:
          "Calculated following a recognised GHG accounting protocol; market-based Scope 2.",
        verificationNote:
          "Limited assurance provided by an independent assurance provider (fictional).",
        evidence: [
          {
            source: "report",
            excerpt: "Scope 1+2 emissions: 6,960 tCO2e in 2025 vs 12,000 tCO2e in 2019 (−42%).",
            page: "34",
            strength: "STRONG",
          },
          {
            source: "assurance",
            excerpt:
              "Nothing has come to our attention that causes us to believe the Scope 1 and 2 figures are not fairly stated.",
            page: "2",
            strength: "STRONG",
          },
        ],
      },
      {
        text: "We publish our full Tier 1 and Tier 2 supplier list, updated twice a year.",
        category: "SUPPLY_CHAIN",
        date: "2026-07-01",
        rubric: [5, 4, 4, 2, 4],
        status: "VERIFIED",
        methodologyNote: "Supplier list includes facility names, countries and product types.",
        evidence: [
          {
            source: "suppliers",
            excerpt: "Last updated July 2026 — 46 Tier 1 and 112 Tier 2 facilities listed.",
            strength: "STRONG",
          },
        ],
      },
      {
        text: "Our e-commerce mailers are plastic-free and certified home-compostable.",
        category: "PACKAGING",
        date: "2026-03-01",
        rubric: [4, 3, 3, 3, 3],
        status: "VERIFIED",
        verificationNote:
          "The packaging certification expired in August 2026; renewal not found during the review.",
        evidence: [
          {
            source: "packaging",
            excerpt: "All online orders ship in paper-based mailers certified home-compostable.",
            strength: "MODERATE",
          },
        ],
      },
      {
        text: "All our denim is made with water-saving techniques.",
        category: "WATER",
        date: "2026-06-01",
        rubric: [2, 2, 1, 1, 2],
        status: "VERIFIED",
        reviewerNotes: "No water-use figures, baseline or definition of ‘water-saving’ found.",
        evidence: [
          {
            source: "materials",
            excerpt: "Our denim partners use ozone and laser finishing to save water.",
            strength: "LIMITED",
          },
        ],
      },
      {
        text: "Designed with the planet in mind.",
        category: "GENERAL",
        date: "2026-05-01",
        rubric: [0, 0, 0, 0, 0],
        status: "VERIFIED",
        reviewerNotes:
          "Campaign slogan reviewed; no specific attribute or supporting evidence identified.",
        evidence: [{ source: "campaign", strength: "NOT_FOUND" }],
      },
      {
        text: "Verdant Wear will be climate positive by 2030.",
        category: "CARBON_CLIMATE",
        status: "CANDIDATE",
        origin: "import:scrape-2026-09-18",
        reviewerNotes: "Imported candidate — awaiting human review. Does not affect scores.",
      },
    ],
    certifications: [
      {
        name: "Recycled Content Standard (sample scheme)",
        body: "Global Recycled Content Registry (fictional)",
        scope:
          "Recycled polyester in the 2025 outerwear and activewear collections only — not the entire product range.",
        validFrom: "2025-06-01",
        validTo: "2027-05-31",
        source: "certdb",
        status: "VERIFIED",
      },
      {
        name: "Home Compostable Packaging Mark (sample scheme)",
        body: "Northfield Packaging Certification (fictional)",
        scope: "E-commerce paper mailers only.",
        validFrom: "2024-09-01",
        validTo: "2026-08-31",
        source: "packaging",
        status: "VERIFIED",
      },
    ],
    targets: [
      {
        title: "Reduce absolute Scope 1 and 2 emissions by 50% by 2030 from a 2019 baseline",
        category: "CARBON_CLIMATE",
        metric: "tCO2e",
        baseline: [12000, 2019],
        target: 6000,
        targetYear: 2030,
        progress: [6960, 2025],
        isSpecific: true,
        hasHistoricalData: true,
        status: "VERIFIED",
        source: "report",
      },
      {
        title: "100% recycled or certified organic materials by 2028",
        category: "MATERIALS",
        metric: "% of material volume",
        baseline: [31, 2021],
        target: 100,
        targetYear: 2028,
        progress: [64, 2025],
        isSpecific: true,
        hasHistoricalData: true,
        status: "SELF_DECLARED",
        source: "report",
      },
      {
        title: "Reduce water use in denim finishing",
        category: "WATER",
        metric: "litres per garment",
        targetYear: 2027,
        isSpecific: false,
        hasHistoricalData: false,
        status: "SELF_DECLARED",
        source: "materials",
      },
    ],
  },
  {
    slug: "novatech-labs",
    name: "NovaTech Labs",
    industry: "consumer-technology",
    country: "Canada",
    description:
      "Fictional consumer-electronics maker used to demonstrate a mix of quantified product claims and broad corporate commitments.",
    lastReviewedAt: "2026-09-02",
    targetsDataState: "AVAILABLE",
    disclosure: {
      SUSTAINABILITY_REPORT: ["AVAILABLE", "PARTIAL"],
      CARBON_EMISSIONS: ["AVAILABLE", "PARTIAL"],
      MATERIAL_SOURCING: ["AVAILABLE", "PARTIAL"],
      SUPPLY_CHAIN: ["NOT_FOUND", null],
      WASTE_RECYCLING: ["AVAILABLE", "CLEAR"],
      WATER_RESOURCE_USE: ["NOT_FOUND", null],
      METHODOLOGY: ["AVAILABLE", "PARTIAL"],
    },
    audit: {
      clickCount: 3,
      searchability: 2,
      readability: 2,
      evidenceLinkage: 2,
      notes:
        "Environmental report reachable via About → Responsibility → Reports. Product profiles not linked from claims.",
    },
    sources: [
      {
        key: "report",
        title: "NovaTech Labs Environmental Progress Report 2024",
        sourceType: "SUSTAINABILITY_REPORT",
        publisher: "NovaTech Labs",
        path: "environmental-progress-2024.pdf",
        publicationDate: "2025-03-20",
        verificationLevel: "SELF_DECLARED",
      },
      {
        key: "profile",
        title: "Product Environmental Profile — Nova X5 Laptop",
        sourceType: "PRODUCT_PAGE",
        publisher: "NovaTech Labs",
        path: "products/nova-x5/environment",
        publicationDate: "2026-02-01",
        verificationLevel: "SELF_DECLARED",
      },
      {
        key: "energy",
        title: "Renewable Electricity Supply Confirmation 2024",
        sourceType: "THIRD_PARTY_AUDIT",
        publisher: "Brightgrid Energy Cooperative (fictional)",
        path: "renewable-supply-letter-2024.pdf",
        publicationDate: "2025-09-01",
        verificationLevel: "EXTERNAL_REFERENCE",
      },
      {
        key: "registry",
        title: "Energy Efficiency Label Registry — NovaTech models",
        sourceType: "CERTIFICATION_DATABASE",
        publisher: "Efficient Devices Registry (fictional)",
        path: "efficiency-registry/novatech",
        publicationDate: "2025-11-15",
        verificationLevel: "RECOGNIZED_CERTIFICATION",
      },
      {
        key: "takeback",
        title: "Device Take-Back Programme",
        sourceType: "SUSTAINABILITY_WEBPAGE",
        publisher: "NovaTech Labs",
        path: "take-back",
        publicationDate: "2026-01-05",
        verificationLevel: "SELF_DECLARED",
      },
      {
        key: "press",
        title: "Press release: “NovaTech commits to carbon neutrality”",
        sourceType: "MARKETING_MATERIAL",
        publisher: "NovaTech Labs",
        path: "press/carbon-neutral-2030",
        publicationDate: "2025-10-10",
        verificationLevel: "SELF_DECLARED",
      },
      {
        key: "coc",
        title: "Supplier Code of Conduct (unreviewed import)",
        sourceType: "SUSTAINABILITY_WEBPAGE",
        publisher: "NovaTech Labs",
        path: "supplier-code",
        publicationDate: "2024-05-01",
        verificationLevel: "SELF_DECLARED",
        status: "CANDIDATE",
      },
    ],
    claims: [
      {
        text: "The Nova X5 laptop chassis contains 50% recycled aluminium by weight.",
        category: "MATERIALS",
        date: "2026-02-01",
        rubric: [5, 3, 4, 1, 3],
        status: "PUBLISHED",
        methodologyNote:
          "Percentage by chassis weight stated in the product profile; calculation method not described.",
        evidence: [
          {
            source: "profile",
            excerpt: "Chassis: 50% recycled aluminium (by weight).",
            strength: "MODERATE",
          },
        ],
      },
      {
        text: "Our offices and R&D sites ran on 100% renewable electricity in 2024.",
        category: "ENERGY",
        date: "2025-03-20",
        rubric: [4, 3, 4, 2, 3],
        status: "VERIFIED",
        verificationNote:
          "Supply confirmation letter from the electricity supplier (fictional). Manufacturing sites not included.",
        evidence: [
          {
            source: "report",
            excerpt:
              "100% of electricity for offices and R&D facilities was matched with renewable supply in 2024.",
            page: "12",
            strength: "MODERATE",
          },
          {
            source: "energy",
            excerpt:
              "Confirms renewable supply for 6 NovaTech office and R&D sites for calendar year 2024.",
            strength: "MODERATE",
          },
        ],
      },
      {
        text: "NovaTech devices are designed to be energy-efficient.",
        category: "ENERGY",
        date: "2025-11-15",
        rubric: [2, 3, 2, 3, 2],
        status: "VERIFIED",
        reviewerNotes:
          "Efficiency label applies to 14 of 31 models; the claim is phrased for all devices.",
        evidence: [
          {
            source: "registry",
            excerpt: "14 NovaTech models listed with a current efficiency label.",
            strength: "MODERATE",
          },
        ],
      },
      {
        text: "Our take-back programme collected 1,250 tonnes of electronic waste in 2024.",
        category: "WASTE_CIRCULARITY",
        date: "2026-01-05",
        rubric: [5, 3, 5, 1, 3],
        status: "VERIFIED",
        evidence: [
          {
            source: "takeback",
            excerpt: "1,250 tonnes collected in 2024 (2023: 1,020 tonnes).",
            strength: "MODERATE",
          },
          {
            source: "report",
            excerpt: "E-waste collected through take-back: 1,250 t.",
            page: "27",
            strength: "MODERATE",
          },
        ],
      },
      {
        text: "We are committed to becoming carbon neutral by 2030.",
        category: "CARBON_CLIMATE",
        date: "2025-10-10",
        rubric: [2, 1, 1, 0, 2],
        status: "PUBLISHED",
        reviewerNotes:
          "No baseline, emissions scope or split between reductions and offsets disclosed.",
        evidence: [
          {
            source: "press",
            excerpt: "NovaTech today announced its commitment to carbon neutrality by 2030.",
            strength: "LIMITED",
          },
        ],
      },
      {
        text: "Green technology for a better tomorrow.",
        category: "GENERAL",
        date: "2025-10-10",
        rubric: [0, 0, 0, 0, 0],
        status: "VERIFIED",
        evidence: [{ source: "press", strength: "NOT_FOUND" }],
      },
      {
        text: "Conflict-free minerals throughout our supply chain.",
        category: "SUPPLY_CHAIN",
        status: "CANDIDATE",
        origin: "import:scrape-2026-08-30",
      },
    ],
    certifications: [
      {
        name: "Energy Efficiency Label (sample scheme)",
        body: "Efficient Devices Registry (fictional)",
        scope: "14 of 31 monitor and laptop models sold in the EU market.",
        validFrom: "2025-01-01",
        validTo: "2027-12-31",
        source: "registry",
        status: "VERIFIED",
      },
    ],
    targets: [
      {
        title: "Carbon neutral by 2030",
        category: "CARBON_CLIMATE",
        targetYear: 2030,
        isSpecific: false,
        hasHistoricalData: false,
        status: "SELF_DECLARED",
        source: "press",
      },
      {
        title: "Collect 2,000 tonnes of e-waste per year by 2027",
        category: "WASTE_CIRCULARITY",
        metric: "tonnes collected per year",
        baseline: [800, 2021],
        target: 2000,
        targetYear: 2027,
        progress: [1250, 2024],
        isSpecific: true,
        hasHistoricalData: false,
        status: "SELF_DECLARED",
        source: "takeback",
      },
    ],
  },
  {
    slug: "pureform-beauty",
    name: "PureForm Beauty",
    industry: "beauty-personal-care",
    country: "United Kingdom",
    description:
      "Fictional skincare brand used to demonstrate broad ‘clean’ and ‘natural’ messaging with limited supporting evidence.",
    lastReviewedAt: "2026-08-28",
    targetsDataState: "AVAILABLE",
    disclosure: {
      SUSTAINABILITY_REPORT: ["AVAILABLE", "PARTIAL"],
      CARBON_EMISSIONS: ["NOT_FOUND", null],
      MATERIAL_SOURCING: ["AVAILABLE", "PARTIAL"],
      SUPPLY_CHAIN: ["NOT_FOUND", null],
      WASTE_RECYCLING: ["AVAILABLE", "PARTIAL"],
      WATER_RESOURCE_USE: ["NOT_FOUND", null],
      METHODOLOGY: ["AVAILABLE", "PARTIAL"],
    },
    audit: {
      clickCount: 4,
      searchability: 1,
      readability: 2,
      evidenceLinkage: 1,
      notes:
        "Sustainability snapshot only reachable via the press area; site search returns no results for ‘sustainability’.",
    },
    sources: [
      {
        key: "promise",
        title: "Our Clean Beauty Promise",
        sourceType: "SUSTAINABILITY_WEBPAGE",
        publisher: "PureForm Beauty",
        path: "clean-beauty-promise",
        publicationDate: "2026-05-10",
        verificationLevel: "SELF_DECLARED",
      },
      {
        key: "brandbook",
        title: "PureForm Beauty Brand Book 2026",
        sourceType: "MARKETING_MATERIAL",
        publisher: "PureForm Beauty",
        path: "brand-book-2026.pdf",
        publicationDate: "2026-01-20",
        verificationLevel: "SELF_DECLARED",
      },
      {
        key: "glossary",
        title: "Ingredient Glossary",
        sourceType: "PRODUCT_PAGE",
        publisher: "PureForm Beauty",
        path: "ingredients",
        publicationDate: "2025-12-01",
        verificationLevel: "SELF_DECLARED",
      },
      {
        key: "refill",
        title: "Refill Programme FAQ",
        sourceType: "PRODUCT_PAGE",
        publisher: "PureForm Beauty",
        path: "refill",
        publicationDate: "2026-03-12",
        verificationLevel: "SELF_DECLARED",
      },
      {
        key: "cfcert",
        title: "Cruelty-Free Certification Listing",
        sourceType: "CERTIFICATION_DATABASE",
        publisher: "ClearLeaf Cosmetics Standard (fictional)",
        path: "clearleaf-listing/pureform",
        publicationDate: "2025-08-01",
        verificationLevel: "RECOGNIZED_CERTIFICATION",
      },
      {
        key: "snapshot",
        title: "Sustainability Snapshot 2022",
        sourceType: "SUSTAINABILITY_REPORT",
        publisher: "PureForm Beauty",
        path: "sustainability-snapshot-2022.pdf",
        publicationDate: "2022-11-01",
        verificationLevel: "SELF_DECLARED",
      },
    ],
    claims: [
      {
        text: "Clean, natural beauty that's good for the planet.",
        category: "GENERAL",
        date: "2026-05-10",
        rubric: [0, 0, 0, 0, 1],
        status: "PUBLISHED",
        reviewerNotes:
          "No definition of ‘clean’ or ‘natural’ and no environmental attribute specified.",
        evidence: [
          {
            source: "promise",
            excerpt: "Clean, natural beauty that's good for the planet.",
            strength: "NOT_FOUND",
          },
        ],
      },
      {
        text: "Our formulas are 97% natural origin on average, calculated using an international standard for natural-origin indexes.",
        category: "CHEMICALS_INGREDIENTS",
        date: "2025-12-01",
        rubric: [4, 3, 4, 1, 4],
        status: "VERIFIED",
        methodologyNote:
          "Natural-origin index calculated with a published ISO calculation method (as stated by the brand).",
        evidence: [
          {
            source: "glossary",
            excerpt:
              "Average natural-origin index across the range: 97% (calculated per ISO 16128).",
            strength: "MODERATE",
          },
        ],
      },
      {
        text: "Refill pouches use 70% less plastic than our original bottles.",
        category: "PACKAGING",
        date: "2026-03-12",
        rubric: [4, 2, 3, 0, 2],
        status: "VERIFIED",
        reviewerNotes: "Comparison basis (weight per ml? per unit?) not stated.",
        evidence: [
          {
            source: "refill",
            excerpt: "Our refill pouches use 70% less plastic.",
            strength: "LIMITED",
          },
        ],
      },
      {
        text: "Responsibly sourced ingredients.",
        category: "SUPPLY_CHAIN",
        date: "2026-01-20",
        rubric: [1, 1, 0, 0, 1],
        status: "VERIFIED",
        evidence: [
          {
            source: "brandbook",
            excerpt: "We choose responsibly sourced ingredients wherever possible.",
            strength: "LIMITED",
          },
        ],
      },
      {
        text: "Certified cruelty-free under a recognised standard.",
        category: "OTHER",
        date: "2025-08-01",
        rubric: [4, 4, 3, 4, 3],
        status: "VERIFIED",
        verificationNote:
          "The certification concerns animal-testing policy only and is not an environmental certification.",
        evidence: [
          {
            source: "cfcert",
            excerpt: "PureForm Beauty — approved, all finished products.",
            strength: "STRONG",
          },
        ],
      },
      {
        text: "Eco-friendly packaging.",
        category: "PACKAGING",
        date: "2026-01-20",
        rubric: [1, 0, 0, 0, 0],
        status: "PUBLISHED",
        evidence: [
          { source: "brandbook", excerpt: "Eco-friendly packaging.", strength: "NOT_FOUND" },
        ],
      },
      {
        text: "Carbon neutral shipping on all orders.",
        category: "CARBON_CLIMATE",
        status: "CANDIDATE",
        origin: "import:scrape-2026-08-20",
      },
    ],
    certifications: [
      {
        name: "Cruelty-Free Standard (sample scheme)",
        body: "ClearLeaf Cosmetics Standard (fictional)",
        scope:
          "Animal-testing policy for finished products and ingredient suppliers — not an environmental certification.",
        validFrom: "2025-08-01",
        validTo: "2027-07-31",
        source: "cfcert",
        status: "VERIFIED",
      },
    ],
    targets: [
      {
        title: "Become a more sustainable brand",
        category: "GENERAL",
        isSpecific: false,
        hasHistoricalData: false,
        status: "SELF_DECLARED",
        source: "promise",
      },
      {
        title: "Make 50% of the skincare range available in refillable formats by 2027",
        category: "PACKAGING",
        metric: "% of skincare SKUs refillable",
        target: 50,
        targetYear: 2027,
        progress: [18, 2025],
        isSpecific: true,
        hasHistoricalData: false,
        status: "SELF_DECLARED",
        source: "refill",
      },
    ],
  },
  {
    slug: "loomwell-apparel",
    name: "Loomwell Apparel",
    industry: "apparel-footwear",
    country: "Vietnam",
    description:
      "Fictional basics manufacturer used to demonstrate strong product-level evidence alongside an outdated corporate report.",
    lastReviewedAt: "2026-09-12",
    targetsDataState: "AVAILABLE",
    disclosure: {
      SUSTAINABILITY_REPORT: ["AVAILABLE", "PARTIAL"],
      CARBON_EMISSIONS: ["NOT_FOUND", null],
      MATERIAL_SOURCING: ["AVAILABLE", "CLEAR"],
      SUPPLY_CHAIN: ["AVAILABLE", "PARTIAL"],
      WASTE_RECYCLING: ["NOT_FOUND", null],
      WATER_RESOURCE_USE: ["AVAILABLE", "PARTIAL"],
      METHODOLOGY: ["AVAILABLE", "PARTIAL"],
    },
    audit: {
      clickCount: 3,
      searchability: 2,
      readability: 3,
      evidenceLinkage: 2,
      notes: "Clear plain-language summaries; certificate numbers listed on product pages.",
    },
    sources: [
      {
        key: "report",
        title: "Loomwell Sustainability Report 2023",
        sourceType: "SUSTAINABILITY_REPORT",
        publisher: "Loomwell Apparel",
        path: "sustainability-report-2023.pdf",
        publicationDate: "2024-02-15",
        verificationLevel: "SELF_DECLARED",
      },
      {
        key: "cotton",
        title: "Organic Cotton Programme",
        sourceType: "SUSTAINABILITY_WEBPAGE",
        publisher: "Loomwell Apparel",
        path: "organic-cotton",
        publicationDate: "2025-06-01",
        verificationLevel: "SELF_DECLARED",
      },
      {
        key: "audit",
        title: "Factory Social & Environmental Audit Summary",
        sourceType: "THIRD_PARTY_AUDIT",
        publisher: "Mekong Compliance Services (fictional)",
        path: "factory-audit-summary-2025.pdf",
        publicationDate: "2025-03-01",
        verificationLevel: "EXTERNAL_REFERENCE",
      },
      {
        key: "certdb",
        title: "Organic Textile Certificate Listing — Loomwell",
        sourceType: "CERTIFICATION_DATABASE",
        publisher: "Northfield Textile Certification (fictional)",
        path: "organic-textile-listing/loomwell",
        publicationDate: "2025-04-20",
        verificationLevel: "RECOGNIZED_CERTIFICATION",
      },
      {
        key: "water",
        title: "Wastewater Treatment Update",
        sourceType: "SUSTAINABILITY_WEBPAGE",
        publisher: "Loomwell Apparel",
        path: "wastewater",
        publicationDate: "2025-09-10",
        verificationLevel: "SELF_DECLARED",
      },
      {
        key: "tee",
        title: "Product page: Everyday Organic Tee",
        sourceType: "PRODUCT_PAGE",
        publisher: "Loomwell Apparel",
        path: "products/everyday-organic-tee",
        publicationDate: "2026-02-01",
        verificationLevel: "SELF_DECLARED",
      },
    ],
    claims: [
      {
        text: "Our Everyday Tee is made from 100% certified organic cotton.",
        category: "MATERIALS",
        date: "2026-02-01",
        rubric: [5, 4, 4, 4, 4],
        status: "PUBLISHED",
        verificationNote: "Certificate covers the Everyday Tee and Basics lines only.",
        evidence: [
          {
            source: "tee",
            excerpt: "100% organic cotton — certificate no. NTC-0000-EXAMPLE.",
            strength: "STRONG",
          },
          {
            source: "certdb",
            excerpt: "Scope: Everyday Organic Tee and Basics product lines.",
            strength: "STRONG",
          },
        ],
      },
      {
        text: "Organic cotton accounted for 38% of our total cotton volume in 2023.",
        category: "MATERIALS",
        date: "2024-02-15",
        rubric: [5, 3, 5, 2, 4],
        status: "VERIFIED",
        methodologyNote: "Share of purchased cotton fibre by weight.",
        evidence: [
          {
            source: "report",
            excerpt:
              "Organic cotton: 38% of cotton fibre purchased (by weight), up from 22% in 2020.",
            page: "9",
            strength: "MODERATE",
          },
        ],
      },
      {
        text: "Our two owned factories treat 100% of wastewater on site before discharge.",
        category: "WATER",
        date: "2025-09-10",
        rubric: [4, 3, 4, 2, 3],
        status: "VERIFIED",
        evidence: [
          {
            source: "water",
            excerpt: "Both owned facilities operate on-site effluent treatment plants.",
            strength: "MODERATE",
          },
          {
            source: "audit",
            excerpt: "Effluent treatment operational at both audited owned sites.",
            strength: "MODERATE",
          },
        ],
      },
      {
        text: "Fair and ethical production across our supply chain.",
        category: "SUPPLY_CHAIN",
        date: "2025-03-01",
        rubric: [1, 2, 1, 2, 1],
        status: "VERIFIED",
        reviewerNotes: "Audit summary covers owned factories only, not the wider supply chain.",
        evidence: [
          { source: "audit", excerpt: "Audit scope: 2 owned factories.", strength: "LIMITED" },
        ],
      },
      {
        text: "We are reducing our carbon footprint every year.",
        category: "CARBON_CLIMATE",
        date: "2024-02-15",
        rubric: [1, 1, 1, 0, 1],
        status: "VERIFIED",
        evidence: [
          {
            source: "report",
            excerpt: "We continue to reduce our carbon footprint year on year.",
            page: "4",
            strength: "LIMITED",
          },
        ],
      },
    ],
    certifications: [
      {
        name: "Organic Textile Standard (sample scheme)",
        body: "Northfield Textile Certification (fictional)",
        scope: "Everyday Organic Tee and Basics product lines (2 of 9 product lines).",
        validFrom: "2025-04-20",
        validTo: "2027-04-19",
        source: "certdb",
        status: "VERIFIED",
      },
    ],
    targets: [
      {
        title: "50% organic or recycled cotton by 2027",
        category: "MATERIALS",
        metric: "% of cotton volume",
        baseline: [22, 2020],
        target: 50,
        targetYear: 2027,
        progress: [38, 2023],
        isSpecific: true,
        hasHistoricalData: true,
        status: "SELF_DECLARED",
        source: "report",
      },
      {
        title: "Reduce our carbon footprint",
        category: "CARBON_CLIMATE",
        isSpecific: false,
        hasHistoricalData: false,
        status: "SELF_DECLARED",
        source: "report",
      },
    ],
  },
];

async function reset() {
  await prisma.researchResponse.deleteMany();
  await prisma.researchCondition.deleteMany();
  await prisma.researchStudy.deleteMany();
  await prisma.brandScore.deleteMany();
  await prisma.claimSource.deleteMany();
  await prisma.claim.deleteMany();
  await prisma.certification.deleteMany();
  await prisma.sustainabilityTarget.deleteMany();
  await prisma.disclosureItem.deleteMany();
  await prisma.accessibilityAudit.deleteMany();
  await prisma.source.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.industry.deleteMany();
  await prisma.methodologyVersion.deleteMany();
}

async function seedBrand(
  spec: SeedBrand,
  industryIds: Record<string, string>,
  holdBack: string[] = [],
) {
  const brand = await prisma.brand.create({
    data: {
      slug: spec.slug,
      name: spec.name,
      industryId: industryIds[spec.industry],
      country: spec.country,
      website: `https://example.com/${spec.slug}`,
      description: spec.description,
      isFictional: true,
      status: "PUBLISHED",
      targetsDataState: spec.targetsDataState,
      lastReviewedAt: d(spec.lastReviewedAt),
    },
  });

  const sourceIds: Record<string, string> = {};
  for (const s of spec.sources) {
    const created = await prisma.source.create({
      data: {
        brandId: brand.id,
        title: s.title,
        sourceType: s.sourceType,
        publisher: s.publisher,
        url: url(spec.slug, s.path),
        publicationDate: d(s.publicationDate),
        accessedAt: d(spec.lastReviewedAt),
        verificationLevel: s.verificationLevel,
        // Held-back sources start in review so an earlier snapshot can be shown.
        status: holdBack.includes(s.key) ? "IN_REVIEW" : (s.status ?? "VERIFIED"),
        notes: s.notes ?? FICTIONAL_NOTE,
      },
    });
    sourceIds[s.key] = created.id;
  }

  for (const c of spec.claims) {
    const [specificityScore, evidenceScore, measurabilityScore, verificationScore, contextScore] =
      c.rubric ?? [null, null, null, null, null];
    const rubric = {
      specificityScore,
      evidenceScore,
      measurabilityScore,
      verificationScore,
      contextScore,
    };
    await prisma.claim.create({
      data: {
        brandId: brand.id,
        claimText: c.text,
        claimCategory: c.category,
        claimDate: c.date ? d(c.date) : null,
        ...rubric,
        ...deriveClaimRisk(rubric),
        methodologyNote: c.methodologyNote,
        verificationNote: c.verificationNote,
        reviewerNotes: c.reviewerNotes ?? FICTIONAL_NOTE,
        origin: c.origin ?? "manual",
        status: c.status,
        reviewedAt:
          c.status === "VERIFIED" || c.status === "PUBLISHED" ? d(spec.lastReviewedAt) : null,
        claimSources: {
          create: (c.evidence ?? []).map((e) => ({
            sourceId: sourceIds[e.source],
            evidenceExcerpt: e.excerpt,
            pageNumber: e.page,
            evidenceStrength: e.strength,
          })),
        },
      },
    });
  }

  for (const c of spec.certifications) {
    await prisma.certification.create({
      data: {
        brandId: brand.id,
        name: c.name,
        certificationBody: c.body,
        scope: c.scope,
        validFrom: d(c.validFrom),
        validTo: d(c.validTo),
        sourceId: c.source ? sourceIds[c.source] : null,
        verificationStatus: c.status,
      },
    });
  }

  for (const t of spec.targets) {
    await prisma.sustainabilityTarget.create({
      data: {
        brandId: brand.id,
        title: t.title,
        category: t.category,
        metric: t.metric,
        baselineValue: t.baseline?.[0],
        baselineYear: t.baseline?.[1],
        targetValue: t.target,
        targetYear: t.targetYear,
        latestProgress: t.progress?.[0],
        progressYear: t.progress?.[1],
        isSpecific: t.isSpecific,
        hasHistoricalData: t.hasHistoricalData,
        verificationStatus: t.status,
        sourceId: t.source ? sourceIds[t.source] : null,
      },
    });
  }

  for (const [topic, [state, level]] of Object.entries(spec.disclosure) as [
    DisclosureTopic,
    [MissingDataState, DisclosureLevel | null],
  ][]) {
    await prisma.disclosureItem.create({ data: { brandId: brand.id, topic, state, level } });
  }

  await prisma.accessibilityAudit.create({
    data: {
      brandId: brand.id,
      clickCount: spec.audit.clickCount,
      searchabilityScore: spec.audit.searchability,
      readabilityScore: spec.audit.readability,
      evidenceLinkageScore: spec.audit.evidenceLinkage,
      notes: spec.audit.notes,
      reviewedAt: d(spec.lastReviewedAt),
    },
  });

  return { brand, sourceIds };
}

async function main() {
  console.log("Seeding FICTIONAL development data…");
  await reset();

  await prisma.methodologyVersion.create({
    data: {
      version: METHODOLOGY_VERSION,
      title: "Green Transparency Methodology v1.0",
      description:
        "Initial methodology. Five transparency dimensions (Disclosure 25%, Evidence 25%, Verification 20%, Targets & Progress 15%, Accessibility 15%) and a five-component claim transparency risk model. Thresholds are project-defined methodological choices.",
      weightsJson: methodologyConfigSnapshot(),
      publishedAt: d("2026-10-05"),
      active: true,
    },
  });

  const industryIds: Record<string, string> = {};
  for (const i of INDUSTRIES) {
    industryIds[i.slug] = (await prisma.industry.create({ data: i })).id;
  }

  for (const spec of BRANDS) {
    if (spec.slug === "verdant-wear") {
      // Demonstrate score history: an earlier snapshot before the GHG assurance
      // statement was reviewed, then a new snapshot after it was verified.
      const { brand, sourceIds } = await seedBrand(spec, industryIds, ["assurance"]);
      const first = await recalculateBrandScore(brand.id, prisma, d("2026-05-02"));
      await prisma.source.update({
        where: { id: sourceIds.assurance },
        data: { status: "VERIFIED" },
      });
      const second = await recalculateBrandScore(brand.id, prisma, d(spec.lastReviewedAt));
      report(spec.name, first, second);
    } else {
      const { brand } = await seedBrand(spec, industryIds);
      report(spec.name, await recalculateBrandScore(brand.id, prisma, d(spec.lastReviewedAt)));
    }
  }

  const verdant = await prisma.brand.findUniqueOrThrow({ where: { slug: "verdant-wear" } });
  await prisma.researchStudy.create({
    data: {
      slug: "transparency-trust-pilot",
      title: "Green Claim Transparency and Brand Trust — Pilot",
      description:
        "Planned between-subjects pilot: participants see a fictional brand's green advertisement (control) or the same advertisement plus its Transparency Hub profile (treatment). No data has been collected.",
      consentText:
        "Participation is voluntary and anonymous. You may stop at any time. Only aggregated, anonymised results will be reported.",
      likertScale: 5,
      stimulusJson: {
        brandName: "Verdant Wear",
        headline: "Designed with the planet in mind.",
        body: "Our new outdoor collection is made with recycled materials and responsible partners, so you can explore further with a lighter footprint.",
        productDescription:
          "Verdant Wear Trail Shell jacket — waterproof, breathable, recycled polyester shell.",
      },
      debriefText:
        "Thank you. This study compares how people respond to a sustainability message with and without structured transparency information. Verdant Wear is a fictional brand created for this study, and all figures shown are invented. No personal data was collected.",
      status: "DRAFT",
      conditions: {
        create: [
          {
            key: "control",
            name: "Control — advertisement only",
            description: "Brand, green advertisement and product description.",
            brandId: verdant.id,
          },
          {
            key: "transparency_hub",
            name: "Transparency Hub condition",
            description: "Same advertisement plus the brand's Transparency Hub profile.",
            brandId: verdant.id,
          },
        ],
      },
    },
  });

  console.log("Done. All seeded data is fictional.");
}

function report(name: string, ...results: Awaited<ReturnType<typeof recalculateBrandScore>>[]) {
  for (const r of results) {
    if (r.ok) {
      console.log(
        `  ${name.padEnd(18)} overall ${r.snapshot.overallScore.toFixed(1).padStart(5)}  confidence ${r.snapshot.confidenceLevel}  (${r.snapshot.calculatedAt.toISOString().slice(0, 10)})`,
      );
    } else {
      console.log(`  ${name.padEnd(18)} not scored: ${r.reason}`);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
