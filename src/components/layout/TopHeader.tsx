import React, { useState } from 'react';
import {
  Search,
  Moon,
  Sun,
  Flame,
  Users,
  LogOut,
  Sparkles,
  Lock,
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { useAuth } from '../../context/AuthContext';
import { UserManagementModal } from '../auth/UserManagementModal';

export const TopHeader: React.FC<{ onOpenSearch: () => void }> = ({ onOpenSearch }) => {
  const { leads, invoices, theme, toggleTheme } = useCRM();
  const { currentUser, logout, lockSession } = useAuth();
  const [showUserModal, setShowUserModal] = useState(false);

  // Pipeline metrics
  const totalPipelineValue = leads.reduce((acc, curr) => acc + (curr.estimatedValue || 0), 0);
  const hotLeads = leads.filter(l => l.temperature === 'Hot').length;
  const pendingRevenue = invoices
    .filter(i => i.status === 'Pending' || i.status === 'Overdue')
    .reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <>
      <header className="h-16 border-b border-slate-200 dark:border-[#23232c] bg-white/80 dark:bg-[#0e0e12]/80 backdrop-blur-md flex items-center justify-between px-6 z-20 sticky top-0">
        {/* Left: Global Search trigger */}
        <div className="flex items-center gap-4 flex-1 max-w-md">
          <button
            onClick={onOpenSearch}
            className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-[#181820] border border-slate-200 dark:border-[#2a2a36] text-slate-400 hover:text-slate-200 hover:border-[#FFC700]/50 transition-all text-xs cursor-pointer group"
          >
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-slate-400 group-hover:text-[#FFC700]" />
              <span>Search leads, clients, phone, notes...</span>
            </div>
            <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono text-slate-400 bg-white dark:bg-[#121217] rounded border border-slate-200 dark:border-[#2a2a36]">
              Ctrl + K
            </kbd>
          </button>
        </div>

        {/* Right: Quick Metrics & User Profile Actions */}
        <div className="flex items-center gap-3">
          {/* Quick Metrics (Desktop) */}
          <div className="hidden lg:flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FFC700]/10 border border-[#FFC700]/30 text-xs">
              <Flame className="w-3.5 h-3.5 text-[#FFC700]" />
              <span className="font-bold text-slate-800 dark:text-white">{hotLeads}</span>
              <span className="text-slate-500 dark:text-slate-400">Hot Deals</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs">
              <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
              <span className="font-bold text-slate-800 dark:text-white font-mono">
                PKR {(totalPipelineValue / 1000).toFixed(1)}k
              </span>
              <span className="text-slate-500 dark:text-slate-400">Pipeline</span>
            </div>

            {pendingRevenue > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs">
                <span className="font-bold text-amber-500 font-mono">PKR {pendingRevenue.toLocaleString()}</span>
                <span className="text-slate-500 dark:text-slate-400">Due</span>
              </div>
            )}
          </div>

          <div className="h-6 w-px bg-slate-200 dark:bg-[#23232c]" />

          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#181820] cursor-pointer transition-colors"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-[#FFC700]" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Lock Session Button */}
          <button
            onClick={lockSession}
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-[#FFC700] hover:bg-slate-100 dark:hover:bg-[#181820] cursor-pointer transition-colors"
            title="Lock Workspace (Auto-locks after 3 min inactivity)"
          >
            <Lock className="w-4 h-4" />
          </button>

          {/* Admin User Management Button */}
          {currentUser?.role === 'admin' && (
            <button
              onClick={() => setShowUserModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#181820] hover:bg-[#22222d] border border-[#2a2a36] hover:border-[#FFC700]/50 text-xs font-semibold text-white cursor-pointer transition-all"
              title="User Management (Admin Only)"
            >
              <Users className="w-3.5 h-3.5 text-[#FFC700]" />
              <span className="hidden sm:inline">Staff Accounts</span>
            </button>
          )}

          {/* Logout Button */}
          <button
            onClick={logout}
            className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 cursor-pointer transition-colors"
            title="Log Out of DigiCore CRM"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Admin User Management Modal */}
      {showUserModal && (
        <UserManagementModal isOpen={showUserModal} onClose={() => setShowUserModal(false)} />
      )}
    </>
  );
};

