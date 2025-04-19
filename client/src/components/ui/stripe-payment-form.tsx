import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Loader2, CreditCard, CheckCircle, AlertTriangle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

interface StripePaymentFormProps {
  bookingId: number;
  amount: number;
  currency: string;
  onPaymentComplete: (paymentId: string, status: string) => void;
}

const formatCurrency = (amount: number, currency: string): string => {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'EUR',
    minimumFractionDigits: 2,
  });
  return formatter.format(amount);
};

export function StripePaymentForm({ bookingId, amount, currency, onPaymentComplete }: StripePaymentFormProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [testMode, setTestMode] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvc, setCvc] = useState('');
  const [paymentId, setPaymentId] = useState('');
  
  // Format card number as user types (add space after every 4 digits)
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\s/g, ''); // Remove any existing spaces
    if (value.length <= 16 && /^\d*$/.test(value)) { // Only allow digits
      // Insert a space after every 4 digits
      const formatted = value.replace(/(\d{4})(?=\d)/g, '$1 ');
      setCardNumber(formatted);
    }
  };
  
  // Format expiry date as MM/YY
  const handleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 4) {
      if (value.length > 2) {
        setExpiryDate(value.substring(0, 2) + '/' + value.substring(2));
      } else {
        setExpiryDate(value);
      }
    }
  };
  
  // Only allow numbers for CVC and limit to 3-4 digits
  const handleCvcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= 4 && /^\d*$/.test(value)) {
      setCvc(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (paymentStatus === 'processing') return;
    
    try {
      setIsLoading(true);
      setPaymentStatus('processing');
      
      // For test mode, use the simplified payment API
      if (testMode) {
        const response = await apiRequest('POST', '/api/payments', {
          bookingId,
          testMode: true,
          paymentMethod: 'card',
          cardholderName: cardName,
        });
        
        const data = await response.json();
        
        if (data.success) {
          setPaymentId(data.paymentId);
          setPaymentStatus('success');
          toast({
            title: t('payment.success'),
            description: t('payment.testModeSuccess'),
          });
          onPaymentComplete(data.paymentId, 'succeeded');
        } else {
          setPaymentStatus('error');
          toast({
            title: t('payment.failed'),
            description: data.message || t('payment.genericError'),
            variant: 'destructive',
          });
        }
      } else {
        // Real payment processing with Stripe
        // Step 1: Create a payment intent
        const createResponse = await apiRequest('POST', '/api/stripe/create-payment-intent', {
          bookingId,
          testMode: false,
        });
        
        const paymentIntent = await createResponse.json();
        
        if (!paymentIntent.success) {
          throw new Error(paymentIntent.message || t('payment.createIntentFailed'));
        }
        
        // Step 2: In a real integration, we would use Elements and CardElement from @stripe/react-stripe-js
        // For this simplified demo, we'll simulate a payment method
        const confirmResponse = await apiRequest('POST', '/api/stripe/confirm-payment', {
          bookingId,
          paymentIntentId: paymentIntent.id,
          paymentMethodId: 'pm_card_visa', // This is a test payment method ID
          testMode: false,
        });
        
        const confirmResult = await confirmResponse.json();
        
        if (confirmResult.success) {
          setPaymentId(confirmResult.paymentId);
          setPaymentStatus('success');
          toast({
            title: t('payment.success'),
            description: t('payment.realModeSuccess'),
          });
          onPaymentComplete(confirmResult.paymentId, confirmResult.status);
        } else {
          setPaymentStatus('error');
          toast({
            title: t('payment.failed'),
            description: confirmResult.message || t('payment.genericError'),
            variant: 'destructive',
          });
        }
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      setPaymentStatus('error');
      toast({
        title: t('payment.failed'),
        description: error.message || t('payment.genericError'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">
          {t('payment.title')}
        </CardTitle>
        <CardDescription className="text-center">
          {t('payment.amount')}: {formatCurrency(amount, currency)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center space-x-2 mb-4">
            <Switch 
              id="test-mode" 
              checked={testMode} 
              onCheckedChange={setTestMode} 
            />
            <Label htmlFor="test-mode" className="cursor-pointer">
              {t('payment.testMode')}
            </Label>
          </div>
          
          {paymentStatus === 'success' ? (
            <div className="py-8 text-center space-y-4">
              <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
              <h3 className="text-xl font-medium">{t('payment.successTitle')}</h3>
              <p>{t('payment.successMessage')}</p>
              <p className="text-sm text-muted-foreground">
                {t('payment.paymentId')}: {paymentId}
              </p>
            </div>
          ) : paymentStatus === 'error' ? (
            <div className="py-8 text-center space-y-4">
              <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
              <h3 className="text-xl font-medium">{t('payment.errorTitle')}</h3>
              <p>{t('payment.errorMessage')}</p>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setPaymentStatus('idle')}
              >
                {t('payment.tryAgain')}
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="cardName">{t('payment.cardholderName')}</Label>
                <Input
                  id="cardName"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  required
                  disabled={isLoading}
                  placeholder={t('payment.cardholderNamePlaceholder')}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cardNumber">{t('payment.cardNumber')}</Label>
                <Input
                  id="cardNumber"
                  value={cardNumber}
                  onChange={handleCardNumberChange}
                  required
                  disabled={isLoading}
                  placeholder="1234 5678 9012 3456"
                  className="font-mono"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiryDate">{t('payment.expiryDate')}</Label>
                  <Input
                    id="expiryDate"
                    value={expiryDate}
                    onChange={handleExpiryDateChange}
                    required
                    disabled={isLoading}
                    placeholder="MM/YY"
                    className="font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvc">{t('payment.cvc')}</Label>
                  <Input
                    id="cvc"
                    value={cvc}
                    onChange={handleCvcChange}
                    required
                    disabled={isLoading}
                    placeholder="123"
                    className="font-mono"
                  />
                </div>
              </div>
              
              <div className="text-sm text-muted-foreground">
                {testMode ? (
                  <p>{t('payment.testModeDescription')}</p>
                ) : (
                  <p>{t('payment.securePayment')}</p>
                )}
              </div>
              
              <Button 
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('payment.processing')}
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    {t('payment.pay')} {formatCurrency(amount, currency)}
                  </>
                )}
              </Button>
            </>
          )}
        </form>
      </CardContent>
      <CardFooter className="flex justify-center text-sm text-muted-foreground">
        <p>
          {t('payment.footer')}
        </p>
      </CardFooter>
    </Card>
  );
}