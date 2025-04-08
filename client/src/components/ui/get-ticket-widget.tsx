import { Link } from 'wouter';
import { ArrowRight, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
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

  // Different layouts based on variant
  if (variant === 'inline') {
    return (
      <div className={`bg-primary/5 rounded-lg p-4 my-6 ${className}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-primary">{t('get_ticket_now_title')}</h3>
            <p className="text-gray-600 mt-1">{t('get_ticket_now_description')}</p>
          </div>
          <Link href="/search">
            <Button className="group w-full sm:w-auto">
              {t('get_ticket_now_button')}
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (variant === 'floating') {
    return (
      <div className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 z-10 shadow-lg ${className}`}>
        <Card className="w-[300px] border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <Zap className="text-primary h-5 w-5 mr-2" />
              {t('get_ticket_now_title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <p>{t('get_ticket_now_floating_text')}</p>
          </CardContent>
          <CardFooter className="pt-0">
            <Link href="/search">
              <Button className="w-full group">
                {t('get_ticket_now_button')}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Default card variant
  return (
    <Card className={`border-primary/20 ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-2xl font-heading">{t('get_ticket_now_title')}</CardTitle>
        <CardDescription>{t('get_ticket_now_subtitle')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="bg-primary/10 text-primary rounded-full p-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h4 className="font-medium">{t('get_ticket_now_feature1_title')}</h4>
              <p className="text-sm text-gray-600">{t('get_ticket_now_feature1_text')}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="bg-primary/10 text-primary rounded-full p-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h4 className="font-medium">{t('get_ticket_now_feature2_title')}</h4>
              <p className="text-sm text-gray-600">{t('get_ticket_now_feature2_text')}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="bg-primary/10 text-primary rounded-full p-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h4 className="font-medium">{t('get_ticket_now_feature3_title')}</h4>
              <p className="text-sm text-gray-600">{t('get_ticket_now_feature3_text')}</p>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Link href="/search">
          <Button className="w-full group">
            {t('get_ticket_now_button')}
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default GetTicketWidget;