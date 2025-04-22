import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User Schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  phone: text("phone"),
  preferredEmail: text("preferred_email"),
  preferredLanguage: text("preferred_language").default("en"),
  createdAt: timestamp("created_at").defaultNow(),
  role: text("role").default("user"), // Possible values: "user", "admin"
  isActive: boolean("is_active").default(true),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  firstName: true,
  lastName: true,
  phone: true,
  preferredEmail: true,
  preferredLanguage: true,
  role: true,
  isActive: true,
});

// Flight Schema
export const flights = pgTable("flights", {
  id: serial("id").primaryKey(),
  airlineCode: text("airline_code").notNull(),
  airlineName: text("airline_name").notNull(),
  flightNumber: text("flight_number").notNull(),
  departureAirport: text("departure_airport").notNull(),
  departureCity: text("departure_city").notNull(),
  departureCountry: text("departure_country").notNull(),
  arrivalAirport: text("arrival_airport").notNull(),
  arrivalCity: text("arrival_city").notNull(),
  arrivalCountry: text("arrival_country").notNull(),
  departureTime: text("departure_time").notNull(),
  arrivalTime: text("arrival_time").notNull(),
  duration: text("duration").notNull(),
  basePrice: doublePrecision("base_price").notNull(),
  aircraft: text("aircraft"),
  price: doublePrecision("price"),
  currency: text("currency").default("USD"),
  seatsAvailable: integer("seats_available").default(100),
  status: text("status").default("scheduled"), // scheduled, active, completed, cancelled
});

export const insertFlightSchema = createInsertSchema(flights).omit({
  id: true,
});

// Passenger Schema
export const passengers = pgTable("passengers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  nationality: text("nationality").notNull(),
  dateOfBirth: text("date_of_birth").notNull(),
  passportNumber: text("passport_number").notNull(),
  passportExpiry: text("passport_expiry").notNull(),
  isSaved: boolean("is_saved").default(false),
});

export const insertPassengerSchema = createInsertSchema(passengers).omit({
  id: true,
});

// Booking Schema
export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  flightId: integer("flight_id").references(() => flights.id),
  bookingReference: text("booking_reference").notNull().unique(),
  totalPrice: doublePrecision("total_price").notNull(),
  currency: text("currency").default("USD"),
  status: text("status").notNull(),
  expressProcessing: boolean("express_processing").default(false),
  editableTicket: boolean("editable_ticket").default(false),
  hotelReservation: boolean("hotel_reservation").default(false),
  insuranceLetter: boolean("insurance_letter").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  paymentId: text("payment_id"),
  specialRequests: text("special_requests"),
  contactEmail: text("contact_email").notNull(),
  contactPhone: text("contact_phone"),
  travelPurpose: text("travel_purpose").notNull(),
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true,
});

// Airport Schema
export const airports = pgTable("airports", {
  id: serial("id").primaryKey(),
  iataCode: text("iata_code").notNull().unique(),
  icaoCode: text("icao_code").unique(),
  name: text("name").notNull(),
  city: text("city").notNull(),
  country: text("country").notNull(),
  countryCode: text("country_code").notNull(),
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  timezone: text("timezone"),
  localName: json("local_name").$type<Record<string, string>>(),
});

export const insertAirportSchema = createInsertSchema(airports).omit({
  id: true,
});

// Booking Passenger Junction Table
export const bookingPassengers = pgTable("booking_passengers", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").references(() => bookings.id).notNull(),
  passengerId: integer("passenger_id").references(() => passengers.id).notNull(),
});

export const insertBookingPassengerSchema = createInsertSchema(bookingPassengers).omit({
  id: true,
});

