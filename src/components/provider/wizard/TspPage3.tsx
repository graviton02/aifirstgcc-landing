import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import type { TspSubmission } from '@/types/provider'

const schema = z.object({
  ai_enabled_workflows: z.string().min(1, 'Add at least one workflow'),
  governance_frameworks: z.string().min(1, 'Add at least one framework'),
  service_offerings: z.string().min(1, 'Add at least one service offering'),
})

type FormData = z.infer<typeof schema>

interface TspPage3Props {
  submission: TspSubmission | null
  onSave: (data: Partial<TspSubmission>) => void
  onSaveAndExit: (data: Partial<TspSubmission>) => void
  isSaving: boolean
}

export function TspPage3({ submission, onSave, onSaveAndExit, isSaving }: TspPage3Props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    getValues,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      ai_enabled_workflows: '',
      governance_frameworks: '',
      service_offerings: '',
    },
  })

  useEffect(() => {
    if (submission) {
      reset({
        ai_enabled_workflows: (submission.ai_enabled_workflows ?? []).join(', '),
        governance_frameworks: (submission.governance_frameworks ?? []).join(', '),
        service_offerings: (submission.service_offerings ?? []).join(', '),
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
        <h2 className="text-xl font-display font-bold text-enterprise-900">Capabilities</h2>
        <p className="text-sm text-enterprise-500 mt-1">Your AI workflows, governance, and service offerings.</p>
      </div>

      <form onSubmit={handleSaveAndNext} className="space-y-5">
        <div>
          <label htmlFor="ai_enabled_workflows" className="block text-sm font-medium text-enterprise-700 mb-1.5">
            AI-Enabled Workflows
          </label>
          <textarea
            id="ai_enabled_workflows"
            rows={3}
            placeholder="Predictive analytics, NLP-based document processing, automated reporting..."
            {...register('ai_enabled_workflows')}
            className="w-full px-4 py-2.5 rounded-xl border border-enterprise-200 bg-white text-enterprise-900 placeholder:text-enterprise-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm resize-none"
          />
          <p className="mt-1 text-xs text-enterprise-400">Separate items with commas</p>
          {errors.ai_enabled_workflows && (
            <p className="mt-1 text-sm text-red-600">{errors.ai_enabled_workflows.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="governance_frameworks" className="block text-sm font-medium text-enterprise-700 mb-1.5">
            Governance Frameworks
          </label>
          <textarea
            id="governance_frameworks"
            rows={3}
            placeholder="ISO 27001, NIST AI RMF, EU AI Act compliance..."
            {...register('governance_frameworks')}
            className="w-full px-4 py-2.5 rounded-xl border border-enterprise-200 bg-white text-enterprise-900 placeholder:text-enterprise-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm resize-none"
          />
          <p className="mt-1 text-xs text-enterprise-400">Separate items with commas</p>
          {errors.governance_frameworks && (
            <p className="mt-1 text-sm text-red-600">{errors.governance_frameworks.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="service_offerings" className="block text-sm font-medium text-enterprise-700 mb-1.5">
            Service Offerings
          </label>
          <textarea
            id="service_offerings"
            rows={3}
            placeholder="AI strategy consulting, ML model development, data engineering..."
            {...register('service_offerings')}
            className="w-full px-4 py-2.5 rounded-xl border border-enterprise-200 bg-white text-enterprise-900 placeholder:text-enterprise-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm resize-none"
          />
          <p className="mt-1 text-xs text-enterprise-400">Separate items with commas</p>
          {errors.service_offerings && (
            <p className="mt-1 text-sm text-red-600">{errors.service_offerings.message}</p>
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

function parseCSV(value: string): string[] {
  return value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

function cleanData(data: FormData): Partial<TspSubmission> {
  return {
    ai_enabled_workflows: parseCSV(data.ai_enabled_workflows),
    governance_frameworks: parseCSV(data.governance_frameworks),
    service_offerings: parseCSV(data.service_offerings),
  }
}
