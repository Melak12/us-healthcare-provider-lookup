"use client";

import { useState } from "react";

type NpiType = "individual" | "organization";

/**
 * SearchForm — client component that renders the provider search fields.
 * Uses local state for controlled inputs; actual search logic will be
 * wired to a Server Action in a later step.
 */
export default function SearchForm() {
  const [npiType, setNpiType] = useState<NpiType>("individual");
  const [npiNumber, setNpiNumber] = useState("");
  const [firstName, setFirstName] = useState("");
  // Stores either the individual's last name or the organization's name
  const [providerName, setProviderName] = useState("");
  const [npiError, setNpiError] = useState("");

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

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // Basic validation before submitting
    if (npiNumber && npiNumber.length !== 10) {
      setNpiError("NPI number must be exactly 10 digits.");
      return;
    }

    // TODO: call Server Action with { npiType, npiNumber, firstName, providerName }
    console.log("Search submitted:", { npiType, npiNumber, firstName, providerName });
  }

  const isOrganization = npiType === "organization";

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
                className="h-4 w-4 accent-blue-600"
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
            className="rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500"
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
              className="rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500"
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
            className="rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500"
          />
        </div>
      </div>

      {/* ── Search Button ── */}
      <div className="mt-6">
        <button
          type="submit"
          className="w-full rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          Search Provider
        </button>
      </div>
    </form>
  );
}
