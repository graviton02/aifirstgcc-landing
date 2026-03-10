import { Container } from '@/components/shared/Container'
import { BarChart3 } from 'lucide-react'

export default function Benchmarks() {
  return (
    <div className="py-20">
      <Container>
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
            <BarChart3 className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-display-sm text-enterprise-900 mb-4">GCC Benchmarks</h1>
          <p className="text-lg text-enterprise-600">
            AI maturity indices and industry benchmarks for Global Capability Centers. Compare your organization against peers and identify areas for improvement.
          </p>
        </div>
      </Container>
    </div>
  )
}
