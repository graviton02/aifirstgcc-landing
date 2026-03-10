import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser, useOrganization } from '@clerk/clerk-react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ClipboardCheck,
  ChevronLeft,
  ChevronRight,
  Check,
  Loader2,
  AlertCircle,
  Send,
  Brain,
} from 'lucide-react'
import { Container } from '@/components/shared/Container'
import { AnimatedSection } from '@/components/shared/AnimatedSection'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { assessmentPillars } from '@/data/selfAssessmentQuestions'
import type { AssessmentAnswers } from '@/types/assessment'
import {
  useSelfAssessment,
  useCreateAssessment,
  useUpdateAssessment,
  useSubmitAssessment,
} from '@/hooks/use-assessment'

const TOTAL_QUESTIONS = assessmentPillars.reduce((sum, p) => sum + p.questions.length, 0)

const MATURITY_LABELS = ['Level 1', 'Level 2', 'Level 3', 'Level 4', 'Level 5']

function countAnsweredInPillar(pillarIndex: number, answers: AssessmentAnswers): number {
  const pillar = assessmentPillars[pillarIndex]
  return pillar.questions.filter((q) => !!answers[q.id]).length
}

function countTotalAnswered(answers: AssessmentAnswers): number {
  return assessmentPillars.reduce((sum, _, i) => sum + countAnsweredInPillar(i, answers), 0)
}

function isPillarComplete(pillarIndex: number, answers: AssessmentAnswers): boolean {
  return countAnsweredInPillar(pillarIndex, answers) === assessmentPillars[pillarIndex].questions.length
}

// ---------------------------------------------------------------------------
// Processing overlay shown while AI is analyzing
// ---------------------------------------------------------------------------

