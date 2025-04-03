import { useTranslation } from "@/hooks/use-translation";
import { useEffect, useState } from "react";
import { Flight } from "@shared/schema";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FlightResultsProps {
  flights: Flight[] | undefined;
  isLoading: boolean;
  onSelectFlight: (flight: Flight) => void;
}

const FlightResults = ({ flights, isLoading, onSelectFlight }: FlightResultsProps) => {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  // Show with animation when flights are loaded
  useEffect(() => {
    if (flights && flights.length > 0) {
      setVisible(true);
    }
  }, [flights]);

  return (
    <section id="flight-results" className={`py-12 bg-white ${visible ? 'block' : 'hidden'}`}>
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-heading font-semibold text-2xl">{t("results.title")}</h2>
            <div className="text-sm text-gray-600">
              <i className="fas fa-filter mr-1"></i> {t("results.filter")}
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="text-gray-600">{t("results.loading")}</p>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && (!flights || flights.length === 0) && (
            <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
              <h3 className="text-lg font-medium mb-2">No flights found</h3>
              <p className="text-gray-600">Try changing your search criteria</p>
            </div>
          )}

          {/* Results List */}
          {!isLoading && flights && flights.length > 0 && (
            <div className="space-y-4">
              {flights.map((flight) => (
                <div
                  key={flight.id}
                  className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition"
                >
                  <div className="p-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      {/* Airline Info */}
                      <div className="flex items-center mb-4 md:mb-0">
                        <div className="h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center text-primary mr-3">
                          <span className="text-xs font-bold">{flight.airline.substring(0, 2)}</span>
                        </div>
                        <div>
                          <div className="font-medium">{flight.airline}</div>
                          <div className="text-sm text-gray-500">{flight.flightNumber}</div>
                        </div>
                      </div>

                      {/* Flight Details */}
                      <div className="flex flex-col md:flex-row md:items-center">
                        {/* Departure */}
                        <div className="text-center mb-3 md:mb-0 md:mr-8">
                          <div className="font-semibold">{flight.departureTime}</div>
                          <div className="text-sm text-gray-500">
                            {flight.originAirport?.iataCode}
                          </div>
                        </div>

                        {/* Flight Duration */}
                        <div className="flex flex-col items-center mb-3 md:mb-0 md:mx-4">
                          <div className="text-xs text-gray-500">{flight.duration}</div>
                          <div className="relative w-20 h-px bg-gray-300 my-1">
                            <div className="absolute top-1/2 right-0 transform -translate-y-1/2 w-2 h-2 border-t-2 border-r-2 border-gray-300 rotate-45"></div>
                          </div>
                          <div className="text-xs text-gray-500">
                            {flight.isDirectFlight ? t("results.direct") : "1 Stop"}
                          </div>
                        </div>

                        {/* Arrival */}
                        <div className="text-center mb-3 md:mb-0 md:mr-8">
                          <div className="font-semibold">{flight.arrivalTime}</div>
                          <div className="text-sm text-gray-500">
                            {flight.destinationAirport?.iataCode}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Price and Select Button */}
                    <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                      <div>
                        <span className="text-2xl font-semibold text-primary">${flight.price.toFixed(2)}</span>
                        <span className="text-gray-500 text-sm ml-1">{t("results.basePrice")}</span>
                      </div>
                      <Button
                        onClick={() => onSelectFlight(flight)}
                        className="bg-primary text-white px-4 py-2 rounded font-medium hover:bg-primary-600 transition"
                      >
                        {t("results.select")}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default FlightResults;
