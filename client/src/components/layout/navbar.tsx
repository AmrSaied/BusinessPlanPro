import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useTranslation } from "@/hooks/use-translation";
import { useLanguage } from "@/context/language-context";
import { useAuth } from "@/hooks/use-auth";
import { Menu, X, Globe, ChevronDown, User, MessageSquare, HelpCircle, LogOut, Home, Lock, Info, CreditCard } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import type { SelectUser } from "@shared/schema";

export default function Navbar() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useTranslation();
  const { currentLanguage, changeLanguage, languages } = useLanguage();
  
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
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <header className="bg-primary text-primary-foreground shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link href="/">
              <a className="flex items-center space-x-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-secondary" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
                <span className="font-bold text-xl">{t('app.name')}</span>
              </a>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-4">
            <Link href="/">
              <a className={`px-3 py-2 rounded-md text-sm font-medium ${
                location === "/" ? "text-white" : "text-primary-foreground/70 hover:text-white"
              } transition`}>
                <Home className="h-4 w-4 inline-block mr-1" />
                {t('nav.home')}
              </a>
            </Link>
            <Link href="/search">
              <a className={`px-3 py-2 rounded-md text-sm font-medium ${
                location.startsWith("/search") ? "text-white" : "text-primary-foreground/70 hover:text-white"
              } transition`}>
                {t('nav.search')}
              </a>
            </Link>
            <Link href="/how-it-works">
              <a className={`px-3 py-2 rounded-md text-sm font-medium ${
                location === "/how-it-works" ? "text-white" : "text-primary-foreground/70 hover:text-white"
              } transition`}>
                <Info className="h-4 w-4 inline-block mr-1" />
                {t('nav.how_it_works')}
              </a>
            </Link>
            <Link href="/support">
              <a className={`px-3 py-2 rounded-md text-sm font-medium ${
                location === "/support" ? "text-white" : "text-primary-foreground/70 hover:text-white"
              } transition`}>
                <MessageSquare className="h-4 w-4 inline-block mr-1" />
                {t('nav.support')}
              </a>
            </Link>
            <Link href="/faq">
              <a className={`px-3 py-2 rounded-md text-sm font-medium ${
                location === "/faq" ? "text-white" : "text-primary-foreground/70 hover:text-white"
              } transition`}>
                <HelpCircle className="h-4 w-4 inline-block mr-1" />
                {t('nav.faq')}
              </a>
            </Link>
          </nav>

          {/* Right Section (Language and Auth) */}
          <div className="hidden md:flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-primary-foreground">
                  <Globe className="h-4 w-4 mr-1" />
                  {languages[currentLanguage]?.nativeName || currentLanguage}
                  <ChevronDown className="h-4 w-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {Object.entries(languages).map(([code, { nativeName, flag }]) => (
                  <DropdownMenuItem 
                    key={code} 
                    onClick={() => changeLanguage(code)}
                    className="cursor-pointer"
                  >
                    <span className="mr-2">{flag}</span>
                    {nativeName}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {isLoggedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-primary-foreground">
                    <User className="h-4 w-4 mr-1" />
                    {user.username}
                    <ChevronDown className="h-4 w-4 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">
                      <a className="w-full flex items-center">
                        <CreditCard className="h-4 w-4 mr-2" />
                        {t('nav.my_tickets')}
                      </a>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    {t('nav.logout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/auth">
                <Button variant="secondary" size="sm">
                  <Lock className="h-4 w-4 mr-1" />
                  {t('nav.login')}
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-primary-foreground hover:text-white"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden p-4 bg-primary-foreground/10">
          <nav className="flex flex-col space-y-3">
            <Link href="/">
              <a className={`px-3 py-2 rounded-md text-sm font-medium ${
                location === "/" ? "text-white bg-primary-foreground/20" : "text-primary-foreground/70 hover:text-white"
              } transition`}>
                <Home className="h-4 w-4 inline-block mr-1" />
                {t('nav.home')}
              </a>
            </Link>
            <Link href="/search">
              <a className={`px-3 py-2 rounded-md text-sm font-medium ${
                location.startsWith("/search") ? "text-white bg-primary-foreground/20" : "text-primary-foreground/70 hover:text-white"
              } transition`}>
                {t('nav.search')}
              </a>
            </Link>
            <Link href="/how-it-works">
              <a className={`px-3 py-2 rounded-md text-sm font-medium ${
                location === "/how-it-works" ? "text-white bg-primary-foreground/20" : "text-primary-foreground/70 hover:text-white"
              } transition`}>
                <Info className="h-4 w-4 inline-block mr-1" />
                {t('nav.how_it_works')}
              </a>
            </Link>
            <Link href="/support">
              <a className={`px-3 py-2 rounded-md text-sm font-medium ${
                location === "/support" ? "text-white bg-primary-foreground/20" : "text-primary-foreground/70 hover:text-white"
              } transition`}>
                <MessageSquare className="h-4 w-4 inline-block mr-1" />
                {t('nav.support')}
              </a>
            </Link>
            <Link href="/faq">
              <a className={`px-3 py-2 rounded-md text-sm font-medium ${
                location === "/faq" ? "text-white bg-primary-foreground/20" : "text-primary-foreground/70 hover:text-white"
              } transition`}>
                <HelpCircle className="h-4 w-4 inline-block mr-1" />
                {t('nav.faq')}
              </a>
            </Link>

            <div className="pt-2 border-t border-primary-foreground/10">
              <div className="flex justify-between items-center">
                <div className="text-sm text-primary-foreground/70">{t('language')}:</div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-primary-foreground">
                      <Globe className="h-4 w-4 mr-1" />
                      {languages[currentLanguage]?.nativeName || currentLanguage}
                      <ChevronDown className="h-4 w-4 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {Object.entries(languages).map(([code, { nativeName, flag }]) => (
                      <DropdownMenuItem 
                        key={code} 
                        onClick={() => changeLanguage(code)}
                        className="cursor-pointer"
                      >
                        <span className="mr-2">{flag}</span>
                        {nativeName}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="pt-2">
              {isLoggedIn ? (
                <div className="space-y-2">
                  <div className="flex items-center px-3 py-2">
                    <User className="h-4 w-4 mr-2 text-primary-foreground/70" />
                    <span className="text-white">{user.username}</span>
                  </div>
                  <Link href="/dashboard">
                    <a className="block px-3 py-2 rounded-md text-sm font-medium text-primary-foreground/70 hover:text-white transition">
                      <CreditCard className="h-4 w-4 inline-block mr-1" />
                      {t('nav.my_tickets')}
                    </a>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-primary-foreground/70 hover:text-white transition"
                  >
                    <LogOut className="h-4 w-4 inline-block mr-1" />
                    {t('nav.logout')}
                  </button>
                </div>
              ) : (
                <Link href="/auth">
                  <a className="block w-full">
                    <Button variant="secondary" size="sm" className="w-full">
                      <Lock className="h-4 w-4 mr-1" />
                      {t('nav.login')}
                    </Button>
                  </a>
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}