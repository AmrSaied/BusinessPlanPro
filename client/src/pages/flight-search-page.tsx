import { useTranslation } from 'react-i18next';
import FlightSearchForm from '@/components/ui/flight-search-form';

const FlightSearchPage = () => {
  const { t } = useTranslation();
  
  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="font-heading text-3xl font-bold text-gray-800 mb-4">{t('search_title')}</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t('search_subtitle')}
          </p>
        </div>
        
        <FlightSearchForm className="max-w-4xl mx-auto" />
      </div>
    </section>
  );
};

export default FlightSearchPage;
