import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/context/language-context';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Menu, Globe, ChevronDown, User, LogOut } from 'lucide-react';
import { User as SelectUser } from '@shared/schema';

// Import useAuth from hooks
import { useAuth } from '@/hooks/use-auth';

const Header = () => {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Default translations fallback
  let translations = { 
    t: (key: string) => key,
    i18n: { language: 'en' }
  };
  
  try {
    translations = useTranslation();
  } catch (error) {
    console.error('Translation context not available');
  }
  
  const { t } = translations;
  
  // Default language context fallback
  let languageContext: any = {
    currentLanguage: 'en',
    changeLanguage: (lang: string) => console.log(`Would change to ${lang}`),
    languages: { 
      en: { nativeName: 'English', flag: '🇺🇸' },
      es: { nativeName: 'Español', flag: '🇪🇸' }
    }
  };
  
  try {
    languageContext = useLanguage();
  } catch (error) {
    console.error('Language context not available');
  }
  
  const { currentLanguage, changeLanguage, languages } = languageContext;
  
  // Handle possible errors if auth provider is not initialized
  let authState: { user: SelectUser | null, logoutMutation: { mutate: () => void } } = { 
    user: null, 
    logoutMutation: { mutate: () => {} } 
  };
  
  try {
    authState = useAuth();
  } catch (error) {
    console.log('Auth provider not available');
  }
  
  const { user, logoutMutation } = authState;
  const isLoggedIn = !!user;
  
  // Get userName safely with type assertion to avoid TypeScript errors
  const userName = user?.username || "";
  
  // Debug login state
  console.log("Auth state in header:", { isLoggedIn, userName, userId: user?.id });

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="bg-card shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo Section */}
          <Link href="/">
            <span className="flex items-center space-x-1 cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
              <span className="font-heading font-bold text-xl text-primary">{t('app_name')}</span>
            </span>
          </Link>
          
          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center justify-between min-w-[380px] max-w-[500px] flex-grow mx-4 rtl:flex-row-reverse">
            <Link href="/">
              <span className={`font-medium ${location === '/' ? 'text-primary' : 'text-muted-foreground hover:text-primary'} transition cursor-pointer`}>
                {t('nav_home')}
              </span>
            </Link>
            <Link href="/how-it-works">
              <span className={`font-medium ${location === '/how-it-works' ? 'text-primary' : 'text-muted-foreground hover:text-primary'} transition cursor-pointer`}>
                {t('nav_how_it_works')}
              </span>
            </Link>
            <Link href="/faq">
              <span className={`font-medium ${location === '/faq' ? 'text-primary' : 'text-muted-foreground hover:text-primary'} transition cursor-pointer`}>
                {t('nav_faq')}
              </span>
            </Link>
            <Link href="/support">
              <span className={`font-medium ${location === '/support' ? 'text-primary' : 'text-muted-foreground hover:text-primary'} transition cursor-pointer`}>
                {t('nav_support')}
              </span>
            </Link>
          </nav>
          
          {/* Language, Theme and Account Section */}
          <div className="flex items-center space-x-6 md:space-x-8 rtl:space-x-reverse">

            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center text-sm rounded-md px-3 py-1.5">
                  <Globe className="h-4 w-4 text-muted-foreground ltr:mr-2 rtl:ml-2 flex-shrink-0" />
                  <span className="truncate max-w-[120px]">{languages[currentLanguage]?.nativeName || 'English'}</span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground ltr:ml-2 rtl:mr-2 flex-shrink-0" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-52">
                {Object.entries(languages || {}).map(([code, lang]: [string, any]) => (
                  <DropdownMenuItem 
                    key={code} 
                    onClick={() => changeLanguage(code)}
                    className={code === currentLanguage ? "bg-primary/10" : ""}
                  >
                    <div className="flex items-center w-full">
                      <span className="ltr:mr-2 rtl:ml-2 text-lg flex-shrink-0">{lang.flag}</span> 
                      <span className="truncate">{lang.nativeName}</span>
                      {code === currentLanguage && (
                        <span className="ltr:ml-auto rtl:mr-auto flex-shrink-0">✓</span>
                      )}
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* User Account / Login */}
            <div className="hidden sm:block">
              {isLoggedIn ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center">
                      <User className="h-4 w-4 ltr:mr-2 rtl:ml-2 flex-shrink-0" />
                      <span className="mx-1">{userName}</span>
                      <ChevronDown className="h-4 w-4 ltr:ml-1 rtl:mr-1 flex-shrink-0" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>
                      <Link href="/dashboard">
                        <span className="w-full cursor-pointer">{t('nav_dashboard')}</span>
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => logoutMutation.mutate()}>
                      <div className="flex items-center w-full">
                        <LogOut className="h-4 w-4 ltr:mr-2 rtl:ml-2 flex-shrink-0" />
                        <span>{t('nav_logout')}</span>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link href="/auth">
                  <span className="bg-primary text-white px-4 py-2 rounded-md font-medium hover:bg-primary/90 transition cursor-pointer inline-block min-w-[180px] text-center whitespace-nowrap rtl:min-w-[200px]">
                    {t('nav_sign_in')}
                  </span>
                </Link>
              )}
            </div>
          </div>
          
          {/* Mobile Menu Button */}
          <button 
            onClick={toggleMobileMenu}
            className="md:hidden text-gray-500 hover:text-gray-700"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
        
        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4">
            <nav className="flex flex-col space-y-3">
              <Link href="/">
                <span className="font-medium text-foreground hover:text-primary transition py-2 cursor-pointer inline-block">{t('nav_home')}</span>
              </Link>
              <Link href="/how-it-works">
                <span className="font-medium text-foreground hover:text-primary transition py-2 cursor-pointer inline-block">{t('nav_how_it_works')}</span>
              </Link>
              <Link href="/faq">
                <span className="font-medium text-foreground hover:text-primary transition py-2 cursor-pointer inline-block">{t('nav_faq')}</span>
              </Link>
              <Link href="/support">
                <span className="font-medium text-foreground hover:text-primary transition py-2 cursor-pointer inline-block">{t('nav_support')}</span>
              </Link>
              
              {isLoggedIn ? (
                <>
                  <Link href="/dashboard">
                    <span className="font-medium text-foreground hover:text-primary transition py-2 cursor-pointer inline-block">{t('nav_dashboard')}</span>
                  </Link>

                  <button 
                    onClick={() => logoutMutation.mutate()}
                    className="flex items-center font-medium text-foreground hover:text-primary transition py-2"
                  >
                    <LogOut className="h-4 w-4 ltr:mr-2 rtl:ml-2 flex-shrink-0" />
                    <span>{t('nav_logout')}</span>
                  </button>
                </>
              ) : (
                <Link href="/auth">
                  <span className="bg-primary text-white px-4 py-2 rounded-md font-medium hover:bg-primary/90 transition text-center cursor-pointer inline-block min-w-[180px] whitespace-nowrap rtl:min-w-[200px]">
                    {t('nav_sign_in')}
                  </span>
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
