import { RequireAuth } from './RequireAuth'
import { RequireRole } from './RequireRole'

export function RequireGCCRole({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <RequireRole role="gcc">
        {children}
      </RequireRole>
    </RequireAuth>
  )
}
