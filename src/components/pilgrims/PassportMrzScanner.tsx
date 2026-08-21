import React, { useState } from 'react';
import {
  ScanLine,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  User,
  Check,
} from 'lucide-react';
import { parseMrz, SAMPLE_PASSPORTS_MRZ } from '../../utils/mrzParser';
import type { ParsedMrzResult } from '../../utils/mrzParser';
import { useErp } from '../../context/ErpContext';
import { useLanguage } from '../../context/LanguageContext';
import type { RelationshipType } from '../../types';

interface PassportMrzScannerProps {
  onSuccess?: () => void;
}

export const PassportMrzScanner: React.FC<PassportMrzScannerProps> = ({ onSuccess }) => {
  const { addPilgrim, selectedBatchId, pilgrims } = useErp();
  const { language } = useLanguage();

  const [mrzInput, setMrzInput] = useState(SAMPLE_PASSPORTS_MRZ[0].mrz);
  const [parsed, setParsed] = useState<ParsedMrzResult>(() => parseMrz(SAMPLE_PASSPORTS_MRZ[0].mrz));
  const [contactNumber, setContactNumber] = useState('+91 98201 54321');
  const [bloodGroup, setBloodGroup] = useState('B+');
  const [isMahramHead, setIsMahramHead] = useState(true);
  const [mahramId, setMahramId] = useState<string>('');
  const [relationship, setRelationship] = useState<RelationshipType>('self');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleMrzChange = (text: string) => {
    setMrzInput(text);
    const result = parseMrz(text);
    setParsed(result);
  };

  const handleSelectSample = (sampleMrz: string) => {
    handleMrzChange(sampleMrz);
  };

  const handleSavePilgrim = () => {
    if (!parsed.passportNumber || !parsed.fullName) {
      alert('Please provide a valid MRZ with passport number and name.');
      return;
    }

    const exists = pilgrims.some(p => p.passportNumber.toUpperCase() === parsed.passportNumber.toUpperCase());
    if (exists) {
      alert(`Pilgrim with Passport ${parsed.passportNumber} is already in the database!`);
      return;
    }

    addPilgrim({
      bookingId: 'bk-2026-001',
      packageBatchId: selectedBatchId,
      firstName: parsed.givenNames || parsed.fullName.split(' ')[0] || 'Pilgrim',
      lastName: parsed.surname || parsed.fullName.split(' ').slice(1).join(' ') || 'Haji',
      passportNumber: parsed.passportNumber,
      passportExpiry: parsed.expiryDate,
      nationality: parsed.nationality === 'IND' ? 'Indian' : parsed.nationality,
      gender: parsed.gender === 'female' ? 'female' : 'male',
      dob: parsed.dob,
      age: parsed.age,
      contactNumber,
      bloodGroup,
      isMahramHead,
      mahramId: isMahramHead ? undefined : mahramId || undefined,
      relationship: isMahramHead ? 'self' : relationship,
      visaStatus: 'passport_submitted',
      emergencyBadgeGenerated: false,
    });

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      if (onSuccess) onSuccess();
    }, 1200);
  };

  const potentialMahrams = pilgrims.filter(p => p.isMahramHead && p.gender === 'male');

  return (
    <div className="bg-white/90 backdrop-blur-md border border-slate-200 rounded-md p-5 shadow-2xs space-y-5">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-amber-50 text-amber-700 rounded-md border border-amber-200">
            <ScanLine className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
              <span>{language === 'ar' ? 'الماسح الضوئي الذكي لجوازات السفر (ICAO MRZ)' : 'Passport MRZ Optical Scanner'}</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded-xs bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
                ICAO Doc 9303 TD3
              </span>
            </h3>
            <p className="text-[11px] text-slate-500">
              Automatic extraction of Given Name, Surname, Passport #, Expiry, Nationality, DOB, Gender & 6-month validity check
            </p>
          </div>
        </div>

        {/* 1-Click Samples Picker */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] text-slate-500 font-bold">Samples:</span>
          {SAMPLE_PASSPORTS_MRZ.map((sample, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectSample(sample.mrz)}
              className="text-[11px] font-bold px-2 py-1 rounded-sm bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 transition cursor-pointer"
            >
              #{idx + 1} {sample.label.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Main Scanner Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Col: Raw MRZ Input & Mahram */}
        <div className="lg:col-span-5 space-y-3.5">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center justify-between">
              <span>Raw 2-Line Machine Readable Zone (MRZ)</span>
              <span className="font-mono text-[9px] text-slate-400">2 x 44 Characters</span>
            </label>
            <textarea
              rows={4}
              value={mrzInput}
              onChange={(e) => handleMrzChange(e.target.value)}
              className="w-full bg-slate-900 font-mono text-xs text-amber-300 border border-slate-800 rounded-md p-3 focus:outline-none focus:ring-1 focus:ring-amber-400 tracking-widest leading-relaxed shadow-inner"
              placeholder="P<INDKHAN<<MOHAMMED<FAROOQ<<<<<<<<<<<<<<<<<<&#10;Z8942109<4IND7005128M3208154<<<<<<<<<<<<<<04"
            />
          </div>

          {/* Additional Operational Fields */}
          <div className="bg-slate-50 border border-slate-200 rounded-md p-3.5 space-y-3 text-xs">
            <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-amber-600" />
              <span>Mahram & Contact Details</span>
            </h4>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">WhatsApp Phone *</label>
                <input
                  type="text"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-md px-2.5 py-1 text-slate-900 text-xs focus:outline-none focus:border-sky-600"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Blood Group</label>
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-md px-2.5 py-1 text-slate-900 text-xs focus:outline-none focus:border-sky-600"
                >
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>
            </div>

            {/* Mahram Head Toggle */}
            <div className="space-y-2 pt-2 border-t border-slate-200">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isMahramHead}
                  onChange={(e) => setIsMahramHead(e.target.checked)}
                  className="rounded-xs border-slate-300 text-amber-600 focus:ring-0 w-3.5 h-3.5"
                />
                <span>This Pilgrim is the <strong>Mahram Head of Family</strong></span>
              </label>

              {!isMahramHead && (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">Link to Mahram</label>
                    <select
                      value={mahramId}
                      onChange={(e) => setMahramId(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-md px-2 py-1 text-xs text-slate-900"
                    >
                      <option value="">Select Mahram...</option>
                      {potentialMahrams.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.firstName} {m.lastName} ({m.passportNumber})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-0.5">Relationship</label>
                    <select
                      value={relationship}
                      onChange={(e) => setRelationship(e.target.value as RelationshipType)}
                      className="w-full bg-white border border-slate-300 rounded-md px-2 py-1 text-xs text-slate-900"
                    >
                      <option value="spouse">Spouse (Wife)</option>
                      <option value="daughter">Daughter</option>
                      <option value="son">Son</option>
                      <option value="mother">Mother</option>
                      <option value="sister">Sister</option>
                      <option value="group_member">Group Member</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Col: Extracted Data Card */}
        <div className="lg:col-span-7 space-y-3.5">
          <div className="bg-slate-50 border border-slate-200 rounded-md p-4 space-y-3.5">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Extracted Passport Profile
              </span>
              {parsed.isValidForTravel ? (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-xs bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Valid for Saudi Entry (6+ Months)
                </span>
              ) : (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-xs bg-rose-50 text-rose-800 text-[10px] font-bold border border-rose-200">
                  <AlertTriangle className="w-3 h-3 text-rose-600" /> Expiry Warning (&lt;6 Months)
                </span>
              )}
            </div>

            {/* Grid of Extracted Fields */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="p-2.5 bg-white rounded-md border border-slate-200">
                <span className="text-[9px] uppercase text-slate-400 font-bold block">Full Name</span>
                <span className="font-bold text-slate-900 text-xs block truncate">{parsed.fullName || '—'}</span>
              </div>
              <div className="p-2.5 bg-white rounded-md border border-slate-200">
                <span className="text-[9px] uppercase text-slate-400 font-bold block">Passport #</span>
                <span className="font-mono font-bold text-slate-900 text-xs block">{parsed.passportNumber || '—'}</span>
              </div>
              <div className="p-2.5 bg-white rounded-md border border-slate-200">
                <span className="text-[9px] uppercase text-slate-400 font-bold block">Nationality</span>
                <span className="font-bold text-slate-800">{parsed.nationality === 'IND' ? 'Indian (IND)' : parsed.nationality}</span>
              </div>
              <div className="p-2.5 bg-white rounded-md border border-slate-200">
                <span className="text-[9px] uppercase text-slate-400 font-bold block">Date of Birth</span>
                <span className="font-bold text-slate-800">{parsed.dob} ({parsed.age} yrs)</span>
              </div>
              <div className="p-2.5 bg-white rounded-md border border-slate-200">
                <span className="text-[9px] uppercase text-slate-400 font-bold block">Gender</span>
                <span className={`font-bold capitalize ${parsed.gender === 'male' ? 'text-sky-800' : 'text-rose-800'}`}>
                  {parsed.gender}
                </span>
              </div>
              <div className="p-2.5 bg-white rounded-md border border-slate-200">
                <span className="text-[9px] uppercase text-slate-400 font-bold block">Passport Expiry</span>
                <span className={`font-bold ${parsed.isValidForTravel ? 'text-emerald-800' : 'text-rose-800'}`}>
                  {parsed.expiryDate}
                </span>
              </div>
            </div>

            {/* Checksum Warnings if any */}
            {parsed.errors.length > 0 && (
              <div className="p-2.5 rounded-md bg-rose-50 border border-rose-200 text-[11px] text-rose-800 space-y-1">
                {parsed.errors.map((err, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>{err}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Save Button */}
            <div className="pt-2 flex items-center justify-between gap-3">
              <div className="text-xs">
                {savedSuccess && (
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <Check className="w-4 h-4" /> Pilgrim Saved to Vault!
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={handleSavePilgrim}
                disabled={!parsed.valid && parsed.errors.some(e => e.includes('checksum'))}
                className="px-4 py-2 rounded-md bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <span>Save Scanned Pilgrim to Vault</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
