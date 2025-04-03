import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  flightSearchSchema, 
  insertUserSchema, 
  insertPassengerSchema, 
  insertBookingSchema,
  paymentSchema
} from "@shared/schema";
import { randomBytes } from "crypto";
import { FlightService } from "./services/flight-service";
import { TicketService } from "./services/ticket-service";
import { PaymentService } from "./services/payment-service";

// Initialize services
const flightService = new FlightService(storage);
const ticketService = new TicketService(storage);
const paymentService = new PaymentService();

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes

  // Airport search
  app.get("/api/airports/search", async (req: Request, res: Response) => {
    const query = req.query.q as string;
    
    if (!query) {
      return res.status(400).json({ error: "Search query is required" });
    }
    
    try {
      const airports = await storage.searchAirports(query);
      res.json(airports);
    } catch (err) {
      console.error("Error searching airports:", err);
      res.status(500).json({ error: "Failed to search airports" });
    }
  });

  // Flight search
  app.post("/api/flights/search", async (req: Request, res: Response) => {
    try {
      const searchParams = flightSearchSchema.parse(req.body);
      const flights = await flightService.searchFlights(
        searchParams.departureAirport,
        searchParams.arrivalAirport,
        searchParams.departureDate,
        searchParams.returnDate,
        searchParams.tripType
      );
      res.json(flights);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid search parameters", details: err.errors });
      }
      console.error("Error searching flights:", err);
      res.status(500).json({ error: "Failed to search flights" });
    }
  });

  // User registration
  app.post("/api/users/register", async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
      }
      
      const emailExists = await storage.getUserByEmail(userData.email);
      if (emailExists) {
        return res.status(400).json({ error: "Email already exists" });
      }
      
      // Create user
      const user = await storage.createUser(userData);
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid user data", details: err.errors });
      }
      console.error("Error creating user:", err);
      res.status(500).json({ error: "Failed to create user" });
    }
  });

  // User login
  app.post("/api/users/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
      }
      
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) { // In a real app, we'd use proper password hashing
        return res.status(401).json({ error: "Invalid username or password" });
      }
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (err) {
      console.error("Error during login:", err);
      res.status(500).json({ error: "Login failed" });
    }
  });

  // Create booking
  app.post("/api/bookings", async (req: Request, res: Response) => {
    try {
      const bookingData = insertBookingSchema.parse(req.body);
      
      // Generate a unique booking reference
      const bookingReference = generateBookingReference();
      
      // Create the booking
      const booking = await storage.createBooking({
        ...bookingData,
        bookingReference,
        status: "pending" // Initial status
      });
      
      res.status(201).json(booking);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid booking data", details: err.errors });
      }
      console.error("Error creating booking:", err);
      res.status(500).json({ error: "Failed to create booking" });
    }
  });

  // Add passenger to booking
  app.post("/api/bookings/:bookingId/passengers", async (req: Request, res: Response) => {
    try {
      const bookingId = parseInt(req.params.bookingId);
      const passengerData = insertPassengerSchema.parse(req.body);
      
      // Check if booking exists
      const booking = await storage.getBooking(bookingId);
      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }
      
      // Create passenger
      const passenger = await storage.createPassenger(passengerData);
      
      // Link passenger to booking
      await storage.createBookingPassenger({
        bookingId,
        passengerId: passenger.id
      });
      
      res.status(201).json(passenger);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid passenger data", details: err.errors });
      }
      console.error("Error adding passenger:", err);
      res.status(500).json({ error: "Failed to add passenger" });
    }
  });

  // Process payment
  app.post("/api/payments", async (req: Request, res: Response) => {
    try {
      const paymentData = paymentSchema.parse(req.body);
      const { bookingId } = req.body;
      
      if (!bookingId) {
        return res.status(400).json({ error: "Booking ID is required" });
      }
      
      // Check if booking exists
      const booking = await storage.getBooking(parseInt(bookingId));
      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }
      
      // Process payment
      const paymentResult = await paymentService.processPayment(paymentData);
      
      if (paymentResult.success) {
        // Update booking status
        await storage.updateBooking(booking.id, {
          status: "confirmed",
          paymentId: paymentResult.paymentId
        });
        
        res.json({ 
          success: true, 
          message: "Payment processed successfully",
          paymentId: paymentResult.paymentId
        });
      } else {
        res.status(400).json({ 
          success: false, 
          message: paymentResult.message 
        });
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid payment data", details: err.errors });
      }
      console.error("Error processing payment:", err);
      res.status(500).json({ error: "Payment processing failed" });
    }
  });

  // Generate ticket PDF
  app.get("/api/bookings/:bookingId/ticket", async (req: Request, res: Response) => {
    try {
      const bookingId = parseInt(req.params.bookingId);
      
      // Check if booking exists and is confirmed
      const booking = await storage.getBooking(bookingId);
      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }
      
      if (booking.status !== "confirmed") {
        return res.status(400).json({ error: "Cannot generate ticket for unconfirmed booking" });
      }
      
      // Generate ticket data
      const ticketData = await ticketService.generateTicketData(bookingId);
      
      res.json(ticketData);
    } catch (err) {
      console.error("Error generating ticket:", err);
      res.status(500).json({ error: "Failed to generate ticket" });
    }
  });

  // Get user bookings
  app.get("/api/users/:userId/bookings", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      
      const bookings = await storage.getBookingsByUserId(userId);
      res.json(bookings);
    } catch (err) {
      console.error("Error fetching user bookings:", err);
      res.status(500).json({ error: "Failed to fetch bookings" });
    }
  });

  // Get saved passengers for a user
  app.get("/api/users/:userId/passengers", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      
      const passengers = await storage.getPassengersByUserId(userId);
      res.json(passengers.filter(p => p.isSaved));
    } catch (err) {
      console.error("Error fetching saved passengers:", err);
      res.status(500).json({ error: "Failed to fetch passengers" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Helper function to generate a unique booking reference
function generateBookingReference(): string {
  // Format: 2 letters + 6 digits
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const prefix = 
    letters.charAt(Math.floor(Math.random() * letters.length)) +
    letters.charAt(Math.floor(Math.random() * letters.length));
  
  // 6 random digits
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  
  return `${prefix}${randomNum}`;
}
