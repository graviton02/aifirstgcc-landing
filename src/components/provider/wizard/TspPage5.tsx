import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Send } from 'lucide-react'
import type { TspSubmission } from '@/types/provider'

const schema = z.object({
  agent_native_vision: z.string().nullable().or(z.literal('')),
  expansion_plans: z.string().nullable().or(z.literal('')),
  contact_name: z.string().min(2, 'Contact name is required'),
  contact_email: z.string().email('Must be a valid email'),
  contact_phone: z.string().nullable().or(z.literal('')),
})

type FormData = z.infer<typeof schema>

interface TspPage5Props {
  submission: TspSubmission | null
  onSave: (data: Partial<TspSubmission>) => void
  onSaveAndExit: (data: Partial<TspSubmission>) => void
  onSubmitForReview: (data: Partial<TspSubmission>) => void
  isSaving: boolean
  allPagesComplete: boolean
}

export function TspPage5({
  submission,
  onSave,
  onSaveAndExit,
  onSubmitForReview,
  isSaving,
  allPagesComplete,
}: TspPage5Props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    getValues,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      agent_native_vision: '',
      expansion_plans: '',
      contact_name: '',
      contact_email: '',
      contact_phone: '',
    },
  })

  useEffect(() => {
    if (submission) {
      reset({
        agent_native_vision: submission.agent_native_vision ?? '',
        expansion_plans: submission.expansion_plans ?? '',
        contact_name: submission.contact_name ?? '',
        contact_email: submission.contact_email ?? '',
        contact_phone: submission.contact_phone ?? '',
      })
    }
  }, [submission, reset])

  const handleSaveOnly = handleSubmit((data) => {
    onSave(cleanData(data))
  })

  const handleSaveAndExit = () => {
    const data = getValues()
    onSaveAndExit(cleanData(data))
  }

  const handleSubmitReview = handleSubmit((data) => {
    onSubmitForReview(cleanData(data))
  })

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-display font-bold text-enterprise-900">Vision & Contact</h2>
        <p className="text-sm text-enterprise-500 mt-1">Your future plans and primary contact details.</p>
      </div>

      <form className="space-y-5">
        <div>
          <label htmlFor="agent_native_vision" className="block text-sm font-medium text-enterprise-700 mb-1.5">
            Agent-Native Vision
          </label>
          <textarea
            id="agent_native_vision"
            rows={3}
            placeholder="How do you envision AI agents transforming your service delivery?"
            {...register('agent_native_vision')}
            className="w-full px-4 py-2.5 rounded-xl border border-enterprise-200 bg-white text-enterprise-900 placeholder:text-enterprise-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm resize-none"
          />
        </div>

        <div>
          <label htmlFor="expansion_plans" className="block text-sm font-medium text-enterprise-700 mb-1.5">
            Expansion Plans
          </label>
          <textarea
            id="expansion_plans"
            rows={3}
            placeholder="Your plans for growth in the GCC region..."
            {...register('expansion_plans')}
            className="w-full px-4 py-2.5 rounded-xl border border-enterprise-200 bg-white text-enterprise-900 placeholder:text-enterprise-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm resize-none"
          />
        </div>

        <div className="border-t border-enterprise-100 pt-5">
          <h3 className="text-sm font-semibold text-enterprise-900 mb-4">Primary Contact</h3>

          <div className="space-y-4">
            <div>
              <label htmlFor="contact_name" className="block text-sm font-medium text-enterprise-700 mb-1.5">
                Contact Name
              </label>
              <input
                id="contact_name"
                type="text"
                placeholder="John Smith"
                {...register('contact_name')}
                className="w-full px-4 py-2.5 rounded-xl border border-enterprise-200 bg-white text-enterprise-900 placeholder:text-enterprise-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              />
              {errors.contact_name && (
                <p className="mt-1 text-sm text-red-600">{errors.contact_name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="contact_email" className="block text-sm font-medium text-enterprise-700 mb-1.5">
                Contact Email
              </label>
              <input
                id="contact_email"
                type="email"
                placeholder="john@company.com"
                {...register('contact_email')}
                className="w-full px-4 py-2.5 rounded-xl border border-enterprise-200 bg-white text-enterprise-900 placeholder:text-enterprise-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              />
              {errors.contact_email && (
                <p className="mt-1 text-sm text-red-600">{errors.contact_email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="contact_phone" className="block text-sm font-medium text-enterprise-700 mb-1.5">
                Contact Phone <span className="text-enterprise-400 font-normal">(optional)</span>
              </label>
              <input
                id="contact_phone"
                type="tel"
                placeholder="+971 50 123 4567"
                {...register('contact_phone')}
                className="w-full px-4 py-2.5 rounded-xl border border-enterprise-200 bg-white text-enterprise-900 placeholder:text-enterprise-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              />
            </div>
          </div>
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

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSaveOnly}
              disabled={isSaving}
              className="px-4 py-2 rounded-lg border border-enterprise-200 text-sm font-medium text-enterprise-600 hover:bg-enterprise-50 transition-colors disabled:opacity-60"
            >
              Save
            </button>

            {allPagesComplete && (
              <button
                type="button"
                onClick={handleSubmitReview}
                disabled={isSaving}
                className="px-6 py-2.5 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-60 flex items-center gap-2"
              >
                {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                <Send className="w-4 h-4" />
                Submit for Review
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}

function cleanData(data: FormData): Partial<TspSubmission> {
  return {
    agent_native_vision: data.agent_native_vision || null,
    expansion_plans: data.expansion_plans || null,
    contact_name: data.contact_name || null,
    contact_email: data.contact_email || null,
    contact_phone: data.contact_phone || null,
  }
}
