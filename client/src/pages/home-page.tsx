import { useLanguage } from '@/context/language-context';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'wouter';
import { useBooking } from '@/context/booking-context';
import { Button } from '@/components/ui/button';
import FlightSearchForm from '@/components/search/flight-search-form';
import HowItWorksSection from '@/components/sections/how-it-works-section';
import GetTicketWidget from '@/components/ui/get-ticket-widget';
import { FlightSearch } from '@shared/schema';
import { 
  CheckCircle, 
  Zap, 
  DollarSign, 
  Headphones,
  Star
} from 'lucide-react';

const HomePage = () => {
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
  
  // Hero Section
  const Hero = () => (
    <section className="relative py-16 md:py-24 overflow-hidden bg-primary-700">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-white">
          <svg className="absolute top-0 left-0 w-full h-full" width="100%" height="100%" viewBox="0 0 1200 600" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="smallGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.5"/>
              </pattern>
              <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
                <rect width="100" height="100" fill="url(#smallGrid)"/>
                <path d="M 100 0 L 0 0 0 100" fill="none" stroke="currentColor" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
      </div>
      
      {/* Curved shape at bottom */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 100" className="w-full h-16 text-white fill-current">
          <path d="M0,64L80,58.7C160,53,320,43,480,48C640,53,800,75,960,80C1120,85,1280,75,1360,69.3L1440,64L1440,100L1360,100C1280,100,1120,100,960,100C800,100,640,100,480,100C320,100,160,100,80,100L0,100Z"></path>
        </svg>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-10 md:mb-0 md:pr-8">
            <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-white drop-shadow-md">
              {t('hero_title')}
            </h1>
            <p className="text-lg md:text-xl text-white text-opacity-90 mb-8">
              {t('hero_subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/search">
                <Button className="bg-amber-500 text-gray-900 px-6 py-3 rounded-md font-medium text-center hover:bg-amber-400 transition shadow-lg">
                  {t('hero_cta')}
                </Button>
              </Link>
              <Link href="/how-it-works">
                <Button variant="outline" className="border-white bg-white/10 hover:bg-white/20 px-6 py-3 text-white">
                  {t('hero_how_it_works')}
                </Button>
              </Link>
            </div>
          </div>
          <div className="md:w-1/2">
            <div className="bg-white rounded-lg shadow-xl p-6 text-gray-800">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-heading font-semibold text-xl">{t('advantages_title')}</h2>
                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  {t('advantages_24_7')}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start">
                  <div className="mr-3 mt-1 text-primary">
                    <CheckCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium">{t('advantage_pnr_title')}</h3>
                    <p className="text-sm text-gray-600">{t('advantage_pnr_text')}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="mr-3 mt-1 text-primary">
                    <Zap className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium">{t('advantage_delivery_title')}</h3>
                    <p className="text-sm text-gray-600">{t('advantage_delivery_text')}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="mr-3 mt-1 text-primary">
                    <DollarSign className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium">{t('advantage_price_title')}</h3>
                    <p className="text-sm text-gray-600">{t('advantage_price_text')}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="mr-3 mt-1 text-primary">
                    <Headphones className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium">{t('advantage_support_title')}</h3>
                    <p className="text-sm text-gray-600">{t('advantage_support_text')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
  
  // Flight Search Section
  const FlightSearch = () => (
    <section id="flight-search" className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <FlightSearchForm onSubmit={handleSearchSubmit} />
      </div>
    </section>
  );
  
  // How It Works Section
  const HowItWorks = () => (
    <section id="how-it-works">
      <HowItWorksSection />
    </section>
  );
  
  // Testimonials Section
  const Testimonials = () => (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-heading text-3xl font-bold mb-4">{t('testimonials_title')}</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            {t('testimonials_subtitle')}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Testimonial 1 */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <div className="text-amber-500 flex">
                <Star className="fill-current h-4 w-4" />
                <Star className="fill-current h-4 w-4" />
                <Star className="fill-current h-4 w-4" />
                <Star className="fill-current h-4 w-4" />
                <Star className="fill-current h-4 w-4" />
              </div>
            </div>
            <p className="text-gray-600 mb-4">
              "I needed a flight reservation for my Schengen visa application urgently. Global Air Travel Services delivered it within minutes, and my visa was approved!"
            </p>
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-primary-100 text-primary flex items-center justify-center font-medium mr-3">RM</div>
              <div>
                <div className="font-medium">Raj M.</div>
                <div className="text-sm text-gray-500">India → Germany</div>
              </div>
            </div>
          </div>
          
          {/* Testimonial 2 */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <div className="text-amber-500 flex">
                <Star className="fill-current h-4 w-4" />
                <Star className="fill-current h-4 w-4" />
                <Star className="fill-current h-4 w-4" />
                <Star className="fill-current h-4 w-4" />
                <Star className="fill-current h-4 w-4" />
              </div>
            </div>
            <p className="text-gray-600 mb-4">
              "The support team was incredibly helpful when I needed to make changes to my reservation. Smooth process and great service."
            </p>
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-primary-100 text-primary flex items-center justify-center font-medium mr-3">SC</div>
              <div>
                <div className="font-medium">Sofia C.</div>
                <div className="text-sm text-gray-500">Brazil → Spain</div>
              </div>
            </div>
          </div>
          
          {/* Testimonial 3 */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <div className="text-amber-500 flex">
                <Star className="fill-current h-4 w-4" />
                <Star className="fill-current h-4 w-4" />
                <Star className="fill-current h-4 w-4" />
                <Star className="fill-current h-4 w-4" />
                <div className="relative">
                  <Star className="text-gray-300 h-4 w-4" />
                  <Star className="absolute top-0 left-0 fill-current h-4 w-4" style={{ clipPath: 'inset(0 50% 0 0)' }} />
                </div>
              </div>
            </div>
            <p className="text-gray-600 mb-4">
              "Perfect solution for my US visa application. The PNR was verifiable and the embassy accepted it without any questions. Highly recommended!"
            </p>
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-primary-100 text-primary flex items-center justify-center font-medium mr-3">LT</div>
              <div>
                <div className="font-medium">Liu T.</div>
                <div className="text-sm text-gray-500">China → United States</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
  
  // Get Your Ticket Now Section
  const GetYourTicket = () => (
    <section className="py-16 relative overflow-hidden">
      {/* Background with dots pattern */}
      <div className="absolute inset-0 bg-primary-700 z-0">
        <svg className="absolute inset-0 h-full w-full" xmlns="http://www.w3.org/2000/svg">
          <pattern id="dots-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="rgba(255, 255, 255, 0.1)" />
          </pattern>
          <rect x="0" y="0" width="100%" height="100%" fill="url(#dots-pattern)" />
        </svg>
        
        {/* Abstract wave shapes */}
        <div className="absolute left-0 right-0 top-0 h-16">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full h-full text-white fill-current opacity-10 transform scale-150">
            <path d="M0,224L60,208C120,192,240,160,360,165.3C480,171,600,213,720,213.3C840,213,960,171,1080,149.3C1200,128,1320,128,1380,128L1440,128L1440,0L1380,0C1320,0,1200,0,1080,0C960,0,840,0,720,0C600,0,480,0,360,0C240,0,120,0,60,0L0,0Z"></path>
          </svg>
        </div>
        
        <div className="absolute left-0 right-0 bottom-0 h-32 transform -rotate-180">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full h-full text-white fill-current opacity-10 transform scale-150">
            <path d="M0,224L60,208C120,192,240,160,360,165.3C480,171,600,213,720,213.3C840,213,960,171,1080,149.3C1200,128,1320,128,1380,128L1440,128L1440,0L1380,0C1320,0,1200,0,1080,0C960,0,840,0,720,0C600,0,480,0,360,0C240,0,120,0,60,0L0,0Z"></path>
          </svg>
        </div>
      </div>
      
      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-8">
          <h2 className="font-heading text-3xl font-bold mb-4 text-white">{t('get_ticket_now_title')}</h2>
          <p className="text-xl max-w-3xl mx-auto text-white text-opacity-90">{t('get_ticket_now_subtitle')}</p>
        </div>
        
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-2xl p-8 transform transition-all duration-300 hover:shadow-3xl">
          <GetTicketWidget variant="default" />
        </div>
      </div>
    </section>
  );

  return (
    <>
      <Hero />
      <FlightSearch />
      <HowItWorks />
      <GetYourTicket />
      <Testimonials />
    </>
  );
};

export default HomePage;
