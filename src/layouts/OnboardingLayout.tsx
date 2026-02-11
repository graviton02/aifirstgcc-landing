import { Link, Outlet } from 'react-router-dom'

export function OnboardingLayout() {
  return (
    <div className="min-h-screen bg-enterprise-50">
      {/* Header */}
      <header className="h-16 bg-white border-b border-enterprise-200 flex items-center px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3">
          <img
            src="/aifirstgcclogo.svg"
            alt="Orbys360 logo"
            className="h-8 w-auto"
          />
          <span className="text-lg font-display font-bold text-enterprise-900 tracking-tight">
            Orbys360
          </span>
        </Link>
        <span className="ml-4 text-sm text-enterprise-500 border-l border-enterprise-200 pl-4">
          Provider Onboarding
        </span>
      </header>

      {/* Centered content */}
      <main className="max-w-2xl mx-auto py-12 px-4 sm:px-6">
        <Outlet />
      </main>
    </div>
  )
}
