import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { Airport } from '@shared/schema';
import { useTranslation } from 'react-i18next';

interface AirportAutocompleteProps {
  label: string;
  placeholder?: string;
  value: string;
  onSelect: (iataCode: string, airport: Airport) => void;
  direction: 'departure' | 'arrival';
  icon: React.ReactNode;
}

const AirportAutocomplete = ({
  label,
  placeholder = '',
  value,
  onSelect,
  direction,
  icon
}: AirportAutocompleteProps) => {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [displayValue, setDisplayValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const {
    data: airports,
    isLoading,
    refetch,
    isFetching
  } = useQuery<Airport[]>({
    queryKey: ['/api/airports/search', query],
    enabled: false,
  });

  useEffect(() => {
    // When value changes externally, update display value
    if (value && value !== displayValue) {
      setDisplayValue(value);
    }
  }, [value]);

  useEffect(() => {
    // Only fetch if query is at least 2 characters
    if (query.length >= 2) {
      refetch();
    }
  }, [query, refetch]);

  useEffect(() => {
    // Handle clicks outside of autocomplete
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current && 
        !inputRef.current.contains(event.target as Node) &&
        resultsRef.current && 
        !resultsRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    setDisplayValue(newQuery);
    setShowResults(true);
  };

  const handleSelectAirport = (airport: Airport) => {
    setDisplayValue(`${airport.iataCode} - ${airport.city}`);
    setShowResults(false);
    onSelect(airport.iataCode, airport);
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {icon}
        </div>
        <Input
          ref={inputRef}
          type="text"
          className="pl-10 pr-3 py-2"
          placeholder={placeholder || t('airport_placeholder')}
          value={displayValue}
          onChange={handleInputChange}
          onFocus={() => query.length >= 2 && setShowResults(true)}
        />
        {isFetching && (
          <div className="absolute inset-y-0 right-3 flex items-center">
            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
          </div>
        )}
      </div>
      
      {showResults && (
        <div 
          ref={resultsRef}
          className="absolute z-10 w-full mt-1 bg-white shadow-lg max-h-60 rounded-md py-1 text-base overflow-auto focus:outline-none sm:text-sm"
        >
          {isLoading ? (
            <div className="py-2 px-4 text-sm text-gray-500 flex items-center">
              <Loader2 className="h-4 w-4 animate-spin mr-2" /> Loading...
            </div>
          ) : airports && airports.length > 0 ? (
            airports.map((airport) => (
              <div 
                key={airport.iataCode}
                className="cursor-pointer hover:bg-gray-100 px-4 py-2"
                onClick={() => handleSelectAirport(airport)}
              >
                <div className="font-medium">{airport.iataCode} - {airport.city}</div>
                <div className="text-xs text-gray-500">{airport.name}, {airport.country}</div>
              </div>
            ))
          ) : (
            <div className="py-2 px-4 text-sm text-gray-500">
              {query.length < 2 
                ? 'Type at least 2 characters to search' 
                : 'No airports found'}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AirportAutocomplete;
