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
        
        // ViewTrip Header (blue bar)
        const viewTripBlue = '#006699';
        doc.fillColor(viewTripBlue)
           .rect(30, 30, doc.page.width - 60, 30)
           .fill();
           
        // ViewTrip Logo
        doc.fillColor('white')
           .fontSize(16)
           .font('Helvetica-Bold')
           .text('ViewTrip', 50, 39);
        
        // My Trip Section
        let yPos = 80;
        doc.fillColor('black')
           .fontSize(16)
           .font('Helvetica-Bold')
           .text('My Trip', 30, yPos);
        
        yPos += 25;
        
        // For each flight segment (first segment - outbound)
        // Format the travel date (Dec 12, 2024)
        const departureDate = new Date();
        departureDate.setDate(departureDate.getDate() + 30); // Future date for the trip
        
        const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
        const formattedDate = `${departureDate.getDate()} ${monthNames[departureDate.getMonth()]} ${departureDate.getFullYear()}`;
        
        // First segment header (Outbound)
        doc.fontSize(10)
           .font('Helvetica-Bold')
           .text(`${formattedDate} - ${ticketData.flight.departureCity} (${ticketData.flight.departureAirport}) to ${ticketData.flight.arrivalCity} (${ticketData.flight.arrivalAirport}) - Confirmed`, 30, yPos);
           
        // Checkmark in circle for confirmed status
        doc.fillColor('green')
           .circle(doc.widthOfString(`${formattedDate} - ${ticketData.flight.departureCity} (${ticketData.flight.departureAirport}) to ${ticketData.flight.arrivalCity} (${ticketData.flight.arrivalAirport}) - Confirmed`) + 35, yPos + 5, 5)
           .fill();
        
        // Draw horizontal line
        yPos += 15;
        doc.strokeColor('black')
           .lineWidth(0.5)
           .moveTo(30, yPos)
           .lineTo(doc.page.width - 30, yPos)
           .stroke();
        
        yPos += 15;
        
        // Airline info
        const airlineLogo: Record<string, string> = {
          EK: 'Etihad Airways',
          BA: 'British Airways',
          AA: 'American Airlines',
          LH: 'Lufthansa'
        };
        
        const airlineName = airlineLogo[ticketData.flight.airlineCode] || ticketData.flight.airlineName;
        const flightNumber = `${ticketData.flight.airlineCode} ${ticketData.flight.flightNumber.replace(ticketData.flight.airlineCode, '')}`;
        
        // Airline logo area (small rectangle on left)
        doc.fillColor('#772222')
           .rect(30, yPos, 40, 25)
           .fill();
           
        // Airline name and flight number
        doc.fillColor('black')
           .fontSize(10)
           .font('Helvetica-Bold')
           .text(airlineName, 80, yPos);
           
        doc.fontSize(9)
           .font('Helvetica')
           .text(`Confirmation Number: ${ticketData.bookingReference}`, 80, yPos + 12);
        
        // Flight times and info in the center
        yPos += 30;
        
        // Flight layout with plane icon
        const layoutY = yPos;
        
        // Departure time
        doc.fontSize(16)
           .font('Helvetica-Bold')
           .text('5:30', 180, layoutY)
           .text('PM', 180, layoutY + 16, { fontSize: 10 })
           .text('CAI', 180, layoutY + 26, { fontSize: 8 });
        
        // Plane icon and route line
        const planeX = 250;
        const planeY = layoutY + 10;
        
        // Draw line
        doc.strokeColor('black')
           .moveTo(230, planeY + 5)
           .lineTo(320, planeY + 5)
           .stroke();
        
        // Draw plane symbol
        doc.fillColor('black')
           .moveTo(planeX, planeY)
           .lineTo(planeX + 8, planeY - 3)
           .lineTo(planeX + 15, planeY)
           .lineTo(planeX + 8, planeY + 3)
           .fill();
        
        // Non-Stop text
        doc.fontSize(8)
           .text('NON', 270, layoutY - 8, { align: 'center' })
           .text('STOP', 270, layoutY, { align: 'center' });
           
        // Flight duration below line
        doc.fontSize(7)
           .text('3H 15M', 270, layoutY + 12, { align: 'center' });
        
        // Arrival time
        doc.fontSize(16)
           .font('Helvetica-Bold')
           .text('10:45', 350, layoutY)
           .text('PM', 350, layoutY + 16, { fontSize: 10 })
           .text('AUH', 350, layoutY + 26, { fontSize: 8 });
           
        // Passenger section
        yPos += 60;
        doc.fontSize(9)
           .font('Helvetica-Bold')
           .text('PASSENGERS', 30, yPos);
           
        yPos += 15;
        
        // Add passengers
        let passengerName = "ELSAARAN, AMR SAIED MR";
        if (ticketData.passengers.length > 0) {
          const passenger = ticketData.passengers[0];
          passengerName = `${passenger.lastName.toUpperCase()}, ${passenger.firstName.toUpperCase()} ${passenger.title.toUpperCase()}`;
        }
        
        doc.fontSize(9)
           .font('Helvetica')
           .text(passengerName, 30, yPos);
           
        yPos += 15;
        
        // Class of service
        doc.fontSize(9)
           .font('Helvetica')
           .text('Class Of Service: Economy', 30, yPos);
           
        yPos += 15;
        
        // Airport info section
        doc.fontSize(9)
           .font('Helvetica-Bold')
           .text('AIRPORT INFO', 30, yPos);
           
        yPos += 15;
        
        // Departure airport details
        doc.fontSize(9)
           .font('Helvetica')
           .text(`Cairo Intl Arpt (CAI)`, 30, yPos)
           .text(`Cairo, EG`, 30, yPos + 10)
           .text(`Terminal 2`, 30, yPos + 20);
        
        // To line
        doc.fontSize(8)
           .text('to', 200, yPos + 10);
           
        // Draw dotted line before and after "to"
        const lineY = yPos + 14;
        
        for (let i = 70; i < 190; i += 5) {
          doc.moveTo(i, lineY)
             .lineTo(i + 3, lineY)
             .stroke();
        }
        
        for (let i = 220; i < 340; i += 5) {
          doc.moveTo(i, lineY)
             .lineTo(i + 3, lineY)
             .stroke();
        }
        
        // Arrival airport details
        doc.fontSize(9)
           .font('Helvetica')
           .text(`Zayed International Apt (AUH)`, 350, yPos)
           .text(`Abu Dhabi, AE`, 350, yPos + 10)
           .text(`Terminal A`, 350, yPos + 20);
           
        yPos += 40;
        
        // Flight info section
        doc.fontSize(9)
           .font('Helvetica-Bold')
           .text('FLIGHT INFO', 30, yPos);
           
        yPos += 15;
        
        // Aircraft type and meal
        doc.fontSize(9)
           .font('Helvetica')
           .text(`Airbus A321 NEO`, 30, yPos)
           .text(`Meal`, 30, yPos + 10);
        
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
        interface AirlineContact {
          companyName: string;
          address: string;
          email: string;
          phone: string;
        }
        
        let contactInfo: AirlineContact;
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
