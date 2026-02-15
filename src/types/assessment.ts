// ---------------------------------------------------------------------------
// Assessment Question Types
// ---------------------------------------------------------------------------

export interface AssessmentAnswers {
  [questionId: string]: string
}

export interface ScoredAnswer {
  category: string
  questionId: string
  choice: string
  score: number
}

// ---------------------------------------------------------------------------
// Pillar Score & Analysis Types
// ---------------------------------------------------------------------------

export interface PillarRecommendations {
  short_term: string[]
  mid_term: string[]
}

export interface ConsultingAnalysis {
  current_state: Record<string, string[]>
  recommendations: Record<string, PillarRecommendations>
  next_steps: string[]
}

// ---------------------------------------------------------------------------
// Database Row Types
// ---------------------------------------------------------------------------

export interface SelfAssessment {
  id: string
  user_id: string
  org_id: string
  answers: AssessmentAnswers
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
  analysis: ConsultingAnalysis | Record<string, unknown>
  recommendations: unknown[]
  pdf_url: string | null
  created_at: string
}

// ---------------------------------------------------------------------------
// API Response Types
// ---------------------------------------------------------------------------

export interface SubmitAssessmentResponse {
  success: boolean
  assessmentId?: string
  resultId?: string
  error?: string
}
