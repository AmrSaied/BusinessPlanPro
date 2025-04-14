import { useState } from 'react';
import { 
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Globe, ChevronDown } from 'lucide-react';
import { useLanguage } from '@/context/language-context';

interface LanguageSelectorProps {
  variant?: 'default' | 'minimal';
}

const LanguageSelector = ({ variant = 'default' }: LanguageSelectorProps) => {
  const { currentLanguage, changeLanguage, languages } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const handleSelectLanguage = (code: string) => {
    changeLanguage(code);
    setIsOpen(false);
  };

  // Determine if current language is RTL
  const isRtl = currentLanguage === 'ar';

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant={variant === 'default' ? 'ghost' : 'outline'} 
          size={variant === 'default' ? 'default' : 'sm'}
          className={`flex items-center ${isRtl ? 'space-x-reverse' : 'space-x-1'} text-gray-700`}
          dir={isRtl ? 'rtl' : 'ltr'}
        >
          <Globe className="h-4 w-4 text-gray-500" />
          {variant === 'default' && (
            <span className={isRtl ? 'mx-1' : ''}>{languages[currentLanguage]?.nativeName || 'English'}</span>
          )}
          <ChevronDown className="h-4 w-4 text-gray-500" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align={isRtl ? "start" : "end"} 
        className="w-48"
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        {/* Quick Arabic/English toggle at top for convenience */}
        {currentLanguage !== 'ar' && (
          <DropdownMenuItem 
            key="ar-quick" 
            onClick={() => handleSelectLanguage('ar')}
            className="font-bold border-b"
          >
            <span className="mr-2">🇸🇦</span> العربية
          </DropdownMenuItem>
        )}
        {currentLanguage !== 'en' && (
          <DropdownMenuItem 
            key="en-quick" 
            onClick={() => handleSelectLanguage('en')}
            className="font-bold border-b"
          >
            <span className="mr-2">🇺🇸</span> English
          </DropdownMenuItem>
        )}
        
        {/* All languages */}
        {Object.entries(languages).map(([code, { nativeName, flag }]) => (
          <DropdownMenuItem 
            key={code} 
            onClick={() => handleSelectLanguage(code)}
            className={currentLanguage === code ? 'bg-gray-100' : ''}
          >
            <span className={isRtl ? 'ml-2' : 'mr-2'}>{flag}</span> {nativeName}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSelector;
