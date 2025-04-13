import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { Flight } from '@shared/schema';

interface FlightResultsProps {
  flights: Flight[];
  isLoading: boolean;
  onSelectFlight: (flight: Flight) => void;
}

const FlightResults = ({ flights, isLoading, onSelectFlight }: FlightResultsProps) => {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4" />
        <p className="text-gray-600">{t('flights_loading')}</p>
      </div>
    );
  }

  if (flights.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No flights found</h3>
          <p className="text-gray-600">Try adjusting your search criteria</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {flights.map((flight) => (
        <div 
          key={`${flight.airlineCode}${flight.flightNumber}-${flight.id}`}
          className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition"
        >
          <div className="p-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              {/* Airline Info */}
              <div className="flex items-center mb-4 md:mb-0">
                <img 
                  src={`https://logo.clearbit.com/${flight.airlineName.toLowerCase().replace(/\s+/g, '')}.com`} 
                  alt={flight.airlineName} 
                  className="h-8 w-8 mr-3"
                  onError={(e) => {
                    // Fallback if airline logo not found
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/32?text=✈';
                  }}
                />
                <div>
                  <div className="font-medium">{flight.airlineName}</div>
                  <div className="text-sm text-gray-500">{flight.flightNumber}</div>
                </div>
              </div>
              
              {/* Flight Details */}
              <div className="flex flex-col md:flex-row md:items-center">
                {/* Departure */}
                <div className="text-center mb-3 md:mb-0 md:mr-8">
                  <div className="font-semibold">{flight.departureTime}</div>
                  <div className="text-sm text-gray-500">{flight.departureAirport}</div>
                  <div className="text-xs text-gray-600">{flight.departureCity}</div>
                </div>
                
                {/* Flight Duration */}
                <div className="flex flex-col items-center mb-3 md:mb-0 md:mx-4">
                  <div className="text-xs text-gray-500">{flight.duration}</div>
                  <div className="relative w-20 h-px bg-gray-300 my-1">
                    <div className="absolute top-1/2 right-0 transform -translate-y-1/2 w-2 h-2 border-t-2 border-r-2 border-gray-300 rotate-45"></div>
                  </div>
                  <div className="text-xs text-gray-500">{t('flight_direct')}</div>
                </div>
                
                {/* Arrival */}
                <div className="text-center mb-3 md:mb-0 md:mr-8">
                  <div className="font-semibold">{flight.arrivalTime}</div>
                  <div className="text-sm text-gray-500">{flight.arrivalAirport}</div>
                  <div className="text-xs text-gray-600">{flight.arrivalCity}</div>
                </div>
              </div>
            </div>
            
            {/* Price and Select Button */}
            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
              <div>
                <span className="text-2xl font-semibold text-primary">${flight.basePrice}</span>
                <span className="text-gray-500 text-sm ml-1">{t('flight_price')}</span>
              </div>
              <Button 
                onClick={() => onSelectFlight(flight)}
                className="bg-primary text-white hover:bg-primary/90"
              >
                {t('flight_select')}
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FlightResults;
