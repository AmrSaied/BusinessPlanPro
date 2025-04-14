import React, { useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from './button';
import { Download, Printer, Plane } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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

  return (
    <div className="bg-white rounded-lg shadow-lg p-0 max-w-4xl mx-auto">
      {/* PDF Generation Container */}
      <div ref={ticketRef} className="ticket-container text-gray-900">
        {/* ViewTrip Header */}
        <div className="bg-[#006699] p-3 text-white">
          <div className="flex items-center">
            <div className="w-7 h-7 flex items-center justify-center rounded-full bg-white mr-3">
              <span className="text-[#006699] font-bold text-base">V</span>
            </div>
            <span className="text-base font-bold">ViewTrip</span>
          </div>
        </div>
        
        {/* My Trip Header */}
        <div className="p-4 border-b border-gray-300">
          <h1 className="text-base font-medium mb-2">My Trip</h1>
          <div className="text-sm leading-tight text-gray-700">
            <div className="font-bold">
              {formatTicketDate(issueDate)} - {flight.departureCity} ({flight.departureAirport}) to {flight.arrivalCity} ({flight.arrivalAirport}) - Confirmed
              <svg className="inline-block h-4 w-4 ml-1 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
        
        {/* Flight Segment */}
        <div className="border-b border-gray-200">
          {/* Date Header */}
          <div className="p-3 font-bold text-xs border-b border-gray-300">
            {formatTicketDate(issueDate)}
          </div>
          
          {/* Airline Info */}
          <div className="flex items-start p-3">
            <div className="bg-[#4a0000] text-white font-bold h-6 w-6 flex items-center justify-center mr-3">
              <span className="text-xs">{flight.airlineCode}</span>
            </div>
            <div>
              <div className="font-bold text-xs">{flight.airlineName} ({flight.airlineCode}) {flight.flightNumber}</div>
              <div className="text-xs text-gray-600 mt-1">Confirmation Number: {bookingReference}</div>
            </div>
          </div>
          
          {/* Flight Times with Improved Layout */}
          <div className="flex justify-between items-center px-4 py-3">
            <div className="flex-1">
              <div className="uppercase text-xs font-bold text-gray-600 mb-1">DEPART</div>
              <div className="flex items-baseline">
                <div className="text-lg font-bold">{flight.departureTime.split(' ')[0]}</div>
                <div className="text-xs ml-1 uppercase">{flight.departureTime.split(' ')[1]}</div>
              </div>
              <div className="text-xs text-gray-600 mt-1">{flight.departureCity}</div>
            </div>
            
            <div className="flex-none px-3">
              <Plane className="h-6 w-6 text-gray-500" />
              <div className="text-center mt-1">
                <div className="text-xs text-gray-500 font-mono">NON</div>
                <div className="text-xs text-gray-500 font-mono">STOP</div>
              </div>
            </div>
            
            <div className="flex-1 text-right">
              <div className="uppercase text-xs font-bold text-gray-600 mb-1">ARRIVE</div>
              <div className="flex items-baseline justify-end">
                <div className="text-lg font-bold">{flight.arrivalTime.split(' ')[0]}</div>
                <div className="text-xs ml-1 uppercase">{flight.arrivalTime.split(' ')[1]}</div>
              </div>
              <div className="text-xs text-gray-600 mt-1">{flight.arrivalCity}</div>
            </div>
          </div>
          
          {/* Flight Duration and Distance */}
          <div className="flex justify-between border-t border-gray-200 px-4 py-3">
            <div className="text-xs text-gray-600">
              <span className="font-semibold">Duration:</span> {flight.duration}
            </div>
            <div className="text-xs text-gray-600">
              <span className="font-semibold">Distance:</span> {calculateDistance()} km
            </div>
          </div>
        </div>
        
        {/* Passengers Section */}
        <div className="border-b border-gray-300 p-4">
          <div className="uppercase text-xs font-semibold mb-2">PASSENGERS</div>
          {passengers.map((passenger, index) => (
            <div key={index} className="text-xs mb-1">
              {passenger.title.toUpperCase()}. {translateToEnglish(passenger.firstName).toUpperCase()} {translateToEnglish(passenger.lastName).toUpperCase()}
            </div>
          ))}
          <div className="text-xs mt-2">Class Of Service: Economy</div>
        </div>
        
        {/* Airport Info Section */}
        <div className="border-b border-gray-300 p-4">
          <div className="uppercase text-xs font-semibold mb-2">AIRPORT INFO</div>
          <div className="text-xs mb-3">
            <div className="mb-0.5">{flight.departureCity} Int'l Apt ({flight.departureAirport})</div>
            <div className="mb-0.5">{flight.departureCity}, {flight.departureCountry}</div>
            {flight.departureTerminal && <div>Terminal {flight.departureTerminal}</div>}
          </div>
          
          <div className="flex items-center my-3">
            <div className="flex-grow border-b border-dotted border-gray-300"></div>
            <div className="mx-3 text-xs text-gray-500 font-bold">TO</div>
            <div className="flex-grow border-b border-dotted border-gray-300"></div>
          </div>
          
          <div className="text-xs">
            <div className="mb-0.5">{flight.arrivalCity} Int'l Apt ({flight.arrivalAirport})</div>
            <div className="mb-0.5">{flight.arrivalCity}, {flight.arrivalCountry}</div>
            {flight.arrivalTerminal && <div>Terminal {flight.arrivalTerminal}</div>}
          </div>
        </div>
        
        {/* Flight Info Section */}
        <div className="border-b border-gray-300 p-4">
          <div className="uppercase text-xs font-semibold mb-2">FLIGHT INFO</div>
          <div className="flex justify-between items-center text-xs">
            <div>
              <div className="mb-0.5">Boeing 777-300</div>
              <div>Meal</div>
            </div>
            <div className="text-right">
              <div className="font-semibold mb-0.5">Distance</div>
              <div>{calculateDistance()} km</div>
            </div>
          </div>
        </div>
        
        {/* Footer with Disclaimers */}
        <div className="p-4 text-xs text-gray-600 text-center">
          <div className="mb-1">For visa application purposes only</div>
          <div className="mb-1">This is not a valid ticket for travel - For reference only</div>
          <div className="text-gray-400 text-xs mt-2">{ticketNumber}</div>
        </div>
      </div>
      
      {/* Buttons Outside PDF Area */}
      <div className="bg-white p-6 border-t border-gray-200 flex justify-center space-x-6">
        <button
          onClick={generatePDF}
          className="flex items-center px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Download className="w-5 h-5 mr-2" />
          {t('download_ticket')}
        </button>
        
        <button
          onClick={handlePrint}
          className="flex items-center px-5 py-2.5 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors shadow-sm"
        >
          <Printer className="w-5 h-5 mr-2" />
          {t('print_ticket')}
        </button>
      </div>
    </div>
  );
};

export default FlightTicket;