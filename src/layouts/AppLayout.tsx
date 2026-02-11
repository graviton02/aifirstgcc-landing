import { Link, Outlet, useLocation } from 'react-router-dom'
import { UserButton } from '@clerk/clerk-react'
import {
  LayoutDashboard,
  PlusCircle,
  User,
  Star,
  MessageSquare,
  ClipboardCheck,
} from 'lucide-react'
import { useUserRole } from '@/auth/useUserRole'
import { cn } from '@/lib/utils'

const providerNavItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/provider' },
  { label: 'List Agent', icon: PlusCircle, path: '/list-your-agent' },
  { label: 'Profile', icon: User, path: '/provider' },
]

const gccNavItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/gcc-dashboard' },
  { label: 'Shortlist', icon: Star, path: '/gcc-dashboard' },
  { label: 'Problem Hub', icon: MessageSquare, path: '/gcc-dashboard' },
  { label: 'Self-Assessment', icon: ClipboardCheck, path: '/self-assessment' },
]

export function AppLayout() {
  const { role } = useUserRole()
  const location = useLocation()
  const navItems = role === 'gcc' ? gccNavItems : providerNavItems

  return (
    <div className="min-h-screen bg-enterprise-50">
      {/* Header */}
      <header className="sticky top-0 z-50 h-16 bg-white border-b border-enterprise-200 flex items-center justify-between px-4 sm:px-6 lg:px-8">
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
        <UserButton afterSignOutUrl="/" />
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden md:flex flex-col w-64 bg-white border-r border-enterprise-200 min-h-[calc(100vh-4rem)]">
          <nav className="flex-1 px-3 py-4 space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.label}
                  to={item.path}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-purple-50 text-purple-700'
                      : 'text-enterprise-600 hover:text-enterprise-900 hover:bg-enterprise-50'
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
