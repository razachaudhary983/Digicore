import React from 'react';
import { Sun, Moon, Search } from 'lucide-react';
import { useCRM } from '../../context/CRMContext';

export const TopHeader: React.FC<{ onOpenSearch: () => void }> = ({ onOpenSearch }) => {
  const { theme, toggleTheme } = useCRM();

  return (
    <header className="h-16 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Global Search Trigger (Ctrl + K) */}
      <button
        onClick={onOpenSearch}
        className="flex items-center gap-3 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 text-xs hover:border-indigo-500 transition-colors w-72 cursor-pointer"
      >
        <Search className="w-4 h-4 text-slate-400" />
        <span className="flex-1 text-left">Search leads, clients...</span>
        <kbd className="text-[10px] bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-300 dark:border-slate-700 font-mono text-slate-500 dark:text-slate-400">
          Ctrl + K
        </kbd>
      </button>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Theme Switcher Button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-indigo-500 border border-slate-200 dark:border-slate-800 transition-colors cursor-pointer"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* User Badge */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200 dark:border-slate-800">
          <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
            DC
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-semibold text-slate-900 dark:text-white">Admin Agency</p>
            <p className="text-[10px] text-slate-400">DigiCore Operations</p>
          </div>
        </div>
      </div>
    </header>
  );
};
