import Link from "next/link";
import SearchForm from "@/app/components/SearchForm";

/**
 * Home page — Server Component.
 * Renders a title/description section and the provider search form.
 */
export default function Home() {
  return (
    <div className="flex flex-col flex-1 bg-gray-50 dark:bg-gray-950">
      <main className="flex flex-1 flex-col items-center px-4 py-16 sm:px-8">
        <div className="w-full max-w-2xl space-y-10">

          {/* ── Dashboard button (top right) ── */}
          <div className="flex justify-end">
            <Link
              href="/history"
              className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
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
                  d="M4.5 2A1.5 1.5 0 0 0 3 3.5v4A1.5 1.5 0 0 0 4.5 9h4A1.5 1.5 0 0 0 10 7.5v-4A1.5 1.5 0 0 0 8.5 2h-4Zm0 9A1.5 1.5 0 0 0 3 12.5v4A1.5 1.5 0 0 0 4.5 18h4A1.5 1.5 0 0 0 10 16.5v-4A1.5 1.5 0 0 0 8.5 11h-4Zm6.5 1.5A1.5 1.5 0 0 1 12.5 11h4a1.5 1.5 0 0 1 1.5 1.5v4a1.5 1.5 0 0 1-1.5 1.5h-4A1.5 1.5 0 0 1 11 16.5v-4Zm1.5-9A1.5 1.5 0 0 0 11 5v3.5A1.5 1.5 0 0 0 12.5 10h4A1.5 1.5 0 0 0 18 8.5V5a1.5 1.5 0 0 0-1.5-1.5h-4Z"
                  clipRule="evenodd"
                />
              </svg>
              Dashboard
            </Link>
          </div>

          {/* ── Top Section: Title & Description ── */}
          <section className="text-center">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 ring-1 ring-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:ring-blue-800">
              NPPES NPI Registry
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              US Healthcare Provider Lookup
            </h1>
            <p className="mt-3 text-base leading-7 text-gray-500 dark:text-gray-400">
              Instantly verify any licensed US healthcare provider using the
              official{" "}
              <span className="font-medium text-gray-700 dark:text-gray-300">
                NPPES NPI Registry
              </span>
              . Search by NPI number or provider name to view credentials,
              specialty, and location information.
            </p>
          </section>

          {/* ── Search Section ── */}
          <section aria-label="Provider search">
            <SearchForm />
          </section>

        </div>
      </main>
    </div>
  );
}
