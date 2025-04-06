import { useLocation } from 'wouter';
import { useTranslation } from '@/hooks/use-translation';
import { useBooking } from '@/context/booking-context';
import FlightSearchForm from '@/components/search/flight-search-form';
import { FlightSearch } from '@shared/schema';

const FlightSearchPage = () => {
  const { t } = useTranslation();
  const [_, setLocation] = useLocation();
  const { setSearchParams } = useBooking();
  
  const handleSearchSubmit = (data: FlightSearch) => {
    console.log('Search submitted:', data);
    // Update the booking context with search parameters
    setSearchParams(data);
    // Navigate to the flight selection page
    setLocation('/flights');
  };
  
  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="font-heading text-3xl font-bold text-gray-800 mb-4">{t('search_title')}</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t('search_subtitle')}
          </p>
        </div>
        
        <FlightSearchForm onSubmit={handleSearchSubmit} />
      </div>
    </section>
  );
};

export default FlightSearchPage;
