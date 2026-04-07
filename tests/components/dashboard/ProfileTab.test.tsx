import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const useQueryMock = vi.fn();
const useMutationMock = vi.fn();
const createEditMock = vi.fn();
const generateUploadUrlMock = vi.fn();
const fetchMock = vi.fn();
const createObjectUrlMock = vi.fn();
const revokeObjectUrlMock = vi.fn();

let mutationCallIndex = 0;

vi.mock("convex/react", () => ({
  useQuery: (...args: unknown[]) => useQueryMock(...args),
  useMutation: (...args: unknown[]) => useMutationMock(...args),
}));

vi.mock("@/components/directory/CompanyLogo", () => ({
  CompanyLogo: () => <div>Company Logo</div>,
}));

describe("Provider ProfileTab", () => {
  beforeEach(() => {
    mutationCallIndex = 0;
    useQueryMock.mockReset();
    useMutationMock.mockReset();
    createEditMock.mockReset();
    generateUploadUrlMock.mockReset();
    fetchMock.mockReset();
    createObjectUrlMock.mockReset();
    revokeObjectUrlMock.mockReset();

    useQueryMock.mockReturnValue({
      _id: "company-1",
      name: "Acme AI",
      description: "Builds AI systems for enterprise operations teams.",
      website: "https://acme.example.com",
      headquarters: "Bengaluru, India",
      primary_verticals: ["Technology", "Retail"],
      contact_email: "hello@acme.example.com",
      logo_url: "https://cdn.example.com/acme-logo.svg",
      logo_bg: undefined,
    });

    useMutationMock.mockImplementation(() => {
      const fn = mutationCallIndex % 2 === 0 ? createEditMock : generateUploadUrlMock;
      mutationCallIndex += 1;
      return fn;
    });

    generateUploadUrlMock.mockResolvedValue("https://upload.example.com/logo");
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ storageId: "storage-logo-2" }),
    });
    createObjectUrlMock.mockReturnValue("blob:new-logo-preview");

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

  it("shows read-only company metadata collected during setup", async () => {
    const { ProfileTab } = await import("@/components/dashboard/ProfileTab");

    render(<ProfileTab />);

    expect(
      screen.getByRole("link", { name: "hello@acme.example.com" })
    ).toHaveAttribute("href", "mailto:hello@acme.example.com");
    expect(screen.getByText("Technology")).toBeInTheDocument();
    expect(screen.getByText("Retail")).toBeInTheDocument();
  });

  it("uploads a replacement logo and submits it as a company edit", async () => {
    const { ProfileTab } = await import("@/components/dashboard/ProfileTab");

    render(<ProfileTab />);

    fireEvent.click(screen.getByRole("button", { name: /edit/i }));
    fireEvent.change(screen.getByLabelText(/company logo/i), {
      target: {
        files: [
          new File(["logo"], "replacement-logo.svg", {
            type: "image/svg+xml",
          }),
        ],
      },
    });
    fireEvent.click(
      screen.getByLabelText(/use a dark background behind the logo/i)
    );
    fireEvent.click(
      screen.getByRole("button", { name: /submit changes for review/i })
    );

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        "https://upload.example.com/logo",
        expect.objectContaining({ method: "POST" })
      )
    );

    await waitFor(() =>
      expect(createEditMock).toHaveBeenCalledWith({
        company_id: "company-1",
        payload: expect.objectContaining({
          logo_storage_id: "storage-logo-2",
          logo_bg: "dark",
        }),
      })
    );
  });
});
