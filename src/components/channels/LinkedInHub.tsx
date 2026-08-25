import React, { useState } from 'react';
import {
  Linkedin,
  UserPlus,
  ExternalLink,
  Phone,
  Mail,
  Trash2,
  MessageSquare,
  ArrowUpRight,
  Check,
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { StatusBadge } from '../common/StatusBadge';
import { CustomSelect } from '../common/CustomSelect';
import { DeleteGuardModal } from '../common/DeleteGuardModal';
import { ConnectionStatus, LeadStatus, LeadTemperature } from '../../types/crm';

export const LinkedInHub: React.FC = () => {
  const { leads, comments, addLead, updateLead, deleteLead, toggleCommentStatus, addCommentTask } = useCRM();
  const linkedInLeads = leads.filter(l => l.channel === 'LinkedIn');

  const [activeTab, setActiveTab] = useState<'leads' | 'comments'>('leads');
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  // New Lead Form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newLead, setNewLead] = useState({
    name: '',
    company: '',
    jobTitle: '',
    linkedInUrl: '',
    email: '',
    phone: '',
    connectionStatus: 'Not Connected' as ConnectionStatus,
    temperature: 'Warm' as LeadTemperature,
    status: 'New' as LeadStatus,
    estimatedValue: 3500,
    followUpDate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  // New Comment state
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [newComment, setNewComment] = useState({
    leadName: '',
    postUrl: '',
    dueDate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLead.name || !newLead.company) return;

    addLead({
      ...newLead,
      channel: 'LinkedIn',
    });

    setShowAddForm(false);
    setNewLead({
      name: '',
      company: '',
      jobTitle: '',
      linkedInUrl: '',
      email: '',
      phone: '',
      connectionStatus: 'Not Connected',
      temperature: 'Warm',
      status: 'New',
      estimatedValue: 3500,
      followUpDate: new Date().toISOString().split('T')[0],
      notes: '',
    });
  };

  const handleCreateComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.leadName || !newComment.postUrl) return;
    addCommentTask({
      leadName: newComment.leadName,
      postUrl: newComment.postUrl,
      dueDate: newComment.dueDate,
      status: 'Pending',
      notes: newComment.notes,
    });
    setShowCommentModal(false);
    setNewComment({
      leadName: '',
      postUrl: '',
      dueDate: new Date().toISOString().split('T')[0],
      notes: '',
    });
  };

  return (
    <div className="space-y-6">
      {/* Channel Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-sky-950 via-slate-900 to-indigo-950 border border-sky-800/40 rounded-2xl p-6 shadow-md">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-sky-600/20 border border-sky-500/30 flex items-center justify-center text-sky-400">
            <Linkedin className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              LinkedIn Outreach Hub
              <span className="text-xs px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
                Primary Data Source
              </span>
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              Source of truth for professional networking, profile engagement sequences, and DM outreach.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2.5 bg-sky-600 hover:bg-sky-500 active:scale-95 text-white font-semibold text-xs rounded-xl shadow-lg shadow-sky-600/30 flex items-center gap-2 transition-all self-start md:self-auto cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          + Add LinkedIn Lead
        </button>
      </div>

      {/* Workspace Sub-Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('leads')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === 'leads'
                ? 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Profile Tracker ({linkedInLeads.length})
          </button>
          <button
            onClick={() => setActiveTab('comments')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === 'comments'
                ? 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Engagement Sequences ({comments.length})
          </button>
        </div>

        {activeTab === 'comments' && (
          <button
            onClick={() => setShowCommentModal(true)}
            className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            + New Comment Task
          </button>
        )}
      </div>

      {/* New Lead Drawer / Modal */}
      {showAddForm && (
        <div className="bg-white dark:bg-slate-900 border border-sky-500/40 rounded-2xl p-6 shadow-xl space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Linkedin className="w-5 h-5 text-sky-500" />
              Direct Entry: New LinkedIn Lead
            </h3>
            <button
              onClick={() => setShowAddForm(false)}
              className="text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleCreateLead} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Lead Full Name *</label>
              <input
                type="text"
                required
                value={newLead.name}
                onChange={e => setNewLead({ ...newLead, name: e.target.value })}
                placeholder="e.g. Rachel Adams"
                className="w-full mt-1 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Company Name *</label>
              <input
                type="text"
                required
                value={newLead.company}
                onChange={e => setNewLead({ ...newLead, company: e.target.value })}
                placeholder="e.g. FinScale Inc"
                className="w-full mt-1 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Job Title / Role</label>
              <input
                type="text"
                value={newLead.jobTitle}
                onChange={e => setNewLead({ ...newLead, jobTitle: e.target.value })}
                placeholder="e.g. Chief Marketing Officer"
                className="w-full mt-1 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">LinkedIn Profile URL</label>
              <input
                type="url"
                value={newLead.linkedInUrl}
                onChange={e => setNewLead({ ...newLead, linkedInUrl: e.target.value })}
                placeholder="https://linkedin.com/in/..."
                className="w-full mt-1 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>

            <CustomSelect
              label="Connection Status"
              value={newLead.connectionStatus}
              options={['Not Connected', 'Connection Requested', 'Connected', 'Accepted', 'Rejected']}
              onChange={val => setNewLead({ ...newLead, connectionStatus: val as ConnectionStatus })}
            />

            <CustomSelect
              label="Temperature"
              value={newLead.temperature}
              options={['Hot', 'Warm', 'Cold']}
              onChange={val => setNewLead({ ...newLead, temperature: val as LeadTemperature })}
            />

            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Target Value ($)</label>
              <input
                type="number"
                value={newLead.estimatedValue}
                onChange={e => setNewLead({ ...newLead, estimatedValue: Number(e.target.value) })}
                className="w-full mt-1 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Next Follow-up Date</label>
              <input
                type="date"
                value={newLead.followUpDate}
                onChange={e => setNewLead({ ...newLead, followUpDate: e.target.value })}
                className="w-full mt-1 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>

            <div className="flex items-end justify-end">
              <button
                type="submit"
                className="w-full py-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs rounded-lg shadow-md cursor-pointer"
              >
                Save & Auto-Sync to Master CRM
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main Table: Profile Tracker */}
      {activeTab === 'leads' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="p-3.5">Lead Profile</th>
                  <th className="p-3.5">Company & Role</th>
                  <th className="p-3.5">Connection Status</th>
                  <th className="p-3.5">CRM Stage</th>
                  <th className="p-3.5">Temperature</th>
                  <th className="p-3.5">Est. Value</th>
                  <th className="p-3.5">Quick Actions</th>
                  <th className="p-3.5 text-right">Options</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                {linkedInLeads.map(lead => (
                  <tr
                    key={lead.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group"
                  >
                    <td className="p-3.5">
                      <div className="font-semibold text-slate-900 dark:text-white text-sm">
                        {lead.name}
                      </div>
                      {lead.linkedInUrl && (
                        <a
                          href={lead.linkedInUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sky-500 hover:underline flex items-center gap-1 text-[11px] mt-0.5"
                        >
                          LinkedIn Profile <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </td>
                    <td className="p-3.5">
                      <div className="font-medium text-slate-800 dark:text-slate-200">{lead.company}</div>
                      <div className="text-slate-400 text-[11px]">{lead.jobTitle || 'Decision Maker'}</div>
                    </td>
                    <td className="p-3.5">
                      <select
                        value={lead.connectionStatus || 'Not Connected'}
                        onChange={e =>
                          updateLead(lead.id, { connectionStatus: e.target.value as ConnectionStatus })
                        }
                        className="bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-sky-500"
                      >
                        <option value="Not Connected">Not Connected</option>
                        <option value="Connection Requested">Connection Requested</option>
                        <option value="Connected">Connected</option>
                        <option value="Accepted">Accepted</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </td>
                    <td className="p-3.5">
                      <StatusBadge type="status" value={lead.status} />
                    </td>
                    <td className="p-3.5">
                      <StatusBadge type="temperature" value={lead.temperature} />
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
                            title="Open WhatsApp"
                            className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>
                        )}
                        {lead.email && (
                          <a
                            href={`mailto:${lead.email}`}
                            title="Send Email"
                            className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20"
                          >
                            <Mail className="w-3.5 h-3.5" />
                          </a>
                        )}
                        {lead.linkedInUrl && (
                          <a
                            href={lead.linkedInUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Open LinkedIn"
                            className="p-1.5 rounded-lg bg-sky-500/10 text-sky-500 hover:bg-sky-500/20"
                          >
                            <Linkedin className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => setDeleteTarget({ id: lead.id, name: lead.name })}
                        className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                        title="Delete Lead"
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
      )}

      {/* Engagement Sequences Tab */}
      {activeTab === 'comments' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {comments.map(c => (
            <div
              key={c.id}
              className={`p-4 rounded-2xl border transition-all ${
                c.status === 'Completed'
                  ? 'bg-slate-100/70 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 opacity-75'
                  : 'bg-white dark:bg-slate-900 border-sky-200 dark:border-sky-900/60 shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {c.leadName}
                  </h4>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">Target: {c.dueDate}</p>
                </div>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                    c.status === 'Completed'
                      ? 'bg-emerald-500/20 text-emerald-500'
                      : 'bg-amber-500/20 text-amber-500'
                  }`}
                >
                  {c.status}
                </span>
              </div>

              {c.notes && (
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800">
                  {c.notes}
                </p>
              )}

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <a
                  href={c.postUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-sky-500 hover:underline flex items-center gap-1 font-medium"
                >
                  Open Post <ArrowUpRight className="w-3.5 h-3.5" />
                </a>

                <button
                  onClick={() => toggleCommentStatus(c.id)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                    c.status === 'Completed'
                      ? 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      : 'bg-sky-600 text-white hover:bg-sky-700'
                  }`}
                >
                  <Check className="w-3 h-3" />
                  {c.status === 'Completed' ? 'Completed' : 'Mark Done'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Comment Modal */}
      {showCommentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-sky-500/40 rounded-2xl p-6 shadow-2xl space-y-4 animate-in fade-in">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Log LinkedIn Engagement / Comment Task
            </h3>
            <form onSubmit={handleCreateComment} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Lead / Profile Name *</label>
                <input
                  type="text"
                  required
                  value={newComment.leadName}
                  onChange={e => setNewComment({ ...newComment, leadName: e.target.value })}
                  placeholder="e.g. Marc Andreessen"
                  className="w-full mt-1 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Post URL Link *</label>
                <input
                  type="url"
                  required
                  value={newComment.postUrl}
                  onChange={e => setNewComment({ ...newComment, postUrl: e.target.value })}
                  placeholder="https://linkedin.com/posts/..."
                  className="w-full mt-1 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Target Date</label>
                <input
                  type="date"
                  value={newComment.dueDate}
                  onChange={e => setNewComment({ ...newComment, dueDate: e.target.value })}
                  className="w-full mt-1 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Talking Points / Strategy</label>
                <textarea
                  value={newComment.notes}
                  onChange={e => setNewComment({ ...newComment, notes: e.target.value })}
                  placeholder="e.g. Validate their point on outbound AI agents and mention agency case study"
                  rows={3}
                  className="w-full mt-1 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCommentModal(false)}
                  className="px-4 py-2 text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white rounded-lg shadow-md cursor-pointer"
                >
                  Save Engagement Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deletion Warning Guard */}
      <DeleteGuardModal
        isOpen={!!deleteTarget}
        title="Delete LinkedIn Lead Record"
        itemName={deleteTarget?.name || ''}
        impactDetails={[
          'Removes this lead from the Central Master CRM Aggregator.',
          'Deletes all associated follow-ups, calls, and comments from the Daily Action Center.',
          'Pipeline revenue statistics will be recalculated immediately.',
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
