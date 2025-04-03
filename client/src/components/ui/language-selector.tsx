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

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant={variant === 'default' ? 'ghost' : 'outline'} 
          size={variant === 'default' ? 'default' : 'sm'}
          className="flex items-center space-x-1 text-gray-700"
        >
          <Globe className="h-4 w-4 text-gray-500" />
          {variant === 'default' && (
            <span>{languages[currentLanguage]?.nativeName || 'English'}</span>
          )}
          <ChevronDown className="h-4 w-4 text-gray-500" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {Object.entries(languages).map(([code, { nativeName, flag }]) => (
          <DropdownMenuItem key={code} onClick={() => handleSelectLanguage(code)}>
            <span className="mr-2">{flag}</span> {nativeName}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSelector;
