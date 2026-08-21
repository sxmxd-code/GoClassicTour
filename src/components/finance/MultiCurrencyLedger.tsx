import React, { useState } from 'react';
import {
  Landmark,
  DollarSign,
  TrendingUp,
  FileText,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  CreditCard,
  Building,
  Printer,
  Sparkles,
  CheckCircle2,
  X,
  Edit2,
  Percent,
} from 'lucide-react';
import { useErp } from '../../context/ErpContext';
import { useLanguage } from '../../context/LanguageContext';
import type { FinancialTransaction, TransactionType, Currency } from '../../types';
import { formatINR, formatSAR, sarToInr, inrToSar } from '../../utils/currency';

export const MultiCurrencyLedger: React.FC = () => {
  const { transactions, addTransaction, sarExchangeRate, setSarExchangeRate, selectedBatchId, packages, bookings } = useErp();
  const { t, language } = useLanguage();

  const [activeTab, setActiveTab] = useState<'ledger' | 'pnl' | 'invoice'>('ledger');
  const [showAddTxnModal, setShowAddTxnModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showRateModal, setShowRateModal] = useState(false);
  const [tempRate, setTempRate] = useState(String(sarExchangeRate));

  // Form State
  const [txnType, setTxnType] = useState<TransactionType>('customer_receipt');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('50000');
  const [currency, setCurrency] = useState<Currency>('INR');
  const [paymentMode, setPaymentMode] = useState<FinancialTransaction['paymentMode']>('Bank Transfer');
  const [referenceNumber, setReferenceNumber] = useState('');

  const selectedPackage = packages.find(p => p.id === selectedBatchId) || packages[0];
  const batchBookings = bookings.filter(b => b.packageBatchId === selectedPackage.id);

  // Financial Calculations for P&L
  const totalRevenue = batchBookings.reduce((sum, b) => sum + b.totalAmountInr, 0);
  const pilgrimCount = batchBookings.reduce((sum, b) => sum + b.pilgrimCount, 0);

  // Estimated Cost Breakdown based on package parameters
  const flightCosts = pilgrimCount * selectedPackage.costBreakdown.flightFareInr;
  const makkahHotelSar = (pilgrimCount / 3.5) * selectedPackage.costBreakdown.makkahHotelSarPerNight * selectedPackage.costBreakdown.makkahNights;
  const madinahHotelSar = (pilgrimCount / 3.5) * selectedPackage.costBreakdown.madinahHotelSarPerNight * selectedPackage.costBreakdown.madinahNights;
  const hotelCostsInr = sarToInr(makkahHotelSar + madinahHotelSar, sarExchangeRate);
  const transportCostsInr = sarToInr(pilgrimCount * selectedPackage.costBreakdown.transportSarPerPerson, sarExchangeRate);
  const cateringCostsInr = sarToInr(pilgrimCount * selectedPackage.costBreakdown.cateringSarPerDay * selectedPackage.durationDays, sarExchangeRate);
  const visaCostsInr = pilgrimCount * selectedPackage.costBreakdown.visaInsuranceInr;
  const agentCommissionsInr = batchBookings.reduce((sum, b) => sum + (b.agentCommissionInr || 0), 0);

  const totalDirectCosts = flightCosts + hotelCostsInr + transportCostsInr + cateringCostsInr + visaCostsInr + agentCommissionsInr;
  const grossProfit = totalRevenue - totalDirectCosts;
  const netProfitMarginPercent = totalRevenue > 0 ? ((grossProfit / totalRevenue) * 100).toFixed(1) : '0';

  const handleCreateTxn = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (!num || !description) return;

    const rate = currency === 'SAR' ? sarExchangeRate : 1.0;
    const amountInr = currency === 'SAR' ? sarToInr(num, rate) : num;

    addTransaction({
      packageBatchId: selectedPackage.id,
      transactionType: txnType,
      description,
      currency,
      amount: num,
      exchangeRate: rate,
      amountInr,
      paymentMode,
      referenceNumber: referenceNumber || `REF-${Date.now().toString().slice(-6)}`,
      receiptNumber: `REC-${Date.now().toString().slice(-4)}`,
      status: 'verified',
    });

    setDescription('');
    setShowAddTxnModal(false);
  };

  const handleSaveRate = () => {
    const num = parseFloat(tempRate);
    if (!isNaN(num) && num > 0) {
      setSarExchangeRate(num);
      setShowRateModal(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Landmark className="w-5 h-5 text-[#03578F]" />
            <span>Multi-Currency Ledger & Departure P&L</span>
          </h2>
          <p className="text-xs text-slate-500">
            Real-time dual-currency accounting (INR Receipts vs SAR Saudi Disbursements), Departure Batch P&L, and GST Tax Invoices
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Live SAR Forex Modifier in Finance Header */}
          <button
            onClick={() => {
              setTempRate(String(sarExchangeRate));
              setShowRateModal(true);
            }}
            className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-md px-3 py-1.5 text-xs font-semibold transition cursor-pointer shadow-2xs"
            title="Click to adjust live SAR to INR exchange rate"
          >
            <DollarSign className="w-4 h-4 text-emerald-700" />
            <span className="font-mono font-bold">1 SAR = ₹{sarExchangeRate.toFixed(2)}</span>
            <span className="text-[9px] bg-emerald-700 text-white px-1.5 py-0.2 rounded-xs font-bold uppercase">
              Adjust Rate
            </span>
          </button>

          {/* Tab Toggle */}
          <div className="bg-slate-200/80 p-0.5 rounded-md flex items-center border border-slate-300/80">
            <button
              onClick={() => setActiveTab('ledger')}
              className={`px-3 py-1.5 text-xs font-bold rounded-sm transition cursor-pointer ${
                activeTab === 'ledger' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              General Ledger
            </button>
            <button
              onClick={() => setActiveTab('pnl')}
              className={`px-3 py-1.5 text-xs font-bold rounded-sm transition cursor-pointer ${
                activeTab === 'pnl' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Batch P&L Statement
            </button>
            <button
              onClick={() => setActiveTab('invoice')}
              className={`px-3 py-1.5 text-xs font-bold rounded-sm transition cursor-pointer ${
                activeTab === 'invoice' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              GST Tax Invoices
            </button>
          </div>

          <button
            onClick={() => setShowAddTxnModal(true)}
            className="flex items-center gap-1.5 bg-[#03578F] hover:bg-[#02436e] text-white font-bold px-3.5 py-1.5 rounded-md text-xs transition shadow-2xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Record Transaction</span>
          </button>
        </div>
      </div>

      {/* SAR Rate Edit Modal */}
      {showRateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-md p-6 max-w-sm w-full shadow-xl text-slate-900 animate-in fade-in zoom-in-95 duration-100">
            <h3 className="font-bold text-base text-[#03578F] mb-1 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span>Saudi Riyal (SAR) Exchange Rate</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Update the SAR conversion rate. All package costing formulas and P&L statements recalculate instantly in real-time.
            </p>
            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                1 Saudi Riyal (SAR ﷼) = INR (₹)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 font-bold">
                  ₹
                </span>
                <input
                  type="number"
                  step="0.01"
                  value={tempRate}
                  onChange={(e) => setTempRate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-md pl-8 pr-3 py-2 text-slate-900 font-bold text-base focus:outline-none focus:border-[#03578F] focus:bg-white"
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowRateModal(false)}
                className="px-3.5 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
              >
                {t('action.cancel')}
              </button>
              <button
                onClick={handleSaveRate}
                className="px-4 py-1.5 rounded-md bg-[#03578F] hover:bg-[#02436e] text-white text-xs font-bold transition shadow-xs cursor-pointer"
              >
                {t('action.save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 1: General Ledger Table */}
      {activeTab === 'ledger' && (
        <div className="classic-card rounded-md overflow-hidden">
          <table className="w-full text-left rtl:text-right text-xs">
            <thead className="bg-[#F6F9FC] border-b border-slate-200 text-slate-600 font-bold">
              <tr>
                <th className="py-2.5 px-3">Date & Ref</th>
                <th className="py-2.5 px-3">Transaction Description</th>
                <th className="py-2.5 px-3">Category Type</th>
                <th className="py-2.5 px-3">Payment Mode</th>
                <th className="py-2.5 px-3 font-mono">Original Amount</th>
                <th className="py-2.5 px-3 font-mono">Forex Rate</th>
                <th className="py-2.5 px-3 font-mono text-right">INR Value (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.map((txn) => {
                const isCredit = txn.transactionType === 'customer_receipt';
                return (
                  <tr key={txn.id} className="hover:bg-slate-50 transition">
                    <td className="py-2.5 px-3">
                      <div className="font-mono text-slate-900 font-bold text-[11px]">{txn.createdAt}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{txn.referenceNumber}</div>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-slate-950">{txn.description}</div>
                      {txn.receiptNumber && (
                        <span className="text-[10px] text-slate-500 font-mono">Receipt: {txn.receiptNumber}</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded-xs text-[10px] font-bold ${
                        isCredit ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' : 'bg-amber-50 text-amber-900 border border-amber-200'
                      }`}>
                        {txn.transactionType.replace(/_/g, ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-700 font-medium">{txn.paymentMode}</td>
                    <td className="py-2.5 px-3 font-mono font-bold">
                      {txn.currency === 'SAR' ? formatSAR(txn.amount) : formatINR(txn.amount)}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-500 text-[11px]">
                      {txn.currency === 'SAR' ? `@ ₹${txn.exchangeRate}` : '1.0'}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-right">
                      <span className={isCredit ? 'text-emerald-700' : 'text-slate-900'}>
                        {isCredit ? '+' : '-'}{formatINR(txn.amountInr)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {transactions.length === 0 && (
            <div className="py-12 text-center text-slate-500 text-xs italic bg-slate-50 space-y-2">
              <Landmark className="w-8 h-8 text-slate-300 mx-auto" />
              <p>No financial transactions recorded yet.</p>
              <button
                onClick={() => setShowAddTxnModal(true)}
                className="px-3 py-1.5 bg-[#03578F] text-white rounded-md text-xs font-bold shadow-2xs cursor-pointer inline-flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Record First Transaction</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Departure Batch Profitability Statement (P&L) */}
      {activeTab === 'pnl' && (
        <div className="space-y-4">
          <div className="classic-card rounded-md p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <span>Departure Batch Profit & Loss Statement</span>
                </h3>
                <p className="text-[11px] text-slate-500">Live operational profitability for {selectedPackage.title}</p>
              </div>
              <span className="text-xs font-bold text-[#03578F] bg-[#03578F]/10 px-2.5 py-1 rounded-xs font-mono">
                {selectedPackage.code}
              </span>
            </div>

            {/* P&L Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-[#F6F9FC] border border-slate-200 rounded-md p-4 space-y-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Gross Booking Revenue</span>
                <div className="text-2xl font-black text-slate-950 font-mono">{formatINR(totalRevenue)}</div>
                <span className="text-[10px] text-emerald-700 font-bold">{pilgrimCount} Total Pilgrims</span>
              </div>

              <div className="bg-[#F6F9FC] border border-slate-200 rounded-md p-4 space-y-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Direct Costs</span>
                <div className="text-2xl font-black text-rose-700 font-mono">{formatINR(totalDirectCosts)}</div>
                <span className="text-[10px] text-slate-500 font-mono">Forex @ ₹{sarExchangeRate}/SAR</span>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-md p-4 space-y-1">
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Net Batch Profit Margin</span>
                <div className="text-2xl font-black text-emerald-800 font-mono">{formatINR(grossProfit)}</div>
                <span className="text-[11px] text-emerald-700 font-black">{netProfitMarginPercent}% Net Margin</span>
              </div>
            </div>

            {/* Detailed Cost Line Items */}
            <div className="border border-slate-200 rounded-md overflow-hidden text-xs">
              <table className="w-full text-left rtl:text-right">
                <thead className="bg-[#F6F9FC] border-b border-slate-200 text-slate-600 font-bold">
                  <tr>
                    <th className="py-2.5 px-3">Cost Component</th>
                    <th className="py-2.5 px-3">Supplier / Currency</th>
                    <th className="py-2.5 px-3 font-mono">SAR Amount</th>
                    <th className="py-2.5 px-3 font-mono text-right">INR Value (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-2.5 px-3 font-bold text-slate-900">1. Airfare Tickets ({pilgrimCount} Pax)</td>
                    <td className="py-2.5 px-3 text-slate-600">Saudia / Air India (INR)</td>
                    <td className="py-2.5 px-3 font-mono text-slate-400">—</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-right text-slate-900">{formatINR(flightCosts)}</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-bold text-slate-900">2. Makkah & Madinah Hotels</td>
                    <td className="py-2.5 px-3 text-slate-600">Swissôtel & Dar Al Taqwa (SAR)</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-emerald-800">{formatSAR(makkahHotelSar + madinahHotelSar)}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-right text-slate-900">{formatINR(hotelCostsInr)}</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-bold text-slate-900">3. Saudi Ground Transport & Ziyarat</td>
                    <td className="py-2.5 px-3 text-slate-600">Al-Wafaa Transport (SAR)</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-emerald-800">{formatSAR(pilgrimCount * selectedPackage.costBreakdown.transportSarPerPerson)}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-right text-slate-900">{formatINR(transportCostsInr)}</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-bold text-slate-900">4. Catering & Buffet Meals</td>
                    <td className="py-2.5 px-3 text-slate-600">Al-Baik & Indian Catering (SAR)</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-emerald-800">{formatSAR(pilgrimCount * selectedPackage.costBreakdown.cateringSarPerDay * selectedPackage.durationDays)}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-right text-slate-900">{formatINR(cateringCostsInr)}</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-bold text-slate-900">5. MoFA Saudi Visas & Medical Insurance</td>
                    <td className="py-2.5 px-3 text-slate-600">Ministry of Foreign Affairs (INR)</td>
                    <td className="py-2.5 px-3 font-mono text-slate-400">—</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-right text-slate-900">{formatINR(visaCostsInr)}</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-bold text-slate-900">6. B2B Sub-Agent Commissions</td>
                    <td className="py-2.5 px-3 text-slate-600">Partner Agencies (INR)</td>
                    <td className="py-2.5 px-3 font-mono text-slate-400">—</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-right text-slate-900">{formatINR(agentCommissionsInr)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: GST Tax Invoices Preview */}
      {activeTab === 'invoice' && (
        <div className="space-y-4">
          <div className="classic-card rounded-md p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#03578F]" />
                  <span>GST-Compliant Tax Invoicing (SAC 998555)</span>
                </h3>
                <p className="text-[11px] text-slate-500">Official tax invoices generated under Ministry of Tourism regulations</p>
              </div>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold px-3 py-1.5 rounded-md text-xs transition cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Official Invoice</span>
              </button>
            </div>

            {/* Printable Tax Invoice Slip with Official Logo */}
            <div className="bg-[#F6F9FC] border-2 border-slate-300 p-5 rounded-md space-y-4 text-xs">
              <div className="flex items-start justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-3">
                  <img
                    src="/assets/logos/classiclogo.png"
                    alt="Classic Tour & Travels"
                    className="h-9 w-auto object-contain"
                  />
                  <div className="pl-3 rtl:pl-0 rtl:pr-3 border-l rtl:border-l-0 rtl:border-r border-slate-200">
                    <p className="text-[10px] font-bold text-slate-800">Crawford Market, Mumbai 400001 • GSTIN: 27AABCU9603R1ZM</p>
                    <p className="text-[10px] text-slate-500 font-mono">Tel: +91 9920974825 • WhatsApp: +91 9920975825</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-mono text-xs font-bold block text-slate-900">TAX INVOICE: INV-2026-089</span>
                  <span className="text-[10px] text-slate-500">Date: {new Date().toISOString().split('T')[0]}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px]">BILLED TO (PRIMARY PILGRIM):</span>
                  <strong className="text-slate-950 text-sm">Mohammed Farooq Khan</strong>
                  <p className="text-slate-600">Mumbai, Maharashtra • Contact: +91 98201 54321</p>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 block text-[10px]">BOOKING DETAILS:</span>
                  <strong className="text-[#03578F]">{selectedPackage.title}</strong>
                  <p className="text-slate-600">Booking Ref: CTT-2026-089 (4 Pax Family)</p>
                </div>
              </div>

              <table className="w-full text-left rtl:text-right border-t border-b border-slate-200">
                <thead className="bg-white text-slate-700 font-bold">
                  <tr>
                    <th className="py-2">Description of Services</th>
                    <th className="py-2">SAC Code</th>
                    <th className="py-2 font-mono">Taxable Value</th>
                    <th className="py-2 font-mono">GST (5%)</th>
                    <th className="py-2 font-mono text-right">Total Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-2 font-medium">Hajj & Umrah Tour Arrangement Services (4 Pax Deluxe Package)</td>
                    <td className="py-2 font-mono">998555</td>
                    <td className="py-2 font-mono">₹5,25,714</td>
                    <td className="py-2 font-mono">₹26,286</td>
                    <td className="py-2 font-mono font-bold text-right text-slate-950">₹5,52,000</td>
                  </tr>
                </tbody>
              </table>

              <div className="flex justify-between items-center pt-2">
                <span className="text-[10px] text-slate-500 italic">This is a computer generated tax invoice issued under SAC 998555.</span>
                <div className="text-right">
                  <span className="text-xs text-slate-500 block">Total Invoice Value (Incl. 5% GST):</span>
                  <span className="text-lg font-black text-slate-950 font-mono">₹5,52,000</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Record Transaction Modal */}
      {showAddTxnModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-md max-w-md w-full p-6 shadow-2xl text-slate-900 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h3 className="font-bold text-base text-[#03578F] flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-600" />
                <span>Record New Financial Transaction</span>
              </h3>
              <button onClick={() => setShowAddTxnModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTxn} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Transaction Category</label>
                  <select
                    value={txnType}
                    onChange={(e) => setTxnType(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-md px-2.5 py-1.5 text-slate-900 font-bold focus:outline-none"
                  >
                    <option value="customer_receipt">Customer Payment (Credit +)</option>
                    <option value="supplier_payment">Saudi Supplier Payment (Debit -)</option>
                    <option value="airline_disbursement">Airline Ticket Booking (Debit -)</option>
                    <option value="agent_commission">Agent Commission (Debit -)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Currency</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-md px-2.5 py-1.5 text-slate-900 font-bold focus:outline-none"
                  >
                    <option value="INR">INR (Indian Rupee ₹)</option>
                    <option value="SAR">SAR (Saudi Riyal ﷼)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Amount</label>
                <input
                  type="number"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-1.5 text-slate-900 font-mono font-bold text-sm focus:outline-none focus:border-[#03578F]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Deposit for 15 Rooms at Swissôtel Makkah"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-1.5 text-slate-900 focus:outline-none focus:border-[#03578F]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Payment Method</label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-md px-2.5 py-1.5 text-slate-900 focus:outline-none"
                  >
                    <option value="Bank Transfer">Bank Transfer (NEFT/RTGS)</option>
                    <option value="UPI">UPI</option>
                    <option value="Cash">Cash</option>
                    <option value="Saudi Bank SNB">Saudi Bank SNB</option>
                    <option value="Wallet">B2B Agent Wallet</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Reference / UTR #</label>
                  <input
                    type="text"
                    placeholder="UTR-2026-98124"
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-1.5 text-slate-900 font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddTxnModal(false)}
                  className="px-3.5 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-md bg-[#03578F] hover:bg-[#02436e] text-white font-bold shadow-xs cursor-pointer"
                >
                  Save Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