// Define search parameters schema for flight search
export const flightSearchSchema = z.object({
  origin: z.string()
    .min(3, { message: "invalid_airport_code" })
    .max(3, { message: "invalid_airport_code" })
    .refine(val => val.trim() !== "", { message: "origin_required" }),
  destination: z.string()
    .min(3, { message: "invalid_airport_code" })
    .max(3, { message: "invalid_airport_code" })
    .refine(val => val.trim() !== "", { message: "destination_required" }),
  departureDate: z.string()
    .refine(date => {
      // Must be a valid date string
      const isValid = !isNaN(new Date(date).getTime());
      return isValid;
    }, { message: "invalid_date_format" })
    .refine(date => {
      // Must be today or in the future
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selectedDate = new Date(date);
      selectedDate.setHours(0, 0, 0, 0);
      return selectedDate >= today;
    }, { message: "invalid_departure_date" }),
  returnDate: z.string()
    .refine(date => {
      // Must be a valid date string
      const isValid = !isNaN(new Date(date).getTime());
      return isValid;
    }, { message: "invalid_date_format" })
    .optional(),
  passengers: z.number().min(1).max(9),
  travelPurpose: z.string(),
  tripType: z.enum(["one-way", "round-trip"]),
  originDisplay: z.string().optional(),
  destinationDisplay: z.string().optional(),
})
.refine(
  (data) => {
    if (data.origin === data.destination) {
      return false;
    }
    return true;
  },
  {
    message: "origin_destination_same",
    path: ["destination"],
  }
)
.refine(
  (data) => {
    // For round-trip, return date is required
    if (data.tripType === "round-trip" && !data.returnDate) {
      return false;
    }
    return true;
  },
  {
    message: "return_date_required",
    path: ["returnDate"],
  }
)
.refine(
  (data) => {
    // Validate return date is after departure date
    if (data.tripType === "round-trip" && data.returnDate && data.departureDate) {
      const returnDate = new Date(data.returnDate);
      const departureDate = new Date(data.departureDate);
      
      if (returnDate < departureDate) {
        return false;
      }
    }
    return true;
  },
  {
    message: "invalid_return_date",
    path: ["returnDate"], 
  }
);

// Payment Schema
export const paymentSchema = z.discriminatedUnion('paymentMethod', [
  // Card payment schema
  z.object({
    amount: z.number().positive(),
    currency: z.string().default("USD"),
    paymentMethod: z.literal("card"),
    cardNumber: z.string().min(16).max(16),
    cardExpiry: z.string().min(5).max(5),
    cardCvc: z.string().min(3).max(4),
    cardHolderName: z.string().min(1)
  }),
  // PayPal payment schema
  z.object({
    amount: z.number().positive(),
    currency: z.string().default("USD"),
    paymentMethod: z.literal("paypal"),
    cardNumber: z.string().optional(),
    cardExpiry: z.string().optional(),
    cardCvc: z.string().optional(),
    cardHolderName: z.string().optional()
  })
]);

// Export all types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Flight = typeof flights.$inferSelect;
export type InsertFlight = z.infer<typeof insertFlightSchema>;
export type Passenger = typeof passengers.$inferSelect;
export type InsertPassenger = z.infer<typeof insertPassengerSchema>;
export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Airport = typeof airports.$inferSelect;
export type InsertAirport = z.infer<typeof insertAirportSchema>;
export type BookingPassenger = typeof bookingPassengers.$inferSelect;
export type InsertBookingPassenger = z.infer<typeof insertBookingPassengerSchema>;
export type FlightSearch = z.infer<typeof flightSearchSchema>;
export type Payment = z.infer<typeof paymentSchema>;

// Log level type for system logs
export const LogLevelEnum = z.enum(["info", "warn", "error", "debug"]);
export type LogLevel = z.infer<typeof LogLevelEnum>;

// System Logs Schema
export const systemLogs = pgTable("system_logs", {
  id: serial("id").primaryKey(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  level: text("level").notNull().$type<LogLevel>(),
  service: text("service").notNull(),
  message: text("message").notNull(),
});

export const insertSystemLogSchema = createInsertSchema(systemLogs).omit({
  id: true,
  timestamp: true
});

// Additional Services Schema
export const additionalServices = pgTable("additional_services", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: doublePrecision("price").notNull(),
  type: text("type").notNull().$type<"baggage" | "seat" | "meal" | "priority" | "insurance" | "hotel" | "other">(),
  currency: text("currency").default("EUR"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAdditionalServiceSchema = createInsertSchema(additionalServices).omit({
  id: true,
  createdAt: true
});

// Flight Pricing Schema
export const flightPricing = pgTable("flight_pricing", {
  id: serial("id").primaryKey(),
  originAirport: text("origin_airport").notNull(),
  destinationAirport: text("destination_airport").notNull(),
  basePrice: doublePrecision("base_price").notNull(),
  currency: text("currency").default("USD"),
  travelClass: text("travel_class").default("economy"), 
  tripType: text("trip_type").default("one-way"),  // Added for price based on trip type
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertFlightPricingSchema = createInsertSchema(flightPricing).omit({
  id: true,
  createdAt: true
});

export type SystemLog = typeof systemLogs.$inferSelect;
export type InsertSystemLog = z.infer<typeof insertSystemLogSchema>;
export type AdditionalService = typeof additionalServices.$inferSelect;
export type InsertAdditionalService = z.infer<typeof insertAdditionalServiceSchema>;
export type FlightPricing = typeof flightPricing.$inferSelect;
export type InsertFlightPricing = z.infer<typeof insertFlightPricingSchema>;
