import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

vi.mock("@clerk/nextjs", () => ({
  useAuth: () => ({ isSignedIn: false }),
}));

describe("GatedSection (anonymous)", () => {
  it("shows sign-up prompt when not signed in", async () => {
    const { GatedSection } = await import("@/components/agent-detail/GatedSection");
    render(
      <GatedSection title="Use Cases" count={4}>
        <p>Hidden content</p>
      </GatedSection>
    );
    expect(screen.getByText(/free account/i)).toBeInTheDocument();
  });
});
