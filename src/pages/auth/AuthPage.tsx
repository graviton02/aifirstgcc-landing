import { SignIn, SignUp } from '@clerk/clerk-react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Building2, Briefcase } from 'lucide-react'

export default function AuthPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const mode = searchParams.get('mode') ?? 'signin'
  const role = searchParams.get('role') as 'gcc' | 'provider' | null

  const needsRoleSelection = mode === 'signup' && !role

  const afterSignUpUrl = role === 'provider'
    ? '/onboarding/category'
    : role === 'gcc'
      ? '/gcc-dashboard'
      : '/'

  const selectRole = (selectedRole: 'gcc' | 'provider') => {
    setSearchParams({ mode: 'signup', role: selectedRole })
  }

  return (
    <div className="min-h-screen bg-enterprise-50 flex flex-col items-center justify-center px-4">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-3 mb-8">
        <img
          src="/aifirstgcclogo.svg"
          alt="Orbys360 logo"
          className="h-10 w-auto"
        />
        <span className="text-2xl font-display font-bold text-enterprise-900 tracking-tight">
          Orbys360
        </span>
      </Link>

      {needsRoleSelection ? (
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-display font-bold text-enterprise-900 mb-2">
              How will you use Orbys360?
            </h1>
            <p className="text-enterprise-500 text-sm">
              Select your role to get started with the right experience.
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => selectRole('gcc')}
              className="w-full flex items-start gap-4 p-5 bg-white rounded-xl border-2 border-enterprise-200 hover:border-purple-400 hover:shadow-md transition-all text-left group"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-200 transition-colors">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="font-semibold text-enterprise-900 mb-1">I represent a GCC</div>
                <div className="text-sm text-enterprise-500">
                  Explore AI agents, benchmark your organization, and connect with providers.
                </div>
              </div>
            </button>

            <button
              onClick={() => selectRole('provider')}
              className="w-full flex items-start gap-4 p-5 bg-white rounded-xl border-2 border-enterprise-200 hover:border-purple-400 hover:shadow-md transition-all text-left group"
            >
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0 group-hover:bg-purple-200 transition-colors">
                <Briefcase className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <div className="font-semibold text-enterprise-900 mb-1">I'm a Provider</div>
                <div className="text-sm text-enterprise-500">
                  List your AI agents, showcase capabilities, and reach GCC decision-makers.
                </div>
              </div>
            </button>
          </div>

          <p className="text-center text-xs text-enterprise-400 mt-6">
            Already have an account?{' '}
            <Link to="/auth" className="text-purple-600 hover:text-purple-700 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      ) : mode === 'signup' ? (
        <SignUp
          routing="hash"
          signInUrl="/auth"
          forceRedirectUrl={afterSignUpUrl}
          unsafeMetadata={role ? { role } : undefined}
        />
      ) : (
        <SignIn
          routing="hash"
          signUpUrl="/auth?mode=signup"
          forceRedirectUrl="/"
        />
      )}

      {/* Back to home */}
      <Link
        to="/"
        className="mt-8 inline-flex items-center gap-2 text-sm text-enterprise-500 hover:text-enterprise-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to home
      </Link>
    </div>
  )
}
