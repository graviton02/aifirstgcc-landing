import { useAuth, useUser } from '@clerk/clerk-react'
import { CheckCircle2, Hand, Loader2 } from 'lucide-react'
import { useIsOrgInterested, useExpressInterest } from '@/hooks/use-gcc'
import { useUserRole } from '@/auth/useUserRole'

interface ExpressInterestButtonProps {
  problemId: string
}

export function ExpressInterestButton({ problemId }: ExpressInterestButtonProps) {
  const { role } = useUserRole()
  const { orgId, userId } = useAuth()
  const { user } = useUser()
  const { data: alreadyInterested, isLoading: checking } = useIsOrgInterested(
    problemId,
    role === 'provider' ? orgId ?? undefined : undefined,
  )
  const express = useExpressInterest()

  // Only show for providers
  if (role !== 'provider') return null

  function handleClick() {
    if (!orgId || !userId || !user?.primaryEmailAddress?.emailAddress || express.isPending) return

    express.mutate({
      problem_statement_id: problemId,
      provider_org_id: orgId,
      provider_user_id: userId,
      provider_user_email: user.primaryEmailAddress.emailAddress,
    })
  }

  if (alreadyInterested) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 text-green-700 text-xs font-semibold border border-green-200">
        <CheckCircle2 className="w-3.5 h-3.5" />
        Interested
      </span>
    )
  }

  return (
    <button
      onClick={handleClick}
      disabled={express.isPending || checking}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 text-white text-xs font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {express.isPending ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <Hand className="w-3.5 h-3.5" />
      )}
      Express Interest
    </button>
  )
}