function ProcessingOverlay() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-enterprise-950/70 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl shadow-card-hover p-10 max-w-md w-full mx-4 text-center"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 mb-6">
          <Brain className="w-8 h-8 text-white animate-pulse" />
        </div>
        <h3 className="text-xl font-display font-bold text-enterprise-900 mb-2">
          Analyzing Your Responses
        </h3>
        <p className="text-enterprise-600 mb-6">
          Our AI is evaluating your assessment across all 7 pillars to generate
          personalized recommendations and a maturity score.
        </p>
        <div className="flex items-center justify-center gap-2 text-primary">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm font-medium">This may take 15-30 seconds...</span>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function SelfAssessment() {
  const navigate = useNavigate()
  const { user } = useUser()
  const { organization } = useOrganization()

  const userId = user?.id
  const orgId = organization?.id

  // State
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<AssessmentAnswers>({})
  const [assessmentId, setAssessmentId] = useState<string | null>(null)
  const [initialized, setInitialized] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [showMobileSidebar, setShowMobileSidebar] = useState(false)

  // Ref to track if we've restored answers already
  const restoredRef = useRef(false)

  // Queries & mutations
  const { data: existingAssessment, isLoading: assessmentLoading } = useSelfAssessment(
    userId ?? undefined,
    orgId ?? undefined,
  )
  const createAssessment = useCreateAssessment()
  const updateAssessment = useUpdateAssessment()
  const submitAssessment = useSubmitAssessment()

  // ---------------------------------------------------------------------------
  // Initialize: resume or create assessment
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!userId || !orgId || assessmentLoading || initialized) return

    if (existingAssessment && existingAssessment.status === 'in_progress') {
      // Resume existing assessment
      setAssessmentId(existingAssessment.id)
      if (!restoredRef.current && existingAssessment.answers) {
        const restored = existingAssessment.answers as AssessmentAnswers
        setAnswers(restored)
        restoredRef.current = true

        // Jump to first incomplete pillar
        const firstIncomplete = assessmentPillars.findIndex(
          (_, i) => !isPillarComplete(i, restored),
        )
        if (firstIncomplete !== -1) {
          setCurrentStep(firstIncomplete)
        }
      }
      setInitialized(true)
    } else if (existingAssessment && existingAssessment.status === 'completed') {
      // Already completed — navigate to results
      navigate(`/self-assessment/result/${existingAssessment.id}`, { replace: true })
    } else if (!existingAssessment) {
      // Create new assessment
      createAssessment.mutate(
        { userId, orgId },
        {
          onSuccess: (data) => {
            setAssessmentId(data.id)
            setInitialized(true)
          },
        },
      )
    }
  }, [
    userId,
    orgId,
    existingAssessment,
    assessmentLoading,
    initialized,
    createAssessment,
    navigate,
  ])

  // ---------------------------------------------------------------------------
  // Auto-save on step navigation
  // ---------------------------------------------------------------------------
  const saveAnswers = useCallback(() => {
    if (!assessmentId || Object.keys(answers).length === 0) return
    updateAssessment.mutate({ id: assessmentId, answers })
  }, [assessmentId, answers, updateAssessment])

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------
  const handleAnswer = useCallback((questionId: string, choice: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: choice }))
  }, [])

  const goToStep = useCallback(
    (step: number) => {
      saveAnswers()
      setCurrentStep(step)
      setShowMobileSidebar(false)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    [saveAnswers],
  )

  const goNext = useCallback(() => {
    if (currentStep < assessmentPillars.length - 1) {
      goToStep(currentStep + 1)
    }
  }, [currentStep, goToStep])

  const goPrev = useCallback(() => {
    if (currentStep > 0) {
      goToStep(currentStep - 1)
    }
  }, [currentStep, goToStep])

  const handleSubmit = useCallback(() => {
    if (!assessmentId) return
    setSubmitError(null)

    submitAssessment.mutate(
      { id: assessmentId, answers },
      {
        onSuccess: (data) => {
          navigate(`/self-assessment/result/${data.assessmentId}`)
        },
        onError: (error) => {
          setSubmitError(error instanceof Error ? error.message : 'Submission failed. Please try again.')
        },
      },
    )
  }, [assessmentId, answers, submitAssessment, navigate])

  // ---------------------------------------------------------------------------
  // Derived state
  // ---------------------------------------------------------------------------
  const totalAnswered = countTotalAnswered(answers)
  const progressPercent = Math.round((totalAnswered / TOTAL_QUESTIONS) * 100)
  const currentPillar = assessmentPillars[currentStep]
  const currentPillarAnswered = countAnsweredInPillar(currentStep, answers)
  const currentPillarTotal = currentPillar.questions.length
  const isLastStep = currentStep === assessmentPillars.length - 1
  const allComplete = totalAnswered === TOTAL_QUESTIONS

  // ---------------------------------------------------------------------------
  // Loading state
  // ---------------------------------------------------------------------------
  if (!userId || !orgId || assessmentLoading || !initialized) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  return (
    <>
      {/* Processing overlay */}
      <AnimatePresence>
        {submitAssessment.isPending && <ProcessingOverlay />}
      </AnimatePresence>

      <div className="py-8 min-h-screen bg-enterprise-50/50">
        <Container size="wide">
          {/* ----------------------------------------------------------------- */}
          {/* Header */}
          {/* ----------------------------------------------------------------- */}
          <AnimatedSection>
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                  <ClipboardCheck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-display-sm text-enterprise-900">
                    AI Readiness Assessment
                  </h1>
                  <p className="text-sm text-enterprise-500">
                    7 pillars &middot; 28 questions &middot; ~10 min
                  </p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="bg-white rounded-xl border border-enterprise-200 p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-enterprise-700">
                    Overall Progress
                  </span>
                  <span className="text-sm font-semibold text-primary">
                    {totalAnswered}/{TOTAL_QUESTIONS} answered ({progressPercent}%)
                  </span>
                </div>
                <div className="h-2.5 bg-enterprise-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                  />
                </div>
              </div>
            </div>
          </AnimatedSection>

          {/* ----------------------------------------------------------------- */}
          {/* Mobile pillar selector button */}
          {/* ----------------------------------------------------------------- */}
          <div className="lg:hidden mb-4">
            <button
              onClick={() => setShowMobileSidebar(!showMobileSidebar)}
              className="w-full flex items-center justify-between bg-white rounded-xl border border-enterprise-200 px-4 py-3 text-sm font-medium text-enterprise-700 shadow-sm"
            >
              <span>
                {currentPillar.title} ({currentPillarAnswered}/{currentPillarTotal})
              </span>
              <ChevronRight
                className={cn(
                  'w-4 h-4 transition-transform',
                  showMobileSidebar && 'rotate-90',
                )}
              />
            </button>

            {/* Mobile pillar dropdown */}
            <AnimatePresence>
              {showMobileSidebar && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="mt-2 bg-white rounded-xl border border-enterprise-200 shadow-sm divide-y divide-enterprise-100">
                    {assessmentPillars.map((pillar, index) => {
                      const complete = isPillarComplete(index, answers)
                      const answered = countAnsweredInPillar(index, answers)
                      const isActive = index === currentStep
                      return (
                        <button
                          key={pillar.id}
                          onClick={() => goToStep(index)}
                          className={cn(
                            'w-full flex items-center gap-3 px-4 py-3 text-left text-sm transition-colors',
                            isActive
                              ? 'bg-primary/5 text-primary font-semibold'
                              : 'text-enterprise-600 hover:bg-enterprise-50',
                          )}
                        >
                          <div
                            className={cn(
                              'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0',
                              complete
                                ? 'bg-green-100 text-green-700'
                                : isActive
                                  ? 'bg-primary/10 text-primary'
                                  : 'bg-enterprise-100 text-enterprise-500',
                            )}
                          >
                            {complete ? <Check className="w-3.5 h-3.5" /> : index + 1}
                          </div>
                          <span className="flex-1 truncate">{pillar.title}</span>
                          <span className="text-xs text-enterprise-400">
                            {answered}/{pillar.questions.length}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ----------------------------------------------------------------- */}
          {/* Two-column layout: sidebar + questions */}
          {/* ----------------------------------------------------------------- */}
          <div className="flex gap-6">
            {/* ============================================================= */}
            {/* Desktop sidebar */}
            {/* ============================================================= */}
            <aside className="hidden lg:block w-72 flex-shrink-0">
              <div className="sticky top-24">
                <nav className="bg-white rounded-xl border border-enterprise-200 shadow-sm overflow-hidden">
                  <div className="px-4 py-3 border-b border-enterprise-100">
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-enterprise-500">
                      Assessment Pillars
                    </h2>
                  </div>
                  <ul className="py-1">
                    {assessmentPillars.map((pillar, index) => {
                      const complete = isPillarComplete(index, answers)
                      const answered = countAnsweredInPillar(index, answers)
                      const isActive = index === currentStep
                      return (
                        <li key={pillar.id}>
                          <button
                            onClick={() => goToStep(index)}
                            className={cn(
                              'w-full flex items-center gap-3 px-4 py-3 text-left text-sm transition-all',
                              isActive
                                ? 'bg-primary/5 text-primary font-semibold border-l-3 border-primary'
                                : 'text-enterprise-600 hover:bg-enterprise-50 border-l-3 border-transparent',
                            )}
                          >
                            <div
                              className={cn(
                                'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors',
                                complete
                                  ? 'bg-green-100 text-green-700'
                                  : isActive
                                    ? 'bg-primary/10 text-primary'
                                    : 'bg-enterprise-100 text-enterprise-500',
                              )}
                            >
                              {complete ? <Check className="w-3.5 h-3.5" /> : index + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="block truncate">{pillar.title}</span>
                              <span
                                className={cn(
                                  'text-xs',
                                  complete ? 'text-green-600' : 'text-enterprise-400',
                                )}
                              >
                                {answered}/{pillar.questions.length} answered
                              </span>
                            </div>
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                </nav>
              </div>
            </aside>

            {/* ============================================================= */}
            {/* Main content — questions */}
            {/* ============================================================= */}
            <main className="flex-1 min-w-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                >
                  {/* Pillar header */}
                  <div className="bg-white rounded-xl border border-enterprise-200 shadow-sm p-6 mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-1">
                          Step {currentStep + 1} of {assessmentPillars.length}
                        </p>
                        <h2 className="text-xl font-display font-bold text-enterprise-900">
                          {currentPillar.title}
                        </h2>
                      </div>
                      <div
                        className={cn(
                          'text-sm font-medium px-3 py-1 rounded-full',
                          isPillarComplete(currentStep, answers)
                            ? 'bg-green-100 text-green-700'
                            : 'bg-enterprise-100 text-enterprise-500',
                        )}
                      >
                        {currentPillarAnswered}/{currentPillarTotal}
                      </div>
                    </div>
                  </div>

                  {/* Questions */}
                  <div className="space-y-4">
                    {currentPillar.questions.map((question, qIndex) => {
                      const selectedChoice = answers[question.id] || null
                      return (
                        <motion.div
                          key={question.id}
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: qIndex * 0.05 }}
                          className="bg-white rounded-xl border border-enterprise-200 shadow-sm p-6"
                        >
                          <p className="text-sm font-semibold text-enterprise-900 mb-4">
                            <span className="text-primary mr-2">
                              Q{qIndex + 1}.
                            </span>
                            {question.text}
                          </p>
                          <div className="space-y-2">
                            {question.choices.map((choice, choiceIndex) => {
                              const isSelected = selectedChoice === choice
                              return (
                                <label
                                  key={choice}
                                  className={cn(
                                    'flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all',
                                    isSelected
                                      ? 'border-primary bg-primary/5 shadow-sm'
                                      : 'border-enterprise-200 hover:border-enterprise-300 hover:bg-enterprise-50',
                                  )}
                                >
                                  <div className="flex-shrink-0 mt-0.5">
                                    <div
                                      className={cn(
                                        'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors',
                                        isSelected
                                          ? 'border-primary bg-primary'
                                          : 'border-enterprise-300',
                                      )}
                                    >
                                      {isSelected && (
                                        <div className="w-2 h-2 rounded-full bg-white" />
                                      )}
                                    </div>
                                  </div>
                                  <input
                                    type="radio"
                                    name={question.id}
                                    value={choice}
                                    checked={isSelected}
                                    onChange={() => handleAnswer(question.id, choice)}
                                    className="sr-only"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <span className="text-sm text-enterprise-700 leading-relaxed">
                                      {choice}
                                    </span>
                                  </div>
                                  <span
                                    className={cn(
                                      'flex-shrink-0 text-xs font-medium px-2 py-0.5 rounded-full',
                                      isSelected
                                        ? 'bg-primary/10 text-primary'
                                        : 'bg-enterprise-100 text-enterprise-400',
                                    )}
                                  >
                                    {MATURITY_LABELS[choiceIndex]}
                                  </span>
                                </label>
                              )
                            })}
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>

                  {/* Submit error */}
                  {submitError && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4"
                    >
                      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-red-800">Submission Error</p>
                        <p className="text-sm text-red-600 mt-0.5">{submitError}</p>
                      </div>
                    </motion.div>
                  )}

                  {/* --------------------------------------------------------- */}
                  {/* Navigation buttons */}
                  {/* --------------------------------------------------------- */}
                  <div className="mt-6 flex items-center justify-between">
                    <Button
                      variant="secondary"
                      onClick={goPrev}
                      disabled={currentStep === 0}
                      className={cn(currentStep === 0 && 'invisible')}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </Button>

                    <div className="flex items-center gap-3">
                      {/* Save indicator */}
                      {updateAssessment.isPending && (
                        <span className="text-xs text-enterprise-400 flex items-center gap-1">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Saving...
                        </span>
                      )}

                      {isLastStep ? (
                        <Button
                          onClick={handleSubmit}
                          disabled={!allComplete || submitAssessment.isPending}
                          title={
                            !allComplete
                              ? `Answer all ${TOTAL_QUESTIONS} questions before submitting`
                              : undefined
                          }
                        >
                          <Send className="w-4 h-4" />
                          Submit Assessment
                        </Button>
                      ) : (
                        <Button onClick={goNext}>
                          Next
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Incomplete warning on last step */}
                  {isLastStep && !allComplete && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-4 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4"
                    >
                      <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-amber-800">
                          Assessment Incomplete
                        </p>
                        <p className="text-sm text-amber-600 mt-0.5">
                          Please answer all {TOTAL_QUESTIONS} questions before
                          submitting. You have {TOTAL_QUESTIONS - totalAnswered} remaining
                          across{' '}
                          {assessmentPillars.filter((_, i) => !isPillarComplete(i, answers)).length}{' '}
                          pillar(s).
                        </p>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              </AnimatePresence>
            </main>
          </div>
        </Container>
      </div>
    </>
  )
}
