import React, { useState } from 'react';
import { ErpProvider, useErp } from './context/ErpContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import type { TabType } from './components/common/Sidebar';
import { OverviewDashboard } from './components/dashboard/OverviewDashboard';
import { LeadPipeline } from './components/crm/LeadPipeline';
import { PilgrimVault } from './components/pilgrims/PilgrimVault';
import { PackageManagement } from './components/packages/PackageManagement';
import { GroundOperationsHub } from './components/ground-ops/GroundOperationsHub';
import { VisaNusukTracker } from './components/visa-nusuk/VisaNusukTracker';
import { B2BAgentPortal } from './components/b2b/B2BAgentPortal';
import { MultiCurrencyLedger } from './components/finance/MultiCurrencyLedger';
import { WhatsAppHub } from './components/whatsapp/WhatsAppHub';
import { AuditTrailViewer } from './components/audit/AuditTrailViewer';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('ctt_erp_sidebar_collapsed') === 'true';
  });

  const toggleSidebarCollapse = () => {
    const next = !sidebarCollapsed;
    setSidebarCollapsed(next);
    localStorage.setItem('ctt_erp_sidebar_collapsed', String(next));
  };

  const { currentUserRole } = useErp();
  const { t, language } = useLanguage();

  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-100 text-slate-900 flex flex-col font-sans antialiased selection:bg-amber-500/20 selection:text-amber-900">
      {/* Top Application Header (Fixed Height, Sticky at top) */}
      <Header
        onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
        mobileMenuOpen={mobileMenuOpen}
      />

      {/* Main Workspace: Fixed height container filling the remainder of the viewport */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Sidebar Navigation: Stationary Fixed Height with independent scrollbar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setActiveTab(tab);
            setMobileMenuOpen(false);
          }}
          mobileOpen={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={toggleSidebarCollapse}
        />

        {/* Dynamic Content Panel: ONLY this area scrolls independently! */}
        <main className="flex-1 h-full overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-7 bg-slate-50/70 scrollbar-thin">
          <div className="max-w-[1600px] mx-auto pb-12">
            {activeTab === 'dashboard' && <OverviewDashboard setActiveTab={setActiveTab} />}
            {activeTab === 'crm' && <LeadPipeline />}
            {activeTab === 'pilgrims' && <PilgrimVault />}
            {activeTab === 'packages' && <PackageManagement />}
            {activeTab === 'groundOps' && <GroundOperationsHub />}
            {activeTab === 'visaNusuk' && <VisaNusukTracker />}
            {activeTab === 'b2b' && <B2BAgentPortal />}
            {activeTab === 'finance' && <MultiCurrencyLedger />}
            {activeTab === 'whatsapp' && <WhatsAppHub />}
            {activeTab === 'audit' && <AuditTrailViewer />}
          </div>
        </main>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <LanguageProvider>
      <ErpProvider>
        <AppContent />
      </ErpProvider>
    </LanguageProvider>
  );
};

export default App;
