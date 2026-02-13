import { Check } from 'lucide-react'

interface WizardShellProps {
  currentPage: number
  completedPages: number[]
  totalPages: number
  pageLabels: string[]
  onPageClick: (page: number) => void
  children: React.ReactNode
}

export function WizardShell({
  currentPage,
  completedPages,
  totalPages,
  pageLabels,
  onPageClick,
  children,
}: WizardShellProps) {
  return (
    <div>
      {/* Progress bar */}
      <nav className="mb-8">
        <ol className="flex items-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
            const isCompleted = completedPages.includes(page)
            const isCurrent = page === currentPage

            return (
              <li key={page} className="flex-1">
                <button
                  type="button"
                  onClick={() => onPageClick(page)}
                  className={`w-full flex flex-col items-center gap-1.5 group`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                      isCurrent
                        ? 'bg-purple-600 text-white'
                        : isCompleted
                          ? 'bg-green-100 text-green-700'
                          : 'bg-enterprise-100 text-enterprise-400 group-hover:bg-enterprise-200'
                    }`}
                  >
                    {isCompleted && !isCurrent ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      page
                    )}
                  </div>
                  <span
                    className={`text-xs text-center leading-tight hidden sm:block ${
                      isCurrent
                        ? 'text-purple-700 font-medium'
                        : isCompleted
                          ? 'text-green-700'
                          : 'text-enterprise-400'
                    }`}
                  >
                    {pageLabels[page - 1]}
                  </span>
                </button>
              </li>
            )
          })}
        </ol>

        {/* Progress line */}
        <div className="mt-3 h-1.5 bg-enterprise-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-purple-600 rounded-full transition-all duration-300"
            style={{ width: `${(completedPages.length / totalPages) * 100}%` }}
          />
        </div>
      </nav>

      {/* Page content */}
      {children}
    </div>
  )
}
