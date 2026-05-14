import type { ReactNode } from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const createJobMock = vi.fn();
const replaceMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock }),
}));

vi.mock("convex/react", () => ({
  useMutation: () => createJobMock,
}));

vi.mock("@/components/shared/AnimatedSection", () => ({
  AnimatedSection: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

afterEach(() => {
  cleanup();
  createJobMock.mockReset();
  replaceMock.mockReset();
});

function fillRequiredFields() {
  fireEvent.change(screen.getByLabelText(/Job title/i), {
    target: { value: "AI Engineer" },
  });
  fireEvent.change(screen.getByLabelText(/Company name/i), {
    target: { value: "Acme" },
  });
  fireEvent.change(screen.getByLabelText(/Location/i), {
    target: { value: "Remote" },
  });
  fireEvent.change(screen.getByLabelText(/Description/i), {
    target: { value: "Build production AI systems." },
  });
}

describe("JobPostForm compensation", () => {
  it("marks compensation optional and submits without salary fields when blank", async () => {
    createJobMock.mockResolvedValue({});
    const { JobPostForm } = await import("@/components/jobs/JobPostForm");

    render(<JobPostForm />);
    fillRequiredFields();

    expect(screen.getByText(/Leave the range blank/i)).toBeInTheDocument();
    expect(screen.getByText("Optional")).toBeInTheDocument();
    expect(screen.getByLabelText(/Salary type/i)).toBeDisabled();
    expect(screen.getByLabelText(/Currency/i)).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: /Submit for review/i }));

    await waitFor(() => expect(createJobMock).toHaveBeenCalledTimes(1));
    const payload = createJobMock.mock.calls[0][0];
    expect(payload).not.toHaveProperty("salary_min");
    expect(payload).not.toHaveProperty("salary_max");
    expect(payload).not.toHaveProperty("salary_type");
    expect(payload).not.toHaveProperty("salary_currency");
  });

  it("requires both salary min and salary max when compensation is provided", async () => {
    const { JobPostForm } = await import("@/components/jobs/JobPostForm");

    render(<JobPostForm />);
    fillRequiredFields();
    fireEvent.change(screen.getByLabelText(/Salary min/i), {
      target: { value: "100000" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Submit for review/i }));

    expect(
      screen.getByText(/Enter both salary min and salary max/i)
    ).toBeInTheDocument();
    expect(createJobMock).not.toHaveBeenCalled();
  });

  it("submits salary fields when a complete range is provided", async () => {
    createJobMock.mockResolvedValue({});
    const { JobPostForm } = await import("@/components/jobs/JobPostForm");

    render(<JobPostForm />);
    fillRequiredFields();
    fireEvent.change(screen.getByLabelText(/Salary min/i), {
      target: { value: "100000" },
    });
    fireEvent.change(screen.getByLabelText(/Salary max/i), {
      target: { value: "150000" },
    });

    expect(screen.getByLabelText(/Salary type/i)).not.toBeDisabled();
    expect(screen.getByLabelText(/Currency/i)).not.toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: /Submit for review/i }));

    await waitFor(() => expect(createJobMock).toHaveBeenCalledTimes(1));
    expect(createJobMock.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        salary_min: 100000,
        salary_max: 150000,
        salary_type: "annual",
        salary_currency: "USD",
      })
    );
  });
});
