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
import { getNationalitiesForLanguage } from '@/i18n/nationalities';

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
      nationality: '',
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
  
  // Map country values and translated labels
  const countries = [
    { value: 'af', label: nationalityTranslations['Afghanistan'] || 'Afghanistan' },
    { value: 'al', label: nationalityTranslations['Albania'] || 'Albania' },
    { value: 'dz', label: nationalityTranslations['Algeria'] || 'Algeria' },
    { value: 'ad', label: nationalityTranslations['Andorra'] || 'Andorra' },
    { value: 'ao', label: nationalityTranslations['Angola'] || 'Angola' },
    { value: 'ag', label: nationalityTranslations['Antigua and Barbuda'] || 'Antigua and Barbuda' },
    { value: 'ar', label: nationalityTranslations['Argentina'] || 'Argentina' },
    { value: 'am', label: nationalityTranslations['Armenia'] || 'Armenia' },
    { value: 'au', label: nationalityTranslations['Australia'] || 'Australia' },
    { value: 'at', label: nationalityTranslations['Austria'] || 'Austria' },
    { value: 'az', label: nationalityTranslations['Azerbaijan'] || 'Azerbaijan' },
    { value: 'bs', label: nationalityTranslations['Bahamas'] || 'Bahamas' },
    { value: 'bh', label: nationalityTranslations['Bahrain'] || 'Bahrain' },
    { value: 'bd', label: nationalityTranslations['Bangladesh'] || 'Bangladesh' },
    { value: 'bb', label: nationalityTranslations['Barbados'] || 'Barbados' },
    { value: 'by', label: nationalityTranslations['Belarus'] || 'Belarus' },
    { value: 'be', label: 'Belgium' },
    { value: 'bz', label: 'Belize' },
    { value: 'bj', label: 'Benin' },
    { value: 'bt', label: 'Bhutan' },
    { value: 'bo', label: 'Bolivia' },
    { value: 'ba', label: 'Bosnia and Herzegovina' },
    { value: 'bw', label: 'Botswana' },
    { value: 'br', label: 'Brazil' },
    { value: 'bn', label: 'Brunei' },
    { value: 'bg', label: 'Bulgaria' },
    { value: 'bf', label: 'Burkina Faso' },
    { value: 'bi', label: 'Burundi' },
    { value: 'cv', label: 'Cabo Verde' },
    { value: 'kh', label: 'Cambodia' },
    { value: 'cm', label: 'Cameroon' },
    { value: 'ca', label: 'Canada' },
    { value: 'cf', label: 'Central African Republic' },
    { value: 'td', label: 'Chad' },
    { value: 'cl', label: 'Chile' },
    { value: 'cn', label: nationalityTranslations['China'] || 'China' },
    { value: 'co', label: nationalityTranslations['Colombia'] || 'Colombia' },
    { value: 'km', label: nationalityTranslations['Comoros'] || 'Comoros' },
    { value: 'cg', label: nationalityTranslations['Congo'] || 'Congo' },
    { value: 'cd', label: nationalityTranslations['Congo (Democratic Republic)'] || 'Congo (Democratic Republic)' },
    { value: 'cr', label: 'Costa Rica' },
    { value: 'hr', label: 'Croatia' },
    { value: 'cu', label: 'Cuba' },
    { value: 'cy', label: 'Cyprus' },
    { value: 'cz', label: 'Czech Republic' },
    { value: 'dk', label: 'Denmark' },
    { value: 'dj', label: 'Djibouti' },
    { value: 'dm', label: 'Dominica' },
    { value: 'do', label: 'Dominican Republic' },
    { value: 'ec', label: 'Ecuador' },
    { value: 'eg', label: nationalityTranslations['Egypt'] || 'Egypt' },
    { value: 'sv', label: nationalityTranslations['El Salvador'] || 'El Salvador' },
    { value: 'gq', label: nationalityTranslations['Equatorial Guinea'] || 'Equatorial Guinea' },
    { value: 'er', label: nationalityTranslations['Eritrea'] || 'Eritrea' },
    { value: 'ee', label: nationalityTranslations['Estonia'] || 'Estonia' },
    { value: 'sz', label: 'Eswatini' },
    { value: 'et', label: 'Ethiopia' },
    { value: 'fj', label: 'Fiji' },
    { value: 'fi', label: 'Finland' },
    { value: 'fr', label: 'France' },
    { value: 'ga', label: 'Gabon' },
    { value: 'gm', label: 'Gambia' },
    { value: 'ge', label: 'Georgia' },
    { value: 'de', label: 'Germany' },
    { value: 'gh', label: 'Ghana' },
    { value: 'gr', label: 'Greece' },
    { value: 'gd', label: 'Grenada' },
    { value: 'gt', label: 'Guatemala' },
    { value: 'gn', label: 'Guinea' },
    { value: 'gw', label: 'Guinea-Bissau' },
    { value: 'gy', label: 'Guyana' },
    { value: 'ht', label: 'Haiti' },
    { value: 'hn', label: 'Honduras' },
    { value: 'hu', label: 'Hungary' },
    { value: 'is', label: 'Iceland' },
    { value: 'in', label: 'India' },
    { value: 'id', label: 'Indonesia' },
    { value: 'ir', label: 'Iran' },
    { value: 'iq', label: 'Iraq' },
    { value: 'ie', label: 'Ireland' },
    { value: 'il', label: 'Israel' },
    { value: 'it', label: 'Italy' },
    { value: 'jm', label: 'Jamaica' },
    { value: 'jp', label: 'Japan' },
    { value: 'jo', label: 'Jordan' },
    { value: 'kz', label: 'Kazakhstan' },
    { value: 'ke', label: 'Kenya' },
    { value: 'ki', label: 'Kiribati' },
    { value: 'kp', label: 'Korea (North)' },
    { value: 'kr', label: 'Korea (South)' },
    { value: 'kw', label: 'Kuwait' },
    { value: 'kg', label: 'Kyrgyzstan' },
    { value: 'la', label: 'Laos' },
    { value: 'lv', label: 'Latvia' },
    { value: 'lb', label: 'Lebanon' },
    { value: 'ls', label: 'Lesotho' },
    { value: 'lr', label: 'Liberia' },
    { value: 'ly', label: 'Libya' },
    { value: 'li', label: 'Liechtenstein' },
    { value: 'lt', label: 'Lithuania' },
    { value: 'lu', label: 'Luxembourg' },
    { value: 'mg', label: 'Madagascar' },
    { value: 'mw', label: 'Malawi' },
    { value: 'my', label: 'Malaysia' },
    { value: 'mv', label: 'Maldives' },
    { value: 'ml', label: 'Mali' },
    { value: 'mt', label: 'Malta' },
    { value: 'mh', label: 'Marshall Islands' },
    { value: 'mr', label: 'Mauritania' },
    { value: 'mu', label: 'Mauritius' },
    { value: 'mx', label: 'Mexico' },
    { value: 'fm', label: 'Micronesia' },
    { value: 'md', label: 'Moldova' },
    { value: 'mc', label: 'Monaco' },
    { value: 'mn', label: 'Mongolia' },
    { value: 'me', label: 'Montenegro' },
    { value: 'ma', label: 'Morocco' },
    { value: 'mz', label: 'Mozambique' },
    { value: 'mm', label: 'Myanmar' },
    { value: 'na', label: 'Namibia' },
    { value: 'nr', label: 'Nauru' },
    { value: 'np', label: 'Nepal' },
    { value: 'nl', label: 'Netherlands' },
    { value: 'nz', label: 'New Zealand' },
    { value: 'ni', label: 'Nicaragua' },
    { value: 'ne', label: 'Niger' },
    { value: 'ng', label: 'Nigeria' },
    { value: 'mk', label: 'North Macedonia' },
    { value: 'no', label: 'Norway' },
    { value: 'om', label: 'Oman' },
    { value: 'pk', label: 'Pakistan' },
    { value: 'pw', label: 'Palau' },
    { value: 'pa', label: 'Panama' },
    { value: 'pg', label: 'Papua New Guinea' },
    { value: 'py', label: 'Paraguay' },
    { value: 'pe', label: 'Peru' },
    { value: 'ph', label: 'Philippines' },
    { value: 'pl', label: 'Poland' },
    { value: 'pt', label: 'Portugal' },
    { value: 'qa', label: 'Qatar' },
    { value: 'ro', label: 'Romania' },
    { value: 'ru', label: 'Russia' },
    { value: 'rw', label: 'Rwanda' },
    { value: 'kn', label: 'Saint Kitts and Nevis' },
    { value: 'lc', label: 'Saint Lucia' },
    { value: 'vc', label: 'Saint Vincent and the Grenadines' },
    { value: 'ws', label: 'Samoa' },
    { value: 'sm', label: 'San Marino' },
    { value: 'st', label: 'Sao Tome and Principe' },
    { value: 'sa', label: nationalityTranslations['Saudi Arabia'] || 'Saudi Arabia' },
    { value: 'sn', label: nationalityTranslations['Senegal'] || 'Senegal' },
    { value: 'rs', label: nationalityTranslations['Serbia'] || 'Serbia' },
    { value: 'sc', label: nationalityTranslations['Seychelles'] || 'Seychelles' },
    { value: 'sl', label: nationalityTranslations['Sierra Leone'] || 'Sierra Leone' },
    { value: 'sg', label: 'Singapore' },
    { value: 'sk', label: 'Slovakia' },
    { value: 'si', label: 'Slovenia' },
    { value: 'sb', label: 'Solomon Islands' },
    { value: 'so', label: 'Somalia' },
    { value: 'za', label: 'South Africa' },
    { value: 'ss', label: 'South Sudan' },
    { value: 'es', label: nationalityTranslations['Spain'] || 'Spain' },
    { value: 'lk', label: nationalityTranslations['Sri Lanka'] || 'Sri Lanka' },
    { value: 'sd', label: nationalityTranslations['Sudan'] || 'Sudan' },
    { value: 'sr', label: nationalityTranslations['Suriname'] || 'Suriname' },
    { value: 'se', label: nationalityTranslations['Sweden'] || 'Sweden' },
    { value: 'ch', label: 'Switzerland' },
    { value: 'sy', label: 'Syria' },
    { value: 'tj', label: 'Tajikistan' },
    { value: 'tz', label: 'Tanzania' },
    { value: 'th', label: 'Thailand' },
    { value: 'tl', label: 'Timor-Leste' },
    { value: 'tg', label: 'Togo' },
    { value: 'to', label: 'Tonga' },
    { value: 'tt', label: 'Trinidad and Tobago' },
    { value: 'tn', label: 'Tunisia' },
    { value: 'tr', label: 'Turkey' },
    { value: 'tm', label: 'Turkmenistan' },
    { value: 'tv', label: 'Tuvalu' },
    { value: 'ug', label: 'Uganda' },
    { value: 'ua', label: 'Ukraine' },
    { value: 'ae', label: nationalityTranslations['United Arab Emirates'] || 'United Arab Emirates' },
    { value: 'gb', label: nationalityTranslations['United Kingdom'] || 'United Kingdom' },
    { value: 'us', label: nationalityTranslations['United States'] || 'United States' },
    { value: 'uy', label: nationalityTranslations['Uruguay'] || 'Uruguay' },
    { value: 'uz', label: nationalityTranslations['Uzbekistan'] || 'Uzbekistan' },
    { value: 'vu', label: nationalityTranslations['Vanuatu'] || 'Vanuatu' },
    { value: 'va', label: nationalityTranslations['Vatican City'] || 'Vatican City' },
    { value: 've', label: 'Venezuela' },
    { value: 'vn', label: 'Vietnam' },
    { value: 'ye', label: 'Yemen' },
    { value: 'zm', label: 'Zambia' },
    { value: 'zw', label: 'Zimbabwe' }
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
              <Select 
                onValueChange={(value) => {
                  const savedPassenger = savedPassengers.find(p => p.id === parseInt(value));
                  if (savedPassenger) {
                    loadSavedPassenger(index, savedPassenger);
                  }
                }}
                disabled={savedPassengers.length === 0}
              >
                <SelectTrigger className="w-[220px]">
                  <SelectValue placeholder={savedPassengers.length > 0 ? 
                    "Load saved passenger" : 
                    "No saved passengers yet"} 
                  />
                </SelectTrigger>
                <SelectContent>
                  {savedPassengers.length > 0 ? (
                    savedPassengers.map((savedPassenger) => (
                      <SelectItem key={savedPassenger.id} value={savedPassenger.id?.toString() || ''}>
                        {savedPassenger.firstName} {savedPassenger.lastName}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>
                      Save a passenger to select it later
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
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
                <Select 
                  value={passenger.nationality} 
                  onValueChange={(value) => updatePassenger(index, 'nationality', value)}
                >
                  <SelectTrigger id={`nationality-${index}`}>
                    <SelectValue placeholder={t('select_nationality')} />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country.value} value={country.value}>{country.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id={`save-passenger-${index}`} 
                    checked={!!passenger.isSaved}
                    onCheckedChange={(checked: CheckedState) => updatePassenger(index, 'isSaved', checked === true)}
                  />
                  <label 
                    htmlFor={`save-passenger-${index}`}
                    className="text-sm text-gray-600 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {t('save_passenger')}
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
              <div className="flex items-center space-x-2">
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
                  {t('save_contact_info')}
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
      <div className="flex justify-end">
        <Button 
          onClick={handleSubmit}
          className="bg-primary text-white hover:bg-primary/90 px-6 py-3"
        >
          {t('continue_payment')}
        </Button>
      </div>
    </div>
  );
};

export default PassengerForm;
