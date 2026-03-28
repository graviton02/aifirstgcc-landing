import { Navbar } from "@/components/shared/Navbar";

export default function DirectoryLoading() {
  return (
    <>
      <Navbar />
      <main className="min-h-[100dvh] bg-enterprise-50/50">
        {/* Hero skeleton */}
        <section className="pt-28 md:pt-36 pb-10 md:pb-14 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto space-y-4">
            <div className="h-5 w-32 rounded-full bg-enterprise-100 animate-pulse" />
            <div className="h-12 w-72 rounded-lg bg-enterprise-100 animate-pulse" />
            <div className="h-5 w-96 rounded bg-enterprise-100 animate-pulse" />
            <div className="flex gap-6 mt-6">
              <div className="h-4 w-20 rounded bg-enterprise-100 animate-pulse" />
              <div className="h-4 w-24 rounded bg-enterprise-100 animate-pulse" />
            </div>
            {/* Search bar skeleton */}
            <div className="h-12 w-full rounded-xl bg-enterprise-100 animate-pulse mt-4" />
          </div>
        </section>

        {/* Sidebar + Grid skeleton */}
        <section className="px-4 sm:px-6 lg:px-8 pb-10 md:pb-14">
          <div className="max-w-7xl mx-auto flex gap-8">
            {/* Sidebar skeleton — hidden on mobile */}
            <aside className="hidden lg:block w-[280px] shrink-0 space-y-6">
              {Array.from({ length: 3 }).map((_, g) => (
                <div key={g} className="space-y-2">
                  <div className="h-3 w-20 rounded bg-enterprise-100 animate-pulse" />
                  {Array.from({ length: g === 2 ? 3 : g === 0 ? 9 : 6 }).map(
                    (_, i) => (
                      <div
                        key={i}
                        className="h-6 rounded bg-enterprise-100 animate-pulse"
                        style={{ width: `${60 + Math.random() * 40}%` }}
                      />
                    )
                  )}
                </div>
              ))}
            </aside>

            {/* Grid skeleton */}
            <div className="flex-1 min-w-0">
              <div className="h-3 w-16 rounded bg-enterprise-100 animate-pulse mb-6" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="p-7 rounded-2xl bg-white border border-enterprise-200/60 animate-pulse"
                  >
                    <div className="flex items-start gap-4 mb-5">
                      <div className="w-11 h-11 rounded-lg bg-enterprise-100" />
                      <div className="flex-1 space-y-2.5">
                        <div className="h-5 w-36 bg-enterprise-100 rounded" />
                        <div className="h-4 w-24 bg-enterprise-100 rounded" />
                      </div>
                    </div>
                    <div className="h-4 w-full bg-enterprise-100 rounded mb-2" />
                    <div className="h-4 w-3/4 bg-enterprise-100 rounded mb-6" />
                    <div className="h-4 w-28 bg-enterprise-100 rounded" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
