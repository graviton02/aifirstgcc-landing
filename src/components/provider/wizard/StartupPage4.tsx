import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import type { StartupSubmission } from '@/types/provider'

const schema = z.object({
  certifications: z.string().nullable().or(z.literal('')),
  data_privacy_posture: z.string().nullable().or(z.literal('')),
  security_measures: z.string().nullable().or(z.literal('')),
})

type FormData = z.infer<typeof schema>

interface StartupPage4Props {
  submission: StartupSubmission | null
  onSave: (data: Partial<StartupSubmission>) => void
  onSaveAndExit: (data: Partial<StartupSubmission>) => void
  isSaving: boolean
}

export function StartupPage4({ submission, onSave, onSaveAndExit, isSaving }: StartupPage4Props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    getValues,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      certifications: '',
      data_privacy_posture: '',
      security_measures: '',
    },
  })

  useEffect(() => {
    if (submission) {
      reset({
        certifications: (submission.certifications ?? []).join(', '),
        data_privacy_posture: submission.data_privacy_posture ?? '',
        security_measures: submission.security_measures ?? '',
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
        <h2 className="text-xl font-display font-bold text-enterprise-900">Compliance & Security</h2>
        <p className="text-sm text-enterprise-500 mt-1">Your certifications and security posture.</p>
      </div>

      <form onSubmit={handleSaveAndNext} className="space-y-5">
        <div>
          <label htmlFor="certifications" className="block text-sm font-medium text-enterprise-700 mb-1.5">
            Certifications
          </label>
          <textarea
            id="certifications"
            rows={3}
            placeholder="SOC 2, ISO 27001, GDPR compliant..."
            {...register('certifications')}
            className="w-full px-4 py-2.5 rounded-xl border border-enterprise-200 bg-white text-enterprise-900 placeholder:text-enterprise-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm resize-none"
          />
          <p className="mt-1 text-xs text-enterprise-400">Separate items with commas</p>
          {errors.certifications && (
            <p className="mt-1 text-sm text-red-600">{errors.certifications.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="data_privacy_posture" className="block text-sm font-medium text-enterprise-700 mb-1.5">
            Data Privacy Posture
          </label>
          <textarea
            id="data_privacy_posture"
            rows={3}
            placeholder="How do you handle data privacy and protection?"
            {...register('data_privacy_posture')}
            className="w-full px-4 py-2.5 rounded-xl border border-enterprise-200 bg-white text-enterprise-900 placeholder:text-enterprise-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm resize-none"
          />
        </div>

        <div>
          <label htmlFor="security_measures" className="block text-sm font-medium text-enterprise-700 mb-1.5">
            Security Measures
          </label>
          <textarea
            id="security_measures"
            rows={3}
            placeholder="Encryption standards, access controls, audit practices..."
            {...register('security_measures')}
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
    certifications: parseCSV(data.certifications ?? ''),
    data_privacy_posture: data.data_privacy_posture || null,
    security_measures: data.security_measures || null,
  }
}
