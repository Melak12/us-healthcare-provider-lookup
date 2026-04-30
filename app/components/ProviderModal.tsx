"use client";

/**
 * ProviderModal — Client Component.
 * Displays full NPPES provider details in a wide modal dialog.
 * Receives the full NppesProvider object as a prop (no database refetch needed).
 */

import { useEffect, useRef, ReactNode } from "react";
import type {
  NppesProvider,
  NppesAddress,
  NppesTaxonomy,
} from "@/app/types/nppes";

// ── Helper utilities ──────────────────────────────────────────────────────────

function getProviderName(provider: NppesProvider): string {
  const { basic, enumeration_type } = provider;
  if (enumeration_type === "NPI-2") {
    return basic.organization_name ?? "—";
  }
  const parts: string[] = [];
  if (basic.last_name) parts.push(basic.last_name);
  if (basic.first_name) {
    const firstAndMiddle = basic.middle_name
      ? `${basic.first_name} ${basic.middle_name}`
      : basic.first_name;
    parts.push(firstAndMiddle);
  }
  const fullName = parts.join(", ");
  return basic.credential ? `${fullName}, ${basic.credential}` : fullName || "—";
}

function formatAddress(address: NppesAddress): string {
  const parts = [address.address_1];
  if (address.address_2) parts.push(address.address_2);
  parts.push(`${address.city}, ${address.state} ${address.postal_code}`);
  if (address.country_name && address.country_code !== "US") {
    parts.push(address.country_name);
  }
  return parts.join(", ");
}

function formatDate(raw?: string): string {
  if (!raw) return "—";
  // NPPES dates are always "YYYY-MM-DD" — extract parts explicitly to avoid
  // timezone-related date shifts when constructing a Date object.
  const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return raw;
  const d = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return isNaN(d.getTime())
    ? raw
    : d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function getAddress(
  addresses: NppesAddress[],
  purpose: "MAILING" | "LOCATION"
): NppesAddress | null {
  return addresses.find((a) => a.address_purpose === purpose) ?? null;
}

// ── Sub-components ─────────────────────────────────────────────────────────────

/** A labelled detail row inside a section. */
function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string | undefined | null;
}) {
  return (
    <div className="grid grid-cols-[10rem_1fr] gap-x-3 gap-y-0.5 py-1.5">
      <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 self-start pt-0.5">
        {label}
      </dt>
      <dd className="text-sm text-gray-800 dark:text-gray-200 break-words">
        {value || "—"}
      </dd>
    </div>
  );
}

/** A titled card section. */
function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 px-5 py-4 dark:border-gray-700 dark:bg-gray-800/50">
      <h3 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
        {title}
      </h3>
      <dl className="divide-y divide-gray-200 dark:divide-gray-700">{children}</dl>
    </div>
  );
}

/** Badge for primary/secondary taxonomy. */
function TaxonomyRow({ taxonomy }: { taxonomy: NppesTaxonomy }) {
  return (
    <div className="flex flex-wrap items-start gap-x-3 gap-y-1 py-2">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
          {taxonomy.desc || "—"}
        </p>
        <p className="mt-0.5 font-mono text-xs text-gray-500 dark:text-gray-400">
          {taxonomy.code}
          {taxonomy.taxonomy_group ? ` · ${taxonomy.taxonomy_group}` : ""}
        </p>
        {(taxonomy.state || taxonomy.license) && (
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
            {[taxonomy.state, taxonomy.license && `License: ${taxonomy.license}`]
              .filter(Boolean)
              .join(" · ")}
          </p>
        )}
      </div>
      {taxonomy.primary && (
        <span className="inline-flex shrink-0 items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:ring-blue-800">
          Primary
        </span>
      )}
    </div>
  );
}

// ── Address section ────────────────────────────────────────────────────────────

function AddressSection({
  title,
  address,
}: {
  title: string;
  address: NppesAddress | null;
}) {
  if (!address) return null;
  return (
    <Section title={title}>
      <DetailRow label="Address" value={formatAddress(address)} />
      {address.telephone_number && (
        <DetailRow label="Phone" value={address.telephone_number} />
      )}
      {address.fax_number && (
        <DetailRow label="Fax" value={address.fax_number} />
      )}
    </Section>
  );
}

