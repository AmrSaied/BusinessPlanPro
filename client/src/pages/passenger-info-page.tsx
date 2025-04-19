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
  
  // Mutation to save contact info
  const saveContactInfoMutation = useMutation({
    mutationFn: async (contactData: { phone: string; preferredEmail: string }) => {
      const res = await apiRequest(
        "PATCH", 
        `/api/users/${user?.id}/contact`,
        contactData
      );
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Contact info saved',
        description: 'Your contact information has been saved to your account',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error saving contact info',
        description: error.message || 'An error occurred while saving your contact information',
        variant: "destructive",
      });
    }
  });

  // Handle form submission
  const handleSubmitForm = (
    passengerData: InsertPassenger[], 
    contactInfo: { email: string; phone?: string; saveInfo?: boolean },
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
      
      // Save contact info if requested
      if (contactInfo.saveInfo && contactInfo.phone) {
        saveContactInfoMutation.mutate({
          phone: contactInfo.phone,
          preferredEmail: contactInfo.email
        });
      }
    }
    
    navigate('/overview');
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
  
  // Show loading spinner while fetching saved passengers
  if (user && isLoadingSavedPassengers) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Loading passenger data</h2>
          <p className="text-gray-600 mb-6">Please wait while we retrieve your saved passenger information...</p>
        </div>
      </div>
    );
  }
  
  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {user && savedPassengers && savedPassengers.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden mb-6 p-5">
              <h3 className="font-heading font-semibold text-lg mb-4">{t('saved_passengers')}</h3>
              <p className="text-gray-600 mb-3">{t('saved_passengers_info')}</p>
            </div>
          )}
          
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
