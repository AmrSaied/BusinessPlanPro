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
  
  // Convert non-English text to English if needed
  const translateToEnglish = (text: string) => {
    // This is a simple function to check if text contains non-Latin characters
    // and provide a fallback name if needed
    const nonLatinRegex = /[^\u0000-\u007F]/;
    
    if (nonLatinRegex.test(text)) {
      // For simplicity, return a generic name if non-Latin characters are found
      return "PASSENGER NAME";
    }
    
    return text;
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

  // Helper function to render a flight segment
  const renderFlightSegment = (segment: any, index: number) => {
    return (
      <div key={index} className="mb-0">
        {/* Date and Route Header */}
        <div className="p-3 font-bold text-xs border-b border-gray-300 text-left">
          {segment.date} - {segment.route} - {TICKET_TEXT.confirmed}
          <svg className="inline-block h-4 w-4 ml-1 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </div>
        
        {/* Airline Info */}
        <div className="flex items-start p-3">
          <div className="bg-[#8B4513] text-white font-bold h-8 w-8 flex items-center justify-center mr-3">
            <span className="text-xs">EY</span>
          </div>
          <div>
            <div className="font-bold text-xs">{segment.airline}</div>
            <div className="text-xs text-gray-600">{TICKET_TEXT.confirmationNumber}: {segment.confirmationNumber}</div>
          </div>
        </div>
        
        {/* Flight Times with ViewTrip Layout - Exact match to reference image */}
        <div className="pl-4 pr-4 py-3">
          <div>
            <div className="grid grid-cols-12 gap-2 items-start text-left">
              {/* DEPART Section */}
              <div className="col-span-3 text-left">
                <div className="uppercase text-xs font-bold text-gray-700 mb-1">DEPART</div>
                <div className="flex items-center gap-2 mb-1">
                  {/* Plane icon - exact match to reference */}
                  <span className="text-black text-xl">✈</span>
                  <div className="flex items-baseline">
                    <div className="text-lg font-bold">{segment.departTime}</div>
                    <div className="text-xs ml-1 uppercase">{segment.departAmPm}</div>
                    <div className="text-xs ml-1">{segment.departCode}</div>
                  </div>
                </div>
              </div>
              
              {/* NON STOP Section */}
              <div className="col-span-3 text-left mx-4">
                <div className="uppercase text-xs font-bold text-gray-700 mb-1 text-left">NON STOP</div>
                <div className="flex justify-center">
                  <div className="text-center">
                    <div className="w-16 border-t border-gray-400 border-dashed mb-1"></div>
                    <div className="text-xs text-gray-600 text-center">{segment.duration}</div>
                  </div>
                </div>
              </div>
              
              {/* ARRIVE Section */}
              <div className="col-span-3 text-left">
                <div className="uppercase text-xs font-bold text-gray-700 mb-1">ARRIVE</div>
                <div className="flex items-baseline">
                  <div className="text-lg font-bold">{segment.arriveTime}</div>
                  <div className="text-xs ml-1 uppercase">{segment.arriveAmPm}</div>
                  <div className="text-xs ml-1">{segment.arriveCode}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Passengers Section */}
        <div className="border-b border-gray-300 p-4 text-left">
          <div className="uppercase text-xs font-semibold mb-2 text-left">{TICKET_TEXT.passengers}</div>
          <div className="text-xs mb-1 text-left">
            {segment.passengerName}
          </div>
          <div className="text-xs mt-2 text-left">{TICKET_TEXT.classOfService}: {segment.service}</div>
        </div>
        
        {/* Airport Info Section */}
        <div className="border-b border-gray-300 p-4 text-left">
          <div className="uppercase text-xs font-semibold mb-2 text-left">{TICKET_TEXT.airportInfo}</div>
          <div className="text-xs mb-1 text-left">
            <div className="mb-0.5 text-left">{segment.departAirport}</div>
            <div className="mb-0.5 text-left">{segment.departCity}</div>
            {segment.departTerminal && <div className="text-left">{segment.departTerminal}</div>}
          </div>
          
          <div className="my-2 text-left">
            <div className="text-xs text-gray-600 text-left">{TICKET_TEXT.to}</div>
          </div>
          
          <div className="text-xs mt-1 text-left">
            <div className="mb-0.5 text-left">{segment.arriveAirport}</div>
            <div className="mb-0.5 text-left">{segment.arriveCity}</div>
            {segment.arriveTerminal && <div className="text-left">{segment.arriveTerminal}</div>}
          </div>
        </div>
        
        {/* Flight Info Section */}
        <div className="border-b border-gray-300 p-4 text-left">
          <div className="uppercase text-xs font-semibold mb-2 text-left">{TICKET_TEXT.flightInfo}</div>
          <div className="text-xs text-left">
            <div className="mb-0.5 text-left">{segment.aircraft}</div>
            <div className="text-left">{segment.meal}</div>
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
        
        {/* Render all flight segments */}
        {MOCK_ITINERARY.map((segment, index) => renderFlightSegment(segment, index))}
      </div>
      
      {/* Buttons Outside PDF Area */}
      <div className="bg-white p-6 border-t border-gray-200 flex justify-center space-x-6">
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
    </div>
  );
};

export default FlightTicket;