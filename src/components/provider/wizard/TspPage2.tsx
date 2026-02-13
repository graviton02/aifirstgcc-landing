import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import type { TspSubmission } from '@/types/provider'

const schema = z.object({
  core_positioning: z.string().min(10, 'Describe your core positioning (at least 10 characters)'),
  ai_first_definition: z.string().min(10, 'Describe what AI-first means to you'),
  unique_differentiators: z.string().min(10, 'Describe what differentiates you'),
})

type FormData = z.infer<typeof schema>

interface TspPage2Props {
  submission: TspSubmission | null
  onSave: (data: Partial<TspSubmission>) => void
  onSaveAndExit: (data: Partial<TspSubmission>) => void
  isSaving: boolean
}

export function TspPage2({ submission, onSave, onSaveAndExit, isSaving }: TspPage2Props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    getValues,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      core_positioning: '',
      ai_first_definition: '',
      unique_differentiators: '',
    },
  })

  useEffect(() => {
    if (submission) {
      reset({
        core_positioning: submission.core_positioning ?? '',
        ai_first_definition: submission.ai_first_definition ?? '',
        unique_differentiators: submission.unique_differentiators ?? '',
      })
    }
  }, [submission, reset])

  const handleSaveAndNext = handleSubmit((data) => {
    onSave(cleanData(data))
  })

  const handleSaveAndExit = () => {
    const data = getValues()
    onSaveAndExit(cleanData(data))
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-display font-bold text-enterprise-900">AI-First Positioning</h2>
        <p className="text-sm text-enterprise-500 mt-1">How your company leads with AI.</p>
      </div>

      <form onSubmit={handleSaveAndNext} className="space-y-5">
        <div>
          <label htmlFor="core_positioning" className="block text-sm font-medium text-enterprise-700 mb-1.5">
            Core Positioning
          </label>
          <textarea
            id="core_positioning"
            rows={3}
            placeholder="How do you position your firm in the AI advisory space?"
            {...register('core_positioning')}
            className="w-full px-4 py-2.5 rounded-xl border border-enterprise-200 bg-white text-enterprise-900 placeholder:text-enterprise-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm resize-none"
          />
          {errors.core_positioning && (
            <p className="mt-1 text-sm text-red-600">{errors.core_positioning.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="ai_first_definition" className="block text-sm font-medium text-enterprise-700 mb-1.5">
            AI-First Definition
          </label>
          <textarea
            id="ai_first_definition"
            rows={3}
            placeholder="What does 'AI-first' mean for your company and clients?"
            {...register('ai_first_definition')}
            className="w-full px-4 py-2.5 rounded-xl border border-enterprise-200 bg-white text-enterprise-900 placeholder:text-enterprise-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm resize-none"
          />
          {errors.ai_first_definition && (
            <p className="mt-1 text-sm text-red-600">{errors.ai_first_definition.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="unique_differentiators" className="block text-sm font-medium text-enterprise-700 mb-1.5">
            Unique Differentiators
          </label>
          <textarea
            id="unique_differentiators"
            rows={3}
            placeholder="What sets you apart from other technology service providers?"
            {...register('unique_differentiators')}
            className="w-full px-4 py-2.5 rounded-xl border border-enterprise-200 bg-white text-enterprise-900 placeholder:text-enterprise-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm resize-none"
          />
          {errors.unique_differentiators && (
            <p className="mt-1 text-sm text-red-600">{errors.unique_differentiators.message}</p>
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-enterprise-100">
          <button
            type="button"
            onClick={handleSaveAndExit}
            disabled={isSaving}
            className="px-4 py-2 rounded-lg border border-enterprise-200 text-sm font-medium text-enterprise-600 hover:bg-enterprise-50 transition-colors disabled:opacity-60"
          >
            Save & Exit
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 transition-colors disabled:opacity-60 flex items-center gap-2"
          >
            {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
            Save & Next
          </button>
        </div>
      </form>
    </div>
  )
}

function cleanData(data: FormData): Partial<TspSubmission> {
  return {
    core_positioning: data.core_positioning || null,
    ai_first_definition: data.ai_first_definition || null,
    unique_differentiators: data.unique_differentiators || null,
  }
}
