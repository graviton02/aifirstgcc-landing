import { Container } from '@/components/shared/Container'
import { BookOpen } from 'lucide-react'

export default function ThoughtLeadership() {
  return (
    <div className="py-20">
      <Container>
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
            <BookOpen className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-display-sm text-enterprise-900 mb-4">Thought Leadership</h1>
          <p className="text-lg text-enterprise-600">
            In-depth articles on AI-first GCC transformation. Topics include governance frameworks, talent strategy, operational models, and benchmarking best practices.
          </p>
        </div>
      </Container>
    </div>
  )
}
