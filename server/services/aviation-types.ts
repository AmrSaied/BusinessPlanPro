/**
 * Type definitions for AviationStack API data
 */

/**
 * Airport data from AviationStack API
 */
export interface AirportData {
  id?: string;
  gmt?: string;
  airport_name?: string;
  iata_code?: string;
  icao_code?: string;
  latitude?: string;
  longitude?: string;
  city_name?: string;
  city_iata_code?: string;
  country_name?: string;
  country_iso2?: string;
  timezone?: string;
}

/**
 * Airline data from AviationStack API
 */
export interface AirlineData {
  name?: string;
  iata?: string;
  icao?: string;
}

/**
 * Flight details from AviationStack API
 */
export interface FlightDetails {
  number?: string;
  iata?: string;
  icao?: string;
}

/**
 * Location data from AviationStack API
 */
export interface LocationData {
  airport?: string;
  iata?: string;
  icao?: string;
  city?: string;
  city_iata_code?: string;
  country?: string;
  country_iso2?: string;
  scheduled?: string; // ISO-8601 format
  estimated?: string; // ISO-8601 format
  actual?: string; // ISO-8601 format
  estimated_runway?: string; // ISO-8601 format
  actual_runway?: string; // ISO-8601 format
  terminal?: string;
  gate?: string;
}

/**
 * Flight data from AviationStack API
 */
export interface FlightData {
  flight_date?: string;
  flight_status?: string;
  airline?: AirlineData;
  flight?: FlightDetails;
  departure?: LocationData;
  arrival?: LocationData;
  live?: any; // Live flight details (not using this for now)
}