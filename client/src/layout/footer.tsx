import { Link } from 'wouter';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/context/language-context';

const Footer = () => {
  const { t } = useTranslation();
  const { languages, changeLanguage } = useLanguage();

  return (
    <footer className="bg-gray-800 text-white pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
              <span className="font-heading font-bold text-lg">{t('app_name')}</span>
            </div>
            <p className="text-gray-400 mb-4">
              {t('footer_description')}
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <i className="fab fa-linkedin-in"></i>
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="font-heading font-semibold text-lg mb-4">{t('quick_links')}</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/">
                  <a className="text-gray-400 hover:text-white transition">{t('footer_home')}</a>
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works">
                  <a className="text-gray-400 hover:text-white transition">{t('footer_how_it_works')}</a>
                </Link>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition">{t('footer_pricing')}</a>
              </li>
              <li>
                <Link href="/faq">
                  <a className="text-gray-400 hover:text-white transition">{t('footer_faq')}</a>
                </Link>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition">{t('footer_contact')}</a>
              </li>
            </ul>
          </div>
          
          {/* Support */}
          <div>
            <h3 className="font-heading font-semibold text-lg mb-4">{t('support')}</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white transition">{t('footer_help')}</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition">{t('footer_chat')}</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition">{t('footer_email')}</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition">{t('footer_terms')}</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition">{t('footer_privacy')}</a></li>
            </ul>
          </div>
          
          {/* Languages */}
          <div>
            <h3 className="font-heading font-semibold text-lg mb-4">{t('languages')}</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {Object.entries(languages).map(([code, { nativeName }]) => (
                <button 
                  key={code}
                  onClick={() => changeLanguage(code)}
                  className="text-left text-gray-400 hover:text-white transition"
                >
                  {nativeName}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-700 pt-6 text-center text-gray-400 text-sm">
          <p>{t('footer_copyright')}</p>
          <p className="mt-2">
            <span className="mr-2">{t('footer_we_accept')}</span>
            <i className="fab fa-cc-visa mr-2"></i>
            <i className="fab fa-cc-mastercard mr-2"></i>
            <i className="fab fa-cc-amex mr-2"></i>
            <i className="fab fa-cc-paypal"></i>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
