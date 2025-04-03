import { useAuth } from "@/hooks/use-auth";
import { useTranslation } from "@/hooks/use-translation";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, X, Globe, LogOut, User } from "lucide-react";

const Header = () => {
  const { user, logoutMutation } = useAuth();
  const { t, language, setLanguage, availableLanguages } = useTranslation();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo Section */}
          <Link href="/" className="flex items-center space-x-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-primary"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
            <span className="font-heading font-bold text-xl text-primary">
              {t("app.name")}
            </span>
          </Link>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex space-x-8">
            <Link href="/" className={`font-medium ${location === '/' ? 'text-primary' : 'text-gray-600 hover:text-primary'} transition`}>
              {t("nav.home")}
            </Link>
            <a href="#how-it-works" className="font-medium text-gray-600 hover:text-primary transition">
              {t("nav.howItWorks")}
            </a>
            <Link href="/faq" className={`font-medium ${location === '/faq' ? 'text-primary' : 'text-gray-600 hover:text-primary'} transition`}>
              {t("nav.faq")}
            </Link>
            <Link href="/support" className={`font-medium ${location === '/support' ? 'text-primary' : 'text-gray-600 hover:text-primary'} transition`}>
              {t("nav.support")}
            </Link>
          </nav>

          {/* Language and Account Section */}
          <div className="flex items-center space-x-4">
            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center space-x-1 text-sm rounded-md px-2 py-1 text-gray-700 hover:bg-gray-100">
                  <Globe className="h-4 w-4 text-gray-500" />
                  <span>{availableLanguages.find(lang => lang.code === language)?.name || 'English'}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {availableLanguages.map((lang) => (
                  <DropdownMenuItem 
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={language === lang.code ? "bg-muted" : ""}
                  >
                    {lang.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Account / Login */}
            <div className="hidden sm:block">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-1">
                      <User className="h-4 w-4 mr-1" />
                      {user.username}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href="/account" className="cursor-pointer w-full">
                        {t("nav.account")}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                      <LogOut className="h-4 w-4 mr-2" />
                      {t("auth.logout")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link href="/auth">
                  <Button className="bg-primary text-white px-4 py-2 rounded-md font-medium hover:bg-primary-600 transition">
                    {t("auth.signIn")} / {t("auth.register")}
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-500 hover:text-gray-700"
            onClick={toggleMobileMenu}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4">
            <nav className="flex flex-col space-y-3">
              <Link
                href="/"
                className="font-medium text-gray-600 hover:text-primary transition py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t("nav.home")}
              </Link>
              <a
                href="#how-it-works"
                className="font-medium text-gray-600 hover:text-primary transition py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t("nav.howItWorks")}
              </a>
              <Link
                href="/faq"
                className="font-medium text-gray-600 hover:text-primary transition py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t("nav.faq")}
              </Link>
              <Link
                href="/support"
                className="font-medium text-gray-600 hover:text-primary transition py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t("nav.support")}
              </Link>
              {user ? (
                <>
                  <Link
                    href="/account"
                    className="font-medium text-gray-600 hover:text-primary transition py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t("nav.account")}
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="font-medium text-gray-600 hover:text-primary transition py-2 text-left"
                  >
                    {t("auth.logout")}
                  </button>
                </>
              ) : (
                <Link
                  href="/auth"
                  className="bg-primary text-white px-4 py-2 rounded-md font-medium hover:bg-primary-600 transition text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t("auth.signIn")} / {t("auth.register")}
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
