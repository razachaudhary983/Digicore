import React, { useState } from 'react';
import {
  Clock,
  AlertCircle,
  Calendar,
  MessageSquare,
  Video,
  ArrowUpRight,
  RefreshCw,
  Check,
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { MeetingTask } from '../../types/crm';

export const DailyActionCenter: React.FC = () => {
  const { tasks, comments, meetings, toggleTaskComplete, rescheduleTask, toggleCommentStatus, updateMeetingOutcome } = useCRM();
  const today = new Date().toISOString().split('T')[0];

  const dueTodayTasks = tasks.filter(t => t.dueDate === today && !t.completed);
  const overdueTasks = tasks.filter(t => t.dueDate < today && !t.completed);
  const todaysComments = comments.filter(c => c.dueDate === today);
  const todaysMeetings = meetings.filter(m => m.date === today);

  const [rescheduleModalId, setRescheduleModalId] = useState<string | null>(null);
  const [newDateVal, setNewDateVal] = useState(today);

  return (
    <div className="space-y-6">
      {/* Top Welcome KPI Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Overdue Follow-ups</span>
            <span className="p-2 rounded-xl bg-rose-500/10 text-rose-500">
              <AlertCircle className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-2">
            {overdueTasks.length}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Requires immediate attention</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Due Today</span>
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-2">
            {dueTodayTasks.length}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Tasks scheduled for today</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">LinkedIn Comments</span>
            <span className="p-2 rounded-xl bg-sky-500/10 text-sky-500">
              <MessageSquare className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-bold text-sky-600 dark:text-sky-400 mt-2">
            {todaysComments.filter(c => c.status === 'Completed').length}/{todaysComments.length}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Warm-up interactions done</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Meetings Today</span>
            <span className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
              <Video className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-2">
            {todaysMeetings.length}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Pitch & discovery calls</p>
        </div>
      </div>

      {/* Main Command Split Screen */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Follow-up Queue (Overdue & Due Today) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Overdue Urgent Block */}
          {overdueTasks.length > 0 && (
            <div className="bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/60 rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-rose-500" />
                  <h3 className="font-bold text-rose-950 dark:text-rose-300 text-sm">
                    Overdue Actions ({overdueTasks.length})
                  </h3>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-500 text-white">
                  URGENT
                </span>
              </div>

              <div className="space-y-2">
                {overdueTasks.map(task => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-3.5 bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/40 rounded-xl shadow-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-900 dark:text-white">
                          {task.leadName}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-300 font-mono">
                          Due: {task.dueDate}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{task.details}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleTaskComplete(task.id)}
                        className="px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-1 shadow-sm transition-all cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Complete
                      </button>
                      <button
                        onClick={() => setRescheduleModalId(task.id)}
                        className="px-3 py-1.5 text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg flex items-center gap-1 transition-all cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Reschedule
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Today's Tasks */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-500" />
                Today's Action Items ({dueTodayTasks.length})
              </h3>
            </div>

            {dueTodayTasks.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-sm">
                🎉 All tasks for today are cleared!
              </div>
            ) : (
              <div className="space-y-2.5">
                {dueTodayTasks.map(task => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-xl hover:border-indigo-500/50 transition-all"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-900 dark:text-white">
                          {task.leadName}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-medium">
                          {task.type}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{task.details}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleTaskComplete(task.id)}
                        className="px-3 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-1 transition-all cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Done
                      </button>
                      <button
                        onClick={() => setRescheduleModalId(task.id)}
                        className="px-2.5 py-1.5 text-xs text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded-lg transition-all cursor-pointer"
                        title="Reschedule"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: LinkedIn Comments & Today's Meetings */}
        <div className="space-y-6">
          {/* LinkedIn Daily Comments Tracker */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-sky-500" />
                LinkedIn Posts to Engage
              </h4>
              <span className="text-xs font-mono text-slate-400">{todaysComments.length} Today</span>
            </div>

            <div className="space-y-2.5">
              {todaysComments.map(comment => (
                <div
                  key={comment.id}
                  className={`p-3 rounded-xl border transition-all ${
                    comment.status === 'Completed'
                      ? 'bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-60'
                      : 'bg-sky-50/50 dark:bg-sky-950/20 border-sky-200 dark:border-sky-900/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-900 dark:text-white">
                      {comment.leadName}
                    </span>
                    <a
                      href={comment.postUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-sky-500 hover:underline flex items-center gap-1 font-medium"
                    >
                      Open Post <ArrowUpRight className="w-3 h-3" />
                    </a>
                  </div>
                  {comment.notes && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      {comment.notes}
                    </p>
                  )}
                  <div className="mt-2.5 flex justify-end">
                    <button
                      onClick={() => toggleCommentStatus(comment.id)}
                      className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                        comment.status === 'Completed'
                          ? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                          : 'bg-sky-600 text-white hover:bg-sky-700'
                      }`}
                    >
                      {comment.status === 'Completed' ? '✓ Commented' : 'Mark as Commented'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Today's Meetings */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <Video className="w-4 h-4 text-purple-500" />
                Calls & Meetings
              </h4>
            </div>

            {todaysMeetings.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No meetings scheduled today.</p>
            ) : (
              <div className="space-y-3">
                {todaysMeetings.map(meet => (
                  <div
                    key={meet.id}
                    className="p-3.5 bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/50 rounded-xl space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">
                          {meet.leadName} ({meet.company})
                        </p>
                        <p className="text-[11px] text-purple-600 dark:text-purple-300 font-mono">
                          Time: {meet.time}
                        </p>
                      </div>
                      {meet.meetingLink && (
                        <a
                          href={meet.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 text-xs bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium flex items-center gap-1"
                        >
                          Join Call <ArrowUpRight className="w-3 h-3" />
                        </a>
                      )}
                    </div>

                    <div className="pt-2 border-t border-purple-200/60 dark:border-purple-900/40 flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Outcome:</span>
                      <select
                        value={meet.outcome || 'Pending'}
                        onChange={e =>
                          updateMeetingOutcome(meet.id, 'Completed', e.target.value as MeetingTask['outcome'])
                        }
                        className="text-xs bg-white dark:bg-slate-800 border border-purple-300 dark:border-purple-800 rounded px-2 py-1 text-slate-900 dark:text-white"
                      >
                        <option value="Pending">Pending Call</option>
                        <option value="Proposal Required">Proposal Required</option>
                        <option value="Negotiation">Negotiation</option>
                        <option value="Won">Won Deal</option>
                        <option value="Lost">Lost Deal</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reschedule Date Modal */}
      {rescheduleModalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm">
          <div className="w-full max-w-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Reschedule Follow-up</h4>
            <input
              type="date"
              value={newDateVal}
              onChange={e => setNewDateVal(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setRescheduleModalId(null)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  rescheduleTask(rescheduleModalId, newDateVal);
                  setRescheduleModalId(null);
                }}
                className="px-4 py-1.5 text-xs font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 cursor-pointer"
              >
                Update Date
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
