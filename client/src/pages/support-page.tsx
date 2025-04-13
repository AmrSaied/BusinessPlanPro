import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Phone, Mail, MessageSquare, Send, Clock, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/language-context';
import { cn } from '@/lib/utils';

const SupportPage = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { currentLanguage } = useLanguage();
  const isRTL = currentLanguage === 'ar' || currentLanguage === 'he';
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate form submission
    setTimeout(() => {
      setLoading(false);
      toast({
        title: t('support_form_success_title'),
        description: t('support_form_success_message'),
      });
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
    }, 1500);
  };

  return (
    <div className="bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            {t('support_title')}
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            {t('support_subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {/* Phone Support */}
          <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Phone className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-heading font-semibold text-xl mb-3">{t('call_us')}</h3>
            <p className="text-gray-600 mb-4">{t('support_phone_description')}</p>
            <div className="space-y-2 text-sm">
              <div className="flex flex-col">
                <span className="font-medium text-gray-700">{t('technical_support')}</span>
                <a href="tel:+201113284428" className="text-primary hover:underline">+201113284428</a>
              </div>
              <div className="flex flex-col">
                <span className="font-medium text-gray-700">{t('inquiry')}</span>
                <a href="tel:+201501685555" className="text-primary hover:underline">+201501685555</a>
              </div>
            </div>
          </div>

          {/* Email Support */}
          <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Mail className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-heading font-semibold text-xl mb-3">{t('mail_us')}</h3>
            <p className="text-gray-600 mb-4">{t('support_email_description')}</p>
            <div className="space-y-2 text-sm">
              <div className="flex flex-col">
                <span className="font-medium text-gray-700">{t('contact')}</span>
                <a href="mailto:info@alkashier.com" className="text-primary hover:underline">info@alkashier.com</a>
              </div>
              <div className="flex flex-col">
                <span className="font-medium text-gray-700">{t('the_support')}</span>
                <a href="mailto:support@alkashier.com" className="text-primary hover:underline">support@alkashier.com</a>
              </div>
            </div>
          </div>

          {/* Live Chat */}
          <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <MessageSquare className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-heading font-semibold text-xl mb-3">{t('live_chat')}</h3>
            <p className="text-gray-600 mb-4">{t('support_chat_description')}</p>
            <Button
              className="inline-flex items-center"
              onClick={() => toast({
                title: t('chat_initiated'),
                description: t('chat_initiated_description'),
              })}
            >
              <MessageSquare className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
              {t('start_chat')}
            </Button>
            <div className="mt-3 text-xs text-gray-500">
              <Clock className={cn("inline h-3 w-3", isRTL ? "ml-1" : "mr-1")} />
              {t('available_24_7')}
            </div>
          </div>
        </div>

        {/* Contact Form Section */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-5">
            {/* Information Panel */}
            <div className="p-8 bg-primary text-white lg:col-span-2">
              <h3 className="font-heading text-2xl font-semibold mb-6">{t('contact_info')}</h3>
              
              <div className="space-y-6">
                <div className={cn("flex items-start", isRTL && "flex-row-reverse")}>
                  <Phone className={cn("h-6 w-6 mt-1", isRTL ? "ml-4" : "mr-4")} />
                  <div className={cn(isRTL && "text-right")}>
                    <h4 className="font-medium mb-1">{t('phone_contact')}</h4>
                    <p className="opacity-90">+201113284428, +201501685555</p>
                  </div>
                </div>
                
                <div className={cn("flex items-start", isRTL && "flex-row-reverse")}>
                  <Mail className={cn("h-6 w-6 mt-1", isRTL ? "ml-4" : "mr-4")} />
                  <div className={cn(isRTL && "text-right")}>
                    <h4 className="font-medium mb-1">{t('email')}</h4>
                    <p className="opacity-90">info@alkashier.com</p>
                    <p className="opacity-90">support@alkashier.com</p>
                  </div>
                </div>
                
                <div className={cn("flex items-start", isRTL && "flex-row-reverse")}>
                  <MapPin className={cn("h-6 w-6 mt-1", isRTL ? "ml-4" : "mr-4")} />
                  <div className={cn(isRTL && "text-right")}>
                    <h4 className="font-medium mb-1">{t('location')}</h4>
                    <p className="opacity-90">{t('company_address')}</p>
                  </div>
                </div>
                
                <div className={cn("flex items-start", isRTL && "flex-row-reverse")}>
                  <Clock className={cn("h-6 w-6 mt-1", isRTL ? "ml-4" : "mr-4")} />
                  <div className={cn(isRTL && "text-right")}>
                    <h4 className="font-medium mb-1">{t('business_hours')}</h4>
                    <p className="opacity-90">{t('business_hours_details')}</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-10">
                <h4 className="font-medium mb-4">{t('follow_us')}</h4>
                <div className="flex space-x-4">
                  <a href="#" className="hover:opacity-80 transition">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <i className="fab fa-facebook-f text-white"></i>
                    </div>
                  </a>
                  <a href="#" className="hover:opacity-80 transition">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <i className="fab fa-twitter text-white"></i>
                    </div>
                  </a>
                  <a href="#" className="hover:opacity-80 transition">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <i className="fab fa-instagram text-white"></i>
                    </div>
                  </a>
                  <a href="#" className="hover:opacity-80 transition">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <i className="fab fa-linkedin-in text-white"></i>
                    </div>
                  </a>
                </div>
              </div>
            </div>
            
            {/* Contact Form */}
            <div className="p-8 lg:col-span-3">
              <h3 className="font-heading text-2xl font-semibold text-gray-800 mb-6">{t('send_message')}</h3>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      {t('form_name')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                      placeholder={t('form_name_placeholder')}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      {t('form_email')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                      placeholder={t('form_email_placeholder')}
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('form_subject')} <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                  >
                    <option value="">{t('form_subject_placeholder')}</option>
                    <option value="booking">{t('subject_booking')}</option>
                    <option value="support">{t('subject_technical_support')}</option>
                    <option value="billing">{t('subject_billing')}</option>
                    <option value="feedback">{t('subject_feedback')}</option>
                    <option value="other">{t('subject_other')}</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('form_message')} <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                    placeholder={t('form_message_placeholder')}
                  ></textarea>
                </div>
                
                <div>
                  <Button 
                    type="submit" 
                    className="w-full sm:w-auto flex items-center justify-center"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <svg className={cn("animate-spin h-4 w-4 text-white", isRTL ? "-mr-1 ml-2" : "-ml-1 mr-2")} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {t('sending')}
                      </>
                    ) : (
                      <>
                        <Send className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                        {t('send_message')}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Support Sessions Section */}
        <div className="mt-16">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl font-bold text-gray-800 mb-4">
              {t('support_sessions')}
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              {t('support_sessions_description')}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="mb-8">
              <h3 className="font-heading text-xl font-semibold mb-4">
                {t('schedule_support_session')}
              </h3>
              <p className="text-gray-600 mb-6">
                {t('schedule_support_session_description')}
              </p>
              
              <Button
                onClick={() => toast({
                  title: t('session_scheduled'),
                  description: t('session_scheduled_description'),
                })}
                className="bg-primary hover:bg-primary/90 text-white"
              >
                {t('schedule_session')}
              </Button>
            </div>
            
            <div className="border-t border-gray-200 pt-8">
              <h3 className="font-heading text-xl font-semibold mb-4">
                {t('contact_information')}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className={cn("flex items-center", isRTL && "flex-row-reverse")}>
                    <Phone className={cn("h-5 w-5 text-primary", isRTL ? "ml-3" : "mr-3")} />
                    <div className={cn(isRTL && "text-right")}>
                      <div className="text-sm text-gray-500">{t('technical_support')}</div>
                      <div className="font-medium">+201113284428</div>
                    </div>
                  </div>
                  
                  <div className={cn("flex items-center", isRTL && "flex-row-reverse")}>
                    <Phone className={cn("h-5 w-5 text-primary", isRTL ? "ml-3" : "mr-3")} />
                    <div className={cn(isRTL && "text-right")}>
                      <div className="text-sm text-gray-500">{t('inquiry')}</div>
                      <div className="font-medium">+201501685555</div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className={cn("flex items-center", isRTL && "flex-row-reverse")}>
                    <Mail className={cn("h-5 w-5 text-primary", isRTL ? "ml-3" : "mr-3")} />
                    <div className={cn(isRTL && "text-right")}>
                      <div className="text-sm text-gray-500">{t('contact')}</div>
                      <div className="font-medium">info@alkashier.com</div>
                    </div>
                  </div>
                  
                  <div className={cn("flex items-center", isRTL && "flex-row-reverse")}>
                    <Mail className={cn("h-5 w-5 text-primary", isRTL ? "ml-3" : "mr-3")} />
                    <div className={cn(isRTL && "text-right")}>
                      <div className="text-sm text-gray-500">{t('the_support')}</div>
                      <div className="font-medium">support@alkashier.com</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportPage;