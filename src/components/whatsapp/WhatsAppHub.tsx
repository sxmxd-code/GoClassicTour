import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  Phone,
  Clock,
  CheckCircle2,
  Copy,
  ExternalLink,
  Check,
  Edit3,
} from 'lucide-react';
import { useErp } from '../../context/ErpContext';
import { useLanguage } from '../../context/LanguageContext';
import { buildWhatsAppMessage, getWhatsAppClickUrl } from '../../utils/whatsapp';

export const WhatsAppHub: React.FC = () => {
  const {
    pilgrims,
    sendWhatsAppNotification,
    whatsappMessages,
    selectedBatchId,
    packages,
    roomAllocations,
  } = useErp();
  const { t, language } = useLanguage();

  const selectedPackage = packages.find(p => p.id === selectedBatchId) || packages[0];
  const batchPilgrims = pilgrims.filter(p => p.packageBatchId === selectedPackage.id);

  const [selectedPilgrimId, setSelectedPilgrimId] = useState<string>(batchPilgrims[0]?.id || pilgrims[0]?.id || 'plg-01');
  const [templateType, setTemplateType] = useState<
    'booking_confirmation' | 'payment_receipt' | 'visa_issued' | 'flight_schedule' | 'hotel_room_assigned' | 'nusuk_rawdah_slot' | 'emergency_broadcast'
  >('visa_issued');
  const [customText, setCustomText] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);

  const currentPilgrim = pilgrims.find(p => p.id === selectedPilgrimId) || pilgrims[0];
  const makkahRoom = roomAllocations.find(r => r.id === currentPilgrim?.makkahRoomId);
  const madinahRoom = roomAllocations.find(r => r.id === currentPilgrim?.madinahRoomId);

  // Generate template message text on selection change
  useEffect(() => {
    if (!currentPilgrim) return;

    const generated = buildWhatsAppMessage(templateType, {
      pilgrimName: `${currentPilgrim.firstName} ${currentPilgrim.lastName}`,
      bookingNumber: currentPilgrim.bookingId ? `CTT-${currentPilgrim.bookingId.replace('bk-', '').toUpperCase()}` : 'CTT-2026-089',
      packageName: selectedPackage.title,
      departureDate: selectedPackage.departureDate,
      amountPaid: '₹1,50,000',
      balanceAmount: '₹80,000',
      visaNumber: currentPilgrim.visaNumber || '6029184710',
      mofaNumber: currentPilgrim.mofaNumber || 'MOFA-984120',
      flightPnr: 'SV-741-KSA',
      airline: 'Saudia (Saudi Arabian Airlines)',
      flightRoute: selectedPackage.flightRoute,
      makkahHotel: selectedPackage.makkahHotelName,
      makkahRoom: makkahRoom ? `Room #${makkahRoom.roomNumber} (Floor ${makkahRoom.floor})` : 'Room #1408 (Swissôtel Al Maqam)',
      madinahHotel: selectedPackage.madinahHotelName,
      madinahRoom: madinahRoom ? `Room #${madinahRoom.roomNumber} (Floor ${madinahRoom.floor})` : 'Room #722 (Dar Al Taqwa)',
      busNumber: 'VIP Coach #04 (Mercedes Travego)',
      ameerName: 'Maulana Imran Shaikh (Tour Ameer)',
      ameerPhone: '+966 50 123 4567',
      rawdahSlot: currentPilgrim.nusukRawdahSlot || '18 Sep 2026, 02:30 AM',
      emergencyUrl: `https://goclassictour.com/emergency-card?passport=${currentPilgrim.passportNumber}`,
    }, language === 'ar');

    setCustomText(generated);
  }, [templateType, selectedPilgrimId, language, selectedPackage, currentPilgrim]);

  const handleSendLive = () => {
    if (!currentPilgrim) return;

    sendWhatsAppNotification({
      recipientPhone: currentPilgrim.contactNumber,
      recipientName: `${currentPilgrim.firstName} ${currentPilgrim.lastName}`,
      templateType,
      messageText: customText,
      status: 'sent',
    });

    const url = getWhatsAppClickUrl(currentPilgrim.contactNumber, customText);
    window.open(url, '_blank');

    setSendSuccess(true);
    setTimeout(() => setSendSuccess(false), 3000);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(customText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const templatesList = [
    { id: 'booking_confirmation', label: '1. Booking Confirmation', icon: '📋' },
    { id: 'payment_receipt', label: '2. Payment Receipt & GST Invoice', icon: '🧾' },
    { id: 'visa_issued', label: '3. Saudi E-Visa Issued', icon: '✅' },
    { id: 'flight_schedule', label: '4. Flight Manifest & Gate Reporting', icon: '✈️' },
    { id: 'hotel_room_assigned', label: '5. Hotel Key & Ameer Card', icon: '🏨' },
    { id: 'nusuk_rawdah_slot', label: '6. Rawdah Permit Slot', icon: '🕌' },
    { id: 'emergency_broadcast', label: '7. Lost Pilgrim Emergency Card', icon: '🚨' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-emerald-600" />
            <span>{t('nav.whatsapp')}</span>
          </h2>
          <p className="text-xs text-slate-500">
            Official Meta Cloud API Hub for automated pilgrim transactional messages, payment receipts, Saudi e-visas, and hotel keys
          </p>
        </div>

        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-300 px-3 py-1.5 rounded-md text-xs text-emerald-900 font-bold shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Meta WhatsApp Cloud API: <strong>ACTIVE</strong></span>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Template Triggers & Dynamic Composer */}
        <div className="lg:col-span-7 space-y-4">
          <div className="classic-card rounded-md p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-[#03578F]" />
                <span>1. Select Recipient & Transactional Trigger</span>
              </h3>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-xs border border-emerald-200">
                Live Parameter Injection
              </span>
            </div>

            {/* Recipient Picker */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Recipient Pilgrim (From Active Manifest)
              </label>
              <select
                value={selectedPilgrimId}
                onChange={(e) => setSelectedPilgrimId(e.target.value)}
                className="w-full bg-[#F6F9FC] border border-slate-300 rounded-md px-3 py-2 text-slate-900 font-bold text-xs focus:outline-none focus:border-[#03578F] focus:bg-white"
              >
                {pilgrims.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.firstName} {p.lastName} — {p.contactNumber} (Passport: {p.passportNumber})
                  </option>
                ))}
              </select>
            </div>

            {/* Template Buttons Grid */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                Select Automated Message Template
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {templatesList.map((tpl) => (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => setTemplateType(tpl.id as any)}
                    className={`p-2.5 rounded-md border text-left rtl:text-right transition cursor-pointer font-bold flex items-center gap-2 ${
                      templateType === tpl.id
                        ? 'bg-emerald-50 border-emerald-600 text-emerald-900 shadow-2xs ring-1 ring-emerald-500'
                        : 'bg-[#F6F9FC] border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span className="text-sm">{tpl.icon}</span>
                    <span className="truncate text-[11px]">{tpl.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Editable Message Textarea */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-bold text-slate-700">
                  Message Payload (Editable Before Dispatch)
                </label>
                <span className="text-[10px] text-slate-400 font-mono">
                  {customText.length} Characters
                </span>
              </div>
              <textarea
                rows={7}
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                className="w-full bg-[#F6F9FC] border border-slate-300 rounded-md p-3 text-xs text-slate-900 font-mono leading-relaxed focus:outline-none focus:border-[#03578F] focus:bg-white resize-y"
              />
            </div>

            {/* Actions Strip */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={handleCopy}
                className="flex-1 min-w-[140px] py-2.5 rounded-md bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied to Clipboard!' : 'Copy Message'}</span>
              </button>

              <button
                onClick={handleSendLive}
                className="flex-1 min-w-[180px] py-2.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-sm cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Open in WhatsApp Web</span>
              </button>
            </div>

            {sendSuccess && (
              <div className="p-2.5 rounded-md bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Message logged to transmission audit trail and opened in WhatsApp Web!</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Light-Theme WhatsApp Smartphone Simulator */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="w-full max-w-sm bg-white border-4 border-slate-300 rounded-2xl shadow-xl overflow-hidden flex flex-col h-[540px]">
            {/* Phone Top Header — WhatsApp Brand Green */}
            <div className="bg-[#075E54] text-white px-3.5 py-2.5 flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center font-bold text-[#075E54] text-xs shadow-xs">
                  🕋
                </div>
                <div>
                  <div className="font-bold text-xs text-white leading-tight flex items-center gap-1">
                    <span>Classic Tour & Travels</span>
                    <span className="text-[10px] bg-emerald-400 text-slate-900 px-1 rounded-xs font-black">✓</span>
                  </div>
                  <div className="text-[10px] text-emerald-200">
                    Official WhatsApp Business
                  </div>
                </div>
              </div>
              <Phone className="w-4 h-4 text-emerald-200" />
            </div>

            {/* Light-Theme WhatsApp Wallpaper Area */}
            <div
              className="flex-1 p-3 overflow-y-auto space-y-3 bg-[#EFEAE2] text-slate-900 text-xs scrollbar-thin"
              style={{
                backgroundImage: 'radial-gradient(#d1c7b7 0.75px, transparent 0.75px)',
                backgroundSize: '12px 12px',
              }}
            >
              <div className="text-center">
                <span className="text-[10px] font-bold bg-white/90 text-slate-600 px-2.5 py-0.5 rounded-md shadow-2xs border border-slate-200">
                  TODAY
                </span>
              </div>

              {/* Speech Bubble — WhatsApp Light Outgoing Bubble #D9FDD3 */}
              <div className="ml-auto bg-[#D9FDD3] text-slate-900 p-3 rounded-lg rounded-tr-none shadow-xs space-y-1.5 max-w-[92%] border border-[#c4e8be]">
                <div className="text-[11px] leading-relaxed whitespace-pre-wrap font-sans text-slate-900">
                  {customText}
                </div>
                <div className="text-right text-[10px] text-slate-500 flex items-center justify-end gap-1 font-mono pt-1">
                  <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  <span className="text-sky-600 font-bold">✓✓</span>
                </div>
              </div>
            </div>

            {/* Phone Bottom Mock Input Bar */}
            <div className="bg-[#F0F2F5] p-2 border-t border-slate-200 flex items-center gap-2">
              <input
                type="text"
                disabled
                placeholder="Type a message..."
                className="flex-1 bg-white border border-slate-200 text-slate-400 text-xs rounded-full px-3 py-1.5 focus:outline-none"
              />
              <button
                onClick={handleSendLive}
                className="w-8 h-8 rounded-full bg-[#00A884] hover:bg-[#008f6f] text-white flex items-center justify-center transition shadow-2xs cursor-pointer"
                title="Dispatch via WhatsApp"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* WhatsApp Message Dispatch History Table */}
      <div className="classic-card rounded-md p-5 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#03578F]" />
            <span>Recent WhatsApp Transmission History</span>
          </h3>
          <span className="text-xs text-slate-500 font-mono">
            {whatsappMessages.length} Messages Logged
          </span>
        </div>

        {whatsappMessages.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left rtl:text-right text-xs">
              <thead className="bg-[#F6F9FC] border-b border-slate-200 text-slate-600 font-bold">
                <tr>
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Recipient Name</th>
                  <th className="py-2.5 px-3">Phone Number</th>
                  <th className="py-2.5 px-3">Template Type</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {whatsappMessages.map((msg) => (
                  <tr key={msg.id} className="hover:bg-slate-50 transition">
                    <td className="py-2.5 px-3 font-mono text-slate-500 text-[11px]">
                      {msg.timestamp}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">
                      {msg.recipientName}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[#03578F]">
                      {msg.recipientPhone}
                    </td>
                    <td className="py-2.5 px-3 capitalize">
                      <span className="px-2 py-0.5 rounded-xs bg-slate-100 text-slate-800 text-[10px] font-bold">
                        {msg.templateType.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-1.5 py-0.2 rounded-xs bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold">
                        SENT ✓✓
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <a
                        href={getWhatsAppClickUrl(msg.recipientPhone, msg.messageText)}
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-700 hover:text-emerald-900 font-bold text-[11px] inline-flex items-center gap-1"
                      >
                        Resend <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-6 text-slate-400 text-xs italic">
            No WhatsApp messages dispatched in this session yet. Select a template above and click "Open in WhatsApp Web".
          </div>
        )}
      </div>
    </div>
  );
};
