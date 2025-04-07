import Amadeus from 'amadeus';
import { Airport, Flight, InsertAirport, InsertFlight } from '@shared/schema';
import { FlightSearch } from '@shared/schema';
import { IStorage } from '../storage';

/**
 * Type definitions for Amadeus API responses
 */
type AmadeusAirport = {
  iataCode: string;
  name: string;
  cityCode: string;
  cityName: string;
  countryCode: string;
  countryName: string;
  latitude?: number;
  longitude?: number;
  timeZoneOffset?: string;
};

type AmadeusFlight = {
  type: string;
  id: string;
  source: string;
  instantTicketingRequired: boolean;
  nonHomogeneous: boolean;
  oneWay: boolean;
  lastTicketingDate: string;
  lastTicketingDateTime: string;
  numberOfBookableSeats: number;
  itineraries: Array<{
    duration: string;
    segments: Array<{
      departure: {
        iataCode: string;
        terminal?: string;
        at: string;
      };
      arrival: {
        iataCode: string;
        terminal?: string;
        at: string;
      };
      carrierCode: string;
      number: string;
      aircraft: {
        code: string;
      };
      operating?: {
        carrierCode: string;
      };
      duration: string;
      id: string;
      numberOfStops: number;
      blacklistedInEU: boolean;
    }>;
  }>;
  price: {
    currency: string;
    total: string;
    base: string;
    fees: Array<{
      amount: string;
      type: string;
    }>;
    grandTotal: string;
  };
  pricingOptions: {
    fareType: string[];
    includedCheckedBagsOnly: boolean;
  };
  validatingAirlineCodes: string[];
  travelerPricings: Array<{
    travelerId: string;
    fareOption: string;
    travelerType: string;
    price: {
      currency: string;
      total: string;
      base: string;
    };
    fareDetailsBySegment: Array<{
      segmentId: string;
      cabin: string;
      fareBasis: string;
      brandedFare?: string;
      class: string;
      includedCheckedBags: {
        quantity: number;
      };
    }>;
  }>;
};

/**
 * Service for interacting with the Amadeus API
 */
export class AmadeusService {
  private amadeus: Amadeus | null;
  private storage: IStorage;

  constructor(storage: IStorage) {
    this.storage = storage;
    this.amadeus = null;
    
    // Initialize Amadeus client if credentials are available
    if (process.env.AMADEUS_CLIENT_ID && process.env.AMADEUS_CLIENT_SECRET) {
      try {
        this.amadeus = new Amadeus({
          clientId: process.env.AMADEUS_CLIENT_ID as string,
          clientSecret: process.env.AMADEUS_CLIENT_SECRET as string
        });
        console.log('Amadeus API client initialized successfully');
      } catch (error) {
        console.error('Failed to initialize Amadeus API client:', error);
        this.amadeus = null;
      }
    } else {
      console.log('Amadeus API credentials not provided, some functionality will be limited');
    }
  }

  /**
   * Search for airports by query
   * @param query Search query (city, country, or airport name)
   * @returns Promise<Airport[]>
   */
  async searchAirports(query: string): Promise<Airport[]> {
    try {
      console.log(`Searching airports for query: ${query}`);
      
      // First try to search in local storage
      const localResults = await this.storage.searchAirports(query);
      if (localResults.length > 0) {
        console.log(`Found ${localResults.length} airports in local storage`);
        return localResults;
      }

      // If no local results and Amadeus API client is available, try API
      if (this.amadeus) {
        console.log('Attempting to fetch airports from Amadeus API');
        try {
          const response = await this.amadeus.referenceData.locations.get({
            keyword: query,
            subType: 'AIRPORT'
          });

          if (response.result && response.result.data) {
            const airports = response.result.data.map((airport: any) => this.mapToAirport(airport));
            console.log(`Found ${airports.length} airports in Amadeus API`);
            return airports;
          }
        } catch (apiError) {
          console.error('Error fetching from Amadeus API:', apiError);
        }
      } else {
        console.log('Amadeus API client not initialized, using local data only');
      }
      
      return [];
    } catch (error) {
      console.error('Error in searchAirports:', error);
      // Fallback to local storage in case of any error
      return this.storage.searchAirports(query);
    }
  }

