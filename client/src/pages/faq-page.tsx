import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const FaqPage = () => {
  const { t } = useTranslation();
  
  const faqs = [
    {
      question: t('faq_1_q'),
      answer: t('faq_1_a')
    },
    {
      question: t('faq_2_q'),
      answer: t('faq_2_a')
    },
    {
      question: t('faq_3_q'),
      answer: t('faq_3_a')
    },
    {
      question: t('faq_4_q'),
      answer: t('faq_4_a')
    },
    {
      question: t('faq_5_q'),
      answer: t('faq_5_a')
    },
    {
      question: 'Can I use these tickets for actually boarding a flight?',
      answer: 'No, these are flight reservations specifically designed for visa applications and similar purposes. They are not valid for boarding flights. Once your visa is approved, you should purchase a regular flight ticket.'
    },
    {
      question: 'Do you guarantee visa approval with your flight reservations?',
      answer: 'While our flight reservations meet the requirements specified by most embassies and consulates, we cannot guarantee visa approval as the final decision rests with the immigration authorities based on your complete application.'
    },
    {
      question: 'What information do I need to provide to book a flight reservation?',
      answer: 'You will need to provide your full name as it appears on your passport, passport number, nationality, date of birth, contact details, and your travel route (origin, destination, dates).'
    },
    {
      question: 'How far in advance should I book my flight reservation for a visa application?',
      answer: 'We recommend booking your flight reservation 1-2 weeks before your visa appointment. This ensures your reservation is valid during the visa processing period. However, if you need it urgently, our system can generate valid tickets in minutes.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit and debit cards (Visa, MasterCard, American Express), PayPal, and in selected countries, local payment methods like Alipay, WeChat Pay, and bank transfers.'
    }
  ];
  
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="font-heading text-3xl font-bold text-gray-800 mb-4">{t('faq_title')}</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            {t('faq_subtitle')}
          </p>
        </div>
        
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="border border-gray-200 rounded-lg overflow-hidden"
              >
                <AccordionTrigger className="p-4 text-left bg-white hover:bg-gray-50 transition">
                  <span className="font-medium text-gray-900">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <p className="text-gray-600">{faq.answer}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          
          {/* Additional Questions Section */}
          <div className="mt-12 bg-white p-8 rounded-lg shadow-sm text-center">
            <h2 className="text-xl font-semibold mb-4">{t('faq_still_have_questions')}</h2>
            <p className="text-gray-600 mb-6">
              {t('faq_support_available')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="#" 
                className="bg-primary text-white px-6 py-3 rounded-md font-medium text-center hover:bg-primary/90 transition"
              >
                <i className="fas fa-comments mr-2"></i> {t('live_chat')}
              </a>
              <a 
                href="mailto:support@fastdummyticket.com" 
                className="bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-md font-medium text-center hover:bg-gray-50 transition"
              >
                <i className="fas fa-envelope mr-2"></i> {t('footer_email')}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FaqPage;
