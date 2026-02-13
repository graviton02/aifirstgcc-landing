export interface AgentUseCase {
  title: string
  description: string
}

export interface ImpactMetric {
  type: string
  value: string
  description: string
}

export interface Agent {
  id: string
  agent_name: string
  tagline: string | null
  description: string
  category: string
  provider_profile_id: string
  logo_url: string | null
  tags: string[]
  use_cases: AgentUseCase[]
  industries: string[]
  integration_type: string | null
  supported_platforms: string[]
  data_requirements: string | null
  impact_metrics: ImpactMetric[]
  demo_url: string | null
  compliance_certifications: string[]
  security_features: string[]
  rating: number
  review_count: number
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string
}

export interface AgentSubmission extends Omit<Agent, 'id' | 'rating' | 'review_count' | 'status'> {
  id: string
  user_id: string
  submission_status: 'pending' | 'approved' | 'rejected' | 'changes_requested'
  admin_notes: string | null
}

export interface AgentEdit {
  id: string
  agent_id: string
  user_id: string
  payload: Record<string, unknown>
  status: 'pending' | 'approved' | 'rejected'
  admin_notes: string | null
  created_at: string
}

export interface AgentShortlist {
  id: string
  gcc_org_id: string
  agent_id: string
  created_by_user_id: string
  created_at: string
}

export interface ContactLog {
  id: string
  gcc_user_id: string
  gcc_org_id: string
  agent_id: string
  provider_profile_id: string
  contacted_at: string
}

export interface ProviderRequest {
  id: string
  provider_profile_id: string
  gcc_user_email: string
  gcc_org_id: string
  gcc_user_id: string
  agent_id: string
  message: string | null
  admin_notes: string | null
  reviewed_at: string | null
  status: 'pending_admin' | 'approved' | 'rejected' | 'contacted' | 'archived'
  created_at: string
}
