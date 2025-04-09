import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from './button';
import { Plane, Calendar, Clock, Users, Download, Printer, MapPin, User, CreditCard } from 'lucide-react';
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
  arrivalAirport: string;
  arrivalCity: string;
  arrivalCountry: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
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
  
  // Format date string for display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
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
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };
  
  // Handle print ticket
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-0 max-w-4xl mx-auto">
      {/* PDF Generation Container */}
      <div ref={ticketRef} className="ticket-container">
        {/* Header - Airline + Booking Reference */}
        <div className="bg-primary p-4 rounded-t-lg text-white flex justify-between items-center">
          <div className="flex items-center">
            <Plane className="h-8 w-8 mr-3" />
            <div>
              <h1 className="text-2xl font-bold">{flight.airlineName}</h1>
              <p className="text-sm opacity-80">{t('flight_reservation_voucher')}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm opacity-80">{t('booking_reference')}</p>
            <p className="text-xl font-mono font-bold">{bookingReference}</p>
          </div>
        </div>
        
        {/* Main Ticket Content */}
        <div className="p-6">
          {/* Status Banner */}
          <div className="mb-6 bg-green-100 text-green-800 px-4 py-2 rounded-md text-center font-medium">
            {status === 'confirmed' ? t('booking_confirmed') : status}
            <span className="ml-2 text-sm">
              {formatDate(issueDate)}
            </span>
          </div>
          
          {/* Flight Route Section */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-xl font-bold">{flight.departureAirport}</div>
              <div className="text-gray-500">{flight.departureCity}, {flight.departureCountry}</div>
              <div className="mt-1 font-medium text-lg">{flight.departureTime}</div>
            </div>
            
            <div className="flex items-center justify-center">
              <div className="w-full relative flex items-center justify-center">
                <div className="border-t-2 border-gray-300 w-full"></div>
                <div className="absolute bg-white px-4">
                  <Plane className="text-primary h-6 w-6 transform rotate-90" />
                </div>
                <div className="absolute top-5 bg-white px-2 text-xs text-gray-500">
                  {flight.duration}
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-xl font-bold">{flight.arrivalAirport}</div>
              <div className="text-gray-500">{flight.arrivalCity}, {flight.arrivalCountry}</div>
              <div className="mt-1 font-medium text-lg">{flight.arrivalTime}</div>
            </div>
          </div>
          
          {/* Flight Details */}
          <div className="mb-6 bg-gray-50 rounded-lg p-4">
            <h3 className="font-bold text-lg mb-3 text-gray-800">{t('flight_details')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center">
                <Plane className="h-5 w-5 mr-2 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">{t('flight')}</p>
                  <p className="font-medium">{flight.airlineCode} {flight.flightNumber}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">{t('date')}</p>
                  <p className="font-medium">{formatDate(issueDate)}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <Clock className="h-5 w-5 mr-2 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">{t('duration')}</p>
                  <p className="font-medium">{flight.duration}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <CreditCard className="h-5 w-5 mr-2 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">{t('price')}</p>
                  <p className="font-medium">{totalPrice.toFixed(2)} {currency}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Passenger Information */}
          <div className="mb-6">
            <h3 className="font-bold text-lg mb-3 text-gray-800 flex items-center">
              <Users className="h-5 w-5 mr-2" />
              {t('passenger_information')}
            </h3>
            <div className="border border-gray-200 rounded-lg divide-y">
              {passengers.map((passenger, index) => (
                <div key={index} className="p-4">
                  <div className="flex items-center mb-2">
                    <User className="h-5 w-5 mr-2 text-gray-500" />
                    <h4 className="font-medium">
                      {passenger.title}. {passenger.firstName} {passenger.lastName}
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 ml-7">
                    <div>
                      <p className="text-sm text-gray-500">{t('nationality')}</p>
                      <p className="font-medium">{passenger.nationality}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">{t('passport')}</p>
                      <p className="font-medium">{passenger.passportNumber}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Additional Services & Options */}
          {(ticketOptions.expressProcessing || 
           ticketOptions.editableTicket || 
           ticketOptions.hotelReservation || 
           ticketOptions.insuranceLetter) && (
            <div className="mb-6">
              <h3 className="font-bold text-lg mb-3 text-gray-800">{t('additional_services')}</h3>
              <div className="bg-blue-50 rounded-lg p-4">
                <ul className="space-y-2">
                  {ticketOptions.expressProcessing && (
                    <li className="flex items-start">
                      <span className="inline-block bg-blue-200 rounded-full p-1 mr-2 mt-0.5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-blue-700" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </span>
                      {t('express_processing')}
                    </li>
                  )}
                  {ticketOptions.editableTicket && (
                    <li className="flex items-start">
                      <span className="inline-block bg-blue-200 rounded-full p-1 mr-2 mt-0.5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-blue-700" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </span>
                      {t('editable_ticket')}
                    </li>
                  )}
                  {ticketOptions.hotelReservation && (
                    <li className="flex items-start">
                      <span className="inline-block bg-blue-200 rounded-full p-1 mr-2 mt-0.5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-blue-700" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </span>
                      {t('hotel_reservation')}
                    </li>
                  )}
                  {ticketOptions.insuranceLetter && (
                    <li className="flex items-start">
                      <span className="inline-block bg-blue-200 rounded-full p-1 mr-2 mt-0.5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-blue-700" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </span>
                      {t('insurance_letter')}
                    </li>
                  )}
                </ul>
              </div>
            </div>
          )}
          
          {/* Contact Information */}
          <div className="mb-6">
            <h3 className="font-bold text-lg mb-3 text-gray-800">{t('contact_information')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
              <div>
                <p className="text-sm text-gray-500">{t('email')}</p>
                <p className="font-medium">{contactEmail}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('phone')}</p>
                <p className="font-medium">{contactPhone}</p>
              </div>
            </div>
          </div>
          
          {/* Travel Purpose */}
          <div className="mb-6">
            <h3 className="font-bold text-lg mb-3 text-gray-800">{t('travel_purpose')}</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p>{travelPurpose === 'visa' ? t('visa_application') : travelPurpose}</p>
            </div>
          </div>
          
          {/* Barcode/QR section */}
          <div className="border-t border-gray-200 pt-6 mt-6">
            <div className="flex flex-col items-center justify-center">
              <div className="font-mono text-sm mb-2">
                *{ticketNumber}*
              </div>
              <div className="h-12 w-48 bg-gradient-to-r from-black via-gray-800 to-black rounded">
                {/* This is just a visual representation of a barcode */}
                <div className="flex h-full">
                  {Array.from({ length: 30 }).map((_, i) => (
                    <div 
                      key={i} 
                      className="h-full" 
                      style={{ 
                        width: `${Math.random() * 3 + 1}px`, 
                        backgroundColor: i % 2 ? 'white' : 'transparent',
                        marginLeft: `${Math.random() * 3}px`
                      }} 
                    />
                  ))}
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {t('dummy_ticket_notice')}
              </p>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="bg-gray-50 p-4 rounded-b-lg border-t border-gray-200">
          <div className="text-xs text-gray-500 text-center">
            <p>{t('ticket_disclaimer')}</p>
            <p className="mt-1">
              © {new Date().getFullYear()} FastDummyTicket - {t('not_valid_for_travel')}
            </p>
          </div>
        </div>
      </div>
      
      {/* Action Buttons (outside of PDF content) */}
      <div className="p-4 flex flex-col sm:flex-row gap-4 justify-center border-t border-gray-200">
        <Button
          onClick={generatePDF}
          className="bg-primary text-white flex items-center"
        >
          <Download className="mr-2 h-4 w-4" />
          {t('download_ticket')}
        </Button>
        
        <Button
          variant="outline"
          onClick={handlePrint}
          className="flex items-center"
        >
          <Printer className="mr-2 h-4 w-4" />
          {t('print_ticket')}
        </Button>
      </div>
    </div>
  );
};

export default FlightTicket;