import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { InsertPassenger } from '@shared/schema';

interface PassengerFormProps {
  passengerCount: number;
  onSubmit: (passengers: InsertPassenger[], contactInfo: { email: string; phone?: string }, specialRequests?: string) => void;
  savedPassengers?: InsertPassenger[];
}

const PassengerForm = ({ passengerCount, onSubmit, savedPassengers = [] }: PassengerFormProps) => {
  const { t } = useTranslation();
  
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
    phone: ''
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
  
  // Sample countries - in a real app, this would be a comprehensive list
  const countries = [
    { value: 'us', label: 'United States' },
    { value: 'gb', label: 'United Kingdom' },
    { value: 'in', label: 'India' },
    { value: 'ca', label: 'Canada' },
    { value: 'fr', label: 'France' },
    { value: 'de', label: 'Germany' },
    { value: 'jp', label: 'Japan' },
    { value: 'cn', label: 'China' },
    { value: 'au', label: 'Australia' },
    { value: 'br', label: 'Brazil' }
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
  
  const loadSavedPassenger = (index: number, savedPassenger: InsertPassenger) => {
    const updatedPassengers = [...passengers];
    updatedPassengers[index] = { ...savedPassenger, userId: undefined };
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
    
    if (Object.keys(contactErrors).length > 0) {
      newErrors.contact = contactErrors;
    }
    
    setErrors(newErrors);
    return isValid;
  };
  
  const handleSubmit = () => {
    if (validateForm()) {
      // Convert passengers to proper type and submit
      const validPassengers = passengers as InsertPassenger[];
      onSubmit(validPassengers, contactInfo, specialRequests);
    }
  };
  
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
            
            {/* Saved passenger selector - shown only if saved passengers exist */}
            {savedPassengers.length > 0 && (
              <Select onValueChange={(value) => {
                const savedPassenger = savedPassengers.find(p => p.id === parseInt(value));
                if (savedPassenger) {
                  loadSavedPassenger(index, savedPassenger);
                }
              }}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Load saved passenger" />
                </SelectTrigger>
                <SelectContent>
                  {savedPassengers.map((savedPassenger) => (
                    <SelectItem key={savedPassenger.id} value={savedPassenger.id?.toString() || ''}>
                      {savedPassenger.firstName} {savedPassenger.lastName}
                    </SelectItem>
                  ))}
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
              {/* Date of Birth */}
              <div>
                <Label htmlFor={`dateOfBirth-${index}`}>{t('date_of_birth')}</Label>
                <Input
                  id={`dateOfBirth-${index}`}
                  value={passenger.dateOfBirth}
                  onChange={(e) => updatePassenger(index, 'dateOfBirth', e.target.value)}
                  placeholder="DD/MM/YYYY"
                />
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
              
              {/* Passport Expiry */}
              <div>
                <Label htmlFor={`passportExpiry-${index}`}>{t('passport_expiry')}</Label>
                <Input
                  id={`passportExpiry-${index}`}
                  value={passenger.passportExpiry}
                  onChange={(e) => updatePassenger(index, 'passportExpiry', e.target.value)}
                  placeholder="DD/MM/YYYY"
                />
                {errors[`passenger${index}`]?.passportExpiry && (
                  <p className="text-red-500 text-sm mt-1">{errors[`passenger${index}`].passportExpiry}</p>
                )}
              </div>
            </div>
            
            <div className="mt-4">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id={`save-passenger-${index}`} 
                  checked={passenger.isSaved}
                  onCheckedChange={(checked) => updatePassenger(index, 'isSaved', checked)}
                />
                <label 
                  htmlFor={`save-passenger-${index}`}
                  className="text-sm text-gray-600 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {t('save_passenger')}
                </label>
              </div>
            </div>
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
