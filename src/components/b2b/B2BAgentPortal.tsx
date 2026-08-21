import React, { useState } from 'react';
import {
  Handshake,
  Wallet,
  Building,
  DollarSign,
  Plus,
  Percent,
  FileText,
  Send,
  Users,
  ShieldCheck,
  CheckCircle2,
  Printer,
  X,
  Sparkles,
} from 'lucide-react';
import { useErp } from '../../context/ErpContext';
import { useLanguage } from '../../context/LanguageContext';
import type { SubAgent } from '../../types';
import { formatINR } from '../../utils/currency';

export const B2BAgentPortal: React.FC = () => {
  const { subAgents, updateSubAgentWallet, setUseMockData } = useErp();
  const { t, language } = useLanguage();

  const [selectedAgentId, setSelectedAgentId] = useState<string>(subAgents[0]?.id || '');
  const [topUpAmount, setTopUpAmount] = useState('100000');
  const [topUpModalOpen, setTopUpModalOpen] = useState(false);
  const [whiteLabelSlipOpen, setWhiteLabelSlipOpen] = useState(false);

  const selectedAgent = subAgents.find(a => a.id === selectedAgentId) || subAgents[0];

  const handleTopUp = (type: 'credit' | 'debit') => {
    if (!selectedAgent) return;
    const num = parseFloat(topUpAmount);
    if (!isNaN(num) && num > 0) {
      updateSubAgentWallet(selectedAgent.id, num, type);
      setTopUpModalOpen(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Handshake className="w-5 h-5 text-[#03578F]" />
            <span>{t('nav.b2b')}</span>
          </h2>
          <p className="text-xs text-slate-500">
            Partner travel agency sub-agents, live credit limits, 4% commission markups, and white-labeled booking slips
          </p>
        </div>

        {subAgents.length > 0 && (
          <button
            onClick={() => setWhiteLabelSlipOpen(true)}
            className="flex items-center gap-1.5 bg-[#03578F] hover:bg-[#02436e] text-white font-bold px-3.5 py-1.5 rounded-md text-xs transition shadow-2xs cursor-pointer"
          >
            <FileText className="w-4 h-4 text-amber-300" />
            <span>Preview White-Label Voucher</span>
          </button>
        )}
      </div>

      {/* Empty State when subAgents is empty */}
      {subAgents.length === 0 ? (
        <div className="classic-card rounded-md p-12 text-center space-y-3 bg-slate-50 border-dashed border-slate-300">
          <Handshake className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No B2B Partner Sub-Agents</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            You are in clean production mode. Turn on Demo Mock Data in the sidebar to view sample B2B agency partners and wallet ledgers.
          </p>
          <button
            onClick={() => setUseMockData(true)}
            className="px-4 py-2 bg-[#03578F] hover:bg-[#02436e] text-white rounded-md text-xs font-bold shadow-2xs cursor-pointer inline-flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Load Demo Partner Agents</span>
          </button>
        </div>
      ) : (
        <>
          {/* Agents Overview Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {subAgents.map((agent) => {
              const isSelected = selectedAgent && agent.id === selectedAgent.id;
              return (
                <div
                  key={agent.id}
                  onClick={() => setSelectedAgentId(agent.id)}
                  className={`p-3.5 rounded-md border transition cursor-pointer relative overflow-hidden ${
                    isSelected
                      ? 'bg-white border-[#03578F] shadow-xs ring-1 ring-[#03578F]'
                      : 'bg-white/80 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                    <span className="font-extrabold text-slate-900 text-xs truncate">{agent.agencyName}</span>
                    <span className="text-[9px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-1 py-0.2 rounded-xs font-bold uppercase">
                      {agent.status}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs">
                    <div className="text-[11px] text-slate-500">{agent.city} • {agent.contactPerson}</div>
                    <div className="pt-2 flex items-center justify-between">
                      <span className="text-[10px] text-slate-500">Wallet:</span>
                      <span className="font-mono font-bold text-emerald-700">{formatINR(agent.walletBalanceInr)}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Commission:</span>
                      <span className="font-bold text-[#03578F]">{agent.commissionPercentage}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Agent Workspace */}
          {selectedAgent && (
            <div className="classic-card rounded-md p-5 space-y-4 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">
                    {selectedAgent.agencyName} — Account Ledger
                  </h3>
                  <p className="text-xs text-slate-500">
                    Authorized Representative: {selectedAgent.contactPerson} • Tel: {selectedAgent.phone} • Email: {selectedAgent.email}
                  </p>
                </div>

                <button
                  onClick={() => setTopUpModalOpen(true)}
                  className="flex items-center gap-1.5 bg-[#03578F] hover:bg-[#02436e] text-white font-bold px-3.5 py-2 rounded-md text-xs transition shadow-2xs cursor-pointer"
                >
                  <Wallet className="w-4 h-4 text-amber-300" />
                  <span>Manage Agent Wallet</span>
                </button>
              </div>

              {/* Financial Meters */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-[#F6F9FC] border border-slate-200 p-4 rounded-md space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Available Wallet Balance</span>
                  <div className="text-2xl font-black text-emerald-800 font-mono">
                    {formatINR(selectedAgent.walletBalanceInr)}
                  </div>
                  <span className="text-[10px] text-emerald-700 font-semibold">Ready for instant ticket issuance</span>
                </div>

                <div className="bg-[#F6F9FC] border border-slate-200 p-4 rounded-md space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Approved Credit Line</span>
                  <div className="text-2xl font-black text-slate-900 font-mono">
                    {formatINR(selectedAgent.creditLimitInr)}
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium">30-day payment cycle</span>
                </div>

                <div className="bg-[#F6F9FC] border border-slate-200 p-4 rounded-md space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Commission Slab Rate</span>
                  <div className="text-2xl font-black text-[#03578F] font-mono">
                    {selectedAgent.commissionPercentage}%
                  </div>
                  <span className="text-[10px] text-[#03578F] font-semibold">Direct auto-credit on booking</span>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Wallet Top-Up / Adjustment Modal */}
      {topUpModalOpen && selectedAgent && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-md max-w-sm w-full p-6 shadow-2xl text-slate-900 space-y-4 animate-in fade-in zoom-in-95 duration-100">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h3 className="font-bold text-base text-[#03578F] flex items-center gap-2">
                <Wallet className="w-4 h-4 text-emerald-600" />
                <span>Adjust Sub-Agent Wallet</span>
              </h3>
              <button onClick={() => setTopUpModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-[#F6F9FC] p-3 rounded-md border border-slate-200 text-xs">
              <span className="text-slate-500 block text-[10px]">SUB-AGENT:</span>
              <strong className="text-slate-900 text-sm">{selectedAgent.agencyName}</strong>
              <div className="text-slate-600 font-mono">Current Balance: {formatINR(selectedAgent.walletBalanceInr)}</div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Adjustment Amount (₹ INR)</label>
                <input
                  type="number"
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-1.5 text-slate-900 font-mono font-bold text-sm focus:outline-none focus:border-[#03578F]"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => handleTopUp('debit')}
                  className="px-3.5 py-1.5 rounded-md bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold cursor-pointer"
                >
                  Debit (-)
                </button>
                <button
                  type="button"
                  onClick={() => handleTopUp('credit')}
                  className="px-4 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs cursor-pointer"
                >
                  Credit Top-Up (+)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* White Label Booking Voucher Modal */}
      {whiteLabelSlipOpen && selectedAgent && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-md max-w-xl w-full p-6 shadow-2xl text-slate-900 space-y-4 animate-in fade-in zoom-in-95 duration-100">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h3 className="font-bold text-base text-[#03578F] flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#B48C36]" />
                <span>White-Label B2B Pilgrim Voucher</span>
              </h3>
              <button onClick={() => setWhiteLabelSlipOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* White Label Voucher Preview */}
            <div className="bg-[#F6F9FC] border-2 border-dashed border-slate-300 p-5 rounded-md space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <h4 className="font-black text-sm text-[#03578F] uppercase tracking-wider">
                    {selectedAgent.agencyName}
                  </h4>
                  <p className="text-[10px] text-slate-500 font-mono">
                    Authorized Travel Partner • {selectedAgent.city} • Tel: {selectedAgent.phone}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] bg-slate-200 text-slate-800 px-2 py-0.5 rounded-xs font-bold">
                    PILGRIM VOUCHER
                  </span>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">Ref: VCH-B2B-8912</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px]">PILGRIM NAME:</span>
                  <strong className="text-slate-900">Farooq Khan & Family (4 Pax)</strong>
                  <div className="text-slate-500 text-[11px]">Passport: Z8942109</div>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 block text-[10px]">PACKAGE:</span>
                  <strong className="text-[#03578F]">Umrah Autumn Deluxe 15 Days</strong>
                  <div className="text-slate-500 text-[11px]">Double Sharing (Room 1402)</div>
                </div>
              </div>

              <div className="bg-white p-3 rounded-md border border-slate-200 text-[11px] space-y-1">
                <div className="font-bold text-[#03578F]">CONFIRMED SERVICES & ACCOMMODATION:</div>
                <div className="text-slate-600">🕋 Makkah Hotel: Swissôtel Al Maqam (8 Nights)</div>
                <div className="text-slate-600">🕌 Madinah Hotel: Dar Al Taqwa (7 Nights)</div>
                <div className="text-slate-600">✈️ Flight Route: BOM ➔ JED / MED ➔ BOM (Saudia SV 741)</div>
                <div className="text-slate-600">📄 Saudi MoFA E-Visa with Full Medical Insurance Included</div>
              </div>

              <div className="flex justify-between items-center pt-2 text-[10px] text-slate-400">
                <span>Issued via B2B Travel Network Engine</span>
                <span className="font-mono text-emerald-800 font-bold">Status: CONFIRMED & ISSUED</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setWhiteLabelSlipOpen(false)}
                className="px-3.5 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print White-Label Voucher</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
