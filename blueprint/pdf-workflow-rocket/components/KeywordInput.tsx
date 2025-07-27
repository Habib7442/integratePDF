
import React from 'react';

interface KeywordInputProps {
  value: string;
  onChange: (value: string) => void;
}

const KeywordInput: React.FC<KeywordInputProps> = ({ value, onChange }) => {
  return (
    <div className="w-full">
      <label htmlFor="keywords" className="block mb-2 text-sm font-medium text-slate-300">
        Keywords (optional)
      </label>
      <input
        type="text"
        id="keywords"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-slate-800 border border-slate-600 text-slate-100 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 placeholder-slate-400"
        placeholder="e.g., Total Amount, Due Date, Product ID"
      />
      <p className="mt-1 text-xs text-slate-500">Separate keywords with commas for targeted extraction.</p>
    </div>
  );
};

export default KeywordInput;
