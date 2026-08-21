import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Language } from '../types';

interface LanguageContextType {
  language: Language;
  direction: 'ltr' | 'rtl';
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const TRANSLATIONS: Record<Language, Record<string, string>> = {
  en: {
    // Brand & App
    'app.name': 'Classic Tour & Travels',
    'app.tagline': 'Hajj & Umrah Enterprise ERP & Operations Management',
    'app.location': 'Mumbai, India — Saudi Ground Command',
    
    // Navigation
    'nav.dashboard': 'Overview & Command Center',
    'nav.crm': 'CRM & Lead Pipeline',
    'nav.pilgrims': 'Pilgrim Vault & OCR MRZ',
    'nav.packages': 'Packages & Costing Engine',
    'nav.groundOps': 'Ground Operations Matrix',
    'nav.visaNusuk': 'Visa & Nusuk Compliance',
    'nav.b2b': 'B2B Sub-Agent Portal',
    'nav.finance': 'Dual-Currency Ledger & P&L',
    'nav.whatsapp': 'WhatsApp Automation Hub',
    'nav.audit': 'Security & Audit Trail',

    // Role Switcher
    'role.super_admin': 'Super Admin (MD / CEO)',
    'role.ops_manager': 'Operations Manager',
    'role.sales_exec': 'Sales Executive',
    'role.saudi_ameer': 'Saudi Ground Ameer (Field)',
    'role.visa_officer': 'Visa Desk Officer',
    'role.accountant': 'Chief Accountant',
    'role.b2b_agent': 'B2B Sub-Agent Partner',

    // Ground Ops Tabs
    'ground.hotelMatrix': 'Hotel Rooming Matrix',
    'ground.busFleet': 'Bus & Transport Fleet',
    'ground.flightManifest': 'Flight PNR & Airline Seats',
    'ground.badges': 'Pilgrim Badges & Emergency QR',
    
    // Actions & General
    'action.addNew': 'Add New',
    'action.search': 'Search by name, passport, phone or PNR...',
    'action.filter': 'Filter',
    'action.export': 'Export Rooming List (Saudi Format)',
    'action.print': 'Print ID Badges',
    'action.save': 'Save Changes',
    'action.cancel': 'Cancel',
    'action.edit': 'Edit',
    'action.delete': 'Delete',
    'action.view': 'View Profile',
    'action.assign': 'Assign Room',
    'action.sendWhatsApp': 'Send WhatsApp',
    'action.generateInvoice': 'Generate GST Invoice',
    'action.scanPassport': 'Scan Passport MRZ',
    'action.quickQuote': 'Generate Instant Quotation',

    // Statuses
    'status.confirmed': 'Confirmed',
    'status.deposit_paid': 'Deposit Paid',
    'status.doc_followup': 'Doc Follow-up',
    'status.quotation_sent': 'Quotation Sent',
    'status.new_inquiry': 'New Inquiry',
    'status.lost': 'Lost / Archived',
    'status.visa_issued': 'Visa Issued (MoFA)',
    'status.mofa_generated': 'MoFA Generated',
    'status.passport_submitted': 'Passport Submitted',
    'status.insurance_attached': 'Insurance Attached',
    'status.nusuk_rawdah_booked': 'Rawdah Nusuk Booked',

    // Room Types
    'room.quad': 'Quad (4 Beds)',
    'room.triple': 'Triple (3 Beds)',
    'room.double': 'Double (2 Beds)',
    'room.single': 'Single (1 Bed)',
    'room.family': 'Family Room',
    'room.maleOnly': 'Gents Only (Male)',
    'room.femaleOnly': 'Ladies Only (Female)',
    
    // Quick Stats
    'stat.totalPilgrims': 'Active Pilgrims',
    'stat.totalBatches': 'Departure Batches',
    'stat.roomsAllocated': 'Rooms Allocated',
    'stat.totalRevenue': 'Total Revenue (INR)',
    'stat.sarDisbursed': 'Saudi Ground Paid (SAR)',
    'stat.netProfit': 'Batch Net Profit',
  },
  ar: {
    // Brand & App
    'app.name': 'كلاسيك تور آند ترافيلز',
    'app.tagline': 'نظام إدارة وتخطيط رحلات الحج والعمرة والعمليات الميدانية',
    'app.location': 'مومباي، الهند — غرفة العمليات الميدانية بالمملكة',

    // Navigation
    'nav.dashboard': 'لوحة القيادة والمتابعة العامة',
    'nav.crm': 'إدارة العملاء وخط المبيعات',
    'nav.pilgrims': 'سجل الحجاج والماسح الضوئي MRZ',
    'nav.packages': 'محرك الباقات وحساب التكاليف',
    'nav.groundOps': 'مصفوفة العمليات والتسكين والنقل',
    'nav.visaNusuk': 'إدارة التأشيرات وتصاريح نسك',
    'nav.b2b': 'بوابة الوكلاء المعتمدين B2B',
    'nav.finance': 'الدفتر المالي المزدوج والأرباح',
    'nav.whatsapp': 'مركز رسائل الواتساب الآلي',
    'nav.audit': 'سجل الأمان والرقابة والتدقيق',

    // Role Switcher
    'role.super_admin': 'المدير العام (Super Admin)',
    'role.ops_manager': 'مدير العمليات الميدانية',
    'role.sales_exec': 'مسؤول المبيعات والتسويق',
    'role.saudi_ameer': 'أمير الفوج الميداني (السعودية)',
    'role.visa_officer': 'مسؤول مكتب التأشيرات',
    'role.accountant': 'المدير المالي والمحاسب',
    'role.b2b_agent': 'شريك ووكيل سفر معتمد',

    // Ground Ops Tabs
    'ground.hotelMatrix': 'مصفوفة تسكين الفنادق',
    'ground.busFleet': 'أسطول الحافلات والنقل',
    'ground.flightManifest': 'بيان تذاكر الطيران ومقاعد PNR',
    'ground.badges': 'بطاقات الحجاج ورمز الطوارئ QR',

    // Actions & General
    'action.addNew': 'إضافة جديد',
    'action.search': 'بحث بالاسم، رقم الجواز، الهاتف أو PNR...',
    'action.filter': 'تصفية البيانات',
    'action.export': 'تصدير كشف التسكين (الصيغة السعودية)',
    'action.print': 'طباعة بطاقات التعريف',
    'action.save': 'حفظ التعديلات',
    'action.cancel': 'إلغاء',
    'action.edit': 'تعديل',
    'action.delete': 'حذف',
    'action.view': 'عرض الملف',
    'action.assign': 'تسكين الغرفة',
    'action.sendWhatsApp': 'إرسال عبر الواتساب',
    'action.generateInvoice': 'إصدار الفاتورة الضريبية',
    'action.scanPassport': 'مسح جواز السفر MRZ',
    'action.quickQuote': 'إنشاء عرض سعر فوري',

    // Statuses
    'status.confirmed': 'حجز مؤكد',
    'status.deposit_paid': 'تم سداد الدفعة',
    'status.doc_followup': 'متابعة الوثائق والجوازات',
    'status.quotation_sent': 'تم إرسال عرض السعر',
    'status.new_inquiry': 'طلب استفسار جديد',
    'status.lost': 'طلب ملغي / مؤرشف',
    'status.visa_issued': 'تم إصدار التأشيرة (وزارة الخارجية)',
    'status.mofa_generated': 'تم استخراج رقم الموفا',
    'status.passport_submitted': 'تم تسليم الجواز للسفارة',
    'status.insurance_attached': 'تم ربط التأمين الصحي',
    'status.nusuk_rawdah_booked': 'تم حجز تصريح الروضة الشريفة',

    // Room Types
    'room.quad': 'غرفة رباعية (4 أسرّة)',
    'room.triple': 'غرفة ثلاثية (3 أسرّة)',
    'room.double': 'غرفة ثنائية (سريرين)',
    'room.single': 'غرفة فردية (سرير واحد)',
    'room.family': 'غرفة عائلية خاصة',
    'room.maleOnly': 'غرفة رجال فقط',
    'room.femaleOnly': 'غرفة نساء فقط',

    // Quick Stats
    'stat.totalPilgrims': 'إجمالي المعتمرين والحجاج',
    'stat.totalBatches': 'أفواج الرحلات النشطة',
    'stat.roomsAllocated': 'الغرف المسكنة بالفنادق',
    'stat.totalRevenue': 'إجمالي الإيرادات (بالروبية)',
    'stat.sarDisbursed': 'المصروفات الميدانية (بالريال)',
    'stat.netProfit': 'صافي الأرباح التشغيلية',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('ctt_erp_lang');
    return (saved === 'ar' || saved === 'en') ? saved : 'en';
  });

  const direction: 'ltr' | 'rtl' = language === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    localStorage.setItem('ctt_erp_lang', language);
    document.documentElement.dir = direction;
    document.documentElement.lang = language;
    if (language === 'ar') {
      document.body.classList.add('font-arabic');
      document.body.classList.remove('font-sans');
    } else {
      document.body.classList.add('font-sans');
      document.body.classList.remove('font-arabic');
    }
  }, [language, direction]);

  const toggleLanguage = () => {
    setLanguage(prev => (prev === 'en' ? 'ar' : 'en'));
  };

  const t = (key: string): string => {
    return TRANSLATIONS[language][key] || TRANSLATIONS.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, direction, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
