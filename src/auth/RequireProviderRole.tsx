import { RequireAuth } from './RequireAuth'
import { RequireRole } from './RequireRole'

export function RequireProviderRole({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <RequireRole role="provider">
        {children}
      </RequireRole>
    </RequireAuth>
  )
}
