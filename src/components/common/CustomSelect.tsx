import React, { useState } from 'react';

interface CustomSelectProps {
  label: string;
  value: string;
  options: string[];
  onChange: (val: string) => void;
  required?: boolean;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  label,
  value,
  options,
  onChange,
  required,
}) => {
  const [isCustom, setIsCustom] = useState(!options.includes(value) && value !== '');
  const [customText, setCustomText] = useState(value);

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === '__custom__') {
      setIsCustom(true);
      onChange(customText || '');
    } else {
      setIsCustom(false);
      onChange(val);
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>

      {!isCustom ? (
        <select
          value={options.includes(value) ? value : '__custom__'}
          onChange={handleSelectChange}
          className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="" disabled>Select {label}</option>
          {options.map(opt => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
          <option value="__custom__">✨ + Type Your Own / Custom...</option>
        </select>
      ) : (
        <div className="flex items-center gap-1.5">
          <input
            type="text"
            placeholder={`Enter custom ${label.toLowerCase()}...`}
            value={customText}
            onChange={(e) => {
              setCustomText(e.target.value);
              onChange(e.target.value);
            }}
            autoFocus
            className="flex-1 bg-white dark:bg-slate-900 border border-indigo-500 text-slate-900 dark:text-slate-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="button"
            onClick={() => setIsCustom(false)}
            title="Switch back to presets"
            className="px-2.5 py-2 text-xs font-medium bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-700"
          >
            Presets
          </button>
        </div>
      )}
    </div>
  );
};
