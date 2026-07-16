import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/sections/Footer";
import { Container } from "@/components/shared/Container";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://orbys360.com";

export const metadata: Metadata = {
  title: "Application received | Orbys360 AI Advisor Network",
  description:
    "Thanks for applying to the Orbys360 AI Advisor Network. Your application is in review.",
  alternates: { canonical: `${BASE_URL}/advisors/apply/success` },
  // Conversion-confirmation page — keep it out of the index.
  robots: { index: false, follow: false },
};

export default function AdvisorApplySuccessPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center">
        <section className="w-full py-28">
          <Container size="narrow">
            <div className="max-w-xl mx-auto bg-white rounded-2xl border border-enterprise-200 p-8 md:p-10 shadow-sm text-center">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-7 h-7 text-green-600" />
              </div>
              <h1 className="font-newspaper text-3xl md:text-4xl font-bold text-enterprise-900 mb-3">
                Application received
              </h1>
              <p className="text-enterprise-600 leading-relaxed mb-2">
                Thanks for applying to the Orbys360 AI Advisor Network. We&rsquo;ve
                sent a confirmation to your email.
              </p>
              <p className="text-enterprise-600 leading-relaxed mb-8">
                Our team vets each applicant. If your background is a fit,
                we&rsquo;ll be in touch before your profile goes live.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/"
                  className="w-full sm:w-auto px-5 py-2.5 bg-enterprise-900 text-white rounded-lg font-medium hover:bg-enterprise-800 transition-colors"
                >
                  Back to home
                </Link>
                <Link
                  href="/directory"
                  className="w-full sm:w-auto px-5 py-2.5 border border-enterprise-300 text-enterprise-700 rounded-lg font-medium hover:bg-enterprise-50 transition-colors"
                >
                  Explore the directory
                </Link>
              </div>
            </div>
          </Container>
        </section>
      </main>
      <Footer />
    </>
  );
}
