import { Link } from "wouter";
import { useTranslation } from "@/hooks/use-translation";
import { useLanguage } from "@/context/language-context";
import { CreditCard, InfoIcon, MailIcon, PhoneIcon, HelpCircle, Globe } from "lucide-react";

export default function Footer() {
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
    language: 'en',
    setLanguage: (lang: string) => console.log(`Would change to ${lang}`),
    availableLanguages: [
      { code: 'en', name: 'English' },
      { code: 'es', name: 'Español' }
    ]
  };
  
  try {
    languageContext = useLanguage();
  } catch (error) {
    console.error('Language context not available');
  }
  
  const { language, setLanguage, availableLanguages } = languageContext;

  return (
    <footer className="bg-primary text-primary-foreground pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-secondary"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
              <span className="font-heading font-bold text-lg">{t("app.name")}</span>
            </div>
            <p className="text-primary-foreground/70 mb-4">
              {t("app.description")}
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-primary-foreground/70 hover:text-primary-foreground transition">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" className="text-primary-foreground/70 hover:text-primary-foreground transition">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="text-primary-foreground/70 hover:text-primary-foreground transition">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#" className="text-primary-foreground/70 hover:text-primary-foreground transition">
                <i className="fab fa-linkedin-in"></i>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-heading font-semibold text-lg mb-4">{t("footer.quickLinks")}</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/">
                  <a className="text-primary-foreground/70 hover:text-primary-foreground transition">
                    {t("footer.home")}
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/search">
                  <a className="text-primary-foreground/70 hover:text-primary-foreground transition">
                    {t("footer.search")}
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/how-it-works">
                  <a className="text-primary-foreground/70 hover:text-primary-foreground transition">
                    {t("footer.howItWorks")}
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/faq">
                  <a className="text-primary-foreground/70 hover:text-primary-foreground transition">
                    {t("footer.faq")}
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/support">
                  <a className="text-primary-foreground/70 hover:text-primary-foreground transition">
                    {t("footer.contact")}
                  </a>
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Support */}
          <div>
            <h3 className="font-heading font-semibold text-lg mb-4">{t("footer.support")}</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-primary-foreground/70 hover:text-primary-foreground transition flex items-center">
                  <MailIcon className="h-4 w-4 mr-2" />
                  support@globalairtravelservices.com
                </a>
              </li>
              <li>
                <a href="#" className="text-primary-foreground/70 hover:text-primary-foreground transition flex items-center">
                  <PhoneIcon className="h-4 w-4 mr-2" />
                  +1 (555) 123-4567
                </a>
              </li>
              <li>
                <a href="#" className="text-primary-foreground/70 hover:text-primary-foreground transition flex items-center">
                  <HelpCircle className="h-4 w-4 mr-2" />
                  {t("footer.helpCenter")}
                </a>
              </li>
              <li>
                <a href="#" className="text-primary-foreground/70 hover:text-primary-foreground transition flex items-center">
                  <InfoIcon className="h-4 w-4 mr-2" />
                  {t("footer.termsOfService")}
                </a>
              </li>
              <li>
                <a href="#" className="text-primary-foreground/70 hover:text-primary-foreground transition flex items-center">
                  <InfoIcon className="h-4 w-4 mr-2" />
                  {t("footer.privacyPolicy")}
                </a>
              </li>
            </ul>
          </div>

          {/* Languages */}
          <div>
            <h3 className="font-heading font-semibold text-lg mb-4">{t("footer.languages")}</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {availableLanguages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={`text-left flex items-center ${
                    language === lang.code ? "text-primary-foreground font-medium" : "text-primary-foreground/70 hover:text-primary-foreground"
                  } transition`}
                >
                  <Globe className="h-4 w-4 mr-2" />
                  {lang.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-primary-foreground/10 pt-6 text-center text-primary-foreground/70 text-sm">
          <p>&copy; {new Date().getFullYear()} {t("app.name")}. {t("footer.copyright")}</p>
          <p className="mt-2">
            <span className="mr-2">{t("footer.paymentMethods")}</span>
            <CreditCard className="h-4 w-4 inline-block mx-1" />
            <CreditCard className="h-4 w-4 inline-block mx-1" />
            <CreditCard className="h-4 w-4 inline-block mx-1" />
            <CreditCard className="h-4 w-4 inline-block mx-1" />
          </p>
        </div>
      </div>
    </footer>
  );
}