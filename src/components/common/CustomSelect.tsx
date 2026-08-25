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
      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>

      {!isCustom ? (
        <select
          value={options.includes(value) ? value : '__custom__'}
          onChange={handleSelectChange}
          className="w-full bg-white dark:bg-[#181820] border border-slate-300 dark:border-[#2a2a36] text-slate-900 dark:text-slate-100 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#FFC700] focus:ring-1 focus:ring-[#FFC700]"
        >
          <option value="" disabled className="bg-white dark:bg-[#181820] text-slate-500">
            Select {label}
          </option>
          {options.map(opt => (
            <option key={opt} value={opt} className="bg-white dark:bg-[#181820] text-slate-900 dark:text-slate-100">
              {opt}
            </option>
          ))}
          <option value="__custom__" className="bg-white dark:bg-[#181820] text-[#FFC700] font-semibold">
            ✨ + Type Custom / Other...
          </option>
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
            className="flex-1 bg-white dark:bg-[#181820] border border-[#FFC700] text-slate-900 dark:text-slate-100 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#FFC700]"
          />
          <button
            type="button"
            onClick={() => setIsCustom(false)}
            title="Switch back to presets"
            className="px-2.5 py-2 text-xs font-semibold bg-slate-200 dark:bg-[#252533] text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-300 dark:hover:bg-[#2f2f42] cursor-pointer"
          >
            Presets
          </button>
        </div>
      )}
    </div>
  );
};
