import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import AirportAutocomplete from './airport-autocomplete';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { CalendarIcon, PlaneLanding, PlaneTakeoff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBooking } from '@/context/booking-context';
import { Airport, FlightSearch } from '@shared/schema';

interface FlightSearchFormProps {
  className?: string;
}

const FlightSearchForm = ({ className }: FlightSearchFormProps) => {
  const { t } = useTranslation();
  const [, navigate] = useLocation();
  const { setSearchParams } = useBooking();
  
  // Form state
  const [tripType, setTripType] = useState<'oneWay' | 'roundTrip'>('oneWay');
  const [origin, setOrigin] = useState('');
  const [originAirport, setOriginAirport] = useState<Airport | null>(null);
  const [destination, setDestination] = useState('');
  const [destinationAirport, setDestinationAirport] = useState<Airport | null>(null);
  const [departureDate, setDepartureDate] = useState<Date | undefined>(new Date());
  const [returnDate, setReturnDate] = useState<Date | undefined>();
  const [passengers, setPassengers] = useState(1);
  const [travelPurpose, setTravelPurpose] = useState('visa');
  
  // Form validation
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const handleOriginSelect = (iataCode: string, airport: Airport) => {
    setOrigin(iataCode);
    setOriginAirport(airport);
    if (errors.origin) {
      const newErrors = { ...errors };
      delete newErrors.origin;
      setErrors(newErrors);
    }
  };
  
  const handleDestinationSelect = (iataCode: string, airport: Airport) => {
    setDestination(iataCode);
    setDestinationAirport(airport);
    if (errors.destination) {
      const newErrors = { ...errors };
      delete newErrors.destination;
      setErrors(newErrors);
    }
  };
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!origin) {
      newErrors.origin = t('error_required');
    }
    
    if (!destination) {
      newErrors.destination = t('error_required');
    }
    
    if (!departureDate) {
      newErrors.departureDate = t('error_required');
    }
    
    if (tripType === 'roundTrip' && !returnDate) {
      newErrors.returnDate = t('error_required');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }
    
    const searchParams: FlightSearch = {
      departureAirport: origin,
      arrivalAirport: destination,
      departureDate: departureDate ? format(departureDate, 'yyyy-MM-dd') : '',
      returnDate: returnDate ? format(returnDate, 'yyyy-MM-dd') : undefined,
      passengers,
      travelPurpose,
      tripType
    };
    
    setSearchParams(searchParams);
    navigate('/flights');
  };
  
  return (
    <div className={cn("bg-white rounded-xl shadow-lg overflow-hidden", className)}>
      <div className="bg-primary-50 p-4 border-b border-primary-100">
        <h2 className="font-heading font-semibold text-2xl text-gray-800">{t('search_title')}</h2>
        <p className="text-gray-600">{t('search_subtitle')}</p>
      </div>
      
      <div className="p-6">
        {/* Trip Type Selector */}
        <div className="flex mb-6 bg-gray-100 inline-flex rounded-lg p-1" role="group">
          <Button
            variant={tripType === 'oneWay' ? 'default' : 'ghost'}
            className={tripType === 'oneWay' ? 'bg-white shadow text-gray-800' : 'text-gray-600'}
            onClick={() => setTripType('oneWay')}
          >
            {t('one_way')}
          </Button>
          <Button
            variant={tripType === 'roundTrip' ? 'default' : 'ghost'}
            className={tripType === 'roundTrip' ? 'bg-white shadow text-gray-800' : 'text-gray-600'}
            onClick={() => setTripType('roundTrip')}
          >
            {t('round_trip')}
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Origin Airport */}
          <AirportAutocomplete
            label={t('flying_from')}
            value={origin}
            onSelect={handleOriginSelect}
            direction="departure"
            icon={<PlaneTakeoff className="h-5 w-5 text-gray-400" />}
          />
          
          {/* Destination Airport */}
          <AirportAutocomplete
            label={t('flying_to')}
            value={destination}
            onSelect={handleDestinationSelect}
            direction="arrival"
            icon={<PlaneLanding className="h-5 w-5 text-gray-400" />}
          />
          {errors.origin && <p className="text-red-500 text-sm mt-1">{errors.origin}</p>}
          {errors.destination && <p className="text-red-500 text-sm mt-1">{errors.destination}</p>}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Departure Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('departure_date')}</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !departureDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {departureDate ? (
                    format(departureDate, "PPP")
                  ) : (
                    <span>{t('select_date')}</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={departureDate}
                  onSelect={setDepartureDate}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {errors.departureDate && <p className="text-red-500 text-sm mt-1">{errors.departureDate}</p>}
          </div>
          
          {/* Return Date (hidden for one-way) */}
          {tripType === 'roundTrip' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('return_date')}</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !returnDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {returnDate ? (
                      format(returnDate, "PPP")
                    ) : (
                      <span>{t('select_date')}</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={returnDate}
                    onSelect={setReturnDate}
                    disabled={(date) => date < (departureDate || new Date())}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.returnDate && <p className="text-red-500 text-sm mt-1">{errors.returnDate}</p>}
            </div>
          )}
          
          {/* Passengers */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('passengers')}</label>
            <Select value={passengers.toString()} onValueChange={(value) => setPassengers(parseInt(value))}>
              <SelectTrigger>
                <SelectValue placeholder={t('passengers')} />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num} {num === 1 ? t('passenger_singular') : t('passengers_plural')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Travel Purpose */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('travel_purpose')}</label>
            <Select value={travelPurpose} onValueChange={setTravelPurpose}>
              <SelectTrigger>
                <SelectValue placeholder={t('travel_purpose')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="visa">{t('purpose_visa')}</SelectItem>
                <SelectItem value="immigration">{t('purpose_immigration')}</SelectItem>
                <SelectItem value="passport">{t('purpose_passport')}</SelectItem>
                <SelectItem value="other">{t('purpose_other')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="text-center">
          <Button 
            onClick={handleSubmit}
            className="w-full sm:w-auto bg-primary text-white px-8 py-3 rounded-md font-medium text-lg hover:bg-primary/90 transition"
          >
            {t('search_flights')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FlightSearchForm;
