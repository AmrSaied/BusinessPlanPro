import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { useTranslation } from "@/hooks/use-translation";
import { Airport } from "@shared/schema";
import { Loader2 } from "lucide-react";

interface AirportSearchProps {
  label: string;
  placeholder: string;
  icon: React.ReactNode;
  onSelect: (airport: Airport) => void;
  value?: string;
}

const AirportSearch = ({ label, placeholder, icon, onSelect, value }: AirportSearchProps) => {
  const { t, language } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [displayValue, setDisplayValue] = useState(value || "");
  const containerRef = useRef<HTMLDivElement>(null);

  // Query for airport search
  const {
    data: airports,
    isLoading,
    refetch,
  } = useQuery<Airport[]>({
    queryKey: [`/api/airports/search?q=${searchTerm}&lang=${language}`],
    enabled: true, // Always enabled to allow empty queries to return all airports
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

  // Handle search input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDisplayValue(value);
    setSearchTerm(value);
    
    setIsOpen(true);
    refetch();
  };

  // Handle selection of an airport
  const handleAirportSelect = (airport: Airport) => {
    onSelect(airport);
    setDisplayValue(`${airport.iataCode} - ${airport.city}`);
    setIsOpen(false);
  };

  return (
    <div className="w-full" ref={containerRef}>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {icon}
        </div>
        <Input
          type="text"
          className="pl-10 pr-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary"
          placeholder={placeholder}
          value={displayValue}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
        />

        {/* Results dropdown */}
        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white shadow-lg max-h-60 rounded-md py-1 text-base overflow-auto focus:outline-none sm:text-sm">
            {isLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : !airports || airports.length === 0 ? (
              <div className="px-4 py-2 text-sm text-gray-500">No airports found</div>
            ) : (
              airports.map((airport) => (
                <div
                  key={airport.id}
                  className="cursor-pointer hover:bg-gray-100 px-4 py-2"
                  onClick={() => handleAirportSelect(airport)}
                >
                  <div className="font-medium">
                    {airport.iataCode} - {airport.city}
                  </div>
                  <div className="text-xs text-gray-500">
                    {airport.name}, {airport.country}
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
