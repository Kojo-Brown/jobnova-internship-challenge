export function JobCardSkeleton() {
  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm" aria-hidden="true">
      <div className="flex items-start gap-5">
        <div className="skeleton size-20 rounded-full" />
        <div className="flex-1 space-y-3">
          <div className="skeleton h-6 w-2/3 rounded-lg" />
          <div className="skeleton h-4 w-1/3 rounded-lg" />
          <div className="skeleton h-4 w-1/2 rounded-lg" />
        </div>
      </div>
      <div className="mt-5 flex gap-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="skeleton h-8 w-24 rounded-full" />
        ))}
      </div>
      <div className="mt-5 flex items-center justify-between">
        <div className="skeleton h-6 w-32 rounded-full" />
        <div className="flex gap-2">
          <div className="skeleton h-9 w-20 rounded-full" />
          <div className="skeleton h-9 w-32 rounded-full" />
        </div>
      </div>
    </div>
  )
}

export function ListSkeleton() {
  return (
    <div className="space-y-4" role="status" aria-label="Loading jobs">
      <JobCardSkeleton />
      <JobCardSkeleton />
      <JobCardSkeleton />
    </div>
  )
}
