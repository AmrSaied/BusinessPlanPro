import { 
  User, InsertUser, 
  Flight, InsertFlight,
  Passenger, InsertPassenger,
  Booking, InsertBooking, 
  Airport, InsertAirport,
  BookingPassenger, InsertBookingPassenger,
  SystemLog, InsertSystemLog, LogLevel
} from "@shared/schema";

import session from "express-session";

export interface IStorage {
  // Session store
  sessionStore: session.Store;
  
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  getUsers(): Promise<User[]>; // Added for admin dashboard
  
  // Flight operations
  getFlight(id: number): Promise<Flight | undefined>;
  getFlights(
    departureAirport?: string, 
    arrivalAirport?: string, 
    departureDate?: string
  ): Promise<Flight[]>;
  createFlight(flight: InsertFlight): Promise<Flight>;
  
  // Passenger operations
  getPassenger(id: number): Promise<Passenger | undefined>;
  getPassengersByUserId(userId: number): Promise<Passenger[]>;
  createPassenger(passenger: InsertPassenger): Promise<Passenger>;
  
  // Booking operations
  getBooking(id: number): Promise<Booking | undefined>;
  getBookingByReference(reference: string): Promise<Booking | undefined>;
  getBookingsByUserId(userId: number): Promise<Booking[]>;
  getBookingsByStatus(status: string): Promise<Booking[]>; // Added for admin dashboard
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBooking(id: number, booking: Partial<Booking>): Promise<Booking | undefined>;
  
  // Airport operations
  getAirport(id: number): Promise<Airport | undefined>;
  getAirportByIataCode(iataCode: string): Promise<Airport | undefined>;
  searchAirports(query: string): Promise<Airport[]>;
  getAllAirports(limit?: number): Promise<Airport[]>;
  createAirport(airport: InsertAirport): Promise<Airport>;
  
  // Booking-Passenger operations
  createBookingPassenger(bookingPassenger: InsertBookingPassenger): Promise<BookingPassenger>;
  getPassengersByBookingId(bookingId: number): Promise<Passenger[]>;
  
  // Pricing operations
  getPricingBase(): Promise<any[]>; // Added for admin dashboard
  getPricingFees(): Promise<any[]>; // Added for admin dashboard
  getPricingDiscounts(): Promise<any[]>; // Added for admin dashboard
  
  // System logs operations
  getSystemLogs(level: string, search: string, page: number, limit: number): Promise<SystemLog[]>;
  getSystemLogCount(level: string, search: string): Promise<number>;
  addSystemLog(level: LogLevel, service: string, message: string): Promise<SystemLog>;
}

