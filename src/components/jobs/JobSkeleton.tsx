export function JobCardSkeleton() {
  return (
    <div className="flex h-full flex-col rounded-3xl border border-enterprise-200 bg-white p-6 shadow-card animate-pulse">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="h-3 w-20 rounded-full bg-enterprise-200" />
          <div className="mt-3 h-5 w-3/4 rounded-lg bg-enterprise-200" />
          <div className="mt-2 h-4 w-1/3 rounded-lg bg-enterprise-200" />
        </div>
        <div className="h-7 w-16 rounded-full bg-enterprise-200" />
      </div>
      <div className="mt-5 space-y-2">
        <div className="h-3.5 w-2/3 rounded-lg bg-enterprise-200" />
        <div className="h-3.5 w-1/2 rounded-lg bg-enterprise-200" />
      </div>
      <div className="mt-5 flex gap-2">
        <div className="h-6 w-16 rounded-full bg-enterprise-200" />
        <div className="h-6 w-20 rounded-full bg-enterprise-200" />
        <div className="h-6 w-14 rounded-full bg-enterprise-200" />
      </div>
      <div className="mt-5 space-y-2">
        <div className="h-3 w-full rounded-lg bg-enterprise-100" />
        <div className="h-3 w-full rounded-lg bg-enterprise-100" />
        <div className="h-3 w-2/3 rounded-lg bg-enterprise-100" />
      </div>
      <div className="mt-auto pt-6 flex items-center justify-between">
        <div className="h-3 w-24 rounded-lg bg-enterprise-100" />
        <div className="h-9 w-24 rounded-xl bg-enterprise-200" />
      </div>
    </div>
  );
}

export function JobListSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <JobCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function JobDetailSkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
      <div className="rounded-3xl border border-enterprise-200 bg-white p-8 shadow-card animate-pulse">
        <div className="h-3 w-20 rounded-full bg-enterprise-200" />
        <div className="mt-5 h-8 w-3/4 rounded-lg bg-enterprise-200" />
        <div className="mt-3 h-5 w-1/2 rounded-lg bg-enterprise-200" />
        <div className="mt-6 flex gap-3">
          <div className="h-8 w-20 rounded-full bg-enterprise-100" />
          <div className="h-8 w-24 rounded-full bg-enterprise-100" />
          <div className="h-8 w-16 rounded-full bg-enterprise-100" />
        </div>
        <div className="mt-10 space-y-3">
          <div className="h-5 w-40 rounded-lg bg-enterprise-200" />
          <div className="h-3 w-full rounded-lg bg-enterprise-100" />
          <div className="h-3 w-full rounded-lg bg-enterprise-100" />
          <div className="h-3 w-full rounded-lg bg-enterprise-100" />
          <div className="h-3 w-4/5 rounded-lg bg-enterprise-100" />
        </div>
      </div>
      <div className="rounded-3xl border border-enterprise-200 bg-white p-6 shadow-card animate-pulse">
        <div className="h-5 w-16 rounded-lg bg-enterprise-200" />
        <div className="mt-3 h-3 w-32 rounded-lg bg-enterprise-100" />
        <div className="mt-6 h-11 w-full rounded-2xl bg-enterprise-200" />
      </div>
    </div>
  );
}

export function DashboardCardSkeleton() {
  return (
    <div className="rounded-3xl border border-enterprise-200 bg-white p-6 shadow-card animate-pulse">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="h-5 w-48 rounded-lg bg-enterprise-200" />
            <div className="h-6 w-20 rounded-full bg-enterprise-200" />
          </div>
          <div className="mt-2 h-4 w-36 rounded-lg bg-enterprise-100" />
          <div className="mt-3 h-3.5 w-44 rounded-lg bg-enterprise-100" />
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-24 rounded-xl bg-enterprise-200" />
          <div className="h-9 w-32 rounded-xl bg-enterprise-200" />
        </div>
      </div>
    </div>
  );
}
