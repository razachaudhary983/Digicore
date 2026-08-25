import React from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';

interface DeleteGuardProps {
  isOpen: boolean;
  title: string;
  itemName?: string;
  message?: string;
  impactDetails?: string[];
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteGuardModal: React.FC<DeleteGuardProps> = ({
  isOpen,
  title,
  itemName,
  message,
  impactDetails,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white dark:bg-[#121217] border border-rose-500/40 rounded-3xl p-6 shadow-2xl space-y-4 animate-in fade-in">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-500/15 text-rose-500 flex items-center justify-center flex-shrink-0 font-bold">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {title}
            </h3>
            <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold">
              Permanent Deletion Guard
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300">
          {message || `Are you sure you want to permanently delete "${itemName}"?`}
        </p>

        {impactDetails && impactDetails.length > 0 && (
          <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-xl p-3 text-xs text-rose-800 dark:text-rose-300 space-y-1">
            <p className="font-semibold">Connected Data Impact:</p>
            <ul className="list-disc list-inside space-y-0.5 text-slate-600 dark:text-slate-400">
              {impactDetails.map((detail, idx) => (
                <li key={idx}>{detail}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-[#23232c]">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-[#1a1a24] hover:bg-slate-200 dark:hover:bg-[#252533] rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl flex items-center gap-1.5 shadow-md shadow-rose-600/20 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Confirm Deletion
          </button>
        </div>
      </div>
    </div>
  );
};
