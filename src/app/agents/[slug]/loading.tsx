import { Navbar } from "@/components/shared/Navbar";

export default function AgentDetailLoading() {
  return (
    <>
      <Navbar />
      <main className="min-h-[100dvh] bg-white">
        <section className="pt-24 md:pt-32 pb-0 px-4 sm:px-6 lg:px-8 bg-enterprise-50/30">
          <div className="max-w-7xl mx-auto">
            {/* Back link skeleton */}
            <div className="h-4 w-32 rounded bg-enterprise-100 animate-pulse mb-8" />

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10 lg:gap-16 pb-12">
              {/* Left content skeleton */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-4 w-28 rounded bg-enterprise-100 animate-pulse" />
                  <div className="h-4 w-24 rounded bg-enterprise-100 animate-pulse" />
                </div>
                <div className="h-10 w-80 rounded-lg bg-enterprise-100 animate-pulse" />
                <div className="h-5 w-full max-w-lg rounded bg-enterprise-100 animate-pulse" />
                <div className="h-5 w-3/4 rounded bg-enterprise-100 animate-pulse" />
                <div className="border-t border-enterprise-200/60 pt-6 mt-6 space-y-3">
                  <div className="h-4 w-full rounded bg-enterprise-100 animate-pulse" />
                  <div className="h-4 w-full rounded bg-enterprise-100 animate-pulse" />
                  <div className="h-4 w-2/3 rounded bg-enterprise-100 animate-pulse" />
                </div>
              </div>

              {/* Right panel skeleton */}
              <div className="rounded-2xl bg-white border border-enterprise-200/60 p-6 space-y-5">
                <div className="space-y-3">
                  <div className="h-3 w-16 rounded bg-enterprise-100 animate-pulse" />
                  <div className="h-4 w-40 rounded bg-enterprise-100 animate-pulse" />
                  <div className="h-4 w-48 rounded bg-enterprise-100 animate-pulse" />
                  <div className="h-4 w-28 rounded bg-enterprise-100 animate-pulse" />
                </div>
                <div className="h-px bg-enterprise-100" />
                <div className="space-y-2">
                  <div className="h-3 w-16 rounded bg-enterprise-100 animate-pulse" />
                  <div className="flex flex-wrap gap-1.5">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-7 rounded-md bg-enterprise-100 animate-pulse"
                        style={{ width: `${80 + i * 20}px` }}
                      />
                    ))}
                  </div>
                </div>
                <div className="h-px bg-enterprise-100" />
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="h-8 w-8 rounded bg-enterprise-100 animate-pulse" />
                    <div className="h-3 w-16 rounded bg-enterprise-100 animate-pulse" />
                  </div>
                  <div className="space-y-1">
                    <div className="h-8 w-8 rounded bg-enterprise-100 animate-pulse" />
                    <div className="h-3 w-14 rounded bg-enterprise-100 animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tab section skeleton */}
        <section className="px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="max-w-7xl mx-auto">
            <div className="flex gap-4 border-b border-enterprise-200/60 mb-8 pb-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-5 rounded bg-enterprise-100 animate-pulse"
                  style={{ width: `${80 + i * 20}px` }}
                />
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-20 rounded-xl bg-enterprise-50 animate-pulse"
                />
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
