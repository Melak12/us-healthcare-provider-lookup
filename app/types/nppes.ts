/**
 * TypeScript types for the NPPES NPI Registry API response (version 2.1).
 * https://npiregistry.cms.hhs.gov/api/?version=2.1
 */

export interface NppesAddress {
  address_1: string;
  address_2?: string;
  address_purpose: "MAILING" | "LOCATION";
  address_type: string;
  city: string;
  country_code: string;
  country_name: string;
  fax_number?: string;
  postal_code: string;
  state: string;
  telephone_number?: string;
}

export interface NppesBasic {
  certification_date?: string;
  credential?: string;
  enumeration_date: string;
  first_name?: string;
  last_name?: string;
  middle_name?: string;
  name?: string; // for organizations
  name_prefix?: string;
  name_suffix?: string;
  last_updated: string;
  sex?: string;
  sole_proprietor?: string;
  status: string;
}

export interface NppesTaxonomy {
  code: string;
  desc: string;
  license: string | null;
  primary: boolean;
  state: string | null;
  taxonomy_group: string;
}

export interface NppesOtherName {
  code: string;
  credential?: string;
  first_name?: string;
  last_name?: string;
  middle_name?: string;
  type: string;
}

export interface NppesEndpoint {
  address_1: string;
  address_2?: string;
  address_type: string;
  affiliation: string;
  city: string;
  contentTypeDescription: string;
  country_code: string;
  country_name: string;
  endpoint: string;
  endpointType: string;
  endpointTypeDescription: string;
  postal_code: string;
  state: string;
  useDescription: string;
}

export interface NppesIdentifier {
  code: string;
  desc: string;
  identifier: string;
  issuer: string | null;
  state: string;
}

export interface NppesProvider {
  addresses: NppesAddress[];
  basic: NppesBasic;
  created_epoch: string;
  endpoints: NppesEndpoint[];
  enumeration_type: string;
  identifiers: NppesIdentifier[];
  last_updated_epoch: string;
  number: string;
  other_names: NppesOtherName[];
  practiceLocations: unknown[];
  taxonomies: NppesTaxonomy[];
}

export interface NppesSearchResponse {
  result_count: number;
  results: NppesProvider[];
}
