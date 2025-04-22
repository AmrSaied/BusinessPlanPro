import { useState, useEffect } from "react";
import { useTranslation } from "@/hooks/use-translation";
import { Button } from "@/components/ui/button";
import { Flight, AdditionalService } from "@shared/schema";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";

interface FlightOptionsProps {
  selectedFlight: Flight | null;
  onChangeFlight: () => void;
  onContinue: (options: BookingOptions) => void;
}

export interface BookingOptions {
  // Removed expressProcessing and editableTicket as per requirement
  expressProcessing: boolean; // Keeping for backward compatibility
  editableTicket: boolean;    // Keeping for backward compatibility
  hotelReservation: boolean;
  insuranceLetter: boolean;
}

const FlightOptions = ({
  selectedFlight,
  onChangeFlight,
  onContinue,
}: FlightOptionsProps) => {
  const { t } = useTranslation();
  const [selectedServices, setSelectedServices] = useState<Record<number, boolean>>({});
  const [totalPrice, setTotalPrice] = useState(selectedFlight?.price || 12);
  const [visible, setVisible] = useState(false);
  
  // Fetch additional services from the API
  const { data: services, isLoading } = useQuery<AdditionalService[]>({
    queryKey: ["/api/services"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!selectedFlight
  });

  // Calculate total price when selected services change
  useEffect(() => {
    let price = selectedFlight?.price || 12;
    
    // Add price of selected services
    if (services && selectedServices) {
      services.forEach(service => {
        if (selectedServices[service.id]) {
          price += service.price;
        }
      });
    }
    
    setTotalPrice(price);
  }, [selectedServices, selectedFlight, services]);

  // Show with animation when flight is selected
  useEffect(() => {
    if (selectedFlight) {
      setVisible(true);
    }
  }, [selectedFlight]);

  // Handle service selection toggle
  const handleServiceChange = (serviceId: number) => {
    setSelectedServices(prev => ({
      ...prev,
      [serviceId]: !prev[serviceId]
    }));
  };

  // Convert selected services to booking options for backwards compatibility
  const handleContinue = () => {
    // Create a map from service type to boolean
    const serviceTypeMap: Record<string, boolean> = {};
    
    if (services) {
      services.forEach(service => {
        if (selectedServices[service.id]) {
          serviceTypeMap[service.type] = true;
        }
      });
    }
    
    // Convert to BookingOptions format for backward compatibility
    const options: BookingOptions = {
      expressProcessing: false, // Removed per requirements, keeping for compatibility
      editableTicket: false,    // Removed per requirements, keeping for compatibility
      hotelReservation: serviceTypeMap["hotel"] || false,
      insuranceLetter: serviceTypeMap["insurance"] || false,
    };
    
    onContinue(options);
  };

  // Format the date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    // Just append year for display purposes
    return `${dateString}, 2023`;
  };

  if (!selectedFlight) return null;
  
  if (isLoading) {
    return (
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading services...</span>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="flight-options"
      className={`py-12 bg-white ${visible ? "block" : "hidden"}`}
    >
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h2 className="font-heading font-semibold text-2xl mb-2">
              {t("options.title")}
            </h2>
            <p className="text-gray-600">{t("options.subtitle")}</p>
          </div>

          {/* Selected Flight Summary */}
          <div className="bg-primary-50 rounded-lg p-4 mb-6 border border-primary-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center text-primary mr-3">
                  <span className="text-xs font-bold">
                    {selectedFlight.airlineCode.substring(0, 2)}
                  </span>
                </div>
                <div>
                  <div className="font-medium">
                    {selectedFlight.airlineName} {selectedFlight.flightNumber}
                  </div>
                  <div className="text-sm text-gray-500">
                    {selectedFlight.departureAirport} →{" "}
                    {selectedFlight.arrivalAirport} |{" "}
                    {/* Use date from departureTime if needed */}
                    {formatDate(new Date().toISOString().split('T')[0])} |{" "}
                    {selectedFlight.departureTime} - {selectedFlight.arrivalTime}
                  </div>
                </div>
              </div>
              <Button
                variant="link"
                className="text-primary-600 text-sm font-medium"
                onClick={onChangeFlight}
              >
                {t("options.changeFlight")}
              </Button>
            </div>
          </div>

          {/* Options Selection */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden mb-6">
            <div className="p-5 border-b border-gray-200">
              <h3 className="font-heading font-semibold text-xl text-primary">
                {t("options.additionalServices")}
              </h3>
            </div>

            <div className="divide-y divide-gray-200">
              {/* Base Ticket */}
              <div className="p-5 flex justify-between items-center">
                <div>
                  <div className="font-medium">{t("options.basic")}</div>
                  <div className="text-sm text-gray-600">
                    Verifiable PNR code, airline formatted
                  </div>
                </div>
                <div className="font-semibold text-primary">
                  ${selectedFlight.price?.toFixed(2) || "12.00"}
                </div>
              </div>

              {/* Dynamic Services from API */}
              {services && services.length > 0 ? (
                services.map(service => (
                  <div key={service.id} className="p-5 flex justify-between items-center">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <div className="font-medium">{service.name}</div>
                        {service.isRequired && (
                          <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full ml-2">
                            Required
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">
                        {service.description}
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="font-semibold text-gray-800 mr-4">+${service.price.toFixed(2)}</div>
                      <Checkbox
                        id={`service-${service.id}`}
                        checked={selectedServices[service.id] || false}
                        onCheckedChange={() => handleServiceChange(service.id)}
                        disabled={service.isRequired}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-5 text-center text-gray-500">
                  No additional services available
                </div>
              )}
            </div>
          </div>

          {/* Total and Continue */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-gray-50 p-5 rounded-lg">
            <div className="mb-4 md:mb-0">
              <div className="text-sm text-gray-600 mb-1">
                {t("options.totalPrice")}
              </div>
              <div className="text-2xl font-semibold text-primary">
                ${totalPrice.toFixed(2)}
              </div>
            </div>
            <Button
              onClick={handleContinue}
              className="bg-primary text-white px-6 py-3 rounded-md font-medium hover:bg-primary-600 transition"
            >
              {t("options.continue")}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FlightOptions;
