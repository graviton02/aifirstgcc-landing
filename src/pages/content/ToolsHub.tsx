import { Container } from '@/components/shared/Container'
import { Wrench } from 'lucide-react'

export default function ToolsHub() {
  return (
    <div className="py-20">
      <Container>
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
            <Wrench className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-display-sm text-enterprise-900 mb-4">AI-First Tools</h1>
          <p className="text-lg text-enterprise-600">
            Practical tools for GCC leaders: Self-Assessment questionnaire, AI-First Charter template, Skills Taxonomy, Workflow Kit, Business Case calculator, and Use Case frameworks.
          </p>
        </div>
      </Container>
    </div>
  )
}
