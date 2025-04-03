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
    const flight = await this.storage.getFlight(booking.flightId);
    if (!flight) {
      throw new Error("Flight not found");
    }
    
    // Get passengers
    const passengers = await this.storage.getPassengersByBookingId(bookingId);
    
    // Format data for ticket
    return {
      ticketNumber: `TKT${booking.bookingReference}`,
      bookingReference: booking.bookingReference,
      flight: {
        airlineName: flight.airlineName,
        airlineCode: flight.airlineCode,
        flightNumber: flight.flightNumber,
        departureAirport: flight.departureAirport,
        departureCity: flight.departureCity,
        departureCountry: flight.departureCountry,
        arrivalAirport: flight.arrivalAirport,
        arrivalCity: flight.arrivalCity,
        arrivalCountry: flight.arrivalCountry,
        departureTime: flight.departureTime,
        arrivalTime: flight.arrivalTime,
        duration: flight.duration,
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
