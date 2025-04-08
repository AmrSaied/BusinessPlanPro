import { Link } from 'wouter';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

interface GetTicketWidgetProps {
  variant?: 'default' | 'inline' | 'floating';
  className?: string;
}

const GetTicketWidget = ({ 
  variant = 'default',
  className = '' 
}: GetTicketWidgetProps) => {
  const { t } = useTranslation();

  // Simple inline variant
  if (variant === 'inline') {
    return (
      <div className={`bg-primary/5 rounded-lg p-4 my-6 ${className}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-primary">{t('get_ticket_now_title')}</h3>
            <p className="text-gray-600 mt-1">{t('get_ticket_now_description')}</p>
          </div>
          <Link href="/search">
            <Button className="w-full sm:w-auto">
              {t('get_ticket_now_button')}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Simplified floating variant
  if (variant === 'floating') {
    return (
      <div className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 z-10 bg-white p-4 rounded-lg shadow-lg ${className}`}>
        <div className="w-[280px]">
          <h3 className="text-lg font-semibold">{t('get_ticket_now_title')}</h3>
          <p className="text-sm text-gray-600 mb-3">{t('get_ticket_now_floating_text')}</p>
          <Link href="/search">
            <Button className="w-full">
              {t('get_ticket_now_button')}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Default simple card variant
  return (
    <div className={`border border-gray-200 rounded-lg p-5 ${className}`}>
      <h3 className="text-xl font-bold mb-2">{t('get_ticket_now_title')}</h3>
      <p className="text-sm text-gray-600 mb-4">{t('get_ticket_now_subtitle')}</p>
      
      <div className="space-y-3 mb-4">
        <div className="flex items-start gap-2">
          <div className="text-primary">✓</div>
          <div>
            <h4 className="font-medium">{t('get_ticket_now_feature1_title')}</h4>
            <p className="text-sm text-gray-600">{t('get_ticket_now_feature1_text')}</p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <div className="text-primary">✓</div>
          <div>
            <h4 className="font-medium">{t('get_ticket_now_feature2_title')}</h4>
            <p className="text-sm text-gray-600">{t('get_ticket_now_feature2_text')}</p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <div className="text-primary">✓</div>
          <div>
            <h4 className="font-medium">{t('get_ticket_now_feature3_title')}</h4>
            <p className="text-sm text-gray-600">{t('get_ticket_now_feature3_text')}</p>
          </div>
        </div>
      </div>
      
      <Link href="/search">
        <Button className="w-full">
          {t('get_ticket_now_button')}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </Link>
    </div>
  );
};

export default GetTicketWidget;