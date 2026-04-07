import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const useQueryMock = vi.fn();
const useMutationMock = vi.fn();
const useAuthMock = vi.fn();
const useUserRoleMock = vi.fn();
const createContactRequestMock = vi.fn();
let queryInvocation = 0;

let gccProfileMock: Record<string, string> | null = null;
let existingRequestMock:
  | {
      status: "pending_admin" | "approved" | "contacted";
    }
  | null
  | undefined = null;

vi.mock("convex/react", () => ({
  useQuery: (...args: unknown[]) => useQueryMock(...args),
  useMutation: (...args: unknown[]) => useMutationMock(...args),
}));

vi.mock("@clerk/nextjs", () => ({
  useAuth: () => useAuthMock(),
}));

vi.mock("@/auth/useUserRole", () => ({
  useUserRole: () => useUserRoleMock(),
}));

describe("ReachoutRequestButton", () => {
  beforeEach(() => {
    useQueryMock.mockReset();
    useMutationMock.mockReset();
    useAuthMock.mockReset();
    useUserRoleMock.mockReset();
    createContactRequestMock.mockReset();
    queryInvocation = 0;

    gccProfileMock = {
      name: "Priya Sharma",
      email: "priya@gcc.example",
      organization: "Global Capability Center",
      industry: "Financial Services (BFSI)",
    };
    existingRequestMock = null;

    useAuthMock.mockReturnValue({ isSignedIn: true, isLoaded: true });
    useUserRoleMock.mockReturnValue({ role: "gcc", isLoaded: true });
    useMutationMock.mockReturnValue(createContactRequestMock);
    createContactRequestMock.mockResolvedValue("request-1");

    useQueryMock.mockImplementation((_reference: unknown, args: unknown) => {
      queryInvocation += 1;

      if (args === "skip") {
        return undefined;
      }

      if (queryInvocation % 2 === 1) {
        return gccProfileMock;
      }

      return existingRequestMock;
    });
  });

  it("keeps unmanaged listings on the direct external contact flow", async () => {
    const { ReachoutRequestButton } = await import(
      "@/components/reachout/ReachoutRequestButton"
    );

    render(
      <ReachoutRequestButton
        company={{
          _id: "company-1",
          name: "Acme Systems",
          website: "https://acme.example.com",
          contact_email: "hello@acme.example.com",
          claim_status: "unclaimed",
        }}
        agents={[]}
        requestSource="company_profile"
        managedLabel="Contact Company"
        className="inline-flex"
      />
    );

    expect(
      screen.getByRole("link", { name: /email company/i })
    ).toHaveAttribute("href", "mailto:hello@acme.example.com");
  });

  it("requires agent selection on company pages when multiple active agents exist", async () => {
    const { ReachoutRequestButton } = await import(
      "@/components/reachout/ReachoutRequestButton"
    );

    render(
      <ReachoutRequestButton
        company={{
          _id: "company-1",
          name: "Acme Systems",
          website: "https://acme.example.com",
          claim_status: "claimed",
        }}
        agents={[
          { _id: "agent-1", agent_name: "Agent One", status: "active" },
          { _id: "agent-2", agent_name: "Agent Two", status: "active" },
        ]}
        requestSource="company_profile"
        managedLabel="Contact Company"
        className="inline-flex"
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /contact company/i }));

    expect(screen.getByRole("combobox", { name: /agent/i })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /tell us what you need/i })
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/primary use case/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/current challenge/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/expected outcome/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/timeline/i)).toBeInTheDocument();
    expect(document.body.style.overflow).toBe("hidden");
    expect(document.documentElement.style.overflow).toBe("hidden");

    fireEvent.click(
      screen.getByRole("button", { name: /close reachout request dialog/i })
    );

    await waitFor(() => {
      expect(document.body.style.overflow).toBe("");
      expect(document.documentElement.style.overflow).toBe("");
    });
  });

  it("submits the structured GCC reachout form for single-agent owned listings", async () => {
    const { ReachoutRequestButton } = await import(
      "@/components/reachout/ReachoutRequestButton"
    );

    render(
      <ReachoutRequestButton
        company={{
          _id: "company-1",
          name: "Acme Systems",
          website: "https://acme.example.com",
          claim_status: "claimed",
        }}
        agents={[{ _id: "agent-1", agent_name: "Agent One", status: "active" }]}
        requestSource="agent_detail"
        managedLabel="Contact Provider"
        className="inline-flex"
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /contact provider/i }));

    expect(
      screen.queryByRole("combobox", { name: /agent/i })
    ).not.toBeInTheDocument();
    expect(screen.getByLabelText(/primary use case/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/current challenge/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/expected outcome/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/timeline/i)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/primary use case/i), {
      target: { value: "Automate finance approvals" },
    });
    fireEvent.change(screen.getByLabelText(/current challenge/i), {
      target: {
        value: "Approvals still move through email and shared spreadsheets today.",
      },
    });
    fireEvent.change(screen.getByLabelText(/expected outcome/i), {
      target: {
        value: "Improve cycle time and give finance leaders clearer approval visibility.",
      },
    });
    fireEvent.change(screen.getByLabelText(/timeline/i), {
      target: { value: "Need to move this quarter" },
    });

    fireEvent.click(screen.getByRole("button", { name: /send request/i }));

    await waitFor(() =>
      expect(createContactRequestMock).toHaveBeenCalledWith({
        agent_id: "agent-1",
        use_case: "Automate finance approvals",
        current_challenge:
          "Approvals still move through email and shared spreadsheets today.",
        expected_outcome:
          "Improve cycle time and give finance leaders clearer approval visibility.",
        timeline: "Need to move this quarter",
        request_source: "agent_detail",
      })
    );

    await waitFor(() =>
      expect(screen.getByText(/request sent/i)).toBeInTheDocument()
    );
  });

  it.each([
    ["pending_admin", "Request Submitted"],
    ["approved", "Awaiting Provider Follow-up"],
    ["contacted", "Provider Contacted"],
  ] as const)(
    "shows GCC request status instead of reopening the managed form when status is %s",
    async (status, label) => {
      existingRequestMock = { status };

      const { ReachoutRequestButton } = await import(
        "@/components/reachout/ReachoutRequestButton"
      );

      render(
        <ReachoutRequestButton
          company={{
            _id: "company-1",
            name: "Acme Systems",
            website: "https://acme.example.com",
            claim_status: "claimed",
          }}
          agents={[{ _id: "agent-1", agent_name: "Agent One", status: "active" }]}
          requestSource="agent_detail"
          managedLabel="Contact Provider"
          className="inline-flex"
        />
      );

      expect(screen.getByText(label)).toBeInTheDocument();
      expect(
        screen.getByRole("link", { name: /view request status/i })
      ).toHaveAttribute("href", "/gcc-dashboard?tab=current-requests");
      expect(
        screen.queryByRole("button", { name: /contact provider/i })
      ).not.toBeInTheDocument();
    }
  );
});
