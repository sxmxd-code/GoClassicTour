import React, { useState } from 'react';
import {
  ScanLine,
  Search,
  Filter,
  Send,
  Trash2,
  Layers,
  Plus,
  X,
  Users,
  Sparkles,
} from 'lucide-react';
import { useErp } from '../../context/ErpContext';
import { useLanguage } from '../../context/LanguageContext';
import type { RelationshipType } from '../../types';
import { PassportMrzScanner } from './PassportMrzScanner';
import { getWhatsAppClickUrl } from '../../utils/whatsapp';

export const PilgrimVault: React.FC = () => {
  const { pilgrims, roomAllocations, deletePilgrim, addPilgrim, packages, selectedBatchId, setUseMockData } = useErp();
  const { t } = useLanguage();

  const [showScanner, setShowScanner] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [visaFilter, setVisaFilter] = useState<string>('all');
  const [viewHierarchy, setViewHierarchy] = useState(true);

  // Manual Add Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [passportNumber, setPassportNumber] = useState('');
  const [passportExpiry, setPassportExpiry] = useState('2032-08-15');
  const [dob, setDob] = useState('1980-05-15');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [contactNumber, setContactNumber] = useState('+91 98200 00000');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [isMahramHead, setIsMahramHead] = useState(true);
  const [mahramId, setMahramId] = useState('');
  const [relationship, setRelationship] = useState<RelationshipType>('self');

  const [batchFilter, setBatchFilter] = useState<string>('all');

  const selectedPackage = packages.find(p => p.id === selectedBatchId) || packages[0];
  const scopedPilgrims = batchFilter === 'all' ? pilgrims : pilgrims.filter(p => p.packageBatchId === batchFilter);

  const filteredPilgrims = scopedPilgrims.filter(p => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      p.firstName.toLowerCase().includes(term) ||
      p.lastName.toLowerCase().includes(term) ||
      p.passportNumber.toLowerCase().includes(term) ||
      p.contactNumber.includes(term);
    const matchesVisa = visaFilter === 'all' || p.visaStatus === visaFilter;
    return matchesSearch && matchesVisa;
  });

  const mahramHeads = filteredPilgrims.filter(p => p.isMahramHead);
  const dependentPilgrims = filteredPilgrims.filter(p => !p.isMahramHead);

  const handleManualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !passportNumber) return;

    addPilgrim({
      bookingId: 'bk-2026-001',
      packageBatchId: selectedPackage ? selectedPackage.id : 'pkg-umrah-sep-2026',
      firstName,
      lastName,
      passportNumber: passportNumber.toUpperCase(),
      passportExpiry,
      nationality: 'Indian',
      gender,
      dob,
      age: 2026 - parseInt(dob.split('-')[0]),
      contactNumber,
      bloodGroup,
      isMahramHead,
      mahramId: isMahramHead ? undefined : mahramId || undefined,
      relationship: isMahramHead ? 'self' : relationship,
      visaStatus: 'passport_submitted',
      emergencyBadgeGenerated: false,
    });

    setFirstName('');
    setLastName('');
    setPassportNumber('');
    setShowManualModal(false);
  };

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ScanLine className="w-5 h-5 text-[#03578F]" />
            <span>Pilgrim Vault & Document Scanner</span>
          </h2>
          <p className="text-xs text-slate-500">
            Biometric MRZ Vault, Mahram family tree hierarchies, and document compliance for Saudi Visa issuance
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* View Mode Toggle */}
          <div className="bg-slate-200/80 p-0.5 rounded-md flex items-center border border-slate-300/80">
            <button
              onClick={() => setViewHierarchy(true)}
              className={`px-3 py-1.5 text-xs font-bold rounded-sm transition cursor-pointer ${
                viewHierarchy ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Mahram Family Tree
            </button>
            <button
              onClick={() => setViewHierarchy(false)}
              className={`px-3 py-1.5 text-xs font-bold rounded-sm transition cursor-pointer ${
                !viewHierarchy ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Flat Table ({filteredPilgrims.length})
            </button>
          </div>

          <button
            onClick={() => setShowManualModal(true)}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 font-bold px-3 py-1.5 rounded-md text-xs transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Manual Entry</span>
          </button>

          <button
            onClick={() => setShowScanner(!showScanner)}
            className="flex items-center gap-1.5 bg-[#03578F] hover:bg-[#02436e] text-white font-bold px-3.5 py-1.5 rounded-md text-xs transition shadow-2xs cursor-pointer"
          >
            <ScanLine className="w-4 h-4 text-amber-300" />
            <span>{showScanner ? 'Hide OCR Scanner' : 'AI Passport OCR Scanner'}</span>
          </button>
        </div>
      </div>

      {/* Embedded Scanner when opened */}
      {showScanner && (
        <PassportMrzScanner onSuccess={() => setShowScanner(false)} />
      )}

      {/* Search & Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-md p-3 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-3 flex-1 min-w-[240px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 rtl:left-auto rtl:right-3" />
            <input
              type="text"
              placeholder="Search by pilgrim name, passport number, or mobile..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-md pl-9 pr-3 py-1.5 rtl:pl-3 rtl:pr-9 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#03578F] focus:bg-white"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#03578F]" />
          <select
            value={batchFilter}
            onChange={(e) => setBatchFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5 text-xs text-slate-900 font-bold focus:outline-none"
          >
            <option value="all">🌐 All Departure Batches ({pilgrims.length} Total)</option>
            {packages.map((pkg) => (
              <option key={pkg.id} value={pkg.id}>
                {pkg.code} ({pilgrims.filter(p => p.packageBatchId === pkg.id).length} Pax)
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <select
            value={visaFilter}
            onChange={(e) => setVisaFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none font-medium"
          >
            <option value="all">All Visa Milestones</option>
            <option value="passport_submitted">Passport Submitted</option>
            <option value="mofa_generated">MoFA Generated</option>
            <option value="insurance_attached">Insurance Attached</option>
            <option value="visa_issued">Visa Issued</option>
            <option value="nusuk_rawdah_booked">Rawdah Booked</option>
          </select>
        </div>
      </div>

      {/* Empty State when no pilgrims exist */}
      {filteredPilgrims.length === 0 && (
        <div className="classic-card rounded-md p-12 text-center space-y-3 bg-slate-50 border-dashed border-slate-300">
          <Users className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No Pilgrims in Vault</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            You are in clean production mode or no pilgrims match your search filter. You can scan a passport with AI OCR, enter manually, or load sample demo data.
          </p>
          <div className="flex items-center justify-center gap-2 pt-2">
            <button
              onClick={() => setShowScanner(true)}
              className="px-3.5 py-2 bg-[#03578F] hover:bg-[#02436e] text-white rounded-md text-xs font-bold shadow-2xs cursor-pointer inline-flex items-center gap-1.5"
            >
              <ScanLine className="w-4 h-4 text-amber-300" />
              <span>AI Passport OCR Scanner</span>
            </button>
            <button
              onClick={() => setUseMockData(true)}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-bold cursor-pointer inline-flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Load Sample Demo Data</span>
            </button>
          </div>
        </div>
      )}

      {/* Mahram Hierarchy Tree View */}
      {viewHierarchy && filteredPilgrims.length > 0 && (
        <div className="space-y-4">
          {mahramHeads.map((head) => {
            const familyMembers = dependentPilgrims.filter(p => p.mahramId === head.id);
            const makkahRoom = roomAllocations.find(r => r.id === head.makkahRoomId);
            const madinahRoom = roomAllocations.find(r => r.id === head.madinahRoomId);

            return (
              <div
                key={head.id}
                className="bg-white border border-slate-200 rounded-md p-4 sm:p-5 space-y-4 shadow-2xs"
              >
                {/* Mahram Head Bar */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-150">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-md bg-amber-50 border border-amber-300 flex items-center justify-center text-amber-900 font-black text-lg">
                      {head.firstName[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-extrabold text-slate-950 text-sm sm:text-base">
                          {head.firstName} {head.lastName}
                        </h3>
                        <span className="px-2 py-0.5 rounded-xs bg-amber-100 text-amber-900 text-[10px] font-bold border border-amber-300">
                          👑 Mahram Head ({familyMembers.length + 1} Pax Family)
                        </span>
                        <span className={`px-2 py-0.5 rounded-xs text-[10px] font-bold ${
                          head.visaStatus === 'visa_issued' || head.visaStatus === 'nusuk_rawdah_booked'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-sky-50 text-sky-800 border border-sky-200'
                        }`}>
                          {head.visaStatus.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Passport: <strong className="font-mono text-slate-900 font-bold">{head.passportNumber}</strong> • Phone: {head.contactNumber} • Blood: {head.bloodGroup} • Age: {head.age} yrs
                      </p>
                    </div>
                  </div>

                  {/* Room Allocations & Actions */}
                  <div className="flex items-center gap-2 flex-wrap text-xs">
                    <div className="bg-slate-50 px-2.5 py-1 rounded-sm border border-slate-200 text-[11px] text-slate-700">
                      <span>Makkah: </span>
                      <strong className="text-emerald-800">{makkahRoom ? `Room ${makkahRoom.roomNumber}` : 'Unassigned'}</strong>
                    </div>
                    <div className="bg-slate-50 px-2.5 py-1 rounded-sm border border-slate-200 text-[11px] text-slate-700">
                      <span>Madinah: </span>
                      <strong className="text-emerald-800">{madinahRoom ? `Room ${madinahRoom.roomNumber}` : 'Unassigned'}</strong>
                    </div>
                    <a
                      href={getWhatsAppClickUrl(
                        head.contactNumber,
                        `Assalamu Alaikum ${head.firstName}, update from Classic Tour & Travels Mumbai regarding your Umrah booking.`
                      )}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-sm bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition"
                      title="Send WhatsApp"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                {/* Linked Family Members */}
                {familyMembers.length > 0 ? (
                  <div className="pl-4 sm:pl-6 rtl:pl-0 rtl:pr-4 sm:rtl:pr-6 border-l-2 rtl:border-l-0 rtl:border-r-2 border-amber-400 space-y-2">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Dependent Family Members ({familyMembers.length}):
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {familyMembers.map((member) => (
                        <div
                          key={member.id}
                          className="bg-slate-50 border border-slate-200 rounded-md p-3 space-y-2 text-xs"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-bold text-slate-900 text-xs">{member.firstName} {member.lastName}</h4>
                              <span className="text-[10px] text-slate-500 capitalize">
                                {member.relationship} • {member.gender} ({member.age} yrs)
                              </span>
                            </div>
                            <span className={`px-1.5 py-0.2 rounded-xs text-[9px] font-bold ${
                              member.gender === 'female' ? 'bg-rose-50 text-rose-800 border border-rose-200' : 'bg-sky-50 text-sky-800 border border-sky-200'
                            }`}>
                              {member.relationship?.toUpperCase() || 'FAMILY'}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1.5 border-t border-slate-200">
                            <span>Passport: <strong className="font-mono text-slate-800">{member.passportNumber}</strong></span>
                            <span className={`font-semibold ${
                              member.visaStatus === 'visa_issued' || member.visaStatus === 'nusuk_rawdah_booked'
                                ? 'text-emerald-700'
                                : 'text-amber-700'
                            }`}>
                              {member.visaStatus === 'visa_issued' || member.visaStatus === 'nusuk_rawdah_booked' ? '✅ Visa Issued' : '⏳ Processing'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No dependent family members linked under this Mahram head.</p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Flat Table View */}
      {!viewHierarchy && filteredPilgrims.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-md overflow-hidden shadow-2xs">
          <table className="w-full text-left rtl:text-right text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
              <tr>
                <th className="py-2.5 px-3">Pilgrim Name</th>
                <th className="py-2.5 px-3">Passport #</th>
                <th className="py-2.5 px-3">Gender & Age</th>
                <th className="py-2.5 px-3">Role / Mahram</th>
                <th className="py-2.5 px-3">Visa Milestone</th>
                <th className="py-2.5 px-3">Makkah Room</th>
                <th className="py-2.5 px-3">Contact</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPilgrims.map((p) => {
                const makkahRoom = roomAllocations.find(r => r.id === p.makkahRoomId);
                return (
                  <tr key={p.id} className="hover:bg-slate-50 transition">
                    <td className="py-2.5 px-3 font-bold text-slate-950">
                      {p.firstName} {p.lastName}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-800">{p.passportNumber}</td>
                    <td className="py-2.5 px-3 capitalize text-slate-700">
                      {p.gender} • {p.age} yrs ({p.bloodGroup})
                    </td>
                    <td className="py-2.5 px-3">
                      {p.isMahramHead ? (
                        <span className="px-1.5 py-0.2 rounded-xs bg-amber-50 border border-amber-200 text-amber-800 font-bold text-[10px]">
                          Mahram Head
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.2 rounded-xs bg-slate-100 text-slate-700 text-[10px] capitalize">
                          {p.relationship || 'Member'}
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-1.5 py-0.2 rounded-xs text-[10px] font-bold ${
                        p.visaStatus === 'visa_issued' || p.visaStatus === 'nusuk_rawdah_booked'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}>
                        {p.visaStatus.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-700">
                      {makkahRoom ? (
                        <strong className="text-emerald-800">Room {makkahRoom.roomNumber}</strong>
                      ) : (
                        <span className="text-rose-600 font-medium">Unassigned</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 font-mono">{p.contactNumber}</td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => deletePilgrim(p.id)}
                        className="p-1 rounded-sm bg-rose-50 hover:bg-rose-100 text-rose-700 transition cursor-pointer"
                        title="Delete Pilgrim"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Manual Add Pilgrim Modal */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-md max-w-lg w-full p-6 shadow-xl text-slate-900 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h3 className="font-bold text-base text-[#03578F] flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-600" />
                <span>Add Pilgrim Manually</span>
              </h3>
              <button onClick={() => setShowManualModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleManualAdd} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">First / Given Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mohammed"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-1.5 text-slate-900 focus:outline-none focus:border-[#03578F]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Last / Surname *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Farooq"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-1.5 text-slate-900 focus:outline-none focus:border-[#03578F]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Passport Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="Z8942109"
                    value={passportNumber}
                    onChange={(e) => setPassportNumber(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-1.5 text-slate-900 font-mono font-bold uppercase focus:outline-none focus:border-[#03578F]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Passport Expiry</label>
                  <input
                    type="date"
                    value={passportExpiry}
                    onChange={(e) => setPassportExpiry(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-md px-3 py-1.5 text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-md px-2 py-1.5 text-slate-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-md px-2 py-1.5 text-slate-900 focus:outline-none"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Blood Group</label>
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-md px-2 py-1.5 text-slate-900 focus:outline-none"
                  >
                    <option value="A+">A+</option>
                    <option value="B+">B+</option>
                    <option value="O+">O+</option>
                    <option value="AB+">AB+</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="px-3.5 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-md bg-[#03578F] hover:bg-[#02436e] text-white font-bold shadow-xs cursor-pointer"
                >
                  Save Pilgrim
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
