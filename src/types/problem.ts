export interface ProblemStatement {
  id: string
  gcc_org_id: string
  gcc_user_id: string
  title: string
  description: string
  category: string
  industry: string
  desired_outcome: string
  timeline: 'immediate' | 'short' | 'medium' | 'long'
  budget_range: string
  status: 'pending_review' | 'approved' | 'rejected'
  interest_count: number
  rejection_reason: string | null
  created_at: string
}

export interface ProblemStatementInterest {
  id: string
  problem_statement_id: string
  provider_org_id: string
  provider_user_id: string
  provider_user_email: string
  created_at: string
}