  /**
   * Get all airports with optional pagination
   * @param limit Maximum number of airports to return
   * @returns Promise<Airport[]>
   */
  async getAllAirports(limit: number = 100): Promise<Airport[]> {
    try {
      // First try to get from local storage
      const localResults = await this.storage.getAllAirports(limit);
      if (localResults.length > 0) {
        return localResults;
      }

      // If Amadeus API client is available, try to fetch popular airports
      if (this.amadeus) {
        try {
          // Amadeus doesn't have a direct endpoint to get all airports,
          // so we'll return popular airports instead
          const response = await this.amadeus.referenceData.locations.get({
            subType: 'AIRPORT',
            sort: 'analytics.travelers.score',
            page: { limit }
          });

          if (response.result && response.result.data) {
            return response.result.data.map((airport: any) => this.mapToAirport(airport));
          }
        } catch (apiError) {
          console.error('Error fetching airports from Amadeus API:', apiError);
        }
      } else {
        console.log('Amadeus API client not initialized, using local data only');
      }

      return [];
    } catch (error) {
      console.error('Error in getAllAirports:', error);
      // Fallback to local storage
      return this.storage.getAllAirports(limit);
    }
  }

  /**
   * Search for flights
   * @param params Search parameters
   * @returns Promise<Flight[]>
   */
  async searchFlights(params: FlightSearch): Promise<Flight[]> {
    try {
      console.log('Searching flights for params:', params);
      
      // First check if there are any flights in local storage
      const localFlights = await this.storage.getFlights(
        params.origin,
        params.destination,
        params.departureDate
      );
      
      if (localFlights.length > 0) {
        console.log(`Found ${localFlights.length} flights in local storage`);
        return localFlights;
      }

      // If no local results and Amadeus client is available, try Amadeus API
      if (this.amadeus) {
        try {
          const searchParams: any = {
            originLocationCode: params.origin,
            destinationLocationCode: params.destination,
            adults: params.passengers || 1,
            nonStop: true,
            currencyCode: 'USD',
            max: 20
          };

          // Add departure date if provided
          if (params.departureDate) {
            searchParams.departureDate = params.departureDate;
          } else {
            // If no date provided, use a date 2 weeks from now
            const date = new Date();
            date.setDate(date.getDate() + 14);
            searchParams.departureDate = date.toISOString().split('T')[0];
          }

          // Add return date if round trip
          if (params.tripType === 'round-trip' && params.returnDate) {
            searchParams.returnDate = params.returnDate;
          }

          const response = await this.amadeus.shopping.flightOffersSearch.get(searchParams);

          if (response.result && response.result.data) {
            const flights = response.result.data.map((flight: AmadeusFlight, index: number) => 
              this.mapToFlight(flight, index, params.origin, params.destination)
            );
            console.log(`Found ${flights.length} flights with Amadeus API`);
            return flights;
          }
        } catch (apiError) {
          console.error('Error fetching flights from Amadeus API:', apiError);
        }
      } else {
        console.log('Amadeus API client not initialized, using local data only');
      }
      
      // If no results from API or API not available, return empty array
      return [];
    } catch (error) {
      console.error('Error in searchFlights:', error);
      // In case of error, get flights from storage
      return this.storage.getFlights(
        params.origin,
        params.destination,
        params.departureDate
      );
    }
  }

