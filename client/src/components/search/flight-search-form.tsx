import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { flightSearchSchema, type FlightSearch } from "@shared/schema";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/context/language-context";
import { useToast } from "@/hooks/use-toast";
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
import { CalendarIcon, PlaneTakeoff, PlaneLanding, Users, Briefcase, AlertCircle } from "lucide-react";
import AirportSearch from "./airport-search";
import { Airport } from "@shared/schema";
import { cn } from "@/lib/utils";

interface FlightSearchFormProps {
  onSubmit: (data: FlightSearch) => void;
  className?: string;
}

const FlightSearchForm = ({ onSubmit, className = "" }: FlightSearchFormProps) => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const { toast } = useToast();
  const [tripType, setTripType] = useState<"one-way" | "round-trip">("round-trip"); // Set round-trip as default
  const [originAirport, setOriginAirport] = useState<Airport | null>(null);
  const [destinationAirport, setDestinationAirport] = useState<Airport | null>(null);
  
  // Check if language is RTL
  const isRTL = currentLanguage === 'ar' || currentLanguage === 'he';

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
      tripType: "round-trip",
      travelPurpose: "visa"
    },
    mode: "onSubmit" // Only validate when form is submitted
  });

  const watchedDepartureDate = watch("departureDate");
  const watchedTripType = watch("tripType");

  // Handle origin airport selection
  const handleOriginSelect = (airport: Airport) => {
    setOriginAirport(airport);
    setValue("origin", airport.iataCode, { shouldValidate: false });
    
    // If destination is the same as the new origin, clear the destination
    if (destinationAirport && destinationAirport.iataCode === airport.iataCode) {
      setDestinationAirport(null);
      setValue("destination", "", { shouldValidate: false });
      
      // Show toast notification about clearing destination
      toast({
        title: t("destination_cleared_title", "Destination Cleared"),
        description: t("destination_cleared_message", "Destination has been cleared because it cannot be the same as origin"),
        variant: "default",
      });
    }
  };

  // Handle destination airport selection
  const handleDestinationSelect = (airport: Airport) => {
    // Prevent selecting the same airport as origin
    if (originAirport && originAirport.iataCode === airport.iataCode) {
      // Show toast notification for better UX
      toast({
        title: t("error_same_airport_title", "Invalid Selection"),
        description: t("error_same_airport", "Origin and destination cannot be the same airport"),
        variant: "destructive",
      });
      return;
    }
    
    setDestinationAirport(airport);
    setValue("destination", airport.iataCode, { shouldValidate: true });
  };

  // Handle trip type change
  const handleTripTypeChange = (type: "one-way" | "round-trip") => {
    setTripType(type);
    setValue("tripType", type, { shouldValidate: false });

    // Clear return date if changing to one-way
    if (type === "one-way") {
      setValue("returnDate", undefined, { shouldValidate: false });
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
    <div className={`max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden ${className}`}>
      <div className="bg-primary-50 p-4 border-b border-primary-100">
        <h2 className="font-heading font-semibold text-2xl text-gray-800">
          {t("search_title")}
        </h2>
        <p className="text-gray-600">{t("search_subtitle")}</p>
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
              {t("one_way")}
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
              {t("round_trip")}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Origin Airport */}
            <Controller
              name="origin"
              control={control}
              render={({ field }) => (
                <AirportSearch
                  label={t("flying_from")}
                  placeholder={t("airport_placeholder")}
                  icon={<PlaneTakeoff className="h-5 w-5 text-gray-400" />}
                  onSelect={handleOriginSelect}
                  value={field.value}
                  error={errors.origin?.message}
                />
              )}
            />

            {/* Destination Airport */}
            <Controller
              name="destination"
              control={control}
              render={({ field }) => (
                <AirportSearch
                  label={t("flying_to")}
                  placeholder={t("airport_placeholder")}
                  icon={<PlaneLanding className="h-5 w-5 text-gray-400" />}
                  onSelect={handleDestinationSelect}
                  value={field.value}
                  error={errors.destination?.message}
                />
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Departure Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("departure_date")}
              </label>
              <div className="relative">
                <Controller
                  name="departureDate"
                  control={control}
                  render={({ field }) => (
                    <Popover>
                      <PopoverTrigger asChild>
                        <div className="relative">
                          <Button
                            variant="outline"
                            dir={isRTL ? "rtl" : "ltr"}
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              isRTL ? "pr-10 text-right" : "pl-10 text-left",
                              !field.value ? "text-muted-foreground" : "",
                              errors.departureDate ? "border-red-500 ring-1 ring-red-500" : "border-gray-300 hover:border-primary"
                            )}
                          >
                            <div className={cn(
                              "absolute inset-y-0 flex items-center pointer-events-none",
                              isRTL ? "right-0 pr-3" : "left-0 pl-3"
                            )}>
                              <CalendarIcon className={`h-5 w-5 ${errors.departureDate ? "text-red-500" : "text-gray-400"}`} />
                            </div>
                            {field.value ? (
                              format(new Date(field.value), "PPP")
                            ) : (
                              <span>{t("select_date")}</span>
                            )}
                          </Button>
                          {errors.departureDate && (
                            <div className={cn(
                              "absolute top-1/2 -translate-y-1/2",
                              isRTL ? "left-3" : "right-3"
                            )}>
                              <AlertCircle className="h-5 w-5 text-red-500" />
                            </div>
                          )}
                        </div>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <div className="p-0 bg-black rounded-md shadow-md border border-gray-700">
                          <Calendar
                            mode="single"
                            captionLayout="dropdown-buttons"
                            fromYear={new Date().getFullYear()}
                            toYear={new Date().getFullYear() + 20}
                            selected={field.value ? new Date(field.value) : undefined}
                            onSelect={(date) => {
                              if (date) {
                                const today = new Date();
                                today.setHours(0, 0, 0, 0);
                                
                                // Validate the date is today or in the future
                                if (date < today) {
                                  // This should never happen due to disabled dates, but just in case
                                  setValue("departureDate", format(today, "yyyy-MM-dd"), {
                                    shouldValidate: false
                                  });
                                } else {
                                  field.onChange(format(date, "yyyy-MM-dd"));
                                  
                                  // If we have a return date, validate that it's after the new departure date
                                  const returnDate = watch("returnDate");
                                  if (returnDate && watchedTripType === "round-trip") {
                                    const returnDateObj = new Date(returnDate);
                                    returnDateObj.setHours(0, 0, 0, 0);
                                    
                                    if (returnDateObj < date) {
                                      // Auto-adjust return date to be the same as departure date
                                      setValue("returnDate", format(date, "yyyy-MM-dd"), {
                                        shouldValidate: false
                                      });
                                    }
                                  }
                                }
                              }
                            }}
                            initialFocus
                            disabled={(date) => {
                              // Disable dates in the past
                              const today = new Date();
                              today.setHours(0, 0, 0, 0);
                              return date < today;
                            }}
                            className="rounded-md border-0 bg-black [&_.rdp-day]:text-white [&_.rdp-caption]:text-white [&_.rdp-head_th]:text-white [&_.rdp-day_button:hover]:bg-gray-700 [&_.rdp-day_button.rdp-day_selected]:bg-primary [&_.rdp-nav_button]:text-white [&_.rdp-dropdown_year]:bg-gray-900 [&_.rdp-dropdown_year]:text-white [&_.rdp-dropdown_month]:bg-gray-900 [&_.rdp-dropdown_month]:text-white"
                            footer={
                              <p className="p-2 text-center text-sm text-white font-medium">
                                {t("select_departure_date")}
                              </p>
                            }
                          />
                        </div>
                      </PopoverContent>
                    </Popover>
                  )}
                />
                {errors.departureDate && (
                  <div className={cn(
                    "flex mt-1", 
                    isRTL && "flex-row-reverse text-right"
                  )}>
                    <AlertCircle className={cn(
                      "h-4 w-4 text-red-500", 
                      isRTL ? "mr-0 ml-1" : "mr-1 ml-0"
                    )} />
                    <span className="text-sm text-red-500" dir={isRTL ? "rtl" : "ltr"}>
                      {t(errors.departureDate.message as any) || errors.departureDate.message}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Return Date (hidden for one-way) */}
            {watchedTripType === "round-trip" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("return_date")}
                </label>
                <div className="relative">
                  <Controller
                    name="returnDate"
                    control={control}
                    render={({ field }) => (
                      <Popover>
                        <PopoverTrigger asChild>
                          <div className="relative">
                            <Button
                              variant="outline"
                              dir={isRTL ? "rtl" : "ltr"}
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                isRTL ? "pr-10 text-right" : "pl-10 text-left",
                                !field.value ? "text-muted-foreground" : "",
                                errors.returnDate ? "border-red-500 ring-1 ring-red-500" : "border-gray-300 hover:border-primary"
                              )}
                            >
                              <div className={cn(
                                "absolute inset-y-0 flex items-center pointer-events-none",
                                isRTL ? "right-0 pr-3" : "left-0 pl-3"
                              )}>
                                <CalendarIcon className={`h-5 w-5 ${errors.returnDate ? "text-red-500" : "text-gray-400"}`} />
                              </div>
                              {field.value ? (
                                format(new Date(field.value), "PPP")
                              ) : (
                                <span>{t("select_date")}</span>
                              )}
                            </Button>
                            {errors.returnDate && (
                              <div className={cn(
                                "absolute top-1/2 -translate-y-1/2",
                                isRTL ? "left-3" : "right-3"
                              )}>
                                <AlertCircle className="h-5 w-5 text-red-500" />
                              </div>
                            )}
                          </div>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <div className="p-0 bg-black rounded-md shadow-md border border-gray-700">
                            <Calendar
                              mode="single"
                              captionLayout="dropdown-buttons"
                              fromYear={new Date().getFullYear()}
                              toYear={new Date().getFullYear() + 20}
                              selected={field.value ? new Date(field.value) : undefined}
                              onSelect={(date) => {
                                if (date) {
                                  field.onChange(format(date, "yyyy-MM-dd"));
                                  
                                  // Validate that return date is after departure date
                                  if (watchedDepartureDate) {
                                    const departureDate = new Date(watchedDepartureDate);
                                    departureDate.setHours(0, 0, 0, 0);
                                    
                                    if (date < departureDate) {
                                      // Set date value but don't validate yet
                                      setValue("returnDate", format(date, "yyyy-MM-dd"), {
                                        shouldValidate: false
                                      });
                                    }
                                  }
                                }
                              }}
                              initialFocus
                              disabled={(date) => {
                                // For round trips, disable dates before departure date
                                if (watchedDepartureDate) {
                                  const departureDate = new Date(watchedDepartureDate);
                                  departureDate.setHours(0, 0, 0, 0);
                                  return date < departureDate;
                                }
                                // If no departure date is set, disable dates in the past
                                return date < new Date();
                              }}
                              className="rounded-md border-0 bg-black [&_.rdp-day]:text-white [&_.rdp-caption]:text-white [&_.rdp-head_th]:text-white [&_.rdp-day_button:hover]:bg-gray-700 [&_.rdp-day_button.rdp-day_selected]:bg-primary [&_.rdp-nav_button]:text-white [&_.rdp-dropdown_year]:bg-gray-900 [&_.rdp-dropdown_year]:text-white [&_.rdp-dropdown_month]:bg-gray-900 [&_.rdp-dropdown_month]:text-white"
                              footer={
                                watchedDepartureDate ? (
                                  <p className="p-2 text-center text-sm text-white font-medium">
                                    {t("select_date_after")} {format(new Date(watchedDepartureDate), "PPP")}
                                  </p>
                                ) : null
                              }
                            />
                          </div>
                        </PopoverContent>
                      </Popover>
                    )}
                  />
                  {errors.returnDate && (
                    <div className={cn(
                      "flex mt-1", 
                      isRTL && "flex-row-reverse text-right"
                    )}>
                      <AlertCircle className={cn(
                        "h-4 w-4 text-red-500", 
                        isRTL ? "mr-0 ml-1" : "mr-1 ml-0"
                      )} />
                      <span className="text-sm text-red-500" dir={isRTL ? "rtl" : "ltr"}>
                        {t(errors.returnDate.message as any) || t("invalid_return_date")}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Passengers */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("passengers")}
              </label>
              <div className="relative">
                <div className={cn(
                  "absolute inset-y-0 flex items-center pointer-events-none",
                  isRTL ? "right-0 pr-3" : "left-0 pl-3"
                )}>
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
                      <SelectTrigger className={cn(
                        "w-full",
                        isRTL ? "pr-10 text-right" : "pl-10 text-left"
                      )} dir={isRTL ? "rtl" : "ltr"}>
                        <SelectValue placeholder={`1 ${t("passenger_singular")}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                          <SelectItem key={num} value={String(num)}>
                            {num} {num === 1 ? t("passenger_singular") : t("passengers_plural")}
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
                {t("travel_purpose")}
              </label>
              <div className="relative">
                <div className={cn(
                  "absolute inset-y-0 flex items-center pointer-events-none",
                  isRTL ? "right-0 pr-3" : "left-0 pl-3"
                )}>
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
                      <SelectTrigger className={cn(
                        "w-full",
                        isRTL ? "pr-10 text-right" : "pl-10 text-left"
                      )} dir={isRTL ? "rtl" : "ltr"}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="visa">{t("purpose_visa")}</SelectItem>
                        <SelectItem value="immigration">{t("purpose_immigration")}</SelectItem>
                        <SelectItem value="passport">{t("purpose_passport")}</SelectItem>
                        <SelectItem value="other">{t("purpose_other")}</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>
          </div>

          <div className="text-center flex flex-col items-center">
            {Object.keys(errors).length > 0 && (
              <div className="flex items-center text-red-500 mb-4 text-sm">
                <AlertCircle className="w-4 h-4 mr-2" />
                <span>{t("error_fields")}</span>
              </div>
            )}
            <Button
              type="submit"
              className="w-full sm:w-auto bg-primary text-white px-8 py-3 rounded-md font-medium text-lg hover:bg-primary-600 transition"
            >
              {t("search_flights")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FlightSearchForm;