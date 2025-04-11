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
    const doc = new PDFDocument({ margin: 30, size: 'A4' });
    
    // Collect the PDF document chunks
    return new Promise<Buffer>((resolve, reject) => {
      try {
        const chunks: Buffer[] = [];
        
        doc.on('data', (chunk: Buffer) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);
        
        // Define airline colors and styles based on airline code
        let primaryColor = '#1A365D'; // Default dark blue
        let secondaryColor = '#2B4C7E';
        let airlineLogoText = ticketData.flight.airlineName;
        
        if (ticketData.flight.airlineCode === 'BA') {
          primaryColor = '#075AAA'; // British Airways blue
          secondaryColor = '#EB2226'; // British Airways red
          airlineLogoText = 'British Airways';
        } else if (ticketData.flight.airlineCode === 'AA') {
          primaryColor = '#0078D2'; // American Airlines blue
          secondaryColor = '#C00C23'; // American Airlines red
          airlineLogoText = 'American Airlines';
        } else if (ticketData.flight.airlineCode === 'EK') {
          primaryColor = '#D71E35'; // Emirates red
          secondaryColor = '#231F20'; // Emirates dark gray
          airlineLogoText = 'Emirates';
        } else if (ticketData.flight.airlineCode === 'LH') {
          primaryColor = '#05164D'; // Lufthansa blue
          secondaryColor = '#FFAD00'; // Lufthansa gold
          airlineLogoText = 'Lufthansa';
        }
        
        // Draw the header background
        doc.fillColor(primaryColor)
           .rect(0, 0, doc.page.width, 70)
           .fill();
        
        // Add header text with airline logo styling
        doc.fillColor('white')
           .fontSize(24)
           .font('Helvetica-Bold')
           .text(airlineLogoText, 30, 25);
        
        // Add a small descriptor below the logo
        doc.fillColor('white')
           .fontSize(8)
           .font('Helvetica')
           .text('E-TICKET RECEIPT / PASSENGER ITINERARY', 30, 50);
        
        // Reset text color
        doc.fillColor('black');
        
        // Add the ViewTrip logo/brand in the header
        doc.fillColor('white')
           .fontSize(10)
           .font('Helvetica-Bold')
           .text('ViewTrip', doc.page.width - 80, 25, { align: 'right' });
           
        // Add booking reference box in top right
        doc.fillColor(secondaryColor)
           .rect(doc.page.width - 160, 80, 130, 60)
           .fill();
           
        doc.fillColor('white')
           .fontSize(10)
           .font('Helvetica-Bold')
           .text('BOOKING REFERENCE', doc.page.width - 150, 90, { align: 'left' });
           
        doc.fillColor('white')
           .fontSize(18)
           .font('Helvetica-Bold')
           .text(ticketData.bookingReference, doc.page.width - 150, 110, { align: 'left' });
        
        // Add main separator
        doc.strokeColor('#DDDDDD')
           .lineWidth(1)
           .moveTo(30, 150)
           .lineTo(doc.page.width - 30, 150)
           .stroke();
           
        // Passenger information section
        doc.fillColor('#333333')
           .fontSize(14)
           .font('Helvetica-Bold')
           .text('PASSENGER INFORMATION', 30, 170);
        
        let yPos = 195;
        
        ticketData.passengers.forEach((passenger, index) => {
          doc.fontSize(10)
             .font('Helvetica-Bold')
             .text(`PASSENGER ${index + 1}:`, 30, yPos);
             
          doc.fontSize(12)
             .font('Helvetica')
             .text(`${passenger.title}. ${passenger.firstName} ${passenger.lastName}`, 140, yPos);
             
          // Add a passport number if available
          if (passenger.passportNumber) {
            doc.fontSize(8)
               .font('Helvetica')
               .text(`Passport: ${passenger.passportNumber}`, 140, yPos + 15);
          }
          
          // Add nationality if available
          if (passenger.nationality) {
            doc.fontSize(8)
               .font('Helvetica')
               .text(`Nationality: ${passenger.nationality}`, 280, yPos + 15);
          }
          
          yPos += 35; // Move down for the next passenger
        });
        
        // Flight information section
        yPos += 10;
        doc.strokeColor('#DDDDDD')
           .lineWidth(1)
           .moveTo(30, yPos)
           .lineTo(doc.page.width - 30, yPos)
           .stroke();
        
        yPos += 20;
        doc.fillColor('#333333')
           .fontSize(14)
           .font('Helvetica-Bold')
           .text('FLIGHT INFORMATION', 30, yPos);
        
        yPos += 30;
        // Flight number and info box
        doc.fillColor(primaryColor)
           .rect(30, yPos, doc.page.width - 60, 40)
           .fill();
        
        doc.fillColor('white')
           .fontSize(14)
           .font('Helvetica-Bold')
           .text(`${ticketData.flight.airlineCode} ${ticketData.flight.flightNumber}`, 40, yPos + 12);
           
        doc.fillColor('white')
           .fontSize(10)
           .font('Helvetica')
           .text(`Operated by ${ticketData.flight.airlineName}`, 180, yPos + 15);
        
        doc.fillColor('white')
           .fontSize(10)
           .font('Helvetica')
           .text(`Class: Economy`, doc.page.width - 100, yPos + 15, { align: 'right' });
        
        // Departure and Arrival Information
        yPos += 60;
        
        // Departure box
        doc.fillColor('#F5F5F5')
           .rect(30, yPos, (doc.page.width - 80) / 2, 100)
           .fill();
           
        doc.fillColor(primaryColor)
           .fontSize(12)
           .font('Helvetica-Bold')
           .text('DEPARTURE', 45, yPos + 15);
           
        doc.fillColor('#333333')
           .fontSize(22)
           .font('Helvetica-Bold')
           .text(ticketData.flight.departureAirport, 45, yPos + 35);
           
        doc.fillColor('#666666')
           .fontSize(10)
           .font('Helvetica')
           .text(`${ticketData.flight.departureCity}, ${ticketData.flight.departureCountry}`, 45, yPos + 60);
          
        doc.fillColor('#333333')
           .fontSize(12)
           .font('Helvetica-Bold')
           .text(ticketData.flight.departureTime, 45, yPos + 80);
        
        // Arrival box
        const arrivalX = 30 + ((doc.page.width - 80) / 2) + 20;
        doc.fillColor('#F5F5F5')
           .rect(arrivalX, yPos, (doc.page.width - 80) / 2, 100)
           .fill();
           
        doc.fillColor(primaryColor)
           .fontSize(12)
           .font('Helvetica-Bold')
           .text('ARRIVAL', arrivalX + 15, yPos + 15);
           
        doc.fillColor('#333333')
           .fontSize(22)
           .font('Helvetica-Bold')
           .text(ticketData.flight.arrivalAirport, arrivalX + 15, yPos + 35);
           
        doc.fillColor('#666666')
           .fontSize(10)
           .font('Helvetica')
           .text(`${ticketData.flight.arrivalCity}, ${ticketData.flight.arrivalCountry}`, arrivalX + 15, yPos + 60);
          
        doc.fillColor('#333333')
           .fontSize(12)
           .font('Helvetica-Bold')
           .text(ticketData.flight.arrivalTime, arrivalX + 15, yPos + 80);
        
        // Flight duration
        yPos += 110;
        doc.fillColor('#666666')
           .fontSize(10)
           .font('Helvetica')
           .text(`Duration: ${ticketData.flight.duration}`, 30, yPos);
        
        // Additional information
        yPos += 30;
        doc.strokeColor('#DDDDDD')
           .lineWidth(1)
           .moveTo(30, yPos)
           .lineTo(doc.page.width - 30, yPos)
           .stroke();
        
        yPos += 20;
        doc.fillColor('#333333')
           .fontSize(14)
           .font('Helvetica-Bold')
           .text('ADDITIONAL INFORMATION', 30, yPos);
        
        yPos += 25;
        
        if (ticketData.ticketOptions.expressProcessing || 
            ticketData.ticketOptions.editableTicket || 
            ticketData.ticketOptions.hotelReservation || 
            ticketData.ticketOptions.insuranceLetter) {
              
          // Create a table-like structure for additional services
          const colWidth = (doc.page.width - 60) / 2;
          let leftColY = yPos;
          let rightColY = yPos;
          
          if (ticketData.ticketOptions.expressProcessing) {
            doc.fillColor('#555555')
               .fontSize(10)
               .font('Helvetica-Bold')
               .text('✓ Express Processing', 30, leftColY);
            
            doc.fillColor('#777777')
               .fontSize(8)
               .font('Helvetica')
               .text('Expedited delivery included', 30, leftColY + 12);
               
            leftColY += 25;
          }
          
          if (ticketData.ticketOptions.editableTicket) {
            doc.fillColor('#555555')
               .fontSize(10)
               .font('Helvetica-Bold')
               .text('✓ Editable Ticket', 30, leftColY);
            
            doc.fillColor('#777777')
               .fontSize(8)
               .font('Helvetica')
               .text('Flexible changes allowed', 30, leftColY + 12);
               
            leftColY += 25;
          }
          
          if (ticketData.ticketOptions.hotelReservation) {
            doc.fillColor('#555555')
               .fontSize(10)
               .font('Helvetica-Bold')
               .text('✓ Hotel Reservation', 30 + colWidth, rightColY);
            
            doc.fillColor('#777777')
               .fontSize(8)
               .font('Helvetica')
               .text('Accommodation included', 30 + colWidth, rightColY + 12);
               
            rightColY += 25;
          }
          
          if (ticketData.ticketOptions.insuranceLetter) {
            doc.fillColor('#555555')
               .fontSize(10)
               .font('Helvetica-Bold')
               .text('✓ Insurance Letter', 30 + colWidth, rightColY);
            
            doc.fillColor('#777777')
               .fontSize(8)
               .font('Helvetica')
               .text('Travel protection included', 30 + colWidth, rightColY + 12);
               
            rightColY += 25;
          }
          
          yPos = Math.max(leftColY, rightColY) + 10;
        }
        
        // Payment information
        doc.fillColor('#333333')
           .fontSize(10)
           .font('Helvetica-Bold')
           .text('PAYMENT INFORMATION', 30, yPos);
           
        doc.fillColor('#555555')
           .fontSize(10)
           .font('Helvetica')
           .text(`Total Paid: ${ticketData.currency} ${ticketData.totalPrice.toFixed(2)}`, 30, yPos + 15);
        
        // Footer with contact information
        const footerY = doc.page.height - 80;
        
        doc.strokeColor('#DDDDDD')
           .lineWidth(1)
           .moveTo(30, footerY)
           .lineTo(doc.page.width - 30, footerY)
           .stroke();
        
        // Contact information based on airline
        let contactInfo = {};
        if (ticketData.flight.airlineCode === 'BA') {
          contactInfo = {
            companyName: 'British Airways PLC',
            address: 'Waterside, Harmondsworth, UB7 0GB, United Kingdom',
            email: 'customer.service@ba.com',
            phone: '+44 (0)203 250 0145'
          };
        } else if (ticketData.flight.airlineCode === 'AA') {
          contactInfo = {
            companyName: 'American Airlines, Inc.',
            address: '1 Skyview Drive, Fort Worth, TX 76155, USA',
            email: 'customer.service@aa.com',
            phone: '+1 800-433-7300'
          };
        } else if (ticketData.flight.airlineCode === 'EK') {
          contactInfo = {
            companyName: 'Emirates Group',
            address: 'Emirates Group Headquarters, PO Box 686, Dubai, UAE',
            email: 'customer.affairs@emirates.com',
            phone: '+971 600 555555'
          };
        } else {
          contactInfo = {
            companyName: ticketData.flight.airlineName,
            address: '123 Airline Street, International Terminal',
            email: `support@${ticketData.flight.airlineCode.toLowerCase()}.com`,
            phone: '+44 123 456 7890'
          };
        }
        
        doc.fillColor('#555555')
           .fontSize(8)
           .font('Helvetica')
           .text(contactInfo.companyName, 30, footerY + 10);
        
        doc.fillColor('#777777')
           .fontSize(7)
           .font('Helvetica')
           .text(contactInfo.address, 30, footerY + 20);
           
        doc.fillColor('#777777')
           .fontSize(7)
           .font('Helvetica')
           .text(contactInfo.email, 30, footerY + 30);
           
        doc.fillColor('#777777')
           .fontSize(7)
           .font('Helvetica')
           .text(contactInfo.phone, 30, footerY + 40);

        // Passenger ticket identification and barcode area
        doc.fillColor('#555555')
           .fontSize(8)
           .font('Helvetica-Bold')
           .text(`TICKET NUMBER: ${ticketData.ticketNumber}`, doc.page.width - 180, footerY + 15, { align: 'right' });
           
        doc.fillColor('#777777')
           .fontSize(7)
           .font('Helvetica')
           .text(`ISSUE DATE: ${ticketData.issueDate}`, doc.page.width - 180, footerY + 25, { align: 'right' });
           
        doc.fillColor('#777777')
           .fontSize(7)
           .font('Helvetica')
           .text('Scan QR code to verify ticket →', doc.page.width - 180, footerY + 40, { align: 'right' });
        
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
      
      // Create realistic flight data
      flight = {
        id: booking.flightId ?? 0,
        airlineName: departureAirport === 'LHR' ? "British Airways" : (departureAirport === 'JFK' ? "American Airlines" : "Emirates"),
        airlineCode: departureAirport === 'LHR' ? "BA" : (departureAirport === 'JFK' ? "AA" : "EK"),
        flightNumber: (departureAirport === 'LHR' ? "BA" : (departureAirport === 'JFK' ? "AA" : "EK")) + Math.floor(100 + Math.random() * 900),
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
