import { ReactNode } from 'react';
import Header from './header';
import Footer from './footer';
import { LanguageProvider } from '@/context/language-context';
import { AuthProvider } from '@/hooks/use-auth';
import { BookingProvider } from '@/context/booking-context';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BookingProvider>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
            
            {/* Chat Support Button */}
            <div className="fixed bottom-6 right-6 z-10">
              <button className="bg-primary text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center hover:bg-primary-600 transition">
                <i className="fas fa-comments text-2xl"></i>
              </button>
            </div>
          </div>
        </BookingProvider>
      </AuthProvider>
    </LanguageProvider>
  );
};

export default MainLayout;
