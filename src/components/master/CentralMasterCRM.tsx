import React, { useState } from 'react';
import {
  Search,
  Filter,
  Table as TableIcon,
  Kanban as KanbanIcon,
  UserPlus,
  ArrowUpDown,
  Trash2,
  Trophy,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { Lead, LeadStatus, LeadTemperature, LeadChannel } from '../../types/crm';
import { StatusBadge } from '../common/StatusBadge';
import { CustomSelect } from '../common/CustomSelect';
import { DeleteGuardModal } from '../common/DeleteGuardModal';

const STATUS_COLUMNS: LeadStatus[] = [
  'New',
  'Qualified',
  'Meeting Booked',
  'Proposal Sent',
  'Won',
  'Lost',
];

export const CentralMasterCRM: React.FC = () => {
  const {
    leads,
    addLead,
    updateLead,
    deleteLead,
    bulkUpdateStatus,
    createClientFromWonLead,
  } = useCRM();

  // Primary view defaults to Data Table view
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [channelFilter, setChannelFilter] = useState<string>('All');
  const [temperatureFilter, setTemperatureFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Bulk Selection State
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);

  // Modals / Drawer
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);
  const [leadToConvert, setLeadToConvert] = useState<Lead | null>(null);
  const [activeLeadDetails, setActiveLeadDetails] = useState<Lead | null>(null);

  // New Lead Form
  const [newLead, setNewLead] = useState({
    name: '',
    company: '',
    jobTitle: '',
    email: '',
    phone: '',
    linkedInUrl: '',
    channel: 'LinkedIn' as LeadChannel,
    temperature: 'Hot' as LeadTemperature,
    status: 'New' as LeadStatus,
    estimatedValue: 3500,
    followUpDate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  // Client conversion form state
  const [clientService, setClientService] = useState('Paid Acquisition');
  const [clientRetainer, setClientRetainer] = useState(3500);

  // Filtered Leads
  const filteredLeads = leads.filter(lead => {
    const matchesSearch =
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (lead.email && lead.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (lead.phone && lead.phone.includes(searchQuery));

    const matchesChannel = channelFilter === 'All' || lead.channel === channelFilter;
    const matchesTemp = temperatureFilter === 'All' || lead.temperature === temperatureFilter;
    const matchesStatus = statusFilter === 'All' || lead.status === statusFilter;

    return matchesSearch && matchesChannel && matchesTemp && matchesStatus;
  });

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedLeadIds(filteredLeads.map(l => l.id));
    } else {
      setSelectedLeadIds([]);
    }
  };

  const handleToggleSelectLead = (id: string) => {
    setSelectedLeadIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleAddLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLead.name || !newLead.company) return;

    addLead(newLead);
    setShowAddLeadModal(false);
    setNewLead({
      name: '',
      company: '',
      jobTitle: '',
      email: '',
      phone: '',
      linkedInUrl: '',
      channel: 'LinkedIn',
      temperature: 'Hot',
      status: 'New',
      estimatedValue: 3500,
      followUpDate: new Date().toISOString().split('T')[0],
      notes: '',
    });
  };

  const handleConfirmConvertWon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadToConvert) return;
    createClientFromWonLead(leadToConvert, clientService, clientRetainer);
    updateLead(leadToConvert.id, { status: 'Won' });
    setLeadToConvert(null);
  };

  const totalValue = filteredLeads.reduce((acc, l) => acc + (l.estimatedValue || 0), 0);

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-200">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            Central Master CRM
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-[#FFC700]/15 text-amber-700 dark:text-[#FFC700] border border-[#FFC700]/30">
              {filteredLeads.length} Records (PKR {(totalValue / 1000).toFixed(1)}k Pipeline)
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Cross-channel aggregated pipeline with high-density data tables and Kanban synchronization.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Toggle: Default is Table */}
          <div className="flex items-center bg-slate-100 dark:bg-[#181820] p-1 rounded-xl border border-slate-200 dark:border-[#2a2a36]">
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-[#23232f] text-slate-900 dark:text-white shadow-sm border border-slate-200/60 dark:border-[#383848]'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              Data Table (Primary)
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'kanban'
                  ? 'bg-white dark:bg-[#23232f] text-slate-900 dark:text-white shadow-sm border border-slate-200/60 dark:border-[#383848]'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <KanbanIcon className="w-3.5 h-3.5" />
              Kanban Board
            </button>
          </div>

          <button
            onClick={() => setShowAddLeadModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#FFC700] hover:bg-[#ffcf1a] text-black font-bold text-xs rounded-xl shadow-md shadow-[#FFC700]/20 transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add New Lead</span>
          </button>
        </div>
      </div>

      {/* Filter & Action Toolbar for Data Table View */}
      {viewMode === 'table' && (
        <div className="bg-white dark:bg-[#121217] border border-slate-200 dark:border-[#23232c] p-4 rounded-2xl shadow-sm space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="relative lg:col-span-2">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by lead name, company, email, phone..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#181820] border border-slate-200 dark:border-[#2a2a36] rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#FFC700] focus:ring-1 focus:ring-[#FFC700]"
              />
            </div>

            <div>
              <select
                value={channelFilter}
                onChange={e => setChannelFilter(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#181820] border border-slate-200 dark:border-[#2a2a36] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#FFC700]"
              >
                <option value="All">All Acquisition Channels</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="Google Maps">Google Maps</option>
                <option value="Meta Ads">Meta Ads</option>
                <option value="Cold Email">Cold Email</option>
                <option value="Freelancer / Upwork">Freelancer / Upwork</option>
                <option value="Referral">Referral</option>
              </select>
            </div>

            <div>
              <select
                value={temperatureFilter}
                onChange={e => setTemperatureFilter(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#181820] border border-slate-200 dark:border-[#2a2a36] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#FFC700]"
              >
                <option value="All">All Temperatures (Hot, Warm, Cold)</option>
                <option value="Hot">Hot Deals 🔥</option>
                <option value="Warm">Warm Deals ⚡</option>
                <option value="Cold">Cold Deals ❄️</option>
              </select>
            </div>

            <div>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#181820] border border-slate-200 dark:border-[#2a2a36] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#FFC700]"
              >
                <option value="All">All Pipeline Stages</option>
                {STATUS_COLUMNS.map(s => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Bulk Action Bar (when records are selected) */}
          {selectedLeadIds.length > 0 && (
            <div className="flex items-center justify-between p-3 bg-[#FFC700]/10 border border-[#FFC700]/30 rounded-xl animate-in fade-in">
              <span className="text-xs font-bold text-amber-800 dark:text-[#FFC700]">
                {selectedLeadIds.length} leads selected
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Bulk Move To:</span>
                <select
                  onChange={e => {
                    if (e.target.value) {
                      bulkUpdateStatus(selectedLeadIds, e.target.value as LeadStatus);
                      setSelectedLeadIds([]);
                    }
                  }}
                  className="bg-white dark:bg-[#181820] border border-[#FFC700]/40 rounded-lg px-2.5 py-1 text-xs text-slate-900 dark:text-white font-semibold outline-none"
                >
                  <option value="">Choose Stage...</option>
                  {STATUS_COLUMNS.map(s => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => setSelectedLeadIds([])}
                  className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white font-semibold cursor-pointer"
                >
                  Clear
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW 1: HIGH-DENSITY DATA TABLE (DEFAULT) */}
      {viewMode === 'table' && (
        <div className="bg-white dark:bg-[#121217] border border-slate-200 dark:border-[#23232c] rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-[#181820] border-b border-slate-200 dark:border-[#23232c] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                  <th className="p-3.5 w-10 text-center">
                    <input
                      type="checkbox"
                      onChange={handleSelectAll}
                      checked={
                        filteredLeads.length > 0 && selectedLeadIds.length === filteredLeads.length
                      }
                      className="rounded border-slate-300 dark:border-[#2a2a36] text-[#FFC700] focus:ring-[#FFC700]"
                    />
                  </th>
                  <th className="p-3.5">Lead & Company</th>
                  <th className="p-3.5">Contact / Profile</th>
                  <th className="p-3.5">Channel</th>
                  <th className="p-3.5">Temperature</th>
                  <th className="p-3.5">Pipeline Stage</th>
                  <th className="p-3.5">Value (PKR)</th>
                  <th className="p-3.5">Follow-up</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#23232c]">
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-slate-400 text-xs">
                      No matching leads found for current filters.
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map(lead => {
                    const isSelected = selectedLeadIds.includes(lead.id);
                    return (
                      <tr
                        key={lead.id}
                        className={`hover:bg-slate-50 dark:hover:bg-[#181820]/60 transition-colors ${
                          isSelected ? 'bg-[#FFC700]/5 dark:bg-[#FFC700]/10' : ''
                        }`}
                      >
                        <td className="p-3.5 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSelectLead(lead.id)}
                            className="rounded border-slate-300 dark:border-[#2a2a36] text-[#FFC700] focus:ring-[#FFC700]"
                          />
                        </td>

                        <td className="p-3.5">
                          <div className="flex flex-col">
                            <span
                              onClick={() => setActiveLeadDetails(lead)}
                              className="font-bold text-slate-900 dark:text-white hover:text-[#FFC700] cursor-pointer flex items-center gap-1"
                            >
                              {lead.name}
                              <ChevronRight className="w-3 h-3 text-slate-400 opacity-60" />
                            </span>
                            <span className="text-slate-500 dark:text-slate-400 font-medium">
                              {lead.company} {lead.jobTitle && `· ${lead.jobTitle}`}
                            </span>
                          </div>
                        </td>

                        <td className="p-3.5">
                          <div className="space-y-0.5 text-[11px]">
                            {lead.email && <div className="text-slate-600 dark:text-slate-300 font-mono">{lead.email}</div>}
                            {lead.phone && <div className="text-slate-500 dark:text-slate-400 font-mono">{lead.phone}</div>}
                            {lead.linkedInUrl && (
                              <a
                                href={lead.linkedInUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sky-500 hover:underline flex items-center gap-1 font-semibold"
                              >
                                LinkedIn <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            )}
                          </div>
                        </td>

                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-[#1e1e28] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#2a2a36] font-semibold text-[11px]">
                            {lead.channel}
                          </span>
                        </td>

                        {/* Standardized Temperature Badges: Hot, Warm, Cold */}
                        <td className="p-3.5">
                          <StatusBadge type="temperature" value={lead.temperature} />
                        </td>

                        <td className="p-3.5">
                          <select
                            value={lead.status}
                            onChange={e => updateLead(lead.id, { status: e.target.value as LeadStatus })}
                            className="bg-transparent border border-slate-200 dark:border-[#2a2a36] rounded-lg px-2 py-1 text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none focus:border-[#FFC700]"
                          >
                            {STATUS_COLUMNS.map(st => (
                              <option key={st} value={st} className="bg-white dark:bg-[#181820]">
                                {st}
                              </option>
                            ))}
                          </select>
                        </td>

                        <td className="p-3.5 font-mono font-bold text-slate-900 dark:text-white">
                          PKR {(lead.estimatedValue || 0).toLocaleString()}
                        </td>

                        <td className="p-3.5 font-mono text-slate-500 dark:text-slate-400">
                          {lead.followUpDate || '—'}
                        </td>

                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {lead.status !== 'Won' && (
                              <button
                                onClick={() => {
                                  setLeadToConvert(lead);
                                  setClientRetainer(lead.estimatedValue || 3500);
                                }}
                                className="p-1.5 rounded-lg text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 cursor-pointer"
                                title="Convert to Active Paying Client"
                              >
                                <Trophy className="w-4 h-4" />
                              </button>
                            )}

                            <button
                              onClick={() => setLeadToDelete(lead)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 cursor-pointer"
                              title="Delete Lead"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 2: KANBAN BOARD TOGGLE */}
      {viewMode === 'kanban' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Kanban Top Search & Temperature Filter Controls */}
          <div className="bg-white dark:bg-[#121217] border border-slate-200 dark:border-[#23232c] p-4 rounded-2xl shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
              {/* Real-time Search Input */}
              <div className="relative sm:col-span-2">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter Kanban by lead name or company..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#181820] border border-slate-200 dark:border-[#2a2a36] rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#FFC700] focus:ring-1 focus:ring-[#FFC700]"
                />
              </div>

              {/* Temperature Dropdown Filter */}
              <div>
                <select
                  value={temperatureFilter}
                  onChange={e => setTemperatureFilter(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#181820] border border-slate-200 dark:border-[#2a2a36] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-[#FFC700] cursor-pointer"
                >
                  <option value="All">All Temperatures (Hot, Warm, Cold)</option>
                  <option value="Hot">Hot Deals 🔥</option>
                  <option value="Warm">Warm Deals ⚡</option>
                  <option value="Cold">Cold Deals ❄️</option>
                </select>
              </div>
            </div>
          </div>

          {/* Kanban 3-Column Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STATUS_COLUMNS.map(columnStatus => {
              const columnLeads = filteredLeads.filter(l => l.status === columnStatus);
              const columnValue = columnLeads.reduce((a, b) => a + (b.estimatedValue || 0), 0);

              return (
                <div
                  key={columnStatus}
                  className="flex flex-col bg-slate-100/70 dark:bg-[#121217] border border-slate-200 dark:border-[#23232c] rounded-2xl p-4 min-w-0"
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 dark:border-[#23232c]">
                    <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      {columnStatus}
                      <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-[#1e1e28] text-[10px] font-mono flex items-center justify-center font-bold">
                        {columnLeads.length}
                      </span>
                    </span>
                    <span className="text-xs font-mono text-slate-400 font-semibold">
                      PKR {(columnValue / 1000).toFixed(1)}k
                    </span>
                  </div>

                  {/* Cards List */}
                  <div className="flex-1 space-y-3 overflow-y-auto max-h-[600px] pr-1">
                    {columnLeads.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-[#23232c] rounded-xl">
                        No leads in {columnStatus}
                      </div>
                    ) : (
                      columnLeads.map(lead => (
                        <div
                          key={lead.id}
                          className="bg-white dark:bg-[#181820] border border-slate-200 dark:border-[#2a2a36] hover:border-[#FFC700]/50 rounded-xl p-3.5 shadow-sm hover:shadow-md transition-all space-y-2.5 group"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <p
                                onClick={() => setActiveLeadDetails(lead)}
                                className="font-bold text-slate-900 dark:text-white text-xs hover:text-[#FFC700] cursor-pointer truncate"
                              >
                                {lead.name}
                              </p>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                {lead.company}
                              </p>
                            </div>
                            <StatusBadge type="temperature" value={lead.temperature} />
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-[#23232c] text-[11px]">
                            <span className="font-mono font-bold text-slate-900 dark:text-white">
                              PKR {(lead.estimatedValue || 0).toLocaleString()}
                            </span>
                            <span className="text-slate-400 text-[10px]">{lead.channel}</span>
                          </div>

                          {/* Quick stage switch on card */}
                          <div className="pt-1 flex items-center justify-between gap-2">
                            <select
                              value={lead.status}
                              onChange={e => updateLead(lead.id, { status: e.target.value as LeadStatus })}
                              className="bg-slate-50 dark:bg-[#121217] border border-slate-200 dark:border-[#2a2a36] rounded-md px-2 py-1 text-[11px] text-slate-700 dark:text-slate-300 outline-none flex-1"
                            >
                              {STATUS_COLUMNS.map(s => (
                                <option key={s} value={s}>
                                  Move: {s}
                                </option>
                              ))}
                            </select>

                            <button
                              onClick={() => setLeadToDelete(lead)}
                              className="text-slate-400 hover:text-rose-500 p-1 rounded-md hover:bg-rose-500/10 cursor-pointer"
                              title="Delete Lead"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL: ADD NEW LEAD */}
      {showAddLeadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white dark:bg-[#121217] border border-slate-200 dark:border-[#23232c] rounded-3xl p-6 shadow-2xl space-y-4 animate-in fade-in">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-[#FFC700]" />
              Add New Lead to Master CRM
            </h3>

            <form onSubmit={handleAddLeadSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Name *</label>
                  <input
                    type="text"
                    required
                    value={newLead.name}
                    onChange={e => setNewLead({ ...newLead, name: e.target.value })}
                    placeholder="e.g. Liam Walker"
                    className="w-full mt-1 bg-slate-50 dark:bg-[#181820] border border-slate-300 dark:border-[#2a2a36] focus:border-[#FFC700] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Company *</label>
                  <input
                    type="text"
                    required
                    value={newLead.company}
                    onChange={e => setNewLead({ ...newLead, company: e.target.value })}
                    placeholder="e.g. Zenith Global"
                    className="w-full mt-1 bg-slate-50 dark:bg-[#181820] border border-slate-300 dark:border-[#2a2a36] focus:border-[#FFC700] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Email</label>
                  <input
                    type="email"
                    value={newLead.email}
                    onChange={e => setNewLead({ ...newLead, email: e.target.value })}
                    placeholder="liam@zenith.com"
                    className="w-full mt-1 bg-slate-50 dark:bg-[#181820] border border-slate-300 dark:border-[#2a2a36] focus:border-[#FFC700] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Phone / WhatsApp</label>
                  <input
                    type="text"
                    value={newLead.phone}
                    onChange={e => setNewLead({ ...newLead, phone: e.target.value })}
                    placeholder="+1 or +92..."
                    className="w-full mt-1 bg-slate-50 dark:bg-[#181820] border border-slate-300 dark:border-[#2a2a36] focus:border-[#FFC700] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <CustomSelect
                  label="Channel"
                  value={newLead.channel}
                  options={['LinkedIn', 'Google Maps', 'Meta Ads', 'Cold Email', 'Freelancer / Upwork', 'Referral']}
                  onChange={val => setNewLead({ ...newLead, channel: val as LeadChannel })}
                />
                <CustomSelect
                  label="Temperature"
                  value={newLead.temperature}
                  options={['Hot', 'Warm', 'Cold']}
                  onChange={val => setNewLead({ ...newLead, temperature: val as LeadTemperature })}
                />
                <CustomSelect
                  label="Initial Stage"
                  value={newLead.status}
                  options={STATUS_COLUMNS}
                  onChange={val => setNewLead({ ...newLead, status: val as LeadStatus })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Est. Deal Value (PKR)</label>
                  <input
                    type="number"
                    value={newLead.estimatedValue}
                    onChange={e => setNewLead({ ...newLead, estimatedValue: Number(e.target.value) })}
                    className="w-full mt-1 bg-slate-50 dark:bg-[#181820] border border-slate-300 dark:border-[#2a2a36] focus:border-[#FFC700] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Follow-up Date</label>
                  <input
                    type="date"
                    value={newLead.followUpDate}
                    onChange={e => setNewLead({ ...newLead, followUpDate: e.target.value })}
                    className="w-full mt-1 bg-slate-50 dark:bg-[#181820] border border-slate-300 dark:border-[#2a2a36] focus:border-[#FFC700] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">LinkedIn Profile URL</label>
                <input
                  type="url"
                  value={newLead.linkedInUrl}
                  onChange={e => setNewLead({ ...newLead, linkedInUrl: e.target.value })}
                  placeholder="https://linkedin.com/in/prospect-handle"
                  className="w-full mt-1 bg-slate-50 dark:bg-[#181820] border border-slate-300 dark:border-[#2a2a36] focus:border-[#FFC700] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-[#23232c]">
                <button
                  type="button"
                  onClick={() => setShowAddLeadModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-[#FFC700] hover:bg-[#ffcf1a] text-black rounded-xl shadow-md cursor-pointer"
                >
                  Save to CRM
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CONVERT WON LEAD TO CLIENT */}
      {leadToConvert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-[#121217] border border-emerald-500/40 rounded-3xl p-6 shadow-2xl space-y-4 animate-in fade-in">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Convert to Paying Client! 🎉
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {leadToConvert.company} ({leadToConvert.name})
                </p>
              </div>
            </div>

            <form onSubmit={handleConfirmConvertWon} className="space-y-3">
              <CustomSelect
                label="Contract Service Pillar"
                value={clientService}
                options={[
                  'AI Automation',
                  'Social Media Growth',
                  'Branding & Design',
                  'Paid Acquisition',
                  'Web Dev & SEO',
                ]}
                onChange={val => setClientService(val)}
              />

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Monthly Retainer Amount (PKR)
                </label>
                <input
                  type="number"
                  required
                  value={clientRetainer}
                  onChange={e => setClientRetainer(Number(e.target.value))}
                  className="w-full mt-1 bg-slate-50 dark:bg-[#181820] border border-slate-300 dark:border-[#2a2a36] focus:border-[#FFC700] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none"
                />
              </div>

              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 p-2.5 rounded-xl">
                ✓ Converts lead stage to <strong>Won</strong><br />
                ✓ Registers client under Finance & Clients directory<br />
                ✓ Automatically generates 1st month invoice (7-day due period)
              </p>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-[#23232c]">
                <button
                  type="button"
                  onClick={() => setLeadToConvert(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md cursor-pointer"
                >
                  Confirm & Onboard Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LEAD DETAILS DRAWER */}
      {activeLeadDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md h-full bg-white dark:bg-[#121217] border-l border-slate-200 dark:border-[#23232c] p-6 shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#23232c]">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Lead Details
                </span>
                <button
                  onClick={() => setActiveLeadDetails(null)}
                  className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white font-semibold cursor-pointer"
                >
                  Close ✕
                </button>
              </div>

              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  {activeLeadDetails.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {activeLeadDetails.company} {activeLeadDetails.jobTitle && `· ${activeLeadDetails.jobTitle}`}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <StatusBadge type="status" value={activeLeadDetails.status} />
                <StatusBadge type="temperature" value={activeLeadDetails.temperature} />
              </div>

              <div className="space-y-2 bg-slate-50 dark:bg-[#181820] p-3 rounded-xl text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Email:</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">{activeLeadDetails.email || 'None'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Phone:</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">{activeLeadDetails.phone || 'None'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Channel Source:</span>
                  <span className="font-semibold text-[#FFC700]">{activeLeadDetails.channel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Deal Value:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">PKR {(activeLeadDetails.estimatedValue || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Follow-up Target:</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">{activeLeadDetails.followUpDate}</span>
                </div>
              </div>

              {activeLeadDetails.linkedInUrl && (
                <a
                  href={activeLeadDetails.linkedInUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm"
                >
                  <span>Open LinkedIn Profile</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-[#23232c] flex gap-2">
              <button
                onClick={() => {
                  setLeadToConvert(activeLeadDetails);
                  setActiveLeadDetails(null);
                }}
                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Trophy className="w-3.5 h-3.5" />
                Convert to Won Client
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE GUARD MODAL */}
      {leadToDelete && (
        <DeleteGuardModal
          isOpen={!!leadToDelete}
          title="Delete Lead Record"
          message={`Are you sure you want to permanently remove lead "${leadToDelete.name}" (${leadToDelete.company}) from CRM?`}
          onConfirm={() => {
            deleteLead(leadToDelete.id);
            setLeadToDelete(null);
          }}
          onCancel={() => setLeadToDelete(null)}
        />
      )}
    </div>
  );
};
