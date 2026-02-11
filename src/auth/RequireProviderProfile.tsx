import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useUser } from '@clerk/clerk-react'
import { supabase } from '@/lib/supabase'
import type { ProviderProfile } from '@/types/provider'

function ProfileLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

export function RequireProviderProfile({
  requireApproved = false,
  children,
}: {
  requireApproved?: boolean
  children: React.ReactNode
}) {
  const { user, isLoaded } = useUser()
  const [profile, setProfile] = useState<ProviderProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoaded || !user) return

    if (!supabase) {
      setLoading(false)
      return
    }

    supabase
      .from('provider_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()
      .then(({ data }) => {
        setProfile(data as ProviderProfile | null)
        setLoading(false)
      })
  }, [isLoaded, user])

  if (!isLoaded || loading) {
    return <ProfileLoader />
  }

  if (!profile) {
    return <Navigate to="/onboarding/category" replace />
  }

  if (requireApproved && profile.status !== 'approved') {
    return <Navigate to="/provider" replace />
  }

  return <>{children}</>
}
