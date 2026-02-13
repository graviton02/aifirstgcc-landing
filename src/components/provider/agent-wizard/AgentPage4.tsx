import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Plus, Trash2 } from 'lucide-react'
import type { AgentSubmission } from '@/types/agent'

type PartialAgent = Partial<Omit<AgentSubmission, 'id' | 'created_at' | 'updated_at'>>

const METRIC_TYPES = [
  'Cost Reduction',
  'Time Saved',
  'Accuracy Improvement',
  'Revenue Increase',
  'Compliance Rate',
  'Customer Satisfaction',
  'Processing Speed',
  'Error Reduction',
  'Other',
] as const

const schema = z.object({
  impact_metrics: z.array(
    z.object({
      type: z.string().min(1, 'Select a metric type'),
      value: z.string().min(1, 'Value is required'),
      description: z.string().min(3, 'Brief description required'),
    }),
  ).min(1, 'Add at least one impact metric'),
})

type FormData = z.infer<typeof schema>

interface AgentPage4Props {
  data: PartialAgent
  onSave: (data: PartialAgent) => void
  isSaving: boolean
}

export function AgentPage4({ data, onSave, isSaving }: AgentPage4Props) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      impact_metrics: (data.impact_metrics as FormData['impact_metrics'])?.length
        ? (data.impact_metrics as FormData['impact_metrics'])
        : [{ type: '', value: '', description: '' }],
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'impact_metrics' })

  const onSubmit = handleSubmit((formValues) => {
    onSave({ impact_metrics: formValues.impact_metrics })
  })

  const inputClass =
    'w-full px-4 py-2.5 rounded-xl border border-enterprise-200 bg-white text-enterprise-900 placeholder:text-enterprise-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm'

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-display font-bold text-enterprise-900">Benefits & Impact</h2>
        <p className="text-sm text-enterprise-500 mt-1">Quantify the impact your agent delivers.</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-enterprise-700 mb-3">
            Impact Metrics
          </label>
          <div className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="rounded-lg border border-enterprise-200 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-enterprise-500">Metric {index + 1}</span>
                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="text-red-500 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <select
                      {...register(`impact_metrics.${index}.type`)}
                      className={inputClass}
                    >
                      <option value="">Metric type...</option>
                      {METRIC_TYPES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                    {errors.impact_metrics?.[index]?.type && (
                      <p className="mt-1 text-sm text-red-600">{errors.impact_metrics[index].type?.message}</p>
                    )}
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="e.g. 40% reduction"
                      {...register(`impact_metrics.${index}.value`)}
                      className={inputClass}
                    />
                    {errors.impact_metrics?.[index]?.value && (
                      <p className="mt-1 text-sm text-red-600">{errors.impact_metrics[index].value?.message}</p>
                    )}
                  </div>
                </div>
                <textarea
                  rows={2}
                  placeholder="How was this measured? What's the context?"
                  {...register(`impact_metrics.${index}.description`)}
                  className={`${inputClass} resize-none`}
                />
                {errors.impact_metrics?.[index]?.description && (
                  <p className="text-sm text-red-600">{errors.impact_metrics[index].description?.message}</p>
                )}
              </div>
            ))}
          </div>
          {errors.impact_metrics?.root && (
            <p className="mt-1 text-sm text-red-600">{errors.impact_metrics.root.message}</p>
          )}
          <button
            type="button"
            onClick={() => append({ type: '', value: '', description: '' })}
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Metric
          </button>
        </div>

        <div className="flex items-center justify-end pt-4 border-t border-enterprise-100">
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
