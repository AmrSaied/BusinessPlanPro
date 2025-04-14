import { useTranslation } from 'react-i18next';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import GetTicketWidget from '@/components/ui/get-ticket-widget';
import { cn } from '@/lib/utils';

const HowToWorkPage = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';
  
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className={cn("text-3xl font-bold mb-6", isRTL && "text-right")}>{t('how_to_work_title')}</h1>
        
        <div className="max-w-none">
          <section className="mb-8">
            <h2 className={cn("text-2xl font-semibold mb-4", isRTL && "text-right")}>{t('how_to_work_introduction_title')}</h2>
            <p className={cn("mb-4", isRTL && "text-right")}>{t('how_to_work_introduction_text')}</p>
          </section>
          
          <section className="mb-8">
            <h2 className={cn("text-2xl font-semibold mb-4", isRTL && "text-right")}>{t('how_to_work_visa_app_title')}</h2>
            <p className={cn("mb-4", isRTL && "text-right")}>{t('how_to_work_visa_app_text1')}</p>
            <p className={cn("mb-4", isRTL && "text-right")}>{t('how_to_work_visa_app_text2')}</p>
            
            <div className={cn("p-4 my-6", isRTL ? "bg-blue-50 border-r-4 border-blue-500 text-right" : "bg-blue-50 border-l-4 border-blue-500")}>
              <h3 className="font-semibold text-lg mb-2">{t('how_to_work_visa_app_tip_title')}</h3>
              <p>{t('how_to_work_visa_app_tip_text')}</p>
            </div>
            
            <h3 className={cn("text-xl font-semibold mt-6 mb-3", isRTL && "text-right")}>{t('how_to_work_documents_needed_title')}</h3>
            <ul className={cn("space-y-2 mb-4", isRTL ? "list-disc pr-6 text-right" : "list-disc pl-6")}>
              <li>{t('how_to_work_documents_needed_item1')}</li>
              <li>{t('how_to_work_documents_needed_item2')}</li>
              <li>{t('how_to_work_documents_needed_item3')}</li>
              <li>{t('how_to_work_documents_needed_item4')}</li>
              <li>{t('how_to_work_documents_needed_item5')}</li>
            </ul>
          </section>
          
          <section className="mb-8">
            <h2 className={cn("text-2xl font-semibold mb-4", isRTL && "text-right")}>{t('how_to_work_using_our_system_title')}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className={cn("text-xl font-semibold mb-3", isRTL && "text-right")}>{t('how_to_work_step1_title')}</h3>
                <ol className={cn("space-y-2", isRTL ? "list-decimal pr-6 text-right" : "list-decimal pl-6")}>
                  <li>{t('how_to_work_step1_item1')}</li>
                  <li>{t('how_to_work_step1_item2')}</li>
                  <li>{t('how_to_work_step1_item3')}</li>
                </ol>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className={cn("text-xl font-semibold mb-3", isRTL && "text-right")}>{t('how_to_work_step2_title')}</h3>
                <ol className={cn("space-y-2", isRTL ? "list-decimal pr-6 text-right" : "list-decimal pl-6")}>
                  <li>{t('how_to_work_step2_item1')}</li>
                  <li>{t('how_to_work_step2_item2')}</li>
                  <li>{t('how_to_work_step2_item3')}</li>
                </ol>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className={cn("text-xl font-semibold mb-3", isRTL && "text-right")}>{t('how_to_work_step3_title')}</h3>
                <ol className={cn("space-y-2", isRTL ? "list-decimal pr-6 text-right" : "list-decimal pl-6")}>
                  <li>{t('how_to_work_step3_item1')}</li>
                  <li>{t('how_to_work_step3_item2')}</li>
                  <li>{t('how_to_work_step3_item3')}</li>
                </ol>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className={cn("text-xl font-semibold mb-3", isRTL && "text-right")}>{t('how_to_work_step4_title')}</h3>
                <ol className={cn("space-y-2", isRTL ? "list-decimal pr-6 text-right" : "list-decimal pl-6")}>
                  <li>{t('how_to_work_step4_item1')}</li>
                  <li>{t('how_to_work_step4_item2')}</li>
                  <li>{t('how_to_work_step4_item3')}</li>
                </ol>
              </div>
            </div>
          </section>
          
          <section className="mb-8">
            <h2 className={cn("text-2xl font-semibold mb-4", isRTL && "text-right")}>{t('how_to_work_embassy_submission_title')}</h2>
            <p className={cn("mb-4", isRTL && "text-right")}>{t('how_to_work_embassy_submission_text1')}</p>
            <p className={cn("mb-4", isRTL && "text-right")}>{t('how_to_work_embassy_submission_text2')}</p>
            
            <div className={cn("p-4 my-6", isRTL ? "bg-amber-50 border-r-4 border-amber-500 text-right" : "bg-amber-50 border-l-4 border-amber-500")}>
              <h3 className="font-semibold text-lg mb-2">{t('how_to_work_embassy_submission_warning_title')}</h3>
              <p>{t('how_to_work_embassy_submission_warning_text')}</p>
            </div>
            
            {/* Simple Inline CTA */}
            <GetTicketWidget variant="inline" />
          </section>
          
          <section className="mb-8">
            <h2 className={cn("text-2xl font-semibold mb-4", isRTL && "text-right")}>{t('how_to_work_faq_title')}</h2>
            
            <div className="space-y-4">
              <div className="border-b border-gray-200 pb-4">
                <h3 className={cn("text-xl font-semibold", isRTL && "text-right")}>{t('how_to_work_faq_q1')}</h3>
                <p className={cn("mt-2", isRTL && "text-right")}>{t('how_to_work_faq_a1')}</p>
              </div>
              
              <div className="border-b border-gray-200 pb-4">
                <h3 className={cn("text-xl font-semibold", isRTL && "text-right")}>{t('how_to_work_faq_q2')}</h3>
                <p className={cn("mt-2", isRTL && "text-right")}>{t('how_to_work_faq_a2')}</p>
              </div>
              
              <div className="border-b border-gray-200 pb-4">
                <h3 className={cn("text-xl font-semibold", isRTL && "text-right")}>{t('how_to_work_faq_q3')}</h3>
                <p className={cn("mt-2", isRTL && "text-right")}>{t('how_to_work_faq_a3')}</p>
              </div>
              
              <div className="border-b border-gray-200 pb-4">
                <h3 className={cn("text-xl font-semibold", isRTL && "text-right")}>{t('how_to_work_faq_q4')}</h3>
                <p className={cn("mt-2", isRTL && "text-right")}>{t('how_to_work_faq_a4')}</p>
              </div>
            </div>
          </section>
          
          <section className="mb-12">
            <h2 className={cn("text-2xl font-semibold mb-4", isRTL && "text-right")}>{t('how_to_work_contact_title')}</h2>
            <p className={cn("mb-4", isRTL && "text-right")}>{t('how_to_work_contact_text')}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className={cn("text-xl font-semibold mb-3", isRTL && "text-right")}>{t('how_to_work_contact_email_title')}</h3>
                <p className={cn(isRTL && "text-right")}>{t('how_to_work_contact_email_text')}</p>
                <p className={cn("font-medium mt-2", isRTL && "text-right")}>support@fastdummyticket.com</p>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className={cn("text-xl font-semibold mb-3", isRTL && "text-right")}>{t('how_to_work_contact_phone_title')}</h3>
                <p className={cn(isRTL && "text-right")}>{t('how_to_work_contact_phone_text')}</p>
                <p className={cn("font-medium mt-2", isRTL && "text-right")}>+201113284428</p>
              </div>
            </div>
          </section>
          
          {/* Bottom CTA */}
          <div className="mb-8">
            <GetTicketWidget variant="default" className="shadow-lg" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowToWorkPage;