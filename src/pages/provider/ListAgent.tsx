import { Container } from '@/components/shared/Container'
import { PlusCircle } from 'lucide-react'

export default function ListAgent() {
  return (
    <div className="py-20">
      <Container>
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
            <PlusCircle className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-display-sm text-enterprise-900 mb-4">List Your Agent</h1>
          <p className="text-lg text-enterprise-600">
            Submit a new AI agent to the Orbyt marketplace. Complete the 5-step wizard covering agent basics, use cases, integration details, impact metrics, and extras.
          </p>
        </div>
      </Container>
    </div>
  )
}
