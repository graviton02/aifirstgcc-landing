import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, ChevronLeft } from 'lucide-react'
import { Container } from '@/components/shared/Container'
import { BriefHeader } from '@/components/ai-pulse/BriefHeader'
import { DevelopmentSection } from '@/components/ai-pulse/DevelopmentSection'
import { UseCaseSection } from '@/components/ai-pulse/UseCaseSection'
import { ImpactSection } from '@/components/ai-pulse/ImpactSection'
import { OpportunitiesRisksSection } from '@/components/ai-pulse/OpportunitiesRisksSection'
import { dailyBriefs } from '@/data/aiPulseBriefs'

export function AIPulseDetail() {
  const { slug } = useParams<{ slug: string }>()
  const briefIndex = dailyBriefs.findIndex((b) => b.slug === slug)
  const brief = briefIndex !== -1 ? dailyBriefs[briefIndex] : null

  if (!brief) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center pt-20">
        <div className="text-center">
          <h1 className="font-newspaper text-3xl font-bold text-enterprise-900 mb-4">Brief not found</h1>
          <p className="text-enterprise-600 mb-6">We couldn't find a daily brief for "{slug}".</p>
          <Link
            to="/ai-pulse"
            className="inline-flex items-center gap-2 text-blue-600 font-medium hover:text-blue-700 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to AI Pulse
          </Link>
        </div>
      </div>
    )
  }

  const prevBrief = briefIndex < dailyBriefs.length - 1 ? dailyBriefs[briefIndex + 1] : null
  const nextBrief = briefIndex > 0 ? dailyBriefs[briefIndex - 1] : null

  const displayHeadline = brief.editorHeadline ?? brief.topDevelopments[0].headline

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <BriefHeader date={brief.date} headline={displayHeadline} />

      <Container size="narrow" className="py-8 md:py-12">
        <DevelopmentSection developments={brief.topDevelopments} />
        <UseCaseSection useCase={brief.useCase} />
        <ImpactSection impacts={brief.enterpriseImpact} />
        <OpportunitiesRisksSection opportunities={brief.opportunities} risks={brief.risks} />

        {/* Bottom navigation */}
        <nav className="py-10 border-t border-enterprise-200 mt-6">
          <div className="flex items-center justify-between">
            <Link
              to="/ai-pulse"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-enterprise-600 hover:text-enterprise-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              All Briefs
            </Link>

            <div className="flex items-center gap-4">
              {prevBrief && (
                <Link
                  to={`/ai-pulse/${prevBrief.slug}`}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-enterprise-600 hover:text-enterprise-900 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Previous
                </Link>
              )}
              {nextBrief && (
                <Link
                  to={`/ai-pulse/${nextBrief.slug}`}
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
  )
}
