"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Container } from "@/components/shared/Container";
import { BriefHeader } from "@/components/ai-pulse/BriefHeader";
import { DevelopmentSection } from "@/components/ai-pulse/DevelopmentSection";
import { UseCaseSection } from "@/components/ai-pulse/UseCaseSection";
import { ImpactSection } from "@/components/ai-pulse/ImpactSection";
import { OpportunitiesRisksSection } from "@/components/ai-pulse/OpportunitiesRisksSection";
import type { DailyBrief } from "@/data/aiPulseTypes";

interface AIPulseDetailClientProps {
  brief: DailyBrief;
  prevSlug: string | null;
  nextSlug: string | null;
}

export function AIPulseDetailClient({
  brief,
  prevSlug,
  nextSlug,
}: AIPulseDetailClientProps) {
  const displayHeadline =
    brief.editorHeadline ?? brief.topDevelopments[0].headline;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <BriefHeader date={brief.date} headline={displayHeadline} />

      <Container size="narrow" className="py-8 md:py-12">
        <DevelopmentSection developments={brief.topDevelopments} />
        <UseCaseSection useCase={brief.useCase} />
        <ImpactSection impacts={brief.enterpriseImpact} />
        <OpportunitiesRisksSection
          opportunities={brief.opportunities}
          risks={brief.risks}
        />

        {/* Bottom navigation */}
        <nav className="py-10 border-t border-enterprise-200 mt-6">
          <div className="flex items-center justify-between">
            <Link
              href="/ai-pulse"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-enterprise-600 hover:text-enterprise-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              All Briefs
            </Link>

            <div className="flex items-center gap-4">
              {prevSlug && (
                <Link
                  href={`/ai-pulse/${prevSlug}`}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-enterprise-600 hover:text-enterprise-900 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Previous
                </Link>
              )}
              {nextSlug && (
                <Link
                  href={`/ai-pulse/${nextSlug}`}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-enterprise-600 hover:text-enterprise-900 transition-colors"
                >
                  Next
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>
        </nav>
      </Container>
    </div>
  );
}
