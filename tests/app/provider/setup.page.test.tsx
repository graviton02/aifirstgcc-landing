import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const routerReplaceMock = vi.fn();
const setOnboardingPathMock = vi.fn();
const createCompanySubmissionMock = vi.fn();

let queryCallIndex = 0;
let mutationCallIndex = 0;
let myCompanyValue: unknown = null;
let setupStateValue: unknown = null;

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: routerReplaceMock }),
}));

vi.mock("convex/react", () => ({
  useQuery: () => {
    const result = queryCallIndex % 2 === 0 ? myCompanyValue : setupStateValue;
    queryCallIndex += 1;
    return result;
  },
  useMutation: () => {
    const result =
      mutationCallIndex % 2 === 0
        ? setOnboardingPathMock
        : createCompanySubmissionMock;
    mutationCallIndex += 1;
    return result;
  },
}));

vi.mock("@clerk/nextjs", () => ({
  useUser: () => ({
    user: {
      primaryEmailAddress: {
        emailAddress: "owner@acme.ai",
      },
    },
  }),
}));

vi.mock("@/auth/useUserRole", () => ({
  useUserRole: () => ({ role: "provider", isLoaded: true }),
}));

vi.mock("@/components/shared/Navbar", () => ({
  Navbar: () => <div>Navbar</div>,
}));

describe("ProviderSetupPage", () => {
  beforeEach(() => {
    queryCallIndex = 0;
    mutationCallIndex = 0;
    myCompanyValue = null;
    setupStateValue = {
      profile: { onboarding_path: "create_new" },
      claimRequest: null,
      companySubmission: null,
    };
    routerReplaceMock.mockReset();
    setOnboardingPathMock.mockReset();
    createCompanySubmissionMock.mockReset();
  });

  it("blocks submission when required first-agent fields are missing", async () => {
    const Page = (await import("@/app/provider/setup/page")).default;
    render(<Page />);

    await fillCompanyStep();
    fireEvent.click(screen.getByRole("button", { name: /continue to first agent/i }));

    expect(
      screen.getByRole("heading", { name: /add the first agent you want reviewed/i })
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /submit for review/i }));

    expect(createCompanySubmissionMock).not.toHaveBeenCalled();
    expect(
      screen.getByRole("heading", { name: /add the first agent you want reviewed/i })
    ).toBeInTheDocument();
  });

  it("rehydrates rejected company and initial-agent data", async () => {
    setupStateValue = {
      profile: { onboarding_path: "create_new" },
      claimRequest: null,
      companySubmission: {
        _id: "submission-1",
        status: "rejected",
        admin_notes: "Please refine the details.",
        contact_email: "founder@queuepilot.ai",
        company_name: "QueuePilot AI",
        website: "https://queuepilot.ai",
        description: "QueuePilot builds copilots for IT operations teams.",
        headquarters: "Bengaluru, India",
        company_size: "51-200 employees",
        primary_verticals: ["Technology", "Retail"],
        initial_agent: {
          agent_name: "QueuePilot Triage",
          tagline: "Handles ticket triage",
          description: "Routes and prioritizes incidents.",
          category: "IT Operations",
          functional_categories: ["IT Operations"],
          industry_categories: ["Technology"],
          infrastructure_categories: ["Cloud"],
          use_cases: [{ title: "Incident triage", description: "Prioritize new issues" }],
          integrations: ["ServiceNow"],
          expected_outcomes: ["Lower backlog"],
          source_url: "https://queuepilot.ai/source",
          demo_url: "https://queuepilot.ai/demo",
        },
      },
    };

    const Page = (await import("@/app/provider/setup/page")).default;
    render(<Page />);

    expect(screen.getByDisplayValue("QueuePilot AI")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Technology, Retail")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /continue to first agent/i }));

    expect(screen.getByDisplayValue("QueuePilot Triage")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Handles ticket triage")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Incident triage")).toBeInTheDocument();
  });

  it("submits company and first agent together when all required fields are present", async () => {
    const Page = (await import("@/app/provider/setup/page")).default;
    render(<Page />);

    await fillCompanyStep();
    fireEvent.click(screen.getByRole("button", { name: /continue to first agent/i }));

    fireEvent.change(screen.getByLabelText(/agent name/i), {
      target: { value: "Acme Resolver" },
    });
    fireEvent.change(screen.getByLabelText(/^category/i), {
      target: { value: "IT Operations" },
    });
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: "Resolves IT incidents using routing and automation." },
    });
    fireEvent.click(screen.getByRole("button", { name: "IT Operations" }));
    fireEvent.click(screen.getByRole("button", { name: "Technology" }));
    fireEvent.change(screen.getByPlaceholderText("Title"), {
      target: { value: "Incident triage" },
    });

    fireEvent.click(screen.getByRole("button", { name: /submit for review/i }));

    await waitFor(() =>
      expect(createCompanySubmissionMock).toHaveBeenCalledWith(
        expect.objectContaining({
          company_name: "Acme AI Labs",
          initial_agent: expect.objectContaining({
            agent_name: "Acme Resolver",
            category: "IT Operations",
            functional_categories: ["IT Operations"],
            industry_categories: ["Technology"],
            use_cases: [{ title: "Incident triage", description: "" }],
          }),
        })
      )
    );
  });
});

async function fillCompanyStep() {
  fireEvent.change(await screen.findByLabelText(/contact email/i), {
    target: { value: "owner@acme.ai" },
  });
  fireEvent.change(await screen.findByLabelText(/company name/i), {
    target: { value: "Acme AI Labs" },
  });
  fireEvent.change(screen.getByLabelText(/website/i), {
    target: { value: "https://acme.ai" },
  });
  fireEvent.change(screen.getByLabelText(/headquarters/i), {
    target: { value: "Bengaluru, India" },
  });
  fireEvent.change(screen.getByLabelText(/company size/i), {
    target: { value: "51-200 employees" },
  });
  fireEvent.change(screen.getByLabelText(/primary verticals/i), {
    target: { value: "Technology, Retail" },
  });
  fireEvent.change(screen.getByLabelText(/company description/i), {
    target: {
      value:
        "Acme builds enterprise AI systems for large operations and IT teams worldwide.",
    },
  });
}
