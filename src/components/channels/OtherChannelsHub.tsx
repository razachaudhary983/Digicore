import React, { useState } from 'react';
import { MapPin, Plus, Phone, Mail, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { StatusBadge } from '../common/StatusBadge';
import { CustomSelect } from '../common/CustomSelect';
import { DeleteGuardModal } from '../common/DeleteGuardModal';
import { LeadChannel, LeadStatus, LeadTemperature } from '../../types/crm';

export const OtherChannelsHub: React.FC = () => {
  const { leads, addLead, deleteLead } = useCRM();
  const nonLinkedInLeads = leads.filter(l => l.channel !== 'LinkedIn');

  const [selectedChannelFilter, setSelectedChannelFilter] = useState<string>('All');
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newLead, setNewLead] = useState({
    name: '',
    company: '',
    channel: 'Google Maps' as LeadChannel,
    phone: '',
    email: '',
    location: 'Lahore, Pakistan',
    websiteAvailable: true,
    socialMediaAvailable: false,
    temperature: 'Warm' as LeadTemperature,
    status: 'New' as LeadStatus,
    estimatedValue: 2000,
    followUpDate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const filteredList =
    selectedChannelFilter === 'All'
      ? nonLinkedInLeads
      : nonLinkedInLeads.filter(l => l.channel === selectedChannelFilter);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLead.name || !newLead.company) return;

    addLead({
      ...newLead,
    });

    setShowCreateModal(false);
    setNewLead({
      name: '',
      company: '',
      channel: 'Google Maps',
      phone: '',
      email: '',
      location: 'Lahore, Pakistan',
      websiteAvailable: true,
      socialMediaAvailable: false,
      temperature: 'Warm',
      status: 'New',
      estimatedValue: 2000,
      followUpDate: new Date().toISOString().split('T')[0],
      notes: '',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border border-emerald-800/40 rounded-2xl p-6 shadow-md">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              Local & Multi-Channel Lead Acquisition
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              Google Maps Scraping, Meta Ads inbound, Cold Sequences, Upwork/Freelance & Referrals.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-semibold text-xs rounded-xl shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition-all self-start md:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          + Log Local / Channel Lead
        </button>
      </div>

      {/* Channel Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['All', 'Google Maps', 'Meta Ads', 'Cold Email', 'Freelancer / Upwork', 'Referral'].map(
          ch => (
            <button
              key={ch}
              onClick={() => setSelectedChannelFilter(ch)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                selectedChannelFilter === ch
                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                  : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {ch}
            </button>
          )
        )}
      </div>

      {/* Leads Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                <th className="p-3.5">Business / Lead</th>
                <th className="p-3.5">Source Channel</th>
                <th className="p-3.5">Website?</th>
                <th className="p-3.5">Socials?</th>
                <th className="p-3.5">Location</th>
                <th className="p-3.5">Stage</th>
                <th className="p-3.5">Est. Value</th>
                <th className="p-3.5">Actions</th>
                <th className="p-3.5 text-right">Delete</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
              {filteredList.map(lead => (
                <tr
                  key={lead.id}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="p-3.5">
                    <div className="font-semibold text-slate-900 dark:text-white text-sm">
                      {lead.company}
                    </div>
                    <div className="text-slate-400 text-[11px]">POC: {lead.name}</div>
                  </td>
                  <td className="p-3.5">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      {lead.channel}
                    </span>
                  </td>
                  <td className="p-3.5">
                    {lead.websiteAvailable ? (
                      <span className="flex items-center gap-1 text-emerald-500 font-medium">
                        <CheckCircle className="w-3.5 h-3.5" /> Yes
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-rose-500 font-medium">
                        <XCircle className="w-3.5 h-3.5" /> Missing
                      </span>
                    )}
                  </td>
                  <td className="p-3.5">
                    {lead.socialMediaAvailable ? (
                      <span className="flex items-center gap-1 text-emerald-500 font-medium">
                        <CheckCircle className="w-3.5 h-3.5" /> Yes
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-amber-500 font-medium">
                        <XCircle className="w-3.5 h-3.5" /> No Socials
                      </span>
                    )}
                  </td>
                  <td className="p-3.5 text-slate-600 dark:text-slate-300">
                    {lead.location || 'N/A'}
                  </td>
                  <td className="p-3.5">
                    <StatusBadge type="status" value={lead.status} />
                  </td>
                  <td className="p-3.5 font-mono font-semibold text-slate-900 dark:text-slate-100">
                    ${lead.estimatedValue.toLocaleString()}
                  </td>
                  <td className="p-3.5">
                    <div className="flex items-center gap-2">
                      {lead.phone && (
                        <a
                          href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {lead.email && (
                        <a
                          href={`mailto:${lead.email}`}
                          className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20"
                        >
                          <Mail className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => setDeleteTarget({ id: lead.id, name: lead.company })}
                      className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Direct Add Lead Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-emerald-500/40 rounded-2xl p-6 shadow-2xl space-y-4 animate-in fade-in">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Log Lead from Local / Other Channels
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Business Name *</label>
                  <input
                    type="text"
                    required
                    value={newLead.company}
                    onChange={e => setNewLead({ ...newLead, company: e.target.value })}
                    className="w-full mt-1 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Contact Person Name *</label>
                  <input
                    type="text"
                    required
                    value={newLead.name}
                    onChange={e => setNewLead({ ...newLead, name: e.target.value })}
                    className="w-full mt-1 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Phone / WhatsApp</label>
                  <input
                    type="text"
                    value={newLead.phone}
                    onChange={e => setNewLead({ ...newLead, phone: e.target.value })}
                    placeholder="+92 or +1..."
                    className="w-full mt-1 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Email Address</label>
                  <input
                    type="email"
                    value={newLead.email}
                    onChange={e => setNewLead({ ...newLead, email: e.target.value })}
                    placeholder="contact@business.com"
                    className="w-full mt-1 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <CustomSelect
                  label="Channel Source"
                  value={newLead.channel}
                  options={['Google Maps', 'Meta Ads', 'Cold Email', 'Freelancer / Upwork', 'Referral']}
                  onChange={val => setNewLead({ ...newLead, channel: val as LeadChannel })}
                />
                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Location / City</label>
                  <input
                    type="text"
                    value={newLead.location}
                    onChange={e => setNewLead({ ...newLead, location: e.target.value })}
                    className="w-full mt-1 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 pt-4">
                  <input
                    type="checkbox"
                    id="webCheck"
                    checked={newLead.websiteAvailable}
                    onChange={e => setNewLead({ ...newLead, websiteAvailable: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <label htmlFor="webCheck" className="text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                    Website Already Exists
                  </label>
                </div>

                <div className="flex items-center gap-2 pt-4">
                  <input
                    type="checkbox"
                    id="socCheck"
                    checked={newLead.socialMediaAvailable}
                    onChange={e => setNewLead({ ...newLead, socialMediaAvailable: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <label htmlFor="socCheck" className="text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                    Social Media Pages Exist
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-md cursor-pointer"
                >
                  Save & Sync to Global CRM
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Guard */}
      <DeleteGuardModal
        isOpen={!!deleteTarget}
        title="Delete Channel Lead"
        itemName={deleteTarget?.name || ''}
        impactDetails={[
          'Lead will be permanently purged from Master CRM.',
          'Any follow-up tasks linked will be discarded.',
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
