import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/context/language-context";
import { Airport } from "@shared/schema";
import { AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AirportSearchProps {
  label: string;
  placeholder: string;
  icon: React.ReactNode;
  onSelect: (airport: Airport) => void;
  value?: string;
  error?: string;
}

const AirportSearch = ({ label, placeholder, icon, onSelect, value, error }: AirportSearchProps) => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [displayValue, setDisplayValue] = useState(value || "");
  const [selectedAirport, setSelectedAirport] = useState<Airport | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Query for airport search
  const {
    data: airports,
    isLoading,
    refetch,
  } = useQuery<Airport[]>({
    queryKey: [`/api/airports/search?q=${searchTerm}&lang=${currentLanguage}`],
    enabled: isOpen, // Only fetch when dropdown is open
  });

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  // Update displayValue when prop value changes (for form resets or defaults)
  useEffect(() => {
    if (value !== undefined && (!selectedAirport || selectedAirport.iataCode !== value)) {
      setDisplayValue(value);
    }
  }, [value, selectedAirport]);

  // Handle search input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDisplayValue(value);
    setSearchTerm(value);
    setSelectedAirport(null);
    
    // Always open dropdown when typing
    setIsOpen(true);
  };

  // Handle focus on input
  const handleFocus = () => {
    setIsOpen(true);
    refetch(); // Refetch when focused to get the latest data
  };

  // Handle selection of an airport
  const handleAirportSelect = (airport: Airport) => {
    setSelectedAirport(airport);
    onSelect(airport);
    
    // Format display value based on language direction but keep it shorter
    const isRTL = currentLanguage === 'ar' || currentLanguage === 'he';
    // Use only the airport code and short city name to avoid overflow
    setDisplayValue(isRTL 
      ? `${airport.iataCode} - ${airport.city.split(',')[0]}` 
      : `${airport.iataCode} - ${airport.city.split(',')[0]}`
    );
    
    setIsOpen(false);
  };

  const isRTL = currentLanguage === 'ar' || currentLanguage === 'he';

  return (
    <div className="w-full" ref={containerRef}>
      <div className="flex justify-between items-center mb-1">
        <label className="block text-sm font-medium text-gray-700">{t(label)}</label>
        {error && (
          <span className="text-xs text-red-500 flex items-center">
            <AlertCircle className={cn("w-3 h-3", isRTL ? "ml-1" : "mr-1")} />
            {t(error)}
          </span>
        )}
      </div>
      <div className="relative">
        <div className={cn("absolute inset-y-0 flex items-center pointer-events-none", 
          isRTL ? "right-0 pr-3" : "left-0 pl-3")}>
          {icon}
        </div>
        <Input
          type="text"
          dir={isRTL ? "rtl" : "ltr"}
          className={cn(
            "py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:border-primary text-[13px] h-10 leading-normal",
            isRTL ? "pr-10 pl-3" : "pl-10 pr-3",
            error ? 'border-red-500 ring-1 ring-red-500' : 'border-gray-300 focus:ring-primary'
          )}
          placeholder={t(placeholder)}
          value={displayValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          aria-invalid={!!error}
        />

        {/* Results dropdown */}
        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white shadow-lg max-h-60 rounded-md py-1 text-base overflow-auto focus:outline-none sm:text-sm airport-dropdown-menu">
            {isLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : !airports || airports.length === 0 ? (
              <div className={cn("px-4 py-2 text-sm text-gray-500", isRTL && "text-right")}>{t('no_airports_found')}</div>
            ) : (
              airports.map((airport) => (
                <div
                  key={airport.id}
                  className={cn("cursor-pointer hover:bg-gray-100 px-4 py-2", isRTL && "text-right")}
                  onClick={() => handleAirportSelect(airport)}
                  dir={isRTL ? "rtl" : "ltr"}
                >
                  <div className="font-medium">
                    {isRTL 
                      ? `${airport.city} - ${airport.iataCode}` 
                      : `${airport.iataCode} - ${airport.city}`}
                  </div>
                  <div className="text-xs text-gray-500">
                    {isRTL 
                      ? `${airport.country} ,${airport.name}` 
                      : `${airport.name}, ${airport.country}`}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AirportSearch;
