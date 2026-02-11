import { useParams } from 'react-router-dom'
import { Container } from '@/components/shared/Container'
import { Shield } from 'lucide-react'

export default function AdminDashboard() {
  const { secretToken } = useParams()

  return (
    <div className="py-20">
      <Container>
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-display-sm text-enterprise-900 mb-4">Admin Dashboard</h1>
          <p className="text-lg text-enterprise-600">
            Review and manage provider submissions, agent listings, and GCC problem statements. Approve, reject, or request changes on pending items.
          </p>
          <p className="mt-4 text-sm text-enterprise-400 font-mono">
            Session: {secretToken}
          </p>
        </div>
      </Container>
    </div>
  )
}
