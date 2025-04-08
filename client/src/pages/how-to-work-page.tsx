import { useTranslation } from 'react-i18next';
import GetTicketWidget from '@/components/ui/get-ticket-widget';

const HowToWorkPage = () => {
  const { t } = useTranslation();
  
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-heading font-bold mb-6">{t('how_to_work_title')}</h1>
        
        <div className="prose prose-blue max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-heading font-semibold mb-4">{t('how_to_work_introduction_title')}</h2>
            <p>{t('how_to_work_introduction_text')}</p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-heading font-semibold mb-4">{t('how_to_work_visa_app_title')}</h2>
            <p>{t('how_to_work_visa_app_text1')}</p>
            <p>{t('how_to_work_visa_app_text2')}</p>
            
            <div className="bg-primary-50 border-l-4 border-primary p-4 my-6">
              <h3 className="font-semibold text-lg mb-2">{t('how_to_work_visa_app_tip_title')}</h3>
              <p>{t('how_to_work_visa_app_tip_text')}</p>
            </div>
            
            <h3 className="text-xl font-heading font-semibold mt-6 mb-3">{t('how_to_work_documents_needed_title')}</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>{t('how_to_work_documents_needed_item1')}</li>
              <li>{t('how_to_work_documents_needed_item2')}</li>
              <li>{t('how_to_work_documents_needed_item3')}</li>
              <li>{t('how_to_work_documents_needed_item4')}</li>
              <li>{t('how_to_work_documents_needed_item5')}</li>
            </ul>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-heading font-semibold mb-4">{t('how_to_work_using_our_system_title')}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-xl font-heading font-semibold mb-3">{t('how_to_work_step1_title')}</h3>
                <ol className="list-decimal pl-6 space-y-2">
                  <li>{t('how_to_work_step1_item1')}</li>
                  <li>{t('how_to_work_step1_item2')}</li>
                  <li>{t('how_to_work_step1_item3')}</li>
                </ol>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-xl font-heading font-semibold mb-3">{t('how_to_work_step2_title')}</h3>
                <ol className="list-decimal pl-6 space-y-2">
                  <li>{t('how_to_work_step2_item1')}</li>
                  <li>{t('how_to_work_step2_item2')}</li>
                  <li>{t('how_to_work_step2_item3')}</li>
                </ol>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-xl font-heading font-semibold mb-3">{t('how_to_work_step3_title')}</h3>
                <ol className="list-decimal pl-6 space-y-2">
                  <li>{t('how_to_work_step3_item1')}</li>
                  <li>{t('how_to_work_step3_item2')}</li>
                  <li>{t('how_to_work_step3_item3')}</li>
                </ol>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-xl font-heading font-semibold mb-3">{t('how_to_work_step4_title')}</h3>
                <ol className="list-decimal pl-6 space-y-2">
                  <li>{t('how_to_work_step4_item1')}</li>
                  <li>{t('how_to_work_step4_item2')}</li>
                  <li>{t('how_to_work_step4_item3')}</li>
                </ol>
              </div>
            </div>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-heading font-semibold mb-4">{t('how_to_work_embassy_submission_title')}</h2>
            <p>{t('how_to_work_embassy_submission_text1')}</p>
            <p>{t('how_to_work_embassy_submission_text2')}</p>
            
            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 my-6">
              <h3 className="font-semibold text-lg mb-2">{t('how_to_work_embassy_submission_warning_title')}</h3>
              <p>{t('how_to_work_embassy_submission_warning_text')}</p>
            </div>
            
            <GetTicketWidget variant="inline" className="mt-8" />
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-heading font-semibold mb-4">{t('how_to_work_faq_title')}</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-heading font-semibold">{t('how_to_work_faq_q1')}</h3>
                <p>{t('how_to_work_faq_a1')}</p>
              </div>
              
              <div>
                <h3 className="text-xl font-heading font-semibold">{t('how_to_work_faq_q2')}</h3>
                <p>{t('how_to_work_faq_a2')}</p>
              </div>
              
              <div>
                <h3 className="text-xl font-heading font-semibold">{t('how_to_work_faq_q3')}</h3>
                <p>{t('how_to_work_faq_a3')}</p>
              </div>
              
              <div>
                <h3 className="text-xl font-heading font-semibold">{t('how_to_work_faq_q4')}</h3>
                <p>{t('how_to_work_faq_a4')}</p>
              </div>
            </div>
          </section>
          
          <section>
            <h2 className="text-2xl font-heading font-semibold mb-4">{t('how_to_work_contact_title')}</h2>
            <p>{t('how_to_work_contact_text')}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-xl font-heading font-semibold mb-3">{t('how_to_work_contact_email_title')}</h3>
                <p>{t('how_to_work_contact_email_text')}</p>
                <p className="font-medium mt-2">support@fastdummyticket.com</p>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-xl font-heading font-semibold mb-3">{t('how_to_work_contact_phone_title')}</h3>
                <p>{t('how_to_work_contact_phone_text')}</p>
                <p className="font-medium mt-2">+201113284428</p>
              </div>
            </div>
          </section>
          
          <section className="mt-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2">
                <h2 className="text-2xl font-heading font-semibold mb-4">{t('get_ticket_now_title')}</h2>
                <p className="mb-6">{t('get_ticket_now_description')}</p>
                <p className="text-gray-700">
                  {t('get_ticket_now_subtitle')}
                </p>
              </div>
              <div className="md:col-span-1">
                <GetTicketWidget />
              </div>
            </div>
          </section>
        </div>
      </div>
      
      {/* Floating CTA for mobile */}
      <div className="md:hidden">
        <GetTicketWidget variant="floating" />
      </div>
    </div>
  );
};

export default HowToWorkPage;