  /**
   * Fetch popular airports and store them in the database
   */
  async seedAirports(limit: number = 100): Promise<number> {
    if (!this.amadeus) {
      console.log('Amadeus API client not initialized, skipping airport seeding');
      return 0;
    }
    
    try {
      console.log(`Seeding airports from Amadeus API with limit ${limit}...`);
      
      // Make multiple requests to get more airports if needed
      let airportsAdded = 0;
      const batchSize = 50; // Amadeus API typically limits to 50 per request
      const iterations = Math.ceil(limit / batchSize);
      
      for (let i = 0; i < iterations; i++) {
        if (airportsAdded >= limit) break;
        
        // Calculate remaining number to fetch
        const remaining = limit - airportsAdded;
        const currentBatchSize = Math.min(batchSize, remaining);
        
        try {
          console.log(`Fetching batch ${i+1}/${iterations} with size ${currentBatchSize}...`);
          
          const response = await this.amadeus.referenceData.locations.get({
            subType: 'AIRPORT',
            sort: 'analytics.travelers.score',
            page: { limit: currentBatchSize, offset: i * batchSize }
          });

          if (response.result && response.result.data && response.result.data.length > 0) {
            let batchAdded = 0;
            
            for (const airportData of response.result.data) {
              try {
                const airport = this.mapToAirport(airportData);
                
                // Check if airport already exists before creating
                const existingAirport = await this.storage.getAirportByIataCode(airport.iataCode);
                if (!existingAirport) {
                  await this.storage.createAirport(airport);
                  batchAdded++;
                  airportsAdded++;
                }
              } catch (err) {
                console.error(`Error processing airport: ${err}`);
              }
            }
            
            console.log(`Added ${batchAdded} new airports from batch ${i+1}`);
          } else {
            console.log(`No airports returned in batch ${i+1}, stopping`);
            break;
          }
        } catch (batchError) {
          console.error(`Error in batch ${i+1}:`, batchError);
          // Continue with next batch
        }
        
        // Add a small delay between batches to avoid rate limiting
        if (i < iterations - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      console.log(`Seeding complete. Added a total of ${airportsAdded} new airports`);
      return airportsAdded;
    } catch (error) {
      console.error('Error seeding airports from Amadeus API:', error);
      return 0;
    }
  }

  /**
   * Map Amadeus airport data to our Airport format
   */
  private mapToAirport(airportData: any): InsertAirport {
    return {
      iataCode: airportData.iataCode,
      icaoCode: airportData.subType === 'AIRPORT' ? airportData.id : null,
      name: airportData.name,
      city: airportData.address?.cityName || airportData.cityName || '',
      country: airportData.address?.countryName || airportData.countryName || '',
      countryCode: airportData.address?.countryCode || airportData.countryCode || '',
      latitude: airportData.geoCode?.latitude || null,
      longitude: airportData.geoCode?.longitude || null,
      timezone: airportData.timeZone || null,
      localName: { "en": airportData.name }
    };
  }

  /**
   * Map Amadeus flight data to our Flight format
   */
  private mapToFlight(flightData: AmadeusFlight, id: number, origin: string, destination: string): InsertFlight {
    // Get the first (or only) itinerary and segment
    const itinerary = flightData.itineraries[0];
    const segment = itinerary.segments[0];
    
    // Parse dates and times
    const departureDateTime = new Date(segment.departure.at);
    const arrivalDateTime = new Date(segment.arrival.at);
    
    // Format times as HH:MM
    const departureTime = departureDateTime.toTimeString().substring(0, 5);
    const arrivalTime = arrivalDateTime.toTimeString().substring(0, 5);
    
    // Calculate price
    const basePrice = parseFloat(flightData.price.base);
    
    return {
      airlineCode: segment.carrierCode,
      airlineName: this.getAirlineName(segment.carrierCode),
      flightNumber: `${segment.carrierCode}${segment.number}`,
      departureAirport: origin,
      departureCity: '',  // Will be filled from airport data
      departureCountry: '', // Will be filled from airport data
      arrivalAirport: destination,
      arrivalCity: '',  // Will be filled from airport data
      arrivalCountry: '', // Will be filled from airport data
      departureTime: departureTime,
      arrivalTime: arrivalTime,
      duration: itinerary.duration.replace('PT', '').toLowerCase(),
      basePrice: basePrice || 120  // Default price if not available
    };
  }

  /**
   * Helper method to get airline name from carrier code
   * In a real implementation, this would use a lookup table or API
   */
  private getAirlineName(carrierCode: string): string {
    const airlines: Record<string, string> = {
      'AF': 'Air France',
      'BA': 'British Airways',
      'LH': 'Lufthansa',
      'EK': 'Emirates',
      'AA': 'American Airlines',
      'DL': 'Delta Air Lines',
      'UA': 'United Airlines',
      'TK': 'Turkish Airlines',
      'MS': 'EgyptAir',
      'QR': 'Qatar Airways',
      'EY': 'Etihad Airways',
      'SQ': 'Singapore Airlines',
      'CX': 'Cathay Pacific',
      'JL': 'Japan Airlines',
      'KL': 'KLM Royal Dutch Airlines'
    };
    
    return airlines[carrierCode] || `Airline ${carrierCode}`;
  }
}