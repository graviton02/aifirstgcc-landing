import { Container } from '@/components/shared/Container'
import { MessageSquare } from 'lucide-react'

export default function ProblemsListing() {
  return (
    <div className="py-20">
      <Container>
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
            <MessageSquare className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-display-sm text-enterprise-900 mb-4">Problem Statements</h1>
          <p className="text-lg text-enterprise-600">
            Browse anonymized GCC problem statements and RFPs. Providers can express interest and connect through admin-facilitated introductions.
          </p>
        </div>
      </Container>
    </div>
  )
}
