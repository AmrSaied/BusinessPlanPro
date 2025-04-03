import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useBooking } from '@/context/booking-context';
import PassengerForm from '@/components/ui/passenger-form';
import { InsertPassenger } from '@shared/schema';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PassengerInfoPage = () => {
  const { t } = useTranslation();
  const [, navigate] = useLocation();
  const { 
    bookingData, 
    setPassengers, 
    setContactInfo, 
    setSpecialRequests
  } = useBooking();
  
  // Redirect if no selected flight or options
  useEffect(() => {
    if (!bookingData.selectedFlight || !bookingData.options) {
      navigate('/search');
    }
  }, [bookingData.selectedFlight, bookingData.options, navigate]);
  
  // Get saved passengers (in a real app, this would be from a logged-in user's account)
  const {
    data: savedPassengers,
    isLoading: isLoadingSavedPassengers
  } = useQuery<InsertPassenger[]>({
    queryKey: ['/api/users/1/passengers'], // Using a mock user ID of 1
    enabled: false, // Disabled for now - would be enabled if user is logged in
  });
  
  // Handle form submission
  const handleSubmitForm = (
    passengerData: InsertPassenger[], 
    contactInfo: { email: string; phone?: string },
    specialRequests?: string
  ) => {
    setPassengers(passengerData);
    setContactInfo(contactInfo);
    setSpecialRequests(specialRequests || '');
    navigate('/payment');
  };
  
  // If no flight is selected, show error
  if (!bookingData.selectedFlight || !bookingData.options) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Missing flight information</h2>
          <p className="text-gray-600 mb-6">Please search for and select a flight first.</p>
          <Button onClick={() => navigate('/search')}>
            Go to Flight Search
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <PassengerForm 
            passengerCount={bookingData.searchParams?.passengers || 1}
            onSubmit={handleSubmitForm}
            savedPassengers={savedPassengers}
          />
        </div>
      </div>
    </section>
  );
};

export default PassengerInfoPage;
