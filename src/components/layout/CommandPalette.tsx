import React, { useState, useEffect } from 'react';
import { Search, Building } from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { StatusBadge } from '../common/StatusBadge';

export const CommandPalette: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { leads, clients } = useCRM();
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        onClose();
      }
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const filteredLeads = leads.filter(l =>
    l.name.toLowerCase().includes(query.toLowerCase()) ||
    l.company.toLowerCase().includes(query.toLowerCase()) ||
    (l.phone && l.phone.includes(query)) ||
    (l.email && l.email.toLowerCase().includes(query.toLowerCase()))
  );

  const filteredClients = clients.filter(c =>
    c.name.toLowerCase().includes(query.toLowerCase()) ||
    c.company.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/80 backdrop-blur-md"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl bg-white dark:bg-[#121217] border border-slate-200 dark:border-[#23232c] rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200 dark:border-[#23232c] gap-3">
          <Search className="w-5 h-5 text-[#FFC700]" />
          <input
            type="text"
            placeholder="Search leads, clients, company, phone, email... (ESC to close)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none"
          />
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-xs text-slate-400 bg-slate-100 dark:bg-[#181820] rounded-lg border border-slate-300 dark:border-[#2a2a36]">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 divide-y divide-slate-100 dark:divide-[#23232c]">
          {filteredLeads.length === 0 && filteredClients.length === 0 && (
            <div className="py-12 text-center text-slate-400 text-xs">
              No matching records found for "{query}"
            </div>
          )}

          {filteredLeads.length > 0 && (
            <div className="py-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3">
                Leads ({filteredLeads.length})
              </span>
              <div className="mt-1 space-y-1">
                {filteredLeads.map(lead => (
                  <div
                    key={lead.id}
                    className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-[#181820] cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-[#FFC700]/15 text-[#FFC700] flex items-center justify-center font-bold text-xs">
                        {lead.name[0]}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-slate-900 dark:text-white">
                            {lead.name}
                          </p>
                          <span className="text-[11px] text-slate-400">· {lead.company}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {lead.email || lead.phone || 'No direct contact'} · Source: {lead.channel}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge type="status" value={lead.status} />
                      <StatusBadge type="temperature" value={lead.temperature} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {filteredClients.length > 0 && (
            <div className="py-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500 px-3">
                Clients ({filteredClients.length})
              </span>
              <div className="mt-1 space-y-1">
                {filteredClients.map(client => (
                  <div
                    key={client.id}
                    className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-[#181820] cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-bold text-xs">
                        <Building className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">
                          {client.company}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Contact: {client.name} · {client.serviceCategory}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-emerald-500 font-mono">
                      PKR {client.monthlyRetainer.toLocaleString()}/mo
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
