import { describe, expect, it } from "vitest";
import { advisorConfirmationEmail } from "../../convex/emails/advisorConfirmation";

describe("advisorConfirmationEmail", () => {
  it("greets the applicant and confirms the application is in review", () => {
    const email = advisorConfirmationEmail({ recipientName: "Ada Okafor" });

    expect(email.subject).toContain("AI Advisor");
    expect(email.html).toContain("Hi Ada Okafor,");
    expect(email.html).toContain("AI Advisor Network");
    expect(email.html).toContain("team@orbys360.com");
  });

  it("escapes HTML in the recipient name", () => {
    const email = advisorConfirmationEmail({
      recipientName: "<script>alert(1)</script>",
    });

    expect(email.html).not.toContain("<script>alert(1)</script>");
    expect(email.html).toContain("&lt;script&gt;");
  });
});
