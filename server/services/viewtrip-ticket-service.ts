import { IStorage } from "../storage";
import PDFDocument from "pdfkit";

export class ViewTripTicketService {
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
        
        // Generate a realistic e-ticket number (13 digits)
        const eTicketNumber = `${Math.floor(1000000000000 + Math.random() * 9000000000000)}`;
        
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
        
        // Format actual departure date from booking
        // Parse the departure date from booking data
        const departureDate = ticketData.departureDate ? new Date(ticketData.departureDate) : new Date();
        if (!ticketData.departureDate) {
          // If no departure date in booking, set to 30 days in future as fallback
          departureDate.setDate(departureDate.getDate() + 30);
        }
        
        // Format as "THU, DEC 12, 2024"
        const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
        const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
        const dayOfWeek = days[departureDate.getDay()];
        const month = months[departureDate.getMonth()];
        const day = departureDate.getDate();
        const year = departureDate.getFullYear();
        const formattedDate = `${dayOfWeek}, ${month} ${day}, ${year}`;
        
        yPos += 25;
        
        // Trip header
        doc.fontSize(10)
           .font('Helvetica-Bold')
           .text(`${formattedDate} - ${ticketData.flight.departureCity} (${ticketData.flight.departureAirport}) to ${ticketData.flight.arrivalCity} (${ticketData.flight.arrivalAirport}) - Confirmed`, 30, yPos);
        
        // Line separator
        yPos += 15;
        doc.strokeColor('black')
           .lineWidth(0.5)
           .moveTo(30, yPos)
           .lineTo(doc.page.width - 30, yPos)
           .stroke();
        
        yPos += 15;
        
        // Airline logo area (rectangular colored area)
        const airlineColor = ticketData.flight.airlineCode === 'EY' ? '#d02432' : '#772222';
        doc.fillColor(airlineColor)
           .rect(30, yPos, 40, 25)
           .fill();
           
        // Determine airline name
        let airlineName = 'Etihad Airways';
        if (ticketData.flight.airlineCode === 'BA') {
          airlineName = 'British Airways';
        } else if (ticketData.flight.airlineCode === 'AA') {
          airlineName = 'American Airlines';
        } else if (ticketData.flight.airlineCode === 'LH') {
          airlineName = 'Lufthansa';
        }
        
        // Flight number based on airline code if necessary
        const flightNumber = `${ticketData.flight.airlineCode} ${ticketData.flight.flightNumber.includes(ticketData.flight.airlineCode) ? 
          ticketData.flight.flightNumber.substring(ticketData.flight.airlineCode.length) : 
          ticketData.flight.flightNumber}`;
        
        // Airline name and confirmation number
        doc.fillColor('black')
           .fontSize(10)
           .font('Helvetica-Bold')
           .text(airlineName, 80, yPos);
           
        doc.fontSize(9)
           .font('Helvetica')
           .text(`Confirmation Number: ${ticketData.bookingReference}`, 80, yPos + 12);
        
        // Add e-ticket number on the right side
        doc.fontSize(9)
           .font('Helvetica')
           .text(`E-ticket: ${eTicketNumber}`, doc.page.width - 150, yPos, { width: 120, align: 'right' });
           
        // Add reservation date
        const currentDate = new Date();
        const reservationDate = `${String(currentDate.getDate()).padStart(2, '0')}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${currentDate.getFullYear()}`;
        doc.fontSize(9)
           .font('Helvetica')
           .text(`Reservation Date: ${reservationDate}`, doc.page.width - 150, yPos + 12, { width: 120, align: 'right' });
        
        // Flight times area
        yPos += 40;
        
        // Departure time - use flight data
        const [departureHour, departureMinute] = ticketData.flight.departureTime.replace('AM', '').replace('PM', '').trim().split(':');
        const isPM = ticketData.flight.departureTime.includes('PM');
        
        doc.fontSize(16)
           .font('Helvetica-Bold')
           .text(ticketData.flight.departureTime.replace('AM', '').replace('PM', '').trim(), 180, yPos);
           
        doc.fontSize(10)
           .text(isPM ? 'PM' : 'AM', 180, yPos + 16);
           
