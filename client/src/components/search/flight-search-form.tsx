import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { flightSearchSchema, type FlightSearch } from "@shared/schema";
import { useTranslation } from "@/hooks/use-translation";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { format } from "date-fns";
import { CalendarIcon, PlaneTakeoff, PlaneLanding, Users, Briefcase } from "lucide-react";
import AirportSearch from "./airport-search";
import { Airport } from "@shared/schema";

interface FlightSearchFormProps {
  onSubmit: (data: FlightSearch) => void;
}

const FlightSearchForm = ({ onSubmit }: FlightSearchFormProps) => {
  const { t } = useTranslation();
  const [tripType, setTripType] = useState<"one-way" | "round-trip">("one-way");
  const [originAirport, setOriginAirport] = useState<Airport | null>(null);
  const [destinationAirport, setDestinationAirport] = useState<Airport | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FlightSearch>({
    resolver: zodResolver(flightSearchSchema),
    defaultValues: {
      origin: "",
      destination: "",
      departureDate: "",
      returnDate: undefined,
      passengers: 1,
      tripType: "one-way",
      travelPurpose: "visa"
    }
  });

  const watchedDepartureDate = watch("departureDate");

  // Handle origin airport selection
  const handleOriginSelect = (airport: Airport) => {
    setOriginAirport(airport);
    setValue("origin", airport.iataCode, { shouldValidate: true });
  };

  // Handle destination airport selection
  const handleDestinationSelect = (airport: Airport) => {
    setDestinationAirport(airport);
    setValue("destination", airport.iataCode, { shouldValidate: true });
  };

  // Handle trip type change
  const handleTripTypeChange = (type: "one-way" | "round-trip") => {
    setTripType(type);
    setValue("tripType", type, { shouldValidate: true });

    // Clear return date if changing to one-way
    if (type === "one-way") {
      setValue("returnDate", undefined);
    }
  };

  // Handle form submission
  const onFormSubmit = (data: FlightSearch) => {
    // Ensure we have the complete airport data for better display
    const submissionData = {
      ...data,
      originDisplay: originAirport ? `${originAirport.iataCode} - ${originAirport.city}` : data.origin,
      destinationDisplay: destinationAirport ? `${destinationAirport.iataCode} - ${destinationAirport.city}` : data.destination
    };
    
    onSubmit(submissionData);
  };

  return (
    <section id="flight-search" className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-primary-50 p-4 border-b border-primary-100">
            <h2 className="font-heading font-semibold text-2xl text-gray-800">
              {t("search.title")}
            </h2>
            <p className="text-gray-600">{t("search.subtitle")}</p>
          </div>

          <div className="p-6">
            <form onSubmit={handleSubmit(onFormSubmit)}>
              {/* Trip Type Selector */}
              <div className="flex mb-6 bg-gray-100 inline-flex rounded-lg p-1" role="group">
                <button
                  type="button"
                  className={`px-4 py-2 rounded-md ${
                    tripType === "one-way"
                      ? "bg-white shadow text-gray-800"
                      : "text-gray-600 hover:bg-gray-50"
                  } font-medium`}
                  onClick={() => handleTripTypeChange("one-way")}
                >
                  {t("search.oneWay")}
                </button>
                <button
                  type="button"
                  className={`px-4 py-2 rounded-md ${
                    tripType === "round-trip"
                      ? "bg-white shadow text-gray-800"
                      : "text-gray-600 hover:bg-gray-50"
                  } font-medium`}
                  onClick={() => handleTripTypeChange("round-trip")}
                >
                  {t("search.roundTrip")}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Origin Airport */}
                <Controller
                  name="origin"
                  control={control}
                  render={({ field }) => (
                    <AirportSearch
                      label={t("search.from")}
                      placeholder="City or airport code"
                      icon={<PlaneTakeoff className="h-5 w-5 text-gray-400" />}
                      onSelect={handleOriginSelect}
                      value={field.value}
                    />
                  )}
                />

                {/* Destination Airport */}
                <Controller
                  name="destination"
                  control={control}
                  render={({ field }) => (
                    <AirportSearch
                      label={t("search.to")}
                      placeholder="City or airport code"
                      icon={<PlaneLanding className="h-5 w-5 text-gray-400" />}
                      onSelect={handleDestinationSelect}
                      value={field.value}
                    />
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {/* Departure Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("search.departureDate")}
                  </label>
                  <Controller
                    name="departureDate"
                    control={control}
                    render={({ field }) => (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={`w-full justify-start text-left font-normal pl-10 ${
                              !field.value ? "text-muted-foreground" : ""
                            }`}
                          >
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <CalendarIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            {field.value ? (
                              format(new Date(field.value), "PPP")
                            ) : (
                              <span>Select date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={field.value ? new Date(field.value) : undefined}
                            onSelect={(date) => {
                              if (date) {
                                field.onChange(format(date, "yyyy-MM-dd"));
                              }
                            }}
                            initialFocus
                            disabled={(date) => date < new Date()}
                          />
                        </PopoverContent>
                      </Popover>
                    )}
                  />
                  {errors.departureDate && (
                    <span className="text-sm text-red-500">{errors.departureDate.message}</span>
                  )}
                </div>

                {/* Return Date (hidden for one-way) */}
                {tripType === "round-trip" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("search.returnDate")}
                    </label>
                    <Controller
                      name="returnDate"
                      control={control}
                      render={({ field }) => (
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={`w-full justify-start text-left font-normal pl-10 ${
                                !field.value ? "text-muted-foreground" : ""
                              }`}
                            >
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <CalendarIcon className="h-5 w-5 text-gray-400" />
                              </div>
                              {field.value ? (
                                format(new Date(field.value), "PPP")
                              ) : (
                                <span>Select date</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={field.value ? new Date(field.value) : undefined}
                              onSelect={(date) => {
                                if (date) {
                                  field.onChange(format(date, "yyyy-MM-dd"));
                                }
                              }}
                              initialFocus
                              disabled={(date) => {
                                // Disable dates before departure date
                                const departureDate = watchedDepartureDate
                                  ? new Date(watchedDepartureDate)
                                  : new Date();
                                return date < departureDate;
                              }}
                            />
                          </PopoverContent>
                        </Popover>
                      )}
                    />
                  </div>
                )}

                {/* Passengers */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("search.passengers")}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Users className="h-5 w-5 text-gray-400" />
                    </div>
                    <Controller
                      name="passengers"
                      control={control}
                      render={({ field }) => (
                        <Select
                          value={String(field.value)}
                          onValueChange={(value) => field.onChange(parseInt(value))}
                        >
                          <SelectTrigger className="pl-10 w-full">
                            <SelectValue placeholder="1 Passenger" />
                          </SelectTrigger>
                          <SelectContent>
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                              <SelectItem key={num} value={String(num)}>
                                {num} {num === 1 ? "Passenger" : "Passengers"}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                </div>

                {/* Travel Purpose */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("search.travelPurpose")}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Briefcase className="h-5 w-5 text-gray-400" />
                    </div>
                    <Controller
                      name="travelPurpose"
                      control={control}
                      render={({ field }) => (
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger className="pl-10 w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="visa">Visa Application</SelectItem>
                            <SelectItem value="immigration">Immigration</SelectItem>
                            <SelectItem value="passport">Passport Renewal</SelectItem>
                            <SelectItem value="other">Other Purpose</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                </div>
              </div>

              <div className="text-center">
                <Button
                  type="submit"
                  className="w-full sm:w-auto bg-primary text-white px-8 py-3 rounded-md font-medium text-lg hover:bg-primary-600 transition"
                >
                  {t("search.searchButton")}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FlightSearchForm;
