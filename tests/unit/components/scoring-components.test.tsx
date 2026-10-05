import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { RiskBadge } from "@/components/scoring/badges";
import { ScoreDisplay, ScoreMeter } from "@/components/scoring/score-display";

describe("ScoreDisplay", () => {
  it("renders a rounded score out of 100 with an accessible label", () => {
    render(<ScoreDisplay score={81.5} />);
    expect(screen.getByLabelText("Green Transparency Score 82 out of 100")).toBeInTheDocument();
  });

  it("shows an explicit not-yet-scored state instead of 0", () => {
    render(<ScoreDisplay score={null} />);
    expect(screen.getByText("Not yet scored")).toBeInTheDocument();
    expect(screen.queryByText("0")).not.toBeInTheDocument();
  });
});

describe("ScoreMeter", () => {
  it("exposes meter semantics and a pending state", () => {
    render(<ScoreMeter value={null} label="Evidence Quality" />);
    const meter = screen.getByRole("meter", { name: "Evidence Quality" });
    expect(meter).toHaveAttribute("aria-valuetext", "Not yet calculated");
  });
});

describe("RiskBadge", () => {
  it("labels risk with text, not colour alone", () => {
    render(<RiskBadge level="HIGH" score={81} />);
    expect(screen.getByText(/High/)).toBeInTheDocument();
    expect(screen.getByText(/81/)).toBeInTheDocument();
  });

  it("renders a pending state when risk is not calculated", () => {
    render(<RiskBadge level={null} />);
    expect(screen.getByText("Risk pending review")).toBeInTheDocument();
  });
});
