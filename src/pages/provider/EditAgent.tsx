import { useParams } from 'react-router-dom'
import { Container } from '@/components/shared/Container'
import { Pencil } from 'lucide-react'

export default function EditAgent() {
  const { agentId } = useParams()

  return (
    <div className="py-20">
      <Container>
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
            <Pencil className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-display-sm text-enterprise-900 mb-4">Edit Agent</h1>
          <p className="text-lg text-enterprise-600">
            Update your agent listing. Changes will create an edit request for admin review — the live listing stays unchanged until approved.
          </p>
          <p className="mt-4 text-sm text-enterprise-400 font-mono">
            Agent ID: {agentId}
          </p>
        </div>
      </Container>
    </div>
  )
}