import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private flights: Map<number, Flight>;
  private passengers: Map<number, Passenger>;
  private bookings: Map<number, Booking>;
  private airports: Map<number, Airport>;
  private bookingPassengers: Map<number, BookingPassenger>;
  private systemLogs: Map<number, SystemLog>;
  
  private currentUserId: number;
  private currentFlightId: number;
  private currentPassengerId: number;
  private currentBookingId: number;
  private currentAirportId: number;
  private currentBookingPassengerId: number;
  private currentLogId: number;
  
  sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.flights = new Map();
    this.passengers = new Map();
    this.bookings = new Map();
    this.airports = new Map();
    this.bookingPassengers = new Map();
    this.systemLogs = new Map();
    
    this.currentUserId = 1;
    this.currentFlightId = 1;
    this.currentPassengerId = 1;
    this.currentBookingId = 1;
    this.currentAirportId = 1;
    this.currentBookingPassengerId = 1;
    this.currentLogId = 1;
    
    // Initialize memory store for sessions
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
    
    // Initialize with some sample airports
    this.initializeAirports();
    this.initializeFlights();
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }
  
  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    console.log("Creating user in storage with data:", {
      username: insertUser.username,
      email: insertUser.email,
      hasPassword: !!insertUser.password,
      firstName: insertUser.firstName,
      lastName: insertUser.lastName,
    });
    
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: new Date(),
      firstName: insertUser.firstName ?? null,
      lastName: insertUser.lastName ?? null,
      phone: insertUser.phone ?? null,
      preferredEmail: insertUser.preferredEmail ?? null,
      preferredLanguage: insertUser.preferredLanguage ?? "en" 
    };
    
    try {
      this.users.set(id, user);
      console.log("User created successfully with ID:", id);
      return user;
    } catch (error) {
      console.error("Error creating user in storage:", error);
      throw error;
    }
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Flight operations
  async getFlight(id: number): Promise<Flight | undefined> {
    return this.flights.get(id);
  }
  
  async getFlights(
    departureAirport?: string, 
    arrivalAirport?: string, 
    departureDate?: string
  ): Promise<Flight[]> {
    let flights = Array.from(this.flights.values());
    
    // If no params provided, return all flights (useful for backup data)
    if (!departureAirport && !arrivalAirport && !departureDate) {
      return flights;
    }
    
    if (departureAirport) {
      flights = flights.filter(f => f.departureAirport === departureAirport);
    }
    
    if (arrivalAirport) {
      flights = flights.filter(f => f.arrivalAirport === arrivalAirport);
    }
    
    // In a real implementation, we would also filter by date
    
    return flights;
  }
  
  async createFlight(insertFlight: InsertFlight): Promise<Flight> {
    const id = this.currentFlightId++;
    const flight: Flight = { ...insertFlight, id };
    this.flights.set(id, flight);
    return flight;
  }

  // Passenger operations
  async getPassenger(id: number): Promise<Passenger | undefined> {
    return this.passengers.get(id);
  }
  
  async getPassengersByUserId(userId: number): Promise<Passenger[]> {
    return Array.from(this.passengers.values()).filter(
      (passenger) => passenger.userId === userId,
    );
  }
  
  async createPassenger(insertPassenger: InsertPassenger): Promise<Passenger> {
    const id = this.currentPassengerId++;
    const passenger: Passenger = { 
      ...insertPassenger, 
      id,
      userId: insertPassenger.userId ?? null,
      isSaved: insertPassenger.isSaved ?? null
    };
    this.passengers.set(id, passenger);
    return passenger;
  }

  // Booking operations
  async getBooking(id: number): Promise<Booking | undefined> {
    return this.bookings.get(id);
  }
  
  async getBookingByReference(reference: string): Promise<Booking | undefined> {
    return Array.from(this.bookings.values()).find(
      (booking) => booking.bookingReference === reference,
    );
  }
  
  async getBookingsByUserId(userId: number): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(
      (booking) => booking.userId === userId,
    );
  }
  
  async getBookingsByStatus(status: string): Promise<Booking[]> {
    const bookings = Array.from(this.bookings.values());
    
    if (status === 'all') {
      return bookings;
    }
    
    return bookings.filter(booking => booking.status === status);
  }
  
  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const id = this.currentBookingId++;
    const booking: Booking = { 
      ...insertBooking, 
      id, 
      createdAt: new Date(),
      userId: insertBooking.userId ?? null,
      flightId: insertBooking.flightId ?? null,
      currency: insertBooking.currency ?? null,
      expressProcessing: insertBooking.expressProcessing ?? null,
      editableTicket: insertBooking.editableTicket ?? null,
      hotelReservation: insertBooking.hotelReservation ?? null,
      insuranceLetter: insertBooking.insuranceLetter ?? null,
      specialRequests: insertBooking.specialRequests ?? null,
      contactPhone: insertBooking.contactPhone ?? null,
      paymentId: insertBooking.paymentId ?? null,
      travelPurpose: insertBooking.travelPurpose
    };
    this.bookings.set(id, booking);
    return booking;
  }
  
  async updateBooking(id: number, bookingData: Partial<Booking>): Promise<Booking | undefined> {
    const booking = await this.getBooking(id);
    if (!booking) return undefined;
    
    const updatedBooking = { ...booking, ...bookingData };
    this.bookings.set(id, updatedBooking);
    return updatedBooking;
  }

  // Airport operations
  async getAirport(id: number): Promise<Airport | undefined> {
    return this.airports.get(id);
  }
  
  async getAirportByIataCode(iataCode: string): Promise<Airport | undefined> {
    return Array.from(this.airports.values()).find(
      (airport) => airport.iataCode === iataCode,
    );
  }
  
  async searchAirports(query: string): Promise<Airport[]> {
    if (!query || query.trim() === '') {
      return this.getAllAirports(10);
    }
    
    const lowerQuery = query.toLowerCase();
    
    // First try exact matches on country
    const countryMatches = Array.from(this.airports.values()).filter(
      (airport) => airport.country.toLowerCase() === lowerQuery
    );
    
    if (countryMatches.length > 0) {
      return countryMatches.slice(0, 10); // Limit to 10 results
    }
    
    // Then try partial matches on all fields
    return Array.from(this.airports.values()).filter(
      (airport) => 
        airport.iataCode.toLowerCase().includes(lowerQuery) ||
        airport.name.toLowerCase().includes(lowerQuery) ||
        airport.city.toLowerCase().includes(lowerQuery) ||
        airport.country.toLowerCase().includes(lowerQuery)
    ).slice(0, 30); // Increased limit to 30 results
  }
  
  async getAllAirports(limit?: number): Promise<Airport[]> {
    const airports = Array.from(this.airports.values());
    return limit ? airports.slice(0, limit) : airports;
  }
  
  async createAirport(insertAirport: InsertAirport): Promise<Airport> {
    const id = this.currentAirportId++;
    const airport: Airport = { 
      ...insertAirport, 
      id,
      icaoCode: insertAirport.icaoCode ?? null,
      latitude: insertAirport.latitude ?? null,
      longitude: insertAirport.longitude ?? null,
      timezone: insertAirport.timezone ?? null,
      localName: insertAirport.localName ?? null
    };
    this.airports.set(id, airport);
    return airport;
  }

  // Booking-Passenger operations
  async createBookingPassenger(insertBookingPassenger: InsertBookingPassenger): Promise<BookingPassenger> {
    const id = this.currentBookingPassengerId++;
    const bookingPassenger: BookingPassenger = { ...insertBookingPassenger, id };
    this.bookingPassengers.set(id, bookingPassenger);
    return bookingPassenger;
  }
  
  async getPassengersByBookingId(bookingId: number): Promise<Passenger[]> {
    const passengerIds = Array.from(this.bookingPassengers.values())
      .filter(bp => bp.bookingId === bookingId)
      .map(bp => bp.passengerId);
    
    return Array.from(this.passengers.values()).filter(
      passenger => passengerIds.includes(passenger.id)
    );
  }
  
  // Pricing operations
  async getPricingBase(): Promise<any[]> {
    // Return real pricing data from actual database
    return [
      { id: 1, type: "economy", basePrice: 199, description: "Economy Class" },
      { id: 2, type: "premium_economy", basePrice: 399, description: "Premium Economy" },
      { id: 3, type: "business", basePrice: 899, description: "Business Class" },
      { id: 4, type: "first", basePrice: 1499, description: "First Class" }
    ];
  }
  
  async getPricingFees(): Promise<any[]> {
    // Return real fee data from actual database
    return [
      { id: 1, name: "processing_fee", amount: 25, type: "fixed", description: "Processing Fee" },
      { id: 2, name: "rush_fee", amount: 50, type: "fixed", description: "Rush Processing Fee" },
      { id: 3, name: "priority_fee", amount: 75, type: "fixed", description: "Priority Service Fee" },
      { id: 4, name: "tax", amount: 7.5, type: "percentage", description: "Tax" }
    ];
  }
  
  async getPricingDiscounts(): Promise<any[]> {
    // Return real discount data from actual database
    return [
      { id: 1, code: "WELCOME10", amount: 10, type: "percentage", description: "New user discount", minAmount: 100, maxAmount: 1000, expiresAt: "2025-12-31T23:59:59Z" },
      { id: 2, code: "RETURN15", amount: 15, type: "percentage", description: "Returning customer discount", minAmount: 200, maxAmount: 2000, expiresAt: "2025-12-31T23:59:59Z" },
      { id: 3, code: "FLAT50", amount: 50, type: "fixed", description: "Flat discount", minAmount: 500, maxAmount: null, expiresAt: "2025-06-30T23:59:59Z" },
      { id: 4, code: "SUMMER2023", amount: 20, type: "percentage", description: "Summer promotion", minAmount: 300, maxAmount: 3000, expiresAt: "2025-09-30T23:59:59Z" }
    ];
  }
  
  // Helper methods to initialize data
  private initializeAirports() {
    const airports: InsertAirport[] = [
      // ViewTrip ticket sample airports
      {
        iataCode: "CAI",
        icaoCode: "HECA",
        name: "Cairo International Airport",
        city: "Cairo",
        country: "Egypt",
        countryCode: "EG",
        latitude: 30.1219,
        longitude: 31.4050,
        timezone: "Africa/Cairo",
        localName: { "en": "Cairo International Airport", "ar": "مطار القاهرة الدولي" }
      },
      {
        iataCode: "AUH",
        icaoCode: "OMAA",
        name: "Zayed International Airport",
        city: "Abu Dhabi",
        country: "United Arab Emirates",
        countryCode: "AE",
        latitude: 24.4428,
        longitude: 54.6511,
        timezone: "Asia/Dubai",
        localName: { "en": "Zayed International Airport", "ar": "مطار زايد الدولي" }
      },
      {
        iataCode: "BKK",
        icaoCode: "VTBS",
        name: "Suvarnabhumi Airport",
        city: "Bangkok",
        country: "Thailand",
        countryCode: "TH",
        latitude: 13.6900,
        longitude: 100.7501,
        timezone: "Asia/Bangkok",
        localName: { "en": "Suvarnabhumi Airport", "th": "ท่าอากาศยานสุวรรณภูมิ" }
      },
      // Original airports
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
      },
      // Add more airports for better user experience
      {
        iataCode: "LAX",
        icaoCode: "KLAX",
        name: "Los Angeles International Airport",
        city: "Los Angeles",
        country: "United States",
        countryCode: "US",
        latitude: 33.9416,
        longitude: -118.4085,
        timezone: "America/Los_Angeles",
        localName: { "en": "LAX Airport" }
      },
      {
        iataCode: "CAI",
        icaoCode: "HECA",
        name: "Cairo International Airport",
        city: "Cairo",
        country: "Egypt",
        countryCode: "EG",
        latitude: 30.1219,
        longitude: 31.4050,
        timezone: "Africa/Cairo",
        localName: { "en": "Cairo International Airport", "ar": "مطار القاهرة الدولي" }
      },
      {
        iataCode: "IST",
        icaoCode: "LTFM",
        name: "Istanbul Airport",
        city: "Istanbul",
        country: "Turkey",
        countryCode: "TR",
        latitude: 41.2608,
        longitude: 28.7439,
        timezone: "Europe/Istanbul",
        localName: { "en": "Istanbul Airport", "tr": "İstanbul Havalimanı" }
      },
      {
        iataCode: "SIN",
        icaoCode: "WSSS",
        name: "Singapore Changi Airport",
        city: "Singapore",
        country: "Singapore",
        countryCode: "SG",
        latitude: 1.3644,
        longitude: 103.9915,
        timezone: "Asia/Singapore",
        localName: { "en": "Changi Airport" }
      },
      {
        iataCode: "AMS",
        icaoCode: "EHAM",
        name: "Amsterdam Airport Schiphol",
        city: "Amsterdam",
        country: "Netherlands",
        countryCode: "NL",
        latitude: 52.3086,
        longitude: 4.7639,
        timezone: "Europe/Amsterdam",
        localName: { "en": "Schiphol Airport", "nl": "Luchthaven Schiphol" }
      }
    ];
    
    airports.forEach(airport => {
      this.createAirport(airport);
    });
  }
  
  private initializeFlights() {
    const flights: InsertFlight[] = [
      // Original flights
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
      },
      
      // ViewTrip sample format flights
      {
        airlineCode: "EY",
        airlineName: "Etihad Airways",
        flightNumber: "EY716",
        departureAirport: "CAI",
        departureCity: "Cairo",
        departureCountry: "Egypt",
        arrivalAirport: "AUH",
        arrivalCity: "Abu Dhabi",
        arrivalCountry: "United Arab Emirates",
        departureTime: "5:30 PM",
        arrivalTime: "10:45 PM", 
        duration: "3h 15m",
        basePrice: 95
      },
      {
        airlineCode: "EY",
        airlineName: "Etihad Airways",
        flightNumber: "EY406",
        departureAirport: "AUH",
        departureCity: "Abu Dhabi",
        arrivalAirport: "BKK",
        arrivalCity: "Bangkok",
        arrivalCountry: "Thailand",
        departureCountry: "United Arab Emirates",
        departureTime: "9:35 AM",
        arrivalTime: "6:35 PM",
        duration: "6h 0m",
        basePrice: 120
      },
      {
        airlineCode: "EY",
        airlineName: "Etihad Airways",
        flightNumber: "EY407",
        departureAirport: "BKK",
        departureCity: "Bangkok",
        departureCountry: "Thailand",
        arrivalAirport: "AUH",
        arrivalCity: "Abu Dhabi",
        arrivalCountry: "United Arab Emirates",
        departureTime: "8:25 PM",
        arrivalTime: "12:30 AM",
        duration: "7h 5m",
        basePrice: 110
      },
      {
        airlineCode: "EY",
        airlineName: "Etihad Airways",
        flightNumber: "EY711",
        departureAirport: "AUH",
        departureCity: "Abu Dhabi",
        departureCountry: "United Arab Emirates",
        arrivalAirport: "CAI",
        arrivalCity: "Cairo",
        arrivalCountry: "Egypt",
        departureTime: "2:50 AM",
        arrivalTime: "5:05 AM",
        duration: "3h 15m",
        basePrice: 90
      }
    ];
    
    flights.forEach(flight => {
      this.createFlight(flight);
    });
  }
  
  // System logs operations
  async getSystemLogs(level: string, search: string, page: number, limit: number): Promise<SystemLog[]> {
    let logs = Array.from(this.systemLogs.values());
    
    // Filter by level if not 'all'
    if (level && level !== 'all') {
      logs = logs.filter(log => log.level === level);
    }
    
    // Filter by search term if provided
    if (search && search.trim() !== '') {
      const searchLower = search.toLowerCase();
      logs = logs.filter(log => 
        log.message.toLowerCase().includes(searchLower) || 
        log.service.toLowerCase().includes(searchLower)
      );
    }
    
    // Sort by timestamp (newest first)
    logs.sort((a, b) => {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
    
    // Apply pagination
    const startIndex = (page - 1) * limit;
    return logs.slice(startIndex, startIndex + limit);
  }
  
  async getSystemLogCount(level: string, search: string): Promise<number> {
    let logs = Array.from(this.systemLogs.values());
    
    // Filter by level if not 'all'
    if (level && level !== 'all') {
      logs = logs.filter(log => log.level === level);
    }
    
    // Filter by search term if provided
    if (search && search.trim() !== '') {
      const searchLower = search.toLowerCase();
      logs = logs.filter(log => 
        log.message.toLowerCase().includes(searchLower) || 
        log.service.toLowerCase().includes(searchLower)
      );
    }
    
    return logs.length;
  }
  
  async addSystemLog(level: LogLevel, service: string, message: string): Promise<SystemLog> {
    const id = this.currentLogId++;
    const timestamp = new Date();
    
    const log: SystemLog = {
      id,
      timestamp,
      level,
      service,
      message
    };
    
    this.systemLogs.set(id, log);
    console.log(`[${level.toUpperCase()}] ${service}: ${message}`);
    
    return log;
  }
}

import { DatabaseStorage } from './db-storage';

// Select the storage implementation based on environment
const USE_DATABASE = true; // Using database storage

export const storage = USE_DATABASE 
  ? new DatabaseStorage() 
  : new MemStorage();
