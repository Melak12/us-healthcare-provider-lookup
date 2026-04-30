/**
 * lookupService — database business logic for Lookup records.
 *
 * All Prisma operations related to provider lookups are centralised here so
 * that server actions and other server-side modules can import a clean,
 * testable API without coupling directly to the Prisma client.
 */

import { prisma } from "@/lib/prisma";
import type { NppesSearchResponse } from "@/app/types/nppes";
import type { Prisma } from "@/app/generated/prisma/client";

export interface CreateLookupInput {
  /** The raw search term entered by the user (NPI number or provider name). */
  query: string;
  /** Distinguishes NPI-number searches ("npi") from name searches ("name"). */
  queryType: "npi" | "name";
  /** NPI number of the first result, when available. */
  npi?: string | null;
  /** Full NPPES API JSON response, converted to InputJsonValue for storage. */
  resultJson?: NppesSearchResponse | null;
  /** Whether the API call returned at least one result. */
  success: boolean;
  /** Human-readable error message, populated when success is false. */
  errorMessage?: string | null;
}

/**
 * Retrieves the most recent Lookup records (up to 100), sorted newest first.
 * Used to power the history / dashboard page.
 */
export async function getAllLookups() {
  return prisma.lookup.findMany({
    orderBy: { timestamp: "desc" },
    take: 100,
  });
}

/**
 * Persists a new Lookup record to the database.
 * Returns the created record including the auto-generated id and timestamp.
 */
export async function createLookup(data: CreateLookupInput) {
  return prisma.lookup.create({
    data: {
      query: data.query,
      queryType: data.queryType,
      npi: data.npi ?? null,
      // Prisma expects InputJsonValue; cast via unknown since our typed
      // interface lacks an index signature but is structurally compatible.
      resultJson: data.resultJson != null
        ? (data.resultJson as unknown as Prisma.InputJsonValue)
        : undefined,
      success: data.success,
      errorMessage: data.errorMessage ?? null,
    },
  });
}
