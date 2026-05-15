"use client";

import Link from "next/link";
import { ArrowRight, FileBarChart, FileText } from "lucide-react";
import { Container } from "@/components/shared/Container";
import {
  AnimatedSection,
  StaggerContainer,
  StaggerItem,
} from "@/components/shared/AnimatedSection";
import { Button } from "@/components/ui/button";

const STATS = [
  { value: "50%", label: "GCC roles facing AI displacement risk by 2031" },
  { value: "2.9M", label: "Professionals directly exposed" },
  { value: "$46B", label: "Annual labour cost under AI threat" },
  { value: "200+", label: "GCCs analysed over twelve months" },
];

export function FeaturedResearch() {
  return (
    <section className="relative overflow-hidden bg-enterprise-950 py-20 md:py-28 lg:py-32">
      {/* Atmospheric layers */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_18%_25%,rgba(99,102,241,0.22),transparent_55%)]"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_82%_85%,rgba(168,85,247,0.16),transparent_55%)]"
      />
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
        }}
      />
      <div aria-hidden className="absolute inset-0 bg-noise opacity-[0.03]" />

      {/* Editorial frame: top + bottom hairlines */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-purple-400/40 to-transparent"
      />
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-indigo-400/30 to-transparent"
      />

      <Container className="relative">
        <AnimatedSection>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16 items-center">
            {/* ── Left column — 3/5 ── */}
            <div className="lg:col-span-3">
              {/* Masthead eyebrow with leading hairline */}
              <div className="flex items-center gap-3 mb-7">
                <span aria-hidden className="h-px w-10 bg-purple-300/50" />
                <span className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.24em] uppercase text-purple-200">
                  <FileBarChart className="w-3.5 h-3.5" />
                  Research Report · 2026
                </span>
              </div>

              {/* Title with italic accent word */}
              <h2 className="font-display text-display-sm md:text-display-md text-white tracking-tight mb-5 leading-[1.05]">
                The GCC{" "}
                <span className="italic font-light text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-purple-100 to-indigo-200">
                  Reckoning
                </span>
              </h2>

              <p className="text-lg md:text-xl text-white/75 leading-relaxed mb-3 max-w-xl">
                How AI Is Rewriting the Economics of Global Capability Centers.
              </p>

              <p className="text-base italic text-purple-200/80 mb-10">
                Why half the GCC workforce will be redefined.
              </p>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
                <Button
                  asChild
                  size="lg"
                  variant="secondary"
                  className="group rounded-full bg-white text-enterprise-950 border-transparent hover:bg-white/90 hover:scale-[1.02] shadow-[0_0_40px_rgba(168,85,247,0.25)]"
                >
                  <Link href="/research">
                    Access the report
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>

                <span className="inline-flex items-center gap-2 text-xs text-white/45 font-medium tracking-wide">
                  <FileText className="w-3.5 h-3.5" />
                  84 pages · PDF · Orbys Research, 2026
                </span>
              </div>
            </div>

            {/* ── Right column — 2/5 — 2×2 stat grid ── */}
            <div className="lg:col-span-2">
              <StaggerContainer
                className="grid grid-cols-2 gap-3 md:gap-4"
                staggerDelay={0.08}
              >
                {STATS.map((stat, index) => (
                  <StaggerItem key={stat.value}>
                    <StatCard
                      value={stat.value}
                      label={stat.label}
                      index={index}
                    />
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </div>
          </div>
        </AnimatedSection>
      </Container>
    </section>
  );
}

function StatCard({
  value,
  label,
  index,
}: {
  value: string;
  label: string;
  index: number;
}) {
  const indexLabel = String(index + 1).padStart(2, "0");

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035] p-5 md:p-6 backdrop-blur-sm transition-all duration-500 hover:border-purple-300/40 hover:bg-white/[0.06]">
      {/* Top hairline appears on hover */}
      <div
        aria-hidden
        className="absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-purple-200/60 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
      />

      {/* Mono index in corner — data-sheet feel */}
      <span className="absolute top-3 right-3 font-mono text-[10px] tracking-wider text-white/25 transition-colors duration-300 group-hover:text-purple-200/60">
        {indexLabel}
      </span>

      {/* Headline number */}
      <div className="font-display text-4xl md:text-5xl font-bold text-white tracking-tight leading-none">
        {value}
      </div>

      {/* Purple hairline rule for typographic structure */}
      <div
        aria-hidden
        className="mt-3 mb-3 h-px w-8 bg-purple-300/50 transition-all duration-500 group-hover:w-12 group-hover:bg-purple-200/80"
      />

      {/* Label */}
      <p className="text-[13px] leading-snug text-white/60">{label}</p>
    </div>
  );
}
