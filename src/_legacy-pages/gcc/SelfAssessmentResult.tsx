import { useParams } from 'react-router-dom'
import { Container } from '@/components/shared/Container'
import { Button } from '@/components/ui/button'
import { useSelfAssessmentResult } from '@/hooks/use-assessment'
import { generateConsultingPDF } from '@/utils/pdfGenerator'
import type { ConsultingAnalysis } from '@/types/assessment'

const PILLAR_NAMES = [
  'Strategy & Vision',
  'Talent & Skills',
  'Technology & Infrastructure',
  'Operating Model',
  'Innovation & Ecosystem',
  'Governance & Risk',
  'Impact & Outcomes',
]

function PillarCurrentState({
  pillar,
  points,
}: {
  pillar: string
  points: string[]
}) {
  return (
    <div className="rounded-xl border border-enterprise-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-enterprise-900 mb-3">
        {pillar}
      </h3>
      <ul className="space-y-2">
        {points.map((point, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-enterprise-700">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
            {point}
          </li>
        ))}
      </ul>
    </div>
  )
}

function PillarRecommendations({
  pillar,
  shortTerm,
  midTerm,
}: {
  pillar: string
  shortTerm: string[]
  midTerm: string[]
}) {
  return (
    <div className="rounded-xl border border-enterprise-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-enterprise-900 mb-4">
        {pillar}
      </h3>

      <div className="mb-4">
        <h4 className="text-sm font-semibold text-blue-600 mb-2">
          Short-term (3-6 months)
        </h4>
        <ul className="space-y-2">
          {shortTerm.map((action, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-enterprise-700">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
              {action}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-green-600 mb-2">
          Mid-term (6-18 months)
        </h4>
        <ul className="space-y-2">
          {midTerm.map((action, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-enterprise-700">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-green-500" />
              {action}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default function SelfAssessmentResult() {
  const { assessmentId } = useParams<{ assessmentId: string }>()
  const { data: result, isLoading, error } = useSelfAssessmentResult(assessmentId)

  if (isLoading) {
    return (
      <div className="py-20">
        <Container>
          <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
            <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-enterprise-600 text-sm">Loading your assessment results...</p>
          </div>
        </Container>
      </div>
    )
  }

  if (error || !result) {
    return (
      <div className="py-20">
        <Container>
          <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-50 mb-2">
              <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-enterprise-900">Results Not Found</h2>
            <p className="text-enterprise-600 text-sm max-w-md text-center">
              We couldn't find the assessment results for this ID. The assessment may still be processing, or the link may be incorrect.
            </p>
          </div>
        </Container>
      </div>
    )
  }

  const analysis = result.analysis as Record<string, unknown>
  const isConsultingFormat = analysis && 'current_state' in analysis
  const consultingAnalysis = isConsultingFormat ? (analysis as unknown as ConsultingAnalysis) : null

  if (!consultingAnalysis) {
    return (
      <div className="py-20">
        <Container>
          <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
            <h2 className="text-xl font-semibold text-enterprise-900">Analysis Unavailable</h2>
            <p className="text-enterprise-600 text-sm max-w-md text-center">
              The analysis data for this assessment is not in the expected format. Please contact support.
            </p>
            <pre className="mt-4 max-w-2xl w-full overflow-auto rounded-lg bg-enterprise-50 p-4 text-xs text-enterprise-700">
              {JSON.stringify(analysis, null, 2)}
            </pre>
          </div>
        </Container>
      </div>
    )
  }

  const handleDownloadPDF = () => {
    generateConsultingPDF(consultingAnalysis, assessmentId || 'unknown')
  }

  return (
    <div className="py-10">
      <Container size="wide">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-enterprise-900">
              AI-First GCC Assessment Report
            </h1>
            <p className="mt-1 text-sm text-enterprise-500">
              7 Pillars of AI Transformation Analysis
            </p>
          </div>
          <Button onClick={handleDownloadPDF} size="lg">
            <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download PDF
          </Button>
        </div>

        {/* Current State by Pillar */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-8 w-1 rounded-full bg-blue-600" />
            <h2 className="text-xl font-bold text-enterprise-900">
              Current State by Pillar
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {PILLAR_NAMES.map((pillar) => (
              <PillarCurrentState
                key={pillar}
                pillar={pillar}
                points={consultingAnalysis.current_state[pillar] || []}
              />
            ))}
          </div>
        </section>

        {/* Recommendations by Pillar */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-8 w-1 rounded-full bg-purple-600" />
            <h2 className="text-xl font-bold text-enterprise-900">
              Recommendations by Pillar
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {PILLAR_NAMES.map((pillar) => {
              const recs = consultingAnalysis.recommendations[pillar]
              return (
                <PillarRecommendations
                  key={pillar}
                  pillar={pillar}
                  shortTerm={recs?.short_term || []}
                  midTerm={recs?.mid_term || []}
                />
              )
            })}
          </div>
        </section>

        {/* Next Steps / Roadmap */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-8 w-1 rounded-full bg-green-600" />
            <h2 className="text-xl font-bold text-enterprise-900">
              Next Steps / Roadmap
            </h2>
          </div>
          <div className="rounded-xl border border-enterprise-200 bg-white p-6 shadow-sm">
            <ol className="space-y-4">
              {(consultingAnalysis.next_steps || []).map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-100 text-sm font-semibold text-green-700">
                    {i + 1}
                  </span>
                  <span className="text-sm text-enterprise-700 pt-1">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </Container>
    </div>
  )
}
