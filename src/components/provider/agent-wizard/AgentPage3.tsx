import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import type { AgentSubmission } from '@/types/agent'

type PartialAgent = Partial<Omit<AgentSubmission, 'id' | 'created_at' | 'updated_at'>>

const INTEGRATION_TYPES = ['API', 'SDK', 'Widget', 'Standalone', 'Browser Extension', 'Other'] as const
const PLATFORMS = [
  'Web',
  'iOS',
  'Android',
  'Slack',
  'Microsoft Teams',
  'Salesforce',
  'SAP',
  'ServiceNow',
  'Zendesk',
  'HubSpot',
  'Custom Integration',
] as const

const schema = z.object({
  integration_type: z.string().nullable().optional(),
  data_requirements: z.string().nullable().optional(),
})

type FormData = z.infer<typeof schema>

interface AgentPage3Props {
  data: PartialAgent
  onSave: (data: PartialAgent) => void
  isSaving: boolean
}

export function AgentPage3({ data, onSave, isSaving }: AgentPage3Props) {
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(
    (data.supported_platforms as string[]) ?? [],
  )

  const {
    register,
    handleSubmit,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      integration_type: data.integration_type ?? '',
      data_requirements: data.data_requirements ?? '',
    },
  })

  function togglePlatform(platform: string) {
    setSelectedPlatforms((prev) =>
      prev.includes(platform) ? prev.filter((p) => p !== platform) : [...prev, platform],
    )
  }

  const onSubmit = handleSubmit((formValues) => {
    onSave({
      integration_type: formValues.integration_type || null,
      data_requirements: formValues.data_requirements || null,
      supported_platforms: selectedPlatforms,
    })
  })

  const inputClass =
    'w-full px-4 py-2.5 rounded-xl border border-enterprise-200 bg-white text-enterprise-900 placeholder:text-enterprise-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm'

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-display font-bold text-enterprise-900">How It Works</h2>
        <p className="text-sm text-enterprise-500 mt-1">Technical details about integration and platform support.</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <div>
          <label htmlFor="integration_type" className="block text-sm font-medium text-enterprise-700 mb-1.5">
            Integration Type
          </label>
          <select id="integration_type" {...register('integration_type')} className={inputClass}>
            <option value="">Select integration type...</option>
            {INTEGRATION_TYPES.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-enterprise-700 mb-3">
            Supported Platforms
          </label>
          <div className="flex flex-wrap gap-2">
            {PLATFORMS.map((platform) => {
              const selected = selectedPlatforms.includes(platform)
              return (
                <button
                  key={platform}
                  type="button"
                  onClick={() => togglePlatform(platform)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    selected
                      ? 'bg-purple-100 text-purple-700 border border-purple-300'
                      : 'bg-enterprise-50 text-enterprise-600 border border-enterprise-200 hover:border-enterprise-300'
                  }`}
                >
                  {platform}
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <label htmlFor="data_requirements" className="block text-sm font-medium text-enterprise-700 mb-1.5">
            Data Requirements <span className="text-enterprise-400 font-normal">(optional)</span>
          </label>
          <textarea
            id="data_requirements"
            rows={3}
            placeholder="What data does the agent need access to? Any special requirements?"
            {...register('data_requirements')}
            className={`${inputClass} resize-none`}
          />
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
