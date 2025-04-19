import { useState, useEffect } from "react";
import { useTranslation } from "@/hooks/use-translation";
import { Button } from "@/components/ui/button";
import { Flight } from "@shared/schema";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

interface FlightOptionsProps {
  selectedFlight: Flight | null;
  onChangeFlight: () => void;
  onContinue: (options: BookingOptions) => void;
}

export interface BookingOptions {
  expressProcessing: boolean;
  editableTicket: boolean;
  hotelReservation: boolean;
  insuranceLetter: boolean;
}

const FlightOptions = ({
  selectedFlight,
  onChangeFlight,
  onContinue,
}: FlightOptionsProps) => {
  const { t } = useTranslation();
  const [options, setOptions] = useState<BookingOptions>({
    expressProcessing: false,
    editableTicket: false,
    hotelReservation: false,
    insuranceLetter: false,
  });
  const [totalPrice, setTotalPrice] = useState(selectedFlight?.price || 12);
  const [visible, setVisible] = useState(false);

  // Calculate total price when options change
  useEffect(() => {
    let price = selectedFlight?.price || 12;
    if (options.expressProcessing) price += 2;
    if (options.editableTicket) price += 2;
    if (options.hotelReservation) price += 2;
    if (options.insuranceLetter) price += 2;
    setTotalPrice(price);
  }, [options, selectedFlight]);

  // Show with animation when flight is selected
  useEffect(() => {
    if (selectedFlight) {
      setVisible(true);
    }
  }, [selectedFlight]);

  // Handle option toggle
  const handleOptionChange = (option: keyof BookingOptions) => {
    setOptions({
      ...options,
      [option]: !options[option],
    });
  };

  // Handle continue button click
  const handleContinue = () => {
    onContinue(options);
  };

  // Format the date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    // Just append year for display purposes
    return `${dateString}, 2023`;
  };

  if (!selectedFlight) return null;

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
                    {selectedFlight.airline.substring(0, 2)}
                  </span>
                </div>
                <div>
                  <div className="font-medium">
                    {selectedFlight.airline} {selectedFlight.flightNumber}
                  </div>
                  <div className="text-sm text-gray-500">
                    {selectedFlight.originAirport?.iataCode} →{" "}
                    {selectedFlight.destinationAirport?.iataCode} |{" "}
                    {formatDate(selectedFlight.departureDate || "")} |{" "}
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
                  €{selectedFlight.price?.toFixed(2) || "12.00"}
                </div>
              </div>

              {/* Express Processing */}
              <div className="p-5 flex justify-between items-center">
                <div className="flex-1">
                  <div className="flex items-center">
                    <div className="font-medium mr-2">{t("options.express")}</div>
                    <Badge
                      variant="secondary"
                      className="bg-secondary-100 text-secondary-800 hover:bg-secondary-100"
                    >
                      {t("options.recommended")}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600">
                    Priority handling, guaranteed in 5 minutes
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="font-semibold text-gray-800 mr-4">+€2</div>
                  <Checkbox
                    id="express"
                    checked={options.expressProcessing}
                    onCheckedChange={() => handleOptionChange("expressProcessing")}
                  />
                </div>
              </div>

              {/* Editable Ticket */}
              <div className="p-5 flex justify-between items-center">
                <div className="flex-1">
                  <div className="font-medium">{t("options.editable")}</div>
                  <div className="text-sm text-gray-600">
                    Make changes to your ticket after purchase
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="font-semibold text-gray-800 mr-4">+€2</div>
                  <Checkbox
                    id="editable"
                    checked={options.editableTicket}
                    onCheckedChange={() => handleOptionChange("editableTicket")}
                  />
                </div>
              </div>

              {/* Hotel Reservation */}
              <div className="p-5 flex justify-between items-center">
                <div className="flex-1">
                  <div className="font-medium">{t("options.hotel")}</div>
                  <div className="text-sm text-gray-600">
                    Add a matching hotel reservation document
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="font-semibold text-gray-800 mr-4">+€2</div>
                  <Checkbox
                    id="hotel"
                    checked={options.hotelReservation}
                    onCheckedChange={() => handleOptionChange("hotelReservation")}
                  />
                </div>
              </div>

              {/* Insurance Letter */}
              <div className="p-5 flex justify-between items-center">
                <div className="flex-1">
                  <div className="font-medium">{t("options.insurance")}</div>
                  <div className="text-sm text-gray-600">
                    Travel insurance confirmation document
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="font-semibold text-gray-800 mr-4">+€2</div>
                  <Checkbox
                    id="insurance"
                    checked={options.insuranceLetter}
                    onCheckedChange={() => handleOptionChange("insuranceLetter")}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Total and Continue */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-gray-50 p-5 rounded-lg">
            <div className="mb-4 md:mb-0">
              <div className="text-sm text-gray-600 mb-1">
                {t("options.totalPrice")}
              </div>
              <div className="text-2xl font-semibold text-primary">
                €{totalPrice.toFixed(2)}
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
