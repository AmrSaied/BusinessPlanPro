export type Language = 'en' | 'es' | 'fr' | 'de' | 'zh' | 'ar' | 'ru' | 'pt' | 'hi' | 'ja';

// Define the translation structure
export interface Translations {
  [key: string]: {
    [lang in Language]: string;
  };
}

// Main translations object
export const translations: Translations = {
  // General
  'app.name': {
    en: 'FastDummyTicket',
    es: 'ReservaRápidaViaje',
    fr: 'RéservationRapide',
    de: 'SchnellReservierung',
    zh: '快速订票',
    ar: 'تذكرة وهمية سريعة',
    ru: 'БыстрыйБронь',
    pt: 'ReservaRápida',
    hi: 'फ़ास्ट डमी टिकट',
    ja: '高速ダミーチケット'
  },
  'app.tagline': {
    en: 'Quick Flight Reservations for Visa Applications',
    es: 'Reservas de vuelos rápidas para solicitudes de visa',
    fr: 'Réservations de vols rapides pour les demandes de visa',
    de: 'Schnelle Flugreservierungen für Visumanträge',
    zh: '快速航班预订，用于签证申请',
    ar: 'حجوزات طيران سريعة لطلبات التأشيرة',
    ru: 'Быстрое бронирование рейсов для визовых заявлений',
    pt: 'Reservas rápidas de voos para pedidos de visto',
    hi: 'वीज़ा आवेदन के लिए त्वरित उड़ान आरक्षण',
    ja: 'ビザ申請のための迅速なフライト予約'
  },
  'app.description': {
    en: 'Get verifiable flight reservations within minutes for your visa application, immigration, or passport renewal.',
    es: 'Obtenga reservas de vuelo verificables en minutos para su solicitud de visa, inmigración o renovación de pasaporte.',
    fr: 'Obtenez des réservations de vol vérifiables en quelques minutes pour votre demande de visa, d\'immigration ou de renouvellement de passeport.',
    de: 'Erhalten Sie innerhalb von Minuten überprüfbare Flugreservierungen für Ihren Visumantrag, Ihre Einwanderung oder Ihre Passerneuerung.',
    zh: '在几分钟内获取可验证的航班预订，用于您的签证申请、移民或护照更新。',
    ar: 'احصل على حجوزات طيران قابلة للتحقق في غضون دقائق لطلب التأشيرة أو الهجرة أو تجديد جواز السفر.',
    ru: 'Получите проверяемые бронирования авиабилетов в течение нескольких минут для вашего заявления на визу, иммиграции или продления паспорта.',
    pt: 'Obtenha reservas de voos verificáveis em minutos para seu pedido de visto, imigração ou renovação de passaporte.',
    hi: 'अपने वीज़ा आवेदन, आव्रजन, या पासपोर्ट नवीनीकरण के लिए मिनटों के भीतर सत्यापन योग्य उड़ान आरक्षण प्राप्त करें।',
    ja: 'ビザ申請、移民、またはパスポートの更新のために、数分以内に検証可能なフライト予約を取得します。'
  },

  // Navigation
  'nav.home': {
    en: 'Home',
    es: 'Inicio',
    fr: 'Accueil',
    de: 'Startseite',
    zh: '主页',
    ar: 'الرئيسية',
    ru: 'Главная',
    pt: 'Início',
    hi: 'होम',
    ja: 'ホーム'
  },
  'nav.howItWorks': {
    en: 'How It Works',
    es: 'Cómo Funciona',
    fr: 'Comment Ça Marche',
    de: 'Wie Es Funktioniert',
    zh: '怎样运作',
    ar: 'كيف يعمل',
    ru: 'Как Это Работает',
    pt: 'Como Funciona',
    hi: 'कैसे काम करता है',
    ja: '仕組み'
  },
  'nav.faq': {
    en: 'FAQ',
    es: 'Preguntas Frecuentes',
    fr: 'FAQ',
    de: 'FAQ',
    zh: '常见问题',
    ar: 'الأسئلة الشائعة',
    ru: 'ЧАВО',
    pt: 'Perguntas Frequentes',
    hi: 'अक्सर पूछे जाने वाले प्रश्न',
    ja: 'よくある質問'
  },
  'nav.support': {
    en: 'Support',
    es: 'Soporte',
    fr: 'Support',
    de: 'Unterstützung',
    zh: '支持',
    ar: 'الدعم',
    ru: 'Поддержка',
    pt: 'Suporte',
    hi: 'सहायता',
    ja: 'サポート'
  },

  // Auth
  'auth.signIn': {
    en: 'Sign In',
    es: 'Iniciar Sesión',
    fr: 'Se Connecter',
    de: 'Anmelden',
    zh: '登录',
    ar: 'تسجيل الدخول',
    ru: 'Войти',
    pt: 'Entrar',
    hi: 'साइन इन करें',
    ja: 'サインイン'
  },
  'auth.register': {
    en: 'Register',
    es: 'Registrarse',
    fr: 'S\'inscrire',
    de: 'Registrieren',
    zh: '注册',
    ar: 'التسجيل',
    ru: 'Регистрация',
    pt: 'Registrar',
    hi: 'रजिस्टर करें',
    ja: '登録'
  },
  'auth.logout': {
    en: 'Logout',
    es: 'Cerrar Sesión',
    fr: 'Déconnexion',
    de: 'Abmelden',
    zh: '退出',
    ar: 'تسجيل الخروج',
    ru: 'Выйти',
    pt: 'Sair',
    hi: 'लॉगआउट',
    ja: 'ログアウト'
  },
  
  // Flight Search
  'search.title': {
    en: 'Search For Your Flight',
    es: 'Buscar Su Vuelo',
    fr: 'Rechercher Votre Vol',
    de: 'Suchen Sie Ihren Flug',
    zh: '搜索您的航班',
    ar: 'ابحث عن رحلتك',
    ru: 'Поиск Вашего Рейса',
    pt: 'Pesquisar Seu Voo',
    hi: 'अपनी उड़ान खोजें',
    ja: 'フライトを検索'
  },
  'search.subtitle': {
    en: 'Find the perfect flight for your visa application',
    es: 'Encuentre el vuelo perfecto para su solicitud de visa',
    fr: 'Trouvez le vol parfait pour votre demande de visa',
    de: 'Finden Sie den perfekten Flug für Ihren Visumantrag',
    zh: '为您的签证申请找到完美的航班',
    ar: 'ابحث عن الرحلة المثالية لطلب التأشيرة الخاص بك',
    ru: 'Найдите идеальный рейс для вашего заявления на визу',
    pt: 'Encontre o voo perfeito para seu pedido de visto',
    hi: 'अपने वीज़ा आवेदन के लिए सही उड़ान खोजें',
    ja: 'ビザ申請に最適なフライトを見つける'
  },
  'search.oneWay': {
    en: 'One Way',
    es: 'Solo Ida',
    fr: 'Aller Simple',
    de: 'Einfache Fahrt',
    zh: '单程',
    ar: 'ذهاب فقط',
    ru: 'В одну сторону',
    pt: 'Somente Ida',
    hi: 'एकतरफा',
    ja: '片道'
  },
  'search.roundTrip': {
    en: 'Round Trip',
    es: 'Ida y Vuelta',
    fr: 'Aller-Retour',
    de: 'Hin und Zurück',
    zh: '往返',
    ar: 'ذهاب وعودة',
    ru: 'Туда и обратно',
    pt: 'Ida e Volta',
    hi: 'आने-जाने का',
    ja: '往復'
  },
  'search.from': {
    en: 'Flying From',
    es: 'Volando Desde',
    fr: 'Départ De',
    de: 'Abflug Von',
    zh: '出发地',
    ar: 'المغادرة من',
    ru: 'Вылет Из',
    pt: 'Partindo De',
    hi: 'उड़ान का स्थान',
    ja: '出発地'
  },
  'search.to': {
    en: 'Flying To',
    es: 'Volando A',
    fr: 'Arrivée À',
    de: 'Ankunft In',
    zh: '目的地',
    ar: 'الوصول إلى',
    ru: 'Прилет В',
    pt: 'Indo Para',
    hi: 'जाने का स्थान',
    ja: '目的地'
  },
  'search.departureDate': {
    en: 'Departure Date',
    es: 'Fecha de Salida',
    fr: 'Date de Départ',
    de: 'Abflugdatum',
    zh: '出发日期',
    ar: 'تاريخ المغادرة',
    ru: 'Дата Вылета',
    pt: 'Data de Partida',
    hi: 'प्रस्थान तिथि',
    ja: '出発日'
  },
  'search.returnDate': {
    en: 'Return Date',
    es: 'Fecha de Regreso',
    fr: 'Date de Retour',
    de: 'Rückreisedatum',
    zh: '返程日期',
    ar: 'تاريخ العودة',
    ru: 'Дата Возвращения',
    pt: 'Data de Retorno',
    hi: 'वापसी तिथि',
    ja: '帰国日'
  },
  'search.passengers': {
    en: 'Passengers',
    es: 'Pasajeros',
    fr: 'Passagers',
    de: 'Passagiere',
    zh: '乘客',
    ar: 'الركاب',
    ru: 'Пассажиры',
    pt: 'Passageiros',
    hi: 'यात्री',
    ja: '乗客'
  },
  'search.travelPurpose': {
    en: 'Travel Purpose',
    es: 'Propósito del Viaje',
    fr: 'Objectif du Voyage',
    de: 'Reisezweck',
    zh: '旅行目的',
    ar: 'غرض السفر',
    ru: 'Цель Поездки',
    pt: 'Propósito da Viagem',
    hi: 'यात्रा का उद्देश्य',
    ja: '渡航目的'
  },
  'search.searchButton': {
    en: 'Search Flights',
    es: 'Buscar Vuelos',
    fr: 'Rechercher des Vols',
    de: 'Flüge Suchen',
    zh: '搜索航班',
    ar: 'البحث عن الرحلات',
    ru: 'Искать Рейсы',
    pt: 'Buscar Voos',
    hi: 'उड़ानें खोजें',
    ja: 'フライトを検索'
  },

  // Flight Results
  'results.title': {
    en: 'Available Flights',
    es: 'Vuelos Disponibles',
    fr: 'Vols Disponibles',
    de: 'Verfügbare Flüge',
    zh: '可用航班',
    ar: 'الرحلات المتاحة',
    ru: 'Доступные Рейсы',
    pt: 'Voos Disponíveis',
    hi: 'उपलब्ध उड़ानें',
    ja: '利用可能なフライト'
  },
  'results.filter': {
    en: 'Filter',
    es: 'Filtrar',
    fr: 'Filtrer',
    de: 'Filter',
    zh: '筛选',
    ar: 'تصفية',
    ru: 'Фильтр',
    pt: 'Filtrar',
    hi: 'फ़िल्टर',
    ja: 'フィルター'
  },
  'results.loading': {
    en: 'Searching for available flights...',
    es: 'Buscando vuelos disponibles...',
    fr: 'Recherche de vols disponibles...',
    de: 'Suche nach verfügbaren Flügen...',
    zh: '搜索可用航班...',
    ar: 'البحث عن الرحلات المتاحة...',
    ru: 'Поиск доступных рейсов...',
    pt: 'Buscando voos disponíveis...',
    hi: 'उपलब्ध उड़ानों की खोज...',
    ja: '利用可能なフライトを検索中...'
  },
  'results.select': {
    en: 'Select',
    es: 'Seleccionar',
    fr: 'Sélectionner',
    de: 'Auswählen',
    zh: '选择',
    ar: 'اختيار',
    ru: 'Выбрать',
    pt: 'Selecionar',
    hi: 'चुनें',
    ja: '選択'
  },
  'results.direct': {
    en: 'Direct',
    es: 'Directo',
    fr: 'Direct',
    de: 'Direkt',
    zh: '直飞',
    ar: 'مباشر',
    ru: 'Прямой',
    pt: 'Direto',
    hi: 'सीधी',
    ja: '直行便'
  },
  'results.basePrice': {
    en: 'base price',
    es: 'precio base',
    fr: 'prix de base',
    de: 'grundpreis',
    zh: '基本价格',
    ar: 'السعر الأساسي',
    ru: 'базовая цена',
    pt: 'preço base',
    hi: 'आधार मूल्य',
    ja: '基本料金'
  },

  // Flight Options
  'options.title': {
    en: 'Customize Your Reservation',
    es: 'Personalice Su Reserva',
    fr: 'Personnalisez Votre Réservation',
    de: 'Passen Sie Ihre Reservierung An',
    zh: '自定义您的预订',
    ar: 'تخصيص الحجز الخاص بك',
    ru: 'Настройте Ваше Бронирование',
    pt: 'Personalize Sua Reserva',
    hi: 'अपने आरक्षण को अनुकूलित करें',
    ja: '予約をカスタマイズ'
  },
  'options.subtitle': {
    en: 'Your selected flight and additional options',
    es: 'Su vuelo seleccionado y opciones adicionales',
    fr: 'Votre vol sélectionné et options supplémentaires',
    de: 'Ihr ausgewählter Flug und zusätzliche Optionen',
    zh: '您选择的航班和附加选项',
    ar: 'رحلتك المحددة والخيارات الإضافية',
    ru: 'Ваш выбранный рейс и дополнительные опции',
    pt: 'Seu voo selecionado e opções adicionais',
    hi: 'आपकी चयनित उड़ान और अतिरिक्त विकल्प',
    ja: '選択したフライトと追加オプション'
  },
  'options.changeFlight': {
    en: 'Change Flight',
    es: 'Cambiar Vuelo',
    fr: 'Changer de Vol',
    de: 'Flug Ändern',
    zh: '更改航班',
    ar: 'تغيير الرحلة',
    ru: 'Изменить Рейс',
    pt: 'Mudar Voo',
    hi: 'उड़ान बदलें',
    ja: 'フライトを変更'
  },
  'options.additionalServices': {
    en: 'Select Additional Services',
    es: 'Seleccionar Servicios Adicionales',
    fr: 'Sélectionner des Services Supplémentaires',
    de: 'Zusätzliche Dienstleistungen Auswählen',
    zh: '选择附加服务',
    ar: 'اختر الخدمات الإضافية',
    ru: 'Выбрать дополнительные услуги',
    pt: 'Selecionar Serviços Adicionais',
    hi: 'अतिरिक्त सेवाएं चुनें',
    ja: '追加サービスを選択'
  },
  'options.basic': {
    en: 'Basic Flight Reservation',
    es: 'Reserva de Vuelo Básica',
    fr: 'Réservation de Vol de Base',
    de: 'Basis-Flugreservierung',
    zh: '基本航班预订',
    ar: 'حجز الرحلة الأساسي',
    ru: 'Базовое Бронирование Рейса',
    pt: 'Reserva Básica de Voo',
    hi: 'बेसिक फ्लाइट रिजर्वेशन',
    ja: '基本フライト予約'
  },
  'options.express': {
    en: 'Express Processing',
    es: 'Procesamiento Expreso',
    fr: 'Traitement Express',
    de: 'Express-Verarbeitung',
    zh: '快速处理',
    ar: 'المعالجة السريعة',
    ru: 'Экспресс Обработка',
    pt: 'Processamento Expresso',
    hi: 'एक्सप्रेस प्रोसेसिंग',
    ja: '特急処理'
  },
  'options.editable': {
    en: 'Editable Ticket',
    es: 'Billete Editable',
    fr: 'Billet Modifiable',
    de: 'Editierbares Ticket',
    zh: '可编辑机票',
    ar: 'تذكرة قابلة للتعديل',
    ru: 'Редактируемый Билет',
    pt: 'Bilhete Editável',
    hi: 'संपादन योग्य टिकट',
    ja: '編集可能なチケット'
  },
  'options.hotel': {
    en: 'Hotel Reservation',
    es: 'Reserva de Hotel',
    fr: 'Réservation d\'Hôtel',
    de: 'Hotelreservierung',
    zh: '酒店预订',
    ar: 'حجز الفندق',
    ru: 'Бронирование Отеля',
    pt: 'Reserva de Hotel',
    hi: 'होटल रिजर्वेशन',
    ja: 'ホテル予約'
  },
  'options.insurance': {
    en: 'Insurance Letter',
    es: 'Carta de Seguro',
    fr: 'Lettre d\'Assurance',
    de: 'Versicherungsschreiben',
    zh: '保险信',
    ar: 'خطاب التأمين',
    ru: 'Страховое Письмо',
    pt: 'Carta de Seguro',
    hi: 'बीमा पत्र',
    ja: '保険レター'
  },
  'options.recommended': {
    en: 'Recommended',
    es: 'Recomendado',
    fr: 'Recommandé',
    de: 'Empfohlen',
    zh: '推荐',
    ar: 'موصى به',
    ru: 'Рекомендуемый',
    pt: 'Recomendado',
    hi: 'अनुशंसित',
    ja: 'おすすめ'
  },
  'options.totalPrice': {
    en: 'Total Price',
    es: 'Precio Total',
    fr: 'Prix Total',
    de: 'Gesamtpreis',
    zh: '总价',
    ar: 'السعر الإجمالي',
    ru: 'Общая Цена',
    pt: 'Preço Total',
    hi: 'कुल कीमत',
    ja: '合計金額'
  },
  'options.continue': {
    en: 'Continue to Passenger Details',
    es: 'Continuar a Detalles de Pasajero',
    fr: 'Continuer vers Détails du Passager',
    de: 'Weiter zu Passagierdetails',
    zh: '继续填写乘客详情',
    ar: 'المتابعة إلى تفاصيل الراكب',
    ru: 'Продолжить к Деталям Пассажира',
    pt: 'Continuar para Detalhes do Passageiro',
    hi: 'यात्री विवरण पर जारी रखें',
    ja: '搭乗者詳細に進む'
  },
  
  // More translations can be added for passenger form, payment, etc.
};

// Get translation helper function
export function getTranslation(key: string, language: Language = 'en'): string {
  if (!translations[key]) {
    console.warn(`Translation key not found: ${key}`);
    return key;
  }
  
  return translations[key][language] || translations[key]['en'];
}
