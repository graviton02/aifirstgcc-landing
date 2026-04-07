import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const routerReplaceMock = vi.fn();
const setOnboardingPathMock = vi.fn();
const createCompanySubmissionMock = vi.fn();
const generateUploadUrlMock = vi.fn();
const fetchMock = vi.fn();
const createObjectUrlMock = vi.fn();
const revokeObjectUrlMock = vi.fn();

let queryCallIndex = 0;
let mutationCallIndex = 0;
let myCompanyValue: unknown = null;
let setupStateValue: unknown = null;
let mockUserRole = {
  role: "provider" as "provider" | "gcc" | null,
  isLoaded: true,
  providerSetupStarted: true,
};

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
    const slot = mutationCallIndex % 3;
    mutationCallIndex += 1;

    if (slot === 0) return setOnboardingPathMock;
    if (slot === 1) return createCompanySubmissionMock;
    return generateUploadUrlMock;
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
  useUserRole: () => mockUserRole,
}));

vi.mock("@/components/shared/Navbar", () => ({
  Navbar: () => <div>Navbar</div>,
}));

describe("ProviderSetupPage", () => {
  beforeEach(() => {
    queryCallIndex = 0;
    mutationCallIndex = 0;
    myCompanyValue = null;
    mockUserRole = {
      role: "provider",
      isLoaded: true,
      providerSetupStarted: true,
    };
    setupStateValue = {
      profile: { onboarding_path: "create_new" },
      claimRequest: null,
      companySubmission: null,
    };
    routerReplaceMock.mockReset();
    setOnboardingPathMock.mockReset();
    createCompanySubmissionMock.mockReset();
    generateUploadUrlMock.mockReset();
    fetchMock.mockReset();
    createObjectUrlMock.mockReset();
    revokeObjectUrlMock.mockReset();

    generateUploadUrlMock.mockResolvedValue("https://upload.example.com/logo");
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ storageId: "storage-logo-1" }),
    });
    createObjectUrlMock.mockReturnValue("blob:logo-preview");

    vi.stubGlobal("fetch", fetchMock);
    Object.defineProperty(globalThis.URL, "createObjectURL", {
      writable: true,
      value: createObjectUrlMock,
    });
    Object.defineProperty(globalThis.URL, "revokeObjectURL", {
      writable: true,
      value: revokeObjectUrlMock,
    });
  });

  it("blocks moving past the company step until a logo is selected", async () => {
    const Page = (await import("@/app/provider/setup/page")).default;
    render(<Page />);

    await fillCompanyStep({ withLogo: false });
    fireEvent.click(screen.getByRole("button", { name: /continue/i }));

    expect(
      screen.queryByRole("heading", { name: /add your first agent/i })
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /company information/i })
    ).toBeInTheDocument();
  });

  it("blocks submission when required first-agent fields are missing", async () => {
    const Page = (await import("@/app/provider/setup/page")).default;
    render(<Page />);

    await fillCompanyStep();
    fireEvent.click(screen.getByRole("button", { name: /^continue$/i }));

    expect(
      screen.getByRole("heading", { name: /add your first agent/i })
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /^continue$/i }));

    expect(createCompanySubmissionMock).not.toHaveBeenCalled();
    expect(
      screen.getByRole("heading", { name: /add your first agent/i })
    ).toBeInTheDocument();
  });

  it("rehydrates rejected company data including the submitted logo state", async () => {
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
        logo_storage_id: "storage-logo-1",
        logo_url: "https://cdn.example.com/queuepilot-logo.svg",
        logo_bg: "dark",
        primary_verticals: ["Technology", "Retail"],
        initial_agent: {
          agent_name: "QueuePilot Triage",
          tagline: "Handles ticket triage",
          description: "Routes and prioritizes incidents.",
          category: "IT Operations",
          functional_categories: ["IT Operations"],
          industry_categories: ["Technology"],
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
    expect(
      screen.getByLabelText(/use a dark background behind the logo/i)
    ).toBeChecked();

    fireEvent.click(screen.getByRole("button", { name: /^continue$/i }));

    expect(await screen.findByDisplayValue("QueuePilot Triage")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Handles ticket triage")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Incident triage")).toBeInTheDocument();
  });

  it("uploads the company logo and submits it with the company payload", async () => {
    const Page = (await import("@/app/provider/setup/page")).default;
    render(<Page />);

    await fillCompanyStep();
    fireEvent.click(screen.getByRole("button", { name: /^continue$/i }));

    fireEvent.change(await screen.findByLabelText(/agent name/i), {
      target: { value: "Acme Resolver" },
    });
    fireEvent.change(screen.getByLabelText(/tagline/i), {
      target: { value: "AI-powered IT resolution" },
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
    // Fill required tag fields (type + click Add)
    const addButtons = screen.getAllByRole("button", { name: /^add$/i });
    fireEvent.change(screen.getByPlaceholderText(/salesforce/i), {
      target: { value: "ServiceNow" },
    });
    fireEvent.click(addButtons[0]);
    fireEvent.change(screen.getByPlaceholderText(/reduction/i), {
      target: { value: "50% faster resolution" },
    });
    fireEvent.click(addButtons[1]);
    fireEvent.change(screen.getByLabelText(/product page url/i), {
      target: { value: "https://acme.ai/resolver" },
    });

    fireEvent.click(screen.getByRole("button", { name: /^continue$/i }));

    const reviewHint = await screen.findByText(
      /company approval creates your provider workspace/i
    );
    fireEvent.submit(reviewHint.closest("form")!);

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        "https://upload.example.com/logo",
        expect.objectContaining({ method: "POST" })
      )
    );

    await waitFor(() =>
      expect(createCompanySubmissionMock).toHaveBeenCalledWith(
        expect.objectContaining({
          company_name: "Acme AI Labs",
          logo_storage_id: "storage-logo-1",
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

  it("routes users without provider access or setup state back to onboarding", async () => {
    mockUserRole = {
      role: null,
      isLoaded: true,
      providerSetupStarted: false,
    };

    const Page = (await import("@/app/provider/setup/page")).default;
    render(<Page />);

    expect(routerReplaceMock).toHaveBeenCalledWith("/onboarding");
  });
});

async function fillCompanyStep({ withLogo = true }: { withLogo?: boolean } = {}) {
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
  fireEvent.change(screen.getByLabelText(/primary verticals/i), {
    target: { value: "Technology, Retail" },
  });
  fireEvent.change(screen.getByLabelText(/company description/i), {
    target: {
      value:
        "Acme builds enterprise AI systems for large operations and IT teams worldwide.",
    },
  });

  if (withLogo) {
    const logoFile = new File(["logo"], "acme-logo.svg", {
      type: "image/svg+xml",
    });
    fireEvent.change(screen.getByLabelText(/company logo/i), {
      target: { files: [logoFile] },
    });
  }
}
