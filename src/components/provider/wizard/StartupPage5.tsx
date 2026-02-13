import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Send } from 'lucide-react'
import type { StartupSubmission } from '@/types/provider'

const schema = z.object({
  contact_name: z.string().min(2, 'Contact name is required'),
  contact_email: z.string().email('Must be a valid email'),
  contact_phone: z.string().nullable().or(z.literal('')),
  partnership_interests: z.string().nullable().or(z.literal('')),
})

type FormData = z.infer<typeof schema>

interface StartupPage5Props {
  submission: StartupSubmission | null
  onSave: (data: Partial<StartupSubmission>) => void
  onSaveAndExit: (data: Partial<StartupSubmission>) => void
  onSubmitForReview: (data: Partial<StartupSubmission>) => void
  isSaving: boolean
  allPagesComplete: boolean
}

export function StartupPage5({
  submission,
  onSave,
  onSaveAndExit,
  onSubmitForReview,
  isSaving,
  allPagesComplete,
}: StartupPage5Props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    getValues,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      contact_name: '',
      contact_email: '',
      contact_phone: '',
      partnership_interests: '',
    },
  })

  useEffect(() => {
    if (submission) {
      reset({
        contact_name: submission.contact_name ?? '',
        contact_email: submission.contact_email ?? '',
        contact_phone: submission.contact_phone ?? '',
        partnership_interests: submission.partnership_interests ?? '',
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
        <h2 className="text-xl font-display font-bold text-enterprise-900">Contact & Partnership</h2>
        <p className="text-sm text-enterprise-500 mt-1">Your primary contact and partnership interests.</p>
      </div>

      <form className="space-y-5">
        <div>
          <label htmlFor="contact_name" className="block text-sm font-medium text-enterprise-700 mb-1.5">
            Contact Name
          </label>
          <input
            id="contact_name"
            type="text"
            placeholder="Jane Smith"
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
            placeholder="jane@startup.com"
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

        <div>
          <label htmlFor="partnership_interests" className="block text-sm font-medium text-enterprise-700 mb-1.5">
            Partnership Interests
          </label>
          <textarea
            id="partnership_interests"
            rows={3}
            placeholder="What kind of partnerships are you looking for?"
            {...register('partnership_interests')}
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

function cleanData(data: FormData): Partial<StartupSubmission> {
  return {
    contact_name: data.contact_name || null,
    contact_email: data.contact_email || null,
    contact_phone: data.contact_phone || null,
    partnership_interests: data.partnership_interests || null,
  }
}
