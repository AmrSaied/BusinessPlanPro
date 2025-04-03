import { db, pool } from './db';
import { IStorage } from './storage';
import { 
  User, InsertUser, 
  Flight, InsertFlight, 
  Passenger, InsertPassenger, 
  Booking, InsertBooking, 
  Airport, InsertAirport, 
  BookingPassenger, InsertBookingPassenger 
} from '@shared/schema';
import { eq, ilike, or, and } from 'drizzle-orm';
import { users, flights, passengers, bookings, airports, bookingPassengers } from '@shared/schema';
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
    const results = await db.select().from(flights).where(eq(flights.id, id));
    return results[0];
  }

  async getFlights(
    departureAirport?: string, 
    arrivalAirport?: string, 
    departureDate?: string
  ): Promise<Flight[]> {
    let query = db.select().from(flights);
    
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
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    // Execute the query and return results
    const results = await query;
    return results;
  }

  async createFlight(insertFlight: InsertFlight): Promise<Flight> {
    const results = await db.insert(flights).values(insertFlight).returning();
    return results[0];
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
      return [];
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
    // Join booking_passengers and passengers tables to get passengers for a booking
    const result = await db.select({
      passenger: passengers
    })
    .from(bookingPassengers)
    .innerJoin(
      passengers,
      eq(bookingPassengers.passengerId, passengers.id)
    )
    .where(eq(bookingPassengers.bookingId, bookingId));
    
    return result.map(row => row.passenger);
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
}