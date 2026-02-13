import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import type { TspSubmission } from '@/types/provider'

const schema = z.object({
  gccs_enabled: z.coerce.number().min(0, 'Must be 0 or more'),
  impact_metrics: z.string().nullable().or(z.literal('')),
  case_studies: z.string().nullable().or(z.literal('')),
  industry_recognitions: z.string().nullable().or(z.literal('')),
})

type FormData = z.infer<typeof schema>

interface TspPage4Props {
  submission: TspSubmission | null
  onSave: (data: Partial<TspSubmission>) => void
  onSaveAndExit: (data: Partial<TspSubmission>) => void
  isSaving: boolean
}

export function TspPage4({ submission, onSave, onSaveAndExit, isSaving }: TspPage4Props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    getValues,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      gccs_enabled: 0,
      impact_metrics: '',
      case_studies: '',
      industry_recognitions: '',
    },
  })

  useEffect(() => {
    if (submission) {
      reset({
        gccs_enabled: submission.gccs_enabled ?? 0,
        impact_metrics: submission.impact_metrics ?? '',
        case_studies: submission.case_studies ?? '',
        industry_recognitions: submission.industry_recognitions ?? '',
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
        <h2 className="text-xl font-display font-bold text-enterprise-900">Track Record</h2>
        <p className="text-sm text-enterprise-500 mt-1">Your experience and achievements.</p>
      </div>

      <form onSubmit={handleSaveAndNext} className="space-y-5">
        <div>
          <label htmlFor="gccs_enabled" className="block text-sm font-medium text-enterprise-700 mb-1.5">
            GCCs Enabled
          </label>
          <input
            id="gccs_enabled"
            type="number"
            min={0}
            placeholder="0"
            {...register('gccs_enabled')}
            className="w-full px-4 py-2.5 rounded-xl border border-enterprise-200 bg-white text-enterprise-900 placeholder:text-enterprise-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
          />
          <p className="mt-1 text-xs text-enterprise-400">Number of GCC organizations you have supported</p>
          {errors.gccs_enabled && (
            <p className="mt-1 text-sm text-red-600">{errors.gccs_enabled.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="impact_metrics" className="block text-sm font-medium text-enterprise-700 mb-1.5">
            Impact Metrics
          </label>
          <textarea
            id="impact_metrics"
            rows={3}
            placeholder="Key metrics demonstrating your impact (e.g., cost savings, efficiency gains)..."
            {...register('impact_metrics')}
            className="w-full px-4 py-2.5 rounded-xl border border-enterprise-200 bg-white text-enterprise-900 placeholder:text-enterprise-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm resize-none"
          />
        </div>

        <div>
          <label htmlFor="case_studies" className="block text-sm font-medium text-enterprise-700 mb-1.5">
            Case Studies
          </label>
          <textarea
            id="case_studies"
            rows={3}
            placeholder="Brief summaries of relevant case studies..."
            {...register('case_studies')}
            className="w-full px-4 py-2.5 rounded-xl border border-enterprise-200 bg-white text-enterprise-900 placeholder:text-enterprise-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm resize-none"
          />
        </div>

        <div>
          <label htmlFor="industry_recognitions" className="block text-sm font-medium text-enterprise-700 mb-1.5">
            Industry Recognitions
          </label>
          <textarea
            id="industry_recognitions"
            rows={3}
            placeholder="Awards, certifications, analyst mentions..."
            {...register('industry_recognitions')}
            className="w-full px-4 py-2.5 rounded-xl border border-enterprise-200 bg-white text-enterprise-900 placeholder:text-enterprise-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm resize-none"
          />
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
    gccs_enabled: data.gccs_enabled ?? 0,
    impact_metrics: data.impact_metrics || null,
    case_studies: data.case_studies || null,
    industry_recognitions: data.industry_recognitions || null,
  }
}
