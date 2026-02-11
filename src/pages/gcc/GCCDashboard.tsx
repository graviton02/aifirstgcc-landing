import { Container } from '@/components/shared/Container'
import { LayoutDashboard } from 'lucide-react'

export default function GCCDashboard() {
  return (
    <div className="py-20">
      <Container>
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
            <LayoutDashboard className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-display-sm text-enterprise-900 mb-4">GCC Dashboard</h1>
          <p className="text-lg text-enterprise-600">
            Your command center for AI transformation. Manage shortlisted agents, track provider contacts, and submit problem statements for the marketplace.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4 text-sm text-enterprise-500">
            <span className="px-3 py-1.5 rounded-lg bg-enterprise-100 font-medium">Shortlisted Agents</span>
            <span className="px-3 py-1.5 rounded-lg bg-enterprise-100 font-medium">Current Requests</span>
            <span className="px-3 py-1.5 rounded-lg bg-enterprise-100 font-medium">Problem Hub</span>
          </div>
        </div>
      </Container>
    </div>
  )
}
