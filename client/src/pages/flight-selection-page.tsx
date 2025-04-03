import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useBooking } from '@/context/booking-context';
import FlightResults from '@/components/ui/flight-results';
import FlightOptions from '@/components/ui/flight-options';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { Flight } from '@shared/schema';

const FlightSelectionPage = () => {
  const { t } = useTranslation();
  const [, navigate] = useLocation();
  const { 
    bookingData, 
    setSelectedFlight, 
    setOptions, 
    setTotalPrice 
  } = useBooking();
  
  const [showOptions, setShowOptions] = useState(false);
  const [selectedFlight, setSelectedFlightLocal] = useState<Flight | null>(null);
  
  // Redirect to search page if no search params
  useEffect(() => {
    if (!bookingData.searchParams) {
      navigate('/search');
    }
  }, [bookingData.searchParams, navigate]);
  
  // Flight search query
  const {
    data: flightResults,
    isLoading,
    isError,
    error
  } = useQuery<{ outbound: Flight[], return?: Flight[] }>({
    queryKey: ['/api/flights/search'],
    queryFn: async () => {
      if (!bookingData.searchParams) {
        throw new Error('No search parameters');
      }
      
      const res = await apiRequest('POST', '/api/flights/search', bookingData.searchParams);
      return res.json();
    },
    enabled: !!bookingData.searchParams,
  });
  
  // Handle flight selection
  const handleSelectFlight = (flight: Flight) => {
    setSelectedFlightLocal(flight);
    setSelectedFlight(flight);
    setShowOptions(true);
  };
  
  // Handle change flight button
  const handleChangeFlight = () => {
    setShowOptions(false);
    setSelectedFlightLocal(null);
  };
  
  // Handle options selection and continue to passenger info
  const handleContinueWithOptions = (
    options: {
      expressProcessing: boolean;
      editableTicket: boolean;
      hotelReservation: boolean;
      insuranceLetter: boolean;
    },
    totalPrice: number
  ) => {
    setOptions(options);
    setTotalPrice(totalPrice);
    navigate('/passenger');
  };
  
  // If there's an error loading flights
  if (isError) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error loading flights</h2>
          <p className="text-gray-600 mb-6">{error instanceof Error ? error.message : 'An unknown error occurred'}</p>
          <Button onClick={() => navigate('/search')}>
            Return to Search
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {!showOptions ? (
            // Show flight results
            <>
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-heading font-semibold text-2xl">{t('flights_title')}</h2>
                {/* <div className="text-sm text-gray-600">
                  <i className="fas fa-filter mr-1"></i> {t('flights_filter')}
                </div> */}
              </div>
              
              {/* Display the search parameters */}
              {bookingData.searchParams && (
                <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="font-medium">
                      {bookingData.searchParams.departureAirport} → {bookingData.searchParams.arrivalAirport}
                    </div>
                    <div>
                      {bookingData.searchParams.departureDate}
                      {bookingData.searchParams.returnDate && ` - ${bookingData.searchParams.returnDate}`}
                    </div>
                    <div>
                      {bookingData.searchParams.passengers} {bookingData.searchParams.passengers === 1 
                        ? t('passenger_singular') 
                        : t('passengers_plural')}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Flight Results List */}
              <FlightResults 
                flights={flightResults?.outbound || []}
                isLoading={isLoading}
                onSelectFlight={handleSelectFlight}
              />
            </>
          ) : (
            // Show options for selected flight
            selectedFlight && (
              <FlightOptions 
                selectedFlight={selectedFlight}
                onChangeFlight={handleChangeFlight}
                onContinue={handleContinueWithOptions}
              />
            )
          )}
        </div>
      </div>
    </section>
  );
};

export default FlightSelectionPage;
