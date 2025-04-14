import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { InsertPassenger, Passenger } from '@shared/schema';
import { CheckedState } from "@radix-ui/react-checkbox";
import { useLanguage } from '@/context/language-context';
import { 
  getNationalitiesForLanguage 
} from '@/i18n/nationalities';
import { Combobox } from '@/components/ui/combobox';

interface PassengerFormProps {
  passengerCount: number;
  onSubmit: (passengers: InsertPassenger[], contactInfo: { email: string; phone?: string; saveInfo?: boolean }, specialRequests?: string) => void;
  savedPassengers?: Passenger[];
}

const PassengerForm = ({ passengerCount, onSubmit, savedPassengers = [] }: PassengerFormProps) => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  
  // Initialize passenger array with the given count
  const [passengers, setPassengers] = useState<Array<Partial<InsertPassenger>>>(
    Array(passengerCount).fill({}).map((_, i) => ({
      title: '',
      firstName: '',
      lastName: '',
      nationality: '', // Always initialize as empty string, not undefined
      dateOfBirth: '',
      passportNumber: '',
      passportExpiry: '',
      isSaved: false
    }))
  );
  
  const [contactInfo, setContactInfo] = useState({
    email: '',
    phone: '',
    saveInfo: false
  });
  
  const [specialRequests, setSpecialRequests] = useState('');
  const [errors, setErrors] = useState<Record<string, Record<string, string>>>({});
  
  // Titles array for dropdown
  const titles = [
    { value: 'mr', label: t('passenger_title_mr') },
    { value: 'ms', label: t('passenger_title_ms') },
    { value: 'mrs', label: t('passenger_title_mrs') },
    { value: 'dr', label: t('passenger_title_dr') }
  ];
  
  // Get nationality translations based on current language
  const nationalityTranslations = getNationalitiesForLanguage(currentLanguage);
  
  // Helper function to get translated country name
  const getTranslatedCountryName = (englishName: string) => {
    return nationalityTranslations[englishName] || englishName;
  };
  
  // Helper function to normalize Arabic text (remove diacritics)
  const normalizeArabic = (text: string) => {
    // Remove Arabic diacritics and tatweel
    return text.replace(/[\u064B-\u065F\u0670\u0610-\u061A\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED\u0640]/g, '');
  };
  
  // Simple nationality filter for the current language with special handling for Arabic
  const nationalityFilter = (item: { value: string; label: string }, searchTerm: string) => {
    if (!searchTerm) return true;
    
    // Basic filter with Arabic text normalization support
    const normalizedInput = normalizeArabic(searchTerm.toLowerCase());
    const normalizedLabel = normalizeArabic(item.label.toLowerCase());
    
    return normalizedLabel.includes(normalizedInput) || 
           item.label.toLowerCase().includes(searchTerm.toLowerCase());
  };
  
  // Map country values and translated labels based on current language
  const countries = [
    { value: 'af', label: getTranslatedCountryName('Afghanistan') },
    { value: 'al', label: getTranslatedCountryName('Albania') },
    { value: 'dz', label: getTranslatedCountryName('Algeria') },
    { value: 'ad', label: getTranslatedCountryName('Andorra') },
    { value: 'ao', label: getTranslatedCountryName('Angola') },
    { value: 'ag', label: getTranslatedCountryName('Antigua and Barbuda') },
    { value: 'ar', label: getTranslatedCountryName('Argentina') },
    { value: 'am', label: getTranslatedCountryName('Armenia') },
    { value: 'au', label: getTranslatedCountryName('Australia') },
    { value: 'at', label: getTranslatedCountryName('Austria') },
    { value: 'az', label: getTranslatedCountryName('Azerbaijan') },
    { value: 'bs', label: getTranslatedCountryName('Bahamas') },
    { value: 'bh', label: getTranslatedCountryName('Bahrain') },
    { value: 'bd', label: getTranslatedCountryName('Bangladesh') },
    { value: 'bb', label: getTranslatedCountryName('Barbados') },
    { value: 'by', label: getTranslatedCountryName('Belarus') },
    { value: 'be', label: getTranslatedCountryName('Belgium') },
    { value: 'bz', label: getTranslatedCountryName('Belize') },
    { value: 'bj', label: getTranslatedCountryName('Benin') },
    { value: 'bt', label: getTranslatedCountryName('Bhutan') },
    { value: 'bo', label: getTranslatedCountryName('Bolivia') },
    { value: 'ba', label: getTranslatedCountryName('Bosnia and Herzegovina') },
    { value: 'bw', label: getTranslatedCountryName('Botswana') },
    { value: 'br', label: getTranslatedCountryName('Brazil') },
    { value: 'bn', label: getTranslatedCountryName('Brunei') },
    { value: 'bg', label: getTranslatedCountryName('Bulgaria') },
    { value: 'bf', label: getTranslatedCountryName('Burkina Faso') },
    { value: 'bi', label: getTranslatedCountryName('Burundi') },
    { value: 'cv', label: getTranslatedCountryName('Cabo Verde') },
    { value: 'kh', label: getTranslatedCountryName('Cambodia') },
    { value: 'cm', label: getTranslatedCountryName('Cameroon') },
    { value: 'ca', label: getTranslatedCountryName('Canada') },
    { value: 'cf', label: getTranslatedCountryName('Central African Republic') },
    { value: 'td', label: getTranslatedCountryName('Chad') },
    { value: 'cl', label: getTranslatedCountryName('Chile') },
    { value: 'cn', label: getTranslatedCountryName('China') },
    { value: 'co', label: getTranslatedCountryName('Colombia') },
    { value: 'km', label: getTranslatedCountryName('Comoros') },
    { value: 'cg', label: getTranslatedCountryName('Congo') },
    { value: 'cd', label: getTranslatedCountryName('Congo (Democratic Republic)') },
    { value: 'cr', label: getTranslatedCountryName('Costa Rica') },
    { value: 'hr', label: getTranslatedCountryName('Croatia') },
    { value: 'cu', label: getTranslatedCountryName('Cuba') },
    { value: 'cy', label: getTranslatedCountryName('Cyprus') },
    { value: 'cz', label: getTranslatedCountryName('Czech Republic') },
    { value: 'dk', label: getTranslatedCountryName('Denmark') },
    { value: 'dj', label: getTranslatedCountryName('Djibouti') },
    { value: 'dm', label: getTranslatedCountryName('Dominica') },
    { value: 'do', label: getTranslatedCountryName('Dominican Republic') },
    { value: 'ec', label: getTranslatedCountryName('Ecuador') },
    { value: 'eg', label: getTranslatedCountryName('Egypt') },
    { value: 'sv', label: getTranslatedCountryName('El Salvador') },
    { value: 'gq', label: getTranslatedCountryName('Equatorial Guinea') },
    { value: 'er', label: getTranslatedCountryName('Eritrea') },
    { value: 'ee', label: getTranslatedCountryName('Estonia') },
    { value: 'sz', label: getTranslatedCountryName('Eswatini') },
    { value: 'et', label: getTranslatedCountryName('Ethiopia') },
    { value: 'fj', label: getTranslatedCountryName('Fiji') },
    { value: 'fi', label: getTranslatedCountryName('Finland') },
    { value: 'fr', label: getTranslatedCountryName('France') },
    { value: 'ga', label: getTranslatedCountryName('Gabon') },
    { value: 'gm', label: getTranslatedCountryName('Gambia') },
    { value: 'ge', label: getTranslatedCountryName('Georgia') },
    { value: 'de', label: getTranslatedCountryName('Germany') },
    { value: 'gh', label: getTranslatedCountryName('Ghana') },
    { value: 'gr', label: getTranslatedCountryName('Greece') },
    { value: 'gd', label: getTranslatedCountryName('Grenada') },
    { value: 'gt', label: getTranslatedCountryName('Guatemala') },
    { value: 'gn', label: getTranslatedCountryName('Guinea') },
    { value: 'gw', label: getTranslatedCountryName('Guinea-Bissau') },
    { value: 'gy', label: getTranslatedCountryName('Guyana') },
    { value: 'ht', label: getTranslatedCountryName('Haiti') },
    { value: 'hn', label: getTranslatedCountryName('Honduras') },
    { value: 'hu', label: getTranslatedCountryName('Hungary') },
    { value: 'is', label: getTranslatedCountryName('Iceland') },
    { value: 'in', label: getTranslatedCountryName('India') },
    { value: 'id', label: getTranslatedCountryName('Indonesia') },
    { value: 'ir', label: getTranslatedCountryName('Iran') },
    { value: 'iq', label: getTranslatedCountryName('Iraq') },
    { value: 'ie', label: getTranslatedCountryName('Ireland') },
    { value: 'il', label: getTranslatedCountryName('Israel') },
    { value: 'it', label: getTranslatedCountryName('Italy') },
    { value: 'jm', label: getTranslatedCountryName('Jamaica') },
    { value: 'jp', label: getTranslatedCountryName('Japan') },
    { value: 'jo', label: getTranslatedCountryName('Jordan') },
    { value: 'kz', label: getTranslatedCountryName('Kazakhstan') },
    { value: 'ke', label: getTranslatedCountryName('Kenya') },
    { value: 'ki', label: getTranslatedCountryName('Kiribati') },
    { value: 'kp', label: getTranslatedCountryName('Korea (North)') },
    { value: 'kr', label: getTranslatedCountryName('Korea (South)') },
    { value: 'kw', label: getTranslatedCountryName('Kuwait') },
    { value: 'kg', label: getTranslatedCountryName('Kyrgyzstan') },
    { value: 'la', label: getTranslatedCountryName('Laos') },
    { value: 'lv', label: getTranslatedCountryName('Latvia') },
    { value: 'lb', label: getTranslatedCountryName('Lebanon') },
    { value: 'ls', label: getTranslatedCountryName('Lesotho') },
    { value: 'lr', label: getTranslatedCountryName('Liberia') },
    { value: 'ly', label: getTranslatedCountryName('Libya') },
    { value: 'li', label: getTranslatedCountryName('Liechtenstein') },
    { value: 'lt', label: getTranslatedCountryName('Lithuania') },
    { value: 'lu', label: getTranslatedCountryName('Luxembourg') },
    { value: 'mg', label: getTranslatedCountryName('Madagascar') },
    { value: 'mw', label: getTranslatedCountryName('Malawi') },
    { value: 'my', label: getTranslatedCountryName('Malaysia') },
    { value: 'mv', label: getTranslatedCountryName('Maldives') },
    { value: 'ml', label: getTranslatedCountryName('Mali') },
    { value: 'mt', label: getTranslatedCountryName('Malta') },
    { value: 'mh', label: getTranslatedCountryName('Marshall Islands') },
    { value: 'mr', label: getTranslatedCountryName('Mauritania') },
    { value: 'mu', label: getTranslatedCountryName('Mauritius') },
    { value: 'mx', label: getTranslatedCountryName('Mexico') },
    { value: 'fm', label: getTranslatedCountryName('Micronesia') },
    { value: 'md', label: getTranslatedCountryName('Moldova') },
    { value: 'mc', label: getTranslatedCountryName('Monaco') },
    { value: 'mn', label: getTranslatedCountryName('Mongolia') },
    { value: 'me', label: getTranslatedCountryName('Montenegro') },
    { value: 'ma', label: getTranslatedCountryName('Morocco') },
    { value: 'mz', label: getTranslatedCountryName('Mozambique') },
    { value: 'mm', label: getTranslatedCountryName('Myanmar') },
    { value: 'na', label: getTranslatedCountryName('Namibia') },
    { value: 'nr', label: getTranslatedCountryName('Nauru') },
    { value: 'np', label: getTranslatedCountryName('Nepal') },
    { value: 'nl', label: getTranslatedCountryName('Netherlands') },
    { value: 'nz', label: getTranslatedCountryName('New Zealand') },
    { value: 'ni', label: getTranslatedCountryName('Nicaragua') },
    { value: 'ne', label: getTranslatedCountryName('Niger') },
    { value: 'ng', label: getTranslatedCountryName('Nigeria') },
    { value: 'mk', label: getTranslatedCountryName('North Macedonia') },
    { value: 'no', label: getTranslatedCountryName('Norway') },
    { value: 'om', label: getTranslatedCountryName('Oman') },
    { value: 'pk', label: getTranslatedCountryName('Pakistan') },
    { value: 'pw', label: getTranslatedCountryName('Palau') },
    { value: 'pa', label: getTranslatedCountryName('Panama') },
    { value: 'pg', label: getTranslatedCountryName('Papua New Guinea') },
    { value: 'py', label: getTranslatedCountryName('Paraguay') },
    { value: 'pe', label: getTranslatedCountryName('Peru') },
    { value: 'ph', label: getTranslatedCountryName('Philippines') },
    { value: 'pl', label: getTranslatedCountryName('Poland') },
    { value: 'pt', label: getTranslatedCountryName('Portugal') },
    { value: 'qa', label: getTranslatedCountryName('Qatar') },
    { value: 'ro', label: getTranslatedCountryName('Romania') },
    { value: 'ru', label: getTranslatedCountryName('Russia') },
    { value: 'rw', label: getTranslatedCountryName('Rwanda') },
    { value: 'kn', label: getTranslatedCountryName('Saint Kitts and Nevis') },
    { value: 'lc', label: getTranslatedCountryName('Saint Lucia') },
    { value: 'vc', label: getTranslatedCountryName('Saint Vincent and the Grenadines') },
    { value: 'ws', label: getTranslatedCountryName('Samoa') },
    { value: 'sm', label: getTranslatedCountryName('San Marino') },
    { value: 'st', label: getTranslatedCountryName('Sao Tome and Principe') },
    { value: 'sa', label: getTranslatedCountryName('Saudi Arabia') },
    { value: 'sn', label: getTranslatedCountryName('Senegal') },
    { value: 'rs', label: getTranslatedCountryName('Serbia') },
    { value: 'sc', label: getTranslatedCountryName('Seychelles') },
    { value: 'sl', label: getTranslatedCountryName('Sierra Leone') },
    { value: 'sg', label: getTranslatedCountryName('Singapore') },
    { value: 'sk', label: getTranslatedCountryName('Slovakia') },
    { value: 'si', label: getTranslatedCountryName('Slovenia') },
    { value: 'sb', label: getTranslatedCountryName('Solomon Islands') },
    { value: 'so', label: getTranslatedCountryName('Somalia') },
    { value: 'za', label: getTranslatedCountryName('South Africa') },
    { value: 'ss', label: getTranslatedCountryName('South Sudan') },
    { value: 'es', label: getTranslatedCountryName('Spain') },
    { value: 'lk', label: getTranslatedCountryName('Sri Lanka') },
    { value: 'sd', label: getTranslatedCountryName('Sudan') },
    { value: 'sr', label: getTranslatedCountryName('Suriname') },
    { value: 'se', label: getTranslatedCountryName('Sweden') },
    { value: 'ch', label: getTranslatedCountryName('Switzerland') },
    { value: 'sy', label: getTranslatedCountryName('Syria') },
    { value: 'tj', label: getTranslatedCountryName('Tajikistan') },
    { value: 'tz', label: getTranslatedCountryName('Tanzania') },
    { value: 'th', label: getTranslatedCountryName('Thailand') },
    { value: 'tl', label: getTranslatedCountryName('Timor-Leste') },
    { value: 'tg', label: getTranslatedCountryName('Togo') },
    { value: 'to', label: getTranslatedCountryName('Tonga') },
    { value: 'tt', label: getTranslatedCountryName('Trinidad and Tobago') },
    { value: 'tn', label: getTranslatedCountryName('Tunisia') },
    { value: 'tr', label: getTranslatedCountryName('Turkey') },
    { value: 'tm', label: getTranslatedCountryName('Turkmenistan') },
    { value: 'tv', label: getTranslatedCountryName('Tuvalu') },
    { value: 'ug', label: getTranslatedCountryName('Uganda') },
    { value: 'ua', label: getTranslatedCountryName('Ukraine') },
    { value: 'ae', label: getTranslatedCountryName('United Arab Emirates') },
    { value: 'gb', label: getTranslatedCountryName('United Kingdom') },
    { value: 'us', label: getTranslatedCountryName('United States') },
    { value: 'uy', label: getTranslatedCountryName('Uruguay') },
    { value: 'uz', label: getTranslatedCountryName('Uzbekistan') },
    { value: 'vu', label: getTranslatedCountryName('Vanuatu') },
    { value: 'va', label: getTranslatedCountryName('Vatican City') },
    { value: 've', label: getTranslatedCountryName('Venezuela') },
    { value: 'vn', label: getTranslatedCountryName('Vietnam') },
    { value: 'ye', label: getTranslatedCountryName('Yemen') },
    { value: 'zm', label: getTranslatedCountryName('Zambia') },
    { value: 'zw', label: getTranslatedCountryName('Zimbabwe') }
  ];

  // Update a specific passenger's property
  const updatePassenger = (index: number, field: keyof Partial<InsertPassenger>, value: any) => {
    const updatedPassengers = [...passengers];
    updatedPassengers[index] = { ...updatedPassengers[index], [field]: value };
    setPassengers(updatedPassengers);
  };

  // Update contact information
  const updateContactInfo = (field: keyof typeof contactInfo, value: any) => {
    setContactInfo({ ...contactInfo, [field]: value });
  };

  // Load saved passengers if available for first passenger slots
  useEffect(() => {
    if (savedPassengers.length > 0) {
      const updatedPassengers = [...passengers];
      
      // Fill in saved passenger data for the first slots
      savedPassengers.slice(0, passengerCount).forEach((savedPassenger, index) => {
        if (index < passengerCount) {
          updatedPassengers[index] = {
            title: savedPassenger.title,
            firstName: savedPassenger.firstName,
            lastName: savedPassenger.lastName,
            nationality: savedPassenger.nationality,
            dateOfBirth: savedPassenger.dateOfBirth,
            passportNumber: savedPassenger.passportNumber,
            passportExpiry: savedPassenger.passportExpiry,
            isSaved: true
          };
        }
      });
      
      setPassengers(updatedPassengers);
    }
  }, [savedPassengers, passengerCount]);

  // Validate passenger data
  const validatePassengers = () => {
    const newErrors: Record<string, Record<string, string>> = {};
    let isValid = true;
    
    passengers.forEach((passenger, index) => {
      const passengerErrors: Record<string, string> = {};
      
      if (!passenger.title) {
        passengerErrors.title = t('field_required');
        isValid = false;
      }
      
      if (!passenger.firstName) {
        passengerErrors.firstName = t('field_required');
        isValid = false;
      }
      
      if (!passenger.lastName) {
        passengerErrors.lastName = t('field_required');
        isValid = false;
      }
      
      if (!passenger.nationality) {
        passengerErrors.nationality = t('field_required');
        isValid = false;
      }
      
      if (!passenger.dateOfBirth) {
        passengerErrors.dateOfBirth = t('field_required');
        isValid = false;
      } else {
        // Check that the date is in the past
        const dob = new Date(passenger.dateOfBirth);
        const today = new Date();
        
        if (dob > today) {
          passengerErrors.dateOfBirth = t('date_of_birth_future');
          isValid = false;
        }
      }
      
      if (!passenger.passportNumber) {
        passengerErrors.passportNumber = t('field_required');
        isValid = false;
      }
      
      if (!passenger.passportExpiry) {
        passengerErrors.passportExpiry = t('field_required');
        isValid = false;
      } else {
        // Check that the passport is not expired
        const expiry = new Date(passenger.passportExpiry);
        const today = new Date();
        
        if (expiry < today) {
          passengerErrors.passportExpiry = t('passport_expired');
          isValid = false;
        }
      }
      
      if (Object.keys(passengerErrors).length > 0) {
        newErrors[`passenger${index}`] = passengerErrors;
      }
    });
    
    // Validate contact information
    const contactErrors: Record<string, string> = {};
    
    if (!contactInfo.email) {
      contactErrors.email = t('field_required');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(contactInfo.email)) {
      contactErrors.email = t('invalid_email');
      isValid = false;
    }
    
    if (Object.keys(contactErrors).length > 0) {
      newErrors.contact = contactErrors;
    }
    
    setErrors(newErrors);
    return isValid;
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validatePassengers()) {
      // Create complete passenger objects
      const completePassengers = passengers.map(passenger => ({
        title: passenger.title || '',
        firstName: passenger.firstName || '',
        lastName: passenger.lastName || '',
        nationality: passenger.nationality || '',
        dateOfBirth: passenger.dateOfBirth || '',
        passportNumber: passenger.passportNumber || '',
        passportExpiry: passenger.passportExpiry || '',
        isSaved: passenger.isSaved || false
      }));
      
      onSubmit(completePassengers, contactInfo, specialRequests);
    }
  };

  // Format date for display
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '';
    return format(new Date(dateString), 'PPP');
  };
  
  // Get text direction based on current language
  const isRTL = currentLanguage === 'ar' || currentLanguage === 'he';

  return (
    <form onSubmit={handleSubmit} className="passenger-form space-y-8">
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-2xl font-semibold mb-6">{t('passenger_information')}</h2>
        
        {/* Passenger Inputs */}
        {passengers.map((passenger, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-medium mb-4">
              {t('passenger')} {index + 1}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {/* Title */}
              <div>
                <Label htmlFor={`title-${index}`}>{t('title')}</Label>
                <Select
                  value={passenger.title || ""}
                  onValueChange={(value) => updatePassenger(index, 'title', value)}
                >
                  <SelectTrigger id={`title-${index}`} className="w-full">
                    <SelectValue placeholder={t('select_title')} />
                  </SelectTrigger>
                  <SelectContent>
                    {titles.map((title) => (
                      <SelectItem key={title.value} value={title.value}>
                        {title.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors[`passenger${index}`]?.title && (
                  <p className="text-red-500 text-sm mt-1">{errors[`passenger${index}`].title}</p>
                )}
              </div>
              
              {/* Nationality */}
              <div>
                <Label htmlFor={`nationality-${index}`}>{t('nationality')}</Label>
                <Combobox
                  items={countries}
                  value={passenger.nationality || ""}
                  onChange={(value) => updatePassenger(index, 'nationality', value)}
                  placeholder={t('select_nationality')}
                  id={`nationality-${index}`}
                  customFilter={nationalityFilter}
                />
                {errors[`passenger${index}`]?.nationality && (
                  <p className="text-red-500 text-sm mt-1">{errors[`passenger${index}`].nationality}</p>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* First Name */}
              <div>
                <Label htmlFor={`firstName-${index}`}>{t('first_name')}</Label>
                <Input
                  id={`firstName-${index}`}
                  type="text"
                  placeholder={t('enter_first_name')}
                  value={passenger.firstName || ""}
                  onChange={(e) => updatePassenger(index, 'firstName', e.target.value)}
                  className={errors[`passenger${index}`]?.firstName ? "border-red-500" : ""}
                  dir="auto"
                />
                {errors[`passenger${index}`]?.firstName && (
                  <p className="text-red-500 text-sm mt-1">{errors[`passenger${index}`].firstName}</p>
                )}
              </div>
              
              {/* Last Name */}
              <div>
                <Label htmlFor={`lastName-${index}`}>{t('last_name')}</Label>
                <Input
                  id={`lastName-${index}`}
                  type="text"
                  placeholder={t('enter_last_name')}
                  value={passenger.lastName || ""}
                  onChange={(e) => updatePassenger(index, 'lastName', e.target.value)}
                  className={errors[`passenger${index}`]?.lastName ? "border-red-500" : ""}
                  dir="auto"
                />
                {errors[`passenger${index}`]?.lastName && (
                  <p className="text-red-500 text-sm mt-1">{errors[`passenger${index}`].lastName}</p>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {/* Date of Birth */}
              <div>
                <Label>{t('date_of_birth')}</Label>
                <div className="relative">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !passenger.dateOfBirth && "text-muted-foreground",
                          errors[`passenger${index}`]?.dateOfBirth && "border-red-500"
                        )}
                      >
                        {passenger.dateOfBirth ? (
                          formatDate(passenger.dateOfBirth)
                        ) : (
                          <span>{t('select_date')}</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={passenger.dateOfBirth ? new Date(passenger.dateOfBirth) : undefined}
                        onSelect={(date) => {
                          if (date) {
                            updatePassenger(index, 'dateOfBirth', format(date, 'yyyy-MM-dd'));
                          }
                        }}
                        disabled={(date) => {
                          // Disable future dates
                          return date > new Date();
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  {errors[`passenger${index}`]?.dateOfBirth && (
                    <p className="text-red-500 text-sm mt-1">{errors[`passenger${index}`].dateOfBirth}</p>
                  )}
                </div>
              </div>
              
              {/* Passport Number */}
              <div>
                <Label htmlFor={`passportNumber-${index}`}>{t('passport_number')}</Label>
                <Input
                  id={`passportNumber-${index}`}
                  type="text"
                  placeholder={t('enter_passport_number')}
                  value={passenger.passportNumber || ""}
                  onChange={(e) => updatePassenger(index, 'passportNumber', e.target.value)}
                  className={errors[`passenger${index}`]?.passportNumber ? "border-red-500" : ""}
                />
                {errors[`passenger${index}`]?.passportNumber && (
                  <p className="text-red-500 text-sm mt-1">{errors[`passenger${index}`].passportNumber}</p>
                )}
              </div>
              
              {/* Passport Expiry */}
              <div>
                <Label>{t('passport_expiry')}</Label>
                <div className="relative">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !passenger.passportExpiry && "text-muted-foreground",
                          errors[`passenger${index}`]?.passportExpiry && "border-red-500"
                        )}
                      >
                        {passenger.passportExpiry ? (
                          formatDate(passenger.passportExpiry)
                        ) : (
                          <span>{t('select_date')}</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={passenger.passportExpiry ? new Date(passenger.passportExpiry) : undefined}
                        onSelect={(date) => {
                          if (date) {
                            updatePassenger(index, 'passportExpiry', format(date, 'yyyy-MM-dd'));
                          }
                        }}
                        disabled={(date) => {
                          // Disable dates in the past
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          return date < today;
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  {errors[`passenger${index}`]?.passportExpiry && (
                    <p className="text-red-500 text-sm mt-1">{errors[`passenger${index}`].passportExpiry}</p>
                  )}
                </div>
              </div>
            </div>
            
            {index === 0 && (
              <div className="flex items-center space-x-2 mt-4">
                <Checkbox 
                  id={`save-passenger-${index}`} 
                  checked={passenger.isSaved || false}
                  onCheckedChange={(checked: CheckedState) => 
                    updatePassenger(index, 'isSaved', checked === true)
                  }
                />
                <label
                  htmlFor={`save-passenger-${index}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {t('save_passenger_info')}
                </label>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Contact Information */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-2xl font-semibold mb-6">{t('contact_information')}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="email">{t('email')} *</Label>
            <Input
              id="email"
              type="email"
              placeholder={t('enter_email')}
              value={contactInfo.email}
              onChange={(e) => updateContactInfo('email', e.target.value)}
              className={errors.contact?.email ? "border-red-500" : ""}
              dir="ltr"
            />
            {errors.contact?.email && (
              <p className="text-red-500 text-sm mt-1">{errors.contact.email}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="phone">{t('phone')} ({t('optional')})</Label>
            <Input
              id="phone"
              type="tel"
              placeholder={t('enter_phone')}
              value={contactInfo.phone || ""}
              onChange={(e) => updateContactInfo('phone', e.target.value)}
              dir="ltr"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-2 mt-4">
          <Checkbox 
            id="save-contact" 
            checked={contactInfo.saveInfo}
            onCheckedChange={(checked: CheckedState) => 
              updateContactInfo('saveInfo', checked === true)
            }
          />
          <label
            htmlFor="save-contact"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {t('save_contact_info')}
          </label>
        </div>
      </div>
      
      {/* Special Requests */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-2xl font-semibold mb-6">{t('special_requests')}</h2>
        
        <div>
          <Label htmlFor="special-requests">{t('special_requests_description')}</Label>
          <Textarea
            id="special-requests"
            placeholder={t('enter_special_requests')}
            value={specialRequests}
            onChange={(e) => setSpecialRequests(e.target.value)}
            rows={4}
            dir="auto"
          />
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button type="submit" size="lg" className="px-6">
          {t('continue_to_payment')}
        </Button>
      </div>
    </form>
  );
};

export default PassengerForm;