import { db, pool } from './db';
import { IStorage } from './storage';
import { 
  User, InsertUser, 
  Flight, InsertFlight, 
  Passenger, InsertPassenger, 
  Booking, InsertBooking, 
  Airport, InsertAirport, 
  BookingPassenger, InsertBookingPassenger,
  SystemLog, InsertSystemLog, LogLevel,
  AdditionalService, InsertAdditionalService,
  FlightPricing, InsertFlightPricing
} from '@shared/schema';
import { eq, ilike, or, and, sql } from 'drizzle-orm';
import { 
  users, flights, passengers, bookings, airports, 
  bookingPassengers, systemLogs, additionalServices, 
  flightPricing 
} from '@shared/schema';
import { generatePNR } from './utils';
import connectPgSimple from 'connect-pg-simple';
import session from 'express-session';

/**
 * PostgreSQL implementation of the Storage interface
 */
export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;
  
  constructor() {
    const PostgresSessionStore = connectPgSimple(session);
    
    // Initialize session store
    this.sessionStore = new PostgresSessionStore({
      pool,
      tableName: 'session', // Optional. Default is "session"
      createTableIfMissing: true
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const results = await db.select().from(users).where(eq(users.id, id));
    return results[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const results = await db.select().from(users).where(eq(users.username, username));
    return results[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const results = await db.select().from(users).where(eq(users.email, email));
    return results[0];
  }
  
  async getUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const results = await db.insert(users).values(insertUser).returning();
    return results[0];
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const results = await db.update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return results[0];
  }

  // Flight operations
  async getFlight(id: number): Promise<Flight | undefined> {
    try {
      // Only select specific columns to avoid issues with schema mismatches
      const results = await db.select({
        id: flights.id,
        airlineCode: flights.airlineCode,
        airlineName: flights.airlineName,
        flightNumber: flights.flightNumber,
        departureAirport: flights.departureAirport,
        departureCity: flights.departureCity,
        departureCountry: flights.departureCountry,
        arrivalAirport: flights.arrivalAirport,
        arrivalCity: flights.arrivalCity,
        arrivalCountry: flights.arrivalCountry,
        departureTime: flights.departureTime,
        arrivalTime: flights.arrivalTime,
        duration: flights.duration,
        basePrice: flights.basePrice
      })
      .from(flights)
      .where(eq(flights.id, id));
      
      // If a flight was found, add missing fields with default values
      if (results.length > 0) {
        const flight = results[0];
        
        // Add default values for all fields that might be missing
        return {
          ...flight,
          aircraft: 'Boeing 787-9', // Default aircraft
          price: flight.basePrice, // Use basePrice as price
          currency: 'USD', // Default currency
          seatsAvailable: 100, // Default seats available
          status: 'scheduled', // Default status
        };
      }
      
      return undefined;
    } catch (error) {
      console.error('Error fetching flight:', error);
      return undefined;
    }
  }

  async getFlights(
    departureAirport?: string, 
    arrivalAirport?: string, 
    departureDate?: string
  ): Promise<Flight[]> {
    try {
      // Use a specific column list to avoid issues with mismatched schema
      let query = db.select({
        id: flights.id,
        airlineCode: flights.airlineCode,
        airlineName: flights.airlineName,
        flightNumber: flights.flightNumber,
        departureAirport: flights.departureAirport,
        departureCity: flights.departureCity,
        departureCountry: flights.departureCountry,
        arrivalAirport: flights.arrivalAirport,
        arrivalCity: flights.arrivalCity,
        arrivalCountry: flights.arrivalCountry,
        departureTime: flights.departureTime,
        arrivalTime: flights.arrivalTime,
        duration: flights.duration,
        basePrice: flights.basePrice
      }).from(flights);
      
      // Build conditions array
      const conditions = [];
      if (departureAirport) {
        conditions.push(eq(flights.departureAirport, departureAirport));
      }
      
      if (arrivalAirport) {
        conditions.push(eq(flights.arrivalAirport, arrivalAirport));
      }
      
      // In a real implementation, we would also filter by date
      
      // Apply conditions if any exist
      let result = query;
      if (conditions.length > 0) {
        result = query.where(and(...conditions));
      }
      
      // Execute the query and return results
      const results = await query;
      
      // Add default values for missing columns
      return results.map(flight => ({
        ...flight,
        aircraft: 'Boeing 737-800', // Default aircraft
        price: flight.basePrice, // Use basePrice as the price
        currency: 'USD', // Default currency
        seatsAvailable: 100, // Default seats available
        status: 'scheduled' // Default status
      }));
    } catch (error) {
      console.error('Error in getFlights:', error);
      throw error;
    }
  }

  async createFlight(insertFlight: InsertFlight): Promise<Flight> {
    try {
      // Only insert the columns that definitely exist in the database
      const flightData = {
        airlineCode: insertFlight.airlineCode,
        airlineName: insertFlight.airlineName,
        flightNumber: insertFlight.flightNumber,
        departureAirport: insertFlight.departureAirport,
        departureCity: insertFlight.departureCity,
        departureCountry: insertFlight.departureCountry,
        arrivalAirport: insertFlight.arrivalAirport,
        arrivalCity: insertFlight.arrivalCity,
        arrivalCountry: insertFlight.arrivalCountry,
        departureTime: insertFlight.departureTime,
        arrivalTime: insertFlight.arrivalTime,
        duration: insertFlight.duration,
        basePrice: insertFlight.basePrice
      };
      
      const results = await db.insert(flights).values(flightData).returning();
      
      // Add the missing fields that our application needs
      const flight = results[0];
      return {
        ...flight,
        aircraft: 'Boeing 787-9',
        price: flight.basePrice,
        currency: 'USD',
        seatsAvailable: 100,
        status: 'scheduled'
      };
    } catch (error) {
      console.error('Error creating flight:', error);
      throw error;
    }
  }

  // Passenger operations
  async getPassenger(id: number): Promise<Passenger | undefined> {
    const results = await db.select().from(passengers).where(eq(passengers.id, id));
    return results[0];
  }

  async getPassengersByUserId(userId: number): Promise<Passenger[]> {
    return await db.select().from(passengers).where(eq(passengers.userId, userId));
  }

  async createPassenger(insertPassenger: InsertPassenger): Promise<Passenger> {
    const results = await db.insert(passengers).values(insertPassenger).returning();
    return results[0];
  }

  // Booking operations
  async getBooking(id: number): Promise<Booking | undefined> {
    const results = await db.select().from(bookings).where(eq(bookings.id, id));
    return results[0];
  }

  async getBookingByReference(reference: string): Promise<Booking | undefined> {
    const results = await db.select().from(bookings).where(eq(bookings.bookingReference, reference));
    return results[0];
  }

  async getBookingsByUserId(userId: number): Promise<Booking[]> {
    return await db.select().from(bookings).where(eq(bookings.userId, userId));
  }
  
  async getBookingsByStatus(status: string): Promise<Booking[]> {
    if (status === 'all') {
      return await db.select().from(bookings);
    }
    
    return await db.select().from(bookings).where(eq(bookings.status, status));
  }

  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    // Generate a unique booking reference if one isn't provided
    if (!insertBooking.bookingReference) {
      insertBooking.bookingReference = generatePNR();
    }
    
    const results = await db.insert(bookings).values(insertBooking).returning();
    return results[0];
  }

  async updateBooking(id: number, bookingData: Partial<Booking>): Promise<Booking | undefined> {
    const results = await db.update(bookings)
      .set(bookingData)
      .where(eq(bookings.id, id))
      .returning();
    return results[0];
  }

  // Airport operations
  async getAirport(id: number): Promise<Airport | undefined> {
    const results = await db.select().from(airports).where(eq(airports.id, id));
    return results[0];
  }

  async getAirportByIataCode(iataCode: string): Promise<Airport | undefined> {
    const results = await db.select().from(airports).where(eq(airports.iataCode, iataCode));
    return results[0];
  }

  async searchAirports(query: string): Promise<Airport[]> {
    if (!query || query.trim() === '') {
      return this.getAllAirports(10);
    }
    
    const lowerQuery = query.toLowerCase();
    
    // First try exact matches on country
    const countryMatches = await db.select()
      .from(airports)
      .where(ilike(airports.country, lowerQuery))
      .limit(10);
      
    if (countryMatches.length > 0) {
      return countryMatches;
    }
    
    // Then try partial matches on all fields
    return await db.select()
      .from(airports)
      .where(
        or(
          ilike(airports.iataCode, `%${lowerQuery}%`),
          ilike(airports.name, `%${lowerQuery}%`),
          ilike(airports.city, `%${lowerQuery}%`),
          ilike(airports.country, `%${lowerQuery}%`)
        )
      )
      .limit(10);
  }
  
  async getAllAirports(limit?: number): Promise<Airport[]> {
    if (limit) {
      return await db.select().from(airports).limit(limit);
    }
    return await db.select().from(airports);
  }

  async createAirport(insertAirport: InsertAirport): Promise<Airport> {
    const results = await db.insert(airports).values(insertAirport).returning();
    return results[0];
  }

  // Booking-Passenger operations
  async createBookingPassenger(insertBookingPassenger: InsertBookingPassenger): Promise<BookingPassenger> {
    const results = await db.insert(bookingPassengers).values(insertBookingPassenger).returning();
    return results[0];
  }

  async getPassengersByBookingId(bookingId: number): Promise<Passenger[]> {
    try {
      // Use specific column selection to avoid database schema issues
      const result = await db.select({
        id: passengers.id,
        userId: passengers.userId,
        firstName: passengers.firstName,
        lastName: passengers.lastName,
        nationality: passengers.nationality,
        dateOfBirth: passengers.dateOfBirth,
        passportNumber: passengers.passportNumber,
        passportExpiry: passengers.passportExpiry,
        isSaved: passengers.isSaved
      })
      .from(bookingPassengers)
      .innerJoin(
        passengers,
        eq(bookingPassengers.passengerId, passengers.id)
      )
      .where(eq(bookingPassengers.bookingId, bookingId));
      
      // Add default title field since it's missing
      return result.map(passenger => ({
        ...passenger,
        title: "Mr", // Default title as fallback
      }));
    } catch (error) {
      console.error('Error fetching passengers by booking ID:', error);
      // Return empty array instead of throwing to avoid breaking the application
      return [];
    }
  }
  
  // Helper method to seed the database with initial data
  async seedDatabase() {
    try {
      // Check if we have already seeded the database
      const countResult = await pool.query('SELECT COUNT(*) FROM airports');
      const airportCount = parseInt(countResult.rows[0].count);
      
      if (airportCount > 0) {
        console.log('Database already has data, skipping seed');
        return;
      }
      
      console.log('Seeding database with initial data...');
      
      // Seed airports
      await this.seedAirports();
      
      // Seed flights
      await this.seedFlights();
      
      console.log('Database seeded successfully');
    } catch (error) {
      console.error('Error seeding database:', error);
    }
  }
  
  private async seedAirports() {
    const airportData: InsertAirport[] = [
      {
        iataCode: "JFK",
        icaoCode: "KJFK",
        name: "John F. Kennedy International Airport",
        city: "New York",
        country: "United States",
        countryCode: "US",
        latitude: 40.6413,
        longitude: -73.7781,
        timezone: "America/New_York",
        localName: { "en": "John F. Kennedy International Airport" }
      },
      {
        iataCode: "LHR",
        icaoCode: "EGLL",
        name: "London Heathrow Airport",
        city: "London",
        country: "United Kingdom",
        countryCode: "GB",
        latitude: 51.4700,
        longitude: -0.4543,
        timezone: "Europe/London",
        localName: { "en": "London Heathrow Airport" }
      },
      {
        iataCode: "CDG",
        icaoCode: "LFPG",
        name: "Charles de Gaulle Airport",
        city: "Paris",
        country: "France",
        countryCode: "FR",
        latitude: 49.0097,
        longitude: 2.5479,
        timezone: "Europe/Paris",
        localName: { "en": "Charles de Gaulle Airport", "fr": "Aéroport Charles de Gaulle" }
      },
      {
        iataCode: "DXB",
        icaoCode: "OMDB",
        name: "Dubai International Airport",
        city: "Dubai",
        country: "United Arab Emirates",
        countryCode: "AE",
        latitude: 25.2528,
        longitude: 55.3644,
        timezone: "Asia/Dubai",
        localName: { "en": "Dubai International Airport", "ar": "مطار دبي الدولي" }
      },
      {
        iataCode: "FRA",
        icaoCode: "EDDF",
        name: "Frankfurt Airport",
        city: "Frankfurt",
        country: "Germany",
        countryCode: "DE",
        latitude: 50.0379,
        longitude: 8.5622,
        timezone: "Europe/Berlin",
        localName: { "en": "Frankfurt Airport", "de": "Flughafen Frankfurt am Main" }
      },
      {
        iataCode: "MAD",
        icaoCode: "LEMD",
        name: "Adolfo Suárez Madrid–Barajas Airport",
        city: "Madrid",
        country: "Spain",
        countryCode: "ES",
        latitude: 40.4983,
        longitude: -3.5676,
        timezone: "Europe/Madrid",
        localName: { "en": "Madrid-Barajas Airport", "es": "Aeropuerto Adolfo Suárez Madrid-Barajas" }
      },
      {
        iataCode: "DEL",
        icaoCode: "VIDP",
        name: "Indira Gandhi International Airport",
        city: "Delhi",
        country: "India",
        countryCode: "IN",
        latitude: 28.5562,
        longitude: 77.1000,
        timezone: "Asia/Kolkata",
        localName: { "en": "Indira Gandhi International Airport", "hi": "इंदिरा गांधी अंतर्राष्ट्रीय हवाई अड्डा" }
      },
      {
        iataCode: "PEK",
        icaoCode: "ZBAA",
        name: "Beijing Capital International Airport",
        city: "Beijing",
        country: "China",
        countryCode: "CN",
        latitude: 40.0799,
        longitude: 116.6031,
        timezone: "Asia/Shanghai",
        localName: { "en": "Beijing Capital International Airport", "zh": "北京首都国际机场" }
      },
      {
        iataCode: "HND",
        icaoCode: "RJTT",
        name: "Tokyo Haneda Airport",
        city: "Tokyo",
        country: "Japan",
        countryCode: "JP",
        latitude: 35.5494,
        longitude: 139.7798,
        timezone: "Asia/Tokyo",
        localName: { "en": "Tokyo Haneda Airport", "ja": "東京国際空港" }
      },
      {
        iataCode: "SVO",
        icaoCode: "UUEE",
        name: "Sheremetyevo International Airport",
        city: "Moscow",
        country: "Russia",
        countryCode: "RU",
        latitude: 55.9726,
        longitude: 37.4146,
        timezone: "Europe/Moscow",
        localName: { "en": "Sheremetyevo International Airport", "ru": "Международный аэропорт Шереметьево" }
      },
      {
        iataCode: "GRU",
        icaoCode: "SBGR",
        name: "São Paulo–Guarulhos International Airport",
        city: "São Paulo",
        country: "Brazil",
        countryCode: "BR",
        latitude: -23.4356,
        longitude: -46.4731,
        timezone: "America/Sao_Paulo",
        localName: { "en": "São Paulo–Guarulhos International Airport", "pt": "Aeroporto Internacional de São Paulo-Guarulhos" }
      }
    ];
    
    for (const airport of airportData) {
      await this.createAirport(airport);
    }
  }
  
  private async seedFlights() {
    const flightData: InsertFlight[] = [
      {
        airlineCode: "EK",
        airlineName: "Emirates",
        flightNumber: "EK123",
        departureAirport: "JFK",
        departureCity: "New York",
        departureCountry: "United States",
        arrivalAirport: "DXB",
        arrivalCity: "Dubai",
        arrivalCountry: "United Arab Emirates",
        departureTime: "10:30",
        arrivalTime: "18:00",
        duration: "7h 30m",
        basePrice: 12
      },
      {
        airlineCode: "LH",
        airlineName: "Lufthansa",
        flightNumber: "LH400",
        departureAirport: "JFK",
        departureCity: "New York",
        departureCountry: "United States",
        arrivalAirport: "FRA",
        arrivalCity: "Frankfurt",
        arrivalCountry: "Germany",
        departureTime: "16:45",
        arrivalTime: "07:00",
        duration: "8h 15m",
        basePrice: 12
      },
      {
        airlineCode: "BA",
        airlineName: "British Airways",
        flightNumber: "BA178",
        departureAirport: "JFK",
        departureCity: "New York",
        departureCountry: "United States",
        arrivalAirport: "LHR",
        arrivalCity: "London",
        arrivalCountry: "United Kingdom",
        departureTime: "20:15",
        arrivalTime: "08:30",
        duration: "7h 15m",
        basePrice: 12
      },
      {
        airlineCode: "AF",
        airlineName: "Air France",
        flightNumber: "AF007",
        departureAirport: "JFK",
        departureCity: "New York",
        departureCountry: "United States",
        arrivalAirport: "CDG",
        arrivalCity: "Paris",
        arrivalCountry: "France",
        departureTime: "19:30",
        arrivalTime: "08:45",
        duration: "7h 15m",
        basePrice: 12
      },
      {
        airlineCode: "IB",
        airlineName: "Iberia",
        flightNumber: "IB6250",
        departureAirport: "JFK",
        departureCity: "New York",
        departureCountry: "United States",
        arrivalAirport: "MAD",
        arrivalCity: "Madrid",
        arrivalCountry: "Spain",
        departureTime: "21:00",
        arrivalTime: "10:40",
        duration: "7h 40m",
        basePrice: 12
      }
    ];
    
    for (const flight of flightData) {
      await this.createFlight(flight);
    }
  }
  
  // System logs operations
  async getSystemLogs(level: string, search: string, page: number, limit: number): Promise<SystemLog[]> {
    let query = db.select().from(systemLogs);
    
    // Add conditions for filtering
    const conditions = [];
    
    // Filter by level if not 'all'
    if (level && level !== 'all') {
      conditions.push(eq(systemLogs.level, level));
    }
    
    // Filter by search term if provided
    if (search && search.trim() !== '') {
      const searchLower = search.toLowerCase();
      conditions.push(
        or(
          ilike(systemLogs.message, `%${searchLower}%`),
          ilike(systemLogs.service, `%${searchLower}%`)
        )
      );
    }
    
    // Apply conditions if any
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    // Add pagination and ordering
    query = query
      .orderBy(systemLogs.timestamp, 'desc')
      .limit(limit)
      .offset((page - 1) * limit);
    
    // Execute the query
    return await query;
  }
  
  async getSystemLogCount(level: string, search: string): Promise<number> {
    let query = db.select({ count: sql<number>`count(*)` }).from(systemLogs);
    
    // Add conditions for filtering
    const conditions = [];
    
    // Filter by level if not 'all'
    if (level && level !== 'all') {
      conditions.push(eq(systemLogs.level, level));
    }
    
    // Filter by search term if provided
    if (search && search.trim() !== '') {
      const searchLower = search.toLowerCase();
      conditions.push(
        or(
          ilike(systemLogs.message, `%${searchLower}%`),
          ilike(systemLogs.service, `%${searchLower}%`)
        )
      );
    }
    
    // Apply conditions if any
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    // Execute query
    const result = await query;
    return Number(result[0].count);
  }
  
  async addSystemLog(level: LogLevel, service: string, message: string): Promise<SystemLog> {
    const logEntry: InsertSystemLog = {
      level,
      service,
      message
    };
    
    const results = await db.insert(systemLogs).values(logEntry).returning();
    console.log(`[${level.toUpperCase()}] ${service}: ${message}`);
    
    return results[0];
  }
  
  // Pricing operations for admin panel
  async getPricingBase(): Promise<any[]> {
    // Return pricing data for different class types
    return [
      { id: 1, type: "economy", basePrice: 199, description: "Economy Class" },
      { id: 2, type: "premium_economy", basePrice: 399, description: "Premium Economy" },
      { id: 3, type: "business", basePrice: 899, description: "Business Class" },
      { id: 4, type: "first", basePrice: 1499, description: "First Class" }
    ];
  }
  
  async getPricingFees(): Promise<any[]> {
    // Return fee data for different service types
    return [
      { id: 1, name: "processing_fee", amount: 25, type: "fixed", description: "Processing Fee" },
      { id: 2, name: "rush_fee", amount: 50, type: "fixed", description: "Rush Processing Fee" },
      { id: 3, name: "priority_fee", amount: 75, type: "fixed", description: "Priority Service Fee" },
      { id: 4, name: "tax", amount: 7.5, type: "percentage", description: "Tax" }
    ];
  }
  
  async getPricingDiscounts(): Promise<any[]> {
    // Return discount data with various promotion codes
    return [
      { id: 1, code: "WELCOME10", amount: 10, type: "percentage", description: "New user discount", minAmount: 100, maxAmount: 1000, expiresAt: "2025-12-31T23:59:59Z" },
      { id: 2, code: "RETURN15", amount: 15, type: "percentage", description: "Returning customer discount", minAmount: 200, maxAmount: 2000, expiresAt: "2025-12-31T23:59:59Z" },
      { id: 3, code: "FLAT50", amount: 50, type: "fixed", description: "Flat discount", minAmount: 500, maxAmount: null, expiresAt: "2025-06-30T23:59:59Z" },
      { id: 4, code: "SUMMER2023", amount: 20, type: "percentage", description: "Summer promotion", minAmount: 300, maxAmount: 3000, expiresAt: "2025-09-30T23:59:59Z" }
    ];
  }

  // Flight Pricing Methods
  async getFlightPricing(id?: number): Promise<FlightPricing[]> {
    try {
      if (id) {
        const results = await db.select().from(flightPricing).where(eq(flightPricing.id, id));
        return results;
      }
      return await db.select().from(flightPricing);
    } catch (error) {
      console.error('Error fetching flight pricing:', error);
      return [];
    }
  }

  async createFlightPricing(pricing: InsertFlightPricing): Promise<FlightPricing> {
    try {
      const results = await db.insert(flightPricing).values({
        ...pricing,
        createdAt: new Date(),
        isActive: pricing.isActive ?? true,
        currency: pricing.currency ?? 'USD',
        travelClass: pricing.travelClass ?? 'economy'
      }).returning();
      return results[0];
    } catch (error) {
      console.error('Error creating flight pricing:', error);
      throw error;
    }
  }

  async updateFlightPricing(id: number, pricing: Partial<FlightPricing>): Promise<FlightPricing | undefined> {
    try {
      const results = await db.update(flightPricing)
        .set(pricing)
        .where(eq(flightPricing.id, id))
        .returning();
      return results[0];
    } catch (error) {
      console.error('Error updating flight pricing:', error);
      return undefined;
    }
  }

  async deleteFlightPricing(id: number): Promise<boolean> {
    try {
      const result = await db.delete(flightPricing)
        .where(eq(flightPricing.id, id))
        .returning({ id: flightPricing.id });
      return result.length > 0;
    } catch (error) {
      console.error('Error deleting flight pricing:', error);
      return false;
    }
  }

  // Additional Services Methods
  async getAdditionalServices(active?: boolean): Promise<AdditionalService[]> {
    try {
      if (active !== undefined) {
        return await db.select().from(additionalServices).where(eq(additionalServices.isActive, active));
      }
      return await db.select().from(additionalServices);
    } catch (error) {
      console.error('Error fetching additional services:', error);
      return [];
    }
  }

  async getAdditionalService(id: number): Promise<AdditionalService | undefined> {
    try {
      const results = await db.select().from(additionalServices).where(eq(additionalServices.id, id));
      return results[0];
    } catch (error) {
      console.error('Error fetching additional service:', error);
      return undefined;
    }
  }

  async createAdditionalService(service: InsertAdditionalService): Promise<AdditionalService> {
    try {
      const results = await db.insert(additionalServices).values({
        ...service,
        createdAt: new Date(),
        isActive: service.isActive ?? true,
        currency: service.currency ?? 'USD'
      }).returning();
      return results[0];
    } catch (error) {
      console.error('Error creating additional service:', error);
      throw error;
    }
  }

  async updateAdditionalService(id: number, service: Partial<AdditionalService>): Promise<AdditionalService | undefined> {
    try {
      const results = await db.update(additionalServices)
        .set(service)
        .where(eq(additionalServices.id, id))
        .returning();
      return results[0];
    } catch (error) {
      console.error('Error updating additional service:', error);
      return undefined;
    }
  }

  async deleteAdditionalService(id: number): Promise<boolean> {
    try {
      const result = await db.delete(additionalServices)
        .where(eq(additionalServices.id, id))
        .returning({ id: additionalServices.id });
      return result.length > 0;
    } catch (error) {
      console.error('Error deleting additional service:', error);
      return false;
    }
  }
  
  async clearAllAdditionalServices(): Promise<boolean> {
    try {
      await db.delete(additionalServices);
      console.log('All additional services deleted');
      return true;
    } catch (error) {
      console.error('Error clearing additional services:', error);
      return false;
    }
  }
  
  async resetAdditionalServices(): Promise<AdditionalService[]> {
    try {
      // First clear all existing services
      await this.clearAllAdditionalServices();
      
      // Add the two required services
      const services: InsertAdditionalService[] = [
        {
          name: "Hotel Reservation",
          description: "Add a matching hotel reservation document",
          price: 2,
          type: "hotel", // Using hotel type to match client-side mapping
          currency: "USD",
          isActive: true
        },
        {
          name: "Insurance Letter",
          description: "Travel insurance confirmation document",
          price: 2,
          type: "insurance",
          currency: "USD",
          isActive: true
        }
      ];
      
      const createdServices = [];
      
      for (const service of services) {
        const createdService = await this.createAdditionalService(service);
        createdServices.push(createdService);
      }
      
      console.log(`Reset additional services: ${createdServices.length} services added`);
      return createdServices;
    } catch (error) {
      console.error('Error resetting additional services:', error);
      return [];
    }
  }
}