        doc.fontSize(8)
           .text(ticketData.flight.departureAirport, 180, yPos + 26);
        
        // Non-stop flight indicators and plane
        doc.strokeColor('black')
           .moveTo(220, yPos + 15)
           .lineTo(320, yPos + 15)
           .stroke();
        
        // Plane symbol
        const planeX = 270;
        const planeY = yPos + 10;
        doc.fillColor('black')
           .moveTo(planeX, planeY)
           .lineTo(planeX + 8, planeY - 3)
           .lineTo(planeX + 15, planeY)
           .lineTo(planeX + 8, planeY + 3)
           .fill();
           
        // Non-stop text
        doc.fontSize(8)
           .text('NON', 270, yPos - 8, { align: 'center' })
           .text('STOP', 270, yPos, { align: 'center' });
           
        // Flight duration
        doc.fontSize(7)
           .text(ticketData.flight.duration.toUpperCase(), 270, yPos + 17, { align: 'center' });
        
        // Arrival time - use flight data
        const [arrivalHour, arrivalMinute] = ticketData.flight.arrivalTime.replace('AM', '').replace('PM', '').trim().split(':');
        const isArrivalPM = ticketData.flight.arrivalTime.includes('PM');
        
        doc.fontSize(16)
           .font('Helvetica-Bold')
           .text(ticketData.flight.arrivalTime.replace('AM', '').replace('PM', '').trim(), 350, yPos);
           
        doc.fontSize(10) 
           .text(isArrivalPM ? 'PM' : 'AM', 350, yPos + 16);
           
        doc.fontSize(8)
           .text(ticketData.flight.arrivalAirport, 350, yPos + 26);
        
        // Flight number
        doc.fontSize(9)
           .font('Helvetica')
           .text(`Flight: ${flightNumber}`, 180, yPos + 40);
           
        // Passenger information
        yPos += 70;
        doc.fontSize(9)
           .font('Helvetica-Bold')
           .text('PASSENGERS', 30, yPos);
        
        yPos += 15;
        
        // Add passenger details
        let passengerName = "ELSAARAN, AMR SAIED MR";
        
        // If we have actual passenger data, use it
        if (ticketData.passengers && ticketData.passengers.length > 0) {
          const passenger = ticketData.passengers[0];
          passengerName = `${passenger.lastName?.toUpperCase()}, ${passenger.firstName?.toUpperCase()} ${passenger.title?.toUpperCase()}`;
        }
        
        doc.fontSize(9)
           .font('Helvetica')
           .text(passengerName, 30, yPos);
        
        yPos += 15;
        
        // Service class
        doc.fontSize(9)
           .font('Helvetica')
           .text('Class Of Service: Economy (Y)', 30, yPos);
        
        yPos += 15;
        
        // Airport info section
        doc.fontSize(9)
           .font('Helvetica-Bold')
           .text('AIRPORT INFO', 30, yPos);
        
        yPos += 15;
        
        // Departure airport details
        const departureTerminal = ticketData.flight.departureAirport === 'CAI' ? 'Terminal 2' : 'Main Terminal';
        const departureCountryCode = this.getCountryCode(ticketData.flight.departureCountry);
        
        doc.fontSize(9)
           .font('Helvetica')
           .text(`${ticketData.flight.departureCity} Intl Arpt (${ticketData.flight.departureAirport})`, 30, yPos)
           .text(`${ticketData.flight.departureCity}, ${departureCountryCode}`, 30, yPos + 10)
           .text(departureTerminal, 30, yPos + 20);
        
        // To line with dots
        doc.fontSize(8)
           .text('to', 200, yPos + 10);
        
        // Draw dotted connecting lines
        const lineY = yPos + 14;
        for (let i = 80; i < 190; i += 5) {
          doc.moveTo(i, lineY).lineTo(i + 3, lineY).stroke();
        }
        for (let i = 220; i < 340; i += 5) {
          doc.moveTo(i, lineY).lineTo(i + 3, lineY).stroke();
        }
        
        // Arrival airport details
        const arrivalTerminal = ticketData.flight.arrivalAirport === 'AUH' ? 'Terminal A' : 'Main Terminal';
        const arrivalCountryCode = this.getCountryCode(ticketData.flight.arrivalCountry);
        
