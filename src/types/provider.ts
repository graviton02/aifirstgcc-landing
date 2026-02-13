export interface ProviderProfile {
  id: string
  user_id: string
  organization_id: string
  company_name: string
  location: string
  company_size: string
  logo_url: string | null
  website: string | null
  category: 'tsp' | 'startup'
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  updated_at: string
}

export interface TspSubmission {
  id: string
  provider_profile_id: string
  user_id: string
  logo_url: string | null
  website: string | null
  founding_year: number | null
  about_text: string | null
  core_positioning: string | null
  ai_first_definition: string | null
  unique_differentiators: string | null
  ai_enabled_workflows: string[]
  governance_frameworks: string[]
  service_offerings: string[]
  gccs_enabled: number
  impact_metrics: string | null
  case_studies: string | null
  industry_recognitions: string | null
  agent_native_vision: string | null
  expansion_plans: string | null
  contact_name: string | null
  contact_email: string | null
  contact_phone: string | null
  completed_pages: number[]
  submission_status: 'draft' | 'pending' | 'approved' | 'rejected' | 'changes_requested'
  admin_notes: string | null
  created_at: string
  updated_at: string
}

export interface StartupSubmission {
  id: string
  provider_profile_id: string
  user_id: string
  logo_url: string | null
  website: string | null
  founding_year: number | null
  funding_stage: string | null
  product_description: string | null
  ai_capabilities: string | null
  tech_stack: string | null
  target_industries: string[]
  customer_segments: string[]
  key_metrics: string | null
  certifications: string[]
  data_privacy_posture: string | null
  security_measures: string | null
  contact_name: string | null
  contact_email: string | null
  contact_phone: string | null
  partnership_interests: string | null
  completed_pages: number[]
  submission_status: 'draft' | 'pending' | 'approved' | 'rejected' | 'changes_requested'
  admin_notes: string | null
  created_at: string
  updated_at: string
}

export interface TspEdit {
  id: string
  tsp_id: string
  user_id: string
  payload: Record<string, unknown>
  status: 'pending' | 'approved' | 'rejected'
  admin_notes: string | null
  created_at: string
}
