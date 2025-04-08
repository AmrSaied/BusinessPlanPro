import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useBooking } from '@/context/booking-context';
import { useAuth } from '@/hooks/use-auth';
import { apiRequest, queryClient } from '@/lib/queryClient';
import PassengerForm from '@/components/ui/passenger-form';
import { InsertPassenger, Passenger } from '@shared/schema';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

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
  
  // Get authenticated user
  const { user } = useAuth();
  
  // Get saved passengers only if the user is authenticated
  const {
    data: savedPassengers,
    isLoading: isLoadingSavedPassengers
  } = useQuery<Passenger[]>({
    queryKey: [`/api/users/${user?.id}/passengers`],
    enabled: !!user, // Only enable the query if user is authenticated
  });
  
  // Toast notifications
  const { toast } = useToast();
  
  // Mutation to save a passenger to the user's account
  const savePassengerMutation = useMutation({
    mutationFn: async (passenger: InsertPassenger) => {
      const res = await apiRequest(
        "POST", 
        `/api/users/${user?.id}/passengers`, 
        passenger
      );
      return await res.json();
    },
    onSuccess: () => {
      // Invalidate saved passengers query to refresh the list
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user?.id}/passengers`] });
      toast({
        title: 'Passenger saved',
        description: 'The passenger has been saved to your account',
      });
    },
    onError: (err: Error) => {
      console.error('Error saving passenger:', err);
      toast({
        title: 'Error saving passenger',
        description: err.message,
        variant: 'destructive',
      });
    }
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
    
    // If the user is authenticated, save any passengers marked to be saved
    if (user) {
      passengerData.forEach(passenger => {
        if (passenger.isSaved) {
          // Check if this is an existing saved passenger
          const existingSavedPassenger = savedPassengers?.find(
            p => p.passportNumber === passenger.passportNumber && 
                 p.firstName === passenger.firstName && 
                 p.lastName === passenger.lastName
          );
          
          // If it exists, we should update rather than create a new one
          // But for now, we'll just create a new one since the API doesn't support updates yet
          savePassengerMutation.mutate({
            ...passenger,
            userId: user.id
          });
        }
      });
    }
    
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
