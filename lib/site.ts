export const SITE = {
  name: "Green Brand Transparency Hub",
  shortName: "Transparency Hub",
  description:
    "Explore sustainability claims, inspect supporting evidence, and compare how transparently brands communicate environmental commitments.",
  subtitle:
    "A Digital Platform for Evaluating Evidence Transparency in Sustainability Marketing Communication",
};

export const NAV_ITEMS = [
  { href: "/brands", label: "Brands" },
  { href: "/compare", label: "Compare" },
  { href: "/claim-checker", label: "Claim Checker" },
  { href: "/methodology", label: "Methodology" },
  { href: "/research", label: "Research" },
  { href: "/about", label: "About" },
] as const;

export const DISCLAIMER = {
  short:
    "Green Brand Transparency Hub evaluates the transparency and verifiability of publicly available sustainability communications.",
  long: "Scores do not represent a comprehensive assessment of environmental performance and should not be interpreted as certification or a definitive judgement of a brand's sustainability.",
};
