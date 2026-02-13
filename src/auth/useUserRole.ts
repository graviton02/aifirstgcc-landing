import { useUser } from '@clerk/clerk-react'

export function useUserRole() {
  const { user, isLoaded } = useUser()

  const role = isLoaded && user
    ? (user.publicMetadata.role as 'gcc' | 'provider' | undefined) ?? null
    : null

  return { role, isLoaded }
}
