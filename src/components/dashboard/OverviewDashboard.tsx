import React, { useState } from 'react';
import {
  Users,
  Building,
  CreditCard,
  FileCheck2,
  Calendar,
  Plane,
  Bus,
  ScanLine,
  TrendingUp,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  Compass,
  QrCode,
  Send,
  CheckCircle2,
  AlertTriangle,
  Search,
  Plus,
  Sparkles,
  Layers,
  PieChart,
  BarChart3,
  Activity,
  HeartPulse,
  UserCheck,
  Bed,
  MapPin,
  ChevronRight,
  PhoneCall,
  ExternalLink,
} from 'lucide-react';
import { useErp } from '../../context/ErpContext';
import { useLanguage } from '../../context/LanguageContext';
import { formatINR, formatSAR } from '../../utils/currency';
import { getWhatsAppClickUrl } from '../../utils/whatsapp';
import type { TabType } from '../common/Sidebar';

interface OverviewDashboardProps {
  setActiveTab: (tab: TabType) => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({ setActiveTab }) => {
  const {
    pilgrims,
    bookings,
    packages,
    roomAllocations,
    transports,
    transactions,
    selectedBatchId,
    setSelectedBatchId,
    useMockData,
    setUseMockData,
    leads,
  } = useErp();
  const { t, language } = useLanguage();

  const [rosterSearch, setRosterSearch] = useState('');
  const [activeScope, setActiveScope] = useState<string>('all'); // 'all' or packageId
  const [chartMetric, setChartMetric] = useState<'pilgrims' | 'revenue'>('pilgrims');

  // Active batch object if specific scope chosen, else fallback to selectedBatchId
  const activePackage = packages.find(p => p.id === (activeScope === 'all' ? selectedBatchId : activeScope)) || packages[0];

  // Scoped Collections
  const scopedPilgrims = activeScope === 'all'
    ? pilgrims
    : pilgrims.filter(p => p.packageBatchId === activeScope);

  const scopedBookings = activeScope === 'all'
    ? bookings
    : bookings.filter(b => b.packageBatchId === activeScope);

  const scopedRooms = activeScope === 'all'
    ? roomAllocations
    : roomAllocations.filter(r => r.packageBatchId === activeScope);

  const scopedTransactions = activeScope === 'all'
    ? transactions
    : transactions.filter(t => t.packageBatchId === activeScope);

  // Revenue & Collections Calculations
  const totalRevenueInr = scopedBookings.reduce((sum, b) => sum + b.totalAmountInr, 0);
  const totalCollectedInr = scopedBookings.reduce((sum, b) => sum + b.paidAmountInr, 0);
  const totalBalanceInr = totalRevenueInr - totalCollectedInr;
  const collectionPercentage = totalRevenueInr > 0 ? Math.round((totalCollectedInr / totalRevenueInr) * 100) : 0;

  // SAR Supplier Disbursements
  const totalSarDisbursed = scopedTransactions
    .filter(t => t.currency === 'SAR' && (t.transactionType === 'supplier_payment' || t.transactionType === 'hotel_disbursement'))
    .reduce((sum, t) => sum + t.amount, 0);

  // Room Allocation Stats
  const totalBeds = scopedRooms.reduce((sum, r) => sum + r.capacity, 0);
  const occupiedBeds = scopedRooms.reduce((sum, r) => sum + r.pilgrimIds.length, 0);
  const roomAllocPercentage = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

  // Visa & Nusuk Stats
  const visaIssuedCount = scopedPilgrims.filter(p =>
    p.visaStatus === 'visa_issued' || p.visaStatus === 'completed' || p.visaStatus === 'nusuk_rawdah_booked'
  ).length;
  const rawdahBookedCount = scopedPilgrims.filter(p => !!p.nusukRawdahSlot).length;
  const visaPercentage = scopedPilgrims.length > 0 ? Math.round((visaIssuedCount / scopedPilgrims.length) * 100) : 0;

  // Demographics Analytics
  const maleCount = scopedPilgrims.filter(p => p.gender === 'male').length;
  const femaleCount = scopedPilgrims.filter(p => p.gender === 'female').length;
  const seniorCount = scopedPilgrims.filter(p => p.age >= 60).length;
  const adultCount = scopedPilgrims.filter(p => p.age >= 18 && p.age < 60).length;
  const childCount = scopedPilgrims.filter(p => p.age < 18).length;
  const wheelchairCount = scopedPilgrims.filter(p => p.specialNeeds && p.specialNeeds.toLowerCase().includes('wheelchair')).length;

  // CRM Funnel Metrics
  const leadsNew = leads.filter(l => l.status === 'new_inquiry').length;
  const leadsQuoted = leads.filter(l => l.status === 'quotation_sent').length;
  const leadsFollowup = leads.filter(l => l.status === 'doc_followup').length;
  const leadsConfirmed = leads.filter(l => l.status === 'confirmed').length;

  // Monthly Season Projection Chart Data
  const monthlyTrends = useMockData ? [
    { month: 'Jan', pilgrims: 32, revenueLakhs: 44.1, hajjSeats: 0 },
    { month: 'Feb', pilgrims: 45, revenueLakhs: 62.5, hajjSeats: 0 },
    { month: 'Mar (Ramadan)', pilgrims: 85, revenueLakhs: 148.7, hajjSeats: 0 },
    { month: 'Apr (Shawwal)', pilgrims: 50, revenueLakhs: 72.0, hajjSeats: 0 },
    { month: 'May (Hajj Dep)', pilgrims: 50, revenueLakhs: 392.5, hajjSeats: 50 },
    { month: 'Jun (Hajj Ret)', pilgrims: 50, revenueLakhs: 392.5, hajjSeats: 50 },
    { month: 'Jul', pilgrims: 25, revenueLakhs: 35.0, hajjSeats: 0 },
    { month: 'Aug', pilgrims: 40, revenueLakhs: 58.0, hajjSeats: 0 },
    { month: 'Sep (Deluxe)', pilgrims: pilgrims.length > 0 ? pilgrims.length * 4 : 45, revenueLakhs: (totalRevenueInr / 100000) || 68.5, hajjSeats: 0 },
    { month: 'Oct', pilgrims: 30, revenueLakhs: 46.0, hajjSeats: 0 },
    { month: 'Nov', pilgrims: 38, revenueLakhs: 55.0, hajjSeats: 0 },
    { month: 'Dec (Winter)', pilgrims: 60, revenueLakhs: 95.0, hajjSeats: 0 },
  ] : [
    { month: 'Jan', pilgrims: 0, revenueLakhs: 0, hajjSeats: 0 },
    { month: 'Feb', pilgrims: 0, revenueLakhs: 0, hajjSeats: 0 },
    { month: 'Mar', pilgrims: 0, revenueLakhs: 0, hajjSeats: 0 },
    { month: 'Apr', pilgrims: 0, revenueLakhs: 0, hajjSeats: 0 },
    { month: 'May', pilgrims: 0, revenueLakhs: 0, hajjSeats: 0 },
    { month: 'Jun', pilgrims: 0, revenueLakhs: 0, hajjSeats: 0 },
    { month: 'Jul', pilgrims: 0, revenueLakhs: 0, hajjSeats: 0 },
    { month: 'Aug', pilgrims: 0, revenueLakhs: 0, hajjSeats: 0 },
    { month: 'Sep', pilgrims: scopedPilgrims.length, revenueLakhs: totalRevenueInr / 100000, hajjSeats: 0 },
    { month: 'Oct', pilgrims: 0, revenueLakhs: 0, hajjSeats: 0 },
    { month: 'Nov', pilgrims: 0, revenueLakhs: 0, hajjSeats: 0 },
    { month: 'Dec', pilgrims: 0, revenueLakhs: 0, hajjSeats: 0 },
  ];

  // Filtered Roster
  const filteredRoster = scopedPilgrims.filter(p => {
    const term = rosterSearch.toLowerCase();
    return (
      p.firstName.toLowerCase().includes(term) ||
      p.lastName.toLowerCase().includes(term) ||
      p.passportNumber.toLowerCase().includes(term) ||
      p.contactNumber.includes(term)
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Hero Banner — Classic Tour Brand Gradient */}
      <div className="bg-gradient-to-r from-[#03578F] via-[#06517A] to-[#0A6EA6] border border-[#02436e] text-white rounded-md p-5 sm:p-6 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-sm bg-amber-400/20 border border-amber-300/40 text-amber-200 text-[11px] font-bold mb-2">
              <Compass className="w-3.5 h-3.5" />
              <span>
                {language === 'ar' ? 'غرفة العمليات المركزية 1447هـ' : 'Executive Command Center • Mumbai HQ (Est. 1990)'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {activeScope === 'all'
                ? 'Agency-Wide Operations & Financial Overview'
                : (language === 'ar' ? activePackage?.titleAr : activePackage?.title)}
            </h2>
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-2 text-xs text-sky-100 font-medium">
              {activeScope !== 'all' && activePackage && (
                <>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-amber-300" />
                    <span>Dep: <strong>{activePackage.departureDate}</strong> ({activePackage.durationDays} Days)</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Plane className="w-3.5 h-3.5 text-amber-300" />
                    <span>{activePackage.flightRoute}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Building className="w-3.5 h-3.5 text-amber-300" />
                    <span>{activePackage.makkahHotelName}</span>
                  </span>
                </>
              )}
              {activeScope === 'all' && (
                <span className="text-sky-200">
                  Monitoring {packages.length} Departure Batches • {pilgrims.length} Total Enrolled Pilgrims • Live Multi-Currency Ledger
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => setActiveTab('crm')}
              className="flex items-center gap-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-3.5 py-2 rounded-md text-xs transition shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{t('crm.newLead')}</span>
            </button>
            <button
              onClick={() => setActiveTab('pilgrims')}
              className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-bold px-3.5 py-2 rounded-md text-xs transition backdrop-blur-xs cursor-pointer"
            >
              <ScanLine className="w-4 h-4 text-amber-300" />
              <span>{t('pilgrims.scanPassport')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Scope Selector Bar */}
      <div className="bg-white border border-slate-200 rounded-md p-2.5 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-[#03578F]" />
            <span>Dashboard Scope:</span>
          </span>
          <button
            onClick={() => setActiveScope('all')}
            className={`px-3 py-1 rounded-md text-xs font-bold transition cursor-pointer ${
              activeScope === 'all'
                ? 'bg-[#03578F] text-white shadow-2xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            🌐 All Active Batches ({pilgrims.length} Pax)
          </button>
          {packages.map((pkg) => {
            const count = pilgrims.filter(p => p.packageBatchId === pkg.id).length;
            const isSelected = activeScope === pkg.id;
            return (
              <button
                key={pkg.id}
                onClick={() => {
                  setActiveScope(pkg.id);
                  setSelectedBatchId(pkg.id);
                }}
                className={`px-3 py-1 rounded-md text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 shadow-2xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>{pkg.code}</span>
                <span className="text-[10px] bg-slate-900/10 px-1.5 py-0.2 rounded-xs font-mono">
                  {count} Pax
                </span>
              </button>
            );
          })}
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Showing data for: <strong className="text-slate-900">{activeScope === 'all' ? 'All Batches' : activePackage?.code}</strong>
        </div>
      </div>

      {/* Blank State Guidance Alert if Mock Data is OFF */}
      {!useMockData && pilgrims.length === 0 && (
        <div className="classic-card rounded-md p-4 bg-amber-50/70 border-amber-300 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-amber-950">Clean Production Mode Active</h4>
              <p className="text-[11px] text-amber-800">
                Data is clean and empty. You can enroll real pilgrims, record transactions, or toggle Demo Mock Data in the sidebar to view populated mock records.
              </p>
            </div>
          </div>
          <button
            onClick={() => setUseMockData(true)}
            className="px-3.5 py-1.5 rounded-md bg-[#03578F] hover:bg-[#02436e] text-white text-xs font-bold shrink-0 cursor-pointer shadow-2xs inline-flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Load Demo Mock Data</span>
          </button>
        </div>
      )}

      {/* 4 Core KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Gross Revenue */}
        <div className="classic-card rounded-md p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Gross Booking Revenue</span>
            <div className="w-8 h-8 rounded-md bg-[#03578F]/10 text-[#03578F] flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-950 font-mono">
            {formatINR(totalRevenueInr)}
          </div>
          <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100 font-medium">
            <span className="text-emerald-700 font-bold">Collected: {formatINR(totalCollectedInr)}</span>
            <span className="text-rose-700 font-mono font-bold">Bal: {formatINR(totalBalanceInr)}</span>
          </div>
        </div>

        {/* Confirmed Pilgrims */}
        <div className="classic-card rounded-md p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Confirmed Pilgrims</span>
            <div className="w-8 h-8 rounded-md bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-950 font-mono">
            {scopedPilgrims.length} <span className="text-sm font-normal text-slate-400">Pax</span>
          </div>
          <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100">
            <span className="text-slate-600">Active Bookings:</span>
            <span className="font-bold text-[#03578F] font-mono">{scopedBookings.length} Invoices</span>
          </div>
        </div>

        {/* Saudi E-Visas & Rawdah */}
        <div className="classic-card rounded-md p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">MoFA Visas & Rawdah</span>
            <div className="w-8 h-8 rounded-md bg-sky-50 text-[#03578F] flex items-center justify-center">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-950 font-mono">
            {visaPercentage}% <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded-xs">Issued</span>
          </div>
          <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100 font-medium">
            <span className="text-slate-600">Issued: {visaIssuedCount} Pax</span>
            <span className="text-[#03578F] font-bold">Rawdah: {rawdahBookedCount} Booked</span>
          </div>
        </div>

        {/* Room Allocations */}
        <div className="classic-card rounded-md p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Hotel Beds Allocated</span>
            <div className="w-8 h-8 rounded-md bg-amber-50 text-[#B48C36] flex items-center justify-center">
              <Building className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-950 font-mono">
            {roomAllocPercentage}% <span className="text-xs font-semibold text-slate-500">({occupiedBeds}/{totalBeds || 0} Beds)</span>
          </div>
          <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100 font-medium">
            <span className="text-slate-600">Disbursed (SAR):</span>
            <span className="font-bold text-emerald-800 font-mono">{formatSAR(totalSarDisbursed)}</span>
          </div>
        </div>
      </div>

      {/* Advanced Visual Analytics: 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column (8 cols): Monthly Departure Volume Trend & CRM Velocity */}
        <div className="lg:col-span-8 space-y-5">
          {/* Monthly Trend Bar Chart */}
          <div className="classic-card rounded-md p-5 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-[#03578F]" />
                  <span>Departure & Pilgrim Growth Analytics (2026 Season)</span>
                </h3>
                <p className="text-[11px] text-slate-500">Monthly pilgrim mobilization & revenue trajectory across Mumbai departures</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setChartMetric(chartMetric === 'pilgrims' ? 'revenue' : 'pilgrims')}
                  className="text-xs font-bold text-[#03578F] bg-sky-50 border border-sky-200 px-2.5 py-1 rounded-sm cursor-pointer hover:bg-sky-100"
                >
                  Switch to {chartMetric === 'pilgrims' ? 'Revenue (₹ Lakhs)' : 'Pilgrims (Pax)'}
                </button>
              </div>
            </div>

            {/* Custom Interactive SVG / CSS Bar Chart */}
            <div className="pt-2">
              <div className="grid grid-cols-6 sm:grid-cols-12 gap-2 items-end h-44 border-b border-slate-200 pb-2">
                {monthlyTrends.map((m, idx) => {
                  const maxVal = chartMetric === 'pilgrims' ? 90 : 400;
                  const currentVal = chartMetric === 'pilgrims' ? m.pilgrims : m.revenueLakhs;
                  const heightPercent = maxVal > 0 ? Math.min(100, Math.round((currentVal / maxVal) * 100)) : 0;
                  const isHajj = m.hajjSeats > 0;
                  return (
                    <div key={idx} className="flex flex-col items-center gap-1 group h-full justify-end">
                      <div className="text-[9px] font-mono font-bold text-slate-700 opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                        {chartMetric === 'pilgrims' ? `${m.pilgrims} Pax` : `₹${m.revenueLakhs}L`}
                      </div>
                      <div
                        style={{ height: `${Math.max(8, heightPercent)}%` }}
                        className={`w-full max-w-[28px] rounded-t-sm transition-all duration-300 group-hover:opacity-90 ${
                          isHajj
                            ? 'bg-gradient-to-t from-amber-600 to-amber-400 shadow-xs'
                            : 'bg-gradient-to-t from-[#02436e] to-[#03578F]'
                        }`}
                      />
                      <span className="text-[9px] font-bold text-slate-600 text-center truncate w-full">
                        {m.month.split(' ')[0]}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2 font-medium">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-xs bg-[#03578F]" />
                    <span>Umrah Departures</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-xs bg-amber-500" />
                    <span>VIP Hajj Departures</span>
                  </span>
                </div>
                <span>*Values dynamically synchronized with live batch manifests</span>
              </div>
            </div>
          </div>

          {/* CRM Conversion Funnel & Lead Flow */}
          <div className="classic-card rounded-md p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <span>CRM Lead Conversion Pipeline Funnel</span>
                </h3>
                <p className="text-[11px] text-slate-500">Inquiry-to-departure conversion velocity and follow-up efficiency</p>
              </div>
              <button
                onClick={() => setActiveTab('crm')}
                className="text-xs font-bold text-[#03578F] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View CRM Pipeline</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-[#F6F9FC] border border-slate-200 p-3 rounded-md">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">1. New Inquiries</span>
                <span className="text-xl font-black text-slate-900 font-mono">{leadsNew} Leads</span>
                <span className="text-[10px] text-sky-700 block font-semibold mt-1">Website & WhatsApp</span>
              </div>
              <div className="bg-[#F6F9FC] border border-slate-200 p-3 rounded-md">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">2. Quotations Sent</span>
                <span className="text-xl font-black text-slate-900 font-mono">{leadsQuoted} Leads</span>
                <span className="text-[10px] text-indigo-700 block font-semibold mt-1">Costing Sent</span>
              </div>
              <div className="bg-[#F6F9FC] border border-slate-200 p-3 rounded-md">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">3. Document Follow-up</span>
                <span className="text-xl font-black text-slate-900 font-mono">{leadsFollowup} Leads</span>
                <span className="text-[10px] text-amber-700 block font-semibold mt-1">Awaiting Passports</span>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-md">
                <span className="text-[10px] uppercase font-bold text-emerald-800 block">4. Confirmed Pax</span>
                <span className="text-xl font-black text-emerald-900 font-mono">{leadsConfirmed + scopedPilgrims.length} Pax</span>
                <span className="text-[10px] text-emerald-700 block font-bold mt-1">Enrolled & Confirmed</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Pilgrim Demographics & Saudi Ground Status */}
        <div className="lg:col-span-4 space-y-5">
          {/* Pilgrim Demographics Radar */}
          <div className="classic-card rounded-md p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <PieChart className="w-4 h-4 text-[#03578F]" />
                <span>Pilgrim Demographics</span>
              </h3>
              <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-xs font-mono">
                {scopedPilgrims.length} Pax
              </span>
            </div>

            {/* Gender Breakdown Bar */}
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between font-bold text-slate-700">
                <span>Gender Ratio</span>
                <span>{maleCount} Male ({scopedPilgrims.length > 0 ? Math.round((maleCount / scopedPilgrims.length) * 100) : 0}%) • {femaleCount} Female</span>
              </div>
              <div className="w-full bg-pink-100 h-2.5 rounded-full overflow-hidden flex">
                <div
                  style={{ width: `${scopedPilgrims.length > 0 ? (maleCount / scopedPilgrims.length) * 100 : 0}%` }}
                  className="bg-[#03578F] h-full"
                />
                <div
                  style={{ width: `${scopedPilgrims.length > 0 ? (femaleCount / scopedPilgrims.length) * 100 : 0}%` }}
                  className="bg-pink-500 h-full"
                />
              </div>
            </div>

            {/* Age Brackets & Special Medical Needs */}
            <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
              <div className="flex items-center justify-between text-slate-700">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>Seniors (60+ Years):</span>
                </span>
                <strong className="font-mono">{seniorCount} Pax</strong>
              </div>
              <div className="flex items-center justify-between text-slate-700">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#03578F]" />
                  <span>Adults (18–59 Years):</span>
                </span>
                <strong className="font-mono">{adultCount} Pax</strong>
              </div>
              <div className="flex items-center justify-between text-slate-700">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Children (&lt;18 Years):</span>
                </span>
                <strong className="font-mono">{childCount} Pax</strong>
              </div>
              <div className="flex items-center justify-between text-rose-800 bg-rose-50 border border-rose-200 p-2 rounded-md font-bold text-[11px] mt-1">
                <span className="flex items-center gap-1.5">
                  <HeartPulse className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                  <span>Wheelchair / Special Care:</span>
                </span>
                <strong className="font-mono">{wheelchairCount} Pax</strong>
              </div>
            </div>
          </div>

          {/* Saudi Ground Operations Live Status */}
          <div className="classic-card rounded-md p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-600" />
                <span>Saudi Ground Operations Live</span>
              </h3>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            {scopedRooms.length === 0 ? (
              <div className="bg-[#F6F9FC] border border-dashed border-slate-300 p-6 rounded-md text-center text-slate-500 text-xs space-y-2">
                <Building className="w-6 h-6 text-slate-300 mx-auto" />
                <p>No active hotel room blocks or vehicle manifests.</p>
              </div>
            ) : (
              <div className="space-y-2.5 text-xs">
                <div className="bg-[#F6F9FC] border border-slate-200 p-2.5 rounded-md flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-[#03578F]" />
                      <span>Makkah: Swissôtel / Fairmont</span>
                    </div>
                    <span className="text-[10px] text-slate-500">20m Clock Tower • Front Desk Sync</span>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-900 border border-emerald-200 font-bold text-[10px] rounded-xs">
                    CONFIRMED
                  </span>
                </div>

                <div className="bg-[#F6F9FC] border border-slate-200 p-2.5 rounded-md flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Madinah: Dar Al Taqwa</span>
                    </div>
                    <span className="text-[10px] text-slate-500">10m Ladies Gate • Northern Courtyard</span>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-900 border border-emerald-200 font-bold text-[10px] rounded-xs">
                    CONFIRMED
                  </span>
                </div>

                <div className="bg-[#F6F9FC] border border-slate-200 p-2.5 rounded-md flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <Bus className="w-3.5 h-3.5 text-indigo-600" />
                      <span>VIP Ground Coach (50-Seater)</span>
                    </div>
                    <span className="text-[10px] text-slate-500">Driver: Tariq Al-Ghamdi • KSA-7821-B</span>
                  </div>
                  <span className="px-2 py-0.5 bg-sky-50 text-sky-900 border border-sky-200 font-bold text-[10px] rounded-xs">
                    SCHEDULED
                  </span>
                </div>
              </div>
            )}

            <button
              onClick={() => setActiveTab('groundOps')}
              className="w-full py-2 bg-[#03578F] hover:bg-[#02436e] text-white font-bold rounded-md text-xs transition shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Manage Ground Operations</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Pilgrim Manifest Roster */}
      <div className="classic-card rounded-md p-5 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-[#03578F]" />
              <span>
                Pilgrim Manifest Roster — {activeScope === 'all' ? 'All Active Batches' : activePackage?.title}
              </span>
            </h3>
            <p className="text-[11px] text-slate-500">
              Live manifest with Saudi MoFA visa stage, Nusuk Rawdah permit, room allocation, and emergency badges
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 rtl:left-auto rtl:right-2.5" />
              <input
                type="text"
                placeholder="Search pilgrim name or passport..."
                value={rosterSearch}
                onChange={(e) => setRosterSearch(e.target.value)}
                className="w-full bg-[#F6F9FC] border border-slate-200 rounded-md pl-8 pr-3 py-1.5 rtl:pl-3 rtl:pr-8 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#03578F] focus:bg-white"
              />
            </div>
            <button
              onClick={() => setActiveTab('pilgrims')}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-bold shrink-0 transition cursor-pointer"
            >
              View Full Vault
            </button>
          </div>
        </div>

        {/* Manifest Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left rtl:text-right text-xs">
            <thead className="bg-[#F6F9FC] border-b border-slate-200 text-slate-600 font-bold">
              <tr>
                <th className="py-2.5 px-3">Pilgrim Name</th>
                <th className="py-2.5 px-3">Passport #</th>
                <th className="py-2.5 px-3">Batch Code</th>
                <th className="py-2.5 px-3">Mahram Head / Role</th>
                <th className="py-2.5 px-3">MoFA Visa Status</th>
                <th className="py-2.5 px-3">Nusuk Rawdah Slot</th>
                <th className="py-2.5 px-3">Makkah Room</th>
                <th className="py-2.5 px-3">Madinah Room</th>
                <th className="py-2.5 px-3 text-right">Quick Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRoster.map((p) => {
                const mkRoom = roomAllocations.find(r => r.id === p.makkahRoomId);
                const mdRoom = roomAllocations.find(r => r.id === p.madinahRoomId);
                const pkg = packages.find(pkg => pkg.id === p.packageBatchId);
                return (
                  <tr key={p.id} className="hover:bg-slate-50 transition">
                    <td className="py-2.5 px-3 font-bold text-slate-950">
                      {p.firstName} {p.lastName}
                      <div className="text-[10px] text-slate-500 font-normal">
                        {p.gender.toUpperCase()} • {p.age} yrs {p.specialNeeds ? `• ⚠️ ${p.specialNeeds}` : ''}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-[#03578F]">
                      {p.passportNumber}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-1.5 py-0.2 rounded-xs bg-slate-100 text-slate-700 text-[10px] font-bold">
                        {pkg?.code || 'BATCH'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      {p.isMahramHead ? (
                        <span className="px-2 py-0.5 rounded-xs bg-amber-50 text-amber-900 border border-amber-300 font-bold text-[10px]">
                          Mahram Head
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[11px]">
                          Dependent ({p.relationship})
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded-xs text-[10px] font-bold ${
                        p.visaStatus === 'visa_issued' || p.visaStatus === 'nusuk_rawdah_booked'
                          ? 'bg-emerald-50 text-emerald-900 border border-emerald-300'
                          : p.visaStatus === 'mofa_generated' || p.visaStatus === 'insurance_attached'
                          ? 'bg-sky-50 text-[#03578F] border border-sky-300'
                          : 'bg-amber-50 text-amber-900 border border-amber-300'
                      }`}>
                        {p.visaStatus.replace(/_/g, ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      {p.nusukRawdahSlot ? (
                        <span className="font-semibold text-slate-800 text-[11px] block">
                          {p.nusukRawdahSlot}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">Pending Slot</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 font-mono">
                      {mkRoom ? (
                        <span className="font-bold text-slate-900">Rm {mkRoom.roomNumber}</span>
                      ) : (
                        <span className="text-rose-600 font-semibold text-[10px]">Unassigned</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 font-mono">
                      {mdRoom ? (
                        <span className="font-bold text-slate-900">Rm {mdRoom.roomNumber}</span>
                      ) : (
                        <span className="text-rose-600 font-semibold text-[10px]">Unassigned</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setActiveTab('groundOps')}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-sm text-[10px] font-bold cursor-pointer"
                        >
                          Badge
                        </button>
                        <a
                          href={getWhatsAppClickUrl(
                            p.contactNumber,
                            `Assalamu Alaikum ${p.firstName}, update from Classic Tour & Travels Mumbai regarding your booking.`
                          )}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-sm text-[10px] font-bold cursor-pointer flex items-center gap-1"
                        >
                          <Send className="w-2.5 h-2.5" />
                          <span>WhatsApp</span>
                        </a>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredRoster.length === 0 && (
            <div className="text-center py-10 text-slate-500 text-xs italic bg-slate-50 rounded-md">
              No pilgrims found matching your search.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
