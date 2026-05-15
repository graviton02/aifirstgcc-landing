import type { Metadata } from "next";
import { FileBarChart, FileText, Quote } from "lucide-react";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/sections/Footer";
import { Container } from "@/components/shared/Container";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { ResearchGateForm } from "@/components/research/ResearchGateForm";
import {
  breadcrumbJsonLd,
  reportJsonLd,
  serializeJsonLd,
} from "@/lib/json-ld";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://orbys360.com";
const REPORT_SLUG = "the-gcc-reckoning";
const REPORT_TITLE = "The GCC Reckoning";
const REPORT_SUBTITLE = "How AI Is Rewriting the Economics of Global Capability Centers";
const REPORT_TAGLINE = "Why half the GCC workforce will be redefined.";

const REPORT_DESCRIPTION =
  "Orbys Research analysed 200+ Global Capability Centers over twelve months. The finding: more than half of current GCC headcount sits in roles with high-to-critical AI displacement risk inside a five-year window. The GCC Reckoning maps the functional, sector, and geographic exposure — and the path from cost arbitrage to intelligence hub.";

const STATS = [
  {
    value: "50%",
    label: "of GCC roles face high-to-critical AI displacement risk by 2031",
  },
  {
    value: "2.9M",
    label: "professionals directly exposed across surveyed GCC geographies",
  },
  {
    value: "$46B",
    label: "annual labour cost under AI threat across the global GCC base",
  },
  {
    value: "200+",
    label: "GCCs tracked over twelve months of primary research",
  },
];

const WHATS_INSIDE = [
  "A twenty-year retrospective on the GCC model — and why AI breaks the underlying cost equation.",
  "The displacement already underway: the corporate record across Accenture, IBM, TCS, Infosys, Microsoft, Meta, Amazon, Salesforce, and more.",
  "Functional threat matrix: BPM (critical), IT activities (high), and ER&D (medium) — with risk horizons and AI mechanisms.",
  "Sector deep-dives across Financial Services, Tech, Healthcare & Life Sciences, Manufacturing, Retail, and Energy.",
  "Geographic impact analysis: India, Eastern Europe, South East Asia, Latin America, and the Middle East & Africa.",
  'The "Seat Warmer Economy" — how GCCs built their own structural vulnerability, and the path out.',
  "The new GCC value proposition: moving from cost arbitrage to intelligence hub.",
  "Strategic recommendations for GCC leadership, enterprise HQ, service providers, and national governments.",
];

const PAGE_URL = `${BASE_URL}/research`;

export const metadata: Metadata = {
  title: "Research | The GCC Reckoning — Orbys360",
  description: REPORT_DESCRIPTION.slice(0, 160),
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: `${REPORT_TITLE} — Orbys Research`,
    description: REPORT_DESCRIPTION.slice(0, 200),
    url: PAGE_URL,
    type: "article",
    siteName: "Orbys360",
  },
  twitter: {
    card: "summary_large_image",
    title: `${REPORT_TITLE} — Orbys Research`,
    description: REPORT_DESCRIPTION.slice(0, 200),
  },
};

export default function ResearchPage() {
  const reportSchema = reportJsonLd({
    title: `${REPORT_TITLE}: ${REPORT_SUBTITLE}`,
    description: REPORT_DESCRIPTION,
    url: "/research",
    datePublished: "2026-05-13",
    authorName: "Orbys Research",
  });

  const breadcrumbSchema = breadcrumbJsonLd([
    { name: "Home", url: BASE_URL },
    { name: "Research", url: PAGE_URL },
  ]);

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
              backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                                linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
              backgroundSize: "60px 60px",
            }}
          />

          <Container className="relative z-10">
            <div className="text-white/80 mb-8">
              <Breadcrumbs
                items={[
                  { label: "Home", href: "/" },
                  { label: "Research" },
                ]}
              />
            </div>

            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.16em] uppercase text-purple-300 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full mb-6">
                <FileBarChart className="w-3.5 h-3.5" />
                Research Report · 2026
              </div>
              <h1 className="font-newspaper text-4xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight mb-5">
                {REPORT_TITLE}
              </h1>
              <p className="text-xl md:text-2xl text-white/80 leading-snug mb-4">
                {REPORT_SUBTITLE}
              </p>
              <p className="text-base md:text-lg italic text-purple-200/80">
                {REPORT_TAGLINE}
              </p>
              <div className="flex items-center gap-3 mt-8 text-sm text-white/60">
                <FileText className="w-4 h-4" />
                <span>84 pages · PDF · Orbys Research, 2026</span>
              </div>
            </div>
          </Container>
        </section>

        {/* Stats */}
        <section className="-mt-12 relative z-20">
          <Container>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {STATS.map((stat) => (
                <div
                  key={stat.value}
                  className="bg-white rounded-2xl border border-enterprise-200 p-5 md:p-6 shadow-sm"
                >
                  <div className="text-3xl md:text-4xl font-bold text-enterprise-900 mb-2">
                    {stat.value}
                  </div>
                  <div className="text-xs md:text-sm text-enterprise-600 leading-snug">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </Container>
        </section>

        {/* Body + Form */}
        <section className="py-16 md:py-24">
          <Container>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16">
              <div className="lg:col-span-3 space-y-10">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-enterprise-900 mb-4">
                    The premise that built the GCC industry is being dismantled
                  </h2>
                  <div className="space-y-4 text-enterprise-700 leading-relaxed text-[17px]">
                    <p>
                      Global Capability Centers were built on a single premise: skilled
                      labour in emerging markets could perform the same cognitive work as
                      Western employees at a fraction of the cost. For two decades, that
                      premise delivered.
                    </p>
                    <p>
                      It is now being dismantled by artificial intelligence — faster, and
                      more completely, than most people working inside or around GCCs are
                      prepared to accept. Orbys360 spent twelve months tracking workforce
                      composition across 200+ GCCs. The finding is straightforward: more
                      than half of current GCC headcount occupies roles with high-to-critical
                      AI displacement risk within a five-year window.
                    </p>
                    <p>
                      This report does not argue that AI adoption should be stopped. It
                      argues that the transition, if managed with transparency and
                      investment, can be navigated with far less human damage than a
                      transition managed through silence, denial, or delay.
                    </p>
                  </div>
                </div>

                <figure className="border-l-4 border-purple-500 pl-6 py-2 bg-purple-50/40 rounded-r-lg">
                  <Quote className="w-6 h-6 text-purple-500 mb-3" />
                  <blockquote className="text-lg md:text-xl text-enterprise-800 leading-relaxed italic">
                    &ldquo;We spent twenty years turning ambiguous headquarters problems
                    into clean, documented, repeatable processes. We did not realise we
                    were writing training manuals for the machines that would replace
                    us.&rdquo;
                  </blockquote>
                  <figcaption className="text-sm text-enterprise-500 mt-3 not-italic">
                    — GCC Managing Director, Financial Services
                  </figcaption>
                </figure>

                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-enterprise-900 mb-5">
                    What&apos;s inside
                  </h2>
                  <ul className="space-y-3">
                    {WHATS_INSIDE.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-3 text-enterprise-700 leading-relaxed"
                      >
                        <span className="shrink-0 mt-2 w-1.5 h-1.5 rounded-full bg-purple-500" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="lg:col-span-2">
                <div className="lg:sticky lg:top-24">
                  <ResearchGateForm
                    reportSlug={REPORT_SLUG}
                    reportTitle={REPORT_TITLE}
                  />
                </div>
              </div>
            </div>
          </Container>
        </section>
      </main>
      <Footer />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(reportSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbSchema) }}
      />
    </>
  );
}
