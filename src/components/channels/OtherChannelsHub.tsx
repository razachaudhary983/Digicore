import React, { useState } from 'react';
import {
  Compass,
  MapPin,
  Mail,
  Share2,
  Globe,
  Plus,
  Trash2,
  Flame,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { Lead, LeadChannel, LeadTemperature, LeadStatus } from '../../types/crm';
import { StatusBadge } from '../common/StatusBadge';
import { CustomSelect } from '../common/CustomSelect';
import { DeleteGuardModal } from '../common/DeleteGuardModal';

export const OtherChannelsHub: React.FC = () => {
  const { leads, addLead, updateLead, deleteLead } = useCRM();

  const [activeChannel, setActiveChannel] = useState<string>('All');
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);

  const channelsList = [
    { id: 'All', label: 'All Channels', icon: Compass },
    { id: 'Google Maps', label: 'Google Maps (Local)', icon: MapPin },
    { id: 'Meta Ads', label: 'Meta Ads & Paid', icon: Share2 },
    { id: 'Cold Email', label: 'Cold Email & Outreach', icon: Mail },
    { id: 'Freelancer / Upwork', label: 'Freelancer / Upwork', icon: Globe },
    { id: 'Referral', label: 'Referrals & Partners', icon: Share2 },
  ];

  // Form State
  const [newLead, setNewLead] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    location: '',
    websiteAvailable: false,
    socialMediaAvailable: false,
    channel: 'Google Maps' as LeadChannel,
    temperature: 'Warm' as LeadTemperature,
    status: 'New' as LeadStatus,
    estimatedValue: 2500,
    followUpDate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const nonLinkedInLeads = leads.filter(l => l.channel !== 'LinkedIn');

  const filteredLeads = nonLinkedInLeads.filter(l =>
    activeChannel === 'All' ? true : l.channel === activeChannel
  );

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLead.name || !newLead.company) return;

    addLead(newLead);
    setShowAddLeadModal(false);
    setNewLead({
      name: '',
      company: '',
      email: '',
      phone: '',
      location: '',
      websiteAvailable: false,
      socialMediaAvailable: false,
      channel: 'Google Maps',
      temperature: 'Warm',
      status: 'New',
      estimatedValue: 2500,
      followUpDate: new Date().toISOString().split('T')[0],
      notes: '',
    });
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#FFC700]/15 text-[#FFC700] flex items-center justify-center font-bold">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              Other Acquisitions
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-[#FFC700]/15 text-amber-700 dark:text-[#FFC700] border border-[#FFC700]/30">
                Multi-Channel
              </span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Manage Google Maps local audits, cold email sequences, Meta campaigns, and referrals.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddLeadModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#FFC700] hover:bg-[#ffcf1a] text-black font-bold text-xs rounded-xl shadow-md shadow-[#FFC700]/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Channel Lead</span>
        </button>
      </div>

      {/* Channel Pills Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {channelsList.map(item => {
          const Icon = item.icon;
          const isSelected = activeChannel === item.id;
          const count = item.id === 'All' 
            ? nonLinkedInLeads.length 
            : nonLinkedInLeads.filter(l => l.channel === item.id).length;

          return (
            <button
              key={item.id}
              onClick={() => setActiveChannel(item.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                isSelected
                  ? 'bg-[#FFC700] text-black shadow-md shadow-[#FFC700]/20'
                  : 'bg-white dark:bg-[#121217] border border-slate-200 dark:border-[#23232c] text-slate-600 dark:text-slate-300 hover:border-[#FFC700]/50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                  isSelected ? 'bg-black/20 text-black' : 'bg-slate-100 dark:bg-[#1e1e28] text-slate-400'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Leads Table */}
      <div className="bg-white dark:bg-[#121217] border border-slate-200 dark:border-[#23232c] rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-[#181820] border-b border-slate-200 dark:border-[#23232c] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                <th className="p-3.5">Lead & Company</th>
                <th className="p-3.5">Channel Source</th>
                <th className="p-3.5">Contact Details</th>
                <th className="p-3.5">Temperature</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Deal Value</th>
                <th className="p-3.5">Audit / Notes</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#23232c]">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400 text-xs">
                    No leads found for this acquisition channel.
                  </td>
                </tr>
              ) : (
                filteredLeads.map(lead => (
                  <tr key={lead.id} className="hover:bg-slate-50 dark:hover:bg-[#181820]/60">
                    <td className="p-3.5">
                      <span className="font-bold text-slate-900 dark:text-white block">{lead.name}</span>
                      <span className="text-slate-400 text-[11px]">{lead.company}</span>
                    </td>

                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-[#1e1e28] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#2a2a36] font-semibold text-[11px]">
                        {lead.channel}
                      </span>
                    </td>

                    <td className="p-3.5 text-[11px]">
                      {lead.email && <div className="text-slate-700 dark:text-slate-300 font-mono">{lead.email}</div>}
                      {lead.phone && <div className="text-slate-500 dark:text-slate-400 font-mono">{lead.phone}</div>}
                      {lead.location && <div className="text-amber-500 text-[10px]">{lead.location}</div>}
                    </td>

                    <td className="p-3.5">
                      <StatusBadge type="temperature" value={lead.temperature} />
                    </td>

                    <td className="p-3.5">
                      <StatusBadge type="status" value={lead.status} />
                    </td>

                    <td className="p-3.5 font-mono font-bold text-slate-900 dark:text-white">
                      PKR {(lead.estimatedValue || 0).toLocaleString()}
                    </td>

                    <td className="p-3.5 max-w-xs text-slate-500 dark:text-slate-400 text-[11px]">
                      <p className="truncate" title={lead.notes}>{lead.notes || 'No audit notes'}</p>
                    </td>

                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => setLeadToDelete(lead)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg cursor-pointer"
                        title="Delete Lead"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: ADD CHANNEL LEAD */}
      {showAddLeadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white dark:bg-[#121217] border border-slate-200 dark:border-[#23232c] rounded-3xl p-6 shadow-2xl space-y-4 animate-in fade-in">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Compass className="w-5 h-5 text-[#FFC700]" />
              Add Acquisition Lead
            </h3>

            <form onSubmit={handleAddSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Name *</label>
                  <input
                    type="text"
                    required
                    value={newLead.name}
                    onChange={e => setNewLead({ ...newLead, name: e.target.value })}
                    placeholder="e.g. Tariq Mehmood"
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
                    placeholder="e.g. Greenline Logistics"
                    className="w-full mt-1 bg-slate-50 dark:bg-[#181820] border border-slate-300 dark:border-[#2a2a36] focus:border-[#FFC700] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <CustomSelect
                  label="Channel"
                  value={newLead.channel}
                  options={['Google Maps', 'Meta Ads', 'Cold Email', 'Freelancer / Upwork', 'Referral']}
                  onChange={val => setNewLead({ ...newLead, channel: val as LeadChannel })}
                />
                <CustomSelect
                  label="Temperature"
                  value={newLead.temperature}
                  options={['Hot', 'Warm', 'Cold']}
                  onChange={val => setNewLead({ ...newLead, temperature: val as LeadTemperature })}
                />
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Est. Value (PKR)</label>
                  <input
                    type="number"
                    value={newLead.estimatedValue}
                    onChange={e => setNewLead({ ...newLead, estimatedValue: Number(e.target.value) })}
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
                    placeholder="contact@company.com"
                    className="w-full mt-1 bg-slate-50 dark:bg-[#181820] border border-slate-300 dark:border-[#2a2a36] focus:border-[#FFC700] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Phone / WhatsApp</label>
                  <input
                    type="text"
                    value={newLead.phone}
                    onChange={e => setNewLead({ ...newLead, phone: e.target.value })}
                    placeholder="+92 or +1..."
                    className="w-full mt-1 bg-slate-50 dark:bg-[#181820] border border-slate-300 dark:border-[#2a2a36] focus:border-[#FFC700] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Location / City</label>
                <input
                  type="text"
                  value={newLead.location}
                  onChange={e => setNewLead({ ...newLead, location: e.target.value })}
                  placeholder="e.g. Lahore, Pakistan or London, UK"
                  className="w-full mt-1 bg-slate-50 dark:bg-[#181820] border border-slate-300 dark:border-[#2a2a36] focus:border-[#FFC700] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Audit / Proposal Notes</label>
                <textarea
                  rows={2}
                  value={newLead.notes}
                  onChange={e => setNewLead({ ...newLead, notes: e.target.value })}
                  placeholder="Missing SSL certificate, poor Meta ad creatives, website audit findings..."
                  className="w-full mt-1 bg-slate-50 dark:bg-[#181820] border border-slate-300 dark:border-[#2a2a36] focus:border-[#FFC700] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-[#23232c]">
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
                  Save Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {leadToDelete && (
        <DeleteGuardModal
          isOpen={!!leadToDelete}
          title="Delete Channel Lead"
          message={`Remove lead record for "${leadToDelete.name}" (${leadToDelete.company})?`}
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
