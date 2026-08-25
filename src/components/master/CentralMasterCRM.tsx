import React, { useState } from 'react';
import {
  KanbanSquare,
  Table as TableIcon,
  Filter,
  DollarSign,
  TrendingUp,
  Award,
  Trash2,
  CheckSquare,
  Square,
  UserCheck,
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { StatusBadge } from '../common/StatusBadge';
import { DeleteGuardModal } from '../common/DeleteGuardModal';
import { CustomSelect } from '../common/CustomSelect';
import { Lead, LeadStatus, LeadTemperature } from '../../types/crm';

const PIPELINE_STAGES: LeadStatus[] = [
  'New',
  'Qualified',
  'Meeting Booked',
  'Proposal Sent',
  'Won',
  'Lost',
];

export const CentralMasterCRM: React.FC = () => {
  const { leads, updateLead, deleteLead, bulkUpdateStatus, createClientFromWonLead } = useCRM();

  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [channelFilter, setChannelFilter] = useState<string>('All');
  const [tempFilter, setTempFilter] = useState<string>('All');
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  // Convert to Client Modal State
  const [wonConvertLead, setWonConvertLead] = useState<Lead | null>(null);
  const [convertService, setConvertService] = useState('Paid Acquisition');
  const [convertRetainer, setConvertRetainer] = useState(3500);

  // Filter application
  const filteredLeads = leads.filter(lead => {
    const matchesChannel = channelFilter === 'All' || lead.channel === channelFilter;
    const matchesTemp = tempFilter === 'All' || lead.temperature === tempFilter;
    return matchesChannel && matchesTemp;
  });

  // Calculate Pipeline Metrics
  const totalPipelineValue = filteredLeads.reduce((acc, l) => acc + l.estimatedValue, 0);
  const wonLeadsValue = filteredLeads
    .filter(l => l.status === 'Won')
    .reduce((acc, l) => acc + l.estimatedValue, 0);
  const activeDealsCount = filteredLeads.filter(
    l => l.status !== 'Won' && l.status !== 'Lost'
  ).length;

  // Bulk Selection Handlers
  const handleSelectAll = () => {
    if (selectedLeadIds.length === filteredLeads.length) {
      setSelectedLeadIds([]);
    } else {
      setSelectedLeadIds(filteredLeads.map(l => l.id));
    }
  };

  const toggleSelectLead = (id: string) => {
    setSelectedLeadIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleBulkStatusChange = (newStatus: LeadStatus) => {
    bulkUpdateStatus(selectedLeadIds, newStatus);
    setSelectedLeadIds([]);
  };

  const handleStageChange = (lead: Lead, newStatus: LeadStatus) => {
    updateLead(lead.id, { status: newStatus });
    if (newStatus === 'Won') {
      setWonConvertLead(lead);
      setConvertRetainer(lead.estimatedValue || 3000);
    }
  };

  const handleConfirmWonConversion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wonConvertLead) return;

    createClientFromWonLead(wonConvertLead, convertService, convertRetainer);
    setWonConvertLead(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Aggregated Pipeline Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Total Pipeline Value
            </span>
            <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2 font-mono">
            ${totalPipelineValue.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Aggregated across all inbound channels</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Active Negotiations
            </span>
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-bold text-amber-500 mt-2 font-mono">{activeDealsCount}</p>
          <p className="text-[11px] text-slate-400 mt-1">Leads in qualification & proposals</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Won Contracts Revenue
            </span>
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <Award className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-bold text-emerald-500 mt-2 font-mono">
            ${wonLeadsValue.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Successfully signed client value</p>
        </div>
      </div>

      {/* Control Bar: View Switcher, Filters & Bulk Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
        {/* Left: View Toggle & Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'kanban'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <KanbanSquare className="w-3.5 h-3.5" />
              Kanban Board
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              High-Density Table
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={channelFilter}
              onChange={e => setChannelFilter(e.target.value)}
              className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="All">All Channels</option>
              <option value="LinkedIn">LinkedIn</option>
              <option value="Google Maps">Google Maps</option>
              <option value="Meta Ads">Meta Ads</option>
              <option value="Cold Email">Cold Email</option>
              <option value="Freelancer / Upwork">Upwork / Freelance</option>
              <option value="Referral">Referral</option>
            </select>

            <select
              value={tempFilter}
              onChange={e => setTempFilter(e.target.value)}
              className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="All">All Temperatures</option>
              <option value="Hot">Hot 🔥</option>
              <option value="Warm">Warm ⚡</option>
              <option value="Cold">Cold ❄️</option>
            </select>
          </div>
        </div>

        {/* Right: Bulk Selection Actions Toolbar */}
        {selectedLeadIds.length > 0 && (
          <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/80 px-3 py-1.5 rounded-xl animate-in fade-in">
            <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-300">
              {selectedLeadIds.length} Selected
            </span>
            <div className="h-4 w-px bg-indigo-300 dark:bg-indigo-800 mx-1" />
            <span className="text-[11px] text-slate-500 dark:text-slate-400">Bulk Move:</span>
            <select
              onChange={e => {
                if (e.target.value) handleBulkStatusChange(e.target.value as LeadStatus);
              }}
              defaultValue=""
              className="text-xs bg-white dark:bg-slate-900 border border-indigo-300 dark:border-indigo-700 rounded-lg px-2 py-1 text-slate-800 dark:text-slate-200"
            >
              <option value="" disabled>
                Select Stage...
              </option>
              {PIPELINE_STAGES.map(stg => (
                <option key={stg} value={stg}>
                  {stg}
                </option>
              ))}
            </select>
            <button
              onClick={() => setSelectedLeadIds([])}
              className="text-xs text-slate-400 hover:text-slate-200 ml-1 cursor-pointer"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* View 1: KANBAN BOARD */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 items-start">
          {PIPELINE_STAGES.map(stage => {
            const stageLeads = filteredLeads.filter(l => l.status === stage);
            const stageTotal = stageLeads.reduce((acc, l) => acc + l.estimatedValue, 0);

            return (
              <div
                key={stage}
                className="bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-3 space-y-3 min-h-[500px]"
              >
                {/* Stage Column Header */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      {stage}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-mono">
                      ${stageTotal.toLocaleString()}
                    </span>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    {stageLeads.length}
                  </span>
                </div>

                {/* Cards Container */}
                <div className="space-y-2.5">
                  {stageLeads.map(lead => (
                    <div
                      key={lead.id}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 rounded-xl p-3.5 shadow-sm space-y-2.5 transition-all group"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">
                            {lead.company}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            {lead.name}
                          </p>
                        </div>
                        <StatusBadge type="temperature" value={lead.temperature} />
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-medium">
                          {lead.channel}
                        </span>
                        <span className="font-mono font-semibold text-slate-700 dark:text-slate-200">
                          ${lead.estimatedValue.toLocaleString()}
                        </span>
                      </div>

                      {/* Card Action Controls */}
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                        <select
                          value={lead.status}
                          onChange={e =>
                            handleStageChange(lead, e.target.value as LeadStatus)
                          }
                          className="text-[10px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-1.5 py-0.5 text-slate-700 dark:text-slate-300"
                        >
                          {PIPELINE_STAGES.map(s => (
                            <option key={s} value={s}>
                              Move: {s}
                            </option>
                          ))}
                        </select>

                        <button
                          onClick={() =>
                            setDeleteTarget({ id: lead.id, name: `${lead.name} (${lead.company})` })
                          }
                          className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 transition-opacity cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* View 2: HIGH-DENSITY TABLE */}
      {viewMode === 'table' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="p-3.5 w-10">
                    <button
                      onClick={handleSelectAll}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    >
                      {selectedLeadIds.length === filteredLeads.length && filteredLeads.length > 0 ? (
                        <CheckSquare className="w-4 h-4 text-indigo-500" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="p-3.5">Lead / Company</th>
                  <th className="p-3.5">Source Channel</th>
                  <th className="p-3.5">CRM Pipeline Stage</th>
                  <th className="p-3.5">Temperature</th>
                  <th className="p-3.5">Est. Value</th>
                  <th className="p-3.5">Follow-up</th>
                  <th className="p-3.5 text-right">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                {filteredLeads.map(lead => {
                  const isSelected = selectedLeadIds.includes(lead.id);

                  return (
                    <tr
                      key={lead.id}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                        isSelected ? 'bg-indigo-50/50 dark:bg-indigo-950/20' : ''
                      }`}
                    >
                      <td className="p-3.5">
                        <button
                          onClick={() => toggleSelectLead(lead.id)}
                          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-indigo-500" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                      <td className="p-3.5">
                        <div className="font-semibold text-slate-900 dark:text-white text-sm">
                          {lead.company}
                        </div>
                        <div className="text-slate-400 text-[11px]">
                          {lead.name} {lead.jobTitle ? `· ${lead.jobTitle}` : ''}
                        </div>
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                          {lead.channel}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <select
                          value={lead.status}
                          onChange={e =>
                            handleStageChange(lead, e.target.value as LeadStatus)
                          }
                          className="bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-indigo-500"
                        >
                          {PIPELINE_STAGES.map(s => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-3.5">
                        <StatusBadge type="temperature" value={lead.temperature} />
                      </td>
                      <td className="p-3.5 font-mono font-semibold text-slate-900 dark:text-slate-100">
                        ${lead.estimatedValue.toLocaleString()}
                      </td>
                      <td className="p-3.5 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                        {lead.followUpDate}
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() =>
                            setDeleteTarget({
                              id: lead.id,
                              name: `${lead.name} (${lead.company})`,
                            })
                          }
                          className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Won Deal -> Convert to Active Client Modal */}
      {wonConvertLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-emerald-500/40 rounded-2xl p-6 shadow-2xl space-y-4 animate-in fade-in">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  🎉 Deal Won: Convert to Active Client
                </h3>
                <p className="text-xs text-slate-400">
                  Automatically provisions client profile & generates 1st month invoice.
                </p>
              </div>
            </div>

            <form onSubmit={handleConfirmWonConversion} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Client / Company Name</label>
                <input
                  type="text"
                  disabled
                  value={`${wonConvertLead.company} (${wonConvertLead.name})`}
                  className="w-full mt-1 bg-slate-100 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-500 dark:text-slate-400 cursor-not-allowed"
                />
              </div>

              <CustomSelect
                label="Contract Service Pillar"
                value={convertService}
                options={[
                  'AI Automation',
                  'Social Media Growth',
                  'Branding & Design',
                  'Paid Acquisition',
                  'Web Dev & SEO',
                ]}
                onChange={val => setConvertService(val)}
              />

              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Monthly Retainer Amount ($) *</label>
                <input
                  type="number"
                  required
                  value={convertRetainer}
                  onChange={e => setConvertRetainer(Number(e.target.value))}
                  className="w-full mt-1 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setWonConvertLead(null)}
                  className="px-4 py-2 text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg cursor-pointer"
                >
                  Skip Onboarding
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-md cursor-pointer"
                >
                  Create Client & Generate Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Guard Modal */}
      <DeleteGuardModal
        isOpen={!!deleteTarget}
        title="Delete CRM Lead Record"
        itemName={deleteTarget?.name || ''}
        impactDetails={[
          'Removes this lead from the pipeline.',
          'Clears any pending follow-up or comment tasks.',
          'Updates aggregate pipeline values automatically.',
        ]}
        onConfirm={() => {
          if (deleteTarget) {
            deleteLead(deleteTarget.id);
            setDeleteTarget(null);
          }
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
