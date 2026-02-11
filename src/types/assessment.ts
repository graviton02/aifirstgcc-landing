export interface SelfAssessment {
  id: string
  user_id: string
  org_id: string
  answers: Record<string, unknown>
  status: 'in_progress' | 'completed'
  completed_at: string | null
  created_at: string
  updated_at: string
}

export interface SelfAssessmentResult {
  id: string
  assessment_id: string
  overall_score: number | null
  category_scores: Record<string, number>
  analysis: Record<string, unknown>
  recommendations: unknown[]
  pdf_url: string | null
  created_at: string
}