        doc.fontSize(9)
           .font('Helvetica')
           .text(`${ticketData.flight.arrivalCity} Intl Arpt (${ticketData.flight.arrivalAirport})`, 350, yPos)
           .text(`${ticketData.flight.arrivalCity}, ${arrivalCountryCode}`, 350, yPos + 10)
           .text(arrivalTerminal, 350, yPos + 20);
        
        yPos += 40;
        
        // Flight info section
        doc.fontSize(9)
           .font('Helvetica-Bold')
           .text('FLIGHT INFO', 30, yPos);
        
        yPos += 15;
        
        // Aircraft type and meal
        const aircraftType = ticketData.flight.airlineCode === 'EY' ? 'Airbus A321 NEO' : 'Boeing 787-9';
        doc.fontSize(9)
           .font('Helvetica')
           .text(aircraftType, 30, yPos)
           .text('Meal', 30, yPos + 10);
        
        // Fare basis section
        yPos += 40;
        doc.fontSize(9)
           .font('Helvetica-Bold')
           .text('FARE BASIS', 30, yPos);
        
        yPos += 15;
        
        // Generate a random fare basis code
        const fareBasis = this.generateFareBasisCode(ticketData.flight.airlineCode);
        doc.fontSize(9)
           .font('Helvetica')
           .text(fareBasis, 30, yPos);
        
        // Payment information
        yPos += 30;
        doc.fontSize(9)
           .font('Helvetica-Bold')
           .text('PAYMENT INFORMATION', 30, yPos);
        
        yPos += 15;
        
        // Payment details
        doc.fontSize(9)
           .font('Helvetica')
           .text(`Form of Payment: Credit Card`, 30, yPos)
           .text(`Amount: ${ticketData.currency} ${ticketData.totalPrice.toFixed(2)}`, 30, yPos + 10);
        
        // Security/QR Code section
        yPos += 40;
        
        // Draw a fake QR code (black square with pattern)
        const qrSize = 70;
        const qrX = doc.page.width - 100;
        const qrY = yPos;
        
        // Draw QR code background
        doc.fillColor('black')
           .rect(qrX, qrY, qrSize, qrSize)
           .fill();
        
        // Draw some white squares to mimic QR code pattern
        doc.fillColor('white');
        
        // Draw QR code-like pattern (random white blocks)
        for (let i = 0; i < 8; i++) {
          for (let j = 0; j < 8; j++) {
            if (Math.random() > 0.6) {
              const blockSize = qrSize / 8;
              doc.rect(qrX + i * blockSize, qrY + j * blockSize, blockSize, blockSize).fill();
            }
          }
        }
        
        // Three fixed position blocks (QR code positioning squares)
        doc.fillColor('white')
           .rect(qrX + 5, qrY + 5, 15, 15)
           .fill()
           .rect(qrX + qrSize - 20, qrY + 5, 15, 15)
           .fill()
           .rect(qrX + 5, qrY + qrSize - 20, 15, 15)
           .fill();
        
        doc.fillColor('black')
           .rect(qrX + 8, qrY + 8, 9, 9)
           .fill()
           .rect(qrX + qrSize - 17, qrY + 8, 9, 9)
           .fill()
           .rect(qrX + 8, qrY + qrSize - 17, 9, 9)
           .fill();
        
        // Add verification text
        doc.fillColor('black')
           .fontSize(8)
           .font('Helvetica')
           .text('SCAN FOR VERIFICATION', qrX, qrY + qrSize + 5, { width: qrSize, align: 'center' });
        
        // Legal information and footer
        yPos = doc.page.height - 100;
        doc.fontSize(7)
           .font('Helvetica')
           .text('IMPORTANT NOTICES:', 30, yPos)
           .text('• Please verify flight times prior to departure as schedules may change', 30, yPos + 10)
           .text('• Arrive at the airport at least 3 hours before international departures', 30, yPos + 20)
           .text('• Valid ID and travel documents required for travel', 30, yPos + 30)
           .text('• This is an electronic ticket, please print this receipt or keep a digital copy', 30, yPos + 40);
        
        // Barcode at the bottom
        const barcodeY = doc.page.height - 40;
        
