"use client"

import Link from "next/link"
import { LayoutDashboard, Sparkles } from "lucide-react"
import { useAuth, UserButton } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { useUserRole } from "@/auth/useUserRole"
import { useJobBoardRole } from "@/jobs/useJobBoardRole"
import { NotificationBell } from "./NotificationBell"

type NavbarAuthControlsProps = {
  variant: "desktop" | "mobile" | "mobile-notification"
  pathname: string
  hasScrolledBg: boolean
  onNavigate?: () => void
}

export function NavbarAuthControls({
  variant,
  pathname,
  hasScrolledBg,
  onNavigate,
}: NavbarAuthControlsProps) {
  const { isLoaded: isAuthLoaded, isSignedIn } = useAuth()
  const { role, providerSetupStarted } = useUserRole()
  const { role: jobBoardRole } = useJobBoardRole()
  const isJobsPage = pathname.startsWith("/jobs")
  const dashboardPath = (() => {
    if (isJobsPage && jobBoardRole) return "/jobs/dashboard"
    if (role === "gcc") return "/gcc-dashboard"
    if (providerSetupStarted) return "/provider/setup"
    if (jobBoardRole) return "/jobs/dashboard"
    return "/dashboard"
  })()
  const notificationRole = role === "provider" || role === "gcc" ? role : null
  const showNotifications = isAuthLoaded && isSignedIn && notificationRole !== null

  if (!isAuthLoaded) {
    return variant === "desktop" ? <div className="w-24" /> : null
  }

  if (variant === "mobile-notification") {
    return showNotifications && notificationRole ? (
      <NotificationBell role={notificationRole} isScrolled={hasScrolledBg} />
    ) : null
  }

  if (isSignedIn) {
    if (variant === "mobile") {
      return (
        <div className="flex items-center justify-between px-4 py-3">
          <Link href={dashboardPath} onClick={onNavigate}>
            <Button size="sm">
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Button>
          </Link>
          <UserButton
            appearance={{
              elements: {
                avatarBox: "w-8 h-8",
              },
            }}
          />
        </div>
      )
    }

    return (
      <div className="flex items-center gap-3 ml-2">
        <Link href={dashboardPath}>
          <Button size="sm">
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </Button>
        </Link>
        {showNotifications && notificationRole && (
          <NotificationBell role={notificationRole} isScrolled={hasScrolledBg} />
        )}
        <UserButton
          appearance={{
            elements: {
              avatarBox: "w-8 h-8",
            },
          }}
        />
      </div>
    )
  }

  if (isJobsPage) {
    return (
      <Link
        href={`/sign-in?redirect_url=${encodeURIComponent(pathname)}`}
        onClick={onNavigate}
        className={
          variant === "mobile"
            ? "block w-full px-4 py-3 text-center text-sm font-medium text-enterprise-700 rounded-lg hover:bg-enterprise-50"
            : `ml-2 text-sm font-medium transition-colors duration-300 ${
                hasScrolledBg ? "text-enterprise-600 hover:text-enterprise-900" : "text-white/80 hover:text-white"
              }`
        }
      >
        Sign in
      </Link>
    )
  }

  return (
    <Link href="/sign-up" onClick={onNavigate} className={variant === "mobile" ? undefined : "ml-2"}>
      <Button size={variant === "mobile" ? undefined : "sm"} className={variant === "mobile" ? "w-full" : undefined}>
        <Sparkles className="w-4 h-4" />
        Join Now
      </Button>
    </Link>
  )
}
