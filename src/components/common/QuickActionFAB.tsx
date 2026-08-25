import React, { useState } from 'react';
import { Plus, MessageSquare, DollarSign, UserPlus, X } from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { CustomSelect } from './CustomSelect';
import { LeadChannel, LeadTemperature } from '../../types/crm';

export const QuickActionFAB: React.FC = () => {
  const { addLead, addInvoice, clients, addCommentTask } = useCRM();
  const [isOpen, setIsOpen] = useState(false);
  const [modalType, setModalType] = useState<'lead' | 'comment' | 'invoice' | null>(null);

  // Lead Form
  const [leadForm, setLeadForm] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    channel: 'LinkedIn' as LeadChannel,
    temperature: 'Hot' as LeadTemperature,
    estimatedValue: 3000,
    followUpDate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  // Comment Form
  const [commentForm, setCommentForm] = useState({
    leadName: '',
    postUrl: '',
    dueDate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  // Invoice Form
  const [invoiceForm, setInvoiceForm] = useState({
    clientId: '',
    service: 'Social Media Growth',
    amount: 1500,
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
      estimatedValue: 3000,
      followUpDate: new Date().toISOString().split('T')[0],
      notes: '',
    });
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentForm.leadName || !commentForm.postUrl) return;
    addCommentTask({
      leadName: commentForm.leadName,
      postUrl: commentForm.postUrl,
      dueDate: commentForm.dueDate,
      status: 'Pending',
      notes: commentForm.notes,
    });
    setModalType(null);
    setIsOpen(false);
    setCommentForm({
      leadName: '',
      postUrl: '',
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
              onClick={() => setModalType('lead')}
              className="flex items-center gap-2.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg hover:shadow-indigo-600/30 text-xs font-semibold transition-all transform hover:-translate-x-1 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Log New Lead</span>
            </button>
            <button
              onClick={() => setModalType('comment')}
              className="flex items-center gap-2.5 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl shadow-lg hover:shadow-sky-600/30 text-xs font-semibold transition-all transform hover:-translate-x-1 cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Log LinkedIn Comment</span>
            </button>
            <button
              onClick={() => setModalType('invoice')}
              className="flex items-center gap-2.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg hover:shadow-emerald-600/30 text-xs font-semibold transition-all transform hover:-translate-x-1 cursor-pointer"
            >
              <DollarSign className="w-4 h-4" />
              <span>Log Payment / Invoice</span>
            </button>
          </div>
        )}

        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all transform active:scale-90 cursor-pointer ${
            isOpen
              ? 'bg-rose-500 hover:bg-rose-600 rotate-45 text-white'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white hover:rotate-90 shadow-indigo-500/40'
          }`}
          title="Quick Activity Log"
        >
          <Plus className="w-7 h-7 transition-transform" />
        </button>
      </div>

      {/* Modal Container */}
      {modalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                {modalType === 'lead' && <><UserPlus className="text-indigo-500" /> Log New Lead</>}
                {modalType === 'comment' && <><MessageSquare className="text-sky-500" /> Add LinkedIn Comment Task</>}
                {modalType === 'invoice' && <><DollarSign className="text-emerald-500" /> Create & Dispatch Invoice</>}
              </h3>
              <button
                onClick={() => setModalType(null)}
                className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal: Lead Entry */}
            {modalType === 'lead' && (
              <form onSubmit={handleLeadSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Name *</label>
                    <input
                      type="text"
                      required
                      value={leadForm.name}
                      onChange={e => setLeadForm({ ...leadForm, name: e.target.value })}
                      placeholder="e.g. Alex Henderson"
                      className="w-full mt-1 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Company *</label>
                    <input
                      type="text"
                      required
                      value={leadForm.company}
                      onChange={e => setLeadForm({ ...leadForm, company: e.target.value })}
                      placeholder="e.g. Nexus Media"
                      className="w-full mt-1 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Email</label>
                    <input
                      type="email"
                      value={leadForm.email}
                      onChange={e => setLeadForm({ ...leadForm, email: e.target.value })}
                      placeholder="alex@nexus.io"
                      className="w-full mt-1 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-300">WhatsApp / Phone</label>
                    <input
                      type="text"
                      value={leadForm.phone}
                      onChange={e => setLeadForm({ ...leadForm, phone: e.target.value })}
                      placeholder="+1 or +92..."
                      className="w-full mt-1 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
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
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Est. Value ($)</label>
                    <input
                      type="number"
                      value={leadForm.estimatedValue}
                      onChange={e => setLeadForm({ ...leadForm, estimatedValue: Number(e.target.value) })}
                      className="w-full mt-1 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Follow-up Date</label>
                  <input
                    type="date"
                    value={leadForm.followUpDate}
                    onChange={e => setLeadForm({ ...leadForm, followUpDate: e.target.value })}
                    className="w-full mt-1 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setModalType(null)}
                    className="px-4 py-2 text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-md cursor-pointer"
                  >
                    Save & Sync Lead
                  </button>
                </div>
              </form>
            )}

            {/* Modal: LinkedIn Comment Log */}
            {modalType === 'comment' && (
              <form onSubmit={handleCommentSubmit} className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Prospect / Lead Name *</label>
                  <input
                    type="text"
                    required
                    value={commentForm.leadName}
                    onChange={e => setCommentForm({ ...commentForm, leadName: e.target.value })}
                    placeholder="e.g. Jason Calacanis"
                    className="w-full mt-1 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Post URL Link *</label>
                  <input
                    type="url"
                    required
                    value={commentForm.postUrl}
                    onChange={e => setCommentForm({ ...commentForm, postUrl: e.target.value })}
                    placeholder="https://linkedin.com/posts/..."
                    className="w-full mt-1 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Target Comment Date</label>
                  <input
                    type="date"
                    value={commentForm.dueDate}
                    onChange={e => setCommentForm({ ...commentForm, dueDate: e.target.value })}
                    className="w-full mt-1 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Notes / Talking Points</label>
                  <input
                    type="text"
                    value={commentForm.notes}
                    onChange={e => setCommentForm({ ...commentForm, notes: e.target.value })}
                    placeholder="e.g. Mention their series B or AI automation topic"
                    className="w-full mt-1 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setModalType(null)}
                    className="px-4 py-2 text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-semibold bg-sky-600 hover:bg-sky-700 text-white rounded-lg shadow-md cursor-pointer"
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
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Select Client *</label>
                  <select
                    required
                    value={invoiceForm.clientId}
                    onChange={e => setInvoiceForm({ ...invoiceForm, clientId: e.target.value })}
                    className="w-full mt-1 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
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
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Amount ($)</label>
                    <input
                      type="number"
                      required
                      value={invoiceForm.amount}
                      onChange={e => setInvoiceForm({ ...invoiceForm, amount: Number(e.target.value) })}
                      className="w-full mt-1 bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
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
                <div className="flex justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setModalType(null)}
                    className="px-4 py-2 text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-md cursor-pointer"
                  >
                    Generate Invoice (+7 Day Due)
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
};