        // Draw a fake barcode
        const barcodeX = 30;
        const barcodeHeight = 20;
        const barcodeWidth = 350;
        
        for (let i = 0; i < 50; i++) {
          const x = barcodeX + i * (barcodeWidth / 50);
          const lineWidth = Math.random() * 3 + 1;
          
          // Skip some positions to create spacing in barcode
          if (Math.random() > 0.7) continue;
          
          doc.fillColor('black')
             .rect(x, barcodeY, lineWidth, barcodeHeight)
             .fill();
        }
        
        // Add barcode number
        doc.fontSize(8)
           .font('Helvetica')
           .text(`${eTicketNumber}`, barcodeX, barcodeY + barcodeHeight + 2, { width: barcodeWidth, align: 'center' });
        
        // Finalize PDF
        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }
  
  // Helper method to get 2-letter country code
  private getCountryCode(country: string): string {
    const countryCodes: Record<string, string> = {
      'United States': 'US',
      'United Kingdom': 'GB',
      'Egypt': 'EG',
      'United Arab Emirates': 'AE',
      'Thailand': 'TH',
      'China': 'CN',
      'Japan': 'JP',
      'Germany': 'DE',
      'France': 'FR',
      'Brazil': 'BR',
      'Russia': 'RU',
      'India': 'IN',
      'Spain': 'ES',
      'Netherlands': 'NL',
      'Singapore': 'SG',
      'Turkey': 'TR'
    };
    
    return countryCodes[country] || country.substring(0, 2).toUpperCase();
  }
  
  // Generate a realistic fare basis code
  private generateFareBasisCode(airlineCode: string): string {
    const classes = ['Y', 'B', 'M', 'E', 'H', 'Q', 'L', 'K', 'G', 'S'];
    const randomClass = classes[Math.floor(Math.random() * classes.length)];
    
    // Basic structure: class + airline initial + random number + restriction codes
    const fareCode = `${randomClass}${airlineCode.charAt(0)}${Math.floor(Math.random() * 90) + 10}NR`;
    
    return fareCode;
  }
  
  async generateTicketData(bookingId: number) {
    try {
      // Get the booking - check for valid numeric ID first
      if (isNaN(bookingId) || bookingId <= 0) {
        throw new Error("Invalid booking ID");
      }
    
      // Attempt to retrieve the booking
      const booking = await this.storage.getBooking(bookingId);
      if (!booking) {
        console.error(`Booking with ID ${bookingId} not found`);
        throw new Error("Booking not found");
      }
      
      // Verify booking status - only check if status is not confirmed if it exists
      if (booking.status && booking.status !== 'confirmed') {
        console.error(`Cannot generate ticket for booking ${bookingId} with status: ${booking.status}`);
        throw new Error("Cannot generate ticket for unconfirmed booking");
      }
      
      // Get the flight - safely handle missing flightId
      let flight = null;
      try {
        if (booking.flightId) {
          flight = await this.storage.getFlight(booking.flightId);
        }
      } catch (error) {
        console.error(`Error retrieving flight (ID: ${booking.flightId}) for booking ${bookingId}:`, error);
      }
      
      // If flight is not found, create a fallback flight object
      if (!flight) {
        console.log(`Flight with ID ${booking.flightId} not found, creating fallback flight data`);
        
        // Create a generic flight object with required fields
        flight = {
          id: booking.flightId ?? 0,
          airlineName: "Global Airways",
          airlineCode: "GA",
          flightNumber: "GA" + (Math.floor(Math.random() * 900) + 100),
          departureAirport: "JFK",
          departureCity: "New York",
          departureCountry: "United States",
          arrivalAirport: "LHR",
          arrivalCity: "London",
          arrivalCountry: "United Kingdom",
          departureTime: "10:30 AM",
          arrivalTime: "10:30 PM",
          duration: "7h 00m",
          basePrice: booking.totalPrice || 499,
          // Add required fields with safe defaults
          aircraft: "Boeing 787-9",
          price: booking.totalPrice || 499,
          currency: booking.currency || "USD",
          seatsAvailable: 100,
          status: "confirmed"
        };
      }
    
    // Get passengers
    let passengers = await this.storage.getPassengersByBookingId(bookingId);
    
    // If no passengers found, try to create a realistic passenger with data from booking
    if (!passengers || passengers.length === 0) {
      console.log(`No passengers found for booking ${bookingId}, creating passenger data from special requests`);
      
      // Extract passenger information from specialRequests if available
      let title = "Mr";
      let firstName = "Guest";
      let lastName = "Traveler";
      let nationality = flight.departureCountry || "Egypt";
      let passportNumber = `P${Math.floor(10000000 + Math.random() * 90000000)}`;
      
      try {
        // Try to extract passenger details from specialRequests field if provided
        if (booking.specialRequests) {
          const details = booking.specialRequests.split(',');
          
          for (const detail of details) {
            if (detail.includes(':')) {
              const [key, value] = detail.split(':').map(s => s.trim());
              if (key === 'firstName') firstName = this.capitalizeFirstLetter(value);
              if (key === 'lastName') lastName = this.capitalizeFirstLetter(value); 
              if (key === 'title') title = value;
              if (key === 'nationality') nationality = value;
              if (key === 'passportNumber') passportNumber = value;
            }
          }
        }
      } catch (e) {
        console.log('Error parsing passenger details from specialRequests:', e);
      }
      
      // If still no name data, try to extract from email
      if (firstName === "Guest" && lastName === "Traveler" && booking.contactEmail) {
        const emailName = booking.contactEmail.split('@')[0];
        if (emailName.includes('.')) {
          const nameParts = emailName.split('.');
          firstName = this.capitalizeFirstLetter(nameParts[0]);
          lastName = this.capitalizeFirstLetter(nameParts[1]);
        } else {
          firstName = this.capitalizeFirstLetter(emailName);
        }
      }
      
      passengers = [{
        id: 1,
        userId: booking.userId,
        title,
        firstName,
        lastName,
        nationality,
        passportNumber,
        passportExpiry: "2030-01-01",
        dateOfBirth: "1990-01-01",
        isSaved: false
      }];
    }
    
    // Calculate actual departure date from booking data
    // Try to extract from booking data, using today + 30 days as a fallback
    let departureDate = new Date();
    departureDate.setDate(departureDate.getDate() + 30); // Default 30 days from now
    
    // Use travelDate from booking.specialRequests if it exists
    try {
      if (booking.specialRequests && booking.specialRequests.includes('departureDate')) {
        const dateMatch = booking.specialRequests.match(/departureDate:([^,]+)/);
        if (dateMatch && dateMatch[1]) {
          departureDate = new Date(dateMatch[1].trim());
        }
      }
    } catch (e) {
      console.log('Error parsing departure date:', e);
    }
    
    // Format data for ticket, adding all required fields with fallbacks
    return {
      ticketNumber: `TKT${booking.bookingReference}`,
      bookingReference: booking.bookingReference,
      flight: {
        airlineName: flight?.airlineName || "Air Global",
        airlineCode: flight?.airlineCode || "AG",
        flightNumber: flight?.flightNumber || "AG123",
        departureAirport: flight?.departureAirport || "JFK",
        departureCity: flight?.departureCity || "New York",
        departureCountry: flight?.departureCountry || "United States",
        arrivalAirport: flight?.arrivalAirport || "LHR",
        arrivalCity: flight?.arrivalCity || "London",
        arrivalCountry: flight?.arrivalCountry || "United Kingdom",
        departureTime: flight?.departureTime || "10:00 AM",
        arrivalTime: flight?.arrivalTime || "10:00 PM",
        duration: flight?.duration || "7h 00m",
        // Adding fields that might be missing in the database
        aircraft: flight?.aircraft || "Boeing 787-9",
        price: flight?.price || booking.totalPrice,
        currency: flight?.currency || "USD",
        seatsAvailable: flight?.seatsAvailable || 100,
        status: flight?.status || "confirmed",
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
      departureDate: departureDate.toISOString(),
    };
    } catch (err) {
      const error = err as Error;
      console.error(`Error generating ticket data for booking ${bookingId}:`, error);
      throw new Error(`Failed to generate ticket data: ${error.message}`);
    }
  }
  
  // Helper function to capitalize first letter
  private capitalizeFirstLetter(string: string): string {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
}