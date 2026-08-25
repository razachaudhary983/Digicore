import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CRMProvider } from './context/CRMContext';
import { LoginScreen } from './components/auth/LoginScreen';
import { Sidebar } from './components/layout/Sidebar';
import { TopHeader } from './components/layout/TopHeader';
import { CommandPalette } from './components/layout/CommandPalette';
import { DailyActionCenter } from './components/daily/DailyActionCenter';
import { CentralMasterCRM } from './components/master/CentralMasterCRM';
import { LinkedInHub } from './components/channels/LinkedInHub';
import { OtherChannelsHub } from './components/channels/OtherChannelsHub';
import { FinanceManager } from './components/finance/FinanceManager';
import { QuickActionFAB } from './components/common/QuickActionFAB';

function CRMApp() {
  const { isAuthenticated } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('daily');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Global Ctrl + K Shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return (
    <CRMProvider>
      <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-[#FFC700] selection:text-black transition-colors duration-200">
        {/* Navigation Sidebar */}
        <Sidebar
          activeTab={currentTab}
          setActiveTab={setCurrentTab}
          isCollapsed={sidebarCollapsed}
          setIsCollapsed={setSidebarCollapsed}
        />

        {/* Primary Viewport */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top System Header */}
          <TopHeader onOpenSearch={() => setIsSearchOpen(true)} />

          {/* Tab Views */}
          <main className="flex-1 p-6 max-w-7xl w-full mx-auto animate-in fade-in duration-150">
            {currentTab === 'daily' && <DailyActionCenter />}
            {currentTab === 'master-crm' && <CentralMasterCRM />}
            {currentTab === 'linkedin' && <LinkedInHub />}
            {currentTab === 'other-channels' && <OtherChannelsHub />}
            {currentTab === 'finance' && <FinanceManager />}
          </main>
        </div>

        {/* Global Search Command Palette (Ctrl+K) */}
        <CommandPalette
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
        />

        {/* Floating Quick Action Trigger */}
        <QuickActionFAB />
      </div>
    </CRMProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CRMApp />
    </AuthProvider>
  );
}

