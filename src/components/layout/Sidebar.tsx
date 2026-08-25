import React from 'react';
import {
  Calendar,
  Linkedin,
  MapPin,
  KanbanSquare,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  collapsed,
  onToggleCollapse,
}) => {
  const menuItems = [
    {
      id: 'daily',
      label: 'Daily Action Center',
      icon: Calendar,
      badge: 'Command',
    },
    {
      id: 'linkedin',
      label: 'LinkedIn Outreach',
      icon: Linkedin,
      badge: 'Primary',
    },
    {
      id: 'other-channels',
      label: 'Local & Other Channels',
      icon: MapPin,
    },
    {
      id: 'master-crm',
      label: 'Central Master CRM',
      icon: KanbanSquare,
      badge: 'Aggregated',
    },
    {
      id: 'finance',
      label: 'Finance & Clients',
      icon: DollarSign,
    },
  ];

  return (
    <aside
      className={`h-screen sticky top-0 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between transition-all duration-300 z-30 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div>
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-800">
          {!collapsed && (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-500 flex items-center justify-center text-white font-black text-sm shadow-md">
                D
              </div>
              <div>
                <h1 className="font-bold text-sm text-slate-900 dark:text-white tracking-tight">
                  DigiCore CRM
                </h1>
                <p className="text-[10px] text-slate-400 font-medium">Agency Operating System</p>
              </div>
            </div>
          )}

          {collapsed && (
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-500 flex items-center justify-center text-white font-black text-sm mx-auto shadow-md">
              D
            </div>
          )}

          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 cursor-pointer"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1.5">
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white'
                }`}
                title={collapsed ? item.label : undefined}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : ''}`} />
                {!collapsed && (
                  <div className="flex items-center justify-between w-full">
                    <span>{item.label}</span>
                    {item.badge && (
                      <span
                        className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-bold tracking-wider ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer / System Status */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800">
        {!collapsed ? (
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Single Source Engine Active</span>
          </div>
        ) : (
          <ShieldCheck className="w-4 h-4 text-emerald-500 mx-auto" />
        )}
      </div>
    </aside>
  );
};
