import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Flight } from '@shared/schema';
import { useState, useEffect } from 'react';

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
  
  const [options, setOptions] = useState({
    expressProcessing: false,
    editableTicket: false,
    hotelReservation: false,
    insuranceLetter: false
  });
  
  const [totalPrice, setTotalPrice] = useState(selectedFlight.basePrice);
  
  // Update total price when options change
  useEffect(() => {
    let price = selectedFlight.basePrice;
    
    if (options.expressProcessing) price += 2;
    if (options.editableTicket) price += 2;
    if (options.hotelReservation) price += 2;
    if (options.insuranceLetter) price += 2;
    
    setTotalPrice(price);
  }, [options, selectedFlight.basePrice]);
  
  const handleOptionChange = (option: keyof typeof options) => {
    setOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  };
  
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
          <h3 className="font-heading font-semibold text-lg">{t('options_services_title')}</h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {/* Base Ticket */}
          <div className="p-5 flex justify-between items-center">
            <div>
              <div className="font-medium">{t('option_basic_title')}</div>
              <div className="text-sm text-gray-600">{t('option_basic_text')}</div>
            </div>
            <div className="font-semibold text-primary">€{selectedFlight.basePrice}</div>
          </div>
          
          {/* Express Processing */}
          <div className="p-5 flex justify-between items-center">
            <div className="flex-1">
              <div className="flex items-center">
                <div className="font-medium mr-2">{t('option_express_title')}</div>
                <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full">{t('option_express_recommended')}</span>
              </div>
              <div className="text-sm text-gray-600">{t('option_express_text')}</div>
            </div>
            <div className="flex items-center">
              <div className="font-semibold text-gray-800 mr-4">+€2</div>
              <Checkbox 
                id="expressProcessing"
                checked={options.expressProcessing}
                onCheckedChange={() => handleOptionChange('expressProcessing')}
              />
            </div>
          </div>
          
          {/* Editable Ticket */}
          <div className="p-5 flex justify-between items-center">
            <div className="flex-1">
              <div className="font-medium">{t('option_editable_title')}</div>
              <div className="text-sm text-gray-600">{t('option_editable_text')}</div>
            </div>
            <div className="flex items-center">
              <div className="font-semibold text-gray-800 mr-4">+€2</div>
              <Checkbox 
                id="editableTicket"
                checked={options.editableTicket}
                onCheckedChange={() => handleOptionChange('editableTicket')}
              />
            </div>
          </div>
          
          {/* Hotel Reservation */}
          <div className="p-5 flex justify-between items-center">
            <div className="flex-1">
              <div className="font-medium">{t('option_hotel_title')}</div>
              <div className="text-sm text-gray-600">{t('option_hotel_text')}</div>
            </div>
            <div className="flex items-center">
              <div className="font-semibold text-gray-800 mr-4">+€2</div>
              <Checkbox 
                id="hotelReservation"
                checked={options.hotelReservation}
                onCheckedChange={() => handleOptionChange('hotelReservation')}
              />
            </div>
          </div>
          
          {/* Insurance Letter */}
          <div className="p-5 flex justify-between items-center">
            <div className="flex-1">
              <div className="font-medium">{t('option_insurance_title')}</div>
              <div className="text-sm text-gray-600">{t('option_insurance_text')}</div>
            </div>
            <div className="flex items-center">
              <div className="font-semibold text-gray-800 mr-4">+€2</div>
              <Checkbox 
                id="insuranceLetter"
                checked={options.insuranceLetter}
                onCheckedChange={() => handleOptionChange('insuranceLetter')}
              />
            </div>
          </div>
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
