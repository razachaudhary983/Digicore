import React from 'react';
import { LeadStatus, LeadTemperature, PaymentStatus } from '../../types/crm';

interface BadgeProps {
  type: 'status' | 'temperature' | 'payment' | 'connection';
  value: string;
}

export const StatusBadge: React.FC<BadgeProps> = ({ type, value }) => {
  let colorClasses = 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300';

  if (type === 'temperature') {
    switch (value as LeadTemperature) {
      case 'Hot':
        colorClasses = 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30';
        break;
      case 'Warm':
        colorClasses = 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30';
        break;
      case 'Cold':
        colorClasses = 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30';
        break;
    }
  } else if (type === 'status') {
    switch (value as LeadStatus) {
      case 'New':
        colorClasses = 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30';
        break;
      case 'Qualified':
        colorClasses = 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30';
        break;
      case 'Meeting Booked':
        colorClasses = 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30';
        break;
      case 'Proposal Sent':
        colorClasses = 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30';
        break;
      case 'Won':
        colorClasses = 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-semibold';
        break;
      case 'Lost':
        colorClasses = 'bg-zinc-500/15 text-zinc-600 dark:text-zinc-400 border border-zinc-500/30';
        break;
    }
  } else if (type === 'payment') {
    switch (value as PaymentStatus) {
      case 'Paid':
        colorClasses = 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30';
        break;
      case 'Pending':
        colorClasses = 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30';
        break;
      case 'Overdue':
        colorClasses = 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 font-medium animate-pulse';
        break;
    }
  } else if (type === 'connection') {
    switch (value) {
      case 'Connected':
      case 'Accepted':
        colorClasses = 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30';
        break;
      case 'Connection Requested':
        colorClasses = 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30';
        break;
      case 'Rejected':
        colorClasses = 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30';
        break;
      default:
        colorClasses = 'bg-slate-500/15 text-slate-600 dark:text-slate-400 border border-slate-500/30';
    }
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs tracking-wide font-medium backdrop-blur-sm ${colorClasses}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-80"></span>
      {value}
    </span>
  );
};
