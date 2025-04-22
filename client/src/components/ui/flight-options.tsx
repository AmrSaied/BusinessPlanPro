import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Flight, AdditionalService } from '@shared/schema';
import { useState, useEffect } from 'react';
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";

interface FlightOptionsProps {
  selectedFlight: Flight;
  onChangeFlight: () => void;
  onContinue: (options: {
    expressProcessing: boolean;
    editableTicket: boolean;
    hotelReservation: boolean;
    insuranceLetter: boolean;
  }, totalPrice: number) => void;
}

const FlightOptions = ({ selectedFlight, onChangeFlight, onContinue }: FlightOptionsProps) => {
  const { t } = useTranslation();
  
  // Default options structure maintained for backward compatibility
  const [options, setOptions] = useState({
    expressProcessing: false,
    editableTicket: false,
    hotelReservation: false,
    insuranceLetter: false
  });
  
  const [totalPrice, setTotalPrice] = useState(selectedFlight.basePrice);
  const [selectedServices, setSelectedServices] = useState<Record<number, boolean>>({});
  
  // Fetch additional services from the API - this pulls from the admin-configured services
  const { data: services, isLoading, refetch } = useQuery<AdditionalService[]>({
    queryKey: ["/api/services"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    // These settings ensure fresh data on every component mount
    refetchOnMount: "always", // Always refetch on mount to get latest prices
    refetchOnWindowFocus: true, // Refetch when window gets focus
    staleTime: 0 // Always consider data stale to ensure fresh data
  });
  
  // Force refetch when component mounts to ensure latest data
  useEffect(() => {
    refetch();
    console.log("Fetching services from admin panel");
  }, [refetch]);
  
  // Handle service selection toggle for the admin-defined services
  const handleServiceChange = (serviceId: number, serviceType: string) => {
    setSelectedServices(prev => {
      const updated = {
        ...prev,
        [serviceId]: !prev[serviceId]
      };
      
      // Update the legacy options structure based on service type
      if (serviceType === 'hotel' || serviceType === 'other') {
        setOptions(prev => ({ ...prev, hotelReservation: updated[serviceId] }));
      } else if (serviceType === 'insurance') {
        setOptions(prev => ({ ...prev, insuranceLetter: updated[serviceId] }));
      }
      
      return updated;
    });
  };
  
  // Legacy handler - no longer used, but kept for type checking
  const handleOptionChange = (option: keyof typeof options) => {
    setOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  };
  
  // Update total price when options change
  useEffect(() => {
    let price = selectedFlight.basePrice;
    
    // Add price of selected services from admin panel
    if (services && Array.isArray(services)) {
      services.forEach((service: AdditionalService) => {
        if (selectedServices[service.id]) {
          price += service.price;
        }
      });
    }
    
    setTotalPrice(price);
  }, [selectedServices, selectedFlight.basePrice, services]);
  
  const handleContinue = () => {
    onContinue(options, totalPrice);
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-heading font-semibold text-2xl mb-2">{t('options_title')}</h2>
        <p className="text-gray-600">{t('options_subtitle')}</p>
      </div>
      
      {/* Selected Flight Summary */}
      <div className="bg-primary-50 rounded-lg p-4 mb-6 border border-primary-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <img 
              src={`https://logo.clearbit.com/${selectedFlight.airlineName.toLowerCase().replace(/\s+/g, '')}.com`} 
              alt={selectedFlight.airlineName} 
              className="h-8 w-8 mr-3"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/32?text=✈';
              }}
            />
            <div>
              <div className="font-medium">{selectedFlight.airlineName} {selectedFlight.flightNumber}</div>
              <div className="text-sm text-gray-500">
                {selectedFlight.departureAirport} → {selectedFlight.arrivalAirport} | {new Date().toLocaleDateString()} | {selectedFlight.departureTime} - {selectedFlight.arrivalTime}
              </div>
            </div>
          </div>
          <Button 
            variant="ghost" 
            className="text-primary-600 text-sm font-medium"
            onClick={onChangeFlight}
          >
            {t('option_change_flight')}
          </Button>
        </div>
      </div>
      
      {/* Options Selection */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden mb-6">
        <div className="p-5 border-b border-gray-200">
          <h3 className="font-heading font-semibold text-xl text-primary">{t('options_services_title')}</h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {/* Base Flight Price - Always included */}
          <div className="p-5 flex justify-between items-center bg-gray-50">
            <div>
              <div className="font-medium">{t('option_basic_title')}</div>
              <div className="text-sm text-gray-600">{t('option_basic_text')}</div>
            </div>
            <div className="font-semibold text-primary">${selectedFlight.basePrice?.toFixed(2) || "12.00"}</div>
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div className="p-5 flex justify-center items-center">
              <Loader2 className="h-5 w-5 animate-spin text-primary mr-2" />
              <span>Loading services...</span>
            </div>
          ) : (
            <>
              {/* Dynamic Services from Admin Panel API */}
              {services && services.length > 0 ? (
                services.map(service => (
                  <div key={service.id} className="p-5 flex justify-between items-center">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <div className="font-medium">{service.name}</div>
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
                        onCheckedChange={() => handleServiceChange(service.id, service.type)}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-5 text-center text-gray-500">
                  No additional services available
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
      {/* Total and Continue */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-gray-50 p-5 rounded-lg">
        <div className="mb-4 md:mb-0">
          <div className="text-sm text-gray-600 mb-1">{t('options_total_price')}</div>
          <div className="text-2xl font-semibold text-primary">€{totalPrice.toFixed(2)}</div>
        </div>
        <Button 
          className="bg-primary text-white hover:bg-primary/90 px-6 py-3"
          onClick={handleContinue}
        >
          {t('options_continue')}
        </Button>
      </div>
    </div>
  );
};

export default FlightOptions;
