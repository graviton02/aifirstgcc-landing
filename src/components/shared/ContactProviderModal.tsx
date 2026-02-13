import { useState, useEffect, useCallback } from 'react'
import { X, Globe, Mail, Loader2, CheckCircle2 } from 'lucide-react'
import { useAuth, useUser } from '@clerk/clerk-react'
import { useCreateContactLog } from '@/hooks/use-gcc'
import type { Agent } from '@/types/agent'
import type { ProviderProfile } from '@/types/provider'

interface ContactProviderModalProps {
  isOpen: boolean
  onClose: () => void
  provider: ProviderProfile
  agent: Agent
}

const MIN_MESSAGE_LENGTH = 50

export function ContactProviderModal({ isOpen, onClose, provider, agent }: ContactProviderModalProps) {
  const { userId, orgId } = useAuth()
  const { user } = useUser()
  const createContact = useCreateContactLog()

  const [message, setMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const isValid = message.trim().length >= MIN_MESSAGE_LENGTH

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setMessage('')
      setSubmitted(false)
    }
  }, [isOpen])

  // ESC to close
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    },
    [onClose],
  )

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, handleKeyDown])

  if (!isOpen) return null

  function handleSubmit() {
    if (!isValid || !userId || !orgId || !user?.primaryEmailAddress?.emailAddress) return

    createContact.mutate(
      {
        gcc_user_id: userId,
        gcc_org_id: orgId,
        agent_id: agent.id,
        provider_profile_id: provider.id,
        gcc_user_email: user.primaryEmailAddress.emailAddress,
        message: message.trim(),
      },
      {
        onSuccess: () => setSubmitted(true),
      },
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full max-w-lg mx-4 bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header bar */}
        <div className="h-1.5 bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-600" />

        <div className="p-6">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-enterprise-400 hover:text-enterprise-600 hover:bg-enterprise-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {submitted ? (
            /* Success state */
            <div className="text-center py-6">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-green-100 mb-4">
                <CheckCircle2 className="w-7 h-7 text-green-600" />
              </div>
              <h2 className="text-lg font-display font-bold text-enterprise-900 mb-2">
                Request Submitted
              </h2>
              <p className="text-sm text-enterprise-500 max-w-sm mx-auto">
                Your request has been submitted and is pending review. You'll be able to track its status from your dashboard.
              </p>
              <button
                onClick={onClose}
                className="mt-6 px-6 py-2.5 rounded-xl bg-enterprise-100 text-enterprise-700 text-sm font-semibold hover:bg-enterprise-200 transition-colors"
              >
                Done
              </button>
            </div>
          ) : (
            /* Form state */
            <>
              <h2 className="text-lg font-display font-bold text-enterprise-900 mb-1 pr-8">
                Contact Provider
              </h2>
              <p className="text-sm text-enterprise-500 mb-5">
                Send a contact request about <span className="font-medium text-enterprise-700">{agent.agent_name}</span>
              </p>

              {/* Provider info */}
              <div className="rounded-xl border border-enterprise-200 bg-enterprise-50/50 p-4 mb-5 space-y-2">
                <p className="text-sm font-semibold text-enterprise-900">{provider.company_name}</p>
                <div className="flex flex-wrap items-center gap-3 text-xs text-enterprise-600">
                  {provider.website && (
                    <a
                      href={provider.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-purple-600 hover:text-purple-700 transition-colors"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      Website
                    </a>
                  )}
                  {user?.primaryEmailAddress?.emailAddress && (
                    <span className="inline-flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5" />
                      {user.primaryEmailAddress.emailAddress}
                    </span>
                  )}
                </div>
              </div>

              {/* Message textarea */}
              <div className="mb-5">
                <label
                  htmlFor="contact-message"
                  className="block text-sm font-medium text-enterprise-700 mb-1.5"
                >
                  Why are you interested in this agent?
                </label>
                <textarea
                  id="contact-message"
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your use case and why this agent could help your organization..."
                  className="w-full rounded-xl border border-enterprise-200 bg-white px-4 py-3 text-sm text-enterprise-900 placeholder:text-enterprise-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                />
                <p className="mt-1 text-xs text-enterprise-400">
                  {message.trim().length}/{MIN_MESSAGE_LENGTH} characters minimum
                </p>
              </div>

              {/* Submit button */}
              <button
                onClick={handleSubmit}
                disabled={!isValid || createContact.isPending}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {createContact.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Request'
                )}
              </button>

              {createContact.isError && (
                <p className="mt-3 text-xs text-red-600 text-center">
                  Something went wrong. Please try again.
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
