import { useUser } from '@clerk/clerk-react'

export function useUserRole() {
  const { user, isLoaded } = useUser()

  // Read from unsafeMetadata for development (client-writable during signup).
  // TODO: Switch to publicMetadata once the Clerk webhook is set up for production.
  const role = isLoaded && user
    ? (user.unsafeMetadata.role as 'gcc' | 'provider' | undefined) ?? null
    : null

  return { role, isLoaded }
}
