import { Container } from '@/components/shared/Container'
import { Search } from 'lucide-react'

export default function MarketplaceListing() {
  return (
    <div className="py-20">
      <Container>
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
            <Search className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-display-sm text-enterprise-900 mb-4">Agent Marketplace</h1>
          <p className="text-lg text-enterprise-600">
            Search, filter, and browse AI agents across 25 functional categories. Find solutions for Customer Service, Operations, Finance, HR, and more.
          </p>
        </div>
      </Container>
    </div>
  )
}
