import React, { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  AlertCircle,
  Building,
  Plus,
  Trash2,
  Calendar,
  CheckCircle,
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { StatusBadge } from '../common/StatusBadge';
import { CustomSelect } from '../common/CustomSelect';
import { DeleteGuardModal } from '../common/DeleteGuardModal';
import { PaymentMethod, PaymentStatus } from '../../types/crm';

export const FinanceManager: React.FC = () => {
  const { clients, invoices, addInvoice, updateInvoiceStatus, deleteInvoice } = useCRM();

  const [activeTab, setActiveTab] = useState<'invoices' | 'clients'>('invoices');
  const [showAddInvoiceModal, setShowAddInvoiceModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  // New Invoice Form
  const [newInv, setNewInv] = useState({
    clientId: '',
    service: 'AI Automation Retainer',
    amount: 3000,
    sentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'Meezan Bank' as PaymentMethod,
  });

  // Calculate Finance KPIs
  const totalMRR = clients
    .filter(c => c.status === 'Active')
    .reduce((acc, c) => acc + c.monthlyRetainer, 0);

  const totalCollected = invoices
    .filter(i => i.status === 'Paid')
    .reduce((acc, i) => acc + i.amount, 0);

  const totalPending = invoices
    .filter(i => i.status === 'Pending')
    .reduce((acc, i) => acc + i.amount, 0);

  const overdueInvoices = invoices.filter(i => {
    const today = new Date().toISOString().split('T')[0];
    return i.status !== 'Paid' && i.dueDate < today;
  });

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const selClient = clients.find(c => c.id === newInv.clientId);
    if (!selClient) return;

    addInvoice({
      clientId: selClient.id,
      clientName: selClient.company,
      service: newInv.service,
      amount: newInv.amount,
      sentDate: newInv.sentDate,
      status: 'Pending',
      paymentMethod: newInv.paymentMethod,
    });

    setShowAddInvoiceModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Financial Dashboard KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Active MRR
            </span>
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-2 font-mono">
            ${totalMRR.toLocaleString()}/mo
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Monthly Recurring Retainers</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Total Realized Revenue
            </span>
            <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2 font-mono">
            ${totalCollected.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Paid invoices settled</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Pending Collections
            </span>
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <Calendar className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-bold text-amber-500 mt-2 font-mono">
            ${totalPending.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Invoices awaiting payment</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Overdue Invoices
            </span>
            <span className="p-2 rounded-xl bg-rose-500/10 text-rose-500">
              <AlertCircle className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-2 font-mono">
            {overdueInvoices.length}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Past 7-day payment window</p>
        </div>
      </div>

      {/* Tabs Header */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('invoices')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === 'invoices'
                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Invoices & Payments ({invoices.length})
          </button>
          <button
            onClick={() => setActiveTab('clients')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === 'clients'
                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Client Retainers ({clients.length})
          </button>
        </div>

        {activeTab === 'invoices' && (
          <button
            onClick={() => setShowAddInvoiceModal(true)}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Create Invoice
          </button>
        )}
      </div>

      {/* Invoices List View */}
      {activeTab === 'invoices' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="p-3.5">Invoice #</th>
                  <th className="p-3.5">Client / Business</th>
                  <th className="p-3.5">Service Details</th>
                  <th className="p-3.5">Amount ($)</th>
                  <th className="p-3.5">Sent Date</th>
                  <th className="p-3.5">Due Date (7 Days)</th>
                  <th className="p-3.5">Payment Method</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                {invoices.map(inv => {
                  const isOverdue =
                    inv.status !== 'Paid' &&
                    inv.dueDate < new Date().toISOString().split('T')[0];

                  return (
                    <tr
                      key={inv.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="p-3.5 font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                        {inv.invoiceNumber}
                      </td>
                      <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                        {inv.clientName}
                      </td>
                      <td className="p-3.5 text-slate-600 dark:text-slate-300">
                        {inv.service}
                      </td>
                      <td className="p-3.5 font-mono font-bold text-slate-900 dark:text-white text-sm">
                        ${inv.amount.toLocaleString()}
                      </td>
                      <td className="p-3.5 font-mono text-slate-400 text-[11px]">
                        {inv.sentDate}
                      </td>
                      <td className="p-3.5 font-mono text-[11px]">
                        <span
                          className={
                            isOverdue
                              ? 'text-rose-500 font-bold'
                              : 'text-slate-600 dark:text-slate-300'
                          }
                        >
                          {inv.dueDate} {isOverdue && '⚠️'}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {inv.paymentMethod}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <select
                          value={isOverdue && inv.status !== 'Paid' ? 'Overdue' : inv.status}
                          onChange={e =>
                            updateInvoiceStatus(inv.id, e.target.value as PaymentStatus)
                          }
                          className="bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-emerald-500 font-medium"
                        >
                          <option value="Paid">Paid</option>
                          <option value="Pending">Pending</option>
                          <option value="Overdue">Overdue</option>
                        </select>
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() =>
                            setDeleteTarget({
                              id: inv.id,
                              name: `${inv.invoiceNumber} (${inv.clientName})`,
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

      {/* Clients Retainer Management */}
      {activeTab === 'clients' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map(client => (
            <div
              key={client.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
                    <Building className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                      {client.company}
                    </h4>
                    <p className="text-xs text-slate-400">{client.name}</p>
                  </div>
                </div>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-emerald-500/20 text-emerald-500">
                  {client.status}
                </span>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Service:</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {client.serviceCategory}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Monthly Retainer:</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    ${client.monthlyRetainer.toLocaleString()}/mo
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Since:</span>
                  <span className="font-mono text-slate-500 dark:text-slate-400">
                    {client.startDate}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <button
                  onClick={() => {
                    setNewInv({
                      ...newInv,
                      clientId: client.id,
                      amount: client.monthlyRetainer,
                      service: `${client.serviceCategory} - Monthly Retainer`,
                    });
                    setShowAddInvoiceModal(true);
                  }}
                  className="px-3 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg flex items-center gap-1 shadow-sm cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Bill Retainer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Manual Invoice Modal */}
      {showAddInvoiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-emerald-500/40 rounded-2xl p-6 shadow-2xl space-y-4 animate-in fade-in">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-500" />
              Generate & Dispatch Invoice
            </h3>

            <form onSubmit={handleCreateInvoice} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Client / Company *</label>
                <select
                  required
                  value={newInv.clientId}
                  onChange={e => setNewInv({ ...newInv, clientId: e.target.value })}
                  className="w-full mt-1 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Select Client...</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.company} ({c.name})
                    </option>
                  ))}
                </select>
              </div>

              <CustomSelect
                label="Service Pillar / Description"
                value={newInv.service}
                options={[
                  'AI Automation Retainer',
                  'Social Media Growth - Setup & Retainer',
                  'Branding & Design Sprint',
                  'Paid Acquisition Campaign',
                  'Web Dev & Technical SEO',
                ]}
                onChange={val => setNewInv({ ...newInv, service: val })}
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Amount ($) *</label>
                  <input
                    type="number"
                    required
                    value={newInv.amount}
                    onChange={e => setNewInv({ ...newInv, amount: Number(e.target.value) })}
                    className="w-full mt-1 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Sent Date</label>
                  <input
                    type="date"
                    value={newInv.sentDate}
                    onChange={e => setNewInv({ ...newInv, sentDate: e.target.value })}
                    className="w-full mt-1 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <CustomSelect
                label="Payment Method / Account"
                value={newInv.paymentMethod}
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
                onChange={val => setNewInv({ ...newInv, paymentMethod: val as PaymentMethod })}
              />

              <div className="bg-slate-100 dark:bg-slate-800/60 p-3 rounded-xl text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>Due date will automatically be set to 7 days from the sent date.</span>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddInvoiceModal(false)}
                  className="px-4 py-2 text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-md cursor-pointer"
                >
                  Create & Record Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Guard Modal */}
      <DeleteGuardModal
        isOpen={!!deleteTarget}
        title="Delete Invoice Record"
        itemName={deleteTarget?.name || ''}
        impactDetails={[
          'Invoice record will be permanently deleted.',
          'Revenue KPIs will be updated to reflect removed invoice.',
        ]}
        onConfirm={() => {
          if (deleteTarget) {
            deleteInvoice(deleteTarget.id);
            setDeleteTarget(null);
          }
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
