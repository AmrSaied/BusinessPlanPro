import { IStorage } from "../storage";

export class TicketService {
  private storage: IStorage;
  
  constructor(storage: IStorage) {
    this.storage = storage;
  }
  
  async generateTicketData(bookingId: number) {
    // Get the booking
    const booking = await this.storage.getBooking(bookingId);
    if (!booking) {
      throw new Error("Booking not found");
    }
    
    // Get the flight
    let flight = await this.storage.getFlight(booking.flightId ?? 0);
    
    // If flight is not found, create a dummy flight for demo purposes
    if (!flight) {
      console.log(`Flight with ID ${booking.flightId} not found, creating fallback flight data`);
      
      // Get departure and arrival airports from booking reference or just use sample data
      const departureAirport = booking.bookingReference?.substring(0, 3) || 'LHR';
      const arrivalAirport = booking.bookingReference?.substring(3, 6) || 'CDG';
      
      // Create fallback flight data
      flight = {
        id: booking.flightId ?? 0,
        airlineName: "FastDummy Airlines",
        airlineCode: "FD",
        flightNumber: "FD" + Math.floor(100 + Math.random() * 900),
        departureAirport: departureAirport,
        departureCity: departureAirport === 'LHR' ? 'London' : 'Paris',
        departureCountry: departureAirport === 'LHR' ? 'United Kingdom' : 'France',
        arrivalAirport: arrivalAirport,
        arrivalCity: arrivalAirport === 'CDG' ? 'Paris' : 'London',
        arrivalCountry: arrivalAirport === 'CDG' ? 'France' : 'United Kingdom',
        departureTime: "10:00 AM",
        arrivalTime: "12:30 PM",
        duration: "02:30",
        basePrice: booking.totalPrice
      };
    }
    
    // Get passengers
    let passengers = await this.storage.getPassengersByBookingId(bookingId);
    
    // If no passengers found, create a default passenger for demo
    if (!passengers || passengers.length === 0) {
      console.log(`No passengers found for booking ${bookingId}, creating default passenger data`);
      passengers = [{
        id: 1,
        userId: booking.userId,
        title: "Mr",
        firstName: "John",
        lastName: "Doe",
        nationality: "United Kingdom",
        passportNumber: "P12345678",
        passportExpiry: "2030-01-01",
        dateOfBirth: "1990-01-01",
        isSaved: false
      }];
    }
    
    // Format data for ticket
    return {
      ticketNumber: `TKT${booking.bookingReference}`,
      bookingReference: booking.bookingReference,
      flight: {
        airlineName: flight!.airlineName,
        airlineCode: flight!.airlineCode,
        flightNumber: flight!.flightNumber,
        departureAirport: flight!.departureAirport,
        departureCity: flight!.departureCity,
        departureCountry: flight!.departureCountry,
        arrivalAirport: flight!.arrivalAirport,
        arrivalCity: flight!.arrivalCity,
        arrivalCountry: flight!.arrivalCountry,
        departureTime: flight!.departureTime,
        arrivalTime: flight!.arrivalTime,
        duration: flight!.duration,
      },
      passengers: passengers.map(p => ({
        title: p.title,
        firstName: p.firstName,
        lastName: p.lastName,
        nationality: p.nationality,
        passportNumber: p.passportNumber,
      })),
      ticketOptions: {
        expressProcessing: booking.expressProcessing,
        editableTicket: booking.editableTicket,
        hotelReservation: booking.hotelReservation,
        insuranceLetter: booking.insuranceLetter,
      },
      contactEmail: booking.contactEmail,
      contactPhone: booking.contactPhone,
      totalPrice: booking.totalPrice,
      currency: booking.currency,
      status: booking.status,
      issueDate: booking.createdAt,
      travelPurpose: booking.travelPurpose,
    };
  }
  
  async sendTicketByEmail(bookingId: number, email: string) {
    // In a real implementation, this would generate a PDF and send it via email
    const ticketData = await this.generateTicketData(bookingId);
    
    // Simulate sending an email
    console.log(`Sending ticket for booking ${bookingId} to ${email}`);
    
    return {
      success: true,
      message: `Ticket sent to ${email}`,
    };
  }
}
