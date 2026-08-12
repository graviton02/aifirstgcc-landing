import type { Metadata } from "next";
import Link from "next/link";
import { Cookie, ExternalLink, ShieldCheck } from "lucide-react";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/sections/Footer";
import { Container } from "@/components/shared/Container";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://orbys360.com";

export const metadata: Metadata = {
  title: "Cookie Policy | Orbys360",
  description:
    "Learn how Orbys360 uses cookies and similar technologies, and how to control your privacy choices.",
  alternates: { canonical: `${BASE_URL}/cookie-policy` },
};

const policySections = [
  { id: "choices", label: "Your choices" },
  { id: "necessary", label: "Necessary technologies" },
  { id: "analytics", label: "Analytics" },
  { id: "marketing", label: "Marketing" },
  { id: "other", label: "Other local storage" },
  { id: "updates", label: "Policy updates" },
];

function PolicyLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1 font-semibold text-purple-700 underline decoration-purple-300 underline-offset-2 hover:text-purple-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-600"
    >
      {children}
      <ExternalLink aria-hidden="true" className="h-3.5 w-3.5" />
    </a>
  );
}

export default function CookiePolicyPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-enterprise-50 pt-24 md:pt-28">
        <section className="border-b border-enterprise-200 bg-enterprise-950 py-14 text-white md:py-20">
          <Container size="narrow">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-purple-200">
              <Cookie aria-hidden="true" className="h-4 w-4" />
              Privacy and transparency
            </div>
            <h1 className="font-display text-4xl font-bold tracking-tight md:text-6xl">
              Cookie policy
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/75 md:text-lg">
              This policy explains how Orbys360 uses cookies, local storage, tracking
              pixels, and similar browser technologies when you use our website.
            </p>
            <p className="mt-5 text-sm font-medium text-white/55">
              Last updated: 10 August 2026
            </p>
          </Container>
        </section>

        <Container size="narrow" className="py-10 md:py-16">
          <div className="grid gap-8 lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-12">
            <nav aria-label="Cookie policy sections" className="lg:sticky lg:top-28 lg:self-start">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-enterprise-500">
                On this page
              </p>
              <ul className="space-y-1">
                {policySections.map((section) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-enterprise-700 transition-colors hover:bg-white hover:text-purple-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-600"
                    >
                      {section.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <article className="min-w-0 space-y-10 text-[16px] leading-7 text-enterprise-700">
              <section>
                <div className="rounded-2xl border border-purple-200 bg-purple-50 p-5 md:p-6">
                  <div className="flex gap-3">
                    <ShieldCheck
                      aria-hidden="true"
                      className="mt-0.5 h-6 w-6 shrink-0 text-purple-700"
                    />
                    <div>
                      <h2 className="font-bold text-enterprise-950">Our default</h2>
                      <p className="mt-1 text-sm leading-6 text-enterprise-700">
                        Optional analytics and marketing technologies stay off until you
                        choose to allow them. Necessary technologies remain active so the
                        website can work securely and remember your privacy choice.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <section id="choices" className="scroll-mt-28">
                <h2 className="text-2xl font-bold text-enterprise-950">Your choices</h2>
                <div className="mt-4 space-y-4">
                  <p>
                    On your first visit, you can accept all optional technologies, reject
                    them, or choose individual categories. Rejecting optional technologies
                    does not prevent you from browsing the public website.
                  </p>
                  <p>
                    We store your selection in your browser for 180 days. You can change
                    or withdraw it at any time using <strong>Cookie settings</strong> in
                    the footer. If you withdraw a category that was active, the page
                    reloads to ensure its scripts stop running.
                  </p>
                </div>
              </section>

              <section id="necessary" className="scroll-mt-28">
                <h2 className="text-2xl font-bold text-enterprise-950">
                  Necessary technologies
                </h2>
                <p className="mt-4">
                  These technologies support security and services you explicitly request.
                  They cannot be disabled through our preference panel.
                </p>
                <div className="mt-5 overflow-x-auto rounded-2xl border border-enterprise-200 bg-white">
                  <table className="w-full min-w-[36rem] text-left text-sm">
                    <thead className="bg-enterprise-100 text-enterprise-900">
                      <tr>
                        <th scope="col" className="px-4 py-3 font-bold">Provider or key</th>
                        <th scope="col" className="px-4 py-3 font-bold">Purpose</th>
                        <th scope="col" className="px-4 py-3 font-bold">Duration</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-enterprise-100">
                      <tr>
                        <td className="px-4 py-4 align-top font-semibold text-enterprise-950">
                          orbys360-cookie-consent
                        </td>
                        <td className="px-4 py-4 align-top">
                          Local-storage record of your analytics and marketing choices.
                        </td>
                        <td className="px-4 py-4 align-top">180 days</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-4 align-top font-semibold text-enterprise-950">
                          Clerk
                        </td>
                        <td className="px-4 py-4 align-top">
                          Authentication, session security, fraud prevention, and keeping
                          signed-in users connected. Common identifiers include
                          <code className="mx-1 rounded bg-enterprise-100 px-1.5 py-0.5 text-xs">__client</code>
                          and
                          <code className="ml-1 rounded bg-enterprise-100 px-1.5 py-0.5 text-xs">__session</code>.
                        </td>
                        <td className="px-4 py-4 align-top">
                          Session-dependent and controlled by the authentication service.
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="mt-4 text-sm text-enterprise-600">
                  Read more in the{" "}
                  <PolicyLink href="https://clerk.com/docs/guides/how-clerk-works/cookies">
                    Clerk cookie documentation
                  </PolicyLink>
                  .
                </p>
              </section>

              <section id="analytics" className="scroll-mt-28">
                <h2 className="text-2xl font-bold text-enterprise-950">Analytics</h2>
                <div className="mt-4 space-y-4">
                  <p>
                    If you enable Analytics, we load Vercel Web Analytics and Speed
                    Insights. We also send performance measurements such as page route,
                    Web Vital name and value, load latency, and aggregated long-task
                    summaries. We do not intentionally include names, email addresses, or
                    form contents in these events.
                  </p>
                  <p>
                    Vercel states that Web Analytics does not use third-party cookies. It
                    creates privacy-focused, aggregated measurements using information such
                    as page path, referrer, device and browser type, approximate location,
                    and a request-derived visitor hash that expires after 24 hours.
                  </p>
                  <p>
                    See Vercel&apos;s{" "}
                    <PolicyLink href="https://vercel.com/docs/analytics/privacy-policy">
                      Analytics privacy and compliance information
                    </PolicyLink>
                    .
                  </p>
                </div>
              </section>

              <section id="marketing" className="scroll-mt-28">
                <h2 className="text-2xl font-bold text-enterprise-950">Marketing</h2>
                <div className="mt-4 space-y-4">
                  <p>
                    If you enable Marketing, we load the LinkedIn Insight Tag. LinkedIn may
                    receive the page URL, referrer URL, IP address, device and browser
                    characteristics, and a timestamp. It may set or read LinkedIn cookies
                    and advertising identifiers to measure conversions, understand campaign
                    audiences, and support retargeting.
                  </p>
                  <p>
                    Cookie names and lifetimes are controlled by LinkedIn and may change.
                    Orbys360 does not load the LinkedIn script or its fallback tracking pixel
                    before you grant Marketing consent.
                  </p>
                  <p>
                    See LinkedIn&apos;s{" "}
                    <PolicyLink href="https://www.linkedin.com/help/lms/answer/a516590">
                      Insight Tag information
                    </PolicyLink>{" "}
                    and{" "}
                    <PolicyLink href="https://www.linkedin.com/legal/cookie-policy">
                      cookie policy
                    </PolicyLink>
                    .
                  </p>
                </div>
              </section>

              <section id="other" className="scroll-mt-28">
                <h2 className="text-2xl font-bold text-enterprise-950">
                  Other local storage and operational services
                </h2>
                <div className="mt-4 space-y-4">
                  <p>
                    When you use features such as agent comparison or candidate sign-up,
                    Orbys360 may store the selected agents or a completion marker in your
                    browser. This storage is created only in response to the feature you
                    use and keeps your selection available across pages.
                  </p>
                  <p>
                    Orbys360 uses Sentry for security, reliability, and error diagnosis when
                    configured. Sentry is configured not to send default personally
                    identifiable information. We also load web fonts from Google Fonts;
                    your browser therefore makes a request to Google to retrieve those font
                    files. These services are not used by Orbys360 for advertising.
                  </p>
                </div>
              </section>

              <section id="updates" className="scroll-mt-28">
                <h2 className="text-2xl font-bold text-enterprise-950">Policy updates</h2>
                <div className="mt-4 space-y-4">
                  <p>
                    We may update this policy when our technology, providers, or legal
                    obligations change. The date at the top shows the latest revision. If a
                    material change affects your choice, we may ask you to choose again.
                  </p>
                  <p>
                    Questions about this policy can be sent to{" "}
                    <a
                      href="mailto:team@orbys360.com"
                      className="font-semibold text-purple-700 underline decoration-purple-300 underline-offset-2 hover:text-purple-900"
                    >
                      team@orbys360.com
                    </a>
                    .
                  </p>
                </div>
              </section>

              <div className="border-t border-enterprise-200 pt-8">
                <Link
                  href="/orbys360"
                  className="font-semibold text-purple-700 underline decoration-purple-300 underline-offset-2 hover:text-purple-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-600"
                >
                  Return to Orbys360
                </Link>
              </div>
            </article>
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
