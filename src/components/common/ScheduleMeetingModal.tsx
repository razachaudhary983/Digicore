import React, { useState, useEffect } from 'react';
import {
  Video,
  Calendar,
  Clock,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  Download,
  Building,
  User,
  FileText,
  X,
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { Lead, ClientProfile, MeetingTask } from '../../types/crm';
import {
  generateGoogleMeetLink,
  createGoogleCalendarUrl,
  downloadICSFile,
} from '../../utils/calendarUtils';

interface ScheduleMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialLead?: Lead | null;
  initialClient?: ClientProfile | null;
  onMeetingCreated?: (meeting: MeetingTask) => void;
}

export const ScheduleMeetingModal: React.FC<ScheduleMeetingModalProps> = ({
  isOpen,
  onClose,
  initialLead,
  initialClient,
  onMeetingCreated,
}) => {
  const { leads, clients, addMeeting } = useCRM();

  // Selection mode: 'lead' | 'client' | 'custom'
  const [targetType, setTargetType] = useState<'lead' | 'client' | 'custom'>(() => {
    if (initialClient) return 'client';
    if (initialLead) return 'lead';
    return 'lead';
  });

  const [selectedLeadId, setSelectedLeadId] = useState<string>(initialLead?.id || '');
  const [selectedClientId, setSelectedClientId] = useState<string>(initialClient?.id || '');

  const [leadName, setLeadName] = useState(initialLead?.name || initialClient?.name || '');
  const [company, setCompany] = useState(initialLead?.company || initialClient?.company || '');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('15:00');
  const [durationMinutes, setDurationMinutes] = useState(45);
  
  // Google Meet Toggle & Generated Link
  const [autoGenerateMeet, setAutoGenerateMeet] = useState(true);
  const [meetUrl, setMeetUrl] = useState(() => generateGoogleMeetLink());
  const [description, setDescription] = useState('');

  // UI helpers
  const [copiedLink, setCopiedLink] = useState(false);
  const [createdMeeting, setCreatedMeeting] = useState<MeetingTask | null>(null);

  // Initialize or update fields when target changes
  useEffect(() => {
    if (initialLead) {
      setTargetType('lead');
      setSelectedLeadId(initialLead.id);
      setLeadName(initialLead.name);
      setCompany(initialLead.company);
      setTitle(`Strategy & Demo Pitch: ${initialLead.name} (${initialLead.company})`);
      setDescription(
        `DigiCore CRM Discovery & Automation Pitch Call with ${initialLead.name} from ${initialLead.company}.\nFocus: Lead Generation & Pipeline Scaling.`
      );
    } else if (initialClient) {
      setTargetType('client');
      setSelectedClientId(initialClient.id);
      setLeadName(initialClient.name);
      setCompany(initialClient.company);
      setTitle(`Monthly Strategy & Review: ${initialClient.name} (${initialClient.company})`);
      setDescription(
        `DigiCore Client Monthly Progress & Performance Review.\nService Pillar: ${initialClient.serviceCategory}.`
      );
    } else if (targetType === 'lead' && leads.length > 0) {
      const first = leads[0];
      setSelectedLeadId(first.id);
      setLeadName(first.name);
      setCompany(first.company);
      setTitle(`Strategy & Demo Pitch: ${first.name} (${first.company})`);
      setDescription(
        `DigiCore Discovery & Architecture Demonstration with ${first.name} (${first.company}).`
      );
    }
  }, [initialLead, initialClient]);

  const handleLeadSelect = (id: string) => {
    setSelectedLeadId(id);
    const sel = leads.find(l => l.id === id);
    if (sel) {
      setLeadName(sel.name);
      setCompany(sel.company);
      setTitle(`Strategy & Demo Call: ${sel.name} (${sel.company})`);
      setDescription(
        `DigiCore Client Presentation & Discovery with ${sel.name} (${sel.company}).\nEmail: ${sel.email || 'N/A'}`
      );
    }
  };

  const handleClientSelect = (id: string) => {
    setSelectedClientId(id);
    const sel = clients.find(c => c.id === id);
    if (sel) {
      setLeadName(sel.name);
      setCompany(sel.company);
      setTitle(`Client Review Call: ${sel.name} (${sel.company})`);
      setDescription(
        `Account Growth & Deliverables Review for ${sel.company} (${sel.serviceCategory}).`
      );
    }
  };

  const handleRegenerateMeetLink = () => {
    const newLink = generateGoogleMeetLink();
    setMeetUrl(newLink);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(meetUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSubmit = async (openCalendarTab: boolean = false) => {
    if (!leadName || !company || !date || !time) return;

    const finalMeetUrl = autoGenerateMeet ? (meetUrl || generateGoogleMeetLink()) : (meetUrl || '');
    const finalTitle = title || `Strategy Call: ${leadName} (${company})`;

    const meeting = await addMeeting({
      leadId: targetType === 'lead' ? selectedLeadId : undefined,
      clientId: targetType === 'client' ? selectedClientId : undefined,
      title: finalTitle,
      leadName,
      clientName: leadName,
      company,
      date,
      time,
      durationMinutes,
      meetUrl: finalMeetUrl,
      meetingLink: finalMeetUrl,
      status: 'Booked',
      outcome: 'Pending',
      description: description || `Client Call with ${leadName} (${company}). Google Meet: ${finalMeetUrl}`,
    });

    setCreatedMeeting(meeting);
    if (onMeetingCreated) {
      onMeetingCreated(meeting);
    }

    if (openCalendarTab) {
      const gcalUrl = createGoogleCalendarUrl(meeting);
      window.open(gcalUrl, '_blank', 'noopener,noreferrer');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div
        className="w-full max-w-xl bg-white dark:bg-[#121217] border border-purple-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-[#23232c] bg-slate-50/50 dark:bg-[#181820]/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/15 text-purple-500 flex items-center justify-center font-bold">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Schedule Google Meet & Calendar Call
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-400 border border-purple-500/30 font-bold">
                  Auto-Meet
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Instantly generate Google Meet links and sync with Google Calendar & .ics files.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-[#23232c] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {createdMeeting ? (
            /* SUCCESS CONFIRMATION & CALENDAR SYNC SCREEN */
            <div className="space-y-5 text-center py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/15 text-emerald-400 mx-auto flex items-center justify-center">
                <Check className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Meeting Successfully Scheduled!
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                  Attached to Firestore <code className="text-[#FFC700] font-mono font-bold">events</code> collection and recorded on your daily agenda.
                </p>
              </div>

              {/* Meeting Details Card */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#181820] border border-slate-200 dark:border-[#2a2a36] text-left space-y-2 text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-[#23232c]">
                  <span className="font-bold text-slate-900 dark:text-white text-sm">{createdMeeting.title}</span>
                  <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 font-mono font-bold text-[10px]">
                    {createdMeeting.time} ({createdMeeting.durationMinutes || 45} min)
                  </span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Client / Contact:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{createdMeeting.leadName} ({createdMeeting.company})</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Date & Time:</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">{createdMeeting.date} at {createdMeeting.time}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-[#23232c]">
                  <span className="text-slate-500">Google Meet:</span>
                  <a
                    href={createdMeeting.meetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-purple-400 hover:underline font-bold flex items-center gap-1"
                  >
                    {createdMeeting.meetUrl} <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Instant Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
                <a
                  href={createdMeeting.meetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-3 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all"
                >
                  <Video className="w-4 h-4" />
                  <span>Launch Meet</span>
                </a>

                <a
                  href={createGoogleCalendarUrl(createdMeeting)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Add to Google Cal</span>
                </a>

                <button
                  type="button"
                  onClick={() => downloadICSFile(createdMeeting)}
                  className="py-2.5 px-3 bg-slate-200 dark:bg-[#23232c] hover:bg-slate-300 dark:hover:bg-[#2c2c38] text-slate-900 dark:text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4 text-emerald-500" />
                  <span>Download .ICS</span>
                </button>
              </div>

              <div className="pt-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 bg-slate-100 dark:bg-[#181820] hover:bg-slate-200 dark:hover:bg-[#252533] text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Done & Return to CRM
                </button>
              </div>
            </div>
          ) : (
            /* FORM INPUTS */
            <form
              onSubmit={e => {
                e.preventDefault();
                handleSubmit(false);
              }}
              className="space-y-4"
            >
              {/* Target Type Selector */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Meeting Target / Recipient *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setTargetType('lead')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-1.5 cursor-pointer ${
                      targetType === 'lead'
                        ? 'bg-[#FFC700]/15 text-amber-800 dark:text-[#FFC700] border-[#FFC700]/50'
                        : 'bg-slate-50 dark:bg-[#181820] text-slate-500 border-slate-200 dark:border-[#2a2a36]'
                    }`}
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>From Leads</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTargetType('client')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-1.5 cursor-pointer ${
                      targetType === 'client'
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/50'
                        : 'bg-slate-50 dark:bg-[#181820] text-slate-500 border-slate-200 dark:border-[#2a2a36]'
                    }`}
                  >
                    <Building className="w-3.5 h-3.5" />
                    <span>Active Client</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTargetType('custom')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-1.5 cursor-pointer ${
                      targetType === 'custom'
                        ? 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/50'
                        : 'bg-slate-50 dark:bg-[#181820] text-slate-500 border-slate-200 dark:border-[#2a2a36]'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Custom</span>
                  </button>
                </div>
              </div>

              {/* Dynamic Dropdown based on Target */}
              {targetType === 'lead' && (
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Select Lead from Pipeline *
                  </label>
                  <select
                    value={selectedLeadId}
                    onChange={e => handleLeadSelect(e.target.value)}
                    className="w-full mt-1 bg-slate-50 dark:bg-[#181820] border border-slate-300 dark:border-[#2a2a36] focus:border-[#FFC700] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none cursor-pointer"
                  >
                    {leads.map(l => (
                      <option key={l.id} value={l.id}>
                        {l.name} — {l.company} ({l.temperature} | {l.status})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {targetType === 'client' && (
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Select Active Client Profile *
                  </label>
                  <select
                    value={selectedClientId}
                    onChange={e => handleClientSelect(e.target.value)}
                    className="w-full mt-1 bg-slate-50 dark:bg-[#181820] border border-slate-300 dark:border-[#2a2a36] focus:border-[#FFC700] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none cursor-pointer"
                  >
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} — {c.company} ({c.serviceCategory})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Name & Company inputs */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Recipient / Prospect Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={leadName}
                    onChange={e => setLeadName(e.target.value)}
                    placeholder="e.g. Sarah Jenkins"
                    className="w-full mt-1 bg-slate-50 dark:bg-[#181820] border border-slate-300 dark:border-[#2a2a36] focus:border-[#FFC700] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Company / Organization *
                  </label>
                  <input
                    type="text"
                    required
                    value={company}
                    onChange={e => setCompany(e.target.value)}
                    placeholder="e.g. Apex Health Corp"
                    className="w-full mt-1 bg-slate-50 dark:bg-[#181820] border border-slate-300 dark:border-[#2a2a36] focus:border-[#FFC700] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              {/* Meeting Subject / Title */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Meeting Title / Subject *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. AI Automation Discovery & Architecture Pitch"
                  className="w-full mt-1 bg-slate-50 dark:bg-[#181820] border border-slate-300 dark:border-[#2a2a36] focus:border-[#FFC700] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none"
                />
              </div>

              {/* Date, Time, and Duration */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Date *</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full mt-1 bg-slate-50 dark:bg-[#181820] border border-slate-300 dark:border-[#2a2a36] focus:border-[#FFC700] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Start Time *</label>
                  <input
                    type="time"
                    required
                    value={time}
                    onChange={e => setTime(e.target.value)}
                    className="w-full mt-1 bg-slate-50 dark:bg-[#181820] border border-slate-300 dark:border-[#2a2a36] focus:border-[#FFC700] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Duration</label>
                  <select
                    value={durationMinutes}
                    onChange={e => setDurationMinutes(Number(e.target.value))}
                    className="w-full mt-1 bg-slate-50 dark:bg-[#181820] border border-slate-300 dark:border-[#2a2a36] focus:border-[#FFC700] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none cursor-pointer"
                  >
                    <option value={15}>15 Minutes</option>
                    <option value={30}>30 Minutes</option>
                    <option value={45}>45 Minutes</option>
                    <option value={60}>1 Hour</option>
                    <option value={90}>1.5 Hours</option>
                  </select>
                </div>
              </div>

              {/* 1. GOOGLE MEET LINK AUTO-GENERATION SECTION */}
              <div className="p-4 rounded-2xl bg-purple-500/5 dark:bg-purple-500/10 border border-purple-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Video className="w-4 h-4 text-purple-400" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      Google Meet Link Auto-Generation
                    </span>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoGenerateMeet}
                      onChange={e => setAutoGenerateMeet(e.target.checked)}
                      className="rounded border-slate-300 dark:border-[#2a2a36] text-purple-600 focus:ring-purple-500 cursor-pointer"
                    />
                    <span className="text-[11px] font-semibold text-purple-600 dark:text-purple-400">
                      Auto-Generate Link
                    </span>
                  </label>
                </div>

                {autoGenerateMeet ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={meetUrl}
                        className="w-full font-mono text-xs bg-white dark:bg-[#121217] border border-purple-500/40 text-purple-400 rounded-xl px-3 py-2 outline-none font-bold"
                      />

                      <button
                        type="button"
                        onClick={handleRegenerateMeetLink}
                        title="Regenerate New Link"
                        className="p-2 bg-purple-500/15 hover:bg-purple-500/25 text-purple-400 rounded-xl transition-all cursor-pointer flex-shrink-0"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={handleCopyLink}
                        title="Copy Meet Link"
                        className="p-2 bg-slate-200 dark:bg-[#23232c] hover:bg-slate-300 dark:hover:bg-[#2c2c38] text-slate-700 dark:text-slate-300 rounded-xl transition-all cursor-pointer flex-shrink-0"
                      >
                        {copiedLink ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>

                    <p className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-[#FFC700]" />
                      Unique video room will be saved to Firestore <code className="text-purple-400 font-mono">events</code> and included in calendar invites.
                    </p>
                  </div>
                ) : (
                  <div>
                    <input
                      type="url"
                      value={meetUrl}
                      onChange={e => setMeetUrl(e.target.value)}
                      placeholder="https://meet.google.com/xxx-yyyy-zzz"
                      className="w-full bg-white dark:bg-[#121217] border border-slate-300 dark:border-[#2a2a36] focus:border-purple-500 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Description / Agenda */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Agenda & Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Meeting agenda, topics to cover, preparation notes..."
                  className="w-full mt-1 bg-slate-50 dark:bg-[#181820] border border-slate-300 dark:border-[#2a2a36] focus:border-[#FFC700] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-[#23232c]">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  Cancel
                </button>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => handleSubmit(true)}
                    className="flex-1 sm:flex-initial px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                    title="Save in CRM and open Google Calendar event composer"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Book & Add to Google Cal</span>
                  </button>

                  <button
                    type="submit"
                    className="flex-1 sm:flex-initial px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Save Meeting</span>
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
