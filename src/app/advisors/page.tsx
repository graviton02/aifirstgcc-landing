import type { Metadata } from "next";
import Link from "next/link";
import {
  Sparkles,
  Search,
  ShieldCheck,
  Radar,
  Inbox,
  Award,
  Brain,
  Cpu,
  Database,
  Scale,
  ArrowRight,
} from "lucide-react";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/sections/Footer";
import { Container } from "@/components/shared/Container";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { AdvisorApplyForm } from "@/components/advisors/AdvisorApplyForm";
import { breadcrumbJsonLd, serializeJsonLd } from "@/lib/json-ld";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://orbys360.com";
const PAGE_URL = `${BASE_URL}/advisors`;

const TITLE = "AI Advisor Network for GCC Leaders";
const DESCRIPTION =
  "Join the Orbys360 AI Advisor Network. Experienced AI practitioners get discovered by GCC leaders scoping AI strategy, engineering, data platform, and governance programs.";

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

const HOW_IT_WORKS = [
  {
    icon: Search,
    title: "Apply",
    body: "Tell us about your AI experience and what you advise on. Takes about three minutes.",
  },
  {
    icon: ShieldCheck,
    title: "Get vetted",
    body: "Our team reviews every applicant to keep the network senior and credible.",
  },
  {
    icon: Sparkles,
    title: "Profile goes live",
    body: "Approved advisors get a profile on Orbys360 where GCC leaders can find them.",
  },
];

const BENEFITS = [
  {
    icon: Radar,
    title: "Visibility with GCC buyers",
    body: "Get in front of the GCC leaders actively scoping AI programs across the region.",
  },
  {
    icon: Inbox,
    title: "Inbound advisory leads",
    body: "Let the right engagements come to you instead of chasing every opportunity.",
  },
  {
    icon: Award,
    title: "Founding-cohort badge",
    body: "Early advisors are marked as founding members — a signal that compounds over time.",
  },
];

const LOOKING_FOR = [
  {
    icon: Brain,
    title: "AI strategy",
    body: "Leaders who help organizations decide where and how to deploy AI for real outcomes.",
  },
  {
    icon: Cpu,
    title: "ML / GenAI engineering leadership",
    body: "Hands-on leaders who have shipped and scaled ML and generative AI systems.",
  },
  {
    icon: Database,
    title: "Data platforms",
    body: "Practitioners who have built the data foundations that make AI programs work.",
  },
  {
    icon: Scale,
    title: "AI governance",
    body: "Experts in AI risk, safety, and governance for regulated, enterprise environments.",
  },
];

const FAQ = [
  {
    q: "Who is this for?",
    a: "Experienced AI practitioners — strategy leaders, ML/GenAI engineering leaders, data platform builders, and AI governance experts — who advise organizations building AI capability.",
  },
  {
    q: "Does it cost anything to apply?",
    a: "No. Applying to the founding cohort is free. We review every application and reach out to approved advisors before their profile goes live.",
  },
  {
    q: "Can I apply with a personal email?",
    a: "Yes. Independent consultants and fractional leaders are welcome to apply with a personal email address.",
  },
  {
    q: "What happens after I apply?",
    a: "You'll get a confirmation email, and our team will review your background. If it's a fit, we'll be in touch to confirm details and bring your profile live.",
  },
  {
    q: "When do profiles go live?",
    a: "The public advisor directory is rolling out shortly. Founding-cohort applicants are reviewed and onboarded first.",
  },
];

const breadcrumbs = breadcrumbJsonLd([
  { name: "Home", url: BASE_URL },
  { name: "AI Advisors", url: PAGE_URL },
]);

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

