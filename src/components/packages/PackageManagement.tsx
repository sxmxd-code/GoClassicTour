import React, { useState } from 'react';
import {
  Package,
  Calculator,
  FileText,
  DollarSign,
  Send,
  Building,
  Plane,
  Sparkles,
  CheckCircle2,
  Calendar,
  Layers,
  Printer,
  X,
  Compass,
  ArrowRight,
  Save,
  Check,
} from 'lucide-react';
import { useErp } from '../../context/ErpContext';
import { useLanguage } from '../../context/LanguageContext';
import type { PackageBatch } from '../../types';
import { formatINR, formatSAR, calculatePackageCost, sarToInr } from '../../utils/currency';
import { getWhatsAppClickUrl } from '../../utils/whatsapp';

export const PackageManagement: React.FC = () => {
  const { packages, updatePackage, sarExchangeRate } = useErp();
  const { t, language } = useLanguage();

  const [selectedPkg, setSelectedPkg] = useState<PackageBatch>(packages[0]);
  const [quotationModalOpen, setQuotationModalOpen] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [customerName, setCustomerName] = useState('Haji Ahmed Merchant');
  const [customerPhone, setCustomerPhone] = useState('+91 98200 12345');
  const [selectedSharing, setSelectedSharing] = useState<'quad' | 'triple' | 'double' | 'single'>('double');

  // Dynamic Costing interactive state
  const [flightCost, setFlightCost] = useState(selectedPkg.costBreakdown.flightFareInr);
  const [makkahSarNight, setMakkahSarNight] = useState(selectedPkg.costBreakdown.makkahHotelSarPerNight);
  const [madinahSarNight, setMadinahSarNight] = useState(selectedPkg.costBreakdown.madinahHotelSarPerNight);
  const [makkahNights, setMakkahNights] = useState(selectedPkg.costBreakdown.makkahNights);
  const [madinahNights, setMadinahNights] = useState(selectedPkg.costBreakdown.madinahNights);
  const [visaCost, setVisaCost] = useState(selectedPkg.costBreakdown.visaInsuranceInr);
  const [transportSar, setTransportSar] = useState(selectedPkg.costBreakdown.transportSarPerPerson);
  const [cateringSar, setCateringSar] = useState(selectedPkg.costBreakdown.cateringSarPerDay);
  const [ziyaratSar, setZiyaratSar] = useState(selectedPkg.costBreakdown.ziyaratSar);
  const [marginInr, setMarginInr] = useState(selectedPkg.costBreakdown.targetMarginInr);

  const handleSelectPackage = (pkg: PackageBatch) => {
    setSelectedPkg(pkg);
    setFlightCost(pkg.costBreakdown.flightFareInr);
    setMakkahSarNight(pkg.costBreakdown.makkahHotelSarPerNight);
    setMadinahSarNight(pkg.costBreakdown.madinahHotelSarPerNight);
    setMakkahNights(pkg.costBreakdown.makkahNights);
    setMadinahNights(pkg.costBreakdown.madinahNights);
    setVisaCost(pkg.costBreakdown.visaInsuranceInr);
    setTransportSar(pkg.costBreakdown.transportSarPerPerson);
    setCateringSar(pkg.costBreakdown.cateringSarPerDay);
    setZiyaratSar(pkg.costBreakdown.ziyaratSar);
    setMarginInr(pkg.costBreakdown.targetMarginInr);
  };

  // Compute live calculations for all 4 sharing tiers
  const calcQuad = calculatePackageCost({
    flightFareInr: flightCost,
    makkahHotelSarPerNight: makkahSarNight,
    madinahHotelSarPerNight: madinahSarNight,
    makkahNights,
    madinahNights,
    sharingTierMultiplier: 0.25,
    visaInsuranceInr: visaCost,
    transportSarPerPerson: transportSar,
    cateringSarPerDay: cateringSar,
    ziyaratSar,
    targetMarginInr: marginInr,
    gstPercentage: 5,
    exchangeRate: sarExchangeRate,
  });

  const calcTriple = calculatePackageCost({
    flightFareInr: flightCost,
    makkahHotelSarPerNight: makkahSarNight,
    madinahHotelSarPerNight: madinahSarNight,
    makkahNights,
    madinahNights,
    sharingTierMultiplier: 0.333,
    visaInsuranceInr: visaCost,
    transportSarPerPerson: transportSar,
    cateringSarPerDay: cateringSar,
    ziyaratSar,
    targetMarginInr: marginInr,
    gstPercentage: 5,
    exchangeRate: sarExchangeRate,
  });

  const calcDouble = calculatePackageCost({
    flightFareInr: flightCost,
    makkahHotelSarPerNight: makkahSarNight,
    madinahHotelSarPerNight: madinahSarNight,
    makkahNights,
    madinahNights,
    sharingTierMultiplier: 0.5,
    visaInsuranceInr: visaCost,
    transportSarPerPerson: transportSar,
    cateringSarPerDay: cateringSar,
    ziyaratSar,
    targetMarginInr: marginInr,
    gstPercentage: 5,
    exchangeRate: sarExchangeRate,
  });

  const calcSingle = calculatePackageCost({
    flightFareInr: flightCost,
    makkahHotelSarPerNight: makkahSarNight,
    madinahHotelSarPerNight: madinahSarNight,
    makkahNights,
    madinahNights,
    sharingTierMultiplier: 1.0,
    visaInsuranceInr: visaCost,
    transportSarPerPerson: transportSar,
    cateringSarPerDay: cateringSar,
    ziyaratSar,
    targetMarginInr: marginInr,
    gstPercentage: 5,
    exchangeRate: sarExchangeRate,
  });

  const currentCalc = selectedSharing === 'quad' ? calcQuad : selectedSharing === 'triple' ? calcTriple : selectedSharing === 'double' ? calcDouble : calcSingle;

  const handleSaveToPackage = () => {
    updatePackage(selectedPkg.id, {
      pricing: {
        quadSharingInr: calcQuad.finalSellingPriceInr,
        tripleSharingInr: calcTriple.finalSellingPriceInr,
        doubleSharingInr: calcDouble.finalSellingPriceInr,
        singleSharingInr: calcSingle.finalSellingPriceInr,
      },
      costBreakdown: {
        ...selectedPkg.costBreakdown,
        flightFareInr: flightCost,
        makkahHotelSarPerNight: makkahSarNight,
        madinahHotelSarPerNight: madinahSarNight,
        makkahNights,
        madinahNights,
        visaInsuranceInr: visaCost,
        transportSarPerPerson: transportSar,
        cateringSarPerDay: cateringSar,
        ziyaratSar,
        targetMarginInr: marginInr,
      },
    });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Package className="w-5 h-5 text-[#03578F]" />
            <span>{t('nav.packages')}</span>
          </h2>
          <p className="text-xs text-slate-500">
            Dynamic SAR-to-INR Cost Simulator, 4-Tier Sharing Multiplier, and Branded Quotation PDF Generator
          </p>
        </div>

        <button
          onClick={() => setQuotationModalOpen(true)}
          className="flex items-center gap-1.5 bg-[#03578F] hover:bg-[#02436e] text-white font-bold px-4 py-2 rounded-md text-xs transition shadow-sm cursor-pointer"
        >
          <FileText className="w-4 h-4 text-amber-300" />
          <span>Generate Client Quotation</span>
        </button>
      </div>

      {/* Package Selector Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {packages.map((pkg) => {
          const isSelected = pkg.id === selectedPkg.id;
          return (
            <div
              key={pkg.id}
              onClick={() => handleSelectPackage(pkg)}
              className={`p-4 rounded-md transition cursor-pointer border ${
                isSelected
                  ? 'bg-white border-[#03578F] shadow-[0_4px_16px_rgba(3,87,143,0.12)] ring-1 ring-[#03578F]'
                  : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-[10px] font-bold px-1.5 py-0.2 bg-[#03578F]/10 text-[#03578F] rounded-xs font-mono">
                  {pkg.code}
                </span>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded-xs">
                  {pkg.durationDays} Days
                </span>
              </div>

              <h3 className="font-extrabold text-xs text-slate-950 mb-1 line-clamp-1">
                {language === 'ar' ? pkg.titleAr : pkg.title}
              </h3>
              <p className="text-[10px] text-slate-500 mb-3 line-clamp-1">
                ✈️ {pkg.flightRoute} • 📅 {pkg.departureDate}
              </p>

              <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between text-xs">
                <span className="text-[10px] text-slate-400">Quad From:</span>
                <span className="font-mono font-bold text-[#03578F]">
                  {formatINR(pkg.pricing.quadSharingInr)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 2-Column Core: Dynamic SAR/INR Simulator & Live 4-Tier Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Cost Input Sliders & Parameters */}
        <div className="lg:col-span-7 classic-card rounded-md p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Calculator className="w-4 h-4 text-[#03578F]" />
                <span>Dynamic SAR-to-INR Cost Matrix Engine</span>
              </h3>
              <p className="text-[11px] text-slate-500">Live recalculation based on current rate (1 SAR = ₹{sarExchangeRate})</p>
            </div>
            <span className="text-xs font-bold text-[#03578F] bg-[#03578F]/10 px-2 py-0.5 rounded-xs">
              {selectedPkg.code}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Flight Cost */}
            <div className="bg-[#F6F9FC] p-3 rounded-md border border-slate-200 space-y-1">
              <div className="flex justify-between font-semibold text-slate-700">
                <span>Flight Ticket (INR)</span>
                <span className="font-mono font-bold text-[#03578F]">{formatINR(flightCost)}</span>
              </div>
              <input
                type="range"
                min="25000"
                max="150000"
                step="500"
                value={flightCost}
                onChange={(e) => setFlightCost(Number(e.target.value))}
                className="w-full accent-[#03578F] cursor-pointer"
              />
              <span className="text-[10px] text-slate-400">Direct Saudia / Air India Flight</span>
            </div>

            {/* Visa & Insurance */}
            <div className="bg-[#F6F9FC] p-3 rounded-md border border-slate-200 space-y-1">
              <div className="flex justify-between font-semibold text-slate-700">
                <span>Visa & MoFA Fees (INR)</span>
                <span className="font-mono font-bold text-[#03578F]">{formatINR(visaCost)}</span>
              </div>
              <input
                type="range"
                min="10000"
                max="60000"
                step="500"
                value={visaCost}
                onChange={(e) => setVisaCost(Number(e.target.value))}
                className="w-full accent-[#03578F] cursor-pointer"
              />
              <span className="text-[10px] text-slate-400">MoFA, Insurance & Tasheer Biometric</span>
            </div>

            {/* Makkah Hotel (SAR/Night) */}
            <div className="bg-[#F6F9FC] p-3 rounded-md border border-slate-200 space-y-1">
              <div className="flex justify-between font-semibold text-slate-700">
                <span>Makkah Hotel ({makkahNights} Nights)</span>
                <span className="font-mono font-bold text-emerald-800">{formatSAR(makkahSarNight)}/nt</span>
              </div>
              <input
                type="range"
                min="200"
                max="3500"
                step="25"
                value={makkahSarNight}
                onChange={(e) => setMakkahSarNight(Number(e.target.value))}
                className="w-full accent-emerald-700 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>≈ {formatINR(sarToInr(makkahSarNight, sarExchangeRate))} / night</span>
                <span>{selectedPkg.makkahHotelName}</span>
              </div>
            </div>

            {/* Madinah Hotel (SAR/Night) */}
            <div className="bg-[#F6F9FC] p-3 rounded-md border border-slate-200 space-y-1">
              <div className="flex justify-between font-semibold text-slate-700">
                <span>Madinah Hotel ({madinahNights} Nights)</span>
                <span className="font-mono font-bold text-emerald-800">{formatSAR(madinahSarNight)}/nt</span>
              </div>
              <input
                type="range"
                min="200"
                max="2800"
                step="25"
                value={madinahSarNight}
                onChange={(e) => setMadinahSarNight(Number(e.target.value))}
                className="w-full accent-emerald-700 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>≈ {formatINR(sarToInr(madinahSarNight, sarExchangeRate))} / night</span>
                <span>{selectedPkg.madinahHotelName}</span>
              </div>
            </div>

            {/* Saudi Ground Transport (SAR) */}
            <div className="bg-[#F6F9FC] p-3 rounded-md border border-slate-200 space-y-1">
              <div className="flex justify-between font-semibold text-slate-700">
                <span>Transport / Pax (SAR)</span>
                <span className="font-mono font-bold text-emerald-800">{formatSAR(transportSar)}</span>
              </div>
              <input
                type="range"
                min="150"
                max="2500"
                step="10"
                value={transportSar}
                onChange={(e) => setTransportSar(Number(e.target.value))}
                className="w-full accent-emerald-700 cursor-pointer"
              />
              <span className="text-[10px] text-slate-400">Jeddah-Makkah-Madinah VIP Coach</span>
            </div>

            {/* Catering & Ziyarat (SAR) */}
            <div className="bg-[#F6F9FC] p-3 rounded-md border border-slate-200 space-y-1">
              <div className="flex justify-between font-semibold text-slate-700">
                <span>Catering & Buffet / Day (SAR)</span>
                <span className="font-mono font-bold text-emerald-800">{formatSAR(cateringSar)}/day</span>
              </div>
              <input
                type="range"
                min="50"
                max="300"
                step="10"
                value={cateringSar}
                onChange={(e) => setCateringSar(Number(e.target.value))}
                className="w-full accent-emerald-700 cursor-pointer"
              />
              <span className="text-[10px] text-slate-400">3 Meals Buffet + Laundry Service</span>
            </div>

            {/* Agency Target Margin */}
            <div className="bg-[#F6F9FC] p-3 rounded-md border border-slate-200 space-y-1 sm:col-span-2">
              <div className="flex justify-between font-semibold text-slate-700">
                <span>Agency Target Net Margin (INR / Pax)</span>
                <span className="font-mono font-bold text-[#B48C36] text-sm">{formatINR(marginInr)}</span>
              </div>
              <input
                type="range"
                min="5000"
                max="100000"
                step="1000"
                value={marginInr}
                onChange={(e) => setMarginInr(Number(e.target.value))}
                className="w-full accent-[#B48C36] cursor-pointer"
              />
              <span className="text-[10px] text-slate-400">Net Operator Profit Margin per pilgrim</span>
            </div>
          </div>
        </div>

        {/* Right Column: Live 4-Tier Sharing Matrix */}
        <div className="lg:col-span-5 classic-card rounded-md p-5 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">4-Tier Sharing Selling Matrix</h3>
              <span className="text-[10px] text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded-xs border border-emerald-200">
                Live Reactive
              </span>
            </div>

            <div className="space-y-2.5 mt-3">
              {/* Quad */}
              <div className="bg-[#F6F9FC] border border-slate-200 p-3 rounded-md flex items-center justify-between">
                <div>
                  <span className="font-bold text-xs text-slate-900 block">Quad Sharing (4 Pax/Room)</span>
                  <span className="text-[10px] text-slate-500">Cost: {formatINR(calcQuad.totalDirectCostInr)} + Margin: {formatINR(marginInr)}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-[#03578F] font-mono block">
                    {formatINR(calcQuad.finalSellingPriceInr)}
                  </span>
                  <span className="text-[10px] text-emerald-700 font-bold">Margin: {calcQuad.grossProfitMarginPercent}%</span>
                </div>
              </div>

              {/* Triple */}
              <div className="bg-[#F6F9FC] border border-slate-200 p-3 rounded-md flex items-center justify-between">
                <div>
                  <span className="font-bold text-xs text-slate-900 block">Triple Sharing (3 Pax/Room)</span>
                  <span className="text-[10px] text-slate-500">Cost: {formatINR(calcTriple.totalDirectCostInr)} + Margin: {formatINR(marginInr)}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-[#03578F] font-mono block">
                    {formatINR(calcTriple.finalSellingPriceInr)}
                  </span>
                  <span className="text-[10px] text-emerald-700 font-bold">Margin: {calcTriple.grossProfitMarginPercent}%</span>
                </div>
              </div>

              {/* Double */}
              <div className="bg-[#F6F9FC] border-2 border-[#03578F] p-3 rounded-md flex items-center justify-between shadow-xs">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs text-[#03578F]">Double Sharing (2 Pax/Room)</span>
                    <span className="text-[9px] bg-[#03578F] text-white px-1 py-0.2 rounded-xs font-bold">POPULAR</span>
                  </div>
                  <span className="text-[10px] text-slate-500">Cost: {formatINR(calcDouble.totalDirectCostInr)} + Margin: {formatINR(marginInr)}</span>
                </div>
                <div className="text-right">
                  <span className="text-base font-black text-[#03578F] font-mono block">
                    {formatINR(calcDouble.finalSellingPriceInr)}
                  </span>
                  <span className="text-[10px] text-emerald-700 font-bold">Margin: {calcDouble.grossProfitMarginPercent}%</span>
                </div>
              </div>

              {/* Single */}
              <div className="bg-[#F6F9FC] border border-slate-200 p-3 rounded-md flex items-center justify-between">
                <div>
                  <span className="font-bold text-xs text-slate-900 block">Single Private Room</span>
                  <span className="text-[10px] text-slate-500">Cost: {formatINR(calcSingle.totalDirectCostInr)} + Margin: {formatINR(marginInr)}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-[#03578F] font-mono block">
                    {formatINR(calcSingle.finalSellingPriceInr)}
                  </span>
                  <span className="text-[10px] text-emerald-700 font-bold">Margin: {calcSingle.grossProfitMarginPercent}%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            <button
              onClick={handleSaveToPackage}
              className={`w-full py-2 font-bold rounded-md text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs ${
                saveSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-900 hover:bg-slate-800 text-white'
              }`}
            >
              {saveSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Saved to Package Database!</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Save New Costing to Package</span>
                </>
              )}
            </button>

            <button
              onClick={() => setQuotationModalOpen(true)}
              className="w-full py-2 bg-[#03578F] hover:bg-[#02436e] text-white font-bold rounded-md text-xs transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Create Client Quotation Slip</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Branded Quotation Slip Modal */}
      {quotationModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-md max-w-2xl w-full p-6 shadow-2xl text-slate-900 space-y-4 animate-in fade-in zoom-in-95 duration-100">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h3 className="font-bold text-base text-[#03578F] flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#B48C36]" />
                <span>Client Official Quotation Generator</span>
              </h3>
              <button onClick={() => setQuotationModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Customer input strip */}
            <div className="grid grid-cols-3 gap-3 text-xs bg-[#F6F9FC] p-3 rounded-md border border-slate-200">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Pilgrim / Family Name</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-md px-2.5 py-1 text-slate-900 focus:outline-none focus:border-[#03578F]"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">WhatsApp Mobile</label>
                <input
                  type="text"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-md px-2.5 py-1 text-slate-900 focus:outline-none focus:border-[#03578F]"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Room Sharing Basis</label>
                <select
                  value={selectedSharing}
                  onChange={(e) => setSelectedSharing(e.target.value as any)}
                  className="w-full bg-white border border-slate-300 rounded-md px-2 py-1 text-slate-900 focus:outline-none"
                >
                  <option value="quad">Quad Sharing (4 in Room)</option>
                  <option value="triple">Triple Sharing (3 in Room)</option>
                  <option value="double">Double Sharing (2 in Room)</option>
                  <option value="single">Single Private Room</option>
                </select>
              </div>
            </div>

            {/* Quotation Slip Preview with Official Logo */}
            <div className="bg-[#F6F9FC] border border-slate-200 p-5 rounded-md space-y-3.5 shadow-2xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-3">
                  <img
                    src="/assets/logos/classiclogo.png"
                    alt="Classic Tour & Travels"
                    className="h-9 w-auto object-contain"
                  />
                  <div className="pl-3 rtl:pl-0 rtl:pr-3 border-l rtl:border-l-0 rtl:border-r border-slate-200">
                    <p className="text-[11px] font-bold text-slate-800">
                      Govt. Approved Hajj & Umrah Tour Organizers (Est. 1990)
                    </p>
                    <p className="text-[10px] text-slate-500 font-mono">Tel: +91 9920974825 • WhatsApp: +91 9920975825 • goclassictour.com</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-100 text-amber-900 rounded-xs">
                    OFFICIAL QUOTATION
                  </span>
                  <p className="text-[10px] font-mono text-slate-500 mt-0.5">Ref: CTT-Q-{Date.now().toString().slice(-4)}</p>
                </div>
              </div>

              {/* Package & Customer Details */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px]">PREPARED FOR:</span>
                  <strong className="text-slate-900 text-sm">{customerName}</strong>
                  <div className="text-[11px] text-slate-600 font-mono">{customerPhone}</div>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 block text-[10px]">PACKAGE SELECTED:</span>
                  <strong className="text-[#03578F] text-sm">{selectedPkg.title}</strong>
                  <div className="text-[11px] text-slate-600">Departure: {selectedPkg.departureDate} ({selectedPkg.durationDays} Days)</div>
                </div>
              </div>

              {/* Inclusions Matrix */}
              <div className="bg-white p-3 rounded-md border border-slate-200 text-xs space-y-1.5">
                <div className="font-bold text-[#03578F] text-[11px]">ALL-INCLUSIVE COMPREHENSIVE ITINERARY:</div>
                <ul className="grid grid-cols-2 gap-1 text-[11px] text-slate-700">
                  <li>✅ Direct Flight Tickets: {selectedPkg.flightRoute}</li>
                  <li>✅ Makkah: {selectedPkg.makkahHotelName} ({makkahNights} Nights)</li>
                  <li>✅ Madinah: {selectedPkg.madinahHotelName} ({madinahNights} Nights)</li>
                  <li>✅ Saudi E-Visa with Full Medical Insurance</li>
                  <li>✅ AC Luxury VIP Bus Transfers & Ziyarat</li>
                  <li>✅ Daily 3-Course Buffet Catering & Laundry</li>
                </ul>
              </div>

              {/* Price Banner */}
              <div className="bg-[#03578F] text-white p-3.5 rounded-md flex items-center justify-between">
                <div>
                  <span className="text-xs uppercase tracking-wider text-amber-200 block font-semibold">
                    Total Quotation ({selectedSharing.toUpperCase()} SHARING)
                  </span>
                  <span className="text-[11px] text-sky-100">Including 5% GST & All Saudi Municipal Fees</span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black font-mono text-amber-300">
                    {formatINR(currentCalc.finalSellingPriceInr)}
                  </span>
                  <span className="text-[10px] text-sky-200 block">Per Person All-Inclusive</span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setQuotationModalOpen(false)}
                className="px-3.5 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print PDF</span>
              </button>
              <a
                href={getWhatsAppClickUrl(
                  customerPhone,
                  `Assalamu Alaikum ${customerName}, here is your official Umrah quotation from Classic Tour & Travels Mumbai for ${selectedPkg.title} (${selectedSharing.toUpperCase()} Sharing) at ${formatINR(currentCalc.finalSellingPriceInr)} per person all-inclusive. May we proceed with seat confirmation?`
                )}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Dispatch on WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
