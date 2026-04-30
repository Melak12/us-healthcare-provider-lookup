"use server";

/**
 * searchProviders — Server Action for NPPES NPI Registry lookups.
 *
 * Accepts search inputs from the SearchForm, constructs the correct NPPES
 * API query, fetches results server-side with a 10-second timeout, saves
 * every attempt to the database via lookupService, and returns a typed
 * success/failure result to the caller.
 */

import type { NppesSearchResponse } from "@/app/types/nppes";
import { createLookup } from "@/lib/lookupService";

/** Shape of inputs forwarded from the SearchForm component. */
export interface SearchParams {
  npiType: "individual" | "organization";
  /** Populated when the user enters a 10-digit NPI number. */
  npiNumber?: string;
  /** First name (individuals only). */
  firstName?: string;
  /** Last name (individual) or organisation name, depending on npiType. */
  providerName?: string;
}

export type SearchActionResult =
  | { success: true; data: NppesSearchResponse }
  | { success: false; error: string };

/** Timeout applied to each NPPES fetch request (milliseconds). */
const FETCH_TIMEOUT_MS = 10_000;

export async function searchProviders(
  params: SearchParams
): Promise<SearchActionResult> {
  const { npiType, npiNumber, firstName, providerName } = params;

  // ── Environment check ──────────────────────────────────────────────────────
  const baseUrl = process.env.NPPES_BASE_URL;
  if (!baseUrl) {
    return {
      success: false,
      error: "NPPES API base URL is not configured on the server.",
    };
  }

  // ── Build query parameters ─────────────────────────────────────────────────
  const query = new URLSearchParams({ version: "2.1" });
  let queryDescription: string;
  let queryType: "npi" | "name";

  const isNpiSearch = !!npiNumber && npiNumber.length === 10;

  if (isNpiSearch) {
    query.set("number", npiNumber!);
    queryDescription = npiNumber!;
    queryType = "npi";
  } else if (npiType === "organization") {
    if (!providerName?.trim()) {
      return {
        success: false,
        error: "Please provide an organization name to search.",
      };
    }
    query.set("enumeration_type", "NPI-2");
    query.set("organization_name", providerName.trim());
    queryDescription = providerName.trim();
    queryType = "name";
  } else {
    // Individual name search
    const trimFirst = firstName?.trim() ?? "";
    const trimLast = providerName?.trim() ?? "";
    if (!trimFirst && !trimLast) {
      return {
        success: false,
        error: "Please provide at least a first name or last name to search.",
      };
    }
    query.set("enumeration_type", "NPI-1");
    if (trimFirst) query.set("first_name", trimFirst);
    if (trimLast) query.set("last_name", trimLast);
    queryDescription = [trimFirst, trimLast].filter(Boolean).join(" ");
    queryType = "name";
  }

  // ── Fetch from NPPES API ───────────────────────────────────────────────────
  const url = `${baseUrl}?${query.toString()}`;
  let apiResponse: NppesSearchResponse;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    let response: Response;
    try {
      response = await fetch(url, {
        signal: controller.signal,
        headers: { Accept: "application/json" },
        // Disable Next.js data cache so every search returns fresh results
        cache: "no-store",
      });
    } finally {
      clearTimeout(timeoutId);
    }

    if (!response.ok) {
      const message = `API error: ${response.status} ${response.statusText}`;
      await createLookup({
        query: queryDescription,
        queryType,
        success: false,
        errorMessage: message,
      }).catch((dbErr) => console.error("Failed to save lookup record:", dbErr));
      return { success: false, error: message };
    }

    apiResponse = (await response.json()) as NppesSearchResponse;
  } catch (err) {
    const isTimeout =
      err instanceof Error &&
      (err.name === "AbortError" || err.message.includes("abort"));
    const message = isTimeout
      ? "The request timed out. Please try again."
      : "Network error. Please check your connection and try again.";

    await createLookup({
      query: queryDescription,
      queryType,
      success: false,
      errorMessage: message,
    }).catch((dbErr) => console.error("Failed to save lookup record:", dbErr));

    return { success: false, error: message };
  }

  // ── Persist successful lookup ──────────────────────────────────────────────
  const firstResult = apiResponse.results?.[0];
  await createLookup({
    query: queryDescription,
    queryType,
    npi: firstResult?.number ?? null,
    resultJson: apiResponse,
    success: apiResponse.result_count > 0,
  }).catch((dbErr) => console.error("Failed to save lookup record:", dbErr));

  return { success: true, data: apiResponse };
}
