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
