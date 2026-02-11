import { Container } from '@/components/shared/Container'
import { Bot } from 'lucide-react'

export default function OrbytLanding() {
  return (
    <div className="py-20">
      <Container>
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
            <Bot className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-display-sm text-enterprise-900 mb-4">Orbyt Agent Marketplace</h1>
          <p className="text-lg text-enterprise-600">
            Discover AI agents purpose-built for Global Capability Centers. Browse by category, compare capabilities, and find the right solutions for your enterprise workflows.
          </p>
        </div>
      </Container>
    </div>
  )
}
