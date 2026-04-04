export interface SourceLink {
  label: string
  url: string
}

export interface AIDevelopment {
  headline: string
  description: string
  source: SourceLink
}

export interface AIUseCase {
  title: string
  description: string
  source: SourceLink
}

export interface OpportunityPathway {
  title: string
  description: string
}

export interface RiskVector {
  title: string
  description: string
}

export interface DailyBrief {
  slug: string
  date: string
  editorHeadline?: string
  topDevelopments: [AIDevelopment, AIDevelopment, AIDevelopment]
  useCase: AIUseCase
  enterpriseImpact: string[]
  opportunities: OpportunityPathway[]
  risks: RiskVector[]
}