export default function AdvisorsPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        {/* Hero */}
        <section className="relative bg-enterprise-950 overflow-hidden pt-28 pb-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_30%,rgba(99,102,241,0.18),transparent_55%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_70%,rgba(168,85,247,0.14),transparent_55%)]" />
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />
          <Container className="relative z-10">
            <div className="text-white/80 mb-8">
              <Breadcrumbs
                items={[{ label: "Home", href: "/" }, { label: "AI Advisors" }]}
              />
            </div>
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.16em] uppercase text-purple-300 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full mb-6">
                <Sparkles className="w-3.5 h-3.5" />
                AI Advisor Network · Founding Cohort
              </div>
              <h1 className="font-newspaper text-4xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight mb-5">
                Get discovered by GCC leaders scoping AI programs
              </h1>
              <p className="text-lg md:text-2xl text-white/80 leading-snug mb-8">
                Orbys360 is building a vetted network of AI advisors. Apply once,
                and the GCC leaders shaping AI strategy, engineering, and
                governance can find you.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/advisors/apply"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-enterprise-950 rounded-lg font-semibold hover:bg-white/90 transition-colors"
                >
                  Apply to the network
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-white/20 text-white rounded-lg font-semibold hover:bg-white/5 transition-colors"
                >
                  How it works
                </a>
              </div>
            </div>
          </Container>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="py-16 md:py-24 scroll-mt-24">
          <Container>
            <div className="max-w-2xl mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-enterprise-900 mb-3">
                How it works
              </h2>
              <p className="text-enterprise-600 text-lg">
                Three steps from application to a live advisor profile.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {HOW_IT_WORKS.map((step, i) => (
                <div
                  key={step.title}
                  className="bg-white rounded-2xl border border-enterprise-200 p-6 md:p-7 shadow-sm"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                      <step.icon className="w-5 h-5 text-purple-600" />
                    </div>
                    <span className="text-sm font-semibold text-enterprise-400">
                      Step {i + 1}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-enterprise-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-enterprise-600 leading-relaxed">{step.body}</p>
                </div>
              ))}
            </div>
          </Container>
        </section>

        {/* What advisors get */}
        <section className="py-16 md:py-24 bg-enterprise-50/60">
          <Container>
            <div className="max-w-2xl mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-enterprise-900 mb-3">
                What advisors get
              </h2>
              <p className="text-enterprise-600 text-lg">
                Built for practitioners who want the right work to find them.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {BENEFITS.map((benefit) => (
                <div
                  key={benefit.title}
                  className="bg-white rounded-2xl border border-enterprise-200 p-6 md:p-7 shadow-sm"
                >
                  <div className="w-11 h-11 rounded-xl bg-purple-100 flex items-center justify-center mb-4">
                    <benefit.icon className="w-5 h-5 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-enterprise-900 mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-enterprise-600 leading-relaxed">
                    {benefit.body}
                  </p>
                </div>
              ))}
            </div>
          </Container>
        </section>

        {/* Who we're looking for */}
        <section className="py-16 md:py-24">
          <Container>
            <div className="max-w-2xl mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-enterprise-900 mb-3">
                Who we&rsquo;re looking for
              </h2>
              <p className="text-enterprise-600 text-lg">
                Senior practitioners across the disciplines GCC leaders need most.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {LOOKING_FOR.map((item) => (
                <div
                  key={item.title}
                  className="flex gap-4 bg-white rounded-2xl border border-enterprise-200 p-6 shadow-sm"
                >
                  <div className="shrink-0 w-11 h-11 rounded-xl bg-purple-100 flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-enterprise-900 mb-1.5">
                      {item.title}
                    </h3>
                    <p className="text-enterprise-600 leading-relaxed">
                      {item.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Container>
        </section>

        {/* FAQ */}
        <section className="py-16 md:py-24 bg-enterprise-50/60">
          <Container size="narrow">
            <h2 className="text-2xl md:text-3xl font-bold text-enterprise-900 mb-8">
              Frequently asked questions
            </h2>
            <div className="space-y-4">
              {FAQ.map((item) => (
                <div
                  key={item.q}
                  className="bg-white rounded-2xl border border-enterprise-200 p-6 shadow-sm"
                >
                  <h3 className="font-semibold text-enterprise-900 mb-2">
                    {item.q}
                  </h3>
                  <p className="text-enterprise-600 leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>
          </Container>
        </section>

        {/* CTA + embedded form (anchor target from hero and nav) */}
        <section id="apply" className="py-16 md:py-24 scroll-mt-24">
          <Container size="narrow">
            <div className="text-center max-w-2xl mx-auto mb-8">
              <h2 className="font-newspaper text-3xl md:text-4xl font-bold text-enterprise-900 mb-3">
                Apply to the founding cohort
              </h2>
              <p className="text-enterprise-600 text-lg">
                Join now while the network is being built. It takes about three
                minutes, and applying is free.
              </p>
            </div>
            <AdvisorApplyForm />
          </Container>
        </section>
      </main>
      <Footer />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbs) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(faqSchema) }}
      />
    </>
  );
}
