import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Filter,
  Flame,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  Send,
  CheckCircle,
  Clock,
  ArrowRight,
  MoreVertical,
  Layers,
  Sparkles,
  Building,
  X,
  UserCheck,
} from 'lucide-react';
import { useErp } from '../../context/ErpContext';
import { useLanguage } from '../../context/LanguageContext';
import type { Lead, LeadStatus } from '../../types';
import { formatINR } from '../../utils/currency';
import { getWhatsAppClickUrl } from '../../utils/whatsapp';

export const LeadPipeline: React.FC = () => {
  const { leads, addLead, updateLeadStatus, updateLead, deleteLead, addBooking, packages } = useErp();
  const { t, language } = useLanguage();

  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [searchTerm, setSearchTerm] = useState('');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [convertingLead, setConvertingLead] = useState<Lead | null>(null);

  // New Lead Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('Mumbai');
  const [source, setSource] = useState<Lead['source']>('website_form');
  const [interestType, setInterestType] = useState<Lead['interestType']>('Umrah Group');
  const [paxCount, setPaxCount] = useState(2);
  const [budgetInr, setBudgetInr] = useState(300000);
  const [assignedTo, setAssignedTo] = useState('Salim Merchant (Senior Sales)');
  const [notes, setNotes] = useState('');

  const stages: { id: LeadStatus; label: string; headerBg: string; color: string }[] = [
    { id: 'new_inquiry', label: t('status.new_inquiry'), headerBg: 'border-sky-300 bg-sky-50 text-sky-950', color: 'sky' },
    { id: 'quotation_sent', label: t('status.quotation_sent'), headerBg: 'border-indigo-300 bg-indigo-50 text-indigo-950', color: 'indigo' },
    { id: 'doc_followup', label: t('status.doc_followup'), headerBg: 'border-amber-300 bg-amber-50 text-amber-950', color: 'amber' },
    { id: 'deposit_paid', label: t('status.deposit_paid'), headerBg: 'border-purple-300 bg-purple-50 text-purple-950', color: 'purple' },
    { id: 'confirmed', label: t('status.confirmed'), headerBg: 'border-emerald-300 bg-emerald-50 text-emerald-950', color: 'emerald' },
    { id: 'lost', label: t('status.lost'), headerBg: 'border-rose-300 bg-rose-50 text-rose-950', color: 'rose' },
  ];

  const filteredLeads = leads.filter(l => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      l.name.toLowerCase().includes(term) ||
      l.phone.includes(term) ||
      l.city.toLowerCase().includes(term);
    const matchesSource = sourceFilter === 'all' || l.source === sourceFilter;
    return matchesSearch && matchesSource;
  });

  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    addLead({
      name,
      phone,
      email,
      city,
      source,
      interestType,
      paxCount,
      budgetInr,
      assignedTo,
      status: 'new_inquiry',
      leadScore: Math.floor(Math.random() * 25) + 75, // 75 - 100
      lastContactedAt: new Date().toISOString().split('T')[0],
      followUpDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes,
    });

    setName('');
    setPhone('');
    setEmail('');
    setNotes('');
    setShowAddModal(false);
  };

  const handleExecuteConversion = () => {
    if (!convertingLead) return;
    const pkg = packages[0];
    const newBooking = addBooking({
      bookingNumber: `CTT-2026-${Math.floor(Math.random() * 900 + 100)}`,
      leadId: convertingLead.id,
      primaryContactName: convertingLead.name,
      primaryContactPhone: convertingLead.phone,
      primaryContactEmail: convertingLead.email || '',
      city: convertingLead.city,
      packageBatchId: pkg.id,
      pilgrimCount: convertingLead.paxCount,
      pilgrimIds: [],
      totalAmountInr: (convertingLead.budgetInr || 300000),
      paidAmountInr: 50000,
      balanceAmountInr: (convertingLead.budgetInr || 300000) - 50000,
      status: 'confirmed',
      departureDate: pkg.departureDate,
      returnDate: pkg.returnDate,
      specialRequests: convertingLead.notes,
    });

    updateLeadStatus(convertingLead.id, 'confirmed');
    setConvertingLead(null);
  };

  return (
    <div className="space-y-5">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-600" />
            <span>{t('nav.crm')}</span>
          </h2>
          <p className="text-xs text-slate-500">
            Omnichannel lead pipeline from goclassictour.com, WhatsApp Business, Meta Lead Ads, and B2B Agent referrals
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* View Toggle */}
          <div className="bg-slate-200/80 p-0.5 rounded-md flex items-center border border-slate-300/80">
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1.5 text-xs font-bold rounded-sm transition cursor-pointer ${
                viewMode === 'kanban' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Kanban Board
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 text-xs font-bold rounded-sm transition cursor-pointer ${
                viewMode === 'table' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Table View ({filteredLeads.length})
            </button>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3.5 py-1.5 rounded-md text-xs transition shadow-2xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Capture New Lead</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-md p-3 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-3 flex-1 min-w-[240px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 rtl:left-auto rtl:right-3" />
            <input
              type="text"
              placeholder={t('action.search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-md pl-9 pr-3 py-1.5 rtl:pl-3 rtl:pr-9 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#03578F] focus:bg-white"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none font-medium"
          >
            <option value="all">All Lead Sources</option>
            <option value="website_form">Website (goclassictour.com)</option>
            <option value="whatsapp">WhatsApp Business</option>
            <option value="facebook_ad">Meta / Facebook Ads</option>
            <option value="walk_in">Mumbai Walk-in</option>
            <option value="b2b_referral">B2B Agent Referral</option>
          </select>
        </div>
      </div>

      {leads.length === 0 && (
        <div className="classic-card rounded-md p-8 text-center bg-slate-50 border-dashed border-slate-300 space-y-2">
          <Users className="w-8 h-8 text-slate-300 mx-auto" />
          <h4 className="font-bold text-xs text-slate-700">No CRM Leads Active</h4>
          <p className="text-[11px] text-slate-500">Capture your first client inquiry or toggle Demo Mock Data in the sidebar.</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3 py-1.5 bg-[#03578F] text-white rounded-md text-xs font-bold shadow-2xs cursor-pointer"
          >
            + Capture New Lead
          </button>
        </div>
      )}

      {/* Kanban Board View */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5 items-start">
          {stages.map((stage) => {
            const stageLeads = filteredLeads.filter(l => l.status === stage.id);
            return (
              <div
                key={stage.id}
                className="bg-slate-100/70 border border-slate-200 rounded-md p-2.5 flex flex-col h-[520px]"
              >
                {/* Stage Header */}
                <div className={`flex items-center justify-between p-2 mb-2 rounded-sm border shrink-0 ${stage.headerBg}`}>
                  <h3 className="font-extrabold text-xs tracking-tight">{stage.label}</h3>
                  <span className="text-[10px] font-black px-1.5 py-0.2 rounded-xs bg-white text-slate-900 border border-slate-300">
                    {stageLeads.length}
                  </span>
                </div>

                {/* Scrollable Column Body */}
                <div className="space-y-2 flex-1 overflow-y-auto pr-0.5 scrollbar-thin">
                  {stageLeads.map((lead) => {
                    const isHot = lead.leadScore >= 85;
                    return (
                      <div
                        key={lead.id}
                        className="bg-white border border-slate-200 hover:border-slate-350 rounded-md p-3 space-y-2 shadow-2xs hover:shadow-xs transition"
                      >
                        <div className="flex items-start justify-between gap-1">
                          <div>
                            <h4 className="font-bold text-slate-950 text-xs hover:text-sky-800 transition">
                              {lead.name}
                            </h4>
                            <span className="text-[10px] text-slate-500">{lead.city} • {lead.paxCount} Pax</span>
                          </div>
                          {isHot && (
                            <span
                              title={`High conversion score: ${lead.leadScore}`}
                              className="flex items-center gap-0.5 px-1 py-0.2 rounded-xs bg-rose-50 border border-rose-200 text-rose-700 text-[10px] font-black shrink-0"
                            >
                              <Flame className="w-3 h-3 text-rose-600 fill-rose-600" />
                              {lead.leadScore}
                            </span>
                          )}
                        </div>

                        {/* Package tag & budget */}
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="px-1.5 py-0.5 rounded-xs bg-slate-100 text-slate-700 font-semibold truncate max-w-[110px]">
                            {lead.interestType}
                          </span>
                          {lead.budgetInr && (
                            <span className="font-bold text-emerald-800 font-mono">
                              {formatINR(lead.budgetInr)}
                            </span>
                          )}
                        </div>

                        {/* Notes snippet */}
                        <div className="text-[10px] text-slate-600 line-clamp-2 italic bg-slate-50 p-1.5 rounded-xs border border-slate-150">
                          "{lead.notes || 'No specific requests recorded'}"
                        </div>

                        {/* Action Strip */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1">
                          <a
                            href={getWhatsAppClickUrl(
                              lead.phone,
                              `Assalamu Alaikum ${lead.name}, thank you for contacting Classic Tour & Travels Mumbai regarding ${lead.interestType}. How may we assist your family today?`
                            )}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-sm bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition"
                            title="Direct WhatsApp"
                          >
                            <Send className="w-3 h-3" />
                          </a>

                          {/* Stage Dropdown */}
                          <select
                            value={lead.status}
                            onChange={(e) => updateLeadStatus(lead.id, e.target.value as LeadStatus)}
                            className="bg-white border border-slate-200 rounded-sm px-1 py-0.5 text-[9px] text-slate-800 font-medium focus:outline-none max-w-[90px] truncate"
                          >
                            {stages.map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.label}
                              </option>
                            ))}
                          </select>

                          {stage.id !== 'confirmed' && (
                            <button
                              onClick={() => setConvertingLead(lead)}
                              title="Convert to Confirmed Booking"
                              className="p-1.5 rounded-sm bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 transition cursor-pointer"
                            >
                              <CheckCircle className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {stageLeads.length === 0 && (
                    <div className="text-center py-8 text-slate-400 text-xs italic">
                      No leads in this stage
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white border border-slate-200 rounded-md overflow-hidden shadow-2xs">
          <table className="w-full text-left rtl:text-right text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
              <tr>
                <th className="py-2.5 px-3">Lead Name</th>
                <th className="py-2.5 px-3">Contact & City</th>
                <th className="py-2.5 px-3">Interest & Pax</th>
                <th className="py-2.5 px-3">Source</th>
                <th className="py-2.5 px-3">Score</th>
                <th className="py-2.5 px-3">Stage Status</th>
                <th className="py-2.5 px-3">Assigned Rep</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLeads.map((l) => (
                <tr key={l.id} className="hover:bg-slate-50 transition">
                  <td className="py-2.5 px-3 font-bold text-slate-950">{l.name}</td>
                  <td className="py-2.5 px-3 text-slate-700">
                    <div className="font-mono text-slate-900 font-semibold">{l.phone}</div>
                    <div className="text-[10px] text-slate-400">{l.city}</div>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="font-bold text-slate-900">{l.interestType}</span>
                    <div className="text-[10px] text-slate-500">{l.paxCount} Pax • {formatINR(l.budgetInr || 0)}</div>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="px-1.5 py-0.5 rounded-xs bg-slate-100 text-[10px] font-semibold text-slate-700">
                      {l.source}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="px-1.5 py-0.2 rounded-xs bg-rose-50 border border-rose-200 text-rose-800 font-bold">
                      {l.leadScore}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <select
                      value={l.status}
                      onChange={(e) => updateLeadStatus(l.id, e.target.value as LeadStatus)}
                      className="bg-white border border-slate-200 rounded-sm px-1.5 py-0.5 text-xs text-slate-900"
                    >
                      {stages.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-2.5 px-3 text-slate-700">{l.assignedTo}</td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={() => setConvertingLead(l)}
                      className="px-2.5 py-1 rounded-sm bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] transition cursor-pointer"
                    >
                      Convert
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Convert to Booking Modal */}
      {convertingLead && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-md max-w-md w-full p-6 text-slate-900 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                <span>Convert Lead to Confirmed Booking</span>
              </h3>
              <button onClick={() => setConvertingLead(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Confirm conversion of <strong>{convertingLead.name}</strong> ({convertingLead.paxCount} Pax) for package <strong>{convertingLead.interestType}</strong>. This will automatically allocate a Booking Number and open a pilgrim folder in the vault.
            </p>

            <div className="bg-slate-50 p-3 rounded-md border border-slate-200 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Contact:</span>
                <span className="font-bold text-slate-900">{convertingLead.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Booking Value:</span>
                <span className="font-bold text-emerald-700 font-mono">{formatINR(convertingLead.budgetInr || 300000)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Token Advance Received:</span>
                <span className="font-bold text-slate-900 font-mono">₹50,000</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConvertingLead(null)}
                className="px-3.5 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs"
              >
                {t('action.cancel')}
              </button>
              <button
                type="button"
                onClick={handleExecuteConversion}
                className="px-4 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs"
              >
                Confirm & Generate Booking
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Lead Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-md max-w-lg w-full p-6 shadow-xl text-slate-900 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-amber-600" />
                <span>Capture New Lead</span>
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateLead} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Haji Bashir Patel"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-1.5 text-slate-900 focus:bg-white focus:border-sky-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">WhatsApp Phone *</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 98200 00000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-1.5 text-slate-900 focus:bg-white focus:border-sky-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="client@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-1.5 text-slate-900 focus:bg-white focus:border-sky-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    placeholder="Mumbai / Pune / Nagpur"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-1.5 text-slate-900 focus:bg-white focus:border-sky-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Package Type</label>
                  <select
                    value={interestType}
                    onChange={(e) => setInterestType(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-md px-2 py-1.5 text-slate-900 focus:bg-white focus:outline-none"
                  >
                    <option value="Hajj 2026">Hajj 2026</option>
                    <option value="Umrah Group">Umrah Group</option>
                    <option value="VIP Custom FIT">VIP Custom FIT</option>
                    <option value="Ramadan Special">Ramadan Special</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Pax Count</label>
                  <input
                    type="number"
                    min="1"
                    value={paxCount}
                    onChange={(e) => setPaxCount(parseInt(e.target.value) || 1)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-1.5 text-slate-900 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Lead Source</label>
                  <select
                    value={source}
                    onChange={(e) => setSource(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-md px-2 py-1.5 text-slate-900 focus:bg-white focus:outline-none"
                  >
                    <option value="website_form">Website Form</option>
                    <option value="whatsapp">WhatsApp Business</option>
                    <option value="facebook_ad">Facebook Ads</option>
                    <option value="walk_in">Walk-in</option>
                    <option value="b2b_referral">B2B Referral</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Requirements & Notes</label>
                <textarea
                  rows={2}
                  placeholder="Special requests, sharing preferences, hotel proximity..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-1.5 text-slate-900 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                >
                  {t('action.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-md bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-2xs cursor-pointer"
                >
                  Save Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
