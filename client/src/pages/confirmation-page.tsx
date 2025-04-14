import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useBooking } from '@/context/booking-context';
import { Button } from '@/components/ui/button';
import FlightTicket from '@/components/ui/flight-ticket';
import { 
  Download, 
  Printer,
  Plus,
  ClipboardList,
  CheckCircle,
  Loader2 
} from 'lucide-react';

interface ConfirmationPageProps {
  bookingId: string;
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

interface Passenger {
  title: string;
  firstName: string;
  lastName: string;
  nationality: string;
  passportNumber: string;
}

interface TicketOptions {
  expressProcessing: boolean;
  editableTicket: boolean;
  hotelReservation: boolean;
  insuranceLetter: boolean;
}

interface TicketData {
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

const ConfirmationPage = ({ bookingId }: ConfirmationPageProps) => {
  const { t } = useTranslation();
  const [, navigate] = useLocation();
  const { bookingData, resetBookingData } = useBooking();
  
  // Get ticket data
  const {
    data: ticketData,
    isLoading,
    isError,
    error
  } = useQuery<TicketData>({
    queryKey: [`/api/bookings/${bookingId}/ticket`],
    enabled: !!bookingId,
  });
  
  // Handle ticket download
  const handleDownloadTicket = () => {
    if (!ticketData) return;
    
    // Use the client-side method from FlightTicket component
    try {
      // Get booking ID from reference
      const matches = ticketData.bookingReference.match(/\d+/);
      const bookingId = matches ? parseInt(matches[0]) : parseInt(bookingId);
      
      // Open the PDF download endpoint in a new tab/window
      const downloadUrl = `/api/bookings/${bookingId}/ticket/download`;
      window.open(downloadUrl, '_blank');
    } catch (error) {
      console.error('Error downloading ticket:', error);
      
      // Fallback to client-side PDF generation (in a production app)
      alert('Download link unavailable. Please try again or contact support.');
    }
  };
  
  // Handle booking another ticket
  const handleBookAnother = () => {
    resetBookingData();
    navigate('/search');
  };
  
  // If no bookingId or error
  if (!bookingId || isError) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-white rounded-lg shadow p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              {!bookingId ? 'No booking information found' : 'Error loading booking'}
            </h2>
            <p className="text-gray-600 mb-6">
              {isError && error instanceof Error ? error.message : 'Please try again or contact support.'}
            </p>
            <Button onClick={() => navigate('/search')}>
              Go to Flight Search
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {isLoading ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
              <h2 className="text-xl font-medium text-gray-800">Loading your booking details...</h2>
            </div>
          ) : (
            <>
              {/* Confirmation Header */}
              <div className="bg-white rounded-lg shadow-lg p-8 mb-6 text-center">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h1 className="font-heading text-3xl font-bold text-gray-800 mb-2">
                  {t('confirmation_title')}
                </h1>
                <p className="text-gray-600 mb-6">
                  {t('confirmation_subtitle')}
                </p>
                
                {ticketData && (
                  <div className="mb-6">
                    <div className="inline-block bg-gray-100 rounded-lg px-6 py-3 mb-4">
                      <div className="text-sm text-gray-600">{t('booking_reference')}</div>
                      <div className="text-2xl font-mono font-bold">{ticketData.bookingReference}</div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Button
                        onClick={handleDownloadTicket}
                        className="bg-primary text-white flex items-center"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        {t('download_ticket')}
                      </Button>
                      
                      <Button
                        variant="outline"
                        onClick={handleDownloadTicket}
                        className="flex items-center"
                      >
                        <Printer className="mr-2 h-4 w-4" />
                        {t('print_ticket')}
                      </Button>
                    </div>
                    
                    <p className="mt-4 text-sm text-gray-600">
                      {t('email_sent')} <span className="font-medium">{ticketData.contactEmail}</span>
                    </p>
                  </div>
                )}
                
                <div className="border-t border-gray-200 pt-6 mt-6">
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                      variant="outline"
                      onClick={handleBookAnother}
                      className="flex items-center"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      {t('book_another')}
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={() => navigate('/dashboard')}
                      className="flex items-center"
                    >
                      <ClipboardList className="mr-2 h-4 w-4" />
                      {t('view_bookings')}
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Flight Ticket */}
              {ticketData && (
                <div className="mb-8">
                  <FlightTicket
                    ticketNumber={ticketData.ticketNumber}
                    bookingReference={ticketData.bookingReference}
                    flight={ticketData.flight}
                    passengers={ticketData.passengers}
                    ticketOptions={ticketData.ticketOptions}
                    contactEmail={ticketData.contactEmail}
                    contactPhone={ticketData.contactPhone}
                    totalPrice={ticketData.totalPrice}
                    currency={ticketData.currency}
                    status={ticketData.status}
                    issueDate={ticketData.issueDate}
                    travelPurpose={ticketData.travelPurpose}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default ConfirmationPage;
