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
  
  // Helper variable for RTL languages
  const isRTL = currentLanguage === 'ar' || currentLanguage === 'he';
  
  // Initialize passenger array with the given count
  const [passengers, setPassengers] = useState<Array<Partial<InsertPassenger>>>(
    Array(passengerCount).fill({}).map((_, i) => ({
      // Remove title field as it doesn't exist in database
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
  
  // Map country values and translated labels for the dropdown
  const countries = [
    { value: 'af', label: getTranslatedCountryName('Afghanistan'), englishName: 'Afghanistan' },
    { value: 'al', label: getTranslatedCountryName('Albania'), englishName: 'Albania' },
    { value: 'dz', label: getTranslatedCountryName('Algeria'), englishName: 'Algeria' },
    { value: 'ad', label: getTranslatedCountryName('Andorra'), englishName: 'Andorra' },
    { value: 'ao', label: getTranslatedCountryName('Angola'), englishName: 'Angola' },
    { value: 'ag', label: getTranslatedCountryName('Antigua and Barbuda'), englishName: 'Antigua and Barbuda' },
    { value: 'ar', label: getTranslatedCountryName('Argentina'), englishName: 'Argentina' },
    { value: 'am', label: getTranslatedCountryName('Armenia'), englishName: 'Armenia' },
    { value: 'au', label: getTranslatedCountryName('Australia'), englishName: 'Australia' },
    { value: 'at', label: getTranslatedCountryName('Austria'), englishName: 'Austria' },
    { value: 'az', label: getTranslatedCountryName('Azerbaijan'), englishName: 'Azerbaijan' },
    { value: 'bs', label: getTranslatedCountryName('Bahamas'), englishName: 'Bahamas' },
    { value: 'bh', label: getTranslatedCountryName('Bahrain'), englishName: 'Bahrain' },
    { value: 'bd', label: getTranslatedCountryName('Bangladesh'), englishName: 'Bangladesh' },
    { value: 'bb', label: getTranslatedCountryName('Barbados'), englishName: 'Barbados' },
    { value: 'by', label: getTranslatedCountryName('Belarus'), englishName: 'Belarus' },
    { value: 'be', label: getTranslatedCountryName('Belgium'), englishName: 'Belgium' },
    { value: 'bz', label: getTranslatedCountryName('Belize'), englishName: 'Belize' },
    { value: 'bj', label: getTranslatedCountryName('Benin'), englishName: 'Benin' },
    { value: 'bt', label: getTranslatedCountryName('Bhutan'), englishName: 'Bhutan' },
    { value: 'bo', label: getTranslatedCountryName('Bolivia'), englishName: 'Bolivia' },
    { value: 'ba', label: getTranslatedCountryName('Bosnia and Herzegovina'), englishName: 'Bosnia and Herzegovina' },
    { value: 'bw', label: getTranslatedCountryName('Botswana'), englishName: 'Botswana' },
    { value: 'br', label: getTranslatedCountryName('Brazil'), englishName: 'Brazil' },
    { value: 'bn', label: getTranslatedCountryName('Brunei'), englishName: 'Brunei' },
    { value: 'bg', label: getTranslatedCountryName('Bulgaria'), englishName: 'Bulgaria' },
    { value: 'bf', label: getTranslatedCountryName('Burkina Faso'), englishName: 'Burkina Faso' },
    { value: 'bi', label: getTranslatedCountryName('Burundi'), englishName: 'Burundi' },
    { value: 'cv', label: getTranslatedCountryName('Cabo Verde'), englishName: 'Cabo Verde' },
    { value: 'kh', label: getTranslatedCountryName('Cambodia'), englishName: 'Cambodia' },
    { value: 'cm', label: getTranslatedCountryName('Cameroon'), englishName: 'Cameroon' },
    { value: 'ca', label: getTranslatedCountryName('Canada'), englishName: 'Canada' },
    { value: 'cf', label: getTranslatedCountryName('Central African Republic'), englishName: 'Central African Republic' },
    { value: 'td', label: getTranslatedCountryName('Chad'), englishName: 'Chad' },
    { value: 'cl', label: getTranslatedCountryName('Chile'), englishName: 'Chile' },
    { value: 'cn', label: getTranslatedCountryName('China'), englishName: 'China' },
    { value: 'co', label: getTranslatedCountryName('Colombia'), englishName: 'Colombia' },
    { value: 'km', label: getTranslatedCountryName('Comoros'), englishName: 'Comoros' },
    { value: 'cg', label: getTranslatedCountryName('Congo'), englishName: 'Congo' },
    { value: 'cd', label: getTranslatedCountryName('Congo (Democratic Republic)'), englishName: 'Congo (Democratic Republic)' },
    { value: 'cr', label: getTranslatedCountryName('Costa Rica'), englishName: 'Costa Rica' },
    { value: 'hr', label: getTranslatedCountryName('Croatia'), englishName: 'Croatia' },
    { value: 'cu', label: getTranslatedCountryName('Cuba'), englishName: 'Cuba' },
    { value: 'cy', label: getTranslatedCountryName('Cyprus'), englishName: 'Cyprus' },
    { value: 'cz', label: getTranslatedCountryName('Czech Republic'), englishName: 'Czech Republic' },
    { value: 'dk', label: getTranslatedCountryName('Denmark'), englishName: 'Denmark' },
    { value: 'dj', label: getTranslatedCountryName('Djibouti'), englishName: 'Djibouti' },
    { value: 'dm', label: getTranslatedCountryName('Dominica'), englishName: 'Dominica' },
    { value: 'do', label: getTranslatedCountryName('Dominican Republic'), englishName: 'Dominican Republic' },
    { value: 'ec', label: getTranslatedCountryName('Ecuador'), englishName: 'Ecuador' },
    { value: 'eg', label: getTranslatedCountryName('Egypt'), englishName: 'Egypt' },
    { value: 'sv', label: getTranslatedCountryName('El Salvador'), englishName: 'El Salvador' },
    { value: 'gq', label: getTranslatedCountryName('Equatorial Guinea'), englishName: 'Equatorial Guinea' },
    { value: 'er', label: getTranslatedCountryName('Eritrea'), englishName: 'Eritrea' },
    { value: 'ee', label: getTranslatedCountryName('Estonia'), englishName: 'Estonia' },
    { value: 'sz', label: getTranslatedCountryName('Eswatini'), englishName: 'Eswatini' },
    { value: 'et', label: getTranslatedCountryName('Ethiopia'), englishName: 'Ethiopia' },
    { value: 'fj', label: getTranslatedCountryName('Fiji'), englishName: 'Fiji' },
    { value: 'fi', label: getTranslatedCountryName('Finland'), englishName: 'Finland' },
    { value: 'fr', label: getTranslatedCountryName('France'), englishName: 'France' },
    { value: 'ga', label: getTranslatedCountryName('Gabon'), englishName: 'Gabon' },
    { value: 'gm', label: getTranslatedCountryName('Gambia'), englishName: 'Gambia' },
    { value: 'ge', label: getTranslatedCountryName('Georgia'), englishName: 'Georgia' },
    { value: 'de', label: getTranslatedCountryName('Germany'), englishName: 'Germany' },
    { value: 'gh', label: getTranslatedCountryName('Ghana'), englishName: 'Ghana' },
    { value: 'gr', label: getTranslatedCountryName('Greece'), englishName: 'Greece' },
    { value: 'gd', label: getTranslatedCountryName('Grenada'), englishName: 'Grenada' },
    { value: 'gt', label: getTranslatedCountryName('Guatemala'), englishName: 'Guatemala' },
    { value: 'gn', label: getTranslatedCountryName('Guinea'), englishName: 'Guinea' },
    { value: 'gw', label: getTranslatedCountryName('Guinea-Bissau'), englishName: 'Guinea-Bissau' },
    { value: 'gy', label: getTranslatedCountryName('Guyana'), englishName: 'Guyana' },
    { value: 'ht', label: getTranslatedCountryName('Haiti'), englishName: 'Haiti' },
    { value: 'hn', label: getTranslatedCountryName('Honduras'), englishName: 'Honduras' },
    { value: 'hu', label: getTranslatedCountryName('Hungary'), englishName: 'Hungary' },
    { value: 'is', label: getTranslatedCountryName('Iceland'), englishName: 'Iceland' },
    { value: 'in', label: getTranslatedCountryName('India'), englishName: 'India' },
    { value: 'id', label: getTranslatedCountryName('Indonesia'), englishName: 'Indonesia' },
    { value: 'ir', label: getTranslatedCountryName('Iran'), englishName: 'Iran' },
    { value: 'iq', label: getTranslatedCountryName('Iraq'), englishName: 'Iraq' },
    { value: 'ie', label: getTranslatedCountryName('Ireland'), englishName: 'Ireland' },
    { value: 'il', label: getTranslatedCountryName('Israel'), englishName: 'Israel' },
    { value: 'it', label: getTranslatedCountryName('Italy'), englishName: 'Italy' },
    { value: 'jm', label: getTranslatedCountryName('Jamaica'), englishName: 'Jamaica' },
    { value: 'jp', label: getTranslatedCountryName('Japan'), englishName: 'Japan' },
    { value: 'jo', label: getTranslatedCountryName('Jordan'), englishName: 'Jordan' },
    { value: 'kz', label: getTranslatedCountryName('Kazakhstan'), englishName: 'Kazakhstan' },
    { value: 'ke', label: getTranslatedCountryName('Kenya'), englishName: 'Kenya' },
    { value: 'ki', label: getTranslatedCountryName('Kiribati'), englishName: 'Kiribati' },
    { value: 'kp', label: getTranslatedCountryName('Korea (North)'), englishName: 'Korea (North)' },
    { value: 'kr', label: getTranslatedCountryName('Korea (South)'), englishName: 'Korea (South)' },
    { value: 'kw', label: getTranslatedCountryName('Kuwait'), englishName: 'Kuwait' },
    { value: 'kg', label: getTranslatedCountryName('Kyrgyzstan'), englishName: 'Kyrgyzstan' },
    { value: 'la', label: getTranslatedCountryName('Laos'), englishName: 'Laos' },
    { value: 'lv', label: getTranslatedCountryName('Latvia'), englishName: 'Latvia' },
    { value: 'lb', label: getTranslatedCountryName('Lebanon'), englishName: 'Lebanon' },
    { value: 'ls', label: getTranslatedCountryName('Lesotho'), englishName: 'Lesotho' },
    { value: 'lr', label: getTranslatedCountryName('Liberia'), englishName: 'Liberia' },
    { value: 'ly', label: getTranslatedCountryName('Libya'), englishName: 'Libya' },
    { value: 'li', label: getTranslatedCountryName('Liechtenstein'), englishName: 'Liechtenstein' },
    { value: 'lt', label: getTranslatedCountryName('Lithuania'), englishName: 'Lithuania' },
    { value: 'lu', label: getTranslatedCountryName('Luxembourg'), englishName: 'Luxembourg' },
    { value: 'mg', label: getTranslatedCountryName('Madagascar'), englishName: 'Madagascar' },
    { value: 'mw', label: getTranslatedCountryName('Malawi'), englishName: 'Malawi' },
    { value: 'my', label: getTranslatedCountryName('Malaysia'), englishName: 'Malaysia' },
    { value: 'mv', label: getTranslatedCountryName('Maldives'), englishName: 'Maldives' },
    { value: 'ml', label: getTranslatedCountryName('Mali'), englishName: 'Mali' },
    { value: 'mt', label: getTranslatedCountryName('Malta'), englishName: 'Malta' },
    { value: 'mh', label: getTranslatedCountryName('Marshall Islands'), englishName: 'Marshall Islands' },
    { value: 'mr', label: getTranslatedCountryName('Mauritania'), englishName: 'Mauritania' },
    { value: 'mu', label: getTranslatedCountryName('Mauritius'), englishName: 'Mauritius' },
    { value: 'mx', label: getTranslatedCountryName('Mexico'), englishName: 'Mexico' },
    { value: 'fm', label: getTranslatedCountryName('Micronesia'), englishName: 'Micronesia' },
    { value: 'md', label: getTranslatedCountryName('Moldova'), englishName: 'Moldova' },
    { value: 'mc', label: getTranslatedCountryName('Monaco'), englishName: 'Monaco' },
    { value: 'mn', label: getTranslatedCountryName('Mongolia'), englishName: 'Mongolia' },
    { value: 'me', label: getTranslatedCountryName('Montenegro'), englishName: 'Montenegro' },
    { value: 'ma', label: getTranslatedCountryName('Morocco'), englishName: 'Morocco' },
    { value: 'mz', label: getTranslatedCountryName('Mozambique'), englishName: 'Mozambique' },
    { value: 'mm', label: getTranslatedCountryName('Myanmar'), englishName: 'Myanmar' },
    { value: 'na', label: getTranslatedCountryName('Namibia'), englishName: 'Namibia' },
    { value: 'nr', label: getTranslatedCountryName('Nauru'), englishName: 'Nauru' },
    { value: 'np', label: getTranslatedCountryName('Nepal'), englishName: 'Nepal' },
    { value: 'nl', label: getTranslatedCountryName('Netherlands'), englishName: 'Netherlands' },
    { value: 'nz', label: getTranslatedCountryName('New Zealand'), englishName: 'New Zealand' },
    { value: 'ni', label: getTranslatedCountryName('Nicaragua'), englishName: 'Nicaragua' },
    { value: 'ne', label: getTranslatedCountryName('Niger'), englishName: 'Niger' },
    { value: 'ng', label: getTranslatedCountryName('Nigeria'), englishName: 'Nigeria' },
    { value: 'mk', label: getTranslatedCountryName('North Macedonia'), englishName: 'North Macedonia' },
    { value: 'no', label: getTranslatedCountryName('Norway'), englishName: 'Norway' },
    { value: 'om', label: getTranslatedCountryName('Oman'), englishName: 'Oman' },
    { value: 'pk', label: getTranslatedCountryName('Pakistan'), englishName: 'Pakistan' },
    { value: 'pw', label: getTranslatedCountryName('Palau'), englishName: 'Palau' },
    { value: 'pa', label: getTranslatedCountryName('Panama'), englishName: 'Panama' },
    { value: 'pg', label: getTranslatedCountryName('Papua New Guinea'), englishName: 'Papua New Guinea' },
    { value: 'py', label: getTranslatedCountryName('Paraguay'), englishName: 'Paraguay' },
    { value: 'pe', label: getTranslatedCountryName('Peru'), englishName: 'Peru' },
    { value: 'ph', label: getTranslatedCountryName('Philippines'), englishName: 'Philippines' },
    { value: 'pl', label: getTranslatedCountryName('Poland'), englishName: 'Poland' },
    { value: 'pt', label: getTranslatedCountryName('Portugal'), englishName: 'Portugal' },
    { value: 'qa', label: getTranslatedCountryName('Qatar'), englishName: 'Qatar' },
    { value: 'ro', label: getTranslatedCountryName('Romania'), englishName: 'Romania' },
    { value: 'ru', label: getTranslatedCountryName('Russia'), englishName: 'Russia' },
    { value: 'rw', label: getTranslatedCountryName('Rwanda'), englishName: 'Rwanda' },
    { value: 'kn', label: getTranslatedCountryName('Saint Kitts and Nevis'), englishName: 'Saint Kitts and Nevis' },
    { value: 'lc', label: getTranslatedCountryName('Saint Lucia'), englishName: 'Saint Lucia' },
    { value: 'vc', label: getTranslatedCountryName('Saint Vincent and the Grenadines'), englishName: 'Saint Vincent and the Grenadines' },
    { value: 'ws', label: getTranslatedCountryName('Samoa'), englishName: 'Samoa' },
    { value: 'sm', label: getTranslatedCountryName('San Marino'), englishName: 'San Marino' },
    { value: 'st', label: getTranslatedCountryName('Sao Tome and Principe'), englishName: 'Sao Tome and Principe' },
    { value: 'sa', label: getTranslatedCountryName('Saudi Arabia'), englishName: 'Saudi Arabia' },
    { value: 'sn', label: getTranslatedCountryName('Senegal'), englishName: 'Senegal' },
    { value: 'rs', label: getTranslatedCountryName('Serbia'), englishName: 'Serbia' },
    { value: 'sc', label: getTranslatedCountryName('Seychelles'), englishName: 'Seychelles' },
    { value: 'sl', label: getTranslatedCountryName('Sierra Leone'), englishName: 'Sierra Leone' },
    { value: 'sg', label: getTranslatedCountryName('Singapore'), englishName: 'Singapore' },
    { value: 'sk', label: getTranslatedCountryName('Slovakia'), englishName: 'Slovakia' },
    { value: 'si', label: getTranslatedCountryName('Slovenia'), englishName: 'Slovenia' },
    { value: 'sb', label: getTranslatedCountryName('Solomon Islands'), englishName: 'Solomon Islands' },
    { value: 'so', label: getTranslatedCountryName('Somalia'), englishName: 'Somalia' },
    { value: 'za', label: getTranslatedCountryName('South Africa'), englishName: 'South Africa' },
    { value: 'ss', label: getTranslatedCountryName('South Sudan'), englishName: 'South Sudan' },
    { value: 'es', label: getTranslatedCountryName('Spain'), englishName: 'Spain' },
    { value: 'lk', label: getTranslatedCountryName('Sri Lanka'), englishName: 'Sri Lanka' },
    { value: 'sd', label: getTranslatedCountryName('Sudan'), englishName: 'Sudan' },
    { value: 'sr', label: getTranslatedCountryName('Suriname'), englishName: 'Suriname' },
    { value: 'se', label: getTranslatedCountryName('Sweden'), englishName: 'Sweden' },
    { value: 'ch', label: getTranslatedCountryName('Switzerland'), englishName: 'Switzerland' },
    { value: 'sy', label: getTranslatedCountryName('Syria'), englishName: 'Syria' },
    { value: 'tj', label: getTranslatedCountryName('Tajikistan'), englishName: 'Tajikistan' },
    { value: 'tz', label: getTranslatedCountryName('Tanzania'), englishName: 'Tanzania' },
    { value: 'th', label: getTranslatedCountryName('Thailand'), englishName: 'Thailand' },
    { value: 'tl', label: getTranslatedCountryName('Timor-Leste'), englishName: 'Timor-Leste' },
    { value: 'tg', label: getTranslatedCountryName('Togo'), englishName: 'Togo' },
    { value: 'to', label: getTranslatedCountryName('Tonga'), englishName: 'Tonga' },
    { value: 'tt', label: getTranslatedCountryName('Trinidad and Tobago'), englishName: 'Trinidad and Tobago' },
    { value: 'tn', label: getTranslatedCountryName('Tunisia'), englishName: 'Tunisia' },
    { value: 'tr', label: getTranslatedCountryName('Turkey'), englishName: 'Turkey' },
    { value: 'tm', label: getTranslatedCountryName('Turkmenistan'), englishName: 'Turkmenistan' },
    { value: 'tv', label: getTranslatedCountryName('Tuvalu'), englishName: 'Tuvalu' },
    { value: 'ug', label: getTranslatedCountryName('Uganda'), englishName: 'Uganda' },
    { value: 'ua', label: getTranslatedCountryName('Ukraine'), englishName: 'Ukraine' },
    { value: 'ae', label: getTranslatedCountryName('United Arab Emirates'), englishName: 'United Arab Emirates' },
    { value: 'gb', label: getTranslatedCountryName('United Kingdom'), englishName: 'United Kingdom' },
    { value: 'us', label: getTranslatedCountryName('United States'), englishName: 'United States' },
    { value: 'uy', label: getTranslatedCountryName('Uruguay'), englishName: 'Uruguay' },
    { value: 'uz', label: getTranslatedCountryName('Uzbekistan'), englishName: 'Uzbekistan' },
    { value: 'vu', label: getTranslatedCountryName('Vanuatu'), englishName: 'Vanuatu' },
    { value: 'va', label: getTranslatedCountryName('Vatican City'), englishName: 'Vatican City' },
    { value: 've', label: getTranslatedCountryName('Venezuela'), englishName: 'Venezuela' },
    { value: 'vn', label: getTranslatedCountryName('Vietnam'), englishName: 'Vietnam' },
    { value: 'ye', label: getTranslatedCountryName('Yemen'), englishName: 'Yemen' },
    { value: 'zm', label: getTranslatedCountryName('Zambia'), englishName: 'Zambia' },
    { value: 'zw', label: getTranslatedCountryName('Zimbabwe'), englishName: 'Zimbabwe' }
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
      
      // Title field removed as it's not in database schema
      
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
              <div className={cn(
                "flex items-center gap-2 mt-2 w-full", 
                currentLanguage === 'ar' || currentLanguage === 'he' ? "justify-end" : ""
              )}>
                <span className="text-sm text-gray-600" dir={currentLanguage === 'ar' || currentLanguage === 'he' ? "rtl" : "ltr"}>
                  {t('load_saved_passenger', 'Load saved')}:
                </span>
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
                  <SelectTrigger 
                    className={cn("w-[220px]", currentLanguage === 'ar' || currentLanguage === 'he' ? "text-right" : "text-left")}
                    dir={currentLanguage === 'ar' || currentLanguage === 'he' ? "rtl" : "ltr"}
                  >
                    <SelectValue placeholder={t(savedPassengers.length > 0 ? 
                      'select_saved_passenger' : 
                      'no_saved_passengers', 
                      savedPassengers.length > 0 ? "Load saved passenger" : "No saved passengers yet")} 
                    />
                  </SelectTrigger>
                  <SelectContent align={currentLanguage === 'ar' || currentLanguage === 'he' ? "end" : "start"}>
                    <SelectItem 
                      value="none" 
                      className={currentLanguage === 'ar' || currentLanguage === 'he' ? "text-right" : ""}
                    >
                      {t('select_saved_passenger', 'Select a saved passenger')}
                    </SelectItem>
                    {savedPassengers.length > 0 ? (
                      savedPassengers.map((savedPassenger) => (
                        <SelectItem 
                          key={savedPassenger.id} 
                          value={savedPassenger.id?.toString() || 'unknown'}
                          className={currentLanguage === 'ar' || currentLanguage === 'he' ? "text-right" : ""}
                        >
                          {savedPassenger.firstName} {savedPassenger.lastName}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem 
                        value="none" 
                        disabled
                        className={currentLanguage === 'ar' || currentLanguage === 'he' ? "text-right" : ""}
                      >
                        {t('save_passenger_first', 'Save a passenger to select it later')}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          
          <div className="p-5">
            <div className={cn(
                "grid grid-cols-1 md:grid-cols-2 gap-4 mb-4",
                isRTL && "md:[direction:rtl]"
              )}>
              {/* Title field removed as it's not in the database schema */}
              
              {/* Nationality */}
              <div className={isRTL ? "md:pl-2" : "md:pr-2"}>
                <Label htmlFor={`nationality-${index}`}>{t('nationality')}</Label>
                <Select
                  value={passenger.nationality || ""}
                  onValueChange={(value) => updatePassenger(index, 'nationality', value)}
                >
                  <SelectTrigger 
                    id={`nationality-${index}`} 
                    className={cn(currentLanguage === 'ar' || currentLanguage === 'he' ? "text-right" : "")} 
                    dir={currentLanguage === 'ar' || currentLanguage === 'he' ? "rtl" : "ltr"}
                  >
                    <SelectValue placeholder={t('select_nationality')} />
                  </SelectTrigger>
                  <SelectContent align={currentLanguage === 'ar' || currentLanguage === 'he' ? "end" : "start"}>
                    {countries.map((country) => (
                      <SelectItem 
                        key={country.value} 
                        value={country.value}
                        className={currentLanguage === 'ar' || currentLanguage === 'he' ? "text-right" : ""}
                      >
                        {country.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors[`passenger${index}`]?.nationality && (
                  <p className="text-red-500 text-sm mt-1">{errors[`passenger${index}`].nationality}</p>
                )}
              </div>
            </div>
            
            <div className={cn(
                "grid grid-cols-1 md:grid-cols-2 gap-4 mb-4",
                isRTL && "md:[direction:rtl]"
              )}>
              {/* First Name */}
              <div className={isRTL ? "md:pl-2" : "md:pr-2"}>
                <Label htmlFor={`firstName-${index}`}>{t('first_name')}</Label>
                <Input
                  id={`firstName-${index}`}
                  value={passenger.firstName}
                  onChange={(e) => updatePassenger(index, 'firstName', e.target.value)}
                  placeholder={t('name_passport_placeholder')}
                  className={cn(
                    "text-sm",
                    isRTL ? "text-right" : "text-left"
                  )}
                  dir={isRTL ? "rtl" : "ltr"}
                />
                {errors[`passenger${index}`]?.firstName && (
                  <p className="text-red-500 text-sm mt-1">{errors[`passenger${index}`].firstName}</p>
                )}
              </div>
              
              {/* Last Name */}
              <div className={isRTL ? "md:pr-2" : "md:pl-2"}>
                <Label htmlFor={`lastName-${index}`}>{t('last_name')}</Label>
                <Input
                  id={`lastName-${index}`}
                  value={passenger.lastName}
                  onChange={(e) => updatePassenger(index, 'lastName', e.target.value)}
                  placeholder={t('name_passport_placeholder')}
                  className={cn(
                    "text-sm",
                    isRTL ? "text-right" : "text-left"
                  )}
                  dir={isRTL ? "rtl" : "ltr"}
                />
                {errors[`passenger${index}`]?.lastName && (
                  <p className="text-red-500 text-sm mt-1">{errors[`passenger${index}`].lastName}</p>
                )}
              </div>
            </div>
            
            <div className={cn(
                "grid grid-cols-1 md:grid-cols-3 gap-4 mb-4",
                isRTL && "md:[direction:rtl]"
              )}>
              {/* Date of Birth with Datepicker */}
              <div className={isRTL ? "md:pl-2" : "md:pr-2"}>
                <Label htmlFor={`dateOfBirth-${index}`}>{t('date_of_birth')}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id={`dateOfBirth-${index}`}
                      variant="outline"
                      className={cn(
                        "w-full font-normal text-sm flex justify-between items-center",
                        !passenger.dateOfBirth && "text-muted-foreground",
                        errors[`passenger${index}`]?.dateOfBirth && "border-red-500",
                        isRTL ? "text-right" : "text-left"
                      )}
                      dir={isRTL ? "rtl" : "ltr"}
                    >
                      {passenger.dateOfBirth ? format(new Date(passenger.dateOfBirth.split('/').reverse().join('-')), "PP") : "DD/MM/YYYY"}
                      <CalendarIcon className="h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align={isRTL ? "end" : "start"}>
                    <div className="p-0 bg-white rounded-md shadow-md border border-gray-200">
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
                        className="rounded-md border-0 bg-white [&_.rdp-day_button.rdp-day_selected]:bg-primary"
                      />
                    </div>
                  </PopoverContent>
                </Popover>
                {errors[`passenger${index}`]?.dateOfBirth && (
                  <p className="text-red-500 text-sm mt-1">{errors[`passenger${index}`].dateOfBirth}</p>
                )}
              </div>
              
              {/* Passport Number */}
              <div className={isRTL ? "md:px-2" : "md:px-2"}>
                <Label htmlFor={`passportNumber-${index}`}>{t('passport_number')}</Label>
                <Input
                  id={`passportNumber-${index}`}
                  value={passenger.passportNumber}
                  onChange={(e) => updatePassenger(index, 'passportNumber', e.target.value)}
                  placeholder={t('passport_number')}
                  className={cn(
                    "text-sm",
                    isRTL ? "text-right" : "text-left"
                  )}
                  dir={isRTL ? "rtl" : "ltr"}
                />
                {errors[`passenger${index}`]?.passportNumber && (
                  <p className="text-red-500 text-sm mt-1">{errors[`passenger${index}`].passportNumber}</p>
                )}
              </div>
              
              {/* Passport Expiry with Datepicker */}
              <div className={isRTL ? "md:pr-2" : "md:pl-2"}>
                <Label htmlFor={`passportExpiry-${index}`}>{t('passport_expiry')}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id={`passportExpiry-${index}`}
                      variant="outline"
                      className={cn(
                        "w-full font-normal text-sm flex justify-between items-center",
                        !passenger.passportExpiry && "text-muted-foreground",
                        errors[`passenger${index}`]?.passportExpiry && "border-red-500",
                        isRTL ? "text-right" : "text-left"
                      )}
                      dir={isRTL ? "rtl" : "ltr"}
                    >
                      {passenger.passportExpiry ? format(new Date(passenger.passportExpiry.split('/').reverse().join('-')), "PP") : "DD/MM/YYYY"}
                      <CalendarIcon className="h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align={isRTL ? "end" : "start"}>
                    <div className="p-0 bg-white rounded-md shadow-md border border-gray-200">
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
                        className="rounded-md border-0 bg-white [&_.rdp-day_button.rdp-day_selected]:bg-primary"
                        footer={
                          <p className="p-2 text-center text-sm text-gray-700 font-medium">
                            {t("passport_must_be_valid", "Passport must be valid")}
                          </p>
                        }
                      />
                    </div>
                  </PopoverContent>
                </Popover>
                {errors[`passenger${index}`]?.passportExpiry && (
                  <p className="text-red-500 text-sm mt-1">{errors[`passenger${index}`].passportExpiry}</p>
                )}
              </div>
            </div>
            
            {/* Save passenger checkbox - only show if user is authenticated (savedPassengers exists) */}
            {savedPassengers !== undefined && (
              <div className={cn("mt-4 w-full", isRTL ? "flex justify-end" : "")}>
                <div className={cn("flex items-center", isRTL ? "space-x-reverse space-x-2 flex-row-reverse" : "space-x-2")}>
                  <Checkbox 
                    id={`save-passenger-${index}`} 
                    checked={!!passenger.isSaved}
                    onCheckedChange={(checked: CheckedState) => updatePassenger(index, 'isSaved', checked === true)}
                  />
                  <label 
                    htmlFor={`save-passenger-${index}`}
                    className="text-sm text-gray-600 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    dir={isRTL ? "rtl" : "ltr"}
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
          <h3 className="font-heading font-semibold text-xl text-primary">{t('contact_info_title')}</h3>
        </div>
        
        <div className="p-5">
          <div className={cn(
            "grid grid-cols-1 md:grid-cols-2 gap-4",
            isRTL && "md:[direction:rtl]"
          )}>
            {/* Email */}
            <div className={isRTL ? "md:pl-2" : "md:pr-2"}>
              <Label htmlFor="contact-email">{t('email')}</Label>
              <Input
                id="contact-email"
                type="email"
                value={contactInfo.email}
                onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                placeholder={t('email_placeholder')}
                className={cn(
                  "text-sm",
                  isRTL ? "text-right" : "text-left"
                )}
                dir={isRTL ? "rtl" : "ltr"}
              />
              {errors.contact?.email && (
                <p className="text-red-500 text-sm mt-1">{errors.contact.email}</p>
              )}
            </div>
            
            {/* Phone */}
            <div className={isRTL ? "md:pr-2" : "md:pl-2"}>
              <Label htmlFor="contact-phone">{t('phone')}</Label>
              <Input
                id="contact-phone"
                type="tel"
                value={contactInfo.phone}
                onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                placeholder={t('phone_placeholder')}
                className={cn(
                  "text-sm",
                  isRTL ? "text-right" : "text-left"
                )}
                dir={isRTL ? "rtl" : "ltr"}
              />
              {errors.contact?.phone && (
                <p className="text-red-500 text-sm mt-1">{errors.contact.phone}</p>
              )}
            </div>
          </div>
          
          {/* Save contact information checkbox - only show if user is authenticated */}
          {savedPassengers !== undefined && (
            <div className={cn("mt-4 w-full", isRTL ? "flex justify-end" : "")}>
              <div className={cn("flex items-center", isRTL ? "space-x-reverse space-x-2 flex-row-reverse" : "space-x-2")}>
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
                  dir={isRTL ? "rtl" : "ltr"}
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
          <h3 className="font-heading font-semibold text-xl text-primary">{t('special_requests_title')}</h3>
        </div>
        
        <div className="p-5">
          <Textarea
            value={specialRequests}
            onChange={(e) => setSpecialRequests(e.target.value)}
            placeholder={t('special_requests_placeholder')}
            rows={3}
            className={cn(
              "text-sm",
              isRTL ? "text-right" : "text-left"
            )}
            dir={isRTL ? "rtl" : "ltr"}
          />
        </div>
      </div>
      
      {/* Continue Button */}
      <div className={cn(
        "flex", 
        isRTL ? "justify-start" : "justify-end"
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
