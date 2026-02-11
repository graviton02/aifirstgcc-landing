import { lazy, Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import { Navbar } from '@/components/shared/Navbar'

const Footer = lazy(() => import('@/components/sections/Footer').then(m => ({ default: m.Footer })))

export function MarketingLayout() {
  return (
    <>
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Suspense fallback={<div className="min-h-[200px]" />}>
        <Footer />
      </Suspense>
    </>
  )
}
