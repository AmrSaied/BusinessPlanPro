import axios from 'axios';
import { AirportData, FlightData } from '../services/aviation-types';
import { InsertAirport, Airport, InsertFlight, Flight, airports as airportsTable } from '@shared/schema';
import { db } from '../db';

/**
 * Service for interacting with the AviationStack API
 */
export class AviationStackService {
  private apiKey: string;
  private baseUrl: string = 'http://api.aviationstack.com/v1';

  constructor() {
    this.apiKey = process.env.AVIATIONSTACK_API_KEY as string;
    if (!this.apiKey) {
      console.error('AviationStack API key not found in environment variables');
    }
  }

  /**
   * Search for airports by query
   * @param query Search query (city, country, or airport name)
   * @returns Promise<Airport[]>
   */
  async searchAirports(query: string): Promise<Airport[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/airports`, {
        params: {
          access_key: this.apiKey,
          search: query
        }
      });

      const result = response.data;
      
      if (result && result.data && Array.isArray(result.data)) {
        // Transform AviationStack data to our Airport format
        return result.data.map((airport: AirportData) => this.mapToAirport(airport));
      }
      
      return [];
    } catch (error) {
      console.error('Error searching airports:', error);
      throw new Error('Failed to search airports');
    }
  }

  /**
   * Get all airports with optional pagination
   * @param limit Maximum number of airports to return
   * @param offset Offset for pagination
   * @returns Promise<Airport[]>
   */
  async getAllAirports(limit: number = 100, offset: number = 0): Promise<Airport[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/airports`, {
        params: {
          access_key: this.apiKey,
          limit,
          offset
        }
      });

      const result = response.data;
      
      if (result && result.data && Array.isArray(result.data)) {
        // Transform AviationStack data to our Airport format
        return result.data.map((airport: AirportData) => this.mapToAirport(airport));
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching airports:', error);
      throw new Error('Failed to fetch airports');
    }
  }

  /**
   * Search for flights
   * @param params Search parameters
   * @returns Promise<Flight[]>
   */
  async searchFlights(params: {
    departureAirport?: string;
    arrivalAirport?: string;
    departureDate?: string;
  }): Promise<Flight[]> {
    try {
      const apiParams: any = {
        access_key: this.apiKey,
        limit: 20
      };

      if (params.departureAirport) {
        apiParams.dep_iata = params.departureAirport;
      }

      if (params.arrivalAirport) {
        apiParams.arr_iata = params.arrivalAirport;
      }

      if (params.departureDate) {
        // Convert date format from YYYY-MM-DD to API format if needed
        apiParams.flight_date = params.departureDate;
      }

      const response = await axios.get(`${this.baseUrl}/flights`, {
        params: apiParams
      });

      const result = response.data;
      
      if (result && result.data && Array.isArray(result.data)) {
        // Transform AviationStack data to our Flight format
        return result.data.map((flight: FlightData) => this.mapToFlight(flight));
      }
      
      return [];
    } catch (error) {
      console.error('Error searching flights:', error);
      throw new Error('Failed to search flights');
    }
  }
  
  /**
   * Fetch all airports and store them in the database
   */
  async seedAirports(): Promise<void> {
    try {
      console.log('Seeding airports from AviationStack API...');
      
      // Get first batch of airports
      const airports = await this.getAllAirports(100, 0);
      
      if (airports.length === 0) {
        console.log('No airports found in API response');
        return;
      }
      
      console.log(`Fetched ${airports.length} airports from AviationStack API`);
      
      // Insert airports into database
      let inserted = 0;
      for (const airport of airports) {
        try {
          // Skip airports without IATA code
          if (!airport.iataCode) continue;
          
          // Convert to insertable format
          const insertAirport: InsertAirport = {
            iataCode: airport.iataCode,
            icaoCode: airport.icaoCode,
            name: airport.name,
            city: airport.city,
            country: airport.country,
            countryCode: airport.countryCode,
            latitude: airport.latitude,
            longitude: airport.longitude,
            timezone: airport.timezone,
            localName: airport.localName || { en: airport.name }
          };
          
          // Insert into database - note we need to handle each airport individually
          await db.insert(airportsTable).values(insertAirport).onConflictDoNothing();
          inserted++;
        } catch (error) {
          console.error(`Error inserting airport ${airport.iataCode}:`, error);
        }
      }
      
      console.log(`Successfully inserted ${inserted} airports into database`);
    } catch (error) {
      console.error('Error seeding airports:', error);
      throw new Error('Failed to seed airports');
    }
  }

  /**
   * Map AviationStack airport data to our Airport format
   */
  private mapToAirport(airportData: AirportData): Airport {
    return {
      id: 0, // Will be assigned by the database when inserted
      iataCode: airportData.iata_code || '',
      icaoCode: airportData.icao_code || null,
      name: airportData.airport_name || '',
      city: airportData.city_name || '',
      country: airportData.country_name || '',
      countryCode: airportData.country_iso2 || '',
      latitude: airportData.latitude ? parseFloat(airportData.latitude) : null,
      longitude: airportData.longitude ? parseFloat(airportData.longitude) : null,
      timezone: airportData.timezone || null,
      localName: { en: airportData.airport_name || '' }
    };
  }

  /**
   * Map AviationStack flight data to our Flight format
   */
  private mapToFlight(flightData: FlightData): Flight {
    // Extract airline information
    const airline = flightData.airline || {};
    const flight = flightData.flight || {};
    const departure = flightData.departure || {};
    const arrival = flightData.arrival || {};
    
    // Parse times
    const departureTime = departure.scheduled ? new Date(departure.scheduled) : null;
    const arrivalTime = arrival.scheduled ? new Date(arrival.scheduled) : null;
    
    // Calculate flight duration in minutes
    let durationMinutes = 0;
    if (departureTime && arrivalTime) {
      durationMinutes = Math.round((arrivalTime.getTime() - departureTime.getTime()) / (1000 * 60));
    }
    
    // Format duration as "Xh Ym"
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;
    const durationFormatted = `${hours}h ${minutes}m`;
    
    // Calculate a base price (this is dummy since AviationStack doesn't provide pricing)
    // We'll use the distance as a base for pricing
    const basePrice = 150 + Math.round(Math.random() * 200);
    
    return {
      id: 0, // Will be assigned by the database
      airlineCode: airline.iata || '',
      airlineName: airline.name || '',
      flightNumber: `${airline.iata || ''}${flight.number || ''}`,
      departureAirport: departure.iata || '',
      departureCity: departure.city || '',
      departureCountry: departure.country || '',
      arrivalAirport: arrival.iata || '',
      arrivalCity: arrival.city || '',
      arrivalCountry: arrival.country || '',
      departureTime: departureTime ? 
        `${departureTime.getHours().toString().padStart(2, '0')}:${departureTime.getMinutes().toString().padStart(2, '0')}` : 
        '',
      arrivalTime: arrivalTime ? 
        `${arrivalTime.getHours().toString().padStart(2, '0')}:${arrivalTime.getMinutes().toString().padStart(2, '0')}` : 
        '',
      duration: durationFormatted,
      basePrice: basePrice
    };
  }
}