"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

/** Serialised Lookup record (Dates converted to ISO strings for client props). */
export interface SerializedLookup {
  id: string;
  query: string;
  queryType: string;
  npi: string | null;
  resultJson: unknown;
  success: boolean;
  errorMessage: string | null;
  timestamp: string;
  createdAt: string;
}

// ─── Helpers ───────────────────────────────────────────────────────────────

/**
 * Returns a short relative time string, e.g. "3h ago" or "Jan 5, 2025".
 */
function formatRelativeTime(isoString: string): string {
  const date = new Date(isoString);
  const diffMs = Date.now() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

interface ProviderBasic {
  name?: string;
  first_name?: string;
  last_name?: string;
  credential?: string;
  status?: string;
  enumeration_date?: string;
  last_updated?: string;
  sex?: string;
}

interface ProviderAddress {
  address_1?: string;
  address_2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  address_purpose?: string;
  telephone_number?: string;
}

interface ProviderTaxonomy {
  code?: string;
  desc?: string;
  state?: string | null;
  license?: string | null;
  primary?: boolean;
}

interface ParsedProvider {
  number?: string;
  enumeration_type?: string;
  basic?: ProviderBasic;
  addresses?: ProviderAddress[];
  taxonomies?: ProviderTaxonomy[];
}

interface ParsedApiResponse {
  result_count?: number;
  results?: ParsedProvider[];
}

/**
 * Safely casts resultJson to our loosely-typed API response shape.
 */
function toApiResponse(resultJson: unknown): ParsedApiResponse | null {
  if (
    !resultJson ||
    typeof resultJson !== "object" ||
    Array.isArray(resultJson)
  ) {
    return null;
  }
  return resultJson as ParsedApiResponse;
}

/**
 * Builds a display name for a provider from the basic object.
 */
function buildName(provider: ParsedProvider): string {
  const basic = provider.basic ?? {};
  if (provider.enumeration_type === "NPI-2") {
    return basic.name ?? "—";
  }
  const parts: string[] = [];
  if (basic.last_name) parts.push(basic.last_name);
  if (basic.first_name) parts.push(basic.first_name);
  const fullName = parts.join(", ");
  return basic.credential ? `${fullName}, ${basic.credential}` : fullName || "—";
}

/**
 * Derives a one-line summary of the lookup result for the table column.
 */
function getResultSummary(resultJson: unknown, success: boolean): string {
  if (!success) return "No results found";
  const data = toApiResponse(resultJson);
  if (!data) return "—";
  const results = data.results ?? [];
  if (results.length === 0) return "No results found";
  const name = buildName(results[0]);
  const total = data.result_count ?? results.length;
  return total > 1 ? `${name} +${total - 1} more` : name;
}

// ─── Detail modal ──────────────────────────────────────────────────────────

interface DetailModalProps {
  lookup: SerializedLookup;
  onClose: () => void;
}

function DetailModal({ lookup, onClose }: DetailModalProps) {
  const data = toApiResponse(lookup.resultJson);
  const providers = data?.results ?? [];

  // Close on Escape key
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 pt-10 sm:pt-16"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
      aria-label="Lookup detail"
    >
      {/* Panel */}
      <div
        className="relative w-full max-w-2xl rounded-2xl bg-white shadow-xl dark:bg-gray-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Lookup Detail
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Close"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="space-y-5 px-6 py-5">
          {/* Search metadata */}
          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Search Info
            </h3>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-gray-500 dark:text-gray-400">Query</dt>
                <dd className="font-medium text-gray-900 dark:text-white break-all">
                  {lookup.query}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500 dark:text-gray-400">Type</dt>
                <dd className="font-medium text-gray-900 dark:text-white uppercase">
                  {lookup.queryType}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500 dark:text-gray-400">Timestamp</dt>
                <dd className="font-medium text-gray-900 dark:text-white">
                  {new Date(lookup.timestamp).toLocaleString("en-US", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </dd>
              </div>
              {lookup.npi && (
                <div>
                  <dt className="text-gray-500 dark:text-gray-400">NPI</dt>
                  <dd className="font-mono font-medium text-blue-600 dark:text-blue-400">
                    {lookup.npi}
                  </dd>
                </div>
              )}
              <div>
                <dt className="text-gray-500 dark:text-gray-400">Status</dt>
                <dd>
                  <StatusBadge success={lookup.success} />
                </dd>
              </div>
            </dl>
            {!lookup.success && lookup.errorMessage && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                Error: {lookup.errorMessage}
              </p>
            )}
          </section>

          {/* Provider results */}
          {providers.length > 0 && (
            <section>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Provider Results ({data?.result_count ?? providers.length})
              </h3>
              <div className="space-y-3">
                {providers.slice(0, 5).map((provider, idx) => (
                  <ProviderCard key={`${provider.number ?? ""}-${idx}`} provider={provider} />
                ))}
                {providers.length < (data?.result_count ?? 0) && (
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    Showing first {providers.length} of{" "}
                    {data?.result_count} results stored in this lookup.
                  </p>
                )}
              </div>
            </section>
          )}

          {/* Raw JSON (collapsible) */}
          {lookup.resultJson != null && (
            <details className="rounded-xl border border-gray-200 dark:border-gray-700">
              <summary className="cursor-pointer select-none px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                Raw JSON
              </summary>
              <pre className="overflow-x-auto px-4 pb-4 pt-2 text-xs text-gray-600 dark:text-gray-300">
                {JSON.stringify(lookup.resultJson, null, 2)}
              </pre>
            </details>
          )}
        </div>
      </div>
    </div>
  );
}

function ProviderCard({ provider }: { provider: ParsedProvider }) {
  const name = buildName(provider);
  const primaryAddress =
    provider.addresses?.find((a) => a.address_purpose === "LOCATION") ??
    provider.addresses?.[0] ??
    null;
  const primaryTaxonomy =
    provider.taxonomies?.find((t) => t.primary) ??
    provider.taxonomies?.[0] ??
    null;

  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
        <p className="font-medium text-gray-900 dark:text-white">{name}</p>
        {provider.number && (
          <span className="font-mono text-xs text-blue-600 dark:text-blue-400">
            NPI: {provider.number}
          </span>
        )}
      </div>
      <dl className="grid grid-cols-1 gap-1 text-xs sm:grid-cols-2">
        {provider.enumeration_type && (
          <div className="flex gap-1.5">
            <dt className="text-gray-500 dark:text-gray-400">Type:</dt>
            <dd className="text-gray-700 dark:text-gray-300">
              {provider.enumeration_type === "NPI-1" ? "Individual" : "Organization"}
            </dd>
          </div>
        )}
        {primaryAddress?.state && (
          <div className="flex gap-1.5">
            <dt className="text-gray-500 dark:text-gray-400">State:</dt>
            <dd className="text-gray-700 dark:text-gray-300">
              {primaryAddress.state}
            </dd>
          </div>
        )}
        {primaryAddress?.city && (
          <div className="flex gap-1.5 sm:col-span-2">
            <dt className="text-gray-500 dark:text-gray-400">Address:</dt>
            <dd className="text-gray-700 dark:text-gray-300">
              {[
                primaryAddress.address_1,
                primaryAddress.city,
                primaryAddress.state,
                primaryAddress.postal_code,
              ]
                .filter(Boolean)
                .join(", ")}
            </dd>
          </div>
        )}
        {primaryTaxonomy?.desc && (
          <div className="flex gap-1.5 sm:col-span-2">
            <dt className="text-gray-500 dark:text-gray-400">Specialty:</dt>
            <dd className="text-gray-700 dark:text-gray-300">
              {primaryTaxonomy.desc}
            </dd>
          </div>
        )}
      </dl>
    </div>
  );
}

