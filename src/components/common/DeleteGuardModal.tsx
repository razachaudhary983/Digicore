import React from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';

interface DeleteGuardProps {
  isOpen: boolean;
  title: string;
  itemName: string;
  impactDetails: string[];
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteGuardModal: React.FC<DeleteGuardProps> = ({
  isOpen,
  title,
  itemName,
  impactDetails,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-rose-500/40 rounded-2xl p-6 shadow-2xl space-y-4 animate-in fade-in">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-rose-500/20 text-rose-500 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {title}
            </h3>
            <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">
              Permanent Deletion Guard
            </p>
          </div>
        </div>

        <p className="text-sm text-slate-600 dark:text-slate-300">
          Are you sure you want to permanently delete <strong className="text-slate-900 dark:text-white">"{itemName}"</strong>?
        </p>

        {impactDetails.length > 0 && (
          <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-xl p-3 text-xs text-rose-800 dark:text-rose-300 space-y-1.5">
            <p className="font-semibold">Connected Data that will be lost:</p>
            <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
              {impactDetails.map((detail, idx) => (
                <li key={idx}>{detail}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 active:scale-95 rounded-lg flex items-center gap-1.5 transition-all shadow-md shadow-rose-600/20 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            Confirm Deletion
          </button>
        </div>
      </div>
    </div>
  );
};
