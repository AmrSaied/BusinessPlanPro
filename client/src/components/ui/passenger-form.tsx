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
  getNationalitiesForLanguage, 
  matchNationalityInAnyLanguage 
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
  
  // Map country values and translated labels
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
  
  const updatePassenger = (index: number, field: string, value: any) => {
    const updatedPassengers = [...passengers];
    updatedPassengers[index] = {
      ...updatedPassengers[index],
      [field]: value
    };
    
    // Clear error for this field if it exists
    if (errors[`passenger${index}`]?.[field]) {
      const updatedErrors = { ...errors };
      delete updatedErrors[`passenger${index}`][field];
      setErrors(updatedErrors);
    }
    
    setPassengers(updatedPassengers);
  };
  
  const loadSavedPassenger = (index: number, savedPassenger: Passenger) => {
    const updatedPassengers = [...passengers];
    // Take fields from the saved passenger but omit the id and userId
    const { id, userId, ...passengerData } = savedPassenger;
    updatedPassengers[index] = { 
      ...passengerData,
      isSaved: true
    };
    setPassengers(updatedPassengers);
  };
  
  const validateForm = () => {
    const newErrors: Record<string, Record<string, string>> = {};
    let isValid = true;
    
    // Validate each passenger
    passengers.forEach((passenger, index) => {
      const passengerErrors: Record<string, string> = {};
      
      if (!passenger.title) {
        passengerErrors.title = t('error_required');
        isValid = false;
      }
      
      if (!passenger.firstName) {
        passengerErrors.firstName = t('error_required');
        isValid = false;
      }
      
      if (!passenger.lastName) {
        passengerErrors.lastName = t('error_required');
        isValid = false;
      }
      
      if (!passenger.nationality) {
        passengerErrors.nationality = t('error_required');
        isValid = false;
      }
      
      if (!passenger.dateOfBirth) {
        passengerErrors.dateOfBirth = t('error_required');
        isValid = false;
      } else if (!/^\d{2}\/\d{2}\/\d{4}$/.test(passenger.dateOfBirth)) {
        passengerErrors.dateOfBirth = t('error_date_format');
        isValid = false;
      }
      
      if (!passenger.passportNumber) {
        passengerErrors.passportNumber = t('error_required');
        isValid = false;
      }
      
      if (!passenger.passportExpiry) {
        passengerErrors.passportExpiry = t('error_required');
        isValid = false;
      } else if (!/^\d{2}\/\d{2}\/\d{4}$/.test(passenger.passportExpiry)) {
        passengerErrors.passportExpiry = t('error_date_format');
        isValid = false;
      }
      
      if (Object.keys(passengerErrors).length > 0) {
        newErrors[`passenger${index}`] = passengerErrors;
      }
    });
    
    // Validate contact info
    const contactErrors: Record<string, string> = {};
    
    if (!contactInfo.email) {
      contactErrors.email = t('error_required');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(contactInfo.email)) {
      contactErrors.email = t('error_email');
      isValid = false;
    }
    
    // Phone is optional, but if provided should have a valid format
    if (contactInfo.phone && !/^[\d\+\-\s\(\)\.]+$/.test(contactInfo.phone)) {
      contactErrors.phone = t('error_phone');
      isValid = false;
    }
    
    if (Object.keys(contactErrors).length > 0) {
      newErrors.contact = contactErrors;
    }
    
    setErrors(newErrors);
    return isValid;
  };
  
  const handleSubmit = () => {
    if (validateForm()) {
      // Add logging to debug contactInfo
      console.log('Submitting passenger form with contactInfo:', contactInfo);
      
      // Convert passengers to proper type and submit
      const validPassengers = passengers as InsertPassenger[];
      onSubmit(validPassengers, contactInfo, specialRequests);
    }
  };
  
  // Pre-fill first passenger with first saved passenger if available
  useEffect(() => {
    if (savedPassengers && savedPassengers.length > 0 && passengers.length > 0) {
      // Only pre-fill if passenger data is empty (to avoid overwriting user input)
      const firstPassenger = passengers[0];
      const isEmpty = !firstPassenger.firstName && 
                      !firstPassenger.lastName && 
                      !firstPassenger.passportNumber;
      
      if (isEmpty) {
        loadSavedPassenger(0, savedPassengers[0]);
      }
    }
  }, [savedPassengers]);
  
  // Pre-fill contact information if user has it saved
  useEffect(() => {
    if (savedPassengers !== undefined && savedPassengers.length > 0) {
      // Get user from first passenger (all passengers belong to same user)
      const firstPassenger = savedPassengers[0];
      if (firstPassenger.userId) {
        // Fetch user data to get preferred contact info
        fetch(`/api/users/${firstPassenger.userId}`)
          .then(res => res.json())
          .then(userData => {
            if (userData.phone || userData.preferredEmail) {
              setContactInfo(prevInfo => ({
                ...prevInfo,
                phone: userData.phone || prevInfo.phone,
                email: userData.preferredEmail || prevInfo.email
              }));
            }
          })
          .catch(err => console.error('Error fetching user contact info:', err));
      }
    }
  }, [savedPassengers]);
  
  return (
    <div>
      <div className="mb-6">
        <h2 className="font-heading font-semibold text-2xl mb-2">{t('passenger_title')}</h2>
        <p className="text-gray-600">{t('passenger_subtitle')}</p>
      </div>
      
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center">
          <div className="flex items-center text-primary relative">
            <div className="rounded-full transition h-8 w-8 flex items-center justify-center bg-primary text-white">
              <i className="fas fa-check text-xs"></i>
            </div>
            <div className="absolute top-0 -ml-10 text-center mt-10 w-32 text-xs font-medium text-primary">{t('progress_flight')}</div>
          </div>
          <div className="flex-auto border-t-2 border-primary"></div>
          <div className="flex items-center text-primary relative">
            <div className="rounded-full transition h-8 w-8 flex items-center justify-center bg-primary text-white">
              <i className="fas fa-check text-xs"></i>
            </div>
            <div className="absolute top-0 -ml-10 text-center mt-10 w-32 text-xs font-medium text-primary">{t('progress_options')}</div>
          </div>
          <div className="flex-auto border-t-2 border-primary"></div>
          <div className="flex items-center text-primary relative">
            <div className="rounded-full transition h-8 w-8 flex items-center justify-center bg-primary text-white">
              <span className="text-xs">3</span>
            </div>
            <div className="absolute top-0 -ml-10 text-center mt-10 w-32 text-xs font-medium text-primary">{t('progress_passenger')}</div>
          </div>
          <div className="flex-auto border-t-2 transition border-gray-300"></div>
          <div className="flex items-center text-gray-500 relative">
            <div className="rounded-full transition h-8 w-8 border-2 border-gray-300 flex items-center justify-center">
              <span className="text-xs">4</span>
            </div>
            <div className="absolute top-0 -ml-10 text-center mt-10 w-32 text-xs font-medium text-gray-500">{t('progress_payment')}</div>
          </div>
        </div>
      </div>
      
      {/* Passenger Forms */}
      {passengers.map((passenger, index) => (
        <div key={index} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden mb-6">
          <div className="p-5 border-b border-gray-200 flex justify-between items-center">
            <h3 className="font-heading font-semibold text-lg">
              {t('passenger_number')} {index + 1}
            </h3>
            
            {/* Saved passenger selector - shown only if user is authenticated */}
            {savedPassengers !== undefined && (
              <div className={cn("flex items-center gap-2", currentLanguage === 'ar' || currentLanguage === 'he' ? "flex-row-reverse" : "")}>
                <span className="text-sm text-gray-600">{t('load_saved_passenger', 'Load saved')}:</span>
                <Select 
                  onValueChange={(value) => {
                    if (value === "none") return;
                    const savedPassenger = savedPassengers.find(p => p.id === parseInt(value));
                    if (savedPassenger) {
                      loadSavedPassenger(index, savedPassenger);
                    }
                  }}
                  disabled={savedPassengers.length === 0}
                  dir={currentLanguage === 'ar' || currentLanguage === 'he' ? "rtl" : "ltr"}
                >
                  <SelectTrigger className={cn("w-[220px]", currentLanguage === 'ar' || currentLanguage === 'he' ? "text-right" : "text-left")}>
                    <SelectValue placeholder={t(savedPassengers.length > 0 ? 
                      'select_saved_passenger' : 
                      'no_saved_passengers', 
                      savedPassengers.length > 0 ? "Load saved passenger" : "No saved passengers yet")} 
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t('select_saved_passenger', 'Select a saved passenger')}</SelectItem>
                    {savedPassengers.length > 0 ? (
                      savedPassengers.map((savedPassenger) => (
                        <SelectItem key={savedPassenger.id} value={savedPassenger.id?.toString() || ''}>
                          {savedPassenger.title}. {savedPassenger.firstName} {savedPassenger.lastName}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="none" disabled>
                        {t('save_passenger_first', 'Save a passenger to select it later')}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          
          <div className="p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Title */}
              <div>
                <Label htmlFor={`title-${index}`}>{t('passenger_title_label')}</Label>
                <Select 
                  value={passenger.title} 
                  onValueChange={(value) => updatePassenger(index, 'title', value)}
                >
                  <SelectTrigger id={`title-${index}`}>
                    <SelectValue placeholder={t('passenger_select_title')} />
                  </SelectTrigger>
                  <SelectContent>
                    {titles.map((title) => (
                      <SelectItem key={title.value} value={title.value}>{title.label}</SelectItem>
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
                  value={passenger.firstName}
                  onChange={(e) => updatePassenger(index, 'firstName', e.target.value)}
                  placeholder={t('name_passport_placeholder')}
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
                  value={passenger.lastName}
                  onChange={(e) => updatePassenger(index, 'lastName', e.target.value)}
                  placeholder={t('name_passport_placeholder')}
                />
                {errors[`passenger${index}`]?.lastName && (
                  <p className="text-red-500 text-sm mt-1">{errors[`passenger${index}`].lastName}</p>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {/* Date of Birth with Datepicker */}
              <div>
                <Label htmlFor={`dateOfBirth-${index}`}>{t('date_of_birth')}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id={`dateOfBirth-${index}`}
                      variant="outline"
                      className={cn(
                        "w-full text-left font-normal flex justify-between items-center",
                        !passenger.dateOfBirth && "text-muted-foreground",
                        errors[`passenger${index}`]?.dateOfBirth && "border-red-500"
                      )}
                    >
                      {passenger.dateOfBirth ? format(new Date(passenger.dateOfBirth.split('/').reverse().join('-')), "PP") : "DD/MM/YYYY"}
                      <CalendarIcon className="h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      captionLayout="dropdown-buttons"
                      fromYear={1920}
                      toYear={new Date().getFullYear()}
                      defaultMonth={passenger.dateOfBirth ? new Date(passenger.dateOfBirth.split('/').reverse().join('-')) : undefined}
                      selected={passenger.dateOfBirth ? new Date(passenger.dateOfBirth.split('/').reverse().join('-')) : undefined}
                      onSelect={(date) => {
                        if (date) {
                          const formattedDate = format(date, "dd/MM/yyyy");
                          updatePassenger(index, 'dateOfBirth', formattedDate);
                        }
                      }}
                      disabled={(date) => date > new Date()}
                    />
                  </PopoverContent>
                </Popover>
                {errors[`passenger${index}`]?.dateOfBirth && (
                  <p className="text-red-500 text-sm mt-1">{errors[`passenger${index}`].dateOfBirth}</p>
                )}
              </div>
              
              {/* Passport Number */}
              <div>
                <Label htmlFor={`passportNumber-${index}`}>{t('passport_number')}</Label>
                <Input
                  id={`passportNumber-${index}`}
                  value={passenger.passportNumber}
                  onChange={(e) => updatePassenger(index, 'passportNumber', e.target.value)}
                  placeholder={t('passport_number')}
                />
                {errors[`passenger${index}`]?.passportNumber && (
                  <p className="text-red-500 text-sm mt-1">{errors[`passenger${index}`].passportNumber}</p>
                )}
              </div>
              
              {/* Passport Expiry with Datepicker */}
              <div>
                <Label htmlFor={`passportExpiry-${index}`}>{t('passport_expiry')}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id={`passportExpiry-${index}`}
                      variant="outline"
                      className={cn(
                        "w-full text-left font-normal flex justify-between items-center",
                        !passenger.passportExpiry && "text-muted-foreground",
                        errors[`passenger${index}`]?.passportExpiry && "border-red-500"
                      )}
                    >
                      {passenger.passportExpiry ? format(new Date(passenger.passportExpiry.split('/').reverse().join('-')), "PP") : "DD/MM/YYYY"}
                      <CalendarIcon className="h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      captionLayout="dropdown-buttons"
                      fromYear={new Date().getFullYear()}
                      toYear={new Date().getFullYear() + 20}
                      defaultMonth={passenger.passportExpiry ? new Date(passenger.passportExpiry.split('/').reverse().join('-')) : new Date()}
                      selected={passenger.passportExpiry ? new Date(passenger.passportExpiry.split('/').reverse().join('-')) : undefined}
                      onSelect={(date) => {
                        if (date) {
                          const formattedDate = format(date, "dd/MM/yyyy");
                          updatePassenger(index, 'passportExpiry', formattedDate);
                        }
                      }}
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
                {errors[`passenger${index}`]?.passportExpiry && (
                  <p className="text-red-500 text-sm mt-1">{errors[`passenger${index}`].passportExpiry}</p>
                )}
              </div>
            </div>
            
            {/* Save passenger checkbox - only show if user is authenticated (savedPassengers exists) */}
            {savedPassengers !== undefined && (
              <div className="mt-4">
                <div className={cn(
                  "flex items-center", 
                  currentLanguage === 'ar' || currentLanguage === 'he' ? "space-x-reverse space-x-2 flex-row-reverse" : "space-x-2"
                )}>
                  <Checkbox 
                    id={`save-passenger-${index}`} 
                    checked={!!passenger.isSaved}
                    onCheckedChange={(checked: CheckedState) => updatePassenger(index, 'isSaved', checked === true)}
                  />
                  <label 
                    htmlFor={`save-passenger-${index}`}
                    className="text-sm text-gray-600 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {t('save_passenger', 'Save this passenger for future bookings')}
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
      
      {/* Email & Contact Information */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden mb-6">
        <div className="p-5 border-b border-gray-200">
          <h3 className="font-heading font-semibold text-lg">{t('contact_info_title')}</h3>
        </div>
        
        <div className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Email */}
            <div>
              <Label htmlFor="contact-email">{t('email')}</Label>
              <Input
                id="contact-email"
                type="email"
                value={contactInfo.email}
                onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                placeholder={t('email_placeholder')}
              />
              {errors.contact?.email && (
                <p className="text-red-500 text-sm mt-1">{errors.contact.email}</p>
              )}
            </div>
            
            {/* Phone */}
            <div>
              <Label htmlFor="contact-phone">{t('phone')}</Label>
              <Input
                id="contact-phone"
                type="tel"
                value={contactInfo.phone}
                onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                placeholder={t('phone_placeholder')}
              />
              {errors.contact?.phone && (
                <p className="text-red-500 text-sm mt-1">{errors.contact.phone}</p>
              )}
            </div>
          </div>
          
          {/* Save contact information checkbox - only show if user is authenticated */}
          {savedPassengers !== undefined && (
            <div className="mt-4">
              <div className={cn(
                "flex items-center", 
                currentLanguage === 'ar' || currentLanguage === 'he' ? "space-x-reverse space-x-2 flex-row-reverse" : "space-x-2"
              )}>
                <Checkbox 
                  id="save-contact-info" 
                  checked={!!contactInfo.saveInfo}
                  onCheckedChange={(checked: CheckedState) => 
                    setContactInfo({ ...contactInfo, saveInfo: checked === true })
                  }
                />
                <label 
                  htmlFor="save-contact-info"
                  className="text-sm text-gray-600 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {t('save_contact_info', 'Save contact information for future bookings')}
                </label>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Special Requests */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden mb-6">
        <div className="p-5 border-b border-gray-200">
          <h3 className="font-heading font-semibold text-lg">{t('special_requests_title')}</h3>
        </div>
        
        <div className="p-5">
          <Textarea
            value={specialRequests}
            onChange={(e) => setSpecialRequests(e.target.value)}
            placeholder={t('special_requests_placeholder')}
            rows={3}
          />
        </div>
      </div>
      
      {/* Continue Button */}
      <div className={cn(
        "flex", 
        currentLanguage === 'ar' || currentLanguage === 'he' ? "justify-start" : "justify-end"
      )}>
        <Button 
          onClick={handleSubmit}
          className="bg-primary text-white hover:bg-primary/90 px-6 py-3"
        >
          {t('continue_payment', 'Continue to Payment')}
        </Button>
      </div>
    </div>
  );
};

export default PassengerForm;
