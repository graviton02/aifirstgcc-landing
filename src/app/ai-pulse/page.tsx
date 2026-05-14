import Link from "next/link";
import { fetchQuery } from "convex/nextjs";
import { ArrowRight, Calendar, Clock } from "lucide-react";
import { api } from "../../../convex/_generated/api";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/sections/Footer";
import { Container } from "@/components/shared/Container";
import { dailyBriefs as staticBriefs } from "@/data/aiPulseBriefs";
import type { DailyBrief } from "@/data/aiPulseTypes";

const currentDate = new Date().toLocaleDateString("en-US", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
});

export const metadata = {
  title: "AI Pulse — Daily AI Briefs | Orbys360",
  description:
    "Daily briefings on agentic AI and enterprise automation. Stay current on the latest developments shaping AI-first Global Capability Centers.",
};

async function getBriefs() {
  try {
    const convexBriefs = await fetchQuery(api.aiPulse.listBriefs, {});
    const convexSlugs = new Set(convexBriefs.map((brief: any) => brief.slug));
    const historical = staticBriefs.filter((brief) => !convexSlugs.has(brief.slug));
    return [...convexBriefs, ...historical] as DailyBrief[];
  } catch {
    return staticBriefs;
  }
}

export default async function AIPulsePage() {
  const briefs = await getBriefs();

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <header className="relative h-[50vh] min-h-[400px] bg-enterprise-950 overflow-hidden flex items-center justify-center pt-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(99,102,241,0.15),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(168,85,247,0.1),transparent_50%)]" />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                                linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
              backgroundSize: "60px 60px",
            }}
          />

          <Container className="relative z-10 text-center">
            <div className="w-full max-w-2xl mx-auto h-px bg-gradient-to-r from-transparent via-white/30 to-transparent mb-8" />
            <h1 className="font-newspaper text-5xl md:text-7xl lg:text-8xl font-bold text-white tracking-tight mb-4">
              AI Pulse
            </h1>
            <p className="font-newspaper text-xl md:text-2xl lg:text-3xl text-white/70 italic mb-8 max-w-3xl mx-auto">
              Today in Agentic AI &amp; Enterprise Automation
            </p>
            <div className="flex items-center justify-center gap-6 text-white/60">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span className="text-sm font-medium">{currentDate}</span>
              </div>
              <div className="w-px h-4 bg-white/30" />
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-medium">Daily Digest</span>
              </div>
            </div>
            <div className="w-full max-w-2xl mx-auto h-px bg-gradient-to-r from-transparent via-white/30 to-transparent mt-8" />
          </Container>

          <div className="absolute bottom-0 left-0 right-0">
            <div className="h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
            <div className="h-8 bg-gradient-to-b from-enterprise-950 to-transparent" />
          </div>
        </header>

        <section className="py-16 md:py-24">
          <Container>
            <div className="text-center mb-12">
              <h2 className="font-newspaper text-3xl md:text-4xl font-bold text-enterprise-900 mb-4">
                Daily Briefs
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto rounded-full" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {briefs.map((brief) => (
                <BriefCard key={brief.slug} brief={brief} />
              ))}
            </div>
          </Container>
        </section>
      </main>
      <Footer />
    </>
  );
}

function formatDate(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function BriefCard({ brief }: { brief: DailyBrief }) {
  const displayHeadline = brief.editorHeadline ?? brief.topDevelopments[0].headline;

  return (
    <Link
      href={`/ai-pulse/${brief.slug}`}
      prefetch={false}
      className="group flex flex-col h-[340px] relative bg-white rounded-2xl border border-enterprise-200 overflow-hidden transition-all duration-300 hover:shadow-card-hover hover:border-enterprise-300 hover:-translate-y-1"
    >
      <div className="px-6 pt-6 pb-3">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
          <Calendar className="w-3.5 h-3.5" />
          {formatDate(brief.date)}
        </span>
      </div>
      <div className="px-6 pb-4 flex-1 min-h-0">
        <h3 className="font-newspaper text-xl font-bold text-enterprise-900 leading-tight group-hover:text-blue-700 transition-colors mb-4 line-clamp-3">
          {displayHeadline}
        </h3>
        <ul className="space-y-2">
          {brief.topDevelopments.map((dev, index) => (
            <li key={index} className="flex items-start gap-2 text-sm text-enterprise-600">
              <span className="shrink-0 w-5 h-5 rounded-full bg-enterprise-100 text-enterprise-500 flex items-center justify-center text-[10px] font-bold mt-0.5">
                {index + 1}
              </span>
              <span className="line-clamp-1">{dev.headline}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="px-6 pb-6 pt-3 flex items-center justify-end border-t border-enterprise-100 mt-auto">
        <span className="text-sm font-medium text-blue-600 flex items-center gap-1 group-hover:gap-2 transition-all">
          Read Brief
          <ArrowRight className="w-4 h-4" />
        </span>
      </div>
    </Link>
  );
}
