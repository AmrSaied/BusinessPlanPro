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
  const { t, i18n } = useTranslation();
  const [_, setLocation] = useLocation();
  const { setSearchParams } = useBooking();
  const isRTL = i18n.dir() === 'rtl';
  
  const handleSearchSubmit = (data: FlightSearch) => {
    console.log('Search submitted:', data);
    // Update the booking context with search parameters
    setSearchParams(data);
    // Navigate to the flight selection page
    setLocation('/flights');
  };
  
  // Hero Section
  const Hero = () => (
    <section className="relative py-16 md:py-24 overflow-hidden bg-gradient-to-b from-blue-900 to-blue-800">
      {/* Background decorative elements */}
      <div className="absolute inset-0">
        {/* White particles */}
        <div className="absolute inset-0 bg-white opacity-25">
          <svg className="absolute inset-0 w-full h-full opacity-70" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <rect width="100%" height="100%" fill="url(#starsPattern)" />
            <defs>
              <pattern id="starsPattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="20" cy="20" r="1.5" fill="white" />
              </pattern>
            </defs>
          </svg>
        </div>
        
        {/* Airplane silhouettes */}
        <div className="absolute top-20 right-10 text-white opacity-40 transform rotate-12 scale-150 animate-pulse">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22 16.9L17.5 12.4V8.49999C17.5 8.19999 17.3 7.99999 17 7.99999H16C15.7 7.99999 15.5 8.19999 15.5 8.49999V10.4L13 7.89999V5.99999C13 4.29999 10.5 2.99999 9.5 2.99999C8.5 2.99999 6 4.29999 6 5.99999V7.89999L3.5 10.4V8.49999C3.5 8.19999 3.3 7.99999 3 7.99999H2C1.7 7.99999 1.5 8.19999 1.5 8.49999V12.4L7 16.9H1V18.9H10V17.9L12 15.9L14 17.9V18.9H23V16.9H22Z" fill="currentColor"/>
          </svg>
        </div>
        
        <div className="absolute top-40 left-10 text-white opacity-30 transform -rotate-12 scale-125 animate-pulse delay-700">
          <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22 16.9L17.5 12.4V8.49999C17.5 8.19999 17.3 7.99999 17 7.99999H16C15.7 7.99999 15.5 8.19999 15.5 8.49999V10.4L13 7.89999V5.99999C13 4.29999 10.5 2.99999 9.5 2.99999C8.5 2.99999 6 4.29999 6 5.99999V7.89999L3.5 10.4V8.49999C3.5 8.19999 3.3 7.99999 3 7.99999H2C1.7 7.99999 1.5 8.19999 1.5 8.49999V12.4L7 16.9H1V18.9H10V17.9L12 15.9L14 17.9V18.9H23V16.9H22Z" fill="currentColor"/>
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
              <div className={`flex items-center justify-between mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <h2 className={`font-heading font-semibold text-xl ${isRTL ? 'text-right' : ''}`}>{t('advantages_title')}</h2>
                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  {t('advantages_24_7')}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className={`flex items-start ${isRTL ? 'flex-row-reverse text-right' : ''}`}>
                  <div className={`${isRTL ? 'ml-3 mr-0' : 'mr-3'} mt-1 text-primary`}>
                    <CheckCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium text-base">{t('advantage_pnr_title')}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{t('advantage_pnr_text')}</p>
                  </div>
                </div>
                <div className={`flex items-start ${isRTL ? 'flex-row-reverse text-right' : ''}`}>
                  <div className={`${isRTL ? 'ml-3 mr-0' : 'mr-3'} mt-1 text-primary`}>
                    <Zap className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium text-base">{t('advantage_delivery_title')}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{t('advantage_delivery_text')}</p>
                  </div>
                </div>
                <div className={`flex items-start ${isRTL ? 'flex-row-reverse text-right' : ''}`}>
                  <div className={`${isRTL ? 'ml-3 mr-0' : 'mr-3'} mt-1 text-primary`}>
                    <DollarSign className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium text-base">{t('advantage_price_title')}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{t('advantage_price_text')}</p>
                  </div>
                </div>
                <div className={`flex items-start ${isRTL ? 'flex-row-reverse text-right' : ''}`}>
                  <div className={`${isRTL ? 'ml-3 mr-0' : 'mr-3'} mt-1 text-primary`}>
                    <Headphones className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium text-base">{t('advantage_support_title')}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{t('advantage_support_text')}</p>
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
              {t('testimonial_1_text')}
            </p>
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-primary-100 text-primary flex items-center justify-center font-medium mr-3">RM</div>
              <div>
                <div className="font-medium">{t('testimonial_1_name')}</div>
                <div className="text-sm text-gray-500">{t('testimonial_1_route')}</div>
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
              {t('testimonial_2_text')}
            </p>
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-primary-100 text-primary flex items-center justify-center font-medium mr-3">SC</div>
              <div>
                <div className="font-medium">{t('testimonial_2_name')}</div>
                <div className="text-sm text-gray-500">{t('testimonial_2_route')}</div>
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
              {t('testimonial_3_text')}
            </p>
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-primary-100 text-primary flex items-center justify-center font-medium mr-3">LT</div>
              <div>
                <div className="font-medium">{t('testimonial_3_name')}</div>
                <div className="text-sm text-gray-500">{t('testimonial_3_route')}</div>
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
      {/* Decorative background elements */}
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-900 via-blue-800 to-blue-700 z-0">
        {/* White diagonal stripes */}
        <div className="absolute inset-0 overflow-hidden opacity-20">
          <div className="absolute top-0 left-0 right-0 bottom-0 transform -skew-y-12">
            <div className="h-8 bg-white mb-12"></div>
            <div className="h-4 bg-white mb-12"></div>
            <div className="h-8 bg-white mb-16"></div>
            <div className="h-4 bg-white mb-12"></div>
            <div className="h-6 bg-white mb-16"></div>
            <div className="h-2 bg-white mb-12"></div>
            <div className="h-8 bg-white mb-12"></div>
          </div>
        </div>
        
        {/* White dots overlay */}
        <div className="absolute inset-0 opacity-40">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <pattern id="white-dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="3" cy="3" r="1.5" fill="white" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#white-dots)" />
          </svg>
        </div>
        
        {/* Flying airplane animations */}
        <div className="absolute top-20 right-10 text-white opacity-50 animate-pulse transform rotate-12">
          <svg width="100" height="100" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9.4 10.5L4.8 6H13.2L17.7 10.5H9.4Z" fill="white"/>
            <path d="M19.9 11.4L18.2 6.9C18.1 6.7 17.9 6.5 17.6 6.5H2C1.5 6.5 1.1 7 1.2 7.5L3.4 15.1C3.5 15.5 3.9 15.8 4.3 15.8H9.9L9.5 21L12.8 15.8H21.4C22.2 15.8 22.7 14.9 22.3 14.2L19.9 11.4Z" fill="white"/>
          </svg>
        </div>
        
        <div className="absolute top-1/2 left-8 text-white opacity-25 animate-pulse transform -rotate-12 delay-700">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9.4 10.5L4.8 6H13.2L17.7 10.5H9.4Z" fill="white"/>
            <path d="M19.9 11.4L18.2 6.9C18.1 6.7 17.9 6.5 17.6 6.5H2C1.5 6.5 1.1 7 1.2 7.5L3.4 15.1C3.5 15.5 3.9 15.8 4.3 15.8H9.9L9.5 21L12.8 15.8H21.4C22.2 15.8 22.7 14.9 22.3 14.2L19.9 11.4Z" fill="white"/>
          </svg>
        </div>
      </div>
      
      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-10">
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4 text-white drop-shadow-sm">{t('get_ticket_now_title')}</h2>
          <p className="text-xl max-w-3xl mx-auto text-white">{t('get_ticket_now_subtitle')}</p>
        </div>
        
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-2xl p-8 border border-white/20 transform transition-all duration-300 hover:scale-[1.01]">
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
      <Testimonials />
      <GetYourTicket />
    </>
  );
};

export default HomePage;
