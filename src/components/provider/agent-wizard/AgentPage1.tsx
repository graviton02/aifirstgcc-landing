import { useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Upload, X } from 'lucide-react'
import { AGENT_CATEGORIES } from '@/data/constants/agentCategories'
import type { AgentSubmission } from '@/types/agent'

type PartialAgent = Partial<Omit<AgentSubmission, 'id' | 'created_at' | 'updated_at'>>

const schema = z.object({
  agent_name: z.string().min(2, 'Agent name is required'),
  tagline: z.string().nullable().optional(),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  category: z.string().min(1, 'Select a category'),
})

type FormData = z.infer<typeof schema>

interface AgentPage1Props {
  data: PartialAgent
  onSave: (data: PartialAgent, file?: File | null) => void
  isSaving: boolean
}

export function AgentPage1({ data, onSave, isSaving }: AgentPage1Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const selectedFileRef = useRef<File | null>(null)
  const previewRef = useRef<string | null>(data.logo_url ?? null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      agent_name: data.agent_name ?? '',
      tagline: data.tagline ?? '',
      description: data.description ?? '',
      category: data.category ?? '',
    },
  })

  const onSubmit = handleSubmit((formValues) => {
    onSave(
      {
        agent_name: formValues.agent_name,
        tagline: formValues.tagline || null,
        description: formValues.description,
        category: formValues.category,
        logo_url: previewRef.current,
      },
      selectedFileRef.current,
    )
  })

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      selectedFileRef.current = file
      previewRef.current = URL.createObjectURL(file)
      // Force re-render via a state-less approach — the form will carry the preview
      e.target.value = ''
    }
  }

  function clearFile() {
    selectedFileRef.current = null
    previewRef.current = null
  }

  const inputClass =
    'w-full px-4 py-2.5 rounded-xl border border-enterprise-200 bg-white text-enterprise-900 placeholder:text-enterprise-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm'

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-display font-bold text-enterprise-900">Agent Basics</h2>
        <p className="text-sm text-enterprise-500 mt-1">Core details about your AI agent.</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        {/* Logo upload */}
        <div>
          <label className="block text-sm font-medium text-enterprise-700 mb-1.5">
            Agent Logo <span className="text-enterprise-400 font-normal">(optional)</span>
          </label>
          <div className="flex items-center gap-4">
            {previewRef.current ? (
              <div className="relative">
                <img
                  src={previewRef.current}
                  alt="Logo preview"
                  className="w-16 h-16 rounded-xl object-cover border border-enterprise-200"
                />
                <button
                  type="button"
                  onClick={clearFile}
                  className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-16 h-16 rounded-xl border-2 border-dashed border-enterprise-300 flex items-center justify-center text-enterprise-400 hover:border-purple-400 hover:text-purple-500 transition-colors"
              >
                <Upload className="w-5 h-5" />
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <p className="text-xs text-enterprise-400">PNG, JPG, or SVG. Max 2MB.</p>
          </div>
        </div>

        <div>
          <label htmlFor="agent_name" className="block text-sm font-medium text-enterprise-700 mb-1.5">
            Agent Name
          </label>
          <input id="agent_name" type="text" placeholder="e.g. Invoice Autopilot" {...register('agent_name')} className={inputClass} />
          {errors.agent_name && <p className="mt-1 text-sm text-red-600">{errors.agent_name.message}</p>}
        </div>

        <div>
          <label htmlFor="tagline" className="block text-sm font-medium text-enterprise-700 mb-1.5">
            Tagline <span className="text-enterprise-400 font-normal">(optional)</span>
          </label>
          <input id="tagline" type="text" placeholder="A short one-liner describing your agent" {...register('tagline')} className={inputClass} />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-enterprise-700 mb-1.5">
            Description
          </label>
          <textarea
            id="description"
            rows={4}
            placeholder="What does your agent do? How does it help organizations?"
            {...register('description')}
            className={`${inputClass} resize-none`}
          />
          {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-enterprise-700 mb-1.5">
            Category
          </label>
          <select id="category" {...register('category')} className={inputClass}>
            <option value="">Select a category...</option>
            {AGENT_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>}
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
