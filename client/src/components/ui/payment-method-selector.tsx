import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { SiPaypal } from 'react-icons/si';
import { CreditCard } from 'lucide-react';

interface PaymentMethodSelectorProps {
  selectedMethod: string;
  onSelectMethod: (method: 'card' | 'paypal') => void;
}

const PaymentMethodSelector = ({ selectedMethod, onSelectMethod }: PaymentMethodSelectorProps) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <h4 className="font-medium text-gray-800 mb-2">{t('select_payment_method')}</h4>
      
      {/* PayPal Option */}
      <button
        type="button"
        onClick={() => onSelectMethod('paypal')}
        className={cn(
          "w-full flex items-center justify-center py-3 rounded-md border font-medium transition-colors mb-3",
          selectedMethod === 'paypal' 
            ? "bg-[#ffc439] border-[#ffc439] text-[#003087] hover:bg-[#f7ba37]" 
            : "bg-white border-gray-300 text-gray-800 hover:bg-gray-50"
        )}
      >
        <SiPaypal className="h-6 w-8 mr-2 text-[#003087]" />
        PayPal
      </button>
      
      {/* Credit/Debit Card Option */}
      <button
        type="button"
        onClick={() => onSelectMethod('card')}
        className={cn(
          "w-full flex items-center justify-center py-3 rounded-md border font-medium transition-colors",
          selectedMethod === 'card' 
            ? "bg-[#333333] border-[#333333] text-white hover:bg-[#444444]" 
            : "bg-white border-gray-300 text-gray-800 hover:bg-gray-50"
        )}
      >
        <CreditCard className="h-5 w-5 mr-2" />
        {t('debit_credit_card')}
      </button>
      
      {/* PayPal powered message */}
      {selectedMethod === 'card' && (
        <div className="mt-2 text-center text-sm text-gray-500">
          <span>{t('powered_by')} </span>
          <SiPaypal className="h-3 w-4 inline-block align-middle mx-1 text-[#003087]" />
          <span>PayPal</span>
        </div>
      )}
    </div>
  );
};

export default PaymentMethodSelector;