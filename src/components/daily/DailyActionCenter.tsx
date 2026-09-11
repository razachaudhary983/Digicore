import React, { useState } from 'react';
import {
  CalendarCheck,
  Video,
  ExternalLink,
  Plus,
  CheckCircle2,
  Clock,
  Trash2,
  Calendar,
  Sparkles,
  Flame,
  Check,
  ChevronRight,
  TrendingUp,
  Download,
  Copy,
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { MeetingTask, ActivityTask } from '../../types/crm';
import { DeleteGuardModal } from '../common/DeleteGuardModal';
import { CustomSelect } from '../common/CustomSelect';
import { ScheduleMeetingModal } from '../common/ScheduleMeetingModal';
import { createGoogleCalendarUrl, downloadICSFile } from '../../utils/calendarUtils';

export const DailyActionCenter: React.FC = () => {
  const {
    leads,
    meetings,
    tasks,
    comments,
    toggleTaskComplete,
    deleteTask,
    updateMeetingOutcome,
    deleteMeeting,
    toggleCommentStatus,
  } = useCRM();

  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [meetingToDelete, setMeetingToDelete] = useState<MeetingTask | null>(null);
  const [meetingToRecordOutcome, setMeetingToRecordOutcome] = useState<MeetingTask | null>(null);
  const [selectedOutcome, setSelectedOutcome] = useState<MeetingTask['outcome']>('Proposal Required');
  const [meetingTab, setMeetingTab] = useState<'All' | 'Today' | 'Upcoming' | 'Completed'>('All');
  const [copiedMeetingId, setCopiedMeetingId] = useState<string | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];

  // Check past meetings and active meetings
  const todayMeetings = meetings.filter(m => m.date === todayStr);
  const upcomingMeetings = meetings.filter(m => m.date > todayStr);
  const pastMeetings = meetings.filter(m => m.date < todayStr || m.status === 'Completed');

  const filteredMeetings = meetings.filter(m => {
    if (meetingTab === 'Today') return m.date === todayStr;
    if (meetingTab === 'Upcoming') return m.date > todayStr && m.status !== 'Completed';
    if (meetingTab === 'Completed') return m.status === 'Completed' || m.date < todayStr;
    return true;
  });

  const pendingComments = comments.filter(c => c.status === 'Pending');
  const hotLeadsDue = leads.filter(l => l.temperature === 'Hot' && l.followUpDate <= todayStr);
  const openTasks = tasks.filter(t => !t.completed);

  const handleCopyLink = (meeting: MeetingTask) => {
    const link = meeting.meetUrl || meeting.meetingLink || 'https://meet.google.com';
    navigator.clipboard.writeText(link);
    setCopiedMeetingId(meeting.id);
    setTimeout(() => setCopiedMeetingId(null), 2000);
  };

  const handleSaveOutcome = (e: React.FormEvent) => {
    e.preventDefault();
    if (!meetingToRecordOutcome) return;
    updateMeetingOutcome(meetingToRecordOutcome.id, 'Completed', selectedOutcome);
    setMeetingToRecordOutcome(null);
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            Daily Action Center
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-[#FFC700]/15 text-amber-700 dark:text-[#FFC700] border border-[#FFC700]/30 font-bold">
              Command Feed
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time daily queue: scheduled Google Meet calls, calendar synchronization, hot lead follow-ups, and engagement tasks.
          </p>
        </div>

        <button
          onClick={() => setShowScheduleModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#FFC700] hover:bg-[#ffcf1a] text-black font-bold text-xs rounded-xl shadow-md shadow-[#FFC700]/20 transition-all cursor-pointer"
        >
          <Video className="w-4 h-4" />
          <span>+ Schedule Meeting</span>
        </button>
      </div>

      {/* Top Pulse Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#121217] border border-slate-200 dark:border-[#23232c] p-4 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400">Today's Meetings</span>
            <p className="text-xl font-black text-slate-900 dark:text-white">{todayMeetings.length} Scheduled</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center font-bold">
            <Video className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#121217] border border-slate-200 dark:border-[#23232c] p-4 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400">Hot Follow-ups</span>
            <p className="text-xl font-black text-rose-500">{hotLeadsDue.length} Urgent</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center font-bold">
            <Flame className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#121217] border border-slate-200 dark:border-[#23232c] p-4 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400">Comments Due</span>
            <p className="text-xl font-black text-sky-500">{pendingComments.length} Queue</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-sky-500/10 text-sky-500 flex items-center justify-center font-bold">
            <CalendarCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#121217] border border-slate-200 dark:border-[#23232c] p-4 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400">Open Actions</span>
            <p className="text-xl font-black text-[#FFC700]">{openTasks.length} Pending</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-[#FFC700]/15 text-[#FFC700] flex items-center justify-center font-bold">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Grid: Scheduled Calls + Priority Workflows */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Section 1 & 2: Scheduled Google Meet Calls (2 columns) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Scheduled Calls Card */}
          <div className="bg-white dark:bg-[#121217] border border-slate-200 dark:border-[#23232c] rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-[#23232c]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-500 flex items-center justify-center">
                  <Video className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Google Meet & Calendar Events Engine
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Real-time synced calls with Google Meet auto-generation and dual calendar export.
                  </p>
                </div>
              </div>

              {/* Sub-Tabs for Meetings */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#181820] p-1 rounded-xl border border-slate-200 dark:border-[#2a2a36]">
                {(['All', 'Today', 'Upcoming', 'Completed'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setMeetingTab(tab)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                      meetingTab === tab
                        ? 'bg-white dark:bg-[#23232f] text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Meetings List */}
            <div className="space-y-3">
              {filteredMeetings.length === 0 ? (
                <div className="py-10 text-center text-slate-400 text-xs space-y-2">
                  <Video className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 opacity-60" />
                  <p>No meetings found under the "{meetingTab}" filter.</p>
                  <button
                    onClick={() => setShowScheduleModal(true)}
                    className="text-xs font-bold text-[#FFC700] hover:underline cursor-pointer"
                  >
                    + Schedule New Google Meet Call
                  </button>
                </div>
              ) : (
                filteredMeetings.map(meeting => {
                  const isPast = meeting.date < todayStr || meeting.status === 'Completed';
                  const isToday = meeting.date === todayStr;
                  const meetLink = meeting.meetUrl || meeting.meetingLink || 'https://meet.google.com';
                  const isCopied = copiedMeetingId === meeting.id;

                  return (
                    <div
                      key={meeting.id}
                      className={`p-4 rounded-2xl border transition-all space-y-3 ${
                        meeting.status === 'Completed'
                          ? 'bg-slate-50/60 dark:bg-[#181820]/40 border-slate-200 dark:border-[#23232c] opacity-75'
                          : isToday
                          ? 'bg-purple-500/5 dark:bg-purple-500/10 border-purple-500/40 shadow-sm'
                          : 'bg-slate-50 dark:bg-[#181820] border-slate-200 dark:border-[#2a2a36]'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex flex-col items-center justify-center font-bold text-xs flex-shrink-0">
                            <span>{meeting.time || '15:00'}</span>
                            <span className="text-[9px] font-mono opacity-80">{meeting.durationMinutes || 45}m</span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-slate-900 dark:text-white text-sm">
                                {meeting.title || `${meeting.leadName} (${meeting.company})`}
                              </span>
                              {isToday && (
                                <span className="text-[10px] px-2 py-0.2 rounded-full font-bold bg-[#FFC700]/20 text-amber-800 dark:text-[#FFC700] border border-[#FFC700]/30 animate-pulse">
                                  TODAY
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5 flex-wrap">
                              <span className="font-semibold text-slate-700 dark:text-slate-300">
                                {meeting.leadName}
                              </span>
                              <span>· {meeting.company}</span>
                              <span>·</span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-slate-400" /> {meeting.date} at {meeting.time}
                              </span>
                              {meeting.outcome && meeting.outcome !== 'Pending' && (
                                <span className="text-emerald-500 font-semibold">
                                  · Outcome: {meeting.outcome}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Top-right Status / Delete */}
                        <div className="flex items-center gap-1.5 self-end sm:self-center">
                          {meeting.status === 'Completed' ? (
                            <span className="px-2.5 py-1 text-[11px] font-bold rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                              <Check className="w-3 h-3" /> Completed
                            </span>
                          ) : (
                            <button
                              onClick={() => setMeetingToRecordOutcome(meeting)}
                              className="px-2.5 py-1 bg-slate-200 dark:bg-[#252533] hover:bg-slate-300 dark:hover:bg-[#2e2e3f] text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl cursor-pointer"
                            >
                              Record Outcome
                            </button>
                          )}

                          <button
                            onClick={() => setMeetingToDelete(meeting)}
                            className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg cursor-pointer"
                            title="Delete Meeting"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Google Meet Link Bar & Dual Calendar Sync Actions */}
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-2.5 border-t border-slate-200/60 dark:border-[#23232c]">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-[11px] font-semibold text-slate-400 flex-shrink-0">
                            Meet Link:
                          </span>
                          <span className="font-mono text-xs text-purple-600 dark:text-purple-400 truncate font-semibold bg-purple-500/10 px-2 py-0.5 rounded-lg">
                            {meetLink}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyLink(meeting)}
                            title="Copy Meet Link"
                            className="p-1 text-slate-400 hover:text-purple-400 rounded-md cursor-pointer flex-shrink-0"
                          >
                            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>

                        {/* Calendar & Launch Controls */}
                        <div className="flex items-center gap-2 flex-wrap">
                          {/* Launch Google Meet */}
                          <a
                            href={meetLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                          >
                            <Video className="w-3.5 h-3.5" />
                            <span>Join Meet</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>

                          {/* 2. DUAL CALENDAR SYNC: DIRECT GOOGLE CALENDAR LINK */}
                          <a
                            href={createGoogleCalendarUrl(meeting)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                            title="Add directly to Google Calendar"
                          >
                            <Calendar className="w-3.5 h-3.5" />
                            <span>Google Cal</span>
                          </a>

                          {/* 2. DUAL CALENDAR SYNC: ICS FILE EXPORT */}
                          <button
                            type="button"
                            onClick={() => downloadICSFile(meeting)}
                            className="px-3 py-1.5 bg-slate-200 dark:bg-[#252533] hover:bg-slate-300 dark:hover:bg-[#2e2e3f] text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                            title="Download iCal (.ics) for Outlook / Apple Calendar"
                          >
                            <Download className="w-3.5 h-3.5 text-emerald-500" />
                            <span>.ICS</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Hot Follow-up Queue */}
          <div className="bg-white dark:bg-[#121217] border border-slate-200 dark:border-[#23232c] rounded-2xl p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-[#23232c]">
              <Flame className="w-4 h-4 text-rose-500" />
              Hot Deals Requiring Attention
            </h3>

            <div className="space-y-2">
              {hotLeadsDue.length === 0 ? (
                <p className="text-xs text-slate-400 py-2">No overdue hot follow-ups!</p>
              ) : (
                hotLeadsDue.map(lead => (
                  <div
                    key={lead.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-rose-500/5 dark:bg-rose-500/10 border border-rose-500/20"
                  >
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white text-xs">{lead.name}</span>
                      <span className="text-slate-400 text-[11px] ml-2">({lead.company})</span>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Channel: {lead.channel} · Deal: PKR {(lead.estimatedValue || 0).toLocaleString()}
                      </p>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40">
                      Follow-up Due
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Section 3: Daily Activity & Comment Queue (1 column) */}
        <div className="space-y-4">
          {/* LinkedIn Comments Queue */}
          <div className="bg-white dark:bg-[#121217] border border-slate-200 dark:border-[#23232c] rounded-2xl p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-[#23232c]">
              <CalendarCheck className="w-4 h-4 text-sky-500" />
              LinkedIn Daily Comment Tasks
            </h3>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {pendingComments.length === 0 ? (
                <p className="text-xs text-slate-400 py-3">All LinkedIn comments completed for today!</p>
              ) : (
                pendingComments.map(c => (
                  <div
                    key={c.id}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-[#181820] border border-slate-200 dark:border-[#2a2a36] space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900 dark:text-white">{c.leadName}</span>
                      <button
                        onClick={() => toggleCommentStatus(c.id)}
                        className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold cursor-pointer"
                      >
                        ✓ Done
                      </button>
                    </div>
                    {c.notes && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{c.notes}</p>
                    )}
                    <a
                      href={c.profileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-sky-500 hover:underline flex items-center gap-1 font-semibold"
                    >
                      Open Profile <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Activity Tasks Checklist */}
          <div className="bg-white dark:bg-[#121217] border border-slate-200 dark:border-[#23232c] rounded-2xl p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-[#23232c]">
              <Sparkles className="w-4 h-4 text-[#FFC700]" />
              Quick Action Checklist
            </h3>

            <div className="space-y-2">
              {tasks.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  No pending action tasks.
                </div>
              ) : (
                tasks.map(task => (
                  <div
                    key={task.id}
                    className={`flex items-start justify-between gap-2.5 p-2.5 rounded-xl border transition-all group ${
                      task.completed
                        ? 'bg-slate-50/50 dark:bg-[#181820]/40 border-slate-200 dark:border-[#23232c] opacity-60 text-slate-400'
                        : 'bg-slate-50 dark:bg-[#181820] border-slate-200 dark:border-[#2a2a36] hover:border-[#FFC700]/50'
                    }`}
                  >
                    <div
                      onClick={() => toggleTaskComplete(task.id)}
                      className="flex items-start gap-2.5 flex-1 min-w-0 cursor-pointer"
                    >
                      <div
                        className={`w-4 h-4 rounded-md mt-0.5 border flex items-center justify-center flex-shrink-0 ${
                          task.completed
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : 'border-slate-300 dark:border-slate-600'
                        }`}
                      >
                        {task.completed && <Check className="w-3 h-3" />}
                      </div>
                      <div className="flex-1 min-w-0 text-xs">
                        <span className={`font-semibold text-slate-900 dark:text-white ${task.completed ? 'line-through' : ''}`}>
                          {task.leadName}
                        </span>
                        <p className={`text-[11px] text-slate-500 dark:text-slate-400 ${task.completed ? 'line-through' : ''}`}>
                          {task.details}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteTask(task.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 rounded-md cursor-pointer transition-opacity"
                      title="Delete Task"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 1. SCHEDULE NEW MEETING MODAL WITH GOOGLE MEET & DUAL CALENDAR SYNC */}
      <ScheduleMeetingModal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
      />

      {/* MODAL: RECORD MEETING OUTCOME */}
      {meetingToRecordOutcome && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-[#121217] border border-slate-200 dark:border-[#23232c] rounded-3xl p-6 shadow-2xl space-y-4 animate-in fade-in">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Record Call Outcome: {meetingToRecordOutcome.leadName}
            </h3>

            <form onSubmit={handleSaveOutcome} className="space-y-3">
              <CustomSelect
                label="Call Outcome Result"
                value={selectedOutcome || 'Proposal Required'}
                options={['Proposal Required', 'Negotiation', 'Won', 'Lost', 'Pending']}
                onChange={val => setSelectedOutcome(val as MeetingTask['outcome'])}
              />

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-[#23232c]">
                <button
                  type="button"
                  onClick={() => setMeetingToRecordOutcome(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-[#FFC700] hover:bg-[#ffcf1a] text-black rounded-xl cursor-pointer"
                >
                  Save Outcome & Complete
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE GUARD */}
      {meetingToDelete && (
        <DeleteGuardModal
          isOpen={!!meetingToDelete}
          title="Delete Scheduled Call"
          message={`Are you sure you want to cancel the scheduled meeting with "${meetingToDelete.leadName}" (${meetingToDelete.company})?`}
          onConfirm={() => {
            deleteMeeting(meetingToDelete.id);
            setMeetingToDelete(null);
          }}
          onCancel={() => setMeetingToDelete(null)}
        />
      )}
    </div>
  );
};

