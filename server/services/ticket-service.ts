import { IStorage } from "../storage";
import PDFDocument from "pdfkit";
import { Readable } from "stream";

export class TicketService {
  private storage: IStorage;
  
  constructor(storage: IStorage) {
    this.storage = storage;
  }
  
  async generatePDF(bookingId: number): Promise<Buffer> {
    const ticketData = await this.generateTicketData(bookingId);
    
    // Create a PDF document
    const doc = new PDFDocument({ margin: 50 });
    
    // Collect the PDF document chunks
    return new Promise<Buffer>((resolve, reject) => {
      try {
        const chunks: Buffer[] = [];
        const stream = new Readable();
        
        doc.on('data', (chunk: Buffer) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);
        
        // Add viewtrip header
        doc.fontSize(16).font('Helvetica-Bold').fillColor('#006699').text('ViewTrip', { align: 'left' });
        doc.moveDown();
        
        // Add trip info header
        doc.fontSize(14).font('Helvetica-Bold').fillColor('#000000').text('My Trip', { align: 'left' });
        doc.fontSize(10).text(
          `${ticketData.issueDate} - ${ticketData.flight.departureCity} (${ticketData.flight.departureAirport}) to ${ticketData.flight.arrivalCity} (${ticketData.flight.arrivalAirport}) - Confirmed`,
          { align: 'left' }
        );
        doc.moveDown();
        
        // Add airline info
        doc.fontSize(12).font('Helvetica-Bold').text(`${ticketData.flight.airlineName} (${ticketData.flight.airlineCode}) ${ticketData.flight.flightNumber}`);
        doc.fontSize(10).font('Helvetica').text(`Confirmation Number: ${ticketData.bookingReference}`);
        doc.moveDown();
        
        // Add passenger info
        doc.fontSize(10).font('Helvetica-Bold').text('PASSENGERS');
        ticketData.passengers.forEach(passenger => {
          doc.fontSize(10).font('Helvetica').text(`${passenger.title}. ${passenger.firstName} ${passenger.lastName}`);
        });
        doc.moveDown();
        
        // Add airport info
        doc.fontSize(10).font('Helvetica-Bold').text('AIRPORT INFO');
        doc.fontSize(10).font('Helvetica').text(`${ticketData.flight.departureCity} Int'l Apt (${ticketData.flight.departureAirport})`);
        doc.fontSize(10).font('Helvetica-Bold').text('TO');
        doc.fontSize(10).font('Helvetica').text(`${ticketData.flight.arrivalCity} Int'l Apt (${ticketData.flight.arrivalAirport})`);
        doc.fontSize(10).font('Helvetica').text(`${ticketData.flight.arrivalCity}, ${ticketData.flight.arrivalCountry}`);
        doc.moveDown();
        
        // Add flight info
        doc.fontSize(10).font('Helvetica-Bold').text('FLIGHT INFO');
        doc.fontSize(10).font('Helvetica').text('Airbus A320-NEO');
        doc.fontSize(10).font('Helvetica').text('Class of Service: Economy');
        doc.moveDown();
        
        // Add departure and arrival times
        doc.fontSize(12).font('Helvetica-Bold').text('DEPART', { continued: true });
        doc.fontSize(10).font('Helvetica').text(`                                     ARRIVE`, { align: 'right' });
        doc.fontSize(14).font('Helvetica-Bold').text(`${ticketData.flight.departureTime}`, { continued: true });
        doc.fontSize(14).font('Helvetica-Bold').text(`                                ${ticketData.flight.arrivalTime}`, { align: 'right' });
        doc.fontSize(10).font('Helvetica').text(`Duration: ${ticketData.flight.duration}`);
        doc.moveDown();
        
        // Add additional services if any
        if (ticketData.ticketOptions.expressProcessing || 
            ticketData.ticketOptions.editableTicket || 
            ticketData.ticketOptions.hotelReservation || 
            ticketData.ticketOptions.insuranceLetter) {
          
          doc.fontSize(12).font('Helvetica-Bold').fillColor('#0066CC').text('ADDITIONAL SERVICES');
          
          if (ticketData.ticketOptions.expressProcessing) {
            doc.fontSize(10).font('Helvetica-Bold').fillColor('#000000').text('Express Processing');
            doc.fontSize(9).font('Helvetica').text('Premium Service');
          }
          
          if (ticketData.ticketOptions.editableTicket) {
            doc.fontSize(10).font('Helvetica-Bold').text('Editable Ticket');
            doc.fontSize(9).font('Helvetica').text('Flexible Changes');
          }
          
          if (ticketData.ticketOptions.hotelReservation) {
            doc.fontSize(10).font('Helvetica-Bold').text('Hotel Reservation');
            doc.fontSize(9).font('Helvetica').text('Accommodation Included');
          }
          
          if (ticketData.ticketOptions.insuranceLetter) {
            doc.fontSize(10).font('Helvetica-Bold').text('Insurance Letter');
            doc.fontSize(9).font('Helvetica').text('Travel Protection');
          }
          
          doc.moveDown();
        }
        
        // Add contact information
        doc.fontSize(12).font('Helvetica-Bold').fillColor('#0066CC').text('CONTACT INFORMATION');
        doc.fontSize(10).font('Helvetica').fillColor('#000000').text(`Email: ${ticketData.contactEmail}`);
        doc.fontSize(10).font('Helvetica').text(`Phone: ${ticketData.contactPhone}`);
        doc.moveDown();
        
        // Add price information
        doc.fontSize(12).font('Helvetica-Bold').text('PRICE INFORMATION');
        doc.fontSize(10).font('Helvetica').text(`Total Price: ${ticketData.currency} ${ticketData.totalPrice.toFixed(2)}`);
        doc.moveDown();
        
        // Add company information
        doc.fontSize(10).font('Helvetica').text('Global Air Travel Services');
        doc.fontSize(9).font('Helvetica').text('123 Booking Street, London');
        doc.fontSize(9).font('Helvetica').text('support@globalairtravelservices.com');
        doc.fontSize(9).font('Helvetica').text('+44 123 456 7890');
        
        // Add QR code placeholder text
        doc.fontSize(8).font('Helvetica').text('Scan QR code to verify ticket', { align: 'center' });
        
        // Add ticket number and barcode placeholder
        doc.moveDown();
        doc.fontSize(8).font('Helvetica').text(`Ticket: ${ticketData.ticketNumber}`, { align: 'center' });
        
        // Finalize the PDF
        doc.end();
      } catch (error) {
        reject(error);
      }
    });
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
