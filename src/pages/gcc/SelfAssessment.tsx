import { Container } from '@/components/shared/Container'
import { ClipboardCheck } from 'lucide-react'

export default function SelfAssessment() {
  return (
    <div className="py-20">
      <Container>
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
            <ClipboardCheck className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-display-sm text-enterprise-900 mb-4">AI Readiness Assessment</h1>
          <p className="text-lg text-enterprise-600">
            Evaluate your GCC's AI maturity with a guided questionnaire. Receive a detailed analysis and PDF report with actionable recommendations.
          </p>
        </div>
      </Container>
    </div>
  )
}
