import React, { useState } from 'react';
import {
  ShieldCheck,
  Search,
  Filter,
  Lock,
  Clock,
  User,
  Globe,
  Layers,
  FileText,
} from 'lucide-react';
import { useErp } from '../../context/ErpContext';
import { useLanguage } from '../../context/LanguageContext';

export const AuditTrailViewer: React.FC = () => {
  const { auditLogs } = useErp();
  const { t } = useLanguage();

  const [searchTerm, setSearchTerm] = useState('');
  const [moduleFilter, setModuleFilter] = useState<string>('all');

  const filteredLogs = auditLogs.filter(log => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      log.action.toLowerCase().includes(term) ||
      log.userName.toLowerCase().includes(term) ||
      log.details.toLowerCase().includes(term);
    const matchesModule = moduleFilter === 'all' || log.module === moduleFilter;
    return matchesSearch && matchesModule;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-sky-700" />
            <span>{t('nav.audit')}</span>
          </h2>
          <p className="text-xs text-slate-500">
            Immutable system activity log tracking all room allocations, pricing overrides, document downloads, and financial ledger entries
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-md text-xs text-slate-700">
          <Lock className="w-4 h-4 text-emerald-600" />
          <span>Audit Logging: <strong>ENFORCED (SHA-256)</strong></span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white/90 backdrop-blur-md border border-slate-200 rounded-md p-3 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-3 flex-1 min-w-[240px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 rtl:left-auto rtl:right-3" />
            <input
              type="text"
              placeholder="Search by action, user name, or keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-md pl-9 pr-3 py-1.5 rtl:pl-3 rtl:pr-9 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-sky-600 focus:bg-white"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <select
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none"
          >
            <option value="all">All Modules</option>
            <option value="CRM">CRM</option>
            <option value="Pilgrims">Pilgrims</option>
            <option value="GroundOps">Ground Operations</option>
            <option value="VisaNusuk">Visa & Nusuk</option>
            <option value="Finance">Finance</option>
            <option value="B2B">B2B Portal</option>
            <option value="WhatsApp">WhatsApp</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white/90 backdrop-blur-md border border-slate-200 rounded-md overflow-hidden shadow-2xs">
        <table className="w-full text-left rtl:text-right text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
            <tr>
              <th className="py-2.5 px-3">Timestamp</th>
              <th className="py-2.5 px-3">Actor / User</th>
              <th className="py-2.5 px-3">Module</th>
              <th className="py-2.5 px-3">Action Event</th>
              <th className="py-2.5 px-3">Details & Modification Context</th>
              <th className="py-2.5 px-3 font-mono">Origin IP Address</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredLogs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50/80 transition">
                <td className="py-2.5 px-3 font-mono text-slate-500 whitespace-nowrap text-[11px]">
                  {log.timestamp}
                </td>
                <td className="py-2.5 px-3">
                  <div className="font-bold text-slate-900">{log.userName}</div>
                  <span className="text-[10px] uppercase text-sky-700 font-bold">{log.userRole}</span>
                </td>
                <td className="py-2.5 px-3">
                  <span className="px-1.5 py-0.5 rounded-xs bg-slate-100 text-slate-800 font-bold text-[10px]">
                    {log.module}
                  </span>
                </td>
                <td className="py-2.5 px-3 font-mono font-bold text-amber-800 text-[11px]">
                  {log.action}
                </td>
                <td className="py-2.5 px-3 text-slate-700 font-medium max-w-md">
                  {log.details}
                </td>
                <td className="py-2.5 px-3 font-mono text-slate-500 text-[11px] whitespace-nowrap">
                  {log.ipAddress}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
