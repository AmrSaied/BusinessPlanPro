import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Flight, Payment } from '@shared/schema';
import { Loader2 } from 'lucide-react';
import PaymentMethodSelector from './payment-method-selector';
import { SiPaypal } from 'react-icons/si';

interface PaymentFormProps {
  flight: Flight;
  totalPrice: number;
  options: {
    expressProcessing: boolean;
    editableTicket: boolean;
    hotelReservation: boolean;
    insuranceLetter: boolean;
  };
  onPaymentComplete: (paymentData: Payment) => void;
  isProcessing?: boolean;
}

const PaymentForm = ({ 
  flight, 
  totalPrice, 
  options, 
  onPaymentComplete,
  isProcessing = false
}: PaymentFormProps) => {
  const { t } = useTranslation();
  
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal'>('card');
  
  const [paymentData, setPaymentData] = useState<Partial<Payment>>({
    amount: totalPrice,
    currency: 'USD',
    paymentMethod: 'card',
    cardNumber: '',
    cardExpiry: '',
    cardCvc: '',
    cardHolderName: ''
  });
  
  const [billingAddress, setBillingAddress] = useState({
    country: '',
    address: '',
    city: '',
    postalCode: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Sample countries for billing address
  const countries = [
    { value: 'us', label: 'United States' },
    { value: 'gb', label: 'United Kingdom' },
    { value: 'ca', label: 'Canada' },
    { value: 'au', label: 'Australia' },
    { value: 'fr', label: 'France' },
    { value: 'de', label: 'Germany' },
    { value: 'jp', label: 'Japan' },
    { value: 'cn', label: 'China' },
    { value: 'in', label: 'India' },
    { value: 'br', label: 'Brazil' }
  ];
  
  const handleInputChange = (field: string, value: string) => {
    setPaymentData({
      ...paymentData,
      [field]: value
    });
    
    // Clear error for this field if it exists
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };
  
  const handleAddressChange = (field: string, value: string) => {
    setBillingAddress({
      ...billingAddress,
      [field]: value
    });
    
    // Clear error for this field if it exists
    if (errors[`address_${field}`]) {
      const newErrors = { ...errors };
      delete newErrors[`address_${field}`];
      setErrors(newErrors);
    }
  };
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    let isValid = true;
    
    // For PayPal payment, we don't validate card information
    if (paymentMethod === 'card') {
      // Validate card information
      if (!paymentData.cardNumber) {
        newErrors.cardNumber = t('error_required');
        isValid = false;
      } else if (!/^\d{16}$/.test(paymentData.cardNumber)) {
        newErrors.cardNumber = t('error_invalid_card');
        isValid = false;
      }
      
      if (!paymentData.cardExpiry) {
        newErrors.cardExpiry = t('error_required');
        isValid = false;
      } else if (!/^\d{2}\/\d{2}$/.test(paymentData.cardExpiry)) {
        newErrors.cardExpiry = t('error_date_format');
        isValid = false;
      }
      
      if (!paymentData.cardCvc) {
        newErrors.cardCvc = t('error_required');
        isValid = false;
      } else if (!/^\d{3,4}$/.test(paymentData.cardCvc)) {
        newErrors.cardCvc = t('error_invalid_card');
        isValid = false;
      }
      
      if (!paymentData.cardHolderName) {
        newErrors.cardHolderName = t('error_required');
        isValid = false;
      }
      
      // Validate billing address
      if (!billingAddress.country) {
        newErrors.address_country = t('error_required');
        isValid = false;
      }
      
      if (!billingAddress.address) {
        newErrors.address_address = t('error_required');
        isValid = false;
      }
      
      if (!billingAddress.city) {
        newErrors.address_city = t('error_required');
        isValid = false;
      }
      
      if (!billingAddress.postalCode) {
        newErrors.address_postalCode = t('error_required');
        isValid = false;
      }
    }
    
    setErrors(newErrors);
    return isValid;
  };
  
  const handlePaymentMethodChange = (method: 'card' | 'paypal') => {
    setPaymentMethod(method);
    setPaymentData({
      ...paymentData,
      paymentMethod: method
    });
    setErrors({});
  };

  const handleSubmit = () => {
    if (validateForm() && !isProcessing) {
      onPaymentComplete(paymentData as Payment);
    }
  };
  
  return (
    <div>
      <div className="mb-6">
        <h2 className="font-heading font-semibold text-2xl mb-2">{t('payment_title')}</h2>
        <p className="text-gray-600">{t('payment_subtitle')}</p>
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
              <i className="fas fa-check text-xs"></i>
            </div>
            <div className="absolute top-0 -ml-10 text-center mt-10 w-32 text-xs font-medium text-primary">{t('progress_passenger')}</div>
          </div>
          <div className="flex-auto border-t-2 transition border-primary"></div>
          <div className="flex items-center text-primary relative">
            <div className="rounded-full transition h-8 w-8 flex items-center justify-center bg-primary text-white">
              <span className="text-xs">4</span>
            </div>
            <div className="absolute top-0 -ml-10 text-center mt-10 w-32 text-xs font-medium text-primary">{t('progress_payment')}</div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payment Form */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden mb-6">
            <div className="p-5 border-b border-gray-200">
              <h3 className="font-heading font-semibold text-lg">{t('payment_method')}</h3>
            </div>
            
            <div className="p-5">
              {/* Payment Method Selector */}
              <div className="mb-6">
                <PaymentMethodSelector 
                  selectedMethod={paymentMethod}
                  onSelectMethod={handlePaymentMethodChange}
                />
              </div>

              {/* PayPal Information - Only show if PayPal payment method is selected */}
              {paymentMethod === 'paypal' && (
                <div className="my-8 text-center">
                  <p className="mb-4 text-gray-600">{t('select_paypal_description')}</p>
                  <div className="flex justify-center">
                    <SiPaypal className="h-12 w-16 text-[#003087]" />
                  </div>
                  <p className="mt-4 text-sm text-gray-500">
                    {t('paypal_redirect_notice')}
                  </p>
                </div>
              )}
              
              {/* Card Information - Only show if card payment method is selected */}
              {paymentMethod === 'card' && (
              <div className="mb-6">
                <h4 className="font-medium text-gray-800 mb-4">{t('card_info')}</h4>
                <div className="space-y-4">
                  {/* Card Number */}
                  <div>
                    <Label htmlFor="card-number">{t('card_number')}</Label>
                    <Input
                      id="card-number"
                      value={paymentData.cardNumber}
                      onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                      placeholder="1234 5678 9012 3456"
                      maxLength={16}
                    />
                    {errors.cardNumber && (
                      <p className="text-red-500 text-sm mt-1">{errors.cardNumber}</p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {/* Card Expiry */}
                    <div>
                      <Label htmlFor="card-expiry">{t('card_expiry')}</Label>
                      <Input
                        id="card-expiry"
                        value={paymentData.cardExpiry}
                        onChange={(e) => handleInputChange('cardExpiry', e.target.value)}
                        placeholder="MM/YY"
                        maxLength={5}
                      />
                      {errors.cardExpiry && (
                        <p className="text-red-500 text-sm mt-1">{errors.cardExpiry}</p>
                      )}
                    </div>
                    
                    {/* Card CVC */}
                    <div>
                      <Label htmlFor="card-cvc">{t('card_cvc')}</Label>
                      <Input
                        id="card-cvc"
                        value={paymentData.cardCvc}
                        onChange={(e) => handleInputChange('cardCvc', e.target.value)}
                        placeholder="123"
                        maxLength={4}
                      />
                      {errors.cardCvc && (
                        <p className="text-red-500 text-sm mt-1">{errors.cardCvc}</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Card Holder */}
                  <div>
                    <Label htmlFor="card-holder">{t('card_holder')}</Label>
                    <Input
                      id="card-holder"
                      value={paymentData.cardHolderName}
                      onChange={(e) => handleInputChange('cardHolderName', e.target.value)}
                      placeholder="John Doe"
                    />
                    {errors.cardHolderName && (
                      <p className="text-red-500 text-sm mt-1">{errors.cardHolderName}</p>
                    )}
                  </div>
                </div>
              </div>
              )}
              
              {/* Billing Address - Only show if card payment method is selected */}
              {paymentMethod === 'card' && (
                <div>
                  <h4 className="font-medium text-gray-800 mb-4">{t('billing_address')}</h4>
                  <div className="space-y-4">
                    {/* Country */}
                    <div>
                      <Label htmlFor="billing-country">{t('country')}</Label>
                      <Select
                        value={billingAddress.country}
                        onValueChange={(value) => handleAddressChange('country', value)}
                      >
                        <SelectTrigger id="billing-country">
                          <SelectValue placeholder={t('select_country')} />
                        </SelectTrigger>
                        <SelectContent>
                          {countries.map((country) => (
                            <SelectItem key={country.value} value={country.value}>{country.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.address_country && (
                        <p className="text-red-500 text-sm mt-1">{errors.address_country}</p>
                      )}
                    </div>
                    
                    {/* Address */}
                    <div>
                      <Label htmlFor="billing-address">{t('address')}</Label>
                      <Input
                        id="billing-address"
                        value={billingAddress.address}
                        onChange={(e) => handleAddressChange('address', e.target.value)}
                        placeholder="123 Main St, Apt 4B"
                      />
                      {errors.address_address && (
                        <p className="text-red-500 text-sm mt-1">{errors.address_address}</p>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      {/* City */}
                      <div>
                        <Label htmlFor="billing-city">{t('city')}</Label>
                        <Input
                          id="billing-city"
                          value={billingAddress.city}
                          onChange={(e) => handleAddressChange('city', e.target.value)}
                          placeholder="New York"
                        />
                        {errors.address_city && (
                          <p className="text-red-500 text-sm mt-1">{errors.address_city}</p>
                        )}
                      </div>
                      
                      {/* Postal Code */}
                      <div>
                        <Label htmlFor="billing-postal">{t('postal_code')}</Label>
                        <Input
                          id="billing-postal"
                          value={billingAddress.postalCode}
                          onChange={(e) => handleAddressChange('postalCode', e.target.value)}
                          placeholder="10001"
                        />
                        {errors.address_postalCode && (
                          <p className="text-red-500 text-sm mt-1">{errors.address_postalCode}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden sticky top-6">
            <div className="p-5 border-b border-gray-200">
              <h3 className="font-heading font-semibold text-lg">{t('order_summary')}</h3>
            </div>
            
            <div className="p-5">
              <div className="space-y-3 mb-6">
                {/* Base Flight */}
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('summary_flight')}</span>
                  <span className="font-medium">${flight.basePrice.toFixed(2)}</span>
                </div>
                
                {/* Express Processing */}
                {options.expressProcessing && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('summary_express')}</span>
                    <span className="font-medium">$5.00</span>
                  </div>
                )}
                
                {/* Editable Ticket */}
                {options.editableTicket && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('summary_editable')}</span>
                    <span className="font-medium">$8.00</span>
                  </div>
                )}
                
                {/* Hotel Reservation */}
                {options.hotelReservation && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('summary_hotel')}</span>
                    <span className="font-medium">$15.00</span>
                  </div>
                )}
                
                {/* Insurance Letter */}
                {options.insuranceLetter && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('summary_insurance')}</span>
                    <span className="font-medium">$10.00</span>
                  </div>
                )}
              </div>
              
              {/* Total */}
              <div className="flex justify-between border-t border-gray-200 pt-4">
                <span className="font-semibold">{t('summary_total')}</span>
                <span className="font-bold text-xl text-primary">${totalPrice.toFixed(2)}</span>
              </div>
              
              {/* Accepted Payment Methods */}
              <div className="mt-6 text-center text-gray-500 text-sm">
                <span className="mr-2">{t('footer_we_accept')}</span>
                <i className="fab fa-cc-visa mr-2"></i>
                <i className="fab fa-cc-mastercard mr-2"></i>
                <i className="fab fa-cc-amex mr-2"></i>
                <i className="fab fa-cc-paypal"></i>
              </div>
              
              {/* Terms */}
              <div className="mt-6 text-xs text-gray-500">
                <p>{t('payment_terms')}</p>
              </div>
              
              {/* Complete Payment Button */}
              <Button
                onClick={handleSubmit}
                disabled={isProcessing}
                className="w-full mt-6 bg-primary text-white hover:bg-primary/90"
              >
                {isProcessing ? (
                  <div className="flex items-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('processing_payment')}
                  </div>
                ) : (
                  t('complete_payment')
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentForm;