// ── Props & Modal ──────────────────────────────────────────────────────────────

interface ProviderModalProps {
  provider: NppesProvider | null;
  onClose: () => void;
}

/**
 * ProviderModal renders a wide dialog with detailed provider information.
 * It closes on backdrop click, the close button, or the Escape key.
 */
export default function ProviderModal({ provider, onClose }: ProviderModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Keep the native <dialog> open state in sync with `provider` prop
  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (provider) {
      if (!el.open) el.showModal();
    } else {
      if (el.open) el.close();
    }
  }, [provider]);

  // Close on Escape (native dialog already handles this, but we sync state)
  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    const handleCancel = (e: Event) => {
      e.preventDefault();
      onClose();
    };
    el.addEventListener("cancel", handleCancel);
    return () => el.removeEventListener("cancel", handleCancel);
  }, [onClose]);

  // Close on backdrop click (click outside the inner panel)
  function handleBackdropClick(e: React.MouseEvent<HTMLDialogElement>) {
    if (e.target === dialogRef.current) onClose();
  }

  if (!provider) return <dialog ref={dialogRef} />;

  const { basic, enumeration_type, taxonomies, addresses, endpoints, identifiers, other_names } =
    provider;

  const isOrg = enumeration_type === "NPI-2";
  const providerName = getProviderName(provider);
  const primaryTaxonomy = taxonomies.find((t) => t.primary) ?? taxonomies[0] ?? null;
  const locationAddress = getAddress(addresses, "LOCATION");
  const mailingAddress = getAddress(addresses, "MAILING");

  return (
    <dialog
      ref={dialogRef}
      onClick={handleBackdropClick}
      className={[
        // Backdrop
        "backdrop:bg-black/50 backdrop:backdrop-blur-sm",
        // Panel sizing & positioning
        "m-auto w-full max-w-4xl rounded-2xl border border-gray-200",
        "bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900",
        // No default outline
        "outline-none",
        // Max height with scroll
        "max-h-[90vh] overflow-hidden flex flex-col",
        // Responsive padding
        "p-0",
      ].join(" ")}
      aria-labelledby="provider-modal-title"
      aria-modal="true"
    >
      {/* ── Modal Header ── */}
      <div className="flex items-start justify-between gap-4 border-b border-gray-200 px-6 py-5 dark:border-gray-700">
        <div className="min-w-0">
          <h2
            id="provider-modal-title"
            className="text-xl font-bold tracking-tight text-gray-900 dark:text-white truncate"
          >
            {providerName}
          </h2>
          <p className="mt-0.5 font-mono text-sm text-gray-500 dark:text-gray-400">
            NPI: {provider.number}
          </p>
        </div>
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="mt-0.5 shrink-0 rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:hover:bg-gray-800 dark:hover:text-gray-200"
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

      {/* ── Scrollable Body ── */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

        {/* ── Basic Information ── */}
        <Section title="Basic Information">
          <DetailRow
            label="NPI Type"
            value={isOrg ? "Organization (NPI-2)" : "Individual (NPI-1)"}
          />
          {!isOrg && basic.credential && (
            <DetailRow label="Credentials" value={basic.credential} />
          )}
          {!isOrg && basic.sex && (
            <DetailRow
              label="Sex"
              value={basic.sex === "M" ? "Male" : basic.sex === "F" ? "Female" : basic.sex}
            />
          )}
          {primaryTaxonomy && (
            <DetailRow label="Primary Specialty" value={primaryTaxonomy.desc} />
          )}
          {locationAddress && (
            <DetailRow
              label="State / Location"
              value={`${locationAddress.city}, ${locationAddress.state}`}
            />
          )}
          <DetailRow label="Enumeration Date" value={formatDate(basic.enumeration_date)} />
          <DetailRow label="Last Updated" value={formatDate(basic.last_updated)} />
          {basic.status && (
            <DetailRow label="Status" value={basic.status} />
          )}
          {!isOrg && basic.sole_proprietor && (
            <DetailRow label="Sole Proprietor" value={basic.sole_proprietor} />
          )}
          {basic.certification_date && (
            <DetailRow label="Certification Date" value={formatDate(basic.certification_date)} />
          )}
        </Section>

        {/* ── Organization: Authorized Official ── */}
        {isOrg && (
          <Section title="Authorized Official">
            {(basic.authorized_official_first_name ||
              basic.authorized_official_last_name) && (
              <DetailRow
                label="Name"
                value={[
                  basic.authorized_official_name_prefix,
                  basic.authorized_official_first_name,
                  basic.authorized_official_middle_name,
                  basic.authorized_official_last_name,
                ]
                  .filter(Boolean)
                  .join(" ")}
              />
            )}
            {basic.authorized_official_credential && (
              <DetailRow
                label="Credentials"
                value={basic.authorized_official_credential}
              />
            )}
            {basic.authorized_official_title_or_position && (
              <DetailRow
                label="Title / Position"
                value={basic.authorized_official_title_or_position}
              />
            )}
            {basic.authorized_official_telephone_number && (
              <DetailRow
                label="Phone"
                value={basic.authorized_official_telephone_number}
              />
            )}
            {basic.organizational_subpart && (
              <DetailRow
                label="Org. Subpart"
                value={basic.organizational_subpart}
              />
            )}
          </Section>
        )}

        {/* ── Addresses ── */}
        <AddressSection title="Primary Practice Address" address={locationAddress} />
        <AddressSection title="Mailing Address" address={mailingAddress} />

        {/* ── Taxonomies ── */}
        {taxonomies.length > 0 && (
          <div className="rounded-xl border border-gray-200 bg-gray-50 px-5 py-4 dark:border-gray-700 dark:bg-gray-800/50">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">
              Taxonomy / Specialties
            </h3>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {taxonomies.map((taxonomy, idx) => (
                <TaxonomyRow key={`${taxonomy.code}-${idx}`} taxonomy={taxonomy} />
              ))}
            </div>
          </div>
        )}

        {/* ── Other Names ── */}
        {other_names && other_names.length > 0 && (
          <Section title="Other Names">
            {other_names.map((on, idx) => (
              <DetailRow
                key={idx}
                label={on.type || `Name ${idx + 1}`}
                value={[on.first_name, on.middle_name, on.last_name]
                  .filter(Boolean)
                  .join(" ") || on.credential || "—"}
              />
            ))}
          </Section>
        )}

        {/* ── Identifiers ── */}
        {identifiers && identifiers.length > 0 && (
          <Section title="Identifiers">
            {identifiers.map((id, idx) => (
              <DetailRow
                key={idx}
                label={id.desc || id.code}
                value={[id.identifier, id.state && `State: ${id.state}`, id.issuer && `Issuer: ${id.issuer}`]
                  .filter(Boolean)
                  .join(" · ")}
              />
            ))}
          </Section>
        )}

        {/* ── Health Information Exchange / Endpoints ── */}
        {endpoints && endpoints.length > 0 && (
          <div className="rounded-xl border border-gray-200 bg-gray-50 px-5 py-4 dark:border-gray-700 dark:bg-gray-800/50">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">
              Health Information Exchange (Endpoints)
            </h3>
            <div className="space-y-4">
              {endpoints.map((ep, idx) => (
                <div
                  key={idx}
                  className="rounded-lg border border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-900"
                >
                  <dl className="divide-y divide-gray-100 dark:divide-gray-800">
                    <DetailRow label="Type" value={ep.endpointTypeDescription || ep.endpointType} />
                    <DetailRow label="Endpoint" value={ep.endpoint} />
                    {ep.contentTypeDescription && (
                      <DetailRow label="Content Type" value={ep.contentTypeDescription} />
                    )}
                    {ep.useDescription && (
                      <DetailRow label="Use" value={ep.useDescription} />
                    )}
                    {ep.affiliation && (
                      <DetailRow label="Affiliation" value={ep.affiliation} />
                    )}
                    {ep.city && (
                      <DetailRow
                        label="Location"
                        value={`${ep.city}, ${ep.state} ${ep.postal_code}`}
                      />
                    )}
                  </dl>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </dialog>
  );
}
