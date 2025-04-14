import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Download, 
  Loader2, 
  Plus, 
  AlertTriangle,
  User
} from 'lucide-react';
import { Booking, Passenger } from '@shared/schema';
import { useLanguage } from '@/context/language-context';
import { cn } from '@/lib/utils';

const UserDashboard = () => {
  const { t } = useTranslation();
  
  // Mock user ID
  const userId = 1;
  
  // Fetch user bookings
  const {
    data: bookings,
    isLoading: isLoadingBookings,
    isError: isBookingsError
  } = useQuery<Booking[]>({
    queryKey: [`/api/users/${userId}/bookings`],
    // Disabled for demo purposes
    enabled: false,
  });
  
  // Fetch saved passengers
  const {
    data: savedPassengers,
    isLoading: isLoadingPassengers,
    isError: isPassengersError
  } = useQuery<Passenger[]>({
    queryKey: [`/api/users/${userId}/passengers`],
    // Disabled for demo purposes
    enabled: false,
  });
  
  // Simulate some sample data
  const mockBookings: Booking[] = [
    {
      id: 1,
      userId: 1,
      flightId: 1,
      bookingReference: 'AB123456',
      totalPrice: 20,
      currency: 'USD',
      status: 'confirmed',
      expressProcessing: true,
      editableTicket: false,
      hotelReservation: false,
      insuranceLetter: false,
      createdAt: new Date('2023-10-15'),
      contactEmail: 'user@example.com',
      contactPhone: '+1234567890',
      travelPurpose: 'visa'
    },
    {
      id: 2,
      userId: 1,
      flightId: 2,
      bookingReference: 'CD789012',
      totalPrice: 35,
      currency: 'USD',
      status: 'confirmed',
      expressProcessing: true,
      editableTicket: true,
      hotelReservation: false,
      insuranceLetter: true,
      createdAt: new Date('2023-11-05'),
      contactEmail: 'user@example.com',
      contactPhone: '+1234567890',
      travelPurpose: 'immigration'
    }
  ];
  
  const mockPassengers: Passenger[] = [
    {
      id: 1,
      userId: 1,
      title: 'mr',
      firstName: 'John',
      lastName: 'Doe',
      nationality: 'us',
      dateOfBirth: '15/05/1985',
      passportNumber: 'A1234567',
      passportExpiry: '20/06/2028',
      isSaved: true
    },
    {
      id: 2,
      userId: 1,
      title: 'ms',
      firstName: 'Jane',
      lastName: 'Smith',
      nationality: 'gb',
      dateOfBirth: '03/11/1990',
      passportNumber: 'B7654321',
      passportExpiry: '15/03/2029',
      isSaved: true
    }
  ];
  
  // Get current user (mock)
  const currentUser = {
    name: 'John Doe',
    email: 'john.doe@example.com'
  };
  
  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          {/* User Greeting */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center">
              <div className="bg-primary/10 rounded-full p-3 mr-4">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="font-heading text-2xl font-bold text-gray-800">
                  {t('dashboard_title')}
                </h1>
                <p className="text-gray-600">
                  {t('dashboard_welcome')}, {currentUser.name}
                </p>
              </div>
              <div className="ml-auto">
                <Link href="/search">
                  <Button className="bg-primary text-white hover:bg-primary/90">
                    <Plus className="mr-2 h-4 w-4" />
                    {t('dashboard_create_booking')}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
          
          {/* Dashboard Tabs */}
          <Tabs defaultValue="bookings">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="bookings">{t('dashboard_bookings')}</TabsTrigger>
              <TabsTrigger value="passengers">{t('dashboard_saved_passengers')}</TabsTrigger>
            </TabsList>
            
            {/* Bookings Tab */}
            <TabsContent value="bookings">
              <Card>
                <CardHeader>
                  <CardTitle>{t('dashboard_bookings')}</CardTitle>
                  <CardDescription>
                    View and manage your flight reservations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingBookings ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : isBookingsError ? (
                    <div className="text-center py-8">
                      <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto mb-2" />
                      <p className="text-gray-600">Error loading bookings</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {(bookings || mockBookings).length > 0 ? (
                        (bookings || mockBookings).map((booking) => (
                          <div 
                            key={booking.id}
                            className="border border-gray-200 rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between"
                          >
                            <div className="mb-4 md:mb-0">
                              <div className="font-medium">
                                Booking Reference: {booking.bookingReference}
                              </div>
                              <div className="text-sm text-gray-600">
                                {new Date(booking.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                            
                            <div className="flex flex-col md:items-center mb-4 md:mb-0">
                              <div className="text-sm text-gray-600">{t('dashboard_booking_status')}</div>
                              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                                booking.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                              }`}>
                                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                              </span>
                            </div>
                            
                            <div className="flex flex-col md:items-center mb-4 md:mb-0">
                              <div className="text-sm text-gray-600">{t('dashboard_booking_amount')}</div>
                              <div className="font-medium">${booking.totalPrice.toFixed(2)} {booking.currency}</div>
                            </div>
                            
                            <div>
                              <Link href={`/confirmation/${booking.id}`}>
                                <Button size="sm" className="w-full md:w-auto">
                                  <Download className="mr-2 h-4 w-4" />
                                  {t('dashboard_view_ticket')}
                                </Button>
                              </Link>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-gray-600 mb-4">{t('dashboard_no_bookings')}</p>
                          <Link href="/search">
                            <Button className="bg-primary text-white hover:bg-primary/90">
                              {t('dashboard_create_booking')}
                            </Button>
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Passengers Tab */}
            <TabsContent value="passengers">
              <Card>
                <CardHeader>
                  <CardTitle>{t('dashboard_saved_passengers')}</CardTitle>
                  <CardDescription>
                    Your saved passenger information for quick booking
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingPassengers ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : isPassengersError ? (
                    <div className="text-center py-8">
                      <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto mb-2" />
                      <p className="text-gray-600">Error loading passengers</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {(savedPassengers || mockPassengers).length > 0 ? (
                        (savedPassengers || mockPassengers).map((passenger) => (
                          <div 
                            key={passenger.id}
                            className="border border-gray-200 rounded-lg p-4"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-medium">
                                  {passenger.title.toUpperCase()}. {passenger.firstName} {passenger.lastName}
                                </div>
                                <div className="text-sm text-gray-600 mt-1">
                                  Passport: {passenger.passportNumber} | Nationality: {passenger.nationality.toUpperCase()}
                                </div>
                                <div className="text-sm text-gray-600">
                                  DOB: {passenger.dateOfBirth} | Passport Expiry: {passenger.passportExpiry}
                                </div>
                              </div>
                              <div>
                                <Link href="/search">
                                  <Button size="sm" variant="outline">
                                    Book Ticket
                                  </Button>
                                </Link>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-gray-600">{t('dashboard_no_passengers')}</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </section>
  );
};

export default UserDashboard;
