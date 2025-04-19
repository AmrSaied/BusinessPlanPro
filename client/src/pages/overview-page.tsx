import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { useBooking } from "@/context/booking-context";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import {
  CreditCard,
  Plane,
  User,
  Calendar,
  MapPin,
  Clock,
  ArrowRight,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Euro
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import MainLayout from "@/layout/main-layout";

// Helper function for formatting currency
const formatCurrency = (amount: number, currency: string = 'EUR') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2
  }).format(amount);
};

export default function OverviewPage() {
  const [location, navigate] = useLocation();
  const { t } = useTranslation();
  const bookingContext = useBooking();
  const { bookingData } = bookingContext;
  // Ensure compatibility with different versions of booking context
  const setBookingData = (newData: any) => {
    if (typeof bookingContext.setBookingData === 'function') {
      bookingContext.setBookingData(newData);
    }
  };
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Redirect to home if no booking data is available
  useEffect(() => {
    if (!bookingData || !bookingData.selectedFlight || !bookingData.contactInfo) {
      toast({
        title: t('error'),
        description: t('booking.error.missingData'),
        variant: "destructive"
      });
      navigate("/");
    }
  }, [bookingData, navigate, toast, t]);

  if (!bookingData || !bookingData.selectedFlight || !bookingData.contactInfo) {
    return null;
  }

  const { 
    selectedFlight: flight, 
    passengers, 
    contactInfo,
    options: additionalServices,
    totalPrice = flight ? flight.price || 0 : 0
  } = bookingData;

  const additionalServicesSelected = additionalServices && Object.values(additionalServices).some(value => value);
  
  // Helper function to generate a booking reference (airline-style PNR code)
  const generateBookingReference = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  // Process the checkout with Stripe
  const handlePaymentStripe = async () => {
    try {
      setIsLoading(true);
      
      // Generate a booking reference (PNR code)
      const bookingReference = generateBookingReference();
      
      // First create the booking in the database
      const bookingResponse = await apiRequest('POST', '/api/bookings', {
        flightId: flight.id,
        userId: bookingData.userId || null, // Allow anonymous bookings
        bookingReference, // Add the booking reference
        totalPrice: totalPrice,
        currency: flight.currency || 'EUR',
        status: 'pending',
        expressProcessing: additionalServices?.expressProcessing || false,
        editableTicket: additionalServices?.editableTicket || false,
        hotelReservation: additionalServices?.hotelReservation || false,
        insuranceLetter: additionalServices?.insuranceLetter || false,
        specialRequests: bookingData.specialRequests || '',
        contactEmail: contactInfo.email,
        contactPhone: contactInfo.phone || '',
        travelPurpose: bookingData.searchParams?.travelPurpose || 'tourism'
      });

      const bookingResponseData = await bookingResponse.json();
      
      if (!bookingResponse.ok) {
        throw new Error(bookingResponseData.error || 'Failed to create booking');
      }
      
      const bookingId = bookingResponseData.id;
      
      // Add passengers to the booking
      if (passengers && passengers.length > 0) {
        for (const passenger of passengers) {
          await apiRequest('POST', `/api/bookings/${bookingId}/passengers`, {
            ...passenger,
            bookingId
          });
        }
      } else {
        // Create a default passenger if none exists
        await apiRequest('POST', `/api/bookings/${bookingId}/passengers`, {
          title: 'Mr',
          firstName: 'Guest',
          lastName: 'User',
          passportNumber: 'DEFAULT123',
          nationality: 'Unknown',
          birthDate: '1990-01-01',
          passportExpiry: '2030-01-01',
          bookingId
        });
      }
      
      // Create a Stripe checkout session
      const successUrl = `${window.location.origin}/confirmation?session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `${window.location.origin}/payment?booking_id=${bookingId}`;
      
      const stripeResponse = await apiRequest('POST', '/api/stripe/create-checkout-session', {
        bookingId,
        successUrl,
        cancelUrl,
        testMode: false // Set to true for testing without real payments
      });
      
      const stripeData = await stripeResponse.json();
      
      if (!stripeResponse.ok) {
        throw new Error(stripeData.error || 'Failed to create checkout session');
      }
      
      // Store booking ID in context for later reference
      setBookingData({
        ...bookingData,
        bookingId,
        paymentStatus: 'pending'
      });
      
      // Redirect to Stripe checkout
      window.location.href = stripeData.url;
      
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: t('payment.error.title'),
        description: error instanceof Error ? error.message : t('payment.error.general'),
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight">{t('overview.title')}</h1>
          <p className="text-muted-foreground mt-2">{t('step_3_text')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Flight information card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plane className="h-5 w-5" />
                  {t('flights_title')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4">
                  <div className="flex-1">
                    <div className="text-2xl font-bold">{flight.airlineCode} {flight.flightNumber}</div>
                    <div className="text-muted-foreground">{flight.airlineName}</div>
                  </div>
                  <div className="flex-1 flex flex-col items-center justify-center">
                    <div className="flex items-center gap-2">
                      <div className="font-medium text-right">{flight.departureAirport}</div>
                      <ArrowRight className="h-4 w-4" />
                      <div className="font-medium">{flight.arrivalAirport}</div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {flight.departureCity} → {flight.arrivalCity}
                    </div>
                  </div>
                  <div className="flex-1 text-right">
                    <div className="text-sm text-muted-foreground">{t('flight.duration')}</div>
                    <div className="font-medium">{flight.duration}</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <div className="font-medium">{t('flight.departure')}</div>
                      <div className="text-sm">{flight.departureTime}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <div className="font-medium">{t('flight.arrival')}</div>
                      <div className="text-sm">{flight.arrivalTime}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <div className="font-medium">{t('flight.from')}</div>
                      <div className="text-sm">{flight.departureCity}, {flight.departureCountry}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <div className="font-medium">{t('flight.to')}</div>
                      <div className="text-sm">{flight.arrivalCity}, {flight.arrivalCountry}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Passenger information card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  {t('passenger_title')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('passenger_number')}</TableHead>
                      <TableHead>{t('passport_number')}</TableHead>
                      <TableHead>{t('nationality')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {passengers?.map((passenger, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <div className="font-medium">
                            {passenger.title}. {passenger.firstName} {passenger.lastName}
                          </div>
                        </TableCell>
                        <TableCell>{passenger.passportNumber}</TableCell>
                        <TableCell>{passenger.nationality}</TableCell>
                      </TableRow>
                    )) || (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-muted-foreground">
                          {t('no_saved_passengers')}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>

                <div className="mt-6">
                  <h3 className="font-medium mb-2">{t('contact_info_title')}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <div className="text-muted-foreground">{t('email')}:</div>
                      <div>{contactInfo.email}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-muted-foreground">{t('phone')}:</div>
                      <div>{contactInfo.phone}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Additional services card (if any selected) */}
            {additionalServicesSelected && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    {t('options_services_title')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('service_name')}</TableHead>
                        <TableHead className="text-right">{t('price')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {additionalServices?.expressProcessing && (
                        <TableRow>
                          <TableCell>{t('service_express_processing')}</TableCell>
                          <TableCell className="text-right">{formatCurrency(2, flight.currency || 'EUR')}</TableCell>
                        </TableRow>
                      )}
                      {additionalServices?.editableTicket && (
                        <TableRow>
                          <TableCell>{t('service_editable_ticket')}</TableCell>
                          <TableCell className="text-right">{formatCurrency(2, flight.currency || 'EUR')}</TableCell>
                        </TableRow>
                      )}
                      {additionalServices?.hotelReservation && (
                        <TableRow>
                          <TableCell>{t('service_hotel_reservation')}</TableCell>
                          <TableCell className="text-right">{formatCurrency(2, flight.currency || 'EUR')}</TableCell>
                        </TableRow>
                      )}
                      {additionalServices?.insuranceLetter && (
                        <TableRow>
                          <TableCell>{t('service_insurance_letter')}</TableCell>
                          <TableCell className="text-right">{formatCurrency(2, flight.currency || 'EUR')}</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Summary Card */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Euro className="h-5 w-5" />
                  {t('options_total_price')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>{t('base_price')}</span>
                  <span>{formatCurrency(flight.price || 0, flight.currency || 'EUR')}</span>
                </div>
                
                <div className="flex justify-between">
                  <span>{t('passenger_count')}</span>
                  <span>x {passengers?.length || 1}</span>
                </div>

                {/* Show additional services in summary if selected */}
                {additionalServicesSelected && (
                  <>
                    <Separator />
                    <div className="text-sm font-medium">{t('options_services_title')}</div>
                    
                    {additionalServices?.expressProcessing && (
                      <div className="flex justify-between text-sm">
                        <span>{t('service_express_processing')}</span>
                        <span>{formatCurrency(2, flight.currency || 'EUR')}</span>
                      </div>
                    )}
                    
                    {additionalServices?.editableTicket && (
                      <div className="flex justify-between text-sm">
                        <span>{t('service_editable_ticket')}</span>
                        <span>{formatCurrency(2, flight.currency || 'EUR')}</span>
                      </div>
                    )}
                    
                    {additionalServices?.hotelReservation && (
                      <div className="flex justify-between text-sm">
                        <span>{t('service_hotel_reservation')}</span>
                        <span>{formatCurrency(2, flight.currency || 'EUR')}</span>
                      </div>
                    )}
                    
                    {additionalServices?.insuranceLetter && (
                      <div className="flex justify-between text-sm">
                        <span>{t('service_insurance_letter')}</span>
                        <span>{formatCurrency(2, flight.currency || 'EUR')}</span>
                      </div>
                    )}
                  </>
                )}

                <Separator />

                <div className="flex justify-between font-bold text-lg">
                  <span>{t('total_amount')}</span>
                  <span>{formatCurrency(totalPrice, flight.currency || 'EUR')}</span>
                </div>

                <div className="bg-muted p-3 rounded-md text-sm text-muted-foreground">
                  <p>
                    <AlertTriangle className="h-4 w-4 inline-block mr-1" />
                    {t('payment_disclaimer')}
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <Button 
                  className="w-full" 
                  onClick={handlePaymentStripe}
                  disabled={isLoading}
                >
                  {isLoading ? t('processing') : t('proceed_to_payment')}
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => navigate("/passenger-info")}
                  disabled={isLoading}
                >
                  {t('back')}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}