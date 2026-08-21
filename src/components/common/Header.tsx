import React, { useState } from 'react';
import {
  Globe,
  RotateCcw,
  Layers,
  Sparkles,
  CheckCircle2,
  Building2,
  Menu,
  X,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { useErp } from '../../context/ErpContext';
import { useLanguage } from '../../context/LanguageContext';

interface HeaderProps {
  onToggleMobileMenu?: () => void;
  mobileMenuOpen?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleMobileMenu,
  mobileMenuOpen,
}) => {
  const {
    selectedBatchId,
    setSelectedBatchId,
    packages,
    resetToSampleData,
  } = useErp();

  const { language, toggleLanguage, t } = useLanguage();
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const selectedPackage = packages.find(p => p.id === selectedBatchId) || packages[0];

  return (
    <header className="h-16 shrink-0 bg-white border-b border-slate-200 text-slate-900 px-4 sm:px-6 flex items-center justify-between gap-3 shadow-[0_2px_10px_rgba(3,87,143,0.04)] z-30 select-none">
      {/* Brand & Official Logo from goclassictour.com */}
      <div className="flex items-center gap-3">
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 rounded-md border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        )}

        <div className="flex items-center gap-3">
          {/* Official Logo Image */}
          <div className="h-9 flex items-center shrink-0">
            <img
              src="/assets/logos/classiclogo.png"
              alt="Classic Tour & Travels"
              className="h-9 w-auto object-contain"
            />
          </div>

          <div className="hidden lg:flex items-center gap-2 pl-3 rtl:pl-0 rtl:pr-3 border-l rtl:border-l-0 rtl:border-r border-slate-200">
            <span className="text-[10px] px-2 py-0.5 rounded-sm bg-[#03578F]/10 border border-[#03578F]/20 text-[#03578F] font-bold uppercase tracking-wider">
              Enterprise ERP
            </span>
            <span className="text-[11px] text-slate-500 font-medium hidden xl:inline">
              Serving Pilgrims Since 1990 • Mumbai HQ
            </span>
          </div>
        </div>
      </div>

      {/* Control Strip */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Active Departure Batch Selector */}
        <div className="hidden sm:flex items-center bg-[#F6F9FC] border border-slate-200 rounded-md px-2.5 py-1 text-xs">
          <Layers className="w-3.5 h-3.5 text-[#03578F] mr-2 rtl:ml-2 rtl:mr-0 shrink-0" />
          <div className="flex flex-col">
            <span className="text-[9px] uppercase text-slate-500 font-bold tracking-wider leading-tight">
              {language === 'ar' ? 'الفوج النشط' : 'Active Batch'}
            </span>
            <select
              value={selectedBatchId}
              onChange={(e) => setSelectedBatchId(e.target.value)}
              className="bg-transparent font-bold text-[#03578F] focus:outline-none cursor-pointer pr-2 max-w-[180px] truncate"
            >
              {packages.map((pkg) => (
                <option key={pkg.id} value={pkg.id} className="bg-white text-slate-900">
                  {pkg.code} — {pkg.departureCity}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Language Switcher (EN / AR RTL) */}
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 rounded-md px-2.5 py-1.5 text-xs font-bold transition cursor-pointer shadow-2xs"
        >
          <Globe className="w-3.5 h-3.5 text-[#B48C36]" />
          <span className="font-semibold">{language === 'en' ? 'العربية (RTL)' : 'English (LTR)'}</span>
        </button>

        {/* Reset Demo Data Button */}
        <button
          onClick={() => setShowResetConfirm(true)}
          title="Reset database to default seed state"
          className="flex items-center justify-center bg-white hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 border border-slate-200 text-slate-500 rounded-md p-2 text-xs transition cursor-pointer shadow-2xs"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Reset Confirm Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-md p-6 max-w-sm w-full shadow-xl text-slate-900">
            <h3 className="font-bold text-base text-rose-700 mb-1">
              Reset System Database?
            </h3>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              This will restore all pilgrims, room allocations, bus charts, flight manifests, leads, and accounting ledgers to the initial seed state.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-3.5 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                {t('action.cancel')}
              </button>
              <button
                onClick={() => {
                  resetToSampleData();
                  setShowResetConfirm(false);
                }}
                className="px-4 py-1.5 rounded-md bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
