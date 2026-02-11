import { Container } from '@/components/shared/Container'
import { Building2 } from 'lucide-react'

export default function ProvidersPage() {
  return (
    <div className="py-20">
      <Container>
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
            <Building2 className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-display-sm text-enterprise-900 mb-4">Provider Ecosystem</h1>
          <p className="text-lg text-enterprise-600">
            Explore the growing network of technology service providers and AI startups building the future of GCC operations. Learn how partners are driving AI-first transformation.
          </p>
        </div>
      </Container>
    </div>
  )
}
