import { Star, Loader2 } from 'lucide-react'
import { useAuth } from '@clerk/clerk-react'
import { useIsShortlisted, useAddToShortlist, useRemoveFromShortlist } from '@/hooks/use-gcc'
import { useUserRole } from '@/auth/useUserRole'
import { cn } from '@/lib/utils'

interface ShortlistButtonProps {
  agentId: string
  /** 'icon' = star icon only (for cards), 'full' = full-width button (for sidebar) */
  variant?: 'icon' | 'full'
  className?: string
}

export function ShortlistButton({ agentId, variant = 'icon', className }: ShortlistButtonProps) {
  const { role } = useUserRole()
  const { userId, orgId } = useAuth()

  const { data: shortlisted, isLoading: checking } = useIsShortlisted(orgId ?? undefined, agentId)
  const addMutation = useAddToShortlist()
  const removeMutation = useRemoveFromShortlist()

  const isMutating = addMutation.isPending || removeMutation.isPending

  if (role !== 'gcc') return null

  function handleToggle(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()

    if (!orgId || !userId || isMutating) return

    if (shortlisted) {
      removeMutation.mutate({ orgId, agentId })
    } else {
      addMutation.mutate({ orgId, agentId, userId })
    }
  }

  if (variant === 'icon') {
    return (
      <button
        onClick={handleToggle}
        disabled={isMutating || checking}
        title={shortlisted ? 'Remove from shortlist' : 'Add to shortlist'}
        className={cn(
          'p-1.5 rounded-lg transition-all disabled:opacity-50',
          shortlisted
            ? 'text-amber-500 hover:text-amber-600 hover:bg-amber-50'
            : 'text-enterprise-300 hover:text-amber-400 hover:bg-enterprise-50',
          className,
        )}
      >
        {isMutating ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Star className={cn('w-4 h-4', shortlisted && 'fill-current')} />
        )}
      </button>
    )
  }

  // Full variant (sidebar button)
  return (
    <button
      onClick={handleToggle}
      disabled={isMutating || checking}
      className={cn(
        'w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-colors disabled:opacity-50',
        shortlisted
          ? 'border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100'
          : 'border-enterprise-200 text-enterprise-700 hover:bg-enterprise-50',
        className,
      )}
    >
      {isMutating ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Star className={cn('w-4 h-4', shortlisted && 'fill-current text-amber-500')} />
      )}
      {shortlisted ? 'Shortlisted' : 'Add to Shortlist'}
    </button>
  )
}
