import { Container } from '@/components/shared/Container'
import { ListChecks } from 'lucide-react'

export default function CategorySelect() {
  return (
    <div className="py-20">
      <Container>
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
            <ListChecks className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-display-sm text-enterprise-900 mb-4">Select Provider Category</h1>
          <p className="text-lg text-enterprise-600">
            Choose your provider type to get started. Are you a Technology Service Provider (TSP) or an AI Startup? This determines your onboarding form.
          </p>
        </div>
      </Container>
    </div>
  )
}
