import React, { useState } from 'react';
import { Plus, MessageSquare, DollarSign, UserPlus, X, Linkedin, Video } from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { CustomSelect } from './CustomSelect';
import { LeadChannel, LeadTemperature } from '../../types/crm';
import { ScheduleMeetingModal } from './ScheduleMeetingModal';

export const QuickActionFAB: React.FC = () => {
  const { addLead, addInvoice, clients, addCommentTask } = useCRM();
  const [isOpen, setIsOpen] = useState(false);
  const [modalType, setModalType] = useState<'lead' | 'comment' | 'invoice' | 'meeting' | null>(null);

  // Lead Form
  const [leadForm, setLeadForm] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    channel: 'LinkedIn' as LeadChannel,
    temperature: 'Hot' as LeadTemperature,
    estimatedValue: 3500,
    followUpDate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  // Comment Form
  const [commentForm, setCommentForm] = useState({
    leadName: '',
    profileUrl: '',
    company: '',
    dueDate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  // Invoice Form
  const [invoiceForm, setInvoiceForm] = useState({
    clientId: '',
    service: 'Paid Acquisition - Monthly Retainer',
    amount: 3500,
    sentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'Meezan Bank',
  });

  const handleLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadForm.name || !leadForm.company) return;
    addLead({
      ...leadForm,
      status: 'New',
    });
    setModalType(null);
    setIsOpen(false);
    setLeadForm({
      name: '',
      company: '',
      email: '',
      phone: '',
      channel: 'LinkedIn',
      temperature: 'Hot',
      estimatedValue: 3500,
      followUpDate: new Date().toISOString().split('T')[0],
      notes: '',
    });
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentForm.leadName || !commentForm.profileUrl) return;
    addCommentTask({
      leadName: commentForm.leadName,
      profileUrl: commentForm.profileUrl,
      company: commentForm.company || `${commentForm.leadName}'s Org`,
      dueDate: commentForm.dueDate,
      status: 'Pending',
      pipelineStatus: 'Pending',
      notes: commentForm.notes,
    });
    setModalType(null);
    setIsOpen(false);
    setCommentForm({
      leadName: '',
      profileUrl: '',
      company: '',
      dueDate: new Date().toISOString().split('T')[0],
      notes: '',
    });
  };

  const handleInvoiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selClient = clients.find(c => c.id === invoiceForm.clientId);
    if (!selClient) return;

    addInvoice({
      clientId: selClient.id,
      clientName: selClient.company,
      service: invoiceForm.service,
      amount: invoiceForm.amount,
      sentDate: invoiceForm.sentDate,
      status: 'Pending',
      paymentMethod: invoiceForm.paymentMethod,
    });
    setModalType(null);
    setIsOpen(false);
  };

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
        {isOpen && (
          <div className="flex flex-col gap-2 mb-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
            <button
              onClick={() => setModalType('meeting')}
              className="flex items-center gap-2.5 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl shadow-xl text-xs font-bold transition-all transform hover:-translate-x-1 cursor-pointer"
            >
              <Video className="w-4 h-4" />
              <span>Schedule Google Meet Call</span>
            </button>
            <button
              onClick={() => setModalType('lead')}
              className="flex items-center gap-2.5 px-4 py-2.5 bg-[#FFC700] hover:bg-[#ffcf1a] text-black rounded-2xl shadow-xl text-xs font-bold transition-all transform hover:-translate-x-1 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Log New Lead</span>
            </button>
            <button
              onClick={() => setModalType('comment')}
              className="flex items-center gap-2.5 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-2xl shadow-xl text-xs font-bold transition-all transform hover:-translate-x-1 cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Log LinkedIn Comment</span>
            </button>
            <button
              onClick={() => setModalType('invoice')}
              className="flex items-center gap-2.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl shadow-xl text-xs font-bold transition-all transform hover:-translate-x-1 cursor-pointer"
            >
              <DollarSign className="w-4 h-4" />
              <span>Generate Invoice (+7 Day Due)</span>
            </button>
          </div>
        )}

        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-13 h-13 rounded-2xl flex items-center justify-center shadow-2xl transition-all transform active:scale-95 cursor-pointer ${
            isOpen
              ? 'bg-rose-500 hover:bg-rose-600 rotate-45 text-white'
              : 'bg-[#FFC700] hover:bg-[#ffcf1a] text-black shadow-[#FFC700]/30 font-black'
          }`}
          title="Quick Activity Log"
        >
          <Plus className="w-6 h-6 transition-transform" />
        </button>
      </div>

      {/* Modal Container */}
      {modalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white dark:bg-[#121217] border border-slate-200 dark:border-[#23232c] rounded-3xl p-6 shadow-2xl space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#23232c]">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                {modalType === 'lead' && <><UserPlus className="text-[#FFC700]" /> Log New Lead</>}
                {modalType === 'comment' && <><Linkedin className="text-sky-500" /> Log LinkedIn Prospect</>}
                {modalType === 'invoice' && <><DollarSign className="text-emerald-500" /> Generate Invoice</>}
              </h3>
              <button
                onClick={() => setModalType(null)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal: Lead Entry */}
            {modalType === 'lead' && (
              <form onSubmit={handleLeadSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Name *</label>
                    <input
                      type="text"
                      required
                      value={leadForm.name}
                      onChange={e => setLeadForm({ ...leadForm, name: e.target.value })}
                      placeholder="e.g. Alex Henderson"
                      className="w-full mt-1 bg-slate-50 dark:bg-[#181820] border border-slate-300 dark:border-[#2a2a36] focus:border-[#FFC700] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Company *</label>
                    <input
                      type="text"
                      required
                      value={leadForm.company}
                      onChange={e => setLeadForm({ ...leadForm, company: e.target.value })}
                      placeholder="e.g. Nexus Media"
                      className="w-full mt-1 bg-slate-50 dark:bg-[#181820] border border-slate-300 dark:border-[#2a2a36] focus:border-[#FFC700] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Email</label>
                    <input
                      type="email"
                      value={leadForm.email}
                      onChange={e => setLeadForm({ ...leadForm, email: e.target.value })}
                      placeholder="alex@nexus.io"
                      className="w-full mt-1 bg-slate-50 dark:bg-[#181820] border border-slate-300 dark:border-[#2a2a36] focus:border-[#FFC700] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Phone / WhatsApp</label>
                    <input
                      type="text"
                      value={leadForm.phone}
                      onChange={e => setLeadForm({ ...leadForm, phone: e.target.value })}
                      placeholder="+1 or +92..."
                      className="w-full mt-1 bg-slate-50 dark:bg-[#181820] border border-slate-300 dark:border-[#2a2a36] focus:border-[#FFC700] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <CustomSelect
                    label="Channel"
                    value={leadForm.channel}
                    options={['LinkedIn', 'Google Maps', 'Meta Ads', 'Cold Email', 'Freelancer / Upwork', 'Referral']}
                    onChange={val => setLeadForm({ ...leadForm, channel: val as LeadChannel })}
                  />
                  <CustomSelect
                    label="Temperature"
                    value={leadForm.temperature}
                    options={['Hot', 'Warm', 'Cold']}
                    onChange={val => setLeadForm({ ...leadForm, temperature: val as LeadTemperature })}
                  />
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Est. Value (PKR)</label>
                    <input
                      type="number"
                      value={leadForm.estimatedValue}
                      onChange={e => setLeadForm({ ...leadForm, estimatedValue: Number(e.target.value) })}
                      className="w-full mt-1 bg-slate-50 dark:bg-[#181820] border border-slate-300 dark:border-[#2a2a36] focus:border-[#FFC700] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-[#23232c]">
                  <button
                    type="button"
                    onClick={() => setModalType(null)}
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
            )}

            {/* Modal: LinkedIn Comment Log */}
            {modalType === 'comment' && (
              <form onSubmit={handleCommentSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Prospect Name *</label>
                    <input
                      type="text"
                      required
                      value={commentForm.leadName}
                      onChange={e => setCommentForm({ ...commentForm, leadName: e.target.value })}
                      placeholder="e.g. Jason Calacanis"
                      className="w-full mt-1 bg-slate-50 dark:bg-[#181820] border border-slate-300 dark:border-[#2a2a36] focus:border-[#FFC700] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Company / Brand</label>
                    <input
                      type="text"
                      value={commentForm.company}
                      onChange={e => setCommentForm({ ...commentForm, company: e.target.value })}
                      placeholder="e.g. Launch Media"
                      className="w-full mt-1 bg-slate-50 dark:bg-[#181820] border border-slate-300 dark:border-[#2a2a36] focus:border-[#FFC700] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Profile Link URL * (Direct Link)</label>
                  <input
                    type="url"
                    required
                    value={commentForm.profileUrl}
                    onChange={e => setCommentForm({ ...commentForm, profileUrl: e.target.value })}
                    placeholder="https://linkedin.com/in/prospect-profile"
                    className="w-full mt-1 bg-slate-50 dark:bg-[#181820] border border-slate-300 dark:border-[#2a2a36] focus:border-[#FFC700] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Scheduled Date</label>
                  <input
                    type="date"
                    value={commentForm.dueDate}
                    onChange={e => setCommentForm({ ...commentForm, dueDate: e.target.value })}
                    className="w-full mt-1 bg-slate-50 dark:bg-[#181820] border border-slate-300 dark:border-[#2a2a36] focus:border-[#FFC700] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Talking Points</label>
                  <input
                    type="text"
                    value={commentForm.notes}
                    onChange={e => setCommentForm({ ...commentForm, notes: e.target.value })}
                    placeholder="e.g. Reference their AI funding announcement..."
                    className="w-full mt-1 bg-slate-50 dark:bg-[#181820] border border-slate-300 dark:border-[#2a2a36] focus:border-[#FFC700] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-[#23232c]">
                  <button
                    type="button"
                    onClick={() => setModalType(null)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white rounded-xl shadow-md cursor-pointer"
                  >
                    Add Comment Task
                  </button>
                </div>
              </form>
            )}

            {/* Modal: Invoice Creation */}
            {modalType === 'invoice' && (
              <form onSubmit={handleInvoiceSubmit} className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Select Client *</label>
                  <select
                    required
                    value={invoiceForm.clientId}
                    onChange={e => setInvoiceForm({ ...invoiceForm, clientId: e.target.value })}
                    className="w-full mt-1 bg-slate-50 dark:bg-[#181820] border border-slate-300 dark:border-[#2a2a36] focus:border-[#FFC700] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none"
                  >
                    <option value="">Select Existing Client...</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.company} ({c.name})
                      </option>
                    ))}
                  </select>
                </div>

                <CustomSelect
                  label="Service Pillar"
                  value={invoiceForm.service}
                  options={[
                    'AI Automation',
                    'Social Media Growth',
                    'Branding & Design',
                    'Paid Acquisition',
                    'Web Dev & SEO',
                  ]}
                  onChange={val => setInvoiceForm({ ...invoiceForm, service: val })}
                />

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Amount (PKR)</label>
                    <input
                      type="number"
                      required
                      value={invoiceForm.amount}
                      onChange={e => setInvoiceForm({ ...invoiceForm, amount: Number(e.target.value) })}
                      className="w-full mt-1 bg-slate-50 dark:bg-[#181820] border border-slate-300 dark:border-[#2a2a36] focus:border-[#FFC700] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none"
                    />
                  </div>

                  <CustomSelect
                    label="Payment Method"
                    value={invoiceForm.paymentMethod}
                    options={[
                      'Meezan Bank',
                      'Raqami Bank',
                      'JazzCash',
                      'EasyPaisa',
                      'NayaPay',
                      'SadaPay',
                      'Payoneer',
                      'Wire Transfer',
                    ]}
                    onChange={val => setInvoiceForm({ ...invoiceForm, paymentMethod: val })}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-[#23232c]">
                  <button
                    type="button"
                    onClick={() => setModalType(null)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md cursor-pointer"
                  >
                    Generate Invoice
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* SCHEDULE MEETING MODAL */}
      <ScheduleMeetingModal
        isOpen={modalType === 'meeting'}
        onClose={() => {
          setModalType(null);
          setIsOpen(false);
        }}
      />
    </>
  );
};
