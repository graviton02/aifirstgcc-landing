import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { toast, Toaster } from 'sonner'
import { useProviderProfile, useUpdateProfile } from '@/hooks/use-provider'

const basicInfoSchema = z.object({
  company_name: z.string().min(2, 'Company name must be at least 2 characters'),
  location: z.string().min(2, 'Location is required'),
  company_size: z.string().min(1, 'Please select a company size'),
})

type BasicInfoForm = z.infer<typeof basicInfoSchema>

const companySizes = [
  { value: '1-10', label: '1–10 employees' },
  { value: '11-50', label: '11–50 employees' },
  { value: '51-200', label: '51–200 employees' },
  { value: '201-500', label: '201–500 employees' },
  { value: '501-1000', label: '501–1,000 employees' },
  { value: '1001+', label: '1,001+ employees' },
]

export default function BasicInfo() {
  const navigate = useNavigate()
  const { data: profile, isLoading: profileLoading } = useProviderProfile()
  const updateProfile = useUpdateProfile()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BasicInfoForm>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: {
      company_name: '',
      location: '',
      company_size: '',
    },
  })

  // Pre-populate from existing profile
  useEffect(() => {
    if (profile) {
      reset({
        company_name: profile.company_name || '',
        location: profile.location || '',
        company_size: profile.company_size || '',
      })
    }
  }, [profile, reset])

  const onSubmit = (data: BasicInfoForm) => {
    if (!profile) return

    updateProfile.mutate(
      { id: profile.id, data },
      {
        onSuccess: () => {
          navigate('/provider')
        },
        onError: (error) => {
          toast.error(error.message || 'Failed to save. Please try again.')
        },
      },
    )
  }

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-enterprise-400" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="text-center py-20">
        <p className="text-enterprise-500">No profile found. Please start from step 1.</p>
        <button
          onClick={() => navigate('/onboarding/category')}
          className="mt-4 text-purple-600 hover:text-purple-700 font-medium text-sm"
        >
          Go to Category Select
        </button>
      </div>
    )
  }

  return (
    <div>
      <Toaster position="top-center" richColors />

      {/* Step indicator */}
      <div className="text-center mb-2">
        <span className="text-sm font-medium text-purple-600">Step 2 of 2</span>
      </div>

      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-display font-bold text-enterprise-900 mb-2">
          Basic Information
        </h1>
        <p className="text-enterprise-500 text-sm">
          Tell us about your company to get started.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Company Name */}
        <div>
          <label htmlFor="company_name" className="block text-sm font-medium text-enterprise-700 mb-1.5">
            Company Name
          </label>
          <input
            id="company_name"
            type="text"
            placeholder="Acme AI Solutions"
            {...register('company_name')}
            className="w-full px-4 py-2.5 rounded-xl border border-enterprise-200 bg-white text-enterprise-900 placeholder:text-enterprise-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-shadow text-sm"
          />
          {errors.company_name && (
            <p className="mt-1 text-sm text-red-600">{errors.company_name.message}</p>
          )}
        </div>

        {/* Location */}
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-enterprise-700 mb-1.5">
            Location / HQ
          </label>
          <input
            id="location"
            type="text"
            placeholder="Dubai, UAE"
            {...register('location')}
            className="w-full px-4 py-2.5 rounded-xl border border-enterprise-200 bg-white text-enterprise-900 placeholder:text-enterprise-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-shadow text-sm"
          />
          {errors.location && (
            <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
          )}
        </div>

        {/* Company Size */}
        <div>
          <label htmlFor="company_size" className="block text-sm font-medium text-enterprise-700 mb-1.5">
            Company Size
          </label>
          <select
            id="company_size"
            {...register('company_size')}
            className="w-full px-4 py-2.5 rounded-xl border border-enterprise-200 bg-white text-enterprise-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-shadow text-sm"
          >
            <option value="">Select company size</option>
            {companySizes.map((size) => (
              <option key={size.value} value={size.value}>
                {size.label}
              </option>
            ))}
          </select>
          {errors.company_size && (
            <p className="mt-1 text-sm text-red-600">{errors.company_size.message}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4">
          <button
            type="button"
            onClick={() => navigate('/onboarding/category')}
            className="flex items-center gap-1.5 text-sm font-medium text-enterprise-500 hover:text-enterprise-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <button
            type="submit"
            disabled={updateProfile.isPending}
            className="px-6 py-2.5 rounded-xl bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 transition-colors disabled:opacity-60 flex items-center gap-2"
          >
            {updateProfile.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            Continue
          </button>
        </div>
      </form>
    </div>
  )
}
