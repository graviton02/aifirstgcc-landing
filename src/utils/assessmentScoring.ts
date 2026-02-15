import type { AssessmentAnswers, ScoredAnswer } from '@/types/assessment'
import { assessmentPillars } from '@/data/selfAssessmentQuestions'

export function scoreAssessmentAnswers(answers: AssessmentAnswers): ScoredAnswer[] {
  const scoredAnswers: ScoredAnswer[] = []

  for (const pillar of assessmentPillars) {
    for (const question of pillar.questions) {
      const choice = answers[question.id]
      if (!choice) continue

      const choiceIndex = question.choices.findIndex((c) => c === choice)
      if (choiceIndex === -1) continue

      const score = choiceIndex + 1

      scoredAnswers.push({
        category: pillar.title,
        questionId: question.id,
        choice,
        score
      })
    }
  }

  return scoredAnswers
}

export function calculatePillarSummaries(scoredAnswers: ScoredAnswer[]) {
  const byCat: Record<string, { total: number; count: number }> = {}
  let overallTotal = 0

  for (const answer of scoredAnswers) {
    if (!byCat[answer.category]) {
      byCat[answer.category] = { total: 0, count: 0 }
    }
    byCat[answer.category].total += answer.score
    byCat[answer.category].count += 1
    overallTotal += answer.score
  }

  const categories = Object.entries(byCat).map(([category, v]) => ({
    category,
    average: v.count ? Number((v.total / v.count).toFixed(2)) : 0,
    total: v.total,
    count: v.count,
  }))

  const overallAverage = scoredAnswers.length
    ? Number((overallTotal / scoredAnswers.length).toFixed(2))
    : 0

  return {
    categories,
    overallTotal,
    overallAverage,
    itemCount: scoredAnswers.length
  }
}

export function validateAssessmentAnswers(answers: AssessmentAnswers): {
  isValid: boolean
  missingQuestions: string[]
  missingPillars: string[]
} {
  const missingQuestions: string[] = []
  const missingPillars: string[] = []

  for (const pillar of assessmentPillars) {
    let pillarComplete = true

    for (const question of pillar.questions) {
      if (!answers[question.id]) {
        missingQuestions.push(question.id)
        pillarComplete = false
      }
    }

    if (!pillarComplete) {
      missingPillars.push(pillar.title)
    }
  }

  return {
    isValid: missingQuestions.length === 0,
    missingQuestions,
    missingPillars
  }
}
