import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Send, Plus, X } from 'lucide-react'
import type { AgentSubmission } from '@/types/agent'

type PartialAgent = Partial<Omit<AgentSubmission, 'id' | 'created_at' | 'updated_at'>>

const schema = z.object({
  demo_url: z.string().url('Must be a valid URL').or(z.literal('')).nullable().optional(),
})

type FormData = z.infer<typeof schema>

interface AgentPage5Props {
  data: PartialAgent
  onSave: (data: PartialAgent) => void
  onSubmit: (data: PartialAgent) => void
  isSaving: boolean
  allPagesComplete: boolean
}

export function AgentPage5({ data, onSave, onSubmit, isSaving, allPagesComplete }: AgentPage5Props) {
  const [certifications, setCertifications] = useState<string[]>(
    (data.compliance_certifications as string[]) ?? [],
  )
  const [securityFeatures, setSecurityFeatures] = useState<string[]>(
    (data.security_features as string[]) ?? [],
  )
  const [certInput, setCertInput] = useState('')
  const [secInput, setSecInput] = useState('')

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      demo_url: data.demo_url ?? '',
    },
  })

  function buildPageData(): PartialAgent {
    const formValues = getValues()
    return {
      demo_url: formValues.demo_url || null,
      compliance_certifications: certifications,
      security_features: securityFeatures,
    }
  }

  const handleSaveOnly = handleSubmit(() => {
    onSave(buildPageData())
  })

  const handleSubmitReview = handleSubmit(() => {
    onSubmit(buildPageData())
  })

  function addCert() {
    const val = certInput.trim()
    if (val && !certifications.includes(val)) {
      setCertifications((prev) => [...prev, val])
    }
    setCertInput('')
  }

  function addSec() {
    const val = secInput.trim()
    if (val && !securityFeatures.includes(val)) {
      setSecurityFeatures((prev) => [...prev, val])
    }
    setSecInput('')
  }

  const inputClass =
    'w-full px-4 py-2.5 rounded-xl border border-enterprise-200 bg-white text-enterprise-900 placeholder:text-enterprise-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm'

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-display font-bold text-enterprise-900">Extras</h2>
        <p className="text-sm text-enterprise-500 mt-1">Demo link, certifications, and security features.</p>
      </div>

      <form className="space-y-6">
        <div>
          <label htmlFor="demo_url" className="block text-sm font-medium text-enterprise-700 mb-1.5">
            Demo URL <span className="text-enterprise-400 font-normal">(optional)</span>
          </label>
          <input
            id="demo_url"
            type="text"
            placeholder="https://demo.youragent.com"
            {...register('demo_url')}
            className={inputClass}
          />
          {errors.demo_url && <p className="mt-1 text-sm text-red-600">{errors.demo_url.message}</p>}
        </div>

        {/* Compliance certifications */}
        <div>
          <label className="block text-sm font-medium text-enterprise-700 mb-1.5">
            Compliance Certifications <span className="text-enterprise-400 font-normal">(optional)</span>
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={certInput}
              onChange={(e) => setCertInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCert() } }}
              placeholder="e.g. ISO 27001, SOC 2, GDPR"
              className={inputClass}
            />
            <button
              type="button"
              onClick={addCert}
              className="flex-shrink-0 px-3 py-2 rounded-xl border border-enterprise-200 text-enterprise-600 hover:bg-enterprise-50 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          {certifications.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {certifications.map((cert) => (
                <span
                  key={cert}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-xs font-medium border border-green-200"
                >
                  {cert}
                  <button type="button" onClick={() => setCertifications((p) => p.filter((c) => c !== cert))}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Security features */}
        <div>
          <label className="block text-sm font-medium text-enterprise-700 mb-1.5">
            Security Features <span className="text-enterprise-400 font-normal">(optional)</span>
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={secInput}
              onChange={(e) => setSecInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSec() } }}
              placeholder="e.g. End-to-end encryption, Role-based access"
              className={inputClass}
            />
            <button
              type="button"
              onClick={addSec}
              className="flex-shrink-0 px-3 py-2 rounded-xl border border-enterprise-200 text-enterprise-600 hover:bg-enterprise-50 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          {securityFeatures.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {securityFeatures.map((feat) => (
                <span
                  key={feat}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium border border-blue-200"
                >
                  {feat}
                  <button type="button" onClick={() => setSecurityFeatures((p) => p.filter((f) => f !== feat))}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-enterprise-100">
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
      </form>
    </div>
  )
}
