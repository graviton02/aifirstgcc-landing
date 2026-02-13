import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Loader2, AlertCircle } from 'lucide-react'
import { useSubmitProblem } from '@/hooks/use-gcc'
import { AGENT_CATEGORIES } from '@/data/constants/agentCategories'
import type { ProblemStatement } from '@/types/problem'

const budgetOptions = [
  'Under $10K',
  '$10K – $50K',
  '$50K – $100K',
  '$100K+',
  'Open to discuss',
] as const

const timelineOptions = [
  { value: 'immediate', label: 'Immediate (< 1 month)' },
  { value: 'short', label: 'Short-term (1–3 months)' },
  { value: 'medium', label: 'Medium-term (3–6 months)' },
  { value: 'long', label: 'Long-term (6+ months)' },
] as const

const schema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters').max(200, 'Title must be under 200 characters'),
  description: z.string().min(100, 'Description must be at least 100 characters').max(5000, 'Description must be under 5000 characters'),
  category: z.string().min(1, 'Category is required'),
  industry: z.string().min(1, 'Industry is required'),
  desired_outcome: z.string().min(1, 'Desired outcome is required'),
  timeline: z.enum(['immediate', 'short', 'medium', 'long'], { required_error: 'Timeline is required' }),
  budget_range: z.string().min(1, 'Budget range is required'),
})

type FormData = z.infer<typeof schema>

interface ProblemSubmitModalProps {
  isOpen: boolean
  onClose: () => void
  orgId: string
  userId: string
}

export function ProblemSubmitModal({ isOpen, onClose, orgId, userId }: ProblemSubmitModalProps) {
  const submitProblem = useSubmitProblem()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onChange',
  })

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      reset()
      submitProblem.reset()
    }
  }, [isOpen]) // eslint-disable-line react-hooks/exhaustive-deps

  // Close on ESC
  useEffect(() => {
    if (!isOpen) return
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  function onSubmit(data: FormData) {
    submitProblem.mutate(
      {
        gcc_org_id: orgId,
        gcc_user_id: userId,
        title: data.title.trim(),
        description: data.description.trim(),
        category: data.category,
        industry: data.industry.trim(),
        desired_outcome: data.desired_outcome.trim(),
        timeline: data.timeline as ProblemStatement['timeline'],
        budget_range: data.budget_range,
      },
      { onSuccess: onClose },
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Panel */}
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white rounded-t-2xl border-b border-enterprise-100 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-lg font-display font-bold text-enterprise-900">
            Submit Problem Statement
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-enterprise-400 hover:text-enterprise-600 hover:bg-enterprise-50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-4">
          {/* Title */}
          <Field label="Title" error={errors.title?.message} required>
            <input
              {...register('title')}
              placeholder="Briefly describe your challenge..."
              className="w-full px-3 py-2 rounded-lg border border-enterprise-200 bg-white text-sm text-enterprise-900 placeholder:text-enterprise-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </Field>

          {/* Description */}
          <Field label="Description" error={errors.description?.message} required>
            <textarea
              {...register('description')}
              placeholder="Provide details about the problem, current pain points, and scope (min 100 characters)..."
              rows={4}
              className="w-full px-3 py-2 rounded-lg border border-enterprise-200 bg-white text-sm text-enterprise-900 placeholder:text-enterprise-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            />
          </Field>

          {/* Category + Industry */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Category" error={errors.category?.message} required>
              <select
                {...register('category')}
                className="w-full px-3 py-2 rounded-lg border border-enterprise-200 bg-white text-sm text-enterprise-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Select category</option>
                {AGENT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </Field>

            <Field label="Industry" error={errors.industry?.message} required>
              <input
                {...register('industry')}
                placeholder="e.g., Healthcare, Finance..."
                className="w-full px-3 py-2 rounded-lg border border-enterprise-200 bg-white text-sm text-enterprise-900 placeholder:text-enterprise-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </Field>
          </div>

          {/* Desired Outcome */}
          <Field label="Desired Outcome" error={errors.desired_outcome?.message} required>
            <textarea
              {...register('desired_outcome')}
              placeholder="What would a successful solution look like?"
              rows={2}
              className="w-full px-3 py-2 rounded-lg border border-enterprise-200 bg-white text-sm text-enterprise-900 placeholder:text-enterprise-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            />
          </Field>

          {/* Timeline + Budget */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Timeline" error={errors.timeline?.message} required>
              <select
                {...register('timeline')}
                className="w-full px-3 py-2 rounded-lg border border-enterprise-200 bg-white text-sm text-enterprise-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Select timeline</option>
                {timelineOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </Field>

            <Field label="Budget Range" error={errors.budget_range?.message} required>
              <select
                {...register('budget_range')}
                className="w-full px-3 py-2 rounded-lg border border-enterprise-200 bg-white text-sm text-enterprise-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Select budget</option>
                {budgetOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </Field>
          </div>

          {/* API error */}
          {submitProblem.isError && (
            <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 rounded-lg p-3">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              {submitProblem.error.message}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={!isValid || submitProblem.isPending}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitProblem.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Submit Problem
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-enterprise-600 hover:bg-enterprise-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Field wrapper
// ---------------------------------------------------------------------------

function Field({
  label,
  error,
  required,
  children,
}: {
  label: string
  error?: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-enterprise-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}
