import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import type { StartupSubmission } from '@/types/provider'

const schema = z.object({
  product_description: z.string().min(10, 'Describe your product (at least 10 characters)'),
  ai_capabilities: z.string().min(10, 'Describe your AI capabilities'),
  tech_stack: z.string().min(2, 'Describe your tech stack'),
})

type FormData = z.infer<typeof schema>

interface StartupPage2Props {
  submission: StartupSubmission | null
  onSave: (data: Partial<StartupSubmission>) => void
  onSaveAndExit: (data: Partial<StartupSubmission>) => void
  isSaving: boolean
}

export function StartupPage2({ submission, onSave, onSaveAndExit, isSaving }: StartupPage2Props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    getValues,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      product_description: '',
      ai_capabilities: '',
      tech_stack: '',
    },
  })

  useEffect(() => {
    if (submission) {
      reset({
        product_description: submission.product_description ?? '',
        ai_capabilities: submission.ai_capabilities ?? '',
        tech_stack: submission.tech_stack ?? '',
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
        <h2 className="text-xl font-display font-bold text-enterprise-900">Product & Technology</h2>
        <p className="text-sm text-enterprise-500 mt-1">Tell us about your AI product and technology.</p>
      </div>

      <form onSubmit={handleSaveAndNext} className="space-y-5">
        <div>
          <label htmlFor="product_description" className="block text-sm font-medium text-enterprise-700 mb-1.5">
            Product Description
          </label>
          <textarea
            id="product_description"
            rows={4}
            placeholder="What does your product do? Who is it for?"
            {...register('product_description')}
            className="w-full px-4 py-2.5 rounded-xl border border-enterprise-200 bg-white text-enterprise-900 placeholder:text-enterprise-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm resize-none"
          />
          {errors.product_description && (
            <p className="mt-1 text-sm text-red-600">{errors.product_description.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="ai_capabilities" className="block text-sm font-medium text-enterprise-700 mb-1.5">
            AI Capabilities
          </label>
          <textarea
            id="ai_capabilities"
            rows={3}
            placeholder="What AI/ML capabilities power your product?"
            {...register('ai_capabilities')}
            className="w-full px-4 py-2.5 rounded-xl border border-enterprise-200 bg-white text-enterprise-900 placeholder:text-enterprise-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm resize-none"
          />
          {errors.ai_capabilities && (
            <p className="mt-1 text-sm text-red-600">{errors.ai_capabilities.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="tech_stack" className="block text-sm font-medium text-enterprise-700 mb-1.5">
            Tech Stack
          </label>
          <textarea
            id="tech_stack"
            rows={3}
            placeholder="Key technologies, frameworks, and infrastructure..."
            {...register('tech_stack')}
            className="w-full px-4 py-2.5 rounded-xl border border-enterprise-200 bg-white text-enterprise-900 placeholder:text-enterprise-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm resize-none"
          />
          {errors.tech_stack && (
            <p className="mt-1 text-sm text-red-600">{errors.tech_stack.message}</p>
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

function cleanData(data: FormData): Partial<StartupSubmission> {
  return {
    product_description: data.product_description || null,
    ai_capabilities: data.ai_capabilities || null,
    tech_stack: data.tech_stack || null,
  }
}
