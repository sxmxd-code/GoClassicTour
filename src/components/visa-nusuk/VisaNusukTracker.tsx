import React, { useState } from 'react';
import {
  FileCheck2,
  Search,
  Filter,
  X,
  Layers,
} from 'lucide-react';
import { useErp } from '../../context/ErpContext';
import type { Pilgrim, VisaMilestone } from '../../types';

export const VisaNusukTracker: React.FC = () => {
  const { pilgrims, updatePilgrim, packages } = useErp();

  const [searchTerm, setSearchTerm] = useState('');
  const [batchScope, setBatchScope] = useState<string>('all'); // 'all' or specific packageBatchId
  const [activeStepFilter, setActiveStepFilter] = useState<string>('all');
  const [selectedPilgrim, setSelectedPilgrim] = useState<Pilgrim | null>(null);
  const [rawdahSlotInput, setRawdahSlotInput] = useState('2026-09-18 02:30 AM (Tahajjud)');
  const [mofaNumberInput, setMofaNumberInput] = useState('');
  const [visaNumberInput, setVisaNumberInput] = useState('');
  
  // Scope pilgrims based on batchScope
  const scopedPilgrims = batchScope === 'all'
    ? pilgrims
    : pilgrims.filter(p => p.packageBatchId === batchScope);

  const milestones: { id: VisaMilestone; label: string; stepNumber: number; count: number }[] = [
    {
      id: 'passport_submitted',
      label: '1. Passport Submitted',
      stepNumber: 1,
      count: scopedPilgrims.filter(p => p.visaStatus === 'passport_submitted').length,
    },
    {
      id: 'mofa_generated',
      label: '2. MoFA Generated',
      stepNumber: 2,
      count: scopedPilgrims.filter(p => p.visaStatus === 'mofa_generated').length,
    },
    {
      id: 'insurance_attached',
      label: '3. Insurance Attached',
      stepNumber: 3,
      count: scopedPilgrims.filter(p => p.visaStatus === 'insurance_attached').length,
    },
    {
      id: 'visa_issued',
      label: '4. Saudi E-Visa Issued',
      stepNumber: 4,
      count: scopedPilgrims.filter(p => p.visaStatus === 'visa_issued').length,
    },
    {
      id: 'nusuk_rawdah_booked',
      label: '5. Nusuk Rawdah Booked',
      stepNumber: 5,
      count: scopedPilgrims.filter(p => p.visaStatus === 'nusuk_rawdah_booked').length,
    },
  ];

  const filteredPilgrims = scopedPilgrims.filter(p => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      p.firstName.toLowerCase().includes(term) ||
      p.lastName.toLowerCase().includes(term) ||
      p.passportNumber.toLowerCase().includes(term);
    const matchesStep = activeStepFilter === 'all' || p.visaStatus === activeStepFilter;
    return matchesSearch && matchesStep;
  });

  const handleUpdateStatus = (pilgrimId: string, nextStatus: VisaMilestone) => {
    const updates: Partial<Pilgrim> = { visaStatus: nextStatus };
    if (nextStatus === 'mofa_generated' && !mofaNumberInput) {
      updates.mofaNumber = `MOFA-${Math.floor(Math.random() * 900000 + 100000)}`;
    }
    if (nextStatus === 'visa_issued' && !visaNumberInput) {
      updates.visaNumber = `60${Math.floor(Math.random() * 90000000 + 10000000)}`;
    }
    updatePilgrim(pilgrimId, updates);
  };

  const handleSaveNusukSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPilgrim) return;

    updatePilgrim(selectedPilgrim.id, {
      nusukRawdahSlot: rawdahSlotInput,
      visaStatus: 'nusuk_rawdah_booked',
      mofaNumber: mofaNumberInput || selectedPilgrim.mofaNumber,
      visaNumber: visaNumberInput || selectedPilgrim.visaNumber,
    });

    setSelectedPilgrim(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-[#03578F]" />
            <span>Visa & Nusuk Compliance Desk</span>
          </h2>
          <p className="text-xs text-slate-500">
            Saudi Ministry of Foreign Affairs (MoFA) visa milestones and official Nusuk Rawdah permit appointments
          </p>
        </div>

        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-300 px-3 py-1.5 rounded-md text-xs text-emerald-900 font-bold shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>MoFA Portal Sync: <strong>CONNECTED</strong></span>
        </div>
      </div>

      {/* 5-Step Milestone Interactive Pipeline Progress Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
        {milestones.map((m) => {
          const isActive = activeStepFilter === m.id;
          return (
            <button
              key={m.id}
              onClick={() => setActiveStepFilter(isActive ? 'all' : m.id)}
              className={`p-3 rounded-md border text-left rtl:text-right transition cursor-pointer ${
                isActive
                  ? 'bg-[#03578F] text-white border-[#02436e] shadow-xs ring-2 ring-[#03578F]'
                  : 'classic-card hover:border-[#03578F]/40'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? 'text-amber-300' : 'text-slate-500'}`}>
                  Stage {m.stepNumber}
                </span>
                <span className={`text-xs font-black font-mono px-1.5 py-0.2 rounded-xs ${
                  isActive ? 'bg-[#02436e] text-amber-300 border border-[#03578F]' : 'bg-slate-100 text-slate-900'
                }`}>
                  {m.count} Pax
                </span>
              </div>
              <div className={`font-bold text-xs line-clamp-1 ${isActive ? 'text-white' : 'text-slate-900'}`}>
                {m.label.replace(/^\d+\.\s*/, '')}
              </div>
            </button>
          );
        })}
      </div>

      {/* Filter & Batch Scope Bar */}
      <div className="classic-card rounded-md p-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-[240px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 rtl:left-auto rtl:right-3" />
            <input
              type="text"
              placeholder="Search by pilgrim name or passport number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#F6F9FC] border border-slate-200 rounded-md pl-9 pr-3 py-1.5 rtl:pl-3 rtl:pr-9 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#03578F] focus:bg-white"
            />
          </div>
        </div>

        {/* Batch Scope Selector */}
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#03578F]" />
          <select
            value={batchScope}
            onChange={(e) => setBatchScope(e.target.value)}
            className="bg-[#F6F9FC] border border-slate-300 rounded-md px-2.5 py-1.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-[#03578F]"
          >
            <option value="all">🌐 All Departure Batches ({pilgrims.length} Pilgrims)</option>
            {packages.map((pkg) => (
              <option key={pkg.id} value={pkg.id}>
                {pkg.code} ({pilgrims.filter(p => p.packageBatchId === pkg.id).length} Pilgrims)
              </option>
            ))}
          </select>
        </div>

        {/* Visa Stage Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <select
            value={activeStepFilter}
            onChange={(e) => setActiveStepFilter(e.target.value)}
            className="bg-[#F6F9FC] border border-slate-300 rounded-md px-2.5 py-1.5 text-xs text-slate-900 font-medium focus:outline-none"
          >
            <option value="all">All Visa Stages</option>
            <option value="passport_submitted">1. Passport Submitted</option>
            <option value="mofa_generated">2. MoFA Generated</option>
            <option value="insurance_attached">3. Insurance Attached</option>
            <option value="visa_issued">4. Saudi E-Visa Issued</option>
            <option value="nusuk_rawdah_booked">5. Rawdah Booked</option>
          </select>
        </div>
      </div>

      {/* Main Visa Pilgrims Table */}
      <div className="classic-card rounded-md overflow-hidden">
        <table className="w-full text-left rtl:text-right text-xs">
          <thead className="bg-[#F6F9FC] border-b border-slate-200 text-slate-600 font-bold">
            <tr>
              <th className="py-2.5 px-3">Pilgrim Name</th>
              <th className="py-2.5 px-3">Passport Number</th>
              <th className="py-2.5 px-3">Package Batch</th>
              <th className="py-2.5 px-3">MoFA Application #</th>
              <th className="py-2.5 px-3">Saudi E-Visa #</th>
              <th className="py-2.5 px-3">Current Milestone</th>
              <th className="py-2.5 px-3">Nusuk Rawdah Slot</th>
              <th className="py-2.5 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredPilgrims.map((p) => {
              const pkg = packages.find(pkg => pkg.id === p.packageBatchId);
              return (
                <tr key={p.id} className="hover:bg-slate-50 transition">
                  <td className="py-2.5 px-3 font-bold text-slate-950">
                    {p.firstName} {p.lastName}
                    <div className="text-[10px] text-slate-500 font-normal">
                      {p.gender.toUpperCase()} • {p.age} yrs
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
                  <td className="py-2.5 px-3 font-mono text-slate-700">
                    {p.mofaNumber || (
                      <span className="text-slate-400 italic">Not Generated</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 font-mono">
                    {p.visaNumber ? (
                      <strong className="text-emerald-800">{p.visaNumber}</strong>
                    ) : (
                      <span className="text-slate-400 italic">Pending</span>
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
                      <span className="font-semibold text-slate-800 block text-[11px]">
                        {p.nusukRawdahSlot}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic text-[11px]">Pending Nusuk Slot</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {p.visaStatus === 'passport_submitted' && (
                        <button
                          onClick={() => handleUpdateStatus(p.id, 'mofa_generated')}
                          className="px-2 py-1 bg-sky-600 hover:bg-sky-700 text-white rounded-sm text-[10px] font-bold cursor-pointer"
                        >
                          Gen MoFA
                        </button>
                      )}
                      {p.visaStatus === 'mofa_generated' && (
                        <button
                          onClick={() => handleUpdateStatus(p.id, 'insurance_attached')}
                          className="px-2 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-sm text-[10px] font-bold cursor-pointer"
                        >
                          Attach Ins.
                        </button>
                      )}
                      {p.visaStatus === 'insurance_attached' && (
                        <button
                          onClick={() => handleUpdateStatus(p.id, 'visa_issued')}
                          className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-sm text-[10px] font-bold cursor-pointer"
                        >
                          Issue Visa
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setSelectedPilgrim(p);
                          setMofaNumberInput(p.mofaNumber || '');
                          setVisaNumberInput(p.visaNumber || '');
                          setRawdahSlotInput(p.nusukRawdahSlot || '2026-09-18 02:30 AM (Tahajjud)');
                        }}
                        className="px-2.5 py-1 bg-[#03578F] hover:bg-[#02436e] text-white rounded-sm text-[10px] font-bold cursor-pointer"
                      >
                        Nusuk Slot
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredPilgrims.length === 0 && (
          <div className="py-12 text-center text-slate-500 text-xs italic bg-slate-50 space-y-2">
            <FileCheck2 className="w-8 h-8 text-slate-300 mx-auto" />
            <p>No pilgrims found for Saudi Visa tracking under selected batch scope.</p>
          </div>
        )}
      </div>

      {/* Nusuk & MoFA Appointment Edit Modal */}
      {selectedPilgrim && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-md max-w-md w-full p-6 shadow-2xl text-slate-900 space-y-4 animate-in fade-in zoom-in-95 duration-100">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h3 className="font-bold text-base text-[#03578F] flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-emerald-600" />
                <span>Nusuk Rawdah Slot & Visa Update</span>
              </h3>
              <button onClick={() => setSelectedPilgrim(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-[#F6F9FC] p-3 rounded-md border border-slate-200 text-xs">
              <span className="text-slate-500 block text-[10px]">PILGRIM:</span>
              <strong className="text-slate-900 text-sm">{selectedPilgrim.firstName} {selectedPilgrim.lastName}</strong>
              <div className="text-slate-600 font-mono">Passport: {selectedPilgrim.passportNumber} • {selectedPilgrim.gender.toUpperCase()}</div>
            </div>

            <form onSubmit={handleSaveNusukSlot} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">MoFA Application Reference #</label>
                <input
                  type="text"
                  placeholder="e.g. MOFA-984120"
                  value={mofaNumberInput}
                  onChange={(e) => setMofaNumberInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-1.5 text-slate-900 font-mono focus:outline-none focus:border-[#03578F]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Saudi E-Visa Number</label>
                <input
                  type="text"
                  placeholder="e.g. 6029184710"
                  value={visaNumberInput}
                  onChange={(e) => setVisaNumberInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-1.5 text-slate-900 font-mono font-bold focus:outline-none focus:border-[#03578F]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nusuk Rawdah Appointment Slot</label>
                <input
                  type="text"
                  placeholder="e.g. 2026-09-18 02:30 AM (Post-Tahajjud)"
                  value={rawdahSlotInput}
                  onChange={(e) => setRawdahSlotInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-1.5 text-slate-900 font-bold focus:outline-none focus:border-[#03578F]"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedPilgrim(null)}
                  className="px-3.5 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs cursor-pointer"
                >
                  Save & Confirm Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
