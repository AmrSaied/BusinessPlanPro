import React, { useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from './button';
import { Download, Printer, Plane } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Fixed English text for tickets regardless of app language
const TICKET_TEXT = {
  viewTrip: "ViewTrip",
  myTrip: "My Trip",
  confirmed: "Confirmed",
  depart: "DEPART",
  arrive: "ARRIVE",
  nonStop: "NON STOP",
  duration: "Duration",
  distance: "Distance",
  passengers: "PASSENGERS",
  classOfService: "Class Of Service",
  economy: "Economy",
  airportInfo: "AIRPORT INFO",
  terminal: "Terminal",
  to: "to",
  flightInfo: "FLIGHT INFO",
  aircraft: "Airbus A321 NEO",
  meal: "Meal",
  visaPurpose: "For visa application purposes only",
  refOnly: "This is not a valid ticket for travel - For reference only",
  download: "Download Ticket",
  print: "Print Ticket",
  confirmationNumber: "Confirmation Number",
  intApt: "Int'l Apt"
};

// Data for the multi-segment ViewTrip layout
const MOCK_ITINERARY = [
  {
    date: "THU, DEC 12, 2024",
    route: "Cairo (CAI) to Abu Dhabi (AUH)",
    airline: "Etihad Airways (EY) 716",
    confirmationNumber: "QYA69B",
    departTime: "5:30",
    departAmPm: "PM",
    departCode: "CAI",
    duration: "3H 15M",
    arriveTime: "10:45",
    arriveAmPm: "PM",
    arriveCode: "AUH",
    passengerName: "ELSAKAAN, AMR SAIED MR",
    service: "Economy",
    departAirport: "Cairo Intl Arpt (CAI)",
    departCity: "Cairo, EG",
    departTerminal: "Terminal 2",
    arriveAirport: "Zayed International Apt (AUH)",
    arriveCity: "Abu Dhabi, AE",
    arriveTerminal: "Terminal A",
    aircraft: "Airbus A321 NEO",
    meal: "Meal"
  },
  {
    date: "FRI, DEC 13, 2024",
    route: "Abu Dhabi (AUH) to Bangkok (BKK)",
    airline: "Etihad Airways (EY) 406",
    confirmationNumber: "QYA69B",
    departTime: "9:35",
    departAmPm: "AM",
    departCode: "AUH",
    duration: "6H 0M",
    arriveTime: "6:35",
    arriveAmPm: "PM",
    arriveCode: "BKK",
    passengerName: "ELSAKAAN, AMR SAIED MR",
    service: "Economy",
    departAirport: "Zayed International Apt (AUH)",
    departCity: "Abu Dhabi, AE",
    departTerminal: "Terminal A",
    arriveAirport: "Suvarnabhumi Intl Arpt (BKK)",
    arriveCity: "Bangkok, TH",
    arriveTerminal: "",
    aircraft: "Boeing 777-300",
    meal: "Meal"
  },
  {
    date: "THU, DEC 26, 2024 - FRI, DEC 27, 2024",
    route: "Bangkok (BKK) to Abu Dhabi (AUH)",
    airline: "Etihad Airways (EY) 407",
    confirmationNumber: "QYA69B",
    departTime: "8:30",
    departAmPm: "PM",
    departCode: "BKK",
    duration: "6H 30M",
    arriveTime: "12:00",
    arriveAmPm: "AM",
    arriveCode: "AUH",
    passengerName: "ELSAKAAN, AMR SAIED MR",
    service: "Economy",
    departAirport: "Suvarnabhumi Intl Arpt (BKK)",
    departCity: "Bangkok, TH",
    departTerminal: "",
    arriveAirport: "Zayed International Apt (AUH)",
    arriveCity: "Abu Dhabi, AE",
    arriveTerminal: "Terminal A",
    aircraft: "Boeing 777-300",
    meal: "Meal"
  }
];

interface Passenger {
  title: string;
  firstName: string;
  lastName: string;
  nationality: string;
  passportNumber: string;
}

interface FlightDetails {
  airlineName: string;
  airlineCode: string;
  flightNumber: string;
  departureAirport: string;
  departureCity: string;
  departureCountry: string;
  departureTerminal?: string;
  arrivalAirport: string;
  arrivalCity: string;
  arrivalCountry: string;
  arrivalTerminal?: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  aircraft?: string;
}

interface TicketOptions {
  expressProcessing: boolean;
  editableTicket: boolean;
  hotelReservation: boolean;
  insuranceLetter: boolean;
}

interface FlightTicketProps {
  ticketNumber: string;
  bookingReference: string;
  flight: FlightDetails;
  passengers: Passenger[];
  ticketOptions: TicketOptions;
  contactEmail: string;
  contactPhone: string;
  totalPrice: number;
  currency: string;
  status: string;
  issueDate: string;
  travelPurpose: string;
  itinerary?: {
    outbound: FlightDetails;
    inbound?: FlightDetails;
    connections?: FlightDetails[];
  };
}

const FlightTicket: React.FC<FlightTicketProps> = ({
  ticketNumber,
  bookingReference,
  flight,
  passengers,
  ticketOptions,
  contactEmail,
  contactPhone,
  totalPrice,
  currency,
  status,
  issueDate,
  travelPurpose
}) => {
  const { t } = useTranslation();
  const ticketRef = useRef<HTMLDivElement>(null);
  
  // Format date for the flight ticket
  const formatTicketDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
      const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
      return `${dayNames[date.getDay()]}, ${monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
    } catch (e) {
      return dateString;
    }
  };
  
  // Advanced function to translate Arabic names to English with proper transliteration
  const translateToEnglish = (text: string, defaultText: string = "") => {
    if (!text) return defaultText || "PASSENGER NAME";
    
    // Check if text contains Arabic characters
    const arabicRegex = /[\u0600-\u06FF]/;
    if (!arabicRegex.test(text)) return text;
    
    // Arabic to English character mapping (simplified version)
    const arabicToEnglish: Record<string, string> = {
      'ا': 'A', 'أ': 'A', 'إ': 'E', 'آ': 'A',
      'ب': 'B', 'ت': 'T', 'ث': 'TH',
      'ج': 'J', 'ح': 'H', 'خ': 'KH',
      'د': 'D', 'ذ': 'TH', 'ر': 'R',
      'ز': 'Z', 'س': 'S', 'ش': 'SH',
      'ص': 'S', 'ض': 'D', 'ط': 'T',
      'ظ': 'Z', 'ع': 'A', 'غ': 'GH',
      'ف': 'F', 'ق': 'Q', 'ك': 'K',
      'ل': 'L', 'م': 'M', 'ن': 'N',
      'ه': 'H', 'و': 'W', 'ي': 'Y', 'ى': 'A',
      'ة': 'A', 'ء': '', 'ؤ': 'O',
      'ئ': 'E', 'َ': 'A', 'ُ': 'U',
      'ِ': 'I', 'ّ': '', 'ْ': '',
      'ً': 'AN', 'ٌ': 'UN', 'ٍ': 'IN'
    };
    
    // Simple transliteration
    let transliterated = '';
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (arabicToEnglish[char]) {
        transliterated += arabicToEnglish[char];
      } else if (char === ' ') {
        transliterated += ' ';
      } else if (!/[\u0600-\u06FF]/.test(char)) {
        // Keep non-Arabic characters as is (numbers, punctuation, etc.)
        transliterated += char;
      }
    }
    
    // Format name as LASTNAME, FIRSTNAME style
    const parts = transliterated.trim().split(' ');
    if (parts.length >= 2) {
      const lastName = parts[parts.length - 1].toUpperCase();
      const firstName = parts.slice(0, parts.length - 1).join(' ').toUpperCase();
      return `${lastName}, ${firstName}`;
    }
    
    return transliterated.toUpperCase() || defaultText || "PASSENGER NAME";
  };
  
  // Calculate flight distance (approximate)
  const calculateDistance = () => {
    // In a real app, we would calculate this based on coordinates
    // For demo purposes, we'll return a fixed value based on cities
    const routeDistances: Record<string, number> = {
      'AUH-JFK': 11030,
      'CAI-JFK': 9037,
      'AUH-LHR': 5502,
      'AUH-DXB': 123,
      'default': 2500
    };
    
    const route = `${flight.departureAirport}-${flight.arrivalAirport}`;
    return routeDistances[route] || routeDistances['default'];
  };
  
  // Generate PDF from ticket
  const generatePDF = async () => {
    if (!ticketRef.current) return;
    
    try {
      const canvas = await html2canvas(ticketRef.current, {
        scale: 2,
        logging: false,
        useCORS: true
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`flight-ticket-${bookingReference}.pdf`);
      
      console.log(`Generating PDF client-side for booking reference: ${bookingReference}`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert(t('pdf_generation_error') || 'Error generating PDF');
    }
  };
  
  // Handle print ticket
  const handlePrint = () => {
    window.print();
  };

  // Helper function to render a flight segment with real data
  const renderFlightSegment = () => {
    // Split time and AM/PM
    const formatTimeAmPm = (timeStr: string) => {
      // If the timeStr is in 24 hour format, convert to 12 hour with AM/PM
      if (!timeStr) return { time: "00:00", amPm: "AM" };
      
      const timeParts = timeStr.split(':');
      if (timeParts.length !== 2) return { time: timeStr, amPm: "" };
      
      let hours = parseInt(timeParts[0]);
      const minutes = timeParts[1];
      const amPm = hours >= 12 ? 'PM' : 'AM';
      
      // Convert to 12-hour format
      hours = hours % 12;
      hours = hours ? hours : 12; // Convert 0 to 12
      
      return {
        time: `${hours}:${minutes}`,
        amPm: amPm
      };
    };
    
    // Extract departure time components
    const departTimeParts = formatTimeAmPm(flight.departureTime);
    const departTime = departTimeParts.time.split(':')[0]; // Just the hour
    const departAmPm = departTimeParts.amPm;
    const departCode = flight.departureAirport;
    
    // Extract arrival time components
    const arriveTimeParts = formatTimeAmPm(flight.arrivalTime);
    const arriveTime = arriveTimeParts.time.split(':')[0]; // Just the hour
    const arriveAmPm = arriveTimeParts.amPm;
    const arriveCode = flight.arrivalAirport;
    
    // Format passenger names - translate if needed
    const passengerNamesList = passengers.map(passenger => {
      const title = passenger.title.toUpperCase();
      const firstName = translateToEnglish(passenger.firstName);
      const lastName = translateToEnglish(passenger.lastName);
      return `${lastName}, ${firstName} ${title}`;
    });
    
    // Construct route
    const route = `${flight.departureCity} (${flight.departureAirport}) to ${flight.arrivalCity} (${flight.arrivalAirport})`;
    
    // Format date
    const formattedDate = formatTicketDate(issueDate);
    
    return (
      <div className="mb-0">
        {/* Date and Route Header */}
        <div className="p-3 font-bold text-xs border-b border-gray-300 text-left">
          {formattedDate} - {route} - {TICKET_TEXT.confirmed}
          <svg className="inline-block h-4 w-4 ml-1 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </div>
        
        {/* Airline Info Section - Using real data */}
        <div className="px-4 py-4 border-b border-gray-300">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-amber-700 text-white flex items-center justify-center mr-3">
              <span className="font-bold">{flight.airlineCode}</span>
            </div>
            <div>
              <div className="text-sm font-medium">{flight.airlineName} ({flight.airlineCode}) {flight.flightNumber}</div>
              <div className="text-xs text-gray-600">Confirmation Number: {bookingReference}</div>
            </div>
          </div>
          
          {/* Flight Times Layout - Exact match to reference with arrow - compact version */}
          <div className="flex items-center justify-between py-0 mx-0 px-3 border-b border-gray-100 pb-1">
            {/* DEPART Section */}
            <div>
              <div className="uppercase text-xs font-bold text-gray-700 mb-0.5">DEPART</div>
              <div className="flex items-center">
                <span className="text-[#3585e6] text-sm mr-0.5 transform rotate-45">✈</span>
                <div className="flex items-baseline">
                  <div className="text-lg font-bold">{departTime}</div>
                  <div className="text-xs uppercase ml-0.5">{departAmPm}</div>
                  <div className="text-xs ml-0.5">{departCode}</div>
                </div>
              </div>
            </div>
            
            {/* NON STOP Section with arrow */}
            <div className="mx-3">
              <div className="uppercase text-xs font-bold text-gray-700 mb-0.5 text-center">NON STOP</div>
              <div className="text-xs text-gray-600 text-center">{flight.duration}</div>
              <div className="flex justify-center items-center overflow-hidden mt-1 relative">
                <div className="w-full h-px border-t border-gray-300 border-dashed relative">
                  <div className="absolute top-[-2px] right-0 flex items-center">
                    <span className="text-gray-400 text-xs">▶</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* ARRIVE Section */}
            <div>
              <div className="uppercase text-xs font-bold text-gray-700 mb-0.5 text-right">ARRIVE</div>
              <div className="flex items-center justify-end">
                <div className="flex items-baseline">
                  <div className="text-lg font-bold">{arriveTime}</div>
                  <div className="text-xs uppercase ml-0.5">{arriveAmPm}</div>
                  <div className="text-xs ml-0.5">{arriveCode}</div>
                </div>
                <span className="text-[#3585e6] text-sm ml-0.5 transform rotate-90">✈</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Passengers Section */}
        <div className="border-b border-gray-300 p-4 text-left">
          <div className="uppercase text-xs font-semibold mb-2 text-left">{TICKET_TEXT.passengers}</div>
          {passengerNamesList.map((name, idx) => (
            <div key={idx} className="text-xs mb-1 text-left">
              {name}
            </div>
          ))}
          <div className="text-xs mt-2 text-left">{TICKET_TEXT.classOfService}: {TICKET_TEXT.economy}</div>
        </div>
        
        {/* Airport Info Section */}
        <div className="border-b border-gray-300 p-4 text-left">
          <div className="uppercase text-xs font-semibold mb-2 text-left">{TICKET_TEXT.airportInfo}</div>
          <div className="text-xs mb-1 text-left">
            <div className="mb-0.5 text-left">{flight.departureAirport} {TICKET_TEXT.intApt}</div>
            <div className="mb-0.5 text-left">{flight.departureCity}, {flight.departureCountry}</div>
            {flight.departureTerminal && (
              <div className="text-left">{TICKET_TEXT.terminal} {flight.departureTerminal}</div>
            )}
          </div>
          
          <div className="my-2 text-left">
            <div className="text-xs text-gray-600 text-left">{TICKET_TEXT.to}</div>
          </div>
          
          <div className="text-xs mt-1 text-left">
            <div className="mb-0.5 text-left">{flight.arrivalAirport} {TICKET_TEXT.intApt}</div>
            <div className="mb-0.5 text-left">{flight.arrivalCity}, {flight.arrivalCountry}</div>
            {flight.arrivalTerminal && (
              <div className="text-left">{TICKET_TEXT.terminal} {flight.arrivalTerminal}</div>
            )}
          </div>
        </div>
        
        {/* Flight Info Section */}
        <div className="border-b border-gray-300 p-4 text-left">
          <div className="uppercase text-xs font-semibold mb-2 text-left">{TICKET_TEXT.flightInfo}</div>
          <div className="text-xs text-left">
            <div className="mb-0.5 text-left">{flight.aircraft || TICKET_TEXT.aircraft}</div>
            <div className="text-left">{TICKET_TEXT.meal}</div>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-0 max-w-4xl mx-auto">
      {/* PDF Generation Container */}
      <div ref={ticketRef} className="ticket-container text-gray-900" dir="ltr" lang="en">
        {/* ViewTrip Header */}
        <div className="bg-[#065a9e] p-3 text-white">
          <div className="flex items-center">
            <div className="w-7 h-7 flex items-center justify-center rounded-full bg-white mr-3">
              <span className="text-[#065a9e] font-bold text-base">T</span>
            </div>
            <span className="text-base font-bold">{TICKET_TEXT.viewTrip}</span>
          </div>
        </div>
        
        {/* My Trip Header */}
        <div className="px-4 py-3 border-b border-gray-300 text-left">
          <h1 className="text-base font-medium text-left">{TICKET_TEXT.myTrip}</h1>
        </div>
        
        {/* Render actual flight data from props */}
        {renderFlightSegment()}
      </div>
      
      {/* Buttons Directly Below Ticket */}
      <div className="bg-white p-6 border-t border-gray-200 text-center">
        <div className="flex justify-center space-x-6 mb-6">
          <button
            onClick={generatePDF}
            className="flex items-center px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Download className="w-5 h-5 mr-2" />
            {TICKET_TEXT.download}
          </button>
          
          <button
            onClick={handlePrint}
            className="flex items-center px-5 py-2.5 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors shadow-sm"
          >
            <Printer className="w-5 h-5 mr-2" />
            {TICKET_TEXT.print}
          </button>
        </div>
        
        {/* Additional Download Button */}
        <div className="mt-3">
          <a
            href={`/api/bookings/${ticketNumber.replace('TKT', '')}/ticket/download`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700"
          >
            <Download className="w-4 h-4 mr-1.5" />
            Direct Download
          </a>
        </div>
      </div>
    </div>
  );
};

export default FlightTicket;