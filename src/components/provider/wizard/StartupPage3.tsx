import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import type { StartupSubmission } from '@/types/provider'

const schema = z.object({
  target_industries: z.string().min(1, 'Add at least one target industry'),
  customer_segments: z.string().min(1, 'Add at least one customer segment'),
  key_metrics: z.string().nullable().or(z.literal('')),
})

type FormData = z.infer<typeof schema>

interface StartupPage3Props {
  submission: StartupSubmission | null
  onSave: (data: Partial<StartupSubmission>) => void
  onSaveAndExit: (data: Partial<StartupSubmission>) => void
  isSaving: boolean
}

export function StartupPage3({ submission, onSave, onSaveAndExit, isSaving }: StartupPage3Props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    getValues,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      target_industries: '',
      customer_segments: '',
      key_metrics: '',
    },
  })

  useEffect(() => {
    if (submission) {
      reset({
        target_industries: (submission.target_industries ?? []).join(', '),
        customer_segments: (submission.customer_segments ?? []).join(', '),
        key_metrics: submission.key_metrics ?? '',
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
        <h2 className="text-xl font-display font-bold text-enterprise-900">Market & Traction</h2>
        <p className="text-sm text-enterprise-500 mt-1">Your target market and key metrics.</p>
      </div>

      <form onSubmit={handleSaveAndNext} className="space-y-5">
        <div>
          <label htmlFor="target_industries" className="block text-sm font-medium text-enterprise-700 mb-1.5">
            Target Industries
          </label>
          <textarea
            id="target_industries"
            rows={3}
            placeholder="Financial services, healthcare, retail..."
            {...register('target_industries')}
            className="w-full px-4 py-2.5 rounded-xl border border-enterprise-200 bg-white text-enterprise-900 placeholder:text-enterprise-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm resize-none"
          />
          <p className="mt-1 text-xs text-enterprise-400">Separate items with commas</p>
          {errors.target_industries && (
            <p className="mt-1 text-sm text-red-600">{errors.target_industries.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="customer_segments" className="block text-sm font-medium text-enterprise-700 mb-1.5">
            Customer Segments
          </label>
          <textarea
            id="customer_segments"
            rows={3}
            placeholder="Enterprise, mid-market, SMB..."
            {...register('customer_segments')}
            className="w-full px-4 py-2.5 rounded-xl border border-enterprise-200 bg-white text-enterprise-900 placeholder:text-enterprise-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm resize-none"
          />
          <p className="mt-1 text-xs text-enterprise-400">Separate items with commas</p>
          {errors.customer_segments && (
            <p className="mt-1 text-sm text-red-600">{errors.customer_segments.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="key_metrics" className="block text-sm font-medium text-enterprise-700 mb-1.5">
            Key Metrics
          </label>
          <textarea
            id="key_metrics"
            rows={3}
            placeholder="ARR, user count, growth rate, customers served..."
            {...register('key_metrics')}
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

function parseCSV(value: string): string[] {
  return value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

function cleanData(data: FormData): Partial<StartupSubmission> {
  return {
    target_industries: parseCSV(data.target_industries),
    customer_segments: parseCSV(data.customer_segments),
    key_metrics: data.key_metrics || null,
  }
}
