import { useParams } from 'react-router-dom'
import { Container } from '@/components/shared/Container'
import { Bot } from 'lucide-react'

export default function AgentDetail() {
  const { agentId } = useParams()

  return (
    <div className="py-20">
      <Container>
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
            <Bot className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-display-sm text-enterprise-900 mb-4">Agent Detail</h1>
          <p className="text-lg text-enterprise-600">
            Full agent profile including description, use cases, industries served, integration details, impact metrics, and compliance information.
          </p>
          <p className="mt-4 text-sm text-enterprise-400 font-mono">
            Agent ID: {agentId}
          </p>
        </div>
      </Container>
    </div>
  )
}
