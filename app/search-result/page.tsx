import type { Metadata } from "next";
import Link from "next/link";
import ProviderTable from "@/app/components/ProviderTable";
import { searchProviders } from "@/app/actions/searchProviders";

export const metadata: Metadata = {
  title: "Search Results | US Healthcare Provider Lookup",
  description: "View healthcare provider search results from the NPPES NPI Registry.",
};

interface SearchResultPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

/**
 * SearchResultPage — async Server Component.
 * Reads the URL search parameters set by SearchForm, calls the searchProviders
 * Server Action to fetch real data from the NPPES NPI Registry, and renders
 * the results (or a user-friendly error message on failure).
 */
export default async function SearchResultPage({
  searchParams,
}: SearchResultPageProps) {
  const params = await searchParams;
  const type = typeof params.type === "string" ? params.type : "individual";
  const npi = typeof params.npi === "string" ? params.npi : undefined;
  const first = typeof params.first === "string" ? params.first : undefined;
  const last = typeof params.last === "string" ? params.last : undefined;

  // If the page is opened without any search parameters, prompt the user
  // to go back and perform a search.
  if (!npi && !first && !last) {
    return (
      <div className="flex flex-col flex-1 bg-gray-50 dark:bg-gray-950">
        <main className="flex flex-1 flex-col px-4 py-10 sm:px-8">
          <div className="mx-auto w-full max-w-7xl space-y-6">
            <NoSearchCriteria />
          </div>
        </main>
      </div>
    );
  }

  const result = await searchProviders({
    npiType: type === "organization" ? "organization" : "individual",
    npiNumber: npi,
    firstName: first,
    providerName: last,
  });

  const { results, result_count } = result.success
    ? result.data
    : { results: [], result_count: 0 };

  return (
    <div className="flex flex-col flex-1 bg-gray-50 dark:bg-gray-950">
      <main className="flex flex-1 flex-col px-4 py-10 sm:px-8">
        <div className="mx-auto w-full max-w-7xl space-y-6">

          {/* ── Page Header ── */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-1 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 ring-1 ring-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:ring-blue-800">
                NPPES NPI Registry
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
                Search Results
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Matching healthcare providers from the NPI Registry
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

          {/* ── Error banner ── */}
          {!result.success && (
            <div
              role="alert"
              className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 dark:border-red-800 dark:bg-red-950"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500 dark:text-red-400"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM8.28 7.22a.75.75 0 0 0-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 1 0 1.06 1.06L10 11.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L11.06 10l1.72-1.72a.75.75 0 0 0-1.06-1.06L10 8.94 8.28 7.22Z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <p className="font-medium text-red-700 dark:text-red-300">
                  Search failed
                </p>
                <p className="mt-0.5 text-sm text-red-600 dark:text-red-400">
                  {result.error}
                </p>
              </div>
            </div>
          )}

          {/* ── Results Table ── */}
          {result.success && (
            <ProviderTable providers={results} resultCount={result_count} />
          )}

        </div>
      </main>
    </div>
  );
}

/** Shown when the results page is visited without any search parameters. */
function NoSearchCriteria() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center dark:border-gray-700 dark:bg-gray-900">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        No search criteria provided.{" "}
        <Link href="/" className="font-medium text-blue-600 hover:underline dark:text-blue-400">
          Go back and search
        </Link>
        .
      </p>
    </div>
  );
}

