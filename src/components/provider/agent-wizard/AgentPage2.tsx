import { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Plus, Trash2 } from 'lucide-react'
import type { AgentSubmission } from '@/types/agent'

type PartialAgent = Partial<Omit<AgentSubmission, 'id' | 'created_at' | 'updated_at'>>

const INDUSTRIES = [
  'Banking & Finance',
  'Healthcare',
  'Insurance',
  'Telecommunications',
  'Oil & Gas',
  'Government',
  'Real Estate',
  'Retail & E-commerce',
  'Manufacturing',
  'Education',
  'Transportation & Logistics',
  'Hospitality',
  'Utilities',
  'Media & Entertainment',
  'Professional Services',
] as const

const schema = z.object({
  use_cases: z.array(
    z.object({
      title: z.string().min(2, 'Title required'),
      description: z.string().min(5, 'Description required'),
    }),
  ).min(1, 'Add at least one use case'),
  industries: z.array(z.string()).min(1, 'Select at least one industry'),
})

type FormData = z.infer<typeof schema>

interface AgentPage2Props {
  data: PartialAgent
  onSave: (data: PartialAgent) => void
  isSaving: boolean
}

export function AgentPage2({ data, onSave, isSaving }: AgentPage2Props) {
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>(
    (data.industries as string[]) ?? [],
  )

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      use_cases: (data.use_cases as FormData['use_cases'])?.length
        ? (data.use_cases as FormData['use_cases'])
        : [{ title: '', description: '' }],
      industries: selectedIndustries,
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'use_cases' })

  function toggleIndustry(industry: string) {
    setSelectedIndustries((prev) => {
      const next = prev.includes(industry)
        ? prev.filter((i) => i !== industry)
        : [...prev, industry]
      setValue('industries', next, { shouldValidate: true })
      return next
    })
  }

  const onSubmit = handleSubmit((formValues) => {
    onSave({
      use_cases: formValues.use_cases,
      industries: formValues.industries,
    })
  })

  const inputClass =
    'w-full px-4 py-2.5 rounded-xl border border-enterprise-200 bg-white text-enterprise-900 placeholder:text-enterprise-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm'

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-display font-bold text-enterprise-900">Use Cases & Industries</h2>
        <p className="text-sm text-enterprise-500 mt-1">Describe how your agent is used and which industries it serves.</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        {/* Use cases */}
        <div>
          <label className="block text-sm font-medium text-enterprise-700 mb-3">
            Use Cases
          </label>
          <div className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="rounded-lg border border-enterprise-200 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-enterprise-500">Use Case {index + 1}</span>
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
                <input
                  type="text"
                  placeholder="Use case title"
                  {...register(`use_cases.${index}.title`)}
                  className={inputClass}
                />
                {errors.use_cases?.[index]?.title && (
                  <p className="text-sm text-red-600">{errors.use_cases[index].title?.message}</p>
                )}
                <textarea
                  rows={2}
                  placeholder="Brief description of this use case"
                  {...register(`use_cases.${index}.description`)}
                  className={`${inputClass} resize-none`}
                />
                {errors.use_cases?.[index]?.description && (
                  <p className="text-sm text-red-600">{errors.use_cases[index].description?.message}</p>
                )}
              </div>
            ))}
          </div>
          {errors.use_cases?.root && (
            <p className="mt-1 text-sm text-red-600">{errors.use_cases.root.message}</p>
          )}
          <button
            type="button"
            onClick={() => append({ title: '', description: '' })}
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Use Case
          </button>
        </div>

        {/* Industries */}
        <div>
          <label className="block text-sm font-medium text-enterprise-700 mb-3">
            Target Industries
          </label>
          <div className="flex flex-wrap gap-2">
            {INDUSTRIES.map((industry) => {
              const selected = selectedIndustries.includes(industry)
              return (
                <button
                  key={industry}
                  type="button"
                  onClick={() => toggleIndustry(industry)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    selected
                      ? 'bg-purple-100 text-purple-700 border border-purple-300'
                      : 'bg-enterprise-50 text-enterprise-600 border border-enterprise-200 hover:border-enterprise-300'
                  }`}
                >
                  {industry}
                </button>
              )
            })}
          </div>
          {errors.industries && (
            <p className="mt-2 text-sm text-red-600">{errors.industries.message}</p>
          )}
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
