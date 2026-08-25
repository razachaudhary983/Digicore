import React, { useState } from 'react';
import {
  Linkedin,
  Plus,
  ExternalLink,
  CheckCircle2,
  Trash2,
  UserCheck,
  Flame,
  Search,
  Check,
  UserPlus,
  Skull,
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { LinkedInCommentTask, LeadTemperature, LeadStatus } from '../../types/crm';
import { StatusBadge } from '../common/StatusBadge';
import { CustomSelect } from '../common/CustomSelect';
import { DeleteGuardModal } from '../common/DeleteGuardModal';

export const LinkedInHub: React.FC = () => {
  const {
    leads,
    comments,
    addLead,
    addCommentTask,
    toggleCommentStatus,
    convertCommentToLead,
    markCommentDead,
    deleteCommentTask,
  } = useCRM();

  const [activeSubTab, setActiveSubTab] = useState<'leads' | 'comments'>('comments');
  const [searchQuery, setSearchQuery] = useState('');
  const [commentToDelete, setCommentToDelete] = useState<LinkedInCommentTask | null>(null);
  const [commentToConvert, setCommentToConvert] = useState<LinkedInCommentTask | null>(null);

  // New Comment Form
  const [showAddComment, setShowAddComment] = useState(false);
  const [newComment, setNewComment] = useState({
    leadName: '',
    profileUrl: '',
    postUrl: '',
    company: '',
    dueDate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  // Convert to lead form
  const [convertTemp, setConvertTemp] = useState<LeadTemperature>('Hot');
  const [convertStatus, setConvertStatus] = useState<LeadStatus>('Qualified');
  const [convertValue, setConvertValue] = useState(3500);

  const linkedInLeads = leads.filter(l => l.channel === 'LinkedIn');

  const filteredComments = comments.filter(c =>
    c.leadName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.company && c.company.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (c.notes && c.notes.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleAddCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.leadName || !newComment.profileUrl) return;

    addCommentTask({
      leadName: newComment.leadName,
      profileUrl: newComment.profileUrl,
      postUrl: newComment.postUrl || undefined,
      company: newComment.company || `${newComment.leadName}'s Org`,
      dueDate: newComment.dueDate,
      status: 'Pending',
      pipelineStatus: 'Pending',
      notes: newComment.notes,
    });

    setShowAddComment(false);
    setNewComment({
      leadName: '',
      profileUrl: '',
      postUrl: '',
      company: '',
      dueDate: new Date().toISOString().split('T')[0],
      notes: '',
    });
  };

  const handleConvertLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentToConvert) return;
    convertCommentToLead(commentToConvert.id, {
      temperature: convertTemp,
      status: convertStatus,
      estimatedValue: convertValue,
    });
    setCommentToConvert(null);
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-sky-500/15 text-sky-500 flex items-center justify-center font-bold">
            <Linkedin className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              LinkedIn Outreach
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-[#FFC700]/15 text-amber-700 dark:text-[#FFC700] border border-[#FFC700]/30">
                Direct Pipeline
              </span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Log comments, open prospect profiles directly, and convert warm conversations into CRM leads.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Sub Tab Switcher */}
          <div className="flex bg-slate-100 dark:bg-[#181820] p-1 rounded-xl border border-slate-200 dark:border-[#2a2a36]">
            <button
              onClick={() => setActiveSubTab('comments')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeSubTab === 'comments'
                  ? 'bg-white dark:bg-[#23232f] text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Comment Pipeline ({comments.length})
            </button>
            <button
              onClick={() => setActiveSubTab('leads')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeSubTab === 'leads'
                  ? 'bg-white dark:bg-[#23232f] text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              LinkedIn Leads ({linkedInLeads.length})
            </button>
          </div>

          <button
            onClick={() => setShowAddComment(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#FFC700] hover:bg-[#ffcf1a] text-black font-bold text-xs rounded-xl shadow-md shadow-[#FFC700]/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Log Comment Prospect</span>
          </button>
        </div>
      </div>

      {/* Search & Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#121217] border border-slate-200 dark:border-[#23232c] p-4 rounded-2xl flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-500">
            <Linkedin className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Total Comment Queue</p>
            <p className="text-lg font-black text-slate-900 dark:text-white">{comments.length} Prospects</p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#121217] border border-slate-200 dark:border-[#23232c] p-4 rounded-2xl flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Converted to Leads</p>
            <p className="text-lg font-black text-slate-900 dark:text-white">
              {comments.filter(c => c.pipelineStatus === 'Converted to Lead').length} Closed
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#121217] border border-slate-200 dark:border-[#23232c] p-4 rounded-2xl flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#FFC700]/15 text-[#FFC700]">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Hot LinkedIn Deals</p>
            <p className="text-lg font-black text-slate-900 dark:text-white">
              {linkedInLeads.filter(l => l.temperature === 'Hot').length} Hot Leads
            </p>
          </div>
        </div>
      </div>

      {/* TAB 1: COMMENT PIPELINE */}
      {activeSubTab === 'comments' && (
        <div className="bg-white dark:bg-[#121217] border border-slate-200 dark:border-[#23232c] rounded-2xl overflow-hidden shadow-sm space-y-3">
          <div className="p-4 border-b border-slate-100 dark:border-[#23232c] flex items-center justify-between">
            <div className="relative w-full max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search prospect or company..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#181820] border border-slate-200 dark:border-[#2a2a36] rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-white outline-none focus:border-[#FFC700]"
              />
            </div>
            <span className="text-xs font-semibold text-slate-400">
              {filteredComments.length} items
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-[#181820] border-b border-slate-200 dark:border-[#23232c] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                  <th className="p-3.5 w-10 text-center">Status</th>
                  <th className="p-3.5">Prospect & Company</th>
                  <th className="p-3.5">Profile Link (Direct)</th>
                  <th className="p-3.5">Pipeline Stage</th>
                  <th className="p-3.5">Due Date</th>
                  <th className="p-3.5">Talking Points / Notes</th>
                  <th className="p-3.5 text-right">Pipeline Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#23232c]">
                {filteredComments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400 text-xs">
                      No LinkedIn comment tasks found. Log a new prospect to get started.
                    </td>
                  </tr>
                ) : (
                  filteredComments.map(comment => {
                    const isCompleted = comment.status === 'Completed';
                    const isConverted = comment.pipelineStatus === 'Converted to Lead';
                    const isDead = comment.pipelineStatus === 'Dead';

                    return (
                      <tr
                        key={comment.id}
                        className={`hover:bg-slate-50 dark:hover:bg-[#181820]/60 transition-colors ${
                          isDead ? 'opacity-50' : ''
                        }`}
                      >
                        {/* Status Toggle Checkbox */}
                        <td className="p-3.5 text-center">
                          <button
                            onClick={() => toggleCommentStatus(comment.id)}
                            className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all cursor-pointer ${
                              isCompleted
                                ? 'bg-emerald-500 border-emerald-500 text-white'
                                : 'border-slate-300 dark:border-[#2a2a36] hover:border-emerald-500'
                            }`}
                            title={isCompleted ? 'Mark Pending' : 'Mark Commented'}
                          >
                            {isCompleted && <Check className="w-3.5 h-3.5" />}
                          </button>
                        </td>

                        {/* Prospect & Company */}
                        <td className="p-3.5">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-900 dark:text-white">
                              {comment.leadName}
                            </span>
                            <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                              {comment.company || 'Organization'}
                            </span>
                          </div>
                        </td>

                        {/* Profile Link (Replacing Post Link) */}
                        <td className="p-3.5">
                          <a
                            href={comment.profileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 border border-sky-500/30 text-xs font-semibold transition-all group"
                          >
                            <Linkedin className="w-3.5 h-3.5 text-sky-500" />
                            <span>Profile Link</span>
                            <ExternalLink className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                          </a>
                        </td>

                        {/* Pipeline Stage */}
                        <td className="p-3.5">
                          {isConverted ? (
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                              Converted to Lead
                            </span>
                          ) : isDead ? (
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/15 text-rose-500 border border-rose-500/30">
                              Dead / Inactive
                            </span>
                          ) : isCompleted ? (
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-500/15 text-sky-400 border border-sky-500/30">
                              Commented
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                              Pending Log
                            </span>
                          )}
                        </td>

                        {/* Due Date */}
                        <td className="p-3.5 font-mono text-slate-500 dark:text-slate-400">
                          {comment.dueDate}
                        </td>

                        {/* Notes */}
                        <td className="p-3.5 max-w-xs text-slate-600 dark:text-slate-300">
                          <p className="truncate" title={comment.notes}>
                            {comment.notes || '—'}
                          </p>
                        </td>

                        {/* Pipeline Actions */}
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {!isConverted && !isDead && (
                              <>
                                <button
                                  onClick={() => setCommentToConvert(comment)}
                                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1 cursor-pointer"
                                  title="Convert to Master CRM Lead"
                                >
                                  <UserPlus className="w-3.5 h-3.5" />
                                  <span>Convert to Lead</span>
                                </button>

                                <button
                                  onClick={() => markCommentDead(comment.id)}
                                  className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg cursor-pointer"
                                  title="Mark as Dead"
                                >
                                  <Skull className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}

                            <button
                              onClick={() => setCommentToDelete(comment)}
                              className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg cursor-pointer"
                              title="Delete Record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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

      {/* TAB 2: LINKEDIN LEADS VIEW */}
      {activeSubTab === 'leads' && (
        <div className="bg-white dark:bg-[#121217] border border-slate-200 dark:border-[#23232c] rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-[#181820] border-b border-slate-200 dark:border-[#23232c] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                  <th className="p-3.5">Lead & Org</th>
                  <th className="p-3.5">Profile</th>
                  <th className="p-3.5">Connection</th>
                  <th className="p-3.5">Temperature</th>
                  <th className="p-3.5">Stage</th>
                  <th className="p-3.5">Est. Value</th>
                  <th className="p-3.5">Follow-up</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#23232c]">
                {linkedInLeads.map(lead => (
                  <tr key={lead.id} className="hover:bg-slate-50 dark:hover:bg-[#181820]/60">
                    <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                      {lead.name}
                      <span className="block text-slate-400 font-normal text-[11px]">{lead.company}</span>
                    </td>
                    <td className="p-3.5">
                      {lead.linkedInUrl ? (
                        <a
                          href={lead.linkedInUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sky-500 hover:underline flex items-center gap-1 font-semibold"
                        >
                          View Profile <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="p-3.5">
                      <StatusBadge type="connection" value={lead.connectionStatus || 'Not Connected'} />
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
                    <td className="p-3.5 font-mono text-slate-400">
                      {lead.followUpDate || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: ADD COMMENT PROSPECT */}
      {showAddComment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white dark:bg-[#121217] border border-slate-200 dark:border-[#23232c] rounded-3xl p-6 shadow-2xl space-y-4 animate-in fade-in">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Linkedin className="w-5 h-5 text-sky-500" />
              Log LinkedIn Comment Prospect
            </h3>

            <form onSubmit={handleAddCommentSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Prospect Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newComment.leadName}
                    onChange={e => setNewComment({ ...newComment, leadName: e.target.value })}
                    placeholder="e.g. Jason Fried"
                    className="w-full mt-1 bg-slate-50 dark:bg-[#181820] border border-slate-300 dark:border-[#2a2a36] focus:border-[#FFC700] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Company / Brand
                  </label>
                  <input
                    type="text"
                    value={newComment.company}
                    onChange={e => setNewComment({ ...newComment, company: e.target.value })}
                    placeholder="e.g. 37signals"
                    className="w-full mt-1 bg-slate-50 dark:bg-[#181820] border border-slate-300 dark:border-[#2a2a36] focus:border-[#FFC700] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Profile Link URL * (Direct Link)
                </label>
                <input
                  type="url"
                  required
                  value={newComment.profileUrl}
                  onChange={e => setNewComment({ ...newComment, profileUrl: e.target.value })}
                  placeholder="https://www.linkedin.com/in/prospect-profile"
                  className="w-full mt-1 bg-slate-50 dark:bg-[#181820] border border-slate-300 dark:border-[#2a2a36] focus:border-[#FFC700] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Target Post Link (Optional)
                </label>
                <input
                  type="url"
                  value={newComment.postUrl}
                  onChange={e => setNewComment({ ...newComment, postUrl: e.target.value })}
                  placeholder="https://www.linkedin.com/posts/..."
                  className="w-full mt-1 bg-slate-50 dark:bg-[#181820] border border-slate-300 dark:border-[#2a2a36] focus:border-[#FFC700] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Scheduled Comment Date
                </label>
                <input
                  type="date"
                  value={newComment.dueDate}
                  onChange={e => setNewComment({ ...newComment, dueDate: e.target.value })}
                  className="w-full mt-1 bg-slate-50 dark:bg-[#181820] border border-slate-300 dark:border-[#2a2a36] focus:border-[#FFC700] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Talking Points / Engagement Strategy
                </label>
                <textarea
                  rows={2}
                  value={newComment.notes}
                  onChange={e => setNewComment({ ...newComment, notes: e.target.value })}
                  placeholder="Discuss their expansion into enterprise AI..."
                  className="w-full mt-1 bg-slate-50 dark:bg-[#181820] border border-slate-300 dark:border-[#2a2a36] focus:border-[#FFC700] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-[#23232c]">
                <button
                  type="button"
                  onClick={() => setShowAddComment(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-[#FFC700] hover:bg-[#ffcf1a] text-black rounded-xl shadow-md cursor-pointer"
                >
                  Save Prospect
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CONVERT COMMENT TO MASTER CRM LEAD */}
      {commentToConvert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-[#121217] border border-[#FFC700]/40 rounded-3xl p-6 shadow-2xl space-y-4 animate-in fade-in">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#FFC700]/15 text-[#FFC700] flex items-center justify-center">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Convert to Master CRM Lead
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {commentToConvert.leadName} ({commentToConvert.company || 'LinkedIn Prospect'})
                </p>
              </div>
            </div>

            <form onSubmit={handleConvertLeadSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <CustomSelect
                  label="Temperature"
                  value={convertTemp}
                  options={['Hot', 'Warm', 'Cold']}
                  onChange={val => setConvertTemp(val as LeadTemperature)}
                />
                <CustomSelect
                  label="Initial Stage"
                  value={convertStatus}
                  options={['Qualified', 'Meeting Booked', 'Proposal Sent', 'New']}
                  onChange={val => setConvertStatus(val as LeadStatus)}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Estimated Deal Value (PKR)
                </label>
                <input
                  type="number"
                  required
                  value={convertValue}
                  onChange={e => setConvertValue(Number(e.target.value))}
                  className="w-full mt-1 bg-slate-50 dark:bg-[#181820] border border-slate-300 dark:border-[#2a2a36] focus:border-[#FFC700] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-[#23232c]">
                <button
                  type="button"
                  onClick={() => setCommentToConvert(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-[#FFC700] hover:bg-[#ffcf1a] text-black rounded-xl shadow-md cursor-pointer"
                >
                  Convert to Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE GUARD */}
      {commentToDelete && (
        <DeleteGuardModal
          isOpen={!!commentToDelete}
          title="Delete Comment Task"
          message={`Remove LinkedIn prospect record for "${commentToDelete.leadName}"?`}
          onConfirm={() => {
            deleteCommentTask(commentToDelete.id);
            setCommentToDelete(null);
          }}
          onCancel={() => setCommentToDelete(null)}
        />
      )}
    </div>
  );
};
