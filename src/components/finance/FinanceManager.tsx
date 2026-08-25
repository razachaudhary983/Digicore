import React, { useState } from 'react';
import {
  WalletCards,
  Building,
  DollarSign,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  TrendingUp,
  Download,
  AlertCircle,
  FileText,
  Search,
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { ClientProfile, Invoice, PaymentStatus, ClientStatus, ServicePillar, PaymentMethod } from '../../types/crm';
import { StatusBadge } from '../common/StatusBadge';
import { CustomSelect } from '../common/CustomSelect';
import { DeleteGuardModal } from '../common/DeleteGuardModal';

export const FinanceManager: React.FC = () => {
  const {
    clients,
    invoices,
    addClient,
    updateClient,
    deleteClient,
    addInvoice,
    updateInvoiceStatus,
    deleteInvoice,
  } = useCRM();

  const [activeTab, setActiveTab] = useState<'invoices' | 'clients'>('invoices');
  const [clientStatusFilter, setClientStatusFilter] = useState<'All' | 'Active' | 'Dead'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientProfile | null>(null);
  const [clientToDelete, setClientToDelete] = useState<ClientProfile | null>(null);

  const [showAddInvoiceModal, setShowAddInvoiceModal] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null);

  // Client Form State
  const [clientForm, setClientForm] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    serviceCategory: 'Paid Acquisition' as ServicePillar,
    monthlyRetainer: 3500,
    startDate: new Date().toISOString().split('T')[0],
    status: 'Active' as ClientStatus,
  });

  // Invoice Form State
  const [invoiceForm, setInvoiceForm] = useState({
    clientId: '',
    service: 'Paid Acquisition - Monthly Retainer',
    amount: 3500,
    sentDate: new Date().toISOString().split('T')[0],
    status: 'Pending' as PaymentStatus,
    paymentMethod: 'Meezan Bank' as PaymentMethod,
  });

  // Financial Calculations
  const activeClients = clients.filter(c => c.status === 'Active');
  const mrr = activeClients.reduce((acc, c) => acc + (c.monthlyRetainer || 0), 0);
  const totalReceived = invoices
    .filter(i => i.status === 'Paid')
    .reduce((acc, i) => acc + i.amount, 0);
  const totalPending = invoices
    .filter(i => i.status === 'Pending' || i.status === 'Overdue')
    .reduce((acc, i) => acc + i.amount, 0);

  // Filtered Clients
  const filteredClients = clients.filter(c => {
    const matchesStatus =
      clientStatusFilter === 'All' ? true : c.status === clientStatusFilter;
    const matchesSearch =
      c.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Filtered Invoices
  const filteredInvoices = invoices.filter(inv =>
    inv.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inv.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleClientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientForm.name || !clientForm.company) return;

    if (editingClient) {
      updateClient(editingClient.id, clientForm);
      setEditingClient(null);
    } else {
      addClient(clientForm);
    }

    setShowAddClientModal(false);
    setClientForm({
      name: '',
      company: '',
      email: '',
      phone: '',
      serviceCategory: 'Paid Acquisition',
      monthlyRetainer: 3500,
      startDate: new Date().toISOString().split('T')[0],
      status: 'Active',
    });
  };

  const handleStartEditClient = (client: ClientProfile) => {
    setEditingClient(client);
    setClientForm({
      name: client.name,
      company: client.company,
      email: client.email,
      phone: client.phone,
      serviceCategory: client.serviceCategory,
      monthlyRetainer: client.monthlyRetainer,
      startDate: client.startDate,
      status: client.status,
    });
    setShowAddClientModal(true);
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
      status: invoiceForm.status,
      paymentMethod: invoiceForm.paymentMethod,
    });

    setShowAddInvoiceModal(false);
    setInvoiceForm({
      clientId: '',
      service: 'Paid Acquisition - Monthly Retainer',
      amount: 3500,
      sentDate: new Date().toISOString().split('T')[0],
      status: 'Pending',
      paymentMethod: 'Meezan Bank',
    });
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            Finance & Clients
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-[#FFC700]/15 text-amber-700 dark:text-[#FFC700] border border-[#FFC700]/30 font-bold">
              Ledger & Retainers
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Track active client contracts, manage invoices with 7-day payment cycles, and monitor cashflow.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Tabs */}
          <div className="flex bg-slate-100 dark:bg-[#181820] p-1 rounded-xl border border-slate-200 dark:border-[#2a2a36]">
            <button
              onClick={() => setActiveTab('invoices')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'invoices'
                  ? 'bg-white dark:bg-[#23232f] text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Invoices & Payments ({invoices.length})
            </button>
            <button
              onClick={() => setActiveTab('clients')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'clients'
                  ? 'bg-white dark:bg-[#23232f] text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Building className="w-3.5 h-3.5" />
              Client Directory ({clients.length})
            </button>
          </div>

          {activeTab === 'invoices' ? (
            <button
              onClick={() => setShowAddInvoiceModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#FFC700] hover:bg-[#ffcf1a] text-black font-bold text-xs rounded-xl shadow-md shadow-[#FFC700]/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Generate Invoice</span>
            </button>
          ) : (
            <button
              onClick={() => {
                setEditingClient(null);
                setClientForm({
                  name: '',
                  company: '',
                  email: '',
                  phone: '',
                  serviceCategory: 'Paid Acquisition',
                  monthlyRetainer: 3500,
                  startDate: new Date().toISOString().split('T')[0],
                  status: 'Active',
                });
                setShowAddClientModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-[#FFC700] hover:bg-[#ffcf1a] text-black font-bold text-xs rounded-xl shadow-md shadow-[#FFC700]/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Client</span>
            </button>
          )}
        </div>
      </div>

      {/* Financial Health KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#121217] border border-slate-200 dark:border-[#23232c] p-4 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400">Monthly Run Rate (MRR)</span>
            <p className="text-xl font-black text-slate-900 dark:text-white font-mono">
              PKR {mrr.toLocaleString()}
            </p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#121217] border border-slate-200 dark:border-[#23232c] p-4 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400">Total Collected</span>
            <p className="text-xl font-black text-emerald-500 font-mono">
              PKR {totalReceived.toLocaleString()}
            </p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#121217] border border-slate-200 dark:border-[#23232c] p-4 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400">Pending & Overdue</span>
            <p className="text-xl font-black text-amber-500 font-mono">
              PKR {totalPending.toLocaleString()}
            </p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#121217] border border-slate-200 dark:border-[#23232c] p-4 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400">Active Retainers</span>
            <p className="text-xl font-black text-slate-900 dark:text-white">
              {activeClients.length} Clients
            </p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-[#FFC700]/15 text-[#FFC700] flex items-center justify-center font-bold">
            <Building className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* TAB 1: INVOICES TABLE WITH INLINE STATUS DROPDOWN */}
      {activeTab === 'invoices' && (
        <div className="bg-white dark:bg-[#121217] border border-slate-200 dark:border-[#23232c] rounded-2xl overflow-hidden shadow-sm space-y-3">
          <div className="p-4 border-b border-slate-100 dark:border-[#23232c] flex items-center justify-between">
            <div className="relative w-full max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search invoice #, client, or service..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#181820] border border-slate-200 dark:border-[#2a2a36] rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-white outline-none focus:border-[#FFC700]"
              />
            </div>
            <span className="text-xs font-semibold text-slate-400">
              {filteredInvoices.length} Invoices
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-[#181820] border-b border-slate-200 dark:border-[#23232c] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                  <th className="p-3.5">Invoice #</th>
                  <th className="p-3.5">Client Name</th>
                  <th className="p-3.5">Service Pillar</th>
                  <th className="p-3.5">Sent Date</th>
                  <th className="p-3.5">Due Date (+7 Days)</th>
                  <th className="p-3.5 min-w-[140px]">Date Paid</th>
                  <th className="p-3.5">Amount</th>
                  <th className="p-3.5">Payment Method</th>
                  <th className="p-3.5">Inline Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#23232c]">
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="p-8 text-center text-slate-400 text-xs">
                      No invoice records found. Click "Generate Invoice" to dispatch a bill.
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map(invoice => (
                    <tr key={invoice.id} className="hover:bg-slate-50 dark:hover:bg-[#181820]/60">
                      <td className="p-3.5 font-mono font-semibold text-slate-700 dark:text-slate-300">
                        {invoice.invoiceNumber}
                      </td>

                      <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                        {invoice.clientName}
                      </td>

                      <td className="p-3.5 text-slate-600 dark:text-slate-300">
                        {invoice.service}
                      </td>

                      <td className="p-3.5 font-mono text-slate-400">
                        {invoice.sentDate}
                      </td>

                      <td className="p-3.5 font-mono text-amber-600 dark:text-[#FFC700] font-semibold">
                        {invoice.dueDate}
                      </td>

                      <td className="p-3.5 min-w-[140px] font-mono text-xs">
                        {invoice.datePaid ? (
                          <span className="inline-flex items-center px-3 py-1 w-auto max-w-max rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/20 whitespace-nowrap">
                            {invoice.datePaid}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      <td className="p-3.5 font-mono font-bold text-slate-900 dark:text-white">
                        PKR {invoice.amount.toLocaleString()}
                      </td>

                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-[#1e1e28] text-slate-700 dark:text-slate-300 font-semibold text-[11px] border border-slate-200 dark:border-[#2a2a36]">
                          {invoice.paymentMethod}
                        </span>
                      </td>

                      {/* Inline Status Dropdown: Paid, Pending, Overdue */}
                      <td className="p-3.5">
                        <select
                          value={invoice.status}
                          onChange={e => updateInvoiceStatus(invoice.id, e.target.value as PaymentStatus)}
                          className={`border rounded-lg px-2.5 py-1 text-xs font-bold outline-none cursor-pointer ${
                            invoice.status === 'Paid'
                              ? 'bg-emerald-500/15 text-emerald-500 border-emerald-500/40'
                              : invoice.status === 'Pending'
                              ? 'bg-[#FFC700]/15 text-amber-700 dark:text-[#FFC700] border-[#FFC700]/40'
                              : 'bg-rose-500/15 text-rose-500 border-rose-500/40 animate-pulse'
                          }`}
                        >
                          <option value="Paid" className="bg-white dark:bg-[#181820] text-emerald-500">
                            Paid ✓
                          </option>
                          <option value="Pending" className="bg-white dark:bg-[#181820] text-amber-500">
                            Pending ⏱
                          </option>
                          <option value="Overdue" className="bg-white dark:bg-[#181820] text-rose-500">
                            Overdue ⚠️
                          </option>
                        </select>
                      </td>

                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => setInvoiceToDelete(invoice)}
                          className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg cursor-pointer"
                          title="Delete Invoice"
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
      )}

      {/* TAB 2: CLIENTS DIRECTORY */}
      {activeTab === 'clients' && (
        <div className="bg-white dark:bg-[#121217] border border-slate-200 dark:border-[#23232c] rounded-2xl overflow-hidden shadow-sm space-y-3">
          <div className="p-4 border-b border-slate-100 dark:border-[#23232c] flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Top Status Filter: All, Active, Dead */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400">Filter Status:</span>
              <div className="flex bg-slate-100 dark:bg-[#181820] p-0.5 rounded-xl border border-slate-200 dark:border-[#2a2a36]">
                {(['All', 'Active', 'Dead'] as const).map(st => (
                  <button
                    key={st}
                    onClick={() => setClientStatusFilter(st)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      clientStatusFilter === st
                        ? 'bg-white dark:bg-[#23232f] text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search clients..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#181820] border border-slate-200 dark:border-[#2a2a36] rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-white outline-none focus:border-[#FFC700]"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-[#181820] border-b border-slate-200 dark:border-[#23232c] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                  <th className="p-3.5">Company & Contact</th>
                  <th className="p-3.5">Contact Details</th>
                  <th className="p-3.5">Service Category</th>
                  <th className="p-3.5">Monthly Retainer</th>
                  <th className="p-3.5">Start Date</th>
                  <th className="p-3.5">Inline Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#23232c]">
                {filteredClients.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400 text-xs">
                      No client profiles found. Click "Add New Client" to create a contract.
                    </td>
                  </tr>
                ) : (
                  filteredClients.map(client => (
                    <tr key={client.id} className="hover:bg-slate-50 dark:hover:bg-[#181820]/60">
                      <td className="p-3.5">
                        <span className="font-bold text-slate-900 dark:text-white block">{client.company}</span>
                        <span className="text-slate-400 text-[11px]">{client.name}</span>
                      </td>

                      <td className="p-3.5 text-[11px]">
                        <div className="text-slate-700 dark:text-slate-300 font-mono">{client.email}</div>
                        {client.phone && <div className="text-slate-400 font-mono">{client.phone}</div>}
                      </td>

                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold text-[11px] border border-indigo-500/20">
                          {client.serviceCategory}
                        </span>
                      </td>

                      <td className="p-3.5 font-mono font-bold text-emerald-500 text-sm">
                        PKR {client.monthlyRetainer.toLocaleString()}/mo
                      </td>

                      <td className="p-3.5 font-mono text-slate-400">
                        {client.startDate}
                      </td>

                      {/* Inline Status Dropdown (Active / Dead) */}
                      <td className="p-3.5">
                        <select
                          value={client.status}
                          onChange={e => updateClient(client.id, { status: e.target.value as ClientStatus })}
                          className={`border rounded-lg px-2.5 py-1 text-xs font-bold outline-none cursor-pointer ${
                            client.status === 'Active'
                              ? 'bg-emerald-500/15 text-emerald-500 border-emerald-500/40'
                              : 'bg-rose-500/15 text-rose-500 border-rose-500/40'
                          }`}
                        >
                          <option value="Active" className="bg-white dark:bg-[#181820] text-emerald-500">
                            Active 🟢
                          </option>
                          <option value="Dead" className="bg-white dark:bg-[#181820] text-rose-500">
                            Dead 🔴
                          </option>
                        </select>
                      </td>

                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleStartEditClient(client)}
                            className="p-1.5 text-slate-400 hover:text-[#FFC700] hover:bg-[#FFC700]/10 rounded-lg cursor-pointer"
                            title="Edit Client"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => setClientToDelete(client)}
                            className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg cursor-pointer"
                            title="Delete Client"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT CLIENT */}
      {showAddClientModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white dark:bg-[#121217] border border-slate-200 dark:border-[#23232c] rounded-3xl p-6 shadow-2xl space-y-4 animate-in fade-in">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Building className="w-5 h-5 text-[#FFC700]" />
              {editingClient ? 'Edit Client Profile' : 'Add New Client Profile'}
            </h3>

            <form onSubmit={handleClientSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Primary Contact Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={clientForm.name}
                    onChange={e => setClientForm({ ...clientForm, name: e.target.value })}
                    placeholder="e.g. Marcus Sterling"
                    className="w-full mt-1 bg-slate-50 dark:bg-[#181820] border border-slate-300 dark:border-[#2a2a36] focus:border-[#FFC700] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={clientForm.company}
                    onChange={e => setClientForm({ ...clientForm, company: e.target.value })}
                    placeholder="e.g. Sterling Capital Advisors"
                    className="w-full mt-1 bg-slate-50 dark:bg-[#181820] border border-slate-300 dark:border-[#2a2a36] focus:border-[#FFC700] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Work Email</label>
                  <input
                    type="email"
                    value={clientForm.email}
                    onChange={e => setClientForm({ ...clientForm, email: e.target.value })}
                    placeholder="marcus@sterlingcap.com"
                    className="w-full mt-1 bg-slate-50 dark:bg-[#181820] border border-slate-300 dark:border-[#2a2a36] focus:border-[#FFC700] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Phone / WhatsApp</label>
                  <input
                    type="text"
                    value={clientForm.phone}
                    onChange={e => setClientForm({ ...clientForm, phone: e.target.value })}
                    placeholder="+1 or +92..."
                    className="w-full mt-1 bg-slate-50 dark:bg-[#181820] border border-slate-300 dark:border-[#2a2a36] focus:border-[#FFC700] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <CustomSelect
                  label="Service Category"
                  value={clientForm.serviceCategory}
                  options={[
                    'AI Automation',
                    'Social Media Growth',
                    'Branding & Design',
                    'Paid Acquisition',
                    'Web Dev & SEO',
                  ]}
                  onChange={val => setClientForm({ ...clientForm, serviceCategory: val as ServicePillar })}
                />
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Monthly Retainer (PKR)
                  </label>
                  <input
                    type="number"
                    required
                    value={clientForm.monthlyRetainer}
                    onChange={e => setClientForm({ ...clientForm, monthlyRetainer: Number(e.target.value) })}
                    className="w-full mt-1 bg-slate-50 dark:bg-[#181820] border border-slate-300 dark:border-[#2a2a36] focus:border-[#FFC700] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Contract Start Date</label>
                  <input
                    type="date"
                    required
                    value={clientForm.startDate}
                    onChange={e => setClientForm({ ...clientForm, startDate: e.target.value })}
                    className="w-full mt-1 bg-slate-50 dark:bg-[#181820] border border-slate-300 dark:border-[#2a2a36] focus:border-[#FFC700] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Account Status</label>
                  <select
                    value={clientForm.status}
                    onChange={e => setClientForm({ ...clientForm, status: e.target.value as ClientStatus })}
                    className="w-full mt-1 bg-slate-50 dark:bg-[#181820] border border-slate-300 dark:border-[#2a2a36] focus:border-[#FFC700] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none"
                  >
                    <option value="Active">Active 🟢</option>
                    <option value="Dead">Dead 🔴</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-[#23232c]">
                <button
                  type="button"
                  onClick={() => setShowAddClientModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-[#FFC700] hover:bg-[#ffcf1a] text-black rounded-xl shadow-md cursor-pointer"
                >
                  {editingClient ? 'Save Changes' : 'Create Client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: GENERATE INVOICE */}
      {showAddInvoiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white dark:bg-[#121217] border border-slate-200 dark:border-[#23232c] rounded-3xl p-6 shadow-2xl space-y-4 animate-in fade-in">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-500" />
              Dispatch Client Invoice
            </h3>

            <form onSubmit={handleInvoiceSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Select Paying Client *
                </label>
                <select
                  required
                  value={invoiceForm.clientId}
                  onChange={e => {
                    const sel = clients.find(c => c.id === e.target.value);
                    setInvoiceForm({
                      ...invoiceForm,
                      clientId: e.target.value,
                      amount: sel ? sel.monthlyRetainer : invoiceForm.amount,
                      service: sel ? `${sel.serviceCategory} - Monthly Retainer` : invoiceForm.service,
                    });
                  }}
                  className="w-full mt-1 bg-slate-50 dark:bg-[#181820] border border-slate-300 dark:border-[#2a2a36] focus:border-[#FFC700] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none"
                >
                  <option value="">Choose Client...</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.company} ({c.name}) - PKR {c.monthlyRetainer.toLocaleString()}/mo
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Service Description / Invoice Line
                </label>
                <input
                  type="text"
                  required
                  value={invoiceForm.service}
                  onChange={e => setInvoiceForm({ ...invoiceForm, service: e.target.value })}
                  className="w-full mt-1 bg-slate-50 dark:bg-[#181820] border border-slate-300 dark:border-[#2a2a36] focus:border-[#FFC700] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Invoice Amount (PKR) *
                  </label>
                  <input
                    type="number"
                    required
                    value={invoiceForm.amount}
                    onChange={e => setInvoiceForm({ ...invoiceForm, amount: Number(e.target.value) })}
                    className="w-full mt-1 bg-slate-50 dark:bg-[#181820] border border-slate-300 dark:border-[#2a2a36] focus:border-[#FFC700] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Sent Date</label>
                  <input
                    type="date"
                    required
                    value={invoiceForm.sentDate}
                    onChange={e => setInvoiceForm({ ...invoiceForm, sentDate: e.target.value })}
                    className="w-full mt-1 bg-slate-50 dark:bg-[#181820] border border-slate-300 dark:border-[#2a2a36] focus:border-[#FFC700] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <CustomSelect
                  label="Payment Channel"
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
                  onChange={val => setInvoiceForm({ ...invoiceForm, paymentMethod: val as PaymentMethod })}
                />
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Initial Status</label>
                  <select
                    value={invoiceForm.status}
                    onChange={e => setInvoiceForm({ ...invoiceForm, status: e.target.value as PaymentStatus })}
                    className="w-full mt-1 bg-slate-50 dark:bg-[#181820] border border-slate-300 dark:border-[#2a2a36] focus:border-[#FFC700] rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Paid">Paid</option>
                    <option value="Overdue">Overdue</option>
                  </select>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 bg-slate-100 dark:bg-[#181820] p-2.5 rounded-xl">
                ℹ️ The Due Date is automatically calculated as <strong>Sent Date + 7 Days</strong>.
              </p>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-[#23232c]">
                <button
                  type="button"
                  onClick={() => setShowAddInvoiceModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md cursor-pointer"
                >
                  Issue Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE GUARDS */}
      {clientToDelete && (
        <DeleteGuardModal
          isOpen={!!clientToDelete}
          title="Delete Client Record"
          message={`Are you sure you want to remove client "${clientToDelete.company}" (${clientToDelete.name})? All historical invoices will remain in the financial ledger.`}
          onConfirm={() => {
            deleteClient(clientToDelete.id);
            setClientToDelete(null);
          }}
          onCancel={() => setClientToDelete(null)}
        />
      )}

      {invoiceToDelete && (
        <DeleteGuardModal
          isOpen={!!invoiceToDelete}
          title="Delete Invoice"
          message={`Remove invoice #${invoiceToDelete.invoiceNumber} (PKR ${invoiceToDelete.amount.toLocaleString()}) for ${invoiceToDelete.clientName}?`}
          onConfirm={() => {
            deleteInvoice(invoiceToDelete.id);
            setInvoiceToDelete(null);
          }}
          onCancel={() => setInvoiceToDelete(null)}
        />
      )}
    </div>
  );
};
