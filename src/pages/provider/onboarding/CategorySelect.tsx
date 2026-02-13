import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '@clerk/clerk-react'
import { Building2, Rocket, Loader2 } from 'lucide-react'
import { toast, Toaster } from 'sonner'
import { useProviderProfile, useCreateProviderProfile } from '@/hooks/use-provider'

const categories = [
  {
    value: 'tsp' as const,
    title: 'Technology Service Provider',
    description:
      'Established firms delivering AI-powered advisory, implementation, and managed services to GCCs across the region.',
    icon: Building2,
    iconBg: 'bg-blue-100 group-hover:bg-blue-200',
    iconColor: 'text-blue-600',
  },
  {
    value: 'startup' as const,
    title: 'AI Startup',
    description:
      'Emerging companies building innovative AI products, platforms, or specialized solutions for enterprise adoption.',
    icon: Rocket,
    iconBg: 'bg-purple-100 group-hover:bg-purple-200',
    iconColor: 'text-purple-600',
  },
] as const

export default function CategorySelect() {
  const navigate = useNavigate()
  const { user } = useUser()
  const { data: existingProfile, isLoading: profileLoading } = useProviderProfile()
  const createProfile = useCreateProviderProfile()
  const [pendingCategory, setPendingCategory] = useState<string | null>(null)

  const handleSelect = (category: 'tsp' | 'startup') => {
    if (!user) return

    // If profile already exists, navigate directly
    if (existingProfile) {
      navigate('/onboarding/basics')
      return
    }

    setPendingCategory(category)

    createProfile.mutate(
      {
        user_id: user.id,
        organization_id: user.id,
        company_name: '',
        location: '',
        company_size: '',
        category,
        status: 'pending',
        logo_url: null,
        website: null,
      },
      {
        onSuccess: () => {
          navigate('/onboarding/basics')
        },
        onError: (error) => {
          setPendingCategory(null)
          toast.error(error.message || 'Failed to create profile. Please try again.')
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

  return (
    <div>
      <Toaster position="top-center" richColors />

      {/* Step indicator */}
      <div className="text-center mb-2">
        <span className="text-sm font-medium text-purple-600">Step 1 of 2</span>
      </div>

      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-display font-bold text-enterprise-900 mb-2">
          Select Provider Category
        </h1>
        <p className="text-enterprise-500 text-sm">
          Choose your provider type. This determines your onboarding form.
        </p>
      </div>

      {/* Category cards */}
      <div className="space-y-3">
        {categories.map((cat) => {
          const Icon = cat.icon
          const isSelected = existingProfile?.category === cat.value
          const isLoading = pendingCategory === cat.value && createProfile.isPending

          return (
            <button
              key={cat.value}
              onClick={() => handleSelect(cat.value)}
              disabled={createProfile.isPending}
              className={`w-full flex items-start gap-4 p-5 bg-white rounded-xl border-2 transition-all text-left group disabled:opacity-60 ${
                isSelected
                  ? 'border-purple-400 shadow-md'
                  : 'border-enterprise-200 hover:border-purple-400 hover:shadow-md'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${cat.iconBg}`}
              >
                {isLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin text-enterprise-400" />
                ) : (
                  <Icon className={`w-6 h-6 ${cat.iconColor}`} />
                )}
              </div>
              <div>
                <div className="font-semibold text-enterprise-900 mb-1">{cat.title}</div>
                <div className="text-sm text-enterprise-500">{cat.description}</div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
