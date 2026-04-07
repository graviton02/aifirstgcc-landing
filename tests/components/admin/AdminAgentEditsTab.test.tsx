import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AdminAgentEditsTab } from "@/components/admin/AdminAgentEditsTab";

const useQueryMock = vi.fn();
const useMutationMock = vi.fn();
const approveMock = vi.fn();
const rejectMock = vi.fn();

let mutationCall = 0;
let pendingResponse: unknown[] = [];

vi.mock("convex/react", () => ({
  useQuery: (...args: unknown[]) => useQueryMock(...args),
  useMutation: (...args: unknown[]) => useMutationMock(...args),
}));

describe("AdminAgentEditsTab", () => {
  beforeEach(() => {
    mutationCall = 0;
    pendingResponse = [];

    useQueryMock.mockReset();
    useMutationMock.mockReset();
    approveMock.mockReset();
    rejectMock.mockReset();

    useQueryMock.mockImplementation((_query: unknown, args?: unknown) => {
      if (args === "skip") {
        return [];
      }
      return pendingResponse;
    });

    useMutationMock.mockImplementation(() => {
      const fn = mutationCall % 2 === 0 ? approveMock : rejectMock;
      mutationCall += 1;
      return fn;
    });
  });

  it("renders readable before/after diffs for arrays and use cases", () => {
    pendingResponse = [
      {
        _id: "edit-1",
        agent_id: "agent-1",
        status: "pending",
        created_at: Date.now(),
        agent: {
          agent_name: "Acme Resolver",
          description: "Current agent description.",
          functional_categories: ["IT Operations"],
          integrations: ["Slack"],
          expected_outcomes: ["Faster triage"],
          use_cases: [
            {
              title: "Incident triage",
              description: "Routes incoming issues.",
            },
          ],
        },
        payload: {
          description: "Proposed updated agent description.",
          functional_categories: ["IT Operations", "Customer Support"],
          integrations: ["Slack", "ServiceNow"],
          expected_outcomes: ["Faster triage", "Lower backlog"],
          use_cases: [
            {
              title: "Incident triage",
              description: "Routes and prioritizes incidents.",
            },
            {
              title: "Escalation",
              description: "Escalates urgent cases.",
            },
          ],
        },
      },
    ];

    render(<AdminAgentEditsTab />);

    expect(screen.getByText(/5 fields changed/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /show changes/i }));

    expect(screen.getByText("Current agent description.")).toBeInTheDocument();
    expect(screen.getByText("Proposed updated agent description.")).toBeInTheDocument();
    expect(screen.getAllByText("Slack").length).toBeGreaterThan(0);
    expect(screen.getByText("ServiceNow")).toBeInTheDocument();
    expect(screen.getAllByText("Incident triage").length).toBeGreaterThan(0);
    expect(screen.getByText("Routes and prioritizes incidents.")).toBeInTheDocument();
    expect(screen.getByText("Escalation")).toBeInTheDocument();
    expect(screen.getByText("Escalates urgent cases.")).toBeInTheDocument();
    expect(screen.queryByText("[object Object]")).not.toBeInTheDocument();
  });

  it("keeps reject actions wired through the existing mutation", async () => {
    pendingResponse = [
      {
        _id: "edit-1",
        agent_id: "agent-1",
        status: "pending",
        created_at: Date.now(),
        agent: { agent_name: "Acme Resolver" },
        payload: { description: "Updated description" },
      },
    ];

    render(<AdminAgentEditsTab />);

    fireEvent.click(screen.getByTitle(/reject/i));
    fireEvent.change(screen.getByPlaceholderText(/reason for rejection/i), {
      target: { value: "Need more detail." },
    });
    fireEvent.click(screen.getByRole("button", { name: /confirm reject/i }));

    await waitFor(() =>
      expect(rejectMock).toHaveBeenCalledWith({
        edit_id: "edit-1",
        notes: "Need more detail.",
      })
    );
  });
});
