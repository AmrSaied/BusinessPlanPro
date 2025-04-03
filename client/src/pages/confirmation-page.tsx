import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useBooking } from '@/context/booking-context';
import { Button } from '@/components/ui/button';
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
  } = useQuery({
    queryKey: [`/api/bookings/${bookingId}/ticket`],
    enabled: !!bookingId,
  });
  
  // PDF download simulation (in a real app, this would generate a PDF)
  const handleDownloadTicket = () => {
    // Simulate download delay
    const downloadStarted = new Date().toISOString();
    console.log(`Download started at: ${downloadStarted}`);
    
    // In a real app, this would be an actual download
    setTimeout(() => {
      console.log(`Download from ${downloadStarted} completed`);
      alert('Ticket downloaded successfully. In a real app, this would be a PDF file.');
    }, 2000);
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
              
              {/* Booking Details */}
              {ticketData && (
                <div className="bg-white rounded-lg shadow-lg p-8">
                  <h2 className="font-heading text-2xl font-semibold mb-6">
                    {t('booking_details')}
                  </h2>
                  
                  {/* Flight Details */}
                  <div className="border-b border-gray-200 pb-6 mb-6">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center">
                        <div className="mr-4">
                          <img 
                            src={`https://logo.clearbit.com/${ticketData.flight.airlineName.toLowerCase().replace(/\s+/g, '')}.com`} 
                            alt={ticketData.flight.airlineName} 
                            className="h-10 w-10"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/40?text=✈';
                            }}
                          />
                        </div>
                        <div>
                          <div className="font-medium text-lg">
                            {ticketData.flight.airlineName} {ticketData.flight.flightNumber}
                          </div>
                          <div className="text-gray-600">
                            {new Date().toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                          {ticketData.status === 'confirmed' ? 'Confirmed' : ticketData.status}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col md:flex-row justify-between mt-6">
                      <div className="text-center mb-4 md:mb-0">
                        <div className="text-gray-600 text-sm">Departure</div>
                        <div className="font-medium text-lg">{ticketData.flight.departureTime}</div>
                        <div className="font-bold">{ticketData.flight.departureAirport}</div>
                        <div className="text-sm text-gray-600">{ticketData.flight.departureCity}</div>
                      </div>
                      
                      <div className="flex flex-col items-center mb-4 md:mb-0">
                        <div className="text-gray-600 text-sm">{ticketData.flight.duration}</div>
                        <div className="relative w-20 md:w-40 h-px bg-gray-300 my-2">
                          <div className="absolute top-1/2 right-0 transform -translate-y-1/2 w-2 h-2 border-t-2 border-r-2 border-gray-300 rotate-45"></div>
                        </div>
                        <div className="text-xs text-gray-600">Direct</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-gray-600 text-sm">Arrival</div>
                        <div className="font-medium text-lg">{ticketData.flight.arrivalTime}</div>
                        <div className="font-bold">{ticketData.flight.arrivalAirport}</div>
                        <div className="text-sm text-gray-600">{ticketData.flight.arrivalCity}</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Passenger Details */}
                  <div className="border-b border-gray-200 pb-6 mb-6">
                    <h3 className="font-medium text-lg mb-4">Passenger Information</h3>
                    
                    {ticketData.passengers.map((passenger: any, index: number) => (
                      <div key={index} className="mb-4 last:mb-0">
                        <div className="font-medium">
                          {passenger.title}. {passenger.firstName} {passenger.lastName}
                        </div>
                        <div className="text-sm text-gray-600">
                          Passport: {passenger.passportNumber} | Nationality: {passenger.nationality}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Price Details */}
                  <div>
                    <h3 className="font-medium text-lg mb-4">Price Details</h3>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Base Fare</span>
                        <span>${(ticketData.totalPrice * 0.7).toFixed(2)}</span>
                      </div>
                      
                      {ticketData.ticketOptions.expressProcessing && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Express Processing</span>
                          <span>$5.00</span>
                        </div>
                      )}
                      
                      {ticketData.ticketOptions.editableTicket && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Editable Ticket</span>
                          <span>$8.00</span>
                        </div>
                      )}
                      
                      {ticketData.ticketOptions.hotelReservation && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Hotel Reservation</span>
                          <span>$15.00</span>
                        </div>
                      )}
                      
                      {ticketData.ticketOptions.insuranceLetter && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Insurance Letter</span>
                          <span>$10.00</span>
                        </div>
                      )}
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600">Taxes & Fees</span>
                        <span>${(ticketData.totalPrice * 0.3).toFixed(2)}</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between border-t border-gray-200 pt-4 font-bold">
                      <span>Total</span>
                      <span className="text-primary">${ticketData.totalPrice.toFixed(2)} {ticketData.currency}</span>
                    </div>
                  </div>
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
