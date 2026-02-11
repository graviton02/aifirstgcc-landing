import { Container } from '@/components/shared/Container'
import { ClipboardList } from 'lucide-react'

export default function DetailedForm() {
  return (
    <div className="py-20">
      <Container>
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
            <ClipboardList className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-display-sm text-enterprise-900 mb-4">Detailed Submission</h1>
          <p className="text-lg text-enterprise-600">
            Complete the 5-page submission wizard with your company profile, AI positioning, capabilities, track record, and contact information.
          </p>
        </div>
      </Container>
    </div>
  )
}
