"use client";

import { useState } from "react";
import { NppesProvider, NppesAddress } from "@/app/types/nppes";
import ProviderModal from "@/app/components/ProviderModal";

/**
 * Returns the full display name for a provider.
 * For individuals: "LAST, FIRST [MIDDLE] [CREDENTIAL]"
 * For organizations: organization name from basic.organization_name
 */
function getProviderName(provider: NppesProvider): string {
  const { basic, enumeration_type } = provider;

  if (enumeration_type === "NPI-2") {
    // Organization
    return basic.organization_name ?? "—";
  }

  // Individual
  const parts: string[] = [];
  if (basic.last_name) parts.push(basic.last_name);
  if (basic.first_name) {
    const firstAndMiddle = basic.middle_name
      ? `${basic.first_name} ${basic.middle_name}`
      : basic.first_name;
    parts.push(firstAndMiddle);
  }
  const fullName = parts.join(", ");
  return basic.credential
    ? `${fullName}, ${basic.credential}`
    : fullName || "—";
}

/**
 * Returns the LOCATION address for a provider, falling back to the first
 * address in the list if no LOCATION address is found.
 */
function getPrimaryAddress(addresses: NppesAddress[]): NppesAddress | null {
  return (
    addresses.find((a) => a.address_purpose === "LOCATION") ??
    addresses[0] ??
    null
  );
}

/**
 * Formats an address object into a single human-readable line.
 */
function formatAddress(address: NppesAddress): string {
  return `${address.address_1}, ${address.city}, ${address.state} ${address.postal_code}`;
}

interface ProviderTableProps {
  providers: NppesProvider[];
  resultCount: number;
}

/**
 * ProviderTable — Client Component.
 * Renders a responsive table of NPPES provider search results.
 * Clicking a row opens a ProviderModal with the full provider details.
 * Columns: NPI, Name, NPI Type, Primary Practice Address, Phone, Primary Taxonomy.
 */
export default function ProviderTable({
  providers,
  resultCount,
}: ProviderTableProps) {
  const [selectedProvider, setSelectedProvider] = useState<NppesProvider | null>(null);

  if (!providers || providers.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center dark:border-gray-700 dark:bg-gray-900">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No providers found. Try adjusting your search criteria.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Provider detail modal */}
      <ProviderModal
        provider={selectedProvider}
        onClose={() => setSelectedProvider(null)}
      />

      <div className="space-y-3">
        {/* Result summary */}
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Showing{" "}
          <span className="font-medium text-gray-700 dark:text-gray-300">
            {providers.length}
          </span>{" "}
          of{" "}
          <span className="font-medium text-gray-700 dark:text-gray-300">
            {resultCount}
          </span>{" "}
          results &mdash;{" "}
          <span className="italic">click a row to view full details</span>
        </p>

        {/* Scrollable table wrapper */}
        <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                {[
                  "NPI",
                  "Name",
                  "NPI Type",
                  "Primary Practice Address",
                  "Phone",
                  "Primary Taxonomy",
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
              {providers.map((provider) => {
                const primaryAddress = getPrimaryAddress(provider.addresses);
                const primaryTaxonomy =
                  provider.taxonomies.find((t) => t.primary) ??
                  provider.taxonomies[0] ??
                  null;
                const phone = primaryAddress?.telephone_number ?? "—";

                return (
                  <tr
                    key={provider.number}
                    onClick={() => setSelectedProvider(provider)}
                    role="button"
                    tabIndex={0}
                    aria-label={`View details for provider ${provider.number}`}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelectedProvider(provider);
                      }
                    }}
                    className="cursor-pointer transition-colors hover:bg-blue-50/40 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 dark:hover:bg-blue-950/20"
                  >
                    {/* NPI */}
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-sm font-medium text-blue-600 dark:text-blue-400">
                      {provider.number}
                    </td>

                    {/* Name */}
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                      {getProviderName(provider)}
                    </td>

                    {/* NPI Type */}
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          provider.enumeration_type === "NPI-1"
                            ? "bg-green-50 text-green-700 ring-1 ring-green-200 dark:bg-green-950 dark:text-green-300 dark:ring-green-800"
                            : "bg-purple-50 text-purple-700 ring-1 ring-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:ring-purple-800"
                        }`}
                      >
                        {provider.enumeration_type === "NPI-1"
                          ? "Individual"
                          : "Organization"}
                      </span>
                    </td>

                    {/* Primary Practice Address */}
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                      {primaryAddress ? formatAddress(primaryAddress) : "—"}
                    </td>

                    {/* Phone */}
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                      {phone}
                    </td>

                    {/* Primary Taxonomy */}
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                      {primaryTaxonomy ? (
                        <span title={primaryTaxonomy.code}>
                          {primaryTaxonomy.desc}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
