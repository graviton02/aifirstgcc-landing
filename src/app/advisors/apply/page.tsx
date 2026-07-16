import type { Metadata } from "next";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/sections/Footer";
import { Container } from "@/components/shared/Container";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { AdvisorApplyForm } from "@/components/advisors/AdvisorApplyForm";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://orbys360.com";
const PAGE_URL = `${BASE_URL}/advisors/apply`;

const TITLE = "Apply to the Orbys360 AI Advisor Network";
const DESCRIPTION =
  "Apply to be listed as an Orbys360 AI advisor. Get discovered by GCC leaders scoping AI strategy, engineering, data platform, and governance programs.";

export const metadata: Metadata = {
  title: `${TITLE} | Orbys360`,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: PAGE_URL,
    type: "website",
    siteName: "Orbys360",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function AdvisorApplyPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <section className="pt-28 pb-16 md:pb-24">
          <Container size="narrow">
            <div className="mb-8">
              <Breadcrumbs
                items={[
                  { label: "Home", href: "/" },
                  { label: "AI Advisors", href: "/advisors" },
                  { label: "Apply" },
                ]}
              />
            </div>
            <div className="max-w-2xl mb-8">
              <h1 className="font-newspaper text-4xl md:text-5xl font-bold text-enterprise-900 tracking-tight mb-4">
                Apply to the AI Advisor Network
              </h1>
              <p className="text-lg text-enterprise-600 leading-relaxed">
                Tell us about your background. Approved advisors get a profile on
                Orbys360 where GCC leaders scoping AI programs can find them. It
                takes about three minutes.
              </p>
            </div>
            <AdvisorApplyForm />
          </Container>
        </section>
      </main>
      <Footer />
    </>
  );
}
