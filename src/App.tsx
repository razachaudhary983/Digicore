import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CRMProvider } from './context/CRMContext';
import { LoginScreen } from './components/auth/LoginScreen';
import { LockScreenOverlay } from './components/auth/LockScreenOverlay';
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
  const { isAuthenticated, isAuthLoading, isLocked } = useAuth();
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

  if (isAuthLoading) {
    return (
      <div className="min-h-screen w-full bg-[#0a0a0c] flex flex-col items-center justify-center text-white space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-[#FFC700] text-black font-black text-xl flex items-center justify-center shadow-lg shadow-[#FFC700]/30 animate-pulse">
          D
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
          <span className="w-2 h-2 rounded-full bg-[#FFC700] animate-ping" />
          <span>Synchronizing DigiCore Security Shield & Cloud Store...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return (
    <CRMProvider>
      <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-[#FFC700] selection:text-black transition-colors duration-200 relative">
        {/* Inactivity Auto-Lock Overlay */}
        {isLocked && <LockScreenOverlay />}

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


