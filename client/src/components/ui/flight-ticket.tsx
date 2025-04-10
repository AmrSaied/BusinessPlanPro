import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from './button';
import { Plane, Calendar, Clock, Users, Download, Printer, MapPin, User, CreditCard, Phone, Mail, Briefcase } from 'lucide-react';
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
  travelPurpose,
  itinerary
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
  
  // Format date specific for the ticket (Thu, Dec 12, 2024)
  const formatTicketDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${dayNames[date.getDay()]}, ${monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
    } catch (e) {
      return dateString;
    }
  };
  
  // For direct PDF download from server
  const downloadPDF = () => {
    // Use bookingId from props if available, otherwise extract it from bookingReference
    // This assumes the bookingReference contains the ID or you have another way to get the bookingId
    // In a real app, you'd have the actual bookingId available
    // For this implementation, we're extracting a number from the reference if possible
    let bookingId: number;
    
    try {
      // Try to extract digits from bookingReference
      const matches = bookingReference.match(/\d+/);
      bookingId = matches ? parseInt(matches[0]) : 1; // Default to 1 if no digits found
    } catch (error) {
      console.error('Error parsing booking reference:', error);
      bookingId = 1; // Default fallback
    }
    
    // Open the PDF download endpoint in a new tab/window
    const downloadUrl = `/api/bookings/${bookingId}/ticket/download`;
    window.open(downloadUrl, '_blank');
  };
  
  // Generate PDF from ticket (client-side backup method)
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
      console.error('Error generating PDF client-side:', error);
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
      <div ref={ticketRef} className="ticket-container text-gray-900 rtl:text-right">
        {/* ViewTrip Header */}
        <div className="bg-[#006699] p-3 text-white">
          <div className="flex items-center rtl:justify-end">
            <span className="text-xl font-bold">ViewTrip</span>
          </div>
        </div>
        
        {/* My Trip Header */}
        <div className="p-3 border-b border-gray-300">
          <h1 className="text-xl font-medium">{t('my_trip')}</h1>
          <div className="flex items-center text-sm mt-1">
            <p className="text-sm">
              <span className="font-bold">
                {formatTicketDate(issueDate)} - {flight.departureCity} ({flight.departureAirport}) {t('to')} {flight.arrivalCity} ({flight.arrivalAirport}) - {t('confirmed')}
              </span>
              {status === 'confirmed' && 
                <svg className="inline-block h-4 w-4 ltr:ml-1 rtl:mr-1 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>}
            </p>
          </div>
        </div>
        
        {/* Main Ticket Content */}
        <div className="px-0">
          {/* Airline & Flight Information */}
          <div className="border-b border-gray-300">
            <div className="flex items-start p-3 rtl:flex-row-reverse">
              <div className="bg-gray-100 text-gray-800 font-bold h-10 w-10 flex items-center justify-center rounded-full border border-gray-300 ltr:mr-3 rtl:ml-3">
                {flight.airlineCode}
              </div>
              <div>
                <div className="font-bold">{flight.airlineName} ({flight.airlineCode}) {flight.flightNumber}</div>
                <div className="text-xs text-gray-600">{t('confirmation_number')}: {bookingReference}</div>
              </div>
            </div>
          </div>
          
          {/* Passengers Section */}
          <div className="border-b border-gray-300 p-3">
            <div className="font-bold uppercase text-xs mb-1">{t('passengers')}</div>
            {passengers.map((passenger, index) => (
              <div key={index} className="text-sm">
                {passenger.title}. {passenger.firstName} {passenger.lastName}
              </div>
            ))}
          </div>
          
          {/* Airport Info Section */}
          <div className="border-b border-gray-300 p-3">
            <div className="font-bold uppercase text-xs mb-1">{t('airport_info')}</div>
            <div className="text-sm mb-2">
              <div>{flight.departureCity} Int'l Apt ({flight.departureAirport})</div>
              {flight.departureTerminal && <div>{t('terminal')} {flight.departureTerminal}</div>}
            </div>
            
            <div className="text-sm mb-2">
              <span className="block font-bold">{t('to')}</span>
            </div>
            
            <div className="text-sm">
              <div>{flight.arrivalCity} Int'l Apt ({flight.arrivalAirport})</div>
              <div>{flight.arrivalCity}, {flight.arrivalCountry}</div>
              {flight.arrivalTerminal && <div>{t('terminal')} {flight.arrivalTerminal}</div>}
            </div>
          </div>
          
          {/* Flight Info Section */}
          <div className="border-b border-gray-300 p-3">
            <div className="font-bold uppercase text-xs mb-1">{t('flight_info')}</div>
            <div className="text-sm mb-1">
              <div>{flight.aircraft || 'Airbus A320-NEO'}</div>
            </div>
            
            <div className="text-sm">
              <div>{t('class_of_service')}: {t('economy')}</div>
            </div>
          </div>
          
          {/* Flight Times with Airplane Icon */}
          <div className="border-b border-gray-300 bg-gray-50 p-3">
            <div className="flex justify-between items-center">
              <div className="flex-1 rtl:text-right">
                <div className="uppercase text-sm font-bold">{t('depart')}</div>
                <div className="flex items-baseline rtl:justify-end">
                  {/* Extract time from flight.departureTime which should be in format like "5:30 PM" */}
                  {(() => {
                    const parts = flight.departureTime.split(' ');
                    if (parts.length >= 2) {
                      return (
                        <>
                          <div className="text-2xl font-bold ltr:mr-1 rtl:ml-1 mt-1">{parts[0]}</div>
                          <div className="text-sm uppercase">{parts[1]}</div>
                        </>
                      );
                    }
                    return <div className="text-2xl font-bold">{flight.departureTime}</div>;
                  })()}
                </div>
                <div className="text-xs">{flight.duration}</div>
              </div>
              
              <div className="mx-2">
                <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDIwSDJMMTAgMTBMNCA2TDYgNEwxMiA4TDE4IDRIMJMMTGGNI8gMTBMMjIgMjBIMTJaIiBmaWxsPSIjMDAwMDAwIi8+Cjwvc3ZnPgo=" className="w-6 h-6 rtl:transform rtl:rotate-180" alt="Airplane" />
              </div>
              
              <div className="flex-1 text-right rtl:text-left">
                <div className="uppercase text-sm font-bold">{t('arrive')}</div>
                <div className="flex items-baseline justify-end rtl:justify-start">
                  {/* Extract time from flight.arrivalTime which should be in format like "10:45 PM" */}
                  {(() => {
                    const parts = flight.arrivalTime.split(' ');
                    if (parts.length >= 2) {
                      return (
                        <>
                          <div className="text-2xl font-bold ltr:mr-1 rtl:ml-1 mt-1">{parts[0]}</div>
                          <div className="text-sm uppercase">{parts[1]}</div>
                        </>
                      );
                    }
                    return <div className="text-2xl font-bold">{flight.arrivalTime}</div>;
                  })()}
                </div>
                <div className="text-xs">+0</div>
              </div>
            </div>
          </div>
          
          {/* Additional Services & Options */}
          {(ticketOptions.expressProcessing || 
           ticketOptions.editableTicket || 
           ticketOptions.hotelReservation || 
           ticketOptions.insuranceLetter) && (
            <div className="mb-6">
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                {/* Services Header */}
                <div className="bg-blue-600 text-white p-3">
                  <div className="flex items-center rtl:flex-row-reverse rtl:justify-end">
                    <Briefcase className="h-5 w-5 ltr:mr-2 rtl:ml-2" />
                    <h3 className="font-bold text-lg">{t('additional_services')}</h3>
                  </div>
                </div>
                
                {/* Services Content */}
                <div className="p-4 bg-gradient-to-r from-blue-50 to-white rtl:bg-gradient-to-l">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {ticketOptions.expressProcessing && (
                      <div className="flex items-center p-3 bg-white rounded-md shadow-sm border border-gray-100 rtl:flex-row-reverse">
                        <div className="ltr:mr-3 rtl:ml-3 h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                          <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                        <div className="rtl:text-right">
                          <div className="font-medium">{t('express_processing')}</div>
                          <div className="text-sm text-gray-500">{t('premium_service')}</div>
                        </div>
                      </div>
                    )}
                    
                    {ticketOptions.editableTicket && (
                      <div className="flex items-center p-3 bg-white rounded-md shadow-sm border border-gray-100 rtl:flex-row-reverse">
                        <div className="ltr:mr-3 rtl:ml-3 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </div>
                        <div className="rtl:text-right">
                          <div className="font-medium">{t('editable_ticket')}</div>
                          <div className="text-sm text-gray-500">{t('flexible_changes')}</div>
                        </div>
                      </div>
                    )}
                    
                    {ticketOptions.hotelReservation && (
                      <div className="flex items-center p-3 bg-white rounded-md shadow-sm border border-gray-100 rtl:flex-row-reverse">
                        <div className="ltr:mr-3 rtl:ml-3 h-10 w-10 bg-yellow-100 rounded-full flex items-center justify-center">
                          <svg className="h-5 w-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                        <div className="rtl:text-right">
                          <div className="font-medium">{t('hotel_reservation')}</div>
                          <div className="text-sm text-gray-500">{t('accommodation_included')}</div>
                        </div>
                      </div>
                    )}
                    
                    {ticketOptions.insuranceLetter && (
                      <div className="flex items-center p-3 bg-white rounded-md shadow-sm border border-gray-100 rtl:flex-row-reverse">
                        <div className="ltr:mr-3 rtl:ml-3 h-10 w-10 bg-red-100 rounded-full flex items-center justify-center">
                          <svg className="h-5 w-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                        </div>
                        <div className="rtl:text-right">
                          <div className="font-medium">{t('insurance_letter')}</div>
                          <div className="text-sm text-gray-500">{t('travel_protection')}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Contact and Travel Info Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Contact Information */}
            <div>
              <div className="border border-gray-200 rounded-lg overflow-hidden h-full">
                {/* Contact Header */}
                <div className="bg-blue-600 text-white p-3">
                  <div className="flex items-center rtl:flex-row-reverse rtl:justify-end">
                    <Phone className="h-5 w-5 ltr:mr-2 rtl:ml-2" />
                    <h3 className="font-bold text-lg">{t('contact_information')}</h3>
                  </div>
                </div>
                
                {/* Contact Content */}
                <div className="p-4">
                  <div className="flex items-center mb-4 rtl:flex-row-reverse">
                    <div className="ltr:mr-3 rtl:ml-3 h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Mail className="h-4 w-4 text-blue-700" />
                    </div>
                    <div className="rtl:text-right">
                      <div className="text-xs text-gray-500 uppercase font-medium">{t('email')}</div>
                      <div className="font-medium">{contactEmail}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center rtl:flex-row-reverse">
                    <div className="ltr:mr-3 rtl:ml-3 h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Phone className="h-4 w-4 text-blue-700" />
                    </div>
                    <div className="rtl:text-right">
                      <div className="text-xs text-gray-500 uppercase font-medium">{t('phone')}</div>
                      <div className="font-medium">{contactPhone}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Travel Purpose */}
            <div>
              <div className="border border-gray-200 rounded-lg overflow-hidden h-full">
                {/* Travel Purpose Header */}
                <div className="bg-blue-600 text-white p-3">
                  <div className="flex items-center rtl:flex-row-reverse rtl:justify-end">
                    <MapPin className="h-5 w-5 ltr:mr-2 rtl:ml-2" />
                    <h3 className="font-bold text-lg">{t('travel_purpose')}</h3>
                  </div>
                </div>
                
                {/* Travel Purpose Content */}
                <div className="p-4">
                  <div className="flex items-center rtl:flex-row-reverse">
                    <div className="ltr:mr-3 rtl:ml-3 h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg className="h-4 w-4 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                    </div>
                    <div className="rtl:text-right">
                      <div className="text-xs text-gray-500 uppercase font-medium">{t('purpose')}</div>
                      <div className="font-medium">{travelPurpose === 'visa' ? t('visa_application') : travelPurpose}</div>
                    </div>
                  </div>
                  
                  <div className="mt-4 bg-yellow-50 p-3 rounded-md border border-yellow-100 text-sm text-yellow-800">
                    <div className="flex items-start rtl:flex-row-reverse">
                      <svg className="h-5 w-5 ltr:mr-2 rtl:ml-2 mt-0.5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="rtl:text-right">
                        {t('document_purpose_notice', {travelPurpose: travelPurpose})}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Barcode/QR section */}
          <div className="mt-6 border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-white rtl:bg-gradient-to-l p-6">
              <div className="flex flex-col md:flex-row items-center justify-between">
                <div className="mb-4 md:mb-0 ltr:md:mr-6 rtl:md:ml-6 text-center md:text-left rtl:md:text-right">
                  <div className="text-sm text-gray-500 mb-2">{t('boarding_pass')}</div>
                  <div className="font-bold text-lg">{flight.airlineName}</div>
                  <div className="text-lg font-mono">{flight.airlineCode}{flight.flightNumber}</div>
                  <div className="mt-2 flex flex-col md:items-start rtl:md:items-end items-center">
                    <div className="text-sm font-medium">{t('ticket_number')}:</div>
                    <div className="font-mono text-sm">{ticketNumber}</div>
                  </div>
                </div>
                
                <div className="flex flex-col items-center order-first md:order-none">
                  {/* Fake QR code */}
                  <div className="w-32 h-32 bg-white p-2 border border-gray-300 rounded-lg shadow-sm">
                    <div className="w-full h-full grid grid-cols-6 grid-rows-6 gap-1">
                      {Array.from({ length: 36 }).map((_, i) => (
                        <div 
                          key={i}
                          className={`${Math.random() > 0.7 ? 'bg-white' : 'bg-black'} ${
                            i === 0 || i === 5 || i === 30 || i === 35 ? 'bg-black' : ''
                          }`}
                        ></div>
                      ))}
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-gray-600 font-medium">{t('scan_for_boarding')}</div>
                </div>
                
                <div className="mt-4 md:mt-0 ltr:md:ml-6 rtl:md:mr-6 flex flex-col items-center ltr:md:items-end rtl:md:items-start">
                  <div className="mb-3 rtl:text-right">
                    <div className="text-sm text-gray-500">{t('booking_reference')}</div>
                    <div className="font-mono text-xl font-bold">{bookingReference}</div>
                  </div>
                  
                  {/* Barcode */}
                  <div className="h-14 w-48 bg-white p-1 border border-gray-300 rounded shadow-sm">
                    <div className="flex h-full">
                      {Array.from({ length: 30 }).map((_, i) => (
                        <div 
                          key={i} 
                          className="h-full" 
                          style={{ 
                            width: `${Math.random() * 3 + 1}px`, 
                            backgroundColor: i % 2 ? 'black' : 'white',
                            marginLeft: `${Math.random() * 2}px`
                          }} 
                        />
                      ))}
                    </div>
                  </div>
                  <div className="mt-1 text-xs text-gray-500 font-mono">{bookingReference}{flight.flightNumber}</div>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-dashed border-gray-300 text-center">
                <div className="inline-block bg-red-50 px-4 py-2 border border-red-200 rounded-md text-sm text-red-700">
                  <div className="flex items-center rtl:flex-row-reverse">
                    <svg className="h-5 w-5 ltr:mr-2 rtl:ml-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span className="font-medium">{t('dummy_ticket_notice')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="bg-gray-800 p-6 rounded-b-lg text-white">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0 rtl:flex-row-reverse">
              <Plane className="h-5 w-5 ltr:mr-2 rtl:ml-2 text-blue-400 rtl:transform rtl:rotate-180" />
              <div className="font-bold text-lg">{flight.airlineName}</div>
            </div>
            
            <div className="text-center ltr:md:text-right rtl:md:text-left">
              <div className="text-gray-300 text-sm">{t('ticket_disclaimer')}</div>
              <div className="text-gray-400 text-xs mt-1">
                © {new Date().getFullYear()} {t('global_air_travel')} - {t('not_valid_for_travel')}
              </div>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-700 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-gray-400 rtl:text-right">
            <div>
              <div className="text-gray-300 font-medium mb-1">{t('customer_support')}</div>
              <div>www.globalairtravel.com</div>
              <div>+1-800-AIR-TRVL</div>
            </div>
            
            <div>
              <div className="text-gray-300 font-medium mb-1">{t('legal')}</div>
              <div>{t('terms_conditions')}</div>
              <div>{t('privacy_policy')}</div>
            </div>
            
            <div>
              <div className="text-gray-300 font-medium mb-1">{t('disclaimer')}</div>
              <div>{t('not_valid_for_actual_travel')}</div>
              <div>{t('valid_for_visa_only')}</div>
            </div>
            
            <div>
              <div className="text-gray-300 font-medium mb-1">{t('issuer')}</div>
              <div>{t('global_air_travel_ltd')}</div>
              <div>123 {t('booking_street')}, {t('london')}</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Action Buttons (outside of PDF content) */}
      <div className="p-4 flex flex-col sm:flex-row gap-4 justify-center border-t border-gray-200">
        <Button
          onClick={downloadPDF}
          className="bg-primary text-white flex items-center"
        >
          <Download className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
          {t('download_ticket')}
        </Button>
        
        <Button
          variant="outline"
          onClick={handlePrint}
          className="flex items-center"
        >
          <Printer className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
          {t('print_ticket')}
        </Button>
      </div>
    </div>
  );
};

export default FlightTicket;