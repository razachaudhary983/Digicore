import React from 'react';
import {
  CalendarCheck,
  Layers,
  Linkedin,
  Compass,
  WalletCards,
  ChevronLeft,
  ChevronRight,
  Shield,
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isCollapsed,
  setIsCollapsed,
}) => {
  const { leads, invoices } = useCRM();
  const { currentUser } = useAuth();

  // Calculate live badges
  const pendingInvoicesCount = invoices.filter(i => i.status === 'Pending' || i.status === 'Overdue').length;
  const hotLeadsCount = leads.filter(l => l.temperature === 'Hot').length;

  // Strict sequence and exact clean titles
  const navItems = [
    {
      id: 'daily',
      label: 'Daily Action Center',
      icon: CalendarCheck,
    },
    {
      id: 'master-crm',
      label: 'Central Master CRM',
      icon: Layers,
      count: hotLeadsCount > 0 ? `${hotLeadsCount} Hot` : undefined,
    },
    {
      id: 'linkedin',
      label: 'LinkedIn Outreach',
      icon: Linkedin,
    },
    {
      id: 'other-channels',
      label: 'Other Acquisitions',
      icon: Compass,
    },
    {
      id: 'finance',
      label: 'Finance & Clients',
      icon: WalletCards,
      count: pendingInvoicesCount > 0 ? `${pendingInvoicesCount} Due` : undefined,
    },
  ];

  return (
    <aside
      className={`relative flex flex-col border-r border-slate-200 dark:border-[#23232c] bg-white dark:bg-[#0e0e12] transition-all duration-300 select-none z-30 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 dark:border-[#23232c]">
        {!isCollapsed ? (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FFC700] text-black font-black text-base flex items-center justify-center shadow-md shadow-[#FFC700]/25">
              D
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-white flex items-center gap-1">
                DigiCore <span className="text-[#FFC700]">CRM</span>
              </span>
              <p className="text-[10px] text-slate-400 font-mono">digicorepak.com</p>
            </div>
          </div>
        ) : (
          <div className="w-9 h-9 mx-auto rounded-xl bg-[#FFC700] text-black font-black text-base flex items-center justify-center shadow-md shadow-[#FFC700]/25">
            D
          </div>
        )}

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#181820] cursor-pointer"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 py-4 px-2 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-xs transition-all cursor-pointer group ${
                isActive
                  ? 'bg-[#FFC700] text-black shadow-md shadow-[#FFC700]/20 font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#181820]'
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon
                className={`w-4 h-4 flex-shrink-0 transition-transform group-hover:scale-110 ${
                  isActive ? 'text-black' : 'text-slate-500 dark:text-slate-400 group-hover:text-[#FFC700]'
                }`}
              />

              {!isCollapsed && (
                <div className="flex-1 flex items-center justify-between truncate">
                  <span className="truncate">{item.label}</span>
                  {item.count && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                        isActive
                          ? 'bg-black/20 text-black'
                          : 'bg-[#FFC700]/15 text-[#FFC700] border border-[#FFC700]/30'
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* User Session Info / Footer */}
      <div className="p-3 border-t border-slate-200 dark:border-[#23232c] bg-slate-50/50 dark:bg-[#0a0a0c]/60">
        {!isCollapsed ? (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FFC700]/20 text-[#FFC700] border border-[#FFC700]/40 flex items-center justify-center font-bold text-xs">
              {currentUser?.name?.[0] || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-800 dark:text-white truncate">
                {currentUser?.name || 'Admin'}
              </p>
              <p className="text-[10px] text-slate-400 flex items-center gap-1 truncate font-mono">
                <Shield className="w-3 h-3 text-[#FFC700]" />
                {currentUser?.role === 'admin' ? 'Executive Admin' : 'Staff Outreach'}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center" title={`${currentUser?.name} (${currentUser?.role})`}>
            <div className="w-8 h-8 rounded-lg bg-[#FFC700]/20 text-[#FFC700] border border-[#FFC700]/40 flex items-center justify-center font-bold text-xs">
              {currentUser?.name?.[0] || 'A'}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
