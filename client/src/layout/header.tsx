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

// Try to import useAuth but handle situations where the provider is not available
let useAuth: any;
try {
  useAuth = require('@/hooks/use-auth').useAuth;
} catch (error) {
  useAuth = () => ({ user: null });
}

const Header = () => {
  const [location] = useLocation();
  const { t } = useTranslation();
  const { currentLanguage, changeLanguage, languages } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Handle possible errors if auth provider is not initialized
  let authState = { user: null, logoutMutation: { mutate: () => {} } };
  try {
    authState = useAuth();
  } catch (error) {
    console.log('Auth provider not available');
  }
  
  const { user, logoutMutation } = authState;
  const isLoggedIn = !!user;
  const userName = user?.username || "";

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo Section */}
          <Link href="/">
            <a className="flex items-center space-x-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
              <span className="font-heading font-bold text-xl text-primary">{t('app_name')}</span>
            </a>
          </Link>
          
          {/* Navigation - Desktop */}
          <nav className="hidden md:flex space-x-8">
            <Link href="/">
              <a className={`font-medium ${location === '/' ? 'text-primary' : 'text-gray-600 hover:text-primary'} transition`}>
                {t('nav_home')}
              </a>
            </Link>
            <Link href="/#how-it-works">
              <a className="font-medium text-gray-600 hover:text-primary transition">
                {t('nav_how_it_works')}
              </a>
            </Link>
            <Link href="/faq">
              <a className={`font-medium ${location === '/faq' ? 'text-primary' : 'text-gray-600 hover:text-primary'} transition`}>
                {t('nav_faq')}
              </a>
            </Link>
            <a href="#" className="font-medium text-gray-600 hover:text-primary transition">
              {t('nav_support')}
            </a>
          </nav>
          
          {/* Language and Account Section */}
          <div className="flex items-center space-x-4">
            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-1 text-sm rounded-md px-2 py-1 text-gray-700 hover:bg-gray-100">
                  <Globe className="h-4 w-4 text-gray-500" />
                  <span>{languages[currentLanguage]?.nativeName || 'English'}</span>
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48">
                {Object.entries(languages).map(([code, { nativeName, flag }]) => (
                  <DropdownMenuItem key={code} onClick={() => changeLanguage(code)}>
                    <span className="mr-2">{flag}</span> {nativeName}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* User Account / Login */}
            <div className="hidden sm:block">
              {isLoggedIn ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-1">
                      <User className="h-4 w-4 mr-1" />
                      <span>{userName}</span>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>
                      <Link href="/dashboard">
                        <a className="w-full">{t('nav_dashboard')}</a>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => logoutMutation.mutate()}>
                      <div className="flex items-center w-full">
                        <LogOut className="h-4 w-4 mr-2" />
                        <span>{t('nav_logout')}</span>
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link href="/auth">
                  <a className="bg-primary text-white px-4 py-2 rounded-md font-medium hover:bg-primary/90 transition">
                    {t('nav_sign_in')}
                  </a>
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
                <a className="font-medium text-gray-600 hover:text-primary transition py-2">{t('nav_home')}</a>
              </Link>
              <Link href="/#how-it-works">
                <a className="font-medium text-gray-600 hover:text-primary transition py-2">{t('nav_how_it_works')}</a>
              </Link>
              <Link href="/faq">
                <a className="font-medium text-gray-600 hover:text-primary transition py-2">{t('nav_faq')}</a>
              </Link>
              <a href="#" className="font-medium text-gray-600 hover:text-primary transition py-2">{t('nav_support')}</a>
              
              {isLoggedIn ? (
                <>
                  <Link href="/dashboard">
                    <a className="font-medium text-gray-600 hover:text-primary transition py-2">{t('nav_dashboard')}</a>
                  </Link>
                  <button 
                    onClick={() => logoutMutation.mutate()}
                    className="flex items-center font-medium text-gray-600 hover:text-primary transition py-2"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    <span>{t('nav_logout')}</span>
                  </button>
                </>
              ) : (
                <Link href="/auth">
                  <a className="bg-primary text-white px-4 py-2 rounded-md font-medium hover:bg-primary/90 transition text-center">
                    {t('nav_sign_in')}
                  </a>
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
