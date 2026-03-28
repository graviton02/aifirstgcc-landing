import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AgentsTab } from "@/components/dashboard/AgentsTab";

const useQueryMock = vi.fn();
const useMutationMock = vi.fn();
const mutationFn = vi.fn();

let queryResults: unknown[] = [];
let queryCall = 0;

vi.mock("convex/react", () => ({
  useQuery: (...args: unknown[]) => useQueryMock(...args),
  useMutation: (...args: unknown[]) => useMutationMock(...args),
}));

describe("AgentsTab", () => {
  beforeEach(() => {
    queryCall = 0;
    queryResults = [[], [], []];

    useQueryMock.mockReset();
    useMutationMock.mockReset();
    mutationFn.mockReset();
    mutationFn.mockResolvedValue(undefined);

    useQueryMock.mockImplementation(() => {
      const result = queryResults[queryCall % queryResults.length];
      queryCall += 1;
      return result;
    });

    useMutationMock.mockImplementation(() => mutationFn);
  });

  it("shows pending submissions when no active agents are live yet", () => {
    queryResults = [
      [],
      [
        {
          _id: "submission-1",
          company_id: "company-1",
          agent_name: "Acme Resolver",
          description: "Pending review.",
          submission_status: "pending",
          created_at: Date.now(),
        },
      ],
      [],
    ];

    render(<AgentsTab companyId="company-1" />);

    expect(screen.getByText("Pending Agent Submissions")).toBeInTheDocument();
    expect(screen.getByText("Acme Resolver")).toBeInTheDocument();
    expect(
      screen.getByText(/pending submissions will appear here once approved/i)
    ).toBeInTheDocument();
  });

  it("only shows revise controls for submissions with requested changes", () => {
    queryResults = [
      [],
      [
        {
          _id: "submission-1",
          company_id: "company-1",
          agent_name: "Needs Revision",
          description: "Admin asked for changes.",
          submission_status: "changes_requested",
          admin_notes: "Please tighten the use case.",
          created_at: Date.now(),
        },
        {
          _id: "submission-2",
          company_id: "company-1",
          agent_name: "Still Pending",
          description: "Waiting on first review.",
          submission_status: "pending",
          created_at: Date.now(),
        },
        {
          _id: "submission-3",
          company_id: "company-1",
          agent_name: "Rejected Agent",
          description: "Rejected by admin.",
          submission_status: "rejected",
          created_at: Date.now(),
        },
      ],
      [],
    ];

    render(<AgentsTab companyId="company-1" />);

    expect(
      screen.getByRole("button", { name: /revise submission/i })
    ).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /revise submission/i })).toHaveLength(1);
  });

  it("prefills the resubmission form with admin notes and allows successful resubmission", async () => {
    queryResults = [
      [],
      [
        {
          _id: "submission-1",
          company_id: "company-1",
          agent_name: "Acme Resolver",
          tagline: "Routes incidents",
          description: "Admin asked for more detail.",
          category: "Operations",
          use_cases: [{ title: "Routing", description: "Legacy routing copy." }],
          functional_categories: ["IT Operations"],
          industry_categories: ["Technology"],
          integrations: ["ServiceNow"],
          expected_outcomes: ["Faster triage"],
          source_url: "https://example.com/source",
          demo_url: "https://example.com/demo",
          submission_status: "changes_requested",
          admin_notes: "Please expand the description and use case.",
          created_at: Date.now(),
        },
      ],
      [],
    ];

    render(<AgentsTab companyId="company-1" />);

    fireEvent.click(screen.getByRole("button", { name: /revise submission/i }));

    expect(screen.getByText(/please expand the description and use case\./i)).toBeInTheDocument();
    expect(screen.getByDisplayValue("Acme Resolver")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: "Expanded description for admin review." },
    });

    fireEvent.submit(
      screen
        .getByRole("button", { name: /resubmit for review/i })
        .closest("form")!
    );

    await waitFor(() =>
      expect(mutationFn).toHaveBeenCalledWith(
        expect.objectContaining({
          submission_id: "submission-1",
          description: "Expanded description for admin review.",
        })
      )
    );

    await waitFor(() =>
      expect(
        screen.getByText(/changes resubmitted for admin review\./i)
      ).toBeInTheDocument()
    );
  });
});
