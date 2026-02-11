import { Navigate } from 'react-router-dom'
import { useUserRole } from './useUserRole'

function RoleLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

export function RequireRole({
  role,
  children,
}: {
  role: 'gcc' | 'provider'
  children: React.ReactNode
}) {
  const { role: userRole, isLoaded } = useUserRole()

  if (!isLoaded) {
    return <RoleLoader />
  }

  if (userRole !== role) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
