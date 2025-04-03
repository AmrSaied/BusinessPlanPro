import { 
  User, InsertUser, 
  Flight, InsertFlight,
  Passenger, InsertPassenger,
  Booking, InsertBooking, 
  Airport, InsertAirport,
  BookingPassenger, InsertBookingPassenger
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  
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
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBooking(id: number, booking: Partial<Booking>): Promise<Booking | undefined>;
  
  // Airport operations
  getAirport(id: number): Promise<Airport | undefined>;
  getAirportByIataCode(iataCode: string): Promise<Airport | undefined>;
  searchAirports(query: string): Promise<Airport[]>;
  createAirport(airport: InsertAirport): Promise<Airport>;
  
  // Booking-Passenger operations
  createBookingPassenger(bookingPassenger: InsertBookingPassenger): Promise<BookingPassenger>;
  getPassengersByBookingId(bookingId: number): Promise<Passenger[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private flights: Map<number, Flight>;
  private passengers: Map<number, Passenger>;
  private bookings: Map<number, Booking>;
  private airports: Map<number, Airport>;
  private bookingPassengers: Map<number, BookingPassenger>;
  
  private currentUserId: number;
  private currentFlightId: number;
  private currentPassengerId: number;
  private currentBookingId: number;
  private currentAirportId: number;
  private currentBookingPassengerId: number;

  constructor() {
    this.users = new Map();
    this.flights = new Map();
    this.passengers = new Map();
    this.bookings = new Map();
    this.airports = new Map();
    this.bookingPassengers = new Map();
    
    this.currentUserId = 1;
    this.currentFlightId = 1;
    this.currentPassengerId = 1;
    this.currentBookingId = 1;
    this.currentAirportId = 1;
    this.currentBookingPassengerId = 1;
    
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

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id, createdAt: new Date() };
    this.users.set(id, user);
    return user;
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
    const passenger: Passenger = { ...insertPassenger, id };
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
  
  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const id = this.currentBookingId++;
    const booking: Booking = { 
      ...insertBooking, 
      id, 
      createdAt: new Date()
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
    const lowerQuery = query.toLowerCase();
    return Array.from(this.airports.values()).filter(
      (airport) => 
        airport.iataCode.toLowerCase().includes(lowerQuery) ||
        airport.name.toLowerCase().includes(lowerQuery) ||
        airport.city.toLowerCase().includes(lowerQuery) ||
        airport.country.toLowerCase().includes(lowerQuery)
    ).slice(0, 10); // Limit to 10 results
  }
  
  async createAirport(insertAirport: InsertAirport): Promise<Airport> {
    const id = this.currentAirportId++;
    const airport: Airport = { ...insertAirport, id };
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
  
  // Helper methods to initialize data
  private initializeAirports() {
    const airports: InsertAirport[] = [
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
    
    airports.forEach(airport => {
      this.createAirport(airport);
    });
  }
  
  private initializeFlights() {
    const flights: InsertFlight[] = [
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
    
    flights.forEach(flight => {
      this.createFlight(flight);
    });
  }
}

export const storage = new MemStorage();
