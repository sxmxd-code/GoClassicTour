import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Users,
  ScanLine,
  Package,
  Building2,
  FileCheck2,
  Handshake,
  Landmark,
  MessageSquare,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  UserCheck,
  Sparkles,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { useErp } from '../../context/ErpContext';
import { useLanguage } from '../../context/LanguageContext';
import type { UserRole } from '../../types';

export type TabType = 
  | 'dashboard'
  | 'crm'
  | 'pilgrims'
  | 'packages'
  | 'groundOps'
  | 'visaNusuk'
  | 'b2b'
  | 'finance'
  | 'whatsapp'
  | 'audit';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  mobileOpen,
  onCloseMobile,
  isCollapsed: externalIsCollapsed,
  onToggleCollapse: externalOnToggleCollapse,
}) => {
  const { language } = useLanguage();
  const { currentUserRole, setCurrentUserRole, useMockData, toggleMockData, pilgrims } = useErp();

  const [internalCollapsed, setInternalCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('ctt_erp_sidebar_collapsed') === 'true';
  });

  const isCollapsed = externalIsCollapsed !== undefined ? externalIsCollapsed : internalCollapsed;

  const handleToggleCollapse = () => {
    if (externalOnToggleCollapse) {
      externalOnToggleCollapse();
    } else {
      const next = !internalCollapsed;
      setInternalCollapsed(next);
      localStorage.setItem('ctt_erp_sidebar_collapsed', String(next));
    }
  };

  const roles: { role: UserRole; label: string; name: string; avatar: string }[] = [
    { role: 'super_admin', label: 'Super Admin (MD)', name: 'Farooq Merchant (MD)', avatar: 'MD' },
    { role: 'ops_manager', label: 'Operations Manager', name: 'Tariq Siddiqui (Ops Head)', avatar: 'TS' },
    { role: 'sales_exec', label: 'Sales Executive', name: 'Salim Merchant (Senior Sales)', avatar: 'SM' },
    { role: 'saudi_ameer', label: 'Saudi Ground Ameer', name: 'Maulana Imran (KSA)', avatar: 'MI' },
    { role: 'visa_officer', label: 'Visa Desk Officer', name: 'Rashid Khan (Visa Desk)', avatar: 'RK' },
    { role: 'accountant', label: 'Chief Accountant', name: 'Farhan Sayed (Finance)', avatar: 'FS' },
    { role: 'b2b_agent', label: 'B2B Sub-Agent Partner', name: 'Al-Barkat Tours (Partner)', avatar: 'AB' },
  ];

  const currentRoleObj = roles.find(r => r.role === currentUserRole) || roles[0];

  const sections: {
    titleEn: string;
    titleAr: string;
    items: {
      id: TabType;
      labelEn: string;
      labelAr: string;
      icon: React.ReactNode;
    }[];
  }[] = [
    {
      titleEn: 'OPERATIONS & LOGISTICS',
      titleAr: 'العمليات والخدمات الميدانية',
      items: [
        {
          id: 'dashboard',
          labelEn: 'Command Dashboard',
          labelAr: 'لوحة التحكم الرئيسية',
          icon: <LayoutDashboard className="w-4 h-4" />,
        },
        {
          id: 'crm',
          labelEn: 'Leads & Inquiry CRM',
          labelAr: 'إدارة العملاء والمبيعات',
          icon: <Users className="w-4 h-4" />,
        },
        {
          id: 'pilgrims',
          labelEn: 'Pilgrim Vault & OCR',
          labelAr: 'بيانات الحجاج والمسح الضوئي',
          icon: <ScanLine className="w-4 h-4" />,
        },
        {
          id: 'packages',
          labelEn: 'Hajj & Umrah Packages',
          labelAr: 'باقات الحج والعمرة',
          icon: <Package className="w-4 h-4" />,
        },
        {
          id: 'groundOps',
          labelEn: 'Ground Operations Hub',
          labelAr: 'العمليات الميدانية والفنادق',
          icon: <Building2 className="w-4 h-4" />,
        },
        {
          id: 'visaNusuk',
          labelEn: 'Saudi Visa & Nusuk Desk',
          labelAr: 'التأشيرات ونسك الروضة',
          icon: <FileCheck2 className="w-4 h-4" />,
        },
      ],
    },
    {
      titleEn: 'FINANCE & PARTNERS',
      titleAr: 'المالية ووكلاء B2B',
      items: [
        {
          id: 'b2b',
          labelEn: 'B2B Sub-Agent Network',
          labelAr: 'شبكة الوكلاء الفرعيين',
          icon: <Handshake className="w-4 h-4" />,
        },
        {
          id: 'finance',
          labelEn: 'Multi-Currency Ledger & P&L',
          labelAr: 'المحاسبة والأرباح (SAR/INR)',
          icon: <Landmark className="w-4 h-4" />,
        },
      ],
    },
    {
      titleEn: 'COMMUNICATIONS & COMPLIANCE',
      titleAr: 'الاتصالات والامتثال',
      items: [
        {
          id: 'whatsapp',
          labelEn: 'WhatsApp Business Hub',
          labelAr: 'مركز رسائل الواتساب',
          icon: <MessageSquare className="w-4 h-4" />,
        },
        {
          id: 'audit',
          labelEn: 'Audit Trail & Logs',
          labelAr: 'سجل التدقيق والامتثال',
          icon: <ShieldCheck className="w-4 h-4" />,
        },
      ],
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white text-slate-900 border-r rtl:border-r-0 rtl:border-l border-slate-200 select-none shadow-[2px_0_12px_rgba(3,87,143,0.03)] transition-all duration-300">
      {/* Top Collapse / Expand Control Header */}
      <div className={`p-2.5 border-b border-slate-200 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} bg-[#F6F9FC]`}>
        {!isCollapsed && (
          <span className="text-[10px] font-black uppercase tracking-wider text-[#03578F] pl-2">
            Navigation Menu
          </span>
        )}
        <button
          onClick={handleToggleCollapse}
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          className="p-1.5 rounded-md hover:bg-slate-200 text-slate-600 hover:text-[#03578F] transition cursor-pointer flex items-center justify-center shadow-2xs"
        >
          {isCollapsed ? (
            <PanelLeftOpen className="w-4 h-4 text-[#03578F]" />
          ) : (
            <PanelLeftClose className="w-4 h-4 text-slate-500 hover:text-[#03578F]" />
          )}
        </button>
      </div>

      {/* Scrollable Navigation Items */}
      <div className="p-2 space-y-4 overflow-y-auto flex-1 scrollbar-thin">
        {sections.map((sec, secIdx) => (
          <div key={secIdx} className="space-y-1">
            {!isCollapsed ? (
              <div className="text-[10px] font-black uppercase tracking-wider text-[#03578F]/75 px-3 py-1">
                {language === 'ar' ? sec.titleAr : sec.titleEn}
              </div>
            ) : (
              <div className="w-full border-t border-slate-200 my-2" />
            )}

            {sec.items.map((item) => {
              const isActive = activeTab === item.id;
              const label = language === 'ar' ? item.labelAr : item.labelEn;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    if (onCloseMobile) onCloseMobile();
                  }}
                  title={isCollapsed ? label : undefined}
                  className={`w-full flex items-center ${
                    isCollapsed ? 'justify-center px-2 py-2.5' : 'justify-between px-3 py-2'
                  } rounded-md font-semibold text-xs transition group cursor-pointer relative ${
                    isActive
                      ? 'bg-[#03578F] text-white shadow-sm font-bold'
                      : 'text-slate-700 hover:text-[#03578F] hover:bg-[#F6F9FC]'
                  }`}
                >
                  <div className={`flex items-center gap-2.5 min-w-0 ${isCollapsed ? 'justify-center' : ''}`}>
                    <span className={`${isActive ? 'text-amber-300' : 'text-slate-500 group-hover:text-[#03578F]'} transition shrink-0`}>
                      {item.icon}
                    </span>
                    {!isCollapsed && (
                      <span className="text-left rtl:text-right truncate text-[12px]">
                        {label}
                      </span>
                    )}
                  </div>

                  {!isCollapsed && isActive && (
                    <ChevronRight className="w-3.5 h-3.5 text-amber-300 rtl:rotate-180 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Operator Session Profile & Controls Card in Sidebar Bottom */}
      <div className={`p-2.5 border-t border-slate-200 bg-[#F6F9FC] shrink-0 ${isCollapsed ? 'space-y-2 text-center' : 'space-y-2.5'}`}>
        {/* Mock Data Toggle Switch */}
        {!isCollapsed ? (
          <div className="bg-white border border-slate-200 rounded-md p-2 flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2">
              <Sparkles className={`w-3.5 h-3.5 ${useMockData ? 'text-amber-500' : 'text-slate-400'}`} />
              <div>
                <span className="text-[11px] font-bold text-slate-800 block leading-tight">
                  Demo Mock Data
                </span>
                <span className="text-[9px] text-slate-500 font-medium">
                  {useMockData ? `${pilgrims.length} Sample Pax Loaded` : 'Clean Blank Mode'}
                </span>
              </div>
            </div>
            <button
              onClick={toggleMockData}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                useMockData ? 'bg-emerald-600' : 'bg-slate-300'
              }`}
              role="switch"
              aria-checked={useMockData}
              title="Toggle sample mock data on / off"
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  useMockData ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        ) : (
          <button
            onClick={toggleMockData}
            title={`Demo Mock Data: ${useMockData ? 'ON (Sample Data)' : 'OFF (Blank State)'}`}
            className={`w-full py-1.5 rounded-md border flex items-center justify-center transition cursor-pointer shadow-2xs ${
              useMockData
                ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                : 'bg-slate-200 border-slate-300 text-slate-500'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
          </button>
        )}

        {/* User Identity */}
        {!isCollapsed ? (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#03578F] text-white flex items-center justify-center font-black text-xs shrink-0 shadow-2xs">
              {currentRoleObj.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-xs text-slate-900 truncate">
                {currentRoleObj.name}
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-emerald-700 font-semibold mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Saudi Ground Sync Active</span>
              </div>
            </div>
          </div>
        ) : (
          <div
            title={`${currentRoleObj.name} (${currentRoleObj.label})`}
            className="w-8 h-8 mx-auto rounded-full bg-[#03578F] text-white flex items-center justify-center font-black text-xs shadow-2xs cursor-pointer relative"
          >
            {currentRoleObj.avatar}
            <span className="w-2 h-2 rounded-full bg-emerald-500 border border-white absolute bottom-0 right-0" />
          </div>
        )}

        {/* Role Switcher Select Dropdown */}
        {!isCollapsed ? (
          <div className="bg-white border border-slate-200 rounded-md p-1 flex items-center gap-1.5 text-xs shadow-2xs">
            <UserCheck className="w-3.5 h-3.5 text-[#03578F] ml-1 shrink-0" />
            <select
              value={currentUserRole}
              onChange={(e) => setCurrentUserRole(e.target.value as UserRole)}
              className="w-full bg-transparent font-bold text-[#03578F] text-[11px] focus:outline-none cursor-pointer pr-1 truncate"
            >
              {roles.map((r) => (
                <option key={r.role} value={r.role} className="bg-white text-slate-900">
                  {r.label}
                </option>
              ))}
            </select>
          </div>
        ) : null}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Collapsible/Expandable Sidebar */}
      <aside
        className={`hidden lg:block h-full shrink-0 transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-18' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs" onClick={onCloseMobile} />
          <div className="relative w-64 max-w-[80vw] h-full shadow-2xl z-10 flex flex-col animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