// ─── Status badge ──────────────────────────────────────────────────────────

function StatusBadge({ success }: { success: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
        success
          ? "bg-green-50 text-green-700 ring-1 ring-green-200 dark:bg-green-950 dark:text-green-300 dark:ring-green-800"
          : "bg-red-50 text-red-700 ring-1 ring-red-200 dark:bg-red-950 dark:text-red-300 dark:ring-red-800"
      }`}
    >
      {success ? "Success" : "Failed"}
    </span>
  );
}

// ─── Main component ────────────────────────────────────────────────────────

interface HistoryTableProps {
  lookups: SerializedLookup[];
}

/**
 * HistoryTable — Client Component.
 * Renders the list of past lookups and handles row-click detail modal.
 */
export default function HistoryTable({ lookups }: HistoryTableProps) {
  const [selectedLookup, setSelectedLookup] = useState<SerializedLookup | null>(null);
  const closeModal = useCallback(() => setSelectedLookup(null), []);

  if (lookups.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-14 text-center dark:border-gray-700 dark:bg-gray-900">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-950">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="h-7 w-7 text-blue-500 dark:text-blue-400"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
            />
          </svg>
        </div>
        <p className="text-base font-medium text-gray-900 dark:text-white">
          No lookups yet
        </p>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Your past provider searches will appear here.
        </p>
        <Link
          href="/"
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Search providers
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              {[
                "Timestamp",
                "Search Query",
                "Type",
                "NPI",
                "Result Summary",
                "Status",
              ].map((heading) => (
                <th
                  key={heading}
                  scope="col"
                  className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {lookups.map((lookup) => (
              <tr
                key={lookup.id}
                onClick={() => setSelectedLookup(lookup)}
                className="cursor-pointer transition-colors hover:bg-blue-50/40 dark:hover:bg-blue-950/20"
                title="Click to view details"
              >
                {/* Timestamp */}
                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                  <span title={new Date(lookup.timestamp).toLocaleString()}>
                    {formatRelativeTime(lookup.timestamp)}
                  </span>
                </td>

                {/* Search Query */}
                <td className="max-w-[180px] truncate px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                  {lookup.query}
                </td>

                {/* Query Type */}
                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      lookup.queryType === "npi"
                        ? "bg-blue-50 text-blue-700 ring-1 ring-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:ring-blue-800"
                        : "bg-purple-50 text-purple-700 ring-1 ring-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:ring-purple-800"
                    }`}
                  >
                    {lookup.queryType.toUpperCase()}
                  </span>
                </td>

                {/* NPI */}
                <td className="whitespace-nowrap px-4 py-3 font-mono text-sm text-blue-600 dark:text-blue-400">
                  {lookup.npi ?? "—"}
                </td>

                {/* Result Summary */}
                <td className="max-w-[220px] truncate px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                  {getResultSummary(lookup.resultJson, lookup.success)}
                </td>

                {/* Status */}
                <td className="whitespace-nowrap px-4 py-3 text-sm">
                  <StatusBadge success={lookup.success} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detail modal */}
      {selectedLookup && (
        <DetailModal lookup={selectedLookup} onClose={closeModal} />
      )}
    </>
  );
}
