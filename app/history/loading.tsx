/**
 * Loading skeleton for the history/dashboard route.
 * Shown by Next.js automatically while HistoryPage fetches data.
 */
export default function HistoryLoading() {
  return (
    <div className="flex flex-col flex-1 bg-gray-50 dark:bg-gray-950">
      <main className="flex flex-1 flex-col px-4 py-10 sm:px-8">
        <div className="mx-auto w-full max-w-7xl space-y-6">

          {/* ── Page Header skeleton ── */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <div className="h-5 w-28 animate-pulse rounded-full bg-blue-100 dark:bg-blue-900" />
              <div className="h-8 w-40 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
              <div className="h-4 w-64 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
            </div>
            <div className="h-9 w-32 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700" />
          </div>

          {/* ── Table skeleton ── */}
          <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <table className="min-w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <th key={i} className="px-4 py-3">
                      <div className="h-3 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-600" />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {Array.from({ length: 8 }).map((_, rowIdx) => (
                  <tr key={rowIdx}>
                    {Array.from({ length: 6 }).map((_, colIdx) => (
                      <td key={colIdx} className="px-4 py-3">
                        <div
                          className="h-4 animate-pulse rounded bg-gray-100 dark:bg-gray-700"
                          style={{ width: `${55 + ((rowIdx + colIdx) % 4) * 12}%` }}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </main>
    </div>
  );
}
