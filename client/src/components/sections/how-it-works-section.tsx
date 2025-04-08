import { useTranslation } from 'react-i18next';
import { 
  Search, 
  CreditCard, 
  Ticket, 
  CheckCircle, 
  Plane,
  ArrowRight
} from 'lucide-react';

const HowItWorksSection = () => {
  const { t } = useTranslation();
  
  const steps = [
    {
      icon: <Search className="h-10 w-10 text-primary" />,
      title: t('how_step1_title'),
      description: t('how_step1_description'),
    },
    {
      icon: <Plane className="h-10 w-10 text-primary" />,
      title: t('how_step2_title'),
      description: t('how_step2_description'),
    },
    {
      icon: <CreditCard className="h-10 w-10 text-primary" />,
      title: t('how_step3_title'),
      description: t('how_step3_description'),
    },
    {
      icon: <Ticket className="h-10 w-10 text-primary" />,
      title: t('how_step4_title'),
      description: t('how_step4_description'),
    },
    {
      icon: <CheckCircle className="h-10 w-10 text-primary" />,
      title: t('how_step5_title'),
      description: t('how_step5_description'),
    },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-heading font-bold mb-4">{t('how_it_works_title')}</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">{t('how_it_works_subtitle')}</p>
        </div>
        
        <div className="relative">
          {/* Process Timeline */}
          <div className="hidden md:block absolute top-1/2 left-[10%] right-[10%] h-1 bg-gray-200 -translate-y-1/2"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 relative">
            {steps.map((step, index) => (
              <div key={index} className="flex flex-col items-center text-center z-10">
                <div className="bg-white p-4 rounded-full shadow-lg mb-4 relative">
                  {step.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
                
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-10 -right-4 text-gray-300">
                    <ArrowRight className="w-8 h-8" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-heading font-semibold mb-4">{t('how_benefits_title')}</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
            <div className="border border-gray-200 rounded-lg p-6 bg-white hover:shadow-md transition-shadow">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-4">
                <Ticket className="h-6 w-6 text-primary" />
              </div>
              <h4 className="text-xl font-semibold mb-2">{t('how_benefit1_title')}</h4>
              <p className="text-gray-600">{t('how_benefit1_description')}</p>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-6 bg-white hover:shadow-md transition-shadow">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-4">
                <CheckCircle className="h-6 w-6 text-primary" />
              </div>
              <h4 className="text-xl font-semibold mb-2">{t('how_benefit2_title')}</h4>
              <p className="text-gray-600">{t('how_benefit2_description')}</p>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-6 bg-white hover:shadow-md transition-shadow">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-4">
                <CreditCard className="h-6 w-6 text-primary" />
              </div>
              <h4 className="text-xl font-semibold mb-2">{t('how_benefit3_title')}</h4>
              <p className="text-gray-600">{t('how_benefit3_description')}</p>
            </div>
          </div>
        </div>
        
        <div className="mt-16 text-center">
          <div className="bg-primary/5 rounded-xl p-8 max-w-3xl mx-auto">
            <h3 className="text-2xl font-heading font-semibold mb-4">{t('how_tips_title')}</h3>
            <ul className="text-left space-y-4">
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-1 mr-3" />
                <span>{t('how_tip1')}</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-1 mr-3" />
                <span>{t('how_tip2')}</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-1 mr-3" />
                <span>{t('how_tip3')}</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-1 mr-3" />
                <span>{t('how_tip4')}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;