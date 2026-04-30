"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type NpiType = "individual" | "organization";

/**
 * SearchForm — client component that renders the provider search fields.
 * On submit it validates the inputs and navigates to /search-result with
 * the search parameters encoded in the URL query string.  The actual API
 * call is performed server-side inside the SearchResultPage component.
 */
export default function SearchForm() {
  const router = useRouter();
  const mountedRef = useRef(true);
  const [npiType, setNpiType] = useState<NpiType>("individual");
  const [npiNumber, setNpiNumber] = useState("");
  const [firstName, setFirstName] = useState("");
  // Stores either the individual's last name or the organization's name
  const [providerName, setProviderName] = useState("");
  const [npiError, setNpiError] = useState("");
  const [generalError, setGeneralError] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Mark unmounted so async callbacks don't update state after the component
  // has been removed from the tree (e.g. after navigation completes).
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  function handleNpiNumberChange(e: React.ChangeEvent<HTMLInputElement>) {
    // Allow only digits and cap at 10 characters
    const value = e.target.value.replace(/\D/g, "").slice(0, 10);
    setNpiNumber(value);
    if (value.length > 0 && value.length < 10) {
      setNpiError("NPI number must be exactly 10 digits.");
    } else {
      setNpiError("");
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setGeneralError("");

    // Validate NPI number format
    if (npiNumber && npiNumber.length !== 10) {
      setNpiError("NPI number must be exactly 10 digits.");
      return;
    }

    // Require at least one search criterion
    if (!npiNumber && !firstName.trim() && !providerName.trim()) {
      setGeneralError(
        "Please enter an NPI number or at least one name field to search."
      );
      return;
    }

    setIsSearching(true);

    // Build search-result URL with query params so the server component can
    // perform the actual NPPES API call and return real results.
    const params = new URLSearchParams();
    params.set("type", npiType);
    if (npiNumber) params.set("npi", npiNumber);
    if (firstName.trim()) params.set("first", firstName.trim());
    if (providerName.trim()) params.set("last", providerName.trim());

    router.push(`/search-result?${params.toString()}`);
    // isSearching stays true while Next.js loads the results page;
    // the component will unmount naturally on successful navigation.
  }

  const isOrganization = npiType === "organization";

  const inputClass =
    "rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500";

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full rounded-2xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-gray-900"
    >
      {/* ── NPI Type selector ── */}
      <fieldset className="mb-6">
        <legend className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
          Provider Type
        </legend>
        <div className="flex gap-6">
          {(["individual", "organization"] as NpiType[]).map((type) => (
            <label
              key={type}
              className="flex cursor-pointer items-center gap-2 text-sm text-gray-700 dark:text-gray-300"
            >
              <input
                type="radio"
                name="npiType"
                value={type}
                checked={npiType === type}
                onChange={() => setNpiType(type)}
                disabled={isSearching}
                className="h-4 w-4 accent-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
              />
              {type === "individual" ? "Individual" : "Organization"}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-5 sm:grid-cols-2">
        {/* ── NPI Number ── */}
        <div className="flex flex-col gap-1 sm:col-span-2">
          <label
            htmlFor="npiNumber"
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            NPI Number
          </label>
          <input
            id="npiNumber"
            type="text"
            inputMode="numeric"
            maxLength={10}
            placeholder="10-digit NPI number"
            value={npiNumber}
            onChange={handleNpiNumberChange}
            disabled={isSearching}
            className={inputClass}
          />
          {npiError && (
            <p className="text-xs text-red-500">{npiError}</p>
          )}
        </div>

        {/* ── First Name (hidden for organizations) ── */}
        {!isOrganization && (
          <div className="flex flex-col gap-1">
            <label
              htmlFor="firstName"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Provider First Name
            </label>
            <input
              id="firstName"
              type="text"
              placeholder="e.g. John"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              disabled={isSearching}
              className={inputClass}
            />
          </div>
        )}

        {/* ── Last Name / Organization Name ── */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor={isOrganization ? "organizationName" : "lastName"}
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {isOrganization ? "Organization Name" : "Provider Last Name"}
          </label>
          <input
            id={isOrganization ? "organizationName" : "lastName"}
            type="text"
            placeholder={isOrganization ? "e.g. General Hospital" : "e.g. Doe"}
            value={providerName}
            onChange={(e) => setProviderName(e.target.value)}
            disabled={isSearching}
            className={inputClass}
          />
        </div>
      </div>

      {/* ── General validation error ── */}
      {generalError && (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
          {generalError}
        </p>
      )}

      {/* ── Progress bar (visible while searching) ── */}
      {isSearching && (
        <div className="mt-6 overflow-hidden rounded-full bg-blue-100 dark:bg-blue-950">
          <div className="h-1.5 animate-progress rounded-full bg-blue-600" />
        </div>
      )}

      {/* ── Search Button ── */}
      <div className="mt-6">
        <button
          type="submit"
          disabled={isSearching}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
        >
          {isSearching ? (
            <>
              {/* Spinner icon */}
              <svg
                className="h-4 w-4 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Searching…
            </>
          ) : (
            "Search Provider"
          )}
        </button>
      </div>
    </form>
  );
}
