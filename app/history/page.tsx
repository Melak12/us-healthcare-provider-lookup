import type { Metadata } from "next";
import Link from "next/link";
import { getAllLookups } from "@/lib/lookupService";
import HistoryTable from "@/app/components/HistoryTable";
import type { SerializedLookup } from "@/app/components/HistoryTable";

export const metadata: Metadata = {
  title: "Dashboard | US Healthcare Provider Lookup",
  description: "View your recent provider lookup history from the NPPES NPI Registry.",
};

/**
 * HistoryPage — async Server Component.
 * Fetches all past lookups from the database (newest first) and renders
 * them in an interactive table. Each row opens a detail modal.
 */
export default async function HistoryPage() {
  const rawLookups = await getAllLookups();

  // Serialise Date fields to ISO strings before passing to the Client Component.
  type RawLookup = Awaited<ReturnType<typeof getAllLookups>>[number];
  const lookups: SerializedLookup[] = rawLookups.map((l: RawLookup) => ({
    id: l.id,
    query: l.query,
    queryType: l.queryType,
    npi: l.npi,
    resultJson: l.resultJson,
    success: l.success,
    errorMessage: l.errorMessage,
    timestamp: l.timestamp.toISOString(),
    createdAt: l.createdAt.toISOString(),
  }));

  return (
    <div className="flex flex-col flex-1 bg-gray-50 dark:bg-gray-950">
      <main className="flex flex-1 flex-col px-4 py-10 sm:px-8">
        <div className="mx-auto w-full max-w-7xl space-y-6">

          {/* ── Page Header ── */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-1 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 ring-1 ring-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:ring-blue-800">
                Search History
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
                Dashboard
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {lookups.length > 0
                  ? `${lookups.length} lookup${lookups.length === 1 ? "" : "s"} — click any row to view details`
                  : "No lookups recorded yet"}
              </p>
            </div>

            {/* Back to search */}
            <Link
              href="/"
              className="inline-flex items-center gap-2 self-start rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 sm:self-auto"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z"
                  clipRule="evenodd"
                />
              </svg>
              New Search
            </Link>
          </div>

          {/* ── Lookup Table / Empty State ── */}
          <HistoryTable lookups={lookups} />

        </div>
      </main>
    </div>
  );
}
