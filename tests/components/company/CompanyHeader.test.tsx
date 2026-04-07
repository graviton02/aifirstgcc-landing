import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/components/directory/CompanyLogo", () => ({
  CompanyLogo: () => <div>Company Logo</div>,
}));

vi.mock("@/components/reachout/ReachoutRequestButton", () => ({
  ReachoutRequestButton: () => <button type="button">Contact Company</button>,
}));

describe("CompanyHeader", () => {
  it("shows public company metadata without exposing the contact email", async () => {
    const { CompanyHeader } = await import("@/components/company/CompanyHeader");

    render(
      <CompanyHeader
        company={
          {
            _id: "company-1",
            slug: "acme-ai",
            name: "Acme AI",
            description: "Builds AI systems for enterprise operations teams.",
            website: "https://acme.example.com",
            headquarters: "Bengaluru, India",
            primary_verticals: ["Technology", "Retail"],
            claim_status: "claimed",
            verification_status: "verified",
            contact_email: "hello@acme.example.com",
          } as any
        }
      />
    );

    expect(screen.getByText("Technology")).toBeInTheDocument();
    expect(screen.getByText("Retail")).toBeInTheDocument();
    expect(screen.queryByText("hello@acme.example.com")).not.toBeInTheDocument();
  });
});
