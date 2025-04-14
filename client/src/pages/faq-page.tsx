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
      question: t('faq_6_q'),
      answer: t('faq_6_a')
    },
    {
      question: t('faq_7_q'),
      answer: t('faq_7_a')
    },
    {
      question: t('faq_8_q'),
      answer: t('faq_8_a')
    },
    {
      question: t('faq_9_q'),
      answer: t('faq_9_a')
    },
    {
      question: t('faq_10_q'),
      answer: t('faq_10_a')
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
