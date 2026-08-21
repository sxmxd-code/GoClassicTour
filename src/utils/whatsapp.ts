/**
 * WhatsApp Business Automation & Notification Templates
 * Generates formatted WhatsApp messages and direct wa.me click-to-chat links
 */

export interface WhatsAppTemplateData {
  pilgrimName: string;
  bookingNumber?: string;
  packageName?: string;
  departureDate?: string;
  amountPaid?: string;
  balanceAmount?: string;
  visaNumber?: string;
  mofaNumber?: string;
  flightPnr?: string;
  airline?: string;
  flightRoute?: string;
  makkahHotel?: string;
  makkahRoom?: string;
  madinahHotel?: string;
  madinahRoom?: string;
  busNumber?: string;
  ameerName?: string;
  ameerPhone?: string;
  rawdahSlot?: string;
  emergencyUrl?: string;
}

export function buildWhatsAppMessage(
  type: 
    | 'booking_confirmation'
    | 'payment_receipt'
    | 'visa_issued'
    | 'flight_schedule'
    | 'hotel_room_assigned'
    | 'nusuk_rawdah_slot'
    | 'daily_itinerary'
    | 'emergency_broadcast',
  data: WhatsAppTemplateData,
  isArabic = false
): string {
  if (isArabic) {
    switch (type) {
      case 'booking_confirmation':
        return `🕌 *كلاسيك تور آند ترافيلز — تأكيد حجز العمرة/الحج*

السلام عليكم ورحمة الله وبركاته، الأخ/الأخت الكريم/ة *${data.pilgrimName}*

يسعدنا تأكيد حجزكم المبارك:
📋 *رقم الحجز:* ${data.bookingNumber || 'CTT-2026'}
📦 *الباقة:* ${data.packageName || 'باقة العمرة المتميزة'}
📅 *تاريخ المغادرة:* ${data.departureDate || 'قريباً'}

نرحب بكم في رحلة الإيمان وخدمة ضيوف الرحمن.
📞 للاستفسارات: +91 98200 12345 / +966 50 123 4567`;

      case 'payment_receipt':
        return `🧾 *إيصال استلام دفعة مالية — كلاسيك تور آند ترافيلز*

الاسم: *${data.pilgrimName}*
المبلغ المستلم: *${data.amountPaid}*
المتبقي: *${data.balanceAmount}*
رقم الحجز: ${data.bookingNumber}

تقبل الله طاعتكم وبارك لكم في رزقكم.`;

      case 'visa_issued':
        return `✅ *بشرى سارة — تم إصدار التأشيرة الإلكترونية بنجاح*

المعتمر/الحاج: *${data.pilgrimName}*
رقم التأشيرة: *${data.visaNumber}*
رقم مرجع وزارة الخارجية (MoFA): *${data.mofaNumber}*

تم إرفاق وثيقة التأشيرة الرسمية. يرجى التأكد من مطابقة البيانات مع جواز السفر.`;

      case 'hotel_room_assigned':
        return `🏨 *تفاصيل الإقامة وتسكين الغرف — مكة المكرمة والمدينة المنورة*

الضيف الكريم: *${data.pilgrimName}*

🕋 *مكة المكرمة:*
فندق: ${data.makkahHotel || 'فندق مكة'}
رقم الغرفة: *${data.makkahRoom || 'قيد التخصيص'}*

🕌 *المدينة المنورة:*
فندق: ${data.madinahHotel || 'فندق المدينة'}
رقم الغرفة: *${data.madinahRoom || 'قيد التخصيص'}*

أمير الفوج: ${data.ameerName} (${data.ameerPhone})`;

      case 'emergency_broadcast':
        return `🚨 *تنبيه وإرشاد عاجل للحجاج والمعتمرين*

الأخ/الأخت: *${data.pilgrimName}*
رقم الحافلة المخصصة: *${data.busNumber}*
مسؤول الفوج الميداني: *${data.ameerName}* (${data.ameerPhone})

🔗 بطاقة الطوارئ الرقمية الخاصة بك:
${data.emergencyUrl || 'https://goclassictour.com/emergency'}`;

      default:
        return `السلام عليكم ${data.pilgrimName}، تحياتنا من كلاسيك تور آند ترافيلز.`;
    }
  }

  // English Templates
  switch (type) {
    case 'booking_confirmation':
      return `🕋 *CLASSIC TOUR & TRAVELS — Booking Confirmation*

Assalamu Alaikum *${data.pilgrimName}*,

Mubarak! Your booking for the blessed journey has been confirmed.

📋 *Booking Ref:* ${data.bookingNumber || 'CTT-2026-089'}
📦 *Package:* ${data.packageName || 'Classic Deluxe Umrah'}
✈️ *Departure Date:* ${data.departureDate || '2026-09-15'}
💰 *Amount Paid:* ${data.amountPaid || '₹50,000'}
⏳ *Balance Due:* ${data.balanceAmount || '₹1,30,000'}

Our dedicated ground operations team in Mumbai & Saudi Arabia is at your service.
📞 Helpline: +91 98200 12345 / +966 50 123 4567
🌐 goclassictour.com`;

    case 'payment_receipt':
      return `🧾 *PAYMENT RECEIPT ACKNOWLEDGMENT*

Dear *${data.pilgrimName}*,
We have successfully received your payment:

💵 *Amount Received:* ${data.amountPaid}
💳 *Booking Ref:* ${data.bookingNumber}
📊 *Remaining Balance:* ${data.balanceAmount}

Thank you for choosing Classic Tour & Travels Mumbai.`;

    case 'visa_issued':
      return `✅ *SAUDI VISA ISSUED SUCCESSFULLY*

Dear *${data.pilgrimName}*,
Alhamdulillah! Your Saudi Tourist/Umrah Visa has been processed & issued by the Ministry of Foreign Affairs (MoFA).

📄 *Visa Number:* ${data.visaNumber || '6029184710'}
📑 *MoFA Application #:* ${data.mofaNumber || 'MOFA-98412'}
✈️ *Status:* Valid for Saudi Entry

Please verify your name and passport details on the attached PDF copy.`;

    case 'flight_schedule':
      return `✈️ *FLIGHT MANIFEST & DEPARTURE SCHEDULE*

Dear *${data.pilgrimName}*,
Here are your verified flight tickets for departure:

🛫 *Airline:* ${data.airline || 'Saudia (Saudi Arabian Airlines)'}
🎫 *PNR:* *${data.flightPnr || 'W9X7KP'}*
📍 *Route:* ${data.flightRoute || 'BOM (Mumbai T2) ➔ JED (Jeddah T1)'}
📅 *Date:* ${data.departureDate || '2026-09-15'}

Please report to Mumbai Chhatrapati Shivaji Maharaj International Airport (T2) 4 hours prior to departure. Our Mumbai Airport Ameer will meet you at Gate 4.`;

    case 'hotel_room_assigned':
      return `🏨 *HOTEL & ROOM ALLOCATION DETAILS*

Dear *${data.pilgrimName}*,
Your luxury room accommodation in the holy cities is confirmed:

🕋 *Makkah Al-Mukarramah:*
• Hotel: *${data.makkahHotel || 'Fairmont Clock Royal Tower'}*
• Room Number: *${data.makkahRoom || 'Floor 14 - Room 1408'}*

🕌 *Madinah Al-Munawwarah:*
• Hotel: *${data.madinahHotel || 'Anwar Al Madinah Mövenpick'}*
• Room Number: *${data.madinahRoom || 'Floor 7 - Room 722'}*

👤 *Saudi Tour Ameer:* ${data.ameerName || 'Maulana Imran Shaikh'} (${data.ameerPhone || '+966 50 123 4567'})`;

    case 'nusuk_rawdah_slot':
      return `🕌 *NUSUK APPOINTMENT CONFIRMATION — RAWDAH RIYAD-UL-JANNAH*

Dear *${data.pilgrimName}*,
Alhamdulillah! Your official Saudi Nusuk permit for praying in the blessed Rawdah Sharif has been scheduled:

🗓️ *Appointment Slot:* *${data.rawdahSlot || '18 Sep 2026, 02:30 AM (Post-Tahajjud)'}*
📍 *Entry Gate:* Bab As-Salam / Gate 37 (Men) | Gate 24 (Women)
⚠️ *Important:* Please carry your Pilgrim Badge & keep your Nusuk QR ready 30 minutes before the slot.`;

    case 'emergency_broadcast':
      return `🚨 *IMPORTANT PILGRIM CARD & EMERGENCY CONTACTS*

Dear *${data.pilgrimName}*,
For your safety during Tawaf, Sa'i, and travel across Makkah & Madinah:

🚌 *Assigned Bus #:* *${data.busNumber || 'Bus #04 (Mercedes Travego)'}*
👤 *Group Ameer:* ${data.ameerName || 'Maulana Imran Shaikh'} (${data.ameerPhone || '+966 50 123 4567'})
📍 *Makkah Hotel:* ${data.makkahHotel || 'Fairmont Clock Tower'}

🔗 *Live Digital Emergency Card & GPS Navigation:*
${data.emergencyUrl || 'https://goclassictour.com/emergency-profile?id=plg-01'}`;

    default:
      return `Assalamu Alaikum ${data.pilgrimName}, greeting from Classic Tour & Travels Mumbai.`;
  }
}

/**
 * Creates direct WhatsApp click-to-chat web link
 */
export function getWhatsAppClickUrl(phone: string, text: string): string {
  // Format international number (e.g. +91 98200 12345 -> 919820012345)
  const cleaned = phone.replace(/[^0-9]/g, '');
  const encodedText = encodeURIComponent(text);
  return `https://wa.me/${cleaned}?text=${encodedText}`;
}
