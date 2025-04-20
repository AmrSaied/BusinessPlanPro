import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
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
import { useToast } from '@/hooks/use-toast';

interface ConfirmationPageProps {
  bookingId?: string;
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
  departureDate: string;
  status: string;
  issueDate: string;
  travelPurpose: string;
}

const ConfirmationPage = ({ bookingId }: ConfirmationPageProps) => {
  const { t } = useTranslation();
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const { bookingData, resetBookingData } = useBooking();
  const [retrievedBookingId, setRetrievedBookingId] = useState<string | null>(bookingId || null);
  const [isCheckingSession, setIsCheckingSession] = useState(false);
  
  // Extract session_id or booking_id from URL if present
  useEffect(() => {
    // Parse query parameters from location.search
    const searchParams = new URLSearchParams(window.location.search);
    const sessionId = searchParams.get('session_id');
    const urlBookingId = searchParams.get('booking_id'); // Try to get booking_id directly
    
    console.log('Confirmation page loaded with:', { 
      sessionId, 
      bookingId,
      urlBookingId,
      retrievedBookingId,
      locationSearch: location.search,
      fullUrl: window.location.href
    });
    
    // DIRECT BOOKING ID: If we have a booking_id in the URL, use it directly
    if (urlBookingId && !retrievedBookingId) {
      console.log('Using booking ID directly from URL:', urlBookingId);
      setRetrievedBookingId(urlBookingId);
      toast({
        title: t('payment.success'),
        description: t('payment.completedSuccessfully'),
      });
      return;
    }
    
    // EXTRACT FROM TEST SESSION: If the session ID is a test one, we can parse the booking ID from it
    if (sessionId && sessionId.startsWith('test_session_') && !retrievedBookingId) {
      const parts = sessionId.split('_');
      if (parts.length > 3) {
        const parsedBookingId = parts[3];
        console.log('Extracted booking ID from test session:', parsedBookingId);
        setRetrievedBookingId(parsedBookingId);
        toast({
          title: t('payment.success'),
          description: t('payment.completedSuccessfully'),
        });
        return;
      }
    }
    
    // SESSION ID APPROACH: If we have a session_id but no retrievedBookingId, retrieve the booking details from the session
    if (sessionId && !retrievedBookingId) {
      setIsCheckingSession(true);
      
      const getBookingFromSession = async () => {
        try {
          console.log('Fetching booking from session ID:', sessionId);
          
          // Include the booking_id in the query if available for extra reliability
          const sessionEndpoint = urlBookingId 
            ? `/api/stripe/session/${sessionId}?booking_id=${urlBookingId}`
            : `/api/stripe/session/${sessionId}`;
            
          console.log('Calling endpoint:', sessionEndpoint);
          
          const response = await apiRequest('GET', sessionEndpoint);
          
          console.log('Session endpoint response:', { 
            status: response.status, 
            ok: response.ok 
          });
          
          if (!response.ok) {
            // If we have a URL booking ID, use it as fallback even if the session check fails
            if (urlBookingId) {
              console.log('Session check failed but using URL booking ID as fallback:', urlBookingId);
              setRetrievedBookingId(urlBookingId);
              toast({
                title: t('payment.success'),
                description: t('payment.completedSuccessfully'),
              });
              return;
            }
            
            throw new Error('Failed to retrieve booking from session');
          }
          
          const data = await response.json();
          console.log('Session data received:', data);
          
          if (data.bookingId) {
            console.log('Setting retrievedBookingId to:', data.bookingId.toString());
            
            setRetrievedBookingId(data.bookingId.toString());
            toast({
              title: t('payment.success'),
              description: t('payment.completedSuccessfully'),
            });
          } else if (urlBookingId) {
            // Fallback again to URL booking ID if session doesn't return booking ID
            console.log('Session check succeeded but no booking ID returned, using URL booking ID as fallback:', urlBookingId);
            setRetrievedBookingId(urlBookingId);
            toast({
              title: t('payment.success'),
              description: t('payment.completedSuccessfully'),
            });
          } else {
            throw new Error('No booking ID associated with this session');
          }
        } catch (error) {
          console.error('Error retrieving booking from session:', error);
          
          // Final fallback - if all else fails but we have a URL booking ID
          if (urlBookingId) {
            console.log('Session check error but using URL booking ID as final fallback:', urlBookingId);
            setRetrievedBookingId(urlBookingId);
            toast({
              title: t('payment.success'),
              description: t('payment.completedWithWarnings'),
            });
            return;
          }
          
          toast({
            title: t('payment.error.title'),
            description: error instanceof Error ? error.message : t('payment.error.general'),
            variant: "destructive"
          });
        } finally {
          setIsCheckingSession(false);
        }
      };
      
      getBookingFromSession();
    }
  }, [location, retrievedBookingId, bookingId, toast, t]);
  
  // Get ticket data once we have a booking ID
  const {
    data: ticketData,
    isLoading,
    isError,
    error
  } = useQuery<TicketData>({
    queryKey: [`/api/bookings/${retrievedBookingId}/ticket`],
    enabled: !!retrievedBookingId,
    retry: 3,
    retryDelay: 1500,
    refetchOnWindowFocus: false,
    staleTime: Infinity 
  });
  
  // Handle ticket download
  const handleDownloadTicket = () => {
    if (!ticketData || !retrievedBookingId) return;
    
    try {
      // Directly use the bookingId from props - this is the actual numeric booking ID
      const numericBookingId = parseInt(retrievedBookingId);
      
      if (isNaN(numericBookingId)) {
        throw new Error('Invalid booking ID');
      }
      
      // Open the PDF download endpoint in a new tab/window
      const downloadUrl = `/api/bookings/${numericBookingId}/ticket/download`;
      console.log('Opening download URL:', downloadUrl);
      window.open(downloadUrl, '_blank');
    } catch (error) {
      console.error('Error downloading ticket:', error);
      
      // Fallback to client-side PDF generation (in a production app)
      toast({
        title: t('ticket.downloadError'),
        description: t('ticket.tryAgainOrContactSupport'),
        variant: "destructive"
      });
    }
  };
  
  // Handle ticket printing
  const handlePrintTicket = () => {
    if (!ticketData) return;
    
    try {
      // Create a hidden iframe for printing
      const printIframe = document.createElement('iframe');
      printIframe.style.position = 'absolute';
      printIframe.style.top = '-9999px';
      printIframe.style.left = '-9999px';
      printIframe.style.width = '0';
      printIframe.style.height = '0';
      document.body.appendChild(printIframe);
      
      // Generate the printable content
      const printableContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Flight Ticket - ${ticketData.bookingReference}</title>
            <style>
              @media print {
                @page {
                  size: A4;
                  margin: 10mm;
                }
                body {
                  -webkit-print-color-adjust: exact !important;
                  print-color-adjust: exact !important;
                }
              }
              body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
              .ticket { border: 1px solid #ccc; padding: 20px; max-width: 800px; margin: 0 auto; }
              .header { display: flex; justify-content: space-between; margin-bottom: 20px; }
              .flight-info { margin-bottom: 20px; }
              .passenger-info { margin-bottom: 20px; }
              .footer { margin-top: 20px; font-size: 0.8em; color: #666; }
              h1, h2 { color: #333; }
              .logo { font-weight: bold; font-size: 1.5em; }
              table { width: 100%; border-collapse: collapse; }
              table, th, td { border: 1px solid #ddd; }
              th, td { padding: 8px; text-align: left; }
              th { background-color: #f8f8f8; }
            </style>
          </head>
          <body>
            <div class="ticket">
              <div class="header">
                <div class="logo">${ticketData.flight.airlineName} (${ticketData.flight.airlineCode})</div>
                <div>
                  <strong>Booking Reference:</strong> ${ticketData.bookingReference}<br>
                  <strong>Ticket Number:</strong> ${ticketData.ticketNumber}
                </div>
              </div>
              
              <div class="flight-info">
                <h2>Flight Details</h2>
                <table>
                  <tr>
                    <th>Flight</th>
                    <th>From</th>
                    <th>To</th>
                    <th>Date</th>
                    <th>Departure</th>
                    <th>Arrival</th>
                  </tr>
                  <tr>
                    <td>${ticketData.flight.airlineCode}${ticketData.flight.flightNumber}</td>
                    <td>${ticketData.flight.departureAirport}<br>${ticketData.flight.departureCity}</td>
                    <td>${ticketData.flight.arrivalAirport}<br>${ticketData.flight.arrivalCity}</td>
                    <td>${new Date(ticketData.departureDate).toLocaleDateString()}</td>
                    <td>${ticketData.flight.departureTime}</td>
                    <td>${ticketData.flight.arrivalTime}</td>
                  </tr>
                </table>
              </div>
              
              <div class="passenger-info">
                <h2>Passenger Information</h2>
                <table>
                  <tr>
                    <th>Name</th>
                    <th>Nationality</th>
                    <th>Passport</th>
                  </tr>
                  ${ticketData.passengers.map(p => `
                    <tr>
                      <td>${p.title || ''} ${p.firstName} ${p.lastName}</td>
                      <td>${p.nationality}</td>
                      <td>${p.passportNumber}</td>
                    </tr>
                  `).join('')}
                </table>
              </div>
              
              <div class="ticket-options">
                <h2>Additional Services</h2>
                <ul>
                  ${ticketData.ticketOptions.expressProcessing ? '<li>Express Processing</li>' : ''}
                  ${ticketData.ticketOptions.editableTicket ? '<li>Editable Ticket</li>' : ''}
                  ${ticketData.ticketOptions.hotelReservation ? '<li>Hotel Reservation</li>' : ''}
                  ${ticketData.ticketOptions.insuranceLetter ? '<li>Insurance Letter</li>' : ''}
                </ul>
              </div>
              
              <div class="footer">
                <p>
                  <strong>Contact:</strong> Email: ${ticketData.contactEmail} | Phone: ${ticketData.contactPhone}<br>
                  <strong>Status:</strong> ${ticketData.status.toUpperCase()} | <strong>Issue Date:</strong> ${new Date(ticketData.issueDate).toLocaleDateString()}<br>
                  <strong>Purpose of Travel:</strong> ${ticketData.travelPurpose}
                </p>
                <p>
                  <strong>Total Price:</strong> ${ticketData.totalPrice} ${ticketData.currency}
                </p>
              </div>
            </div>
          </body>
        </html>
      `;

      // Write content to the iframe
      const iframeDocument = printIframe.contentDocument || printIframe.contentWindow?.document;
      if (!iframeDocument) {
        throw new Error('Could not access iframe document');
      }
      
      iframeDocument.open();
      iframeDocument.write(printableContent);
      iframeDocument.close();
      
      // Wait for content to load before printing
      setTimeout(() => {
        try {
          // Focus and print the iframe
          printIframe.contentWindow?.focus();
          printIframe.contentWindow?.print();
          
          // Remove the iframe after printing (or after a delay)
          setTimeout(() => {
            document.body.removeChild(printIframe);
          }, 1000);
        } catch (e) {
          console.error('Print operation failed:', e);
          document.body.removeChild(printIframe);
          alert('Could not open print dialog. Please try downloading the ticket instead.');
        }
      }, 500);
            
    } catch (error) {
      console.error('Error preparing ticket for print:', error);
      alert('Print preparation failed. Try downloading the ticket instead.');
    }
  };
  
  // Handle booking another ticket
  const handleBookAnother = () => {
    resetBookingData();
    navigate('/search');
  };
  
  // Show loading when checking Stripe session
  if (isCheckingSession) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-white rounded-lg shadow p-8">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
            <h2 className="text-xl font-medium text-gray-800">{t('payment.processingPayment')}</h2>
            <p className="text-gray-600 mt-2">{t('payment.pleaseWait')}</p>
          </div>
        </div>
      </div>
    );
  }
  
  // If no retrievedBookingId or error
  if (!retrievedBookingId || isError) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-white rounded-lg shadow p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              {!retrievedBookingId ? t('booking.notFound') : t('booking.errorLoading')}
            </h2>
            <p className="text-gray-600 mb-6">
              {isError && error instanceof Error ? error.message : t('booking.tryAgainOrContactSupport')}
            </p>
            <Button onClick={() => navigate('/search')}>
              {t('booking.goToFlightSearch')}
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
                    
                    <div className="flex justify-center">
                      <Button
                        variant="outline"
                        onClick={handlePrintTicket}
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
